/* eslint-disable react-refresh/only-export-components -- useUser is a hook, not a component; demo users live in demoUsers.ts */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { MATEO, CHRO, LAURA, type CurrentUser } from './demoUsers'

/** Allow ?user=chro (or mateo, laura-shah) in the URL to auto-switch persona. */
function resolveInitialUser(): CurrentUser {
  if (typeof window === 'undefined') return MATEO
  const params = new URLSearchParams(window.location.search)
  const u = params.get('user')
  if (u === 'chro') return CHRO
  if (u === 'laura-shah') return LAURA
  return MATEO
}

const UserContext = createContext<{
  currentUser: CurrentUser
  setCurrentUser: (user: CurrentUser) => void
} | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(resolveInitialUser)
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
