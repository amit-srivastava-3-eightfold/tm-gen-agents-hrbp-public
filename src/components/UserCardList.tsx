import { useUser } from '../contexts/UserContext'
import type { UserCardData, RiskTag } from './UserCard'
import { UserCard } from './UserCard'
import { MATEO_USER_CARDS, MATEO_ALL_REPORTS_CARDS, LAURA_USER_CARDS, LAURA_ALL_REPORTS_CARDS, CHRO_USER_CARDS, CHRO_ALL_REPORTS_CARDS } from '../data/teamData'

interface UserCardListProps {
  /** 'direct' = direct reports only; 'all' = all reports in chain (direct + indirect) */
  reportScope?: 'direct' | 'all'
  sustainedHighPerformersFilter?: boolean
  /** When set, only show direct reports who have this skill gap (from skill card row click) */
  selectedSkillGap?: string | null
  /** When set, only show direct reports who have this skill strength (from skill card row click) */
  selectedSkillStrength?: string | null
  /** When set, only show people who have this skill interest (from Skill interests card in Gaps analysis view) */
  selectedSkillInterest?: string | null
  /** When set, only show people in this role (from Roles card row click) */
  selectedRole?: string | null
  /** When set, only show people in any of these roles (from Role checkboxes) */
  selectedRoles?: string[]
  /** When set, only show people who have any of these skills (from Skills checkboxes) */
  selectedSkills?: string[]
  /** When set, only show people at any of these job levels (from Job level checkboxes) */
  selectedJobLevels?: string[]
  /** Tenure filter: '' | '<1' | '1-2' | '2-5' | '5+' */
  selectedTenure?: string
  /** Retention risk filter: '' | 'Low' | 'Medium' | 'High' */
  selectedRetentionRisk?: string
  /** Loss impact filter: '' | 'Low' | 'Medium' | 'High' */
  selectedLossImpact?: string
  /** Development plan status: '' | 'not-started' | 'in-progress' | 'complete' */
  selectedDevPlanStatus?: string
  /** Sort order for the list */
  sortBy?: 'rating-desc' | 'rating-asc' | 'gap-desc' | 'alphabetical' | 'tenure'
  /** Override risk tags per user id (from Edit risk sheet save) */
  riskTagOverrides?: Record<string, RiskTag[]>
  /** Called when user saves risk tags in the edit sheet */
  onRiskTagsChange?: (userId: string, riskTags: RiskTag[]) => void
}

function getJobLevelFromTitle(title: string): string {
  if (!title) return 'Individual contributor'
  const t = title.toLowerCase()
  if (t.startsWith('associate')) return 'Associate'
  if (t.startsWith('senior')) return 'Senior'
  if (t.startsWith('lead')) return 'Lead'
  if (t.startsWith('principal')) return 'Principal'
  return 'Individual contributor'
}

