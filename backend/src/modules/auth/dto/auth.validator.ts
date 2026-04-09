import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const registerSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .max(64, { message: "Email must be less than 64 characters" })
        .email({ message: "Invalid email format" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" })
        .max(255, { message: "Password must be less than 255 characters" }),
    fullName: z
        .string()
        .min(2, { message: "Full name must be at least 2 characters" })
        .max(128, { message: "Full name must be less than 128 characters" }),
});

const loginSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .max(64, { message: "Email must be less than 64 characters" })
        .email({ message: "Invalid email format" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" })
        .max(255, { message: "Password must be less than 255 characters" }),
});

const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
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
    next();
};

export { registerSchema, loginSchema, validate };
