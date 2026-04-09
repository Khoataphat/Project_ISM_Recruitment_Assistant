import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Service } from "typedi";

@Service()
export class PrismaService {
    private client: PrismaClient;

    constructor() {
        const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
        this.client = new PrismaClient({ adapter });
    }

    get user() {
        return this.client.user;
    }

    async connect() {
        await this.client.$connect();
    }

    async disconnect() {
        await this.client.$disconnect();
    }
}