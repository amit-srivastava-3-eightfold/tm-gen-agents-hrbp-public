import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@tonyh-2-eightfold/ef-design-system'
import './DevPlanSheet.css'

// ── Types ─────────────────────────────────────────────────────────────────────

type LevelState = 'recognized' | 'current' | 'override' | 'locked'

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
}

export interface DevPlanSheetProps {
  employee: { name: string; title?: string; readinessPct: number; displayReadiness: number } | null
  open: boolean
  onClose: () => void
  collectionComplete: boolean
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

// ── Helpers ────────────────────────────────────────────────────────────────────

function nameHash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function getRecognizedCount(readinessPct: number) {
  if (readinessPct >= 60) return 2
  if (readinessPct >= 40) return 1
  return 0
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

function TaskItem({ text, override = false }: { text: string; override?: boolean }) {
  return (
    <div className="dev-plan-sheet__task">
      <div className={`dev-plan-sheet__task-dot${override ? ' dev-plan-sheet__task-dot--override' : ''}`} />
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
  onRequestOverride,
}: {
  level: LevelDef
  state: LevelState
  xpPct: number
  isAssigned: boolean
  expanded: boolean
  onToggle: () => void
  onRequestOverride: (levelId: number) => void
}) {
  const isOverride = state === 'override'
  const isCurrent = state === 'current' || isOverride
  const isRecognized = state === 'recognized'
  const isLocked = state === 'locked'

  const cardClass = isRecognized
    ? 'dev-plan-sheet__level--recognized'
    : isOverride
      ? 'dev-plan-sheet__level--current-override'
      : isCurrent
        ? 'dev-plan-sheet__level--current'
        : 'dev-plan-sheet__level--locked'

  const badgeClass = isRecognized
    ? 'dev-plan-sheet__level-badge--recognized'
    : isOverride
      ? 'dev-plan-sheet__level-badge--override'
      : isCurrent
        ? 'dev-plan-sheet__level-badge--current'
        : 'dev-plan-sheet__level-badge--locked'

  const pillClass = isRecognized
    ? 'dev-plan-sheet__level-pill--recognized'
    : isOverride
      ? 'dev-plan-sheet__level-pill--override'
      : isCurrent
        ? 'dev-plan-sheet__level-pill--current'
        : 'dev-plan-sheet__level-pill--locked'

  const pillLabel = isRecognized
    ? 'Recognized'
    : isOverride
      ? 'Override active'
      : isCurrent
        ? (isAssigned ? 'In progress' : 'Up next')
        : 'Locked'

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
            Level {level.id}: {level.name}
          </div>
          {isCurrent && !isAssigned && (
            <div className="dev-plan-sheet__level-sublabel">Assign plans to activate</div>
          )}
        </div>

        <span className={`dev-plan-sheet__level-pill ${pillClass}`}>{pillLabel}</span>

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
            <span className="dev-plan-sheet__xp-label">{level.xpLabel}</span>
            <span className={`dev-plan-sheet__xp-pct${isOverride ? ' !text-[#c2410c]' : ''}`}>
              {isAssigned ? `${xpPct}%` : '—'}
            </span>
          </div>
          <div className="dev-plan-sheet__xp-track">
            <div
              className={`dev-plan-sheet__xp-fill${isOverride ? ' dev-plan-sheet__xp-fill--override' : ''}`}
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

          {isOverride && (
            <div className="dev-plan-sheet__override-warning">
              <span className="material-symbols-outlined" style={{ fontSize: 16, flexShrink: 0 }}>warning</span>
              <span>Gate override active — manager approved early access before Level {level.id - 1} is complete.</span>
            </div>
          )}

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
              <TaskItem key={i} text={t} override={isOverride} />
            ))}
          </div>
        </div>
      )}

      {/* Locked gate row */}
      {isLocked && !expanded && (
        <div className="dev-plan-sheet__gate">
          <div className="dev-plan-sheet__gate-info">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
            Complete Level {level.id - 1} to unlock
          </div>
          <button
            type="button"
            className="dev-plan-sheet__gate-override-btn"
            onClick={(e) => { e.stopPropagation(); onRequestOverride(level.id) }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>key</span>
            Override gate
          </button>
        </div>
      )}
    </div>
  )
}

// ── DevPlanSheet ──────────────────────────────────────────────────────────────

