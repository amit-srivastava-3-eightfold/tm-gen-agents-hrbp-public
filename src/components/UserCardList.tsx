import { useUser } from '../contexts/UserContext'
import type { UserCardData } from './UserCard'
import { UserCard } from './UserCard'
import { MATEO_USER_CARDS, LAURA_USER_CARDS } from '../data/teamData'

interface UserCardListProps {
  sustainedHighPerformersFilter?: boolean
  /** When set, only show direct reports who have this skill gap (from skill card row click) */
  selectedSkillGap?: string | null
  /** When set, only show direct reports who have this skill strength (from skill card row click) */
  selectedSkillStrength?: string | null
  /** When set, only show direct reports who have this skill interest (from skill interests row click) */
  selectedSkillInterest?: string | null
  /** Sort order for the list */
  sortBy?: 'rating-desc' | 'rating-asc' | 'gap-desc' | 'alphabetical' | 'tenure'
}

export function UserCardList({
  sustainedHighPerformersFilter = false,
  selectedSkillGap = null,
  selectedSkillStrength = null,
  selectedSkillInterest = null,
  sortBy = 'rating-desc',
}: UserCardListProps) {
  const { currentUser } = useUser()
  const isLaura = currentUser.id === 'laura-shah'
  let cards: UserCardData[] = isLaura ? LAURA_USER_CARDS : MATEO_USER_CARDS

  if (selectedSkillGap) {
    cards = cards.filter((c) => c.skillGaps?.includes(selectedSkillGap))
  }
  if (selectedSkillStrength) {
    cards = cards.filter((c) => c.skillStrengths?.includes(selectedSkillStrength))
  }
  if (selectedSkillInterest) {
    cards = cards.filter((c) => c.skillInterests?.includes(selectedSkillInterest))
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
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
