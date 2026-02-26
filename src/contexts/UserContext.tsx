import { createContext, useContext, useState, type ReactNode } from 'react'

export interface CurrentUser {
  id: string
  name: string
  title: string
  location: string
  pronouns?: string
  avatarType: 'photo' | 'initials'
  avatarPhotoSrc?: string
  avatarInitials?: string
  avatarColor?: string
  about?: string
  employeeId?: string
  businessUnit?: string
  hireDate?: string
  phone?: string
  email?: string
  mobilityPreference?: string
  flexibilityToTravel?: string
}

const MATEO: CurrentUser = {
  id: 'mateo',
  name: 'Mateo Myer',
  title: 'Sales Engineering Manager',
  location: 'Santa Clara, CA',
  pronouns: 'He/Him/His',
  avatarType: 'photo',
  avatarPhotoSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  avatarInitials: 'MM',
  about: 'I lead the Sales Engineering team at Acme, helping enterprise customers evaluate and adopt our platform through technical discovery, product demos, and proof-of-concept delivery. With over 10 years in solutions architecture and technical sales, I focus on building strong customer relationships and enabling teams to deliver value. I\'m passionate about mentoring engineers transitioning into customer-facing roles and driving technical excellence across the organization.',
  employeeId: '52979',
  businessUnit: 'PM',
  hireDate: '2020-12-24',
  phone: '(408) 555-0379',
  email: 'mateo.myer@eightfolddemo-meme.com',
  mobilityPreference: 'Willing to relocate',
  flexibilityToTravel: 'Up to 25%',
}

const LAURA: CurrentUser = {
  id: 'laura-shah',
  name: 'Laura Shah',
  title: 'HR Business Partner',
  location: 'San Francisco, CA',
  pronouns: 'She/Her/Hers',
  avatarType: 'photo',
  avatarPhotoSrc: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
  avatarInitials: 'LS',
  avatarColor: '#5C6BC0',
  about: 'As an HR Business Partner, I partner with Sales Engineering, Customer Success, and Professional Services to drive talent strategy, employee engagement, and organizational effectiveness. I bring a data-driven approach to workforce planning, performance management, and talent development. My focus is on building inclusive teams, supporting career growth, and ensuring our people have the resources they need to succeed.',
  employeeId: '52980',
  businessUnit: 'HR',
  hireDate: '2019-03-15',
  phone: '(415) 555-0123',
  email: 'laura.shah@eightfolddemo-meme.com',
  mobilityPreference: 'Open to relocation',
  flexibilityToTravel: 'Up to 50%',
}

const UserContext = createContext<{
  currentUser: CurrentUser
  setCurrentUser: (user: CurrentUser) => void
} | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(MATEO)
  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}

export { MATEO, LAURA }
