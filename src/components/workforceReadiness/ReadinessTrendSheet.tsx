/** Slide-in sheet showing data collection results that drove a department's AI readiness change. */
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
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
  roleContext?: { title: string; dept: string; measuredReadiness?: number; employeeName?: string } | null
  /** When set, frame the sheet as HRBP team data instead of department data */
  hrbpContext?: { hrbpName: string; headcount: number } | null
  /** When true, add upskilling boost to readiness deltas */
  upskillingActive?: boolean
  /** Whether data collection is complete — controls whether trends/deltas are shown */
  collectionComplete?: boolean
}

export function ReadinessTrendSheet({ open, onClose, dept, channelsLabel: _channelsLabel, managerContext, roleContext, hrbpContext, upskillingActive = false, collectionComplete = true }: ReadinessTrendSheetProps) {
  const [zoneFilter, setZoneFilter] = useState<'augment' | 'above' | 'below' | null>(null)

  // Reset filter when sheet closes or role changes
  useEffect(() => {
    setZoneFilter(null)
  }, [open, roleContext?.title])

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
    const deptUpskillingBoost = upskillingActive ? 10 : 0
    // In state 1 (no collection), zero out the trend delta
    const effectiveDelta = collectionComplete ? trend.delta + deptUpskillingBoost : 0
    const measured = collectionComplete ? Math.min(100, estimated + trend.delta + deptUpskillingBoost) : estimated
    const meta = deptCollectionRowDemo(dept.name)
    const teams = deptManagerTeams(dept.name, dept.employees, responseRate)
    return { trend: { ...trend, delta: effectiveDelta, direction: effectiveDelta >= 0 ? 'up' as const : 'down' as const }, responseRate, respondedCount, estimated, measured, meta, teams, showTrends: collectionComplete }
  }, [dept, upskillingActive, collectionComplete])


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

  const sheetTitle = roleContext?.employeeName ?? (roleContext ? roleContext.title : managerContext ? managerContext.manager : hrbpContext ? hrbpContext.hrbpName : dept.name)
  const sheetSub = roleContext?.employeeName
    ? `${roleContext.title} — AI adoption change`
    : roleContext
      ? `${roleContext.dept} — Task-level readiness`
      : managerContext
        ? `${dept.name} — Employee readiness trend`
        : hrbpContext
          ? `${hrbpContext.hrbpName}'s team — AI adoption change`
          : `${dept.name} — AI adoption change`

  // ── Unified card values ──────────────────────────────────────────────────
  const roleForCtx = roleContext ? getRolesForDept(roleContext.dept).find(r => r.title === roleContext.title) : null
  const cardBase = roleContext ? (roleForCtx?.aiReadiness ?? estimated) : estimated
  const cardMeasured = roleContext && data.showTrends
    ? (roleContext.measuredReadiness ?? (roleForCtx ? Math.max(0, Math.min(100, roleForCtx.aiReadiness + trend.delta + ((roleContext.title.length % 3) - 1))) : measured))
    : roleContext ? cardBase : measured
  const cardDelta = cardMeasured - cardBase
  const cardIsUp = cardDelta >= 0
  const cardEmployees = roleContext ? (roleForCtx?.employees ?? 0) : managerContext ? (mgrEmployeeData?.length ?? 0) : hrbpContext ? Math.round(hrbpContext.headcount * data.responseRate / 100) : data.respondedCount

  // Gauge SVG helper
  const GaugeSVG = ({ pct, basePct, isPositive }: { pct: number; basePct: number; isPositive: boolean }) => {
    const r = 20, cx = 24, cy = 26, sw = 6
    const arcLen = Math.PI * r
    const fillLen = (pct / 100) * arcLen
    const bAngle = Math.PI * (1 - basePct / 100)
    const bx = cx + r * Math.cos(bAngle)
    const by = cy - r * Math.sin(bAngle)
    return (
      <svg width="48" height="32" viewBox="0 0 48 32" style={{ flexShrink: 0, overflow: 'visible' }}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#e2e8f0" strokeWidth={sw} strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={isPositive ? '#22c55e' : '#ef4444'} strokeWidth={sw} strokeLinecap="butt" strokeDasharray={`${fillLen} ${arcLen}`} />
        {data.showTrends && <circle cx={bx} cy={by} r="2" fill="#94a3b8" />}
      </svg>
    )
  }

  return createPortal(
    <div className="wfr-trend-sheet__root">
      <div className="wfr-trend-sheet__backdrop" onClick={onClose} />
      <div className="wfr-trend-sheet" role="dialog" aria-label={`${sheetTitle} readiness trend`}>
        {/* Header */}
        <div className="wfr-trend-sheet__header">
          <div>
            <div className="wfr-trend-sheet__title-row">
              <h2 className="wfr-trend-sheet__title">{sheetTitle}</h2>
            </div>
            <p className="wfr-trend-sheet__sub">{sheetSub}</p>
          </div>
          <button type="button" className="wfr-trend-sheet__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="wfr-trend-sheet__body">

          {/* ── Unified AI Adoption card ─────────────────────────────────── */}
          <div style={{ padding: '20px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#1999ac' }}>school</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Adoption</span>
            </div>
            {data.showTrends ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <GaugeSVG pct={cardMeasured} basePct={cardBase} isPositive={cardIsUp} />
                  <span style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{cardMeasured}%</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: cardIsUp ? '#15803d' : '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{cardIsUp ? 'arrow_upward' : 'arrow_downward'}</span>
                    {Math.abs(cardDelta)}pt
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, marginLeft: 52 }}>
                  from {cardBase}% {upskillingActive ? 'before upskilling' : 'estimated'}
                </div>
                <div style={{ background: '#fff', borderRadius: 8, padding: '12px 14px', border: '1px solid #e5e7eb', marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{upskillingActive ? 'Before upskilling' : 'Estimated'}</span>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{upskillingActive ? 'After upskilling' : 'Measured'}</span>
                  </div>
                  <div style={{ position: 'relative', height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${cardBase}%`, borderRadius: 4, background: '#cbd5e1' }} />
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${cardMeasured}%`, borderRadius: 4, background: cardIsUp ? '#22c55e' : '#ef4444', transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>{cardBase}%</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cardIsUp ? '#15803d' : '#dc2626' }}>{cardMeasured}%</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <GaugeSVG pct={cardBase} basePct={cardBase} isPositive={true} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{cardBase}%</span>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Profile-based estimate</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Description ─────────────────────────────────────────────── */}
          <p className="wfr-trend-sheet__summary">
            {upskillingActive
              ? <>Readiness improved through <strong>development plans</strong> — employees completed AI courses and applied new skills to augmentable tasks.</>
              : data.showTrends
                ? <>Employees reported how they perform each augmentable task — <strong>Manual</strong>, <strong>AI-assisted</strong>, or <strong>Mostly AI</strong>. Responses are time-weighted by weekly hours per task.</>
                : <>Baseline readiness estimate based on employee skill profiles. Launch data collection to get measured task-level scores.</>
            }
          </p>

          {/* ── Stats row ────────────────────────────────────────────────── */}
          {data.showTrends && (
            <div className="wfr-trend-sheet__stats">
              <div className="wfr-trend-sheet__stat">
                <span className="wfr-trend-sheet__stat-label">{upskillingActive ? 'Development plans' : 'Channel'}</span>
                <span className="wfr-trend-sheet__stat-value">
                  {upskillingActive
                    ? <><span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: -2, marginRight: 4 }}>school</span>Development plans</>
                    : <><img src="/ai-agent-icon.svg" alt="" style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: -2, marginRight: 4 }} />AI Interviews</>
                  }
                </span>
              </div>
              <div className="wfr-trend-sheet__stat">
                <span className="wfr-trend-sheet__stat-label">{upskillingActive ? 'Upskilling period' : 'Collection period'}</span>
                <span className="wfr-trend-sheet__stat-value">{upskillingActive ? 'Mar 15 – Mar 24, 2026' : 'Feb 10 – Mar 14, 2026'}</span>
              </div>
              <div className="wfr-trend-sheet__stat">
                <span className="wfr-trend-sheet__stat-label">{roleContext?.employeeName ? 'Team member' : managerContext ? 'Employees in team' : 'Employees interviewed'}</span>
                <span className="wfr-trend-sheet__stat-value">{roleContext?.employeeName ? roleContext.employeeName : cardEmployees.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* ── Content section (varies by context) ─────────────────────── */}
          {roleContext ? (
            // Role context: task breakdown
            (() => {
              const tasks = getTasksForRole(roleContext.title)
              const roleHash = roleContext.title.split('').reduce((h2: number, c: string) => ((h2 << 5) - h2 + c.charCodeAt(0)) | 0, 0)
              const movedToAugment = data.showTrends ? 1 + (Math.abs(roleHash) % 2) : 0
              const movedToAutomate = data.showTrends ? (Math.abs(roleHash * 7) % 2) : 0
              const augDelta = movedToAugment
              const autoDelta = movedToAutomate
              const augmentSkills: Record<string, string[]> = {
                'research': ['AI-assisted research', 'Data synthesis'], 'draft': ['AI writing', 'Content generation'],
                'analys': ['Data interpretation', 'Pattern recognition'], 'plan': ['AI-assisted planning', 'Scenario modeling'],
                'review': ['Quality evaluation', 'AI output review'], 'track': ['AI analytics', 'Trend detection'],
                'coordinat': ['AI scheduling', 'Workflow automation'], 'report': ['Automated reporting', 'Data visualization'],
                'forecast': ['Predictive analytics', 'AI modeling'], 'screen': ['AI screening', 'Candidate matching'],
                'document': ['AI documentation', 'Template generation'], 'budget': ['Financial modeling', 'AI forecasting'],
              }
              function getSkills(task: string, zone: string): string[] {
                const lower = task.toLowerCase()
                if (zone === 'augment') { for (const [key, skills] of Object.entries(augmentSkills)) { if (lower.includes(key)) return skills } return ['AI collaboration', 'Tool fluency'] }
                if (zone === 'above') return ['Process automation', 'AI pipeline']
                return ['Critical thinking', 'Human judgment']
              }
              const augTasks = tasks.filter(t => taskZone(t.score) === 'augment')
              const upskilledCount = upskillingActive ? Math.ceil(augTasks.length * 0.6) : 0
              const uniqueSkills = new Set<string>(); augTasks.forEach(t => getSkills(t.task, 'augment').forEach(s => uniqueSkills.add(s)))
              const skillsLearnedCount = upskillingActive ? Math.ceil(uniqueSkills.size * 0.5) : 0
              type ZoneKey = 'augment' | 'above' | 'below'
              const groups = upskillingActive
                ? [
                    { zone: 'augment' as ZoneKey, label: 'Tasks augmented', color: '#475569', bg: '#f8fafc', border: '#e5e7eb', activeBorder: '#475569', count: upskilledCount, delta: 0 },
                    { zone: 'above' as ZoneKey, label: 'Skills learned', color: '#475569', bg: '#f8fafc', border: '#e5e7eb', activeBorder: '#475569', count: skillsLearnedCount, delta: 0 },
                  ]
                : [
                    { zone: 'above' as ZoneKey, label: 'Automate', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', activeBorder: '#6366f1', count: tasks.filter(t => taskZone(t.score) === 'above').length, delta: autoDelta },
                    { zone: 'augment' as ZoneKey, label: 'Augment', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', activeBorder: '#15803d', count: tasks.filter(t => taskZone(t.score) === 'augment').length, delta: augDelta },
                    { zone: 'below' as ZoneKey, label: 'Human', color: '#64748b', bg: '#f8fafc', border: '#e5e7eb', activeBorder: '#64748b', count: tasks.filter(t => taskZone(t.score) === 'below').length, delta: 0 },
                  ]
              const augTasksSorted = tasks.filter(t => taskZone(t.score) === 'augment').sort((a, b) => a.score - b.score)
              const autoTasksSorted = tasks.filter(t => taskZone(t.score) === 'above').sort((a, b) => a.score - b.score)
              const movedAugTasks = new Set(augTasksSorted.slice(0, movedToAugment).map(t => t.task))
              const movedAutoTasks = new Set(autoTasksSorted.slice(0, movedToAutomate).map(t => t.task))
              const zoneGroups = [
                { zone: 'above' as ZoneKey, label: 'Automate', icon: 'precision_manufacturing', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', tasks: tasks.filter(t => taskZone(t.score) === 'above') },
                { zone: 'augment' as ZoneKey, label: 'Augment', icon: 'smart_toy', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', tasks: tasks.filter(t => taskZone(t.score) === 'augment') },
                { zone: 'below' as ZoneKey, label: 'Human', icon: 'person', color: '#64748b', bg: '#f8fafc', border: '#e5e7eb', tasks: tasks.filter(t => taskZone(t.score) === 'below') },
              ]
              const visibleZoneGroups = zoneFilter ? zoneGroups.filter(g => g.zone === zoneFilter && g.tasks.length > 0) : zoneGroups.filter(g => g.tasks.length > 0)
              return (
                <>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a212e', margin: '16px 0 8px' }}>{upskillingActive ? 'Upskilling progress' : 'Tasks'}</h3>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    {groups.map((g) => {
                      const isActive = zoneFilter === g.zone
                      const isDimmed = zoneFilter != null && !isActive
                      return (
                        <div key={g.label} onClick={() => setZoneFilter(prev => prev === g.zone ? null : g.zone)}
                          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: isActive ? `2px solid ${g.activeBorder}` : `1px solid ${g.border}`, background: g.bg, cursor: 'pointer', opacity: isDimmed ? 0.45 : 1, transition: 'opacity 0.15s, border-color 0.15s' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 22, fontWeight: 700, color: g.color }}>{g.count}</span>
                            {g.delta !== 0 && (
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d', padding: '3px 8px', borderRadius: 99, background: '#f0fdf4', border: '1px solid #bbf7d0', lineHeight: 1.2 }}>
                                ↑{g.delta}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: g.color }}>{g.label}</div>
                        </div>
                      )
                    })}
                  </div>
                  {visibleZoneGroups.map((group) => (
                    <div key={group.label} style={{ marginBottom: 16 }}>
                      <div style={{ padding: '8px 12px', borderRadius: 8, background: group.bg, border: `1px solid ${group.border}`, marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: group.color }}>{group.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: group.color }}>{group.label}</span>
                          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>{group.tasks.length} tasks</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {group.tasks.sort((a, b) => b.score - a.score).map((t, ti) => {
                          const zone = taskZone(t.score)
                          const skills = getSkills(t.task, zone)
                          const moved = data.showTrends && ((zone === 'augment' && movedAugTasks.has(t.task)) || (zone === 'above' && movedAutoTasks.has(t.task)))
                          return (
                            <div key={ti} style={{ padding: '10px 12px', borderRadius: 6, border: moved ? '1px solid #bbf7d0' : '1px solid #e5e7eb', background: moved ? '#fafff9' : undefined }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 500, color: '#1a212e' }}>{t.task}</span>
                                {moved && <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginLeft: 8, padding: '2px 8px', borderRadius: 99, background: '#f0fdf4', border: '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>{zone === 'augment' ? '↑ from Human' : '↑ from Augment'}</span>}
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {skills.map((skill) => (
                                  <span key={skill} style={{ padding: '1px 6px', borderRadius: 4, background: group.bg, border: `1px solid ${group.border}`, fontSize: 10, fontWeight: 500, color: group.color }}>{skill}</span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )
            })()
          ) : managerContext && mgrEmployeeData ? (
            // Manager context: employee readiness table
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
          ) : (
            // Dept context: roles breakdown
            <div className="wfr-trend-sheet__teams">
              <h3 className="wfr-trend-sheet__teams-title">Roles</h3>
              <p className="wfr-trend-sheet__teams-sub">
                Readiness by role — {getRolesForDept(dept.name).length} roles in {hrbpContext ? `${hrbpContext.hrbpName}'s team` : dept.name}
              </p>
              <div className="wfr-trend-sheet__teams-table">
                <div className="wfr-trend-sheet__teams-header">
                  <span className="wfr-trend-sheet__teams-th wfr-trend-sheet__teams-th--name">Role</span>
                  <span className="wfr-trend-sheet__teams-th wfr-trend-sheet__teams-th--empl">Employees</span>
                  <span className="wfr-trend-sheet__teams-th wfr-trend-sheet__teams-th--rate">Readiness</span>
                </div>
                {getRolesForDept(dept.name).sort((a, b) => a.aiReadiness - b.aiReadiness).map((role) => {
                  const roleUpskillingBoost = upskillingActive ? Math.round(5 + ((role.aiPotential - role.aiReadiness) / 100) * 15 + (role.title.length % 4)) : 0
                  const roleDelta = trend.delta + ((role.title.length % 3) - 1) + roleUpskillingBoost
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
                                <div className="wfr-trend-sheet__team-bar-fill" style={{ width: `${roleMeasured}%`, background: '#22c55e' }} />
                              </div>
                              <span className="wfr-trend-sheet__team-bar-pct" style={{ color: '#15803d' }}>{roleMeasured}%</span>
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
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
