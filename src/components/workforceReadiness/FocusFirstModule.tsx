import { Button } from '@tonyh-2-eightfold/ef-design-system'
import { useCallback, useMemo, useState, type MouseEvent, type ReactNode } from 'react'
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
import type { UpskillingLaunchSummary } from './UpskillingLaunchDialog'

export type { FocusCollectionLaunchSummary }

function focusCollectionUnderwaySubtext(summary: FocusCollectionLaunchSummary): ReactNode {
  if (summary.delegated) {
    return <>This rollout is assigned to HRBPs for <strong>{summary.scopeLabel}</strong>. Delegates will choose the collection method for their teams—survey responses will appear as they configure and launch.</>
  }
  return <>You are running this for <strong>{summary.scopeLabel}</strong>, using <strong>{summary.channelsLabel}</strong> to reach people. Survey responses are rolling in—check back as participation grows.</>
}

function focusCollectionUnderwaySubtextDept(
  deptName: string,
  summary: FocusCollectionLaunchSummary,
  snapshot: WfrDemoCollectionSnapshot,
): ReactNode {
  const here = <>{snapshot.respondedCount.toLocaleString()} of {snapshot.totalEmployees.toLocaleString()} people in <strong>{deptName}</strong> have responded so far</>
  if (summary.delegated) {
    return <>In <strong>{deptName}</strong>, {here}. This department is part of the <strong>{summary.scopeLabel}</strong> rollout—HRBPs own how collection runs in each unit.</>
  }
  return <>In <strong>{deptName}</strong>, {here}. You launched <strong>{summary.scopeLabel}</strong> using <strong>{summary.channelsLabel}</strong>; the bar reflects participation in this department only.</>
}

function focusCollectionUnderwaySubtextDeptNoWizard(
  deptName: string,
  snapshot: WfrDemoCollectionSnapshot,
): ReactNode {
  return <>In <strong>{deptName}</strong>, {snapshot.respondedCount.toLocaleString()} of {snapshot.totalEmployees.toLocaleString()} employees have responded so far. Open details to see employee-level status across departments.</>
}

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
}

