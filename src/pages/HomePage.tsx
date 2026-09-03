import { Link } from 'react-router-dom'
import { ProductBackground } from '@tonyh-2-eightfold/ef-design-system'
import { NavbarApp } from '../components/Navbar'
import { HomeSidebar } from '../components/HomeSidebar'
import { CareerHubExploreCards } from '../components/CareerHubExploreCards'
import { FavoritesSection } from '../components/FavoritesSection'
import { ErrorBoundary } from '../ErrorBoundary'
import { useUser } from '../contexts/UserContext'
import { EmployeeAgentHome } from '../components/employeeHome/EmployeeAgentHome'
import {
  EM, ORG, getPersonaHrbpNames, getPersonaDepartments,
  wfrRollupDepartmentsByName, departments, getEmployeesForRole, getRolesForDept, getDeptHrbps, getHrbpDepts,
  type RoleRowType,
} from '../data/wfrOrgData'
import {
  type WfrPersistedState,
  type WfrProgramState,
  computeOrgAggregateState,
  getPersonaEffectiveState,
  deriveWfrFlags,
} from '../components/workforceReadiness/WorkforceReadinessDashboard'
import { deptManagerTeams, deptReadinessTrend } from '../components/workforceReadiness/collectionHelpers'
import { WfrHeroCard, WfrCtaBar, WFR_CTA_CONTENT, type WfrDemoState, type WfrPersona } from '../components/workforceReadiness/FocusFirstModule'
import '../components/workforceReadiness/WorkforceReadinessDashboard.css'
import '../components/HomeSidebar.css'
import './HomePage.css'

function readWfrPersistedState(): WfrPersistedState {
  try {
    const raw = localStorage.getItem('tm:wfr-state')
    if (!raw) return { state: 1 }
    return JSON.parse(raw) as WfrPersistedState
  } catch {
    return { state: 1 }
  }
}

function readEffectiveWfrState(personaId: string): WfrProgramState {
  const persisted = readWfrPersistedState()
  if (personaId === 'jaydon-torff') {
    const names = getPersonaHrbpNames(personaId)
    return getPersonaEffectiveState(persisted, names)
  }
  if (personaId === 'mateo') {
    // Manager's team is under the HRBP persona (Jaydon Torff) — track only that HRBP's state
    return getPersonaEffectiveState(persisted, getPersonaHrbpNames('jaydon-torff'))
  }
  return computeOrgAggregateState(persisted)
}


