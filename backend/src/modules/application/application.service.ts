import { processing_status, hr_status } from "@prisma/client";
import { prisma } from "../../../prisma/prisma.service";

export const submitApplication = async (data: {
    candidateId: string;
    jobId: string;
    cv_url: string;
    cover_letter?: string;
}) => {
    const { candidateId, jobId, cv_url, cover_letter } = data;

    const job = await prisma.jobs.findUnique({ where: { id: jobId } });
    if (!job) {
        const error: any = new Error("Job not found");
        error.code = "JOB_NOT_FOUND";
        throw error;
    }

    if (job.status !== "Open") {
        const error: any = new Error("Job is not accepting applications");
        error.code = "JOB_CLOSED";
        throw error;
    }

    const existing = await prisma.applications.findUnique({
        where: { applications_unique_per_job: { job_id: jobId, candidate_id: candidateId } },
    });
    if (existing) {
        const error: any = new Error("Already applied");
        error.code = "ALREADY_APPLIED";
        throw error;
    }

    const application = await prisma.applications.create({
        data: {
            job_id: jobId,
            candidate_id: candidateId,
            cv_url,
            cover_letter,
            processing_status: processing_status.Pending,
            hr_status: hr_status.Pending,
        },
    });

    // Increment application count on the job
    await prisma.jobs.update({
        where: { id: jobId },
        data: { application_count: { increment: 1 } },
    });

    return application;
};

export const getApplicationsByCandidate = async (candidateId: string) => {
    return prisma.applications.findMany({
        where: { candidate_id: candidateId },
        include: {
            jobs: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    companies: { select: { name: true, logo_url: true } },
                },
            },
        },
        orderBy: { applied_at: "desc" },
    });
};

export const getApplicationById = async (applicationId: string) => {
    const application = await prisma.applications.findUnique({
        where: { id: applicationId },
        include: {
            candidates: {
                include: {
                    users: { select: { id: true, full_name: true, email: true, phone: true, avatar_url: true } },
                },
            },
            jobs: {
                select: {
                    id: true,
                    title: true,
                    companies: { select: { name: true, logo_url: true } },
                },
            },
        },
    });

    if (!application) return null;

    // Mark viewed
    if (!application.viewed_by_hr_at) {
        await prisma.applications.update({
            where: { id: applicationId },
            data: { viewed_by_hr_at: new Date() },
        });
    }

    return application;
};

export const updateApplicationStatus = async (
    applicationId: string,
    status: hr_status,
    hrNote?: string,
) => {
    const application = await prisma.applications.findUnique({ where: { id: applicationId } });
    if (!application) {
        const error: any = new Error("Application not found");
        error.code = "APPLICATION_NOT_FOUND";
        throw error;
    }

    return prisma.applications.update({
        where: { id: applicationId },
        data: { hr_status: status, hr_note: hrNote },
    });
};
