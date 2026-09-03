import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { CONTAINERS, THREADS, COACHING_PAST_SESSIONS, type Container, type Thread, type CoachingSession, type PastSession } from './agentData'
import './EmployeeAgentHomeAI.css'
import './EmployeeAgentHome.css'

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId =
  | 'development-plan'
  | 'skill-profile'
  | 'mentor'
  | 'project'
  | 'network-visibility'
  | 'coaching'
  | 'people-connection'
  | 'career-opportunities'

type View = 'home' | SectionId | string  // string covers thread IDs

// ─── Section data ─────────────────────────────────────────────────────────────

interface SurfacedItem {
  icon: string
  title: string
  why: string
  action: string
}

interface SeeMoreBullet {
  text: string
  action?: string  // label for inline action chip
}

interface SectionData {
  label: string
  insight: string
  items: SurfacedItem[]
  seeMoreLabel: string
  seeMoreBullets: SeeMoreBullet[]
}

const SECTIONS: Record<SectionId, SectionData> = {
  'development-plan': {
    label: 'Development Plan',
    insight: "You're on track for CS Manager by mid-2027 — but the data storytelling gap is 10 days overdue to start closing.",
    items: [
      {
        icon: 'school',
        title: 'Enroll in Data Storytelling for CS Professionals — 2 weeks, Coursera',
        why: 'Closes the one skill gap flagged in your CS Manager case',
        action: 'Enroll now',
      },
      {
        icon: 'assignment',
        title: 'Sections 3–4 of the Renewal Playbook need an owner by Friday',
        why: 'High-visibility ownership that advances your manager case',
        action: 'Pick this up',
      },
    ],
    seeMoreLabel: 'Development Plan',
    seeMoreBullets: [
      { text: '5 of 7 milestones completed — on track for Q3 close', action: 'View milestones' },
      { text: 'CS Manager readiness: 82% — data storytelling is the remaining gap', action: 'See gap' },
      { text: 'Next milestone: complete 1 leadership project by Oct 2025' },
      { text: '2 recommended courses, 0 started', action: 'Browse courses' },
    ],
  },
  'skill-profile': {
    label: 'Skill Profile',
    insight: "Your enterprise renewal depth is in the top 10% of CSMs at your level — but data storytelling is the one gap holding back your CS Manager case.",
    items: [
      {
        icon: 'trending_up',
        title: 'Data Analysis & Storytelling — beginner, actively needed for your next role',
        why: 'The single skill gap between you and a CS Manager promotion',
        action: 'Find a course',
      },
      {
        icon: 'star',
        title: 'Enterprise Renewal Expertise — expert, ready to showcase',
        why: 'Top 10% at your level — not yet visible on your profile',
        action: 'Add to profile',
      },
    ],
    seeMoreLabel: 'Skill Profile',
    seeMoreBullets: [
      { text: '18 skills verified — 3 expert, 9 proficient, 6 beginner', action: 'See all skills' },
      { text: 'Data storytelling is the only gap flagged for CS Manager', action: 'Find a course' },
      { text: '2 skills added in the last 30 days' },
      { text: 'Profile completeness: 74% — adding career goal would push it to 82%', action: 'Complete profile' },
    ],
  },
  mentor: {
    label: 'Mentor',
    insight: "Your session with Priya Sharma is in 10 days — you have 3 follow-ups from your last session that are still open.",
    items: [
      {
        icon: 'person_add',
        title: 'Connect with Dev Kapoor — Priya suggested this 2 weeks ago',
        why: "He's the CS Manager whose team you'd most likely join — connection is overdue",
        action: 'Message Dev',
      },
      {
        icon: 'menu_book',
        title: 'Enroll in a data course before Sep 5 — your commitment from the last session',
        why: 'Priya will ask about this in your next session in 10 days',
        action: 'Find a course',
      },
    ],
    seeMoreLabel: 'Mentoring',
    seeMoreBullets: [
      { text: 'Mentor: Priya Sharma — Senior CS Manager, 8 sessions completed', action: 'View sessions' },
      { text: 'Next session: Sep 5 at 2 PM', action: 'Add to calendar' },
      { text: '3 open follow-ups from Aug 22 session', action: 'Review follow-ups' },
      { text: 'Priya suggested 2 connections — 1 acted on, 1 pending (Dev Kapoor)', action: 'Message Dev' },
    ],
  },
  project: {
    label: 'Projects',
    insight: "Account Health Dashboard – Phase 2 is the highest-leverage project for your CS Manager case right now — closes your data gap and puts your name on shared infrastructure.",
    items: [
      {
        icon: 'dashboard',
        title: 'Account Health Dashboard – Phase 2 — CS Ops, 6 weeks, 4–6 hrs/week',
        why: 'Closes your data storytelling gap and signals leadership to the right people',
        action: 'Express interest',
      },
      {
        icon: 'description',
        title: 'Q3 Renewal Playbook — deadline in 4 days, Sections 3–4 unowned',
        why: 'High-visibility ownership, directly relevant to renewal expertise',
        action: 'Pick up sections',
      },
    ],
    seeMoreLabel: 'Projects',
    seeMoreBullets: [
      { text: '2 active projects — Q3 Renewal Playbook (deadline Fri), NPS Analysis Sprint (2 wks)', action: 'View active' },
      { text: '3 marketplace projects matched to your skills and goal', action: 'Browse marketplace' },
      { text: 'Account Health Dashboard – Phase 2 is the top match for CS Manager readiness', action: 'Express interest' },
      { text: 'No project completed in last 60 days — consider wrapping one for visibility' },
    ],
  },
  'network-visibility': {
    label: 'Network Visibility',
    insight: "Dev Kapoor viewed your profile 2 days ago — he's the CS Manager whose team you'd most likely join. Your profile is incomplete and may not show what he was looking for.",
    items: [
      {
        icon: 'flag',
        title: 'Add your career goal (CS Manager) to your profile',
        why: 'Profile visitors like Dev can see your intent — currently not visible',
        action: 'Add now',
      },
      {
        icon: 'share',
        title: 'Post the Renewal Playbook draft to CS shared space',
        why: 'Demonstrates renewal expertise to the team working on the Q3 cycle',
        action: 'Share it',
      },
    ],
    seeMoreLabel: 'Network Visibility',
    seeMoreBullets: [
      { text: 'Profile views up 34% this month — 3 from CS Manager-level peers', action: 'See who viewed' },
      { text: 'Dev Kapoor viewed 2 days ago; no connection yet', action: 'Connect with Dev' },
      { text: 'Profile completeness: 74% — goal and recent project missing', action: 'Complete profile' },
      { text: '0 posts in the last 30 days — peers with similar roles average 2–3', action: 'Write a post' },
    ],
  },
  coaching: {
    label: 'Coaching',
    insight: "Your last coaching session was Aug 22. You set a goal to prep for the Nexus QBR — that session is in 3 days.",
    items: [
      {
        icon: 'mic',
        title: 'QBR prep — Nexus account, renewal at risk',
        why: 'Session in 3 days and you haven\'t started prep yet',
        action: 'Start voice session',
      },
      {
        icon: 'notes',
        title: 'Review last session notes',
        why: 'You committed to 2 actions on Aug 22 — check before the QBR',
        action: 'Open notes',
      },
    ],
    seeMoreLabel: 'Coaching',
    seeMoreBullets: [
      { text: '12 coaching sessions total — averaging 1.5 per month', action: 'View history' },
      { text: 'Last session: Aug 22 — goal set: Nexus QBR prep', action: 'See notes' },
      { text: '2 open commitments from last session', action: 'Review commitments' },
      { text: 'Recommended: run a QBR prep session before Aug 30', action: 'Start session' },
    ],
  },
  'people-connection': {
    label: 'People Connection',
    insight: "Sam Torres is running a project adjacent to your Renewal Playbook and you've never crossed paths — that's the connection most likely to matter this quarter.",
    items: [
      {
        icon: 'person',
        title: 'Sam Torres — Product Manager, running parallel account health initiative',
        why: 'Overlapping work this quarter with no connection yet',
        action: 'Message Sam',
      },
      {
        icon: 'handshake',
        title: 'Marcus Webb — SE for 3 of your largest accounts, no direct conversation yet',
        why: 'Direct relationship would help on your top renewal accounts',
        action: 'Start a thread',
      },
    ],
    seeMoreLabel: 'People Connection',
    seeMoreBullets: [
      { text: '47 connections — 12 added in the last 90 days', action: 'View network' },
      { text: '3 CS Manager-level peers in your network, none closely connected', action: 'Connect now' },
      { text: 'Sam Torres: shared project context, no connection', action: 'Message Sam' },
      { text: 'Marcus Webb: SE overlap on 3 accounts, no direct thread', action: 'Start a thread' },
    ],
  },
  'career-opportunities': {
    label: 'Career Opportunities',
    insight: "You're an 87% match for the internal CS Manager role — the only gap is team management, which is closable in one quarter with a deliberate plan.",
    items: [
      {
        icon: 'work',
        title: 'Internal CS Manager role — 87% match, 2 skills to close',
        why: 'Team management is the only gap — closable in one quarter',
        action: 'See learning plan',
      },
      {
        icon: 'open_in_new',
        title: 'Senior CSM at Vertex SaaS — 91% match, near-perfect fit right now',
        why: 'Your highest external match with no skill gaps',
        action: 'View role',
      },
    ],
    seeMoreLabel: 'Career Opportunities',
    seeMoreBullets: [
      { text: '3 internal roles matched — CS Manager (87%), Senior CSM (79%), CS Ops Lead (72%)', action: 'See all internal' },
      { text: '5 external roles matched — top match: Senior CSM at Vertex SaaS (91%)', action: 'See external' },
      { text: 'CS Manager gap: team management experience — closable with one project', action: 'Find a project' },
      { text: 'Application deadline for internal CS Manager: Sep 15', action: 'Start application' },
    ],
  },
}

