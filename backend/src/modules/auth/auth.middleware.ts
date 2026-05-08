import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { user_role } from '@prisma/client';
import { prisma } from "../../../prisma/prisma.service";

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: user_role;
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

        const user = await prisma.users.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return res.status(401).json({ status: "error", message: "User no longer exists" });
        }

        req.userId = user.id;
        req.userRole = user.role;
        next();
    } catch (err) {
        return res.status(401).json({ status: "error", message: "Not authorized, token failed" });
    }
};

export const authorizeRole = (...allowedRoles: user_role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userRole) {
            return res.status(403).json({
                status: "error",
                message: "Forbidden: you do not have permission to access this resource",
            });
        }

        if (allowedRoles.includes(req.userRole)) {
            return next();
        }

        return res.status(403).json({
            status: "error",
            message: "Forbidden: you do not have permission to access this resource",
        });
    };
};
