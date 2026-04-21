import crypto from "crypto";
import path from "path";
import bcrypt from "bcrypt";
import { ApplicationStatus, Role } from "@prisma/client";
import { prisma } from "../../../prisma/prisma.service";
import { acceptApplication, rejectApplication, submitApplication } from "../application/application.service";
import { serializeApplication, serializeApplicationStatus } from "../application/ai.service";

function mapLegacyJob(job: any) {
    return {
        id: job.jobId,
        title: job.title,
        description: job.description,
        image: null,
        tags: job.requirements ?? [],
        location: job.location,
        minSalary: job.salaryMin,
        maxSalary: job.salaryMax,
        dept: job.companyName ?? null,
        status: job.status,
    };
}

function mapLegacyCandidateStatus(status: string) {
    switch (status.toLowerCase()) {
        case "accepted":
            return "Accepted";
        case "rejected":
            return "Rejected";
        default:
            return "Applied";
    }
}

async function findOrCreateCandidate(fullName: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();

    const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });

    if (existing) {
        if (existing.role !== Role.CANDIDATE) {
            const error: any = new Error("Email already belongs to a non-candidate account");
            error.code = "INVALID_ROLE";
            throw error;
        }
        return existing;
    }

    const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);

    return prisma.user.create({
        data: {
            email: normalizedEmail,
            fullName: normalizedName,
            passwordHash,
            role: Role.CANDIDATE,
            isVerified: true,
        },
    });
}

export async function listLegacyJobs() {
    const jobs = await prisma.job.findMany({
        where: { status: "open" },
        orderBy: { updatedDate: "desc" },
    });

    return jobs.map(mapLegacyJob);
}

export async function getLegacyJob(jobId: number) {
    const job = await prisma.job.findUnique({
        where: { jobId },
    });

    return job ? mapLegacyJob(job) : null;
}

export async function createLegacyJob(data: {
    title: string;
    description: string;
    image?: string;
    tags?: string[];
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    createdBy: number;
}) {
    const job = await prisma.job.create({
        data: {
            title: data.title,
            description: data.description,
            location: data.location,
            salaryMin: data.minSalary,
            salaryMax: data.maxSalary,
            requirements: data.tags ?? [],
            createdBy: data.createdBy,
            updatedBy: data.createdBy,
        },
    });

    return { id: job.jobId };
}

export async function updateLegacyJob(jobId: number, data: {
    title?: string;
    description?: string;
    image?: string;
    tags?: string[];
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    updatedBy: number;
}) {
    const existing = await prisma.job.findUnique({
        where: { jobId },
    });

    if (!existing) {
        return null;
    }

    const job = await prisma.job.update({
        where: { jobId },
        data: {
            title: data.title,
            description: data.description,
            location: data.location,
            salaryMin: data.minSalary,
            salaryMax: data.maxSalary,
            requirements: data.tags,
            updatedBy: data.updatedBy,
        },
    });

    return { id: job.jobId };
}

export async function deleteLegacyJob(jobId: number) {
    const job = await prisma.job.findUnique({
        where: { jobId },
        include: {
            _count: {
                select: {
                    applications: true,
                },
            },
        },
    });

    if (!job) {
        return false;
    }

    if (job._count.applications > 0) {
        await prisma.job.update({
            where: { jobId },
            data: {
                status: "closed",
            },
        });
        return true;
    }

    await prisma.job.delete({
        where: { jobId },
    });

    return true;
}

export async function submitLegacyApplication(data: {
    fullName: string;
    email: string;
    jobId: number;
    resumeUrl: string;
}) {
    const user = await findOrCreateCandidate(data.fullName, data.email);
    const application = await submitApplication({
        userId: user.userId,
        jobId: data.jobId,
        resumeUrl: data.resumeUrl,
    });

    return {
        id: application.applicationId,
        matching_score: application.matchingScore,
        ai_summary: application.aiSummary,
    };
}

