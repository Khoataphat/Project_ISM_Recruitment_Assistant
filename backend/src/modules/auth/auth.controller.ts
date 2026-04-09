import { Request, Response } from "express";
import {
    generateToken,
    findUserByEmail,
    findUserById,
    createUser,
} from "./auth.service";
import { AuthRequest } from "./auth.middleware";
import bcrypt from 'bcrypt';

const register = async (req: Request, res: Response) => {
    try {
        const { email, password, fullName } = req.body;

        const user = await createUser({ email, password, fullName });
        const token = generateToken(user.userId, user.role, res);

        res.status(201).json({
            status: "success",
            data: { user, token },
        });
    } catch (err: any) {
        if (err.code === "USER_EXISTS") {
            return res.status(409).json({ status: "error", message: "User already exists" });
        }
        console.error("Register error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }

        const token = generateToken(user.userId, user.role, res);

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    userId: user.userId,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
                token,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

const logout = async (_req: Request, res: Response) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({
        status: "success",
        message: "Logged out successfully",
    });
};

const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await findUserById(req.userId!);
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    userId: user.userId,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
            },
        });
    } catch (err) {
        console.error("GetMe error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export { register, login, logout, getMe };
