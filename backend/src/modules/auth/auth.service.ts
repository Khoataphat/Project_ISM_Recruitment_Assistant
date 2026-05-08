import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { user_role } from '@prisma/client';
import { prisma } from "../../../prisma/prisma.service";
import redis from '../../shared/redis.service';
import { generateVerificationCode } from '../email/email.service';
import { dispatchEmail } from '../email/email.worker';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const VERIFICATION_EXPIRY_SECONDS = 10 * 60; // 10 minutes

function verificationKey(email: string) {
    return `verify:${email}`;
}

export const generateTokens = (userId: string, role: user_role, res: Response): { accessToken: string; refreshToken: string } => {
    const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ userId, role, type: 'refresh' }, process.env.JWT_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRY });

    res.cookie("jwt", accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
        maxAge: ACCESS_COOKIE_MAX_AGE,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
        maxAge: REFRESH_COOKIE_MAX_AGE,
        path: '/auth/refresh-token',
    });

    return { accessToken, refreshToken };
};

export const refreshAccessToken = async (token: string, res: Response) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    if (decoded.type !== 'refresh') {
        const error: any = new Error("Invalid token type");
        error.code = "INVALID_TOKEN";
        throw error;
    }

    const user = await prisma.users.findUnique({ 
        where: { id: decoded.userId },
        include: { hr_profiles: true, candidates: true }
    });
    if (!user) {
        const error: any = new Error("User not found");
        error.code = "USER_NOT_FOUND";
        throw error;
    }

    return generateTokens(user.id, user.role, res);
};

export const findUserByEmail = async (email: string) => {
    return prisma.users.findUnique({ 
        where: { email },
        include: {
            hr_profiles: true,
            candidates: true
        }
    });
};

export const findUserById = async (userId: string) => {
    return prisma.users.findUnique({ 
        where: { id: userId },
        include: {
            hr_profiles: true,
            candidates: true
        }
    });
};

export const createUser = async (data: {
    email: string;
    password: string;
    fullName: string;
    role?: user_role;
}) => {
    const { email, password, fullName, role = user_role.User } = data;

    const userExist = await prisma.users.findUnique({ where: { email } });
    if (userExist) {
        const error: any = new Error("User exists");
        error.code = "USER_EXISTS";
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const user = await prisma.users.create({
        data: {
            email,
            password_hash: passwordHash,
            full_name: fullName,
            role: role,
        },
    });

    if (role === user_role.HR) {
        // Find dummy company for initial HR creation
        let hrCompany = await prisma.companies.findFirst({ where: { name: 'Test HR Company' } });
        if (!hrCompany) {
            hrCompany = await prisma.companies.create({ data: { name: 'Test HR Company' } });
        }
        await prisma.hr_profiles.create({
            data: { user_id: user.id, company_id: hrCompany.id }
        });
    } else {
        await prisma.candidates.create({
            data: { user_id: user.id }
        });
    }

    await redis.set(verificationKey(email), verificationCode, "EX", VERIFICATION_EXPIRY_SECONDS);

    dispatchEmail({
        type: "welcome",
        to: user.email,
        fullName: user.full_name,
    });

    dispatchEmail({
        type: "verification",
        to: user.email,
        fullName: user.full_name,
        code: verificationCode,
    });

    return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
    };
};

export const verifyEmail = async (email: string, code: string) => {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
        const error: any = new Error("User not found");
        error.code = "USER_NOT_FOUND";
        throw error;
    }

    if (user.is_active) {
        // Just using is_active as placeholder since isVerified was removed.
        // Wait, if it's active let's say already verified? But wait, the schema has no isVerified.
    }

    const storedCode = await redis.get(verificationKey(email));

    if (!storedCode) {
        const error: any = new Error("Verification code expired or not found");
        error.code = "CODE_EXPIRED";
        throw error;
    }

    if (storedCode !== code) {
        const error: any = new Error("Invalid verification code");
        error.code = "INVALID_CODE";
        throw error;
    }

    await prisma.users.update({
        where: { email },
        data: { is_active: true }, // we just update is_active to true
    });

    await redis.del(verificationKey(email));

    return { email: user.email, isVerified: true };
};

export const resendVerification = async (email: string) => {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
        const error: any = new Error("User not found");
        error.code = "USER_NOT_FOUND";
        throw error;
    }

    const verificationCode = generateVerificationCode();
    await redis.set(verificationKey(email), verificationCode, "EX", VERIFICATION_EXPIRY_SECONDS);

    dispatchEmail({
        type: "verification",
        to: user.email,
        fullName: user.full_name,
        code: verificationCode,
    });
};