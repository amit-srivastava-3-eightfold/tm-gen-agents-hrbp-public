import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import {
  Badge, Button, Pill,
  DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableHead, DataTableCell,
} from '@tonyh-2-eightfold/ef-design-system'
import {
  departments,
  EM,
  ORG,
  deptGapHeadcount,
  deptPeopleInAugRoles,
  getEmployeesForRole,
  getRolesForDept,
  tGap,
  wfrDemoDeptResponseRate,
  wfrRollupDepartmentsByName,
  type Dept,
  type RoleRowType,
} from '../../data/wfrOrgData'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/Breadcrumb'
// import { CollectionProgressPanel } from './CollectionProgressPanel'
import { deptReadinessTrend, deptManagerTeams } from './collectionHelpers'
import './CollectionProgressPanel.css'
import { FocusFirstModule, type FocusCollectionLaunchSummary } from './FocusFirstModule'
import { UpskillingLaunchDialog, type UpskillingLaunchSummary } from './UpskillingLaunchDialog'
// FocusCollectionDetailSheet removed — collection progress is now inline in the table panel tabs
import { MetricCard } from './MetricCard'
import { ReadinessTrendSheet } from './ReadinessTrendSheet'
import { WorkforceMetricSheet, type WorkforceMetricSheetId } from './WorkforceMetricSheet'
import './WorkforceReadinessDashboard.css'

const READINESS_SEMICIRCLE = {
  hero: {
    dim: 260,
    r: 98,
    sw: 18,
    cy: 178,
    vbY: 52,
    vbH: 128,
    labelGroupY: 188,
    pctDy: -16,
    svgClass: 'wfr-metric-arc--lg wfr-metric-arc--readiness-hero wfr-metric-arc--semicircle',
  },
  compact: {
    dim: 136,
    r: 52,
    sw: 10,
    cy: 94,
    vbY: 26,
    vbH: 70,
    labelGroupY: 102,
    pctDy: -9,
    svgClass: 'wfr-metric-arc--readiness-hero wfr-metric-arc--semicircle wfr-metric-arc--semicircle--compact',
  },
} as const

