import { useMemo, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useUser } from '../contexts/UserContext'
import { MATEO_USER_CARDS, MATEO_ALL_REPORTS_CARDS, LAURA_USER_CARDS, LAURA_ALL_REPORTS_CARDS, CHRO_USER_CARDS, CHRO_ALL_REPORTS_CARDS } from '../data/teamData'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SkillTag,
} from '@tonyh-2-eightfold/ef-design-system'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import type { RiskTag, UserCardData } from './UserCard'
import { UserCardList } from './UserCardList'
import { EditSkillAssessmentsSheet } from './EditSkillAssessmentsSheet'

/** Unique role titles across the team (from team data) */
const ROLES_FOR_TEAM: string[] = (() => {
  const titles = new Set<string>()
  ;[...MATEO_USER_CARDS, ...LAURA_USER_CARDS, ...CHRO_USER_CARDS].forEach((c) => titles.add(c.title))
  return Array.from(titles).sort()
})()

/* Totals = 8 direct reports; current = how many have the skill (gaps = need it by role, strengths = have it) */
const MATEO_SKILL_GAPS = [
  { name: 'AI-assisted workflows', current: 4, total: 14 },
  { name: 'Renewal forecasting', current: 5, total: 14 },
  { name: 'Churn risk analysis', current: 5, total: 14 },
  { name: 'Data-driven QBRs', current: 6, total: 14 },
  { name: 'Expansion selling', current: 6, total: 14 },
  { name: 'Escalation management', current: 7, total: 14 },
  { name: 'Executive alignment', current: 8, total: 14 },
  { name: 'Product depth', current: 9, total: 14 },
]

const MATEO_SKILL_STRENGTHS = [
  { name: 'CRM proficiency', current: 14, total: 14 },
  { name: 'Communication', current: 14, total: 14 },
  { name: 'Account relationship management', current: 11, total: 14 },
  { name: 'Customer advocacy', current: 10, total: 14 },
  { name: 'Onboarding execution', current: 9, total: 14 },
  { name: 'QBR facilitation', current: 8, total: 14 },
  { name: 'Stakeholder management', current: 7, total: 14 },
  { name: 'Data analysis', current: 6, total: 14 },
  { name: 'Technical troubleshooting', current: 5, total: 14 },
]

