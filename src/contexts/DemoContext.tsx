import { createContext, useContext, type ReactNode } from 'react'

function resolveIsDemo(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('demo') === 'true'
}

const DemoContext = createContext<{ isDemo: boolean }>({ isDemo: false })

export function DemoProvider({ children }: { children: ReactNode }) {
  const isDemo = resolveIsDemo()
  return (
    <DemoContext.Provider value={{ isDemo }}>
      {children}
    </DemoContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemo() {
  return useContext(DemoContext)
}
