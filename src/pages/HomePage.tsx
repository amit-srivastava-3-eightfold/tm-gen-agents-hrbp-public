import { Link } from 'react-router-dom'
import { Button, ProductBackground } from '@tonyh-2-eightfold/ef-design-system'
import { NavbarApp } from '../components/Navbar'
import { HomeSidebar } from '../components/HomeSidebar'
import { CareerHubExploreCards } from '../components/CareerHubExploreCards'
import { FavoritesSection } from '../components/FavoritesSection'
import { ErrorBoundary } from '../ErrorBoundary'
import { useUser } from '../contexts/UserContext'
import { EM, ORG } from '../data/wfrOrgData'
import '../components/HomeSidebar.css'
import './HomePage.css'

type WfrState = 1 | 2 | '2b' | 3 | 4 | 5

function readWfrState(): WfrState {
  try {
    const raw = localStorage.getItem('tm:wfr-state')
    if (!raw) return 1
    const parsed = JSON.parse(raw)
    return (parsed?.state as WfrState) ?? 1
  } catch {
    return 1
  }
}

/* Inline compact semicircle — readiness only, matches WFR overview hero */
function WfrReadinessArc({ readiness }: { readiness: number }) {
  const dim = 120, r = 46, sw = 8
  const cx = dim / 2, cy = dim / 2
  const rad = (d: number) => (d * Math.PI) / 180
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
        <path d={arcPath(readiness)} fill="none" stroke="var(--wfr-readiness, #22c55e)" strokeWidth={sw} strokeLinecap="round" />
        <text x={cx} y={cy - 6} textAnchor="middle" className="home-wfr-arc__pct">{readiness}%</text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="home-wfr-arc__label">{'AI ADOPTION'}</text>
      </svg>
    </div>
  )
}

function ChroWorkforceReadinessTeaser() {
  const wfrState = readWfrState()
  const gapPeople =
    ORG.peopleInAugRoles - Math.round((ORG.peopleInAugRoles * ORG.aiReadiness) / 100)

  type RecConfig = {
    icon: string
    iconColor: string
    eyebrow: string
    body: string
    cta: string
    href: string
  }

  const rec: RecConfig | null = (() => {
    if (wfrState === 1) return {
      icon: 'flag',
      iconColor: '#dc2626',
      eyebrow: 'FIRST PRIORITY',
      body: "Collect employee data to sharpen your adoption scores and surface upskilling priorities.",
      cta: 'Get started →',
      href: '/workforce?action=launch',
    }
    if (wfrState === 2 || wfrState === '2b') return {
      icon: 'sync',
      iconColor: '#d97706',
      eyebrow: 'COLLECTION IN PROGRESS',
      body: 'Data collection is underway. Check the dashboard for live response rates.',
      cta: 'View details →',
      href: '/workforce',
    }
    if (wfrState === 3) return {
      icon: 'check_circle',
      iconColor: '#15803d',
      eyebrow: 'COLLECTION COMPLETE',
      body: 'Results are in. Review updated adoption scores and start upskilling planning.',
      cta: 'Start upskilling →',
      href: '/workforce',
    }
    if (wfrState === 4) return {
      icon: 'school',
      iconColor: '#15803d',
      eyebrow: 'UPSKILLING ACTIVE',
      body: 'Development plans are assigned and in progress.',
      cta: 'View progress →',
      href: '/workforce',
    }
    // state 5 — program complete, no rec
    return null
  })()

  return (
    <article className="home-page__wfr-compact" aria-label="Workforce Readiness">
      <div className="home-page__wfr-compact__title-row">
        <h3 className="home-page__wfr-compact__title">Workforce Readiness</h3>
        <Link to="/workforce" className="home-page__wfr-compact__view-link">View dashboard&nbsp;→</Link>
      </div>
      <header className="home-page__wfr-compact__hero">
        <WfrReadinessArc readiness={ORG.aiReadiness} />
        <div className="home-page__wfr-compact__hero-text">
          <p className="home-page__wfr-compact__eyebrow">
            {ORG.totalEmployees.toLocaleString()} employees {EM} Q1 2026
          </p>
          <h2 className="home-page__wfr-compact__headline">
            <span className="home-page__wfr-compact__headline-pct">{ORG.aiReadiness}%</span>
            <span className="home-page__wfr-compact__headline-rest">
              {' '}of people in augmentable roles have the skills to start using AI today.
            </span>
          </h2>
          <span className="home-page__wfr-compact__gap-badge">
            ~<strong>{gapPeople.toLocaleString()}</strong> not yet AI-ready
          </span>
        </div>
      </header>
      {rec && (
        <div className="home-page__wfr-compact__rec">
          <div className="home-page__wfr-compact__rec-head">
            <span className="home-page__wfr-compact__rec-eyebrow">
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2, color: rec.iconColor }}>{rec.icon}</span>{' '}{rec.eyebrow}
            </span>
          </div>
          <div className="home-page__wfr-compact__rec-row">
            <p className="home-page__wfr-compact__rec-body">{rec.body}</p>
            <Link to={rec.href}>
              <Button variant="primary" size="sm">
                {rec.cta}
              </Button>
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
            {(currentUser.id === 'chro' || currentUser.id === 'jaydon-torff') ? <ChroWorkforceReadinessTeaser /> : null}
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
