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

const LAURA_TASKS: HomeTask[] = [
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

const LAURA_ACTIVITY: HomeActivity = {
  projectApplications: 1,
  jobApplications: 0,
  referrals: 3,
}

const MATEO_MENTOR: HomeMentor = {
  name: 'Cong Wang',
  role: 'Director of Sales Engineering',
  avatarSrc: 'https://i.pravatar.cc/56?u=cong-wang',
  matchText: 'Matched 3 of your skill interests',
  matchCount: 3,
}

const LAURA_MENTOR: HomeMentor = {
  name: 'Sarah Chen',
  role: 'Chief Human Resources Officer',
  avatarSrc: 'https://i.pravatar.cc/56?u=sarah-chen',
  matchText: 'Your manager, strong in talent strategy',
  matchCount: 0,
}

const MATEO_JOB: HomeRecommendedJob = {
  title: 'Senior Sales Engineer',
  tags: [
    { label: 'Technical Demos' },
    { label: 'Solutions Arch...', checked: true },
    { label: 'Enterprise POC...' },
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
  const isLaura = user.id === 'laura-shah'
  const tasks = isLaura ? LAURA_TASKS : MATEO_TASKS
  const taskCount = tasks.length

  return {
    tasks,
    taskCount,
    activity: isLaura ? LAURA_ACTIVITY : MATEO_ACTIVITY,
    careerPath: getCareerPathForHome(user),
    mentor: isLaura ? LAURA_MENTOR : MATEO_MENTOR,
    recommendedJob: isLaura ? LAURA_JOB : MATEO_JOB,
    recommendedProject: isLaura ? LAURA_PROJECT : MATEO_PROJECT,
  }
}
