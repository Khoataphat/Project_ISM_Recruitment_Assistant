import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
    console.error("FATAL: DATABASE_URL or DIRECT_URL environment variable is not set");
    process.exit(1);
}

const adapter = new PrismaPg(connectionString);

const prisma = new PrismaClient({
    adapter,
    log:
        process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
});

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("DB Connected via Prisma");
    } catch (error) {
        console.error(`Database connection error: ${(error as Error).message}`);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };
