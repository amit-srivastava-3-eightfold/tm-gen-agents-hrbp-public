/** Inline collection status data table — shows per-department data collection progress. */
import { Fragment, useMemo, useState } from 'react'
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
} from '@tonyh-2-eightfold/ef-design-system'
import {
  ORG,
  wfrDemoDeptResponseRate,
  type Dept,
} from '../../data/wfrOrgData'
import {
  barColor,
  deptCollectionRowDemo,
  deptManagerTeams,
  deptNameHash,
  activityLabel,
} from './collectionHelpers'
import './CollectionProgressPanel.css'

/** Channel config matching the launch wizard options. */
const CHANNEL_MAP: Record<string, { label: string; icon: string; iconSrc?: string }> = {
  ai_agent_interviews: { label: 'AI Interviews', icon: '', iconSrc: '/ai-agent-icon.svg' },
  contextual_surveys: { label: 'Contextual Surveys', icon: '📋' },
  career_hub_profiles: { label: 'Career Hub Profiles', icon: '✏️' },
}

export interface CollectionProgressPanelProps {
  /** Limit to these department names (from launch scope). Null = all. */
  scopedDepartmentNames?: string[] | null
  /** When set, show single-department view. */
  scopeDepartment?: Dept | null
  /** The channel label selected during launch (e.g. "AI Interviews"). Falls back to default. */
  channelsLabel?: string
}

export function CollectionProgressPanel({
  scopedDepartmentNames = null,
  scopeDepartment = null,
  channelsLabel,
}: CollectionProgressPanelProps) {
  // Resolve channel display from label
  const resolvedChannel = useMemo(() => {
    if (!channelsLabel) return CHANNEL_MAP.ai_agent_interviews // default
    const entry = Object.values(CHANNEL_MAP).find((c) => c.label === channelsLabel)
    return entry ?? { label: channelsLabel, icon: '📋', iconSrc: undefined }
  }, [channelsLabel])
  const isDeptScope = scopeDepartment != null
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [expandedMgr, setExpandedMgr] = useState<Record<string, boolean>>({})

  const deptRows = useMemo(() => {
    if (isDeptScope) {
      return [{ name: scopeDepartment.name, employees: scopeDepartment.employees, rate: wfrDemoDeptResponseRate(scopeDepartment.name) }]
    }
    const filterSet = scopedDepartmentNames?.length ? new Set(scopedDepartmentNames) : null
    const depts = filterSet ? ORG.departments.filter((d) => filterSet.has(d.name)) : ORG.departments
    return depts
      .map((d) => ({ name: d.name, employees: d.employees, rate: wfrDemoDeptResponseRate(d.name) }))
      .sort((a, b) => a.rate - b.rate)
  }, [isDeptScope, scopeDepartment, scopedDepartmentNames])

  // Dept-scoped view: show managers directly with expandable employees
  if (isDeptScope) {
    const deptRate = wfrDemoDeptResponseRate(scopeDepartment.name)
    const teams = deptManagerTeams(scopeDepartment.name, scopeDepartment.employees, deptRate)
    return (
      <DataTable bordered>
        <DataTableHeader>
          <DataTableRow>
            <DataTableHead className="w-6" />
            <DataTableHead>Manager</DataTableHead>
            <DataTableHead numeric>Employees</DataTableHead>
            <DataTableHead>Channels</DataTableHead>
            <DataTableHead metric>Progress</DataTableHead>
            <DataTableHead>Last updated</DataTableHead>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {teams.map((team) => {
            const tc = barColor(team.responseRate)
            const mgrKey = `${scopeDepartment.name}-${team.manager}`
            const isMgrExpanded = expandedMgr[mgrKey] ?? false
            // Generate deterministic employee names for this manager
            const empCount = team.employees
            const firstNames = ['Alex', 'Jordan', 'Sam', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Taylor', 'Jamie', 'Drew', 'Blake', 'Sage', 'Emery', 'Skyler', 'Rowan', 'Harper', 'Cameron', 'Dana', 'Parker']
            const lastNames = ['Kim', 'Patel', 'Chen', 'Rivera', 'Okonkwo', 'Martinez', 'Nguyen', 'Brooks', 'Washington', 'Reyes', 'Nakamura', 'Sullivan', 'Johansson', 'Kapoor', 'Andersson', 'Obi', 'Duval', 'Petrov', 'Chang', 'Thomas']
            const h = deptNameHash(mgrKey)
            // Generate employee names and progress that averages to manager's responseRate
            const empData: { name: string; progress: number }[] = []
            const rawSeeds = Array.from({ length: empCount }, (_, i) => 10 + ((h + i * 17) % 80))
            const rawAvg = rawSeeds.reduce((s, v) => s + v, 0) / empCount
            const scale = rawAvg > 0 ? team.responseRate / rawAvg : 0
            for (let i = 0; i < empCount; i++) {
              const fi = (h + i * 7) % 20
              const li = (h + i * 13) % 20
              const progress = Math.min(100, Math.max(0, Math.round(rawSeeds[i] * scale)))
              empData.push({ name: `${firstNames[fi]} ${lastNames[li]}`, progress })
            }
            // Fix rounding: adjust largest employee so avg matches exactly
            const actualSum = empData.reduce((s, e) => s + e.progress, 0)
            const targetSum = Math.round(team.responseRate * empCount)
            if (empData.length > 0 && actualSum !== targetSum) {
              let maxIdx = 0
              for (let i = 1; i < empData.length; i++) { if (empData[i].progress > empData[maxIdx].progress) maxIdx = i }
              empData[maxIdx].progress = Math.min(100, Math.max(0, empData[maxIdx].progress + (targetSum - actualSum)))
            }
            return (
              <Fragment key={mgrKey}>
                <DataTableRow
                  onClick={() => setExpandedMgr((prev) => ({ ...prev, [mgrKey]: !isMgrExpanded }))}
                >
                  <DataTableCell className="!px-2 w-6">
                    <span
                      className="material-symbols-outlined text-[#94a3b8] text-base transition-transform"
                      style={{ transform: isMgrExpanded ? 'rotate(90deg)' : undefined }}
                    >
                      chevron_right
                    </span>
                  </DataTableCell>
                  <DataTableCell>
                    <div className="text-[#0f172a] text-[13px] font-medium">{team.manager}</div>
                    <div className="text-[#94a3b8] text-[11px]">{team.title}</div>
                  </DataTableCell>
                  <DataTableCell align="right" numeric>{team.employees.toLocaleString()}</DataTableCell>
                  <DataTableCell>
                    <span className="wfr-coll-table__channels">
                      <span aria-hidden>{resolvedChannel.iconSrc ? <img src={resolvedChannel.iconSrc} alt="" style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: -2 }} /> : resolvedChannel.icon}</span>
                      {resolvedChannel.label}
                    </span>
                  </DataTableCell>
                  <DataTableCell metric>
                    <div className="wfr-coll-table__progress">
                      <div className="wfr-coll-table__track" aria-hidden>
                        <div className="wfr-coll-table__fill" style={{ width: `${team.responseRate}%`, background: tc }} />
                      </div>
                      <span className="wfr-coll-table__pct tabular-nums" style={{ color: tc }}>
                        {team.responseRate}%
                      </span>
                    </div>
                  </DataTableCell>
                  <DataTableCell className="text-[#94a3b8] text-[13px]">{activityLabel(scopeDepartment.name)}</DataTableCell>
                </DataTableRow>
                {isMgrExpanded && empData.map((emp, ei) => {
                  const ec = barColor(emp.progress)
                  return (
                    <DataTableRow key={`${mgrKey}-${ei}`} className="bg-[#f8fafc]">
                      <DataTableCell className="!px-2 w-6" />
                      <DataTableCell className="!pl-10 text-[13px] text-[#475569]">{emp.name}</DataTableCell>
                      <DataTableCell />
                      <DataTableCell />
                      <DataTableCell metric>
                        <div className="wfr-coll-table__progress">
                          <div className="wfr-coll-table__track" aria-hidden>
                            <div className="wfr-coll-table__fill" style={{ width: `${emp.progress}%`, background: ec }} />
                          </div>
                          <span className="wfr-coll-table__pct tabular-nums" style={{ color: ec }}>
                            {emp.progress}%
                          </span>
                        </div>
                      </DataTableCell>
                      <DataTableCell />
                    </DataTableRow>
                  )
                })}
              </Fragment>
            )
          })}
        </DataTableBody>
      </DataTable>
    )
  }

  return (
    <DataTable bordered>
      <DataTableHeader>
        <DataTableRow>
          <DataTableHead className="w-6" />
          <DataTableHead>Department</DataTableHead>
          <DataTableHead>HRBP</DataTableHead>
          <DataTableHead numeric>Employees</DataTableHead>
          <DataTableHead>Channels</DataTableHead>
          <DataTableHead metric>Progress</DataTableHead>
          <DataTableHead>Last updated</DataTableHead>
        </DataTableRow>
      </DataTableHeader>
      <DataTableBody>
        {deptRows.map((row) => {
          const meta = deptCollectionRowDemo(row.name)
          const low = row.rate < 20
          const c = barColor(row.rate)
          const isExpanded = expanded[row.name] ?? false
          const teams = deptManagerTeams(row.name, row.employees, row.rate)
          return (
            <Fragment key={row.name}>
              <DataTableRow
                variant={low ? 'warn' : 'default'}
                onClick={() => setExpanded((prev) => ({ ...prev, [row.name]: !isExpanded }))}
              >
                <DataTableCell className="!px-2 w-6">
                  <span
                    className="material-symbols-outlined text-[#94a3b8] text-base transition-transform"
                    style={{ transform: isExpanded ? 'rotate(90deg)' : undefined }}
                  >
                    chevron_right
                  </span>
                </DataTableCell>
                <DataTableCell className="font-semibold">
                  {row.name}
                  {low ? <span className="wfr-coll-table__badge">Needs attention</span> : null}
                </DataTableCell>
                <DataTableCell className="text-[#475569]">{meta.manager}</DataTableCell>
                <DataTableCell align="right" numeric>{row.employees.toLocaleString()}</DataTableCell>
                <DataTableCell>
                  <span className="wfr-coll-table__channels">
                    <span aria-hidden>{resolvedChannel.iconSrc ? <img src={resolvedChannel.iconSrc} alt="" style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: -2 }} /> : resolvedChannel.icon}</span>
                    {resolvedChannel.label}
                  </span>
                </DataTableCell>
                <DataTableCell metric>
                  <div className="wfr-coll-table__progress">
                    <div className="wfr-coll-table__track" aria-hidden>
                      <div className="wfr-coll-table__fill" style={{ width: `${row.rate}%`, background: c }} />
                    </div>
                    <span className="wfr-coll-table__pct tabular-nums" style={{ color: c }}>
                      {row.rate}%
                    </span>
                  </div>
                </DataTableCell>
                <DataTableCell className="text-[#94a3b8] text-[13px]">{activityLabel(row.name)}</DataTableCell>
              </DataTableRow>
              {isExpanded
                ? teams.map((team) => {
                    const tc = barColor(team.responseRate)
                    return (
                      <DataTableRow key={`${row.name}-${team.manager}`} className="bg-[#f8fafc]">
                        <DataTableCell className="!px-2 w-6" />
                        <DataTableCell className="!pl-10">
                          <div className="text-[#475569] text-[13px]">{team.manager}</div>
                          <div className="text-[#94a3b8] text-[11px]">{team.title}</div>
                        </DataTableCell>
                        <DataTableCell />
                        <DataTableCell align="right" numeric className="text-[13px]">{team.employees.toLocaleString()}</DataTableCell>
                        <DataTableCell />
                        <DataTableCell metric>
                          <div className="wfr-coll-table__progress">
                            <div className="wfr-coll-table__track" aria-hidden>
                              <div className="wfr-coll-table__fill" style={{ width: `${team.responseRate}%`, background: tc }} />
                            </div>
                            <span className="wfr-coll-table__pct tabular-nums" style={{ color: tc }}>
                              {team.responseRate}%
                            </span>
                          </div>
                        </DataTableCell>
                        <DataTableCell />
                      </DataTableRow>
                    )
                  })
                : null}
            </Fragment>
          )
        })}
      </DataTableBody>
    </DataTable>
  )
}
