import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const apps = await prisma.applications.findMany({
        take: 5,
        orderBy: { applied_at: 'desc' },
        select: {
            id: true,
            processing_status: true,
            ai_matching_score: true,
            ai_summary: true,
            skills_radar: true
        }
    });

    console.log(JSON.stringify(apps, null, 2));
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
