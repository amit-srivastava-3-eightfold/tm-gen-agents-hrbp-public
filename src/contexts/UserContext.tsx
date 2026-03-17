/* eslint-disable react-refresh/only-export-components -- useUser is a hook, not a component; demo users live in demoUsers.ts */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { MATEO, type CurrentUser } from './demoUsers'

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
