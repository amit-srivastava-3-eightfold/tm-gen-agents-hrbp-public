import type { UserCardData } from './UserCard'
import { UserCard } from './UserCard'

const USER_CARDS: UserCardData[] = [
  {
    id: '1',
    initials: 'MB',
    avatarColor: '#7B1FA2',
    name: 'Maya Baum',
    title: 'Senior Solutions Engineer',
    location: 'Santa Clara, CA',
    directReports: [
      { initials: 'JD', color: '#1976D2' },
      { initials: 'SK', color: '#388E3C' },
      { initials: 'AL', color: '#F57C00' },
      { initials: 'RW', color: '#5D4037' },
    ],
    completionPercent: 75,
    careerInterests: 'No roles added',
    selfAssessment: 'More than 12 months',
    managerAssessment: 'Last 90 days',
    developmentPlanning: '3 not started',
    successionPlanning: 'No plan',
    managerActionsCount: 1,
    riskTags: [
      { label: 'Retention risk', value: 'Medium' },
      { label: 'Loss impact', value: 'Low' },
      { label: 'Employee criticality', value: 'High', isCritical: true },
    ],
  },
  {
    id: '2',
    initials: 'KŽ',
    avatarColor: '#8D6E63',
    name: 'Krešimir Žubrinić',
    title: 'Technical Account Manager',
    location: 'Noida, IN',
    directReports: [
      { initials: 'AB', color: '#0288D1' },
      { initials: 'CD', color: '#43A047' },
      { initials: 'EF', color: '#FB8C00' },
    ],
    directReportCount: 4,
    completionPercent: 50,
    careerInterests: 'No roles added',
    selfAssessment: 'More than 12 months',
    managerAssessment: 'More than 12 months',
    developmentPlanning: '1 not started',
    successionPlanning: '2 ready',
    riskTags: [
      { label: 'Retention risk', value: 'Medium' },
      { label: 'Loss impact', value: 'Medium' },
      { label: 'Employee criticality', value: 'Low' },
    ],
  },
  {
    id: '3',
    initials: 'MA',
    avatarColor: '#C62828',
    name: 'Michael Alp',
    title: 'Sales Engineer',
    location: 'Austin, TX',
    directReports: [],
    completionPercent: 50,
    careerInterests: 'No roles added',
    selfAssessment: 'No assessment',
    managerAssessment: 'More than 12 months',
    developmentPlanning: '4 not started',
    successionPlanning: '3 ready',
    managerActionsCount: 3,
    riskTags: [
      { label: 'Retention risk', isEmpty: true },
      { label: 'Loss impact', isEmpty: true },
      { label: 'Employee criticality', isEmpty: true },
    ],
  },
]

export function UserCardList() {
  return (
    <div className="user-card-list">
      {USER_CARDS.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