export function UserCardList({
  reportScope = 'direct',
  sustainedHighPerformersFilter = false,
  selectedSkillGap = null,
  selectedSkillStrength = null,
  selectedSkillInterest = null,
  selectedRole = null,
  selectedRoles = [],
  selectedSkills = [],
  selectedJobLevels = [],
  selectedTenure = '',
  selectedRetentionRisk = '',
  selectedLossImpact = '',
  selectedDevPlanStatus = '',
  sortBy = 'rating-desc',
  riskTagOverrides = {},
  onRiskTagsChange,
}: UserCardListProps) {
  const { currentUser } = useUser()
  const isLaura = currentUser.id === 'jaydon-torff'
  const isChro = currentUser.id === 'chro'
  const directCards = isLaura ? LAURA_USER_CARDS : isChro ? CHRO_USER_CARDS : MATEO_USER_CARDS
  const allCards = isLaura ? LAURA_ALL_REPORTS_CARDS : isChro ? CHRO_ALL_REPORTS_CARDS : MATEO_ALL_REPORTS_CARDS
  let cards: UserCardData[] = reportScope === 'all' ? allCards : directCards

  const getEffectiveRiskTags = (c: UserCardData) => riskTagOverrides[c.id] ?? c.riskTags

  if (selectedSkillGap) {
    cards = cards.filter((c) => c.skillGaps?.includes(selectedSkillGap))
  }
  if (selectedSkillStrength) {
    cards = cards.filter((c) => c.skillStrengths?.includes(selectedSkillStrength))
  } else if (selectedSkills.length > 0) {
    cards = cards.filter((c) => (c.skillStrengths ?? []).some((s) => selectedSkills.includes(s)))
  }
  if (selectedSkillInterest) {
    cards = cards.filter((c) => c.skillInterests?.includes(selectedSkillInterest))
  }
  if (selectedRole) {
    cards = cards.filter((c) => c.title === selectedRole)
  } else if (selectedRoles.length > 0) {
    cards = cards.filter((c) => selectedRoles.includes(c.title))
  }
  if (selectedJobLevels.length > 0) {
    cards = cards.filter((c) => selectedJobLevels.includes(getJobLevelFromTitle(c.title)))
  }
  if (selectedTenure) {
    cards = cards.filter((c) => {
      const y = c.tenureYears ?? 0
      if (selectedTenure === '<1') return y < 1
      if (selectedTenure === '1-2') return y >= 1 && y < 2
      if (selectedTenure === '2-5') return y >= 2 && y < 5
      if (selectedTenure === '5+') return y >= 5
      return true
    })
  }
  if (selectedRetentionRisk) {
    cards = cards.filter((c) => {
      const tags = getEffectiveRiskTags(c)
      const tag = tags.find((t) => t.label === 'Retention risk')
      return tag?.value === selectedRetentionRisk
    })
  }
  if (selectedLossImpact) {
    cards = cards.filter((c) => {
      const tags = getEffectiveRiskTags(c)
      const tag = tags.find((t) => t.label === 'Loss impact')
      return tag?.value === selectedLossImpact
    })
  }
  if (selectedDevPlanStatus) {
    cards = cards.filter((c) => {
      const dp = c.developmentPlanning ?? ''
      if (selectedDevPlanStatus === 'not-started') return /not started/i.test(dp)
      if (selectedDevPlanStatus === 'in-progress') return /not started/i.test(dp) && !/all complete/i.test(dp)
      if (selectedDevPlanStatus === 'complete') return /all complete/i.test(dp)
      return true
    })
  }

  if (isLaura && sustainedHighPerformersFilter) {
    cards = cards
      .filter((c) => c.highTenureNoPromotion === true)
      .sort((a, b) => {
        const criticalityOrder = (c: UserCardData) => {
          const tag = c.riskTags.find((t) => t.label === 'Employee criticality')
          if (tag?.isCritical || tag?.value === 'High') return 0
          if (tag?.value === 'Medium') return 1
          if (tag?.value === 'Low') return 2
          return 3
        }
        return criticalityOrder(a) - criticalityOrder(b)
      })
  }

  /* Apply sort (using completionPercent as rating proxy; 100 - completionPercent as gap proxy) */
  const sorted = [...cards].sort((a, b) => {
    switch (sortBy) {
      case 'rating-desc':
        return (b.completionPercent ?? 0) - (a.completionPercent ?? 0)
      case 'rating-asc':
        return (a.completionPercent ?? 0) - (b.completionPercent ?? 0)
      case 'gap-desc':
        return (100 - (a.completionPercent ?? 0)) - (100 - (b.completionPercent ?? 0))
      case 'alphabetical':
        return (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })
      case 'tenure':
        return (b.tenureYears ?? 0) - (a.tenureYears ?? 0)
      default:
        return 0
    }
  })

  return (
    <div className="user-card-list">
      {sorted.map((user) => (
        <UserCard
          key={user.id}
          user={riskTagOverrides[user.id] ? { ...user, riskTags: riskTagOverrides[user.id] } : user}
          onRiskTagsChange={onRiskTagsChange}
        />
      ))}
    </div>
  )
}
