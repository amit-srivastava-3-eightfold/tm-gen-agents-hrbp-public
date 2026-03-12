import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useUser } from '../contexts/UserContext'
import { OPEN_ROLES_PEOPLE_CARDS } from '../data/peopleData'
import { MATEO_USER_CARDS, MATEO_ALL_REPORTS_CARDS, LAURA_USER_CARDS, LAURA_ALL_REPORTS_CARDS } from '../data/teamData'
import type { PeopleProfileCardData } from './PeopleProfileCard'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@tonyh-2-eightfold/ef-design-system'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import type { RiskTag } from './UserCard'
import { UserCardList } from './UserCardList'

/** Unique role titles across the team (from team data) */
const ROLES_FOR_TEAM: string[] = (() => {
  const titles = new Set<string>()
  ;[...MATEO_USER_CARDS, ...LAURA_USER_CARDS].forEach((c) => titles.add(c.title))
  return Array.from(titles).sort()
})()

type PositionRow = {
  id: string
  title: string
  details: string
  daysOpen: number
  leads: number
  employees: number
  new: number
  recruiterScreen: number
  hiringManagerScreen: number
  phoneInterview: number
  onsiteInterview: number
  offer: number
  referenceCheck: number
}

function getUniqueRolesFromData(cards: PeopleProfileCardData[]): string[] {
  const seen = new Set<string>()
  const roles: string[] = []
  for (const p of cards) {
    if (p.roleInterest && !seen.has(p.roleInterest)) {
      seen.add(p.roleInterest)
      roles.push(p.roleInterest)
    }
  }
  return roles.sort((a, b) => a.localeCompare(b))
}

function getCountByRole(cards: PeopleProfileCardData[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const p of cards) {
    if (p.roleInterest) {
      counts[p.roleInterest] = (counts[p.roleInterest] ?? 0) + 1
    }
  }
  return counts
}

function buildPositionsFromOpenRoles(
  cards: PeopleProfileCardData[],
  pipelineLookup: PositionRow[]
): PositionRow[] {
  const roles = getUniqueRolesFromData(cards)
  const counts = getCountByRole(cards)
  const lookupByTitle = Object.fromEntries(pipelineLookup.map((p) => [p.title, p]))
  return roles.map((role) => {
    const pipeline = lookupByTitle[role]
    const id = pipeline?.id ?? role.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    return {
      id,
      title: role,
      details: pipeline?.details ?? `${role} • Sourcing Pipeline`,
      daysOpen: pipeline?.daysOpen ?? 0,
      leads: pipeline?.leads ?? 0,
      employees: counts[role] ?? 0,
      new: pipeline?.new ?? 0,
      recruiterScreen: pipeline?.recruiterScreen ?? 0,
      hiringManagerScreen: pipeline?.hiringManagerScreen ?? 0,
      phoneInterview: pipeline?.phoneInterview ?? 0,
      onsiteInterview: pipeline?.onsiteInterview ?? 0,
      offer: pipeline?.offer ?? 0,
      referenceCheck: pipeline?.referenceCheck ?? 0,
    }
  })
}

/* Totals = 14 direct reports; current = how many have the skill (gaps = need it by role, strengths = have it) */
const MATEO_SKILL_GAPS = [
  { name: 'Value Proposition', current: 5, total: 14 },
  { name: 'Product Demos', current: 4, total: 14 },
  { name: 'Objection Handling', current: 3, total: 14 },
  { name: 'CRM Systems', current: 6, total: 14 },
  { name: 'API Integration', current: 2, total: 14 },
  { name: 'Technical Sales', current: 7, total: 14 },
  { name: 'Enterprise Sales', current: 3, total: 14 },
  { name: 'Contract Negotiation', current: 6, total: 14 },
  { name: 'Discovery Calls', current: 4, total: 14 },
  { name: 'Competitive Positioning', current: 5, total: 14 },
  { name: 'Proof of Concept', current: 3, total: 14 },
  { name: 'Solution Scoping', current: 6, total: 14 },
  { name: 'Stakeholder Mapping', current: 4, total: 14 },
  { name: 'Proposal Writing', current: 5, total: 14 },
]

const MATEO_SKILL_STRENGTHS = [
  { name: 'Solution Architecture', current: 12, total: 14 },
  { name: 'Sales Enablement', current: 10, total: 14 },
  { name: 'Technical Discovery', current: 11, total: 14 },
  { name: 'Communication', current: 14, total: 14 },
  { name: 'API Integration', current: 5, total: 14 },
  { name: 'Product Demos', current: 9, total: 14 },
  { name: 'Value Proposition', current: 8, total: 14 },
  { name: 'Technical Sales', current: 10, total: 14 },
  { name: 'CRM Systems', current: 11, total: 14 },
  { name: 'Objection Handling', current: 7, total: 14 },
  { name: 'Contract Negotiation', current: 8, total: 14 },
  { name: 'Enterprise Sales', current: 6, total: 14 },
]

const MATEO_SKILL_INTERESTS = [
  { name: 'Solutions Architecture', count: 9 },
  { name: 'Sales Engineering', count: 11 },
  { name: 'Technical Sales', count: 8 },
  { name: 'Product Management', count: 5 },
  { name: 'Cross-Functional Team Leadership', count: 6 },
  { name: 'Cloud Architecture', count: 7 },
  { name: 'Customer Success', count: 4 },
  { name: 'Partner Management', count: 3 },
  { name: 'Solution Consulting', count: 10 },
  { name: 'Data & Analytics', count: 5 },
  { name: 'Enterprise Architecture', count: 4 },
  { name: 'Pre-Sales Leadership', count: 2 },
]

/* Laura's supported employees: 12 direct; totals = 12 */
const LAURA_SKILL_GAPS = [
  { name: 'Performance Management', current: 4, total: 12 },
  { name: 'Workforce Planning', current: 3, total: 12 },
  { name: 'Succession Planning', current: 2, total: 12 },
  { name: 'DEI Initiatives', current: 5, total: 12 },
  { name: 'Change Management', current: 6, total: 12 },
  { name: 'Labor Law Compliance', current: 3, total: 12 },
  { name: 'Talent Analytics', current: 2, total: 12 },
  { name: 'Employee Engagement', current: 8, total: 12 },
  { name: 'Compensation Design', current: 3, total: 12 },
  { name: 'Organizational Design', current: 4, total: 12 },
  { name: 'HR Technology', current: 5, total: 12 },
  { name: 'Conflict Resolution', current: 4, total: 12 },
  { name: 'Talent Sourcing', current: 3, total: 12 },
  { name: 'Learning Strategy', current: 2, total: 12 },
]

const LAURA_SKILL_STRENGTHS = [
  { name: 'Employee Relations', current: 11, total: 12 },
  { name: 'Talent Management', current: 10, total: 12 },
  { name: 'Stakeholder Management', current: 10, total: 12 },
  { name: 'Coaching', current: 9, total: 12 },
  { name: 'Data Analytics', current: 7, total: 12 },
  { name: 'Performance Management', current: 8, total: 12 },
  { name: 'Employee Engagement', current: 9, total: 12 },
  { name: 'Change Management', current: 6, total: 12 },
  { name: 'Workforce Planning', current: 7, total: 12 },
  { name: 'DEI Initiatives', current: 8, total: 12 },
  { name: 'Succession Planning', current: 6, total: 12 },
  { name: 'Communication', current: 12, total: 12 },
]

