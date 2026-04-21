import { prisma } from "../../../prisma/prisma.service";

type CreateJobInput = {
    companyName?: string;
    title: string;
    description: string;
    location?: string;
    workMode?: string;
    employmentType?: string;
    salaryMin?: number;
    salaryMax?: number;
    deadline?: string;
    requirements?: string[];
    benefits?: string[];
    createdBy: number;
    status?: string;
};

type UpdateJobInput = {
    companyName?: string;
    title?: string;
    description?: string;
    location?: string;
    workMode?: string;
    employmentType?: string;
    salaryMin?: number;
    salaryMax?: number;
    deadline?: string;
    requirements?: string[];
    benefits?: string[];
    status?: string;
    updatedBy: number;
};

export const listOpenJobs = async () => {
    return prisma.job.findMany({
        where: { status: "open" },
        orderBy: { updatedDate: "desc" },
    });
};

export const listJobsForHr = async () => {
    return prisma.job.findMany({
        orderBy: { updatedDate: "desc" },
    });
};

export const getVisibleJobById = async (jobId: number) => {
    return prisma.job.findFirst({
        where: {
            jobId,
            status: "open",
        },
    });
};

export const getJobById = async (jobId: number) => {
    return prisma.job.findUnique({
        where: { jobId },
    });
};

export const createJob = async (data: CreateJobInput) => {
    const {
        companyName,
        title,
        description,
        location,
        workMode,
        employmentType,
        salaryMin,
        salaryMax,
        deadline,
        requirements,
        benefits,
        createdBy,
        status = "open",
    } = data;

    return prisma.job.create({
        data: {
            companyName,
            title,
            description,
            location,
            workMode,
            employmentType,
            salaryMin,
            salaryMax,
            deadline,
            requirements: requirements ?? [],
            benefits: benefits ?? [],
            status,
            createdBy,
            updatedBy: createdBy,
        },
    });
};

export const updateJob = async (jobId: number, data: UpdateJobInput) => {
    const existing = await prisma.job.findUnique({
        where: { jobId },
    });

    if (!existing) {
        const error: any = new Error("Job not found");
        error.code = "JOB_NOT_FOUND";
        throw error;
    }

    const { updatedBy, deadline, requirements, benefits, ...rest } = data;

    return prisma.job.update({
        where: { jobId },
        data: {
            ...rest,
            deadline,
            requirements,
            benefits,
            updatedBy,
        },
    });
};
