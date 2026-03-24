/** Slide-in sheet showing data collection results that drove a department's AI readiness change. */
import { useEffect, useLayoutEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { getEmployeesForRole, getRolesForDept, getTasksForRole, taskZone, wfrDemoDeptResponseRate, type Dept, type RoleRowType } from '../../data/wfrOrgData'
import {
  deptManagerTeams,
  deptReadinessTrend,
  deptCollectionRowDemo,
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
  /** When set, show task-level breakdown for this role instead of dept roles */
  roleContext?: { title: string; dept: string } | null
}

export function ReadinessTrendSheet({ open, onClose, dept, channelsLabel: _channelsLabel, managerContext, roleContext }: ReadinessTrendSheetProps) {
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

  const { trend, estimated, measured } = data

  const deltaLabel = `${trend.direction === 'up' ? '↑' : '↓'}${Math.abs(trend.delta)}pt`
  const isUp = trend.direction === 'up'

  const sheetTitle = roleContext ? roleContext.title : managerContext ? managerContext.manager : dept.name
  const sheetSub = roleContext ? `${roleContext.dept} — Task-level readiness` : managerContext ? `${dept.name} — Employee readiness trend` : 'AI readiness change from data collection'

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
          ) : roleContext ? (
            <>
              {/* Role-level: Task survey response breakdown */}
              {(() => {
                const tasks = getTasksForRole(roleContext.title)
                const augTasks = tasks.filter(t => taskZone(t.score) === 'augment')
                const role = getRolesForDept(roleContext.dept).find(r => r.title === roleContext.title)
                const roleDelta = trend.delta + ((roleContext.title.length % 3) - 1)
                const roleMeasured = role ? Math.max(0, Math.min(100, role.aiReadiness + roleDelta)) : measured
                return (
                  <>
                    <h3 style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>AI Readiness</h3>
                    <div className="wfr-trend-sheet__comparison">
                      <div className="wfr-trend-sheet__metric">
                        <span className="wfr-trend-sheet__metric-label">Estimated</span>
                        <span className="wfr-trend-sheet__metric-value wfr-trend-sheet__metric-value--muted">{role?.aiReadiness ?? estimated}%</span>
                        <span className="wfr-trend-sheet__metric-caption">Profile-based</span>
                      </div>
                      <span className="wfr-trend-sheet__arrow">→</span>
                      <div className="wfr-trend-sheet__metric">
                        <span className="wfr-trend-sheet__metric-label">Measured</span>
                        <span className={`wfr-trend-sheet__metric-value ${roleDelta >= 0 ? 'wfr-trend-sheet__metric-value--up' : 'wfr-trend-sheet__metric-value--down'}`}>
                          {roleMeasured}%
                        </span>
                        <span className="wfr-trend-sheet__metric-caption">From AI interviews</span>
                      </div>
                      <div className="wfr-trend-sheet__metric wfr-trend-sheet__metric--delta">
                        <span className="wfr-trend-sheet__metric-label">Change</span>
                        <span className={`wfr-trend-sheet__metric-value ${roleDelta >= 0 ? 'wfr-trend-sheet__metric-value--up' : 'wfr-trend-sheet__metric-value--down'}`}>
                          {roleDelta >= 0 ? '+' : ''}{roleDelta}pt
                        </span>
                      </div>
                    </div>
                    <p className="wfr-trend-sheet__summary">
                      Employees reported how they perform each augmentable task — <strong>Manual</strong>, <strong>AI-assisted</strong>, or <strong>Mostly AI</strong>. Responses are time-weighted by weekly hours per task.
                    </p>
                    <div className="wfr-trend-sheet__stats">
                      <div className="wfr-trend-sheet__stat">
                        <span className="wfr-trend-sheet__stat-label">Channel</span>
                        <span className="wfr-trend-sheet__stat-value">
                          <img src="/ai-agent-icon.svg" alt="" style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: -2, marginRight: 4 }} />
                          AI Interviews
                        </span>
                      </div>
                      <div className="wfr-trend-sheet__stat">
                        <span className="wfr-trend-sheet__stat-label">Collection period</span>
                        <span className="wfr-trend-sheet__stat-value">Feb 10 – Mar 14, 2026</span>
                      </div>
                      <div className="wfr-trend-sheet__stat">
                        <span className="wfr-trend-sheet__stat-label">Employees surveyed</span>
                        <span className="wfr-trend-sheet__stat-value">{role?.employees ?? 0}</span>
                      </div>
                    </div>
                    <div className="wfr-trend-sheet__teams">
                      <h3 className="wfr-trend-sheet__teams-title">Task responses</h3>
                      <p className="wfr-trend-sheet__teams-sub">{augTasks.length} augmentable tasks — how employees reported doing them</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                        {augTasks.sort((a, b) => b.score - a.score).map((t, i) => {
                          // Simulate survey response distribution based on task score + trend
                          const hash = t.task.split('').reduce((h: number, c: string) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
                          const aiAssistedPct = Math.min(80, Math.max(10, t.score - 10 + (Math.abs(hash) % 15)))
                          const mostlyAiPct = Math.min(40, Math.max(0, t.score - 40 + (Math.abs(hash * 3) % 10)))
                          const manualPct = 100 - aiAssistedPct - mostlyAiPct
                          const weeklyHrs = 2 + (Math.abs(hash) % 8)
                          return (
                            <div key={i} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a212e' }}>{t.task}</span>
                                <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 8 }}>{weeklyHrs} hrs/wk</span>
                              </div>
                              {/* Response bar */}
                              <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                                <div style={{ width: `${manualPct}%`, background: '#fca5a5' }} title={`Manual: ${manualPct}%`} />
                                <div style={{ width: `${aiAssistedPct}%`, background: '#86efac' }} title={`AI-assisted: ${aiAssistedPct}%`} />
                                <div style={{ width: `${mostlyAiPct}%`, background: '#22c55e' }} title={`Mostly AI: ${mostlyAiPct}%`} />
                              </div>
                              <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                                <span style={{ color: '#dc2626' }}>Manual {manualPct}%</span>
                                <span style={{ color: '#15803d' }}>AI-assisted {aiAssistedPct}%</span>
                                <span style={{ color: '#166534', fontWeight: 600 }}>Mostly AI {mostlyAiPct}%</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {tasks.filter(t => taskZone(t.score) !== 'augment').length > 0 && (
                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
                          {tasks.filter(t => taskZone(t.score) !== 'augment').length} non-augmentable tasks not shown (below threshold or fully automatable)
                        </p>
                      )}
                    </div>
                  </>
                )
              })()}
            </>
          ) : (
            <>
          {/* Dept-level: Before → After */}
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>AI Readiness</h3>
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
            AI Interviews measured readiness across <strong>{dept.employees.toLocaleString()}</strong> employees.
            Readiness is <strong>{Math.abs(trend.delta)}pt {isUp ? 'higher' : 'lower'}</strong> than the initial profile-based estimate.
          </p>

          {/* Collection stats */}
          <div className="wfr-trend-sheet__stats">
            <div className="wfr-trend-sheet__stat">
              <span className="wfr-trend-sheet__stat-label">Channel</span>
              <span className="wfr-trend-sheet__stat-value">
                <img src="/ai-agent-icon.svg" alt="" style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: -2, marginRight: 4 }} />
                AI Interviews
              </span>
            </div>
            <div className="wfr-trend-sheet__stat">
              <span className="wfr-trend-sheet__stat-label">Collection period</span>
              <span className="wfr-trend-sheet__stat-value">Feb 10 – Mar 14, 2026</span>
            </div>
            <div className="wfr-trend-sheet__stat">
              <span className="wfr-trend-sheet__stat-label">Employees in gap</span>
              <span className="wfr-trend-sheet__stat-value" style={{ color: '#dc2626' }}>{Math.round(dept.employees * (1 - measured / 100)).toLocaleString()}</span>
            </div>
          </div>

          {/* Role breakdown */}
          <div className="wfr-trend-sheet__teams">
            <h3 className="wfr-trend-sheet__teams-title">Roles</h3>
            <p className="wfr-trend-sheet__teams-sub">
              Readiness by role — {getRolesForDept(dept.name).length} roles in {dept.name}
            </p>
            <div className="wfr-trend-sheet__teams-table">
              <div className="wfr-trend-sheet__teams-header">
                <span className="wfr-trend-sheet__teams-th wfr-trend-sheet__teams-th--name">Role</span>
                <span className="wfr-trend-sheet__teams-th wfr-trend-sheet__teams-th--empl">Employees</span>
                <span className="wfr-trend-sheet__teams-th wfr-trend-sheet__teams-th--rate">Readiness</span>
              </div>
              {getRolesForDept(dept.name).sort((a, b) => a.aiReadiness - b.aiReadiness).map((role) => {
                const roleDelta = trend.delta + ((role.title.length % 3) - 1)
                const roleMeasured = Math.max(0, Math.min(100, role.aiReadiness + roleDelta))
                const roleIsUp = roleDelta >= 0
                const gapCount = Math.round(role.employees * (1 - roleMeasured / 100))
                return (
                  <div key={role.title}>
                    <div className="wfr-trend-sheet__teams-row">
                      <div className="wfr-trend-sheet__teams-td wfr-trend-sheet__teams-td--name">
                        <div>
                          <div className="wfr-trend-sheet__team-manager">{role.title}</div>
                          <div className="wfr-trend-sheet__team-title">{gapCount} of {role.employees} in gap</div>
                        </div>
                      </div>
                      <div className="wfr-trend-sheet__teams-td wfr-trend-sheet__teams-td--empl">
                        {role.employees.toLocaleString()}
                      </div>
                      <div className="wfr-trend-sheet__teams-td wfr-trend-sheet__teams-td--rate">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="wfr-trend-sheet__team-bar">
                            <div className="wfr-trend-sheet__team-bar-track">
                              <div
                                className="wfr-trend-sheet__team-bar-fill"
                                style={{ width: `${roleMeasured}%`, background: '#22c55e' }}
                              />
                            </div>
                            <span className="wfr-trend-sheet__team-bar-pct" style={{ color: '#15803d' }}>
                              {roleMeasured}%
                            </span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: roleIsUp ? '#15803d' : '#dc2626' }}>
                            {roleIsUp ? '↑' : '↓'}{Math.abs(roleDelta)}pt
                          </span>
                        </div>
                      </div>
                    </div>
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