const LAURA_SKILL_INTERESTS = [
  { name: 'Leadership Development', count: 8 },
  { name: 'HR Strategy', count: 7 },
  { name: 'Talent Acquisition', count: 6 },
  { name: 'Compensation & Benefits', count: 5 },
  { name: 'Organizational Design', count: 4 },
  { name: 'Learning & Development', count: 9 },
  { name: 'Talent Development', count: 7 },
  { name: 'Compensation Design', count: 3 },
  { name: 'People Analytics', count: 6 },
  { name: 'Employee Experience', count: 5 },
  { name: 'Diversity & Inclusion', count: 8 },
  { name: 'Workforce Strategy', count: 4 },
]

const MATEO_TAB_COUNTS = { direct: 14, all: 28 }

const LAURA_TAB_COUNTS = { direct: 12, all: 48 }

/** Role titles that require this skill (for gaps: need to have it). Right-side total = people in these roles. */
const ROLES_REQUIRING_SKILL_GAP: Record<string, string[]> = {
  'Value Proposition': ['Senior Solutions Engineer', 'Technical Account Manager', 'Sales Engineer', 'Solutions Engineer'],
  'Product Demos': ['Senior Solutions Engineer', 'Sales Engineer', 'Solutions Engineer'],
  'Objection Handling': ['Technical Account Manager', 'Sales Engineer'],
  'CRM Systems': ['Technical Account Manager', 'Sales Engineer', 'Solutions Engineer'],
  'API Integration': ['Senior Solutions Engineer', 'Solutions Engineer'],
  'Technical Sales': ['Senior Solutions Engineer', 'Technical Account Manager', 'Sales Engineer'],
  'Enterprise Sales': ['Technical Account Manager', 'Sales Engineer'],
  'Contract Negotiation': ['Technical Account Manager', 'Sales Engineer'],
  'Discovery Calls': ['Senior Solutions Engineer', 'Technical Account Manager', 'Sales Engineer', 'Solutions Engineer'],
  'Competitive Positioning': ['Senior Solutions Engineer', 'Sales Engineer', 'Solutions Engineer'],
  'Proof of Concept': ['Senior Solutions Engineer', 'Solutions Engineer'],
  'Solution Scoping': ['Senior Solutions Engineer', 'Technical Account Manager', 'Sales Engineer', 'Solutions Engineer'],
  'Stakeholder Mapping': ['Technical Account Manager', 'Sales Engineer', 'Solutions Engineer'],
  'Proposal Writing': ['Technical Account Manager', 'Sales Engineer'],
  'Performance Management': ['Director of Customer Success', 'VP of Customer Success', 'Sales Engineering Manager', 'Director of Sales Engineering', 'HRBP Peer', 'Implementation Director', 'Customer Success Manager'],
  'Workforce Planning': ['Director of Customer Success', 'VP of Customer Success', 'Sales Engineering Manager', 'Director of Sales Engineering', 'HRBP Peer', 'Implementation Director'],
  'Succession Planning': ['Director of Customer Success', 'VP of Customer Success', 'Sales Engineering Manager', 'Director of Sales Engineering', 'HRBP Peer'],
  'DEI Initiatives': ['Director of Customer Success', 'VP of Customer Success', 'HRBP Peer', 'Customer Success Manager'],
  'Change Management': ['Director of Customer Success', 'VP of Customer Success', 'Sales Engineering Manager', 'Director of Sales Engineering', 'HRBP Peer', 'Implementation Director', 'Customer Success Manager'],
  'Labor Law Compliance': ['HRBP Peer', 'VP of Customer Success', 'Director of Customer Success'],
  'Talent Analytics': ['HRBP Peer', 'VP of Customer Success', 'Director of Customer Success', 'Director of Sales Engineering'],
  'Employee Engagement': ['Director of Customer Success', 'VP of Customer Success', 'HRBP Peer', 'Customer Success Manager', 'Sales Engineering Manager', 'Director of Sales Engineering', 'Implementation Director'],
  'Compensation Design': ['HRBP Peer', 'VP of Customer Success', 'Director of Customer Success'],
  'Organizational Design': ['Director of Customer Success', 'VP of Customer Success', 'HRBP Peer', 'Director of Sales Engineering'],
  'HR Technology': ['HRBP Peer', 'VP of Customer Success', 'Director of Customer Success', 'Implementation Director'],
  'Conflict Resolution': ['Director of Customer Success', 'HRBP Peer', 'Customer Success Manager', 'Sales Engineering Manager'],
  'Talent Sourcing': ['HRBP Peer', 'VP of Customer Success', 'Director of Sales Engineering'],
  'Learning Strategy': ['Director of Customer Success', 'VP of Customer Success', 'HRBP Peer', 'Implementation Director'],
}

/** Role titles that require this strength. Right-side total = people in these roles. */
const ROLES_REQUIRING_SKILL_STRENGTH: Record<string, string[]> = {
  'Solution Architecture': ['Senior Solutions Engineer', 'Technical Account Manager', 'Sales Engineer', 'Solutions Engineer'],
  'Sales Enablement': ['Senior Solutions Engineer', 'Sales Engineer', 'Solutions Engineer'],
  'Technical Discovery': ['Senior Solutions Engineer', 'Technical Account Manager', 'Sales Engineer', 'Solutions Engineer'],
  'API Integration': ['Senior Solutions Engineer', 'Solutions Engineer'],
  'Communication': ['Senior Solutions Engineer', 'Technical Account Manager', 'Sales Engineer', 'Solutions Engineer'],
  'Product Demos': ['Senior Solutions Engineer', 'Sales Engineer', 'Solutions Engineer'],
  'Value Proposition': ['Senior Solutions Engineer', 'Technical Account Manager', 'Sales Engineer', 'Solutions Engineer'],
  'Technical Sales': ['Senior Solutions Engineer', 'Technical Account Manager', 'Sales Engineer'],
  'CRM Systems': ['Technical Account Manager', 'Sales Engineer', 'Solutions Engineer'],
  'Objection Handling': ['Technical Account Manager', 'Sales Engineer'],
  'Contract Negotiation': ['Technical Account Manager', 'Sales Engineer'],
  'Enterprise Sales': ['Technical Account Manager', 'Sales Engineer'],
  'Employee Relations': ['Director of Customer Success', 'VP of Customer Success', 'HRBP Peer', 'Customer Success Manager', 'Sales Engineering Manager', 'Director of Sales Engineering', 'Implementation Director', 'Professional Services Lead'],
  'Talent Management': ['Director of Customer Success', 'VP of Customer Success', 'HRBP Peer', 'Sales Engineering Manager', 'Director of Sales Engineering', 'Implementation Director'],
  'Coaching': ['Director of Customer Success', 'VP of Customer Success', 'HRBP Peer', 'Customer Success Manager', 'Sales Engineering Manager', 'Director of Sales Engineering', 'Sales Engineering Lead', 'Implementation Director'],
  'Data Analytics': ['HRBP Peer', 'VP of Customer Success', 'Director of Sales Engineering', 'Director of Customer Success', 'Implementation Director'],
  'Stakeholder Management': ['Director of Customer Success', 'VP of Customer Success', 'HRBP Peer', 'Customer Success Manager', 'Sales Engineering Manager', 'Director of Sales Engineering', 'Implementation Director', 'Professional Services Lead'],
  'Performance Management': ['Director of Customer Success', 'VP of Customer Success', 'Sales Engineering Manager', 'Director of Sales Engineering', 'HRBP Peer', 'Implementation Director', 'Customer Success Manager'],
  'Employee Engagement': ['Director of Customer Success', 'VP of Customer Success', 'HRBP Peer', 'Customer Success Manager', 'Sales Engineering Manager', 'Director of Sales Engineering', 'Implementation Director'],
  'Change Management': ['Director of Customer Success', 'VP of Customer Success', 'Sales Engineering Manager', 'Director of Sales Engineering', 'HRBP Peer', 'Implementation Director', 'Customer Success Manager'],
  'Workforce Planning': ['Director of Customer Success', 'VP of Customer Success', 'Sales Engineering Manager', 'Director of Sales Engineering', 'HRBP Peer', 'Implementation Director'],
  'DEI Initiatives': ['Director of Customer Success', 'VP of Customer Success', 'HRBP Peer', 'Customer Success Manager'],
  'Succession Planning': ['Director of Customer Success', 'VP of Customer Success', 'Sales Engineering Manager', 'Director of Sales Engineering', 'HRBP Peer'],
}

