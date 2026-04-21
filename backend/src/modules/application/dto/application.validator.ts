import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const applicationSchema = z.object({
    jobId: z
        .coerce
        .number({ message: "Job ID must be a number" })
        .int({ message: "Job ID must be an integer" })
        .positive({ message: "Job ID must be positive" }),
    coverLetter: z
        .string()
        .max(2000, { message: "Cover letter must be less than 2000 characters" })
        .trim()
        .optional(),
});

export const applicationIdParamSchema = z.object({
    id: z
        .coerce
        .number({ message: "Application ID must be a number" })
        .int({ message: "Application ID must be an integer" })
        .positive({ message: "Application ID must be positive" }),
});

export const acceptApplicationSchema = z.object({
    interviewDate: z
        .string()
        .min(1, { message: "Interview date is required" }),
    interviewLocation: z
        .string()
        .min(1, { message: "Interview location is required" })
        .max(256, { message: "Interview location must be less than 256 characters" })
        .trim(),
});

export const validateBody = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: "error",
            errors: result.error.issues.map((e) => ({
                field: e.path.join('.'),
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
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }
    next();
};
