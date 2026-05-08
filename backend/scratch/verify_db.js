const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.users.count();
  const companyCount = await prisma.companies.count();
  const jobCount = await prisma.jobs.count();
  const candidateCount = await prisma.candidates.count();
  const hrProfileCount = await prisma.hr_profiles.count();

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
