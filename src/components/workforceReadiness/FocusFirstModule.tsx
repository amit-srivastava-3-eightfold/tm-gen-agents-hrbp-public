import { Button } from '@tonyh-2-eightfold/ef-design-system'
import { useMemo, type MouseEvent, type ReactNode } from 'react'
import {
  departments,
  ORG,
  getRolesForDept,
  deptPeopleInAugRoles,
  deptGapHeadcount,
  wfrDemoCollectionSnapshot,
  wfrDemoCollectionSnapshotForDeptNames,
  wfrDemoDeptCollectionSnapshot,
  type Dept,
  type WfrDemoCollectionSnapshot,
} from '../../data/wfrOrgData'
import { FocusFirstLaunchDialog, type FocusCollectionLaunchSummary } from './FocusFirstLaunchDialog'

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
  /** Called when user clicks the progress bar to simulate completion. */
  onCollectionComplete?: () => void
}

/** Shared Focus First card — collecting state or complete state. */
export function FocusFirstCollectionCard({
  snapshot,
  attentionScope = 'org',
  launchSummary = null,
  departmentContextName,
  onAddDepartments,
  collectionComplete = false,
  onCollectionComplete,
}: FocusFirstCollectionCardProps) {
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

  if (collectionComplete) {
    const isDeptView = !!deptName
    const currentDept = isDeptView ? departments.find((d) => d.name === deptName) : null

    if (isDeptView && currentDept) {
      // Dept-scoped complete state: only reference this department
      const roles = getRolesForDept(currentDept.name)
      const augPeople = deptPeopleInAugRoles(currentDept)
      const gapCount = deptGapHeadcount(currentDept)
      const measuredReadiness = currentDept.aiReadiness + 8 // simulate post-collection bump
      const topRoles = [...roles]
        .sort((a, b) => {
          const gapA = a.aiPotential - a.aiReadiness
          const gapB = b.aiPotential - b.aiReadiness
          return gapB - gapA
        })
        .slice(0, 3)

      return (
        <div className="wfr-dash__focus-card">
          <div className="wfr-dash__focus-card-head">
            <div className="wfr-dash__focus-card-icon-wrap" aria-hidden>
              <span className="material-symbols-outlined wfr-dash__focus-card-icon">trending_up</span>
            </div>
            <span className="wfr-dash__focus-card-label wfr-dash__focus-module-eyebrow wfr-dash__focus-module-eyebrow--success">
              Recommended actions
            </span>
          </div>
          <div className="wfr-dash__focus-collecting__top">
            <h3 className="wfr-dash__focus-collecting__title">
              {currentDept.name} readiness up to {measuredReadiness}% — {gapCount.toLocaleString()} employees still in the gap
            </h3>
            <p className="wfr-dash__focus-collecting__sub">
              Survey data shows <strong>{currentDept.name}</strong> measured readiness at <strong>{measuredReadiness}%</strong>, up from the{' '}
              <strong>{currentDept.aiReadiness}%</strong> estimate.{' '}
              {augPeople.toLocaleString()} employees are in augmentable roles.
              Focus upskilling on these roles first:
            </p>
          </div>
          <div className="wfr-dash__focus-priorities">
            {topRoles.map((r) => {
              const gap = r.aiPotential - r.aiReadiness
              const roleGapCount = Math.round(r.employees * (1 - r.aiReadiness / 100))
              return (
                <div key={r.title} className="wfr-dash__focus-priority-card">
                  <div className="wfr-dash__focus-priority-card-header">
                    <span className="wfr-dash__focus-priority-card-name">{r.title}</span>
                    <span className="wfr-dash__focus-priority-card-gap">{gap}pt gap</span>
                  </div>
                  <div className="wfr-dash__focus-priority-card-stats">
                    <div className="wfr-dash__focus-priority-card-stat">
                      <span className="wfr-dash__focus-priority-card-stat-val">{r.aiReadiness}%</span>
                      <span className="wfr-dash__focus-priority-card-stat-label">readiness</span>
                    </div>
                    <span className="wfr-dash__focus-priority-card-arrow">→</span>
                    <div className="wfr-dash__focus-priority-card-stat">
                      <span className="wfr-dash__focus-priority-card-stat-val">{r.aiPotential}%</span>
                      <span className="wfr-dash__focus-priority-card-stat-label">potential</span>
                    </div>
                    <div className="wfr-dash__focus-priority-card-stat wfr-dash__focus-priority-card-stat--people">
                      <span className="wfr-dash__focus-priority-card-stat-val">{roleGapCount.toLocaleString()}</span>
                      <span className="wfr-dash__focus-priority-card-stat-label">to upskill</span>
                    </div>
                  </div>
                  <button type="button" className="wfr-dash__focus-priority-card-cta">
                    View plan&nbsp;→
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Org-level complete state: show top departments
    const scopedNames = launchSummary?.scopedDepartmentNames ?? []
    const scopedDepts = scopedNames.length
      ? departments.filter((d) => scopedNames.includes(d.name))
      : departments
    // Top 3 departments by gap (potential − readiness)
    const topGapDepts = [...scopedDepts]
      .sort((a, b) => (b.aiPotential - b.aiReadiness) - (a.aiPotential - a.aiReadiness))
      .slice(0, 3)
    const gapPeople = Math.round(ORG.peopleInAugRoles * (1 - ORG.aiReadiness / 100))
    const hrsUnlocked = gapPeople * ORG.hrsPerPersonWeek
    const measuredReadiness = ORG.aiReadiness + 11 // simulate post-collection bump (estimated 24% → measured 35%)

    return (
      <div className="wfr-dash__focus-card">
        <div className="wfr-dash__focus-card-head">
          <div className="wfr-dash__focus-card-icon-wrap" aria-hidden>
            <span className="material-symbols-outlined wfr-dash__focus-card-icon">trending_up</span>
          </div>
          <span className="wfr-dash__focus-card-label wfr-dash__focus-module-eyebrow wfr-dash__focus-module-eyebrow--success">
            Recommended actions
          </span>
        </div>
        <div className="wfr-dash__focus-collecting__top">
          <h3 className="wfr-dash__focus-collecting__title">
            Readiness up to {measuredReadiness}% — {gapPeople.toLocaleString()} employees still in the gap
          </h3>
          <p className="wfr-dash__focus-collecting__sub">
            Survey data shows measured readiness at <strong>{measuredReadiness}%</strong>, up from the{' '}
            <strong>{ORG.aiReadiness}%</strong> estimate.{' '}
            Closing the gap unlocks an estimated <strong>{hrsUnlocked.toLocaleString()} hours/week</strong> of productivity.
            Focus upskilling on these departments first:
          </p>
        </div>
        <div className="wfr-dash__focus-priorities">
          {topGapDepts.map((d) => {
            const gap = d.aiPotential - d.aiReadiness
            const gapCount = Math.round(d.employees * (1 - d.aiReadiness / 100))
            return (
              <div key={d.name} className="wfr-dash__focus-priority-card">
                <div className="wfr-dash__focus-priority-card-header">
                  <span className="wfr-dash__focus-priority-card-name">{d.name}</span>
                  <span className="wfr-dash__focus-priority-card-gap">{gap}pt gap</span>
                </div>
                <div className="wfr-dash__focus-priority-card-stats">
                  <div className="wfr-dash__focus-priority-card-stat">
                    <span className="wfr-dash__focus-priority-card-stat-val">{d.aiReadiness}%</span>
                    <span className="wfr-dash__focus-priority-card-stat-label">readiness</span>
                  </div>
                  <span className="wfr-dash__focus-priority-card-arrow">→</span>
                  <div className="wfr-dash__focus-priority-card-stat">
                    <span className="wfr-dash__focus-priority-card-stat-val">{d.aiPotential}%</span>
                    <span className="wfr-dash__focus-priority-card-stat-label">potential</span>
                  </div>
                  <div className="wfr-dash__focus-priority-card-stat wfr-dash__focus-priority-card-stat--people">
                    <span className="wfr-dash__focus-priority-card-stat-val">{gapCount.toLocaleString()}</span>
                    <span className="wfr-dash__focus-priority-card-stat-label">to upskill</span>
                  </div>
                </div>
                <button type="button" className="wfr-dash__focus-priority-card-cta">
                  View plan&nbsp;→
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="wfr-dash__focus-card">
      <div className="wfr-dash__focus-card-head">
        <div className="wfr-dash__focus-card-icon-wrap" aria-hidden>
          <span className="material-symbols-outlined wfr-dash__focus-card-icon">priority_high</span>
        </div>
        <span className="wfr-dash__focus-card-label wfr-dash__focus-module-eyebrow wfr-dash__focus-module-eyebrow--alert">
          Recommended actions
        </span>
      </div>
      <div className="wfr-dash__focus-collecting__top">
        <div className="wfr-dash__focus-collecting__title-row">
          <h3 className="wfr-dash__focus-collecting__title">Data collection is underway</h3>
          {showAttentionBadge ? (
            <span className="wfr-dash__focus-collecting__badge">
              {attentionScope === 'dept'
                ? 'This department needs attention'
                : `${snapshot.needAttentionDeptCount} department${snapshot.needAttentionDeptCount === 1 ? '' : 's'} need attention`}
            </span>
          ) : null}
        </div>
        <p className="wfr-dash__focus-collecting__sub">{subtext}</p>
      </div>
      <div
        className="wfr-dash__focus-collecting__bar-row"
        onClick={onCollectionComplete}
        style={onCollectionComplete ? { cursor: 'pointer' } : undefined}
        title={onCollectionComplete ? 'Click to simulate collection complete' : undefined}
      >
        <div className="wfr-dash__focus-collecting__track" aria-hidden>
          <div
            className="wfr-dash__focus-collecting__fill"
            style={{ width: `${snapshot.orgResponseRate}%` }}
          />
        </div>
        <span className="wfr-dash__focus-collecting__pct tabular-nums">{snapshot.orgResponseRate}%</span>
      </div>
      <div className="wfr-dash__focus-collecting__foot">
        <p className="wfr-dash__focus-collecting__status">
          {snapshot.respondedCount.toLocaleString()} of {snapshot.totalEmployees.toLocaleString()} employees have responded
          {attentionScope === 'dept' && deptName ? ` in ${deptName}` : ''}
        </p>
        {onAddDepartments ? (
          <button type="button" className="wfr-dash__focus-collecting__link" onClick={onAddDepartments}>
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
  onCollectionActiveChange: (active: boolean, launchSummary?: FocusCollectionLaunchSummary | null) => void
  onCollectionComplete?: () => void
  launchOpen: boolean
  onLaunchOpenChange: (open: boolean) => void
  onRequestCloseMetricSheet?: () => void
  /** When set, collecting state shows this department's response snapshot and dept attention copy. */
  deptContext?: Dept
  /** Last completed launch; used for underway subtext when collection is active. */
  collectionLaunchSummary?: FocusCollectionLaunchSummary | null
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
  onCollectionActiveChange,
  onCollectionComplete,
  launchOpen,
  onLaunchOpenChange,
  onRequestCloseMetricSheet,
  deptContext,
  collectionLaunchSummary,
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
            onCollectionComplete={onCollectionComplete}
            onAddDepartments={collectionComplete ? undefined : () => {
              onRequestCloseMetricSheet?.()
              onLaunchOpenChange(true)
            }}
          />
        ) : (
          <div className="wfr-dash__focus-card">
            <div className="wfr-dash__focus-card-head">
              <div className="wfr-dash__focus-card-icon-wrap" aria-hidden>
                <span className="material-symbols-outlined wfr-dash__focus-card-icon">priority_high</span>
              </div>
              <span className="wfr-dash__focus-card-label wfr-dash__focus-module-eyebrow wfr-dash__focus-module-eyebrow--alert">
                Recommended actions
              </span>
            </div>
            <div className="wfr-dash__focus-card-cta-row">
              <p className="wfr-dash__focus-card-body wfr-dash__focus-card-body--lead">
                Your readiness score gets sharper when employees weigh in. Let&apos;s collect that data.
              </p>
              <Button
                type="button"
                variant="primary"
                className="wfr-dash__focus-card-cta-row__btn shrink-0"
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
    onCollectionActiveChange,
    onCollectionComplete,
    launchOpen,
    onLaunchOpenChange,
    onRequestCloseMetricSheet,
    deptContext,
    collectionLaunchSummary,
  } = props

  return (
    <FocusFirstModuleBoard
      collectionActive={collectionActive}
      collectionComplete={collectionComplete}
      onCollectionActiveChange={onCollectionActiveChange}
      onCollectionComplete={onCollectionComplete}
      launchOpen={launchOpen}
      onLaunchOpenChange={onLaunchOpenChange}
      onRequestCloseMetricSheet={onRequestCloseMetricSheet}
      deptContext={deptContext}
      collectionLaunchSummary={collectionLaunchSummary}
    />
  )
}
