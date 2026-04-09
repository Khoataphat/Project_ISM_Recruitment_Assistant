import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from "../../../prisma/prisma.service";

export interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ status: "error", message: "Not authorized, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        if (!decoded.userId) {
            return res.status(401).json({ status: "error", message: "Invalid token payload" });
        }

        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId },
        });

        if (!user) {
            return res.status(401).json({ status: "error", message: "User no longer exists" });
        }

        req.userId = user.userId;
        req.userRole = user.role;
        next();
    } catch (err) {
        return res.status(401).json({ status: "error", message: "Not authorized, token failed" });
    }
};

export const authorizeRole = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userRole) {
            return res.status(403).json({
                status: "error",
                message: "Forbidden: you do not have permission to access this resource",
            });
        }

        if (req.userRole === "hr" || allowedRoles.includes(req.userRole)) {
            return next();
        }

        return res.status(403).json({
            status: "error",
            message: "Forbidden: you do not have permission to access this resource",
        });
    };
};
