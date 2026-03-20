import { Button } from '@tonyh-2-eightfold/ef-design-system'
import { useMemo, type MouseEvent } from 'react'
import {
  wfrDemoCollectionSnapshot,
  wfrDemoDeptCollectionSnapshot,
  type Dept,
  type WfrDemoCollectionSnapshot,
} from '../../data/wfrOrgData'
import { FocusFirstLaunchDialog, type FocusCollectionLaunchSummary } from './FocusFirstLaunchDialog'

export type { FocusCollectionLaunchSummary }

function focusCollectionUnderwaySubtext(summary: FocusCollectionLaunchSummary): string {
  if (summary.delegated) {
    return `This rollout is assigned to HRBPs for ${summary.scopeLabel}. Delegates will choose the collection method for their teams—survey responses will appear as they configure and launch.`
  }
  return `You are running this for ${summary.scopeLabel}, using ${summary.channelsLabel} to reach people. Survey responses are rolling in—check back as participation grows.`
}

function focusCollectionUnderwaySubtextDept(
  deptName: string,
  summary: FocusCollectionLaunchSummary,
  snapshot: WfrDemoCollectionSnapshot,
): string {
  const here = `${snapshot.respondedCount.toLocaleString()} of ${snapshot.totalEmployees.toLocaleString()} people in ${deptName} have responded so far`
  if (summary.delegated) {
    return `In ${deptName}, ${here}. This department is part of the ${summary.scopeLabel} rollout—HRBPs own how collection runs in each unit.`
  }
  return `In ${deptName}, ${here}. You launched ${summary.scopeLabel} using ${summary.channelsLabel}; the bar reflects participation in this department only.`
}

function focusCollectionUnderwaySubtextDeptNoWizard(
  deptName: string,
  snapshot: WfrDemoCollectionSnapshot,
): string {
  return `In ${deptName}, ${snapshot.respondedCount.toLocaleString()} of ${snapshot.totalEmployees.toLocaleString()} employees have responded so far. Open details to see employee-level status across departments.`
}

export type FocusFirstCollectionAttentionScope = 'org' | 'dept'

export interface FocusFirstCollectionCardProps {
  snapshot: WfrDemoCollectionSnapshot
  onViewDetails: () => void
  /** Org: “N departments…”; dept: single-dept attention copy. */
  attentionScope?: FocusFirstCollectionAttentionScope
  /** When set, subtext reflects the launch wizard (Review step) choices. */
  launchSummary?: FocusCollectionLaunchSummary | null
  /** Department name for dept drill-down copy (subtext + foot). */
  departmentContextName?: string
}

/** Shared “Data collection is underway” surface — same Focus First card shell as pre-launch (icon + red eyebrow + gradient). */
export function FocusFirstCollectionCard({
  snapshot,
  onViewDetails,
  attentionScope = 'org',
  launchSummary = null,
  departmentContextName,
}: FocusFirstCollectionCardProps) {
  const showAttentionBadge = snapshot.needAttentionDeptCount > 0
  const deptName = departmentContextName
  const subtext =
    attentionScope === 'dept' && deptName
      ? launchSummary
        ? focusCollectionUnderwaySubtextDept(deptName, launchSummary, snapshot)
        : focusCollectionUnderwaySubtextDeptNoWizard(deptName, snapshot)
      : launchSummary
        ? focusCollectionUnderwaySubtext(launchSummary)
        : 'Survey responses are rolling in. Check back as participation grows.'

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
      <div className="wfr-dash__focus-collecting__bar-row">
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
        <button type="button" className="wfr-dash__focus-collecting__link" onClick={onViewDetails}>
          View details&nbsp;→
        </button>
      </div>
    </div>
  )
}

/** Overview or department drill-down: Get started + launch dialog, or collecting card (org or scoped dept). */
export type FocusFirstModuleBoardProps = {
  mode?: 'board'
  collectionActive: boolean
  onCollectionActiveChange: (active: boolean, launchSummary?: FocusCollectionLaunchSummary | null) => void
  launchOpen: boolean
  onLaunchOpenChange: (open: boolean) => void
  onOpenCollectionDetail: () => void
  onRequestCloseMetricSheet?: () => void
  /** When set, collecting state shows this department’s response snapshot and dept attention copy. */
  deptContext?: Dept
  /** Last completed launch; used for underway subtext when collection is active. */
  collectionLaunchSummary?: FocusCollectionLaunchSummary | null
}

/** Dept / role drill-down: only the collecting card (same module shell as overview). */
export type FocusFirstModuleCollectingProps = {
  mode: 'collecting'
  snapshot: WfrDemoCollectionSnapshot
  attentionScope: FocusFirstCollectionAttentionScope
  onOpenCollectionDetail: () => void
  collectionLaunchSummary?: FocusCollectionLaunchSummary | null
  /** Shown in subtext when attentionScope is dept (e.g. role page). */
  departmentContextName?: string
}

export type FocusFirstModuleProps = FocusFirstModuleBoardProps | FocusFirstModuleCollectingProps

function FocusFirstModuleCollecting({
  snapshot,
  attentionScope,
  onOpenCollectionDetail,
  collectionLaunchSummary,
  departmentContextName,
}: Omit<FocusFirstModuleCollectingProps, 'mode'>) {
  return (
    <div className="wfr-dash__focus-module">
      <FocusFirstCollectionCard
        snapshot={snapshot}
        onViewDetails={onOpenCollectionDetail}
        attentionScope={attentionScope}
        launchSummary={collectionLaunchSummary}
        departmentContextName={departmentContextName}
      />
    </div>
  )
}

function FocusFirstModuleBoard({
  collectionActive,
  onCollectionActiveChange,
  launchOpen,
  onLaunchOpenChange,
  onOpenCollectionDetail,
  onRequestCloseMetricSheet,
  deptContext,
  collectionLaunchSummary,
}: Omit<FocusFirstModuleBoardProps, 'mode'>) {
  const orgCollectionSnap = useMemo(() => wfrDemoCollectionSnapshot(), [])
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
            onViewDetails={onOpenCollectionDetail}
            attentionScope={attentionScope}
            launchSummary={collectionLaunchSummary}
            departmentContextName={deptContext?.name}
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
        onOpenCollectionDetail={props.onOpenCollectionDetail}
        collectionLaunchSummary={props.collectionLaunchSummary}
        departmentContextName={props.departmentContextName}
      />
    )
  }

  const {
    collectionActive,
    onCollectionActiveChange,
    launchOpen,
    onLaunchOpenChange,
    onOpenCollectionDetail,
    onRequestCloseMetricSheet,
    deptContext,
    collectionLaunchSummary,
  } = props

  return (
    <FocusFirstModuleBoard
      collectionActive={collectionActive}
      onCollectionActiveChange={onCollectionActiveChange}
      launchOpen={launchOpen}
      onLaunchOpenChange={onLaunchOpenChange}
      onOpenCollectionDetail={onOpenCollectionDetail}
      onRequestCloseMetricSheet={onRequestCloseMetricSheet}
      deptContext={deptContext}
      collectionLaunchSummary={collectionLaunchSummary}
    />
  )
}
