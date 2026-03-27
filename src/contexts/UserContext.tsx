/* eslint-disable react-refresh/only-export-components -- useUser is a hook, not a component; demo users live in demoUsers.ts */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { MATEO, CHRO, LAURA, CSM, type CurrentUser } from './demoUsers'

/** Allow ?user=chro (or mateo, laura-shah, csm) in the URL to auto-switch persona. Falls back to localStorage. Default: CHRO. */
function resolveInitialUser(): CurrentUser {
  if (typeof window === 'undefined') return CHRO
  const params = new URLSearchParams(window.location.search)
  const u = params.get('user') || localStorage.getItem('tm:current-user')
  if (u === 'laura-shah' || u === 'jaydon-torff' || u === 'hrbp') return LAURA
  if (u === 'csm') return CSM
  if (u === 'mateo') return MATEO
  return CHRO
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
