export type JobHeatBadge = 'super_hot' | 'hot' | 'trending' | 'new'

export const JOB_HEAT_BADGE_LABELS: Record<JobHeatBadge, string> = {
  super_hot: 'Super hot',
  hot: 'Hot',
  trending: 'Trending',
  new: 'New',
}

export type CandidateJob = {
  id: string
  title: string
  company: string
  location: string
  salary: string
  tags: string[]
  logoUrl: string
  /** Short blurb for list preview panel */
  summary: string
  /** Hero image for preview / detail */
  coverImageUrl: string
  /** Optional highlight badge on listings (hot jobs, etc.) */
  heatBadge?: JobHeatBadge
}

export const candidateJobs: CandidateJob[] = [
  {
    id: '1',
    title: 'Senior Product Designer',
    company: 'Vertex Systems',
    location: 'London, UK',
    salary: '$120k - $160k',
    heatBadge: 'super_hot',
    tags: ['Remote Friendly', 'High Growth', 'Figma'],
    summary:
      'Lead the evolution of our enterprise analytics platform. You will turn complex data flows into clear, elegant experiences for global clients, partnering with engineering and product to shape the next generation of AI-assisted tools.',
    coverImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACWvZjY1IECpGTTK9pcOtD5BJM7oN-vnLahcnr1uUCCF_V_5zsnMlWR479sptIg616lSB5rL08JCwYvCuCi5EHUJHFjAAAk1BfLwVBpWBmrd6mjiJj_euCPiVotuhedjStX6zGodJgDZLpE_1v6gNbDMZiCSvscDnCVzXVyRey0cl4V1OhDLj7oDZ1GveoLN_7vtVfBMyrKo4yfjlLH67WAvl3lzPYR-kxXloIp3_2B-D0s3Uf0405GMCPJqLfEXNj6PF58OlN-g',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAGmZZ-jZ73fBGrmYP34G-70sjtT70vgSrH8-bpm_UWPJMpZ45IoDXsLL58-QF_3Ivz4gFyPjnEhaY3hAAV3S4LZIQUD2bv-bCWfukfsv8uza14HRG-lL02NrgIZuOQZP1yZqtNeJKB6Lfhnu8J2rB4CIjmtPLW6xUcNjjV7YS0vABE6m6knZ1Bw4mHjD3hXwyUs-nINn-aNZo5f2R9dMstn4QOl3GeTrFChtuH9YsH2K1JYRiQP97-00R_fW8Q530Zdfm-_W_7ag',
  },
  {
    id: '2',
    title: 'Editorial Lead Architect',
    company: 'The Narrative Studio',
    location: 'Remote / NYC',
    salary: '$145k - $190k',
    heatBadge: 'hot',
    tags: ['Lead Role', 'Sustainability', 'CAD Expert'],
    summary:
      'Own editorial vision across flagship publications and digital platforms. You will mentor designers, set standards for sustainable building storytelling, and partner with architects to translate technical excellence into compelling narratives.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80&fm=jpg&fit=crop',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA8jAGISuuUpAZbTOJmMExXXZRJuJ_2fns0KJ75mvEqG7DtRafs3JHssFRRY8VylwVk0WldrdYzhA_Clu9aeLr1pK8Vp5l8rjYwOf79uPqf9GTIr57QDSQrEwOtV_IOtF6y8hO8NMoDW2VwsstRkJdwPSSSdYj27p_1FCwfJ7-wTxSK-0011-nVKoD0UQRRs-5NX8eGwNnUdsEuIjI0GHPgWYEPTojdB6MGP5AH5g0n8aFEX1Dh3cjbTNk4NEqMPPiwiPD_mL8L8Q',
  },
  {
    id: '3',
    title: 'Frontend Architecture Lead',
    company: 'Lumina Dev',
    location: 'Berlin, DE',
    salary: '$95k - $130k',
    heatBadge: 'trending',
    tags: ['Tech Stack', 'React', 'TypeScript', 'Bcorp'],
    summary:
      'Drive frontend architecture for a fast-growing B Corp product team. You will define patterns in React and TypeScript, raise the bar for performance and accessibility, and collaborate tightly with design on a cohesive design system.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&fm=jpg&fit=crop',
    logoUrl:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=256&h=256&fit=crop&q=85&fm=jpg',
  },
]

export function getCandidateJobById(id: string | undefined): CandidateJob | undefined {
  if (!id) return undefined
  return candidateJobs.find((j) => j.id === id)
}
