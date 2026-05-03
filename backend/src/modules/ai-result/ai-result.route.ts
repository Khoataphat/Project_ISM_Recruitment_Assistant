import express from "express";
import { receiveAiApplicationResult } from "./ai-result.controller";

const router = express.Router();

router.post("/applications/:id/result", receiveAiApplicationResult);

export default router;
