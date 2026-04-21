import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const legacyJobSchema = z.object({
    title: z.string().min(2).max(256).trim(),
    description: z.string().min(10).trim(),
    image: z.string().trim().optional(),
    tags: z.array(z.string().min(1).max(100).trim()).optional(),
    location: z.string().min(2).max(128).trim().optional(),
    minSalary: z.coerce.number().int().nonnegative().optional(),
    maxSalary: z.coerce.number().int().nonnegative().optional(),
}).refine(
    (data) => data.minSalary === undefined || data.maxSalary === undefined || data.minSalary <= data.maxSalary,
    {
        message: "minSalary must be less than or equal to maxSalary",
        path: ["minSalary"],
    },
);

const legacyApplySchema = z.object({
    fullName: z.string().min(2).max(128).trim(),
    email: z.email().max(64).trim(),
    jobId: z.coerce.number().int().positive(),
});

const legacyCandidateStatusSchema = z.object({
    status: z.enum(["ACCEPTED", "REJECTED"]),
    interviewDate: z.string().trim().optional(),
    interviewLocation: z.string().trim().optional(),
});

function createValidator(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Failed",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        req.body = result.data;
        next();
    };
}

export const validateLegacyJob = createValidator(legacyJobSchema);
export const validateLegacyApply = createValidator(legacyApplySchema);
export const validateLegacyCandidateStatus = createValidator(legacyCandidateStatusSchema);
