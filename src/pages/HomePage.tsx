import { Link } from 'react-router-dom'
import { Button, ProductBackground } from '@tonyh-2-eightfold/ef-design-system'
import { NavbarApp } from '../components/Navbar'
import { HomeSidebar } from '../components/HomeSidebar'
import { CareerHubExploreCards } from '../components/CareerHubExploreCards'
import { FavoritesSection } from '../components/FavoritesSection'
import { ErrorBoundary } from '../ErrorBoundary'
import { useUser } from '../contexts/UserContext'
import {
  EM, ORG, getPersonaHrbpNames, getPersonaDepartments,
  wfrRollupDepartmentsByName, departments, getEmployeesForRole, getDeptHrbps, getHrbpDepts,
  wfrDemoCollectionSnapshot, wfrDemoCollectionSnapshotForDeptNames,
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
  const dim = 120, r = 46, sw = 8
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
        <path d={arcPath(100)} fill="none" stroke="#e2e8f0" strokeWidth={sw} strokeLinecap="round" />
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
    // Use this HRBP's assigned headcount — subset of the full dept total
    const hrbpHeadcount = hrbpNames.reduce((s, n) => s + getHrbpDepts(n).reduce((ss, d) => ss + d.headcount, 0), 0)
    const deptNames = getPersonaDepartments(currentUser.id)
    const rollup = wfrRollupDepartmentsByName(deptNames)
    const trendDelta = collectionComplete && deptNames.length === 1 ? deptReadinessTrend(deptNames[0]).delta : 0
    const boost = hrbpPlansCreated ? 10 : 0
    displayReadiness = rollup ? Math.min(100, rollup.aiReadiness + trendDelta + boost) : ORG.aiReadiness
    // Scale aug roles and gap to this HRBP's headcount, not the full dept
    const scaleFactor = rollup && rollup.totalEmployees > 0 ? hrbpHeadcount / rollup.totalEmployees : 1
    const scaledAugRoles = rollup ? Math.round(rollup.peopleInAugRoles * scaleFactor) : 0
    const calibratedReady = Math.round(scaledAugRoles * displayReadiness / 100)
    displayGap = Math.max(0, scaledAugRoles - calibratedReady)
    displayEmployees = hrbpHeadcount
    heroEyebrow = `Your team · ${hrbpHeadcount.toLocaleString()} employees`
  } else {
    // CHRO: org-level
    displayReadiness = ORG.aiReadiness
    displayGap = ORG.peopleInAugRoles - Math.round(ORG.peopleInAugRoles * ORG.aiReadiness / 100)
    displayEmployees = ORG.totalEmployees
    heroEyebrow = `${ORG.totalEmployees.toLocaleString()} employees ${EM} Q1 2026`
  }

  // ── State-based rec ──────────────────────────────────────────────────────
  type RecConfig = {
    icon: string; iconColor: string; eyebrow: string; body: React.ReactNode; subtitle?: React.ReactNode; cta: string; href: string
    cardBg?: string; cardBorder?: string; eyebrowColor?: string
    progressPct?: number; progressLabel?: string
  }
  const AMBER_CARD = { cardBg: 'linear-gradient(180deg, #fef3c7 0%, #fffbeb 100%)', cardBorder: '#fcd34d', eyebrowColor: '#d97706' }
  const GREEN_CARD  = { cardBg: 'linear-gradient(180deg, #dcfce7 0%, #f0fdf4 100%)', cardBorder: '#86efac', eyebrowColor: '#15803d' }
  const INDIGO_CARD = { cardBg: '#eff3ff', cardBorder: '#c5d3f8', eyebrowColor: '#3b5bdb' }

  const rec: RecConfig | null = (() => {
    if (wfrState === 1) {
      if (isManager) {
        const hrbpName = getDeptHrbps('Engineering')[0]?.hrbp ?? 'your HR Business Partner'
        return {
          icon: 'people', iconColor: '#3b5bdb', eyebrow: 'RECOMMENDED ACTION',
          body: `Your HR Business Partner, ${hrbpName}, will initiate data collection for Engineering. Reach out to align on timing and scope.`,
          cta: 'View your team →', href: '/workforce',
          ...INDIGO_CARD,
        }
      }
      if (isHrbp) {
        const persisted = readWfrPersistedState()
        const names = getPersonaHrbpNames(currentUser.id)
        if (hasPersonaPendingDelegation(persisted, names)) return {
          icon: 'flag', iconColor: '#dc2626', eyebrow: 'FIRST PRIORITY',
          body: 'The CHRO has kicked off AI data collection for your team. Launch collection to sharpen adoption scores and surface upskilling priorities for your people.',
          cta: 'Get started →', href: '/workforce?action=launch',
        }
        return {
          icon: 'insights', iconColor: '#3b5bdb', eyebrow: 'RECOMMENDED ACTION',
          body: "Review your team's estimated AI adoption scores and identify which roles have the biggest opportunity for augmentation — before collection kicks off.",
          cta: 'Review team data →', href: '/workforce',
          ...INDIGO_CARD,
        }
      }
      // CHRO
      const persisted = readWfrPersistedState()
      if (persisted.hrbpStates && Object.values(persisted.hrbpStates).some(h => h.delegated)) {
        const scopeLabel = persisted.collectionLaunchSummary?.scopeLabel ?? 'HRBPs'
        return {
          icon: 'sync', iconColor: '#d97706', eyebrow: 'DELEGATION SENT',
          body: `Data collection has been delegated to ${scopeLabel}. Waiting for them to launch.`,
          cta: 'View dashboard →', href: '/workforce',
          ...AMBER_CARD,
        }
      }
      return {
        icon: 'flag', iconColor: '#dc2626', eyebrow: 'FIRST PRIORITY',
        body: "AI Adoption is estimated today. Collect real data to see what's actually happening.",
        subtitle: "Choose departments and a collection method — results refine your adoption scores and surface upskilling priorities.",
        cta: 'Get started →', href: '/workforce?action=launch',
        // red — CSS default, no override needed
      }
    }
    if (wfrState === 2 || wfrState === '2b') {
      const snap = isHrbp
        ? wfrDemoCollectionSnapshotForDeptNames(getPersonaDepartments(currentUser.id))
        : wfrDemoCollectionSnapshot()
      return {
        icon: 'sync', iconColor: '#d97706', eyebrow: 'COLLECTION IN PROGRESS',
        body: isManager || isHrbp
          ? 'Data collection is underway for your team. Check the dashboard for live response rates.'
          : 'Data collection is underway. Check the dashboard for live response rates.',
        cta: 'View details →', href: '/workforce',
        progressPct: snap.orgResponseRate,
        progressLabel: `${snap.respondedCount.toLocaleString()} of ${snap.sampleTarget.toLocaleString()} sampled`,
        ...AMBER_CARD,
      }
    }
    if (wfrState === 3) return {
      icon: 'check_circle', iconColor: '#15803d', eyebrow: 'COLLECTION COMPLETE',
      body: isManager || isHrbp
        ? 'Results are in for your team. Review updated adoption scores and start upskilling.'
        : 'Results are in. Review updated adoption scores and start upskilling planning.',
      cta: isManager ? 'See results →' : 'Start upskilling →', href: '/workforce',
      ...GREEN_CARD,
    }
    if (wfrState === 4) {
      if (isManager) return {
        icon: 'rocket_launch', iconColor: '#dc2626', eyebrow: 'UPSKILLING STARTED',
        body: 'Development plans have been created for your team. Review and assign them so your people can start building AI skills.',
        cta: 'Review and assign plans →', href: '/workforce',
      }
      const persisted = readWfrPersistedState()
      const summary = persisted.upskillingLaunchSummary
      const deptCount = summary?.departmentNames.length ?? 1
      const empCount = summary?.totalEmployees ?? 0
      const delegated = summary?.delegated ?? false
      return {
        icon: 'rocket_launch', iconColor: '#b45309', eyebrow: 'UPSKILLING STARTED',
        body: delegated
          ? <>HRBPs are creating development plans for <strong>{empCount.toLocaleString()}</strong> employees across <strong>{deptCount}</strong> department{deptCount === 1 ? '' : 's'}.</>
          : <>Development plans are being created for <strong>{empCount.toLocaleString()}</strong> employees across <strong>{deptCount}</strong> department{deptCount === 1 ? '' : 's'}.</>,
        subtitle: 'Once plans are assigned, adoption scores will update to reflect upskilling progress.',
        cta: 'View progress →', href: '/workforce',
        ...AMBER_CARD,
      }
    }
    return null // state 5
  })()

  return (
    <article className="home-page__wfr-compact" aria-label="Workforce Readiness">
      <div className="home-page__wfr-compact__title-row">
        <h3 className="home-page__wfr-compact__title">Workforce Readiness</h3>
        <Link to="/workforce" className="home-page__wfr-compact__view-link">View dashboard&nbsp;→</Link>
      </div>
      <header className="home-page__wfr-compact__hero">
        <WfrReadinessArc readiness={displayReadiness} />
        <div className="home-page__wfr-compact__hero-text">
          <p className="home-page__wfr-compact__eyebrow">{heroEyebrow}</p>
          <h2 className="home-page__wfr-compact__headline">
            <span className="home-page__wfr-compact__headline-pct">{displayReadiness}%</span>
            <span className="home-page__wfr-compact__headline-rest">
              {isManager
                ? ' of your team is AI-ready.'
                : ' of people in augmentable roles are AI-ready.'}
            </span>
          </h2>
          <span className="home-page__wfr-compact__gap-badge">
            ~<strong>{displayGap.toLocaleString()}</strong> not yet AI-ready
          </span>
        </div>
      </header>
      {rec && (
        <div className="home-page__wfr-compact__rec" style={rec.cardBg ? { background: rec.cardBg, borderColor: rec.cardBorder } : undefined}>
          <div className="home-page__wfr-compact__rec-head">
            <span className="home-page__wfr-compact__rec-eyebrow" style={rec.eyebrowColor ? { color: rec.eyebrowColor } : undefined}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2, color: rec.iconColor }}>{rec.icon}</span>{' '}{rec.eyebrow}
            </span>
          </div>
          <div className="home-page__wfr-compact__rec-row">
            <div style={{ flex: 1 }}>
              <p className="home-page__wfr-compact__rec-body" style={rec.subtitle ? { fontWeight: 600, color: '#1a212e', marginBottom: 4 } : undefined}>{rec.body}</p>
              {rec.subtitle && <p className="home-page__wfr-compact__rec-body" style={{ marginTop: 0 }}>{rec.subtitle}</p>}
              {rec.progressPct !== undefined && (
                <div className="wfr-ra-card__mini-progress" style={{ marginTop: 8, marginLeft: 0 }}>
                  <span className="wfr-ra-card__mini-pct tabular-nums" style={{ color: '#d97706' }}>{rec.progressPct}%</span>
                  <div className="wfr-ra-card__mini-track" style={{ background: '#e2e8f0' }}>
                    <div className="wfr-ra-card__mini-fill" style={{ width: `${rec.progressPct}%`, background: '#d97706' }} />
                  </div>
                  <span className="wfr-ra-card__mini-label" style={{ color: '#92400e' }}>{rec.progressLabel}</span>
                </div>
              )}
            </div>
            <Link to={rec.href} style={{ flexShrink: 0 }}>
              <Button variant="primary" size="sm">{rec.cta}</Button>
            </Link>
          </div>
        </div>
      )}
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
      <ProductBackground variant="career-hub" {...(currentUser.id === 'jaydon-torff' ? { hexagonsVariant: 'profile' as const } : { chevronsVariant: 'profile' as const })}>
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
