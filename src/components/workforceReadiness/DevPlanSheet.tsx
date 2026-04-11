import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button, Tag } from '@tonyh-2-eightfold/ef-design-system'
import './DevPlanSheet.css'

// ── Types ─────────────────────────────────────────────────────────────────────

type LevelState = 'recognized' | 'current' | 'locked'

interface Course {
  name: string
  provider: string
  duration: string
  level: string
  free: boolean
}

interface LevelDef {
  id: number
  name: string
  xpLabel: string
  outcome: string
  courses: Course[]
  tasks: string[]
  totalHours: number
  adoptionPts: number
}

export interface DevPlanSheetProps {
  employee: { name: string; title?: string; readinessPct: number; displayReadiness: number } | null
  open: boolean
  onClose: () => void
  isAssigned: boolean
}

// ── Static curriculum data ─────────────────────────────────────────────────────

const LEVEL_BASE: Omit<LevelDef, 'courses'>[] = [
  {
    id: 1,
    name: 'AI Foundations',
    xpLabel: 'Foundation XP',
    outcome: 'Understand how AI works and where it applies to your daily work — so you can evaluate AI output with confidence, not just curiosity.',
    tasks: [
      'Complete the AI readiness self-assessment',
      'Shadow a colleague who uses AI tools daily and document one observation',
    ],
    totalHours: 20,
    adoptionPts: 8,
  },
  {
    id: 2,
    name: 'Augmentation-Ready',
    xpLabel: 'Augmentation XP',
    outcome: 'Use AI confidently on routine tasks in your role — with human judgment at every handoff, every time.',
    tasks: [
      'Apply AI to 2 recurring weekly tasks in your workflow',
      'Complete the AI output review checklist for one deliverable',
    ],
    totalHours: 16,
    adoptionPts: 14,
  },
  {
    id: 3,
    name: 'Power User',
    xpLabel: 'Power User XP',
    outcome: 'Drive AI adoption within your immediate team — turning personal wins into repeatable, shared workflows that stick.',
    tasks: [
      'Document 3 AI-assisted workflows your team can reuse',
      'Present one time-saving example to your manager or team',
    ],
    totalHours: 8,
    adoptionPts: 10,
  },
  {
    id: 4,
    name: 'AI Champion',
    xpLabel: 'Champion XP',
    outcome: 'Mentor peers, contribute to the team playbook, and help drive quarter-over-quarter readiness improvements across your org.',
    tasks: [
      'Coach 2 peers through their AI onboarding journey',
      'Contribute at least one workflow to the team AI playbook',
    ],
    totalHours: 6,
    adoptionPts: 8,
  },
]

const LEVEL_COURSES: Record<number, Course[]> = {
  1: [
    { name: 'AI for Business Professionals', provider: 'University of Pennsylvania', duration: '12 hrs', level: 'Beginner', free: true },
    { name: 'Prompt Engineering for ChatGPT', provider: 'Vanderbilt University', duration: '8 hrs', level: 'Beginner', free: true },
  ],
  2: [
    { name: 'Generative AI with Large Language Models', provider: 'DeepLearning.AI', duration: '16 hrs', level: 'Intermediate', free: true },
  ],
  // Level 3 is built dynamically from role title
  4: [
    { name: 'AI Strategy & Governance', provider: 'Eightfold Academy', duration: '6 hrs', level: 'Advanced', free: false },
  ],
}



// ── Completion unlocks ─────────────────────────────────────────────────────────

