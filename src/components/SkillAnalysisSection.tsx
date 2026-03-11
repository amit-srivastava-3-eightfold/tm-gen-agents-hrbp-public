import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useUser } from '../contexts/UserContext'
import { OPEN_ROLES_PEOPLE_CARDS } from '../data/peopleData'
import { MATEO_USER_CARDS, LAURA_USER_CARDS } from '../data/teamData'
import type { PeopleProfileCardData } from './PeopleProfileCard'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@tonyh-2-eightfold/ef-design-system'
import { Button } from './ui/Button'
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
]

const MATEO_SKILL_STRENGTHS = [
  { name: 'Solution Architecture', current: 12, total: 14 },
  { name: 'Sales Enablement', current: 10, total: 14 },
  { name: 'Technical Discovery', current: 11, total: 14 },
  { name: 'API Integration', current: 5, total: 14 },
  { name: 'Communication', current: 14, total: 14 },
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
]

const LAURA_SKILL_STRENGTHS = [
  { name: 'Employee Relations', current: 11, total: 12 },
  { name: 'Talent Management', current: 10, total: 12 },
  { name: 'Coaching', current: 9, total: 12 },
  { name: 'Data Analytics', current: 7, total: 12 },
  { name: 'Stakeholder Management', current: 10, total: 12 },
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

const MATEO_TAB_COUNTS = { direct: 14, all: 18 }

const LAURA_TAB_COUNTS = { direct: 12, all: 48 }

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

  const skillGaps = useMemo(() => {
    const list = isLaura ? [...LAURA_SKILL_GAPS] : [...MATEO_SKILL_GAPS]
    list.sort((a, b) => b.current - a.current)
    return list.slice(0, 5)
  }, [isLaura])
  const skillStrengths = useMemo(() => {
    const list = isLaura ? [...LAURA_SKILL_STRENGTHS] : [...MATEO_SKILL_STRENGTHS]
    list.sort((a, b) => b.current - a.current)
    return list
  }, [isLaura])
  const skillInterests = isLaura ? LAURA_SKILL_INTERESTS : MATEO_SKILL_INTERESTS
  const skillInterestsSortedByCount = useMemo(
    () => [...skillInterests].sort((a, b) => b.count - a.count),
    [skillInterests]
  )
  const tabCounts = isLaura ? LAURA_TAB_COUNTS : MATEO_TAB_COUNTS
  const pipelineLookup = isLaura ? LAURA_OPEN_POSITIONS : MATEO_OPEN_POSITIONS
  const openPositions = useMemo(
    () => buildPositionsFromOpenRoles(OPEN_ROLES_PEOPLE_CARDS, pipelineLookup),
    [pipelineLookup]
  )
  const [selectedSkillGap, setSelectedSkillGap] = useState<string | null>(null)
  const [selectedSkillStrength, setSelectedSkillStrength] = useState<string | null>(null)
  const [selectedSkillInterest, setSelectedSkillInterest] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'rating-desc' | 'rating-asc' | 'gap-desc' | 'alphabetical' | 'tenure'>('rating-desc')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillsSearch, setSkillsSearch] = useState('')

  const toggleRole = (role: string, checked: boolean) => {
    setSelectedRoles((prev) => (checked ? [...prev, role] : prev.filter((r) => r !== role)))
  }

  const toggleSkill = (skill: string, checked: boolean) => {
    setSelectedSkills((prev) => (checked ? [...prev, skill] : prev.filter((s) => s !== skill)))
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
        <Select defaultValue="gaps">
          <SelectTrigger variant="primary" className="skill-analysis__filter-select">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gaps">View: Gaps analysis</SelectItem>
            <SelectItem value="skills-overview">View: Skills overview</SelectItem>
            <SelectItem value="team-statistics">View: Team statistics</SelectItem>
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
        <div className="skill-analysis__card">
          <div className="skill-analysis__card-header skill-analysis__card-header--gaps">
            <span className="material-symbols-outlined skill-analysis__card-icon skill-analysis__card-icon--red">trending_down</span>
            <span>Skill gaps</span>
            <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
          </div>
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
                }}
                onKeyDown={(e) => e.key === 'Enter' && (setSelectedSkillGap(skill.name), setSelectedSkillStrength(null), setSelectedSkillInterest(null))}
              >
                <span className="skill-analysis__skill-name">{skill.name}</span>
                <div className="skill-analysis__item-right">
                  <span className="material-symbols-outlined skill-analysis__person-icon">person</span>
                  <div className="skill-analysis__bar-wrap">
                    <div className="skill-analysis__bar">
                      <div
                        className="skill-analysis__bar-fill"
                        style={{ width: `${skill.total > 0 ? (skill.current / skill.total) * 100 : 0}%` }}
                      >
                        {skill.current > 0 && <span className="skill-analysis__bar-value">{skill.current}</span>}
                      </div>
                      {skill.current === 0 && (
                        <span className="skill-analysis__bar-value skill-analysis__bar-value--empty">{skill.current}</span>
                      )}
                    </div>
                    <span className="skill-analysis__bar-total">{skill.total}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="skill-analysis__card">
          <div className="skill-analysis__card-header skill-analysis__card-header--strengths">
            <span className="material-symbols-outlined skill-analysis__card-icon skill-analysis__card-icon--green">trending_up</span>
            <span>Skill strengths</span>
            <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
          </div>
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
                }}
                onKeyDown={(e) => e.key === 'Enter' && (setSelectedSkillStrength(skill.name), setSelectedSkillGap(null), setSelectedSkillInterest(null))}
              >
                <span className="skill-analysis__skill-name">{skill.name}</span>
                <div className="skill-analysis__item-right">
                  <span className="material-symbols-outlined skill-analysis__person-icon">person</span>
                  <div className="skill-analysis__bar-wrap">
                    <div className="skill-analysis__bar">
                      <div
                        className="skill-analysis__bar-fill"
                        style={{ width: `${skill.total > 0 ? (skill.current / skill.total) * 100 : 0}%` }}
                      >
                        {skill.current > 0 && <span className="skill-analysis__bar-value">{skill.current}</span>}
                      </div>
                      {skill.current === 0 && (
                        <span className="skill-analysis__bar-value skill-analysis__bar-value--empty">{skill.current}</span>
                      )}
                    </div>
                    <span className="skill-analysis__bar-total">{skill.total}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
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
                }}
                onKeyDown={(e) => e.key === 'Enter' && (setSelectedSkillInterest(skill.name), setSelectedSkillGap(null), setSelectedSkillStrength(null))}
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
            <span className="skill-analysis__filter-tag skill-analysis__filter-tag--strengths">
              <span className="material-symbols-outlined skill-analysis__filter-tag-icon">trending_up</span>
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
        {!(selectedSkillGap || selectedSkillStrength || selectedSkillInterest) && (
          <>
            <Select defaultValue="role">
              <SelectTrigger variant="secondary" className="skill-analysis__filter-select">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="role">Role</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="skills">
              <SelectTrigger variant="secondary" className="skill-analysis__filter-select">
                <SelectValue placeholder="Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skills">Skills</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="job-level">
              <SelectTrigger variant="secondary" className="skill-analysis__filter-select">
                <SelectValue placeholder="Job Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job-level">Job Level</SelectItem>
              </SelectContent>
            </Select>
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
        {(selectedSkillGap || selectedSkillStrength || selectedSkillInterest) && (
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
        <span className="skill-analysis__results-text">Showing {tabCounts.all} results</span>
        <Button variant="secondary" size="sm" className="skill-analysis__select-all">Select all on this page</Button>
        <div className="skill-analysis__results-sort">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
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
        sustainedHighPerformersFilter={sustainedHighPerformersFilter}
        selectedSkillGap={selectedSkillGap}
        selectedSkillStrength={selectedSkillStrength}
        selectedSkillInterest={selectedSkillInterest}
        sortBy={sortBy}
      />
      </>
      )}
    </div>
  )
}