/** Unique skill names across gaps, strengths, and interests (for skills filter) */
const SKILLS_FOR_TEAM: string[] = (() => {
  const names = new Set<string>()
  const add = (arr: { name: string }[]) => arr.forEach((s) => names.add(s.name))
  add(MATEO_SKILL_GAPS)
  add(MATEO_SKILL_STRENGTHS)
  add(MATEO_SKILL_INTERESTS)
  add(LAURA_SKILL_GAPS)
  add(LAURA_SKILL_STRENGTHS)
  add(LAURA_SKILL_INTERESTS)
  return Array.from(names).sort()
})()

/** Job levels derived from title (for Job Level filter) */
const JOB_LEVELS = ['Associate', 'Senior', 'Lead', 'Principal', 'Individual contributor'] as const

function getJobLevelFromTitle(title: string): string {
  if (!title) return 'Individual contributor'
  const t = title.toLowerCase()
  if (t.startsWith('associate')) return 'Associate'
  if (t.startsWith('senior')) return 'Senior'
  if (t.startsWith('lead')) return 'Lead'
  if (t.startsWith('principal')) return 'Principal'
  return 'Individual contributor'
}

const MATEO_OPEN_POSITIONS: PositionRow[] = [
  {
    id: '40468430',
    title: 'Sales Engineer',
    details: 'Santa Clara, CA • Mateo Myer • Recruiter not specified • Sourcing Pipeline',
    daysOpen: 12,
    leads: 97,
    employees: 24,
    new: 0,
    recruiterScreen: 0,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
    offer: 0,
    referenceCheck: 0,
  },
  {
    id: '40468780',
    title: 'Solutions Engineer',
    details: 'Remote • Mateo Myer • Recruiter not specified • Sourcing Pipeline',
    daysOpen: 28,
    leads: 112,
    employees: 18,
    new: 0,
    recruiterScreen: 0,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
    offer: 0,
    referenceCheck: 0,
  },
  {
    id: '40468912',
    title: 'Technical Account Manager',
    details: 'Santa Clara, CA • Mateo Myer • Recruiter not specified • Sourcing Pipeline',
    daysOpen: 5,
    leads: 84,
    employees: 31,
    new: 3,
    recruiterScreen: 2,
    hiringManagerScreen: 1,
    phoneInterview: 0,
    onsiteInterview: 0,
    offer: 1,
    referenceCheck: 1,
  },
]

const LAURA_OPEN_POSITIONS: PositionRow[] = [
  {
    id: '40468430',
    title: 'Sales Engineer',
    details: 'Santa Clara, CA • Mateo Myer • Laura Shah • Sourcing Pipeline',
    daysOpen: 12,
    leads: 97,
    employees: 24,
    new: 0,
    recruiterScreen: 0,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
    offer: 0,
    referenceCheck: 0,
  },
  {
    id: '40468780',
    title: 'Solutions Engineer',
    details: 'Remote • Mateo Myer • Laura Shah • Sourcing Pipeline',
    daysOpen: 28,
    leads: 112,
    employees: 18,
    new: 0,
    recruiterScreen: 0,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
    offer: 0,
    referenceCheck: 0,
  },
  {
    id: '40468912',
    title: 'Customer Success Manager',
    details: 'Los Angeles, CA • Ethan Declerq • Laura Shah • Sourcing Pipeline',
    daysOpen: 8,
    leads: 62,
    employees: 15,
    new: 2,
    recruiterScreen: 1,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
    offer: 0,
    referenceCheck: 0,
  },
  {
    id: '40468920',
    title: 'Implementation Consultant',
    details: 'San Francisco, CA • Anna Patel • Laura Shah • Sourcing Pipeline',
    daysOpen: 15,
    leads: 45,
    employees: 12,
    new: 1,
    recruiterScreen: 0,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
    offer: 0,
    referenceCheck: 0,
  },
]

type ViewFilterValue = 'gaps' | 'skills-overview' | 'team-statistics' | 'team-insights'

interface SkillAnalysisSectionProps {
  reportScope: 'direct' | 'open' | 'all'
  onReportScopeChange: (scope: 'direct' | 'open' | 'all') => void
  sustainedHighPerformersFilter?: boolean
  onSustainedHighPerformersClick?: () => void
}

