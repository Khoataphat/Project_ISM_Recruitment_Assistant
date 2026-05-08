import express from "express";
import { register, login, logout, getMe, verifyEmailHandler, resendVerificationHandler, refreshTokenHandler } from "./auth.controller";
import { registerSchema, loginSchema, verifyEmailSchema, resendVerificationSchema, validate } from "./dto/auth.validator";
import { authMiddleware } from "./auth.middleware";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmailHandler);
router.post("/resend-verification", validate(resendVerificationSchema), resendVerificationHandler);
router.post("/refresh-token", refreshTokenHandler);

export default router;
