import { Prisma, processing_status } from "@prisma/client";
import { prisma } from "../../../prisma/prisma.service";

export type AiApplicationResultInput = {
    ai_matching_score: number;
    skills_radar: Prisma.InputJsonValue;
    ai_summary: Prisma.InputJsonValue;
};

export const saveAiApplicationResult = async (
    applicationId: string,
    data: AiApplicationResultInput,
) => {
    const application = await prisma.applications.findUnique({
        where: { id: applicationId },
        select: { id: true },
    });

    if (!application) {
        const error: any = new Error("Application not found");
        error.code = "APPLICATION_NOT_FOUND";
        throw error;
    }

    return prisma.applications.update({
        where: { id: applicationId },
        data: {
            ai_matching_score: data.ai_matching_score,
            skills_radar: data.skills_radar,
            ai_summary: data.ai_summary,
            processing_status: processing_status.Analyzed,
        },
    });
};
