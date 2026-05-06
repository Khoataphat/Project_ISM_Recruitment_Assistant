import { PrismaClient, user_role, skill_category, processing_status, hr_status, proficiency_level, experience_type } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const adapter = new PrismaPg(connectionString!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Setting up Hero Demo Flow (Safe Mode)...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ─── 1. SETUP HERO HR & COMPANY ─────────────────────────────────────────────
  console.log('Step 1: Setting up Hero HR (hr@test.com)...');
  
  // Company
  let company = await prisma.companies.findFirst({
    where: { id: '00000000-0000-0000-0000-000000000001' }
  });
  
  const companyData = {
    name: 'TechFlow Global',
    industry: 'Software Engineering & AI',
    description: 'A leading global tech company specializing in AI-driven recruitment solutions.',
  };

  if (!company) {
    company = await prisma.companies.create({
      data: { id: '00000000-0000-0000-0000-000000000001', ...companyData }
    });
  } else {
    company = await prisma.companies.update({
      where: { id: company.id },
      data: companyData
    });
  }

  // HR User
  let hrUser = await prisma.users.findUnique({ where: { email: 'hr@test.com' } });
  if (!hrUser) {
    hrUser = await prisma.users.create({
      data: {
        email: 'hr@test.com',
        full_name: 'Alex Miller (Hero HR)',
        password_hash: passwordHash,
        role: user_role.HR,
      }
    });
  } else {
    hrUser = await prisma.users.update({
      where: { id: hrUser.id },
      data: { role: user_role.HR, full_name: 'Alex Miller (Hero HR)' }
    });
  }

  // HR Profile
  let hrProfile = await prisma.hr_profiles.findUnique({ where: { user_id: hrUser.id } });
  if (!hrProfile) {
    hrProfile = await prisma.hr_profiles.create({
      data: {
        user_id: hrUser.id,
        company_id: company.id,
        position: 'Head of Talent',
      }
    });
  } else {
    hrProfile = await prisma.hr_profiles.update({
      where: { id: hrProfile.id },
      data: { company_id: company.id, position: 'Head of Talent' }
    });
  }

  // ─── 2. ENRICH HERO JOB ─────────────────────────────────────────────────────
  console.log('Step 2: Enriching Hero Job (Senior Backend Developer)...');
  
  // Safe Check-and-Create for Job
  let heroJob = await prisma.jobs.findFirst({
    where: {
      company_id: company.id,
      title: 'Senior Backend Developer'
    }
  });

  const jobData = {
    description: 'We are looking for a Senior Backend Developer to join our core AI pipeline team. You will be responsible for architecting scalable microservices and integrating complex AI models.',
    status: user_role.HR as any === 'HR' ? 'Open' : 'Open', // TS hack for enum mapping if needed
    location: 'Ho Chi Minh City (Hybrid)',
    salary_min: 2500,
    salary_max: 4500,
    salary_currency: 'USD',
  };

  if (!heroJob) {
    heroJob = await prisma.jobs.create({
      data: {
        company_id: company.id,
        hr_id: hrProfile.id,
        title: 'Senior Backend Developer',
        ...jobData,
        status: 'Open'
      }
    });
  } else {
    heroJob = await prisma.jobs.update({
      where: { id: heroJob.id },
      data: { ...jobData, status: 'Open' }
    });
  }

  // Job Skills - Check and Create
  const targetJobSkills = ['Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'TypeScript', 'Communication'];
  const allSkills = await prisma.skills.findMany();
  
  for (const skillName of targetJobSkills) {
    const skill = allSkills.find(s => s.skill_name === skillName);
    if (skill) {
      const existingJobSkill = await prisma.job_skills.findUnique({
        where: {
          job_id_skill_id: { job_id: heroJob.id, skill_id: skill.id }
        }
      });
      if (!existingJobSkill) {
        await prisma.job_skills.create({
          data: { job_id: heroJob.id, skill_id: skill.id, is_required: true }
        });
      }
    }
  }

  // ─── 3. SETUP HERO CANDIDATE ────────────────────────────────────────────────
  console.log('Step 3: Enriching Hero Candidate (candidate@test.com)...');
  
  let candUser = await prisma.users.findUnique({ where: { email: 'candidate@test.com' } });
  if (!candUser) {
    candUser = await prisma.users.create({
      data: {
        email: 'candidate@test.com',
        full_name: 'Jordan Smith (Hero Candidate)',
        password_hash: passwordHash,
        role: user_role.User,
      }
    });
  } else {
    candUser = await prisma.users.update({
      where: { id: candUser.id },
      data: { role: user_role.User, full_name: 'Jordan Smith (Hero Candidate)' }
    });
  }

  let candidate = await prisma.candidates.findUnique({ where: { user_id: candUser.id } });
  if (!candidate) {
    candidate = await prisma.candidates.create({
      data: {
        user_id: candUser.id,
        years_of_experience: 6,
        summary: 'Passionate Backend Engineer with expertise in building scalable cloud architectures and AI integrations.',
      }
    });
  } else {
    candidate = await prisma.candidates.update({
      where: { id: candidate.id },
      data: {
        years_of_experience: 6,
        summary: 'Passionate Backend Engineer with expertise in building scalable cloud architectures and AI integrations.',
      }
    });
  }

  // Education & Experience (Clear and Re-create is safest for mock data)
  await prisma.candidate_education.deleteMany({ where: { candidate_id: candidate.id } });
  await prisma.candidate_education.createMany({
    data: [
      {
        candidate_id: candidate.id,
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        major: 'Computer Science',
        start_year: 2014,
        end_year: 2018,
      },
      {
        candidate_id: candidate.id,
        institution: 'MIT',
        degree: 'Master of Engineering',
        major: 'Artificial Intelligence',
        start_year: 2018,
        end_year: 2020,
      }
    ]
  });

  await prisma.candidate_experiences.deleteMany({ where: { candidate_id: candidate.id } });
  await prisma.candidate_experiences.createMany({
    data: [
      {
        candidate_id: candidate.id,
        company: 'Google',
        title: 'Software Engineer',
        type: experience_type.Work,
        start_date: new Date('2020-06-01'),
        end_date: new Date('2023-01-01'),
        description: 'Worked on Google Cloud Platform infrastructure and distributed systems.',
      },
      {
        candidate_id: candidate.id,
        company: 'OpenAI',
        title: 'Senior Backend Engineer',
        type: experience_type.Work,
        start_date: new Date('2023-02-01'),
        is_current: true,
        description: 'Developing high-performance APIs for large-scale language model deployments.',
      }
    ]
  });

  // Candidate Skills
  const targetCandSkills = ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'];
  for (const sName of targetCandSkills) {
    const s = allSkills.find(sk => sk.skill_name === sName);
    if (s) {
      const existingCS = await prisma.candidate_skills.findUnique({
        where: { candidate_id_skill_id: { candidate_id: candidate.id, skill_id: s.id } }
      });
      if (!existingCS) {
        await prisma.candidate_skills.create({
          data: { candidate_id: candidate.id, skill_id: s.id, proficiency_level: proficiency_level.Expert }
        });
      } else {
        await prisma.candidate_skills.update({
          where: { candidate_id_skill_id: { candidate_id: candidate.id, skill_id: s.id } },
          data: { proficiency_level: proficiency_level.Expert }
        });
      }
    }
  }

  // ─── 4. CREATE DIVERSE APPLICATIONS ─────────────────────────────────────────
  console.log('Step 4: Creating Diverse Application Pool...');
  const allCandidates = await prisma.candidates.findMany({ include: { users: true } });

  const mockApps = [
    { score: 94.5, hr: hr_status.Shortlisted, status: processing_status.Analyzed },
    { score: 88.2, hr: hr_status.Interviewing, status: processing_status.Analyzed },
    { score: 82.0, hr: hr_status.Pending, status: processing_status.Analyzed },
    { score: 68.4, hr: hr_status.Pending, status: processing_status.Analyzed },
    { score: 65.0, hr: hr_status.Pending, status: processing_status.Analyzed },
    { score: 58.2, hr: hr_status.Pending, status: processing_status.Analyzed },
    { score: 55.0, hr: hr_status.Rejected, status: processing_status.Analyzed },
    { score: 52.1, hr: hr_status.Pending, status: processing_status.Analyzed },
    { score: 38.5, hr: hr_status.Rejected, status: processing_status.Analyzed },
    { score: 32.0, hr: hr_status.Rejected, status: processing_status.Analyzed },
    { score: 25.4, hr: hr_status.Rejected, status: processing_status.Analyzed },
    { score: 18.0, hr: hr_status.Rejected, status: processing_status.Analyzed },
  ];

  for (let i = 0; i < allCandidates.length; i++) {
    const c = allCandidates[i];
    const mock = mockApps[i % mockApps.length];
    
    const isHero = c.users.email === 'candidate@test.com';
    const finalScore = isHero ? 91.8 : mock.score;
    const finalHrStatus = isHero ? hr_status.Interviewing : mock.hr;

    const appData = {
      ai_matching_score: finalScore,
      hr_status: finalHrStatus,
      processing_status: mock.status,
      ai_summary: {
        overall: isHero ? "Exceptional candidate with deep expertise in cloud-native architectures. Strong match for our Senior Backend role." : "Candidate shows moderate alignment with technical requirements. Soft skills are a plus.",
        strengths: isHero ? ["Cloud Architecture", "AI Integration", "Leadership"] : ["Communication", "Basic Node.js"],
        improvements: isHero ? ["Could benefit from more Go experience"] : ["Needs deeper PostgreSQL knowledge"]
      },
      skills_radar: {
        "Technical": Math.floor(finalScore * 0.95),
        "Experience": Math.floor(finalScore * 0.9),
        "Soft Skills": 85,
        "AI Fit": Math.floor(finalScore * 0.85)
      }
    };

    const existingApp = await prisma.applications.findUnique({
      where: {
        applications_unique_per_job: { job_id: heroJob.id, candidate_id: c.id }
      }
    });

    if (existingApp) {
      await prisma.applications.update({
        where: { id: existingApp.id },
        data: appData
      });
    } else {
      await prisma.applications.create({
        data: {
          job_id: heroJob.id,
          candidate_id: c.id,
          cv_url: 'https://example.com/demo-cv.pdf',
          ...appData
        }
      });
    }
  }

  console.log(`✅ Success! Hero Flow setup complete (Safe Mode).`);
  console.log(`- HR Login: hr@test.com / password123`);
  console.log(`- Candidate Login: candidate@test.com / password123`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
