/** Slide-in sheet showing data collection results that drove a department's AI readiness change. */
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { wfrDemoDeptResponseRate, type Dept } from '../../data/wfrOrgData'
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
}

export function ReadinessTrendSheet({ open, onClose, dept, channelsLabel }: ReadinessTrendSheetProps) {
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

  if (!open || !dept || !data) return null

  const { trend, responseRate, respondedCount, estimated, measured, teams } = data
  const channel = channelsLabel ?? 'AI Agent Interviews'

  const toggleManager = (manager: string) => {
    setExpandedManagers((prev) => ({ ...prev, [manager]: !prev[manager] }))
  }

  /** Generate deterministic employee names for a manager's team. */
  const getTeamEmployees = (team: DeptManagerTeam) => {
    const FIRST = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Blake', 'Drew', 'Sage', 'Reese', 'Skyler', 'Dakota', 'Finley', 'Rowan', 'Hayden', 'Emery', 'Peyton']
    const LAST = ['Patel', 'Kim', 'Chen', 'Garcia', 'Singh', 'Nakamura', 'Obi', 'Martinez', 'Thompson', 'Rivera', 'Duval', 'Nguyen', 'Sullivan', 'Okonkwo', 'Andersson', 'Kapoor', 'Shah', 'Müller', 'Santos', 'Park']
    let h = 0
    for (let i = 0; i < team.manager.length; i++) h = ((h << 5) - h + team.manager.charCodeAt(i)) | 0
    const count = Math.min(team.employees, 8) // show up to 8
    const emps: { name: string; responded: boolean }[] = []
    for (let i = 0; i < count; i++) {
      const fi = Math.abs((h * (i + 1) * 7) % FIRST.length)
      const li = Math.abs((h * (i + 1) * 13) % LAST.length)
      const responded = ((h * (i + 1)) % 100) < team.responseRate
      emps.push({ name: `${FIRST[fi]} ${LAST[li]}`, responded })
    }
    return { employees: emps, remaining: team.employees - count }
  }
  const deltaLabel = `${trend.direction === 'up' ? '↑' : '↓'}${Math.abs(trend.delta)}pt`
  const isUp = trend.direction === 'up'

  return createPortal(
    <div className="wfr-trend-sheet__root">
      <div className="wfr-trend-sheet__backdrop" onClick={onClose} />
      <div className="wfr-trend-sheet" role="dialog" aria-label={`${dept.name} readiness trend`}>
        {/* Header */}
        <div className="wfr-trend-sheet__header">
          <div>
            <div className="wfr-trend-sheet__title-row">
              <h2 className="wfr-trend-sheet__title">{dept.name}</h2>
              <span className={`wfr-trend-sheet__badge ${isUp ? 'wfr-trend-sheet__badge--up' : 'wfr-trend-sheet__badge--down'}`}>
                {deltaLabel}
              </span>
            </div>
            <p className="wfr-trend-sheet__sub">AI readiness change from data collection</p>
          </div>
          <button type="button" className="wfr-trend-sheet__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="wfr-trend-sheet__body">
          {/* Before → After */}
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
                {channel === 'AI Agent Interviews'
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
              {teams.map((team) => {
                const c = barColor(team.responseRate)
                const expanded = !!expandedManagers[team.manager]
                const { employees: emps, remaining } = getTeamEmployees(team)
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
        </div>
      </div>
    </div>,
    document.body,
  )
}
