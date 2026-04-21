-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM (
    'pending',
    'shortlisted',
    'interviewing',
    'offered',
    'accepted',
    'rejected',
    'withdrawn'
);

-- CreateEnum
CREATE TYPE "AiProcessingStatus" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);

-- AlterTable
ALTER TABLE "job"
ADD COLUMN "SalaryCurrency" VARCHAR(10) NOT NULL DEFAULT 'VND',
ADD COLUMN "IsSalaryVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "Headcount" INTEGER DEFAULT 1,
ADD COLUMN "MinExperienceYears" INTEGER DEFAULT 0,
ADD COLUMN "EducationRequirement" VARCHAR(100),
ADD COLUMN "ApplicationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "ViewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "application"
ADD COLUMN "AiSummary" TEXT,
ADD COLUMN "AiExplanation" JSONB,
ADD COLUMN "SkillsRadar" JSONB,
ADD COLUMN "RawAiResponse" JSONB,
ADD COLUMN "HrNote" TEXT,
ADD COLUMN "ViewedByHrAt" TIMESTAMP(3),
ADD COLUMN "IsWithdrawn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "WithdrawnAt" TIMESTAMP(3);

-- Preserve existing application statuses while converting to enums.
ALTER TABLE "application" ALTER COLUMN "Status" DROP DEFAULT;
ALTER TABLE "application"
ALTER COLUMN "Status" TYPE "ApplicationStatus"
USING (
    CASE
        WHEN "Status" = 'pending' THEN 'pending'::"ApplicationStatus"
        WHEN "Status" = 'shortlisted' THEN 'shortlisted'::"ApplicationStatus"
        WHEN "Status" = 'interviewing' THEN 'interviewing'::"ApplicationStatus"
        WHEN "Status" = 'offered' THEN 'offered'::"ApplicationStatus"
        WHEN "Status" = 'accepted' THEN 'accepted'::"ApplicationStatus"
        WHEN "Status" = 'rejected' THEN 'rejected'::"ApplicationStatus"
        WHEN "Status" = 'withdrawn' THEN 'withdrawn'::"ApplicationStatus"
        ELSE 'pending'::"ApplicationStatus"
    END
);
ALTER TABLE "application" ALTER COLUMN "Status" SET DEFAULT 'pending';

-- Preserve existing AI statuses while converting to enums.
ALTER TABLE "application" ALTER COLUMN "AiStatus" DROP DEFAULT;
ALTER TABLE "application"
ALTER COLUMN "AiStatus" TYPE "AiProcessingStatus"
USING (
    CASE
        WHEN "AiStatus" = 'pending' THEN 'pending'::"AiProcessingStatus"
        WHEN "AiStatus" = 'processing' THEN 'processing'::"AiProcessingStatus"
        WHEN "AiStatus" = 'completed' THEN 'completed'::"AiProcessingStatus"
        WHEN "AiStatus" = 'failed' THEN 'failed'::"AiProcessingStatus"
        ELSE 'pending'::"AiProcessingStatus"
    END
);
ALTER TABLE "application" ALTER COLUMN "AiStatus" SET DEFAULT 'pending';

-- CreateTable
CREATE TABLE "candidate_profile" (
    "CandidateProfileId" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "EducationSummary" TEXT,
    "YearsOfExperience" INTEGER,
    "Summary" TEXT,
    "CareerInterests" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "PreferredLocations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_profile_pkey" PRIMARY KEY ("CandidateProfileId")
);

-- CreateTable
CREATE TABLE "candidate_education" (
    "CandidateEducationId" SERIAL NOT NULL,
    "CandidateProfileId" INTEGER NOT NULL,
    "Institution" VARCHAR(255),
    "Degree" VARCHAR(100),
    "Major" VARCHAR(150),
    "EducationText" TEXT,
    "StartYear" INTEGER,
    "EndYear" INTEGER,
    "GPA" DOUBLE PRECISION,
    "IsCurrent" BOOLEAN NOT NULL DEFAULT false,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_education_pkey" PRIMARY KEY ("CandidateEducationId")
);

-- CreateTable
CREATE TABLE "candidate_skill" (
    "CandidateSkillId" SERIAL NOT NULL,
    "CandidateProfileId" INTEGER NOT NULL,
    "Name" VARCHAR(128) NOT NULL,
    "Source" VARCHAR(32),
    "Confidence" DOUBLE PRECISION,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_skill_pkey" PRIMARY KEY ("CandidateSkillId")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profile_UserId_key" ON "candidate_profile"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_skill_profile_name_key" ON "candidate_skill"("CandidateProfileId", "Name");

-- AddForeignKey
ALTER TABLE "candidate_profile"
ADD CONSTRAINT "candidate_profile_UserId_fkey"
FOREIGN KEY ("UserId") REFERENCES "user"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_education"
ADD CONSTRAINT "candidate_education_CandidateProfileId_fkey"
FOREIGN KEY ("CandidateProfileId") REFERENCES "candidate_profile"("CandidateProfileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skill"
ADD CONSTRAINT "candidate_skill_CandidateProfileId_fkey"
FOREIGN KEY ("CandidateProfileId") REFERENCES "candidate_profile"("CandidateProfileId") ON DELETE RESTRICT ON UPDATE CASCADE;
