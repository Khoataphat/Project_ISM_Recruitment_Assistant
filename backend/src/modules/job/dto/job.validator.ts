import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const jobStatusSchema = z.enum(["open", "closed"]);
const workModeSchema = z.enum(["remote", "hybrid", "on-site"]);
const employmentTypeSchema = z.enum(["full-time", "part-time", "contract", "internship"]);

const stringListSchema = z.array(
    z
        .string()
        .min(1, { message: "List item cannot be empty" })
        .max(500, { message: "List item must be less than 500 characters" })
        .trim(),
).max(50, { message: "Too many list items" });

export const createJobSchema = z.object({
    companyName: z
        .string()
        .min(2, { message: "Company name must be at least 2 characters" })
        .max(128, { message: "Company name must be less than 128 characters" })
        .trim()
        .optional(),
    title: z
        .string()
        .min(2, { message: "Title must be at least 2 characters" })
        .max(256, { message: "Title must be less than 256 characters" })
        .trim(),
    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters" })
        .trim(),
    location: z
        .string()
        .min(2, { message: "Location must be at least 2 characters" })
        .max(128, { message: "Location must be less than 128 characters" })
        .trim()
        .optional(),
    workMode: workModeSchema.optional(),
    employmentType: employmentTypeSchema.optional(),
    salaryMin: z
        .number({ message: "Salary min must be a number" })
        .int({ message: "Salary min must be an integer" })
        .nonnegative({ message: "Salary min must be non-negative" })
        .optional(),
    salaryMax: z
        .number({ message: "Salary max must be a number" })
        .int({ message: "Salary max must be an integer" })
        .nonnegative({ message: "Salary max must be non-negative" })
        .optional(),
    deadline: z
        .string()
        .datetime({ message: "Deadline must be a valid ISO datetime" })
        .optional(),
    requirements: stringListSchema.optional(),
    benefits: stringListSchema.optional(),
    status: jobStatusSchema.optional(),
}).refine(
    (data) => data.salaryMin === undefined || data.salaryMax === undefined || data.salaryMin <= data.salaryMax,
    {
        message: "Salary min must be less than or equal to salary max",
        path: ["salaryMin"],
    },
);

export const updateJobSchema = z.object({
    companyName: z
        .string()
        .min(2, { message: "Company name must be at least 2 characters" })
        .max(128, { message: "Company name must be less than 128 characters" })
        .trim()
        .optional(),
    title: z
        .string()
        .min(2, { message: "Title must be at least 2 characters" })
        .max(256, { message: "Title must be less than 256 characters" })
        .trim()
        .optional(),
    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters" })
        .trim()
        .optional(),
    location: z
        .string()
        .min(2, { message: "Location must be at least 2 characters" })
        .max(128, { message: "Location must be less than 128 characters" })
        .trim()
        .optional(),
    workMode: workModeSchema.optional(),
    employmentType: employmentTypeSchema.optional(),
    salaryMin: z
        .number({ message: "Salary min must be a number" })
        .int({ message: "Salary min must be an integer" })
        .nonnegative({ message: "Salary min must be non-negative" })
        .optional(),
    salaryMax: z
        .number({ message: "Salary max must be a number" })
        .int({ message: "Salary max must be an integer" })
        .nonnegative({ message: "Salary max must be non-negative" })
        .optional(),
    deadline: z
        .string()
        .datetime({ message: "Deadline must be a valid ISO datetime" })
        .optional(),
    requirements: stringListSchema.optional(),
    benefits: stringListSchema.optional(),
    status: jobStatusSchema.optional(),
}).refine(
    (data) => (
        data.companyName !== undefined
        || data.title !== undefined
        || data.description !== undefined
        || data.location !== undefined
        || data.workMode !== undefined
        || data.employmentType !== undefined
        || data.salaryMin !== undefined
        || data.salaryMax !== undefined
        || data.deadline !== undefined
        || data.requirements !== undefined
        || data.benefits !== undefined
        || data.status !== undefined
    ),
    {
        message: "At least one field is required",
        path: [],
    },
).refine(
    (data) => data.salaryMin === undefined || data.salaryMax === undefined || data.salaryMin <= data.salaryMax,
    {
        message: "Salary min must be less than or equal to salary max",
        path: ["salaryMin"],
    },
);

export const jobIdParamSchema = z.object({
    id: z
        .coerce
        .number({ message: "Job ID must be a number" })
        .int({ message: "Job ID must be an integer" })
        .positive({ message: "Job ID must be positive" }),
});

export const validateBody = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: "error",
            errors: result.error.issues.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
    }

    req.body = result.data;
    next();
};

export const validateParams = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            status: "error",
            errors: result.error.issues.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
    }

    next();
};
