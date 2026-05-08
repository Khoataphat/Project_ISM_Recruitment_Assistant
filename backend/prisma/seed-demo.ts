import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from './prisma.service';
import { user_role, skill_category } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  console.log('🚀 Starting Demo Seed Process...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Skills
  console.log('Step 1: Seeding IT Skills...');
  const skillsData = [
    // Technical Skills
    { skill_name: 'React', category: skill_category.Technical },
    { skill_name: 'Node.js', category: skill_category.Technical },
    { skill_name: 'Python', category: skill_category.Technical },
    { skill_name: 'TypeScript', category: skill_category.Technical },
    { skill_name: 'Java', category: skill_category.Technical },
    { skill_name: 'C++', category: skill_category.Technical },
    { skill_name: 'Go', category: skill_category.Technical },
    { skill_name: 'Docker', category: skill_category.Technical },
    { skill_name: 'Kubernetes', category: skill_category.Technical },
    { skill_name: 'AWS', category: skill_category.Technical },
    { skill_name: 'GCP', category: skill_category.Technical },
    { skill_name: 'Azure', category: skill_category.Technical },
    { skill_name: 'PostgreSQL', category: skill_category.Technical },
    { skill_name: 'MongoDB', category: skill_category.Technical },
    { skill_name: 'Redis', category: skill_category.Technical },
    { skill_name: 'GraphQL', category: skill_category.Technical },
    { skill_name: 'Flutter', category: skill_category.Technical },
    { skill_name: 'Swift', category: skill_category.Technical },
    { skill_name: 'Kotlin', category: skill_category.Technical },
    { skill_name: 'Jenkins', category: skill_category.Technical },
    { skill_name: 'Tailwind CSS', category: skill_category.Technical },
    { skill_name: 'Figma', category: skill_category.Technical },
    
    // Soft Skills
    { skill_name: 'Communication', category: skill_category.Soft_Skill },
    { skill_name: 'Leadership', category: skill_category.Soft_Skill },
    { skill_name: 'Problem Solving', category: skill_category.Soft_Skill },
    { skill_name: 'Teamwork', category: skill_category.Soft_Skill },
    
    // Languages
    { skill_name: 'English', category: skill_category.Language },
    { skill_name: 'Vietnamese', category: skill_category.Language },
    { skill_name: 'Japanese', category: skill_category.Language },
  ];

  for (const skill of skillsData) {
    await prisma.skills.upsert({
      where: { skill_name: skill.skill_name },
      update: { category: skill.category },
      create: skill,
    });
  }
  console.log(`✅ Seeded ${skillsData.length} skills.`);

  // 2. Fetch 3 Existing Companies
  console.log('Step 2: Fetching 3 companies for HR assignment...');
  const companies = await prisma.companies.findMany({
    take: 3,
    orderBy: { name: 'asc' },
  });

  if (companies.length < 3) {
    console.error('❌ Not enough companies in database to assign 3 HRs. Please run the main seed first.');
    return;
  }

  // 3. Create 3 HR Users & Profiles
  console.log('Step 3: Creating 3 HR Users...');
  const hrUsersData = [
    {
      email: 'hr.tech@example.com',
      full_name: 'Nguyen Van A (Tech HR)',
      position: 'Senior Talent Acquisition',
      company_id: companies[0].id,
      company_name: companies[0].name,
    },
    {
      email: 'hr.creative@example.com',
      full_name: 'Tran Thi B (Creative HR)',
      position: 'HR Business Partner',
      company_id: companies[1].id,
      company_name: companies[1].name,
    },
    {
      email: 'hr.global@example.com',
      full_name: 'Le Van C (Global HR)',
      position: 'Recruitment Manager',
      company_id: companies[2].id,
      company_name: companies[2].name,
    },
  ];

  for (const hrData of hrUsersData) {
    const user = await prisma.users.upsert({
      where: { email: hrData.email },
      update: {
        full_name: hrData.full_name,
        role: user_role.HR,
      },
      create: {
        email: hrData.email,
        full_name: hrData.full_name,
        password_hash: passwordHash,
        role: user_role.HR,
      },
    });

    await prisma.hr_profiles.upsert({
      where: { user_id: user.id },
      update: {
        company_id: hrData.company_id,
        position: hrData.position,
      },
      create: {
        user_id: user.id,
        company_id: hrData.company_id,
        position: hrData.position,
      },
    });
    console.log(`✅ HR ${hrData.full_name} linked to company: ${hrData.company_name}`);
  }

  // 4. Create 10 Realistic Candidates
  console.log('Step 4: Creating 10 Realistic Candidates...');
  
  // Helper to get skill IDs
  const allSkills = await prisma.skills.findMany();
  const getSkillId = (name: string) => allSkills.find(s => s.skill_name === name)?.id;

  const candidateArchetypes = [
    // 3 Frontend Devs
    {
      full_name: 'Nguyễn Minh Tuấn',
      email: 'tuan.nguyen@example.com',
      summary: 'Frontend Developer đam mê xây dựng trải nghiệm người dùng tuyệt vời với React và TypeScript.',
      years: 3,
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma', 'English']
    },
    {
      full_name: 'Lê Thị Mai',
      email: 'mai.le@example.com',
      summary: 'Junior Frontend Engineer với nền tảng vững chắc về HTML/CSS và JavaScript.',
      years: 1,
      skills: ['React', 'TypeScript', 'English', 'Communication']
    },
    {
      full_name: 'Phạm Hoàng Nam',
      email: 'nam.pham@example.com',
      summary: 'Senior Frontend Developer với hơn 5 năm kinh nghiệm tối ưu hóa hiệu năng ứng dụng web.',
      years: 5,
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Docker', 'English']
    },
    // 3 Backend Devs
    {
      full_name: 'Trần Văn Hùng',
      email: 'hung.tran@example.com',
      summary: 'Backend Developer chuyên về Node.js và hệ thống phân tán.',
      years: 4,
      skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Redis']
    },
    {
      full_name: 'Vũ Đức Anh',
      email: 'anh.vu@example.com',
      summary: 'Python Developer yêu thích việc xây dựng API hiệu suất cao và xử lý dữ liệu.',
      years: 2,
      skills: ['Python', 'PostgreSQL', 'Docker', 'GraphQL', 'Problem Solving']
    },
    {
      full_name: 'Đặng Minh Quang',
      email: 'quang.dang@example.com',
      summary: 'Software Engineer tập trung vào kiến trúc microservices và CI/CD.',
      years: 3,
      skills: ['Node.js', 'Go', 'Kubernetes', 'Jenkins', 'PostgreSQL']
    },
    // 2 Data Scientists
    {
      full_name: 'Hoàng Thị Lan',
      email: 'lan.hoang@example.com',
      summary: 'Data Scientist với kinh nghiệm phân tích dữ liệu lớn và xây dựng mô hình dự báo.',
      years: 3,
      skills: ['Python', 'PostgreSQL', 'Problem Solving', 'English', 'Communication']
    },
    {
      full_name: 'Bùi Thế Hiển',
      email: 'hien.bui@example.com',
      summary: 'Nghiên cứu viên AI với thế mạnh về xử lý ngôn ngữ tự nhiên.',
      years: 2,
      skills: ['Python', 'PostgreSQL', 'Problem Solving', 'English', 'Teamwork']
    },
    // 2 UI/UX Designers
    {
      full_name: 'Ngô Bảo Ngọc',
      email: 'ngoc.ngo@example.com',
      summary: 'UI/UX Designer tập trung vào thiết kế lấy người dùng làm trung tâm.',
      years: 4,
      skills: ['Figma', 'Communication', 'Teamwork', 'English', 'React']
    },
    {
      full_name: 'Đỗ Kim Chi',
      email: 'chi.do@example.com',
      summary: 'Designer trẻ đầy sáng tạo với tư duy sản phẩm nhạy bén.',
      years: 1,
      skills: ['Figma', 'Communication', 'English', 'Problem Solving']
    }
  ];

  for (const cand of candidateArchetypes) {
    const user = await prisma.users.upsert({
      where: { email: cand.email },
      update: {
        full_name: cand.full_name,
        role: user_role.User,
      },
      create: {
        email: cand.email,
        full_name: cand.full_name,
        password_hash: passwordHash,
        role: user_role.User,
      },
    });

    const candidate = await prisma.candidates.upsert({
      where: { user_id: user.id },
      update: {
        summary: cand.summary,
        years_of_experience: cand.years,
      },
      create: {
        user_id: user.id,
        summary: cand.summary,
        years_of_experience: cand.years,
      },
    });

    // Seed candidate skills
    for (const skillName of cand.skills) {
      const skillId = getSkillId(skillName);
      if (skillId) {
        await prisma.candidate_skills.upsert({
          where: {
            candidate_id_skill_id: {
              candidate_id: candidate.id,
              skill_id: skillId,
            },
          },
          update: { proficiency_level: 'Advanced' },
          create: {
            candidate_id: candidate.id,
            skill_id: skillId,
            proficiency_level: 'Advanced',
          },
        });
      }
    }
    console.log(`✅ Candidate ${cand.full_name} created with ${cand.skills.length} skills.`);
  }

  // 5. Create 25 Mock Applications
  console.log('Step 5: Creating 25 Mock Applications...');
  
  // Fetch candidates and jobs from the 3 HR companies
  const dbCandidates = await prisma.candidates.findMany({
    include: { users: { select: { full_name: true, email: true } } }
  });
  
  const hrCompanies = await prisma.companies.findMany({
    where: { name: { in: ['AS SOLUTIONS', 'CELLPHONES', 'Công ty cổ phần Aequitas'] } },
    include: { jobs: true }
  });

  const allJobs = hrCompanies.flatMap(c => c.jobs);

  if (allJobs.length === 0) {
    console.error('❌ No jobs found for the selected companies. Please ensure the main seed has run.');
    return;
  }

  const applicationData = [
    // High Matches (> 80%)
    { score: 92.5, status: 'Analyzed', hr: 'Shortlisted', summary: 'Ứng viên xuất sắc với nền tảng kỹ thuật cực kỳ vững chắc, phù hợp hoàn hảo với yêu cầu công nghệ của dự án.' },
    { score: 88.0, status: 'Analyzed', hr: 'Interviewing', summary: 'Kinh nghiệm thực tế phong phú, tư duy giải quyết vấn đề tốt. Rất tiềm năng cho vị trí này.' },
    { score: 85.2, status: 'Analyzed', hr: 'Pending', summary: 'Sở hữu bộ kỹ năng hiện đại và thái độ làm việc chuyên nghiệp. Điểm số kỹ thuật rất cao.' },
    { score: 81.5, status: 'Analyzed', hr: 'Shortlisted', summary: 'Ứng viên có tiềm năng phát triển tốt, kỹ năng mềm và ngoại ngữ là điểm cộng lớn.' },
    
    // Average Matches (50-70%)
    { score: 68.4, status: 'Analyzed', hr: 'Pending', summary: 'Đáp ứng được hầu hết các yêu cầu cơ bản, tuy nhiên cần cải thiện thêm về kinh nghiệm thực tế với các tool mới.' },
    { score: 62.0, status: 'Analyzed', hr: 'Pending', summary: 'Nền tảng khá ổn nhưng thiếu một số kỹ năng chuyên sâu mà dự án đang yêu cầu.' },
    { score: 55.8, status: 'Analyzed', hr: 'Rejected', summary: 'Kỹ năng chưa thực sự nổi bật so với các ứng viên khác trong cùng đợt tuyển dụng.' },
    { score: 51.0, status: 'Analyzed', hr: 'Pending', summary: 'Phù hợp cho vị trí Fresher, cần được đào tạo thêm về quy trình làm việc chuyên nghiệp.' },
    
    // Poor Matches (< 40%)
    { score: 35.5, status: 'Analyzed', hr: 'Rejected', summary: 'Kỹ năng hiện tại chưa phù hợp với yêu cầu của vị trí này. Thiếu hụt nhiều công nghệ core.' },
    { score: 22.0, status: 'Analyzed', hr: 'Rejected', summary: 'Hồ sơ không tương thích với mô tả công việc. Không có kinh nghiệm liên quan.' },
  ];

  let appCount = 0;
  for (let i = 0; i < 25; i++) {
    const candidate = dbCandidates[i % dbCandidates.length];
    const job = allJobs[i % allJobs.length];
    
    // Pick a mock data profile or use a default one
    const mockProfile = applicationData[i % applicationData.length];
    
    // Randomize statuses for non-analyzed ones
    let processingStatus: any = 'Analyzed';
    let hrStatus: any = mockProfile.hr;
    
    if (i > 20) processingStatus = 'Pending';
    if (i === 19) processingStatus = 'Failed';

    try {
      await prisma.applications.upsert({
        where: {
          applications_unique_per_job: {
            job_id: job.id,
            candidate_id: candidate.id,
          },
        },
        update: {},
        create: {
          job_id: job.id,
          candidate_id: candidate.id,
          cv_url: 'https://example.com/mock-cv.pdf',
          processing_status: processingStatus,
          hr_status: hrStatus as any,
          ai_matching_score: mockProfile.score,
          ai_summary: {
            overall: mockProfile.summary,
            strengths: ['Technical Depth', 'Communication', 'Quick Learning'],
            improvements: ['System Design', 'Team Management']
          },
          skills_radar: {
            "Technical": Math.floor(mockProfile.score * 0.9),
            "Experience": Math.floor(mockProfile.score * 0.8),
            "Soft Skills": Math.floor(Math.random() * 30 + 60),
            "Attitude": 90
          }
        },
      });
      appCount++;
    } catch (e) {
      // Skip duplicates if any
    }
  }

  console.log(`✅ Created ${appCount} mock applications with diverse scores and statuses.`);
  console.log('✨ Demo seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
