import { useUser } from '../contexts/UserContext'
import type { UserCardData } from './UserCard'
import { UserCard } from './UserCard'
import { MATEO_USER_CARDS, LAURA_USER_CARDS } from '../data/teamData'

interface UserCardListProps {
  sustainedHighPerformersFilter?: boolean
}

export function UserCardList({ sustainedHighPerformersFilter = false }: UserCardListProps) {
  const { currentUser } = useUser()
  const isLaura = currentUser.id === 'laura-shah'
  let cards: UserCardData[] = isLaura ? LAURA_USER_CARDS : MATEO_USER_CARDS

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

  return (
    <div className="user-card-list">
      {cards.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
