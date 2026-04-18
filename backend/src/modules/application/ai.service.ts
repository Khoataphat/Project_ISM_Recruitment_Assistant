import axios from "axios";
import { prisma } from "../../../prisma/prisma.service";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/score";
const AI_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS || "10000");

type AiScoreResponse = {
    matching_score: number;
    confidence_score: number;
    summary?: string;
};

function assertValidScore(name: string, value: number) {
    if (Number.isNaN(value) || value < 0 || value > 1) {
        throw new Error(`${name} must be between 0 and 1`);
    }
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
            aiStatus: "processing",
            aiError: null,
        },
    });

    try {
        const response = await axios.post<AiScoreResponse>(
            AI_SERVICE_URL,
            {
                application_id: application.applicationId,
                candidate_name: application.user.fullName,
                candidate_email: application.user.email,
                resume_path: application.resumeUrl.startsWith("/uploads/")
                    ? `${process.cwd()}${application.resumeUrl}`
                    : application.resumeUrl,
                job: {
                    title: application.job.title,
                    description: application.job.description,
                    requirements: application.job.requirements,
                    benefits: application.job.benefits,
                },
            },
            {
                timeout: AI_TIMEOUT_MS,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        const matchingScore = Number(response.data.matching_score);
        const confidenceScore = Number(response.data.confidence_score);

        assertValidScore("matching_score", matchingScore);
        assertValidScore("confidence_score", confidenceScore);

        return prisma.application.update({
            where: { applicationId },
            data: {
                matchingScore,
                confidenceScore,
                aiStatus: "completed",
                aiError: null,
                processedAt: new Date(),
            },
        });
    } catch (error: any) {
        const message = axios.isAxiosError(error)
            ? (error.response?.data?.message || error.message)
            : (error as Error).message;

        return prisma.application.update({
            where: { applicationId },
            data: {
                aiStatus: "failed",
                aiError: String(message).slice(0, 512),
                processedAt: new Date(),
            },
        });
    }
};