const CAREER_DOORS: Array<{ pattern: RegExp; roles: string[] }> = [
  { pattern: /engineering manager/i,  roles: ['Director of Engineering', 'Principal Engineer', 'VP Engineering'] },
  { pattern: /senior software/i,      roles: ['Staff Engineer', 'Tech Lead', 'Engineering Lead'] },
  { pattern: /software engineer/i,    roles: ['Senior Software Engineer', 'Tech Lead', 'Platform Engineer'] },
  { pattern: /frontend engineer/i,    roles: ['Senior Frontend Engineer', 'UI/UX Engineer', 'Tech Lead'] },
  { pattern: /qa automation/i,        roles: ['Senior QA Engineer', 'SDET', 'QA Lead'] },
  { pattern: /devops/i,               roles: ['Senior DevOps Engineer', 'Platform Engineer', 'SRE'] },
  { pattern: /platform engineer/i,    roles: ['Staff Platform Engineer', 'Cloud Architect', 'Engineering Lead'] },
  { pattern: /site reliability/i,     roles: ['Senior SRE', 'Platform Engineer', 'Infrastructure Lead'] },
  { pattern: /mobile developer/i,     roles: ['Senior Mobile Engineer', 'Mobile Tech Lead', 'Full-Stack Engineer'] },
  { pattern: /manager/i,              roles: ['Director', 'Senior Manager', 'VP'] },
]

const AI_SKILLS_BY_ROLE: Array<{ pattern: RegExp; skills: string[] }> = [
  { pattern: /engineer|developer/i,   skills: ['writing better prompts', 'AI-assisted code review', 'debugging with LLMs', 'generating test cases with AI'] },
  { pattern: /manager/i,              skills: ['AI-driven status reporting', 'writing better prompts', 'synthesizing team feedback with AI', 'AI-assisted decision memos'] },
  { pattern: /analyst/i,              skills: ['AI-powered data summaries', 'writing better prompts', 'reviewing and editing AI outputs', 'structuring reports with AI'] },
  { pattern: /qa/i,                   skills: ['AI-generated test plans', 'writing better prompts', 'automated defect triage', 'AI-assisted root cause analysis'] },
]

function getUnlocks(name: string, title: string | undefined, displayReadiness: number) {
  const h = Math.abs(Array.from(name).reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0))
  const doorEntry = CAREER_DOORS.find(r => r.pattern.test(title ?? ''))
  const doorRoles = doorEntry?.roles ?? ['Senior Specialist', 'Team Lead', 'Manager']
  const doorCount = Math.min(3 + (h % 3), doorRoles.length) // 3–5, capped to available roles
  const topFit = 38 + (h % 20) // 38–57%
  const currentRisk = 55 + (h % 20) // 55–74%
  const pathsTo = Math.max(15, Math.round(currentRisk * 0.45) + (h % 8)) // 25–42% (realistic post-training residual)
  const riskDrop = currentRisk - pathsTo
  const aiSkillEntry = AI_SKILLS_BY_ROLE.find(r => r.pattern.test(title ?? ''))
  const aiSkills = aiSkillEntry?.skills ?? ['writing better prompts', 'reviewing and editing AI outputs', 'structuring presentations for impact']
  const allFits = doorRoles.slice(0, doorCount).map((role, i) => ({ role, fit: Math.max(30, topFit - i * (5 + (h % 4))) }))
  return { doorCount, topRole: doorRoles[0], topFit, currentRisk, pathsTo, riskDrop, aiSkills: aiSkills.slice(0, 4), displayReadiness, allRoles: allFits }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function nameHash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// ── Tier system ────────────────────────────────────────────────────────────────

const TIERS = [
  { name: 'Level 1', color: 'var(--color-grey-60)',   glow: 'rgba(105,113,127,0.35)' },
  { name: 'Level 2', color: 'var(--color-orange-60)', glow: 'rgba(201,126,25,0.4)'   },
  { name: 'Level 3', color: 'var(--color-green-60)',  glow: 'rgba(61,143,121,0.4)'   },
  { name: 'Level 4', color: 'var(--color-blue-60)',   glow: 'rgba(44,140,201,0.4)'   },
  { name: 'Level 5', color: 'var(--color-violet-60)', glow: 'rgba(151,85,144,0.4)'   },
]

