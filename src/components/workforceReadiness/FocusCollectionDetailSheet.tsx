import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ORG,
  wfrDemoCollectionSnapshot,
  wfrDemoCollectionSnapshotForDeptNames,
  wfrDemoDeptCollectionSnapshot,
  wfrDemoDeptResponseRate,
  type Dept,
} from '../../data/wfrOrgData'
import './FocusCollectionDetailSheet.css'

const BODY_ATTR = 'data-wfr-coll-sheet-open'

const DEMO_MANAGERS = [
  'Priya Thompson',
  'Alex Rivera',
  'Jordan Kim',
  'Sam Okonkwo',
  'Sarah Culhane',
  'Morgan Patel',
  'Casey Nguyen',
  'Taylor Brooks',
]

function deptNameHash(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i)
  return h
}

type WfrCollSheetChannelDemo = {
  key: string
  label: string
  icon: string
  rate: number
}

/** Deterministic demo row chrome (manager, channels, activity). */
function deptCollectionRowDemo(deptName: string) {
  const h = deptNameHash(deptName)
  const activeChannelCount = (1 + (h % 2)) as 1 | 2
  const useHours = h % 5 === 0
  const lastActivityDaysAgo = 1 + (h % 21)
  const lastActivityHoursAgo = 1 + (h % 12)
  const channelsDetail: WfrCollSheetChannelDemo[] =
    activeChannelCount >= 2
      ? [
          {
            key: 'profile',
            label: 'Profile Updates',
            icon: '\u270f\ufe0f',
            rate: Math.min(100, 28 + (h % 55)),
          },
          {
            key: 'survey',
            label: 'Contextual Surveys',
            icon: '\ud83d\udccb',
            rate: Math.min(100, 8 + ((h * 3) % 42)),
          },
        ]
      : []
  return {
    manager: DEMO_MANAGERS[h % DEMO_MANAGERS.length],
    activeChannelCount,
    useHours,
    lastActivityDaysAgo,
    lastActivityHoursAgo,
    channelsDetail,
  }
}

function barColor(rate: number) {
  if (rate >= 70) return '#15803d'
  if (rate >= 30) return 'var(--wfr-potential-text, #6366f1)'
  return '#94a3b8'
}

