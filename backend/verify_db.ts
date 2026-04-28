import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from './prisma/prisma.service';

async function main() {
  console.log('Fetching database stats...');

  const [userCount, companyCount, jobCount, candidateCount, hrProfileCount] = await Promise.all([
    prisma.users.count(),
    prisma.companies.count(),
    prisma.jobs.count(),
    prisma.candidates.count(),
    prisma.hr_profiles.count(),
  ]);

  console.log('--- Database Record Counts ---');
  console.log(`Users: ${userCount}`);
  console.log(`Candidates: ${candidateCount}`);
  console.log(`HR Profiles: ${hrProfileCount}`);
  console.log(`Companies: ${companyCount}`);
  console.log(`Jobs: ${jobCount}`);
  console.log('------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