/** Shared Focus First card — collecting state or complete state. */
export function FocusFirstCollectionCard({
  snapshot,
  attentionScope = 'org',
  launchSummary = null,
  departmentContextName,
  onAddDepartments,
  collectionComplete = false,
  collectionJustCompleted = false,
  onCollectionComplete,
  onViewResults: _onViewResults,
  onScrollToTable,
  onStartUpskilling,
  upskillingActive = false,
  upskillingLaunchSummary = null,
}: FocusFirstCollectionCardProps) {
  // Animation phases: idle → filling → bell → hold → done
  const [animPhase, setAnimPhase] = useState<'idle' | 'filling' | 'bell' | 'hold'>('idle')
  const handleProgressClick = useCallback(() => {
    if (animPhase !== 'idle' || collectionJustCompleted || collectionComplete) return
    setAnimPhase('filling')
    // Phase 1: bar fills (3s)
    setTimeout(() => {
      setAnimPhase('bell')
      // Phase 2+3: bell rings + hold (3s)
      setTimeout(() => {
        setAnimPhase('idle')
        onCollectionComplete?.()
      }, 3000)
    }, 3000)
  }, [animPhase, collectionJustCompleted, collectionComplete, onCollectionComplete])

  const showAttentionBadge = snapshot.needAttentionDeptCount > 0
  const deptName = departmentContextName
  const subtext: ReactNode =
    attentionScope === 'dept' && deptName
      ? launchSummary
        ? focusCollectionUnderwaySubtextDept(deptName, launchSummary, snapshot)
        : focusCollectionUnderwaySubtextDeptNoWizard(deptName, snapshot)
      : launchSummary
        ? focusCollectionUnderwaySubtext(launchSummary)
        : 'Survey responses are rolling in. Check back as participation grows.'

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

      if (deptHasUpskilling) {
        return (
          <div className="wfr-ra-card wfr-ra-card--warn">
            <div className="wfr-ra-card__header">
              <span className="wfr-ra-card__eyebrow" style={{ color: '#92400e' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>school</span> Upskilling in progress
              </span>
            </div>
            <p className="wfr-ra-card__cta-text">
              <strong>{Math.max(2, Math.round(gapCount / 30))}</strong> development plans in <strong>{currentDept.name}</strong> — <strong>{gapCount.toLocaleString()}</strong> employees enrolled.
            </p>
            <div className="wfr-ra-card__progress" style={{ cursor: 'default' }}>
              <div className="wfr-ra-card__progress-info">
                <span className="wfr-ra-card__progress-pct tabular-nums" style={{ color: '#92400e' }}>{35 + Math.abs((currentDept.name.length * 13) % 30)}%</span>
                <span className="wfr-ra-card__progress-label">plan completion</span>
              </div>
              <div className="wfr-ra-card__track">
                <div className="wfr-ra-card__fill" style={{ width: `${35 + Math.abs((currentDept.name.length * 13) % 30)}%` }} />
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
          <p className="wfr-ra-card__cta-text">
            Upskill <strong>{gapCount.toLocaleString()}</strong> employees — prioritize{' '}
            {topRoles.map((r, i) => (
              <span key={r.title}><strong>{r.title}</strong>{i < topRoles.length - 1 ? (i === topRoles.length - 2 ? ' and ' : ', ') : ''}</span>
            ))}.
          </p>
          <p className="wfr-ra-card__hint">
            Select employees in the table below to create development plans.
          </p>
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
    const nextPriorityDepts = [...remainingDepts]
      .sort((a, b) => (b.aiPotential - b.aiReadiness) - (a.aiPotential - a.aiReadiness))
      .slice(0, 3)
    const remainingGapPeople = remainingDepts.reduce((sum, d) => {
      const augPeople = Math.round((d.employees / ORG.totalEmployees) * ORG.peopleInAugRoles)
      return sum + Math.round(augPeople * (1 - d.aiReadiness / 100))
    }, 0)

    // After upskilling is launched — show progress + option to add more
    if (upskillingActive) {
      const launchedDepts = scopedDepts.filter((d) => upskillingDeptSet.has(d.name))
      const totalPlans = launchedDepts.reduce((sum, d) => sum + Math.max(2, Math.round(deptGapHeadcount(d) / 30)), 0)
      const totalEmployeesInPlans = launchedDepts.reduce((sum, d) => sum + deptGapHeadcount(d), 0)
      // Simulate ~60% completion progress
      const completionPct = Math.min(95, 35 + ((launchedDepts.length * 13) % 30))
      const hasMore = nextPriorityDepts.length > 0

      return (
        <div className="wfr-ra-card wfr-ra-card--warn">
          <div className="wfr-ra-card__header">
            <span className="wfr-ra-card__eyebrow" style={{ color: '#92400e' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>school</span> Upskilling in progress
            </span>
          </div>
          <p className="wfr-ra-card__cta-text">
            <strong>{totalPlans}</strong> development plans across <strong>{launchedDepts.length}</strong> department{launchedDepts.length === 1 ? '' : 's'} — <strong>{totalEmployeesInPlans.toLocaleString()}</strong> employees enrolled.
          </p>
          <div className="wfr-ra-card__progress" style={{ cursor: 'default' }}>
            <div className="wfr-ra-card__progress-info">
              <span className="wfr-ra-card__progress-pct tabular-nums" style={{ color: '#92400e' }}>{completionPct}%</span>
              <span className="wfr-ra-card__progress-label">plan completion</span>
            </div>
            <div className="wfr-ra-card__track">
              <div className="wfr-ra-card__fill" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
          <div className="wfr-ra-card__actions">
            {onScrollToTable ? (
              <button type="button" className="wfr-ra-card__link" onClick={onScrollToTable}>
                View details&nbsp;↓
              </button>
            ) : null}
            {hasMore ? (
              <button type="button" className="wfr-ra-card__link" onClick={onStartUpskilling}>
                Add more departments&nbsp;→
              </button>
            ) : null}
          </div>
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
            <span className="wfr-ra-card__mini-label">
              Sample threshold reached — {scopedDepts.length} department{scopedDepts.length === 1 ? '' : 's'} ready for upskilling
            </span>
          </div>
        </div>
        <div className="wfr-ra-card__cta-row">
          <div>
            <p className="wfr-ra-card__cta-text">
              <strong>{remainingGapPeople.toLocaleString()}</strong> employees need upskilling.
              Prioritize{' '}
              {nextPriorityDepts.map((d, i) => (
                <span key={d.name}><strong>{d.name}</strong>{i < nextPriorityDepts.length - 1 ? (i === nextPriorityDepts.length - 2 ? ' and ' : ', ') : ''}</span>
              ))}.
            </p>
            <p className="wfr-ra-card__hint">Assign development plans to close readiness gaps across these departments.</p>
          </div>
          <Button type="button" variant="primary" className="shrink-0" onClick={onStartUpskilling}>
            Start upskilling&nbsp;→
          </Button>
        </div>
      </div>
    )
  }

  const isFilling = animPhase === 'filling'
  const showBell = animPhase === 'bell' || animPhase === 'hold'
  const isAnimating = animPhase !== 'idle'
  const cardClass = showBell ? 'wfr-ra-card wfr-ra-card--success wfr-ra-card--animate-in' : 'wfr-ra-card wfr-ra-card--warn'

  return (
    <div className={cardClass}>
      <div className="wfr-ra-card__header">
        {showBell ? (
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

      <div
        className="wfr-ra-card__progress"
        onClick={handleProgressClick}
        style={onCollectionComplete && !isAnimating ? { cursor: 'pointer' } : undefined}
        title={onCollectionComplete && !isAnimating ? 'Click to simulate collection complete' : undefined}
      >
        <div className="wfr-ra-card__progress-info">
          <span className="wfr-ra-card__progress-pct tabular-nums" style={showBell ? { color: '#15803d' } : undefined}>
            {isAnimating ? '100' : snapshot.orgResponseRate}%
          </span>
          <span className="wfr-ra-card__progress-label">
            {isAnimating
              ? 'Sample threshold reached!'
              : `${snapshot.respondedCount.toLocaleString()} of ${snapshot.totalEmployees.toLocaleString()} responded${attentionScope === 'dept' && deptName ? ` in ${deptName}` : ''}`
            }
          </span>
        </div>
        <div className="wfr-ra-card__track" style={showBell ? { position: 'relative', overflow: 'visible' } : undefined}>
          <div
            className={`wfr-ra-card__fill${isFilling ? ' wfr-ra-card__fill--animating' : ''}`}
            style={{ width: isAnimating ? '100%' : `${snapshot.orgResponseRate}%` }}
          />
          {showBell ? (
            <div className="wfr-ra-card__bell-wrap">
              <span className="material-symbols-outlined wfr-ra-card__bell-icon">notifications_active</span>
            </div>
          ) : null}
        </div>
      </div>

      {showBell ? (
        <p className="wfr-ra-card__sub" style={{ color: '#15803d' }}>
          Enough responses are in for statistically accurate results. Preparing upskilling priorities…
        </p>
      ) : (
        <p className="wfr-ra-card__sub">{subtext}</p>
      )}

      <div className="wfr-ra-card__actions">
        {onScrollToTable ? (
          <button type="button" className="wfr-ra-card__link" onClick={onScrollToTable}>
            View details&nbsp;↓
          </button>
        ) : null}
        {onAddDepartments ? (
          <button type="button" className="wfr-ra-card__link" onClick={onAddDepartments}>
            Add more departments&nbsp;→
          </button>
        ) : null}
      </div>
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
}: Omit<FocusFirstModuleBoardProps, 'mode'>) {
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

  return (
    <>
      <div className="wfr-dash__focus-module">
        {collectionActive ? (
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
            onAddDepartments={collectionComplete ? undefined : () => {
              onRequestCloseMetricSheet?.()
              onLaunchOpenChange(true)
            }}
          />
        ) : (
          <div className="wfr-ra-card">
            <div className="wfr-ra-card__header">
              <span className="wfr-ra-card__eyebrow" style={{ color: '#dc2626' }}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>flag</span> First priority</span>
            </div>
            <div className="wfr-ra-card__cta-row">
              <div>
                <p className="wfr-ra-card__cta-text">
                  Your readiness score gets sharper when employees weigh in. Let&apos;s collect that data.
                </p>
                <p className="wfr-ra-card__hint">
                  Choose departments and a collection method — results refine your readiness scores and surface upskilling priorities.
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

      <FocusFirstLaunchDialog
        open={launchOpen}
        onOpenChange={(next) => {
          onLaunchOpenChange(next)
          if (next) onRequestCloseMetricSheet?.()
        }}
        onLaunch={(summary) => onCollectionActiveChange(true, summary)}
        defaultScopeDepartmentName={deptContext?.name}
      />
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
    />
  )
}
