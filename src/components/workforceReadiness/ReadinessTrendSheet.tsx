/** Slide-in sheet showing data collection results that drove a department's AI readiness change. */
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { getEmployeesForRole, wfrDemoDeptResponseRate, type Dept, type RoleRowType } from '../../data/wfrOrgData'
import {
  barColor,
  deptManagerTeams,
  deptReadinessTrend,
  deptCollectionRowDemo,
  activityLabel,
  type DeptManagerTeam,
} from './collectionHelpers'
import './ReadinessTrendSheet.css'

const BODY_ATTR = 'data-wfr-trend-sheet-open'

export interface ReadinessTrendSheetProps {
  open: boolean
  onClose: () => void
  dept: Dept | null
  channelsLabel?: string
  /** When set, show employee-level readiness for this manager instead of dept collection data */
  managerContext?: { manager: string; mgrIndex: number } | null
}

export function ReadinessTrendSheet({ open, onClose, dept, channelsLabel, managerContext }: ReadinessTrendSheetProps) {
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

  const data = useMemo(() => {
    if (!dept) return null
    const trend = deptReadinessTrend(dept.name)
    const responseRate = wfrDemoDeptResponseRate(dept.name)
    const respondedCount = Math.round((dept.employees * responseRate) / 100)
    const estimated = dept.aiReadiness
    const measured = estimated + trend.delta
    const meta = deptCollectionRowDemo(dept.name)
    const teams = deptManagerTeams(dept.name, dept.employees, responseRate)
    return { trend, responseRate, respondedCount, estimated, measured, meta, teams }
  }, [dept])

  const [expandedManagers, setExpandedManagers] = useState<Record<string, boolean>>({})

  // Reset expanded state when dept changes
  useEffect(() => { setExpandedManagers({}) }, [dept?.name])

  /** Get employees from the same source as the dept table, split by manager index. */
  const allDeptEmps = useMemo(() => {
    if (!dept) return []
    return getEmployeesForRole({ title: dept.name, employees: dept.employees, aiReadiness: dept.aiReadiness, aiPotential: dept.aiPotential } as RoleRowType)
  }, [dept])

  // Manager-level employee readiness data — must be before any early return
  const mgrEmployeeData = useMemo(() => {
    if (!managerContext || !data) return null
    const { mgrIndex } = managerContext
    const startIdx = data.teams.slice(0, mgrIndex).reduce((s, t) => s + t.employees, 0)
    const mgrTeam = data.teams[mgrIndex]
    if (!mgrTeam) return null
    const emps = allDeptEmps.slice(startIdx, Math.min(startIdx + mgrTeam.employees, allDeptEmps.length))
    return emps.map((e) => {
      const trendDelta = data.trend.delta
      const empDelta = trendDelta + ((e.name.length % 5) - 2)
      const previous = Math.max(0, Math.min(100, e.readinessPct - empDelta))
      return {
        name: e.name,
        previous,
        measured: e.readinessPct,
        delta: empDelta,
        direction: empDelta >= 0 ? 'up' as const : 'down' as const,
      }
    })
  }, [managerContext, data, allDeptEmps])

  if (!open || !dept || !data) return null

  const { trend, responseRate, respondedCount, estimated, measured, teams } = data
  const channel = channelsLabel ?? 'AI Interviews'

  const toggleManager = (manager: string) => {
    setExpandedManagers((prev) => ({ ...prev, [manager]: !prev[manager] }))
  }

  const getTeamEmployees = (team: DeptManagerTeam, mgrIndex: number) => {
    const startIdx = data!.teams.slice(0, mgrIndex).reduce((s, t) => s + t.employees, 0)
    const mgrEmps = allDeptEmps.slice(startIdx, Math.min(startIdx + team.employees, allDeptEmps.length))
    const count = Math.min(mgrEmps.length, 8) // show up to 8
    const emps = mgrEmps.slice(0, count).map((e) => {
      const empHash = e.name.split('').reduce((h: number, c: string) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
      const responded = (Math.abs(empHash) % 100) < team.responseRate
      return { name: e.name, responded, readinessPct: e.readinessPct }
    })
    return { employees: emps, remaining: team.employees - count }
  }
  const deltaLabel = `${trend.direction === 'up' ? '↑' : '↓'}${Math.abs(trend.delta)}pt`
  const isUp = trend.direction === 'up'

  const sheetTitle = managerContext ? managerContext.manager : dept.name
  const sheetSub = managerContext ? `${dept.name} — Employee readiness trend` : 'AI readiness change from data collection'

  return createPortal(
    <div className="wfr-trend-sheet__root">
      <div className="wfr-trend-sheet__backdrop" onClick={onClose} />
      <div className="wfr-trend-sheet" role="dialog" aria-label={`${sheetTitle} readiness trend`}>
        {/* Header */}
        <div className="wfr-trend-sheet__header">
          <div>
            <div className="wfr-trend-sheet__title-row">
              <h2 className="wfr-trend-sheet__title">{sheetTitle}</h2>
              <span className={`wfr-trend-sheet__badge ${isUp ? 'wfr-trend-sheet__badge--up' : 'wfr-trend-sheet__badge--down'}`}>
                {deltaLabel}
              </span>
            </div>
            <p className="wfr-trend-sheet__sub">{sheetSub}</p>
          </div>
          <button type="button" className="wfr-trend-sheet__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="wfr-trend-sheet__body">
          {managerContext && mgrEmployeeData ? (
            <>
              {/* Manager-level: employee readiness table */}
              <div className="wfr-trend-sheet__comparison">
                <div className="wfr-trend-sheet__metric">
                  <span className="wfr-trend-sheet__metric-label">Team previous</span>
                  <span className="wfr-trend-sheet__metric-value wfr-trend-sheet__metric-value--muted">{estimated}%</span>
                </div>
                <span className="wfr-trend-sheet__arrow">→</span>
                <div className="wfr-trend-sheet__metric">
                  <span className="wfr-trend-sheet__metric-label">Team measured</span>
                  <span className={`wfr-trend-sheet__metric-value ${isUp ? 'wfr-trend-sheet__metric-value--up' : 'wfr-trend-sheet__metric-value--down'}`}>
                    {measured}%
                  </span>
                </div>
                <div className="wfr-trend-sheet__metric wfr-trend-sheet__metric--delta">
                  <span className="wfr-trend-sheet__metric-label">Change</span>
                  <span className={`wfr-trend-sheet__metric-value ${isUp ? 'wfr-trend-sheet__metric-value--up' : 'wfr-trend-sheet__metric-value--down'}`}>
                    {isUp ? '+' : ''}{trend.delta}pt
                  </span>
                </div>
              </div>
              <p className="wfr-trend-sheet__summary">
                Individual readiness scores for <strong>{managerContext.manager}</strong>&apos;s team of <strong>{mgrEmployeeData.length}</strong> employees.
              </p>
              <div className="wfr-trend-sheet__emp-table">
                <div className="wfr-trend-sheet__emp-header">
                  <span className="wfr-trend-sheet__emp-th" style={{ flex: 2 }}>Employee</span>
                  <span className="wfr-trend-sheet__emp-th">Previous</span>
                  <span className="wfr-trend-sheet__emp-th">Measured</span>
                  <span className="wfr-trend-sheet__emp-th">Change</span>
                </div>
                {mgrEmployeeData.map((emp) => (
                  <div key={emp.name} className="wfr-trend-sheet__emp-row">
                    <span className="wfr-trend-sheet__emp-name" style={{ flex: 2 }}>{emp.name}</span>
                    <span className="wfr-trend-sheet__emp-val wfr-trend-sheet__emp-val--muted">{emp.previous}%</span>
                    <span className={`wfr-trend-sheet__emp-val ${emp.direction === 'up' ? 'wfr-trend-sheet__emp-val--up' : 'wfr-trend-sheet__emp-val--down'}`}>{emp.measured}%</span>
                    <span className={`wfr-trend-sheet__emp-val ${emp.direction === 'up' ? 'wfr-trend-sheet__emp-val--up' : 'wfr-trend-sheet__emp-val--down'}`}>
                      {emp.direction === 'up' ? '+' : ''}{emp.delta}pt
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
          {/* Dept-level: Before → After */}
          <div className="wfr-trend-sheet__comparison">
            <div className="wfr-trend-sheet__metric">
              <span className="wfr-trend-sheet__metric-label">Previous</span>
              <span className="wfr-trend-sheet__metric-value wfr-trend-sheet__metric-value--muted">{estimated}%</span>
              <span className="wfr-trend-sheet__metric-caption">Profile-based</span>
            </div>
            <span className="wfr-trend-sheet__arrow">→</span>
            <div className="wfr-trend-sheet__metric">
              <span className="wfr-trend-sheet__metric-label">Measured</span>
              <span className={`wfr-trend-sheet__metric-value ${isUp ? 'wfr-trend-sheet__metric-value--up' : 'wfr-trend-sheet__metric-value--down'}`}>
                {measured}%
              </span>
              <span className="wfr-trend-sheet__metric-caption">From collection data</span>
            </div>
            <div className="wfr-trend-sheet__metric wfr-trend-sheet__metric--delta">
              <span className="wfr-trend-sheet__metric-label">Change</span>
              <span className={`wfr-trend-sheet__metric-value ${isUp ? 'wfr-trend-sheet__metric-value--up' : 'wfr-trend-sheet__metric-value--down'}`}>
                {isUp ? '+' : ''}{trend.delta}pt
              </span>
            </div>
          </div>

          {/* Summary */}
          <p className="wfr-trend-sheet__summary">
            Based on <strong>{respondedCount.toLocaleString()}</strong> of <strong>{dept.employees.toLocaleString()}</strong> employee
            responses via <strong>{channel}</strong>, measured readiness is{' '}
            <strong>{Math.abs(trend.delta)}pt {isUp ? 'higher' : 'lower'}</strong> than the initial estimate.
          </p>

          {/* Collection stats */}
          <div className="wfr-trend-sheet__stats">
            <div className="wfr-trend-sheet__stat">
              <span className="wfr-trend-sheet__stat-label">Response rate</span>
              <span className="wfr-trend-sheet__stat-value">{responseRate}%</span>
            </div>
            <div className="wfr-trend-sheet__stat">
              <span className="wfr-trend-sheet__stat-label">Channel</span>
              <span className="wfr-trend-sheet__stat-value">
                {channel === 'AI Interviews'
                  ? <img src="/ai-agent-icon.svg" alt="" style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: -2, marginRight: 4 }} />
                  : channel === 'Contextual Surveys' ? <span style={{ marginRight: 4 }}>📋</span>
                  : channel === 'Career Hub Profiles' ? <span style={{ marginRight: 4 }}>✏️</span>
                  : null}
                {channel}
              </span>
            </div>
            <div className="wfr-trend-sheet__stat">
              <span className="wfr-trend-sheet__stat-label">Last activity</span>
              <span className="wfr-trend-sheet__stat-value">{activityLabel(dept.name).replace('Last activity: ', '')}</span>
            </div>
          </div>

          {/* Team breakdown */}
          <div className="wfr-trend-sheet__teams">
            <h3 className="wfr-trend-sheet__teams-title">Team breakdown</h3>
            <p className="wfr-trend-sheet__teams-sub">
              {teams.length} managers · {dept.employees.toLocaleString()} employees
            </p>
            <div className="wfr-trend-sheet__teams-table">
              <div className="wfr-trend-sheet__teams-header">
                <span className="wfr-trend-sheet__teams-th wfr-trend-sheet__teams-th--name">Manager</span>
                <span className="wfr-trend-sheet__teams-th wfr-trend-sheet__teams-th--empl">Employees</span>
                <span className="wfr-trend-sheet__teams-th wfr-trend-sheet__teams-th--rate">Response rate</span>
              </div>
              {teams.map((team, ti) => {
                const c = barColor(team.responseRate)
                const expanded = !!expandedManagers[team.manager]
                const { employees: emps, remaining } = getTeamEmployees(team, ti)
                return (
                  <div key={team.manager}>
                    <div
                      className="wfr-trend-sheet__teams-row wfr-trend-sheet__teams-row--expandable"
                      onClick={() => toggleManager(team.manager)}
                    >
                      <div className="wfr-trend-sheet__teams-td wfr-trend-sheet__teams-td--name">
                        <span className={`material-symbols-outlined wfr-trend-sheet__expand-icon ${expanded ? 'wfr-trend-sheet__expand-icon--open' : ''}`} style={{ fontSize: 16, color: '#94a3b8', marginRight: 4 }}>
                          chevron_right
                        </span>
                        <div>
                          <div className="wfr-trend-sheet__team-manager">{team.manager}</div>
                          <div className="wfr-trend-sheet__team-title">{team.title}</div>
                        </div>
                      </div>
                      <div className="wfr-trend-sheet__teams-td wfr-trend-sheet__teams-td--empl">
                        {team.employees.toLocaleString()}
                      </div>
                      <div className="wfr-trend-sheet__teams-td wfr-trend-sheet__teams-td--rate">
                        <div className="wfr-trend-sheet__team-bar">
                          <div className="wfr-trend-sheet__team-bar-track">
                            <div
                              className="wfr-trend-sheet__team-bar-fill"
                              style={{ width: `${team.responseRate}%`, background: c }}
                            />
                          </div>
                          <span className="wfr-trend-sheet__team-bar-pct" style={{ color: c }}>
                            {team.responseRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {expanded && (
                      <div className="wfr-trend-sheet__employees">
                        {emps.map((emp) => (
                          <div key={emp.name} className="wfr-trend-sheet__employee-row">
                            <div className="wfr-trend-sheet__teams-td wfr-trend-sheet__teams-td--name wfr-trend-sheet__employee-name">
                              {emp.name}
                            </div>
                            <div className="wfr-trend-sheet__teams-td wfr-trend-sheet__teams-td--empl" />
                            <div className="wfr-trend-sheet__teams-td wfr-trend-sheet__teams-td--rate">
                              <span className={`wfr-trend-sheet__emp-status ${emp.responded ? 'wfr-trend-sheet__emp-status--done' : ''}`}>
                                {emp.responded ? '✓ Responded' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {remaining > 0 && (
                          <div className="wfr-trend-sheet__employee-row wfr-trend-sheet__employee-more">
                            +{remaining.toLocaleString()} more employees
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
