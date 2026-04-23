import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { NavbarApp } from '../components/Navbar'
import { Button, Tag } from '@tonyh-2-eightfold/ef-design-system'
import {
  buildLevels, getUnlocks,
  LevelCard,
  type LevelState, type CoachTask,
} from '../components/workforceReadiness/DevPlanSheet'
import { CoachSessionPanel } from '../components/myWork/CoachSessionPanel'
import './MyDevPlanPage.css'

const PLAN_META = {
  title: 'AI Upskilling — Engineering Lead',
  description:
    'Build AI-augmented engineering workflows — from AI-assisted code review and architecture analysis to using LLMs for documentation, incident response, and technical decision-making.',
  role: 'Engineering Lead',
  hours: 50,
  weeks: 6,
  businessUnit: 'Engineering',
  jobFunction: 'Engineering Management',
  createdBy: 'Workforce Readiness',
  lastUpdated: '24/03/2026',
}

const CURRENT_SCORE = 48
const AI_READY_THRESHOLD = 50

export function MyDevPlanPage() {
  const { currentUser } = useUser()
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const [activeUnlock, setActiveUnlock] = useState<'doors' | 'risk' | 'skills' | null>(null)
  const [coachSession, setCoachSession] = useState<CoachTask | null>(null)

  if (currentUser.id !== 'csm') return <Navigate to="/" replace />

  const employee = {
    name: currentUser.name,
    title: currentUser.title,
    readinessPct: CURRENT_SCORE,
    displayReadiness: CURRENT_SCORE,
    planPct: 0,
  }

  const levels = buildLevels(employee)
  const totalPts = levels.reduce((s, l) => s + l.adoptionPts, 0)
  const projectedScore = CURRENT_SCORE + totalPts
  const firstName = currentUser.name.split(' ')[0]
  const unlocks = getUnlocks(currentUser.name, currentUser.title, CURRENT_SCORE, 0)

  function toggleExpand(levelId: number) {
    setExpandedLevels(prev => {
      const next = new Set(prev)
      next.has(levelId) ? next.delete(levelId) : next.add(levelId)
      return next
    })
  }

  function getLevelState(levelId: number): LevelState {
    if (levelId === 1) return 'current'
    return 'locked'
  }

  const unlockItems = [
    {
      id: 'doors' as const,
      value: String(unlocks.doorCount),
      label: 'Career doors unlock',
      detail: `Top: ${unlocks.topRole} (${unlocks.topFit}% fit)`,
      color: 'var(--color-blue-60)',
      gid: 'udg-blue-pg',
    },
    {
      id: 'risk' as const,
      value: `−${unlocks.riskDrop}%`,
      label: 'Automation risk drop',
      detail: `${unlocks.currentRisk}% now → ${unlocks.pathsTo}%`,
      color: 'var(--color-green-60)',
      gid: 'udg-green-pg',
    },
    {
      id: 'skills' as const,
      value: String(unlocks.aiSkills.length),
      label: 'AI skills gained',
      detail: unlocks.aiSkills.join(', '),
      color: 'var(--color-violet-60)',
      gid: 'udg-violet-pg',
    },
  ]

  return (
    <div className="my-dev-plan">
      <NavbarApp />
      <div className="my-dev-plan__shell">
        <div className="my-dev-plan__inner">
          {/* Breadcrumb */}
          <nav className="my-dev-plan__breadcrumb">
            <Link to="/my-work" className="my-dev-plan__breadcrumb-link">
              <span className="material-symbols-outlined">arrow_back_ios</span>
              My Development Plans
            </Link>
          </nav>

          {/* Page header */}
          <div className="my-dev-plan__header">
            <div className="my-dev-plan__identity">
              <img
                src={currentUser.avatarPhotoSrc}
                alt={currentUser.name}
                className="my-dev-plan__avatar"
              />
              <div>
                <div className="my-dev-plan__emp-name">{currentUser.name}</div>
                <h1 className="my-dev-plan__plan-title">{PLAN_META.title}</h1>
              </div>
            </div>
            <div className="my-dev-plan__actions">
              <Button variant="secondary">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>ios_share</span>
                Share
              </Button>
              <Button variant="secondary">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                Edit
              </Button>
              <Button variant="secondary">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>description</span>
                Notes <span className="my-dev-plan__notes-badge">1</span>
              </Button>
              <button className="my-dev-plan__more-btn" aria-label="More options">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>

          {/* Provenance */}
          <p className="my-dev-plan__provenance">Created by {PLAN_META.createdBy}</p>
          <p className="my-dev-plan__provenance">
            Last updated by {PLAN_META.createdBy} on {PLAN_META.lastUpdated}
          </p>

          {/* Two-column layout */}
          <div className="my-dev-plan__columns">
            {/* Left sidebar */}
            <aside className="my-dev-plan__sidebar">
              <div className="my-dev-plan__meta-block">
                <div className="my-dev-plan__meta-label">Description</div>
                <div className="my-dev-plan__meta-desc">{PLAN_META.description}</div>
              </div>
              {([
                { label: 'Relevant role', value: PLAN_META.role },
                { label: 'Estimated effort', value: `${PLAN_META.hours} hours` },
                { label: 'Target duration', value: `${PLAN_META.weeks} weeks` },
                { label: 'Business unit', value: PLAN_META.businessUnit },
                { label: 'Job function', value: PLAN_META.jobFunction },
              ] as const).map(({ label, value }) => (
                <div key={label} className="my-dev-plan__meta-row">
                  <div className="my-dev-plan__meta-label">{label}</div>
                  <div className="my-dev-plan__meta-value">{value}</div>
                </div>
              ))}
            </aside>

            {/* Main content */}
            <main className="my-dev-plan__content">
              {/* AI Adoption Score card */}
              <div className="my-dev-plan__score-card">
                <div className="my-dev-plan__score-heading">AI Adoption Score</div>
                <div className="my-dev-plan__score-row">
                  <div className="my-dev-plan__score-num">
                    {CURRENT_SCORE}<span className="my-dev-plan__score-pct">%</span>
                  </div>
                  <div className="my-dev-plan__score-bar-wrap">
                    <div className="my-dev-plan__score-track">
                      <div className="my-dev-plan__score-fill" style={{ width: `${CURRENT_SCORE}%` }} />
                      <div
                        className="my-dev-plan__score-gain-bar"
                        style={{ left: `${CURRENT_SCORE}%`, width: `${projectedScore - CURRENT_SCORE}%` }}
                      />
                      <div
                        className="my-dev-plan__score-threshold"
                        style={{ left: `${AI_READY_THRESHOLD}%` }}
                      />
                    </div>
                    <div className="my-dev-plan__score-axis">
                      <span>0%</span>
                      <span className="my-dev-plan__score-ready-label">
                        <span className="material-symbols-outlined" style={{ fontSize: 11 }}>verified</span>
                        AI-Ready
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
                <div className="my-dev-plan__score-legend">
                  <div className="my-dev-plan__score-legend-item">
                    <div className="my-dev-plan__score-swatch my-dev-plan__score-swatch--orange" />
                    You are here · {CURRENT_SCORE}%
                  </div>
                  <div className="my-dev-plan__score-legend-item">
                    <div className="my-dev-plan__score-swatch my-dev-plan__score-swatch--gray" />
                    After this plan <strong>{projectedScore}%</strong>
                    <span className="my-dev-plan__score-delta">+{totalPts}</span>
                  </div>
                </div>
              </div>

              {/* Curriculum */}
              <div className="my-dev-plan__curriculum">
                <div className="dev-plan-sheet__curriculum-heading">
                  Curriculum · {levels.length} steps
                </div>
                {levels.map(level => (
                  <LevelCard
                    key={level.id}
                    level={{ ...level, name: `Step ${level.id}: ${level.name}` }}
                    state={getLevelState(level.id)}
                    xpPct={0}
                    isAssigned={false}
                    expanded={expandedLevels.has(level.id)}
                    onToggle={() => toggleExpand(level.id)}
                    onCoachTask={task => setCoachSession(task)}
                  />
                ))}
              </div>

              {/* Completion unlocks */}
              <div className="dev-plan-sheet__unlocks">
                <div className="dev-plan-sheet__unlocks-heading">
                  What completing this plan unlocks for {firstName}
                </div>
                <div className="dev-plan-sheet__unlocks-badges">
                  {unlockItems.map(({ id, value, label, detail, color, gid }) => {
                    const isActive = activeUnlock === id
                    return (
                      <button
                        key={gid}
                        type="button"
                        className={`dev-plan-sheet__unlock-badge-item${isActive ? ' dev-plan-sheet__unlock-badge-item--active' : ''}`}
                        onClick={() => setActiveUnlock(isActive ? null : id)}
                        style={{ '--unlock-color': color } as React.CSSProperties}
                      >
                        <svg className="dev-plan-sheet__unlock-shield" viewBox="0 0 100 114" fill="none">
                          <defs>
                            <linearGradient id={gid} x1="0" y1="0" x2="100" y2="114" gradientUnits="userSpaceOnUse">
                              <stop offset="0%" style={{ stopColor: color, stopOpacity: isActive ? 0.35 : 0.18 }} />
                              <stop offset="100%" style={{ stopColor: color, stopOpacity: isActive ? 0.12 : 0.05 }} />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 50 5 L 95 22 L 95 68 C 95 91 75 106 50 111 C 25 106 5 91 5 68 L 5 22 Z"
                            fill={`url(#${gid})`}
                            stroke={color}
                            strokeWidth={isActive ? 3 : 2.5}
                          />
                          <text
                            x="50" y="62"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{
                              fontSize: value.length > 3 ? '18px' : '26px',
                              fontWeight: 900,
                              fill: color,
                              letterSpacing: '-0.03em',
                              fontFamily: 'inherit',
                            }}
                          >{value}</text>
                        </svg>
                        <div className="dev-plan-sheet__unlock-badge-label">{label}</div>
                        <div className="dev-plan-sheet__unlock-badge-detail">{detail}</div>
                      </button>
                    )
                  })}
                </div>

                {activeUnlock === 'doors' && (
                  <div className="dev-plan-sheet__unlock-panel">
                    <div className="dev-plan-sheet__unlock-panel-heading">Potential new roles</div>
                    <div className="dev-plan-sheet__unlock-panel-roles">
                      {unlocks.allRoles.map(({ role, fit, baseFit }) => {
                        const gain = fit - baseFit
                        return (
                          <div key={role} className="dev-plan-sheet__unlock-role-row">
                            <span className="dev-plan-sheet__unlock-role-name">{role}</span>
                            <div className="dev-plan-sheet__unlock-role-bar-wrap" style={{ display: 'flex' }}>
                              <div className="dev-plan-sheet__unlock-role-bar" style={{ width: `${baseFit}%`, borderRadius: gain > 0 ? '3px 0 0 3px' : undefined }} />
                              {gain > 0 && <div style={{ height: '100%', width: `${gain}%`, background: 'var(--color-green-60)', borderRadius: '0 3px 3px 0' }} />}
                            </div>
                            <span className="dev-plan-sheet__unlock-role-fit" style={{ width: gain > 0 ? 64 : undefined }}>
                              {gain > 0
                                ? <><strong style={{ color: '#15803d' }}>{fit}%</strong> <span style={{ fontSize: 10, color: '#15803d', fontWeight: 600 }}>+{gain}</span></>
                                : `${fit}% fit`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {activeUnlock === 'risk' && (
                  <div className="dev-plan-sheet__unlock-panel">
                    <div className="dev-plan-sheet__unlock-panel-heading">Automation risk summary</div>
                    <p className="dev-plan-sheet__unlock-panel-body">
                      Your current role has a <strong>{unlocks.currentRisk}% automation risk</strong> — meaning most routine tasks could be automated without AI fluency.
                      Completing this plan develops the judgment, prompt skills, and oversight capabilities that place you firmly in the <em>augmentation zone</em>, dropping exposure to just {unlocks.pathsTo}%.
                    </p>
                    <div className="dev-plan-sheet__unlock-risk-bars">
                      <div className="dev-plan-sheet__unlock-risk-row">
                        <span>Current risk</span>
                        <div className="dev-plan-sheet__unlock-role-bar-wrap">
                          <div className="dev-plan-sheet__unlock-role-bar dev-plan-sheet__unlock-role-bar--risk" style={{ width: `${unlocks.currentRisk}%` }} />
                        </div>
                        <span>{unlocks.currentRisk}%</span>
                      </div>
                      <div className="dev-plan-sheet__unlock-risk-row">
                        <span>After plan</span>
                        <div className="dev-plan-sheet__unlock-role-bar-wrap">
                          <div className="dev-plan-sheet__unlock-role-bar dev-plan-sheet__unlock-role-bar--safe" style={{ width: `${unlocks.pathsTo}%` }} />
                        </div>
                        <span>{unlocks.pathsTo}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeUnlock === 'skills' && (
                  <div className="dev-plan-sheet__unlock-panel">
                    <div className="dev-plan-sheet__unlock-panel-heading">Skills you will gain</div>
                    <div className="dev-plan-sheet__unlock-skills-cloud">
                      {unlocks.aiSkills.map(skill => (
                        <Tag key={skill} className="dev-plan-sheet__skill-tag">{skill}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
      <CoachSessionPanel
        open={coachSession !== null}
        onClose={() => setCoachSession(null)}
        sessionTitle={coachSession?.sessionTitle}
        sessionDesc={coachSession?.sessionDesc}
      />
    </div>
  )
}
