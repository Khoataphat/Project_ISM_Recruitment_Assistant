import { prisma } from "../../../prisma/prisma.service";
import { dispatchEmail } from "../email/email.worker";
import { scoreApplicationWithAi } from "./ai.service";

export const submitApplication = async (data: {
    userId: number;
    jobId: number;
    resumeUrl: string;
    coverLetter?: string;
}) => {
    const { userId, jobId, resumeUrl, coverLetter } = data;

    const job = await prisma.job.findUnique({ where: { jobId } });
    if (!job) {
        const error: any = new Error("Job not found");
        error.code = "JOB_NOT_FOUND";
        throw error;
    }

    if (job.status !== "open") {
        const error: any = new Error("Job is not accepting applications");
        error.code = "JOB_CLOSED";
        throw error;
    }

    const existing = await prisma.application.findFirst({
        where: { userId, jobId },
    });
    if (existing) {
        const error: any = new Error("Already applied");
        error.code = "ALREADY_APPLIED";
        throw error;
    }

    const user = await prisma.user.findUnique({ where: { userId } });

    const application = await prisma.application.create({
        data: {
            userId,
            jobId,
            resumeUrl,
            coverLetter,
            aiStatus: "pending",
        },
    });

    if (user) {
        dispatchEmail({
            type: "thank-you",
            to: user.email,
            fullName: user.fullName,
            jobTitle: job.title,
        });
    }

    return scoreApplicationWithAi(application.applicationId);
};

export const getApplicationsByUser = async (userId: number) => {
    return prisma.application.findMany({
        where: { userId },
        include: { job: { select: { title: true, status: true } } },
        orderBy: { submittedAt: "desc" },
    });
};

export const getApplicationById = async (applicationId: number) => {
    return prisma.application.findUnique({
        where: { applicationId },
        include: {
            user: { select: { userId: true, email: true, fullName: true } },
            job: { select: { jobId: true, title: true } },
        },
    });
};

export const acceptApplication = async (
    applicationId: number,
    reviewedBy: number,
    interviewDate: string,
    interviewLocation: string,
    hrName: string,
) => {
    const application = await prisma.application.findUnique({
        where: { applicationId },
        include: {
            user: { select: { email: true, fullName: true } },
            job: { select: { title: true } },
        },
    });

    if (!application) {
        const error: any = new Error("Application not found");
        error.code = "APPLICATION_NOT_FOUND";
        throw error;
    }

    if (application.status !== "pending") {
        const error: any = new Error("Application already reviewed");
        error.code = "ALREADY_REVIEWED";
        throw error;
    }

    const updated = await prisma.application.update({
        where: { applicationId },
        data: {
            status: "accepted",
            reviewedAt: new Date(),
            reviewedBy,
        },
    });

    dispatchEmail({
        type: "interview-invitation",
        to: application.user.email,
        fullName: application.user.fullName,
        jobTitle: application.job.title,
        interviewDate,
        interviewLocation,
        hrName,
    });

    return updated;
};

export const rejectApplication = async (applicationId: number, reviewedBy: number) => {
    const application = await prisma.application.findUnique({
        where: { applicationId },
        include: {
            user: { select: { email: true, fullName: true } },
            job: { select: { title: true } },
        },
    });

    if (!application) {
        const error: any = new Error("Application not found");
        error.code = "APPLICATION_NOT_FOUND";
        throw error;
    }

    if (application.status !== "pending") {
        const error: any = new Error("Application already reviewed");
        error.code = "ALREADY_REVIEWED";
        throw error;
    }

    const updated = await prisma.application.update({
        where: { applicationId },
        data: {
            status: "rejected",
            reviewedAt: new Date(),
            reviewedBy,
        },
    });

    dispatchEmail({
        type: "rejection",
        to: application.user.email,
        fullName: application.user.fullName,
        jobTitle: application.job.title,
    });

    return updated;
};