const SECTION_LINKS: Array<{ id: SectionId; label: string; icon: string }> = [
  { id: 'development-plan', label: 'your development plan', icon: 'map' },
  { id: 'skill-profile', label: 'your skills', icon: 'psychology' },
  { id: 'mentor', label: 'your mentoring', icon: 'school' },
  { id: 'project', label: 'your projects', icon: 'folder_open' },
  { id: 'network-visibility', label: 'your network visibility', icon: 'visibility' },
  { id: 'coaching', label: 'coaching', icon: 'mic' },
  { id: 'people-connection', label: 'your connections', icon: 'people' },
  { id: 'career-opportunities', label: 'career opportunities', icon: 'trending_up' },
]

// ─── Composer ─────────────────────────────────────────────────────────────────

function Composer({ placeholder }: { placeholder?: string }) {
  const [value, setValue] = useState('')
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [value])

  return (
    <div className="eah-ai-composer">
      <textarea
        ref={taRef}
        className="eah-ai-composer__input"
        rows={1}
        placeholder={placeholder ?? 'Ask anything, or describe what you want to do…'}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
      />
      <div className="eah-ai-composer__toolbar">
        <button type="button" className="eah-ai-composer__tool-btn">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
        </button>
        <button type="button" className="eah-ai-composer__tool-btn">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>mic</span>
        </button>
        <span className="eah-ai-composer__hint">Shift+Enter for new line</span>
        <button type="button" className="eah-ai-composer__send" disabled={!value.trim()}>
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
        </button>
      </div>
    </div>
  )
}

