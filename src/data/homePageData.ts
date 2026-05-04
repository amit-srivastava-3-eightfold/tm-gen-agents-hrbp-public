import type { CurrentUser } from '../contexts/demoUsers'
import { getCareerPathForPerson } from './careerInterestsData'

export interface HomeTask {
  label: string
  href: string
  meta: string
  tag: string
  tagIcon: string
}

export interface HomeActivity {
  projectApplications: number
  jobApplications: number
  referrals: number
}

export interface HomeCareerPath {
  currentTitle: string
  currentSubtitle: string
  targetTitle: string
  targetSubtitle: string
  stepsAway: number
}

export interface HomeMentor {
  name: string
  role: string
  avatarSrc: string
  matchText: string
  matchCount: number
}

export interface HomeRecommendedJob {
  title: string
  tags: { label: string; checked?: boolean }[]
}

export interface HomeRecommendedProject {
  title: string
  tags: string[]
}

export interface HomePageData {
  tasks: HomeTask[]
  taskCount: number
  activity: HomeActivity
  careerPath: HomeCareerPath
  mentor: HomeMentor
  recommendedJob: HomeRecommendedJob
  recommendedProject: HomeRecommendedProject
}

const MATEO_TASKS: HomeTask[] = [
  {
    label: 'Work on development plans',
    href: '#',
    meta: '0/2 plans',
    tag: 'Build your skills',
    tagIcon: 'rocket_launch',
  },
]

const CHRO_TASKS: HomeTask[] = [
  {
    label: 'Review workforce readiness scores',
    href: '/workforce',
    meta: '17 departments',
    tag: 'People strategy',
    tagIcon: 'trending_up',
  },
  {
    label: 'Approve upskilling budget for Q2',
    href: '#',
    meta: 'Due Apr 1',
    tag: 'Planning',
    tagIcon: 'account_balance',
  },
]

const CSM_TASKS: HomeTask[] = [
  {
    label: 'Work on development plans',
    href: '#',
    meta: '0 of 2 plans',
    tag: 'Build your skills',
    tagIcon: 'school',
  },
]

const LAURA_TASKS: HomeTask[] = [
  {
    label: 'Review workforce readiness for Engineering',
    href: '/workforce',
    meta: '3,000 employees',
    tag: 'Workforce readiness',
    tagIcon: 'trending_up',
  },
  {
    label: 'Complete talent review for Q1',
    href: '#',
    meta: '3 of 5 teams done',
    tag: 'Talent planning',
    tagIcon: 'groups',
  },
  {
    label: 'Review succession plans',
    href: '#',
    meta: '2 updates needed',
    tag: 'People strategy',
    tagIcon: 'trending_up',
  },
]

const MATEO_ACTIVITY: HomeActivity = {
  projectApplications: 0,
  jobApplications: 2,
  referrals: 0,
}

const CHRO_ACTIVITY: HomeActivity = {
  projectApplications: 0,
  jobApplications: 0,
  referrals: 5,
}

const CSM_ACTIVITY: HomeActivity = {
  projectApplications: 1,
  jobApplications: 0,
  referrals: 0,
}

const LAURA_ACTIVITY: HomeActivity = {
  projectApplications: 1,
  jobApplications: 0,
  referrals: 3,
}

const MATEO_MENTOR: HomeMentor = {
  name: 'Alex Nakamura',
  role: 'Senior Manager · Engineering',
  avatarSrc: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=56&h=56&fit=crop&crop=face',
  matchText: 'Matched 4 of your skill interests',
  matchCount: 4,
}

const CHRO_MENTOR: HomeMentor = {
  name: 'Michael Torres',
  role: 'CEO',
  avatarSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=56&h=56&fit=crop&crop=face',
  matchText: 'Executive sponsor',
  matchCount: 0,
}

const CSM_MENTOR: HomeMentor = {
  name: 'Jaydon Torff',
  role: 'HR Business Partner, Customer Success',
  avatarSrc: '/jaydon_torff.jpg',
  matchText: 'Your HRBP, strong in AI adoption',
  matchCount: 0,
}

