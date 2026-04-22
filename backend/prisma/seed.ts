import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL or DIRECT_URL must be set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const passwordHash = await bcrypt.hash("password123", 10);

    // 1. Create Candidate Account
    console.log("Upserting Candidate test account...");
    const candidate = await prisma.user.upsert({
        where: { email: "candidate@test.com" },
        update: {},
        create: {
            email: "candidate@test.com",
            passwordHash: passwordHash,
            fullName: "Candidate Test User",
            role: Role.CANDIDATE,
            isVerified: true,
        },
    });
    console.log(`Candidate account created/updated: ${candidate.email}`);

    // 2. Create HR Account
    console.log("Upserting HR test account...");
    const hr = await prisma.user.upsert({
        where: { email: "hr@test.com" },
        update: {},
        create: {
            email: "hr@test.com",
            passwordHash: passwordHash,
            fullName: "HR Manager Admin",
            role: Role.HR,
            isVerified: true,
        },
    });
    console.log(`HR account created/updated: ${hr.email}`);

    // 3. Create Sample Jobs
    console.log("Creating sample jobs...");
    // Clear existing jobs to avoid duplicates on re-seed if needed, 
    // but here we'll just add them.
    const jobsData = [
        {
            title: "Senior Fullstack Engineer",
            companyName: "TechNova Solutions",
            description: "We are looking for a Senior Fullstack Engineer to join our core team. You will be responsible for building scalable web applications and mentoring junior developers.",
            requirements: [
                "5+ years of experience with Node.js and React",
                "Strong understanding of PostgreSQL and Prisma",
                "Experience with Docker and Kubernetes",
                "Excellent problem-solving skills"
            ],
            benefits: [
                "Competitive salary and performance bonuses",
                "Remote-first work environment",
                "Health insurance and wellness programs",
                "Professional development budget"
            ],
            location: "Ho Chi Minh City",
            workMode: "Remote",
            employmentType: "Full-time",
            salaryMin: 3000,
            salaryMax: 5000,
            createdBy: hr.userId
        },
        {
            title: "AI/ML Engineer",
            companyName: "FutureAI Lab",
            description: "Join our AI research lab to develop cutting-edge recruitment assistant features. You will work with LLMs and RAG systems.",
            requirements: [
                "Experience with Python and PyTorch/TensorFlow",
                "Solid understanding of NLP and LLM integration",
                "Strong mathematical foundation",
                "Masters or PhD in CS or related field is a plus"
            ],
            benefits: [
                "Opportunity to work on state-of-the-art AI technology",
                "Flexible working hours",
                "Modern office in District 1",
                "Stock options"
            ],
            location: "Ho Chi Minh City",
            workMode: "Hybrid",
            employmentType: "Full-time",
            salaryMin: 2500,
            salaryMax: 4500,
            createdBy: hr.userId
        },
        {
            title: "Product Manager",
            companyName: "InnovateHire",
            description: "Lead the product vision for our recruitment platform. Work closely with stakeholders and engineering to deliver value.",
            requirements: [
                "3+ years of PM experience in SaaS",
                "Strong analytical and communication skills",
                "Experience with Agile/Scrum methodologies",
                "Customer-centric mindset"
            ],
            benefits: [
                "Competitive compensation package",
                "Collaborative and innovative culture",
                "Career growth opportunities",
                "Quarterly team building events"
            ],
            location: "Hanoi",
            workMode: "On-site",
            employmentType: "Full-time",
            salaryMin: 2000,
            salaryMax: 3500,
            createdBy: hr.userId
        },
        {
            title: "UX/UI Designer",
            companyName: "Creative Pulse",
            description: "Design beautiful and intuitive user interfaces for our recruitment dashboard. Focus on user experience and brand consistency.",
            requirements: [
                "Portfolio demonstrating strong UI/UX skills",
                "Proficiency in Figma or Adobe XD",
                "Understanding of responsive design principles",
                "Experience with design systems"
            ],
            benefits: [
                "Creative freedom and ownership",
                "Latest hardware and tools",
                "Annual retreat",
                "Insurance coverage"
            ],
            location: "Da Nang",
            workMode: "Remote",
            employmentType: "Contract",
            salaryMin: 1500,
            salaryMax: 2500,
            createdBy: hr.userId
        }
    ];

    // Clear all existing applications and jobs to ensure a fresh start
    console.log("Clearing existing applications and jobs...");
    await prisma.application.deleteMany({});
    await prisma.job.deleteMany({});

    for (const job of jobsData) {
        await prisma.job.create({
            data: job
        });
    }

    console.log(`${jobsData.length} sample jobs created.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
