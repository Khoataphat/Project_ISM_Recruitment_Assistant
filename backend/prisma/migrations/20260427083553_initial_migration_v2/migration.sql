CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('HR', 'User');

-- CreateEnum
CREATE TYPE "job_status" AS ENUM ('Draft', 'Open', 'Closed');

-- CreateEnum
CREATE TYPE "job_type" AS ENUM ('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship');

-- CreateEnum
CREATE TYPE "job_level" AS ENUM ('Intern', 'Fresher', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Manager', 'Director');

-- CreateEnum
CREATE TYPE "skill_category" AS ENUM ('Technical', 'Soft Skill', 'Language');

-- CreateEnum
CREATE TYPE "proficiency_level" AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');

-- CreateEnum
CREATE TYPE "processing_status" AS ENUM ('Pending', 'Processing', 'Analyzed', 'Failed');

-- CreateEnum
CREATE TYPE "hr_status" AS ENUM ('Pending', 'Shortlisted', 'Interviewing', 'Offered', 'Accepted', 'Rejected');

-- CreateEnum
CREATE TYPE "experience_type" AS ENUM ('Work', 'Internship', 'Project', 'Volunteer', 'Extracurricular');

-- CreateEnum
CREATE TYPE "company_size" AS ENUM ('1-10', '11-50', '51-200', '201-500', '500+');

-- CreateEnum
CREATE TYPE "company_type" AS ENUM ('Startup', 'SME', 'Corporate', 'MNC', 'NGO', 'Government');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('application_update', 'job_match', 'system', 'career_suggestion');

-- CreateEnum
CREATE TYPE "assessment_source" AS ENUM ('Self', 'AI_Test', 'Third_Party');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "avatar_url" VARCHAR(500),
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "portfolio_url" VARCHAR(500),
    "years_of_experience" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "profile_embedding" vector(1536),
    "career_interests" TEXT[],
    "target_job_titles" TEXT[],
    "preferred_locations" TEXT[],
    "expected_salary_min" INTEGER,
    "expected_salary_max" INTEGER,
    "default_resume_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(100),
    "headquarters_location" VARCHAR(255),
    "website_url" VARCHAR(500),
    "logo_url" VARCHAR(500),
    "cover_image_url" VARCHAR(500),
    "description" TEXT,
    "company_size" "company_size",
    "company_type" "company_type",
    "founded_year" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "employee_id" VARCHAR(50),
    "department_name" VARCHAR(100),
    "position" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_education" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "institution" VARCHAR(255) NOT NULL,
    "degree" VARCHAR(100),
    "major" VARCHAR(150),
    "gpa" DECIMAL(3,2),
    "start_year" INTEGER,
    "end_year" INTEGER,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_experiences" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "company" VARCHAR(255),
    "title" VARCHAR(255) NOT NULL,
    "type" "experience_type" NOT NULL DEFAULT 'Work',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "skill_name" VARCHAR(100) NOT NULL,
    "category" "skill_category" NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "hr_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "level" "job_level" NOT NULL DEFAULT 'Mid-Level',
    "type" "job_type" NOT NULL DEFAULT 'Full-time',
    "location" VARCHAR(255),
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "salary_currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
    "is_salary_visible" BOOLEAN NOT NULL DEFAULT true,
    "application_deadline" DATE,
    "headcount" INTEGER NOT NULL DEFAULT 1,
    "min_experience_years" INTEGER NOT NULL DEFAULT 0,
    "education_requirement" VARCHAR(100),
    "benefits" TEXT[],
    "application_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "job_embedding" vector(1536),
    "status" "job_status" NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_skills" (
    "job_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "job_skills_pkey" PRIMARY KEY ("job_id","skill_id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "cv_url" VARCHAR(500) NOT NULL,
    "cv_storage_path" VARCHAR(500),
    "cover_letter" TEXT,
    "processing_status" "processing_status" NOT NULL DEFAULT 'Pending',
    "ai_matching_score" DECIMAL(5,2),
    "skills_radar" JSONB NOT NULL DEFAULT '{}',
    "ai_summary" JSONB NOT NULL DEFAULT '{}',
    "hr_status" "hr_status" NOT NULL DEFAULT 'Pending',
    "hr_note" TEXT,
    "viewed_by_hr_at" TIMESTAMP(3),
    "is_withdrawn" BOOLEAN NOT NULL DEFAULT false,
    "withdrawn_at" TIMESTAMP(3),
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "interview_video_url" TEXT,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_skills" (
    "candidate_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "proficiency_level" "proficiency_level" NOT NULL,

    CONSTRAINT "candidate_skills_pkey" PRIMARY KEY ("candidate_id","skill_id")
);

-- CreateTable
CREATE TABLE "saved_jobs" (
    "candidate_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("candidate_id","job_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "ref_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_career_suggestions" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "suggested_job_titles" TEXT[],
    "suggested_skills" TEXT[],
    "career_path_summary" TEXT,
    "reasoning" JSONB NOT NULL DEFAULT '{}',
    "model_version" VARCHAR(50),
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "skill_gaps" TEXT[],

    CONSTRAINT "ai_career_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_assessments" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "source" "assessment_source" NOT NULL DEFAULT 'Self',
    "assessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_user_id_key" ON "candidates"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_profiles_user_id_key" ON "hr_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_profiles_employee_id_key" ON "hr_profiles"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "skills_skill_name_key" ON "skills"("skill_name");

-- CreateIndex
CREATE UNIQUE INDEX "applications_job_id_candidate_id_key" ON "applications"("job_id", "candidate_id");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_profiles" ADD CONSTRAINT "hr_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_profiles" ADD CONSTRAINT "hr_profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_education" ADD CONSTRAINT "candidate_education_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_experiences" ADD CONSTRAINT "candidate_experiences_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_hr_id_fkey" FOREIGN KEY ("hr_id") REFERENCES "hr_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_career_suggestions" ADD CONSTRAINT "ai_career_suggestions_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_assessments" ADD CONSTRAINT "skill_assessments_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_assessments" ADD CONSTRAINT "skill_assessments_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
