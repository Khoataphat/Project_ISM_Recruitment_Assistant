import { Request, Response } from "express";
import {
    generateTokens,
    refreshAccessToken,
    findUserByEmail,
    findUserById,
    createUser,
    verifyEmail as verifyEmailService,
    resendVerification as resendVerificationService,
} from "./auth.service";
import { AuthRequest } from "./auth.middleware";
import { toGetMeResponse } from "./dto/auth.response";
import bcrypt from 'bcrypt';

const register = async (req: Request, res: Response) => {
    try {
        const { email, password, fullName, role } = req.body;

        const user = await createUser({ email, password, fullName, role });
        const { accessToken } = generateTokens(user.id, user.role, res);

        res.status(201).json({
            status: "success",
            data: { user, token: accessToken },
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

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }

        if (user.is_active === false) {
            return res.status(403).json({ status: "error", message: "Account is disabled" });
        }

        const { accessToken } = generateTokens(user.id, user.role, res);
        const profileId = user.role === "HR" ? (user as any).hr_profiles?.id : (user as any).candidates?.id;

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role === "User" ? "CANDIDATE" : user.role,
                    profile_id: profileId,
                },
                token: accessToken,
            },
        });
    } catch (err: any) {
        console.error("Login error:", err);
        res.status(500).json({ status: "error", message: err.message, stack: err.stack });
    }
};

const logout = async (_req: Request, res: Response) => {
    res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
    res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0), path: '/auth/refresh-token' });
    res.status(200).json({
        status: "success",
        message: "Logged out successfully",
    });
};

const refreshTokenHandler = async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({ status: "error", message: "No refresh token provided" });
        }

        const { accessToken } = await refreshAccessToken(token, res);

        res.status(200).json({
            status: "success",
            data: { token: accessToken },
        });
    } catch (err: any) {
        if (err.code === "INVALID_TOKEN" || err.code === "USER_NOT_FOUND" || err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json({ status: "error", message: "Invalid or expired refresh token" });
        }
        console.error("RefreshToken error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await findUserById(req.userId!);
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        res.status(200).json({
            status: "success",
            data: { user: toGetMeResponse(user) },
        });
    } catch (err) {
        console.error("GetMe error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

const verifyEmailHandler = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;
        const result = await verifyEmailService(email, code);

        res.status(200).json({
            status: "success",
            message: "Email verified successfully",
            data: result,
        });
    } catch (err: any) {
        const errorMap: Record<string, { status: number; message: string }> = {
            USER_NOT_FOUND: { status: 404, message: "User not found" },
            ALREADY_VERIFIED: { status: 400, message: "Email is already verified" },
            NO_VERIFICATION: { status: 400, message: "No verification pending for this email" },
            CODE_EXPIRED: { status: 400, message: "Verification code has expired" },
            INVALID_CODE: { status: 400, message: "Invalid verification code" },
        };

        const mapped = errorMap[err.code];
        if (mapped) {
            return res.status(mapped.status).json({ status: "error", message: mapped.message });
        }

        console.error("VerifyEmail error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

const resendVerificationHandler = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        await resendVerificationService(email);

        res.status(200).json({
            status: "success",
            message: "Verification code resent successfully",
        });
    } catch (err: any) {
        const errorMap: Record<string, { status: number; message: string }> = {
            USER_NOT_FOUND: { status: 404, message: "User not found" },
            ALREADY_VERIFIED: { status: 400, message: "Email is already verified" },
        };

        const mapped = errorMap[err.code];
        if (mapped) {
            return res.status(mapped.status).json({ status: "error", message: mapped.message });
        }

        console.error("ResendVerification error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export { register, login, logout, getMe, verifyEmailHandler, resendVerificationHandler, refreshTokenHandler };
