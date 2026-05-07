import { Request, Response } from "express";
import { aiInterviewService } from "./ai-interview.service";

export class AiInterviewController {
    public async submitInterview(req: any, res: Response): Promise<void> {
        try {
            // application_id could come from req.body or params. Let's assume body
            // questions might also come from body as a stringified JSON array
            const { applicationId, questions } = req.body;
            
            if (!applicationId) {
                res.status(400).json({ status: "error", message: "applicationId is required" });
                return;
            }

            if (!req.file) {
                res.status(400).json({ status: "error", message: "Video file is required" });
                return;
            }

            const videoPath = req.file.path as string;
            const videoUrl = `/uploads/interviews/${req.file.filename as string}`;

            // Check if interview record already exists for this application
            // For simplicity, we just create. If it fails due to unique constraint, we can handle it
            try {
                await aiInterviewService.createInterviewRecord(applicationId, videoUrl);
                await aiInterviewService.updateApplicationVideoUrl(applicationId, videoUrl);
            } catch (dbError: any) {
                // If record exists, we could just update it instead, or ignore.
                if (dbError.code === 'P2002') { // Unique constraint violation
                    console.log(`[AI-Interview] Record already exists for application ${applicationId}, proceeding.`);
                } else {
                    throw dbError;
                }
            }

            // Parse questions if passed as string
            let parsedQuestions = [];
            if (questions) {
                try {
                    parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
                } catch (e) {
                    console.warn(`[AI-Interview] Could not parse questions for application ${applicationId}`);
                }
            }

            // Trigger AI Service asynchronously
            aiInterviewService.triggerAiAnalysisAsync(applicationId, videoPath, parsedQuestions);

            // Return fast response according to Acceptance Criteria
            res.status(200).json({ status: "PROCESSING" });
        } catch (error: any) {
            console.error("[AI-Interview] Error submitting interview:", error);
            res.status(500).json({ status: "error", message: "Internal server error" });
        }
    }
}

export const aiInterviewController = new AiInterviewController();