export function SkillAnalysisSection({
  reportScope: scope,
  onReportScopeChange: setReportScope,
  sustainedHighPerformersFilter = false,
  onSustainedHighPerformersClick,
}: SkillAnalysisSectionProps) {
  const { currentUser } = useUser()
  const isLaura = currentUser.id === 'laura-shah'

  const cardsForScope = scope === 'all'
    ? (isLaura ? LAURA_ALL_REPORTS_CARDS : MATEO_ALL_REPORTS_CARDS)
    : (isLaura ? LAURA_USER_CARDS : MATEO_USER_CARDS)

  const [viewFilter, setViewFilter] = useState<ViewFilterValue>('gaps')
  const [selectedSkillGap, setSelectedSkillGap] = useState<string | null>(null)
  const [selectedSkillStrength, setSelectedSkillStrength] = useState<string | null>(null)
  const [selectedSkillInterest, setSelectedSkillInterest] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedJobLevels, setSelectedJobLevels] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'rating-desc' | 'rating-asc' | 'gap-desc' | 'alphabetical' | 'tenure'>('rating-desc')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedRolesPeople, setSelectedRolesPeople] = useState<string[]>([])
  const [selectedSkillsPeople, setSelectedSkillsPeople] = useState<string[]>([])
  const [skillsSearch, setSkillsSearch] = useState('')
  const [riskTagOverrides, setRiskTagOverrides] = useState<Record<string, RiskTag[]>>({})

  /* Top bar Role/Skills filter the skill cards only (not the people list). Scope the pool for card data. */
  const cardsForCards = useMemo(() => {
    let list = cardsForScope
    if (selectedRoles.length > 0) list = list.filter((c) => selectedRoles.includes(c.title))
    if (selectedSkills.length > 0) list = list.filter((c) => (c.skillStrengths ?? []).some((s) => selectedSkills.includes(s)))
    return list
  }, [cardsForScope, selectedRoles, selectedSkills])

  /* Gaps: bar = people (in role) who have the gap; right = people whose role requires this skill. When top Skills filter is set, only show those skills. */
  const skillGaps = useMemo(() => {
    const gapNames = isLaura ? LAURA_SKILL_GAPS.map((s) => s.name) : MATEO_SKILL_GAPS.map((s) => s.name)
    const namesToShow = selectedSkills.length > 0 ? gapNames.filter((n) => selectedSkills.includes(n)) : gapNames
    const rolesFor = (name: string) => ROLES_REQUIRING_SKILL_GAP[name] ?? []
    const list = namesToShow.map((name) => {
      const roles = rolesFor(name)
      const needSkill = roles.length > 0 ? cardsForCards.filter((c) => roles.includes(c.title)) : cardsForCards
      const total = needSkill.length
      const current = needSkill.filter((c) => c.skillGaps?.includes(name)).length
      return { name, current, total }
    })
    list.sort((a, b) => b.current - a.current)
    return list
  }, [isLaura, cardsForCards, selectedSkills])

  /* For Gaps analysis view: strengths with current/total bar (role-based). When top Skills filter is set, only show those skills. */
  const skillStrengths = useMemo(() => {
    const strengthNames = isLaura ? LAURA_SKILL_STRENGTHS.map((s) => s.name) : MATEO_SKILL_STRENGTHS.map((s) => s.name)
    const namesToShow = selectedSkills.length > 0 ? strengthNames.filter((n) => selectedSkills.includes(n)) : strengthNames
    const rolesFor = (name: string) => ROLES_REQUIRING_SKILL_STRENGTH[name] ?? []
    const list = namesToShow.map((name) => {
      const roles = rolesFor(name)
      const needSkill = roles.length > 0 ? cardsForCards.filter((c) => roles.includes(c.title)) : cardsForCards
      const total = needSkill.length
      const current = needSkill.filter((c) => c.skillStrengths?.includes(name)).length
      return { name, current, total }
    })
    return list.sort((a, b) => b.current - a.current)
  }, [isLaura, cardsForCards, selectedSkills])

  /* For Gaps analysis view: skill interests with count. When top Skills filter is set, only show those skills (if they appear in interests). */
  const skillInterestsSortedByCount = useMemo(() => {
    const interestNames = isLaura ? LAURA_SKILL_INTERESTS.map((s) => s.name) : MATEO_SKILL_INTERESTS.map((s) => s.name)
    const namesToShow = selectedSkills.length > 0 ? interestNames.filter((n) => selectedSkills.includes(n)) : interestNames
    const list = namesToShow.map((name) => ({
      name,
      count: cardsForCards.filter((c) => c.skillInterests?.includes(name)).length,
    }))
    return list.sort((a, b) => b.count - a.count)
  }, [isLaura, cardsForCards, selectedSkills])

  /* Popular skills: when top Skills filter is set, only show those skills; otherwise all skills in cardsForCards. */
  const popularSkills = useMemo(() => {
    const nameSet = new Set<string>()
    for (const c of cardsForCards) {
      for (const name of c.skillStrengths ?? []) {
        nameSet.add(name)
      }
    }
    const namesToShow = selectedSkills.length > 0 ? Array.from(nameSet).filter((n) => selectedSkills.includes(n)) : Array.from(nameSet)
    const list = namesToShow.map((name) => ({
      name,
      count: cardsForCards.filter((c) => c.skillStrengths?.includes(name)).length,
    }))
    return list.sort((a, b) => b.count - a.count)
  }, [cardsForCards, selectedSkills])

  /* Roles: role title + count + percentage of people in that role */
  const rolesWithCountAndPct = useMemo(() => {
    const total = cardsForCards.length
    const byTitle: Record<string, number> = {}
    for (const c of cardsForCards) {
      const t = c.title ?? ''
      byTitle[t] = (byTitle[t] ?? 0) + 1
    }
    return Object.entries(byTitle)
      .map(([role, count]) => ({ role, count, percentage: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
  }, [cardsForCards])
  const tabCounts = isLaura ? LAURA_TAB_COUNTS : MATEO_TAB_COUNTS
  const pipelineLookup = isLaura ? LAURA_OPEN_POSITIONS : MATEO_OPEN_POSITIONS
  const openPositions = useMemo(
    () => buildPositionsFromOpenRoles(OPEN_ROLES_PEOPLE_CARDS, pipelineLookup),
    [pipelineLookup]
  )

  const filteredResultsCount = useMemo(() => {
    let list = cardsForScope
    if (selectedSkillGap) list = list.filter((c) => c.skillGaps?.includes(selectedSkillGap))
    if (selectedSkillStrength) list = list.filter((c) => c.skillStrengths?.includes(selectedSkillStrength))
    if (selectedSkillInterest) list = list.filter((c) => c.skillInterests?.includes(selectedSkillInterest))
    if (selectedRole) list = list.filter((c) => c.title === selectedRole)
    else if (selectedRolesPeople.length > 0) list = list.filter((c) => selectedRolesPeople.includes(c.title))
    if (selectedSkillStrength) list = list.filter((c) => c.skillStrengths?.includes(selectedSkillStrength))
    else if (selectedSkillsPeople.length > 0) list = list.filter((c) => (c.skillStrengths ?? []).some((s) => selectedSkillsPeople.includes(s)))
    if (selectedJobLevels.length > 0) list = list.filter((c) => selectedJobLevels.includes(getJobLevelFromTitle(c.title)))
    if (isLaura && sustainedHighPerformersFilter) list = list.filter((c) => c.highTenureNoPromotion === true)
    return list.length
  }, [cardsForScope, selectedSkillGap, selectedSkillStrength, selectedSkillInterest, selectedRole, selectedRolesPeople, selectedSkillsPeople, selectedJobLevels, isLaura, sustainedHighPerformersFilter])

  const toggleRole = (role: string, checked: boolean) => {
    setSelectedRoles((prev) => (checked ? [...prev, role] : prev.filter((r) => r !== role)))
  }

  const toggleSkill = (skill: string, checked: boolean) => {
    setSelectedSkills((prev) => (checked ? [...prev, skill] : prev.filter((s) => s !== skill)))
  }

  const toggleJobLevel = (level: string, checked: boolean) => {
    setSelectedJobLevels((prev) => (checked ? [...prev, level] : prev.filter((l) => l !== level)))
  }

  const toggleRolePeople = (role: string, checked: boolean) => {
    setSelectedRolesPeople((prev) => (checked ? [...prev, role] : prev.filter((r) => r !== role)))
  }

  const toggleSkillPeople = (skill: string, checked: boolean) => {
    setSelectedSkillsPeople((prev) => (checked ? [...prev, skill] : prev.filter((s) => s !== skill)))
  }

  const filteredSkills = useMemo(
    () =>
      skillsSearch.trim()
        ? SKILLS_FOR_TEAM.filter((s) => s.toLowerCase().includes(skillsSearch.trim().toLowerCase()))
        : SKILLS_FOR_TEAM,
    [skillsSearch]
  )

  return (
    <div className="skill-analysis">
      <div className="skill-analysis__tabs">
        <Button
          variant="ghost"
          className={`skill-analysis__tab ${scope === 'direct' ? 'skill-analysis__tab--active' : ''}`}
          onClick={() => setReportScope('direct')}
        >
          {isLaura ? 'Supported employees' : 'Direct reports'}
          <span className="skill-analysis__tab-badge">{tabCounts.direct}</span>
        </Button>
        <Button
          variant="ghost"
          className={`skill-analysis__tab ${scope === 'open' ? 'skill-analysis__tab--active' : ''}`}
          onClick={() => setReportScope('open')}
        >
          Open positions
          <span className="skill-analysis__tab-badge">{OPEN_ROLES_PEOPLE_CARDS.length}</span>
        </Button>
        <Button
          variant="ghost"
          className={`skill-analysis__tab ${scope === 'all' ? 'skill-analysis__tab--active' : ''}`}
          onClick={() => setReportScope('all')}
        >
          {isLaura ? 'All supported' : 'All reports'}
          <span className="skill-analysis__tab-badge">{tabCounts.all}</span>
        </Button>
      </div>

      {scope !== 'open' && (
      <div className="skill-analysis__filters skill-analysis__filters--top">
        <Select value={viewFilter} onValueChange={(v: string) => setViewFilter(v as ViewFilterValue)}>
          <SelectTrigger variant="default" className="skill-analysis__filter-select">
            View: <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gaps">Gaps analysis</SelectItem>
            <SelectItem value="skills-overview">Skills overview</SelectItem>
            <SelectItem value="team-statistics">Team statistics</SelectItem>
            <SelectItem value="team-insights">Team insights</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="secondary"
              className="skill-analysis__filter-select skill-analysis__roles-trigger"
              aria-label="Role filter"
            >
              <span className="skill-analysis__roles-trigger-label">
                {selectedRoles.length === 0 ? 'All roles' : `${selectedRoles.length} role${selectedRoles.length === 1 ? '' : 's'} selected`}
              </span>
              <span className="material-symbols-outlined skill-analysis__roles-chevron">expand_more</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="skill-analysis__roles-content" align="start" sideOffset={4}>
              <div className="skill-analysis__roles-list">
                <DropdownMenu.CheckboxItem
                  className="skill-analysis__roles-item"
                  checked={selectedRoles.length === 0}
                  onCheckedChange={(checked) => checked && setSelectedRoles([])}
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className="skill-analysis__roles-checkbox" aria-hidden>
                    <DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator">
                      <span className="material-symbols-outlined">check</span>
                    </DropdownMenu.ItemIndicator>
                  </span>
                  All roles
                </DropdownMenu.CheckboxItem>
                {ROLES_FOR_TEAM.map((role) => (
                  <DropdownMenu.CheckboxItem
                    key={role}
                    className="skill-analysis__roles-item"
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={(checked) => toggleRole(role, checked === true)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <span className="skill-analysis__roles-checkbox" aria-hidden>
                      <DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator">
                        <span className="material-symbols-outlined">check</span>
                      </DropdownMenu.ItemIndicator>
                    </span>
                    {role}
                  </DropdownMenu.CheckboxItem>
                ))}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <DropdownMenu.Root onOpenChange={(open) => !open && setSkillsSearch('')}>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="secondary"
              className="skill-analysis__filter-select skill-analysis__skills-trigger"
              aria-label="Skills filter"
            >
              <span className="skill-analysis__skills-trigger-label">
                {selectedSkills.length === 0 ? 'All skills' : `${selectedSkills.length} skill${selectedSkills.length === 1 ? '' : 's'} selected`}
              </span>
              <span className="material-symbols-outlined skill-analysis__skills-chevron">expand_more</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="skill-analysis__skills-content" align="start" sideOffset={4} onCloseAutoFocus={(e) => e.preventDefault()}>
              <div className="skill-analysis__skills-search-wrap">
                <span className="material-symbols-outlined skill-analysis__skills-search-icon">search</span>
                <input
                  type="search"
                  placeholder="Search skills"
                  className="skill-analysis__skills-search-input"
                  value={skillsSearch}
                  onChange={(e) => setSkillsSearch(e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              <div className="skill-analysis__skills-list">
                <DropdownMenu.CheckboxItem
                  className="skill-analysis__skills-item"
                  checked={selectedSkills.length === 0}
                  onCheckedChange={(checked) => checked && setSelectedSkills([])}
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className="skill-analysis__skills-checkbox" aria-hidden>
                    <DropdownMenu.ItemIndicator className="skill-analysis__skills-indicator">
                      <span className="material-symbols-outlined">check</span>
                    </DropdownMenu.ItemIndicator>
                  </span>
                  All skills
                </DropdownMenu.CheckboxItem>
                {filteredSkills.map((skill) => (
                  <DropdownMenu.CheckboxItem
                    key={skill}
                    className="skill-analysis__skills-item"
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={(checked) => toggleSkill(skill, checked === true)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <span className="skill-analysis__skills-checkbox" aria-hidden>
                      <DropdownMenu.ItemIndicator className="skill-analysis__skills-indicator">
                        <span className="material-symbols-outlined">check</span>
                      </DropdownMenu.ItemIndicator>
                    </span>
                    {skill}
                  </DropdownMenu.CheckboxItem>
                ))}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
      )}

      {scope === 'open' ? (
        <div className="skill-analysis__positions-table-wrap">
          <table className="skill-analysis__positions-table">
            <thead>
              <tr>
                <th className="skill-analysis__positions-th skill-analysis__positions-th--position">Position</th>
                <th className="skill-analysis__positions-th">
                  Days Open
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Leads
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Employees
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  New
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Recruiter Screen
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Hiring Manager Screen
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Phone Interview
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Onsite Interview
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Offer
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Reference Check
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th skill-analysis__positions-th--actions" scope="col">
                  <span className="material-symbols-outlined" aria-hidden>more_vert</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {openPositions.map((pos) => (
                <tr key={pos.id} className="skill-analysis__positions-row">
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--position">
                    <div className="skill-analysis__position-info">
                      <Link to={`/positions/${pos.id}`} className="skill-analysis__position-title skill-analysis__position-title--link">
                        {pos.title} ({pos.id})
                      </Link>
                      <span className="skill-analysis__position-details">
                        <span className="skill-analysis__position-dot" aria-hidden />
                        {pos.details}
                      </span>
                    </div>
                  </td>
                  <td className="skill-analysis__positions-td">{pos.daysOpen}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--lead">{pos.leads}</td>
                  <td className="skill-analysis__positions-td">
                    <Link
                      to={`/people?tab=open-roles&role=${encodeURIComponent(pos.title)}`}
                      className="skill-analysis__positions-badge-link"
                    >
                      {pos.employees}
                    </Link>
                  </td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.new}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.recruiterScreen}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.hiringManagerScreen}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.phoneInterview}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.onsiteInterview}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.offer}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.referenceCheck}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--actions">
                    <button type="button" className="skill-analysis__positions-actions-btn" aria-label="Actions">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
      <>
      <div className="skill-analysis__cards">
        {viewFilter === 'gaps' ? (
          /* Gaps analysis: first view – Skill gaps, Skill strengths, Skill interests */
          <>
            <div className="skill-analysis__card skill-analysis__card--gaps">
              <div className="skill-analysis__card-header skill-analysis__card-header--gaps">
                <span className="material-symbols-outlined skill-analysis__card-icon skill-analysis__card-icon--red">trending_down</span>
                <span>Skill gaps</span>
                <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
              </div>
              <div className="skill-analysis__interests-list-wrap">
                <ul className="skill-analysis__list">
                {skillGaps.map((skill) => (
                  <li
                    key={skill.name}
                    role="button"
                    tabIndex={0}
                    className="skill-analysis__item"
                    onClick={() => {
                      setSelectedSkillGap(skill.name)
                      setSelectedSkillStrength(null)
                      setSelectedSkillInterest(null)
                      setSelectedRole(null)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && (setSelectedSkillGap(skill.name), setSelectedSkillStrength(null), setSelectedSkillInterest(null), setSelectedRole(null))}
                  >
                    <span className="skill-analysis__skill-name">{skill.name}</span>
                    <div className="skill-analysis__item-right">
                      <span className="material-symbols-outlined skill-analysis__person-icon">person</span>
                      <div className="skill-analysis__bar-wrap">
                        <div className="skill-analysis__bar">
                          <div className="skill-analysis__bar-fill" style={{ width: `${skill.total > 0 ? (skill.current / skill.total) * 100 : 0}%` }}>
                            {skill.current > 0 && <span className="skill-analysis__bar-value">{skill.current}</span>}
                          </div>
                          {skill.current === 0 && <span className="skill-analysis__bar-value skill-analysis__bar-value--empty">{skill.current}</span>}
                        </div>
                        <span className="skill-analysis__bar-total">{skill.total}</span>
                      </div>
                    </div>
                  </li>
                ))}
                </ul>
              </div>
            </div>
            <div className="skill-analysis__card skill-analysis__card--strengths">
              <div className="skill-analysis__card-header skill-analysis__card-header--strengths">
                <span className="material-symbols-outlined skill-analysis__card-icon skill-analysis__card-icon--green">trending_up</span>
                <span>Skill strengths</span>
                <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
              </div>
              <div className="skill-analysis__interests-list-wrap">
                <ul className="skill-analysis__list">
                {skillStrengths.map((skill) => (
                  <li
                    key={skill.name}
                    role="button"
                    tabIndex={0}
                    className="skill-analysis__item"
                    onClick={() => {
                      setSelectedSkillStrength(skill.name)
                      setSelectedSkillGap(null)
                      setSelectedSkillInterest(null)
                      setSelectedRole(null)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && (setSelectedSkillStrength(skill.name), setSelectedSkillGap(null), setSelectedSkillInterest(null), setSelectedRole(null))}
                  >
                    <span className="skill-analysis__skill-name">{skill.name}</span>
                    <div className="skill-analysis__item-right">
                      <span className="material-symbols-outlined skill-analysis__person-icon">person</span>
                      <div className="skill-analysis__bar-wrap">
                        <div className="skill-analysis__bar">
                          <div className="skill-analysis__bar-fill" style={{ width: `${skill.total > 0 ? (skill.current / skill.total) * 100 : 0}%` }}>
                            {skill.current > 0 && <span className="skill-analysis__bar-value">{skill.current}</span>}
                          </div>
                          {skill.current === 0 && <span className="skill-analysis__bar-value skill-analysis__bar-value--empty">{skill.current}</span>}
                        </div>
                        <span className="skill-analysis__bar-total">{skill.total}</span>
                      </div>
                    </div>
                  </li>
                ))}
                </ul>
              </div>
            </div>
            <div className="skill-analysis__card skill-analysis__card--interests">
              <div className="skill-analysis__card-header skill-analysis__card-header--interests">
                <span className="material-symbols-outlined skill-analysis__card-icon">settings</span>
                <span>Skill interests</span>
                <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
              </div>
              <div className="skill-analysis__interests-list-wrap">
                <ul className="skill-analysis__list">
                  {skillInterestsSortedByCount.map((skill) => (
                    <li
                      key={skill.name}
                      role="button"
                      tabIndex={0}
                      className="skill-analysis__item skill-analysis__item--no-input skill-analysis__item--interests"
                      onClick={() => {
                        setSelectedSkillInterest(skill.name)
                        setSelectedSkillGap(null)
                        setSelectedSkillStrength(null)
                        setSelectedRole(null)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && (setSelectedSkillInterest(skill.name), setSelectedSkillGap(null), setSelectedSkillStrength(null), setSelectedRole(null))}
                    >
                      <span className="skill-analysis__skill-name">{skill.name}</span>
                      <div className="skill-analysis__item-right">
                        <span className="material-symbols-outlined skill-analysis__person-icon">person</span>
                        <span className="skill-analysis__count">{skill.count}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          /* Skills overview / Team statistics / Team insights: Employee skills, Popular skills, Roles */
          <>
            <div className="skill-analysis__card skill-analysis__card--employees">
              <div className="skill-analysis__card-header skill-analysis__card-header--employees">
                <span className="material-symbols-outlined skill-analysis__card-icon">person</span>
                <span>Employee skills</span>
                <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
              </div>
              <div className="skill-analysis__interests-list-wrap">
                <ul className="skill-analysis__list">
                  {cardsForCards.map((person) => {
                    const below = person.skillGaps?.length ?? 0
                    const exceeds = person.skillStrengths?.length ?? 0
                    const total = 18
                    const meets = Math.max(0, total - below - exceeds)
                    return (
                      <li key={person.id} className="skill-analysis__item skill-analysis__item--employee">
                        <div className="skill-analysis__employee-info">
                          <Avatar initials={person.initials ?? '?'} avatarColor={person.avatarColor ?? '#D9DCE1'} avatarPhotoSrc={person.avatarPhotoSrc} size="sm" />
                          <span className="skill-analysis__employee-name">{person.name ?? ''}</span>
                        </div>
                        <div className="skill-analysis__item-right skill-analysis__item-right--stacked">
                          <div className="skill-analysis__req-tags">
                            <span className="skill-analysis__req-tag skill-analysis__req-tag--below"><span className="material-symbols-outlined">trending_down</span>{below}</span>
                            <span className="skill-analysis__req-tag skill-analysis__req-tag--meets"><span className="material-symbols-outlined">check</span>{meets}</span>
                            <span className="skill-analysis__req-tag skill-analysis__req-tag--exceeds"><span className="material-symbols-outlined">trending_up</span>{exceeds}</span>
                          </div>
                          <div className="skill-analysis__req-bar">
                            <div className="skill-analysis__req-seg skill-analysis__req-seg--below" style={{ width: `${total ? (below / total) * 100 : 0}%` }} />
                            <div className="skill-analysis__req-seg skill-analysis__req-seg--meets" style={{ width: `${total ? (meets / total) * 100 : 0}%` }} />
                            <div className="skill-analysis__req-seg skill-analysis__req-seg--exceeds" style={{ width: `${total ? (exceeds / total) * 100 : 0}%` }} />
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
            <div className="skill-analysis__card skill-analysis__card--popular">
              <div className="skill-analysis__card-header skill-analysis__card-header--popular">
                <span className="material-symbols-outlined skill-analysis__card-icon skill-analysis__card-icon--trophy">emoji_events</span>
                <span>Popular skills</span>
                <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
              </div>
              <div className="skill-analysis__interests-list-wrap">
                <ul className="skill-analysis__list">
                  {popularSkills.map((skill) => (
                    <li
                      key={skill.name}
                      role="button"
                      tabIndex={0}
                      className="skill-analysis__item skill-analysis__item--no-input skill-analysis__item--interests"
                      onClick={() => {
                        setSelectedSkillStrength(skill.name)
                        setSelectedSkillGap(null)
                        setSelectedSkillInterest(null)
                        setSelectedRole(null)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && (setSelectedSkillStrength(skill.name), setSelectedSkillGap(null), setSelectedSkillInterest(null), setSelectedRole(null))}
                    >
                      <span className="skill-analysis__skill-name">{skill.name}</span>
                      <div className="skill-analysis__item-right">
                        <span className="material-symbols-outlined skill-analysis__person-icon">person</span>
                        <span className="skill-analysis__count">{skill.count}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="skill-analysis__card skill-analysis__card--roles">
              <div className="skill-analysis__card-header skill-analysis__card-header--roles">
                <span className="material-symbols-outlined skill-analysis__card-icon">work</span>
                <span>Roles</span>
                <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
              </div>
              <div className="skill-analysis__interests-list-wrap">
                <ul className="skill-analysis__list">
                  {rolesWithCountAndPct.map(({ role, count, percentage }) => (
                    <li
                      key={role}
                      role="button"
                      tabIndex={0}
                      className="skill-analysis__item skill-analysis__item--no-input skill-analysis__item--interests"
                      onClick={() => {
                        setSelectedRole(role)
                        setSelectedSkillGap(null)
                        setSelectedSkillStrength(null)
                        setSelectedSkillInterest(null)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && (setSelectedRole(role), setSelectedSkillGap(null), setSelectedSkillStrength(null), setSelectedSkillInterest(null))}
                    >
                      <span className="skill-analysis__skill-name">{role}</span>
                      <div className="skill-analysis__item-right">
                        <span className="material-symbols-outlined skill-analysis__person-icon">person</span>
                        <span className="skill-analysis__count">{count}</span>
                        <span className="skill-analysis__percentage">({percentage}%)</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>

      {isLaura && (
        <div className="skill-analysis__stat-cards">
          <div
            role="button"
            tabIndex={0}
            className={`skill-analysis__stat-card ${sustainedHighPerformersFilter ? 'skill-analysis__stat-card--active' : ''}`}
            onClick={onSustainedHighPerformersClick}
            onKeyDown={(e) => { if (e.key === 'Enter') onSustainedHighPerformersClick?.() }}
          >
            <span className="skill-analysis__stat-help-wrap" onClick={(e) => e.stopPropagation()}>
              <span className="material-symbols-outlined skill-analysis__stat-help" aria-label="More information">help</span>
              <span className="skill-analysis__stat-tooltip">Employees who have consistently met or exceeded performance expectations over multiple review cycles</span>
            </span>
            <span className="skill-analysis__stat-label">Sustained High Performers</span>
            <span className="skill-analysis__stat-value">8.4% of Workforce</span>
          </div>
          <div className="skill-analysis__stat-card">
            <span className="skill-analysis__stat-help-wrap">
              <span className="material-symbols-outlined skill-analysis__stat-help" aria-label="More information">help</span>
              <span className="skill-analysis__stat-tooltip">Average tenure of employees in their current job level</span>
            </span>
            <span className="skill-analysis__stat-label">Avg Time in Level</span>
            <span className="skill-analysis__stat-value">2.4 yrs</span>
          </div>
          <div className="skill-analysis__stat-card">
            <span className="skill-analysis__stat-help-wrap">
              <span className="material-symbols-outlined skill-analysis__stat-help" aria-label="More information">help</span>
              <span className="skill-analysis__stat-tooltip">Percentage of employees at or near the maximum of their pay band</span>
            </span>
            <span className="skill-analysis__stat-label">% Near Pay Band Max</span>
            <span className="skill-analysis__stat-value">18%</span>
          </div>
          <div className="skill-analysis__stat-card">
            <span className="skill-analysis__stat-help-wrap">
              <span className="material-symbols-outlined skill-analysis__stat-help" aria-label="More information">help</span>
              <span className="skill-analysis__stat-tooltip">Employees identified as high risk of voluntary turnover</span>
            </span>
            <span className="skill-analysis__stat-label">% High Flight Risk</span>
            <span className="skill-analysis__stat-value">12%</span>
          </div>
        </div>
      )}

      <div className="skill-analysis__filters skill-analysis__filters--bottom">
        {selectedSkillGap && (
          <span className="skill-analysis__filter-tag-wrap">
            <span className="skill-analysis__filter-tag skill-analysis__filter-tag--gaps">
              <span className="material-symbols-outlined skill-analysis__filter-tag-icon">trending_down</span>
              <span className="skill-analysis__filter-tag-label">Skill gaps</span>
              <span className="skill-analysis__filter-tag-sep">&gt;</span>
              <span className="skill-analysis__filter-tag-value">{selectedSkillGap}</span>
              <button
                type="button"
                className="skill-analysis__filter-tag-remove"
                onClick={() => setSelectedSkillGap(null)}
                aria-label={`Remove ${selectedSkillGap} filter`}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </span>
            <Button variant="secondary" size="icon-sm" className="skill-analysis__filter-tag-more" aria-label="More options">
              <span className="material-symbols-outlined">more_vert</span>
            </Button>
          </span>
        )}
        {selectedSkillStrength && (
          <span className="skill-analysis__filter-tag-wrap">
            <span className="skill-analysis__filter-tag skill-analysis__filter-tag--popular">
              <span className="material-symbols-outlined skill-analysis__filter-tag-icon">emoji_events</span>
              <span className="skill-analysis__filter-tag-label">Popular skills</span>
              <span className="skill-analysis__filter-tag-sep">&gt;</span>
              <span className="skill-analysis__filter-tag-value">{selectedSkillStrength}</span>
              <button
                type="button"
                className="skill-analysis__filter-tag-remove"
                onClick={() => setSelectedSkillStrength(null)}
                aria-label={`Remove ${selectedSkillStrength} filter`}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </span>
            <Button variant="secondary" size="icon-sm" className="skill-analysis__filter-tag-more" aria-label="More options">
              <span className="material-symbols-outlined">more_vert</span>
            </Button>
          </span>
        )}
        {selectedSkillInterest && (
          <span className="skill-analysis__filter-tag-wrap">
            <span className="skill-analysis__filter-tag skill-analysis__filter-tag--interests">
              <span className="material-symbols-outlined skill-analysis__filter-tag-icon">star</span>
              <span className="skill-analysis__filter-tag-label">Skill interests</span>
              <span className="skill-analysis__filter-tag-sep">&gt;</span>
              <span className="skill-analysis__filter-tag-value">{selectedSkillInterest}</span>
              <button
                type="button"
                className="skill-analysis__filter-tag-remove"
                onClick={() => setSelectedSkillInterest(null)}
                aria-label={`Remove ${selectedSkillInterest} filter`}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </span>
            <Button variant="secondary" size="icon-sm" className="skill-analysis__filter-tag-more" aria-label="More options">
              <span className="material-symbols-outlined">more_vert</span>
            </Button>
          </span>
        )}
        {selectedRole && (
          <span className="skill-analysis__filter-tag-wrap">
            <span className="skill-analysis__filter-tag skill-analysis__filter-tag--default">
              <span className="material-symbols-outlined skill-analysis__filter-tag-icon">work</span>
              <span className="skill-analysis__filter-tag-label">Roles</span>
              <span className="skill-analysis__filter-tag-sep">&gt;</span>
              <span className="skill-analysis__filter-tag-value">{selectedRole}</span>
              <button
                type="button"
                className="skill-analysis__filter-tag-remove"
                onClick={() => setSelectedRole(null)}
                aria-label={`Remove ${selectedRole} filter`}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </span>
            <Button variant="secondary" size="icon-sm" className="skill-analysis__filter-tag-more" aria-label="More options">
              <span className="material-symbols-outlined">more_vert</span>
            </Button>
          </span>
        )}
        {selectedJobLevels.length > 0 && (
          <span className="skill-analysis__filter-tag-wrap">
            <span className="skill-analysis__filter-tag skill-analysis__filter-tag--default">
              <span className="material-symbols-outlined skill-analysis__filter-tag-icon">badge</span>
              <span className="skill-analysis__filter-tag-label">Job level</span>
              <span className="skill-analysis__filter-tag-sep">&gt;</span>
              <span className="skill-analysis__filter-tag-value">{selectedJobLevels.join(', ')}</span>
              <button
                type="button"
                className="skill-analysis__filter-tag-remove"
                onClick={() => setSelectedJobLevels([])}
                aria-label="Clear job level filter"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </span>
          </span>
        )}
        {!(selectedSkillGap || selectedSkillStrength || selectedSkillInterest || selectedRole) && (
          <>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="secondary"
                  className="skill-analysis__filter-select skill-analysis__roles-trigger"
                  aria-label="Role filter (people list)"
                >
                  <span className="skill-analysis__roles-trigger-label">
                    {selectedRolesPeople.length === 0 ? 'Role' : `${selectedRolesPeople.length} role${selectedRolesPeople.length === 1 ? '' : 's'} selected`}
                  </span>
                  <span className="material-symbols-outlined skill-analysis__roles-chevron">expand_more</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="skill-analysis__roles-content" align="start" sideOffset={4}>
                  <div className="skill-analysis__roles-list">
                    <DropdownMenu.CheckboxItem
                      className="skill-analysis__roles-item"
                      checked={selectedRolesPeople.length === 0}
                      onCheckedChange={(checked) => checked && setSelectedRolesPeople([])}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="skill-analysis__roles-checkbox" aria-hidden>
                        <DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator">
                          <span className="material-symbols-outlined">check</span>
                        </DropdownMenu.ItemIndicator>
                      </span>
                      All roles
                    </DropdownMenu.CheckboxItem>
                    {ROLES_FOR_TEAM.map((role) => (
                      <DropdownMenu.CheckboxItem
                        key={role}
                        className="skill-analysis__roles-item"
                        checked={selectedRolesPeople.includes(role)}
                        onCheckedChange={(checked) => toggleRolePeople(role, checked === true)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <span className="skill-analysis__roles-checkbox" aria-hidden>
                          <DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator">
                            <span className="material-symbols-outlined">check</span>
                          </DropdownMenu.ItemIndicator>
                        </span>
                        {role}
                      </DropdownMenu.CheckboxItem>
                    ))}
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <DropdownMenu.Root onOpenChange={(open) => !open && setSkillsSearch('')}>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="secondary"
                  className="skill-analysis__filter-select skill-analysis__skills-trigger"
                  aria-label="Skills filter (people list)"
                >
                  <span className="skill-analysis__skills-trigger-label">
                    {selectedSkillsPeople.length === 0 ? 'Skills' : `${selectedSkillsPeople.length} skill${selectedSkillsPeople.length === 1 ? '' : 's'} selected`}
                  </span>
                  <span className="material-symbols-outlined skill-analysis__skills-chevron">expand_more</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="skill-analysis__skills-content" align="start" sideOffset={4} onCloseAutoFocus={(e) => e.preventDefault()}>
                  <div className="skill-analysis__skills-search-wrap">
                    <span className="material-symbols-outlined skill-analysis__skills-search-icon">search</span>
                    <input
                      type="search"
                      placeholder="Search skills"
                      className="skill-analysis__skills-search-input"
                      value={skillsSearch}
                      onChange={(e) => setSkillsSearch(e.target.value)}
                      onPointerDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="skill-analysis__skills-list">
                    <DropdownMenu.CheckboxItem
                      className="skill-analysis__skills-item"
                      checked={selectedSkillsPeople.length === 0}
                      onCheckedChange={(checked) => checked && setSelectedSkillsPeople([])}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="skill-analysis__skills-checkbox" aria-hidden>
                        <DropdownMenu.ItemIndicator className="skill-analysis__skills-indicator">
                          <span className="material-symbols-outlined">check</span>
                        </DropdownMenu.ItemIndicator>
                      </span>
                      All skills
                    </DropdownMenu.CheckboxItem>
                    {filteredSkills.map((skill) => (
                      <DropdownMenu.CheckboxItem
                        key={skill}
                        className="skill-analysis__skills-item"
                        checked={selectedSkillsPeople.includes(skill)}
                        onCheckedChange={(checked) => toggleSkillPeople(skill, checked === true)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <span className="skill-analysis__skills-checkbox" aria-hidden>
                          <DropdownMenu.ItemIndicator className="skill-analysis__skills-indicator">
                            <span className="material-symbols-outlined">check</span>
                          </DropdownMenu.ItemIndicator>
                        </span>
                        {skill}
                      </DropdownMenu.CheckboxItem>
                    ))}
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="secondary"
                  className="skill-analysis__filter-select skill-analysis__roles-trigger"
                  aria-label="Job level filter"
                >
                  <span className="skill-analysis__roles-trigger-label">
                    {selectedJobLevels.length === 0 ? 'Job level' : `${selectedJobLevels.length} level${selectedJobLevels.length === 1 ? '' : 's'} selected`}
                  </span>
                  <span className="material-symbols-outlined skill-analysis__roles-chevron">expand_more</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="skill-analysis__roles-content" align="start" sideOffset={4}>
                  <div className="skill-analysis__roles-list">
                    <DropdownMenu.CheckboxItem
                      className="skill-analysis__roles-item"
                      checked={selectedJobLevels.length === 0}
                      onCheckedChange={(checked) => checked && setSelectedJobLevels([])}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="skill-analysis__roles-checkbox" aria-hidden>
                        <DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator">
                          <span className="material-symbols-outlined">check</span>
                        </DropdownMenu.ItemIndicator>
                      </span>
                      All levels
                    </DropdownMenu.CheckboxItem>
                    {JOB_LEVELS.map((level) => (
                      <DropdownMenu.CheckboxItem
                        key={level}
                        className="skill-analysis__roles-item"
                        checked={selectedJobLevels.includes(level)}
                        onCheckedChange={(checked) => toggleJobLevel(level, checked === true)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <span className="skill-analysis__roles-checkbox" aria-hidden>
                          <DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator">
                            <span className="material-symbols-outlined">check</span>
                          </DropdownMenu.ItemIndicator>
                        </span>
                        {level}
                      </DropdownMenu.CheckboxItem>
                    ))}
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <Select defaultValue="dev-plan">
              <SelectTrigger variant="secondary" className="skill-analysis__filter-select">
                <SelectValue placeholder="Development Plan Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev-plan">Development Plan Status</SelectItem>
              </SelectContent>
            </Select>
            <div className="skill-analysis__search">
              <span className="material-symbols-outlined skill-analysis__search-icon">search</span>
              <input type="search" placeholder="Search name or role" className="skill-analysis__search-input" />
            </div>
          </>
        )}
        {(selectedSkillGap || selectedSkillStrength || selectedSkillInterest || selectedRole || selectedRolesPeople.length > 0 || selectedSkillsPeople.length > 0 || selectedJobLevels.length > 0) && (
          <Button
            className="skill-analysis__assign-btn"
            variant="outline"
            leadingIcon={<span className="material-symbols-outlined">assignment</span>}
          >
            Assign development plan
          </Button>
        )}
      </div>

      <div className="skill-analysis__results">
        <span className="skill-analysis__results-text">
          Showing {(selectedSkillGap || selectedSkillStrength || selectedSkillInterest || selectedRole || selectedRolesPeople.length > 0 || selectedSkillsPeople.length > 0 || selectedJobLevels.length > 0 || sustainedHighPerformersFilter) ? filteredResultsCount : (scope === 'all' ? tabCounts.all : tabCounts.direct)} results
        </span>
        <Button variant="secondary" size="sm" className="skill-analysis__select-all">Select all on this page</Button>
        <div className="skill-analysis__results-sort">
          <Select value={sortBy} onValueChange={(v: string) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger variant="secondary" className="skill-analysis__sort-select">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating-desc">Rating (high to low)</SelectItem>
              <SelectItem value="rating-asc">Rating (low to high)</SelectItem>
              <SelectItem value="gap-desc">Gap from benchmark (high to low)</SelectItem>
              <SelectItem value="alphabetical">Alphabetical (A to Z)</SelectItem>
              <SelectItem value="tenure">Tenure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <UserCardList
        reportScope={scope}
        sustainedHighPerformersFilter={sustainedHighPerformersFilter}
        selectedSkillGap={selectedSkillGap}
        selectedSkillStrength={selectedSkillStrength}
        selectedSkillInterest={selectedSkillInterest}
        selectedRole={selectedRole}
        selectedRoles={selectedRolesPeople}
        selectedSkills={selectedSkillsPeople}
        selectedJobLevels={selectedJobLevels}
        sortBy={sortBy}
        riskTagOverrides={riskTagOverrides}
        onRiskTagsChange={(userId, riskTags) => setRiskTagOverrides((prev) => ({ ...prev, [userId]: riskTags }))}
      />
      </>
      )}
    </div>
  )
}
