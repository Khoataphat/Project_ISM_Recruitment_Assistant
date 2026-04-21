import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { AiProcessingStatus, ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/prisma.service";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/analyze-cv";
const AI_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS || "10000");

type CandidateData = {
    full_name?: string;
    email?: string;
    phone?: string;
    education?: string;
    years_of_experience?: number;
    skills?: string[];
    summary?: string;
};

type MatchingData = {
    ai_matching_score: number;
    confidence_score: number;
    ai_summary?: string;
    ai_explanation?: Prisma.JsonValue;
    skills_radar?: Prisma.JsonValue;
};

type AiScoreResponse = {
    matching_score: number;
    confidence_score: number;
    summary?: string;
    candidate_data: CandidateData;
    matching_data: MatchingData;
};

function normalizeScore(name: string, value: number) {
    if (Number.isNaN(value)) {
        throw new Error(`${name} must be a valid number`);
    }

    if (value >= 0 && value <= 1) {
        return value;
    }

    if (value > 1 && value <= 100) {
        return value / 100;
    }

    throw new Error(`${name} must be between 0 and 1 or 0 and 100`);
}

function parseAiResponse(data: AiScoreResponse) {
    if (!data.candidate_data || !data.matching_data) {
        throw new Error("AI response is missing candidate_data or matching_data");
    }

    const matchingScore = normalizeScore("matching_score", Number(data.matching_score));
    const confidenceScore = normalizeScore("confidence_score", Number(data.confidence_score));

    return {
        matchingScore,
        confidenceScore,
        aiSummary: data.matching_data.ai_summary ?? data.summary ?? null,
        aiExplanation: data.matching_data.ai_explanation ?? null,
        skillsRadar: data.matching_data.skills_radar ?? null,
        candidateData: data.candidate_data,
        rawAiResponse: data as Prisma.JsonObject,
    };
}

async function syncCandidateProfile(userId: number, candidateData: CandidateData) {
    const educationSummary = candidateData.education?.trim() || null;
    const yearsOfExperience = Number.isFinite(candidateData.years_of_experience)
        ? Number(candidateData.years_of_experience)
        : null;
    const summary = candidateData.summary?.trim() || null;
    const skills = (candidateData.skills ?? [])
        .map((skill) => skill.trim())
        .filter(Boolean);

    const userUpdates: Prisma.UserUpdateInput = {};
    if (candidateData.phone?.trim()) {
        userUpdates.phoneNumber = candidateData.phone.trim().slice(0, 16);
    }

    await prisma.$transaction(async (tx) => {
        if (Object.keys(userUpdates).length > 0) {
            await tx.user.update({
                where: { userId },
                data: userUpdates,
            });
        }

        const profile = await tx.candidateProfile.upsert({
            where: { userId },
            update: {
                educationSummary,
                yearsOfExperience,
                summary,
            },
            create: {
                userId,
                educationSummary,
                yearsOfExperience,
                summary,
            },
        });

        await tx.candidateEducation.deleteMany({
            where: { candidateProfileId: profile.candidateProfileId },
        });

        if (educationSummary) {
            await tx.candidateEducation.create({
                data: {
                    candidateProfileId: profile.candidateProfileId,
                    educationText: educationSummary,
                },
            });
        }

        await tx.candidateSkill.deleteMany({
            where: { candidateProfileId: profile.candidateProfileId },
        });

        if (skills.length > 0) {
            await tx.candidateSkill.createMany({
                data: skills.map((name) => ({
                    candidateProfileId: profile.candidateProfileId,
                    name,
                    source: "ai",
                    confidence: 1,
                })),
                skipDuplicates: true,
            });
        }
    });
}

function resolveResumePath(resumeUrl: string) {
    return resumeUrl.startsWith("/uploads/")
        ? `${process.cwd()}${resumeUrl}`
        : resumeUrl;
}