export async function getLegacyAppliedJobs(email: string) {
    const applications = await prisma.application.findMany({
        where: {
            user: {
                email: email.trim().toLowerCase(),
            },
        },
        orderBy: { submittedAt: "desc" },
    });

    return applications.map((application: { jobId: number; resumeUrl: string }) => ({
        jobId: application.jobId,
        pdfLink: application.resumeUrl,
    }));
}

export async function findLegacyApplicationFile(email: string, pdfName: string) {
    const application = await prisma.application.findFirst({
        where: {
            user: {
                email: email.trim().toLowerCase(),
            },
            resumeUrl: {
                endsWith: `/${pdfName}`,
            },
        },
    });

    if (!application) {
        return null;
    }

    return path.resolve(process.cwd(), "uploads", pdfName);
}

export async function getLegacyJobCandidates(jobId: number) {
    const applications = await prisma.application.findMany({
        where: { jobId },
        include: {
            user: {
                select: {
                    email: true,
                    fullName: true,
                },
            },
        },
        orderBy: { submittedAt: "desc" },
    });

    return applications.map((application: {
        user: { email: string; fullName: string };
        resumeUrl: string;
        matchingScore: number | null;
        aiSummary: string | null;
        skillsRadar: unknown;
        status: ApplicationStatus;
    }) => ({
        email: application.user.email,
        name: application.user.fullName,
        pdfLink: application.resumeUrl,
        analysis: {
            matching_score: application.matchingScore,
            ai_summary: application.aiSummary,
            skills_radar: application.skillsRadar,
            status: serializeApplicationStatus(application.status),
        },
    }));
}

export async function listLegacyCandidates(jobId?: number) {
    const applications = await prisma.application.findMany({
        where: jobId ? { jobId } : undefined,
        include: {
            user: {
                select: {
                    fullName: true,
                },
            },
        },
        orderBy: { submittedAt: "desc" },
    });

    return applications.map((application: {
        applicationId: number;
        user: { fullName: string };
        matchingScore: number | null;
        status: ApplicationStatus;
    }) => ({
        id: application.applicationId,
        name: application.user.fullName,
        score: application.matchingScore,
        status: serializeApplicationStatus(application.status),
    }));
}

export async function getLegacyCandidateDetail(applicationId: number) {
    const application = await prisma.application.findUnique({
        where: { applicationId },
        include: {
            user: {
                select: {
                    userId: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    candidateProfile: {
                        include: {
                            educations: true,
                            skills: true,
                        },
                    },
                },
            },
            job: {
                select: {
                    jobId: true,
                    title: true,
                },
            },
        },
    });

    if (!application) {
        return null;
    }

    return {
        id: application.applicationId,
        full_info: {
            application: serializeApplication(application),
            user: application.user,
            job: application.job,
        },
        skills_radar: application.skillsRadar,
        cv_path: application.resumeUrl,
    };
}

export async function updateLegacyCandidateStatus(data: {
    applicationId: number;
    status: string;
    reviewedBy: number;
    interviewDate?: string;
    interviewLocation?: string;
    hrName?: string;
}) {
    const normalizedStatus = data.status.trim().toUpperCase();

    if (normalizedStatus === "ACCEPTED") {
        return acceptApplication(
            data.applicationId,
            data.reviewedBy,
            data.interviewDate || "To be confirmed",
            data.interviewLocation || "To be confirmed",
            data.hrName || "HR Team",
        );
    }

    if (normalizedStatus === "REJECTED") {
        return rejectApplication(data.applicationId, data.reviewedBy);
    }

    const error: any = new Error("Unsupported status");
    error.code = "INVALID_STATUS";
    throw error;
}

export async function getLegacyCandidateResult(jobId: number, email: string) {
    const application = await prisma.application.findFirst({
        where: {
            jobId,
            user: {
                email: email.trim().toLowerCase(),
            },
        },
        orderBy: { submittedAt: "desc" },
    });

    if (!application) {
        return null;
    }

    return {
        status: mapLegacyCandidateStatus(application.status),
    };
}