function getTier(pct: number) {
  if (pct >= 90) return TIERS[4]
  if (pct >= 75) return TIERS[3]
  if (pct >= 50) return TIERS[2]
  if (pct >= 25) return TIERS[1]
  return TIERS[0]
}


function buildLevels(employee: DevPlanSheetProps['employee']): LevelDef[] {
  const roleWord = employee?.title?.split(' ')[0] ?? 'Business'
  return LEVEL_BASE.map(base => ({
    ...base,
    courses: base.id === 3
      ? [{ name: `AI-Powered ${roleWord} Workflows`, provider: 'Eightfold Academy', duration: 'Self-paced · ~8 hrs', level: 'Intermediate', free: false }]
      : (LEVEL_COURSES[base.id] ?? []),
  }))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CourseItem({ course, recognized = false }: { course: Course; recognized?: boolean }) {
  return (
    <div className={`dev-plan-sheet__course${recognized ? ' dev-plan-sheet__course--recognized' : ''}`}>
      <span className={`material-symbols-outlined dev-plan-sheet__course-icon${recognized ? ' dev-plan-sheet__course-icon--recognized' : ''}`}>
        {recognized ? 'check_circle' : 'menu_book'}
      </span>
      <div className="dev-plan-sheet__course-info">
        <div className={`dev-plan-sheet__course-name${recognized ? ' dev-plan-sheet__course-name--recognized' : ''}`}>
          {course.name}
        </div>
        <div className="dev-plan-sheet__course-meta">
          {course.provider} · {course.duration} · {course.level}
        </div>
      </div>
      {course.free && <span className="dev-plan-sheet__course-free">Free</span>}
    </div>
  )
}

function TaskItem({ text }: { text: string }) {
  return (
    <div className="dev-plan-sheet__task">
      <div className="dev-plan-sheet__task-dot" />
      {text}
    </div>
  )
}

// ── LevelCard ─────────────────────────────────────────────────────────────────

function LevelCard({
  level,
  state,
  xpPct,
  isAssigned,
  expanded,
  onToggle,
}: {
  level: LevelDef
  state: LevelState
  xpPct: number
  isAssigned: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const isCurrent = state === 'current'
  const isRecognized = state === 'recognized'
  const isLocked = state === 'locked'

  const cardClass = isRecognized
    ? 'dev-plan-sheet__level--recognized'
    : isCurrent
      ? 'dev-plan-sheet__level--current'
      : 'dev-plan-sheet__level--locked'

  const badgeClass = isRecognized
    ? 'dev-plan-sheet__level-badge--recognized'
    : isCurrent
      ? 'dev-plan-sheet__level-badge--current'
      : 'dev-plan-sheet__level-badge--locked'

  const badgeContent = isRecognized
    ? <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
    : isLocked
      ? <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
      : level.id

  const hoursComplete = isAssigned ? Math.round(level.totalHours * xpPct / 100) : 0

  return (
    <div className={`dev-plan-sheet__level ${cardClass}`}>
      {/* Header */}
      <div
        className={`dev-plan-sheet__level-header${(isRecognized || isLocked) ? ' dev-plan-sheet__level-header--clickable' : ''}`}
        onClick={(isRecognized || isLocked) ? onToggle : undefined}
        role={isRecognized || isLocked ? 'button' : undefined}
        aria-expanded={isRecognized || isLocked ? expanded : undefined}
      >
        <div className={`dev-plan-sheet__level-badge ${badgeClass}`}>
          {badgeContent}
        </div>

        <div className="dev-plan-sheet__level-title-group">
          <div className={`dev-plan-sheet__level-name${isLocked ? ' dev-plan-sheet__level-name--locked' : ''}`}>
            Step {level.id}: {level.name}
          </div>
          {isCurrent && !isAssigned && (
            <div className="dev-plan-sheet__level-sublabel">Assign plans to activate</div>
          )}
        </div>

        <span className={`dev-plan-sheet__level-pts-chip dev-plan-sheet__level-pts-chip--${isRecognized ? 'credited' : isLocked ? 'locked' : 'current'}`}>
          {isRecognized ? `+${level.adoptionPts} pts credited` : `+${level.adoptionPts} pts`}
        </span>

        {(isRecognized || isLocked) && (
          <span className={`material-symbols-outlined dev-plan-sheet__level-chevron${expanded ? ' dev-plan-sheet__level-chevron--open' : ''}`}>
            expand_more
          </span>
        )}
      </div>

      {/* XP bar — current level only */}
      {isCurrent && (
        <div className="dev-plan-sheet__xp">
          <div className="dev-plan-sheet__xp-header">
            <span className="dev-plan-sheet__xp-label">Step progress</span>
            <span className="dev-plan-sheet__xp-pct">
              {isAssigned ? `${xpPct}%` : '—'}
            </span>
          </div>
          <div className="dev-plan-sheet__xp-track">
            <div
              className="dev-plan-sheet__xp-fill"
              style={{ width: isAssigned ? `${xpPct}%` : '0%' }}
            />
          </div>
          {isAssigned && (
            <div className="dev-plan-sheet__xp-sub">
              {hoursComplete} of {level.totalHours} hrs complete
            </div>
          )}
        </div>
      )}

      {/* Level body — current always shown; recognized/locked toggled */}
      {(isCurrent || expanded) && (
        <div className="dev-plan-sheet__level-body">
          <hr className="dev-plan-sheet__level-divider" />

          {/* Outcome */}
          <div className="dev-plan-sheet__section-heading">Outcome</div>
          <p className="dev-plan-sheet__outcome">{level.outcome}</p>

          {/* Courses */}
          <div className="dev-plan-sheet__section-heading">Courses</div>
          <div className="dev-plan-sheet__courses">
            {level.courses.map((c, i) => (
              <CourseItem key={i} course={c} recognized={isRecognized} />
            ))}
          </div>

          {/* Tasks */}
          <div className="dev-plan-sheet__section-heading">Practice tasks</div>
          <div className="dev-plan-sheet__tasks">
            {level.tasks.map((t, i) => (
              <TaskItem key={i} text={t} />
            ))}
          </div>
        </div>
      )}

      {/* Locked gate row */}
      {isLocked && !expanded && (
        <div className="dev-plan-sheet__gate">
          <div className="dev-plan-sheet__gate-info">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
            Complete Step {level.id - 1} to unlock
          </div>
        </div>
      )}
    </div>
  )
}

// ── DevPlanSheet ──────────────────────────────────────────────────────────────

export function DevPlanSheet({ employee, open, onClose, isAssigned }: DevPlanSheetProps) {
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const [modified, setModified] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [activeUnlock, setActiveUnlock] = useState<'doors' | 'risk' | 'skills' | null>(null)

  // Reset state when a different employee's plan is opened
  useEffect(() => {
    setModified(false)
    setRegenerating(false)
    setExpandedLevels(new Set())
    setActiveUnlock(null)
  }, [employee?.name])

  function handleRegenerate() {
    setRegenerating(true)
    setTimeout(() => {
      setRegenerating(false)
      setModified(true)
    }, 1500)
  }

  if (!open || !employee) return null

  const recognizedCount = 0
  const levels = buildLevels(employee)

  // Derive XP per level from name hash (only shown for current/override levels)
  function getXpPct(levelId: number) {
    if (!isAssigned) return 0
    return Math.min(80, 10 + (nameHash(employee!.name + levelId) % 71))
  }

  function getLevelState(levelId: number): LevelState {
    if (levelId <= recognizedCount) return 'recognized'
    if (levelId === recognizedCount + 1) return 'current'
    return 'locked'
  }

  function toggleExpand(levelId: number) {
    setExpandedLevels(prev => {
      const next = new Set(prev)
      next.has(levelId) ? next.delete(levelId) : next.add(levelId)
      return next
    })
  }

  // Footer stats
  const remainingLevels = levels.filter(l => l.id > recognizedCount)

  // Journey / tier data
  const remainingAdoptionPts = remainingLevels.reduce((s, l) => s + l.adoptionPts, 0)
  const projectedScore = Math.min(100, employee.displayReadiness + remainingAdoptionPts)
  const potentialPct = projectedScore - employee.displayReadiness
  const currentTier = getTier(employee.displayReadiness)
  const targetTier = getTier(projectedScore)

  // Completion unlocks
  const firstName = employee.name.split(' ')[0]
  const unlocks = getUnlocks(employee.name, employee.title, employee.displayReadiness)

  return createPortal(
    <div className="dev-plan-sheet__root">
      <div className="dev-plan-sheet__backdrop" onClick={onClose} />

      <div className="dev-plan-sheet__panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="dev-plan-sheet__header">
          <div className="dev-plan-sheet__header-info">
            <h2 className="dev-plan-sheet__name">{employee.name}</h2>
            <div className="dev-plan-sheet__meta">
              {employee.title && <span>{employee.title}</span>}
              {employee.title && <span style={{ color: '#e2e8f0' }}>·</span>}
              <span>Development plan</span>
            </div>
          </div>
          <button type="button" className="dev-plan-sheet__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* AI Adoption Journey */}
        <div className="dev-plan-sheet__journey">

          {/* Current tier */}
          <div className="dev-plan-sheet__journey-side">
            <div
              className="dev-plan-sheet__journey-gem"
              style={{ background: currentTier.color, borderColor: currentTier.color, boxShadow: `0 0 10px ${currentTier.glow}` }}
            >
              {employee.displayReadiness}%
            </div>
            <div className="dev-plan-sheet__journey-tier" style={{ color: currentTier.color }}>
              {currentTier.name}
            </div>
            <div className="dev-plan-sheet__journey-sublabel">
              {isAssigned ? 'In progress' : 'Not started'}
            </div>
          </div>

          {/* Bar track */}
          <div className="dev-plan-sheet__journey-bar-area">
            <div className="dev-plan-sheet__journey-track">
              <div className="dev-plan-sheet__journey-fill" style={{ width: `${employee.displayReadiness}%` }} />
              {potentialPct > 0 && (
                <div className="dev-plan-sheet__journey-potential"
                  style={{ left: `${employee.displayReadiness}%`, width: `${potentialPct}%` }}
                />
              )}
              {employee.displayReadiness < 50 && (
                <div className="dev-plan-sheet__journey-threshold" style={{ left: '50%' }} />
              )}
              {potentialPct > 0 && (
                <div className="dev-plan-sheet__journey-pts"
                  style={{ left: `${employee.displayReadiness + potentialPct / 2}%` }}
                >
                  +{remainingAdoptionPts} pts with this plan
                </div>
              )}
            </div>
          </div>

          {/* Target tier */}
          <div className="dev-plan-sheet__journey-side dev-plan-sheet__journey-side--target">
            <div
              className="dev-plan-sheet__journey-gem dev-plan-sheet__journey-gem--target"
              style={{ background: targetTier.color, borderColor: targetTier.color, boxShadow: `0 0 16px ${targetTier.glow}` }}
            >
              {projectedScore}%
            </div>
            <div className="dev-plan-sheet__journey-tier" style={{ color: targetTier.color }}>
              {targetTier.name}
            </div>
            <div className="dev-plan-sheet__journey-sublabel" style={{ color: projectedScore >= 50 ? '#10b981' : '#64748b' }}>
              {projectedScore >= 50 ? '✓ AI-ready' : 'Not AI-ready'}
            </div>
          </div>

        </div>

        {/* Body */}
        <div className="dev-plan-sheet__body">


          {/* Curriculum */}
          <div className="dev-plan-sheet__curriculum-heading">Curriculum · {levels.length} steps</div>

          {levels.map(level => {
            const state = getLevelState(level.id)
            return (
              <LevelCard
                key={level.id}
                level={level}
                state={state}
                xpPct={getXpPct(level.id)}
                isAssigned={isAssigned}
                expanded={expandedLevels.has(level.id)}
                onToggle={() => toggleExpand(level.id)}
              />
            )
          })}

          {/* Completion unlocks */}
          <div className="dev-plan-sheet__unlocks">
            <div className="dev-plan-sheet__unlocks-heading">
              What completing this plan unlocks for {firstName}
            </div>
            <div className="dev-plan-sheet__unlocks-badges">
              {([
                { id: 'doors' as const, value: String(unlocks.doorCount), label: 'Career doors unlock', detail: `Top: ${unlocks.topRole} (${unlocks.topFit}% fit)`, color: 'var(--color-blue-60)', gid: 'udg-blue' },
                { id: 'risk' as const,  value: `−${unlocks.riskDrop}%`,   label: 'Automation risk drop', detail: `${unlocks.currentRisk}% now → ${unlocks.pathsTo}%`, color: 'var(--color-green-60)', gid: 'udg-green' },
                { id: 'skills' as const, value: String(unlocks.aiSkills.length), label: 'AI skills gained', detail: unlocks.aiSkills.join(', '), color: 'var(--color-violet-60)', gid: 'udg-violet' },
              ]).map(({ id, value, label, detail, color, gid }) => {
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

            {/* Expanded detail panel */}
            {activeUnlock === 'doors' && (
              <div className="dev-plan-sheet__unlock-panel">
                <div className="dev-plan-sheet__unlock-panel-heading">Potential new roles</div>
                <div className="dev-plan-sheet__unlock-panel-roles">
                  {unlocks.allRoles.map(({ role, fit }) => (
                    <div key={role} className="dev-plan-sheet__unlock-role-row">
                      <span className="dev-plan-sheet__unlock-role-name">{role}</span>
                      <div className="dev-plan-sheet__unlock-role-bar-wrap">
                        <div className="dev-plan-sheet__unlock-role-bar" style={{ width: `${fit}%` }} />
                      </div>
                      <span className="dev-plan-sheet__unlock-role-fit">{fit}% fit</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeUnlock === 'risk' && (
              <div className="dev-plan-sheet__unlock-panel">
                <div className="dev-plan-sheet__unlock-panel-heading">Automation risk summary</div>
                <p className="dev-plan-sheet__unlock-panel-body">
                  {firstName}'s current role has a <strong>{unlocks.currentRisk}% automation risk</strong> — meaning most routine tasks could be automated without AI fluency.
                  Completing this plan develops the judgment, prompt skills, and oversight capabilities that place {firstName} firmly in the <em>augmentation zone</em>, dropping exposure to just {unlocks.pathsTo}%.
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
                <div className="dev-plan-sheet__unlock-panel-heading">Skills {firstName} will gain</div>
                <div className="dev-plan-sheet__unlock-skills-cloud">
                  {unlocks.aiSkills.map(skill => (
                    <Tag key={skill} className="dev-plan-sheet__skill-tag">{skill}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="dev-plan-sheet__footer">
          <div className="dev-plan-sheet__footer-left">
            <Button variant="secondary" aria-label="Share">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
            </Button>
            <Button variant="secondary" aria-label="Download">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
            </Button>
          </div>
          <div className="dev-plan-sheet__footer-actions">
            <Button variant="secondary" onClick={handleRegenerate} disabled={regenerating}>
              <span className={`material-symbols-outlined dev-plan-sheet__regen-icon${regenerating ? ' dev-plan-sheet__regen-icon--spinning' : ''}`} style={{ fontSize: 15 }}>
                {regenerating ? 'sync' : 'auto_awesome'}
              </span>
              {regenerating ? 'Regenerating…' : 'Regenerate plan'}
            </Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
            {modified && <Button variant="primary" onClick={onClose}>Save changes</Button>}
          </div>
        </div>
      </div>

    </div>,
    document.body
  )
}
