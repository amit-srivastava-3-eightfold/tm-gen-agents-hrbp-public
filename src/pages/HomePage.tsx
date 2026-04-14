import { Link } from 'react-router-dom'
import { ProductBackground } from '@tonyh-2-eightfold/ef-design-system'
import { NavbarApp } from '../components/Navbar'
import { HomeSidebar } from '../components/HomeSidebar'
import { CareerHubExploreCards } from '../components/CareerHubExploreCards'
import { FavoritesSection } from '../components/FavoritesSection'
import { ErrorBoundary } from '../ErrorBoundary'
import { useUser } from '../contexts/UserContext'
import {
  EM, ORG, getPersonaHrbpNames, getPersonaDepartments,
  wfrRollupDepartmentsByName, departments, getEmployeesForRole, getDeptHrbps, getHrbpDepts,
  type RoleRowType,
} from '../data/wfrOrgData'
import {
  type WfrPersistedState,
  type WfrProgramState,
  computeOrgAggregateState,
  getPersonaEffectiveState,
  hasPersonaPendingDelegation,
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
  return computeOrgAggregateState(persisted)
}

/* Inline compact semicircle — readiness only, matches WFR overview hero */
function WfrReadinessArc({ readiness, color }: { readiness: number; color?: string }) {
  const dim = 140, r = 54, sw = 8
  const cx = dim / 2, cy = dim / 2
  const rad = (d: number) => (d * Math.PI) / 180
  const arcColor = color ?? '#22c55e'
  // Upper semicircle: 180° to 360°
  const arcPath = (pct: number) => {
    const sweep = (pct / 100) * 180
    const startAngle = 180
    const x1 = cx + r * Math.cos(rad(startAngle))
    const y1 = cy + r * Math.sin(rad(startAngle))
    const x2 = cx + r * Math.cos(rad(startAngle + sweep))
    const y2 = cy + r * Math.sin(rad(startAngle + sweep))
    return `M${x1} ${y1} A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2}`
  }
  return (
    <div className="home-wfr-arc">
      <svg width={dim} height={dim / 2 + 16} viewBox={`0 0 ${dim} ${dim / 2 + 16}`} overflow="visible" aria-hidden>
        <path d={arcPath(100)} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={sw} strokeLinecap="round" />
        <path d={arcPath(readiness)} fill="none" stroke={arcColor} strokeWidth={sw} strokeLinecap="round" />

        <text x={cx} y={cy - 6} textAnchor="middle" className="home-wfr-arc__pct">{readiness}%</text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="home-wfr-arc__label">{'AI ADOPTION'}</text>
      </svg>
    </div>
  )
}

