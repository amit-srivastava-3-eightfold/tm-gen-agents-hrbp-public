import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ORG,
  wfrDemoCollectionSnapshot,
  wfrDemoDeptCollectionSnapshot,
  wfrDemoDeptResponseRate,
  wfrDeptCollectionEmployeeRows,
  type Dept,
} from '../../data/wfrOrgData'
import './FocusCollectionDetailSheet.css'

const BODY_ATTR = 'data-wfr-coll-sheet-open'

const DEMO_MANAGERS = [
  'Priya Thompson',
  'Alex Rivera',
  'Jordan Kim',
  'Sam Okonkwo',
  'Riley Chen',
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

const EMP_SAMPLE_FIRST = [
  'Alex',
  'Sam',
  'Jordan',
  'Riley',
  'Casey',
  'Morgan',
  'Taylor',
  'Quinn',
  'Jamie',
  'Drew',
  'Skyler',
  'Reese',
]
const EMP_SAMPLE_LI = ['K.', 'R.', 'M.', 'L.', 'T.', 'P.', 'S.', 'N.', 'W.']

/** Deterministic sample rows for employee-level status in the org-wide sheet (per department row). */
function demoDeptEmployeeStatusRows(deptName: string, ratePct: number) {
  const h = deptNameHash(deptName)
  const n = Math.min(8, Math.max(5, 5 + (h % 3)))
  const respondedInSample = Math.max(0, Math.min(n, Math.round((n * ratePct) / 100)))
  const rows: { name: string; status: 'responded' | 'pending' }[] = []
  for (let i = 0; i < n; i++) {
    const hi = (h + i * 47) % 10000
    const fn = EMP_SAMPLE_FIRST[hi % EMP_SAMPLE_FIRST.length]
    const li = EMP_SAMPLE_LI[(hi >> 4) % EMP_SAMPLE_LI.length]
    rows.push({
      name: `${fn} ${li}`,
      status: i < respondedInSample ? 'responded' : 'pending',
    })
  }
  return rows
}

export function FocusCollectionDetailSheet({
  open,
  onClose,
  /** When set, sheet shows this department only and lists its employees. */
  scopeDepartment = null,
}: {
  open: boolean
  onClose: () => void
  scopeDepartment?: Dept | null
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
  }, [open, scopeDepartment?.name])

  const [channelsExpanded, setChannelsExpanded] = useState<Record<string, boolean>>({})

  const orgSnap = useMemo(() => wfrDemoCollectionSnapshot(), [])
  const deptRows = useMemo(() => {
    const rows = ORG.departments.map((d) => ({
      name: d.name,
      employees: d.employees,
      rate: wfrDemoDeptResponseRate(d.name),
    }))
    return rows.sort((a, b) => a.rate - b.rate)
  }, [])

  const deptScoped = useMemo(() => {
    if (!scopeDepartment) return null
    const meta = deptCollectionRowDemo(scopeDepartment.name)
    const emp = wfrDeptCollectionEmployeeRows(scopeDepartment)
    const snap = wfrDemoDeptCollectionSnapshot(scopeDepartment)
    return {
      dept: scopeDepartment,
      meta,
      emp,
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
                  <strong>{deptScoped.dept.name}</strong> only · employee responses in this department
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
                  {deptScoped.snap.totalEmployees.toLocaleString()} employees in {deptScoped.dept.name} responded
                </>
              ) : (
                <>
                  {orgSnap.respondedCount.toLocaleString()} of {orgSnap.totalEmployees.toLocaleString()} employees
                  responded
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

            <h3 className="wfr-coll-sheet__dept-emp-list-title">
              Employees in {deptScoped.dept.name}
              <span className="wfr-coll-sheet__dept-emp-list-count tabular-nums">
                {deptScoped.emp.rosterSize.toLocaleString()}
              </span>
            </h3>
            {deptScoped.emp.rows.map((emp, idx) => {
              const pending = emp.status === 'pending'
              return (
                <div
                  key={`${emp.name}-${emp.roleTitle}-${idx}`}
                  className={`wfr-coll-sheet__emp-dept-row${pending && deptScopedLow ? ' wfr-coll-sheet__emp-dept-row--dim' : ''}`}
                >
                  <div className="wfr-coll-sheet__emp-dept-main">
                    <span className="wfr-coll-sheet__emp-dept-name">{emp.name}</span>
                    <span className="wfr-coll-sheet__emp-dept-role">{emp.roleTitle}</span>
                  </div>
                  <div className="wfr-coll-sheet__emp-dept-actions">
                    <span
                      className={`wfr-coll-sheet__emp-pill${emp.status === 'responded' ? ' wfr-coll-sheet__emp-pill--ok' : ''}`}
                    >
                      {emp.status === 'responded' ? 'Responded' : 'Pending'}
                    </span>
                    {pending ? (
                      <button type="button" className="wfr-coll-sheet__action-btn wfr-coll-sheet__action-btn--remind">
                        Remind
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
            {deptScoped.emp.truncated ? (
              <p className="wfr-coll-sheet__dept-emp-list-trunc">
                Showing first {deptScoped.emp.rows.length.toLocaleString()} of{' '}
                {deptScoped.emp.rosterSize.toLocaleString()} employees in this department.
              </p>
            ) : null}
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
              const respondedHeadcount = Math.round((row.employees * row.rate) / 100)
              const pendingHeadcount = Math.max(0, row.employees - respondedHeadcount)
              const empStatusRows = demoDeptEmployeeStatusRows(row.name, row.rate)
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
                  <div className="wfr-coll-sheet__emp-block">
                    <div className="wfr-coll-sheet__emp-head">
                      <span className="wfr-coll-sheet__emp-title">Employee response status</span>
                      <span className="wfr-coll-sheet__emp-summary tabular-nums">
                        {respondedHeadcount.toLocaleString()} responded · {pendingHeadcount.toLocaleString()} pending
                      </span>
                    </div>
                    <ul className="wfr-coll-sheet__emp-list" aria-label={`Employees in ${row.name}`}>
                      {empStatusRows.map((e, i) => (
                        <li key={`${row.name}-${e.name}-${i}`} className="wfr-coll-sheet__emp-row">
                          <span className="wfr-coll-sheet__emp-name">{e.name}</span>
                          <span
                            className={`wfr-coll-sheet__emp-pill${e.status === 'responded' ? ' wfr-coll-sheet__emp-pill--ok' : ''}`}
                          >
                            {e.status === 'responded' ? 'Responded' : 'Pending'}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="wfr-coll-sheet__emp-foot">
                      Sample of individuals; totals match department headcount ({row.employees.toLocaleString()}).
                    </p>
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
