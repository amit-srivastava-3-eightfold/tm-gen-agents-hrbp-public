import * as Tabs from '@radix-ui/react-tabs'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Button, Pill } from '@tonyh-2-eightfold/ef-design-system'
import {
  EM,
  ORG,
  OUTCOME,
  ZONE,
  countTransformableTasksForRole,
  deptGapHeadcount,
  deptPeopleInAugRoles,
  deptStatus,
  getEmployeesForRole,
  getRolesForDept,
  getTasksForRole,
  peopleOutcome,
  tGap,
  taskZone,
  roleDevelopmentProgress,
  type Dept,
  type RoleEmployee,
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
import { WorkforceMetricSheet } from './WorkforceMetricSheet'
import './WorkforceReadinessDashboard.css'

function gapStatusBadgeVariant(label: string): 'destructive' | 'outline' | 'secondary' {
  if (label === 'Immediate action') return 'destructive'
  if (label === 'Monitor closely') return 'outline'
  return 'secondary'
}

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

function priorityPillVariant(p: RoleRowType['reskillPriority']): 'critical' | 'orange' | 'neutral' {
  if (p === 'Immediate') return 'critical'
  if (p === 'This year') return 'orange'
  return 'neutral'
}

function RoleRow({
  role,
  isFirst,
  onTakeAction,
  onOpenRole,
}: {
  role: RoleRowType
  isFirst: boolean
  /** Scroll to roles panel (prototype). Shown when role has Automate/Augment tasks. */
  onTakeAction?: () => void
  /** Opens full role page (dept view). */
  onOpenRole?: () => void
}) {
  const tasks = getTasksForRole(role.title)
  const outcome = peopleOutcome(tasks)
  const o = outcome ? OUTCOME[outcome] : null
  const transformableTasks = countTransformableTasksForRole(role.title)
  const showTakeAction = Boolean(onTakeAction && transformableTasks > 0)
  return (
    <tr className="wfr-dash__tr">
      <td className="wfr-dash__td wfr-role-row__cell">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {onOpenRole ? (
            <button
              type="button"
              className="wfr-role-row__title-link wfr-type-h6"
              onClick={() => onOpenRole()}
            >
              {role.title}
            </button>
          ) : (
            <span className="wfr-type-h6">{role.title}</span>
          )}
          {isFirst && (
            <Pill variant="orange" size="small">
              Focus first
            </Pill>
          )}
          {o && (
            <Badge
              variant="outline"
              size="24"
              className="shrink-0 font-semibold"
              style={{ background: o.bg, color: o.color, borderColor: o.border }}
            >
              {o.label}
            </Badge>
          )}
        </div>
        <span className="wfr-type-caption tabular-nums text-slate-500">
          {role.employees.toLocaleString()} employees
        </span>
      </td>
      <td className="wfr-dash__td wfr-dash__td--metric-col">
        <DeptTableSoloBar variant="readiness" pct={role.aiReadiness} width={120} />
      </td>
      <td className="wfr-dash__td wfr-dash__td--metric-col">
        <DeptTableSoloBar variant="potential" pct={role.aiPotential} width={120} />
      </td>
      <td className="wfr-dash__td wfr-dash__td--num">
        <span className="wfr-type-h6 tabular-nums text-[#1a212e]">
          {countTransformableTasksForRole(role.title)}
        </span>
      </td>
      <td className="wfr-dash__td">
        <Pill variant={priorityPillVariant(role.reskillPriority)} size="small">
          {role.reskillPriority}
        </Pill>
      </td>
      <td className="wfr-dash__td wfr-dash__td--action wfr-dash__td--roles-action">
        {showTakeAction ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label={`Take action for role ${role.title}`}
            onClick={() => onTakeAction?.()}
          >
            Take action
          </Button>
        ) : null}
      </td>
    </tr>
  )
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
function roleTaskBandRollup(role: RoleRowType) {
  const roleTasks = getTasksForRole(role.title)
  const n = roleTasks.length
  const E = role.employees
  if (n === 0) {
    return { aboveTasks: 0, augmentTasks: 0, belowTasks: 0, aboveEmpl: 0, augmentEmpl: 0, belowEmpl: 0 }
  }
  let a = 0
  let b = 0
  let c = 0
  for (const t of roleTasks) {
    const z = taskZone(t.score)
    if (z === 'above') a += 1
    else if (z === 'augment') b += 1
    else c += 1
  }
  const aboveEmpl = Math.round((E * a) / n)
  const augmentEmpl = Math.round((E * b) / n)
  const belowEmpl = Math.max(0, E - aboveEmpl - augmentEmpl)
  return {
    aboveTasks: a,
    augmentTasks: b,
    belowTasks: c,
    aboveEmpl,
    augmentEmpl,
    belowEmpl,
  }
}

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
      <div className="wfr-dash__table-scroll">
        <table className="wfr-dash__table wfr-dash__table--tasks">
          <thead>
            <tr>
              <th className="wfr-dash__th wfr-dash__th--tasks">Task</th>
              <th className="wfr-dash__th wfr-dash__th--tasks">Score</th>
              <th className="wfr-dash__th wfr-dash__th--tasks">Zone</th>
              <th className="wfr-dash__th wfr-dash__th--tasks">Appears in</th>
              <th className="wfr-dash__th wfr-dash__th--tasks wfr-dash__th--num">Employees affected</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const z = ZONE[row.zone]
              return (
                <tr key={`${row.roleTitle}-${row.task}`} className="wfr-dash__tr wfr-dash__tr--tasks">
                  <td className="wfr-dash__td wfr-dash__td--task-name">{row.task}</td>
                  <td className="wfr-dash__td wfr-dash__td--score-cell">
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
                  </td>
                  <td className="wfr-dash__td wfr-dash__td--zone-cell">
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
                  </td>
                  <td className="wfr-dash__td wfr-dash__td--appears-in">{row.roleTitle}</td>
                  <td className="wfr-dash__td wfr-dash__td--num wfr-dash__td--employees-affected tabular-nums">
                    {row.employeesAffected.toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="wfr-dash__panel-table-foot">Sorted by AI task score (highest first).</p>
    </>
  )
}

type MetricId = 'potential' | 'readiness' | 'gap' | null

function outcomeShortLabel(outcome: 'at-risk' | 'transforms' | 'survives'): string {
  if (outcome === 'at-risk') return 'At risk'
  if (outcome === 'transforms') return 'Transforms'
  return 'Survives'
}

function formatReadinessDeltaPp(roleReadiness: number): string {
  const d = roleReadiness - ORG.aiReadiness
  const sign = d > 0 ? '+' : ''
  return `${sign}${d}pp`
}

/** Same four stages as the Employees tab stat bar; one row below = one bucket here. */
type RoleEmployeeReadinessStage = 'ai-ready' | 'in-training' | 'completed' | 'not-started'

function employeeReadinessStage(employee: RoleEmployee): RoleEmployeeReadinessStage {
  if (employee.programStatus === 'Completed') return 'completed'
  if (employee.programStatus === 'Enrolled') return 'in-training'
  if (employee.readinessPct >= ORG.aiReadiness) return 'ai-ready'
  return 'not-started'
}

const READINESS_STAGE_LABEL: Record<RoleEmployeeReadinessStage, string> = {
  'ai-ready': 'AI-ready',
  'in-training': 'In training',
  completed: 'Completed plan',
  'not-started': 'Not started',
}

/** Progress bar + % text on role employee rows — matches Status stage, not raw % alone. */
const READINESS_BAR_COLOR: Record<RoleEmployeeReadinessStage, string> = {
  'ai-ready': 'var(--wfr-readiness-text)',
  'not-started': '#64748b',
  'in-training': '#5b21b6',
  completed: '#5b21b6',
}

function roleEmployeeReadinessStatBuckets(employees: RoleEmployee[]) {
  let aiReady = 0
  let inTraining = 0
  let completed = 0
  let notStarted = 0
  for (const e of employees) {
    switch (employeeReadinessStage(e)) {
      case 'ai-ready':
        aiReady += 1
        break
      case 'in-training':
        inTraining += 1
        break
      case 'completed':
        completed += 1
        break
      case 'not-started':
        notStarted += 1
        break
    }
  }
  return { aiReady, inTraining, completed, notStarted }
}

function RoleEmployeeReadinessStatBar({
  aiReady,
  inTraining,
  completed,
  notStarted,
}: {
  aiReady: number
  inTraining: number
  completed: number
  notStarted: number
}) {
  const threshold = ORG.aiReadiness
  const items = [
    {
      id: 'ai-ready' as const,
      count: aiReady,
      title: 'AI-ready',
      subtitle: `Crossed ≥${threshold}% threshold`,
    },
    {
      id: 'completed' as const,
      count: completed,
      title: 'Completed plan',
      subtitle: 'Needs follow-up to cross threshold',
    },
    {
      id: 'in-training' as const,
      count: inTraining,
      title: 'In training',
      subtitle: 'Enrolled, not yet completed',
    },
    {
      id: 'not-started' as const,
      count: notStarted,
      title: 'Not started',
      subtitle: 'No plan assigned',
    },
  ]
  return (
    <div className="wfr-role-page__emp-stat-bar" role="group" aria-label="Employees by readiness stage">
      {items.map(({ id, count, title, subtitle }) => (
        <div key={id} className={`wfr-role-page__emp-stat-card wfr-role-page__emp-stat-card--${id}`}>
          <div className="wfr-role-page__emp-stat-card__value">{count.toLocaleString()}</div>
          <div className="wfr-role-page__emp-stat-card__title">{title}</div>
          <div className="wfr-role-page__emp-stat-card__subtitle">{subtitle}</div>
        </div>
      ))}
    </div>
  )
}

function RoleEmployeeRow({ employee }: { employee: RoleEmployee }) {
  const stage = employeeReadinessStage(employee)
  const readinessColor = READINESS_BAR_COLOR[stage]
  const barTitle = `${employee.readinessPct}% AI readiness (status: ${READINESS_STAGE_LABEL[stage]}; org threshold ${ORG.aiReadiness}%)`
  return (
    <tr className="wfr-dash__tr wfr-dash__tr--tasks">
      <td className="wfr-dash__td wfr-dash__td--task-name">{employee.name}</td>
      <td className="wfr-dash__td wfr-dash__td--score-cell">
        <div className="wfr-dash__task-score" title={barTitle}>
          <div className="wfr-dash__task-score__track" aria-hidden>
            <div
              className="wfr-dash__task-score__fill"
              style={{
                width: `${Math.min(100, Math.max(0, employee.readinessPct))}%`,
                backgroundColor: readinessColor,
              }}
            />
          </div>
          <span className="wfr-dash__task-score__pct" style={{ color: readinessColor }}>
            {employee.readinessPct}%
          </span>
        </div>
      </td>
      <td className="wfr-dash__td wfr-dash__td--zone-cell">
        <span
          className={`wfr-role-page__emp-status wfr-role-page__emp-status--${stage}`}
          title={`${READINESS_STAGE_LABEL[stage]} (org AI readiness threshold ${ORG.aiReadiness}%)`}
        >
          {READINESS_STAGE_LABEL[stage]}
        </span>
      </td>
    </tr>
  )
}

function RolePageView({ dept, role }: { dept: Dept; role: RoleRowType }) {
  const tasks = getTasksForRole(role.title)
  const sortedTasks = [...tasks].sort((a, b) => b.score - a.score || a.task.localeCompare(b.task))
  const outcome = peopleOutcome(tasks)
  const o = outcome ? OUTCOME[outcome] : null
  const dev = roleDevelopmentProgress(role)
  const [roleTab, setRoleTab] = useState<'tasks' | 'employees'>('tasks')
  const roleTabsPanelRef = useRef<HTMLDivElement>(null)
  const roleEmployees = useMemo(() => getEmployeesForRole(role), [role])
  const taskBandRollup = useMemo(() => roleTaskBandRollup(role), [role])
  const empReadinessStats = useMemo(() => roleEmployeeReadinessStatBuckets(roleEmployees), [roleEmployees])

  return (
    <div className="wfr-dash wfr-dash--role-page">
      <header className="wfr-role-page__hero">
        <div className="wfr-role-page__hero-top">
          <div className="min-w-0">
            <div className="wfr-role-page__title-row">
              <h1 className="wfr-role-page__title">{role.title}</h1>
              {outcome && o && (
                <Badge
                  variant="outline"
                  size="24"
                  className="shrink-0 font-semibold"
                  style={{ background: o.bg, color: o.color, borderColor: o.border }}
                >
                  {outcomeShortLabel(outcome)}
                </Badge>
              )}
            </div>
            <p className="wfr-role-page__sub">
              {dept.name} {EM} {role.employees.toLocaleString()} employees
            </p>
          </div>
          <div className="wfr-role-page__hero-metrics" aria-label="Role AI readiness and potential">
            <div className="wfr-role-page__hero-metric">
              <div className="wfr-role-page__hero-metric-pct wfr-text-readiness">{role.aiReadiness}%</div>
              <div className="wfr-role-page__hero-metric-label">readiness</div>
              <div className="wfr-role-page__hero-metric-delta">{formatReadinessDeltaPp(role.aiReadiness)}</div>
            </div>
            <div className="wfr-role-page__hero-metric">
              <div className="wfr-role-page__hero-metric-pct wfr-text-potential">{role.aiPotential}%</div>
              <div className="wfr-role-page__hero-metric-label">potential</div>
            </div>
          </div>
        </div>

        <div className="wfr-role-page__dev" aria-label="Development program progress for this role">
          <div className="wfr-role-page__dev-head">
            <span className="wfr-role-page__dev-eyebrow">Development progress</span>
            <span className="wfr-role-page__dev-stats">
              {dev.completed.toLocaleString()} completed, {dev.enrolled.toLocaleString()} enrolled of{' '}
              {dev.total.toLocaleString()}
            </span>
          </div>
          <div className="wfr-role-page__dev-track">
            <div
              className="wfr-role-page__dev-fill"
              style={{ width: `${dev.pct}%` }}
            />
          </div>
        </div>
      </header>

      <DeptFocusFirstCard
        role={role}
        employeeRoster={roleEmployees}
        footerLinkLabel="View tasks & employees below."
        onExpandBelow={() => {
          setRoleTab('tasks')
          requestAnimationFrame(() =>
            roleTabsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          )
        }}
      />

      <div ref={roleTabsPanelRef} className="wfr-dash__panel wfr-role-page__tabs-panel">
        <Tabs.Root value={roleTab} onValueChange={(v) => setRoleTab(v as 'tasks' | 'employees')} className="wfr-dash__panel-tabs">
          <div className="wfr-role-page__tabs-bar">
            <Tabs.List className="wfr-dash__panel-tabs-list wfr-role-page__tabs-list" aria-label="Role detail">
              <Tabs.Trigger className="wfr-dash__panel-tab wfr-role-page__tab" value="tasks">
                Tasks
              </Tabs.Trigger>
              <Tabs.Trigger className="wfr-dash__panel-tab wfr-role-page__tab" value="employees">
                Employees
              </Tabs.Trigger>
            </Tabs.List>
            {roleTab === 'tasks' && sortedTasks.length > 0 && (
              <span className="wfr-role-page__sorted-hint">Sorted by score</span>
            )}
            {roleTab === 'employees' && roleEmployees.length > 0 && (
              <span className="wfr-role-page__sorted-hint">
                Sorted by readiness · {roleEmployees.length.toLocaleString()} employees
              </span>
            )}
          </div>
          <Tabs.Content value="tasks" className="wfr-dash__panel-tabs-content">
            <div className="wfr-role-page__tasks-tab">
              <TaskBandStatCards
                bands={[
                  {
                    zone: 'above',
                    css: 'above',
                    taskCount: taskBandRollup.aboveTasks,
                    employees: taskBandRollup.aboveEmpl,
                  },
                  {
                    zone: 'augment',
                    css: 'augment',
                    taskCount: taskBandRollup.augmentTasks,
                    employees: taskBandRollup.augmentEmpl,
                  },
                  {
                    zone: 'below',
                    css: 'below',
                    taskCount: taskBandRollup.belowTasks,
                    employees: taskBandRollup.belowEmpl,
                  },
                ]}
              />
              {sortedTasks.length === 0 ? (
                <div className="wfr-type-body3-muted px-8 py-10 text-center">
                  No task-level data for this role in the prototype.
                </div>
              ) : (
                <div className="wfr-dash__table-scroll">
                  <table className="wfr-dash__table wfr-dash__table--tasks wfr-role-page__task-table">
                    <thead>
                      <tr>
                        <th className="wfr-dash__th wfr-dash__th--tasks">Task</th>
                        <th className="wfr-dash__th wfr-dash__th--tasks">Score</th>
                        <th className="wfr-dash__th wfr-dash__th--tasks">Zone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTasks.map((t) => {
                        const zone = taskZone(t.score)
                        const z = ZONE[zone]
                        return (
                          <tr key={t.task} className="wfr-dash__tr wfr-dash__tr--tasks">
                            <td className="wfr-dash__td wfr-dash__td--task-name">{t.task}</td>
                            <td className="wfr-dash__td wfr-dash__td--score-cell">
                              <div className="wfr-dash__task-score" title={`${t.score}% AI task score`}>
                                <div className="wfr-dash__task-score__track" aria-hidden>
                                  <div
                                    className="wfr-dash__task-score__fill"
                                    style={{
                                      width: `${Math.min(100, Math.max(0, t.score))}%`,
                                      backgroundColor: z.color,
                                    }}
                                  />
                                </div>
                                <span className="wfr-dash__task-score__pct" style={{ color: z.color }}>
                                  {t.score}%
                                </span>
                              </div>
                            </td>
                            <td className="wfr-dash__td wfr-dash__td--zone-cell">
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
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Tabs.Content>
          <Tabs.Content value="employees" className="wfr-dash__panel-tabs-content">
            {roleEmployees.length === 0 ? (
              <div className="wfr-role-page__employees-placeholder wfr-type-body3-muted">
                No employees listed for this role in the prototype.
              </div>
            ) : (
              <div className="wfr-role-page__employees-tab">
                <RoleEmployeeReadinessStatBar
                  aiReady={empReadinessStats.aiReady}
                  inTraining={empReadinessStats.inTraining}
                  completed={empReadinessStats.completed}
                  notStarted={empReadinessStats.notStarted}
                />
                <div className="wfr-dash__table-scroll">
                  <table className="wfr-dash__table wfr-dash__table--tasks wfr-role-page__employees-table">
                    <thead>
                      <tr>
                        <th className="wfr-dash__th wfr-dash__th--tasks">Employee</th>
                        <th className="wfr-dash__th wfr-dash__th--tasks">AI readiness</th>
                        <th className="wfr-dash__th wfr-dash__th--tasks">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roleEmployees.map((emp, i) => (
                        <RoleEmployeeRow key={`${emp.name}-${i}`} employee={emp} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  )
}

function DeptFocusFirstCard({
  role,
  onExpandBelow,
  footerLinkLabel = 'View roles & tasks below.',
  employeeRoster,
}: {
  role: RoleRowType
  onExpandBelow: () => void
  /** Role page: scrolls to this role’s tasks panel. */
  footerLinkLabel?: string
  /** When set (role page), body uses readiness / development plan counts from this roster. */
  employeeRoster?: RoleEmployee[]
}) {
  const head = (
    <div className="wfr-dash__focus-card-head">
      <div className="wfr-dash__focus-card-icon-wrap" aria-hidden>
        <span className="material-symbols-outlined wfr-dash__focus-card-icon">priority_high</span>
      </div>
      <span className="wfr-dash__focus-card-label">Focus first</span>
    </div>
  )

  if (employeeRoster !== undefined) {
    const total = employeeRoster.length
    const { aiReady, inTraining, completed, notStarted } = roleEmployeeReadinessStatBuckets(employeeRoster)
    const notYetAiReady = total - aiReady

    return (
      <div className="wfr-dash__focus-card">
        {head}
        <p className="wfr-dash__focus-card-body">
          {total === 0 ? (
            <>No employee roster in this prototype. </>
          ) : (
            <>
              <strong className="wfr-dash__focus-card-headcount">{notYetAiReady.toLocaleString()}</strong>
              {' '}of{' '}
              <strong className="wfr-dash__focus-card-headcount">{total.toLocaleString()}</strong>
              {' '}
              employees in this role are not yet AI-ready.{' '}
              <strong className="wfr-dash__focus-card-primary-name">{inTraining.toLocaleString()}</strong>
              {' '}are enrolled in development plans,{' '}
              <strong className="wfr-dash__focus-card-primary-name">{completed.toLocaleString()}</strong>
              {' '}have completed.{' '}
              <strong className="wfr-dash__focus-card-headcount">{notStarted.toLocaleString()}</strong>
              {' '}
              employees have no development plan yet {EM} assign development plans to close the gap.{' '}
            </>
          )}
          <button type="button" className="wfr-dash__focus-card-dept-link" onClick={onExpandBelow}>
            {footerLinkLabel}
          </button>
        </p>
      </div>
    )
  }

  const tasks = getTasksForRole(role.title)
  const n = tasks.length
  const augCount = tasks.filter((t) => taskZone(t.score) === 'augment').length
  const belowCount = tasks.filter((t) => taskZone(t.score) === 'below').length
  const aboveCount = tasks.filter((t) => taskZone(t.score) === 'above').length
  const gap = tGap(role.aiPotential, role.aiReadiness)
  const stayPhrase =
    belowCount === 0
      ? ''
      : belowCount === 1
        ? '1 task stays fully human.'
        : `${belowCount} tasks stay fully human.`

  return (
    <div className="wfr-dash__focus-card">
      {head}
      <p className="wfr-dash__focus-card-body">
        <strong className="wfr-dash__focus-card-primary-name">{role.title}</strong> {EM}{' '}
        <strong className="wfr-dash__focus-card-headcount">{role.employees.toLocaleString()} employees</strong>,{' '}
        <span className="wfr-dash__focus-card-meta">{gap}pp gap</span>.{' '}
        {n > 0 ? (
          <>
            {aboveCount} of {n} tasks score above 75% and should be automated.
            {augCount > 0
              ? ` ${augCount === 1 ? '1 remaining task needs' : `${augCount} remaining tasks need`} AI-augmented workflows.`
              : ''}
            {stayPhrase ? ` ${stayPhrase}` : ''}{' '}
          </>
        ) : (
          <>Task-level automation scores aren&apos;t available for this role yet. </>
        )}
        <button type="button" className="wfr-dash__focus-card-dept-link" onClick={onExpandBelow}>
          {footerLinkLabel}
        </button>
      </p>
    </div>
  )
}

function DeptView({ dept, onOpenRole }: { dept: Dept; onOpenRole: (role: RoleRowType) => void }) {
  const [openMetric, setOpenMetric] = useState<MetricId>(null)
  const [rolesTab, setRolesTab] = useState<'roles' | 'tasks'>('roles')
  const deptRolesPanelRef = useRef<HTMLDivElement>(null)
  const roles = getRolesForDept(dept.name)
  const sorted = [...roles].sort((a, b) => tGap(b.aiPotential, b.aiReadiness) - tGap(a.aiPotential, a.aiReadiness))
  const focusRole = sorted[0]
  const deptAug = deptPeopleInAugRoles(dept)
  const gapCount = deptGapHeadcount(dept)
  const deptReady = Math.max(0, deptAug - gapCount)
  const gapSharePct = deptAug > 0 ? Math.min(100, Math.round((gapCount / deptAug) * 100)) : 0
  const deptHrsUnlocked = Math.round(gapCount * ORG.hrsPerPersonWeek)

  useEffect(() => {
    setRolesTab('roles')
  }, [dept.name])

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

      <div className="flex flex-col gap-0">
        <div className="wfr-dash__cards-row">
          {deptCards.map((c) => (
            <article key={c.id} className={`wfr-metric-card wfr-metric-card--${c.id}`}>
              <div className="wfr-metric-card__top">
                <div className="wfr-metric-card__icon-wrap" aria-hidden>
                  <span className="material-symbols-outlined wfr-metric-card__icon">{c.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="wfr-metric-card__label">{c.label}</p>
                </div>
              </div>
              <p className="wfr-metric-card__value">{c.val}</p>
              <p className="wfr-metric-card__primary">{c.l1}</p>
              <div className="wfr-metric-card__footer">
                <p className="wfr-metric-card__hint">{c.hint}</p>
                <Button type="button" variant="secondary" onClick={() => setOpenMetric(c.id)} className="shrink-0">
                  Learn more
                </Button>
              </div>
            </article>
          ))}
        </div>

        {focusRole && (
          <DeptFocusFirstCard
            role={focusRole}
            onExpandBelow={() => {
              setRolesTab('roles')
              requestAnimationFrame(() =>
                deptRolesPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
              )
            }}
          />
        )}

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
        />
      </div>

      <div ref={deptRolesPanelRef} id="wfr-dept-roles-panel" className="wfr-dash__panel">
        <div className="wfr-dash__panel-head">
          <h3 className="wfr-dash__panel-title">Roles &amp; tasks</h3>
          <span className="wfr-dash__panel-hint">{dept.name}</span>
        </div>
        {roles.length === 0 ? (
          <div className="wfr-type-body3-muted px-8 py-8 text-center">Role-level data not available in prototype.</div>
        ) : (
          <Tabs.Root
            value={rolesTab}
            onValueChange={(v: string) => setRolesTab(v as 'roles' | 'tasks')}
            className="wfr-dash__panel-tabs"
          >
            <Tabs.List className="wfr-dash__panel-tabs-list" aria-label="Roles and tasks">
              <Tabs.Trigger className="wfr-dash__panel-tab" value="roles">
                Roles
              </Tabs.Trigger>
              <Tabs.Trigger className="wfr-dash__panel-tab" value="tasks">
                Tasks
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="roles" className="wfr-dash__panel-tabs-content">
              <div className="wfr-dash__table-scroll">
                <table className="wfr-dash__table wfr-dash__table--roles">
                  <thead>
                    <tr>
                      <th className="wfr-dash__th">Role</th>
                      <th className="wfr-dash__th wfr-dash__th--metric-col">AI readiness</th>
                      <th className="wfr-dash__th wfr-dash__th--metric-col">AI potential</th>
                      <th className="wfr-dash__th wfr-dash__th--num">Tasks transformable</th>
                      <th className="wfr-dash__th">Reskill priority</th>
                      <th className="wfr-dash__th wfr-dash__th--action" aria-hidden="true" />
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((r, i) => (
                      <RoleRow
                        key={r.title}
                        role={r}
                        isFirst={i === 0}
                        onTakeAction={() => {
                          requestAnimationFrame(() =>
                            deptRolesPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
                          )
                        }}
                        onOpenRole={() => onOpenRole(r)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="wfr-dash__panel-table-foot">
                Sorted by gap (potential vs. readiness). Open a role for detail, or use the Tasks tab for scores.
              </p>
            </Tabs.Content>
            <Tabs.Content value="tasks" className="wfr-dash__panel-tabs-content">
              <DeptTasksTable sortedRoles={sorted} />
            </Tabs.Content>
          </Tabs.Root>
        )}
      </div>
    </div>
  )
}

function BoardView({ onDeptClick }: { onDeptClick: (d: Dept) => void }) {
  const [openMetric, setOpenMetric] = useState<MetricId>(null)

  const sorted = [...ORG.departments].sort((a, b) => {
    const pp = tGap(b.aiPotential, b.aiReadiness) - tGap(a.aiPotential, a.aiReadiness)
    if (pp !== 0) return pp
    return deptGapHeadcount(b) - deptGapHeadcount(a)
  })
  const ready = Math.round((ORG.peopleInAugRoles * ORG.aiReadiness) / 100)
  const gapPeople = ORG.peopleInAugRoles - ready
  const hrsUnlocked = Math.round(gapPeople * ORG.hrsPerPersonWeek)

  const gapSharePct = Math.min(100, Math.round((gapPeople / ORG.peopleInAugRoles) * 100))

  const focusDeptsImmediate = ORG.departments
    .map((d) => ({
      name: d.name,
      imm: getRolesForDept(d.name)
        .filter((r) => r.reskillPriority === 'Immediate')
        .reduce((s, r) => s + r.employees, 0),
    }))
    .filter((x) => x.imm > 0)
    .sort((a, b) => b.imm - a.imm || a.name.localeCompare(b.name))

  const focusImmediateCount = focusDeptsImmediate.reduce((s, x) => s + x.imm, 0)
  const focusPrimaryDept = focusDeptsImmediate[0]
  const focusSecondaryDepts = focusDeptsImmediate.slice(1)

  const openFocusDept = (deptName: string) => {
    const d = ORG.departments.find((x) => x.name === deptName)
    if (d) onDeptClick(d)
  }

  const cards = [
    {
      id: 'readiness' as const,
      label: 'AI readiness',
      val: `${ORG.aiReadiness}%`,
      icon: 'school',
      l1: `${ready.toLocaleString()} AI-ready of ${ORG.peopleInAugRoles.toLocaleString()} in augmentable roles`,
      hint: 'How much of addressable work the org is already equipped to capture.',
    },
    {
      id: 'potential' as const,
      label: 'AI potential',
      val: `${ORG.aiPotential}%`,
      icon: 'auto_awesome',
      l1: `${ORG.tasksInAugZone} of ${ORG.totalRoleTasks} tasks in the augmentation zone`,
      hint: `${ORG.tasksAboveThreshold} automatable, ${ORG.tasksBelowThreshold} human-only`,
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
          <MetricArc potential={ORG.aiPotential} readiness={ORG.aiReadiness} size="lg" />
        </div>
        <div className="wfr-dash__hero-copy">
          <p className="wfr-dash__eyebrow">
            {ORG.totalEmployees.toLocaleString()} employees {EM} Q1 2026
          </p>
          <h2 className="wfr-dash__headline">
            <span className="wfr-dash__headline-pct wfr-text-readiness">{ORG.aiReadiness}%</span>
            <span className="wfr-dash__headline-text">
              {' '}
              of people in augmentable roles have the skills to start using AI today.
            </span>
          </h2>
          <div className="wfr-dash__capture-tag-wrap">
            <Pill variant="neutral" size="small" className="wfr-dash__capture-tag !h-auto !max-w-none !py-2 !px-3.5">
              <span className="wfr-type-body2 text-[#1a212e]">
                ~<span className="font-bold text-[#b91c1c]">{gapPeople.toLocaleString()}</span> employees in
                augmentable roles are not yet AI-ready.
              </span>
            </Pill>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0">
        <div className="wfr-dash__cards-row">
          {cards.map((c) => (
            <article
              key={c.id}
              className={`wfr-metric-card wfr-metric-card--${c.id}`}
            >
              <div className="wfr-metric-card__top">
                <div className="wfr-metric-card__icon-wrap" aria-hidden>
                  <span className="material-symbols-outlined wfr-metric-card__icon">{c.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="wfr-metric-card__label">{c.label}</p>
                </div>
              </div>
              <p className="wfr-metric-card__value">{c.val}</p>
              <p className="wfr-metric-card__primary">{c.l1}</p>
              <div className="wfr-metric-card__footer">
                <p className="wfr-metric-card__hint">{c.hint}</p>
                <Button type="button" variant="secondary" onClick={() => setOpenMetric(c.id)} className="shrink-0">
                  Learn more
                </Button>
              </div>
            </article>
          ))}
        </div>

        {focusImmediateCount > 0 && focusPrimaryDept && (
          <div className="wfr-dash__focus-card">
            <div className="wfr-dash__focus-card-head">
              <div className="wfr-dash__focus-card-icon-wrap" aria-hidden>
                <span className="material-symbols-outlined wfr-dash__focus-card-icon">priority_high</span>
              </div>
              <span className="wfr-dash__focus-card-label">Focus first</span>
            </div>
            <p className="wfr-dash__focus-card-body">
              <strong className="wfr-dash__focus-card-headcount">
                {focusImmediateCount.toLocaleString()} employees
              </strong>{' '}
              are in roles that require immediate
              reskilling. Highest-priority department:{' '}
              <button
                type="button"
                className="wfr-dash__focus-card-dept-link wfr-dash__focus-card-primary-name"
                onClick={() => openFocusDept(focusPrimaryDept.name)}
              >
                {focusPrimaryDept.name}
              </button>
              {' '}
              <span className="wfr-dash__focus-card-meta">
                ({focusPrimaryDept.imm.toLocaleString()} people)
              </span>
              {focusSecondaryDepts.length > 0 ? (
                <>
                  . Also address{' '}
                  {focusSecondaryDepts.map((d, i) => (
                    <Fragment key={d.name}>
                      {i > 0 && (i === focusSecondaryDepts.length - 1 ? ' and ' : ', ')}
                      <button
                        type="button"
                        className="wfr-dash__focus-card-dept-link wfr-dash__focus-card-dept"
                        onClick={() => openFocusDept(d.name)}
                      >
                        {d.name}
                      </button>
                      {' '}
                      <span className="wfr-dash__focus-card-meta">({d.imm.toLocaleString()})</span>
                    </Fragment>
                  ))}
                  .
                </>
              ) : (
                '.'
              )}
            </p>
          </div>
        )}

        <WorkforceMetricSheet
          metric={openMetric}
          onClose={() => setOpenMetric(null)}
          ready={ready}
          gapPeople={gapPeople}
          hrsUnlocked={hrsUnlocked}
        />
      </div>

      <div className="wfr-dash__panel">
        <div className="wfr-dash__panel-head">
          <h3 className="wfr-dash__panel-title">Transformation gap by department</h3>
          <span className="wfr-dash__panel-hint">Sorted by gap (readiness vs. potential) {EM} click to drill down</span>
        </div>
        <div className="wfr-dash__table-scroll">
          <table className="wfr-dash__table">
            <thead>
              <tr>
                <th className="wfr-dash__th">Department</th>
                <th className="wfr-dash__th wfr-dash__th--num">Headcount</th>
                <th className="wfr-dash__th wfr-dash__th--metric-col">AI readiness</th>
                <th className="wfr-dash__th wfr-dash__th--metric-col wfr-dash__th--tight-to-gap">AI potential</th>
                <th className="wfr-dash__th wfr-dash__th--num wfr-dash__th--gap-after-potential">
                  Transformation gap
                </th>
                <th className="wfr-dash__th">Status</th>
                <th className="wfr-dash__th wfr-dash__th--action" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => {
                const st = deptStatus(d)
                const gapPp = tGap(d.aiPotential, d.aiReadiness)
                const gapColor = gapPp >= 50 ? '#dc2626' : gapPp >= 30 ? '#d97706' : '#15803d'
                const gapCount = deptGapHeadcount(d)
                return (
                  <tr key={d.name} className="wfr-dash__tr" onClick={() => onDeptClick(d)}>
                    <td className="wfr-dash__td wfr-dash__dept-name">{d.name}</td>
                    <td className="wfr-dash__td wfr-dash__td--num">{d.employees.toLocaleString()}</td>
                    <td className="wfr-dash__td wfr-dash__td--metric-col">
                      <DeptTableSoloBar variant="readiness" pct={d.aiReadiness} />
                    </td>
                    <td className="wfr-dash__td wfr-dash__td--metric-col wfr-dash__td--tight-to-gap">
                      <DeptTableSoloBar variant="potential" pct={d.aiPotential} />
                    </td>
                    <td
                      className="wfr-dash__td wfr-dash__td--num wfr-dash__td--gap-after-potential"
                      title={`${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready`}
                    >
                      <span className="wfr-type-h6 tabular-nums" style={{ color: gapColor }}>
                        {gapCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="wfr-dash__td">
                      <Badge variant={gapStatusBadgeVariant(st.label)} size="24" className="whitespace-nowrap">
                        {st.label}
                      </Badge>
                    </td>
                    <td
                      className="wfr-dash__td wfr-dash__td--action"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {st.label !== 'On track' ? (
                        <Button type="button" variant="secondary" size="sm" onClick={() => onDeptClick(d)}>
                          Take action
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function WorkforceReadinessDashboard({
  onViewChange,
}: {
  onViewChange?: (view: 'board' | 'dept' | 'role') => void
} = {}) {
  const [view, setView] = useState<'board' | 'dept' | 'role'>('board')
  const [dept, setDept] = useState<Dept | null>(null)
  const [roleFocus, setRoleFocus] = useState<RoleRowType | null>(null)

  useEffect(() => {
    onViewChange?.(view)
  }, [view, onViewChange])

  useEffect(() => {
    setRoleFocus(null)
  }, [dept?.name])

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
                  setRoleFocus(null)
                }}
              >
                Overview
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {view === 'role' && roleFocus ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => {
                      setView('dept')
                      setRoleFocus(null)
                    }}
                  >
                    {dept.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{roleFocus.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{dept.name}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="min-w-0">
        {view === 'board' && (
          <BoardView
            onDeptClick={(d) => {
              setDept(d)
              setRoleFocus(null)
              setView('dept')
            }}
          />
        )}
        {view === 'dept' && dept && (
          <DeptView
            dept={dept}
            onOpenRole={(r) => {
              setRoleFocus(r)
              setView('role')
            }}
          />
        )}
        {view === 'role' && dept && roleFocus && <RolePageView dept={dept} role={roleFocus} />}
      </div>
    </>
  )
}