// ─── Surfaced items list ───────────────────────────────────────────────────────

function SurfacedItems({ items }: { items: SurfacedItem[] }) {
  return (
    <div className="eah-ai-items">
      {items.map((item, i) => (
        <div key={i} className="eah-ai-item">
          <div className="eah-ai-item__icon">
            <span className="material-symbols-outlined">{item.icon}</span>
          </div>
          <div className="eah-ai-item__body">
            <div className="eah-ai-item__title">{item.title}</div>
            <div className="eah-ai-item__why">{item.why}</div>
          </div>
          <button type="button" className="eah-ai-item__action">{item.action}</button>
        </div>
      ))}
    </div>
  )
}

// ─── Home view ────────────────────────────────────────────────────────────────

function HomeView({ onSection, userName }: { onSection: (id: SectionId) => void; userName: string }) {
  return (
    <div className="eah-ai-subpage">
      {/* Personal greeting */}
      <div className="eah-hero">
        <h1 className="eah-hero__greeting">
          <span className="material-symbols-outlined eah-hero__icon">auto_awesome</span>
          Good morning, {userName}
        </h1>
        <div className="eah-hero__sub">Your agent is watching 5 active threads</div>
      </div>

      {/* Agent voice card */}
      <div className="eah-ai-voice-card">
        <div className="eah-ai-voice-card__eyebrow">Agent · Today's focus</div>
        <p className="eah-ai-voice-card__insight">
          The Renewal Playbook deadline is in 4 days and Sections 3–4 have no owners. That's the one thing that matters this week.
        </p>
      </div>

      {/* Surfaced items */}
      <SurfacedItems
        items={[
          {
            icon: 'assignment',
            title: 'Q3 Renewal Playbook — Sections 3–4 need an owner by Friday',
            why: 'High-visibility gap, directly in your area — deadline in 4 days',
            action: 'Pick this up',
          },
          {
            icon: 'school',
            title: 'Enroll in Data Storytelling for CS Professionals — 2 weeks, Coursera',
            why: 'The one skill gap holding back your CS Manager case',
            action: 'Enroll now',
          },
        ]}
      />

      {/* Composer */}
      <Composer placeholder="Ask me about your week, your goals, or what to do next…" />

      {/* Section links */}
      <div className="eah-ai-sections">
        <div className="eah-ai-sections__label">Ask me about</div>
        {SECTION_LINKS.map(s => (
          <button
            key={s.id}
            type="button"
            className="eah-ai-section-link"
            onClick={() => onSection(s.id)}
          >
            <span className="material-symbols-outlined">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Section sub-page ─────────────────────────────────────────────────────────

function SectionView({ id, onBack }: { id: SectionId; onBack: () => void }) {
  const data = SECTIONS[id]

  return (
    <div className="eah-ai-subpage">
      <button type="button" className="eah-ai-back" onClick={onBack}>
        <span className="material-symbols-outlined">arrow_back</span>
        Home
      </button>

      {/* Agent insight */}
      <div className="eah-ai-voice-card">
        <div className="eah-ai-voice-card__eyebrow">Agent · {data.label}</div>
        <p className="eah-ai-voice-card__insight">{data.insight}</p>
      </div>

      {/* Surfaced items */}
      <SurfacedItems items={data.items} />

      {/* Composer */}
      <Composer placeholder={`Ask me anything about your ${data.label.toLowerCase()}…`} />

      {/* See more */}
      <details className="eah-ai-details">
        <summary>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>expand_more</span>
          See full {data.seeMoreLabel}
        </summary>
        <div className="eah-ai-details__body">
          <ul className="eah-ai-details__list">
            {data.seeMoreBullets.map((b, i) => (
              <li key={i} className="eah-ai-details__bullet-row">
                <span className="eah-ai-details__bullet-text">{b.text}</span>
                {b.action && (
                  <button type="button" className="eah-ai-details__bullet-action">{b.action}</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  )
}

// ─── Thread view ──────────────────────────────────────────────────────────────

function threadInsight(thread: Thread | CoachingSession): string {
  const title = 'title' in thread ? thread.title : ''
  if (title.includes('QBR') || title.includes('Nexus')) return "Your QBR with Nexus is in 3 days. Last session you surfaced 3 risk signals — let's make sure you have a response for each one."
  if (title.includes('AI-Assisted') || title.includes('Account Management')) return "You're in Module 2. Completing this plan closes the data storytelling gap that's holding back your CS Manager case."
  if (title.includes('Data Analysis') || title.includes('Storytelling')) return "This skill path is the single biggest lever for your CS Manager promotion. You haven't started yet — now is the time."
  if (title.includes('Enterprise Renewal') || title.includes('Showcasing')) return "Your renewal expertise is top 10% at your level. The gap: it's not visible. Adding it to your profile takes 2 minutes."
  if (title.includes('Priya') || title.includes('Mentor')) return "Your next session with Priya is Sep 5. You have 3 open follow-ups — she'll ask about them."
  if (title.includes('Renewal Playbook') || title.includes('Q3')) return "Sections 3–4 are still unowned with 4 days until the deadline. You're the most natural owner given your renewal background."
  if (title.includes('Marcus')) return "Marcus offered to take Section 4 of the Renewal Playbook in Slack. A direct message now could close that loop today."
  if (title.includes('difficult renewal') || title.includes('Handling')) return "The frameworks from this session apply directly to the Nexus renewal. Worth a quick review before the QBR."
  if (title.includes('Q4') || title.includes('intentions')) return "You set 3 Q4 intentions in this session. You're halfway through Q3 — a good moment to check progress."
  return "This thread has recent activity. Here's where things stand and what might need your attention."
}

function ThreadView({
  threadId,
  onBack,
}: {
  threadId: string
  onBack: (sectionId: SectionId) => void
}) {
  // Find thread in THREADS or COACHING_PAST_SESSIONS
  const thread: Thread | CoachingSession | undefined =
    THREADS.find(t => t.id === threadId) ??
    COACHING_PAST_SESSIONS.find(s => s.id === threadId)

  if (!thread) {
    return (
      <div className="eah-ai-subpage">
        <button type="button" className="eah-ai-back" onClick={() => onBack('coaching')}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
        <p style={{ color: '#64748b', fontSize: 14 }}>Thread not found.</p>
      </div>
    )
  }

  const isThread = 'containerId' in thread
  const sectionId: SectionId = isThread ? (thread as Thread).containerId as SectionId : 'coaching'
  const sectionLabel = SECTIONS[sectionId]?.label ?? 'Section'
  const title = isThread ? (thread as Thread).title : (thread as CoachingSession).title
  const subtitle = isThread ? (thread as Thread).subtitle : (thread as CoachingSession).snippet
  const pastSteps: PastSession[] = isThread ? (thread as Thread).pastSessions ?? [] : []

  return (
    <div className="eah-ai-subpage">
      <button type="button" className="eah-ai-back" onClick={() => onBack(sectionId)}>
        <span className="material-symbols-outlined">arrow_back</span>
        {sectionLabel}
      </button>

      {/* Thread header */}
      <div className="eah-ai-thread-header">
        <div className="eah-ai-thread-header__title">{title}</div>
        {subtitle && <div className="eah-ai-thread-header__subtitle">{subtitle}</div>}
      </div>

      {/* Agent insight */}
      <div className="eah-ai-voice-card">
        <div className="eah-ai-voice-card__eyebrow">Agent · on this thread</div>
        <p className="eah-ai-voice-card__insight">{threadInsight(thread)}</p>
      </div>

      {/* Past steps / timeline */}
      {pastSteps.length > 0 && (
        <div className="eah-ai-timeline">
          <div className="eah-ai-timeline__label">History</div>
          {pastSteps.slice().reverse().map((step: PastSession) => (
            <div key={step.id} className="eah-ai-timeline__step">
              <div className="eah-ai-timeline__step-date">{step.date}</div>
              <div className="eah-ai-timeline__step-body">
                <div className="eah-ai-timeline__step-title">{step.title}</div>
                <div className="eah-ai-timeline__step-snippet">{step.snippet}</div>
                {step.source && (
                  <span className="eah-ai-timeline__step-source">{step.source}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      <Composer placeholder={`Continue on "${title}"…`} />
    </div>
  )
}

// ─── Sidebar (same as EmployeeAgentHome's Sidebar, reuses eah- classes) ───────

function Sidebar({
  containers,
  view,
  onHome,
  onSection,
  onThread,
}: {
  containers: Container[]
  view: View
  onHome: () => void
  onSection: (id: SectionId) => void
  onThread: (id: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  const NAV_IDS: SectionId[] = [
    'coaching', 'people-connection', 'skill-profile', 'project',
    'mentor', 'network-visibility', 'development-plan', 'career-opportunities',
  ]

  const NON_THREAD_VIEWS = new Set<View>([
    'home', 'coaching', 'connections', 'skill-profile', 'project',
    'mentor', 'network-visibility', 'development-plan', 'career-opportunities',
    'people-connection',
  ])
  const activeThreadId = !NON_THREAD_VIEWS.has(view) ? view : null

  return (
    <div className="eah-sidebar-wrap">
      <nav className={`eah-sidebar${collapsed ? ' eah-sidebar--collapsed' : ''}`}>
        {/* Search */}
        <div className="eah-sidebar__search">
          <div className="eah-sidebar__search-inner">
            <span className="material-symbols-outlined">search</span>
            <input className="eah-sidebar__search-input" type="text" placeholder="Search threads…" />
          </div>
        </div>

        {/* Home */}
        <button
          type="button"
          className={`eah-sidebar__home${view === 'home' ? ' eah-sidebar__home--active' : ''}`}
          onClick={onHome}
        >
          Home
        </button>

        {/* Containers */}
        {containers.map(container => {
          const sectionId = NAV_IDS.find(id => id === container.id) ?? null
          const isActive = view === container.id
          return (
            <div key={container.id} className="eah-sidebar__section">
              <div
                className={`eah-sidebar__container-hd eah-sidebar__container-hd--clickable${isActive ? ' eah-sidebar__container-hd--active' : ''}`}
                onClick={() => { if (sectionId) onSection(sectionId) }}
              >
                <span className="eah-sidebar__container-label">{container.label}</span>
                <span className="material-symbols-outlined eah-sidebar__filter-icon">chevron_right</span>
              </div>
              <div className="eah-sidebar__threads">
                {container.threads.length === 0 ? (
                  <div className="eah-sidebar__empty">
                    <div>{container.emptyInvite}</div>
                    <button
                      type="button"
                      className="eah-sidebar__start-btn"
                      onClick={() => { if (sectionId) onSection(sectionId) }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>add</span>
                      {container.emptyAction}
                    </button>
                  </div>
                ) : (
                  container.threads.map(thread => (
                    <div
                      key={thread.id}
                      className={`eah-sidebar__thread${activeThreadId === thread.id ? ' eah-sidebar__thread--active' : ''}`}
                      onClick={() => onThread(thread.id)}
                    >
                      <span className="material-symbols-outlined eah-sidebar__thread-icon">crop_square</span>
                      <span className="eah-sidebar__thread-name">{thread.title}</span>
                      {thread.tag && (
                        <span className={`eah-thread-tag eah-thread-tag--${thread.tag}`}>
                          {thread.tag === 'developing' ? 'Dev' : 'Show'}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </nav>

      <div
        className="eah-sidebar__toggle-strip"
        onClick={() => setCollapsed(v => !v)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <button type="button" className="eah-sidebar__toggle" tabIndex={-1}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>
    </div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function EmployeeAgentHomeAI({ userName }: { userName: string }) {
  const [view, setView] = useState<View>('home')
  const mainRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useLayoutEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [view])

  const isSectionId = (v: string): v is SectionId => v in SECTIONS

  return (
    <div className="eah-ai-root">
      <Sidebar
        containers={CONTAINERS}
        view={view}
        onHome={() => setView('home')}
        onSection={id => setView(id)}
        onThread={id => setView(id)}
      />
      <div className="eah-ai-main" ref={mainRef}>
        <div className="eah-ai-main__inner">
          {view === 'home' ? (
            <HomeView onSection={id => setView(id)} userName={userName} />
          ) : isSectionId(view) ? (
            <SectionView id={view} onBack={() => setView('home')} />
          ) : (
            <ThreadView
              threadId={view}
              onBack={sectionId => setView(sectionId)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
