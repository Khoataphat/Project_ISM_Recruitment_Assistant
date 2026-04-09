import { Request, Response } from "express";
import {
    generateToken,
    findUserByEmail,
    createUser,
    hashPassword,
    comparePassword,
} from "./auth.service";

const register = async (req: Request, res: Response) => {
    try {
        const { email, password, fullName } = req.body;

        const userExist = await findUserByEmail(email);
        if (userExist) {
            return res.status(409).json({ status: "error", message: "User already exists with this email" });
        }

        const passwordHash = await hashPassword(password);
        const user = await createUser({ email, passwordHash, fullName });

        const token = generateToken(user.userId, res);

        res.status(201).json({
            status: "success",
            data: {
                user: {
                    userId: user.userId,
                    email: user.email,
                    fullName: user.fullName,
                },
                token,
            },
        });
    } catch (err) {
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

        const isPasswordValid = await comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }

        const token = generateToken(user.userId, res);

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    email: user.email,
                    fullName: user.fullName,
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

export { register, login, logout };
