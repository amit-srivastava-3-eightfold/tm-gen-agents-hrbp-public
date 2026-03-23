import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import {
  Badge, Pill, Tabs, TabsList, TabsTrigger, TabsContent,
  DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableHead, DataTableCell,
} from '@tonyh-2-eightfold/ef-design-system'
import {
  departments,
  EM,
  ORG,
  WFR_DEMO_COLLECTION_WINDOW,
  ZONE,
  deptGapHeadcount,
  deptPeopleInAugRoles,
  getEmployeesForRole,
  getRolesForDept,
  getTasksForRole,
  tGap,
  taskZone,
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
import { CollectionProgressPanel } from './CollectionProgressPanel'
import { deptReadinessTrend, deptManagerTeams } from './collectionHelpers'
import './CollectionProgressPanel.css'
import { FocusFirstModule, type FocusCollectionLaunchSummary } from './FocusFirstModule'
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

function computeDeptTaskBandRollup(sortedRoles: RoleRowType[]) {
  let aboveTasks = 0
  let augmentTasks = 0
  let belowTasks = 0
  let aboveEmpl = 0
  let augmentEmpl = 0
  let belowEmpl = 0

  for (const role of sortedRoles) {
    const tasks = getTasksForRole(role.title)
    const n = tasks.length
    if (n === 0) continue
    let a = 0
    let b = 0
    let c = 0
    for (const t of tasks) {
      const z = taskZone(t.score)
      if (z === 'above') a += 1
      else if (z === 'augment') b += 1
      else c += 1
    }
    const E = role.employees
    aboveTasks += a
    augmentTasks += b
    belowTasks += c
    aboveEmpl += (E * a) / n
    augmentEmpl += (E * b) / n
    belowEmpl += (E * c) / n
  }

  return {
    aboveTasks,
    augmentTasks,
    belowTasks,
    aboveEmpl: Math.round(aboveEmpl),
    augmentEmpl: Math.round(augmentEmpl),
    belowEmpl: Math.round(belowEmpl),
  }
}

/** Single-role task band counts + headcount split (same logic as one iteration of dept rollup). */
function TaskBandStatCards({
  bands,
  ariaLabel = 'Tasks by automation band',
}: {
  bands: {
    zone: keyof typeof ZONE
    css: 'above' | 'augment' | 'below'
    taskCount: number
    employees: number
  }[]
  ariaLabel?: string
}) {
  return (
    <div className="wfr-dash__task-band-stats" role="group" aria-label={ariaLabel}>
      {bands.map(({ zone, css, taskCount, employees }) => (
        <div key={zone} className={`wfr-dash__task-band-stat wfr-dash__task-band-stat--${css}`}>
          <div className="wfr-dash__task-band-stat__top">
            <span className="wfr-dash__task-band-stat__tasks">
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </span>
            <span className="wfr-dash__task-band-stat__band">{ZONE[zone].short}</span>
          </div>
          <p className="wfr-dash__task-band-stat__affected">
            {employees.toLocaleString()} employees affected
          </p>
        </div>
      ))}
    </div>
  )
}

function DeptTasksBandStatBar({
  aboveTasks,
  augmentTasks,
  belowTasks,
  aboveEmpl,
  augmentEmpl,
  belowEmpl,
}: {
  /**
   * Employees per band: each role’s headcount is split across bands in proportion to its
   * task counts (so band totals relate to work mix without double-counting headcount).
   */
  aboveTasks: number
  augmentTasks: number
  belowTasks: number
  aboveEmpl: number
  augmentEmpl: number
  belowEmpl: number
}) {
  return (
    <TaskBandStatCards
      bands={[
        { zone: 'above', css: 'above', taskCount: aboveTasks, employees: aboveEmpl },
        { zone: 'augment', css: 'augment', taskCount: augmentTasks, employees: augmentEmpl },
        { zone: 'below', css: 'below', taskCount: belowTasks, employees: belowEmpl },
      ]}
    />
  )
}

function DeptTasksTable({ sortedRoles }: { sortedRoles: RoleRowType[] }) {
  const rows = sortedRoles
    .flatMap((r) =>
      getTasksForRole(r.title).map((t) => ({
        task: t.task,
        roleTitle: r.title,
        employeesAffected: r.employees,
        score: t.score,
        zone: taskZone(t.score),
      })),
    )
    .sort((a, b) => b.score - a.score || a.task.localeCompare(b.task))

  const bandRollup =
    sortedRoles.length > 0 ? computeDeptTaskBandRollup(sortedRoles) : null

  if (rows.length === 0) {
    return (
      <div className="wfr-type-body3-muted px-8 py-8 text-center">No task-level data in prototype.</div>
    )
  }

  return (
    <>
      {bandRollup && (
        <DeptTasksBandStatBar
          aboveTasks={bandRollup.aboveTasks}
          augmentTasks={bandRollup.augmentTasks}
          belowTasks={bandRollup.belowTasks}
          aboveEmpl={bandRollup.aboveEmpl}
          augmentEmpl={bandRollup.augmentEmpl}
          belowEmpl={bandRollup.belowEmpl}
        />
      )}
      <DataTable bordered>
        <DataTableHeader>
          <DataTableRow>
            <DataTableHead>Task</DataTableHead>
            <DataTableHead metric>Score</DataTableHead>
            <DataTableHead>Zone</DataTableHead>
            <DataTableHead>Appears in</DataTableHead>
            <DataTableHead numeric>Employees affected</DataTableHead>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
            {rows.map((row) => {
              const z = ZONE[row.zone]
              return (
                <DataTableRow key={`${row.roleTitle}-${row.task}`}>
                  <DataTableCell className="font-semibold">{row.task}</DataTableCell>
                  <DataTableCell metric>
                    <div className="wfr-dash__task-score" title={`${row.score}% AI task score`}>
                      <div className="wfr-dash__task-score__track" aria-hidden>
                        <div
                          className="wfr-dash__task-score__fill"
                          style={{ width: `${Math.min(100, Math.max(0, row.score))}%`, backgroundColor: z.color }}
                        />
                      </div>
                      <span className="wfr-dash__task-score__pct" style={{ color: z.color }}>
                        {row.score}%
                      </span>
                    </div>
                  </DataTableCell>
                  <DataTableCell>
                    <span
                      className="wfr-dash__zone-pill"
                      style={{
                        backgroundColor: z.bg,
                        color: z.color,
                        borderColor: `${z.color}4d`,
                      }}
                    >
                      {z.short}
                    </span>
                  </DataTableCell>
                  <DataTableCell>{row.roleTitle}</DataTableCell>
                  <DataTableCell align="right" numeric>
                    {row.employeesAffected.toLocaleString()}
                  </DataTableCell>
                </DataTableRow>
              )
            })}
        </DataTableBody>
      </DataTable>
      <p className="wfr-dash__panel-table-foot">Sorted by AI task score (highest first).</p>
    </>
  )
}


function DeptView({
  dept,
  orgCollectionActive,
  orgCollectionComplete,
  onCollectionActiveChange,
  onCollectionComplete,
  collectionLaunchSummary,
  focusLaunchOpen,
  setFocusLaunchOpen,
}: {
  dept: Dept
  orgCollectionActive: boolean
  orgCollectionComplete?: boolean
  onCollectionActiveChange: (active: boolean, launchSummary?: FocusCollectionLaunchSummary | null) => void
  onCollectionComplete?: () => void
  collectionLaunchSummary: FocusCollectionLaunchSummary | null
  focusLaunchOpen: boolean
  setFocusLaunchOpen: (open: boolean) => void
}) {
  const [openMetric, setOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
  const showCollectionTab = orgCollectionActive && !orgCollectionComplete
  // Tabs are uncontrolled with defaultValue; showCollectionTab drives which tabs render
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({})
  const [expandedManagers, setExpandedManagers] = useState<Record<string, boolean>>({})
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
    <div className="wfr-dash">
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
              of people in {dept.name} are showing AI readiness signals.
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
          onCollectionActiveChange={onCollectionActiveChange}
          onCollectionComplete={onCollectionComplete}
          launchOpen={focusLaunchOpen}
          onLaunchOpenChange={setFocusLaunchOpen}
          onRequestCloseMetricSheet={() => setOpenMetric(null)}
          deptContext={dept}
          collectionLaunchSummary={collectionLaunchSummary}
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
        {roles.length === 0 ? (
          <div className="wfr-dash__panel">
            <div className="wfr-type-body3-muted px-8 py-8 text-center">Role-level data not available in prototype.</div>
          </div>
        ) : (
          <>
          <Tabs
            defaultValue={showCollectionTab ? 'collection' : 'roles'}
          >
            <TabsList variant="line" className="mb-4" aria-label="Roles and tasks">
              {showCollectionTab ? (
                <TabsTrigger value="collection">
                  Collection status
                </TabsTrigger>
              ) : null}
              <TabsTrigger value="roles">
                Roles
              </TabsTrigger>
              <TabsTrigger value="tasks">
                Tasks
              </TabsTrigger>
            </TabsList>
            {showCollectionTab ? (
              <TabsContent value="collection" className="wfr-dash__panel-tabs-content">
                <CollectionProgressPanel scopeDepartment={dept} channelsLabel={collectionLaunchSummary?.channelsLabel} />
              </TabsContent>
            ) : null}
            <TabsContent value="roles" className="wfr-dash__panel-tabs-content">
              <DataTable bordered>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Role</DataTableHead>
                    <DataTableHead numeric>Employees</DataTableHead>
                    <DataTableHead numeric>Tasks</DataTableHead>
                    <DataTableHead metric>AI readiness</DataTableHead>
                    <DataTableHead metric>AI potential</DataTableHead>
                    <DataTableHead>Role outlook</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {sorted.map((r) => {
                    const outlook = roleOutlook(r)
                    const ol = ROLE_OUTLOOK[outlook]
                    const isRoleExpanded = expandedRoles[r.title] ?? false
                    // Generate managers for this role using role title hash + dept employee pool
                    const roleManagers = deptManagerTeams(r.title, r.employees)
                    // Get employees for this role (split across managers later)
                    const roleEmployees = getEmployeesForRole(r)
                    return (
                      <Fragment key={r.title}>
                        {/* Level 1: Role row */}
                        <DataTableRow
                          onClick={() => setExpandedRoles(prev => ({ ...prev, [r.title]: !isRoleExpanded }))}
                        >
                          <DataTableCell className="font-semibold">
                            <div className="flex items-center gap-2">
                              <span
                                className="material-symbols-outlined text-[#94a3b8] text-base transition-transform"
                                style={{ transform: isRoleExpanded ? 'rotate(90deg)' : undefined }}
                              >
                                chevron_right
                              </span>
                              {r.title}
                            </div>
                          </DataTableCell>
                          <DataTableCell align="right" numeric>{r.employees.toLocaleString()}</DataTableCell>
                          <DataTableCell align="right" numeric>{getTasksForRole(r.title).length}</DataTableCell>
                          <DataTableCell metric>
                            <DeptTableSoloBar variant="readiness" pct={r.aiReadiness} width={120} />
                          </DataTableCell>
                          <DataTableCell metric>
                            <DeptTableSoloBar variant="potential" pct={r.aiPotential} width={120} />
                          </DataTableCell>
                          <DataTableCell>
                            <Badge
                              variant="outline"
                              size="24"
                              className="shrink-0 font-semibold"
                              style={{ background: ol.bg, color: ol.color, borderColor: ol.border }}
                            >
                              {ol.label}
                            </Badge>
                          </DataTableCell>
                        </DataTableRow>
                        {/* Level 2: Manager rows */}
                        {isRoleExpanded && roleManagers.map((mgr, mi) => {
                          const mgrKey = `${r.title}-${mgr.manager}`
                          const isMgrExpanded = expandedManagers[mgrKey] ?? false
                          // Split employees among managers proportionally
                          const startIdx = roleManagers.slice(0, mi).reduce((s, m) => s + m.employees, 0)
                          const mgrEmployees = roleEmployees.slice(startIdx, startIdx + mgr.employees)
                          // Weighted average readiness for this manager's team
                          const mgrReadiness = mgrEmployees.length > 0
                            ? Math.round(mgrEmployees.reduce((s, e) => s + e.readinessPct, 0) / mgrEmployees.length)
                            : 0
                          return (
                            <Fragment key={mgrKey}>
                              <DataTableRow
                                className="bg-[#f8fafc]"
                                onClick={() => setExpandedManagers(prev => ({ ...prev, [mgrKey]: !isMgrExpanded }))}
                              >
                                <DataTableCell className="!pl-12">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="material-symbols-outlined text-[#94a3b8] text-sm transition-transform"
                                      style={{ transform: isMgrExpanded ? 'rotate(90deg)' : undefined }}
                                    >
                                      chevron_right
                                    </span>
                                    <div>
                                      <div className="text-[#475569] text-[13px] font-medium">{mgr.manager}</div>
                                      <div className="text-[#94a3b8] text-[11px]">{mgr.title}</div>
                                    </div>
                                  </div>
                                </DataTableCell>
                                <DataTableCell align="right" numeric className="text-[13px]">{mgr.employees.toLocaleString()}</DataTableCell>
                                <DataTableCell />
                                <DataTableCell metric>
                                  <DeptTableSoloBar variant="readiness" pct={mgrReadiness} width={80} />
                                </DataTableCell>
                                <DataTableCell metric>
                                  <DeptTableSoloBar variant="potential" pct={r.aiPotential} width={80} />
                                </DataTableCell>
                                <DataTableCell />
                              </DataTableRow>
                              {/* Level 3: Employee rows */}
                              {isMgrExpanded && mgrEmployees.map((emp, ei) => (
                                <DataTableRow key={`${mgrKey}-${ei}`} className="bg-[#f1f5f9]">
                                  <DataTableCell className="!pl-20 text-[13px] text-[#475569]">
                                    {emp.name}
                                  </DataTableCell>
                                  <DataTableCell />
                                  <DataTableCell />
                                  <DataTableCell metric>
                                    <DeptTableSoloBar variant="readiness" pct={emp.readinessPct} width={80} />
                                  </DataTableCell>
                                  <DataTableCell />
                                  <DataTableCell />
                                </DataTableRow>
                              ))}
                            </Fragment>
                          )
                        })}
                      </Fragment>
                    )
                  })}
                </DataTableBody>
              </DataTable>
              <p className="wfr-dash__panel-table-foot">
                Sorted by gap (potential vs. readiness). Open a role for detail, or use the Tasks tab for scores.
              </p>
            </TabsContent>
            <TabsContent value="tasks" className="wfr-dash__panel-tabs-content">
              <DeptTasksTable sortedRoles={sorted} />
            </TabsContent>
          </Tabs>
          </>
        )}
      </div>
    </div>
  )
}

function BoardView({
  onDeptClick,
  focusCollectionActive,
  focusCollectionComplete,
  onCollectionActiveChange,
  onCollectionComplete,
  collectionLaunchSummary,
  focusLaunchOpen,
  setFocusLaunchOpen,
}: {
  onDeptClick: (d: Dept) => void
  focusCollectionActive: boolean
  focusCollectionComplete?: boolean
  onCollectionActiveChange: (active: boolean, launchSummary?: FocusCollectionLaunchSummary | null) => void
  onCollectionComplete?: () => void
  collectionLaunchSummary: FocusCollectionLaunchSummary | null
  focusLaunchOpen: boolean
  setFocusLaunchOpen: (open: boolean) => void
}) {
  const [openMetric, setOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
  const [trendSheetDept, setTrendSheetDept] = useState<Dept | null>(null)

  const scopedRollup = useMemo(() => {
    if (!focusCollectionActive || !collectionLaunchSummary?.scopedDepartmentNames?.length) return null
    return wfrRollupDepartmentsByName(collectionLaunchSummary.scopedDepartmentNames)
  }, [focusCollectionActive, collectionLaunchSummary])

  const allDeptsSorted = useMemo(() => {
    return [...departments].sort((a, b) => a.aiReadiness - b.aiReadiness)
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
          onCollectionActiveChange={onCollectionActiveChange}
          onCollectionComplete={onCollectionComplete}
          launchOpen={focusLaunchOpen}
          onLaunchOpenChange={setFocusLaunchOpen}
          onRequestCloseMetricSheet={() => setOpenMetric(null)}
          collectionLaunchSummary={collectionLaunchSummary}
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
            <span className="wfr-dash__panel-hint">Sorted by AI readiness (lowest first) {EM} click to drill down</span>
          </div>
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Department</DataTableHead>
                <DataTableHead numeric>Headcount</DataTableHead>
                <DataTableHead metric>AI readiness</DataTableHead>
                <DataTableHead metric>AI potential</DataTableHead>
                <DataTableHead numeric>Transformation gap</DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {allDeptsSorted.map((d) => {
                const gapPp = tGap(d.aiPotential, d.aiReadiness)
                const gapColor = gapPp >= 50 ? '#dc2626' : gapPp >= 30 ? '#d97706' : '#15803d'
                const gapCount = deptGapHeadcount(d)
                const trend = deptReadinessTrend(d.name)
                return (
                  <DataTableRow key={d.name} onClick={() => onDeptClick(d)}>
                    <DataTableCell className="font-semibold">{d.name}</DataTableCell>
                    <DataTableCell align="right" numeric>{d.employees.toLocaleString()}</DataTableCell>
                    <DataTableCell metric>
                      <div className="wfr-dash__readiness-with-trend">
                        <DeptTableSoloBar variant="readiness" pct={d.aiReadiness} />
                        <button
                          type="button"
                          className={`wfr-dash__trend-badge ${trend.direction === 'up' ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`}
                          onClick={(e) => { e.stopPropagation(); setTrendSheetDept(d) }}
                          title="View readiness trend details"
                        >
                          <span className="wfr-dash__trend-badge-text">
                            {trend.direction === 'up' ? '↑' : '↓'}{Math.abs(trend.delta)}pt
                          </span>
                          <span className="material-symbols-outlined wfr-dash__trend-badge-icon">info</span>
                        </button>
                      </div>
                    </DataTableCell>
                    <DataTableCell metric>
                      <DeptTableSoloBar variant="potential" pct={d.aiPotential} />
                    </DataTableCell>
                    <DataTableCell
                      align="right"
                      title={`${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready`}
                    >
                      <span className="wfr-type-h6 tabular-nums" style={{ color: gapColor }}>
                        {gapCount.toLocaleString()}
                      </span>
                    </DataTableCell>
                  </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>
        </div>
      ) : focusCollectionActive ? (
        <Tabs defaultValue="collection">
          <TabsList variant="line" className="mb-4" aria-label="Department view">
            <TabsTrigger value="collection">
              Collection status
            </TabsTrigger>
            <TabsTrigger value="gap">
              Departmental readiness
            </TabsTrigger>
          </TabsList>
          <TabsContent value="collection">
            <div>
              <CollectionProgressPanel
                scopedDepartmentNames={collectionLaunchSummary?.scopedDepartmentNames}
                channelsLabel={collectionLaunchSummary?.channelsLabel}
              />
            </div>
          </TabsContent>
          <TabsContent value="gap">
            <div>
              <div className="wfr-dash__panel-head">
                <h3 className="wfr-dash__panel-title">Departmental readiness</h3>
                <span className="wfr-dash__panel-hint">Sorted by AI readiness (lowest first) {EM} click to drill down</span>
              </div>
              <DataTable bordered>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Department</DataTableHead>
                    <DataTableHead numeric>Headcount</DataTableHead>
                    <DataTableHead metric>AI readiness</DataTableHead>
                    <DataTableHead metric>AI potential</DataTableHead>
                    <DataTableHead numeric>Gap</DataTableHead>
                    <DataTableHead>Current action</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {allDeptsSorted.map((d) => {

                    const gapPp = tGap(d.aiPotential, d.aiReadiness)
                    const gapColor = gapPp >= 50 ? '#dc2626' : gapPp >= 30 ? '#d97706' : '#15803d'
                    const gapCount = deptGapHeadcount(d)
                    const inScope = collectionLaunchSummary?.scopedDepartmentNames?.includes(d.name)
                    return (
                      <DataTableRow key={d.name} onClick={() => onDeptClick(d)}>
                        <DataTableCell className="font-semibold">{d.name}</DataTableCell>
                        <DataTableCell align="right" numeric>{d.employees.toLocaleString()}</DataTableCell>
                        <DataTableCell metric>
                          <DeptTableSoloBar variant="readiness" pct={d.aiReadiness} />
                        </DataTableCell>
                        <DataTableCell metric>
                          <DeptTableSoloBar variant="potential" pct={d.aiPotential} />
                        </DataTableCell>
                        <DataTableCell
                          align="right"
                          title={`${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready`}
                        >
                          <span className="wfr-type-h6 tabular-nums" style={{ color: gapColor }}>
                            {gapCount.toLocaleString()}
                          </span>
                        </DataTableCell>
                        <DataTableCell>
                          {inScope ? (
                            <div className="wfr-dash__dept-current-action">
                              <span className="wfr-dash__dept-current-action__status">Collecting data</span>
                              <span className="wfr-dash__dept-current-action__dates">
                                {WFR_DEMO_COLLECTION_WINDOW.datesLine}
                              </span>
                            </div>
                          ) : null}
                        </DataTableCell>
                      </DataTableRow>
                    )
                  })}
                </DataTableBody>
              </DataTable>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div>
          <div className="wfr-dash__panel-head">
            <h3 className="wfr-dash__panel-title">Departmental readiness</h3>
            <span className="wfr-dash__panel-hint">Sorted by AI readiness (lowest first) {EM} click to drill down</span>
          </div>
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Department</DataTableHead>
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
                return (
                  <DataTableRow key={d.name} onClick={() => onDeptClick(d)}>
                    <DataTableCell className="font-semibold">{d.name}</DataTableCell>
                    <DataTableCell align="right" numeric>{d.employees.toLocaleString()}</DataTableCell>
                    <DataTableCell metric>
                      <DeptTableSoloBar variant="readiness" pct={d.aiReadiness} />
                    </DataTableCell>
                    <DataTableCell metric>
                      <DeptTableSoloBar variant="potential" pct={d.aiPotential} />
                    </DataTableCell>
                    <DataTableCell
                      align="right"
                      title={`${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready`}
                    >
                      <span className="wfr-type-h6 tabular-nums" style={{ color: gapColor }}>
                        {gapCount.toLocaleString()}
                      </span>
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
        <Breadcrumb className="mb-4 border-b border-[#e5e7eb] pb-3">
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
            onCollectionActiveChange={handleFocusCollectionActiveChange}
            onCollectionComplete={() => setFocusCollectionComplete(true)}
            collectionLaunchSummary={focusCollectionLaunchSummary}
            focusLaunchOpen={focusLaunchOpen}
            setFocusLaunchOpen={setFocusLaunchOpen}
          />
        )}
        {view === 'dept' && dept && (
          <DeptView
            dept={dept}
            orgCollectionActive={focusCollectionActive}
            orgCollectionComplete={focusCollectionComplete}
            onCollectionActiveChange={handleFocusCollectionActiveChange}
            onCollectionComplete={() => setFocusCollectionComplete(true)}
            collectionLaunchSummary={focusCollectionLaunchSummary}
            focusLaunchOpen={focusLaunchOpen}
            setFocusLaunchOpen={setFocusLaunchOpen}
          />
        )}
      </div>

    </>
  )
}
