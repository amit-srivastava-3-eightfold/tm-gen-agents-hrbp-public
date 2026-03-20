import { Link } from 'react-router-dom'
import { NavbarApp } from '../components/Navbar'
import { HomeSidebar } from '../components/HomeSidebar'
import { CareerHubExploreCards } from '../components/CareerHubExploreCards'
import { FavoritesSection } from '../components/FavoritesSection'
import { ErrorBoundary } from '../ErrorBoundary'
import { useUser } from '../contexts/UserContext'
import { EM, ORG } from '../data/wfrOrgData'
import '../components/HomeSidebar.css'
import './HomePage.css'

function ChroWorkforceReadinessTeaser() {
  const gapPeople =
    ORG.peopleInAugRoles - Math.round((ORG.peopleInAugRoles * ORG.aiReadiness) / 100)

  return (
    <article className="home-page__wfr-compact" aria-label="Workforce Readiness">
      <header className="home-page__wfr-compact__hero">
        <p className="home-page__wfr-compact__eyebrow">
          {ORG.totalEmployees.toLocaleString()} employees {EM} Q1 2026
        </p>
        <p className="home-page__wfr-compact__mini-metrics" aria-label="AI readiness and potential">
          <span className="home-page__wfr-compact__mini-metric home-page__wfr-compact__mini-metric--readiness">
            {ORG.aiReadiness}% readiness
          </span>
          <span className="home-page__wfr-compact__mini-dot" aria-hidden>
            ·
          </span>
          <span className="home-page__wfr-compact__mini-metric home-page__wfr-compact__mini-metric--potential">
            {ORG.aiPotential}% potential
          </span>
        </p>
        <h2 className="home-page__wfr-compact__headline">
          <span className="home-page__wfr-compact__headline-pct">{ORG.aiReadiness}%</span>
          <span className="home-page__wfr-compact__headline-rest">
            {' '}
            of people in augmentable roles have the skills to start using AI today.
          </span>
        </h2>
        <p className="home-page__wfr-compact__gap">
          ~<strong>{gapPeople.toLocaleString()}</strong> employees in augmentable roles are not yet AI-ready.
        </p>
      </header>
      <div className="home-page__wfr-compact__rec">
        <div className="home-page__wfr-compact__rec-head">
          <span className="material-symbols-outlined home-page__wfr-compact__rec-icon" aria-hidden>
            priority_high
          </span>
          <span className="home-page__wfr-compact__rec-label">Recommended actions</span>
        </div>
        <p className="home-page__wfr-compact__rec-body">
          Your readiness score gets sharper when employees weigh in. Let&apos;s collect that data.
        </p>
        <Link to="/workforce" className="home-page__wfr-compact__cta">
          Get started <span aria-hidden>→</span>
        </Link>
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

  return (
    <div className="home-page">
      <div className="home-page__cover" aria-hidden />
      <div className="home-page__cover-fade" aria-hidden />
      <header className="home-page__header">
        <NavbarApp />
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
      <main className="home-page__main">
        <div className="home-page__layout grid grid-cols-12 gap-6">
          <div className="home-page__sidebar col-span-4">
            <HomeSidebar />
          </div>
          <div className="home-page__content col-span-8" aria-label="Main content">
            {currentUser.id === 'chro' ? <ChroWorkforceReadinessTeaser /> : null}
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
