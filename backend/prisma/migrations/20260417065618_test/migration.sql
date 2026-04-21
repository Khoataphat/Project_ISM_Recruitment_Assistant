/*
  Warnings:

  - The `Role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('hr', 'candidate');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "VerificationCode" VARCHAR(6),
ADD COLUMN     "VerificationExp" TIMESTAMP(3),
DROP COLUMN "Role",
ADD COLUMN     "Role" "Role" NOT NULL DEFAULT 'candidate';

-- CreateTable
CREATE TABLE "job" (
    "JobId" SERIAL NOT NULL,
    "Title" VARCHAR(256) NOT NULL,
    "Description" TEXT NOT NULL,
    "Status" VARCHAR(32) NOT NULL DEFAULT 'open',
    "CreatedBy" INTEGER NOT NULL,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" INTEGER NOT NULL DEFAULT 1,
    "UpdatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_pkey" PRIMARY KEY ("JobId")
);

-- CreateTable
CREATE TABLE "application" (
    "ApplicationId" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "JobId" INTEGER NOT NULL,
    "ResumeUrl" VARCHAR(512) NOT NULL,
    "CoverLetter" TEXT,
    "Status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "SubmittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ReviewedAt" TIMESTAMP(3),
    "ReviewedBy" INTEGER,

    CONSTRAINT "application_pkey" PRIMARY KEY ("ApplicationId")
);

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "user"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_JobId_fkey" FOREIGN KEY ("JobId") REFERENCES "job"("JobId") ON DELETE RESTRICT ON UPDATE CASCADE;