function ChroWorkforceReadinessTeaser() {
  const { currentUser } = useUser()
  const isHrbp = currentUser.id === 'jaydon-torff'
  const isManager = currentUser.id === 'mateo'
  const persistedState = readWfrPersistedState()
  const wfrState = readEffectiveWfrState(currentUser.id)
  const { collectionComplete, hrbpPlansCreated, upskillingComplete } = deriveWfrFlags(wfrState)

  // ── Persona-scoped metrics ───────────────────────────────────────────────
  let displayReadiness: number
  let displayGap: number
  let displayEmployees: number
  let heroEyebrow: string
  let rawReadiness: number = 0   // pre-program baseline for "up from X%" headline

  if (isManager) {
    const dept = departments.find(d => d.name === 'Engineering')
    const mgrIdx = 36
    const managers = dept ? deptManagerTeams(dept.name, dept.employees) : []
    const mgr = managers[mgrIdx]
    if (dept && mgr) {
      // Mirror dashboard's managerTeamData computation exactly:
      // 1) assign role titles by global index, 2) slice, 3) apply local-index noise
      const deptRoles = getRolesForDept(dept.name)
      const rawEmps = getEmployeesForRole({ title: dept.name, employees: dept.employees, aiReadiness: dept.aiReadiness, aiPotential: dept.aiPotential } as unknown as RoleRowType)
      const cumStart = managers.slice(0, mgrIdx).reduce((s, m) => s + m.employees, 0)
      // Step 1: assign titles by global position (same as dashboard's allDeptEmps)
      const allDeptEmpsWithTitles = rawEmps.map((e, i) => ({
        ...e,
        title: deptRoles.length > 0 ? deptRoles[i % deptRoles.length]?.title : undefined,
      }))
      // Step 2: slice to this manager's team
      const mgrEmpsSliced = allDeptEmpsWithTitles.slice(cumStart, Math.min(cumStart + mgr.employees, allDeptEmpsWithTitles.length))
      // Step 3: compute displayReadiness with LOCAL index noise (same as dashboard's displayEmployees)
      const mgrEmps = mgrEmpsSliced.map((e, localIdx) => {
        const roleData = deptRoles.find(r => r.title === e.title)
        const roleBase = roleData?.aiReadiness ?? dept.aiReadiness
        const noise = Math.round(((localIdx * 374761393 + mgrIdx * 2654435761) % 38) - 19)
        return { ...e, displayReadiness: Math.max(0, Math.min(100, roleBase + noise)) }
      })
      // Hero teaser uses simplified enrichment to match dashboard:
      // - base displayReadiness (with role noise) already accounts for the pre-collection baseline
      // - trend noise via name hash diverges from dashboard (which uses shuffled names), so skip it
      // - upskilling flat boost: +6pt at state 5 (in progress), +16pt at state 6 (complete) — matches dashboard mgrUpskillingBoost
      const upskillingBoost = upskillingComplete ? 16 : hrbpPlansCreated ? 6 : 0
      const enriched = mgrEmps.map(emp => Math.max(0, Math.min(100, emp.displayReadiness + upskillingBoost)))
      displayReadiness = enriched.length > 0 ? Math.round(enriched.reduce((s, v) => s + v, 0) / enriched.length) : dept.aiReadiness
      displayGap = enriched.filter(v => v < 50).length
      rawReadiness = dept.aiReadiness
    } else {
      displayReadiness = dept?.aiReadiness ?? 0
      displayGap = 0
      rawReadiness = dept?.aiReadiness ?? 0
    }
    displayEmployees = mgr?.employees ?? 43
    heroEyebrow = `Your team · ${displayEmployees} employees`
  } else if (isHrbp) {
    const hrbpNames = getPersonaHrbpNames(currentUser.id)
    const hrbpName = hrbpNames[0] ?? ''
    const hrbpHeadcount = hrbpNames.reduce((s, n) => s + getHrbpDepts(n).reduce((ss, d) => ss + d.headcount, 0), 0)
    const deptNames = getPersonaDepartments(currentUser.id)
    const dept = deptNames.length === 1 ? departments.find(d => d.name === deptNames[0]) : undefined
    const trendDelta = collectionComplete && dept ? deptReadinessTrend(dept.name).delta : 0
    const upskillingBoostBase = upskillingComplete ? 14 : hrbpPlansCreated ? 4 : 0
    const nameHash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }

    if (dept) {
      // Replicate dashboard's manager-slicing logic exactly so numbers match
      const allManagers = deptManagerTeams(dept.name, dept.employees)
      const deptHrbpList = getDeptHrbps(dept.name)
      const hrbpIdx = deptHrbpList.findIndex(h => h.hrbp === hrbpName)
      // Skip managers allocated to previous HRBPs
      let mgrStart = 0
      for (let i = 0; i < hrbpIdx; i++) {
        let covered = 0
        for (let m = mgrStart; m < allManagers.length; m++) {
          if (covered + allManagers[m].employees > deptHrbpList[i].headcount && covered > 0) break
          covered += allManagers[m].employees
          mgrStart = m + 1
        }
      }
      // Collect sliced managers for this HRBP
      const slicedMgrIndices: number[] = []
      let coveredHeadcount = 0
      for (let m = mgrStart; m < allManagers.length && coveredHeadcount < hrbpHeadcount; m++) {
        slicedMgrIndices.push(m)
        coveredHeadcount += allManagers[m].employees
      }
      // Allocate employees globally across all managers (same as dashboard)
      const rawEmps = getEmployeesForRole({ title: dept.name, employees: dept.employees, aiReadiness: dept.aiReadiness, aiPotential: dept.aiPotential } as RoleRowType)
      let runIdx = 0
      const mgrCalibrated = allManagers.map((mgr) => {
        const emps = rawEmps.slice(runIdx, Math.min(runIdx + mgr.employees, rawEmps.length))
        runIdx += mgr.employees
        return emps.map(e => {
          const empBoost = hrbpPlansCreated ? Math.round(upskillingBoostBase * (0.5 + (nameHash(e.name) % 10) / 10)) : 0
          return Math.max(0, Math.min(100, e.readinessPct + trendDelta + empBoost))
        })
      })
      const slicedCalibrated = slicedMgrIndices.flatMap(i => mgrCalibrated[i] ?? [])
      displayReadiness = slicedCalibrated.length > 0
        ? Math.round(slicedCalibrated.reduce((s, v) => s + v, 0) / slicedCalibrated.length)
        : (collectionComplete ? dept.aiReadiness + trendDelta : dept.aiReadiness)
    } else {
      const rollup = wfrRollupDepartmentsByName(deptNames)
      displayReadiness = rollup ? Math.min(100, rollup.aiReadiness + trendDelta) : ORG.aiReadiness
    }
    rawReadiness = dept?.aiReadiness ?? ORG.aiReadiness
    displayGap = Math.max(0, hrbpHeadcount - Math.round(hrbpHeadcount * displayReadiness / 100))
    displayEmployees = hrbpHeadcount
    heroEyebrow = `Your team · ${hrbpHeadcount.toLocaleString()} employees`
  } else {
    // CHRO: org-level — apply same collection delta + upskilling boost as dashboard
    const collectionDelta = collectionComplete
      ? Math.round(
          departments.reduce((s, d) => s + deptReadinessTrend(d.name).delta * d.employees, 0) /
          departments.reduce((s, d) => s + d.employees, 0)
        )
      : 0
    const upskillingBoost = upskillingComplete ? 12 : hrbpPlansCreated ? 3 : 0
    rawReadiness = ORG.aiReadiness
    displayReadiness = Math.min(100, ORG.aiReadiness + collectionDelta + upskillingBoost)
    displayGap = ORG.peopleInAugRoles - Math.round(ORG.peopleInAugRoles * displayReadiness / 100)
    displayEmployees = ORG.totalEmployees
    heroEyebrow = `${ORG.totalEmployees.toLocaleString()} employees ${EM} Q1 2026`
  }

  // ── Upskilling headline extras ────────────────────────────────────────────
  const baseHeadcount = isManager ? displayEmployees : isHrbp ? displayEmployees : ORG.peopleInAugRoles
  const rawGap = Math.max(0, baseHeadcount - Math.round(baseHeadcount * rawReadiness / 100))
  const movedOut = Math.max(0, rawGap - displayGap)

  // ── CTA bar ──────────────────────────────────────────────────────────────
  const delegationPending = !!persistedState.hrbpStates && Object.values(persistedState.hrbpStates).some(h => h.delegated && h.state === 1)
  const ctaDemoState: WfrDemoState | null = (() => {
    const { collectionActive, collectionComplete, upskillingActive, hrbpPlansCreated, upskillingComplete } = deriveWfrFlags(typeof wfrState === 'string' ? (parseInt(wfrState) as WfrProgramState) : wfrState)
    if (upskillingComplete) return 6
    if (hrbpPlansCreated) return 5
    if (upskillingActive) return 4
    if (collectionComplete) return 3
    if (collectionActive) return 2
    if (delegationPending) return '1b'
    return 1
  })()
  const ctaPersona: WfrPersona = isManager ? 'manager' : isHrbp ? 'hrbp' : 'chro'
  const ctaButtonHref = (ctaDemoState === 1 && !isHrbp && !isManager) || ctaDemoState === '1b' ? '/workforce?action=launch' : '/workforce'

  const ctaContent = ctaDemoState ? WFR_CTA_CONTENT[ctaDemoState][ctaPersona] : null
  const ctaIsCard = ctaContent?.variant === 'card'

  return (
    <article className="home-page__wfr-compact" aria-label="Workforce Readiness">
      <div className="home-page__wfr-compact__head">
        <h3 className="home-page__wfr-compact__title">Workforce Readiness</h3>
        <Link to="/workforce" className="home-page__wfr-compact__view-link">
          View dashboard
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: '-1px', marginLeft: 3 }}>
            <path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>
          </svg>
        </Link>
      </div>
      <div className="home-page__wfr-compact__body">
        <Link to="/workforce" style={{ textDecoration: 'none', display: 'block' }}>
          <WfrHeroCard
            variant="crowd"
            crowdClassName="wfr-hero-card--crowd-home"
            dotCount={260}
            readinessPct={displayReadiness}
            eyebrow={heroEyebrow}
            headline={hrbpPlansCreated ? (
              <>
                <span className="wfr-dash__headline-pct wfr-text-readiness">{displayReadiness}%</span>
                <span className="wfr-dash__headline-text">{` AI adoption${isHrbp ? ' across your teams' : isManager ? ' on your team' : ''} — up from ${rawReadiness}% before upskilling.`}</span>
              </>
            ) : (
              <span className="wfr-dash__headline-text">
                Only <span className="wfr-dash__headline-pct wfr-text-readiness" style={{ fontSize: 'inherit' }}>{displayReadiness}%</span>
                {' of your team is AI-ready.'}
              </span>
            )}
            supportingText={hrbpPlansCreated && !isManager
              ? <><strong style={{ fontWeight: 700, color: '#4ade80' }}>{movedOut.toLocaleString()}</strong> employees moved out of the gap — <strong style={{ fontWeight: 700, color: '#fca5a5' }}>{displayGap.toLocaleString()}</strong> remaining</>
              : <><strong style={{ fontWeight: 700 }}>{displayGap.toLocaleString()}</strong> employees in augmentable roles haven't adopted AI yet.</>
            }
            ctaBar={ctaContent && !ctaIsCard ? <WfrCtaBar content={ctaContent} onButtonClick={() => { window.location.href = ctaButtonHref }} /> : undefined}
          />
        </Link>
        {ctaContent && ctaIsCard && (
          <WfrCtaBar content={ctaContent} onButtonClick={() => { window.location.href = ctaButtonHref }} />
        )}
      </div>
    </article>
  )
}

