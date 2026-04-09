import express from "express";
import { register, login, logout } from "./auth.controller";
import { registerSchema, loginSchema, validate } from "./dto/auth.validator";
import { authMiddleware } from "./auth.middleware";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", authMiddleware, logout);

export default router;