/** Upper semicircle gauge = AI readiness only. `compact` = smaller copy for department header. */
function MetricArcReadinessSemicircle({
  readiness,
  compact = false,
}: {
  readiness: number
  compact?: boolean
}) {
  const cfg = compact ? READINESS_SEMICIRCLE.compact : READINESS_SEMICIRCLE.hero
  const { dim, r, sw, cy, vbY, vbH, labelGroupY, pctDy, svgClass } = cfg
  const cx = dim / 2
  const rad = (d: number) => (d * Math.PI) / 180
  const arc = (pct: number) => {
    const sweepDeg = (pct / 100) * 180
    const a1 = 180
    const a2 = 180 + sweepDeg
    const x1 = cx + r * Math.cos(rad(a1))
    const y1 = cy + r * Math.sin(rad(a1))
    const x2 = cx + r * Math.cos(rad(a2))
    const y2 = cy + r * Math.sin(rad(a2))
    const largeArc = sweepDeg > 180 ? 1 : 0
    return `M${x1} ${y1} A${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }
  return (
    <div
      className="flex shrink-0 flex-col items-center gap-0"
      role="img"
      aria-label={`AI readiness ${readiness} percent of augmentable-role headcount`}
    >
      <svg
        className={`wfr-metric-arc wfr-metric-arc--semicircle ${svgClass}`}
        width={dim}
        height={vbH}
        viewBox={`0 ${vbY} ${dim} ${vbH}`}
        overflow="visible"
        aria-hidden
      >
        <path d={arc(100)} fill="none" stroke="#f1f5f9" strokeWidth={sw} strokeLinecap="round" />
        <path
          d={arc(readiness)}
          fill="none"
          stroke="var(--wfr-readiness)"
          strokeWidth={sw}
          strokeLinecap="round"
        />
        <g transform={`translate(${cx}, ${labelGroupY})`} className="wfr-metric-arc__semicircle-labels">
          <text
            x={0}
            y={pctDy}
            textAnchor="middle"
            dominantBaseline="text-after-edge"
            className="wfr-metric-arc__pct wfr-metric-arc__pct--readiness-hero"
          >
            {readiness}%
          </text>
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="text-after-edge"
            className="wfr-metric-arc__label"
          >
            AI READINESS
          </text>
        </g>
      </svg>
    </div>
  )
}

const ARC_SM = { dim: 102, r: 40, sw: 6, vbH: 102, svgH: 90 } as const

function MetricArc({
  potential,
  readiness,
  size,
  showLegend = true,
  showInteriorLabels = true,
}: {
  potential: number
  readiness: number
  size: 'lg' | 'sm'
  showLegend?: boolean
  showInteriorLabels?: boolean
}) {
  if (size === 'lg') {
    return <MetricArcReadinessSemicircle readiness={readiness} />
  }

  const { dim, r, sw, vbH, svgH } = ARC_SM
  const cx = dim / 2
  const cy = dim / 2
  const rad = (d: number) => (d * Math.PI) / 180
  const arc = (pct: number) => {
    const s = 210
    const sw2 = (pct / 100) * 120
    const x1 = cx + r * Math.cos(rad(s))
    const y1 = cy + r * Math.sin(rad(s))
    const x2 = cx + r * Math.cos(rad(s + sw2))
    const y2 = cy + r * Math.sin(rad(s + sw2))
    return `M${x1} ${y1} A${r} ${r} 0 ${sw2 > 180 ? 1 : 0} 1 ${x2} ${y2}`
  }
  const ty = { lab: 7, ready: 20 }
  const pctY = showInteriorLabels ? cy - 5 : cy
  return (
    <div className="flex flex-col items-center gap-0">
      <svg
        className={`wfr-metric-arc wfr-metric-arc--sm ${!showInteriorLabels ? 'wfr-metric-arc--number-only' : ''}`}
        width={dim}
        height={showInteriorLabels ? svgH : 76}
        viewBox={`0 0 ${dim} ${vbH}`}
        overflow="visible"
        aria-hidden
      >
        <path d={arc(100)} fill="none" stroke="#f1f5f9" strokeWidth={sw} strokeLinecap="round" />
        <path
          d={arc(potential)}
          fill="none"
          stroke="var(--wfr-potential)"
          strokeWidth={sw}
          strokeLinecap="round"
          opacity={0.85}
        />
        <path d={arc(readiness)} fill="none" stroke="var(--wfr-readiness)" strokeWidth={sw} strokeLinecap="round" />
        <text
          x={cx}
          y={pctY}
          textAnchor="middle"
          {...(!showInteriorLabels ? { dominantBaseline: 'central' as const } : {})}
          className="wfr-metric-arc__pct"
        >
          {potential}%
        </text>
        {showInteriorLabels && (
          <>
            <text x={cx} y={cy + ty.lab} textAnchor="middle" className="wfr-metric-arc__label">
              AI POTENTIAL
            </text>
            <text x={cx} y={cy + ty.ready} textAnchor="middle" className="wfr-metric-arc__ready">
              {readiness}% ready
            </text>
          </>
        )}
      </svg>
      {showLegend && (
        <div className="mt-1 flex gap-3.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-[var(--wfr-potential)]" />
            <span className="wfr-type-caption-sb wfr-text-potential">Potential</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-[var(--wfr-readiness)]" />
            <span className="wfr-type-caption-sb wfr-text-readiness">Readiness</span>
          </div>
        </div>
      )}
    </div>
  )
}

const METRIC_INFO = {
  readiness: 'People in augmentable roles using AI effectively ÷ total people in augmentable roles',
  potential: 'Tasks in augmentation zone (15–75%) ÷ total role tasks',
  gap: 'People in augmentable roles not yet AI-ready — your upskilling pool',
} as const

function MetricHeaderLabel({ label, metric }: { label: string; metric: keyof typeof METRIC_INFO }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <span
        className="material-symbols-outlined wfr-dash__header-info"
        title={METRIC_INFO[metric]}
        style={{ fontSize: 14, color: '#94a3b8', cursor: 'help', verticalAlign: -1 }}
      >
        info
      </span>
    </span>
  )
}

function DeptTableSoloBar({
  variant,
  pct,
  width = 120,
}: {
  variant: 'potential' | 'readiness'
  pct: number
  width?: number
}) {
  return (
    <div className="wfr-dept-bar-solo" style={{ width }}>
      <div className="wfr-readiness-bar">
        {variant === 'potential' ? (
          <div className="wfr-readiness-bar__pot wfr-readiness-bar__solo" style={{ width: `${pct}%` }} />
        ) : (
          <div className="wfr-readiness-bar__ready wfr-readiness-bar__solo" style={{ width: `${pct}%` }} />
        )}
      </div>
      <div
        className={`mt-1 wfr-type-caption-sb tabular-nums ${variant === 'potential' ? 'wfr-text-potential' : 'wfr-readiness-bar__label-readiness'}`}
      >
        {pct}%
      </div>
    </div>
  )
}

const ROLE_OUTLOOK = {
  urgent: { label: 'Urgent', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  developing: { label: 'Developing', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  'on-track': { label: 'On track', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
} as const

function roleOutlook(role: RoleRowType): keyof typeof ROLE_OUTLOOK {
  const gap = tGap(role.aiPotential, role.aiReadiness)
  if (gap >= 35) return 'urgent'
  if (gap >= 15) return 'developing'
  return 'on-track'
}


function DeptView({
  dept,
  orgCollectionActive,
  orgCollectionComplete,
  collectionJustCompleted: deptCollectionJustCompleted,
  onCollectionActiveChange,
  onCollectionComplete,
  onViewResults: deptOnViewResults,
  collectionLaunchSummary,
  focusLaunchOpen,
  setFocusLaunchOpen,
  upskillingActive,
  upskillingLaunchSummary,
}: {
  dept: Dept
  orgCollectionActive: boolean
  orgCollectionComplete?: boolean
  collectionJustCompleted?: boolean
  onCollectionActiveChange: (active: boolean, launchSummary?: FocusCollectionLaunchSummary | null) => void
  onCollectionComplete?: () => void
  onViewResults?: () => void
  collectionLaunchSummary: FocusCollectionLaunchSummary | null
  focusLaunchOpen: boolean
  setFocusLaunchOpen: (open: boolean) => void
  upskillingActive: boolean
  upskillingLaunchSummary: UpskillingLaunchSummary | null
}) {
  const [openMetric, setOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
  const [expandedManagers, setExpandedManagers] = useState<Record<string, boolean>>({})
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [trendSheetManager, setTrendSheetManager] = useState<{ manager: string; mgrIndex: number } | null>(null)
  const [deptUpskillingOpen, setDeptUpskillingOpen] = useState(false)
  const [deptUpskillingRoles, setDeptUpskillingRoles] = useState<Record<string, boolean>>({})
  const deptRolesPanelRef = useRef<HTMLDivElement>(null)
  const roles = getRolesForDept(dept.name)
  const sorted = [...roles].sort((a, b) => tGap(b.aiPotential, b.aiReadiness) - tGap(a.aiPotential, a.aiReadiness))
  const deptAug = deptPeopleInAugRoles(dept)
  const gapCount = deptGapHeadcount(dept)
  const deptReady = Math.max(0, deptAug - gapCount)
  const gapSharePct = deptAug > 0 ? Math.min(100, Math.round((gapCount / deptAug) * 100)) : 0
  const deptHrsUnlocked = Math.round(gapCount * ORG.hrsPerPersonWeek)

  const deptCards = [
    {
      id: 'readiness' as const,
      label: 'AI readiness',
      val: `${dept.aiReadiness}%`,
      icon: 'school',
      l1: `${deptReady.toLocaleString()} of ${deptAug.toLocaleString()} people in those roles show profile signals of AI readiness.`,
      hint: `Org average ${ORG.aiReadiness}%.`,
    },
    {
      id: 'potential' as const,
      label: 'AI potential',
      val: `${dept.aiPotential}%`,
      icon: 'auto_awesome',
      l1: `${ORG.tasksInAugZone} of ${ORG.totalRoleTasks} tasks in the augmentation zone`,
      hint: `${ORG.tasksAboveThreshold} automatable, ${ORG.tasksBelowThreshold} human-only`,
    },
    {
      id: 'gap' as const,
      label: 'Transformation gap',
      val: gapCount.toLocaleString(),
      icon: 'groups',
      l1: `${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready—that’s your prioritized development pool.`,
      hint: `${gapSharePct}% of augmentable-role headcount still in the gap.`,
    },
  ]

  return (
    <div className="wfr-dash flex flex-col gap-6">
      <header className="wfr-dash__hero wfr-dash__dept-hero">
        <div className="shrink-0">
          <MetricArcReadinessSemicircle readiness={dept.aiReadiness} compact />
        </div>
        <div className="wfr-dash__hero-copy">
          <p className="wfr-dash__eyebrow">
            {dept.employees.toLocaleString()} employees {EM} {dept.name} {EM} HRBP: {deptManagerTeams(dept.name, dept.employees)[0]?.manager ?? '—'} {EM} Q1 2026
          </p>
          <h2 className="wfr-dash__headline">
            <span className="wfr-dash__headline-pct wfr-text-readiness">{dept.aiReadiness}%</span>
            <span className="wfr-dash__headline-text">
              {' '}
              of people in <strong>{dept.name}</strong> are showing AI readiness signals.
            </span>
          </h2>
          <p className="wfr-dash__dept-subheadline">
            {`With ${gapCount.toLocaleString()} employees not yet AI-ready, this is one of your largest upskilling\u00A0opportunities.`}
          </p>
          <div className="wfr-dash__capture-tag-wrap">
            <Pill variant="neutral" size="small" className="wfr-dash__capture-tag !h-auto !max-w-none !py-2 !px-3.5">
              <span className="wfr-dash__capture-tag-text wfr-type-body2 text-[#1a212e]">
                ~
                <span className="font-bold text-[#b91c1c]">{gapCount.toLocaleString()}</span>
                {` employees in augmentable\u00A0roles are not\u00A0yet\u00A0AI-ready.`}
              </span>
            </Pill>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <FocusFirstModule
          collectionActive={orgCollectionActive}
          collectionComplete={orgCollectionComplete}
          collectionJustCompleted={deptCollectionJustCompleted}
          onCollectionActiveChange={onCollectionActiveChange}
          onCollectionComplete={onCollectionComplete}
          onViewResults={deptOnViewResults}
          launchOpen={focusLaunchOpen}
          onLaunchOpenChange={setFocusLaunchOpen}
          onRequestCloseMetricSheet={() => setOpenMetric(null)}
          deptContext={dept}
          collectionLaunchSummary={collectionLaunchSummary}
          onScrollToTable={() => document.getElementById('dept-collection-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          onStartUpskilling={() => {
            // Pre-select urgent and developing roles
            const preSelected: Record<string, boolean> = {}
            sorted.forEach((r) => {
              const ol = roleOutlook(r)
              if (ol === 'urgent' || ol === 'developing') preSelected[r.title] = true
            })
            setDeptUpskillingRoles(preSelected)
            setDeptUpskillingOpen(true)
          }}
          upskillingActive={upskillingActive}
          upskillingLaunchSummary={upskillingLaunchSummary}
        />

        <div className="wfr-dash__cards-row">
          {deptCards.map((c) => (
            <MetricCard
              key={c.id}
              variant={c.id}
              icon={c.icon}
              label={c.label}
              value={c.val}
              description={c.l1}
              hint={c.hint}
              onLearnMore={() => setOpenMetric(c.id)}
            />
          ))}
        </div>

        <WorkforceMetricSheet
          metric={openMetric}
          onClose={() => setOpenMetric(null)}
          ready={deptReady}
          gapPeople={gapCount}
          hrsUnlocked={deptHrsUnlocked}
          departmentGap={{
            departmentName: dept.name,
            peopleInAugRoles: deptAug,
            ready: deptReady,
            gapPeople: gapCount,
            hrsUnlocked: deptHrsUnlocked,
          }}
          dataCollection={
            orgCollectionActive && collectionLaunchSummary
              ? {
                  scopeLabel: collectionLaunchSummary.scopeLabel,
                  channelsLabel: collectionLaunchSummary.channelsLabel,
                  delegated: collectionLaunchSummary.delegated,
                }
              : null
          }
        />
      </div>

      <div ref={deptRolesPanelRef} id="wfr-dept-roles-panel">
        {(() => {
          const managers = deptManagerTeams(dept.name, dept.employees)
          const deptRoles = getRolesForDept(dept.name)
          const rawEmps = getEmployeesForRole({ title: dept.name, employees: dept.employees, aiReadiness: dept.aiReadiness, aiPotential: dept.aiPotential } as RoleRowType)
          const allDeptEmps = rawEmps.map((e, i) => ({
            ...e,
            title: deptRoles.length > 0 ? deptRoles[i % deptRoles.length].title : undefined,
          }))
          const deptInUpskilling = upskillingActive && upskillingLaunchSummary?.departmentNames?.includes(dept.name)
          return (
            <div>
              <div className="wfr-dash__panel-head">
                <h3 className="wfr-dash__panel-title">{dept.name} — Team readiness</h3>
                <span className="wfr-dash__panel-hint">Sorted by team size {EM} click to expand</span>
              </div>
              <DataTable bordered>
                <DataTableHeader>
                  <DataTableRow>
                    {orgCollectionComplete ? (
                      <DataTableHead shrink>
                        <input
                          type="checkbox"
                          className="wfr-dash__table-check"
                          checked={selectedRows.size > 0 && managers.every((m) => selectedRows.has(`dept-${dept.name}-${m.manager}`))}
                          onChange={() => {
                            const allSelected = managers.every((m) => selectedRows.has(`dept-${dept.name}-${m.manager}`))
                            const next = new Set(selectedRows)
                            managers.forEach((m) => {
                              const key = `dept-${dept.name}-${m.manager}`
                              if (allSelected) next.delete(key)
                              else next.add(key)
                            })
                            setSelectedRows(next)
                          }}
                        />
                      </DataTableHead>
                    ) : null}
                    <DataTableHead>Manager</DataTableHead>
                    <DataTableHead numeric>Employees</DataTableHead>
                    <DataTableHead metric><MetricHeaderLabel label="AI readiness" metric="readiness" /></DataTableHead>
                    <DataTableHead metric><MetricHeaderLabel label="AI potential" metric="potential" /></DataTableHead>
                    <DataTableHead numeric><MetricHeaderLabel label="Gap" metric="gap" /></DataTableHead>
                    {orgCollectionActive && !orgCollectionComplete ? (
                      <>
                        <DataTableHead metric className="bg-[#f8fafc] border-l border-[#e2e8f0]">Collection progress</DataTableHead>
                        <DataTableHead className="bg-[#f8fafc]">Channels</DataTableHead>
                      </>
                    ) : null}
                    {deptInUpskilling ? (
                      <DataTableHead className="">Upskilling status</DataTableHead>
                    ) : null}
                    {orgCollectionComplete ? (
                      <>
                        <DataTableHead>Development plan</DataTableHead>
                        <DataTableHead shrink />
                      </>
                    ) : null}
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {managers.sort((a, b) => b.employees - a.employees).map((mgr, mi) => {
                    const mgrKey = `dept-${dept.name}-${mgr.manager}`
                    const isMgrExpanded = expandedManagers[mgrKey] ?? false
                    const startIdx = managers.slice(0, mi).reduce((s, m) => s + m.employees, 0)
                    const mgrEmployees = allDeptEmps.slice(startIdx, Math.min(startIdx + mgr.employees, allDeptEmps.length))
                    const baseMgrReadiness = mgrEmployees.length > 0
                      ? Math.round(mgrEmployees.reduce((s, e) => s + e.readinessPct, 0) / mgrEmployees.length)
                      : dept.aiReadiness
                    const deptTrendDelta = orgCollectionComplete ? deptReadinessTrend(dept.name).delta : 0
                    const mgrReadiness = Math.max(0, Math.min(100, baseMgrReadiness + deptTrendDelta))
                    const mgrGap = Math.round(mgr.employees * (1 - mgrReadiness / 100))
                    const inScope = collectionLaunchSummary?.scopedDepartmentNames?.includes(dept.name)
                    const mgrResponseRate = inScope ? Math.min(100, wfrDemoDeptResponseRate(dept.name) + ((mgr.manager.length * 3) % 20) - 10) : 0
                    const showCollection = orgCollectionActive && !orgCollectionComplete
                    return (
                      <Fragment key={mgrKey}>
                        <DataTableRow onClick={() => setExpandedManagers(prev => ({ ...prev, [mgrKey]: !isMgrExpanded }))}>
                          {orgCollectionComplete ? (
                            <DataTableCell className="!w-[1%] !pl-3 !pr-0">
                              <input
                                type="checkbox"
                                className="wfr-dash__table-check"
                                checked={selectedRows.has(mgrKey)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => {
                                  const next = new Set(selectedRows)
                                  if (next.has(mgrKey)) next.delete(mgrKey)
                                  else next.add(mgrKey)
                                  setSelectedRows(next)
                                }}
                              />
                            </DataTableCell>
                          ) : null}
                          <DataTableCell className="font-semibold">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[16px] transition-transform" style={{ color: isMgrExpanded ? '#3b5bdb' : '#94a3b8', transform: isMgrExpanded ? 'rotate(90deg)' : undefined }}>chevron_right</span>
                              <div>
                                <div>{mgr.manager}</div>
                                <div className="text-[#94a3b8] text-[11px] font-normal">{mgr.title}</div>
                              </div>
                            </div>
                          </DataTableCell>
                          <DataTableCell align="right" numeric>{mgr.employees.toLocaleString()}</DataTableCell>
                          <DataTableCell metric>
                            {orgCollectionComplete ? (() => {
                              const deptTrend = deptReadinessTrend(dept.name)
                              return (
                                <div className="wfr-dash__readiness-with-trend">
                                  <DeptTableSoloBar variant="readiness" pct={mgrReadiness} />
                                  <button type="button" className={`wfr-dash__trend-badge ${deptTrend.direction === 'up' ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setTrendSheetManager({ manager: mgr.manager, mgrIndex: mi }) }} title="View readiness trend details">
                                    <span className="wfr-dash__trend-badge-text">{deptTrend.direction === 'up' ? '↑' : '↓'}{Math.abs(deptTrend.delta)}pt</span>
                                    <span className="material-symbols-outlined wfr-dash__trend-badge-icon">info</span>
                                  </button>
                                </div>
                              )
                            })() : <DeptTableSoloBar variant="readiness" pct={mgrReadiness} />}
                          </DataTableCell>
                          <DataTableCell metric><DeptTableSoloBar variant="potential" pct={dept.aiPotential} /></DataTableCell>
                          <DataTableCell align="right">
                            <span className="wfr-type-h6 tabular-nums" style={{ color: mgrGap > mgr.employees * 0.5 ? '#dc2626' : mgrGap > mgr.employees * 0.3 ? '#d97706' : '#15803d' }}>
                              {mgrGap.toLocaleString()}
                            </span>
                          </DataTableCell>
                          {showCollection ? (
                            <>
                              <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]">
                                {inScope ? (
                                  <div className="wfr-dash__plan-progress">
                                    <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(217, 119, 6, 0.15)' }}>
                                      <div className="wfr-dash__plan-progress-fill" style={{ width: `${Math.max(0, mgrResponseRate)}%`, background: '#d97706' }} />
                                    </div>
                                    <span className="wfr-dash__plan-progress-label">{Math.max(0, mgrResponseRate)}%</span>
                                  </div>
                                ) : <span className="text-[11px] text-[#94a3b8]">—</span>}
                              </DataTableCell>
                              <DataTableCell className="bg-[#fafbfc]">
                                {inScope ? (
                                  <span className="inline-flex items-center gap-1.5 text-[13px] text-[#1a212e]">
                                    {(collectionLaunchSummary?.channelsLabel ?? '').includes('AI') ? (
                                      <img src="/ai-agent-icon.svg" alt="" style={{ width: 16, height: 16 }} />
                                    ) : (
                                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assignment</span>
                                    )}
                                    {collectionLaunchSummary?.channelsLabel ?? 'Survey'}
                                  </span>
                                ) : <span className="text-[11px] text-[#94a3b8]">—</span>}
                              </DataTableCell>
                            </>
                          ) : null}
                          {deptInUpskilling ? (
                            <DataTableCell className="">
                              {(() => {
                                const mgrPlanPct = 35 + Math.abs((mgr.manager.length * 7) % 40)
                                return (
                                  <div className="wfr-dash__plan-progress">
                                    <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(217, 119, 6, 0.15)' }}>
                                      <div className="wfr-dash__plan-progress-fill" style={{ width: `${mgrPlanPct}%`, background: '#d97706' }} />
                                    </div>
                                    <span className="wfr-dash__plan-progress-label">{mgrPlanPct}%</span>
                                  </div>
                                )
                              })()}
                            </DataTableCell>
                          ) : null}
                          {orgCollectionComplete ? (
                            <>
                              <DataTableCell>
                                <span className="text-[12px] text-[#94a3b8]">—</span>
                              </DataTableCell>
                              <DataTableCell>
                                <button
                                  type="button"
                                  className="wfr-dash__assign-btn"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Assign
                                </button>
                              </DataTableCell>
                            </>
                          ) : null}
                        </DataTableRow>
                        {isMgrExpanded && mgrEmployees.map((emp, ei) => {
                          // Deterministic responded status per employee
                          const empHash = emp.name.split('').reduce((h: number, c: string) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
                          const empResponded = inScope && (Math.abs(empHash) % 100) < Math.max(0, mgrResponseRate)
                          return (
                            <DataTableRow key={`${mgrKey}-${ei}`} className="bg-[#fdfdfe]">
                              {orgCollectionComplete ? <DataTableCell className="!w-[1%]" /> : null}
                              <DataTableCell className="!pl-[52px]">
                                <div className="text-[13px] text-[#475569]">{emp.name}</div>
                                {emp.title ? <div className="text-[11px] text-[#94a3b8]">{emp.title}</div> : null}
                              </DataTableCell>
                              <DataTableCell className="text-[12px] text-[#94a3b8]" />
                              <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={emp.readinessPct} /></DataTableCell>
                              <DataTableCell metric>
                                {emp.title ? (
                                  <div>
                                    <DeptTableSoloBar variant="potential" pct={deptRoles.find(r => r.title === emp.title)?.aiPotential ?? dept.aiPotential} />
                                    <div className="text-[10px] text-[#94a3b8] mt-0.5">Role: {emp.title}</div>
                                  </div>
                                ) : null}
                              </DataTableCell>
                              <DataTableCell align="right">
                                {emp.readinessPct < 50 ? (
                                  <span className="text-[12px] font-medium text-[#dc2626]">Not AI-ready</span>
                                ) : (
                                  <span className="text-[12px] font-medium text-[#15803d]">AI-ready</span>
                                )}
                              </DataTableCell>
                              {showCollection ? (
                                <>
                                  <DataTableCell className="bg-[#fafbfc] border-l border-[#e2e8f0]">
                                    {inScope ? (
                                      <span className={`inline-flex items-center gap-1 text-[12px] ${empResponded ? 'text-[#15803d]' : 'text-[#94a3b8]'}`}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                          {empResponded ? 'check_circle' : 'pending'}
                                        </span>
                                        {empResponded ? 'Responded' : 'Pending'}
                                      </span>
                                    ) : <span className="text-[11px] text-[#94a3b8]">—</span>}
                                  </DataTableCell>
                                  <DataTableCell className="bg-[#fafbfc]">
                                    {inScope ? (
                                      <span className="inline-flex items-center gap-1 text-[12px] text-[#1a212e]">
                                        {(collectionLaunchSummary?.channelsLabel ?? '').includes('AI') ? (
                                          <img src="/ai-agent-icon.svg" alt="" style={{ width: 14, height: 14 }} />
                                        ) : (
                                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>assignment</span>
                                        )}
                                        {collectionLaunchSummary?.channelsLabel ?? 'Survey'}
                                      </span>
                                    ) : <span className="text-[11px] text-[#94a3b8]">—</span>}
                                  </DataTableCell>
                                </>
                              ) : null}
                              {deptInUpskilling ? <DataTableCell className="" /> : null}
                              {orgCollectionComplete ? (
                                <>
                                  <DataTableCell>
                                    <span className="text-[12px] text-[#94a3b8]">—</span>
                                  </DataTableCell>
                                  <DataTableCell>
                                    <button
                                      type="button"
                                      className="wfr-dash__assign-btn"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Assign
                                    </button>
                                  </DataTableCell>
                                </>
                              ) : null}
                            </DataTableRow>
                          )
                        })}
                      </Fragment>
                    )
                  })}
                </DataTableBody>
              </DataTable>
            </div>
          )
        })()}
      </div>

      {/* Readiness trend detail sheet for dept view */}
      <ReadinessTrendSheet
        open={trendSheetManager != null}
        onClose={() => setTrendSheetManager(null)}
        dept={dept}
        channelsLabel={collectionLaunchSummary?.channelsLabel}
        managerContext={trendSheetManager}
      />

      {/* Dept-level upskilling role selection dialog */}
      {deptUpskillingOpen && (
        <>
          <div className="wfr-focus-launch__overlay" onClick={() => setDeptUpskillingOpen(false)} />
          <div className="wfr-focus-launch__content" style={{ width: 'min(520px, calc(100vw - 32px))' }}>
            <div className="wfr-focus-launch__header">
              <div className="wfr-focus-launch__header-top">
                <h2 className="wfr-focus-launch__dialog-title">Start upskilling — {dept.name}</h2>
                <button type="button" className="wfr-focus-launch__close" onClick={() => setDeptUpskillingOpen(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="wfr-focus-launch__body">
              <h3 className="wfr-focus-launch__title">Which roles should start upskilling?</h3>
              <p className="wfr-focus-launch__sub">Priority roles are pre-selected based on readiness gaps.</p>
              <div className="wfr-focus-launch__dept-list-header">
                <button
                  type="button"
                  className="wfr-focus-launch__select-all"
                  onClick={() => {
                    const allSelected = sorted.every((r) => deptUpskillingRoles[r.title])
                    const next: Record<string, boolean> = {}
                    sorted.forEach((r) => { next[r.title] = !allSelected })
                    setDeptUpskillingRoles(next)
                  }}
                >
                  {sorted.every((r) => deptUpskillingRoles[r.title]) ? 'Deselect all' : 'Select all'}
                </button>
                <span className="wfr-focus-launch__dept-count">
                  {sorted.filter((r) => deptUpskillingRoles[r.title]).length} of {sorted.length} selected
                </span>
              </div>
              <div className="wfr-focus-launch__dept-list">
                {sorted.map((r) => {
                  const checked = !!deptUpskillingRoles[r.title]
                  const ol = roleOutlook(r)
                  const olData = ROLE_OUTLOOK[ol]
                  const gap = r.aiPotential - r.aiReadiness
                  const isTopPriority = ol === 'urgent'
                  return (
                    <button
                      key={r.title}
                      type="button"
                      className={`wfr-focus-launch__dept-row ${checked ? 'wfr-focus-launch__dept-row--on' : ''}`}
                      onClick={() => setDeptUpskillingRoles((prev) => ({ ...prev, [r.title]: !prev[r.title] }))}
                    >
                      <span className="wfr-focus-launch__check">
                        {checked ? '✓' : ''}
                      </span>
                      <div className="wfr-focus-launch__dept-info">
                        <div className="wfr-focus-launch__dept-name-row">
                          <span className="wfr-focus-launch__dept-name">{r.title}</span>
                          {isTopPriority && (
                            <span className="wfr-focus-launch__recommended-tag">Top priority</span>
                          )}
                        </div>
                        <span className="wfr-focus-launch__dept-detail">
                          {r.employees.toLocaleString()} employees · {gap}pt gap · {olData.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="wfr-focus-launch__footer">
              <Button variant="outline" onClick={() => setDeptUpskillingOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={sorted.filter((r) => deptUpskillingRoles[r.title]).length === 0}
                onClick={() => {
                  setDeptUpskillingOpen(false)
                }}
              >
                Create plans&nbsp;→
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

type UpskillingState = 'not_started' | 'delegated' | 'plans_created' | 'in_progress' | 'completed'

function getDeptUpskillingState(deptName: string, launchedDeptNames: string[]): { state: UpskillingState; index: number } {
  const idx = launchedDeptNames.indexOf(deptName)
  if (idx === -1) return { state: 'not_started', index: -1 }
  // Distribute states across launched depts deterministically
  const total = launchedDeptNames.length
  if (total <= 1) return { state: 'delegated', index: idx }
  if (total <= 2) return { state: idx === 0 ? 'in_progress' : 'delegated', index: idx }
  // For 3+ depts: first = completed, next = in_progress, next = plans_created, rest = delegated
  if (idx === 0) return { state: 'completed', index: idx }
  if (idx <= Math.ceil(total * 0.3)) return { state: 'in_progress', index: idx }
  if (idx <= Math.ceil(total * 0.55)) return { state: 'plans_created', index: idx }
  return { state: 'delegated', index: idx }
}

function UpskillingCell({ deptName, gapCount, launchedDeptNames, onStart }: {
  deptName: string
  gapCount: number
  launchedDeptNames: string[]
  onStart: () => void
}) {
  const { state } = getDeptUpskillingState(deptName, launchedDeptNames)
  const planCount = Math.max(2, Math.round(gapCount / 30))
  const nameHash = deptName.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)

  // Not started — always show button so CHRO can ad hoc add any dept
  if (state === 'not_started') {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onStart() }}>
        Start upskilling
      </Button>
    )
  }

  const pctMap: Record<UpskillingState, number> = {
    not_started: 0,
    delegated: 0,
    plans_created: 10 + Math.abs(nameHash % 8),
    in_progress: 35 + Math.abs(nameHash * 3) % 45,
    completed: 100,
  }
  const pct = pctMap[state]
  const isComplete = state === 'completed'
  const fillColor = isComplete ? '#22c55e' : '#818cf8'
  const trackColor = isComplete ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.08)'

  const labelMap: Record<UpskillingState, string> = {
    not_started: 'Not started',
    delegated: 'Delegated to HRBP',
    plans_created: `${planCount} plans created · ${gapCount.toLocaleString()} employees`,
    in_progress: `${planCount} plans · ${gapCount.toLocaleString()} enrolled`,
    completed: `${gapCount.toLocaleString()} employees upskilled`,
  }

  return (
    <div>
      <div className="wfr-dash__plan-progress">
        <div className="wfr-dash__plan-progress-bar" style={{ background: trackColor }}>
          <div className="wfr-dash__plan-progress-fill" style={{ width: `${pct}%`, background: fillColor }} />
        </div>
        <span className="wfr-dash__plan-progress-label" style={isComplete ? { color: '#15803d' } : undefined}>{pct}%</span>
      </div>
      <div className="text-[11px] mt-0.5" style={{ color: isComplete ? '#15803d' : '#64748b' }}>
        {labelMap[state]}
      </div>
    </div>
  )
}

function BoardView({
  onDeptClick,
  focusCollectionActive,
  focusCollectionComplete,
  collectionJustCompleted,
  onCollectionActiveChange,
  onCollectionComplete,
  onViewResults,
  collectionLaunchSummary,
  focusLaunchOpen,
  setFocusLaunchOpen,
  upskillingActive,
  upskillingLaunchSummary,
  upskillingLaunchOpen,
  setUpskillingLaunchOpen,
  setUpskillingActive,
  setUpskillingLaunchSummary,
  scopedDepartments,
}: {
  onDeptClick: (d: Dept) => void
  focusCollectionActive: boolean
  focusCollectionComplete?: boolean
  collectionJustCompleted?: boolean
  onCollectionActiveChange: (active: boolean, launchSummary?: FocusCollectionLaunchSummary | null) => void
  onCollectionComplete?: () => void
  onViewResults?: () => void
  collectionLaunchSummary: FocusCollectionLaunchSummary | null
  focusLaunchOpen: boolean
  setFocusLaunchOpen: (open: boolean) => void
  upskillingActive: boolean
  upskillingLaunchSummary: UpskillingLaunchSummary | null
  upskillingLaunchOpen: boolean
  setUpskillingLaunchOpen: (open: boolean) => void
  setUpskillingActive: (active: boolean) => void
  setUpskillingLaunchSummary: (summary: UpskillingLaunchSummary | null) => void
  scopedDepartments?: string[]
}) {
  const [openMetric, setOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
  const [trendSheetDept, setTrendSheetDept] = useState<Dept | null>(null)

  const scopedRollup = useMemo(() => {
    if (!focusCollectionActive || !collectionLaunchSummary?.scopedDepartmentNames?.length) return null
    return wfrRollupDepartmentsByName(collectionLaunchSummary.scopedDepartmentNames)
  }, [focusCollectionActive, collectionLaunchSummary])

  const allDeptsSorted = useMemo(() => {
    const base = scopedDepartments?.length
      ? departments.filter((d) => scopedDepartments.includes(d.name))
      : departments
    return [...base].sort((a, b) => (b.aiPotential - b.aiReadiness) - (a.aiPotential - a.aiReadiness))
  }, [scopedDepartments])

  // Top 3 departments by gap for opportunity tags in complete state
  const topGapDeptRanks = useMemo(() => {
    const byGap = [...departments].sort((a, b) => (b.aiPotential - b.aiReadiness) - (a.aiPotential - a.aiReadiness))
    const map = new Map<string, number>()
    byGap.slice(0, 3).forEach((d, i) => map.set(d.name, i))
    return map
  }, [])

  const sorted = useMemo(() => {
    const scopeSet =
      focusCollectionActive && collectionLaunchSummary?.scopedDepartmentNames?.length
        ? new Set(collectionLaunchSummary.scopedDepartmentNames)
        : null
    if (!scopeSet) return allDeptsSorted
    return allDeptsSorted.filter((d) => scopeSet.has(d.name))
  }, [focusCollectionActive, collectionLaunchSummary, allDeptsSorted])

  const orgReady = Math.round((ORG.peopleInAugRoles * ORG.aiReadiness) / 100)
  const orgGapPeople = ORG.peopleInAugRoles - orgReady
  const ready = scopedRollup ? scopedRollup.ready : orgReady
  const gapPeople = scopedRollup ? scopedRollup.gapPeople : orgGapPeople
  const peopleInAugForCards = scopedRollup ? scopedRollup.peopleInAugRoles : ORG.peopleInAugRoles
  const aiReadinessPct = scopedRollup ? scopedRollup.aiReadiness : ORG.aiReadiness
  const aiPotentialPct = scopedRollup ? scopedRollup.aiPotential : ORG.aiPotential
  const totalEmployeesHero = scopedRollup ? scopedRollup.totalEmployees : ORG.totalEmployees
  const hrsUnlocked = scopedRollup ? scopedRollup.hrsUnlocked : Math.round(gapPeople * ORG.hrsPerPersonWeek)
  const gapSharePct =
    peopleInAugForCards > 0 ? Math.min(100, Math.round((gapPeople / peopleInAugForCards) * 100)) : 0
  const tasksInAug = scopedRollup ? scopedRollup.tasksInAugZone : ORG.tasksInAugZone
  const totalRoleTasks = scopedRollup ? scopedRollup.totalRoleTasks : ORG.totalRoleTasks
  const tasksAbove = scopedRollup ? scopedRollup.tasksAboveThreshold : ORG.tasksAboveThreshold
  const tasksBelow = scopedRollup ? scopedRollup.tasksBelowThreshold : ORG.tasksBelowThreshold

  const learnMoreDataCollection =
    focusCollectionActive && collectionLaunchSummary
      ? {
          scopeLabel: collectionLaunchSummary.scopeLabel,
          channelsLabel: collectionLaunchSummary.channelsLabel,
          delegated: collectionLaunchSummary.delegated,
        }
      : null

  const cards = [
    {
      id: 'readiness' as const,
      label: 'AI readiness',
      val: `${aiReadinessPct}%`,
      icon: 'school',
      l1: `${ready.toLocaleString()} AI-ready of ${peopleInAugForCards.toLocaleString()} in augmentable roles`,
      hint: scopedRollup
        ? `Scoped to your launch (${collectionLaunchSummary?.scopeLabel}).`
        : 'How much of addressable work the org is already equipped to capture.',
    },
    {
      id: 'potential' as const,
      label: 'AI potential',
      val: `${aiPotentialPct}%`,
      icon: 'auto_awesome',
      l1: `${tasksInAug} of ${totalRoleTasks} tasks in the augmentation zone`,
      hint: `${tasksAbove} automatable, ${tasksBelow} human-only`,
    },
    {
      id: 'gap' as const,
      label: 'Transformation gap',
      val: gapPeople.toLocaleString(),
      icon: 'groups',
      l1: `${gapPeople.toLocaleString()} people in augmentable roles are not yet AI-ready—that’s your prioritized development pool.`,
      hint: `${gapSharePct}% of augmentable-role headcount still in the gap.`,
    },
  ]

  return (
    <div className="wfr-dash">
      <div className="wfr-dash__hero">
        <div className="shrink-0">
          <MetricArc potential={aiPotentialPct} readiness={aiReadinessPct} size="lg" />
        </div>
        <div className="wfr-dash__hero-copy">
          <p className="wfr-dash__eyebrow">
            {totalEmployeesHero.toLocaleString()} employees {EM} Q1 2026
          </p>
          <h2 className="wfr-dash__headline">
            <span className="wfr-dash__headline-pct wfr-text-readiness">{aiReadinessPct}%</span>
            <span className="wfr-dash__headline-text">
              {' '}
              of people in augmentable roles have the skills to start using AI today
              {scopedRollup ? ' (for departments in your launch).' : '.'}
            </span>
          </h2>
          <div className="wfr-dash__capture-tag-wrap">
            <Pill variant="neutral" size="small" className="wfr-dash__capture-tag !h-auto !max-w-none !py-2 !px-3.5">
              <span className="wfr-type-body2 text-[#1a212e]">
                ~<span className="font-bold text-[#b91c1c]">{gapPeople.toLocaleString()}</span> employees in augmentable
                roles are not yet AI-ready.
              </span>
            </Pill>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <FocusFirstModule
          collectionActive={focusCollectionActive}
          collectionComplete={focusCollectionComplete}
          collectionJustCompleted={collectionJustCompleted}
          onCollectionActiveChange={onCollectionActiveChange}
          onCollectionComplete={onCollectionComplete}
          onViewResults={onViewResults}
          launchOpen={focusLaunchOpen}
          onLaunchOpenChange={setFocusLaunchOpen}
          onRequestCloseMetricSheet={() => setOpenMetric(null)}
          collectionLaunchSummary={collectionLaunchSummary}
          onScrollToTable={() => document.getElementById('board-collection-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          onStartUpskilling={() => setUpskillingLaunchOpen(true)}
          upskillingActive={upskillingActive}
          upskillingLaunchSummary={upskillingLaunchSummary}
        />

        <div className="wfr-dash__cards-row">
          {cards.map((c) => (
            <MetricCard
              key={c.id}
              variant={c.id}
              icon={c.icon}
              label={c.label}
              value={c.val}
              description={c.l1}
              hint={c.hint}
              onLearnMore={() => setOpenMetric(c.id)}
            />
          ))}
        </div>

        <WorkforceMetricSheet
          metric={openMetric}
          onClose={() => setOpenMetric(null)}
          ready={ready}
          gapPeople={gapPeople}
          hrsUnlocked={hrsUnlocked}
          dataCollection={learnMoreDataCollection}
        />

      </div>

      {focusCollectionComplete ? (
        <div>
          <div className="wfr-dash__panel-head">
            <h3 className="wfr-dash__panel-title">Departmental readiness</h3>
            <span className="wfr-dash__panel-hint">Sorted by priority {EM} click to drill down</span>
          </div>
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Department</DataTableHead>
                <DataTableHead>HRBP</DataTableHead>
                <DataTableHead numeric>Headcount</DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label="AI readiness" metric="readiness" /></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label="AI potential" metric="potential" /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Transformation gap" metric="gap" /></DataTableHead>
                <DataTableHead className={upskillingActive ? "" : ""}>Upskilling</DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {[...allDeptsSorted].sort((a, b) => {
                const aRank = topGapDeptRanks.get(a.name) ?? 999
                const bRank = topGapDeptRanks.get(b.name) ?? 999
                if (aRank !== bRank) return aRank - bRank
                return a.aiReadiness - b.aiReadiness
              }).map((d) => {
                const trend = deptReadinessTrend(d.name)
                const measuredReadiness = d.aiReadiness + trend.delta
                const gapPp = tGap(d.aiPotential, measuredReadiness)
                const gapColor = gapPp >= 50 ? '#dc2626' : gapPp >= 30 ? '#d97706' : '#15803d'
                const gapCount = deptGapHeadcount({ ...d, aiReadiness: measuredReadiness } as unknown as Dept)
                const priorityRank = topGapDeptRanks.get(d.name)
                const isPriority = priorityRank !== undefined
                const managers = deptManagerTeams(d.name, d.employees)
                const hrbp = managers[0]
                return (
                    <DataTableRow key={d.name} onClick={() => onDeptClick(d)}>
                      <DataTableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          {d.name}
                          {isPriority ? (
                            <Badge variant="outline" size="24" className="ml-1 shrink-0 font-semibold" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                              {priorityRank === 0 ? 'Top priority' : 'High priority'}
                            </Badge>
                          ) : null}
                        </div>
                      </DataTableCell>
                      <DataTableCell className="text-[13px] text-[#475569]">{hrbp?.manager ?? '—'}</DataTableCell>
                      <DataTableCell align="right" numeric>{d.employees.toLocaleString()}</DataTableCell>
                      <DataTableCell metric>
                        <div className="wfr-dash__readiness-with-trend">
                          <DeptTableSoloBar variant="readiness" pct={measuredReadiness} />
                          <button type="button" className={`wfr-dash__trend-badge ${trend.direction === 'up' ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setTrendSheetDept(d) }} title="View readiness trend details">
                            <span className="wfr-dash__trend-badge-text">{trend.direction === 'up' ? '↑' : '↓'}{Math.abs(trend.delta)}pt</span>
                            <span className="material-symbols-outlined wfr-dash__trend-badge-icon">info</span>
                          </button>
                        </div>
                      </DataTableCell>
                      <DataTableCell metric><DeptTableSoloBar variant="potential" pct={d.aiPotential} /></DataTableCell>
                      <DataTableCell align="right" title={`${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready`}>
                        <span className="wfr-type-h6 tabular-nums" style={{ color: gapColor }}>{gapCount.toLocaleString()}</span>
                      </DataTableCell>
                      <DataTableCell>
                        <UpskillingCell
                          deptName={d.name}
                          gapCount={gapCount}
                          launchedDeptNames={upskillingLaunchSummary?.departmentNames ?? []}
                          onStart={() => {
                            const prev = upskillingLaunchSummary?.departmentNames ?? []
                            const merged = [...new Set([...prev, d.name])]
                            setUpskillingLaunchSummary({
                              assignOwner: 'hrbp',
                              departmentNames: merged,
                              scopeLabel: merged.length === 1 ? d.name : `${merged.length} departments`,
                              delegated: true,
                              totalEmployees: merged.reduce((sum, name) => {
                                const dept2 = departments.find((x) => x.name === name)
                                return sum + (dept2?.employees ?? 0)
                              }, 0),
                            })
                            setUpskillingActive(true)
                          }}
                        />
                      </DataTableCell>
                    </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>
        </div>
      ) : focusCollectionActive ? (
        <div id="board-collection-table">
          <div className="wfr-dash__panel-head">
            <h3 className="wfr-dash__panel-title">Departmental readiness</h3>
            <span className="wfr-dash__panel-hint">Sorted by gap (largest first) {EM} click to drill down</span>
          </div>
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Department</DataTableHead>
                <DataTableHead>HRBP</DataTableHead>
                <DataTableHead numeric>Headcount</DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label="AI readiness" metric="readiness" /></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label="AI potential" metric="potential" /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Gap" metric="gap" /></DataTableHead>
                <DataTableHead metric className="bg-[#f8fafc] border-l border-[#e2e8f0]">Collection progress</DataTableHead>
                <DataTableHead className="bg-[#f8fafc]">Channels</DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {allDeptsSorted.map((d) => {
                const gapPp = tGap(d.aiPotential, d.aiReadiness)
                const gapColor = gapPp >= 50 ? '#dc2626' : gapPp >= 30 ? '#d97706' : '#15803d'
                const gapCount = deptGapHeadcount(d)
                const inScope = collectionLaunchSummary?.scopedDepartmentNames?.includes(d.name)
                const managers = deptManagerTeams(d.name, d.employees)
                const hrbp = managers[0]
                const responseRate = inScope ? wfrDemoDeptResponseRate(d.name) : 0
                return (
                    <DataTableRow key={d.name} onClick={() => onDeptClick(d)}>
                      <DataTableCell className="font-semibold">{d.name}</DataTableCell>
                      <DataTableCell className="text-[13px] text-[#475569]">{hrbp?.manager ?? '—'}</DataTableCell>
                      <DataTableCell align="right" numeric>{d.employees.toLocaleString()}</DataTableCell>
                      <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={d.aiReadiness} /></DataTableCell>
                      <DataTableCell metric><DeptTableSoloBar variant="potential" pct={d.aiPotential} /></DataTableCell>
                      <DataTableCell align="right" title={`${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready`}>
                        <span className="wfr-type-h6 tabular-nums" style={{ color: gapColor }}>{gapCount.toLocaleString()}</span>
                      </DataTableCell>
                      <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]">
                        {inScope ? (
                          <div className="wfr-dash__plan-progress">
                            <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(217, 119, 6, 0.15)' }}>
                              <div className="wfr-dash__plan-progress-fill" style={{ width: `${responseRate}%`, background: '#d97706' }} />
                            </div>
                            <span className="wfr-dash__plan-progress-label">{responseRate}%</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#94a3b8]">—</span>
                        )}
                      </DataTableCell>
                      <DataTableCell className="bg-[#fafbfc]">
                        {inScope ? (
                          <span className="inline-flex items-center gap-1.5 text-[13px] text-[#1a212e]">
                            {(collectionLaunchSummary?.channelsLabel ?? 'Survey').includes('AI') ? (
                              <img src="/ai-agent-icon.svg" alt="" style={{ width: 16, height: 16, display: 'inline-block' }} />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assignment</span>
                            )}
                            {collectionLaunchSummary?.channelsLabel ?? 'Survey'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#94a3b8]">—</span>
                        )}
                      </DataTableCell>
                    </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>
        </div>
      ) : (
        <div>
          <div className="wfr-dash__panel-head">
            <h3 className="wfr-dash__panel-title">Departmental readiness</h3>
            <span className="wfr-dash__panel-hint">Sorted by gap (largest first) {EM} click to drill down</span>
          </div>
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Department</DataTableHead>
                <DataTableHead>HRBP</DataTableHead>
                <DataTableHead numeric>Headcount</DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label="AI readiness" metric="readiness" /></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label="AI potential" metric="potential" /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Transformation gap" metric="gap" /></DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {sorted.map((d) => {
                const gapPp = tGap(d.aiPotential, d.aiReadiness)
                const gapColor = gapPp >= 50 ? '#dc2626' : gapPp >= 30 ? '#d97706' : '#15803d'
                const gapCount = deptGapHeadcount(d)
                const managers = deptManagerTeams(d.name, d.employees)
                const hrbp = managers[0]
                return (
                    <DataTableRow key={d.name} onClick={() => onDeptClick(d)}>
                      <DataTableCell className="font-semibold">{d.name}</DataTableCell>
                      <DataTableCell className="text-[13px] text-[#475569]">{hrbp?.manager ?? '—'}</DataTableCell>
                      <DataTableCell align="right" numeric>{d.employees.toLocaleString()}</DataTableCell>
                      <DataTableCell metric>
                        <DeptTableSoloBar variant="readiness" pct={d.aiReadiness} />
                      </DataTableCell>
                      <DataTableCell metric>
                        <DeptTableSoloBar variant="potential" pct={d.aiPotential} />
                      </DataTableCell>
                      <DataTableCell align="right" title={`${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready`}>
                        <span className="wfr-type-h6 tabular-nums" style={{ color: gapColor }}>{gapCount.toLocaleString()}</span>
                      </DataTableCell>
                    </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>
        </div>
      )}

      {/* Readiness trend detail sheet — opens when clicking a trend badge in complete state */}
      <ReadinessTrendSheet
        open={trendSheetDept != null}
        onClose={() => setTrendSheetDept(null)}
        dept={trendSheetDept}
        channelsLabel={collectionLaunchSummary?.channelsLabel}
      />

      {/* Upskilling launch wizard */}
      <UpskillingLaunchDialog
        open={upskillingLaunchOpen}
        onOpenChange={setUpskillingLaunchOpen}
        onLaunch={(summary) => {
          setUpskillingActive(true)
          // Merge new departments with any existing launch
          const existingNames = upskillingLaunchSummary?.departmentNames ?? []
          const mergedNames = [...new Set([...existingNames, ...summary.departmentNames])]
          setUpskillingLaunchSummary({
            ...summary,
            departmentNames: mergedNames,
            totalEmployees: departments
              .filter((d) => mergedNames.includes(d.name))
              .reduce((sum, d) => sum + d.employees, 0),
          })
        }}
        priorityDeptNames={
          [...departments]
            .filter((d) => !upskillingLaunchSummary?.departmentNames?.includes(d.name))
            .sort((a, b) => (b.aiPotential - b.aiReadiness) - (a.aiPotential - a.aiReadiness))
            .slice(0, 3)
            .map(d => d.name)
        }
        excludeDeptNames={upskillingLaunchSummary?.departmentNames ?? []}
      />
    </div>
  )
}

export function WorkforceReadinessDashboard({
  onViewChange,
  autoLaunchCollection = false,
  scopedDepartments,
}: {
  onViewChange?: (view: 'board' | 'dept') => void
  autoLaunchCollection?: boolean
  /** When set, only show these departments (HRBP scoped view) */
  scopedDepartments?: string[]
} = {}) {
  const [view, setView] = useState<'board' | 'dept'>('board')
  const [dept, setDept] = useState<Dept | null>(null)
  const [focusCollectionActive, setFocusCollectionActive] = useState(false)
  const [focusCollectionLaunchSummary, setFocusCollectionLaunchSummary] =
    useState<FocusCollectionLaunchSummary | null>(null)
  const [focusLaunchOpen, setFocusLaunchOpen] = useState(autoLaunchCollection)
  const [focusCollectionComplete, setFocusCollectionComplete] = useState(false)
  const [collectionJustCompleted, setCollectionJustCompleted] = useState(false)
  const [upskillingActive, setUpskillingActive] = useState(false)
  const [upskillingLaunchSummary, setUpskillingLaunchSummary] = useState<UpskillingLaunchSummary | null>(null)
  const [upskillingLaunchOpen, setUpskillingLaunchOpen] = useState(false)

  const handleFocusCollectionActiveChange = (
    active: boolean,
    launchSummary?: FocusCollectionLaunchSummary | null,
  ) => {
    setFocusCollectionActive(active)
    if (!active) {
      setFocusCollectionLaunchSummary(null)
    } else if (launchSummary != null) {
      setFocusCollectionLaunchSummary(launchSummary)
    }
  }

  useEffect(() => {
    try {
      sessionStorage.removeItem('tm:wfr-focus-collection-session')
      localStorage.removeItem('tm:wfr-focus-collection-active')
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    onViewChange?.(view)
  }, [view, onViewChange])

  return (
    <>
      {dept && (
        <Breadcrumb className="mb-6 border-b border-[#e5e7eb] pb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => {
                  setView('board')
                  setDept(null)
                }}
              >
                Overview
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{dept.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="min-w-0">
        {view === 'board' && (
          <BoardView
            onDeptClick={(d) => {
              setDept(d)
              setView('dept')
            }}
            focusCollectionActive={focusCollectionActive}
            focusCollectionComplete={focusCollectionComplete}
            collectionJustCompleted={collectionJustCompleted}
            onCollectionActiveChange={handleFocusCollectionActiveChange}
            onCollectionComplete={() => setFocusCollectionComplete(true)}
            onViewResults={() => { setCollectionJustCompleted(false); setFocusCollectionComplete(true) }}
            collectionLaunchSummary={focusCollectionLaunchSummary}
            focusLaunchOpen={focusLaunchOpen}
            setFocusLaunchOpen={setFocusLaunchOpen}
            upskillingActive={upskillingActive}
            upskillingLaunchSummary={upskillingLaunchSummary}
            upskillingLaunchOpen={upskillingLaunchOpen}
            setUpskillingLaunchOpen={setUpskillingLaunchOpen}
            setUpskillingActive={setUpskillingActive}
            setUpskillingLaunchSummary={setUpskillingLaunchSummary}
            scopedDepartments={scopedDepartments}
          />
        )}
        {view === 'dept' && dept && (
          <DeptView
            dept={dept}
            orgCollectionActive={focusCollectionActive}
            orgCollectionComplete={focusCollectionComplete}
            collectionJustCompleted={collectionJustCompleted}
            onCollectionActiveChange={handleFocusCollectionActiveChange}
            onCollectionComplete={() => setFocusCollectionComplete(true)}
            onViewResults={() => { setCollectionJustCompleted(false); setFocusCollectionComplete(true) }}
            collectionLaunchSummary={focusCollectionLaunchSummary}
            focusLaunchOpen={focusLaunchOpen}
            setFocusLaunchOpen={setFocusLaunchOpen}
            upskillingActive={upskillingActive}
            upskillingLaunchSummary={upskillingLaunchSummary}
          />
        )}
      </div>

    </>
  )
}