export function DevPlanSheet({ employee, open, onClose, collectionComplete, isAssigned }: DevPlanSheetProps) {
  const [overriddenLevels, setOverriddenLevels] = useState<Set<number>>(new Set())
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const [confirmOverride, setConfirmOverride] = useState<number | null>(null)

  if (!open || !employee) return null

  const recognizedCount = getRecognizedCount(employee.readinessPct)
  const levels = buildLevels(employee)

  // Derive XP per level from name hash (only shown for current/override levels)
  function getXpPct(levelId: number) {
    if (!isAssigned) return 0
    return Math.min(80, 10 + (nameHash(employee!.name + levelId) % 71))
  }

  function getLevelState(levelId: number): LevelState {
    if (levelId <= recognizedCount) return 'recognized'
    if (levelId === recognizedCount + 1) return 'current'
    if (overriddenLevels.has(levelId)) return 'override'
    return 'locked'
  }

  function toggleExpand(levelId: number) {
    setExpandedLevels(prev => {
      const next = new Set(prev)
      next.has(levelId) ? next.delete(levelId) : next.add(levelId)
      return next
    })
  }

  function handleOverrideConfirm(levelId: number) {
    setOverriddenLevels(prev => new Set([...prev, levelId]))
    setExpandedLevels(prev => { const n = new Set(prev); n.delete(levelId); return n })
    setConfirmOverride(null)
  }

  // Placement banner text
  const placementRecognized = recognizedCount > 0
  const placementTitle = placementRecognized
    ? `${recognizedCount === 1 ? '1 level' : `${recognizedCount} levels`} credited from existing knowledge`
    : 'Placement: starting at Level 1 — AI Foundations'
  const placementBody = placementRecognized
    ? `Based on ${employee.name.split(' ')[0]}'s career hub profile and baseline data collection, the AI identified pre-existing knowledge in ${recognizedCount === 1 ? 'AI Foundations' : 'AI Foundations and Augmentation-Ready'}. ${recognizedCount === 1 ? 'Level 1 has' : 'Levels 1–2 have'} been auto-credited — curriculum starts at Level ${recognizedCount + 1}.`
    : `Placement was determined from ${employee.name.split(' ')[0]}'s career hub profile and role task data. No prior AI skill signals were detected — the full curriculum applies.`

  // Footer stats
  const remainingLevels = levels.filter(l => l.id > recognizedCount)
  const remainingHours = remainingLevels.reduce((s, l) => s + l.totalHours, 0)
  const weeksEstimate = remainingHours <= 12 ? '2–3 weeks' : remainingHours <= 24 ? '4–5 weeks' : remainingHours <= 36 ? '6–8 weeks' : '8–10 weeks'

  // Status
  const statusLabel = isAssigned ? 'In progress' : 'Not started'
  const statusColor = isAssigned ? '#6366f1' : '#94a3b8'
  const statusIcon = isAssigned ? 'sync' : 'schedule'
  const gapColor = employee.displayReadiness >= 50 ? '#15803d' : '#dc2626'

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
              <span
                className={`dev-plan-sheet__source-badge ${collectionComplete ? 'dev-plan-sheet__source-badge--measured' : 'dev-plan-sheet__source-badge--estimated'}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 11 }}>
                  {collectionComplete ? 'verified' : 'auto_awesome'}
                </span>
                {collectionComplete ? 'Measured' : 'Estimated'}
              </span>
            </div>
          </div>
          <button type="button" className="dev-plan-sheet__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Status bar */}
        <div className="dev-plan-sheet__status-bar">
          <div className="dev-plan-sheet__status-item">
            <div className="dev-plan-sheet__status-label">Status</div>
            <div className="dev-plan-sheet__status-value" style={{ color: statusColor }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{statusIcon}</span>
              {statusLabel}
            </div>
          </div>
          <div className="dev-plan-sheet__status-item">
            <div className="dev-plan-sheet__status-label">AI Adoption</div>
            <div className="dev-plan-sheet__status-value" style={{ color: employee.displayReadiness >= 50 ? '#15803d' : '#dc2626' }}>
              {employee.displayReadiness}%
            </div>
          </div>
          <div className="dev-plan-sheet__status-item">
            <div className="dev-plan-sheet__status-label">Gap Status</div>
            <div className="dev-plan-sheet__status-value" style={{ color: gapColor }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                {employee.displayReadiness >= 50 ? 'check_circle' : 'warning'}
              </span>
              {employee.displayReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="dev-plan-sheet__body">

          {/* Placement banner */}
          <div className={`dev-plan-sheet__placement ${placementRecognized ? 'dev-plan-sheet__placement--recognized' : 'dev-plan-sheet__placement--baseline'}`}>
            <span
              className={`material-symbols-outlined dev-plan-sheet__placement-icon ${placementRecognized ? 'dev-plan-sheet__placement-icon--recognized' : 'dev-plan-sheet__placement-icon--baseline'}`}
            >
              {placementRecognized ? 'workspace_premium' : 'my_location'}
            </span>
            <div>
              <div className="dev-plan-sheet__placement-title">{placementTitle}</div>
              <div className="dev-plan-sheet__placement-body">{placementBody}</div>
            </div>
          </div>

          {/* Curriculum */}
          <div className="dev-plan-sheet__curriculum-heading">Curriculum · {levels.length} levels</div>

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
                onRequestOverride={(id) => setConfirmOverride(id)}
              />
            )
          })}
        </div>

        {/* Footer */}
        <div className="dev-plan-sheet__footer">
          <div className="dev-plan-sheet__footer-meta">
            {levels.length} levels · ~{remainingHours} hrs · Est. {weeksEstimate}
            {recognizedCount > 0 && (
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                {recognizedCount} level{recognizedCount > 1 ? 's' : ''} credited · adjusted from baseline
              </div>
            )}
          </div>
          <div className="dev-plan-sheet__footer-actions">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="primary" onClick={onClose}>Save changes</Button>
          </div>
        </div>
      </div>

      {/* Override confirmation dialog */}
      {confirmOverride !== null && createPortal(
        <div className="dev-plan-sheet__confirm-overlay" onClick={() => setConfirmOverride(null)}>
          <div className="dev-plan-sheet__confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3 className="dev-plan-sheet__confirm-title">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#ea580c' }}>key</span>
              Override Level {confirmOverride} gate?
            </h3>
            <p className="dev-plan-sheet__confirm-body">
              This will give <strong>{employee.name}</strong> early access to <strong>Level {confirmOverride}: {levels.find(l => l.id === confirmOverride)?.name}</strong> before completing the previous level. An override note will be visible in the plan.
            </p>
            <div className="dev-plan-sheet__confirm-actions">
              <Button variant="secondary" onClick={() => setConfirmOverride(null)}>Cancel</Button>
              <Button variant="primary" onClick={() => handleOverrideConfirm(confirmOverride)}>
                Override gate
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>,
    document.body
  )
}