function buildJobDescription(job: {
    title: string | null;
    description: string | null;
    requirements: unknown;
    benefits: unknown;
}) {
    const parts: string[] = [];

    if (job.title?.trim()) {
        parts.push(job.title.trim());
    }

    if (job.description?.trim()) {
        parts.push(job.description.trim());
    }

    if (Array.isArray(job.requirements)) {
        parts.push(...job.requirements.map((value) => String(value).trim()).filter(Boolean));
    }

    if (Array.isArray(job.benefits)) {
        parts.push(...job.benefits.map((value) => String(value).trim()).filter(Boolean));
    }

    return parts.join("\n");
}

function mapDbApplicationStatus(status: ApplicationStatus) {
    return status.toLowerCase();
}

function mapDbAiStatus(status: AiProcessingStatus) {
    return status.toLowerCase();
}

export const serializeApplication = <T extends { status: ApplicationStatus; aiStatus: AiProcessingStatus }>(
    application: T,
) => ({
    ...application,
    status: mapDbApplicationStatus(application.status),
    aiStatus: mapDbAiStatus(application.aiStatus),
});

export const serializeApplications = <T extends { status: ApplicationStatus; aiStatus: AiProcessingStatus }>(
    applications: T[],
) => applications.map(serializeApplication);

export const serializeApplicationStatus = mapDbApplicationStatus;
export const serializeAiStatus = mapDbAiStatus;

function stringifyAiError(error: unknown) {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (typeof data === "string" && data.trim()) {
            return data;
        }
        if (data && typeof data === "object") {
            if ("message" in data) {
                return String((data as { message?: unknown }).message || error.message);
            }
            if ("detail" in data) {
                return String((data as { detail?: unknown }).detail || error.message);
            }
        }
        return error.message;
    }

    return (error as Error).message;
}

export const scoreApplicationWithAi = async (applicationId: number) => {
    const application = await prisma.application.findUnique({
        where: { applicationId },
        include: {
            job: {
                select: {
                    title: true,
                    description: true,
                    requirements: true,
                    benefits: true,
                },
            },
            user: {
                select: {
                    userId: true,
                    fullName: true,
                    email: true,
                },
            },
        },
    });

    if (!application) {
        const error: any = new Error("Application not found");
        error.code = "APPLICATION_NOT_FOUND";
        throw error;
    }

    await prisma.application.update({
        where: { applicationId },
        data: {
            aiStatus: AiProcessingStatus.PROCESSING,
            aiError: null,
        },
    });

    try {
        const resumePath = resolveResumePath(application.resumeUrl);
        const resumeBuffer = await fs.readFile(resumePath);
        const formData = new FormData();
        const filename = path.basename(resumePath) || "resume.pdf";
        const jdText = buildJobDescription(application.job);

        formData.append("file", new Blob([resumeBuffer], { type: "application/pdf" }), filename);
        formData.append("jd_text", jdText);

        const response = await axios.post<AiScoreResponse>(AI_SERVICE_URL, formData, {
            timeout: AI_TIMEOUT_MS,
        });

        const {
            matchingScore,
            confidenceScore,
            aiSummary,
            aiExplanation,
            skillsRadar,
            candidateData,
            rawAiResponse,
        } = parseAiResponse(response.data);

        if (!candidateData.full_name && application.user.fullName) {
            candidateData.full_name = application.user.fullName;
        }

        if (!candidateData.email && application.user.email) {
            candidateData.email = application.user.email;
        }

        await syncCandidateProfile(application.user.userId, candidateData);

        const updated = await prisma.application.update({
            where: { applicationId },
            data: {
                matchingScore,
                confidenceScore,
                aiStatus: AiProcessingStatus.COMPLETED,
                aiSummary,
                aiExplanation: aiExplanation ?? Prisma.JsonNull,
                skillsRadar: skillsRadar ?? Prisma.JsonNull,
                rawAiResponse,
                aiError: null,
                processedAt: new Date(),
            },
        });

        return serializeApplication(updated);
    } catch (error: any) {
        const message = stringifyAiError(error);

        const failed = await prisma.application.update({
            where: { applicationId },
            data: {
                aiStatus: AiProcessingStatus.FAILED,
                aiError: String(message).slice(0, 512),
                processedAt: new Date(),
            },
        });

        return serializeApplication(failed);
    }
};
