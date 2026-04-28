import * as dotenv from 'dotenv';
dotenv.config();

import { job_level, user_role, job_status } from '@prisma/client';
import * as xlsx from 'xlsx';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import { prisma } from './prisma.service';

function mapExperienceToLevel(expStr: string): job_level {
  if (!expStr) return job_level.Mid_Level;
  const s = expStr.toLowerCase();
  if (s.includes('không') || s.includes('no exp') || s.includes('0')) return job_level.Intern;
  if (s.includes('1') || s.includes('2')) return job_level.Junior;
  if (s.includes('3') || s.includes('4')) return job_level.Senior;
  if (s.includes('5') || s.includes('6') || s.includes('7')) return job_level.Lead;
  if (s.includes('8') || s.includes('manager') || s.includes('quản lý')) return job_level.Manager;
  return job_level.Mid_Level;
}

function parseSalary(currencyStr: string): { min: number | null, max: number | null } {
  if (!currencyStr) return { min: null, max: null };
  const s = currencyStr.toLowerCase();
  if (s.includes('thỏa thuận') || s.includes('thỏa') || s.includes('thoả')) {
    return { min: null, max: null };
  }
  const regex = /(\d+(?:[,.]\d+)?)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(s)) !== null) {
    matches.push(parseFloat(match[1].replace(',', '.')));
  }
  let multiplier = 1;
  if (s.includes('triệu')) multiplier = 1_000_000;
  if (s.includes('tỷ')) multiplier = 1_000_000_000;

  if (matches.length === 2) {
    return { min: Math.round(matches[0] * multiplier), max: Math.round(matches[1] * multiplier) };
  } else if (matches.length === 1) {
    if (s.includes('lên đến') || s.includes('upto') || s.includes('up to')) {
      return { min: null, max: Math.round(matches[0] * multiplier) };
    } else if (s.includes('trên') || s.includes('hơn')) {
      return { min: Math.round(matches[0] * multiplier), max: null };
    } else {
      return { min: Math.round(matches[0] * multiplier), max: Math.round(matches[0] * multiplier) };
    }
  }
  return { min: null, max: null };
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(Date.UTC(year, month, day));
  }
  return null;
}