export function HomePage() {
  const { currentUser } = useUser()
  const firstName = currentUser.name.split(' ')[0] ?? currentUser.name
  const avatarSrc = currentUser.avatarType === 'photo' && currentUser.avatarPhotoSrc
    ? currentUser.avatarPhotoSrc.replace(/w=\d+&h=\d+/, 'w=120&h=120')
    : null

  // Employee (csm) gets the full conversational agent home
  if (currentUser.id === 'csm') {
    return (
      <div className="home-page home-page--agent">
        <NavbarApp />
        <EmployeeAgentHome userName={firstName} />
      </div>
    )
  }

  return (
    <div className="home-page">
      <NavbarApp />
      {(() => {
        const heroContent = (
          <header className="home-page__header">
            <div className="home-page__hero">
              <div className="home-page__avatar-wrap">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt=""
                    className="home-page__avatar"
                  />
                ) : (
                  <div
                    className="home-page__avatar home-page__avatar--initials"
                    style={currentUser.avatarColor ? { background: currentUser.avatarColor } : undefined}
                  >
                    {currentUser.avatarInitials}
                  </div>
                )}
              </div>
              <div className="home-page__title-group">
                <h1 className="home-page__greeting">
                  Hi {firstName}
                </h1>
                <p className="home-page__subtitle">
                  Welcome to your Career Hub
                </p>
              </div>
            </div>
          </header>
        )
        return (
          <ProductBackground variant="career-hub" {...(currentUser.id === 'jaydon-torff' ? { hexagonsVariant: 'profile' as const } : { chevronsVariant: 'profile' as const })}>
            {heroContent}
          </ProductBackground>
        )
      })()}
      <main className="home-page__main">
        <div className="home-page__layout grid grid-cols-12 gap-6">
          <div className="home-page__sidebar col-span-4">
            <HomeSidebar />
          </div>
          <div className="home-page__content col-span-8" aria-label="Main content">
            {(currentUser.id === 'chro' || currentUser.id === 'jaydon-torff' || currentUser.id === 'mateo') ? <ChroWorkforceReadinessTeaser /> : null}
            <CareerHubExploreCards />
            <ErrorBoundary>
              <FavoritesSection />
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  )
}
