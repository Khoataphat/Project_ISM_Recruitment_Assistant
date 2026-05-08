import { PrismaClient, processing_status } from "@prisma/client";
import { scoreApplicationWithAi } from "../src/modules/application/ai.service";

const prisma = new PrismaClient();

async function reprocess() {
    console.log("--- Bắt đầu quét hồ sơ cần xử lý lại ---");

    // Find applications that are Pending or Analyzed but missing/zero score
    // Note: We use 0 as a sign of missing data because of the previous key mismatch bug
    const apps = await prisma.applications.findMany({
        where: {
            OR: [
                { ai_matching_score: 0 },
                { ai_matching_score: null },
                { processing_status: processing_status.Pending }
            ]
        },
        select: { id: true }
    });

    console.log(`Tìm thấy ${apps.length} hồ sơ cần xử lý.`);

    for (const app of apps) {
        console.log(`\n> Đang xử lý lại hồ sơ ID: ${app.id}...`);
        try {
            // We await it here so we don't overwhelm the AI service with parallel requests
            await scoreApplicationWithAi(app.id);
            console.log(`[OK] Đã hoàn thành hồ sơ ${app.id}`);
        } catch (error: any) {
            console.error(`[LỖI] Hồ sơ ${app.id}: ${error.message}`);
        }
    }

    console.log("\n--- TẤT CẢ ĐÃ XỬ LÝ XONG ---");
}

reprocess()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
