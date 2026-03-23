import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useNavbarProps } from '../components/Navbar'
import { CareerHubShell } from '@tonyh-2-eightfold/ef-design-system'
import { WorkforceReadinessDashboard } from '../components/workforceReadiness/WorkforceReadinessDashboard'
import './WorkforceReadinessPage.css'

export function WorkforceReadinessPage() {
  const { currentUser } = useUser()
  const navbarProps = useNavbarProps()
  const [wfrView, setWfrView] = useState<'board' | 'dept'>('board')

  if (currentUser.id !== 'chro') {
    return <Navigate to="/" replace />
  }

  return (
    <CareerHubShell
      chSize={wfrView === 'dept' ? 'child' : 'parent'}
      title="Workforce Readiness"
      navbarProps={navbarProps}
    >
      <main className="workforce-readiness-page__main">
        <div className="workforce-readiness-page__content">
          <div className="grid w-full grid-cols-12 gap-6">
            <div className="col-span-12 min-w-0">
              <WorkforceReadinessDashboard onViewChange={setWfrView} />
            </div>
          </div>
        </div>
      </main>
    </CareerHubShell>
  )
}
