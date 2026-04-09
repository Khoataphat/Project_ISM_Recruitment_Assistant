import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from "../../../prisma/prisma.service";
import { generateVerificationCode } from '../email/email.service';
import { dispatchEmail } from '../email/email.worker';

const TOKEN_EXPIRY = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const SALT_ROUNDS = 10;

export const generateToken = (userId: number, role: string, res: Response): string => {
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: TOKEN_EXPIRY });

    res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
        maxAge: COOKIE_MAX_AGE,
    });

    return token;
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
        },
    });

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