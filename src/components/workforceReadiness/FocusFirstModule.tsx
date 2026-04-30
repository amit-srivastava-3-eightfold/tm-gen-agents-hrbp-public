import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@tonyh-2-eightfold/ef-design-system'
import { useCallback, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import {
  departments,
  ORG,
  getRolesForDept,
  deptGapHeadcount,
  wfrDemoCollectionSnapshot,
  wfrDemoCollectionSnapshotForDeptNames,
  wfrDemoDeptCollectionSnapshot,
  type Dept,
  type WfrDemoCollectionSnapshot,
} from '../../data/wfrOrgData'
import { FocusFirstLaunchDialog, type FocusCollectionLaunchSummary } from './FocusFirstLaunchDialog'
import { deptManagerTeams } from './collectionHelpers'
import type { UpskillingLaunchSummary } from './UpskillingLaunchDialog'

export type { FocusCollectionLaunchSummary }

export type FocusFirstCollectionAttentionScope = 'org' | 'dept'

// ── Shared hero card chrome ──────────────────────────────────────────────────

interface WfrHeroCardProps {
  gauge: ReactNode
  eyebrow: ReactNode
  headline: ReactNode
  supportingText?: ReactNode
  /** Optional CTA bar rendered as a bottom strip inside the card */
  ctaBar?: ReactNode
}

export function WfrHeroCard({ gauge, eyebrow, headline, supportingText, ctaBar }: WfrHeroCardProps) {
  return (
    <div className={ctaBar ? 'wfr-hero-card wfr-hero-card--with-cta' : 'wfr-hero-card'}>
      <div className="wfr-hero-card__main">
        <div className="wfr-hero-card__gauge">{gauge}</div>
        <div className="wfr-hero-card__copy">
          <p className="wfr-hero-card__eyebrow">{eyebrow}</p>
          <h2 className="wfr-hero-card__headline">{headline}</h2>
          {supportingText && <p className="wfr-hero-card__supporting">{supportingText}</p>}
        </div>
      </div>
      {ctaBar && <div className="wfr-hero-card__cta-bar">{ctaBar}</div>}
    </div>
  )
}

// ── Shared presentational rec card used by both the WFR dashboard and home page ──

interface WfrRecCardProps {
  variant: 'warn' | 'success' | 'info' | 'priority'
  icon: string
  eyebrow: string
  body: ReactNode
  subtitle?: ReactNode
  cta?: ReactNode
  progress?: { pct: number; label: string }
}

export function WfrRecCard({ variant, icon, eyebrow, body, subtitle, cta, progress }: WfrRecCardProps) {
  return (
    <div className={`wfr-ra-card wfr-ra-card--${variant}`}>
      <div className="wfr-ra-card__header">
        <span className="wfr-ra-card__eyebrow">
          <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>{icon}</span>{' '}{eyebrow}
        </span>
      </div>
      <div className="wfr-ra-card__cta-row">
        <div style={{ flex: 1 }}>
          <p className="wfr-ra-card__cta-text" style={subtitle ? { fontWeight: 600, marginBottom: 4 } : undefined}>{body}</p>
          {subtitle && <p className="wfr-ra-card__hint">{subtitle}</p>}
          {progress && (
            <div className="wfr-ra-card__mini-progress" style={{ marginTop: 8 }}>
              <span className="wfr-ra-card__mini-pct tabular-nums">{progress.pct}%</span>
              <div className="wfr-ra-card__mini-track">
                <div className="wfr-ra-card__mini-fill" style={{ width: `${progress.pct}%` }} />
              </div>
              <span className="wfr-ra-card__mini-label">{progress.label}</span>
            </div>
          )}
        </div>
        {cta}
      </div>
    </div>
  )
}

export interface FocusFirstCollectionCardProps {
  snapshot: WfrDemoCollectionSnapshot
  /** Org: “N departments…”; dept: single-dept attention copy. */
  attentionScope?: FocusFirstCollectionAttentionScope
  /** When set, subtext reflects the launch wizard (Review step) choices. */
  launchSummary?: FocusCollectionLaunchSummary | null
  /** Department name for dept drill-down copy (subtext + foot). */
  departmentContextName?: string
  /** Called when user wants to add more departments to the collection. */
  onAddDepartments?: () => void
  /** Whether collection has reached the sample threshold. */
  collectionComplete?: boolean
  /** Transition state: collection just finished, show 100% green before moving to state 3. */
  collectionJustCompleted?: boolean
  /** Called when user clicks the progress bar to simulate completion. */
  onCollectionComplete?: () => void
  /** Called when user clicks "View results" in the 2b transition state. */
  onViewResults?: () => void
  /** Called when user clicks attention badge or "View details" to scroll to the table. */
  onScrollToTable?: () => void
  /** Called when user clicks "Start upskilling" in the complete state. */
  onStartUpskilling?: () => void
  /** Whether upskilling has been launched. */
  upskillingActive?: boolean
  /** Summary of upskilling launch (departments selected, etc.) */
  upskillingLaunchSummary?: UpskillingLaunchSummary | null
  /** HRBP persona */
  isHrbp?: boolean
  /** HRBP has created development plans */
  hrbpPlansCreated?: boolean
  /** Override the computed remainingGapPeople (e.g. CHRO delegation scoped to HRBP's departments) */
  gapPeopleOverride?: number
}

/** Shared Focus First card — collecting state or complete state. */
export function FocusFirstCollectionCard({
  snapshot,
  attentionScope = 'org',
  launchSummary = null,
  departmentContextName,
  onAddDepartments: _onAddDepartments,
  collectionComplete = false,
  collectionJustCompleted = false,
  onCollectionComplete,
  onViewResults: _onViewResults,
  onScrollToTable,
  onStartUpskilling,
  upskillingActive = false,
  upskillingLaunchSummary = null,
  isHrbp = false,
  hrbpPlansCreated = false,
  gapPeopleOverride,
}: FocusFirstCollectionCardProps) {
  // Animation phases: idle → filling → green → done
  const [animPhase, setAnimPhase] = useState<'idle' | 'filling' | 'green'>('idle')
  const [animPct, setAnimPct] = useState(0)
  const handleProgressClick = useCallback(() => {
    if (animPhase !== 'idle' || collectionJustCompleted || collectionComplete) return
    const startPct = snapshot.orgResponseRate
    setAnimPhase('filling')
    setAnimPct(startPct) // initialize at current value — prevents 0% flash before first rAF tick
    const startTime = performance.now()
    const duration = 3000 // 3s fill animation

    // Exact cubic-bezier(0.25, 0.1, 0.25, 1) solver to match the CSS animation
    const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
      return (x: number) => {
        let t = x
        for (let i = 0; i < 8; i++) {
          const ct = 1 - t
          const bx = 3 * ct * ct * t * x1 + 3 * ct * t * t * x2 + t * t * t - x
          const dx = 3 * ct * ct * x1 + 6 * ct * t * (x2 - x1) + 3 * t * t * (1 - x2)
          if (Math.abs(dx) < 1e-6) break
          t -= bx / dx
          t = Math.max(0, Math.min(1, t))
        }
        const ct = 1 - t
        return 3 * ct * ct * t * y1 + 3 * ct * t * t * y2 + t * t * t
      }
    }
    const ease = cubicBezier(0.25, 0.1, 0.25, 1)

    const tick = (now: number) => {
      const linear = Math.min((now - startTime) / duration, 1)
      const eased = linear >= 1 ? 1 : ease(linear)
      setAnimPct(Math.round(startPct + (100 - startPct) * eased))
      if (linear < 1) {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
    // Phase 1: bar fills to 100% (3s)
    setTimeout(() => {
      setAnimPct(100)
      setAnimPhase('green') // card turns green
      // Phase 2: hold green briefly, then advance state
      setTimeout(() => {
        setAnimPhase('idle')
        setAnimPct(0)
        onCollectionComplete?.()
      }, 1200)
    }, duration)
  }, [animPhase, collectionJustCompleted, collectionComplete, onCollectionComplete, snapshot.orgResponseRate])

  const showAttentionBadge = false
  const deptName = departmentContextName

  // HRBP view: show upskilling CTA when collection complete (not just-completed transition, not yet upskilling)
  if (isHrbp && collectionComplete && !collectionJustCompleted && !upskillingActive) {
    if (hrbpPlansCreated) return null // Plans assigned — hide card
    const currentDept = deptName ? departments.find(d => d.name === deptName) : undefined
    const gapCount = gapPeopleOverride != null && gapPeopleOverride > 0
      ? gapPeopleOverride
      : currentDept ? deptGapHeadcount(currentDept) : 0
    const topRoles = currentDept ? getRolesForDept(currentDept.name).slice(0, 3) : []
    return (
      <div className="wfr-ra-card wfr-ra-card--success">
        <div className="wfr-ra-card__header">
          <span className="wfr-ra-card__eyebrow" style={{ color: '#15803d' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>check_circle</span> Collection complete
          </span>
          <div className="wfr-ra-card__mini-progress">
            <span className="wfr-ra-card__mini-pct">100%</span>
            <div className="wfr-ra-card__mini-track"><div className="wfr-ra-card__mini-fill" /></div>
            <span className="wfr-ra-card__mini-label">Sample threshold reached{currentDept ? ` — ${currentDept.name} ready for upskilling` : ''}</span>
          </div>
        </div>
        <div className="wfr-ra-card__cta-row">
          <div>
            <p className="wfr-ra-card__cta-text">
              Data collection is complete. Create development plans for <strong>{gapCount.toLocaleString()}</strong> employees{topRoles.length > 0 && <> — prioritize {topRoles.map((r, i) => (<span key={r.title}><strong>{r.title}</strong>{i < topRoles.length - 1 ? (i === topRoles.length - 2 ? ' and ' : ', ') : ''}</span>))}</>}.
            </p>
            <p className="wfr-ra-card__hint">Assign development plans to your client managers so they can enroll their teams.</p>
          </div>
          <Button type="button" variant="primary" className="shrink-0" onClick={onStartUpskilling}>
            Start upskilling&nbsp;→
          </Button>
        </div>
      </div>
    )
  }
  // HRBP view: hide during transition
  if (isHrbp && collectionJustCompleted) {
    return null
  }
  // CHRO view: hide RA card when upskilling is done (plans assigned org-wide)
  if (!isHrbp && hrbpPlansCreated) {
    return null
  }
  if (false && isHrbp && upskillingActive && (collectionJustCompleted || collectionComplete)) {
    const scopedDeptNames = upskillingLaunchSummary?.departmentNames ?? []
    const scopedDepts = scopedDeptNames.length ? departments.filter(d => scopedDeptNames.includes(d.name)) : departments
    const totalGap = scopedDepts.reduce((s, d) => s + deptGapHeadcount(d), 0)
    const totalRoles = scopedDepts.reduce((s, d) => s + getRolesForDept(d.name).length, 0)

    if (hrbpPlansCreated) {
      // Plans created — show green success card with plan count
      return (
        <div className="wfr-ra-card wfr-ra-card--success">
          <div className="wfr-ra-card__header">
            <span className="wfr-ra-card__eyebrow" style={{ color: '#15803d' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>description</span> Development plans created
            </span>
          </div>
          <div className="wfr-ra-card__cta-row">
            <div>
              <p className="wfr-ra-card__cta-text">
                <strong>{totalGap.toLocaleString()}</strong> development plans created across <strong>{totalRoles}</strong> roles. Review and assign plans to employees.
              </p>
              <p className="wfr-ra-card__hint">
                Use the table below to view plans, edit courses, and assign to individual employees.
              </p>
            </div>
            <Button type="button" variant="primary" className="shrink-0" onClick={onScrollToTable}>
              Assign plans&nbsp;→
            </Button>
          </div>
        </div>
      )
    }

    // Plans not yet created — show action required
    return (
      <div className="wfr-ra-card wfr-ra-card--warn">
        <div className="wfr-ra-card__header">
          <span className="wfr-ra-card__eyebrow" style={{ color: '#92400e' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>assignment</span> Action required
          </span>
        </div>
        <div className="wfr-ra-card__cta-row">
          <div>
            <p className="wfr-ra-card__cta-text">
              Create development plans for <strong>{totalGap.toLocaleString()}</strong> employees across <strong>{totalRoles}</strong> roles in your departments.
            </p>
            <p className="wfr-ra-card__hint">
              Review roles in the table below and create plans to {'close adoption gaps'}.
            </p>
          </div>
          <Button type="button" variant="primary" className="shrink-0" onClick={onStartUpskilling}>
            Create development plans&nbsp;→
          </Button>
        </div>
      </div>
    )
  }

  if (collectionJustCompleted || collectionComplete) {
    const isDeptView = !!deptName
    const currentDept = isDeptView ? departments.find((d) => d.name === deptName) : null

    if (isDeptView && currentDept) {
      // Dept-scoped complete state: only reference this department
      const roles = getRolesForDept(currentDept.name)
      const gapCount = deptGapHeadcount(currentDept)
      const topRoles = [...roles]
        .sort((a, b) => (b.aiPotential - b.aiReadiness) - (a.aiPotential - a.aiReadiness))
        .slice(0, 3)

      const deptHasUpskilling = upskillingActive && upskillingLaunchSummary?.departmentNames?.includes(currentDept.name)
      const deptPlansAssigned = deptHasUpskilling && upskillingLaunchSummary?.plansAssigned?.includes(currentDept.name)
      const deptTeams = deptManagerTeams(currentDept.name, currentDept.employees)
      const planCount = gapCount // one plan per person in the gap
      const teamCount = deptTeams.length

      // State 3a: Plans created but not yet assigned
      if (deptHasUpskilling && !deptPlansAssigned) {
        return (
          <div className="wfr-ra-card wfr-ra-card--success">
            <div className="wfr-ra-card__header">
              <span className="wfr-ra-card__eyebrow" style={{ color: '#15803d' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>description</span> Development plans created
              </span>
            </div>
            <div className="wfr-ra-card__cta-row">
              <div>
                <p className="wfr-ra-card__cta-text">
                  <strong>{planCount}</strong> development plans created for <strong>{teamCount}</strong> teams in <strong>{currentDept.name}</strong>.
                </p>
                <p className="wfr-ra-card__hint">Review and edit individual plans in the table below, then assign to employees.</p>
              </div>
              <Button type="button" variant="primary" className="shrink-0" onClick={onStartUpskilling}>
                Assign plans&nbsp;→
              </Button>
            </div>
          </div>
        )
      }

      // State 3b: Plans assigned, in progress
      if (deptPlansAssigned) {
        const pct = 35 + Math.abs((currentDept.name.length * 13) % 30)
        return (
          <div className="wfr-ra-card wfr-ra-card--warn">
            <div className="wfr-ra-card__header">
              <span className="wfr-ra-card__eyebrow" style={{ color: '#92400e' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>school</span> Upskilling in progress
              </span>
            </div>
            <p className="wfr-ra-card__cta-text">
              <strong>{planCount}</strong> development plans in <strong>{currentDept.name}</strong> — <strong>{gapCount.toLocaleString()}</strong> employees enrolled.
            </p>
            <div className="wfr-ra-card__progress" style={{ cursor: 'default' }}>
              <div className="wfr-ra-card__progress-info">
                <span className="wfr-ra-card__progress-pct tabular-nums" style={{ color: '#92400e' }}>{pct}%</span>
                <span className="wfr-ra-card__progress-label">plan completion</span>
              </div>
              <div className="wfr-ra-card__track">
                <div className="wfr-ra-card__fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <p className="wfr-ra-card__hint">Track enrollment progress in the table below.</p>
          </div>
        )
      }

      return (
        <div className="wfr-ra-card wfr-ra-card--success">
          <div className="wfr-ra-card__header">
            <span className="wfr-ra-card__eyebrow" style={{ color: '#15803d' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>check_circle</span> Collection complete
            </span>
            <div className="wfr-ra-card__mini-progress">
              <span className="wfr-ra-card__mini-pct">100%</span>
              <div className="wfr-ra-card__mini-track">
                <div className="wfr-ra-card__mini-fill" />
              </div>
              <span className="wfr-ra-card__mini-label">Sample threshold reached — {currentDept.name} ready for upskilling</span>
            </div>
          </div>
          <div className="wfr-ra-card__cta-row">
            <div>
              <p className="wfr-ra-card__cta-text">
                Upskill <strong>{gapCount.toLocaleString()}</strong> employees — prioritize{' '}
                {topRoles.map((r, i) => (
                  <span key={r.title}><strong>{r.title}</strong>{i < topRoles.length - 1 ? (i === topRoles.length - 2 ? ' and ' : ', ') : ''}</span>
                ))}.
              </p>
              <p className="wfr-ra-card__hint">
                Choose teams and assign development plans to {'close adoption gaps'}.
              </p>
            </div>
            <Button type="button" variant="primary" className="shrink-0" onClick={onStartUpskilling}>
              Start upskilling&nbsp;→
            </Button>
          </div>
        </div>
      )
    }

    // Org-level complete state: show top departments, filtering out already-upskilling ones
    const scopedNames = launchSummary?.scopedDepartmentNames ?? []
    const scopedDepts = scopedNames.length
      ? departments.filter((d) => scopedNames.includes(d.name))
      : departments
    const upskillingDeptSet = new Set(upskillingLaunchSummary?.departmentNames ?? [])
    const remainingDepts = scopedDepts.filter((d) => !upskillingDeptSet.has(d.name))
    const computedGapPeople = remainingDepts.reduce((sum, d) => {
      const augPeople = Math.round((d.employees / ORG.totalEmployees) * ORG.peopleInAugRoles)
      return sum + Math.round(augPeople * (1 - d.aiReadiness / 100))
    }, 0)
    const remainingGapPeople = gapPeopleOverride ?? computedGapPeople

    // After upskilling is launched — keep state 3 card with confirmation
    if (upskillingActive) {
      const launchedDepts = scopedDepts.filter((d) => upskillingDeptSet.has(d.name))
      const totalLaunchedGap = launchedDepts.reduce((sum, d) => sum + deptGapHeadcount(d), 0)

      return (
        <div className="wfr-ra-card wfr-ra-card--warn">
          <div className="wfr-ra-card__header">
            <span className="wfr-ra-card__eyebrow" style={{ color: '#b45309' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>rocket_launch</span> Upskilling started
            </span>
          </div>
          <div className="wfr-ra-card__cta-row">
            <div>
              <p className="wfr-ra-card__cta-text">
                {isHrbp ? (() => {
                  const dirNames = upskillingLaunchSummary?.selectedDirectorNames
                  const dirCount = dirNames?.length ?? launchedDepts.length
                  const empCount = upskillingLaunchSummary?.totalEmployees ?? totalLaunchedGap
                  return <>You're creating development plans for <strong>{empCount.toLocaleString()}</strong> employees across <strong>{dirCount}</strong> client manager{dirCount === 1 ? '' : 's'}.</>
                })() : <>HRBPs are creating development plans for <strong>{totalLaunchedGap.toLocaleString()}</strong> employees across <strong>{launchedDepts.length}</strong> department{launchedDepts.length === 1 ? '' : 's'}.</>}
              </p>
              <p className="wfr-ra-card__hint">
                {isHrbp
                  ? 'Client managers will review and assign plans to their teams. Adoption scores will update as employees complete their plans.'
                  : 'Once plans are assigned, adoption scores will update to reflect upskilling progress.'}
              </p>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#fef3c7', border: '1px solid #fcd34d', fontSize: 13, fontWeight: 600, color: '#b45309', whiteSpace: 'nowrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>rocket_launch</span>
              Upskilling started
            </span>
          </div>
        </div>
      )
    }

    const scopeLabel = launchSummary?.delegated && launchSummary?.scopeLabel
      ? `${launchSummary.scopeLabel}'s teams`
      : `${remainingDepts.length} department${remainingDepts.length === 1 ? '' : 's'}`

    return (
      <div className="wfr-ra-card wfr-ra-card--success">
        <div className="wfr-ra-card__header">
          <span className="wfr-ra-card__eyebrow" style={{ color: '#15803d' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>check_circle</span> Collection complete
          </span>
        </div>
        <div className="wfr-ra-card__cta-row">
          <div>
            <p className="wfr-ra-card__cta-text">
              Based on AI Coaching, you can improve productivity across <strong>{scopeLabel}</strong> by <strong>{(remainingGapPeople * ORG.hrsPerPersonWeek * 50).toLocaleString()} hours/year</strong> by upskilling <strong>{remainingGapPeople.toLocaleString()}</strong> employees.
            </p>
            <p className="wfr-ra-card__hint">Create development plans to close adoption gaps across {scopeLabel}.</p>
          </div>
          <Button type="button" variant="primary" className="shrink-0" onClick={onStartUpskilling}>
            What's next?
          </Button>
        </div>
      </div>
    )
  }

  const isFilling = animPhase === 'filling'
  const showGreen = animPhase === 'green'
  const isAnimating = animPhase !== 'idle'
  const cardClass = showGreen ? 'wfr-ra-card wfr-ra-card--success wfr-ra-card--animate-in' : 'wfr-ra-card wfr-ra-card--warn'

  return (
    <div className={cardClass}>
      <div className="wfr-ra-card__header">
        {showGreen ? (
          <span className="wfr-ra-card__eyebrow" style={{ color: '#15803d' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>check_circle</span> Collection complete
          </span>
        ) : (
          <>
            <span className="wfr-ra-card__eyebrow" style={{ color: '#92400e' }}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>sync</span> Collection in progress</span>
            {showAttentionBadge && !isAnimating ? (
              <button
                type="button"
                className="wfr-ra-card__attention"
                onClick={onScrollToTable}
              >
                <span className="material-symbols-outlined wfr-ra-card__attention-icon">warning</span>
                {attentionScope === 'dept'
                  ? 'This department needs attention'
                  : `${snapshot.needAttentionDeptCount} department${snapshot.needAttentionDeptCount === 1 ? '' : 's'} need attention`}
              </button>
            ) : null}
          </>
        )}
      </div>

      {!showGreen && (
        <p className="wfr-ra-card__cta-text" style={{ marginTop: 8 }}>
          {launchSummary?.delegated
            ? <><strong>{launchSummary.scopeLabel}</strong>'s collection is underway — survey responses are rolling in from their teams.</>
            : launchSummary
              ? <>Collection is underway for <strong>{launchSummary.scopeLabel}</strong> — survey responses are rolling in.</>
              : <>Responses are rolling in — check back as participation grows.</>}
        </p>
      )}

      <div
        className="wfr-ra-card__mini-progress"
        onClick={handleProgressClick}
        style={{ marginTop: 10, marginLeft: 0, ...(onCollectionComplete && !isAnimating ? { cursor: 'pointer' } : {}) }}
        title={onCollectionComplete && !isAnimating ? 'Click to simulate collection complete' : undefined}
      >
        <span className="wfr-ra-card__mini-pct tabular-nums" style={showGreen ? { color: '#15803d' } : undefined}>
          {showGreen ? '100' : isFilling ? animPct : snapshot.orgResponseRate}%
        </span>
        <div className="wfr-ra-card__mini-track" style={{ width: 200, height: 6 }}>
          <div
            className="wfr-ra-card__mini-fill"
            style={{ width: `${isAnimating ? animPct : snapshot.orgResponseRate}%`, transition: isAnimating ? 'none' : undefined }}
          />
        </div>
        <span className="wfr-ra-card__mini-label">
          {showGreen
            ? 'Sample threshold reached!'
            : isFilling
              ? `${Math.round(snapshot.respondedCount * (animPct / snapshot.orgResponseRate)).toLocaleString()} of ${snapshot.sampleTarget.toLocaleString()} sampled${attentionScope === 'dept' && deptName ? ` in ${deptName}` : ''}`
              : `${snapshot.respondedCount.toLocaleString()} of ${snapshot.sampleTarget.toLocaleString()} sampled${attentionScope === 'dept' && deptName ? ` in ${deptName}` : ''}`
          }
        </span>
      </div>

      {showGreen && (
        <p className="wfr-ra-card__sub" style={{ color: '#15803d', animation: 'fadeIn 0.4s ease-out' }}>
          Enough responses are in for statistically accurate results. Preparing upskilling priorities…
        </p>
      )}
    </div>
  )
}

/** Overview or department drill-down: Get started + launch dialog, or collecting card (org or scoped dept). */
export type FocusFirstModuleBoardProps = {
  mode?: 'board'
  collectionActive: boolean
  collectionComplete?: boolean
  collectionJustCompleted?: boolean
  onCollectionActiveChange: (active: boolean, launchSummary?: FocusCollectionLaunchSummary | null) => void
  onCollectionComplete?: () => void
  onViewResults?: () => void
  launchOpen: boolean
  onLaunchOpenChange: (open: boolean) => void
  onRequestCloseMetricSheet?: () => void
  /** When set, collecting state shows this department's response snapshot and dept attention copy. */
  deptContext?: Dept
  /** Last completed launch; used for underway subtext when collection is active. */
  collectionLaunchSummary?: FocusCollectionLaunchSummary | null
  /** Scroll to the collection status table. */
  onScrollToTable?: () => void
  /** Called when user clicks "Start upskilling" in complete state. */
  onStartUpskilling?: () => void
  /** Whether upskilling has been launched. */
  upskillingActive?: boolean
  /** Summary of upskilling launch */
  upskillingLaunchSummary?: UpskillingLaunchSummary | null
  isHrbp?: boolean
  hrbpPlansCreated?: boolean
  /** Whether the HRBP has a pending delegation from the CHRO */
  hrbpDelegationPending?: boolean
  /** Callback when HRBP launches collection from the delegation CTA */
  onHrbpCollectionLaunch?: (channelsLabel: string) => void
  /** Name of the person who delegated (for CTA copy) */
  delegatorName?: string
  /** Department name for delegation CTA copy */
  delegationDeptName?: string
  /** CHRO has delegated to HRBPs and is waiting for them to start */
  chroDelegationActive?: boolean
  /** Scope label for the CHRO delegation CTA (e.g. "Jaydon Torff" or "3 HRBPs") */
  chroDelegationScopeLabel?: string
  /** Override the gap people count in the collection-complete card (e.g. scoped to HRBP's depts) */
  gapPeopleOverride?: number
  /** Directors list passed to the HRBP launch dialog when hrbpDelegationPending */
  hrbpDirectors?: import('./FocusFirstLaunchDialog').HrbpDirector[]
  /** When true, the internal FocusFirstLaunchDialog is not rendered (parent handles the dialog) */
  suppressInternalDialog?: boolean
  /** Collection was just launched this session — show 0% response rate */
  justLaunched?: boolean
  /** When true, renders only the launch dialog (no visible card). Use when ctaBar is shown in the hero. */
  suppressCard?: boolean
}

/** Dept / role drill-down: only the collecting card (same module shell as overview). */
export type FocusFirstModuleCollectingProps = {
  mode: 'collecting'
  snapshot: WfrDemoCollectionSnapshot
  attentionScope: FocusFirstCollectionAttentionScope
  collectionLaunchSummary?: FocusCollectionLaunchSummary | null
  /** Shown in subtext when attentionScope is dept (e.g. role page). */
  departmentContextName?: string
}

export type FocusFirstModuleProps = FocusFirstModuleBoardProps | FocusFirstModuleCollectingProps

function FocusFirstModuleCollecting({
  snapshot,
  attentionScope,
  collectionLaunchSummary,
  departmentContextName,
}: Omit<FocusFirstModuleCollectingProps, 'mode'>) {
  return (
    <div className="wfr-dash__focus-module">
      <FocusFirstCollectionCard
        snapshot={snapshot}
        attentionScope={attentionScope}
        launchSummary={collectionLaunchSummary}
        departmentContextName={departmentContextName}
      />
    </div>
  )
}

function FocusFirstModuleBoard({
  collectionActive,
  collectionComplete,
  collectionJustCompleted,
  onCollectionActiveChange,
  onCollectionComplete,
  onViewResults,
  launchOpen,
  onLaunchOpenChange,
  onRequestCloseMetricSheet,
  deptContext,
  collectionLaunchSummary,
  onScrollToTable,
  onStartUpskilling,
  upskillingActive,
  upskillingLaunchSummary: boardUpskillingLaunchSummary,
  isHrbp = false,
  hrbpPlansCreated = false,
  hrbpDelegationPending = false,
  onHrbpCollectionLaunch,
  delegatorName,
  delegationDeptName: _delegationDeptName,
  chroDelegationActive = false,
  chroDelegationScopeLabel,
  gapPeopleOverride,
  hrbpDirectors,
  suppressInternalDialog = false,
  justLaunched = false,
  suppressCard = false,
}: Omit<FocusFirstModuleBoardProps, 'mode'> & {
  hrbpDelegationPending?: boolean
  onHrbpCollectionLaunch?: (channelsLabel: string) => void
  hrbpDirectors?: import('./FocusFirstLaunchDialog').HrbpDirector[]
  delegatorName?: string
  delegationDeptName?: string
  chroDelegationActive?: boolean
  chroDelegationScopeLabel?: string
}) {
  const orgCollectionSnap = useMemo(() => {
    const scoped = collectionLaunchSummary?.scopedDepartmentNames
    if (scoped?.length) return wfrDemoCollectionSnapshotForDeptNames(scoped)
    return wfrDemoCollectionSnapshot()
  }, [collectionLaunchSummary])
  const collectionSnap = useMemo(() => {
    const base = deptContext ? wfrDemoDeptCollectionSnapshot(deptContext) : orgCollectionSnap
    // Collection just launched this session — show 0% until the page is refreshed
    if (justLaunched) return { ...base, orgResponseRate: 0, respondedCount: 0 }
    return base
  }, [deptContext, orgCollectionSnap, justLaunched])
  const attentionScope: FocusFirstCollectionAttentionScope = deptContext ? 'dept' : 'org'

  if (suppressCard) {
    if (suppressInternalDialog) return null
    return (
      <FocusFirstLaunchDialog
        open={launchOpen}
        onOpenChange={(next) => {
          onLaunchOpenChange(next)
          if (next) onRequestCloseMetricSheet?.()
        }}
        onLaunch={(summary) => onCollectionActiveChange(true, summary)}
        defaultScopeDepartmentName={deptContext?.name}
        hrbpMode={hrbpDelegationPending}
        hrbpDirectors={hrbpDirectors}
        onHrbpLaunch={(channelsLabel) => {
          onHrbpCollectionLaunch?.(channelsLabel)
          onLaunchOpenChange(false)
        }}
      />
    )
  }

  // CHRO: hide entire RA module when upskilling is done (plans assigned org-wide)
  if (!isHrbp && hrbpPlansCreated) {
    return null
  }

  // HRBP: state 1 without delegation — show a recommended action card
  if (isHrbp && !collectionActive && !hrbpDelegationPending && !collectionComplete) {
    return (
      <div className="wfr-dash__focus-module">
        <div className="wfr-ra-card" style={{ background: '#eff3ff', borderColor: '#c5d3f8' }}>
          <div className="wfr-ra-card__header">
            <span className="wfr-ra-card__eyebrow" style={{ color: '#3b5bdb' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>insights</span> Recommended action
            </span>
          </div>
          <p className="wfr-ra-card__cta-text">
            Review estimated AI adoption across your team.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="wfr-dash__focus-module">
        {(collectionActive || (isHrbp && collectionComplete)) ? (
          <FocusFirstCollectionCard
            snapshot={collectionSnap}
            attentionScope={attentionScope}
            launchSummary={collectionLaunchSummary}
            departmentContextName={deptContext?.name}
            collectionComplete={collectionComplete}
            collectionJustCompleted={collectionJustCompleted}
            onScrollToTable={onScrollToTable}
            onCollectionComplete={onCollectionComplete}
            onViewResults={onViewResults}
            onStartUpskilling={onStartUpskilling}
            upskillingActive={upskillingActive}
            upskillingLaunchSummary={boardUpskillingLaunchSummary}
            isHrbp={isHrbp}
            hrbpPlansCreated={hrbpPlansCreated}
            gapPeopleOverride={gapPeopleOverride}
            onAddDepartments={collectionComplete ? undefined : () => {
              onRequestCloseMetricSheet?.()
              onLaunchOpenChange(true)
            }}
          />
        ) : hrbpDelegationPending ? (
          <div className="wfr-ra-card">
            <div className="wfr-ra-card__header">
              <span className="wfr-ra-card__eyebrow" style={{ color: '#dc2626' }}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>flag</span> First priority</span>
            </div>
            <div className="wfr-ra-card__cta-row">
              <div>
                <p className="wfr-ra-card__cta-text">
                  {delegatorName ?? 'The CHRO'} has kicked off AI data collection for your team. Launch collection to sharpen adoption scores and surface upskilling priorities for your people.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                className="wfr-ra-card__cta-btn shrink-0"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onRequestCloseMetricSheet?.()
                  onLaunchOpenChange(true)
                }}
              >
                Get started&nbsp;→
              </Button>
            </div>
          </div>
        ) : chroDelegationActive ? (
          <div className="wfr-ra-card wfr-ra-card--warn">
            <div className="wfr-ra-card__header">
              <span className="wfr-ra-card__eyebrow" style={{ color: '#d97706' }}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>sync</span> Delegation sent</span>
            </div>
            <div className="wfr-ra-card__cta-row">
              <div>
                <p className="wfr-ra-card__cta-text">
                  Data collection has been delegated to <strong>{chroDelegationScopeLabel ?? 'HRBPs'}</strong>. Waiting for them to launch collection for their teams.
                </p>
                <p className="wfr-ra-card__hint">
                  Each HRBP will choose when to start — progress will appear here as teams respond.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="wfr-ra-card">
            <div className="wfr-ra-card__header">
              <span className="wfr-ra-card__eyebrow" style={{ color: '#dc2626' }}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>flag</span> First priority</span>
            </div>
            <div className="wfr-ra-card__cta-row">
              <div>
                <p className="wfr-ra-card__cta-text">
                  {'AI Adoption'} is estimated today. Collect real data to see what&apos;s actually happening.
                </p>
                <p className="wfr-ra-card__hint">
                  Choose departments and a collection method — results refine your {'adoption scores'} and surface upskilling priorities.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                className="wfr-ra-card__cta-btn shrink-0"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onRequestCloseMetricSheet?.()
                  onLaunchOpenChange(true)
                }}
              >
                Get started&nbsp;→
              </Button>
            </div>
          </div>
        )}
      </div>

      {!suppressInternalDialog && (
        <FocusFirstLaunchDialog
          open={launchOpen}
          onOpenChange={(next) => {
            onLaunchOpenChange(next)
            if (next) onRequestCloseMetricSheet?.()
          }}
          onLaunch={(summary) => onCollectionActiveChange(true, summary)}
          defaultScopeDepartmentName={deptContext?.name}
          hrbpMode={hrbpDelegationPending}
          hrbpDirectors={hrbpDirectors}
          onHrbpLaunch={(channelsLabel) => {
            onHrbpCollectionLaunch?.(channelsLabel)
            onLaunchOpenChange(false)
          }}
        />
      )}
    </>
  )
}

/** Focus first: pre-launch CTA, post-launch collection progress, launch dialog (board), or collecting-only strip (drill-down). */
export function FocusFirstModule(props: FocusFirstModuleProps) {
  if (props.mode === 'collecting') {
    return (
      <FocusFirstModuleCollecting
        snapshot={props.snapshot}
        attentionScope={props.attentionScope}
        collectionLaunchSummary={props.collectionLaunchSummary}
        departmentContextName={props.departmentContextName}
      />
    )
  }

  const {
    collectionActive,
    collectionComplete,
    collectionJustCompleted,
    onCollectionActiveChange,
    onCollectionComplete,
    onViewResults,
    launchOpen,
    onLaunchOpenChange,
    onRequestCloseMetricSheet,
    deptContext,
    collectionLaunchSummary,
    onScrollToTable,
    onStartUpskilling,
    upskillingActive,
    upskillingLaunchSummary: propsUpskillingLaunchSummary,
    isHrbp: propsIsHrbp,
    hrbpPlansCreated: propsHrbpPlansCreated,
    hrbpDelegationPending: propsHrbpDelegationPending,
    onHrbpCollectionLaunch: propsOnHrbpCollectionLaunch,
    delegatorName: propsDelegatorName,
    delegationDeptName: propsDelegationDeptName,
    chroDelegationActive: propsChroDelegationActive,
    chroDelegationScopeLabel: propsChroDelegationScopeLabel,
    gapPeopleOverride: propsGapPeopleOverride,
    suppressInternalDialog: propsSuppressInternalDialog,
    justLaunched: propsJustLaunched,
    suppressCard: propsSuppressCard,
  } = props

  return (
    <FocusFirstModuleBoard
      collectionActive={collectionActive}
      collectionComplete={collectionComplete}
      collectionJustCompleted={collectionJustCompleted}
      onCollectionActiveChange={onCollectionActiveChange}
      onCollectionComplete={onCollectionComplete}
      onViewResults={onViewResults}
      launchOpen={launchOpen}
      onLaunchOpenChange={onLaunchOpenChange}
      onRequestCloseMetricSheet={onRequestCloseMetricSheet}
      deptContext={deptContext}
      collectionLaunchSummary={collectionLaunchSummary}
      onScrollToTable={onScrollToTable}
      onStartUpskilling={onStartUpskilling}
      upskillingActive={upskillingActive}
      upskillingLaunchSummary={propsUpskillingLaunchSummary}
      isHrbp={propsIsHrbp}
      hrbpPlansCreated={propsHrbpPlansCreated}
      hrbpDelegationPending={propsHrbpDelegationPending}
      onHrbpCollectionLaunch={propsOnHrbpCollectionLaunch}
      delegatorName={propsDelegatorName}
      delegationDeptName={propsDelegationDeptName}
      chroDelegationActive={propsChroDelegationActive}
      chroDelegationScopeLabel={propsChroDelegationScopeLabel}
      gapPeopleOverride={propsGapPeopleOverride}
      suppressInternalDialog={propsSuppressInternalDialog}
      justLaunched={propsJustLaunched}
      suppressCard={propsSuppressCard}
    />
  )
}

// ── Hero CTA bar — shared between WfrHeroOptionsPage and the live dashboard ───

export type WfrDemoState = 1 | '1b' | 2 | 3 | 4 | 5 | 6
export type WfrPersona = 'chro' | 'hrbp' | 'manager'

export interface WfrCtaBarContent {
  icon: string
  label: string | null
  hint: string
  buttonLabel: string | null
  buttonVariant: 'primary' | 'secondary'
  accent: string
  progress?: number
  /** Small result chips shown below the progress bar */
  stats?: { label: string; value: string }[]
  /** Extra outline buttons rendered before the primary button */
  outlineButtons?: string[]
  /** For the What's next dialog: how many steps are already complete (0–4) */
  whatsNextCompletedSteps?: number
  /** For the What's next dialog: is the current active step in progress (vs just upcoming) */
  whatsNextInProgress?: boolean
}

const RED    = 'rgba(185,28,28,0.55)'
const YELLOW = 'var(--color-orange-80)'
const GREEN  = 'rgba(21,128,61,0.35)'
const BLUE   = 'rgba(59,91,219,0.35)'

export const WFR_CTA_CONTENT: Record<WfrDemoState, Record<WfrPersona, WfrCtaBarContent>> = {
  1: {
    chro: {
      icon: 'flag',
      label: 'AI adoption is estimated today — collect real data to see what\'s actually happening.',
      hint: 'Choose departments to refine adoption scores and surface upskilling priorities.',
      buttonLabel: 'Get started →',
      buttonVariant: 'primary',
      accent: RED,
    },
    hrbp: {
      icon: 'insights',
      label: 'Review estimated AI adoption across your team.',
      hint: 'Your CHRO has visibility into org-wide scores — explore your team\'s data below.',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: BLUE,
    },
    manager: {
      icon: 'insights',
      label: 'AI adoption scores for your team are based on estimates.',
      hint: 'Scores will improve once data collection runs across your organization.',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: BLUE,
    },
  },
  '1b': {
    chro: {
      icon: 'send',
      label: 'Data collection delegated to HRBPs — waiting for them to launch.',
      hint: 'Jaydon Torff and 2 other HRBPs have been assigned. Track their progress below.',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: YELLOW,
      outlineButtons: ['What\'s next'],
      whatsNextCompletedSteps: 0,
      whatsNextInProgress: false,
    },
    hrbp: {
      icon: 'flag',
      label: 'Your CHRO has kicked off AI data collection for your team.',
      hint: 'Launch collection to sharpen adoption scores and surface upskilling priorities for your people.',
      buttonLabel: 'Launch collection →',
      buttonVariant: 'primary',
      accent: RED,
    },
    manager: {
      icon: 'insights',
      label: 'AI adoption scores for your team are based on estimates.',
      hint: 'Your HRBP will be running data collection soon to refine these scores.',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: BLUE,
    },
  },
  2: {
    chro: {
      icon: 'sync',
      label: 'Jaydon Torff\'s collection is underway — survey responses are rolling in.',
      hint: '34 of 96 sampled · 35% response rate',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: YELLOW,
      progress: 35,
      outlineButtons: ['What\'s next'],
      whatsNextCompletedSteps: 0,
      whatsNextInProgress: true,
    },
    hrbp: {
      icon: 'sync',
      label: 'Your collection is underway — survey responses are rolling in.',
      hint: '34 of 96 sampled · 35% response rate',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: YELLOW,
      progress: 35,
    },
    manager: {
      icon: 'sync',
      label: 'Your team is being surveyed — responses are rolling in.',
      hint: '12 of 28 sampled · 43% response rate',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: YELLOW,
      progress: 43,
    },
  },
  3: {
    chro: {
      icon: 'check_circle',
      label: 'Collection complete — HRBPs will now build AI-powered dev plans for 5,749 employees.',
      hint: 'Each HRBP uses AI to generate role-specific development plans tailored to their team\'s gaps.',
      buttonLabel: 'What\'s next?',
      buttonVariant: 'secondary',
      accent: GREEN,
      progress: 100,
    },
    hrbp: {
      icon: 'check_circle',
      label: 'Collection complete — ready to upskill 1,985 employees across your teams.',
      hint: 'Assign development plans to your client managers so they can enroll their teams.',
      buttonLabel: 'Start upskilling →',
      buttonVariant: 'primary',
      accent: GREEN,
      progress: 100,
    },
    manager: {
      icon: 'check_circle',
      label: 'Collection complete — development plans are being prepared for your team.',
      hint: 'Your HRBP will assign plans to you shortly. You\'ll be notified when they\'re ready.',
      buttonLabel: 'What\'s next?',
      buttonVariant: 'secondary',
      accent: GREEN,
      progress: 100,
    },
  },
  4: {
    chro: {
      icon: 'rocket_launch',
      label: 'HRBPs are creating development plans for 5,749 employees across 17 departments.',
      hint: '0 of 3 HRBPs have created development plans.',
      buttonLabel: 'What\'s next?',
      buttonVariant: 'secondary',
      accent: YELLOW,
      progress: 0,
      whatsNextCompletedSteps: 2,
      whatsNextInProgress: true,
    },
    hrbp: {
      icon: 'rocket_launch',
      label: 'You\'ve created development plans for 1,985 employees across 3 client managers.',
      hint: '0 of 3 client managers have reviewed and assigned plans to their teams.',
      buttonLabel: 'What\'s next?',
      buttonVariant: 'secondary',
      accent: YELLOW,
      progress: 0,
      whatsNextCompletedSteps: 2,
      whatsNextInProgress: true,
    },
    manager: {
      icon: 'assignment_turned_in',
      label: '18 development plans have been created for AI upskilling across your team.',
      hint: 'Review each plan and assign to employees to get started. Adoption scores will update as employees complete their plans.',
      buttonLabel: 'Assign plans',
      buttonVariant: 'primary',
      accent: RED,
    },
  },
  5: {
    chro: {
      icon: 'rocket_launch',
      label: 'Upskilling is underway — 5,749 employees are working through their development plans.',
      hint: 'Adoption scores will update each quarter as employees complete their plans.',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: YELLOW,
      progress: 42,
      stats: [
        { label: 'Plans assigned', value: '5,749 of 5,749' },
        { label: 'HRBPs active', value: '3 of 3' },
      ],
    },
    hrbp: {
      icon: 'rocket_launch',
      label: 'Upskilling is underway — your employees are working through their development plans.',
      hint: 'Adoption scores will update each quarter as employees complete their plans.',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: YELLOW,
      progress: 45,
      stats: [
        { label: 'Plans assigned', value: '1,985 of 1,985' },
        { label: 'Managers active', value: '3 of 3' },
      ],
    },
    manager: {
      icon: 'rocket_launch',
      label: 'Upskilling is underway — your team is working through their development plans.',
      hint: 'Adoption scores will update each quarter as employees complete their plans.',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: YELLOW,
      progress: 50,
      stats: [
        { label: 'Plans assigned', value: '18 of 18' },
        { label: 'In progress', value: '9 of 18' },
      ],
    },
  },
  6: {
    chro: {
      icon: 'check_circle',
      label: 'Upskilling complete',
      hint: 'Re-survey to track continued improvement.',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: GREEN,
      progress: 100,
      stats: [
        { label: 'Plans completed', value: '5,749 of 5,749' },
        { label: 'Adoption lift', value: '+12pt' },
      ],
    },
    hrbp: {
      icon: 'check_circle',
      label: 'Upskilling complete',
      hint: 'Re-survey to track continued improvement.',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: GREEN,
      progress: 100,
      stats: [
        { label: 'Plans completed', value: '1,985 of 1,985' },
        { label: 'Adoption lift', value: '+14pt' },
      ],
    },
    manager: {
      icon: 'check_circle',
      label: 'Upskilling complete',
      hint: 'Adoption scores will update next quarter.',
      buttonLabel: null,
      buttonVariant: 'secondary',
      accent: GREEN,
      progress: 100,
      stats: [
        { label: 'Plans completed', value: '18 of 18' },
        { label: 'Adoption lift', value: '+16pt' },
      ],
    },
  },
}

const WHATS_NEXT_STEPS = [
  {
    icon: 'sensors',
    color: '#6366f1',
    title: 'Measure real adoption',
    body: 'AI agents run short 3-minute surveys with a statistical sample of employees in augmentable roles. Results come in over 3–5 business days.',
  },
  {
    icon: 'analytics',
    color: '#0ea5e9',
    title: 'Replace estimates with data',
    body: 'Measured adoption scores replace skill-profile estimates. You\'ll see which roles, teams, and departments are ahead — and which need support.',
  },
  {
    icon: 'school',
    color: '#f59e0b',
    title: 'Assign development plans',
    body: 'HRBPs assign role-specific learning paths from the Degreed catalog. Each employee gets a plan mapped to the AI tasks in their role.',
  },
  {
    icon: 'trending_up',
    color: '#22c55e',
    title: 'Track improvement each quarter',
    body: 'Readiness scores update every quarter as employees complete training and adopt AI in their workflows. The gap closes over time.',
  },
]

function WfrWhatsNextDialog({ open, onOpenChange, completedSteps = 0, inProgress = false }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  completedSteps?: number
  inProgress?: boolean
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          position: 'fixed', inset: 0, zIndex: 110000,
          background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)',
        }} />
        <Dialog.Content style={{
          position: 'fixed', left: '50%', top: '50%', zIndex: 110001,
          transform: 'translate(-50%,-50%)',
          width: 'min(560px, calc(100vw - 32px))',
          borderRadius: 16, background: '#fff', padding: 0,
          boxShadow: '0 24px 48px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.06)',
          fontFamily: 'var(--font-family)',
          outline: 'none',
        }}>
          {/* Header */}
          <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <Dialog.Title style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
              What happens next
            </Dialog.Title>
            <Dialog.Description style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
              From data collection to a fully upskilled workforce — here's the full process.
            </Dialog.Description>
          </div>

          {/* Steps */}
          <div style={{ padding: '20px 28px 8px', display: 'flex', flexDirection: 'column' }}>
            {WHATS_NEXT_STEPS.map((step, i) => {
              const isDone = i < completedSteps
              const isActive = i === completedSteps
              const isUpcoming = i > completedSteps
              const connectorDone = i < completedSteps - 1 || (i === completedSteps - 1 && !isActive)
              return (
                <div key={i} style={{ display: 'flex', gap: 16, opacity: isUpcoming && completedSteps > 0 ? 0.45 : 1 }}>
                  {/* Icon + connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 40 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: isDone ? '#f0fdf4' : isActive ? `${step.color}18` : '#f8fafc',
                      border: isActive ? `2px solid ${step.color}40` : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isDone
                        ? <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#22c55e', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        : <span className="material-symbols-outlined" style={{ fontSize: 20, color: isUpcoming ? '#94a3b8' : step.color }}>{step.icon}</span>
                      }
                    </div>
                    {i < WHATS_NEXT_STEPS.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 20, background: connectorDone ? '#22c55e' : '#e2e8f0', margin: '4px 0' }} />
                    )}
                  </div>
                  {/* Text */}
                  <div style={{ paddingBottom: i < WHATS_NEXT_STEPS.length - 1 ? 20 : 0, paddingTop: 8, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: isDone ? '#64748b' : '#0f172a', lineHeight: 1.4, textDecoration: isDone ? 'line-through' : 'none' }}>{step.title}</p>
                      {isActive && (
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', padding: '2px 8px', borderRadius: 20, background: inProgress ? `${step.color}18` : '#f1f5f9', color: inProgress ? step.color : '#64748b' }}>
                          {inProgress ? 'In progress' : 'Up next'}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{step.body}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 28px 24px', display: 'flex', justifyContent: 'flex-end' }}>
            <Dialog.Close asChild>
              <Button type="button" variant="primary">Got it</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function WfrCtaBar({ content, onButtonClick, onBarClick }: { content: WfrCtaBarContent; onButtonClick?: () => void; onBarClick?: () => void }) {
  // displayedProgress drives the bar width. Starts at 0 on each content change,
  // then animates to the target value (or 100 when the user clicks to simulate completion).
  const [displayedProgress, setDisplayedProgress] = useState<number | undefined>(undefined)
  const [whatsNextOpen, setWhatsNextOpen] = useState(false)

  useEffect(() => {
    if (content.progress === undefined) { setDisplayedProgress(undefined); return }
    setDisplayedProgress(0)
    const t = setTimeout(() => setDisplayedProgress(content.progress), 50)
    return () => clearTimeout(t)
  }, [content])

  const handleBarClick = onBarClick ? () => {
    if (displayedProgress === 100) return
    setDisplayedProgress(100)
    setTimeout(() => onBarClick(), 1200)
  } : undefined

  return (
    <div
      role={handleBarClick ? 'button' : undefined}
      tabIndex={handleBarClick ? 0 : undefined}
      onClick={handleBarClick}
      style={{
        background: content.accent,
        padding: '18px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        cursor: handleBarClick ? 'pointer' : undefined,
      }}
    >
      <div style={{
        flexShrink: 0, width: 40, height: 40, borderRadius: 10,
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#fff' }}>{content.icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {content.label && <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 4px', lineHeight: 1.4 }}>{content.label}</p>}
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>{content.hint}</p>
        {displayedProgress !== undefined && (
          <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', overflow: 'hidden', maxWidth: 220 }}>
            <div style={{ height: '100%', width: `${displayedProgress}%`, background: displayedProgress === 100 ? '#22c55e' : '#fbbf24', borderRadius: 2, transition: 'width 0.9s ease' }} />
          </div>
        )}
        {content.stats && content.stats.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
            {content.stats.map((stat, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: '4px 10px', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{stat.label}</span>
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {content.outlineButtons && content.outlineButtons.map((label, i) => (
        <button key={i} type="button" onClick={(e) => { e.stopPropagation(); setWhatsNextOpen(true) }} style={{ flexShrink: 0, padding: '0 16px', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.5)', background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', height: 36, display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
          {label}
        </button>
      ))}
      <WfrWhatsNextDialog open={whatsNextOpen} onOpenChange={setWhatsNextOpen} completedSteps={content.whatsNextCompletedSteps} inProgress={content.whatsNextInProgress} />
      {content.buttonLabel && (
        content.buttonVariant === 'primary' ? (
          <Button type="button" variant="primary" style={{ flexShrink: 0, background: '#fff', color: '#0f172a', borderColor: 'transparent' }} onClick={onButtonClick}>
            {content.buttonLabel}
          </Button>
        ) : (
          <button type="button" onClick={onButtonClick} style={{ flexShrink: 0, padding: '0 16px', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.5)', background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', height: 36, display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
            {content.buttonLabel}
          </button>
        )
      )}
    </div>
  )
}
