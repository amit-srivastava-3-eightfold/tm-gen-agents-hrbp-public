import { Fragment, useEffect, useState } from 'react'
import { Button, Pill } from '@tonyh-2-eightfold/ef-design-system'
import {
  EM,
  EN,
  ORG,
  OUTCOME,
  ZONE,
  deptGapHeadcount,
  deptPeopleInAugRoles,
  deptStatus,
  getRolesForDept,
  getTasksForRole,
  peopleOutcome,
  tGap,
  taskZone,
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
import { WorkforceMetricSheet } from './WorkforceMetricSheet'
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

function ReadinessBar({
  potential,
  readiness,
  width,
  showGap = true,
}: {
  potential: number
  readiness: number
  width?: number
  /** When false, show potential % on the right instead of pp gap (e.g. dept table). */
  showGap?: boolean
}) {
  const g = tGap(potential, readiness)
  const gc = g >= 50 ? '#ef4444' : g >= 30 ? '#f59e0b' : 'var(--wfr-readiness)'
  return (
    <div style={{ width: width ?? 200 }}>
      <div className="wfr-readiness-bar">
        <div className="wfr-readiness-bar__pot" style={{ width: `${potential}%` }} />
        <div className="wfr-readiness-bar__ready" style={{ width: `${readiness}%` }} />
      </div>
      <div className="mt-1 flex justify-between gap-2">
        <span className="wfr-type-caption-sb wfr-readiness-bar__label-readiness">
          {showGap ? `${readiness}% ready` : `${readiness}% readiness`}
        </span>
        {showGap ? (
          <span className="wfr-type-caption-sb shrink-0" style={{ color: gc }}>
            {g}pp gap
          </span>
        ) : (
          <span className="wfr-type-caption-sb wfr-readiness-bar__label-potential shrink-0">{potential}% potential</span>
        )}
      </div>
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

function RoleRow({ role, isFirst }: { role: RoleRowType; isFirst: boolean }) {
  const [open, setOpen] = useState(false)
  const tasks = getTasksForRole(role.title)
  const outcome = peopleOutcome(tasks)
  const o = outcome ? OUTCOME[outcome] : null
  const above = tasks.filter((t) => taskZone(t.score) === 'above')
  const aug = tasks.filter((t) => taskZone(t.score) === 'augment')
  const below = tasks.filter((t) => taskZone(t.score) === 'below')
  return (
    <>
      <tr
        onClick={() => tasks.length && setOpen((v) => !v)}
        className="wfr-role-row border-t border-slate-100"
        style={{
          cursor: tasks.length ? 'pointer' : 'default',
          background: open ? '#fafbff' : undefined,
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = '#fafafa'
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = 'transparent'
        }}
      >
        <td className="wfr-role-row__expand">
          {tasks.length > 0 && <span className="wfr-type-caption text-slate-400">{open ? 'v' : '>'}</span>}
        </td>
        <td className="wfr-role-row__cell">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="wfr-type-h6">{role.title}</span>
            {isFirst && (
              <Pill variant="orange" size="small">
                Focus first
              </Pill>
            )}
            {o && (
              <span
                className="wfr-type-caption-sb rounded-full border px-2 py-px"
                style={{ background: o.bg, color: o.color, borderColor: o.border }}
              >
                {o.label}
              </span>
            )}
          </div>
          <span className="wfr-type-caption text-slate-400">{role.employees.toLocaleString()} employees</span>
        </td>
        <td className="min-w-[180px] px-4 py-3">
          <ReadinessBar potential={role.aiPotential} readiness={role.aiReadiness} width={180} />
        </td>
        <td className="px-4 py-3">
          <Pill variant={priorityPillVariant(role.reskillPriority)} size="small">
            {role.reskillPriority}
          </Pill>
        </td>
        <td className="px-4 py-3 text-right">
          {tasks.length > 0 && (
            <Button type="button" variant="ghost" className="wfr-type-link !h-auto !min-h-0 !p-0 !font-normal">
              {open ? 'Hide' : 'See tasks'}
            </Button>
          )}
        </td>
      </tr>
      {open && tasks.length > 0 && (
        <tr className="wfr-role-row__detail">
          <td colSpan={5} className="px-5 pb-5 pl-11 pt-1">
            <div className="flex flex-col gap-3.5">
              {o && (
                <div className="rounded-[10px] border p-3 px-4" style={{ background: o.bg, borderColor: o.border }}>
                  <div className="wfr-type-label-strong mb-1" style={{ color: o.color }}>
                    What happens to these {role.employees.toLocaleString()} people
                  </div>
                  <div className="wfr-type-body3-muted leading-relaxed">
                    {outcome === 'at-risk' &&
                      `${above.length} of ${tasks.length} tasks score above 75%. Without role redesign, ${role.employees} employees face a narrowing scope of meaningful work.`}
                    {outcome === 'transforms' &&
                      `${above.length} of ${tasks.length} tasks will be automated, but ${aug.length} are in the augmentation zone. The role stays but changes.`}
                    {outcome === 'survives' &&
                      `Only ${above.length} of ${tasks.length} tasks score above the automation threshold. ${below.length} tasks are fully human ${EM} this role endures.`}
                  </div>
                </div>
              )}
              <div>
                <div className="wfr-type-label mb-2">Task scores</div>
                <div className="flex gap-2">
                  {[
                    { items: above, z: ZONE.above },
                    { items: aug, z: ZONE.augment },
                    { items: below, z: ZONE.below },
                  ].map((col) => (
                    <div key={col.z.short} className="flex-1 rounded-lg px-3 py-2.5" style={{ background: col.z.bg }}>
                      <div className="wfr-type-caption-sb mb-1.5" style={{ color: col.z.color }}>
                        {col.items.length} {col.z.short} {EM} {col.z.note}
                      </div>
                      {col.items.length === 0 ? (
                        <div className="wfr-type-italic-muted">None</div>
                      ) : (
                        col.items.map((t) => (
                          <div
                            key={t.task}
                            className="wfr-type-body3 flex items-center justify-between border-t border-black/5 py-1 first:border-0"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="inline-block h-1 w-1 shrink-0 rounded-full"
                                style={{ background: col.z.color }}
                              />
                              {t.task}
                            </div>
                            <span className="wfr-type-caption-sb" style={{ color: col.z.color }}>
                              {t.score}%
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="flex-1 rounded-lg bg-red-50 px-3.5 py-2.5">
                  <div className="wfr-type-caption-sb mb-1 text-red-600">Phase out ({'>'}75%)</div>
                  {above.length === 0 ? (
                    <div className="wfr-type-italic-muted">None</div>
                  ) : (
                    above.slice(0, 3).map((t) => (
                      <div key={t.task} className="wfr-type-body3 mb-0.5">
                        - {t.task}
                      </div>
                    ))
                  )}
                </div>
                <div className="flex-1 rounded-lg bg-[#eef2ff] px-3.5 py-2.5">
                  <div className="wfr-type-caption-sb mb-1 wfr-text-potential">Develop (15{EN}75%)</div>
                  {aug.length === 0 ? (
                    <div className="wfr-type-italic-muted">None</div>
                  ) : (
                    aug.slice(0, 3).map((t) => (
                      <div key={t.task} className="wfr-type-body3 mb-0.5">
                        - {t.task}
                      </div>
                    ))
                  )}
                </div>
                <div className="flex-1 rounded-lg bg-[#ecfdf5] px-3.5 py-2.5">
                  <div className="wfr-type-caption-sb mb-1 wfr-text-readiness">Double down on ({'<'}15%)</div>
                  {below.length === 0 ? (
                    <div className="wfr-type-italic-muted">None</div>
                  ) : (
                    below.slice(0, 3).map((t) => (
                      <div key={t.task} className="wfr-type-body3 mb-0.5">
                        - {t.task}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

type MetricId = 'potential' | 'readiness' | 'gap' | null

function DeptView({ dept }: { dept: Dept }) {
  const [openMetric, setOpenMetric] = useState<MetricId>(null)
  const roles = getRolesForDept(dept.name)
  const sorted = [...roles].sort((a, b) => tGap(b.aiPotential, b.aiReadiness) - tGap(a.aiPotential, a.aiReadiness))
  const imm = roles.filter((r) => r.reskillPriority === 'Immediate').reduce((s, r) => s + r.employees, 0)
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
      l1: `${ORG.tasksInAugZone} of ${ORG.totalRoleTasks} role tasks sit in the augmentation zone (15–75% AI assist).`,
      hint: 'Share of work where AI can meaningfully help alongside people.',
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
            AI can improve{' '}
            <span className="font-bold wfr-text-potential">{dept.aiPotential}%</span>
            {' '}
            of work in this department. The potential to grow is significant.
          </p>
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

      {imm > 0 && (
        <div className="wfr-dash__focus-banner">
          <span className="wfr-type-caption-sb text-orange-800">Focus first {EM} </span>
          <span className="wfr-type-body3 text-slate-800">
            {imm.toLocaleString()} employees in roles requiring immediate reskilling.
          </span>
        </div>
      )}
      <div className="wfr-dash__panel">
        <div className="wfr-dash__panel-head">
          <h3 className="wfr-dash__panel-title">Roles in {dept.name}</h3>
          <span className="wfr-dash__panel-hint">Sorted by gap {EM} click to see task scores</span>
        </div>
        {roles.length === 0 ? (
          <div className="wfr-type-body3-muted px-8 py-8 text-center">Role-level data not available in prototype.</div>
        ) : (
          <table className="wfr-dash__table">
            <thead>
              <tr>
                <th className="w-3.5 px-1 py-2 pl-5" />
                {['Role', 'Readiness vs. potential', 'Reskill priority', ''].map((h) => (
                  <th key={h} className="wfr-dash__th px-4 py-2 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <RoleRow key={r.title} role={r} isFirst={i === 0} />
              ))}
            </tbody>
          </table>
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
      l1: `${ready.toLocaleString()} of ${ORG.peopleInAugRoles.toLocaleString()} people in those roles show profile signals of AI readiness.`,
      hint: 'How much of addressable work the org is already equipped to capture.',
    },
    {
      id: 'potential' as const,
      label: 'AI potential',
      val: `${ORG.aiPotential}%`,
      icon: 'auto_awesome',
      l1: `${ORG.tasksInAugZone} of ${ORG.totalRoleTasks} role tasks sit in the augmentation zone (15–75% AI assist).`,
      hint: 'Share of work where AI can meaningfully help alongside people.',
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
              of people in augmentable roles show AI readiness signals. As readiness grows, more of your workforce
              captures the AI opportunity.
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
        <table className="wfr-dash__table">
          <thead>
            <tr>
              <th className="wfr-dash__th">Department</th>
              <th className="wfr-dash__th wfr-dash__th--num">Headcount</th>
              <th className="wfr-dash__th wfr-dash__th--metric-col">AI readiness</th>
              <th className="wfr-dash__th wfr-dash__th--metric-col wfr-dash__th--tight-to-gap">AI potential</th>
              <th className="wfr-dash__th wfr-dash__th--num wfr-dash__th--gap-after-potential">Transformation gap</th>
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
                    <span
                      className="wfr-type-caption-sb whitespace-nowrap rounded-full border px-2 py-0.5"
                      style={{ background: st.bg, color: st.color, borderColor: st.border }}
                    >
                      {st.label}
                    </span>
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
  )
}

export function WorkforceReadinessDashboard({
  onViewChange,
}: {
  onViewChange?: (view: 'board' | 'dept') => void
} = {}) {
  const [view, setView] = useState<'board' | 'dept'>('board')
  const [dept, setDept] = useState<Dept | null>(null)

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
          />
        )}
        {view === 'dept' && dept && <DeptView dept={dept} />}
      </div>
    </>
  )
}