function ChroWorkforceReadinessTeaser() {
  const { currentUser } = useUser()
  const isHrbp = currentUser.id === 'jaydon-torff'
  const isManager = currentUser.id === 'mateo'
  const wfrState = readEffectiveWfrState(currentUser.id)
  const { collectionComplete, hrbpPlansCreated } = deriveWfrFlags(wfrState)

  // ── Persona-scoped metrics ───────────────────────────────────────────────
  let displayReadiness: number
  let displayGap: number
  let displayEmployees: number
  let heroEyebrow: string

  if (isManager) {
    const dept = departments.find(d => d.name === 'Engineering')
    const managers = dept ? deptManagerTeams(dept.name, dept.employees) : []
    const mgr = managers[36]
    const rawEmps = dept && mgr
      ? getEmployeesForRole({ title: dept.name, employees: dept.employees, aiReadiness: dept.aiReadiness, aiPotential: dept.aiPotential } as unknown as RoleRowType)
      : []
    const cumStart = managers.slice(0, 36).reduce((s, m) => s + m.employees, 0)
    const mgrEmps = rawEmps.slice(cumStart, cumStart + (mgr?.employees ?? 0))
    const trendDelta = collectionComplete && dept ? deptReadinessTrend(dept.name).delta : 0
    const boost = hrbpPlansCreated ? 10 : 0
    const adjusted = mgrEmps.map(e => Math.max(0, Math.min(100, e.readinessPct + trendDelta + boost)))
    displayReadiness = adjusted.length > 0 ? Math.round(adjusted.reduce((s, v) => s + v, 0) / adjusted.length) : (dept?.aiReadiness ?? 0)
    displayGap = adjusted.filter(v => v < 50).length
    displayEmployees = mgr?.employees ?? 43
    heroEyebrow = `Your team · ${displayEmployees} employees`
  } else if (isHrbp) {
    const hrbpNames = getPersonaHrbpNames(currentUser.id)
    const hrbpName = hrbpNames[0] ?? ''
    const hrbpHeadcount = hrbpNames.reduce((s, n) => s + getHrbpDepts(n).reduce((ss, d) => ss + d.headcount, 0), 0)
    const deptNames = getPersonaDepartments(currentUser.id)
    const dept = deptNames.length === 1 ? departments.find(d => d.name === deptNames[0]) : undefined
    const trendDelta = collectionComplete && dept ? deptReadinessTrend(dept.name).delta : 0
    const upskillingBoostBase = hrbpPlansCreated ? 10 : 0
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
    displayGap = Math.max(0, hrbpHeadcount - Math.round(hrbpHeadcount * displayReadiness / 100))
    displayEmployees = hrbpHeadcount
    heroEyebrow = `Your team · ${hrbpHeadcount.toLocaleString()} employees`
  } else {
    // CHRO: org-level
    displayReadiness = ORG.aiReadiness
    displayGap = ORG.peopleInAugRoles - Math.round(ORG.peopleInAugRoles * ORG.aiReadiness / 100)
    displayEmployees = ORG.totalEmployees
    heroEyebrow = `${ORG.totalEmployees.toLocaleString()} employees ${EM} Q1 2026`
  }

  // ── CTA bar ──────────────────────────────────────────────────────────────
  const ctaDemoState: WfrDemoState | null = (() => {
    const { collectionActive, collectionComplete, upskillingActive, hrbpPlansCreated } = deriveWfrFlags(typeof wfrState === 'string' ? (parseInt(wfrState) as WfrProgramState) : wfrState)
    if (hrbpPlansCreated) return null
    if (upskillingActive) return 4
    if (collectionComplete) return 3
    if (collectionActive) return 2
    return 1
  })()
  const ctaPersona: WfrPersona = isManager ? 'manager' : isHrbp ? 'hrbp' : 'chro'
  const ctaButtonHref = ctaDemoState === 1 && !isHrbp && !isManager ? '/workforce?action=launch' : '/workforce'

  return (
    <article className="home-page__wfr-compact" aria-label="Workforce Readiness">
      <div className="home-page__wfr-compact__title-row">
        <h3 className="home-page__wfr-compact__title">Workforce Readiness</h3>
        <Link to="/workforce" className="home-page__wfr-compact__view-link">View dashboard&nbsp;→</Link>
      </div>
      <Link to="/workforce" style={{ textDecoration: 'none', display: 'block' }}>
        <WfrHeroCard
          gauge={<WfrReadinessArc readiness={displayReadiness} />}
          eyebrow={heroEyebrow}
          headline={
            <span style={{ font: 'var(--typography-header3)', letterSpacing: '-0.01em' }}>
              <span style={{ fontWeight: 700 }}>{displayReadiness}%</span>
              <span style={{ fontWeight: 500 }}>
                {isManager || isHrbp ? ' of your team is AI-ready.' : ' of people in augmentable roles are AI-ready.'}
              </span>
            </span>
          }
          supportingText={<>~<strong style={{ fontWeight: 700, color: '#b91c1c' }}>{displayGap.toLocaleString()}</strong> not yet AI-ready</>}
          ctaBar={ctaDemoState ? <WfrCtaBar content={WFR_CTA_CONTENT[ctaDemoState][ctaPersona]} onButtonClick={() => { window.location.href = ctaButtonHref }} /> : undefined}
        />
      </Link>
    </article>
  )
}

export function HomePage() {
  const { currentUser } = useUser()
  const firstName = currentUser.name.split(' ')[0] ?? currentUser.name
  const avatarSrc = currentUser.avatarType === 'photo' && currentUser.avatarPhotoSrc
    ? currentUser.avatarPhotoSrc.replace(/w=\d+&h=\d+/, 'w=120&h=120')
    : null

  return (
    <div className="home-page">
      <NavbarApp />
      <ProductBackground variant="career-hub" {...(currentUser.id === 'jaydon-torff' ? { hexagonsVariant: 'profile' as const } : currentUser.id === 'csm' ? { wavesVariant: 'profile' as const } : { chevronsVariant: 'profile' as const })}>
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
      </ProductBackground>
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
