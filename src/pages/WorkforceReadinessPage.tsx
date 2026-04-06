import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { NavbarApp } from '../components/Navbar'
import {
  ProductBackground,
  Header,
  HeaderToolbar,
  HeaderTextGroup,
  HeaderTitle,
} from '@tonyh-2-eightfold/ef-design-system'
import { WorkforceReadinessDashboard } from '../components/workforceReadiness/WorkforceReadinessDashboard'
import { getPersonaHrbpNames } from '../data/wfrOrgData'
import './WorkforceReadinessPage.css'

export function WorkforceReadinessPage() {
  const { currentUser } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const [wfrView, setWfrView] = useState<'board' | 'dept' | 'hrbp' | 'director' | 'seniorMgr'>('board')
  const autoLaunch = searchParams.get('action') === 'launch'
  const isHrbp = currentUser.id === 'jaydon-torff'
  const hrbpDepartments = isHrbp ? ['Engineering'] : undefined
  const personaHrbpNames = isHrbp ? getPersonaHrbpNames(currentUser.id) : undefined

  // Clear the action param after reading it so it doesn't persist on refresh
  if (autoLaunch) {
    setSearchParams((prev) => { prev.delete('action'); return prev }, { replace: true })
  }

  if (currentUser.id !== 'chro' && currentUser.id !== 'jaydon-torff') {
    return <Navigate to="/" replace />
  }

  const chSize = wfrView === 'board' ? 'parent' as const : 'child' as const

  return (
    <div className="wfr-page">
      {/* Navbar — fixed to top */}
      <NavbarApp />

      {/* Background art + Header title — fixed to top, below navbar */}
      <ProductBackground
        className="wfr-page__bg"
        variant="career-hub"
        {...(isHrbp ? { hexagonsVariant: 'default' as const } : { chevronsVariant: 'default' as const })}
      >
        <Header variant="career-hub" chSize={chSize} overlayBackground>
          <HeaderToolbar>
            <HeaderTextGroup>
              <HeaderTitle>Workforce Readiness</HeaderTitle>
            </HeaderTextGroup>
          </HeaderToolbar>
        </Header>
      </ProductBackground>

      {/* Main content */}
      <main className="wfr-page__main">
        <div className="wfr-page__content" style={wfrView !== 'board' && !isHrbp ? { paddingTop: 0 } : undefined}>
          <div className="grid w-full grid-cols-12 gap-6">
            <div className="col-span-12 min-w-0">
              <WorkforceReadinessDashboard onViewChange={setWfrView} autoLaunchCollection={autoLaunch} scopedDepartments={hrbpDepartments} isHrbp={isHrbp} personaHrbpNames={personaHrbpNames} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
