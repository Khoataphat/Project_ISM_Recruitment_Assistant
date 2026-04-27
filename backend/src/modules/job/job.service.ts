import { job_status, job_level, job_type } from "@prisma/client";
import { prisma } from "../../../prisma/prisma.service";

type CreateJobInput = {
    title: string;
    description: string;
    location?: string;
    level?: job_level;
    type?: job_type;
    salary_min?: number;
    salary_max?: number;
    application_deadline?: string;
    benefits?: string[];
    company_id: string;
    hr_id: string;
    status?: job_status;
};

type UpdateJobInput = Partial<Omit<CreateJobInput, 'company_id' | 'hr_id'>>;

export const listOpenJobs = async () => {
    return prisma.jobs.findMany({
        where: { status: job_status.Open },
        include: {
            companies: { select: { id: true, name: true, logo_url: true, headquarters_location: true } },
            hr_profiles: { select: { id: true, position: true } },
        },
        orderBy: { created_at: "desc" },
    });
};

export const listJobsForHr = async (hrId?: string) => {
    return prisma.jobs.findMany({
        where: hrId ? { hr_id: hrId } : undefined,
        include: {
            companies: { select: { id: true, name: true, logo_url: true } },
            _count: { select: { applications: true } },
        },
        orderBy: { updated_at: "desc" },
    });
};

export const getVisibleJobById = async (jobId: string) => {
    return prisma.jobs.findFirst({
        where: { id: jobId, status: job_status.Open },
        include: {
            companies: { select: { id: true, name: true, logo_url: true, description: true, headquarters_location: true } },
            hr_profiles: { select: { id: true, position: true, department_name: true } },
        },
    });
};

export const getJobById = async (jobId: string) => {
    return prisma.jobs.findUnique({
        where: { id: jobId },
        include: {
            companies: { select: { id: true, name: true, logo_url: true, description: true, headquarters_location: true } },
            hr_profiles: {
                select: {
                    id: true,
                    position: true,
                    department_name: true,
                    users: { select: { full_name: true, email: true } },
                },
            },
            _count: { select: { applications: true } },
        },
    });
};

export const createJob = async (data: CreateJobInput) => {
    const {
        title,
        description,
        location,
        level = job_level.Mid_Level,
        type = job_type.Full_time,
        salary_min,
        salary_max,
        application_deadline,
        benefits = [],
        company_id,
        hr_id,
        status = job_status.Open,
    } = data;

    return prisma.jobs.create({
        data: {
            title,
            description,
            location,
            level,
            type,
            salary_min,
            salary_max,
            application_deadline: application_deadline ? new Date(application_deadline) : undefined,
            benefits,
            company_id,
            hr_id,
            status,
        },
        include: {
            companies: { select: { id: true, name: true, logo_url: true } },
        },
    });
};

export const updateJob = async (jobId: string, data: UpdateJobInput) => {
    const existing = await prisma.jobs.findUnique({ where: { id: jobId } });
    if (!existing) {
        const error: any = new Error("Job not found");
        error.code = "JOB_NOT_FOUND";
        throw error;
    }

    const { application_deadline, ...rest } = data;

    return prisma.jobs.update({
        where: { id: jobId },
        data: {
            ...rest,
            application_deadline: application_deadline ? new Date(application_deadline) : undefined,
        },
        include: {
            companies: { select: { id: true, name: true, logo_url: true } },
        },
    });
};
