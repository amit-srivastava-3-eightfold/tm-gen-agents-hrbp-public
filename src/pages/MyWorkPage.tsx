import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  ProductBackground,
  Header,
  HeaderToolbar,
  HeaderTextGroup,
  HeaderTitle,
} from '@tonyh-2-eightfold/ef-design-system'
import { useUser } from '../contexts/UserContext'
import { NavbarApp } from '../components/Navbar'
import { COACH_PICK, IDEAS, TASK_GROUPS } from '../data/myWorkData'
import { CoachPickCard } from '../components/myWork/CoachPickCard'
import { IdeaCard } from '../components/myWork/IdeaCard'
import { TaskRow } from '../components/myWork/TaskRow'
import { CheckInCard } from '../components/myWork/CheckInCard'
import { CoachFab } from '../components/myWork/CoachFab'
import { CoachDrawer, type CoachDrawerView } from '../components/myWork/CoachDrawer'
import '../components/myWork/myWork.css'
import './MyWorkPage.css'

export function MyWorkPage() {
  const { currentUser } = useUser()
  const [drawerView, setDrawerView] = useState<CoachDrawerView>(null)

  if (currentUser.id !== 'csm') {
    return <Navigate to="/" replace />
  }

  const firstName = currentUser.name.split(' ')[0]

  return (
    <div className="my-work-page my-work">
      <NavbarApp />
      <ProductBackground
        className="my-work-page__bg"
        variant="career-hub"
        wavesVariant="default"
      >
        <Header variant="career-hub" chSize="parent" overlayBackground>
          <HeaderToolbar>
            <HeaderTextGroup>
              <HeaderTitle>My Work</HeaderTitle>
            </HeaderTextGroup>
          </HeaderToolbar>
        </Header>
      </ProductBackground>
      <main className="my-work-page__main">
        <div className="my-work-page__wrap">
          <CoachPickCard
            pick={COACH_PICK}
            firstName={firstName}
            onStart={() => setDrawerView('pr')}
          />

          <div className="mw-section-head">
            <div>
              <h2 className="mw-section-title">A few more ideas for your week</h2>
              <p className="mw-section-sub">Small experiments. No pressure.</p>
            </div>
            <button type="button" className="mw-btn-ghost">
              See all <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div className="mw-ideas">
            {IDEAS.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onCtaClick={(i) => {
                  if (i.ctaAction === 'open-coach-chat') setDrawerView('chat')
                }}
              />
            ))}
          </div>

          <div className="mw-section-head">
            <div>
              <h2 className="mw-section-title">Your work this week</h2>
              <p className="mw-section-sub">
                The recurring things that fill your time, the skills they stretch, and a gentle read on where AI fits.{' '}
                <span className="mw-list__blue">Blue</span> skills are ones your role is growing.
              </p>
            </div>
            <button type="button" className="mw-btn-ghost">Edit list</button>
          </div>

          <div className="mw-groups">
            {TASK_GROUPS.map((group) => (
              <section key={group.kind} className={`mw-group mw-group--${group.kind}`}>
                <header className="mw-group__head">
                  <div className="mw-group__icon" aria-hidden>
                    <span className="material-symbols-outlined">{group.icon}</span>
                  </div>
                  <div>
                    <div className="mw-group__title">{group.title}</div>
                    <div className="mw-group__desc">{group.description}</div>
                  </div>
                </header>
                <div className="mw-group__cards">
                  {group.rows.map((row) => (
                    <TaskRow key={row.id} row={row} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <CheckInCard onStart={() => setDrawerView('checkin')} />

          <div className="mw-quiet">
            Task list is based on your role. <a href="#" onClick={(e) => e.preventDefault()}>What's this?</a>
          </div>
        </div>
      </main>

      <CoachFab onClick={() => setDrawerView('chat')} />
      <CoachDrawer
        view={drawerView}
        firstName={firstName}
        onClose={() => setDrawerView(null)}
      />
    </div>
  )
}
