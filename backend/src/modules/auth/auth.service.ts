import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from "../../../prisma/prisma.service";

const TOKEN_EXPIRY = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const generateToken = (userId: number, res: Response): string => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: TOKEN_EXPIRY });

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

export const createUser = async (data: { email: string; passwordHash: string; fullName: string }) => {
    return prisma.user.create({ data });
};

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};
