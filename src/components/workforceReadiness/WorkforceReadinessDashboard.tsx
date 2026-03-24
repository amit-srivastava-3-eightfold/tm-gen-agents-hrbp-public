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
  const [trendSheetOpen, setTrendSheetOpen] = useState(false)
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
            {dept.employees.toLocaleString()} employees {EM} {dept.name} {EM} Q1 2026
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
          const allDeptEmps = getEmployeesForRole({ title: dept.name, employees: dept.employees, aiReadiness: dept.aiReadiness, aiPotential: dept.aiPotential } as RoleRowType)
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
                    <DataTableHead>Manager</DataTableHead>
                    <DataTableHead numeric>Employees</DataTableHead>
                    <DataTableHead metric>AI readiness</DataTableHead>
                    <DataTableHead metric>AI potential</DataTableHead>
                    <DataTableHead numeric>Gap</DataTableHead>
                    {orgCollectionActive && !orgCollectionComplete ? (
                      <>
                        <DataTableHead metric className="bg-[#fffbeb] border-l border-[#fcd34d]/30">Collection progress</DataTableHead>
                        <DataTableHead className="bg-[#fffbeb]">Channels</DataTableHead>
                      </>
                    ) : null}
                    {deptInUpskilling ? (
                      <DataTableHead className="bg-[#fffbeb] border-l border-[#fcd34d]/30">Upskilling status</DataTableHead>
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
                          <DataTableCell className="font-semibold">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#94a3b8] text-base transition-transform" style={{ transform: isMgrExpanded ? 'rotate(90deg)' : undefined }}>chevron_right</span>
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
                                  <button type="button" className={`wfr-dash__trend-badge ${deptTrend.direction === 'up' ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setTrendSheetOpen(true) }} title="View readiness trend details">
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
                              <DataTableCell metric className="bg-[#fffdf5] border-l border-[#fcd34d]/20">
                                {inScope ? (
                                  <div className="wfr-dash__plan-progress">
                                    <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(217, 119, 6, 0.15)' }}>
                                      <div className="wfr-dash__plan-progress-fill" style={{ width: `${Math.max(0, mgrResponseRate)}%`, background: '#d97706' }} />
                                    </div>
                                    <span className="wfr-dash__plan-progress-label">{Math.max(0, mgrResponseRate)}%</span>
                                  </div>
                                ) : <span className="text-[11px] text-[#94a3b8]">—</span>}
                              </DataTableCell>
                              <DataTableCell className="bg-[#fffdf5]">
                                {inScope ? (
                                  <span className="inline-flex items-center gap-1.5 text-[13px] text-[#1a212e]">
                                    {(collectionLaunchSummary?.channelsLabel ?? '').includes('AI Agent') ? (
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
                            <DataTableCell className="bg-[#fffdf5] border-l border-[#fcd34d]/20">
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
                        </DataTableRow>
                        {isMgrExpanded && mgrEmployees.map((emp, ei) => (
                          <DataTableRow key={`${mgrKey}-${ei}`} className="bg-[#f1f5f9]">
                            <DataTableCell className="!pl-12 text-[13px] text-[#475569]">{emp.name}</DataTableCell>
                            <DataTableCell />
                            <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={emp.readinessPct} width={80} /></DataTableCell>
                            <DataTableCell />
                            <DataTableCell />
                            {showCollection ? <><DataTableCell className="bg-[#fffdf5] border-l border-[#fcd34d]/20" /><DataTableCell className="bg-[#fffdf5]" /></> : null}
                            {deptInUpskilling ? <DataTableCell className="bg-[#fffdf5] border-l border-[#fcd34d]/20" /> : null}
                          </DataTableRow>
                        ))}
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
        open={trendSheetOpen}
        onClose={() => setTrendSheetOpen(false)}
        dept={dept}
        channelsLabel={collectionLaunchSummary?.channelsLabel}
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
}) {
  const [openMetric, setOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
  const [trendSheetDept, setTrendSheetDept] = useState<Dept | null>(null)

  const scopedRollup = useMemo(() => {
    if (!focusCollectionActive || !collectionLaunchSummary?.scopedDepartmentNames?.length) return null
    return wfrRollupDepartmentsByName(collectionLaunchSummary.scopedDepartmentNames)
  }, [focusCollectionActive, collectionLaunchSummary])

  const allDeptsSorted = useMemo(() => {
    return [...departments].sort((a, b) => (b.aiPotential - b.aiReadiness) - (a.aiPotential - a.aiReadiness))
  }, [])

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
                <DataTableHead metric>AI readiness</DataTableHead>
                <DataTableHead metric>AI potential</DataTableHead>
                <DataTableHead numeric>Transformation gap</DataTableHead>
                {upskillingActive ? (
                  <DataTableHead className="bg-[#fffbeb] border-l border-[#fcd34d]/30">Upskilling status</DataTableHead>
                ) : null}
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
                const inUpskilling = upskillingActive && upskillingLaunchSummary?.departmentNames?.includes(d.name)
                const nameHash = d.name.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
                const deptPlanPct = inUpskilling ? (35 + Math.abs(nameHash * 3) % 45) : 0
                const deptPlanCount = inUpskilling ? Math.max(2, Math.round(deptGapHeadcount(d) / 30)) : 0
                const deptEnrolled = inUpskilling ? deptGapHeadcount(d) : 0
                return (
                    <DataTableRow key={d.name} variant={isPriority ? 'warn' : 'default'} onClick={() => onDeptClick(d)}>
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
                      {upskillingActive ? (
                        <DataTableCell className="bg-[#fffdf5] border-l border-[#fcd34d]/20">
                          {inUpskilling ? (
                            <div>
                              <div className="wfr-dash__plan-progress">
                                <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(217, 119, 6, 0.15)' }}>
                                  <div className="wfr-dash__plan-progress-fill" style={{ width: `${deptPlanPct}%`, background: '#d97706' }} />
                                </div>
                                <span className="wfr-dash__plan-progress-label">{deptPlanPct}%</span>
                              </div>
                              <div className="text-[11px] text-[#92400e] mt-1">
                                {deptPlanCount} plans · {deptEnrolled.toLocaleString()} enrolled
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#94a3b8]">Not started</span>
                          )}
                        </DataTableCell>
                      ) : null}
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
                <DataTableHead metric>AI readiness</DataTableHead>
                <DataTableHead metric>AI potential</DataTableHead>
                <DataTableHead numeric>Gap</DataTableHead>
                <DataTableHead metric className="bg-[#fffbeb] border-l border-[#fcd34d]/30">Collection progress</DataTableHead>
                <DataTableHead className="bg-[#fffbeb]">Channels</DataTableHead>
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
                      <DataTableCell metric className="bg-[#fffdf5] border-l border-[#fcd34d]/20">
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
                      <DataTableCell className="bg-[#fffdf5]">
                        {inScope ? (
                          <span className="inline-flex items-center gap-1.5 text-[13px] text-[#1a212e]">
                            {(collectionLaunchSummary?.channelsLabel ?? 'Survey').includes('AI Agent') ? (
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
                <DataTableHead metric>AI readiness</DataTableHead>
                <DataTableHead metric>AI potential</DataTableHead>
                <DataTableHead numeric>Transformation gap</DataTableHead>
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
}: {
  onViewChange?: (view: 'board' | 'dept') => void
} = {}) {
  const [view, setView] = useState<'board' | 'dept'>('board')
  const [dept, setDept] = useState<Dept | null>(null)
  const [focusCollectionActive, setFocusCollectionActive] = useState(false)
  const [focusCollectionLaunchSummary, setFocusCollectionLaunchSummary] =
    useState<FocusCollectionLaunchSummary | null>(null)
  const [focusLaunchOpen, setFocusLaunchOpen] = useState(false)
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
