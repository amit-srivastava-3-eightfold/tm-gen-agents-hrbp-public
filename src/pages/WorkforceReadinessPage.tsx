import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useNavbarProps } from '../components/Navbar'
import { CareerHubShell } from '@tonyh-2-eightfold/ef-design-system'
import { WorkforceReadinessDashboard } from '../components/workforceReadiness/WorkforceReadinessDashboard'
import './WorkforceReadinessPage.css'

export function WorkforceReadinessPage() {
  const { currentUser } = useUser()
  const navbarProps = useNavbarProps()
  const [searchParams, setSearchParams] = useSearchParams()
  const [wfrView, setWfrView] = useState<'board' | 'dept'>('board')
  const autoLaunch = searchParams.get('action') === 'launch'
  const isHrbp = currentUser.id === 'laura-shah'
  const hrbpDepartments = isHrbp ? ['Customer Success'] : undefined

  // Clear the action param after reading it so it doesn't persist on refresh
  if (autoLaunch) {
    setSearchParams((prev) => { prev.delete('action'); return prev }, { replace: true })
  }

  if (currentUser.id !== 'chro' && currentUser.id !== 'laura-shah') {
    return <Navigate to="/" replace />
  }

  return (
    <CareerHubShell
      chSize={wfrView === 'dept' ? 'child' : 'parent'}
      title="Workforce Readiness"
      navbarProps={navbarProps}
      {...(isHrbp ? { hexagonsVariant: 'default' as const } : {})}
    >
      <main className="workforce-readiness-page__main">
        <div className="workforce-readiness-page__content">
          <div className="grid w-full grid-cols-12 gap-6">
            <div className="col-span-12 min-w-0">
              <WorkforceReadinessDashboard onViewChange={setWfrView} autoLaunchCollection={autoLaunch} scopedDepartments={hrbpDepartments} isHrbp={isHrbp} />
            </div>
          </div>
        </div>
      </main>
    </CareerHubShell>
  )
}
