import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const dashboardQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(["pending", "accepted", "rejected"]).optional(),
    search: z.string().max(128).trim().optional(),
});

export const validateQuery = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            status: "error",
            errors: result.error.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }
    res.locals.query = result.data;
    next();
};
