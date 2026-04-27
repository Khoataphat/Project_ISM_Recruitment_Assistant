/**
 * ai.service.ts — AI scoring stub
 * 
 * The application schema has been restructured. The old `application`, `candidateProfile`,
 * and `candidateEducation` Prisma models no longer exist. This service is being kept as a
 * stub so the build succeeds while the AI scoring feature is being updated separately.
 */

export const scoreApplicationWithAi = async (applicationId: string): Promise<void> => {
    // TODO: Implement AI scoring against the new schema
    // Trigger async scoring via the Python AI service
    console.log(`[AI Service] Stub: scoring skipped for application ${applicationId}`);
};

export const serializeApplication = (app: any) => app;
export const serializeApplications = (apps: any[]) => apps;