function parseBenefits(benefitsStr: string): string[] {
  if (!benefitsStr) return [];
  return benefitsStr
    .split(/\n|<br>|<br\/>|•|-|\*/g)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

async function main() {
  console.log('🚀 Starting strict referential seed process...');
  
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Company First
  console.log('Step 1: Creating Main Company...');
  const company = await prisma.companies.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' }, // Static UUID for deterministic seed
    update: {
        name: 'Editorial Enterprise Recruitment',
        description: 'Leading technology recruitment firm specialized in AI and data science.',
        industry: 'Information Technology',
        website_url: 'https://editorial-recruitment.example.com',
        logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmrWT5hOOytaPJF8g5Hg4lP0mNxMaL3NyyHm_hv6YAprmcgngacokNZqQIVIYY_piu4ZjkwwVDDV8uGqjwnrzLIx8BNspsgRMPu-RN7-Q09SLjvzMO5kChuj5XF4ScN2A1JXvWSopmh8wWdc9B-or1gCUTAwzaGkWv3W0VBPlU6xOxvysUw6yPp_K3c1_t-CdY-WCIt-IMm-YA05wboIJmzi5bH_jOMcKIMaLbwYMyrurRxKqSUOgRe4Oc0OOqsE2AGgWS4ygCew',
    },
    create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Editorial Enterprise Recruitment',
        description: 'Leading technology recruitment firm specialized in AI and data science.',
        industry: 'Information Technology',
        website_url: 'https://editorial-recruitment.example.com',
        logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmrWT5hOOytaPJF8g5Hg4lP0mNxMaL3NyyHm_hv6YAprmcgngacokNZqQIVIYY_piu4ZjkwwVDDV8uGqjwnrzLIx8BNspsgRMPu-RN7-Q09SLjvzMO5kChuj5XF4ScN2A1JXvWSopmh8wWdc9B-or1gCUTAwzaGkWv3W0VBPlU6xOxvysUw6yPp_K3c1_t-CdY-WCIt-IMm-YA05wboIJmzi5bH_jOMcKIMaLbwYMyrurRxKqSUOgRe4Oc0OOqsE2AGgWS4ygCew',
    }
  });

  // 2. Create HR User & Profile
  console.log('Step 2: Creating HR User & Profile...');
  const hrUser = await prisma.users.upsert({
    where: { email: 'hr@test.com' },
    update: {
      full_name: 'HR Manager',
      password_hash: passwordHash,
      role: user_role.HR,
    },
    create: {
      full_name: 'HR Manager',
      email: 'hr@test.com',
      password_hash: passwordHash,
      role: user_role.HR,
    }
  });

  const hrProfile = await prisma.hr_profiles.upsert({
    where: { user_id: hrUser.id },
    update: {
      company_id: company.id,
      position: 'HR Manager',
    },
    create: {
      user_id: hrUser.id,
      company_id: company.id,
      position: 'HR Manager',
    }
  });

  // 3. Create Candidate User & Profile
  console.log('Step 3: Creating Candidate User & Profile...');
  const candUser = await prisma.users.upsert({
    where: { email: 'candidate@test.com' },
    update: {
      full_name: 'John Doe',
      password_hash: passwordHash,
      role: user_role.User,
    },
    create: {
      full_name: 'John Doe',
      email: 'candidate@test.com',
      password_hash: passwordHash,
      role: user_role.User,
    }
  });

  await prisma.candidates.upsert({
    where: { user_id: candUser.id },
    update: {
      years_of_experience: 2,
      default_resume_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    create: {
      user_id: candUser.id,
      years_of_experience: 2,
      default_resume_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    }
  });

  // 4. Upsert Jobs from CSV
  console.log('Step 4: Upserting Jobs from CSV...');
  const filePath = path.join(__dirname, '../../database/topcv-vn-2026-04-25-5.xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json<any>(sheet);

  // ── Phase A: Deduplicate rows from CSV ──────────────────────────────────────
  // Keep only the first occurrence of each unique title from the spreadsheet
  const seenTitles = new Set<string>();
  const uniqueRows = data.filter((row: any) => {
    const t = (row['jobs : title'] || row['title'] || '').trim();
    if (!t || seenTitles.has(t)) return false;
    seenTitles.add(t);
    return true;
  });
  console.log(`📋 CSV: ${data.length} total rows → ${uniqueRows.length} unique titles.`);

  // ── Phase B: Clean existing DB duplicates ───────────────────────────────────
  // For every (title, company_id) group that has more than 1 row in the DB,
  // keep the OLDEST record and delete the rest (avoids migration requirement).
  console.log('🧹 Cleaning duplicate jobs in database...');
  const allJobs = await prisma.jobs.findMany({
    where: { company_id: company.id },
    select: { id: true, title: true, created_at: true },
    orderBy: { created_at: 'asc' },
  });

  const keepIds = new Map<string, string>(); // title → id of the one to keep
  const deleteIds: string[] = [];

  for (const job of allJobs) {
    const key = job.title.trim();
    if (!keepIds.has(key)) {
      keepIds.set(key, job.id); // keep the oldest
    } else {
      deleteIds.push(job.id);   // mark the rest for deletion
    }
  }

  if (deleteIds.length > 0) {
    await prisma.jobs.deleteMany({ where: { id: { in: deleteIds } } });
    console.log(`🗑️  Deleted ${deleteIds.length} duplicate job records.`);
  } else {
    console.log('✅ No duplicate jobs found in DB.');
  }

  // ── Phase C: Upsert 89 canonical jobs ───────────────────────────────────────
  // findFirst → update if exists, create if not (manual upsert, no schema
  // migration required, 100% idempotent on repeated runs).
  let created = 0;
  let updated = 0;

  for (const row of uniqueRows) {
    const jobTitle = (row['jobs : title'] || row['title']).trim();
    const level    = mapExperienceToLevel(row['experience_level']);
    const salary   = parseSalary(row['currency']);
    const deadline = parseDate(row['totalJobOpenings']);
    const benefits = parseBenefits(row['jobBenefits']);
    const description = `**Yêu cầu công việc:**\n${row['candidate_requirements'] || ''}\n\n**Tổng quan:**\n${row['employerOverview'] || ''}`;

    const jobData = {
      hr_id:                hrProfile.id,
      level,
      description,
      location:             row['addressRegion'] || 'Remote',
      salary_min:           salary.min,
      salary_max:           salary.max,
      application_deadline: deadline,
      benefits,
      status:               job_status.Open,
    };

    const existing = await prisma.jobs.findFirst({
      where: { title: jobTitle, company_id: company.id },
      select: { id: true },
    });

    if (existing) {
      await prisma.jobs.update({ where: { id: existing.id }, data: jobData });
      updated++;
    } else {
      await prisma.jobs.create({
        data: { title: jobTitle, company_id: company.id, ...jobData },
      });
      created++;
    }
  }

  const totalAfter = await prisma.jobs.count({ where: { company_id: company.id } });
  console.log(`✅ Seed done! Created: ${created} | Updated: ${updated} | Total jobs in DB: ${totalAfter}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