const MATEO_SKILL_INTERESTS = [
  { name: 'AI-assisted workflows', count: 11 },
  { name: 'Revenue Operations', count: 9 },
  { name: 'Customer Success Operations', count: 8 },
  { name: 'Account Management Leadership', count: 7 },
  { name: 'Product Management', count: 5 },
  { name: 'Data & Analytics', count: 4 },
  { name: 'Cross-Functional Team Leadership', count: 3 },
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

const MATEO_TAB_COUNTS = { direct: 8, all: 8 }

/* CHRO — 6 VP-level direct reports */
const CHRO_SKILL_GAPS = [
  { name: 'AI-driven talent strategy' },
  { name: 'Workforce analytics' },
  { name: 'Skills-based organization design' },
  { name: 'Organizational network analysis' },
  { name: 'Change management at scale' },
  { name: 'Executive coaching' },
]

const CHRO_SKILL_STRENGTHS = [
  { name: 'Executive communication' },
  { name: 'People analytics' },
  { name: 'Organizational design' },
  { name: 'Culture & employee experience' },
  { name: 'Talent acquisition strategy' },
  { name: 'Total rewards strategy' },
  { name: 'Talent management' },
  { name: 'HR technology leadership' },
  { name: 'Coaching' },
]

const CHRO_SKILL_INTERESTS = [
  { name: 'AI workforce transformation' },
  { name: 'Skills-based organization' },
  { name: 'People analytics & AI' },
  { name: 'Future of work' },
  { name: 'Talent marketplace' },
]

const CHRO_TAB_COUNTS = { direct: 6, all: 6 }

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

/** Skills required for a given role title (from gap + strength role mappings) */
function getRequiredSkillsForTitle(title: string): string[] {
  const set = new Set<string>()
  for (const [skill, roles] of Object.entries(ROLES_REQUIRING_SKILL_GAP)) {
    if (roles.includes(title)) set.add(skill)
  }
  for (const [skill, roles] of Object.entries(ROLES_REQUIRING_SKILL_STRENGTH)) {
    if (roles.includes(title)) set.add(skill)
  }
  return Array.from(set).sort()
}

/** Default proficiency when no saved value: gap = 1.5, strength = 4.2, else 3.5 (matches sheet) */
function getDefaultProficiencyForSkill(skillName: string, user: UserCardData): number {
  if (user.skillGaps?.includes(skillName)) return 1.5
  if (user.skillStrengths?.includes(skillName)) return 4.2
  return 3.5
}

/** Below/meets/exceeds counts for required-by-role skills; uses saved proficiencies when present */
function getEmployeeSkillCounts(
  person: UserCardData,
  savedProficiencies: Record<string, Record<string, number>> | undefined
): { below: number; meets: number; exceeds: number; total: number } {
  const required = getRequiredSkillsForTitle(person.title)
  const total = required.length
  if (total === 0) return { below: 0, meets: 0, exceeds: 0, total: 0 }
  let below = 0
  let meets = 0
  let exceeds = 0
  const byUser = savedProficiencies?.[person.id]
  for (const skillName of required) {
    const p = byUser?.[skillName] ?? getDefaultProficiencyForSkill(skillName, person)
    if (p < 2.5) below += 1
    else if (p > 3.5) exceeds += 1
    else meets += 1
  }
  return { below, meets, exceeds, total }
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

type ViewFilterValue = 'gaps' | 'skills-overview' | 'team-statistics'

/** Team statistics view: stat card ids and labels; counts/computed from cardsForScope */
const TEAM_STAT_CARD_DEFS = [
  { id: 'all', label: 'All reports' },
  { id: 'pending-onboarding', label: 'Pending onboarding' },
  { id: 'without-role-interests', label: 'Without role interests' },
  { id: 'missing-retention-risks', label: 'Missing retention risks' },
  { id: 'missing-loss-impact', label: 'Missing loss impact' },
  { id: 'without-self-assessments', label: 'Without self assessments' },
  { id: 'without-development-plans', label: 'Without development plans' },
] as const

interface SkillAnalysisSectionProps {
  reportScope: 'direct' | 'all'
  onReportScopeChange: (scope: 'direct' | 'all') => void
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
  const isLaura = currentUser.id === 'jaydon-torff'
  const isChro = currentUser.id === 'chro'

  const cardsForScope = scope === 'all'
    ? (isLaura ? LAURA_ALL_REPORTS_CARDS : isChro ? CHRO_ALL_REPORTS_CARDS : MATEO_ALL_REPORTS_CARDS)
    : (isLaura ? LAURA_USER_CARDS : isChro ? CHRO_USER_CARDS : MATEO_USER_CARDS)

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
  const [selectedTenure, setSelectedTenure] = useState<string>('')
  const [selectedRetentionRisk, setSelectedRetentionRisk] = useState<string>('')
  const [selectedLossImpact, setSelectedLossImpact] = useState<string>('')
  const [selectedDevPlanStatus, setSelectedDevPlanStatus] = useState<string>('')
  const [skillsSearch, setSkillsSearch] = useState('')
  const [riskTagOverrides, setRiskTagOverrides] = useState<Record<string, RiskTag[]>>({})
  const [skillAssessmentPerson, setSkillAssessmentPerson] = useState<UserCardData | null>(null)
  /** Saved skill proficiencies per user (userId -> skillName -> value); used by sheet and Employee skills card */
  const [skillProficiencies, setSkillProficiencies] = useState<Record<string, Record<string, number>>>({})
  /** When in Team statistics view, which filter card is selected (replaces skill cards with stat bar) */
  const [selectedStatCard, setSelectedStatCard] = useState<string | null>(null)

  /* Top bar Role/Skills filter the skill cards only (not the people list). Scope the pool for card data. */
  const cardsForCards = useMemo(() => {
    let list = cardsForScope
    if (selectedRoles.length > 0) list = list.filter((c) => selectedRoles.includes(c.title))
    if (selectedSkills.length > 0) list = list.filter((c) => (c.skillStrengths ?? []).some((s) => selectedSkills.includes(s)))
    return list
  }, [cardsForScope, selectedRoles, selectedSkills])

  /* Gaps: bar = people (in role) who have the gap; right = people whose role requires this skill. When top Skills filter is set, only show those skills. */
  const skillGaps = useMemo(() => {
    const gapNames = isLaura ? LAURA_SKILL_GAPS.map((s) => s.name) : isChro ? CHRO_SKILL_GAPS.map((s) => s.name) : MATEO_SKILL_GAPS.map((s) => s.name)
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
    const strengthNames = isLaura ? LAURA_SKILL_STRENGTHS.map((s) => s.name) : isChro ? CHRO_SKILL_STRENGTHS.map((s) => s.name) : MATEO_SKILL_STRENGTHS.map((s) => s.name)
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
    const interestNames = isLaura ? LAURA_SKILL_INTERESTS.map((s) => s.name) : isChro ? CHRO_SKILL_INTERESTS.map((s) => s.name) : MATEO_SKILL_INTERESTS.map((s) => s.name)
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

  /* Employee skills card: sort people by deficit (below) count, highest first */
  const employeeSkillsListSorted = useMemo(() => {
    return [...cardsForCards].sort((a, b) => {
      const aBelow = getEmployeeSkillCounts(a, skillProficiencies).below
      const bBelow = getEmployeeSkillCounts(b, skillProficiencies).below
      return bBelow - aBelow
    })
  }, [cardsForCards, skillProficiencies])

  const tabCounts = isLaura ? LAURA_TAB_COUNTS : isChro ? CHRO_TAB_COUNTS : MATEO_TAB_COUNTS

  const filteredResultsCount = useMemo(() => {
    let list = cardsForScope
    const getRiskTags = (c: UserCardData) => riskTagOverrides[c.id] ?? c.riskTags
    if (selectedSkillGap) list = list.filter((c) => c.skillGaps?.includes(selectedSkillGap))
    if (selectedSkillStrength) list = list.filter((c) => c.skillStrengths?.includes(selectedSkillStrength))
    if (selectedSkillInterest) list = list.filter((c) => c.skillInterests?.includes(selectedSkillInterest))
    if (selectedRole) list = list.filter((c) => c.title === selectedRole)
    else if (selectedRolesPeople.length > 0) list = list.filter((c) => selectedRolesPeople.includes(c.title))
    if (selectedSkillStrength) list = list.filter((c) => c.skillStrengths?.includes(selectedSkillStrength))
    else if (selectedSkillsPeople.length > 0) list = list.filter((c) => (c.skillStrengths ?? []).some((s) => selectedSkillsPeople.includes(s)))
    if (selectedJobLevels.length > 0) list = list.filter((c) => selectedJobLevels.includes(getJobLevelFromTitle(c.title)))
    /* Team statistics–only filters */
    if (viewFilter === 'team-statistics') {
      if (selectedTenure) {
        list = list.filter((c) => {
          const y = c.tenureYears ?? 0
          if (selectedTenure === '<1') return y < 1
          if (selectedTenure === '1-2') return y >= 1 && y < 2
          if (selectedTenure === '2-5') return y >= 2 && y < 5
          if (selectedTenure === '5+') return y >= 5
          return true
        })
      }
      if (selectedRetentionRisk) list = list.filter((c) => getRiskTags(c).find((t) => t.label === 'Retention risk')?.value === selectedRetentionRisk)
      if (selectedLossImpact) list = list.filter((c) => getRiskTags(c).find((t) => t.label === 'Loss impact')?.value === selectedLossImpact)
      if (selectedDevPlanStatus) {
        list = list.filter((c) => {
          const dp = c.developmentPlanning ?? ''
          if (selectedDevPlanStatus === 'not-started') return /not started/i.test(dp)
          if (selectedDevPlanStatus === 'in-progress') return /not started/i.test(dp) && !/all complete/i.test(dp)
          if (selectedDevPlanStatus === 'complete') return /all complete/i.test(dp)
          return true
        })
      }
    }
    if (isLaura && sustainedHighPerformersFilter) list = list.filter((c) => c.highTenureNoPromotion === true)
    return list.length
  }, [cardsForScope, viewFilter, selectedSkillGap, selectedSkillStrength, selectedSkillInterest, selectedRole, selectedRolesPeople, selectedSkillsPeople, selectedJobLevels, selectedTenure, selectedRetentionRisk, selectedLossImpact, selectedDevPlanStatus, isLaura, sustainedHighPerformersFilter, riskTagOverrides])

  /* Team statistics: stat cards with counts/pct derived from current scope (direct vs all reports) */
  const teamStatFilterCards = useMemo(() => {
    const list = cardsForScope
    const total = list.length
    const getRiskTags = (c: UserCardData) => riskTagOverrides[c.id] ?? c.riskTags
    const pendingOnboarding = list.filter((c) => (c.tenureYears ?? 0) <= 1 && (c.selfAssessment === 'No assessment' || !c.selfAssessment)).length
    const withoutRoleInterests = list.filter((c) => (c.careerInterests ?? '') === 'No roles added').length
    const missingRetentionRisks = list.filter((c) => {
      const tag = getRiskTags(c).find((t) => t.label === 'Retention risk')
      return !tag || tag.isEmpty || !tag.value
    }).length
    const missingLossImpact = list.filter((c) => {
      const tag = getRiskTags(c).find((t) => t.label === 'Loss impact')
      return !tag || tag.isEmpty || !tag.value
    }).length
    const withoutSelfAssessments = list.filter((c) => (c.selfAssessment ?? '') === 'No assessment').length
    const withoutDevelopmentPlans = list.filter((c) => /not started/i.test(c.developmentPlanning ?? '')).length
    const counts: Record<string, number> = {
      all: total,
      'pending-onboarding': pendingOnboarding,
      'without-role-interests': withoutRoleInterests,
      'missing-retention-risks': missingRetentionRisks,
      'missing-loss-impact': missingLossImpact,
      'without-self-assessments': withoutSelfAssessments,
      'without-development-plans': withoutDevelopmentPlans,
    }
    return TEAM_STAT_CARD_DEFS.map((def) => ({
      ...def,
      count: counts[def.id] ?? 0,
      pct: total ? Math.round((counts[def.id] ?? 0) / total * 100) : 0,
    }))
  }, [cardsForScope, riskTagOverrides])

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
          type="button"
          variant="ghost"
          className={`skill-analysis__tab ${scope === 'direct' ? 'skill-analysis__tab--active' : ''}`}
          onClick={() => setReportScope('direct')}
        >
          {isLaura ? 'Supported employees' : 'Direct reports'}
          <span className="skill-analysis__tab-badge">{tabCounts.direct}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={`skill-analysis__tab ${scope === 'all' ? 'skill-analysis__tab--active' : ''}`}
          onClick={() => setReportScope('all')}
        >
          {isLaura ? 'All supported' : 'All reports'}
          <span className="skill-analysis__tab-badge">{tabCounts.all}</span>
        </Button>
      </div>

      <div className="skill-analysis__filters skill-analysis__filters--top">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="primary"
              className="skill-analysis__filter-select skill-analysis__roles-trigger skill-analysis__view-trigger"
              aria-label="View"
            >
              <span className="skill-analysis__roles-trigger-label">
                View: {viewFilter === 'gaps' ? 'Gaps analysis' : viewFilter === 'skills-overview' ? 'Skills overview' : 'Team statistics'}
              </span>
              <span className="material-symbols-outlined skill-analysis__roles-chevron">expand_more</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="skill-analysis__roles-content" align="start" sideOffset={4}>
              <div className="skill-analysis__roles-list">
                <DropdownMenu.Item
                  className="skill-analysis__roles-item"
                  onSelect={() => setViewFilter('gaps')}
                >
                  Gaps analysis
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="skill-analysis__roles-item"
                  onSelect={() => setViewFilter('skills-overview')}
                >
                  Skills overview
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="skill-analysis__roles-item"
                  onSelect={() => setViewFilter('team-statistics')}
                >
                  Team statistics
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
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

      <>
      {viewFilter === 'team-statistics' && (
        <div className="skill-analysis__view-stat-cards">
          {teamStatFilterCards.map((card) => {
            const isActive = (selectedStatCard ?? 'all') === card.id
            const valueText = card.id === 'all' ? String(card.count) : `${card.count} (${card.pct}%)`
            return (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                className={`skill-analysis__view-stat-card ${isActive ? 'skill-analysis__view-stat-card--active' : ''}`}
                onClick={() => setSelectedStatCard(isActive ? null : card.id)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedStatCard(isActive ? null : card.id)}
              >
                <span className="skill-analysis__view-stat-label">{card.label}</span>
                <span className="skill-analysis__view-stat-value">{valueText}</span>
              </div>
            )
          })}
        </div>
      )}
      <div className="skill-analysis__cards">
        {viewFilter === 'gaps' ? (
          /* Gaps analysis: first view – Skill gaps, Skill strengths, Skill interests */
          <>
            <div className="skill-analysis__card skill-analysis__card--gaps">
              <div className="skill-analysis__card-header skill-analysis__card-header--gaps">
                <span className="material-symbols-outlined skill-analysis__card-icon skill-analysis__card-icon--red" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_circle_down</span>
                <span>Skill gaps</span>
                <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Skills with most employees rated below benchmark" title="Skills with most employees rated below benchmark">info</span>
              </div>
              <div className="skill-analysis__interests-list-wrap">
                <ul className="skill-analysis__list">
                {skillGaps.map((skill) => (
                  <li
                    key={skill.name}
                    role="button"
                    tabIndex={0}
                    className={`skill-analysis__item${selectedSkillGap === skill.name ? ' skill-analysis__item--selected' : ''}`}
                    onClick={() => {
                      setSelectedSkillGap(skill.name)
                      setSelectedSkillStrength(null)
                      setSelectedSkillInterest(null)
                      setSelectedRole(null)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && (setSelectedSkillGap(skill.name), setSelectedSkillStrength(null), setSelectedSkillInterest(null), setSelectedRole(null))}
                  >
                    <SkillTag variant="selected" className="skill-analysis__skill-name">{skill.name}</SkillTag>
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
                <span className="material-symbols-outlined skill-analysis__card-icon skill-analysis__card-icon--green" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_circle_up</span>
                <span>Skill strengths</span>
                <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Skills with most ratings above benchmark" title="Skills with most ratings above benchmark">info</span>
              </div>
              <div className="skill-analysis__interests-list-wrap">
                <ul className="skill-analysis__list">
                {skillStrengths.map((skill) => (
                  <li
                    key={skill.name}
                    className={`skill-analysis__item${selectedSkillStrength === skill.name ? ' skill-analysis__item--selected' : ''}`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      className="skill-analysis__item-inner"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedSkillStrength(skill.name)
                        setSelectedSkillGap(null)
                        setSelectedSkillInterest(null)
                        setSelectedRole(null)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && (setSelectedSkillStrength(skill.name), setSelectedSkillGap(null), setSelectedSkillInterest(null), setSelectedRole(null))}
                    >
                      <SkillTag variant="selected" className="skill-analysis__skill-name">{skill.name}</SkillTag>
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
                    </div>
                  </li>
                ))}
                </ul>
              </div>
            </div>
            <div className="skill-analysis__card skill-analysis__card--interests">
              <div className="skill-analysis__card-header skill-analysis__card-header--interests">
                <span className="material-symbols-outlined skill-analysis__card-icon">track_changes</span>
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
                      className={`skill-analysis__item skill-analysis__item--no-input skill-analysis__item--interests${selectedSkillInterest === skill.name ? ' skill-analysis__item--selected' : ''}`}
                      onClick={() => {
                        setSelectedSkillInterest(skill.name)
                        setSelectedSkillGap(null)
                        setSelectedSkillStrength(null)
                        setSelectedRole(null)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && (setSelectedSkillInterest(skill.name), setSelectedSkillGap(null), setSelectedSkillStrength(null), setSelectedRole(null))}
                    >
                      <SkillTag variant="selected" className="skill-analysis__skill-name">{skill.name}</SkillTag>
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
        ) : viewFilter === 'team-statistics' ? null : (
          /* Skills overview / Team insights: Employee skills, Popular skills, Roles (not shown in Team statistics) */
          <>
            <div className="skill-analysis__card skill-analysis__card--employees" key={`employee-skills-${scope}`}>
              <div className="skill-analysis__card-header skill-analysis__card-header--employees">
                <span className="material-symbols-outlined skill-analysis__card-icon">person</span>
                <span>Employee skills</span>
                <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
              </div>
              <div className="skill-analysis__interests-list-wrap">
                <ul className="skill-analysis__list">
                  {employeeSkillsListSorted.map((person) => {
                    const { below, meets, exceeds, total } = getEmployeeSkillCounts(person, skillProficiencies)
                    return (
                      <li
                        key={person.id}
                        role="button"
                        tabIndex={0}
                        className="skill-analysis__item skill-analysis__item--employee"
                        onClick={() => setSkillAssessmentPerson(person)}
                        onKeyDown={(e) => e.key === 'Enter' && setSkillAssessmentPerson(person)}
                      >
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
                      className={`skill-analysis__item skill-analysis__item--no-input skill-analysis__item--interests${selectedSkillStrength === skill.name ? ' skill-analysis__item--selected' : ''}`}
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
                      className={`skill-analysis__item skill-analysis__item--no-input skill-analysis__item--interests${selectedRole === role ? ' skill-analysis__item--selected' : ''}`}
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

      {viewFilter !== 'team-statistics' && isLaura && (
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

      <>
      <div className="skill-analysis__filters skill-analysis__filters--bottom">
        {selectedSkillGap && (
          <span className="skill-analysis__filter-tag-wrap">
            <span className="skill-analysis__filter-tag skill-analysis__filter-tag--gaps">
              <span className="material-symbols-outlined skill-analysis__filter-tag-icon" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_circle_down</span>
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
            <span className="skill-analysis__filter-tag skill-analysis__filter-tag--strengths">
              <span className="material-symbols-outlined skill-analysis__filter-tag-icon" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_circle_up</span>
              <span className="skill-analysis__filter-tag-label">Skill strengths</span>
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
              <span className="material-symbols-outlined skill-analysis__filter-tag-icon">track_changes</span>
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
            {viewFilter === 'team-statistics' ? (
              /* Team statistics view: Skills, Role, Job level, Tenure, Retention risk, Loss impact, Development plan status */
              <>
                <DropdownMenu.Root onOpenChange={(open) => !open && setSkillsSearch('')}>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="secondary" className="skill-analysis__filter-select skill-analysis__skills-trigger" aria-label="Skills filter (people list)">
                      <span className="skill-analysis__roles-trigger-label">
                        {selectedSkillsPeople.length === 0 ? 'Skills' : `${selectedSkillsPeople.length} skill${selectedSkillsPeople.length === 1 ? '' : 's'} selected`}
                      </span>
                      <span className="material-symbols-outlined skill-analysis__roles-chevron">expand_more</span>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="skill-analysis__skills-content" align="start" sideOffset={4} onCloseAutoFocus={(e) => e.preventDefault()}>
                      <div className="skill-analysis__skills-search-wrap">
                        <span className="material-symbols-outlined skill-analysis__skills-search-icon">search</span>
                        <input type="search" placeholder="Search skills" className="skill-analysis__skills-search-input" value={skillsSearch} onChange={(e) => setSkillsSearch(e.target.value)} onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                      </div>
                      <div className="skill-analysis__skills-list">
                        <DropdownMenu.CheckboxItem className="skill-analysis__skills-item" checked={selectedSkillsPeople.length === 0} onCheckedChange={(checked) => checked && setSelectedSkillsPeople([])} onSelect={(e) => e.preventDefault()}>
                          <span className="skill-analysis__skills-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__skills-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                          All skills
                        </DropdownMenu.CheckboxItem>
                        {filteredSkills.map((skill) => (
                          <DropdownMenu.CheckboxItem key={skill} className="skill-analysis__skills-item" checked={selectedSkillsPeople.includes(skill)} onCheckedChange={(checked) => toggleSkillPeople(skill, checked === true)} onSelect={(e) => e.preventDefault()}>
                            <span className="skill-analysis__skills-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__skills-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                            {skill}
                          </DropdownMenu.CheckboxItem>
                        ))}
                      </div>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="secondary" className="skill-analysis__filter-select skill-analysis__roles-trigger" aria-label="Role filter (people list)">
                      <span className="skill-analysis__roles-trigger-label">{selectedRolesPeople.length === 0 ? 'Role' : `${selectedRolesPeople.length} role${selectedRolesPeople.length === 1 ? '' : 's'} selected`}</span>
                      <span className="material-symbols-outlined skill-analysis__roles-chevron">expand_more</span>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="skill-analysis__roles-content" align="start" sideOffset={4}>
                      <div className="skill-analysis__roles-list">
                        <DropdownMenu.CheckboxItem className="skill-analysis__roles-item" checked={selectedRolesPeople.length === 0} onCheckedChange={(checked) => checked && setSelectedRolesPeople([])} onSelect={(e) => e.preventDefault()}>
                          <span className="skill-analysis__roles-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                          All roles
                        </DropdownMenu.CheckboxItem>
                        {ROLES_FOR_TEAM.map((role) => (
                          <DropdownMenu.CheckboxItem key={role} className="skill-analysis__roles-item" checked={selectedRolesPeople.includes(role)} onCheckedChange={(checked) => toggleRolePeople(role, checked === true)} onSelect={(e) => e.preventDefault()}>
                            <span className="skill-analysis__roles-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                            {role}
                          </DropdownMenu.CheckboxItem>
                        ))}
                      </div>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="secondary" className="skill-analysis__filter-select skill-analysis__roles-trigger" aria-label="Job level filter">
                      <span className="skill-analysis__roles-trigger-label">{selectedJobLevels.length === 0 ? 'Job level' : `${selectedJobLevels.length} level${selectedJobLevels.length === 1 ? '' : 's'} selected`}</span>
                      <span className="material-symbols-outlined skill-analysis__roles-chevron">expand_more</span>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="skill-analysis__roles-content" align="start" sideOffset={4}>
                      <div className="skill-analysis__roles-list">
                        <DropdownMenu.CheckboxItem className="skill-analysis__roles-item" checked={selectedJobLevels.length === 0} onCheckedChange={(checked) => checked && setSelectedJobLevels([])} onSelect={(e) => e.preventDefault()}>
                          <span className="skill-analysis__roles-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                          All levels
                        </DropdownMenu.CheckboxItem>
                        {JOB_LEVELS.map((level) => (
                          <DropdownMenu.CheckboxItem key={level} className="skill-analysis__roles-item" checked={selectedJobLevels.includes(level)} onCheckedChange={(checked) => toggleJobLevel(level, checked === true)} onSelect={(e) => e.preventDefault()}>
                            <span className="skill-analysis__roles-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                            {level}
                          </DropdownMenu.CheckboxItem>
                        ))}
                      </div>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
                <Select value={selectedTenure || 'any'} onValueChange={(v: string) => setSelectedTenure(v === 'any' ? '' : v)}>
                  <SelectTrigger variant="secondary" className="skill-analysis__filter-select"><SelectValue placeholder="Tenure" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Tenure</SelectItem>
                    <SelectItem value="<1">&lt;1 year</SelectItem>
                    <SelectItem value="1-2">1-2 years</SelectItem>
                    <SelectItem value="2-5">2-5 years</SelectItem>
                    <SelectItem value="5+">5+ years</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedRetentionRisk || 'any'} onValueChange={(v: string) => setSelectedRetentionRisk(v === 'any' ? '' : v)}>
                  <SelectTrigger variant="secondary" className="skill-analysis__filter-select"><SelectValue placeholder="Retention risk" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Retention risk</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedLossImpact || 'any'} onValueChange={(v: string) => setSelectedLossImpact(v === 'any' ? '' : v)}>
                  <SelectTrigger variant="secondary" className="skill-analysis__filter-select"><SelectValue placeholder="Loss impact" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Loss impact</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedDevPlanStatus || 'any'} onValueChange={(v: string) => setSelectedDevPlanStatus(v === 'any' ? '' : v)}>
                  <SelectTrigger variant="secondary" className="skill-analysis__filter-select"><SelectValue placeholder="Development plan status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Development plan status</SelectItem>
                    <SelectItem value="not-started">Not started</SelectItem>
                    <SelectItem value="in-progress">In progress</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              /* Other views: Role, Skills, Job level, Development Plan Status placeholder, Search */
              <>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="secondary" className="skill-analysis__filter-select skill-analysis__roles-trigger" aria-label="Role filter (people list)">
                      <span className="skill-analysis__roles-trigger-label">{selectedRolesPeople.length === 0 ? 'Role' : `${selectedRolesPeople.length} role${selectedRolesPeople.length === 1 ? '' : 's'} selected`}</span>
                      <span className="material-symbols-outlined skill-analysis__roles-chevron">expand_more</span>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="skill-analysis__roles-content" align="start" sideOffset={4}>
                      <div className="skill-analysis__roles-list">
                        <DropdownMenu.CheckboxItem className="skill-analysis__roles-item" checked={selectedRolesPeople.length === 0} onCheckedChange={(checked) => checked && setSelectedRolesPeople([])} onSelect={(e) => e.preventDefault()}>
                          <span className="skill-analysis__roles-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                          All roles
                        </DropdownMenu.CheckboxItem>
                        {ROLES_FOR_TEAM.map((role) => (
                          <DropdownMenu.CheckboxItem key={role} className="skill-analysis__roles-item" checked={selectedRolesPeople.includes(role)} onCheckedChange={(checked) => toggleRolePeople(role, checked === true)} onSelect={(e) => e.preventDefault()}>
                            <span className="skill-analysis__roles-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                            {role}
                          </DropdownMenu.CheckboxItem>
                        ))}
                      </div>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
                <DropdownMenu.Root onOpenChange={(open) => !open && setSkillsSearch('')}>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="secondary" className="skill-analysis__filter-select skill-analysis__skills-trigger" aria-label="Skills filter (people list)">
                      <span className="skill-analysis__roles-trigger-label">{selectedSkillsPeople.length === 0 ? 'Skills' : `${selectedSkillsPeople.length} skill${selectedSkillsPeople.length === 1 ? '' : 's'} selected`}</span>
                      <span className="material-symbols-outlined skill-analysis__roles-chevron">expand_more</span>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="skill-analysis__skills-content" align="start" sideOffset={4} onCloseAutoFocus={(e) => e.preventDefault()}>
                      <div className="skill-analysis__skills-search-wrap">
                        <span className="material-symbols-outlined skill-analysis__skills-search-icon">search</span>
                        <input type="search" placeholder="Search skills" className="skill-analysis__skills-search-input" value={skillsSearch} onChange={(e) => setSkillsSearch(e.target.value)} onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                      </div>
                      <div className="skill-analysis__skills-list">
                        <DropdownMenu.CheckboxItem className="skill-analysis__skills-item" checked={selectedSkillsPeople.length === 0} onCheckedChange={(checked) => checked && setSelectedSkillsPeople([])} onSelect={(e) => e.preventDefault()}>
                          <span className="skill-analysis__skills-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__skills-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                          All skills
                        </DropdownMenu.CheckboxItem>
                        {filteredSkills.map((skill) => (
                          <DropdownMenu.CheckboxItem key={skill} className="skill-analysis__skills-item" checked={selectedSkillsPeople.includes(skill)} onCheckedChange={(checked) => toggleSkillPeople(skill, checked === true)} onSelect={(e) => e.preventDefault()}>
                            <span className="skill-analysis__skills-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__skills-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                            {skill}
                          </DropdownMenu.CheckboxItem>
                        ))}
                      </div>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="secondary" className="skill-analysis__filter-select skill-analysis__roles-trigger" aria-label="Job level filter">
                      <span className="skill-analysis__roles-trigger-label">{selectedJobLevels.length === 0 ? 'Job level' : `${selectedJobLevels.length} level${selectedJobLevels.length === 1 ? '' : 's'} selected`}</span>
                      <span className="material-symbols-outlined skill-analysis__roles-chevron">expand_more</span>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="skill-analysis__roles-content" align="start" sideOffset={4}>
                      <div className="skill-analysis__roles-list">
                        <DropdownMenu.CheckboxItem className="skill-analysis__roles-item" checked={selectedJobLevels.length === 0} onCheckedChange={(checked) => checked && setSelectedJobLevels([])} onSelect={(e) => e.preventDefault()}>
                          <span className="skill-analysis__roles-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                          All levels
                        </DropdownMenu.CheckboxItem>
                        {JOB_LEVELS.map((level) => (
                          <DropdownMenu.CheckboxItem key={level} className="skill-analysis__roles-item" checked={selectedJobLevels.includes(level)} onCheckedChange={(checked) => toggleJobLevel(level, checked === true)} onSelect={(e) => e.preventDefault()}>
                            <span className="skill-analysis__roles-checkbox" aria-hidden><DropdownMenu.ItemIndicator className="skill-analysis__roles-indicator"><span className="material-symbols-outlined">check</span></DropdownMenu.ItemIndicator></span>
                            {level}
                          </DropdownMenu.CheckboxItem>
                        ))}
                      </div>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
                <Select defaultValue="dev-plan">
                  <SelectTrigger variant="secondary" className="skill-analysis__filter-select"><SelectValue placeholder="Development Plan Status" /></SelectTrigger>
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
          </>
        )}
        {selectedSkillGap && (
          <Select value="assign" onValueChange={() => {}}>
            <SelectTrigger variant="outline" size="md" className="skill-analysis__assign-select">
              <span className="material-symbols-outlined skill-analysis__assign-icon">assignment</span>
              <SelectValue placeholder="Assign development plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assign">Assign development plan</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="skill-analysis__results">
        <span className="skill-analysis__results-text">
          Showing {(selectedSkillGap || selectedSkillStrength || selectedSkillInterest || selectedRole || selectedRolesPeople.length > 0 || selectedSkillsPeople.length > 0 || selectedJobLevels.length > 0 || (viewFilter === 'team-statistics' && (selectedTenure || selectedRetentionRisk || selectedLossImpact || selectedDevPlanStatus)) || sustainedHighPerformersFilter) ? filteredResultsCount : (scope === 'all' ? tabCounts.all : tabCounts.direct)} results
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
        key={scope}
        reportScope={scope}
        sustainedHighPerformersFilter={sustainedHighPerformersFilter}
        selectedSkillGap={selectedSkillGap}
        selectedSkillStrength={selectedSkillStrength}
        selectedSkillInterest={selectedSkillInterest}
        selectedRole={selectedRole}
        selectedRoles={selectedRolesPeople}
        selectedSkills={selectedSkillsPeople}
        selectedJobLevels={selectedJobLevels}
        selectedTenure={viewFilter === 'team-statistics' ? selectedTenure : ''}
        selectedRetentionRisk={viewFilter === 'team-statistics' ? selectedRetentionRisk : ''}
        selectedLossImpact={viewFilter === 'team-statistics' ? selectedLossImpact : ''}
        selectedDevPlanStatus={viewFilter === 'team-statistics' ? selectedDevPlanStatus : ''}
        sortBy={sortBy}
        riskTagOverrides={riskTagOverrides}
        onRiskTagsChange={(userId, riskTags) => setRiskTagOverrides((prev) => ({ ...prev, [userId]: riskTags }))}
      />
      </>
      </>
      <EditSkillAssessmentsSheet
        key={skillAssessmentPerson?.id ?? 'edit-skill-closed'}
        user={skillAssessmentPerson}
        requiredByRoleSkills={skillAssessmentPerson ? getRequiredSkillsForTitle(skillAssessmentPerson.title) : []}
        otherSkills={
          skillAssessmentPerson
            ? SKILLS_FOR_TEAM.filter((s) => !getRequiredSkillsForTitle(skillAssessmentPerson.title).includes(s))
            : []
        }
        initialProficiencies={skillAssessmentPerson ? skillProficiencies[skillAssessmentPerson.id] : undefined}
        open={!!skillAssessmentPerson}
        onClose={() => setSkillAssessmentPerson(null)}
        onSave={(assessments) => {
          if (skillAssessmentPerson) {
            setSkillProficiencies((prev) => ({
              ...prev,
              [skillAssessmentPerson.id]: Object.fromEntries(assessments.map((a) => [a.name, a.proficiency])),
            }))
          }
        }}
      />
    </div>
  )
}