export function FocusCollectionDetailSheet({
  open,
  onClose,
  /** When set, sheet shows this department only. */
  scopeDepartment = null,
  /**
   * When opening from overview after a scoped launch, limit the department list and summary to these names.
   * Ignored when `scopeDepartment` is set (drill-down uses that dept only).
   */
  launchScopedDepartmentNames = null,
}: {
  open: boolean
  onClose: () => void
  scopeDepartment?: Dept | null
  launchScopedDepartmentNames?: string[] | null
}) {
  useLayoutEffect(() => {
    if (open) document.body.setAttribute(BODY_ATTR, 'true')
    return () => document.body.removeAttribute(BODY_ATTR)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) setChannelsExpanded({})
  }, [open, scopeDepartment?.name, launchScopedDepartmentNames])

  const [channelsExpanded, setChannelsExpanded] = useState<Record<string, boolean>>({})

  const orgSnapFull = useMemo(() => wfrDemoCollectionSnapshot(), [])

  const launchScopeFilter = useMemo(() => {
    if (scopeDepartment || !launchScopedDepartmentNames?.length) return null
    return new Set(launchScopedDepartmentNames)
  }, [scopeDepartment, launchScopedDepartmentNames])

  const orgSnap = useMemo(() => {
    if (launchScopeFilter) {
      return wfrDemoCollectionSnapshotForDeptNames([...launchScopeFilter])
    }
    return orgSnapFull
  }, [launchScopeFilter, orgSnapFull])

  const deptRows = useMemo(() => {
    const depts = launchScopeFilter
      ? ORG.departments.filter((d) => launchScopeFilter.has(d.name))
      : ORG.departments
    const rows = depts.map((d) => ({
      name: d.name,
      employees: d.employees,
      rate: wfrDemoDeptResponseRate(d.name),
    }))
    return rows.sort((a, b) => a.rate - b.rate)
  }, [launchScopeFilter])

  const deptScoped = useMemo(() => {
    if (!scopeDepartment) return null
    const meta = deptCollectionRowDemo(scopeDepartment.name)
    const snap = wfrDemoDeptCollectionSnapshot(scopeDepartment)
    return {
      dept: scopeDepartment,
      meta,
      snap,
      rate: wfrDemoDeptResponseRate(scopeDepartment.name),
    }
  }, [scopeDepartment])

  const deptScopedChannelsExpanded =
    deptScoped != null ? (channelsExpanded[`__dept__${deptScoped.dept.name}`] ?? false) : false

  if (!open) return null

  const isDeptScope = deptScoped != null
  const deptScopedLow = deptScoped != null && deptScoped.rate < 20

  return createPortal(
    <div className="wfr-coll-sheet__root" role="presentation">
      <div className="wfr-coll-sheet__backdrop" onClick={onClose} aria-hidden />
      <aside className="wfr-coll-sheet" role="dialog" aria-labelledby="wfr-coll-sheet-title">
        <header className="wfr-coll-sheet__header">
          <div>
            <h2 id="wfr-coll-sheet-title" className="wfr-coll-sheet__title">
              Data collection progress
            </h2>
            <p className="wfr-coll-sheet__sub">
              {isDeptScope ? (
                <>
                  <strong>{deptScoped.dept.name}</strong> only · response progress for this department
                </>
              ) : launchScopeFilter ? (
                <>
                  Departments in your launch ({launchScopeFilter.size}) · response rates below
                </>
              ) : (
                'Track response rates and nudge delegates who need a push.'
              )}
            </p>
          </div>
          <button type="button" className="wfr-coll-sheet__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              close
            </span>
          </button>
        </header>
        <div className="wfr-coll-sheet__summary">
          <div className="wfr-coll-sheet__summary-bar-row">
            <div className="wfr-coll-sheet__track" aria-hidden>
              <div
                className="wfr-coll-sheet__fill"
                style={{
                  width: `${isDeptScope ? deptScoped.snap.orgResponseRate : orgSnap.orgResponseRate}%`,
                }}
              />
            </div>
            <span className="wfr-coll-sheet__pct-big tabular-nums">
              {isDeptScope ? deptScoped.snap.orgResponseRate : orgSnap.orgResponseRate}%
            </span>
          </div>
          <div className="wfr-coll-sheet__summary-foot">
            <span className="wfr-coll-sheet__summary-muted">
              {isDeptScope ? (
                <>
                  {deptScoped.snap.respondedCount.toLocaleString()} of{' '}
                  {deptScoped.snap.sampleTarget.toLocaleString()} sampled in {deptScoped.dept.name}
                </>
              ) : (
                <>
                  {orgSnap.respondedCount.toLocaleString()} of {orgSnap.sampleTarget.toLocaleString()} sampled
                </>
              )}
            </span>
            {isDeptScope ? (
              deptScoped.snap.needAttentionDeptCount > 0 ? (
                <span className="wfr-coll-sheet__attention-badge">Needs attention</span>
              ) : null
            ) : orgSnap.needAttentionDeptCount > 0 ? (
              <span className="wfr-coll-sheet__attention-badge">
                {orgSnap.needAttentionDeptCount} need attention
              </span>
            ) : null}
          </div>
        </div>

        {isDeptScope ? (
          <div className="wfr-coll-sheet__list wfr-coll-sheet__list--dept-scope">
            <div
              className={`wfr-coll-sheet__dept-scope-strip${deptScopedLow ? ' wfr-coll-sheet__dept-scope-strip--warn' : ''}`}
            >
              <div className="wfr-coll-sheet__dept-scope-strip-inner">
                <div>
                  <p className="wfr-coll-sheet__dept-scope-manager">
                    <span className="wfr-coll-sheet__dept-scope-label">Delegate</span>{' '}
                    {deptScoped.meta.manager}
                  </p>
                  <p className="wfr-coll-sheet__dept-scope-channels">
                    <span className="wfr-coll-sheet__channels-icons" aria-hidden>
                      {deptScoped.meta.activeChannelCount === 1 ? '\u270f\ufe0f' : '\u270f\ufe0f \ud83d\udccb'}
                    </span>
                    {deptScoped.meta.activeChannelCount} channel
                    {deptScoped.meta.activeChannelCount === 1 ? '' : 's'} active
                  </p>
                </div>
                {deptScoped.meta.activeChannelCount > 1 && deptScoped.meta.channelsDetail.length > 1 ? (
                  <button
                    type="button"
                    className="wfr-coll-sheet__channels-toggle"
                    aria-expanded={deptScopedChannelsExpanded}
                    onClick={() =>
                      setChannelsExpanded((m) => ({
                        ...m,
                        [`__dept__${deptScoped.dept.name}`]: !deptScopedChannelsExpanded,
                      }))
                    }
                  >
                    {deptScopedChannelsExpanded ? 'Hide channels' : 'View channels'}
                  </button>
                ) : null}
              </div>
              {deptScoped.meta.activeChannelCount > 1 &&
              deptScoped.meta.channelsDetail.length > 1 &&
              deptScopedChannelsExpanded ? (
                <div className="wfr-coll-sheet__channel-breakdown wfr-coll-sheet__channel-breakdown--in-strip">
                  {deptScoped.meta.channelsDetail.map((ch) => {
                    const chColor = barColor(ch.rate)
                    return (
                      <div key={ch.key} className="wfr-coll-sheet__channel-row">
                        <div className="wfr-coll-sheet__channel-row-label">
                          <span className="wfr-coll-sheet__channel-row-icon" aria-hidden>
                            {ch.icon}
                          </span>
                          <span>{ch.label}</span>
                        </div>
                        <div className="wfr-coll-sheet__channel-row-bar">
                          <div className="wfr-coll-sheet__track-channel" aria-hidden>
                            <div
                              className="wfr-coll-sheet__fill-channel"
                              style={{ width: `${ch.rate}%`, background: chColor }}
                            />
                          </div>
                          <span
                            className="wfr-coll-sheet__channel-row-pct tabular-nums"
                            style={{ color: chColor }}
                          >
                            {ch.rate}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="wfr-coll-sheet__list">
            {deptRows.map((row) => {
              const low = row.rate < 20
              const c = barColor(row.rate)
              const meta = deptCollectionRowDemo(row.name)
              const showNudge = low
              const showRemind = !low && row.rate < 100
              const activityLabel = meta.useHours
                ? meta.lastActivityHoursAgo === 1
                  ? 'Last activity: 1 hour ago'
                  : `Last activity: ${meta.lastActivityHoursAgo} hours ago`
                : meta.lastActivityDaysAgo === 1
                  ? 'Last activity: 1 day ago'
                  : `Last activity: ${meta.lastActivityDaysAgo} days ago`
              const multiChannel = meta.activeChannelCount > 1 && meta.channelsDetail.length > 1
              const expanded = channelsExpanded[row.name] ?? false
              return (
                <div
                  key={row.name}
                  className={`wfr-coll-sheet__row${low ? ' wfr-coll-sheet__row--warn' : ''}`}
                >
                  <div className="wfr-coll-sheet__row-top">
                    <div className="wfr-coll-sheet__row-intro">
                      <div className="wfr-coll-sheet__row-name">
                        {row.name}
                        {low ? (
                          <span className="wfr-coll-sheet__mini-badge">Needs attention</span>
                        ) : null}
                      </div>
                      <div className="wfr-coll-sheet__row-meta">
                        {meta.manager} <span className="wfr-coll-sheet__row-meta-sep">—</span>{' '}
                        <span className="tabular-nums">{row.employees.toLocaleString()} employees</span>
                      </div>
                    </div>
                    <div className="wfr-coll-sheet__row-actions">
                      {showNudge ? (
                        <button type="button" className="wfr-coll-sheet__action-btn wfr-coll-sheet__action-btn--nudge">
                          Nudge
                        </button>
                      ) : null}
                      {showRemind ? (
                        <button type="button" className="wfr-coll-sheet__action-btn wfr-coll-sheet__action-btn--remind">
                          Remind
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="wfr-coll-sheet__row-bar">
                    <div className="wfr-coll-sheet__track-sm" aria-hidden>
                      <div
                        className="wfr-coll-sheet__fill-sm"
                        style={{ width: `${row.rate}%`, background: c }}
                      />
                    </div>
                    <span className="wfr-coll-sheet__row-pct tabular-nums" style={{ color: c }}>
                      {row.rate}%
                    </span>
                  </div>
                  <div
                    className={`wfr-coll-sheet__row-foot${multiChannel ? ' wfr-coll-sheet__row-foot--multi' : ''}`}
                  >
                    <span className="wfr-coll-sheet__channels">
                      <span className="wfr-coll-sheet__channels-icons" aria-hidden>
                        {meta.activeChannelCount === 1 ? '\u270f\ufe0f' : '\u270f\ufe0f \ud83d\udccb'}
                      </span>
                      <span>
                        {meta.activeChannelCount} channel{meta.activeChannelCount === 1 ? '' : 's'} active
                      </span>
                    </span>
                    <div className="wfr-coll-sheet__row-foot-aside">
                      <span className="wfr-coll-sheet__last-activity">{activityLabel}</span>
                      {multiChannel ? (
                        <button
                          type="button"
                          className="wfr-coll-sheet__channels-toggle"
                          aria-expanded={expanded}
                          onClick={(e) => {
                            e.stopPropagation()
                            setChannelsExpanded((m) => ({ ...m, [row.name]: !expanded }))
                          }}
                        >
                          {expanded ? 'Hide channels' : 'View channels'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {multiChannel && expanded ? (
                    <div className="wfr-coll-sheet__channel-breakdown" role="region" aria-label="Channel response rates">
                      {meta.channelsDetail.map((ch) => {
                        const chColor = barColor(ch.rate)
                        return (
                          <div key={ch.key} className="wfr-coll-sheet__channel-row">
                            <div className="wfr-coll-sheet__channel-row-label">
                              <span className="wfr-coll-sheet__channel-row-icon" aria-hidden>
                                {ch.icon}
                              </span>
                              <span>{ch.label}</span>
                            </div>
                            <div className="wfr-coll-sheet__channel-row-bar">
                              <div className="wfr-coll-sheet__track-channel" aria-hidden>
                                <div
                                  className="wfr-coll-sheet__fill-channel"
                                  style={{ width: `${ch.rate}%`, background: chColor }}
                                />
                              </div>
                              <span
                                className="wfr-coll-sheet__channel-row-pct tabular-nums"
                                style={{ color: chColor }}
                              >
                                {ch.rate}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </aside>
    </div>,
    document.body,
  )
}
