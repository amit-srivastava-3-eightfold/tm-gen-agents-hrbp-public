import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { NavbarApp } from '../components/Navbar'
import { PageHeader } from '../components/PageHeader'
import '../components/PageHeader.css'
import { WorkforceReadinessDashboard } from '../components/workforceReadiness/WorkforceReadinessDashboard'
import './WorkforceReadinessPage.css'

export function WorkforceReadinessPage() {
  const { currentUser } = useUser()
  const [wfrView, setWfrView] = useState<'board' | 'dept' | 'role'>('board')

  if (currentUser.id !== 'chro') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="workforce-readiness-page">
      <NavbarApp />
      <PageHeader
        title="Workforce Readiness"
        size={wfrView === 'dept' || wfrView === 'role' ? 'medium' : 'default'}
      />
      <main className="workforce-readiness-page__main">
        <div className="workforce-readiness-page__content">
          <div className="grid w-full grid-cols-12 gap-6">
            <div className="col-span-12 min-w-0">
              <WorkforceReadinessDashboard onViewChange={setWfrView} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
