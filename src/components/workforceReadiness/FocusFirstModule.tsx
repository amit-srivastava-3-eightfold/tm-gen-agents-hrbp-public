import { Button } from '@tonyh-2-eightfold/ef-design-system'
import { useCallback, useMemo, useState, type MouseEvent } from 'react'
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
  /** When true, the internal FocusFirstLaunchDialog is not rendered (parent handles the dialog) */
  suppressInternalDialog?: boolean
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
  delegationDeptName,
  chroDelegationActive = false,
  chroDelegationScopeLabel,
  gapPeopleOverride,
  suppressInternalDialog = false,
}: Omit<FocusFirstModuleBoardProps, 'mode'> & {
  hrbpDelegationPending?: boolean
  onHrbpCollectionLaunch?: (channelsLabel: string) => void
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
    if (deptContext) return wfrDemoDeptCollectionSnapshot(deptContext)
    return orgCollectionSnap
  }, [deptContext, orgCollectionSnap])
  const attentionScope: FocusFirstCollectionAttentionScope = deptContext ? 'dept' : 'org'

  // CHRO: hide entire RA module when upskilling is done (plans assigned org-wide)
  if (!isHrbp && hrbpPlansCreated) {
    return null
  }

  // HRBP: hide CTA in state 1 (no delegation pending) — they can't launch collection themselves
  // But allow through when collection is complete (state 3 CTA) or upskilling active
  if (isHrbp && !collectionActive && !hrbpDelegationPending && !collectionComplete) {
    return null
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
              <span className="wfr-ra-card__eyebrow" style={{ color: '#d97706' }}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>assignment_ind</span> Delegated to you</span>
            </div>
            <div className="wfr-ra-card__cta-row">
              <div>
                <p className="wfr-ra-card__cta-text">
                  {delegatorName ?? 'The CHRO'} has delegated AI data collection for <strong>{delegationDeptName ?? 'your department'}</strong> to you.
                </p>
                <p className="wfr-ra-card__hint">
                  Select a collection method and get started — results will refine adoption scores and surface upskilling priorities.
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
    />
  )
}
