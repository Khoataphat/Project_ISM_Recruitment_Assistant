import { Request, Response } from "express";
import { z } from "zod";
import { saveAiApplicationResult } from "./ai-result.service";

const skillsRadarSchema = z
    .object({
        Technical: z.number().min(0).max(100).optional(),
        Experience: z.number().min(0).max(100).optional(),
        "Soft Skills": z.number().min(0).max(100).optional(),
        Education: z.number().min(0).max(100).optional(),
        Overall: z.number().min(0).max(100).optional(),
    })
    .catchall(z.number().min(0).max(100));

const aiExplanationSchema = z
    .object({
        score_reason: z.string().trim().optional(),
        radar_breakdown: z.string().trim().optional(),
    })
    .optional();

const aiResultSchema = z.object({
    matching_data: z.object({
        ai_matching_score: z.number().min(0).max(100),
        skills_radar: skillsRadarSchema,
        ai_summary: z.string().trim().min(1),
        ai_explanation: aiExplanationSchema,
    }),
});

const getAiSecretHeader = (req: Request) => {
    const value = req.headers["x-ai-service-secret"];
    return Array.isArray(value) ? value[0] : value;
};

export const receiveAiApplicationResult = async (req: Request, res: Response) => {
    try {
        const configuredSecret = process.env.AI_SERVICE_SECRET;
        const providedSecret = getAiSecretHeader(req);

        if (!configuredSecret || providedSecret !== configuredSecret) {
            return res.status(401).json({ status: "error", message: "Unauthorized AI service" });
        }

        const parsed = aiResultSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: "error",
                message: "Invalid AI result payload",
                errors: parsed.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }

        const { matching_data } = parsed.data;
        const updated = await saveAiApplicationResult(String(req.params.id), {
            ai_matching_score: matching_data.ai_matching_score,
            skills_radar: matching_data.skills_radar,
            ai_summary: {
                summary: matching_data.ai_summary,
                explanation: matching_data.ai_explanation ?? {},
            },
        });

        res.status(200).json({ status: "success", data: updated });
    } catch (err: any) {
        if (err.code === "APPLICATION_NOT_FOUND") {
            return res.status(404).json({ status: "error", message: "Application not found" });
        }

        console.error("Receive AI application result error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
