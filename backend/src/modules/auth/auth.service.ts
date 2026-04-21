import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
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

export const generateTokens = (userId: number, role: Role, res: Response): { accessToken: string; refreshToken: string } => {
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

    const user = await prisma.user.findUnique({ where: { userId: decoded.userId } });
    if (!user) {
        const error: any = new Error("User not found");
        error.code = "USER_NOT_FOUND";
        throw error;
    }

    return generateTokens(user.userId, user.role, res);
};

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (userId: number) => {
    return prisma.user.findUnique({ where: { userId } });
};

export const createUser = async (data: {
    email: string;
    password: string;
    fullName: string;
}) => {
    const { email, password, fullName } = data;

    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) {
        const error: any = new Error("User exists");
        error.code = "USER_EXISTS";
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            fullName,
            role: Role.CANDIDATE,
        },
    });

    await redis.set(verificationKey(email), verificationCode, "EX", VERIFICATION_EXPIRY_SECONDS);

    dispatchEmail({
        type: "welcome",
        to: user.email,
        fullName: user.fullName,
    });

    dispatchEmail({
        type: "verification",
        to: user.email,
        fullName: user.fullName,
        code: verificationCode,
    });

    return {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
    };
};

export const verifyEmail = async (email: string, code: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        const error: any = new Error("User not found");
        error.code = "USER_NOT_FOUND";
        throw error;
    }

    if (user.isVerified) {
        const error: any = new Error("Already verified");
        error.code = "ALREADY_VERIFIED";
        throw error;
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

    await prisma.user.update({
        where: { email },
        data: { isVerified: true },
    });

    await redis.del(verificationKey(email));

    return { email: user.email, isVerified: true };
};

export const resendVerification = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        const error: any = new Error("User not found");
        error.code = "USER_NOT_FOUND";
        throw error;
    }

    if (user.isVerified) {
        const error: any = new Error("Already verified");
        error.code = "ALREADY_VERIFIED";
        throw error;
    }

    const verificationCode = generateVerificationCode();
    await redis.set(verificationKey(email), verificationCode, "EX", VERIFICATION_EXPIRY_SECONDS);

    dispatchEmail({
        type: "verification",
        to: user.email,
        fullName: user.fullName,
        code: verificationCode,
    });
};