const LAURA_MENTOR: HomeMentor = {
  name: 'Rachel Kim',
  role: 'Senior HRBP, Product & Engineering',
  avatarSrc: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=56&h=56&fit=crop&crop=face',
  matchText: 'Matched 4 of your skill interests',
  matchCount: 4,
}

const MATEO_JOB: HomeRecommendedJob = {
  title: 'Staff ML Engineer',
  tags: [
    { label: 'ML Infrastructure' },
    { label: 'Model Deploy...', checked: true },
    { label: 'AI/ML Pipelines' },
  ],
}

const CHRO_JOB: HomeRecommendedJob = {
  title: 'Chief People Officer',
  tags: [
    { label: 'People Strategy' },
    { label: 'Org Development', checked: true },
    { label: 'AI Adoption' },
  ],
}

const CSM_JOB: HomeRecommendedJob = {
  title: 'Staff Engineer',
  tags: [
    { label: 'Platform' },
    { label: 'Infrastructure', checked: true },
    { label: 'AI/ML Pipelines' },
  ],
}

const LAURA_JOB: HomeRecommendedJob = {
  title: 'Director, Human Resources',
  tags: [
    { label: 'Talent Strategy' },
    { label: 'Organizational Dev...', checked: true },
    { label: 'HR Leadership' },
  ],
}

const MATEO_PROJECT: HomeRecommendedProject = {
  title: 'Enterprise Demo Platform',
  tags: ['Backend', 'Solutions'],
}

const CHRO_PROJECT: HomeRecommendedProject = {
  title: 'AI Workforce Transformation',
  tags: ['Strategy', 'HR'],
}

const CSM_PROJECT: HomeRecommendedProject = {
  title: 'AI-Assisted Code Review Pipeline',
  tags: ['AI', 'Engineering'],
}

const LAURA_PROJECT: HomeRecommendedProject = {
  title: 'Talent Analytics',
  tags: ['Data', 'HR'],
}

function getCareerPathForHome(user: CurrentUser): HomeCareerPath {
  const pathData = getCareerPathForPerson(
    user.id,
    user.title,
    user.businessUnit ?? '',
    user.hireDate ?? '2+ years'
  )
  const firstPath = pathData.paths[0]
  if (!firstPath) {
    return {
      currentTitle: pathData.currentRole.title,
      currentSubtitle: pathData.currentRole.department,
      targetTitle: 'Next role',
      targetSubtitle: '',
      stepsAway: 1,
    }
  }
  const targetTitle = firstPath.role.title
  const parts = targetTitle.split(', ')
  return {
    currentTitle: pathData.currentRole.title,
    currentSubtitle: pathData.currentRole.department,
    targetTitle: parts[0] ?? targetTitle,
    targetSubtitle: parts.slice(1).join(', ') || '',
    stepsAway: 1,
  }
}

export function getHomePageData(user: CurrentUser): HomePageData {
  const isChro = user.id === 'chro'
  const isLaura = user.id === 'jaydon-torff'
  const isCsm = user.id === 'csm'
  const tasks = isChro ? CHRO_TASKS : isLaura ? LAURA_TASKS : isCsm ? CSM_TASKS : MATEO_TASKS
  const taskCount = tasks.length

  return {
    tasks,
    taskCount,
    activity: isChro ? CHRO_ACTIVITY : isLaura ? LAURA_ACTIVITY : isCsm ? CSM_ACTIVITY : MATEO_ACTIVITY,
    careerPath: getCareerPathForHome(user),
    mentor: isChro ? CHRO_MENTOR : isLaura ? LAURA_MENTOR : isCsm ? CSM_MENTOR : MATEO_MENTOR,
    recommendedJob: isChro ? CHRO_JOB : isLaura ? LAURA_JOB : isCsm ? CSM_JOB : MATEO_JOB,
    recommendedProject: isChro ? CHRO_PROJECT : isLaura ? LAURA_PROJECT : isCsm ? CSM_PROJECT : MATEO_PROJECT,
  }
}
