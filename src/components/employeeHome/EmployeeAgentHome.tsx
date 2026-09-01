import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import {
  CONTAINERS, RANKED_THREADS, NUDGES, HOME_SUGGESTED_PROMPTS, STAT_STRIP,
  COACHING_PAST_SESSIONS, COACHING_SUGGESTED_PROMPTS, COACHING_TIME_SLOTS,
  CONNECTION_FEED, CONNECTIONS_PROMPTS, PERSONALITY_ASSESSMENT,
  SARAH_PERSONALITY_TYPE, PERSONALITY_LABELS, PERSONALITY_DESCS, SIGNAL_LABELS,
  SARAH_SKILLS, SKILL_PROFILE_PROMPTS, MENTOR_SUGGESTIONS, MENTOR_PROMPTS,
  PROJECT_MARKETPLACE, PROJECT_PROMPTS, PROJECT_SIGNAL_LABELS,
  VISIBILITY_ACTIONS, NETWORK_VISIBILITY_PROMPTS,
  VISIBILITY_PEER_COMPARISONS, VISIBILITY_PROFILE_SECTIONS, VISIBILITY_RECENTLY_VIEWED,
  DEV_GOALS, DEVELOPMENT_PLAN_PROMPTS, DEV_MILESTONES, DEV_PLAN_AGENT_INSIGHT,
  MENTOR_PAST_SESSIONS, MENTOR_NEXT_SESSION,
  CAREER_OPPORTUNITIES, CAREER_PROMPTS, CAREER_INTEREST_AREAS, SARAH_INTERESTS,
  type Container, type Thread, type Nudge, type CoachingSession, type CoachingTimeSlot,
  type ConnectionEntry, type ConnectionIntent, type PersonalityType, type RelevanceSignal,
  type SkillEntry, type SkillStatus, type SkillProficiency, type MentorSuggestion,
  type ProjectEntry, type ProjectSignal, type VisibilityAction, type DevGoal,
  type JobOpening, type LearningStep, type CareerInterestArea,
  type DevMilestone, type MentorSession, type VisibilityPeerComparison,
} from './agentData'
import './EmployeeAgentHome.css'

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  activeThreadId,
  onHome,
  onCoaching,
  onConnections,
  onSkillProfile,
  onProjects,
  onMentor,
  onNetworkVisibility,
  onDevelopmentPlan,
  onCareerOpportunities,
  onThread,
  isHome,
  isCoaching,
  isConnections,
  isSkillProfile,
  isProjects,
  isMentor,
  isNetworkVisibility,
  isDevelopmentPlan,
  isCareerOpportunities,
  containers,
}: {
  activeThreadId: string | null
  onHome: () => void
  onCoaching: () => void
  onConnections: () => void
  onSkillProfile: () => void
  onProjects: () => void
  onMentor: () => void
  onNetworkVisibility: () => void
  onDevelopmentPlan: () => void
  onCareerOpportunities: () => void
  onThread: (id: string) => void
  isHome: boolean
  isCoaching: boolean
  isConnections: boolean
  isSkillProfile: boolean
  isProjects: boolean
  isMentor: boolean
  isNetworkVisibility: boolean
  isDevelopmentPlan: boolean
  isCareerOpportunities: boolean
  containers: Container[]
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const NAV_MAP: Record<string, { fn: () => void; active: boolean }> = {
    'coaching':             { fn: onCoaching,             active: isCoaching },
    'people-connection':    { fn: onConnections,           active: isConnections },
    'skill-profile':        { fn: onSkillProfile,          active: isSkillProfile },
    'project':              { fn: onProjects,              active: isProjects },
    'mentor':               { fn: onMentor,                active: isMentor },
    'network-visibility':   { fn: onNetworkVisibility,     active: isNetworkVisibility },
    'development-plan':     { fn: onDevelopmentPlan,       active: isDevelopmentPlan },
    'career-opportunities': { fn: onCareerOpportunities,   active: isCareerOpportunities },
  }

  return (
    <div className="eah-sidebar-wrap">
    <nav className={`eah-sidebar${sidebarCollapsed ? ' eah-sidebar--collapsed' : ''}`}>
      {/* Search */}
      <div className="eah-sidebar__search">
        <div className="eah-sidebar__search-inner">
          <span className="material-symbols-outlined">search</span>
          <input
            className="eah-sidebar__search-input"
            type="text"
            placeholder="Search threads…"
          />
        </div>
      </div>

      {/* Home nav — plain text, no icon */}
      <button
        type="button"
        className={`eah-sidebar__home${isHome ? ' eah-sidebar__home--active' : ''}`}
        onClick={onHome}
      >
        Home
      </button>

      {/* Containers — always expanded */}
      {containers.map(container => {
        const nav = NAV_MAP[container.id]
        const isActive = nav?.active ?? false
        return (
          <div key={container.id} className="eah-sidebar__section">
            <div
              className={`eah-sidebar__container-hd eah-sidebar__container-hd--clickable${isActive ? ' eah-sidebar__container-hd--active' : ''}`}
              onClick={nav?.fn}
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
                    onClick={nav?.fn}
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

    {/* Toggle strip — always visible at the sidebar boundary */}
    <div
      className="eah-sidebar__toggle-strip"
      onClick={() => setSidebarCollapsed(v => !v)}
      title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <button type="button" className="eah-sidebar__toggle" tabIndex={-1}>
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
          {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>
    </div>
    </div>
  )
}

// ─── Home view ────────────────────────────────────────────────────────────────

function HomeView({
  userName,
  onThread,
  onProject,
}: {
  userName: string
  onThread: (id: string) => void
  onProject: (id: string) => void
}) {
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set())
  const [composerValue, setComposerValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const visibleNudges = NUDGES.filter(n => !dismissedNudges.has(n.id))
  const attentionThreads = RANKED_THREADS.slice(0, 3)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerValue])

  const badgeVariant = (t: Thread) => {
    if (t.deadlineDaysFromNow !== null && t.deadlineDaysFromNow <= 5) return 'deadline'
    if (t.status === 'stalled') return 'stalled'
    return 'active'
  }

  const badgeIcon = (t: Thread) => {
    if (t.deadlineDaysFromNow !== null && t.deadlineDaysFromNow <= 5) return 'schedule'
    if (t.status === 'stalled') return 'pause_circle'
    return 'radio_button_checked'
  }

  const containerLabel = (containerId: string) =>
    CONTAINERS.find(c => c.id === containerId)?.label ?? containerId

  return (
    <div className="eah-main__inner">
      {/* Hero greeting — large centered, no card */}
      <div className="eah-hero">
        <h1 className="eah-hero__greeting">
          <span className="material-symbols-outlined eah-hero__icon">auto_awesome</span>
          Good morning, {userName}
        </h1>
        <div className="eah-hero__sub">Your agent is watching 5 active threads</div>
      </div>

      {/* Suggested prompts — above composer */}
      <div className="eah-chips">
        {HOME_SUGGESTED_PROMPTS.map(p => (
          <button
            key={p}
            type="button"
            className="eah-chip"
            onClick={() => setComposerValue(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="eah-composer">
        <textarea
          ref={textareaRef}
          className="eah-composer__input"
          rows={1}
          placeholder="Ask anything, or describe a task to start…"
          value={composerValue}
          onChange={e => setComposerValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault() } }}
        />
        <div className="eah-composer__toolbar">
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">mic</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">psychology</span>
            Skills
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_more</span>
          </button>
          <span className="eah-composer__hint">Shift+Enter for new line</span>
          <button type="button" className="eah-composer__send" disabled={!composerValue.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="eah-stats">
        {STAT_STRIP.map((stat, i) => {
          const iconMod = i === 0 ? 'neutral' : i === 1 ? 'warn' : 'positive'
          return (
            <div key={stat.label} className="eah-stat">
              <div className={`eah-stat__icon eah-stat__icon--${iconMod}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{stat.icon}</span>
              </div>
              <div className="eah-stat__body">
                <div className="eah-stat__value">{stat.value}</div>
                <div className="eah-stat__label">{stat.label}</div>
                <div className="eah-stat__delta">{stat.delta}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Top project suggestion */}
      {(() => {
        const topProject = PROJECT_MARKETPLACE.find(p => !p.isCommitted)
        if (!topProject) return null
        return (
          <div
            className="eah-project-suggestion eah-project-suggestion--clickable"
            onClick={() => onProject(topProject.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onProject(topProject.id) }}
          >
            <div className="eah-project-suggestion__eyebrow">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>rocket_launch</span>
              Suggested project
              <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 'auto', color: '#6366f1' }}>arrow_forward</span>
            </div>
            <div className="eah-project-suggestion__title">{topProject.title}</div>
            <div className="eah-project-suggestion__why">{topProject.why}</div>
            <div className="eah-project-suggestion__meta">
              {topProject.team} · {topProject.duration} · {topProject.timeCommitment}
            </div>
            <div className="eah-project-suggestion__chips">
              {topProject.signals.map(s => (
                <span key={s} className="eah-project-suggestion__chip">{PROJECT_SIGNAL_LABELS[s]}</span>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Action items */}
      <div>
        <div className="eah-section-hd">
          <span className="eah-section-title">
            Action items
            <span className="eah-section-count">{attentionThreads.length}</span>
          </span>
          <button type="button" className="eah-section-link">
            View all
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
          </button>
        </div>
        <div className="eah-tiles">
          {attentionThreads.map(thread => (
            <div key={thread.id} className="eah-tile" onClick={() => onThread(thread.id)}>
              <div className={`eah-tile__badge eah-tile__badge--${badgeVariant(thread)}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{badgeIcon(thread)}</span>
              </div>
              <div className="eah-tile__body">
                <div className="eah-tile__container">{containerLabel(thread.containerId)}</div>
                <div className="eah-tile__title">{thread.title}</div>
                <div className="eah-tile__reason">{thread.tileReason}</div>
              </div>
              <button
                type="button"
                className="eah-tile__action"
                onClick={e => { e.stopPropagation(); onThread(thread.id) }}
              >
                {thread.tileAction}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions / nudges */}
      {visibleNudges.length > 0 && (
        <div>
          <div className="eah-section-hd">
            <span className="eah-section-title">Suggestions</span>
          </div>
          <div className="eah-nudges">
            {visibleNudges.map((nudge: Nudge) => (
              <div key={nudge.id} className="eah-nudge">
                <div className="eah-nudge__icon">
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{nudge.icon}</span>
                </div>
                <div className="eah-nudge__body">
                  <div className="eah-nudge__text">{nudge.text}</div>
                  <div className="eah-nudge__detail">{nudge.detail}</div>
                </div>
                <div className="eah-nudge__actions">
                  <button type="button" className="eah-nudge__accept">{nudge.acceptLabel}</button>
                  <button
                    type="button"
                    className="eah-nudge__dismiss"
                    onClick={() => setDismissedNudges(prev => new Set([...prev, nudge.id]))}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Thread view ──────────────────────────────────────────────────────────────

function ThreadView({
  thread,
  onBack,
}: {
  thread: Thread
  onBack: () => void
}) {
  const [composerValue, setComposerValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const container = CONTAINERS.find(c => c.id === thread.containerId)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerValue])

  return (
    <div className="eah-thread">
      <button type="button" className="eah-thread__back" onClick={onBack}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
        Back to Home
      </button>

      <div>
        <div className="eah-thread__hd">
          {container && (
            <span className="eah-thread__container-tag">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{container.icon}</span>
              {container.label}
            </span>
          )}
          <span className={`eah-thread__status-tag eah-thread__status-tag--${thread.status}`}>
            {thread.status === 'stalled' ? '⏸ Stalled' : thread.status === 'completed' ? '✓ Complete' : '● Active'}
          </span>
        </div>
        <div className="eah-thread__title" style={{ marginTop: 10 }}>{thread.title}</div>
        <div className="eah-thread__subtitle">{thread.subtitle}</div>
      </div>

      {/* Thread greeting card */}
      <div className="eah-greeting">
        <div className="eah-greeting__avatar">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#fff' }}>auto_awesome</span>
        </div>
        <div className="eah-greeting__body">
          <div className="eah-greeting__label">Agent · scoped to this thread</div>
          <div className="eah-greeting__text"
            dangerouslySetInnerHTML={{
              __html: thread.agentMessage
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br/>')
            }}
          />
        </div>
      </div>

      {/* Thread suggested prompts — above composer */}
      <div className="eah-chips">
        {thread.suggestedQuestions.map(q => (
          <button
            key={q}
            type="button"
            className="eah-chip"
            onClick={() => setComposerValue(q)}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Thread composer */}
      <div className="eah-composer">
        <textarea
          ref={textareaRef}
          className="eah-composer__input"
          rows={1}
          placeholder={`Ask anything about ${thread.title}…`}
          value={composerValue}
          onChange={e => setComposerValue(e.target.value)}
        />
        <div className="eah-composer__toolbar">
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">mic</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">psychology</span>
            Skills
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_more</span>
          </button>
          <span className="eah-composer__hint">Shift+Enter for new line</span>
          <button type="button" className="eah-composer__send" disabled={!composerValue.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      {/* Featured card */}
      <div className="eah-featured">
        <div className="eah-featured__top">
          <span className="eah-featured__status">{thread.featuredStatus}</span>
        </div>
        <div className="eah-featured__body">
          <div className="eah-featured__desc">{thread.featuredDescription}</div>
          <div className="eah-featured__actions">
            {thread.featuredActions.map(action => (
              <button
                key={action.label}
                type="button"
                className={action.variant === 'primary' ? 'eah-btn-primary' : 'eah-btn-secondary'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Past discussions */}
      <div>
        <div className="eah-section-hd">
          <span className="eah-section-title">Past discussions in this thread</span>
        </div>
        <div className="eah-past">
          {thread.pastSessions.map(session => (
            <div key={session.id} className="eah-past-tile">
              <div className="eah-past-tile__date">{session.date}</div>
              <div className="eah-past-tile__body">
                <div className="eah-past-tile__title">{session.title}</div>
                <div className="eah-past-tile__snippet">{session.snippet}</div>
                {session.source && (
                  <div className="eah-past-tile__source">
                    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>link</span>
                    via {session.source}
                  </div>
                )}
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#cbd5e1', alignSelf: 'center', flexShrink: 0 }}>chevron_right</span>
            </div>
          ))}
        </div>
      </div>

      {thread.continuityNote && (
        <div className="eah-continuity">
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>link</span>
          {thread.continuityNote}
        </div>
      )}
    </div>
  )
}

// ─── Coaching view ────────────────────────────────────────────────────────────

type CoachingSubView = 'landing' | 'chat' | 'voice'

function CoachingView({ onBack }: { onBack: () => void }) {
  const [subView, setSubView] = useState<CoachingSubView>('landing')
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [composerValue, setComposerValue] = useState('')
  const [voiceState, setVoiceState] = useState<'listening' | 'speaking'>('listening')
  const [voiceSecs, setVoiceSecs] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerValue])

  useEffect(() => {
    if (subView !== 'voice') return
    const timer = setInterval(() => setVoiceSecs(s => s + 1), 1000)
    const toggler = setInterval(() => setVoiceState(s => s === 'listening' ? 'speaking' : 'listening'), 3200)
    return () => { clearInterval(timer); clearInterval(toggler) }
  }, [subView])

  const bookSlot = (slot: CoachingTimeSlot) => {
    setSelectedSlot(slot.id)
    setTimeout(() => setScheduleConfirmed(true), 280)
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // ── Full-screen: voice session ────────────────────────────────────────────
  if (subView === 'voice') {
    return (
      <div className="eah-session-overlay eah-session-overlay--voice">
        <button type="button" className="eah-voice-back" onClick={() => { setSubView('landing'); setVoiceSecs(0) }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
          End session
        </button>

        <div className="eah-voice-center">
          <div className={`eah-voice-orb eah-voice-orb--${voiceState}`}>
            <div className="eah-voice-orb__ring eah-voice-orb__ring--1" />
            <div className="eah-voice-orb__ring eah-voice-orb__ring--2" />
            <div className="eah-voice-orb__ring eah-voice-orb__ring--3" />
            <div className="eah-voice-orb__core">
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#fff' }}>record_voice_over</span>
            </div>
          </div>
          <div className="eah-voice-status">{voiceState === 'listening' ? 'Listening…' : 'Speaking…'}</div>
          <div className="eah-voice-timer">{fmt(voiceSecs)}</div>
        </div>

        <div className="eah-voice-controls">
          <button type="button" className="eah-voice-ctrl eah-voice-ctrl--mute" title="Mute">
            <span className="material-symbols-outlined">mic_off</span>
          </button>
          <button type="button" className="eah-voice-ctrl eah-voice-ctrl--end" title="End call" onClick={() => { setSubView('landing'); setVoiceSecs(0) }}>
            <span className="material-symbols-outlined">call_end</span>
          </button>
          <button type="button" className="eah-voice-ctrl eah-voice-ctrl--note" title="Take a note">
            <span className="material-symbols-outlined">note_add</span>
          </button>
        </div>
      </div>
    )
  }

  // ── Landing ───────────────────────────────────────────────────────────────
  return (
    <div className="eah-thread">
      <button type="button" className="eah-thread__back" onClick={onBack}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
        Back to Home
      </button>

      {/* Personal contextual header */}
      <div className="eah-coaching-header">
        <h2 className="eah-coaching-header__title">Your coaching space</h2>
        <p className="eah-coaching-header__context">
          Your last session was Aug 22 — you were prepping for the Nexus QBR. You have the Renewal Playbook deadline in 4 days and Module 2 still pending. Sometimes it helps to talk through what's actually weighing on you, not just the task list.
        </p>
      </div>

      {/* Chips + composer — default, always visible */}
      <div className="eah-chips">
        {COACHING_SUGGESTED_PROMPTS.map(p => (
          <button key={p} type="button" className="eah-chip" onClick={() => setComposerValue(p)}>{p}</button>
        ))}
      </div>

      <div className="eah-composer">
        <textarea
          ref={textareaRef}
          className="eah-composer__input"
          rows={1}
          placeholder="Share what's on your mind…"
          value={composerValue}
          onChange={e => setComposerValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
        />
        <div className="eah-composer__toolbar">
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">mic</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">psychology</span>
            Skills
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_more</span>
          </button>
          <span className="eah-composer__hint">Shift+Enter for new line</span>
          <button type="button" className="eah-composer__send" disabled={!composerValue.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      {/* Voice option — below composer */}
      <div className="eah-coaching-voice-row">
        <span className="material-symbols-outlined eah-coaching-voice-row__icon">record_voice_over</span>
        <span className="eah-coaching-voice-row__label">Prefer to talk it through?</span>
        <button type="button" className="eah-btn-secondary eah-coaching-voice-row__btn" onClick={() => { setSubView('voice'); setShowSchedule(false) }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>mic</span>
          Start voice session
        </button>
        <button type="button" className="eah-coaching-voice-row__sched" onClick={() => { setShowSchedule(s => !s); setScheduleConfirmed(false); setSelectedSlot(null) }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
          Schedule
        </button>
      </div>

      {/* Voice schedule slot picker */}
      {showSchedule && (
        <div className="eah-coaching-schedule">
          <div className="eah-section-hd">
            <span className="eah-section-title">
              {scheduleConfirmed ? 'Voice session scheduled' : 'Pick a time'}
            </span>
            {!scheduleConfirmed && (
              <button type="button" className="eah-section-link" onClick={() => setShowSchedule(false)}>
                Cancel
              </button>
            )}
          </div>

          {scheduleConfirmed ? (
            <div className="eah-coaching-confirmed">
              <div className="eah-coaching-confirmed__icon">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>check_circle</span>
              </div>
              <div>
                <div className="eah-coaching-confirmed__title">
                  {COACHING_TIME_SLOTS.find(s => s.id === selectedSlot)?.day} · {COACHING_TIME_SLOTS.find(s => s.id === selectedSlot)?.time}
                </div>
                <div className="eah-coaching-confirmed__sub">Added to your calendar. You'll get a reminder 10 minutes before.</div>
              </div>
            </div>
          ) : (
            <div className="eah-coaching-slots">
              {COACHING_TIME_SLOTS.map(slot => (
                <button key={slot.id} type="button" className="eah-coaching-slot" onClick={() => bookSlot(slot)}>
                  <div className="eah-coaching-slot__day">{slot.day}</div>
                  <div className="eah-coaching-slot__time">{slot.time}</div>
                  <span className="eah-coaching-slot__dur">{slot.duration}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Past sessions */}
      <div>
        <div className="eah-section-hd">
          <span className="eah-section-title">
            Past sessions
            <span className="eah-section-count">{COACHING_PAST_SESSIONS.length}</span>
          </span>
        </div>
        <div className="eah-past">
          {COACHING_PAST_SESSIONS.map((session: CoachingSession) => (
            <div key={session.id} className="eah-past-tile">
              <div className="eah-past-tile__date">{session.date}</div>
              <div className="eah-past-tile__body">
                <div className="eah-coaching-session-hd">
                  <div className="eah-past-tile__title">{session.title}</div>
                  <span className={`eah-coaching-badge eah-coaching-badge--${session.mode}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 10 }}>
                      {session.mode === 'voice' ? 'mic' : 'chat'}
                    </span>
                    {session.mode} · {session.durationMin} min
                  </span>
                </div>
                <div className="eah-past-tile__snippet">{session.snippet}</div>
                <div className="eah-coaching-followups">
                  {session.followUpPrompts.map(p => (
                    <button
                      key={p}
                      type="button"
                      className="eah-chip"
                      onClick={() => { setComposerValue(p); setSubView('chat') }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Skill profile view ────────────────────────────────────────────────────────

const PROFICIENCY_LABEL: Record<SkillProficiency, string> = {
  beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert',
}
const STATUS_META: Record<SkillStatus, { label: string; color: string; bg: string }> = {
  gap:      { label: 'Gap',      color: '#dc2626', bg: '#fef2f2' },
  growing:  { label: 'Growing',  color: '#d97706', bg: '#fffbeb' },
  strength: { label: 'Strength', color: '#16a34a', bg: '#f0fdf4' },
}

type SkillFilter = 'all' | SkillStatus

function SkillProfileView({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<SkillFilter>('all')
  const [composerValue, setComposerValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerValue])

  const categories = Array.from(new Set(SARAH_SKILLS.map(s => s.category)))
  const visibleSkills = filter === 'all' ? SARAH_SKILLS : SARAH_SKILLS.filter(s => s.status === filter)

  const activeSkillThreads = RANKED_THREADS.filter(t => t.containerId === 'skill-profile')
  const gapCount = SARAH_SKILLS.filter(s => s.status === 'gap').length
  const strengthCount = SARAH_SKILLS.filter(s => s.status === 'strength').length

  return (
    <div className="eah-thread">
      <button type="button" className="eah-thread__back" onClick={onBack}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
        Back to Home
      </button>

      <div className="eah-coaching-header" style={{ paddingBottom: 0 }}>
        <h2 className="eah-coaching-header__title">Your skill profile</h2>
        <p className="eah-coaching-header__context">
          {SARAH_SKILLS.length} skills tracked · {gapCount} gaps to close · {strengthCount} strengths to showcase
        </p>
      </div>

      {/* Chips + composer */}
      <div className="eah-chips">
        {SKILL_PROFILE_PROMPTS.map(p => (
          <button key={p} type="button" className="eah-chip" onClick={() => setComposerValue(p)}>{p}</button>
        ))}
      </div>
      <div className="eah-composer">
        <textarea
          ref={textareaRef}
          className="eah-composer__input"
          rows={1}
          placeholder="Ask about your skills, gaps, or what to work on next…"
          value={composerValue}
          onChange={e => setComposerValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
        />
        <div className="eah-composer__toolbar">
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">mic</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">psychology</span>
            Skills
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_more</span>
          </button>
          <span className="eah-composer__hint">Shift+Enter for new line</span>
          <button type="button" className="eah-composer__send" disabled={!composerValue.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      {/* Active skill threads */}
      {activeSkillThreads.length > 0 && (
        <div>
          <div className="eah-section-hd">
            <span className="eah-section-title">Active actions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeSkillThreads.map(t => (
              <div key={t.id} className="eah-skill-thread-card">
                <div className="eah-skill-thread-card__top">
                  <span className={`eah-skill-tag eah-skill-tag--${t.tag ?? 'developing'}`}>
                    {t.tag === 'showcasing' ? 'Showcasing' : 'Developing'}
                  </span>
                  {t.tag !== 'showcasing' && t.status === 'stalled' && (
                    <span className="eah-skill-thread-card__stalled">
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>pause_circle</span>
                      Stalled
                    </span>
                  )}
                </div>
                <div className="eah-skill-thread-card__title">{t.title.replace(/^(Developing|Showcasing): /, '')}</div>
                <div className="eah-skill-thread-card__snippet">{t.tileReason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passive skill browse */}
      <div>
        <div className="eah-section-hd">
          <span className="eah-section-title">All skills</span>
          <div className="eah-skill-filter-row">
            {(['all', 'gap', 'growing', 'strength'] as SkillFilter[]).map(f => (
              <button
                key={f}
                type="button"
                className={`eah-skill-filter-btn${filter === f ? ' eah-skill-filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : STATUS_META[f as SkillStatus].label}
              </button>
            ))}
          </div>
        </div>

        {categories.map(cat => {
          const catSkills = visibleSkills.filter(s => s.category === cat)
          if (catSkills.length === 0) return null
          return (
            <div key={cat} className="eah-skill-category">
              <div className="eah-skill-category__name">{cat}</div>
              <div className="eah-skill-rows">
                {catSkills.map((skill: SkillEntry) => {
                  const sm = STATUS_META[skill.status]
                  return (
                    <div key={skill.id} className="eah-skill-row">
                      <span className="eah-skill-row__name">{skill.name}</span>
                      <span className="eah-skill-row__prof">{PROFICIENCY_LABEL[skill.proficiency]}</span>
                      <span className="eah-skill-status-badge" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Connections view ─────────────────────────────────────────────────────────

const INTENT_LABELS: Record<ConnectionIntent, string> = {
  'growing':    'Growing',
  'new-joinee': 'New here',
  'exploring':  'Exploring',
}

const INTENT_CONTEXT: Record<ConnectionIntent, { title: string; sub: string }> = {
  'growing':    { title: 'People worth knowing right now', sub: 'Based on your skill gaps, projects, and where you\'re heading — people you\'d otherwise never cross paths with.' },
  'new-joinee': { title: 'Find your people, faster', sub: 'Who to know in the first 30 days — the ones who make ramp feel less like a solo sport.' },
  'exploring':  { title: 'Map your next move', sub: 'People already where you want to go, or who can open a door you haven\'t knocked on yet.' },
}

const SIGNAL_COLORS: Record<RelevanceSignal, { bg: string; color: string }> = {
  'skill-gap':        { bg: '#eef2ff', color: '#6366f1' },
  'project':          { bg: '#f0fdfa', color: '#0d9488' },
  'role-trending':    { bg: '#fffbeb', color: '#d97706' },
  'cross-functional': { bg: '#eff6ff', color: '#2563eb' },
  'buddy':            { bg: '#f0fdf4', color: '#16a34a' },
  'hiring':           { bg: '#fdf4ff', color: '#9333ea' },
}

const TYPE_COLORS: Record<PersonalityType, { bg: string; color: string }> = {
  connector: { bg: '#eef2ff', color: '#6366f1' },
  catalyst:  { bg: '#fffbeb', color: '#d97706' },
  architect: { bg: '#f0fdfa', color: '#0d9488' },
  driver:    { bg: '#fef2f2', color: '#dc2626' },
}

const ACTION_LABELS: Record<string, { label: string; icon: string; prompt: (name: string) => string }> = {
  'message':      { label: 'Message',            icon: 'send',         prompt: (n) => `Help me write a short message to ${n}` },
  'see-work':     { label: 'See their work',     icon: 'open_in_new',  prompt: (n) => `What is ${n} working on that I should know about?` },
  'request-intro':{ label: 'Request an intro',   icon: 'person_add',   prompt: (n) => `Help me request an intro to ${n}` },
}

function ConnectionsView({ onBack }: { onBack: () => void }) {
  const [intent, setIntent] = useState<ConnectionIntent>('growing')
  const [composerValue, setComposerValue] = useState('')
  const [showAssessment, setShowAssessment] = useState(false)
  const [assessmentStep, setAssessmentStep] = useState(0)
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({})
  const [assessmentDone, setAssessmentDone] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerValue])

  const answerQuestion = (qId: string, value: string) => {
    const next = { ...assessmentAnswers, [qId]: value }
    setAssessmentAnswers(next)
    if (assessmentStep < PERSONALITY_ASSESSMENT.length - 1) {
      setTimeout(() => setAssessmentStep(s => s + 1), 200)
    } else {
      setTimeout(() => { setAssessmentDone(true); setShowAssessment(false) }, 260)
    }
  }

  const feed = CONNECTION_FEED.filter(e => e.intents.includes(intent))
  const ctx = INTENT_CONTEXT[intent]

  return (
    <div className="eah-thread">
      <button type="button" className="eah-thread__back" onClick={onBack}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
        Back to Home
      </button>

      {/* Intent selector */}
      <div className="eah-intent-tabs">
        {(Object.keys(INTENT_LABELS) as ConnectionIntent[]).map(i => (
          <button
            key={i}
            type="button"
            className={`eah-intent-tab${intent === i ? ' eah-intent-tab--active' : ''}`}
            onClick={() => { setIntent(i); setComposerValue('') }}
          >
            {INTENT_LABELS[i]}
          </button>
        ))}
      </div>

      {/* Context header */}
      <div className="eah-coaching-header" style={{ paddingBottom: 0 }}>
        <h2 className="eah-coaching-header__title">{ctx.title}</h2>
        <p className="eah-coaching-header__context">{ctx.sub}</p>
      </div>

      {/* Chips + composer */}
      <div className="eah-chips">
        {CONNECTIONS_PROMPTS[intent].map(p => (
          <button key={p} type="button" className="eah-chip" onClick={() => setComposerValue(p)}>{p}</button>
        ))}
      </div>

      <div className="eah-composer">
        <textarea
          ref={textareaRef}
          className="eah-composer__input"
          rows={1}
          placeholder="Ask about people, roles, or how to reach out…"
          value={composerValue}
          onChange={e => setComposerValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
        />
        <div className="eah-composer__toolbar">
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">mic</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">psychology</span>
            Skills
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_more</span>
          </button>
          <span className="eah-composer__hint">Shift+Enter for new line</span>
          <button type="button" className="eah-composer__send" disabled={!composerValue.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      {/* Connection style strip */}
      {!showAssessment && (
        <div className="eah-conn-style-strip">
          {assessmentDone ? (
            <>
              <span
                className="eah-conn-type-badge"
                style={{ background: TYPE_COLORS[SARAH_PERSONALITY_TYPE].bg, color: TYPE_COLORS[SARAH_PERSONALITY_TYPE].color }}
              >
                {PERSONALITY_LABELS[SARAH_PERSONALITY_TYPE]}
              </span>
              <span className="eah-conn-style-strip__desc">{PERSONALITY_DESCS[SARAH_PERSONALITY_TYPE]}</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#94a3b8' }}>emoji_objects</span>
              <span className="eah-conn-style-strip__desc">Know your connection style — shapes how guidance is personalized.</span>
              <button type="button" className="eah-conn-style-strip__btn" onClick={() => { setShowAssessment(true); setAssessmentStep(0) }}>
                Take assessment
              </button>
            </>
          )}
        </div>
      )}

      {/* Inline assessment */}
      {showAssessment && (
        <div className="eah-conn-assessment">
          <div className="eah-conn-assessment__progress">
            {PERSONALITY_ASSESSMENT.map((_, i) => (
              <div key={i} className={`eah-conn-assessment__dot${i <= assessmentStep ? ' eah-conn-assessment__dot--done' : ''}`} />
            ))}
          </div>
          <div className="eah-conn-assessment__q">{PERSONALITY_ASSESSMENT[assessmentStep].question}</div>
          <div className="eah-conn-assessment__options">
            {PERSONALITY_ASSESSMENT[assessmentStep].options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className="eah-conn-assessment__opt"
                onClick={() => answerQuestion(PERSONALITY_ASSESSMENT[assessmentStep].id, opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button type="button" className="eah-section-link" style={{ marginTop: 4 }} onClick={() => setShowAssessment(false)}>Cancel</button>
        </div>
      )}

      {/* People feed */}
      <div>
        <div className="eah-section-hd">
          <span className="eah-section-title">
            {feed.length} {feed.length === 1 ? 'person' : 'people'} surfaced
          </span>
        </div>

        <div className="eah-conn-feed">
          {feed.map((entry: ConnectionEntry) => {
            const sig = SIGNAL_COLORS[entry.signal]
            const typ = TYPE_COLORS[entry.theirType]
            return (
              <div key={entry.id} className="eah-conn-entry">
                <div className="eah-conn-entry__left">
                  <div className="eah-conn-avatar" style={{ background: typ.color }}>
                    {entry.initials}
                  </div>
                </div>

                <div className="eah-conn-entry__body">
                  {/* Name row */}
                  <div className="eah-conn-entry__name-row">
                    <span className="eah-conn-entry__name">{entry.name}</span>
                    {entry.isExisting && <span className="eah-conn-card__existing">connected</span>}
                    <span className="eah-conn-type-badge" style={{ background: typ.bg, color: typ.color }}>
                      {PERSONALITY_LABELS[entry.theirType]}
                    </span>
                  </div>

                  {/* Role */}
                  <div className="eah-conn-entry__role">{entry.role} · {entry.company}</div>

                  {/* Signal badge */}
                  <span className="eah-conn-signal" style={{ background: sig.bg, color: sig.color }}>
                    {SIGNAL_LABELS[entry.signal]}
                  </span>

                  {/* WHY — the rationale, non-negotiable */}
                  <div className="eah-conn-entry__why">{entry.why}</div>

                  {/* How to connect — subtle */}
                  <div className="eah-conn-entry__how">{entry.howToConnect}</div>

                  {/* Actions */}
                  <div className="eah-conn-entry__actions">
                    {entry.actions.map(action => {
                      const a = ACTION_LABELS[action]
                      return (
                        <button
                          key={action}
                          type="button"
                          className="eah-conn-action"
                          onClick={() => setComposerValue(a.prompt(entry.name))}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{a.icon}</span>
                          {a.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Project marketplace view ─────────────────────────────────────────────────

const SIGNAL_META: Record<ProjectSignal, { label: string; bg: string; color: string }> = {
  'skill-gap':       { label: 'Closes a skill gap',    bg: '#eef2ff', color: '#6366f1' },
  'visibility':      { label: 'Raises visibility',     bg: '#f0fdfa', color: '#0d9488' },
  'mobility-up':     { label: 'Next level',            bg: '#fffbeb', color: '#d97706' },
  'mobility-across': { label: 'Lateral move',          bg: '#eff6ff', color: '#2563eb' },
}

function ProjectMarketplaceView({ onBack }: { onBack: () => void }) {
  const [composerValue, setComposerValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerValue])

  const available = PROJECT_MARKETPLACE.filter(p => !p.isCommitted)
  const committed = PROJECT_MARKETPLACE.filter(p => p.isCommitted)

  return (
    <div className="eah-thread">
      <button type="button" className="eah-thread__back" onClick={onBack}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
        Back to Home
      </button>

      <div className="eah-coaching-header" style={{ paddingBottom: 0 }}>
        <h2 className="eah-coaching-header__title">Project marketplace</h2>
        <p className="eah-coaching-header__context">
          Open projects across the org, surfaced for you based on skill gaps, visibility goals, and where you're heading.
        </p>
      </div>

      <div className="eah-chips">
        {PROJECT_PROMPTS.map(p => (
          <button key={p} type="button" className="eah-chip" onClick={() => setComposerValue(p)}>{p}</button>
        ))}
      </div>

      <div className="eah-composer">
        <textarea
          ref={textareaRef}
          className="eah-composer__input"
          rows={1}
          placeholder="Ask about projects, time commitment, or what fits your goals…"
          value={composerValue}
          onChange={e => setComposerValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
        />
        <div className="eah-composer__toolbar">
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">mic</span>
          </button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">psychology</span>
            Skills
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_more</span>
          </button>
          <span className="eah-composer__hint">Shift+Enter for new line</span>
          <button type="button" className="eah-composer__send" disabled={!composerValue.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      {committed.length > 0 && (
        <div>
          <div className="eah-section-hd">
            <span className="eah-section-title">Currently working on</span>
          </div>
          {committed.map((p: ProjectEntry) => (
            <div key={p.id} className="eah-project-card eah-project-card--committed">
              <div className="eah-project-card__title">{p.title}</div>
              <div className="eah-project-card__meta">{p.team} · {p.duration} · {p.timeCommitment}</div>
              <div className="eah-project-card__why">{p.why}</div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="eah-section-hd">
          <span className="eah-section-title">{available.length} open projects for you</span>
        </div>
        <div className="eah-project-feed">
          {available.map((p: ProjectEntry) => (
            <div key={p.id} className="eah-project-card">
              <div className="eah-project-card__header">
                <div className="eah-project-card__title">{p.title}</div>
                <div className="eah-project-card__team">{p.team}</div>
              </div>
              <div className="eah-project-card__desc">{p.description}</div>
              <div className="eah-project-card__why">{p.why}</div>
              <div className="eah-project-card__signals">
                {p.signals.map(s => {
                  const m = SIGNAL_META[s]
                  return (
                    <span key={s} className="eah-conn-signal" style={{ background: m.bg, color: m.color }}>
                      {m.label}
                    </span>
                  )
                })}
              </div>
              <div className="eah-project-card__footer">
                <span className="eah-project-card__detail">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                  {p.duration}
                </span>
                <span className="eah-project-card__detail">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>timelapse</span>
                  {p.timeCommitment}
                </span>
                <button
                  type="button"
                  className="eah-project-card__apply"
                  onClick={() => setComposerValue(`Help me express interest in the "${p.title}" project`)}
                >
                  Express interest
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Mentor view ──────────────────────────────────────────────────────────────

function MentorView({ onBack }: { onBack: () => void }) {
  const [composerValue, setComposerValue] = useState('')
  const [prepExpanded, setPrepExpanded] = useState(false)
  const [pastExpanded, setPastExpanded] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerValue])

  const nextSession = MENTOR_NEXT_SESSION

  return (
    <div className="eah-thread">
      <button type="button" className="eah-thread__back" onClick={onBack}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
        Back to Home
      </button>

      <div className="eah-coaching-header" style={{ paddingBottom: 0 }}>
        <h2 className="eah-coaching-header__title">Mentoring</h2>
        <p className="eah-coaching-header__context">
          Active mentoring relationships and high-value match suggestions — so you're always prepared and never leaving a session empty-handed.
        </p>
      </div>

      {/* Next session card */}
      <div className="eah-mentor-next-session">
        <div className="eah-mentor-next-session__eyebrow">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span>
          Next session · {nextSession.date} · {nextSession.daysAway} days away
        </div>
        <div className="eah-mentor-next-session__name">with {nextSession.mentorName}</div>

        <button
          type="button"
          className="eah-mentor-next-session__prep-btn"
          onClick={() => setPrepExpanded(v => !v)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>tips_and_updates</span>
          {prepExpanded ? 'Hide' : 'Show'} suggested topics
          <span className="material-symbols-outlined" style={{ fontSize: 13, marginLeft: 'auto' }}>
            {prepExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {prepExpanded && (
          <div className="eah-mentor-prep-list">
            {nextSession.suggestedTopics.map((t, i) => (
              <div key={i} className="eah-mentor-prep-item">
                <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#6366f1', flexShrink: 0 }}>arrow_right</span>
                <span>{t}</span>
                <button
                  type="button"
                  className="eah-mentor-prep-item__ask"
                  onClick={() => setComposerValue(`Help me prepare to discuss "${t}" with my mentor`)}
                >
                  Prep
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="eah-conn-action"
          style={{ marginTop: 8 }}
          onClick={() => setComposerValue(`Help me prepare for my upcoming session with ${nextSession.mentorName} on ${nextSession.date}`)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit_note</span>
          Prep for this session
        </button>
      </div>

      {/* Chips + composer */}
      <div className="eah-chips">
        {MENTOR_PROMPTS.map(p => (
          <button key={p} type="button" className="eah-chip" onClick={() => setComposerValue(p)}>{p}</button>
        ))}
      </div>
      <div className="eah-composer">
        <textarea
          ref={textareaRef}
          className="eah-composer__input"
          rows={1}
          placeholder="Ask about finding or preparing for a mentor…"
          value={composerValue}
          onChange={e => setComposerValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
        />
        <div className="eah-composer__toolbar">
          <button type="button" className="eah-composer__tool-btn"><span className="material-symbols-outlined">add</span></button>
          <button type="button" className="eah-composer__tool-btn"><span className="material-symbols-outlined">mic</span></button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">psychology</span>Skills
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_more</span>
          </button>
          <span className="eah-composer__hint">Shift+Enter for new line</span>
          <button type="button" className="eah-composer__send" disabled={!composerValue.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      {/* Past session notes */}
      {MENTOR_PAST_SESSIONS.length > 0 && (
        <div>
          <div className="eah-section-hd">
            <span className="eah-section-title">Past sessions</span>
          </div>
          {MENTOR_PAST_SESSIONS.map((sess: MentorSession) => {
            const isOpen = pastExpanded === sess.id
            return (
              <div key={sess.id} className={`eah-career-card${isOpen ? ' eah-career-card--open' : ''}`} style={{ marginBottom: 10 }}>
                <div
                  className="eah-career-card__header"
                  onClick={() => setPastExpanded(isOpen ? null : sess.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') setPastExpanded(isOpen ? null : sess.id) }}
                >
                  <div className="eah-career-card__title-row">
                    <span className="eah-career-card__title">{sess.mentorName}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>{sess.date}</span>
                  </div>
                  <div className="eah-career-card__meta">
                    {sess.topics.join(' · ')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#94a3b8' }}>
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
                {isOpen && (
                  <div className="eah-career-card__detail">
                    <div>
                      <div className="eah-career-detail-section__label" style={{ marginBottom: 6 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#6366f1' }}>notes</span>
                        Session notes
                      </div>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, margin: 0 }}>{sess.notes}</p>
                    </div>
                    <div>
                      <div className="eah-career-detail-section__label" style={{ marginBottom: 6 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#d97706' }}>checklist</span>
                        Follow-ups
                      </div>
                      {sess.followUps.map((f, i) => (
                        <div key={i} className="eah-devplan-milestone">
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#6366f1' }}>arrow_right</span>
                          <span className="eah-devplan-milestone__label">{f}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="eah-conn-action"
                      onClick={() => setComposerValue(`Based on my last session with ${sess.mentorName}, what should I prioritize?`)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>chat</span>
                      Discuss this session
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Suggested mentors */}
      <div>
        <div className="eah-section-hd">
          <span className="eah-section-title">Suggested mentors</span>
        </div>
        <div className="eah-conn-feed">
          {MENTOR_SUGGESTIONS.map((m: MentorSuggestion) => (
            <div key={m.id} className="eah-conn-entry">
              <div className="eah-conn-entry__left">
                <div className="eah-conn-avatar" style={{ background: '#6366f1' }}>{m.initials}</div>
              </div>
              <div className="eah-conn-entry__body">
                <div className="eah-conn-entry__name-row">
                  <span className="eah-conn-entry__name">{m.name}</span>
                </div>
                <div className="eah-conn-entry__role">{m.role} · {m.company}</div>
                <div className="eah-conn-entry__why">{m.why}</div>
                <div className="eah-conn-entry__how">Focus: {m.focus}</div>
                <div className="eah-conn-entry__actions">
                  {m.actions.map(action => (
                    <button
                      key={action}
                      type="button"
                      className="eah-conn-action"
                      onClick={() => setComposerValue(action === 'message' ? `Help me write a message to ${m.name}` : `Help me request an intro to ${m.name}`)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                        {action === 'message' ? 'send' : 'person_add'}
                      </span>
                      {action === 'message' ? 'Message' : 'Request intro'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Network visibility view ──────────────────────────────────────────────────

function NetworkVisibilityView({ onBack }: { onBack: () => void }) {
  const [composerValue, setComposerValue] = useState('')
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerValue])

  const completedCount = doneIds.size
  const totalCount = VISIBILITY_ACTIONS.length
  const pct = Math.round((completedCount / totalCount) * 100)
  const filledSections = VISIBILITY_PROFILE_SECTIONS.filter(s => s.filled).length
  const totalSections = VISIBILITY_PROFILE_SECTIONS.length

  return (
    <div className="eah-thread">
      <button type="button" className="eah-thread__back" onClick={onBack}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
        Back to Home
      </button>

      <div className="eah-coaching-header" style={{ paddingBottom: 0 }}>
        <h2 className="eah-coaching-header__title">Network visibility</h2>
        <p className="eah-coaching-header__context">
          How visible you are to the right people — project leads, hiring managers, and peers working on things you care about.
        </p>
      </div>

      {/* Chips + composer */}
      <div className="eah-chips">
        {NETWORK_VISIBILITY_PROMPTS.map(p => (
          <button key={p} type="button" className="eah-chip" onClick={() => setComposerValue(p)}>{p}</button>
        ))}
      </div>
      <div className="eah-composer">
        <textarea
          ref={textareaRef}
          className="eah-composer__input"
          rows={1}
          placeholder="Ask about your visibility or how to be found…"
          value={composerValue}
          onChange={e => setComposerValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
        />
        <div className="eah-composer__toolbar">
          <button type="button" className="eah-composer__tool-btn"><span className="material-symbols-outlined">add</span></button>
          <button type="button" className="eah-composer__tool-btn"><span className="material-symbols-outlined">mic</span></button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">psychology</span>Skills
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_more</span>
          </button>
          <span className="eah-composer__hint">Shift+Enter for new line</span>
          <button type="button" className="eah-composer__send" disabled={!composerValue.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      {/* Score + profile completeness */}
      <div className="eah-visibility-summary">
        <div className="eah-visibility-score-block">
          <div className="eah-visibility-score-block__num">{pct}%</div>
          <div className="eah-visibility-score-block__label">visibility score</div>
          <div className="eah-visibility-score-block__sub">{completedCount}/{totalCount} actions complete</div>
        </div>
        <div className="eah-visibility-profile-completeness">
          <div className="eah-visibility-profile-completeness__label">Profile completeness</div>
          <div className="eah-visibility-profile-sections">
            {VISIBILITY_PROFILE_SECTIONS.map(s => (
              <div key={s.id} className={`eah-visibility-profile-section${s.filled ? ' eah-visibility-profile-section--filled' : ''}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                  {s.filled ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span>{s.label}</span>
                {!s.filled && s.tip && (
                  <span
                    className="eah-visibility-profile-section__tip"
                    onClick={() => setComposerValue(s.tip)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') setComposerValue(s.tip) }}
                  >
                    Fix
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{filledSections}/{totalSections} sections filled</div>
        </div>
      </div>

      {/* Who viewed your profile */}
      <div>
        <div className="eah-section-hd">
          <span className="eah-section-title">Recently viewed your profile</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Last 30 days</span>
        </div>
        <div className="eah-conn-feed">
          {VISIBILITY_RECENTLY_VIEWED.map((v, i) => (
            <div key={i} className="eah-conn-entry">
              <div className="eah-conn-entry__left">
                <div className="eah-conn-avatar" style={{ background: '#6366f1' }}>{v.initials}</div>
              </div>
              <div className="eah-conn-entry__body">
                <div className="eah-conn-entry__name-row">
                  <span className="eah-conn-entry__name">{v.name}</span>
                </div>
                <div className="eah-conn-entry__role">{v.role} · {v.daysAgo}d ago</div>
                <div className="eah-conn-entry__actions">
                  <button
                    type="button"
                    className="eah-conn-action"
                    onClick={() => setComposerValue(`${v.name} viewed my profile — should I reach out?`)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>chat</span>
                    Should I reach out?
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peer comparison */}
      <div>
        <div className="eah-section-hd">
          <span className="eah-section-title">vs. Senior CSMs at your level</span>
        </div>
        <div className="eah-visibility-peer-table">
          {VISIBILITY_PEER_COMPARISONS.map((row: VisibilityPeerComparison) => {
            const ratio = Math.min(row.sarah / Math.max(row.peerAvg, 1), 1)
            const behind = row.sarah < row.peerAvg
            return (
              <div key={row.metric} className="eah-visibility-peer-row">
                <div className="eah-visibility-peer-row__metric">{row.metric}</div>
                <div className="eah-visibility-peer-row__bars">
                  <div className="eah-visibility-peer-bar-wrap">
                    <div
                      className="eah-visibility-peer-bar eah-visibility-peer-bar--you"
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                  <div className="eah-visibility-peer-bar-wrap">
                    <div className="eah-visibility-peer-bar eah-visibility-peer-bar--avg" style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="eah-visibility-peer-row__values">
                  <span style={{ color: behind ? '#dc2626' : '#16a34a', fontWeight: 700 }}>{row.sarah}</span>
                  <span style={{ color: '#94a3b8' }}> vs {row.peerAvg} avg</span>
                </div>
              </div>
            )
          })}
          <div className="eah-visibility-peer-legend">
            <span><span className="eah-visibility-peer-legend-dot" style={{ background: '#6366f1' }} />You</span>
            <span><span className="eah-visibility-peer-legend-dot" style={{ background: '#e2e8f0' }} />Peer avg</span>
          </div>
        </div>
      </div>

      {/* Suggested actions */}
      <div>
        <div className="eah-section-hd">
          <span className="eah-section-title">Suggested actions</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {VISIBILITY_ACTIONS.map((a: VisibilityAction) => {
            const done = doneIds.has(a.id)
            return (
              <div key={a.id} className={`eah-visibility-action${done ? ' eah-visibility-action--done' : ''}`}>
                <button
                  type="button"
                  className="eah-visibility-action__check"
                  onClick={() => setDoneIds(prev => { const n = new Set(prev); done ? n.delete(a.id) : n.add(a.id); return n })}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {done ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </button>
                <div className="eah-visibility-action__body">
                  <div className="eah-visibility-action__label">{a.label}</div>
                  <div className="eah-visibility-action__desc">{a.description}</div>
                </div>
                <span className={`eah-visibility-impact eah-visibility-impact--${a.impact}`}>
                  {a.impact === 'high' ? 'High impact' : a.impact === 'medium' ? 'Medium' : 'Low'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Development plan view ────────────────────────────────────────────────────

function DevelopmentPlanView({ onBack }: { onBack: () => void }) {
  const [composerValue, setComposerValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerValue])

  const HORIZON_LABELS: Record<'now' | 'next' | 'future', string> = {
    now: 'This quarter', next: 'Next 6 months', future: 'Long term',
  }

  const MILESTONE_STATUS_META = {
    done:       { color: '#16a34a', bg: '#f0fdf4', icon: 'check_circle',           label: 'Done' },
    'on-track': { color: '#2563eb', bg: '#eff6ff', icon: 'radio_button_checked',   label: 'On track' },
    'at-risk':  { color: '#dc2626', bg: '#fef2f2', icon: 'warning',                label: 'At risk' },
    future:     { color: '#94a3b8', bg: '#f8fafc', icon: 'schedule',               label: 'Upcoming' },
  }

  const insight = DEV_PLAN_AGENT_INSIGHT
  const activeThreads = RANKED_THREADS.filter(t => t.containerId === 'development-plan')

  return (
    <div className="eah-thread">
      <button type="button" className="eah-thread__back" onClick={onBack}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
        Back to Home
      </button>

      <div className="eah-coaching-header" style={{ paddingBottom: 0 }}>
        <h2 className="eah-coaching-header__title">Your development plan</h2>
        <p className="eah-coaching-header__context">
          A living plan toward CS Manager — updated as your threads evolve and your skills develop.
        </p>
      </div>

      {/* Agent insight card */}
      <div className={`eah-devplan-insight eah-devplan-insight--${insight.status}`}>
        <div className="eah-devplan-insight__header">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            {insight.status === 'at-risk' ? 'warning' : 'check_circle'}
          </span>
          <span className="eah-devplan-insight__headline">{insight.headline}</span>
        </div>
        <p className="eah-devplan-insight__detail">{insight.detail}</p>
        <div className="eah-devplan-insight__focus-label">This week's focus</div>
        <ul className="eah-devplan-insight__focus-list">
          {insight.thisWeekFocus.map((item, i) => (
            <li key={i} className="eah-devplan-insight__focus-item">
              <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#6366f1', flexShrink: 0 }}>arrow_right</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Chips + composer */}
      <div className="eah-chips">
        {DEVELOPMENT_PLAN_PROMPTS.map(p => (
          <button key={p} type="button" className="eah-chip" onClick={() => setComposerValue(p)}>{p}</button>
        ))}
      </div>
      <div className="eah-composer">
        <textarea
          ref={textareaRef}
          className="eah-composer__input"
          rows={1}
          placeholder="Ask about your plan, goals, or what to focus on next…"
          value={composerValue}
          onChange={e => setComposerValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
        />
        <div className="eah-composer__toolbar">
          <button type="button" className="eah-composer__tool-btn"><span className="material-symbols-outlined">add</span></button>
          <button type="button" className="eah-composer__tool-btn"><span className="material-symbols-outlined">mic</span></button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">psychology</span>Skills
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_more</span>
          </button>
          <span className="eah-composer__hint">Shift+Enter for new line</span>
          <button type="button" className="eah-composer__send" disabled={!composerValue.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      {/* Goals with milestones */}
      <div>
        <div className="eah-section-hd">
          <span className="eah-section-title">Goals</span>
        </div>
        {(['now', 'next', 'future'] as const).map(horizon => {
          const goals = DEV_GOALS.filter(g => g.horizon === horizon)
          return (
            <div key={horizon} style={{ marginBottom: 20 }}>
              <div className="eah-skill-category__name">{HORIZON_LABELS[horizon]}</div>
              {goals.map((g: DevGoal) => (
                <div key={g.id} className="eah-dev-goal">
                  <div className="eah-dev-goal__header">
                    <span className="eah-dev-goal__title">{g.title}</span>
                    <span className="eah-dev-goal__pct">{g.progress}%</span>
                  </div>
                  <div className="eah-dev-goal__bar">
                    <div className="eah-dev-goal__fill" style={{ width: `${g.progress}%` }} />
                  </div>
                  <div className="eah-dev-goal__desc">{g.description}</div>

                  {/* Milestones for this goal */}
                  {DEV_MILESTONES.filter(m => m.linkedGoalId === g.id).map((m: DevMilestone) => {
                    const sm = MILESTONE_STATUS_META[m.status]
                    return (
                      <div key={m.id} className="eah-devplan-milestone">
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: sm.color, flexShrink: 0 }}>{sm.icon}</span>
                        <span className="eah-devplan-milestone__label">{m.label}</span>
                        <span className="eah-devplan-milestone__date">{m.targetDate}</span>
                        <span className="eah-devplan-milestone__status" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Active plan threads */}
      {activeThreads.length > 0 && (
        <div>
          <div className="eah-section-hd">
            <span className="eah-section-title">Active plan threads</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeThreads.map(t => (
              <div key={t.id} className="eah-skill-thread-card">
                <div className="eah-skill-thread-card__title">{t.title}</div>
                <div className="eah-skill-thread-card__snippet">{t.tileReason}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Project detail view ──────────────────────────────────────────────────────

function ProjectDetailView({ projectId, onBack, onMarketplace }: { projectId: string; onBack: () => void; onMarketplace: () => void }) {
  const [composerValue, setComposerValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const project = PROJECT_MARKETPLACE.find(p => p.id === projectId)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerValue])

  if (!project) return <div style={{ padding: 32, color: '#94a3b8' }}>Project not found.</div>

  const SIGNAL_META: Record<ProjectSignal, { label: string; bg: string; color: string }> = {
    'skill-gap':       { label: 'Closes a skill gap',  bg: '#eef2ff', color: '#6366f1' },
    'visibility':      { label: 'Raises visibility',   bg: '#f0fdfa', color: '#0d9488' },
    'mobility-up':     { label: 'Next level',          bg: '#fffbeb', color: '#d97706' },
    'mobility-across': { label: 'Lateral move',        bg: '#eff6ff', color: '#2563eb' },
  }

  return (
    <div className="eah-thread">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" className="eah-thread__back" onClick={onBack}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
          Back to Home
        </button>
        <button type="button" className="eah-thread__back" style={{ marginLeft: 4 }} onClick={onMarketplace}>
          All projects
        </button>
      </div>

      <div className="eah-coaching-header" style={{ paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          {project.signals.map(s => {
            const m = SIGNAL_META[s]
            return <span key={s} className="eah-conn-signal" style={{ background: m.bg, color: m.color }}>{m.label}</span>
          })}
        </div>
        <h2 className="eah-coaching-header__title">{project.title}</h2>
        <p className="eah-coaching-header__context" style={{ marginTop: 2 }}>
          {project.team} · {project.duration} · {project.timeCommitment}
        </p>
      </div>

      {/* WHY — the only thing that matters */}
      <div className="eah-project-detail-why">
        <div className="eah-project-detail-why__label">Why this project for you</div>
        <div className="eah-project-detail-why__text">{project.why}</div>
      </div>

      {/* Description */}
      <div className="eah-skill-thread-card">
        <div className="eah-skill-thread-card__title" style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>What it is</div>
        <div className="eah-skill-thread-card__snippet">{project.description}</div>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {project.skills.map(s => (
            <span key={s} style={{ fontSize: 11.5, fontWeight: 600, background: '#f1f5f9', color: '#475569', borderRadius: 6, padding: '2px 8px' }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Chips + composer */}
      <div className="eah-chips">
        {[
          `What would I get out of the "${project.title}" project?`,
          'How does this fit my CS Manager goal?',
          'Help me express interest in this project',
          'What\'s the time commitment really like?',
        ].map(p => (
          <button key={p} type="button" className="eah-chip" onClick={() => setComposerValue(p)}>{p}</button>
        ))}
      </div>

      <div className="eah-composer">
        <textarea
          ref={textareaRef}
          className="eah-composer__input"
          rows={1}
          placeholder="Ask about this project, how to apply, or what to expect…"
          value={composerValue}
          onChange={e => setComposerValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
        />
        <div className="eah-composer__toolbar">
          <button type="button" className="eah-composer__tool-btn"><span className="material-symbols-outlined">add</span></button>
          <button type="button" className="eah-composer__tool-btn"><span className="material-symbols-outlined">mic</span></button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">psychology</span>Skills
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_more</span>
          </button>
          <span className="eah-composer__hint">Shift+Enter for new line</span>
          <button type="button" className="eah-composer__send" disabled={!composerValue.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          className="eah-project-card__apply"
          style={{ marginLeft: 0 }}
          onClick={() => setComposerValue(`Help me express interest in the "${project.title}" project`)}
        >
          Express interest
        </button>
        <button
          type="button"
          className="eah-conn-action"
          onClick={() => setComposerValue(`What else should I know before committing to the "${project.title}" project?`)}
        >
          Ask before committing
        </button>
      </div>
    </div>
  )
}

// ─── Career opportunities view ─────────────────────────────────────────────────

const MATCH_COLOR = (score: number) =>
  score >= 85 ? { color: '#16a34a', bg: '#f0fdf4' } :
  score >= 70 ? { color: '#d97706', bg: '#fffbeb' } :
               { color: '#dc2626', bg: '#fef2f2' }

const LEVEL_LABELS: Record<string, string> = {
  ic: 'Individual Contributor', manager: 'Manager', director: 'Director', vp: 'VP',
}

const STEP_ICONS: Record<string, string> = {
  course: 'school', project: 'rocket_launch', mentoring: 'people', reading: 'menu_book',
}

function CareerOpportunitiesView({ onBack }: { onBack: () => void }) {
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set(SARAH_INTERESTS))
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [signedUpPlans, setSignedUpPlans] = useState<Set<string>>(new Set())
  const [composerValue, setComposerValue] = useState('')
  const [showOnlyInternal, setShowOnlyInternal] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerValue])

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const jobs = CAREER_OPPORTUNITIES
    .filter(j => !showOnlyInternal || j.isInternal)
    .sort((a, b) => b.matchScore - a.matchScore)

  return (
    <div className="eah-thread">
      <button type="button" className="eah-thread__back" onClick={onBack}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
        Back to Home
      </button>

      <div className="eah-coaching-header" style={{ paddingBottom: 0 }}>
        <h2 className="eah-coaching-header__title">Career opportunities</h2>
        <p className="eah-coaching-header__context">
          Open roles matched to your skills and career goals — with your match score, gaps, and a concrete learning plan for each.
        </p>
      </div>

      {/* Interest selector */}
      <div className="eah-career-interests">
        <div className="eah-career-interests__label">Your interests</div>
        <div className="eah-career-interests__chips">
          {CAREER_INTEREST_AREAS.map((area: CareerInterestArea) => (
            <button
              key={area.id}
              type="button"
              className={`eah-career-interest-chip${selectedInterests.has(area.id) ? ' eah-career-interest-chip--on' : ''}`}
              onClick={() => toggleInterest(area.id)}
            >
              {area.type === 'role' ? (
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>work</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>school</span>
              )}
              {area.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chips + composer */}
      <div className="eah-chips">
        {CAREER_PROMPTS.map(p => (
          <button key={p} type="button" className="eah-chip" onClick={() => setComposerValue(p)}>{p}</button>
        ))}
      </div>

      <div className="eah-composer">
        <textarea
          ref={textareaRef}
          className="eah-composer__input"
          rows={1}
          placeholder="Ask about roles, gaps, or what to prioritize…"
          value={composerValue}
          onChange={e => setComposerValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
        />
        <div className="eah-composer__toolbar">
          <button type="button" className="eah-composer__tool-btn"><span className="material-symbols-outlined">add</span></button>
          <button type="button" className="eah-composer__tool-btn"><span className="material-symbols-outlined">mic</span></button>
          <button type="button" className="eah-composer__tool-btn">
            <span className="material-symbols-outlined">psychology</span>Skills
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_more</span>
          </button>
          <span className="eah-composer__hint">Shift+Enter for new line</span>
          <button type="button" className="eah-composer__send" disabled={!composerValue.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="eah-section-hd">
        <span className="eah-section-title">{jobs.length} opportunities matched</span>
        <button
          type="button"
          className={`eah-skill-filter-btn${showOnlyInternal ? ' eah-skill-filter-btn--active' : ''}`}
          onClick={() => setShowOnlyInternal(v => !v)}
        >
          Internal only
        </button>
      </div>

      {/* Job feed */}
      <div className="eah-career-feed">
        {jobs.map((job: JobOpening) => {
          const mc = MATCH_COLOR(job.matchScore)
          const isExpanded = expandedId === job.id
          const isSignedUp = signedUpPlans.has(job.id)

          return (
            <div key={job.id} className={`eah-career-card${isExpanded ? ' eah-career-card--open' : ''}`}>
              {/* Card header */}
              <div
                className="eah-career-card__header"
                onClick={() => setExpandedId(isExpanded ? null : job.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpandedId(isExpanded ? null : job.id) }}
              >
                <div className="eah-career-card__title-row">
                  <span className="eah-career-card__title">{job.title}</span>
                  {job.isInternal && (
                    <span className="eah-career-card__internal">Internal</span>
                  )}
                </div>

                <div className="eah-career-card__meta">
                  {job.company} · {job.companyType} · {job.location}
                </div>

                {/* Why match — always visible */}
                <div className="eah-career-card__why">{job.whyMatch}</div>

                <div className="eah-career-card__footer-row">
                  {/* Match score */}
                  <div className="eah-career-match">
                    <div className="eah-career-match__bar-wrap">
                      <div className="eah-career-match__bar" style={{ width: `${job.matchScore}%`, background: mc.color }} />
                    </div>
                    <span className="eah-career-match__label" style={{ color: mc.color }}>{job.matchScore}% match</span>
                  </div>

                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#94a3b8', marginLeft: 'auto', flexShrink: 0 }}>
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="eah-career-card__detail">
                  {/* Skills match */}
                  <div className="eah-career-detail-section">
                    <div className="eah-career-detail-section__label">
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#16a34a' }}>check_circle</span>
                      You already have ({job.matchedSkills.length})
                    </div>
                    <div className="eah-career-skills-row">
                      {job.matchedSkills.map(s => (
                        <span key={s} className="eah-career-skill eah-career-skill--match">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Gaps */}
                  {job.gapSkills.length > 0 && (
                    <div className="eah-career-detail-section">
                      <div className="eah-career-detail-section__label">
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#d97706' }}>radio_button_unchecked</span>
                        Gaps to close ({job.gapSkills.length})
                      </div>
                      <div className="eah-career-skills-row">
                        {job.gapSkills.map(s => (
                          <span key={s} className="eah-career-skill eah-career-skill--gap">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learning plan */}
                  {job.gapSkills.length > 0 && (
                    <div className="eah-career-detail-section">
                      <div className="eah-career-detail-section__label" style={{ marginBottom: 8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#6366f1' }}>auto_awesome</span>
                        Learning plan to close the gaps
                      </div>
                      <div className="eah-learning-plan">
                        {job.learningPlan.map((step: LearningStep, i: number) => (
                          <div key={step.id} className="eah-learning-step">
                            <div className="eah-learning-step__num">{i + 1}</div>
                            <div className="eah-learning-step__body">
                              <div className="eah-learning-step__label">
                                <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#6366f1' }}>
                                  {STEP_ICONS[step.type]}
                                </span>
                                {step.label}
                              </div>
                              <div className="eah-learning-step__meta">
                                {step.duration}{step.resource ? ` · ${step.resource}` : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sign up CTA */}
                      <button
                        type="button"
                        className={`eah-career-signup${isSignedUp ? ' eah-career-signup--done' : ''}`}
                        onClick={() => {
                          setSignedUpPlans(prev => { const n = new Set(prev); n.add(job.id); return n })
                          setComposerValue(`I signed up for the learning plan for "${job.title}" — help me create a schedule`)
                        }}
                        disabled={isSignedUp}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                          {isSignedUp ? 'check_circle' : 'playlist_add'}
                        </span>
                        {isSignedUp ? 'Learning plan added' : 'Sign up for this learning plan'}
                      </button>
                    </div>
                  )}

                  {/* Ask about this role */}
                  <button
                    type="button"
                    className="eah-conn-action"
                    style={{ marginTop: 4 }}
                    onClick={() => setComposerValue(`Tell me more about the "${job.title}" role at ${job.company} — what should I know?`)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>chat</span>
                    Ask about this role
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type View = 'home' | 'coaching' | 'connections' | 'skill-profile' | 'projects' | 'mentor' | 'network-visibility' | 'development-plan' | 'career-opportunities' | string

export function EmployeeAgentHome({ userName }: { userName: string }) {
  const [view, setView] = useState<View>('home')
  const mainRef = useRef<HTMLDivElement>(null)

  const NON_THREAD_VIEWS = new Set(['home', 'coaching', 'connections', 'skill-profile', 'projects', 'mentor', 'network-visibility', 'development-plan', 'career-opportunities'])
  const isProjectDetail = view.startsWith('project-detail:')

  const activeThread = !NON_THREAD_VIEWS.has(view) && !isProjectDetail
    ? RANKED_THREADS.find(t => t.id === view) ?? null
    : null

  const navProjects = () => setView('projects')
  const navMentor = () => setView('mentor')
  const navNetworkVisibility = () => setView('network-visibility')
  const navDevelopmentPlan = () => setView('development-plan')

  useLayoutEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useLayoutEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [view])

  return (
    <div className="eah-root">
      <Sidebar
        containers={CONTAINERS}
        isHome={view === 'home'}
        isCoaching={view === 'coaching'}
        isConnections={view === 'connections'}
        isSkillProfile={view === 'skill-profile'}
        isProjects={view === 'projects'}
        isMentor={view === 'mentor'}
        isNetworkVisibility={view === 'network-visibility'}
        isDevelopmentPlan={view === 'development-plan'}
        isCareerOpportunities={view === 'career-opportunities'}
        activeThreadId={!NON_THREAD_VIEWS.has(view) && !isProjectDetail ? view : null}
        onHome={() => setView('home')}
        onCoaching={() => setView('coaching')}
        onConnections={() => setView('connections')}
        onSkillProfile={() => setView('skill-profile')}
        onProjects={navProjects}
        onMentor={navMentor}
        onNetworkVisibility={navNetworkVisibility}
        onDevelopmentPlan={navDevelopmentPlan}
        onCareerOpportunities={() => setView('career-opportunities')}
        onThread={id => setView(id)}
      />
      <div className="eah-main" ref={mainRef}>
        {view === 'home' ? (
          <HomeView
            userName={userName}
            onThread={id => setView(id)}
            onProject={id => setView(`project-detail:${id}`)}
          />
        ) : view === 'coaching' ? (
          <CoachingView onBack={() => setView('home')} />
        ) : view === 'connections' ? (
          <ConnectionsView onBack={() => setView('home')} />
        ) : view === 'skill-profile' ? (
          <SkillProfileView onBack={() => setView('home')} />
        ) : view === 'projects' ? (
          <ProjectMarketplaceView onBack={() => setView('home')} />
        ) : view === 'mentor' ? (
          <MentorView onBack={() => setView('home')} />
        ) : view === 'network-visibility' ? (
          <NetworkVisibilityView onBack={() => setView('home')} />
        ) : view === 'development-plan' ? (
          <DevelopmentPlanView onBack={() => setView('home')} />
        ) : view === 'career-opportunities' ? (
          <CareerOpportunitiesView onBack={() => setView('home')} />
        ) : isProjectDetail ? (
          <ProjectDetailView
            projectId={view.replace('project-detail:', '')}
            onBack={() => setView('home')}
            onMarketplace={() => setView('projects')}
          />
        ) : activeThread ? (
          <ThreadView
            thread={activeThread}
            onBack={() => setView('home')}
          />
        ) : (
          <div style={{ padding: 32, color: '#94a3b8' }}>Thread not found.</div>
        )}
      </div>
    </div>
  )
}
