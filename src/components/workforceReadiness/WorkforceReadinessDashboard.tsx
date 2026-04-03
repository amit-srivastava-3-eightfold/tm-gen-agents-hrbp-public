import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import {
  Badge, Button, Pill,
  Tabs, TabsList, TabsTrigger, TabsContent,
  DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableHead, DataTableCell,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@tonyh-2-eightfold/ef-design-system'
import {
  departments,
  EM,
  ORG,
  deptGapHeadcount,
  deptPeopleInAugRoles,
  getEmployeesForRole,
  getRolesForDept,
  getTasksForRole,
  wfrDemoDeptResponseRate,
  wfrRollupDepartmentsByName,
  getDeptHrbps,
  getHrbpDepts,
  hrbpAssignments,
  type Dept,
  type RoleRowType,
} from '../../data/wfrOrgData'
// import { CollectionProgressPanel } from './CollectionProgressPanel'
import { deptReadinessTrend, deptManagerTeams, DEMO_MANAGERS, demoManagerName } from './collectionHelpers'
import './CollectionProgressPanel.css'
import { FocusFirstModule, type FocusCollectionLaunchSummary } from './FocusFirstModule'
import { UpskillingLaunchDialog, type UpskillingLaunchSummary } from './UpskillingLaunchDialog'
// FocusCollectionDetailSheet removed — collection progress is now inline in the table panel tabs
import { MetricCard } from './MetricCard'
import { PersonDetailLayout } from './PersonDetailLayout'
import { ReadinessTrendSheet } from './ReadinessTrendSheet'
import { WorkforceMetricSheet, type WorkforceMetricSheetId } from './WorkforceMetricSheet'
import './WorkforceReadinessDashboard.css'
import '../../pages/ManagerDetailPage.css'

/* ─── WFR Universal Program State ─── */

export type WfrProgramState = 1 | 2 | '2b' | 3 | 4 | 5

export type WfrPersistedState = {
  state: WfrProgramState
  collectionLaunchSummary?: FocusCollectionLaunchSummary | null
  upskillingLaunchSummary?: UpskillingLaunchSummary | null
}

const WFR_STATE_KEY = 'tm:wfr-state'

function writeWfrState(s: WfrPersistedState) {
  try { localStorage.setItem(WFR_STATE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

/** Derive boolean convenience flags from the universal state. */
export function deriveWfrFlags(state: WfrProgramState) {
  const n = state === '2b' ? 2.5 : (state as number)
  return {
    collectionActive: n >= 2,
    collectionJustCompleted: state === '2b',
    collectionComplete: n >= 3,
    upskillingActive: n >= 4,
    hrbpPlansCreated: n >= 5,
  }
}

/* ─── End WFR state helpers ─── */

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
            {'AI ADOPTION'}
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

function MetricInfoDialog({ open, onClose, collectionComplete = false }: { open: boolean; onClose: () => void; collectionComplete?: boolean }) {
  if (!open) return null
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: 'min(820px, calc(100vw - 48px))', maxHeight: 'calc(100vh - 48px)', overflow: 'auto', background: '#ffffff', borderRadius: 16, padding: '40px 44px', color: '#1a212e', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <button type="button" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', textAlign: 'center', margin: '0 0 8px' }}>Understanding your two core metrics</h2>
        <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', margin: '0 0 28px' }}>Two numbers work together to tell you where your workforce stands — and what it takes to close the gap.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          {/* AI Potential card */}
          <div style={{ border: '1.5px solid #c7d2fe', borderRadius: 12, padding: '24px 20px', background: '#eef2ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#6366f1', background: 'rgba(99,102,241,0.12)', borderRadius: 8, padding: 6 }}>layers</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6366f1' }}>AI Potential</span>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', lineHeight: 1.35, margin: '0 0 10px' }}>How much of your workforce's work can AI meaningfully improve?</h3>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>We map every role into its tasks and score each one for how much AI can help — either by taking it over entirely or by making the person doing it faster and better.</p>
            <div style={{ borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>High score</strong> = significant capacity to free people from low-value work and redirect effort toward judgment-intensive tasks.</span>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', marginTop: 6, flexShrink: 0 }} />
                <span>Scores are based on 8 research sources including real-world adoption data, academic studies, and government labor statistics — not a single model's opinion.</span>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', marginTop: 6, flexShrink: 0 }} />
                <span>A high score is an opportunity, not a threat.</span>
              </div>
            </div>
          </div>

          {/* AI Readiness card */}
          <div style={{ border: '1.5px solid #bbf7d0', borderRadius: 12, padding: '24px 20px', background: '#f0fdf4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#15803d', background: 'rgba(34,197,94,0.12)', borderRadius: 8, padding: 6 }}>verified</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#15803d' }}>{'AI Adoption'}</span>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', lineHeight: 1.35, margin: '0 0 10px' }}>Of the people AI can help — how many have the skills to use it today?</h3>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>We look at each employee's skill profile against a forward-looking taxonomy: AI tool proficiency, data interpretation, workflow oversight, and exception handling.</p>
            <div style={{ borderTop: '1px solid rgba(34,197,94,0.15)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>AI-Native</strong> — already working with AI/ML tools like ChatGPT, Python, or computer vision in their daily work.</span>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>AI-Ready</strong> — strong technical foundation (SQL, data analysis, cloud tools) that transfers directly to AI workflows.</span>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#15803d', marginTop: 6, flexShrink: 0 }} />
                <span>A low score means the workforce has the potential — but not yet the capability to capture it. That's the gap to close.</span>
              </div>
            </div>
            {!collectionComplete && (
              <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 8, background: '#fefce8', border: '1px solid #fde68a', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#92400e', marginTop: 1, flexShrink: 0 }}>info</span>
                <div style={{ margin: 0 }}>
                  <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.55, margin: '0 0 8px' }}>
                    <strong>Currently estimated</strong> — this score is derived from employee skill profiles, not actual AI adoption behavior. Start data collection to ground-truth readiness with real adoption signals from your workforce.
                  </p>
                  <button type="button" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#92400e', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    <span style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>Get the real number</span> <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transformation gap */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>The transformation gap</h3>
            <span style={{ fontSize: 12, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 6, padding: '3px 10px' }}>Your upskilling opportunity</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#6366f1', width: 90, flexShrink: 0 }}>AI Potential</span>
              <div style={{ flex: 1, height: 10, borderRadius: 5, background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{ width: `${ORG.aiPotential}%`, height: '100%', borderRadius: 5, background: 'linear-gradient(90deg, #4f46e5, #818cf8)' }} />
              </div>
              <span style={{ fontSize: 13, color: '#6366f1', width: 36, textAlign: 'right' }}>{ORG.aiPotential}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#15803d', width: 90, flexShrink: 0 }}>{'AI Adoption'}</span>
              <div style={{ flex: 1, height: 10, borderRadius: 5, background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{ width: `${ORG.aiReadiness}%`, height: '100%', borderRadius: 5, background: 'linear-gradient(90deg, #15803d, #22c55e)' }} />
              </div>
              <span style={{ fontSize: 13, color: '#15803d', width: 36, textAlign: 'right' }}>{ORG.aiReadiness}%</span>
            </div>
          </div>
          <div style={{ marginTop: 14, borderLeft: '3px solid #f59e0b', paddingLeft: 14 }}>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              A {ORG.aiPotential - ORG.aiReadiness}-point gap means {ORG.aiPotential}% of work <em>could</em> be AI-assisted today — but only {ORG.aiReadiness}% of your workforce has the skills to do so. Closing that gap is where the product focuses.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function MetricHeaderLabel({ label, metric, onInfoClick, sortDir, onSortClick }: { label: string; metric: keyof typeof METRIC_INFO; onInfoClick?: () => void; sortDir?: 'asc' | 'desc' | null; onSortClick?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1" onClick={onSortClick} style={onSortClick ? { cursor: 'pointer' } : undefined}>
      {label}
      <span
        className="material-symbols-outlined wfr-dash__header-info"
        title={METRIC_INFO[metric]}
        style={{ fontSize: 14, color: '#94a3b8', cursor: 'pointer', verticalAlign: -1 }}
        onClick={(e) => { e.stopPropagation(); onInfoClick?.() }}
      >
        info
      </span>
      {sortDir ? (
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
      ) : onSortClick ? (
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>
      ) : null}
    </span>
  )
}

export function DeptTableSoloBar({
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


function DeptView({
  dept,
  wfrState,
  onCollectionActiveChange,
  onCompleteCollection,
  onViewCollectionResults,
  onStartUpskilling,
  onCompleteUpskilling,
  focusLaunchOpen,
  setFocusLaunchOpen,
  onHrbpClick,
}: {
  dept: Dept
  wfrState: WfrPersistedState
  onCollectionActiveChange: (active: boolean, launchSummary?: FocusCollectionLaunchSummary | null) => void
  onCompleteCollection: () => void
  onViewCollectionResults: () => void
  onStartUpskilling: (summary: UpskillingLaunchSummary) => void
  onCompleteUpskilling: () => void
  focusLaunchOpen: boolean
  setFocusLaunchOpen: (open: boolean) => void
  onHrbpClick: (hrbpName: string) => void
}) {
  // Derive convenience flags from universal state
  const navigate = useNavigate()
  const { currentUser } = useUser()
  const isHrbp = currentUser.id === 'jaydon-torff'
  const { collectionActive: orgCollectionActive, collectionComplete: orgCollectionComplete, collectionJustCompleted: deptCollectionJustCompleted, upskillingActive, hrbpPlansCreated: deptHrbpPlansCreated } = deriveWfrFlags(wfrState.state)
  const collectionLaunchSummary = wfrState.collectionLaunchSummary ?? null
  const upskillingLaunchSummary = wfrState.upskillingLaunchSummary ?? null
  const [openMetric, setOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
  // expandedManagers removed — manager rows now navigate to detail page
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [trendSheetManager, setTrendSheetManager] = useState<{ manager: string; mgrIndex: number } | null>(null)
  const [deptUpskillingOpen, setDeptUpskillingOpen] = useState(false)
  const [deptUpskillingRoles, setDeptUpskillingRoles] = useState<Record<string, boolean>>({})
  const [deptUpskillingScope, setDeptUpskillingScope] = useState<'all' | 'select'>('all')
  const [assignPlansDialogOpen, setAssignPlansDialogOpen] = useState(false)
  const [devPlanEmployee, setDevPlanEmployee] = useState<{ name: string; title?: string; readinessPct: number } | null>(null)
  const [editingCourses, setEditingCourses] = useState(false)
  const [editingSkills, setEditingSkills] = useState(false)
  const [removedCourses, setRemovedCourses] = useState<Set<number>>(new Set())
  const [removedSkills, setRemovedSkills] = useState<Set<string>>(new Set())
  const [assignedPlans, setAssignedPlans] = useState<Set<string>>(new Set())
  const [metricInfoOpen, setMetricInfoOpen] = useState(false)
  const deptRolesPanelRef = useRef<HTMLDivElement>(null)
  const deptAug = deptPeopleInAugRoles(dept)
  const gapCount = deptGapHeadcount(dept)
  const deptReady = Math.max(0, deptAug - gapCount)
  const gapSharePct = deptAug > 0 ? Math.min(100, Math.round((gapCount / deptAug) * 100)) : 0
  const deptHrsUnlocked = Math.round(gapCount * ORG.hrsPerPersonWeek)

  // Calibration deltas for metric cards
  const deptTrendData = deptReadinessTrend(dept.name)
  const deptCalibDelta = orgCollectionComplete ? deptTrendData.delta : 0
  const deptUpskillingBoost = deptHrbpPlansCreated ? 10 : 0
  const deptTotalReadinessDelta = deptCalibDelta + deptUpskillingBoost
  const calibratedReadiness = Math.min(100, dept.aiReadiness + deptTotalReadinessDelta)
  const calibratedReady = Math.round(deptAug * calibratedReadiness / 100)
  const calibratedGap = Math.max(0, deptAug - calibratedReady)
  const deptGapDelta = (orgCollectionComplete || deptHrbpPlansCreated) ? calibratedGap - gapCount : 0
  const calibGapSharePct = deptAug > 0 ? Math.min(100, Math.round((calibratedGap / deptAug) * 100)) : 0

  const deptEstimatedBadge = <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>
  const deptMeasuredBadge = <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#15803d', padding: '1px 7px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>

  const deptCards = [
    {
      id: 'readiness' as const,
      label: 'AI adoption',
      badge: orgCollectionComplete ? deptMeasuredBadge : deptEstimatedBadge,
      val: orgCollectionComplete ? `${calibratedReadiness}%` : `${dept.aiReadiness}%`,
      icon: 'school',
      l1: orgCollectionComplete
        ? `${calibratedReady.toLocaleString()} of ${deptAug.toLocaleString()} people in those roles are AI-ready.`
        : `Estimated: ${deptReady.toLocaleString()} of ${deptAug.toLocaleString()} may be AI-ready based on skill profiles.`,
      hint: deptHrbpPlansCreated
        ? 'After upskilling plans completed.'
        : orgCollectionComplete
          ? 'Calibrated from data collection.'
          : `Estimated from skill profiles. Org average ${ORG.aiReadiness}%.`,
      delta: deptTotalReadinessDelta !== 0 ? `${deptTotalReadinessDelta > 0 ? '+' : ''}${deptTotalReadinessDelta}pt` : null,
      deltaUp: deptTotalReadinessDelta > 0,
    },
    {
      id: 'potential' as const,
      label: 'AI potential',
      val: `${dept.aiPotential}%`,
      icon: 'auto_awesome',
      l1: `${ORG.tasksInAugZone} of ${ORG.totalRoleTasks} tasks in the augmentation zone`,
      hint: `${ORG.tasksAboveThreshold} automatable, ${ORG.tasksBelowThreshold} human-only`,
      delta: null as string | null,
      deltaUp: true,
    },
    {
      id: 'gap' as const,
      label: 'Transformation gap',
      val: orgCollectionComplete ? calibratedGap.toLocaleString() : gapCount.toLocaleString(),
      icon: 'groups',
      l1: orgCollectionComplete
        ? `${calibratedGap.toLocaleString()} people in augmentable roles are not yet AI-ready—that's your prioritized development pool.`
        : `${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready—that's your prioritized development pool.`,
      hint: `${orgCollectionComplete ? calibGapSharePct : gapSharePct}% of augmentable-role headcount still in the gap.`,
      delta: deptGapDelta !== 0 ? `${deptGapDelta > 0 ? '+' : ''}${deptGapDelta}` : null,
      deltaUp: deptGapDelta < 0, // gap going down is good
    },
  ]

  return (
    <div className="wfr-dash flex flex-col gap-6">
      <div className="mgr-detail-page__summary">
        <h2 className="mgr-detail-page__name">{dept.name}</h2>
        <p className="mgr-detail-page__subtitle">{dept.employees.toLocaleString()} employees · {getDeptHrbps(dept.name).length > 1 ? 'HRBPs' : 'HRBP'}: {getDeptHrbps(dept.name).map(h => h.hrbp).join(', ') || '—'}</p>
      </div>
      <header className="wfr-dash__hero wfr-dash__dept-hero">
        <div className="shrink-0">
          <MetricArcReadinessSemicircle readiness={dept.aiReadiness} compact />
        </div>
        <div className="wfr-dash__hero-copy">
          <p className="wfr-dash__eyebrow">
            {dept.employees.toLocaleString()} employees {EM} {dept.name} {EM} {getDeptHrbps(dept.name).length > 1 ? 'HRBPs' : 'HRBP'}: {getDeptHrbps(dept.name).map(h => h.hrbp).join(', ') || '—'} {EM} Q1 2026
          </p>
          <h2 className="wfr-dash__headline">
            <span className="wfr-dash__headline-pct wfr-text-readiness">{dept.aiReadiness}%</span>
            <span className="wfr-dash__headline-text">
              {' '}
              of people in augmentable roles in <strong>{dept.name}</strong> are AI-ready.
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
          onCollectionComplete={onCompleteCollection}
          onViewResults={onViewCollectionResults}
          launchOpen={focusLaunchOpen}
          onLaunchOpenChange={setFocusLaunchOpen}
          onRequestCloseMetricSheet={() => setOpenMetric(null)}
          deptContext={dept}
          collectionLaunchSummary={collectionLaunchSummary}
          onScrollToTable={() => document.getElementById('dept-collection-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          onStartUpskilling={() => {
            const deptInUpskilling = upskillingActive && upskillingLaunchSummary?.departmentNames?.includes(dept.name)
            const deptPlansAssigned = deptInUpskilling && upskillingLaunchSummary?.plansAssigned?.includes(dept.name)
            if (deptInUpskilling && !deptPlansAssigned) {
              // State 3a → open assign dialog
              setAssignPlansDialogOpen(true)
            } else {
              // State 3: open the dialog to create plans
              setDeptUpskillingScope('all')
              setDeptUpskillingRoles({})
              setDeptUpskillingOpen(true)
            }
          }}
          upskillingActive={upskillingActive}
          upskillingLaunchSummary={upskillingLaunchSummary}
          hrbpPlansCreated={deptHrbpPlansCreated}
        />

        <div className="wfr-dash__cards-row">
          {deptCards.map((c) => (
            <MetricCard
              key={c.id}
              variant={c.id}
              icon={c.icon}
              label={c.label}
              badge={c.badge}
              value={c.delta ? (
                <>{c.val} <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: c.deltaUp ? '#15803d' : '#dc2626', padding: '2px 8px', borderRadius: 12, background: c.deltaUp ? '#f0fdf4' : '#fef2f2', border: `1px solid ${c.deltaUp ? '#bbf7d0' : '#fecaca'}`, verticalAlign: 'middle' }}>{c.deltaUp ? '↑' : '↓'} {c.delta}</span></>
              ) : c.val}
              description={c.l1}
              hint={c.hint}
              onLearnMore={() => setMetricInfoOpen(true)}
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
            <Tabs defaultValue="hrbps">
              <div className="wfr-dash__panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TabsList>
                  <TabsTrigger value="hrbps">HRBPs</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="roles">Roles</TabsTrigger>
                </TabsList>
                <span className="wfr-dash__panel-hint">Sorted by gap {EM} click to view team</span>
              </div>
              <TabsContent value="hrbps">
                {(() => {
                  const deptHrbpList = getDeptHrbps(dept.name)
                  const deptTrendData = deptReadinessTrend(dept.name)
                  const measuredDeptReadiness = orgCollectionComplete ? dept.aiReadiness + deptTrendData.delta : dept.aiReadiness
                  const deptGap = orgCollectionComplete ? deptGapHeadcount({ ...dept, aiReadiness: measuredDeptReadiness } as unknown as Dept) : deptGapHeadcount(dept)
                  return (
                    <DataTable bordered>
                      <DataTableHeader>
                        <DataTableRow>
                          <DataTableHead>HRBP</DataTableHead>
                          <DataTableHead numeric>Coverage</DataTableHead>
                          <DataTableHead metric>Team AI adoption</DataTableHead>
                          <DataTableHead metric>Team AI potential</DataTableHead>
                          <DataTableHead numeric>Transformation gap</DataTableHead>
                        </DataTableRow>
                      </DataTableHeader>
                      <DataTableBody>
                        {deptHrbpList
                          .map(h => {
                            const share = dept.employees > 0 ? h.headcount / dept.employees : 0
                            const gap = Math.round(deptGap * share)
                            return { ...h, gap }
                          })
                          .sort((a, b) => b.gap - a.gap)
                          .map(h => (
                            <DataTableRow key={h.hrbp} style={{ cursor: 'pointer' }} onClick={() => { onHrbpClick(h.hrbp) }}>
                              <DataTableCell className="font-semibold">
                                <span className="text-[#3b5bdb]">{h.hrbp}</span>
                              </DataTableCell>
                              <DataTableCell align="right" numeric>{h.headcount.toLocaleString()} of {dept.employees.toLocaleString()}</DataTableCell>
                              <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={measuredDeptReadiness} /></DataTableCell>
                              <DataTableCell metric><DeptTableSoloBar variant="potential" pct={dept.aiPotential} /></DataTableCell>
                              <DataTableCell align="right">
                                <span className="wfr-type-h6 tabular-nums">{h.gap.toLocaleString()}</span>
                              </DataTableCell>
                            </DataTableRow>
                          ))}
                      </DataTableBody>
                    </DataTable>
                  )
                })()}
              </TabsContent>
              <TabsContent value="team">
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
                    <DataTableHead metric><MetricHeaderLabel label={'Team AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} /></DataTableHead>
                    <DataTableHead metric><MetricHeaderLabel label="Team AI potential" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} /></DataTableHead>
                    <DataTableHead numeric><MetricHeaderLabel label="Gap" metric="gap" /></DataTableHead>
                    {orgCollectionActive && !orgCollectionComplete ? (
                      <>
                        <DataTableHead metric className="bg-[#f8fafc] border-l border-[#e2e8f0]">Collection progress</DataTableHead>
                        <DataTableHead className="bg-[#f8fafc]">Channels</DataTableHead>
                      </>
                    ) : null}
                    {deptInUpskilling && upskillingLaunchSummary?.plansAssigned?.includes(dept.name) ? (
                      <DataTableHead className="">Upskilling status</DataTableHead>
                    ) : null}
                    {orgCollectionComplete ? (
                      <>
                        <DataTableHead>Plan</DataTableHead>
                        <DataTableHead>Plan progress</DataTableHead>
                      </>
                    ) : null}
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {(() => {
                    /* Pre-compute calibrated employees and gap per manager so we can sort by it */
                    const deptTrendDelta = orgCollectionComplete ? deptReadinessTrend(dept.name).delta : 0
                    const upskillingBoostBase = deptHrbpPlansCreated ? (isHrbp ? 10 : 8) : 0
                    const nameHash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
                    let runningIdx = 0
                    const enriched = managers.map((mgr, mgrIdx) => {
                      const emps = allDeptEmps.slice(runningIdx, Math.min(runningIdx + mgr.employees, allDeptEmps.length))
                      runningIdx += mgr.employees
                      const calibratedEmps = emps.map(e => {
                        const empBoost = deptHrbpPlansCreated ? Math.round(upskillingBoostBase * (0.5 + (nameHash(e.name) % 10) / 10)) : 0
                        return { ...e, displayReadiness: Math.max(0, Math.min(100, e.readinessPct + deptTrendDelta + empBoost)) }
                      })
                      const readiness = calibratedEmps.length > 0
                        ? Math.round(calibratedEmps.reduce((s, e) => s + e.displayReadiness, 0) / calibratedEmps.length)
                        : dept.aiReadiness
                      return { mgr, mgrIdx, gap: dept.aiPotential - readiness, readiness, calibratedEmps }
                    })
                    enriched.sort((a, b) => b.gap - a.gap)
                    return enriched
                  })().map(({ mgr, mgrIdx, readiness: mgrReadiness, calibratedEmps }, mi) => {
                    const mgrKey = `dept-${dept.name}-${mgr.manager}`

                    const inScope = collectionLaunchSummary?.scopedDepartmentNames?.includes(dept.name)
                    const mgrResponseRate = inScope ? Math.min(100, wfrDemoDeptResponseRate(dept.name) + ((mgr.manager.length * 3) % 20) - 10) : 0
                    const showCollection = orgCollectionActive && !orgCollectionComplete
                    return (
                      <Fragment key={mgrKey}>
                        <DataTableRow onClick={() => navigate(`/workforce/manager/${encodeURIComponent(mgr.manager)}?dept=${encodeURIComponent(dept.name)}&mgrIdx=${mgrIdx}`)} style={{ cursor: 'pointer' }}>
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
                            <div>
                              <div className="text-[#3b5bdb] hover:underline">{mgr.manager}</div>
                              <div className="text-[#94a3b8] text-[11px] font-normal">{mgr.title}</div>
                            </div>
                          </DataTableCell>
                          <DataTableCell align="right" numeric>{mgr.employees.toLocaleString()}</DataTableCell>
                          <DataTableCell metric>
                            {(() => {
                              const readyCount = calibratedEmps.filter(e => e.displayReadiness >= 50).length
                              const totalCount = calibratedEmps.length || mgr.employees
                              const readySub = <div className="text-[10px] text-[#94a3b8] mt-0.5">{readyCount} of {totalCount} AI-ready</div>
                              if (orgCollectionComplete) {
                                const deptTrend = deptReadinessTrend(dept.name)
                                return (
                                  <div>
                                    <div className="wfr-dash__readiness-with-trend">
                                      <DeptTableSoloBar variant="readiness" pct={mgrReadiness} />
                                      <button type="button" className={`wfr-dash__trend-badge ${deptTrend.direction === 'up' ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setTrendSheetManager({ manager: mgr.manager, mgrIndex: mi }) }} title="View readiness trend details">
                                        <span className="wfr-dash__trend-badge-text">{deptTrend.direction === 'up' ? '↑' : '↓'}{Math.abs(deptTrend.delta)}pt</span>
                                        <span className="material-symbols-outlined wfr-dash__trend-badge-icon">info</span>
                                      </button>
                                    </div>
                                    {readySub}
                                  </div>
                                )
                              }
                              return (
                                <div>
                                  <DeptTableSoloBar variant="readiness" pct={mgrReadiness} />
                                  {readySub}
                                </div>
                              )
                            })()}
                          </DataTableCell>
                          <DataTableCell metric>
                            <DeptTableSoloBar variant="potential" pct={dept.aiPotential} />
                          </DataTableCell>
                          <DataTableCell align="right">
                            {(() => {
                              const notReady = calibratedEmps.filter(e => e.displayReadiness < 50).length
                              const total = calibratedEmps.length || mgr.employees
                              const pct = total > 0 ? notReady / total : 0
                              const color = pct > 0.75 ? '#dc2626' : pct > 0.25 ? '#d97706' : '#15803d'
                              return (
                                <div>
                                  <span className="text-[16px] font-bold" style={{ color }}>{notReady}</span>
                                  <div className="text-[10px] text-[#94a3b8] mt-0.5">of {total} not ready</div>
                                </div>
                              )
                            })()}
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
                          {deptInUpskilling && upskillingLaunchSummary?.plansAssigned?.includes(dept.name) ? (
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
                                {deptInUpskilling ? (
                                  <button
                                    type="button"
                                    className="text-[12px] font-medium text-[#3b5bdb] hover:underline"
                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                    onClick={(e) => { e.stopPropagation(); setDevPlanEmployee({ name: mgr.manager, title: mgr.title, readinessPct: mgrReadiness }); setEditingCourses(false); setEditingSkills(false); setRemovedCourses(new Set()); setRemovedSkills(new Set()) }}
                                  >
                                    <span className="inline-flex items-center gap-1">
                                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>description</span>
                                      View plan
                                    </span>
                                  </button>
                                ) : (
                                  <span className="text-[12px] text-[#94a3b8]">—</span>
                                )}
                              </DataTableCell>
                              <DataTableCell>
                                {(assignedPlans.has(mgr.manager) || upskillingLaunchSummary?.plansAssigned?.includes(dept.name)) ? (() => {
                                  const total = calibratedEmps.length || mgr.employees
                                  const mgrPlanHash = mgr.manager.split('').reduce((h2: number, c: string) => ((h2 << 5) - h2 + c.charCodeAt(0)) | 0, 0)
                                  const completedCount = Math.round(total * (0.05 + (Math.abs(mgrPlanHash) % 25) / 100))
                                  const enrolledCount = Math.min(total, completedCount + Math.round(total * (0.3 + (Math.abs(mgrPlanHash * 3) % 40) / 100)))
                                  const notStarted = total - enrolledCount
                                  const enrollPct = total > 0 ? Math.round((enrolledCount / total) * 100) : 0
                                  const barColor = enrollPct >= 90 ? '#22c55e' : enrollPct >= 50 ? '#818cf8' : '#d97706'
                                  return (
                                    <div>
                                      <div className="wfr-dash__plan-progress">
                                        <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                                          <div className="wfr-dash__plan-progress-fill" style={{ width: `${enrollPct}%`, background: barColor }} />
                                        </div>
                                        <span className="wfr-dash__plan-progress-label">{enrollPct}%</span>
                                      </div>
                                      <div className="text-[10px] text-[#64748b] mt-1 flex gap-2">
                                        <span style={{ color: '#15803d' }}>{completedCount} done</span>
                                        <span style={{ color: '#6366f1' }}>{enrolledCount - completedCount} active</span>
                                        {notStarted > 0 && <span style={{ color: '#94a3b8' }}>{notStarted} pending</span>}
                                      </div>
                                    </div>
                                  )
                                })() : (
                                  <button
                                    type="button"
                                    className="wfr-dash__assign-btn"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Assign
                                  </button>
                                )}
                              </DataTableCell>
                            </>
                          ) : null}
                        </DataTableRow>
                      </Fragment>
                    )
                  })}
                </DataTableBody>
              </DataTable>
              </TabsContent>
              <TabsContent value="roles">
                <DataTable bordered>
                  <DataTableHeader>
                    <DataTableRow>
                      <DataTableHead>Role</DataTableHead>
                      <DataTableHead numeric>Headcount</DataTableHead>
                      <DataTableHead metric><MetricHeaderLabel label={'AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} /></DataTableHead>
                      <DataTableHead metric><MetricHeaderLabel label="AI potential" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} /></DataTableHead>
                      <DataTableHead numeric><MetricHeaderLabel label="Gap" metric="gap" /></DataTableHead>
                      {upskillingActive && <DataTableHead>Upskilling status</DataTableHead>}
                    </DataTableRow>
                  </DataTableHeader>
                  <DataTableBody>
                    {[...deptRoles].sort((a, b) => {
                      const gapA = a.employees - Math.round(a.employees * a.aiReadiness / 100)
                      const gapB = b.employees - Math.round(b.employees * b.aiReadiness / 100)
                      return gapB - gapA
                    }).map((role) => {
                      const roleEmps = getEmployeesForRole(role)
                      const readyCount = roleEmps.filter(e => e.readinessPct >= 50).length
                      const notReadyCount = roleEmps.length - readyCount
                      const gapPct2 = roleEmps.length > 0 ? notReadyCount / roleEmps.length : 0
                      const gapColor = gapPct2 > 0.75 ? '#dc2626' : gapPct2 > 0.25 ? '#d97706' : '#15803d'
                      // Calibrated readiness for state 3+
                      const roleTrend = deptReadinessTrend(dept.name)
                      const measuredReadiness = orgCollectionComplete ? Math.min(100, role.aiReadiness + roleTrend.delta) : role.aiReadiness
                      const trendDelta = measuredReadiness - role.aiReadiness
                      return (
                        <DataTableRow key={`role-${dept.name}-${role.title}`}>
                          <DataTableCell className="font-semibold">{role.title}</DataTableCell>
                          <DataTableCell align="right" numeric>{role.employees.toLocaleString()}</DataTableCell>
                          <DataTableCell metric>
                            {orgCollectionComplete ? (
                              <div className="wfr-dash__readiness-with-trend">
                                <DeptTableSoloBar variant="readiness" pct={measuredReadiness} />
                                <span className={`wfr-dash__trend-badge ${trendDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`}>
                                  <span className="wfr-dash__trend-badge-text">{trendDelta >= 0 ? '↑' : '↓'}{Math.abs(trendDelta)}pt</span>
                                </span>
                              </div>
                            ) : (
                              <div>
                                <DeptTableSoloBar variant="readiness" pct={role.aiReadiness} />
                                <div className="text-[10px] text-[#94a3b8] mt-0.5">{readyCount} of {roleEmps.length} AI-ready</div>
                              </div>
                            )}
                          </DataTableCell>
                          <DataTableCell metric>
                            <DeptTableSoloBar variant="potential" pct={role.aiPotential} />
                          </DataTableCell>
                          <DataTableCell align="right">
                            <div>
                              <span className="text-[16px] font-bold" style={{ color: gapColor }}>{notReadyCount}</span>
                              <div className="text-[10px] text-[#94a3b8] mt-0.5">of {roleEmps.length} not ready</div>
                            </div>
                          </DataTableCell>
                          {upskillingActive && (
                            <DataTableCell>
                              {deptHrbpPlansCreated ? (() => {
                                const h = role.title.split('').reduce((a: number, c: string) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
                                const total = notReadyCount
                                const isFullyComplete = Math.abs(h) % 7 === 0
                                const isNearlyDone = Math.abs(h) % 5 === 0 && !isFullyComplete
                                let completed: number, inProgress: number, notStarted: number
                                if (isFullyComplete) { completed = total; inProgress = 0; notStarted = 0 }
                                else if (isNearlyDone) { completed = Math.round(total * (70 + (Math.abs(h) % 20)) / 100); inProgress = Math.round(total * (10 + (Math.abs(h * 3) % 15)) / 100); notStarted = Math.max(0, total - completed - inProgress) }
                                else { completed = Math.round(total * (10 + (Math.abs(h) % 30)) / 100); inProgress = Math.round(total * (20 + (Math.abs(h * 3) % 25)) / 100); notStarted = Math.max(0, total - completed - inProgress) }
                                const cW = total > 0 ? (completed / total) * 100 : 0
                                const iW = total > 0 ? (inProgress / total) * 100 : 0
                                return (
                                  <div style={{ minWidth: 140 }}>
                                    <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: '#e5e7eb', marginBottom: 4 }}>
                                      <div style={{ width: `${cW}%`, background: '#22c55e' }} />
                                      <div style={{ width: `${iW}%`, background: '#f59e0b' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#64748b' }}>
                                      <span><span style={{ color: '#15803d', fontWeight: 600 }}>{completed}</span> done</span>
                                      <span><span style={{ color: '#d97706', fontWeight: 600 }}>{inProgress}</span> active</span>
                                      <span><span style={{ color: '#94a3b8', fontWeight: 600 }}>{notStarted}</span> pending</span>
                                    </div>
                                  </div>
                                )
                              })() : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 12, fontWeight: 600, color: '#92400e', whiteSpace: 'nowrap' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit_note</span>
                                  Creating plans
                                </span>
                              )}
                            </DataTableCell>
                          )}
                        </DataTableRow>
                      )
                    })}
                  </DataTableBody>
                </DataTable>
              </TabsContent>
            </Tabs>
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
        collectionComplete={orgCollectionComplete}
      />

      {/* Assign plans dialog */}
      {assignPlansDialogOpen && (() => {
        const gapEmps = deptGapHeadcount(dept)
        return (
          <>
            <div className="wfr-focus-launch__overlay" onClick={() => setAssignPlansDialogOpen(false)} />
            <div className="wfr-focus-launch__content" style={{ width: 'min(480px, calc(100vw - 32px))' }}>
              <div className="wfr-focus-launch__header">
                <div className="wfr-focus-launch__header-top">
                  <h2 className="wfr-focus-launch__dialog-title">Assign development plans</h2>
                  <button type="button" className="wfr-focus-launch__close" onClick={() => setAssignPlansDialogOpen(false)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              <div className="wfr-focus-launch__body">
                <h3 className="wfr-focus-launch__title">Assign development plans for {dept.name}?</h3>
                <p className="wfr-focus-launch__sub">
                  <strong>{gapEmps.toLocaleString()}</strong> development plans will be assigned to employees across <strong>{deptManagerTeams(dept.name, dept.employees).length}</strong> teams. Employees will be notified and can begin their learning path immediately.
                </p>
              </div>
              <div className="wfr-focus-launch__footer">
                <Button variant="outline" onClick={() => setAssignPlansDialogOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => {
                  setAssignPlansDialogOpen(false)
                  // Plans assigned for this dept — advance to upskilled
                  onCompleteUpskilling()
                }}>Assign plans&nbsp;→</Button>
              </div>
            </div>
          </>
        )
      })()}

      {/* Dept-level upskilling role selection dialog */}
      {deptUpskillingOpen && (() => {
        const mgrTeams = deptManagerTeams(dept.name, dept.employees)
        const selectedMgrCount = mgrTeams.filter((m) => deptUpskillingRoles[m.manager]).length
        const deptGap = deptGapHeadcount(dept)
        return (
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
              <h3 className="wfr-focus-launch__title">Which teams need development plans?</h3>
              <p className="wfr-focus-launch__sub">Development plans will be created and assigned to selected employees to {'close adoption gaps'}.</p>

              <div className="wfr-focus-launch__options" role="radiogroup" aria-label="Scope">
                <button
                  type="button"
                  role="radio"
                  aria-checked={deptUpskillingScope === 'all'}
                  className={`wfr-focus-launch__option${deptUpskillingScope === 'all' ? ' wfr-focus-launch__option--selected' : ''}`}
                  onClick={() => setDeptUpskillingScope('all')}
                >
                  <span className="wfr-focus-launch__radio">
                    {deptUpskillingScope === 'all' ? <span className="wfr-focus-launch__radio-dot" /> : null}
                  </span>
                  <span className="wfr-focus-launch__option-text">
                    <span className="wfr-focus-launch__option-label">All teams</span>
                    <span className="wfr-focus-launch__option-desc">{mgrTeams.length} managers, {dept.employees.toLocaleString()} employees — {deptGap.toLocaleString()} to upskill</span>
                  </span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={deptUpskillingScope === 'select'}
                  className={`wfr-focus-launch__option${deptUpskillingScope === 'select' ? ' wfr-focus-launch__option--selected' : ''}`}
                  onClick={() => setDeptUpskillingScope('select')}
                >
                  <span className="wfr-focus-launch__radio">
                    {deptUpskillingScope === 'select' ? <span className="wfr-focus-launch__radio-dot" /> : null}
                  </span>
                  <span className="wfr-focus-launch__option-text">
                    <span className="wfr-focus-launch__option-label">Select specific teams</span>
                    <span className="wfr-focus-launch__option-desc">Choose which managers' teams to upskill first</span>
                  </span>
                </button>
              </div>

              {deptUpskillingScope === 'select' ? (
                <>
                  <div className="wfr-focus-launch__dept-list-header" style={{ marginTop: 16 }}>
                    <span className="wfr-focus-launch__dept-count" style={{ paddingLeft: 4 }}>
                      {selectedMgrCount} of {mgrTeams.length} selected
                    </span>
                  </div>
                  <div className="wfr-focus-launch__dept-list">
                    {mgrTeams.sort((a, b) => b.employees - a.employees).map((mgr) => {
                      const checked = !!deptUpskillingRoles[mgr.manager]
                      const mgrGap = Math.round(mgr.employees * (1 - dept.aiReadiness / 100))
                      return (
                        <button
                          key={mgr.manager}
                          type="button"
                          className={`wfr-focus-launch__dept-row ${checked ? 'wfr-focus-launch__dept-row--on' : ''}`}
                          onClick={() => setDeptUpskillingRoles((prev) => ({ ...prev, [mgr.manager]: !prev[mgr.manager] }))}
                        >
                          <span className="wfr-focus-launch__check">
                            {checked ? '✓' : ''}
                          </span>
                          <div className="wfr-focus-launch__dept-info">
                            <div className="wfr-focus-launch__dept-name-row">
                              <span className="wfr-focus-launch__dept-name">{mgr.manager}</span>
                            </div>
                            <span className="wfr-focus-launch__dept-detail">
                              {mgr.title} · {mgr.employees} employees · {mgrGap} to upskill
                            </span>
                          </div>
                        </button>
                        )
                      })}
                    </div>
                  </>
                ) : null}
              </div>
            <div className="wfr-focus-launch__footer">
              <Button variant="outline" onClick={() => setDeptUpskillingOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={deptUpskillingScope === 'select' && selectedMgrCount === 0}
                onClick={() => {
                  // Mark dept as upskilling
                  const prev = upskillingLaunchSummary?.departmentNames ?? []
                  const merged = [...new Set([...prev, dept.name])]
                  onStartUpskilling({
                    assignOwner: 'hrbp',
                    departmentNames: merged,
                    scopeLabel: merged.length === 1 ? dept.name : `${merged.length} departments`,
                    delegated: true,
                    totalEmployees: merged.reduce((sum, name) => {
                      const d2 = departments.find((x) => x.name === name)
                      return sum + (d2?.employees ?? 0)
                    }, 0),
                  })
                  setDeptUpskillingOpen(false)
                }}
              >
                Create development plans&nbsp;→
              </Button>
            </div>
          </div>
        </>
        )
      })()}

      {/* Development plan detail sheet */}
      {devPlanEmployee && createPortal(
        <div className="wfr-trend-sheet__root">
          <div className="wfr-trend-sheet__backdrop" onClick={() => setDevPlanEmployee(null)} />
          <div className="wfr-trend-sheet" role="dialog" aria-label={`Development plan for ${devPlanEmployee.name}`}>
            <div className="wfr-trend-sheet__header">
              <div>
                <div className="wfr-trend-sheet__title-row">
                  <h2 className="wfr-trend-sheet__title">{devPlanEmployee.name}</h2>
                </div>
                <p className="wfr-trend-sheet__sub">{devPlanEmployee.title ?? dept.name} — Development plan</p>
              </div>
              <button type="button" className="wfr-trend-sheet__close" onClick={() => setDevPlanEmployee(null)} aria-label="Close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="wfr-trend-sheet__body">
              {/* Status */}
              {(() => {
                const isAssigned = devPlanEmployee && (assignedPlans.has(devPlanEmployee.name) || upskillingLaunchSummary?.plansAssigned?.includes(dept.name))
                const planHash = devPlanEmployee ? devPlanEmployee.name.split('').reduce((h2: number, c: string) => ((h2 << 5) - h2 + c.charCodeAt(0)) | 0, 0) : 0
                const overallPct = isAssigned ? (Math.abs(planHash) % 100 > 85 ? 100 : Math.abs(planHash) % 100 > 20 ? (20 + Math.abs(planHash) % 60) : 0) : 0
                const overallStatus = !isAssigned ? 'Not assigned' : overallPct === 100 ? 'Completed' : overallPct > 0 ? 'In progress' : 'Not started'
                const statusColor = overallStatus === 'Completed' ? '#15803d' : overallStatus === 'In progress' ? '#6366f1' : overallStatus === 'Not assigned' ? '#d97706' : '#94a3b8'
                const statusIcon = overallStatus === 'Completed' ? 'check_circle' : overallStatus === 'In progress' ? 'sync' : 'schedule'
                return (
                  <>
                    <div style={{ display: 'flex', gap: 24, marginBottom: isAssigned ? 12 : 20 }}>
                      <div>
                        <div className="text-[11px] text-[#64748b] uppercase tracking-wider font-semibold mb-1">Status</div>
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: statusColor }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{statusIcon}</span>
                          {overallStatus}
                        </span>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#64748b] uppercase tracking-wider font-semibold mb-1">{'AI adoption'}</div>
                        <span className="text-[13px] font-semibold" style={{ color: devPlanEmployee!.readinessPct >= 50 ? '#15803d' : '#dc2626' }}>
                          {devPlanEmployee!.readinessPct}%
                        </span>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#64748b] uppercase tracking-wider font-semibold mb-1">Gap status</div>
                        <span className={`text-[13px] font-semibold ${devPlanEmployee!.readinessPct < 50 ? 'text-[#dc2626]' : 'text-[#15803d]'}`}>
                          {devPlanEmployee!.readinessPct < 50 ? 'Not AI-ready' : 'AI-ready'}
                        </span>
                      </div>
                    </div>
                    {isAssigned ? (
                      <div style={{ marginBottom: 20, padding: '12px 14px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span className="text-[12px] font-semibold text-[#1a212e]">Plan progress</span>
                          <span className="text-[12px] font-semibold" style={{ color: statusColor }}>{overallPct}%</span>
                        </div>
                        <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)', height: 6, borderRadius: 3 }}>
                          <div className="wfr-dash__plan-progress-fill" style={{ width: `${overallPct}%`, background: overallPct === 100 ? '#22c55e' : '#818cf8', height: 6, borderRadius: 3 }} />
                        </div>
                      </div>
                    ) : null}
                  </>
                )
              })()}

              {/* Courses */}
              {(() => {
                const allCourses = [
                  { course: 'AI for Business Professionals', provider: 'University of Pennsylvania', duration: '4 weeks at 3 hours a week', level: 'Beginner', free: true },
                  { course: 'Generative AI with Large Language Models', provider: 'DeepLearning.AI', duration: '16 hours to complete', level: 'Intermediate', free: true },
                  { course: 'Prompt Engineering for ChatGPT', provider: 'Vanderbilt University', duration: '18 hours to complete', level: 'Beginner', free: true },
                  { course: 'AI-Powered ' + (devPlanEmployee.title?.split(' ')[0] ?? 'Business') + ' Workflows', provider: 'Eightfold Academy', duration: 'Self-paced', level: 'Intermediate', free: false },
                ]
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h3 className="text-[14px] font-semibold text-[#1a212e]">Courses</h3>
                      <button
                        type="button"
                        className="text-[12px] font-medium hover:underline"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: editingCourses ? '#15803d' : '#3b5bdb' }}
                        onClick={() => setEditingCourses(!editingCourses)}
                      >
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{editingCourses ? 'check' : 'edit'}</span>
                          {editingCourses ? 'Done' : 'Edit'}
                        </span>
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {allCourses.map((item, i) => {
                        if (removedCourses.has(i)) return null
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                            <div style={{ flex: 1 }}>
                              <div className="text-[13px] font-semibold text-[#1a212e]">{item.course}</div>
                              <div className="text-[11px] text-[#64748b] mt-0.5">
                                {item.provider} | {item.duration} | {item.level}{item.free ? ' | Free to audit' : ''}
                              </div>
                            </div>
                            {editingCourses ? (
                              <button
                                type="button"
                                className="material-symbols-outlined text-[18px] text-[#dc2626] hover:bg-[#fef2f2] rounded"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                onClick={() => setRemovedCourses(prev => new Set([...prev, i]))}
                              >
                                remove_circle
                              </button>
                            ) : null}
                          </div>
                        )
                      })}
                      {editingCourses ? (
                        <button
                          type="button"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', borderRadius: 8, border: '1px dashed #c7d2fe', background: '#fafbff', cursor: 'pointer', color: '#3b5bdb', fontSize: 13, fontWeight: 500 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                          Add course
                        </button>
                      ) : null}
                    </div>
                  </>
                )
              })()}

              {/* Skills */}
              {(() => {
                const allSkills = [
                  'AI-assisted research',
                  'Prompt engineering',
                  'Data interpretation with AI',
                  'AI tool fluency',
                  'Critical evaluation of AI output',
                  ...(devPlanEmployee.title ? [`AI for ${devPlanEmployee.title.split(' ')[0].toLowerCase()} tasks`] : []),
                ]
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 }}>
                      <h3 className="text-[14px] font-semibold text-[#1a212e]">Skills to develop</h3>
                      <button
                        type="button"
                        className="text-[12px] font-medium hover:underline"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: editingSkills ? '#15803d' : '#3b5bdb' }}
                        onClick={() => setEditingSkills(!editingSkills)}
                      >
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{editingSkills ? 'check' : 'edit'}</span>
                          {editingSkills ? 'Done' : 'Edit'}
                        </span>
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {allSkills.filter(s => !removedSkills.has(s)).map((skill) => (
                        <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: '#eef2ff', border: '1px solid #c7d2fe', fontSize: 12, fontWeight: 500, color: '#4338ca' }}>
                          {skill}
                          {editingSkills ? (
                            <button
                              type="button"
                              className="material-symbols-outlined"
                              style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0, lineHeight: 1 }}
                              onClick={() => setRemovedSkills(prev => new Set([...prev, skill]))}
                            >
                              close
                            </button>
                          ) : null}
                        </span>
                      ))}
                      {editingSkills ? (
                        <button
                          type="button"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: '#fafbff', border: '1px dashed #c7d2fe', fontSize: 12, fontWeight: 500, color: '#3b5bdb', cursor: 'pointer' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                          Add skill
                        </button>
                      ) : null}
                    </div>
                  </>
                )
              })()}

              {/* Estimated completion */}
              <div style={{ marginTop: 20, padding: '12px 14px', background: '#fefce8', borderRadius: 8, border: '1px solid #fde68a' }}>
                <div className="text-[12px] text-[#92400e]">
                  <strong>Estimated completion:</strong> 6–8 weeks after assignment · ~46 hours of coursework
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
              <span className="text-[13px] text-[#64748b]">4 courses · 6 skills</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" size="sm" onClick={() => setDevPlanEmployee(null)}>Close</Button>
                {devPlanEmployee && assignedPlans.has(devPlanEmployee.name) ? (
                  <Button variant="secondary" size="sm" onClick={() => setDevPlanEmployee(null)}>Done</Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => {
                    if (devPlanEmployee) setAssignedPlans(prev => new Set([...prev, devPlanEmployee.name]))
                    setDevPlanEmployee(null)
                  }}>Assign plan&nbsp;→</Button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
      <MetricInfoDialog open={metricInfoOpen} onClose={() => setMetricInfoOpen(false)} collectionComplete={orgCollectionComplete} />
    </div>
  )
}

function BoardView({
  onDeptClick,
  onHrbpClick,
  wfrState,
  onCollectionActiveChange,
  onCompleteCollection,
  onViewCollectionResults,
  onStartUpskilling,
  onCompleteUpskilling,
  focusLaunchOpen,
  setFocusLaunchOpen,
  upskillingLaunchOpen,
  setUpskillingLaunchOpen,
  scopedDepartments,
  isHrbp = false,
}: {
  onDeptClick: (d: Dept) => void
  onHrbpClick: (hrbpName: string) => void
  wfrState: WfrPersistedState
  onCollectionActiveChange: (active: boolean, launchSummary?: FocusCollectionLaunchSummary | null) => void
  onCompleteCollection: () => void
  onViewCollectionResults: () => void
  onStartUpskilling: (summary: UpskillingLaunchSummary) => void
  onCompleteUpskilling: () => void
  focusLaunchOpen: boolean
  setFocusLaunchOpen: (open: boolean) => void
  upskillingLaunchOpen: boolean
  setUpskillingLaunchOpen: (open: boolean) => void
  scopedDepartments?: string[]
  isHrbp?: boolean
}) {
  // Derive convenience flags from universal state
  const { collectionActive: focusCollectionActive, collectionComplete: focusCollectionComplete, collectionJustCompleted, upskillingActive, hrbpPlansCreated } = deriveWfrFlags(wfrState.state)
  const collectionLaunchSummary = wfrState.collectionLaunchSummary ?? null
  const upskillingLaunchSummary = wfrState.upskillingLaunchSummary ?? null
  const [openMetric, setOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
  const [trendSheetDept, setTrendSheetDept] = useState<Dept | null>(null)
  const [trendSheetRole, setTrendSheetRole] = useState<{ title: string; dept: string; measuredReadiness?: number } | null>(null)
  const [boardTab, setBoardTab] = useState<'hrbps' | 'roles' | 'departments'>('hrbps')
  const [deptSort, setDeptSort] = useState<{ col: 'name' | 'hrbp' | 'headcount' | 'readiness' | 'potential' | 'gap', dir: 'asc' | 'desc' }>({ col: 'gap', dir: 'desc' })
  const toggleDeptSort = (col: typeof deptSort['col']) => {
    setDeptSort(prev => prev.col === col ? { col, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { col, dir: col === 'name' || col === 'hrbp' ? 'asc' : 'desc' })
  }
  const [taskSheetRole, setTaskSheetRole] = useState<{ title: string; dept: string } | null>(null)
  const [metricInfoOpen, setMetricInfoOpen] = useState(false)
  const [taskSheetZoneFilter, setTaskSheetZoneFilter] = useState<'augment' | 'above' | 'below' | null>(null)

  const [hrbpDevPlanDialogOpen, setHrbpDevPlanDialogOpen] = useState(false)
  const [hrbpDevPlanScope, setHrbpDevPlanScope] = useState<'all' | 'select'>('all')
  const [hrbpSelectedRoles, setHrbpSelectedRoles] = useState<Record<string, boolean>>({})

  const scopedRollup = useMemo(() => {
    // Only apply scoped rollup when collection is complete (state >= 3), not during collection in progress
    if (!focusCollectionComplete || !collectionLaunchSummary?.scopedDepartmentNames?.length) return null
    return wfrRollupDepartmentsByName(collectionLaunchSummary.scopedDepartmentNames)
  }, [focusCollectionComplete, collectionLaunchSummary])

  const allDeptsSorted = useMemo(() => {
    const base = scopedDepartments?.length
      ? departments.filter((d) => scopedDepartments.includes(d.name))
      : departments
    const hrbpOf = (d: Dept) => getDeptHrbps(d.name)[0]?.hrbp ?? ''
    const mul = deptSort.dir === 'asc' ? 1 : -1
    return [...base].sort((a, b) => {
      switch (deptSort.col) {
        case 'name': return mul * a.name.localeCompare(b.name)
        case 'hrbp': return mul * hrbpOf(a).localeCompare(hrbpOf(b))
        case 'headcount': return mul * (a.employees - b.employees)
        case 'readiness': return mul * (a.aiReadiness - b.aiReadiness)
        case 'potential': return mul * (a.aiPotential - b.aiPotential)
        case 'gap': return mul * (deptGapHeadcount(a) - deptGapHeadcount(b))
        default: return 0
      }
    })
  }, [scopedDepartments, deptSort])

  // HRBPs grouped with their departments for the HRBPs tab
  const hrbpRows = useMemo(() => {
    const scopedNames = new Set<string>(allDeptsSorted.map(d => d.name))
    const map = new Map<string, { hrbp: string; depts: { name: string; headcount: number; readiness: number; aiPotential: number; gap: number }[] }>()
    for (const a of hrbpAssignments) {
      if (!scopedNames.has(a.dept)) continue
      const d = allDeptsSorted.find(x => x.name === a.dept)
      if (!d) continue
      const trend = deptReadinessTrend(d.name)
      const measuredReadiness = focusCollectionComplete ? d.aiReadiness + trend.delta : d.aiReadiness
      // Scale gap proportionally to this HRBP's headcount share of the department
      const deptGap = focusCollectionComplete ? deptGapHeadcount({ ...d, aiReadiness: measuredReadiness } as unknown as Dept) : deptGapHeadcount(d)
      const share = d.employees > 0 ? a.headcount / d.employees : 0
      const gap = Math.round(deptGap * share)
      if (!map.has(a.hrbp)) map.set(a.hrbp, { hrbp: a.hrbp, depts: [] })
      map.get(a.hrbp)!.depts.push({ name: d.name, headcount: a.headcount, readiness: measuredReadiness, aiPotential: d.aiPotential, gap })
    }
    return [...map.values()].map(row => {
      const headcount = row.depts.reduce((s, d) => s + d.headcount, 0)
      const avgReadiness = headcount > 0 ? Math.round(row.depts.reduce((s, d) => s + d.readiness * d.headcount, 0) / headcount) : 0
      const avgPotential = headcount > 0 ? Math.round(row.depts.reduce((s, d) => s + d.aiPotential * d.headcount, 0) / headcount) : 0
      const totalGap = row.depts.reduce((s, d) => s + d.gap, 0)
      return { hrbp: row.hrbp, depts: row.depts, headcount, avgReadiness, avgPotential, totalGap }
    }).sort((a, b) => b.totalGap - a.totalGap)
  }, [allDeptsSorted, focusCollectionComplete])

  // All roles across org for the Roles tab
  const allRoles = useMemo(() => {
    const roles: { title: string; dept: string; employees: number; tasks: number; aiReadiness: number; measuredReadiness: number; aiPotential: number; gap: number }[] = []
    for (const d of allDeptsSorted) {
      const trend = deptReadinessTrend(d.name)
      for (const r of getRolesForDept(d.name)) {
        // Only apply collection delta and upskilling boost when collection is complete (state >= 3)
        const collectionDelta = focusCollectionComplete ? trend.delta + ((r.title.length % 3) - 1) : 0
        const upskillingBoost = hrbpPlansCreated ? Math.round(5 + ((r.aiPotential - r.aiReadiness) / 100) * 15 + (r.title.length % 4)) : 0
        const measured = Math.max(0, Math.min(100, r.aiReadiness + collectionDelta + upskillingBoost))
        roles.push({ title: r.title, dept: d.name, employees: r.employees, tasks: getTasksForRole(r.title).length, aiReadiness: r.aiReadiness, measuredReadiness: measured, aiPotential: r.aiPotential, gap: r.aiPotential - measured })
      }
    }
    return roles.sort((a, b) => b.gap - a.gap)
  }, [allDeptsSorted, hrbpPlansCreated, focusCollectionComplete])


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

  // HRBP scoped rollup — always active when scopedDepartments is set
  const hrbpRollup = useMemo(() => {
    if (!scopedDepartments?.length) return null
    return wfrRollupDepartmentsByName(scopedDepartments)
  }, [scopedDepartments])

  const effectiveRollup = hrbpRollup ?? scopedRollup

  // Collection calibration: when data collection is complete, AI readiness changes based on calibrated scores
  // This is a weighted average of per-dept deltas
  // Calibration applies when collection is complete OR plans have been assigned (which implies collection was done)
  const collectionCalibrationDelta = useMemo(() => {
    if (!focusCollectionComplete && !hrbpPlansCreated) return 0
    const depts = scopedDepartments?.length
      ? departments.filter(d => scopedDepartments.includes(d.name))
      : departments
    let totalWeight = 0
    let weightedDelta = 0
    for (const d of depts) {
      const trend = deptReadinessTrend(d.name)
      totalWeight += d.employees
      weightedDelta += trend.delta * d.employees
    }
    return totalWeight > 0 ? Math.round(weightedDelta / totalWeight) : 0
  }, [focusCollectionComplete, hrbpPlansCreated, scopedDepartments])

  // Upskilling boost for hero metrics — HRBP sees 10pt for their dept, CHRO sees org-wide boost (all HRBPs assigned plans)
  const upskillingHeroBoost = hrbpPlansCreated
    ? (isHrbp ? 10 : 8)
    : 0
  const basePeopleInAug = effectiveRollup ? effectiveRollup.peopleInAugRoles : ORG.peopleInAugRoles
  const rawReadinessPct = effectiveRollup ? effectiveRollup.aiReadiness : ORG.aiReadiness
  // Calibrated readiness = raw + collection delta (applied when collection complete)
  const calibratedReadinessPct = Math.min(100, rawReadinessPct + collectionCalibrationDelta)
  // Final readiness includes upskilling boost on top of calibrated
  const boostedReadinessPct = Math.min(100, calibratedReadinessPct + upskillingHeroBoost)
  const aiReadinessPct = hrbpPlansCreated ? boostedReadinessPct : calibratedReadinessPct
  const ready = Math.round((basePeopleInAug * aiReadinessPct) / 100)
  const gapPeople = basePeopleInAug - ready
  const peopleInAugForCards = basePeopleInAug
  const aiPotentialPct = effectiveRollup ? effectiveRollup.aiPotential : ORG.aiPotential
  const totalEmployeesHero = effectiveRollup ? effectiveRollup.totalEmployees : ORG.totalEmployees
  const hrsUnlocked = effectiveRollup ? effectiveRollup.hrsUnlocked : Math.round(gapPeople * ORG.hrsPerPersonWeek)
  const gapSharePct =
    peopleInAugForCards > 0 ? Math.min(100, Math.round((gapPeople / peopleInAugForCards) * 100)) : 0
  const tasksInAug = effectiveRollup ? effectiveRollup.tasksInAugZone : ORG.tasksInAugZone
  const totalRoleTasks = effectiveRollup ? effectiveRollup.totalRoleTasks : ORG.totalRoleTasks
  const tasksAbove = effectiveRollup ? effectiveRollup.tasksAboveThreshold : ORG.tasksAboveThreshold
  const tasksBelow = effectiveRollup ? effectiveRollup.tasksBelowThreshold : ORG.tasksBelowThreshold

  const learnMoreDataCollection =
    focusCollectionActive && collectionLaunchSummary
      ? {
          scopeLabel: collectionLaunchSummary.scopeLabel,
          channelsLabel: collectionLaunchSummary.channelsLabel,
          delegated: collectionLaunchSummary.delegated,
        }
      : null

  const preCollectionReadiness = rawReadinessPct
  const preCollectionReady = Math.round((basePeopleInAug * preCollectionReadiness) / 100)
  const preCollectionGap = basePeopleInAug - preCollectionReady
  // Delta shown on cards: calibration delta when collection complete, plus upskilling boost when upskilled
  const readinessDelta = (focusCollectionComplete ? collectionCalibrationDelta : 0) + (hrbpPlansCreated ? upskillingHeroBoost : 0)
  const gapDelta = focusCollectionComplete || hrbpPlansCreated ? gapPeople - preCollectionGap : 0

  const estimatedBadge = <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>
  const measuredBadge = <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#15803d', padding: '1px 7px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>

  const cards = [
    {
      id: 'readiness' as const,
      label: 'AI adoption',
      badge: focusCollectionComplete ? measuredBadge : estimatedBadge,
      val: `${aiReadinessPct}%`,
      icon: 'school',
      l1: `${ready.toLocaleString()} AI-ready of ${peopleInAugForCards.toLocaleString()} in augmentable roles`,
      hint: hrbpPlansCreated
        ? (isHrbp ? `Scoped to ${scopedDepartments?.[0] ?? 'your department'} after upskilling.` : 'Org-wide readiness after all departments completed upskilling.')
        : focusCollectionComplete
          ? `Calibrated from data collection${collectionLaunchSummary?.scopeLabel ? ` (${collectionLaunchSummary.scopeLabel})` : ''}.`
          : 'Estimated from employee skill profiles. Collect data to refine.',
      delta: readinessDelta !== 0 ? `${readinessDelta > 0 ? '+' : ''}${readinessDelta}pt` : null,
      deltaUp: readinessDelta > 0,
    },
    {
      id: 'potential' as const,
      label: 'AI potential',
      val: `${aiPotentialPct}%`,
      icon: 'auto_awesome',
      l1: `${tasksInAug} of ${totalRoleTasks} tasks in the augmentation zone`,
      hint: `${tasksAbove} automatable, ${tasksBelow} human-only`,
      delta: null,
      deltaUp: true,
    },
    {
      id: 'gap' as const,
      label: 'Transformation gap',
      val: gapPeople.toLocaleString(),
      icon: 'groups',
      l1: `${gapPeople.toLocaleString()} people in augmentable roles are not yet AI-ready—that's your prioritized development pool.`,
      hint: `${gapSharePct}% of augmentable-role headcount still in the gap.`,
      delta: gapDelta !== 0 ? `${gapDelta > 0 ? '+' : ''}${gapDelta}` : null,
      deltaUp: gapDelta < 0, // gap going down is good
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
            {hrbpPlansCreated ? (
              <>
                <span className="wfr-dash__headline-pct wfr-text-readiness">{aiReadinessPct}%</span>
                <span className="wfr-dash__headline-text">
                  {` ${'AI adoption'} — up from ${rawReadinessPct}% before upskilling. ${ready.toLocaleString()} employees are now AI-ready.`}
                </span>
              </>
            ) : (
              <>
                <span className="wfr-dash__headline-text">
                  Only <span className="wfr-dash__headline-pct wfr-text-readiness" style={{ fontSize: 'inherit' }}>{aiReadinessPct}%</span> of people in augmentable roles are AI-ready.
                </span>
              </>
            )}
          </h2>
          {!hrbpPlansCreated && (
            <p style={{ fontSize: 15, color: '#475569', margin: '2px 0 10px', lineHeight: 1.5 }}>
              Your org has <span className="font-bold wfr-text-potential">{effectiveRollup?.aiPotential ?? ORG.aiPotential}%</span> AI Potential. You're capturing less than a third of it.
            </p>
          )}
          <div className="wfr-dash__capture-tag-wrap">
            <Pill variant="neutral" size="small" className="wfr-dash__capture-tag !h-auto !max-w-none !py-2 !px-3.5">
              <span className="wfr-type-body2 text-[#1a212e]">
                {hrbpPlansCreated
                  ? <><span className="font-bold text-[#15803d]">{(preCollectionGap - gapPeople).toLocaleString()}</span> employees moved out of the gap through development plans — <span className="font-bold text-[#b91c1c]">{gapPeople.toLocaleString()}</span> remaining.</>
                  : <>~<span className="font-bold text-[#b91c1c]">{gapPeople.toLocaleString()}</span> employees in augmentable roles are not yet AI-ready.</>
                }
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
          onCollectionComplete={onCompleteCollection}
          onViewResults={onViewCollectionResults}
          launchOpen={focusLaunchOpen}
          onLaunchOpenChange={setFocusLaunchOpen}
          onRequestCloseMetricSheet={() => setOpenMetric(null)}
          collectionLaunchSummary={collectionLaunchSummary}
          onScrollToTable={() => document.getElementById('board-collection-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          onStartUpskilling={() => {
            if (isHrbp) {
              setHrbpDevPlanScope('all')
              setHrbpSelectedRoles({})
              setHrbpDevPlanDialogOpen(true)
            } else {
              setUpskillingLaunchOpen(true)
            }
          }}
          upskillingActive={upskillingActive}
          upskillingLaunchSummary={upskillingLaunchSummary}
          isHrbp={isHrbp}
          hrbpPlansCreated={hrbpPlansCreated}
        />

        <div className="wfr-dash__cards-row">
          {cards.map((c) => (
            <MetricCard
              key={c.id}
              variant={c.id}
              icon={c.icon}
              label={c.label}
              badge={c.badge}
              value={c.delta ? (
                <>{c.val} <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: c.deltaUp ? '#15803d' : '#dc2626', padding: '2px 8px', borderRadius: 12, background: c.deltaUp ? '#f0fdf4' : '#fef2f2', border: `1px solid ${c.deltaUp ? '#bbf7d0' : '#fecaca'}`, verticalAlign: 'middle' }}>{c.deltaUp ? '↑' : '↓'} {c.delta}</span></>
              ) : c.val}
              description={c.l1}
              hint={c.hint}
              onLearnMore={() => setMetricInfoOpen(true)}
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

      <Tabs value={boardTab} onValueChange={(v: string) => setBoardTab(v as 'hrbps' | 'roles' | 'departments')}>

        {(!isHrbp || (scopedDepartments && scopedDepartments.length > 1)) && (
          <div className="wfr-dash__panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TabsList>
              <TabsTrigger value="hrbps">HRBPs</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>
            <span className="wfr-dash__panel-hint">
              {boardTab === 'roles'
                ? `${allRoles.length} roles across ${allDeptsSorted.length} departments`
                : boardTab === 'hrbps'
                  ? `${hrbpRows.length} HRBPs across ${allDeptsSorted.length} departments`
                  : `Click to drill down`}
            </span>
          </div>
        )}

        <TabsContent value="hrbps">
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>HRBP</DataTableHead>
                <DataTableHead>Departments</DataTableHead>
                <DataTableHead numeric>Headcount</DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label={'Team AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} /></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label="Team AI potential" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Transformation gap" metric="gap" /></DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {hrbpRows.map((row) => (
                <DataTableRow key={row.hrbp}>
                  <DataTableCell className="font-semibold">
                    <button
                      type="button"
                      className="text-[#3b5bdb] hover:underline"
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', fontWeight: 'inherit' }}
                      onClick={() => onHrbpClick(row.hrbp)}
                    >
                      {row.hrbp}
                    </button>
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.depts.map(d => (
                        <button
                          key={d.name}
                          type="button"
                          className="text-[#3b5bdb] font-medium hover:underline"
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          onClick={() => {
                            const dept = allDeptsSorted.find(x => x.name === d.name)
                            if (dept) onDeptClick(dept)
                          }}
                        >
                          {d.name}{row.depts.length > 1 && d !== row.depts[row.depts.length - 1] ? ',' : ''}
                        </button>
                      ))}
                    </div>
                  </DataTableCell>
                  <DataTableCell align="right" numeric>{row.headcount.toLocaleString()}</DataTableCell>
                  <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={row.avgReadiness} /></DataTableCell>
                  <DataTableCell metric><DeptTableSoloBar variant="potential" pct={row.avgPotential} /></DataTableCell>
                  <DataTableCell align="right">
                    <span className="wfr-type-h6 tabular-nums">{row.totalGap.toLocaleString()}</span>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </TabsContent>

        <TabsContent value="departments">

      {focusCollectionComplete ? (
        <div>
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('name')}><span className="inline-flex items-center gap-1">Department {deptSort.col === 'name' ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{deptSort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span> : <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>}</span></DataTableHead>
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('hrbp')}><span className="inline-flex items-center gap-1">HRBP {deptSort.col === 'hrbp' ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{deptSort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span> : <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>}</span></DataTableHead>
                <DataTableHead numeric style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('headcount')}><span className="inline-flex items-center gap-1">Headcount {deptSort.col === 'headcount' ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{deptSort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span> : <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>}</span></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label={'Team AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'readiness' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('readiness')} /></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label="Team AI potential" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'potential' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('potential')} /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Transformation gap" metric="gap" sortDir={deptSort.col === 'gap' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('gap')} /></DataTableHead>
                              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {allDeptsSorted.map((d) => {
                const trend = deptReadinessTrend(d.name)
                const measuredReadiness = focusCollectionComplete ? d.aiReadiness + trend.delta : d.aiReadiness
                const gapCount = focusCollectionComplete ? deptGapHeadcount({ ...d, aiReadiness: measuredReadiness } as unknown as Dept) : deptGapHeadcount(d)
                const priorityRank = topGapDeptRanks.get(d.name)
                const isPriority = priorityRank !== undefined
                const deptHrbps = getDeptHrbps(d.name)
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
                      <DataTableCell className="text-[#475569]">{deptHrbps.length > 1 ? `${deptHrbps[0].hrbp} +${deptHrbps.length - 1}` : deptHrbps[0]?.hrbp ?? '—'}</DataTableCell>
                      <DataTableCell align="right" numeric>{d.employees.toLocaleString()}</DataTableCell>
                      <DataTableCell metric>
                        <div className="wfr-dash__readiness-with-trend">
                          <DeptTableSoloBar variant="readiness" pct={measuredReadiness} />
                          <button type="button" className={`wfr-dash__trend-badge ${trend.direction === 'up' ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setTrendSheetRole(null); setTrendSheetDept(d) }} title="View readiness trend details">
                            <span className="wfr-dash__trend-badge-text">{trend.direction === 'up' ? '↑' : '↓'}{Math.abs(trend.delta)}pt</span>
                            <span className="material-symbols-outlined wfr-dash__trend-badge-icon">info</span>
                          </button>
                        </div>
                      </DataTableCell>
                      <DataTableCell metric><DeptTableSoloBar variant="potential" pct={d.aiPotential} /></DataTableCell>
                      <DataTableCell align="right" title={`${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready`}>
                        <span className="wfr-type-h6 tabular-nums">{gapCount.toLocaleString()}</span>
                      </DataTableCell>
                    </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>
        </div>
      ) : focusCollectionActive ? (
        <div id="board-collection-table">
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('name')}><span className="inline-flex items-center gap-1">Department {deptSort.col === 'name' ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{deptSort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span> : <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>}</span></DataTableHead>
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('hrbp')}><span className="inline-flex items-center gap-1">HRBP {deptSort.col === 'hrbp' ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{deptSort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span> : <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>}</span></DataTableHead>
                <DataTableHead numeric style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('headcount')}><span className="inline-flex items-center gap-1">Headcount {deptSort.col === 'headcount' ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{deptSort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span> : <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>}</span></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label={'Team AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'readiness' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('readiness')} /></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label="Team AI potential" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'potential' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('potential')} /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Gap" metric="gap" sortDir={deptSort.col === 'gap' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('gap')} /></DataTableHead>
                <DataTableHead metric className="bg-[#f8fafc] border-l border-[#e2e8f0]">Collection progress</DataTableHead>
                <DataTableHead className="bg-[#f8fafc]">Channels</DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {allDeptsSorted.map((d) => {
                const gapCount = deptGapHeadcount(d)
                const inScope = collectionLaunchSummary?.scopedDepartmentNames?.includes(d.name)
                const deptHrbps = getDeptHrbps(d.name)
                const responseRate = inScope ? wfrDemoDeptResponseRate(d.name) : 0
                return (
                    <DataTableRow key={d.name} onClick={() => onDeptClick(d)}>
                      <DataTableCell className="font-semibold">{d.name}</DataTableCell>
                      <DataTableCell className="text-[#475569]">{deptHrbps.length > 1 ? `${deptHrbps[0].hrbp} +${deptHrbps.length - 1}` : deptHrbps[0]?.hrbp ?? '—'}</DataTableCell>
                      <DataTableCell align="right" numeric>{d.employees.toLocaleString()}</DataTableCell>
                      <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={d.aiReadiness} /></DataTableCell>
                      <DataTableCell metric><DeptTableSoloBar variant="potential" pct={d.aiPotential} /></DataTableCell>
                      <DataTableCell align="right" title={`${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready`}>
                        <span className="wfr-type-h6 tabular-nums">{gapCount.toLocaleString()}</span>
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
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('name')}><span className="inline-flex items-center gap-1">Department {deptSort.col === 'name' ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{deptSort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span> : <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>}</span></DataTableHead>
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('hrbp')}><span className="inline-flex items-center gap-1">HRBP {deptSort.col === 'hrbp' ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{deptSort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span> : <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>}</span></DataTableHead>
                <DataTableHead numeric style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('headcount')}><span className="inline-flex items-center gap-1">Headcount {deptSort.col === 'headcount' ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{deptSort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span> : <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>}</span></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label={'Team AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'readiness' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('readiness')} /></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label="Team AI potential" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'potential' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('potential')} /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Transformation gap" metric="gap" sortDir={deptSort.col === 'gap' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('gap')} /></DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {sorted.map((d) => {
                const gapCount = deptGapHeadcount(d)
                const deptHrbps = getDeptHrbps(d.name)
                return (
                    <DataTableRow key={d.name} onClick={() => onDeptClick(d)}>
                      <DataTableCell className="font-semibold">{d.name}</DataTableCell>
                      <DataTableCell className="text-[#475569]">{deptHrbps.length > 1 ? `${deptHrbps[0].hrbp} +${deptHrbps.length - 1}` : deptHrbps[0]?.hrbp ?? '—'}</DataTableCell>
                      <DataTableCell align="right" numeric>{d.employees.toLocaleString()}</DataTableCell>
                      <DataTableCell metric>
                        <DeptTableSoloBar variant="readiness" pct={d.aiReadiness} />
                      </DataTableCell>
                      <DataTableCell metric>
                        <DeptTableSoloBar variant="potential" pct={d.aiPotential} />
                      </DataTableCell>
                      <DataTableCell align="right" title={`${gapCount.toLocaleString()} people in augmentable roles are not yet AI-ready`}>
                        <span className="wfr-type-h6 tabular-nums">{gapCount.toLocaleString()}</span>
                      </DataTableCell>
                    </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>
        </div>
      )}

        </TabsContent>

        <TabsContent value="roles">
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Role</DataTableHead>
                {!isHrbp && <DataTableHead>Department</DataTableHead>}
                <DataTableHead numeric>Headcount</DataTableHead>
                <DataTableHead numeric>Tasks</DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label={'AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} /></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label="AI potential" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Gap" metric="gap" /></DataTableHead>
                {upskillingActive && <DataTableHead>Upskilling status</DataTableHead>}
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {allRoles.map((r) => {
                return (
                  <DataTableRow key={`${r.dept}-${r.title}`} onClick={() => {
                    const d = allDeptsSorted.find(x => x.name === r.dept)
                    if (d) onDeptClick(d)
                  }}>
                    <DataTableCell className="font-semibold">{r.title}</DataTableCell>
                    {!isHrbp && <DataTableCell className="text-[13px] text-[#475569] !max-w-[120px] truncate">{r.dept}</DataTableCell>}
                    <DataTableCell align="right" numeric className="!w-[60px]">{r.employees.toLocaleString()}</DataTableCell>
                    <DataTableCell align="right">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setTaskSheetRole({ title: r.title, dept: r.dept }) }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 12, fontWeight: 600, color: '#3b5bdb', cursor: 'pointer' }}
                      >
                        {r.tasks}
                      </button>
                    </DataTableCell>
                    <DataTableCell metric>
                      {focusCollectionComplete ? (
                        <div className="wfr-dash__readiness-with-trend">
                          <DeptTableSoloBar variant="readiness" pct={r.measuredReadiness} />
                          <button
                            type="button"
                            className={`wfr-dash__trend-badge ${r.measuredReadiness >= r.aiReadiness ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`}
                            onClick={(e) => { e.stopPropagation(); setTrendSheetRole({ title: r.title, dept: r.dept, measuredReadiness: r.measuredReadiness }); setTrendSheetDept(allDeptsSorted.find(d => d.name === r.dept) ?? null) }}
                            title="View readiness trend details"
                          >
                            <span className="wfr-dash__trend-badge-text">{r.measuredReadiness >= r.aiReadiness ? '↑' : '↓'}{Math.abs(r.measuredReadiness - r.aiReadiness)}pt</span>
                            <span className="material-symbols-outlined wfr-dash__trend-badge-icon">info</span>
                          </button>
                        </div>
                      ) : (
                        <DeptTableSoloBar variant="readiness" pct={r.aiReadiness} />
                      )}
                    </DataTableCell>
                    <DataTableCell metric><DeptTableSoloBar variant="potential" pct={r.aiPotential} /></DataTableCell>
                    <DataTableCell align="right">
                      <span className="wfr-type-h6 tabular-nums">{r.gap.toLocaleString()}</span>
                    </DataTableCell>
                    {upskillingActive && (
                      <DataTableCell>
                        {hrbpPlansCreated ? (() => {
                          // Deterministic progress per role based on title hash
                          const h = r.title.split('').reduce((a: number, c: string) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
                          const total = r.gap
                          // ~15% of roles are fully complete, ~10% are nearly done
                          const isFullyComplete = Math.abs(h) % 7 === 0
                          const isNearlyDone = Math.abs(h) % 5 === 0 && !isFullyComplete
                          let completed: number, inProgress: number, notStarted: number
                          if (isFullyComplete) {
                            completed = total; inProgress = 0; notStarted = 0
                          } else if (isNearlyDone) {
                            completed = Math.round(total * (70 + (Math.abs(h) % 20)) / 100)
                            inProgress = Math.round(total * (10 + (Math.abs(h * 3) % 15)) / 100)
                            notStarted = Math.max(0, total - completed - inProgress)
                          } else {
                            const completedPct = 10 + (Math.abs(h) % 30)
                            const inProgressPct = 20 + (Math.abs(h * 3) % 25)
                            completed = Math.round(total * completedPct / 100)
                            inProgress = Math.round(total * inProgressPct / 100)
                            notStarted = Math.max(0, total - completed - inProgress)
                          }
                          const barW = 100
                          const cW = total > 0 ? (completed / total) * barW : 0
                          const iW = total > 0 ? (inProgress / total) * barW : 0
                          const nW = total > 0 ? (notStarted / total) * barW : barW
                          return (
                            <div style={{ minWidth: 140 }}>
                              <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: '#e5e7eb', marginBottom: 4 }}>
                                <div style={{ width: `${cW}%`, background: '#22c55e', transition: 'width 0.3s' }} />
                                <div style={{ width: `${iW}%`, background: '#f59e0b', transition: 'width 0.3s' }} />
                                <div style={{ width: `${nW}%`, background: '#e5e7eb' }} />
                              </div>
                              <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#64748b' }}>
                                <span><span style={{ color: '#15803d', fontWeight: 600 }}>{completed}</span> done</span>
                                <span><span style={{ color: '#d97706', fontWeight: 600 }}>{inProgress}</span> active</span>
                                <span><span style={{ color: '#94a3b8', fontWeight: 600 }}>{notStarted}</span> pending</span>
                              </div>
                            </div>
                          )
                        })() : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 12, fontWeight: 600, color: '#92400e', whiteSpace: 'nowrap' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit_note</span>
                            Creating plans
                          </span>
                        )}
                      </DataTableCell>
                    )}
                  </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>
        </TabsContent>

      </Tabs>

      {/* Readiness trend detail sheet — opens when clicking a trend badge in complete state */}
      <ReadinessTrendSheet
        open={trendSheetDept != null}
        onClose={() => { setTrendSheetDept(null); setTrendSheetRole(null) }}
        dept={trendSheetDept}
        channelsLabel={collectionLaunchSummary?.channelsLabel}
        roleContext={trendSheetRole}
        upskillingActive={hrbpPlansCreated}
        collectionComplete={focusCollectionComplete}
      />

      {/* Task list sheet */}
      {taskSheetRole && createPortal(
        <div className="wfr-trend-sheet__root">
          <div className="wfr-trend-sheet__backdrop" onClick={() => { setTaskSheetRole(null); setTaskSheetZoneFilter(null) }} />
          <div className="wfr-trend-sheet" role="dialog" aria-label={`Tasks for ${taskSheetRole.title}`}>
            <div className="wfr-trend-sheet__header">
              <div>
                <div className="wfr-trend-sheet__title-row">
                  <h2 className="wfr-trend-sheet__title">{taskSheetRole.title}</h2>
                </div>
                <p className="wfr-trend-sheet__sub">{taskSheetRole.dept} — Task breakdown</p>
              </div>
              <button type="button" className="wfr-trend-sheet__close" onClick={() => { setTaskSheetRole(null); setTaskSheetZoneFilter(null) }} aria-label="Close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="wfr-trend-sheet__body">
              {(() => {
                const tasks = getTasksForRole(taskSheetRole.title)
                const augCount = tasks.filter(t => t.score >= 15 && t.score <= 75).length
                const aboveCount = tasks.filter(t => t.score > 75).length
                const belowCount = tasks.filter(t => t.score < 15).length
                const showTrends = focusCollectionComplete
                return (
                  <>
                    {/* Visual stats */}
                    {(() => {
                      // Only show task movement deltas when collection is complete (state >= 3)
                      const roleHash = taskSheetRole.title.split('').reduce((h: number, c: string) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
                      const movedToAugment = showTrends ? Math.abs(roleHash) % 3 : 0
                      const movedToAutomate = showTrends ? Math.abs(roleHash * 7) % 2 : 0
                      // Only show positive additions (tasks gained), not losses
                      const augDelta = movedToAugment // tasks gained from Human
                      const autoDelta = movedToAutomate // tasks gained from Augment
                      const humanDelta = 0 // don't show loss

                      const zoneCards: { zone: 'augment' | 'above' | 'below'; count: number; delta: number; label: string; desc: string; color: string; bg: string; border: string; activeBorder: string }[] = [
                        { zone: 'above', count: aboveCount, delta: autoDelta, label: 'Automate', desc: 'AI runs autonomously', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', activeBorder: '#6366f1' },
                        { zone: 'augment', count: augCount, delta: augDelta, label: 'Augment', desc: 'Human leads, AI assists', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', activeBorder: '#15803d' },
                        { zone: 'below', count: belowCount, delta: humanDelta, label: 'Human', desc: 'Requires judgment or trust', color: '#94a3b8', bg: '#f8fafc', border: '#e5e7eb', activeBorder: '#64748b' },
                      ]
                      return (
                        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                          {zoneCards.map((zc) => {
                            const isActive = taskSheetZoneFilter === zc.zone
                            const isDimmed = taskSheetZoneFilter != null && !isActive
                            return (
                              <div
                                key={zc.zone}
                                onClick={() => setTaskSheetZoneFilter(prev => prev === zc.zone ? null : zc.zone)}
                                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: isActive ? `2px solid ${zc.activeBorder}` : `1px solid ${zc.border}`, background: zc.bg, cursor: 'pointer', opacity: isDimmed ? 0.45 : 1, transition: 'opacity 0.15s, border-color 0.15s' }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: 20, fontWeight: 700, color: zc.color }}>{zc.count}</span>
                                  {showTrends && zc.delta !== 0 && <span style={{ fontSize: 12, fontWeight: 600, color: zc.delta > 0 ? '#15803d' : '#dc2626' }}>{zc.delta > 0 ? '↑' : '↓'}{Math.abs(zc.delta)}</span>}
                                </div>
                                <div style={{ fontSize: 11, color: zc.color, fontWeight: 500 }}>{zc.label}</div>
                                <div style={{ fontSize: 10, color: '#94a3b8' }}>{zc.desc}</div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}

                    {/* Grouped task list by Octave classification */}
                    {(() => {
                      // Skills associated with tasks by zone
                      const augmentSkills: Record<string, string[]> = {
                        'research': ['AI-assisted research', 'Data synthesis'],
                        'draft': ['AI writing', 'Content generation'],
                        'analys': ['Data interpretation', 'Pattern recognition'],
                        'plan': ['AI-assisted planning', 'Scenario modeling'],
                        'review': ['Quality evaluation', 'AI output review'],
                        'track': ['AI analytics', 'Trend detection'],
                        'coordinat': ['AI scheduling', 'Workflow automation'],
                        'report': ['Automated reporting', 'Data visualization'],
                        'forecast': ['Predictive analytics', 'AI modeling'],
                        'screen': ['AI screening', 'Candidate matching'],
                        'document': ['AI documentation', 'Template generation'],
                        'budget': ['Financial modeling', 'AI forecasting'],
                      }
                      const automateSkills = ['Process automation', 'AI pipeline', 'Zero-touch processing']
                      const humanSkills: Record<string, string[]> = {
                        'negotiat': ['Persuasion', 'Relationship building'],
                        'conflict': ['Mediation', 'Emotional intelligence'],
                        'client': ['Trust building', 'Empathy'],
                        'mentor': ['Coaching', 'Leadership'],
                        'train': ['Facilitation', 'Knowledge transfer'],
                        'strateg': ['Vision', 'Business judgment'],
                      }

                      function getSkillsForTask(task: string, zone: string): string[] {
                        const lower = task.toLowerCase()
                        if (zone === 'augment') {
                          for (const [key, skills] of Object.entries(augmentSkills)) {
                            if (lower.includes(key)) return skills
                          }
                          return ['AI collaboration', 'Tool fluency']
                        }
                        if (zone === 'above') return automateSkills.slice(0, 2)
                        // below
                        for (const [key, skills] of Object.entries(humanSkills)) {
                          if (lower.includes(key)) return skills
                        }
                        return ['Critical thinking', 'Human judgment']
                      }

                      const groups = [
                        { zone: 'above' as const, label: 'Automate', icon: 'precision_manufacturing', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', desc: 'AI runs autonomously — data entry, routing, ticket processing', tasks: tasks.filter(t => t.score > 75) },
                        { zone: 'augment' as const, label: 'Augment', icon: 'smart_toy', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', desc: 'Human leads, AI assists — research, drafting, analysis, scheduling', tasks: tasks.filter(t => t.score >= 15 && t.score <= 75) },
                        { zone: 'below' as const, label: 'Human', icon: 'person', color: '#64748b', bg: '#f8fafc', border: '#e5e7eb', desc: 'Requires human presence, trust, or judgment', tasks: tasks.filter(t => t.score < 15) },
                      ]

                      const visibleGroups = taskSheetZoneFilter
                        ? groups.filter(g => g.zone === taskSheetZoneFilter && g.tasks.length > 0)
                        : groups.filter(g => g.tasks.length > 0)

                      return visibleGroups.map((group) => (
                        <div key={group.label} style={{ marginBottom: 16 }}>
                          <div style={{ padding: '8px 12px', borderRadius: 8, background: group.bg, border: `1px solid ${group.border}`, marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16, color: group.color }}>{group.icon}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: group.color }}>{group.label}</span>
                              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>{group.tasks.length} tasks</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{group.desc}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {group.tasks.sort((a, b) => b.score - a.score).map((t, i) => {
                              const zone = t.score >= 15 && t.score <= 75 ? 'augment' : t.score > 75 ? 'above' : 'below'
                              const skills = getSkillsForTask(t.task, zone)
                              // Only show trend on tasks that moved zones when collection is complete (state >= 3)
                              const taskHash = t.task.split('').reduce((h2: number, c: string) => ((h2 << 5) - h2 + c.charCodeAt(0)) | 0, 0)
                              const movedUp = showTrends && zone === 'augment' && t.score >= 15 && t.score <= 20 && Math.abs(taskHash) % 3 === 0
                              const movedFromAug = showTrends && zone === 'above' && t.score > 75 && t.score <= 82 && Math.abs(taskHash) % 2 === 0
                              const moved = movedUp || movedFromAug
                              return (
                                <div key={i} style={{ padding: '10px 12px', borderRadius: 6, border: moved ? '1px solid #bbf7d0' : '1px solid #e5e7eb', background: moved ? '#fafff9' : undefined }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span className="text-[13px] font-medium text-[#1a212e]">{t.task}</span>
                                    {moved && <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d', marginLeft: 8 }}>↑ New</span>}
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {skills.map((skill) => (
                                      <span key={skill} style={{ padding: '1px 6px', borderRadius: 4, background: group.bg, border: `1px solid ${group.border}`, fontSize: 10, fontWeight: 500, color: group.color }}>
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))
                    })()}
                  </>
                )
              })()}
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* HRBP dev plan role selection dialog */}
      {hrbpDevPlanDialogOpen && (() => {
        const selectedRoleNames = Object.keys(hrbpSelectedRoles).filter(k => hrbpSelectedRoles[k])
        const selectedCount = hrbpDevPlanScope === 'all' ? allRoles.length : selectedRoleNames.length
        return (
          <>
            <div className="wfr-focus-launch__overlay" onClick={() => setHrbpDevPlanDialogOpen(false)} />
            <div className="wfr-focus-launch__content" style={{ width: 'min(520px, calc(100vw - 32px))' }}>
              <div className="wfr-focus-launch__header">
                <div className="wfr-focus-launch__header-top">
                  <h2 className="wfr-focus-launch__dialog-title">Create development plans</h2>
                  <button type="button" className="wfr-focus-launch__close" onClick={() => setHrbpDevPlanDialogOpen(false)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              <div className="wfr-focus-launch__body">
                <h3 className="wfr-focus-launch__title">Which roles need development plans?</h3>
                <p className="wfr-focus-launch__sub">Create plans for all roles or select specific ones to prioritize.</p>
                <div className="wfr-focus-launch__options">
                  <button
                    type="button"
                    className={`wfr-focus-launch__option ${hrbpDevPlanScope === 'all' ? 'wfr-focus-launch__option--selected' : ''}`}
                    onClick={() => setHrbpDevPlanScope('all')}
                  >
                    <span className="wfr-focus-launch__radio">
                      {hrbpDevPlanScope === 'all' ? <span className="wfr-focus-launch__radio-dot" /> : null}
                    </span>
                    <span className="wfr-focus-launch__option-text">
                      <span className="wfr-focus-launch__option-label">All roles</span>
                      <span className="wfr-focus-launch__option-desc">{allRoles.length} roles across your departments</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`wfr-focus-launch__option ${hrbpDevPlanScope === 'select' ? 'wfr-focus-launch__option--selected' : ''}`}
                    onClick={() => setHrbpDevPlanScope('select')}
                  >
                    <span className="wfr-focus-launch__radio">
                      {hrbpDevPlanScope === 'select' ? <span className="wfr-focus-launch__radio-dot" /> : null}
                    </span>
                    <span className="wfr-focus-launch__option-text">
                      <span className="wfr-focus-launch__option-label">Select specific roles</span>
                      <span className="wfr-focus-launch__option-desc">Choose which roles to create plans for first</span>
                    </span>
                  </button>
                </div>
                {hrbpDevPlanScope === 'select' && (
                  <>
                    <div className="wfr-focus-launch__dept-list-header" style={{ marginTop: 16 }}>
                      <span className="wfr-focus-launch__dept-count" style={{ paddingLeft: 4 }}>
                        {selectedRoleNames.length} of {allRoles.length} selected
                      </span>
                    </div>
                    <div className="wfr-focus-launch__dept-list">
                      {allRoles.map((r) => {
                        const checked = !!hrbpSelectedRoles[`${r.dept}-${r.title}`]
                        return (
                          <button
                            key={`${r.dept}-${r.title}`}
                            type="button"
                            className={`wfr-focus-launch__dept-row ${checked ? 'wfr-focus-launch__dept-row--on' : ''}`}
                            onClick={() => setHrbpSelectedRoles(prev => ({ ...prev, [`${r.dept}-${r.title}`]: !prev[`${r.dept}-${r.title}`] }))}
                          >
                            <span className="wfr-focus-launch__check">{checked ? '✓' : ''}</span>
                            <div className="wfr-focus-launch__dept-info">
                              <div className="wfr-focus-launch__dept-name-row">
                                <span className="wfr-focus-launch__dept-name">{r.title}</span>
                              </div>
                              <span className="wfr-focus-launch__dept-detail">
                                {r.dept} · {r.employees} employees · {r.gap} to upskill
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
              <div className="wfr-focus-launch__footer">
                <Button variant="outline" onClick={() => setHrbpDevPlanDialogOpen(false)}>Cancel</Button>
                <Button
                  variant="primary"
                  disabled={hrbpDevPlanScope === 'select' && selectedCount === 0}
                  onClick={() => {
                    setHrbpDevPlanDialogOpen(false)
                    onCompleteUpskilling()
                  }}
                >
                  Create plans&nbsp;→
                </Button>
              </div>
            </div>
          </>
        )
      })()}

      {/* Upskilling launch wizard */}
      <UpskillingLaunchDialog
        open={upskillingLaunchOpen}
        onOpenChange={setUpskillingLaunchOpen}
        onLaunch={(summary) => {
          // Merge new departments with any existing launch
          const existingNames = upskillingLaunchSummary?.departmentNames ?? []
          const mergedNames = [...new Set([...existingNames, ...summary.departmentNames])]
          const mergedSummary = {
            ...summary,
            departmentNames: mergedNames,
            totalEmployees: departments
              .filter((d) => mergedNames.includes(d.name))
              .reduce((sum, d) => sum + d.employees, 0),
          }
          onStartUpskilling(mergedSummary)
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

      <MetricInfoDialog open={metricInfoOpen} onClose={() => setMetricInfoOpen(false)} collectionComplete={focusCollectionComplete} />
    </div>
  )
}

export function WorkforceReadinessDashboard({
  onViewChange,
  autoLaunchCollection = false,
  scopedDepartments,
  isHrbp = false,
}: {
  onViewChange?: (view: 'board' | 'dept' | 'hrbp' | 'director' | 'seniorMgr') => void
  autoLaunchCollection?: boolean
  /** When set, only show these departments (HRBP scoped view) */
  scopedDepartments?: string[]
  /** HRBP persona — different RA card, no departments tab, scoped roles */
  isHrbp?: boolean
} = {}) {
  const navigate = useNavigate()
  const [dashOpenMetric, setDashOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
  // Single-dept HRBP goes straight to DeptView (no overview needed)
  const singleDeptHrbp = isHrbp && scopedDepartments?.length === 1

  // Auto-select view from query params (e.g. navigating back from Manager Detail breadcrumbs)
  const [view, setView] = useState<'board' | 'dept' | 'hrbp' | 'director' | 'seniorMgr'>(() => {
    if (singleDeptHrbp) return 'dept'
    const p = new URLSearchParams(window.location.search)
    if (p.get('director')) return 'director'
    if (p.get('hrbp')) return 'hrbp'
    return p.get('dept') ? 'dept' : 'board'
  })
  const [hrbpName, setHrbpName] = useState<string | null>(() => {
    const p = new URLSearchParams(window.location.search)
    return p.get('hrbp') ?? null
  })
  const [seniorMgrData, setSeniorMgrData] = useState<{ name: string; title: string; deptName: string; mgrIdxStart: number; mgrCount: number; parentDirector: { name: string; title: string; deptName: string; mgrIdxStart: number; mgrCount: number; parentHrbp: string } } | null>(null)
  const [directorData, setDirectorData] = useState<{ name: string; title: string; deptName: string; mgrIdxStart: number; mgrCount: number; parentHrbp: string } | null>(() => {
    const p = new URLSearchParams(window.location.search)
    const directorName = p.get('director')
    const hrbp = p.get('hrbp')
    const deptParam = p.get('dept')
    const dirIdxStr = p.get('dirIdx')
    if (!directorName || !hrbp || !deptParam || dirIdxStr === null) return null
    const d = departments.find(x => x.name === deptParam)
    if (!d) return null
    const dirIdx = parseInt(dirIdxStr, 10)
    const deptHrbpList = getDeptHrbps(deptParam)
    const allMgrs = deptManagerTeams(deptParam, d.employees)
    // Find this HRBP's slice
    let mgrStart = 0
    for (const h of deptHrbpList) {
      let covered = 0
      const startIdx = mgrStart
      for (let m = mgrStart; m < allMgrs.length; m++) {
        if (covered + allMgrs[m].employees > h.headcount && covered > 0) break
        covered += allMgrs[m].employees
        mgrStart = m + 1
      }
      if (h.hrbp === hrbp) {
        const sliceCount = mgrStart - startIdx
        const targetDirs = Math.max(4, Math.min(12, Math.round(h.headcount / 300)))
        const perDir = Math.ceil(sliceCount / targetDirs)
        const DIRECTOR_TITLES: Record<string, string[]> = {
          Engineering: ['VP Engineering', 'Sr. Director Engineering', 'Director Platform', 'Director Frontend', 'Director QA', 'Director DevOps', 'Director Mobile', 'Director Infrastructure', 'Director ML', 'Director SRE', 'Director Architecture', 'Director Security Eng'],
          Sales: ['VP Sales', 'Sr. Director Enterprise', 'Director Mid-Market', 'Director Inside Sales', 'Director Sales Ops', 'Director Channel Sales', 'Director Sales Enablement', 'Director Strategic Accounts'],
          Operations: ['VP Operations', 'Director Supply Chain', 'Director Logistics', 'Director Process Excellence', 'Director Fleet Ops', 'Director Planning'],
          'Customer Success': ['VP Customer Success', 'Director Implementation', 'Director Support', 'Director Renewals', 'Director Customer Ops', 'Director Onboarding'],
          Administrative: ['VP Administration', 'Director Admin Services', 'Director Records', 'Director Executive Support', 'Director Office Ops'],
          Finance: ['VP Finance', 'Director FP&A', 'Director Accounting', 'Director Tax', 'Director Payroll', 'Director Treasury'],
          Marketing: ['VP Marketing', 'Director Growth', 'Director Content', 'Director Brand', 'Director Demand Gen', 'Director Marketing Ops'],
          'IT & Security': ['VP IT', 'Director Infrastructure', 'Director Security Ops', 'Director IT Support'],
          Product: ['VP Product', 'Director Product Design', 'Director Product Analytics', 'Director UX Research'],
          'Data & Analytics': ['VP Data', 'Director Analytics', 'Director Data Engineering', 'Director BI'],
          'Quality & Compliance': ['VP Quality', 'Director Compliance', 'Director Internal Audit', 'Director Risk'],
          HR: ['VP People', 'Director Talent Acquisition', 'Director People Ops', 'Director L&D'],
          Legal: ['VP Legal', 'Director Contracts', 'Director Employment Law', 'Director IP'],
          Partnerships: ['VP Partnerships', 'Director Channel Dev', 'Director Alliance', 'Director BD'],
          Procurement: ['VP Procurement', 'Director Sourcing', 'Director Vendor Relations'],
          Facilities: ['VP Facilities', 'Director Workplace Ops', 'Director Building Services'],
          Communications: ['VP Communications', 'Director Internal Comms', 'Director PR'],
        }
        const dirTitles = DIRECTOR_TITLES[deptParam] ?? ['VP', 'Sr. Director', 'Director', 'Associate Director']
        return {
          name: directorName,
          title: dirTitles[dirIdx % dirTitles.length],
          deptName: deptParam,
          mgrIdxStart: startIdx + dirIdx * perDir,
          mgrCount: Math.min(perDir, sliceCount - dirIdx * perDir),
          parentHrbp: hrbp,
        }
      }
    }
    return null
  })
  const [dept, setDept] = useState<Dept | null>(() => {
    if (singleDeptHrbp) {
      return departments.find(d => d.name === scopedDepartments![0]) ?? null
    }
    const p = new URLSearchParams(window.location.search)
    // Don't open dept view if hrbp or director param is present
    if (p.get('hrbp') || p.get('director')) return null
    const deptParam = p.get('dept')
    if (deptParam) {
      const found = departments.find(d => d.name === deptParam)
      if (found) {
        // Clean the URL param
        const url = new URL(window.location.href)
        url.searchParams.delete('dept')
        window.history.replaceState({}, '', url.pathname + url.search + url.hash)
        return found
      }
    }
    return null
  })

  // Clean nav query params after restoring state
  useState(() => {
    const url = new URL(window.location.href)
    let dirty = false
    for (const key of ['hrbp', 'director', 'dirIdx']) {
      if (url.searchParams.has(key)) { url.searchParams.delete(key); dirty = true }
    }
    if (dirty) window.history.replaceState({}, '', url.pathname + url.search + url.hash)
  })

  // ─── Universal WFR program state ───
  // Always start on State 1 on page load — user walks through the flow each session
  const [wfrState, setWfrStateRaw] = useState<WfrPersistedState>(() => {
    // ?reset URL param clears persisted state back to 1
    if (new URLSearchParams(window.location.search).has('reset')) {
      try { localStorage.removeItem(WFR_STATE_KEY) } catch { /* ignore */ }
      // Clean the URL so refresh doesn't keep resetting
      const url = new URL(window.location.href)
      url.searchParams.delete('reset')
      window.history.replaceState({}, '', url.pathname + url.search + url.hash)
      return { state: 1 }
    }
    // Only restore state 5 (upskilled) — set when HRBP publishes & assigns dev plans.
    // All other states start fresh at 1 so the demo flow is always clean.
    try {
      const stored = localStorage.getItem(WFR_STATE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as WfrPersistedState
        if (parsed.state === 5) return parsed
      }
    } catch { /* ignore */ }
    return { state: 1 }
  })

  const setWfrState = useCallback((next: WfrPersistedState | ((prev: WfrPersistedState) => WfrPersistedState)) => {
    setWfrStateRaw(prev => {
      const val = typeof next === 'function' ? next(prev) : next
      writeWfrState(val)
      return val
    })
  }, [])

  // Clicking the Eightfold logo resets WFR state back to 1
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const logo = (e.target as HTMLElement).closest('.navbar__logo')
      if (!logo) return
      e.preventDefault()
      e.stopPropagation()
      try { localStorage.removeItem(WFR_STATE_KEY) } catch { /* ignore */ }
      setWfrStateRaw({ state: 1 })
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  // UI-local dialog toggles (not program state)
  const [focusLaunchOpen, setFocusLaunchOpen] = useState(autoLaunchCollection)
  const [upskillingLaunchOpen, setUpskillingLaunchOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  // State transition functions
  const advanceToCollection = useCallback((summary: FocusCollectionLaunchSummary) => {
    setWfrState(prev => ({ ...prev, state: 2, collectionLaunchSummary: summary }))
  }, [setWfrState])

  const cancelCollection = useCallback(() => {
    setWfrState({ state: 1 })
  }, [setWfrState])

  const completeCollection = useCallback(() => {
    setWfrState(prev => ({ ...prev, state: '2b' as const }))
  }, [setWfrState])

  const viewCollectionResults = useCallback(() => {
    setWfrState(prev => ({ ...prev, state: 3 }))
  }, [setWfrState])

  const startUpskilling = useCallback((summary: UpskillingLaunchSummary) => {
    setWfrState(prev => ({ ...prev, state: 4, upskillingLaunchSummary: summary }))
    const deptCount = summary.departmentNames.length
    const empCount = summary.totalEmployees.toLocaleString()
    setSnackbar(`Upskilling launched for ${deptCount} department${deptCount === 1 ? '' : 's'} · ${empCount} employees`)
    setTimeout(() => setSnackbar(null), 4000)
  }, [setWfrState])

  const completeUpskilling = useCallback(() => {
    setWfrState(prev => ({ ...prev, state: 5 }))
  }, [setWfrState])

  // Handle collection launch dialog callback (compatible with old FocusFirstModule API)
  const handleFocusCollectionActiveChange = useCallback((
    active: boolean,
    launchSummary?: FocusCollectionLaunchSummary | null,
  ) => {
    if (!active) {
      cancelCollection()
    } else if (launchSummary) {
      advanceToCollection(launchSummary)
    }
  }, [advanceToCollection, cancelCollection])

  // Auto-advance from '2b' (just completed) to 3 (collection complete) after 1s
  useEffect(() => {
    if (wfrState.state !== '2b') return
    const timer = setTimeout(() => {
      setWfrState(prev => ({ ...prev, state: 3 }))
    }, 1000)
    return () => clearTimeout(timer)
  }, [wfrState.state, setWfrState])

  // Cleanup old localStorage keys on mount
  useEffect(() => {
    try {
      sessionStorage.removeItem('tm:wfr-focus-collection-session')
      localStorage.removeItem('tm:wfr-focus-collection-active')
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    onViewChange?.(view)
  }, [view, onViewChange])

  return (
    <>
      {view === 'dept' && dept && !singleDeptHrbp && (
        <div className="wfr-dash__breadcrumb-bar">
          <div className="wfr-dash__breadcrumb-inner">
            <Breadcrumb>
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
          </div>
        </div>
      )}
      <div className="min-w-0">
        {view === 'board' && (
          <BoardView
            onDeptClick={(d) => {
              setDept(d)
              setView('dept')
              window.scrollTo(0, 0)
            }}
            onHrbpClick={(name) => {
              setHrbpName(name)
              setView('hrbp')
              window.scrollTo(0, 0)
            }}
            wfrState={wfrState}
            onCollectionActiveChange={handleFocusCollectionActiveChange}
            onCompleteCollection={completeCollection}
            onViewCollectionResults={viewCollectionResults}
            onStartUpskilling={startUpskilling}
            onCompleteUpskilling={completeUpskilling}
            focusLaunchOpen={focusLaunchOpen}
            setFocusLaunchOpen={setFocusLaunchOpen}
            upskillingLaunchOpen={upskillingLaunchOpen}
            setUpskillingLaunchOpen={setUpskillingLaunchOpen}
            scopedDepartments={scopedDepartments}
            isHrbp={isHrbp}
          />
        )}
        {view === 'hrbp' && hrbpName && (() => {
          const coverage = getHrbpDepts(hrbpName)
          // Since each HRBP is dedicated to one dept, take the first
          const assignment = coverage[0]
          if (!assignment) return null
          const d = departments.find(x => x.name === assignment.dept)
          if (!d) return null
          const headcount = assignment.headcount
          const { collectionComplete: hrbpCollectionComplete, hrbpPlansCreated: hrbpPlansComplete } = deriveWfrFlags(wfrState.state)
          const trend = deptReadinessTrend(d.name)
          const measuredReadiness = hrbpCollectionComplete ? d.aiReadiness + trend.delta : d.aiReadiness
          const deptGapTotal = hrbpCollectionComplete ? deptGapHeadcount({ ...d, aiReadiness: measuredReadiness } as unknown as Dept) : deptGapHeadcount(d)
          const share = d.employees > 0 ? headcount / d.employees : 0
          const totalGap = Math.round(deptGapTotal * share)
          const readyCount = headcount - totalGap

          // Build director-level direct reports (~8-12 per HRBP) by grouping team managers
          const allManagers = deptManagerTeams(d.name, d.employees)
          const deptHrbpList = getDeptHrbps(d.name)
          const hrbpIdx = deptHrbpList.findIndex(h => h.hrbp === hrbpName)
          // Slice managers belonging to this HRBP
          let mgrStart = 0
          for (let i = 0; i < hrbpIdx; i++) {
            let covered = 0
            for (let m = mgrStart; m < allManagers.length; m++) {
              if (covered + allManagers[m].employees > deptHrbpList[i].headcount && covered > 0) break
              covered += allManagers[m].employees
              mgrStart = m + 1
            }
          }
          const slicedManagers: typeof allManagers = []
          let coveredHeadcount = 0
          for (let m = mgrStart; m < allManagers.length && coveredHeadcount < headcount; m++) {
            slicedManagers.push(allManagers[m])
            coveredHeadcount += allManagers[m].employees
          }
          // Group into ~8-12 directors
          const targetDirectors = Math.max(4, Math.min(12, Math.round(headcount / 300)))
          const perDirector = Math.ceil(slicedManagers.length / targetDirectors)
          const DIRECTOR_TITLES: Record<string, string[]> = {
            Engineering: ['VP Engineering', 'Sr. Director Engineering', 'Director Platform', 'Director Frontend', 'Director QA', 'Director DevOps', 'Director Mobile', 'Director Infrastructure', 'Director ML', 'Director SRE', 'Director Architecture', 'Director Security Eng'],
            Sales: ['VP Sales', 'Sr. Director Enterprise', 'Director Mid-Market', 'Director Inside Sales', 'Director Sales Ops', 'Director Channel Sales', 'Director Sales Enablement', 'Director Strategic Accounts'],
            Operations: ['VP Operations', 'Director Supply Chain', 'Director Logistics', 'Director Process Excellence', 'Director Fleet Ops', 'Director Planning'],
            'Customer Success': ['VP Customer Success', 'Director Implementation', 'Director Support', 'Director Renewals', 'Director Customer Ops', 'Director Onboarding'],
            Administrative: ['VP Administration', 'Director Admin Services', 'Director Records', 'Director Executive Support', 'Director Office Ops'],
            Finance: ['VP Finance', 'Director FP&A', 'Director Accounting', 'Director Tax', 'Director Payroll', 'Director Treasury'],
            Marketing: ['VP Marketing', 'Director Growth', 'Director Content', 'Director Brand', 'Director Demand Gen', 'Director Marketing Ops'],
            'IT & Security': ['VP IT', 'Director Infrastructure', 'Director Security Ops', 'Director IT Support'],
            Product: ['VP Product', 'Director Product Design', 'Director Product Analytics', 'Director UX Research'],
            'Data & Analytics': ['VP Data', 'Director Analytics', 'Director Data Engineering', 'Director BI'],
            'Quality & Compliance': ['VP Quality', 'Director Compliance', 'Director Internal Audit', 'Director Risk'],
            HR: ['VP People', 'Director Talent Acquisition', 'Director People Ops', 'Director L&D'],
            Legal: ['VP Legal', 'Director Contracts', 'Director Employment Law', 'Director IP'],
            Partnerships: ['VP Partnerships', 'Director Channel Dev', 'Director Alliance', 'Director BD'],
            Procurement: ['VP Procurement', 'Director Sourcing', 'Director Vendor Relations'],
            Facilities: ['VP Facilities', 'Director Workplace Ops', 'Director Building Services'],
            Communications: ['VP Communications', 'Director Internal Comms', 'Director PR'],
          }
          const dirTitles = DIRECTOR_TITLES[d.name] ?? ['VP', 'Sr. Director', 'Director', 'Associate Director']
          const nameHash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
          const deptTrendDelta = hrbpCollectionComplete ? trend.delta : 0
          const upskillingBoostBase = hrbpPlansComplete ? (isHrbp ? 10 : 8) : 0
          const deptRoles = getRolesForDept(d.name)
          const rawEmps = getEmployeesForRole({ title: d.name, employees: d.employees, aiReadiness: d.aiReadiness, aiPotential: d.aiPotential } as RoleRowType)
          const allDeptEmps = rawEmps.map((e, i) => ({ ...e, title: deptRoles.length > 0 ? deptRoles[i % deptRoles.length].title : undefined }))
          // Build calibrated employees per team manager
          let runIdx = 0
          const mgrCalibrated = allManagers.map((mgr) => {
            const emps = allDeptEmps.slice(runIdx, Math.min(runIdx + mgr.employees, allDeptEmps.length))
            runIdx += mgr.employees
            return emps.map(e => {
              const empBoost = hrbpPlansComplete ? Math.round(upskillingBoostBase * (0.5 + (nameHash(e.name) % 10) / 10)) : 0
              return { ...e, displayReadiness: Math.max(0, Math.min(100, e.readinessPct + deptTrendDelta + empBoost)) }
            })
          })
          // Group sliced managers into directors
          const directors: { name: string; title: string; employees: number; readiness: number; readyCount: number; teamManagers: number; firstMgrIdx: number }[] = []
          for (let di = 0; di < targetDirectors; di++) {
            const batch = slicedManagers.slice(di * perDirector, (di + 1) * perDirector)
            if (batch.length === 0) continue
            const batchGlobalIdxStart = mgrStart + di * perDirector
            const empCount = batch.reduce((s, m) => s + m.employees, 0)
            const allCalibrated = batch.flatMap((_, bi) => mgrCalibrated[batchGlobalIdxStart + bi] ?? [])
            const avgReadiness = allCalibrated.length > 0 ? Math.round(allCalibrated.reduce((s, e) => s + e.displayReadiness, 0) / allCalibrated.length) : d.aiReadiness
            const ready = allCalibrated.filter(e => e.displayReadiness >= 50).length
            // Deterministic director name from the first manager in the batch
            const dirNameIdx = (nameHash(d.name) + di * 7) % DEMO_MANAGERS.length
            directors.push({
              name: DEMO_MANAGERS[dirNameIdx],
              title: dirTitles[di % dirTitles.length],
              employees: empCount,
              readiness: avgReadiness,
              readyCount: ready,
              teamManagers: batch.length,
              firstMgrIdx: batchGlobalIdxStart,
            })
          }

          const collBadge = hrbpCollectionComplete
            ? <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#15803d', padding: '1px 7px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>
            : <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>
          return (
            <PersonDetailLayout
              breadcrumb={
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink onClick={() => { setView('board'); setHrbpName(null) }}>Overview</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage><span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: -3, marginRight: 4 }}>shield_person</span>{hrbpName}</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              }
              name={hrbpName}
              subtitle={`HRBP · ${d.name} · ${headcount.toLocaleString()} of ${d.employees.toLocaleString()} employees`}
              readiness={{
                value: `${measuredReadiness}%`,
                description: hrbpCollectionComplete ? `${readyCount.toLocaleString()} AI-ready of ${headcount.toLocaleString()}` : `Estimated: ${readyCount.toLocaleString()} of ${headcount.toLocaleString()} may be AI-ready`,
                hint: hrbpPlansComplete ? 'After upskilling plans completed.' : hrbpCollectionComplete ? 'Calibrated from data collection.' : 'Estimated from skill profiles.',
                badge: collBadge,
                onLearnMore: () => setDashOpenMetric('readiness'),
              }}
              potential={{ value: `${d.aiPotential}%`, description: 'Tasks in the augmentation zone', hint: `Role-level potential for ${d.name}`, onLearnMore: () => setDashOpenMetric('potential') }}
              gap={{ value: `${totalGap.toLocaleString()} not ready`, description: `out of ${headcount.toLocaleString()} employees`, hint: measuredReadiness >= 50 ? `${measuredReadiness}% adoption meets the 50% threshold.` : `${measuredReadiness}% adoption is below the 50% threshold.`, onLearnMore: () => setDashOpenMetric('gap') }}
              managerTable={{
                title: 'Manager summary',
                hint: d.name,
                hideTitle: true,
                children: (
                  <DataTable bordered>
                    <DataTableHeader>
                      <DataTableRow>
                        <DataTableHead>Manager</DataTableHead>
                        <DataTableHead numeric>Employees</DataTableHead>
                        <DataTableHead metric>AI adoption</DataTableHead>
                        <DataTableHead metric>AI potential</DataTableHead>
                        <DataTableHead numeric>Gap</DataTableHead>
                      </DataTableRow>
                    </DataTableHeader>
                    <DataTableBody>
                      <DataTableRow>
                        <DataTableCell className="font-semibold">
                          <div>
                            <div>{hrbpName}</div>
                            <div className="text-[#94a3b8] text-[11px] font-normal">HRBP · {d.name}</div>
                          </div>
                        </DataTableCell>
                        <DataTableCell align="right" numeric>{headcount.toLocaleString()}</DataTableCell>
                        <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={measuredReadiness} /></DataTableCell>
                        <DataTableCell metric><DeptTableSoloBar variant="potential" pct={d.aiPotential} /></DataTableCell>
                        <DataTableCell align="right">
                          <span style={{ color: measuredReadiness >= 50 ? '#15803d' : '#dc2626' }}>{measuredReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}</span>
                        </DataTableCell>
                      </DataTableRow>
                    </DataTableBody>
                  </DataTable>
                ),
              }}
              tableTitle="Client managers"
              tableHint={`${directors.length} client manager${directors.length !== 1 ? 's' : ''} · click to view team`}
            >
              <DataTable bordered>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Manager</DataTableHead>
                    <DataTableHead numeric>Employees</DataTableHead>
                    <DataTableHead metric>Team AI adoption</DataTableHead>
                    <DataTableHead metric>Team AI potential</DataTableHead>
                    <DataTableHead numeric>Gap</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {[...directors]
                    .sort((a, b) => (d.aiPotential - a.readiness) - (d.aiPotential - b.readiness))
                    .reverse()
                    .map((dir) => {
                      const notReady = dir.employees - dir.readyCount
                      return (
                        <DataTableRow
                          key={dir.name}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setDirectorData({ name: dir.name, title: dir.title, deptName: d.name, mgrIdxStart: dir.firstMgrIdx, mgrCount: dir.teamManagers, parentHrbp: hrbpName })
                            setView('director')
                            window.scrollTo(0, 0)
                          }}
                        >
                          <DataTableCell className="font-semibold">
                            <div>
                              <div className="text-[#3b5bdb] hover:underline">{dir.name}</div>
                              <div className="text-[#94a3b8] text-[11px] font-normal">{dir.title} · {dir.teamManagers} teams</div>
                            </div>
                          </DataTableCell>
                          <DataTableCell align="right" numeric>{dir.employees.toLocaleString()}</DataTableCell>
                          <DataTableCell metric>
                            <div>
                              <DeptTableSoloBar variant="readiness" pct={dir.readiness} />
                              <div className="text-[10px] text-[#94a3b8] mt-0.5">{dir.readyCount} of {dir.employees} AI-ready</div>
                            </div>
                          </DataTableCell>
                          <DataTableCell metric><DeptTableSoloBar variant="potential" pct={d.aiPotential} /></DataTableCell>
                          <DataTableCell align="right">
                            <span style={{ color: dir.readiness >= 50 ? '#15803d' : '#dc2626' }}>
                              {notReady} not ready
                            </span>
                          </DataTableCell>
                        </DataTableRow>
                      )
                    })}
                </DataTableBody>
              </DataTable>
            </PersonDetailLayout>
          )
        })()}
        {view === 'director' && directorData && (() => {
          const d = departments.find(x => x.name === directorData.deptName)
          if (!d) return null
          const allMgrs = deptManagerTeams(d.name, d.employees)
          const teamMgrs = allMgrs.slice(directorData.mgrIdxStart, directorData.mgrIdxStart + directorData.mgrCount)
          const dirHeadcount = teamMgrs.reduce((s, m) => s + m.employees, 0)
          const { collectionComplete: dirCollComplete, hrbpPlansCreated: dirPlansComplete } = deriveWfrFlags(wfrState.state)
          const dirTrend = deptReadinessTrend(d.name)
          const dirMeasuredReadiness = dirCollComplete ? d.aiReadiness + dirTrend.delta : d.aiReadiness

          // Calibrate per team manager
          const nh = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
          const trendDelta = dirCollComplete ? dirTrend.delta : 0
          const boostBase = dirPlansComplete ? (isHrbp ? 10 : 8) : 0
          const dRoles = getRolesForDept(d.name)
          const rEmps = getEmployeesForRole({ title: d.name, employees: d.employees, aiReadiness: d.aiReadiness, aiPotential: d.aiPotential } as RoleRowType)
          const dEmps = rEmps.map((e, i) => ({ ...e, title: dRoles.length > 0 ? dRoles[i % dRoles.length].title : undefined }))
          let rIdx = 0
          const mgrEnriched = allMgrs.map((mgr) => {
            const emps = dEmps.slice(rIdx, Math.min(rIdx + mgr.employees, dEmps.length))
            rIdx += mgr.employees
            const cal = emps.map(e => {
              const eb = dirPlansComplete ? Math.round(boostBase * (0.5 + (nh(e.name) % 10) / 10)) : 0
              return { ...e, displayReadiness: Math.max(0, Math.min(100, e.readinessPct + trendDelta + eb)) }
            })
            const readiness = cal.length > 0 ? Math.round(cal.reduce((s, e) => s + e.displayReadiness, 0) / cal.length) : d.aiReadiness
            const ready = cal.filter(e => e.displayReadiness >= 50).length
            return { mgr, readiness, readyCount: ready }
          })

          const dirReadyCount = teamMgrs.reduce((s, _, i) => s + (mgrEnriched[directorData.mgrIdxStart + i]?.readyCount ?? 0), 0)
          const dirGap = dirHeadcount - dirReadyCount

          const dirBadge = dirCollComplete
            ? <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#15803d', padding: '1px 7px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>
            : <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>
          return (
            <PersonDetailLayout
              breadcrumb={
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink onClick={() => { setView('board'); setHrbpName(null); setDirectorData(null) }}>Overview</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink onClick={() => { setHrbpName(directorData.parentHrbp); setView('hrbp'); setDirectorData(null) }}><span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: -3, marginRight: 4 }}>shield_person</span>{directorData.parentHrbp}</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>{directorData.name}</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              }
              name={directorData.name}
              subtitle={`${directorData.title} · ${d.name} · ${dirHeadcount.toLocaleString()} employees`}
              readiness={{
                value: `${dirMeasuredReadiness}%`,
                description: dirCollComplete ? `${dirReadyCount.toLocaleString()} AI-ready of ${dirHeadcount.toLocaleString()}` : `Estimated: ${dirReadyCount.toLocaleString()} of ${dirHeadcount.toLocaleString()} may be AI-ready`,
                hint: dirPlansComplete ? 'After upskilling plans completed.' : dirCollComplete ? 'Calibrated from data collection.' : 'Estimated from skill profiles.',
                badge: dirBadge,
                onLearnMore: () => setDashOpenMetric('readiness'),
              }}
              potential={{ value: `${d.aiPotential}%`, description: 'Tasks in the augmentation zone', hint: `Role-level potential for ${d.name}`, onLearnMore: () => setDashOpenMetric('potential') }}
              gap={{ value: `${dirGap.toLocaleString()} not ready`, description: `out of ${dirHeadcount.toLocaleString()} employees`, hint: dirMeasuredReadiness >= 50 ? `${dirMeasuredReadiness}% adoption meets the 50% threshold.` : `${dirMeasuredReadiness}% adoption is below the 50% threshold.`, onLearnMore: () => setDashOpenMetric('gap') }}
              managerTable={{
                title: 'Manager summary',
                hint: d.name,
                hideTitle: true,
                children: (
                  <DataTable bordered>
                    <DataTableHeader>
                      <DataTableRow>
                        <DataTableHead>Manager</DataTableHead>
                        <DataTableHead numeric>Employees</DataTableHead>
                        <DataTableHead metric>AI adoption</DataTableHead>
                        <DataTableHead metric>AI potential</DataTableHead>
                        <DataTableHead numeric>Gap</DataTableHead>
                      </DataTableRow>
                    </DataTableHeader>
                    <DataTableBody>
                      <DataTableRow>
                        <DataTableCell className="font-semibold">
                          <div>
                            <div>{directorData.name}</div>
                            <div className="text-[#94a3b8] text-[11px] font-normal">{directorData.title} · {d.name}</div>
                          </div>
                        </DataTableCell>
                        <DataTableCell align="right" numeric>{dirHeadcount.toLocaleString()}</DataTableCell>
                        <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={dirMeasuredReadiness} /></DataTableCell>
                        <DataTableCell metric><DeptTableSoloBar variant="potential" pct={d.aiPotential} /></DataTableCell>
                        <DataTableCell align="right">
                          <span style={{ color: dirMeasuredReadiness >= 50 ? '#15803d' : '#dc2626' }}>{dirMeasuredReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}</span>
                        </DataTableCell>
                      </DataTableRow>
                    </DataTableBody>
                  </DataTable>
                ),
              }}
              tableTitle={teamMgrs.length > 4 ? 'Senior managers' : 'Team managers'}
              tableHint={teamMgrs.length > 4
                ? (() => {
                    const targetSr = Math.max(2, Math.min(5, Math.round(teamMgrs.length / 3)))
                    return `${targetSr} senior manager${targetSr !== 1 ? 's' : ''} · click to view team`
                  })()
                : `${teamMgrs.length} manager${teamMgrs.length !== 1 ? 's' : ''} · click to view team`
              }
            >
              {teamMgrs.length > 4 ? (() => {
                // Group into senior managers
                const targetSr = Math.max(2, Math.min(5, Math.round(teamMgrs.length / 3)))
                const perSr = Math.ceil(teamMgrs.length / targetSr)
                const SR_TITLES = ['Senior Manager', 'Principal Manager', 'Group Manager', 'Associate Director', 'Staff Manager']
                const seniorMgrs = Array.from({ length: targetSr }, (_, si) => {
                  const batch = teamMgrs.slice(si * perSr, (si + 1) * perSr)
                  if (batch.length === 0) return null
                  const empCount = batch.reduce((s, m) => s + m.employees, 0)
                  const batchEnriched = batch.map((_, bi) => mgrEnriched[directorData.mgrIdxStart + si * perSr + bi]).filter(Boolean)
                  const avgR = batchEnriched.length > 0 ? Math.round(batchEnriched.reduce((s, e) => s + e.readiness * e.mgr.employees, 0) / empCount) : d.aiReadiness
                  const ready = batchEnriched.reduce((s, e) => s + e.readyCount, 0)
                  const srNameIdx = nh(directorData.name) * 5 + si * 11 + directorData.mgrIdxStart
                  return { name: demoManagerName(srNameIdx), title: SR_TITLES[si % SR_TITLES.length], employees: empCount, readiness: avgR, readyCount: ready, batchStart: si * perSr, batchCount: batch.length }
                }).filter(Boolean) as { name: string; title: string; employees: number; readiness: number; readyCount: number; batchStart: number; batchCount: number }[]
                return (
                  <DataTable bordered>
                    <DataTableHeader>
                      <DataTableRow>
                        <DataTableHead>Manager</DataTableHead>
                        <DataTableHead numeric>Employees</DataTableHead>
                        <DataTableHead metric>Team AI adoption</DataTableHead>
                        <DataTableHead metric>Team AI potential</DataTableHead>
                        <DataTableHead numeric>Gap</DataTableHead>
                      </DataTableRow>
                    </DataTableHeader>
                    <DataTableBody>
                      {seniorMgrs.map(sr => {
                        const notReady = sr.employees - sr.readyCount
                        return (
                          <DataTableRow
                            key={sr.name}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSeniorMgrData({
                                name: sr.name,
                                title: sr.title,
                                deptName: d.name,
                                mgrIdxStart: directorData.mgrIdxStart + sr.batchStart,
                                mgrCount: sr.batchCount,
                                parentDirector: directorData,
                              })
                              setView('seniorMgr')
                              window.scrollTo(0, 0)
                            }}
                          >
                            <DataTableCell className="font-semibold">
                              <div>
                                <div className="text-[#3b5bdb] hover:underline">{sr.name}</div>
                                <div className="text-[#94a3b8] text-[11px] font-normal">{sr.title} · {sr.batchCount} teams</div>
                              </div>
                            </DataTableCell>
                            <DataTableCell align="right" numeric>{sr.employees.toLocaleString()}</DataTableCell>
                            <DataTableCell metric>
                              <div>
                                <DeptTableSoloBar variant="readiness" pct={sr.readiness} />
                                <div className="text-[10px] text-[#94a3b8] mt-0.5">{sr.readyCount} of {sr.employees} AI-ready</div>
                              </div>
                            </DataTableCell>
                            <DataTableCell metric><DeptTableSoloBar variant="potential" pct={d.aiPotential} /></DataTableCell>
                            <DataTableCell align="right">
                              <span style={{ color: sr.readiness >= 50 ? '#15803d' : '#dc2626' }}>{notReady} not ready</span>
                            </DataTableCell>
                          </DataTableRow>
                        )
                      })}
                    </DataTableBody>
                  </DataTable>
                )
              })() : (
              <DataTable bordered>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Manager</DataTableHead>
                    <DataTableHead numeric>Employees</DataTableHead>
                    <DataTableHead metric>Team AI adoption</DataTableHead>
                    <DataTableHead metric>Team AI potential</DataTableHead>
                    <DataTableHead numeric>Gap</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {teamMgrs.map((mgr, i) => {
                    const globalIdx = directorData.mgrIdxStart + i
                    const en = mgrEnriched[globalIdx]
                    if (!en) return null
                    const notReady = mgr.employees - en.readyCount
                    return (
                      <DataTableRow
                        key={`${mgr.manager}-${globalIdx}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/workforce/manager/${encodeURIComponent(mgr.manager)}?dept=${encodeURIComponent(d.name)}&mgrIdx=${globalIdx}`)}
                      >
                        <DataTableCell className="font-semibold">
                          <div>
                            <div className="text-[#3b5bdb] hover:underline">{mgr.manager}</div>
                            <div className="text-[#94a3b8] text-[11px] font-normal">{mgr.title}</div>
                          </div>
                        </DataTableCell>
                        <DataTableCell align="right" numeric>{mgr.employees.toLocaleString()}</DataTableCell>
                        <DataTableCell metric>
                          <div>
                            <DeptTableSoloBar variant="readiness" pct={en.readiness} />
                            <div className="text-[10px] text-[#94a3b8] mt-0.5">{en.readyCount} of {mgr.employees} AI-ready</div>
                          </div>
                        </DataTableCell>
                        <DataTableCell metric><DeptTableSoloBar variant="potential" pct={d.aiPotential} /></DataTableCell>
                        <DataTableCell align="right">
                          <span style={{ color: en.readiness >= 50 ? '#15803d' : '#dc2626' }}>
                            {notReady} not ready
                          </span>
                        </DataTableCell>
                      </DataTableRow>
                    )
                  })}
                </DataTableBody>
              </DataTable>)}
            </PersonDetailLayout>
          )
        })()}
        {view === 'seniorMgr' && seniorMgrData && (() => {
          const d = departments.find(x => x.name === seniorMgrData.deptName)
          if (!d) return null
          const allMgrs = deptManagerTeams(d.name, d.employees)
          const teamMgrs = allMgrs.slice(seniorMgrData.mgrIdxStart, seniorMgrData.mgrIdxStart + seniorMgrData.mgrCount)
          const srHeadcount = teamMgrs.reduce((s, m) => s + m.employees, 0)
          const { collectionComplete: srCollComplete, hrbpPlansCreated: srPlansComplete } = deriveWfrFlags(wfrState.state)
          const srTrend = deptReadinessTrend(d.name)
          const srMeasuredReadiness = srCollComplete ? d.aiReadiness + srTrend.delta : d.aiReadiness
          const nh2 = (s: string) => { let hh = 0; for (let i = 0; i < s.length; i++) hh = ((hh << 5) - hh + s.charCodeAt(i)) | 0; return Math.abs(hh) }
          const tDelta = srCollComplete ? srTrend.delta : 0
          const bBase = srPlansComplete ? (isHrbp ? 10 : 8) : 0
          const sRoles = getRolesForDept(d.name)
          const sEmpsRaw = getEmployeesForRole({ title: d.name, employees: d.employees, aiReadiness: d.aiReadiness, aiPotential: d.aiPotential } as RoleRowType)
          const sEmps = sEmpsRaw.map((e, i) => ({ ...e, title: sRoles.length > 0 ? sRoles[i % sRoles.length].title : undefined }))
          let sIdx = 0
          const srMgrEnriched = allMgrs.map((mgr) => {
            const emps = sEmps.slice(sIdx, Math.min(sIdx + mgr.employees, sEmps.length))
            sIdx += mgr.employees
            const cal = emps.map(e => {
              const eb = srPlansComplete ? Math.round(bBase * (0.5 + (nh2(e.name) % 10) / 10)) : 0
              return { ...e, displayReadiness: Math.max(0, Math.min(100, e.readinessPct + tDelta + eb)) }
            })
            const readiness = cal.length > 0 ? Math.round(cal.reduce((s, e) => s + e.displayReadiness, 0) / cal.length) : d.aiReadiness
            const ready = cal.filter(e => e.displayReadiness >= 50).length
            return { mgr, readiness, readyCount: ready }
          })
          const srReadyCount = teamMgrs.reduce((s, _, i) => s + (srMgrEnriched[seniorMgrData.mgrIdxStart + i]?.readyCount ?? 0), 0)
          const srGap = srHeadcount - srReadyCount
          const srBadge = srCollComplete
            ? <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#15803d', padding: '1px 7px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>
            : <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>
          return (
            <PersonDetailLayout
              breadcrumb={
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink onClick={() => { setView('board'); setHrbpName(null); setDirectorData(null); setSeniorMgrData(null) }}>Overview</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink onClick={() => { setHrbpName(seniorMgrData.parentDirector.parentHrbp); setView('hrbp'); setDirectorData(null); setSeniorMgrData(null) }}><span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: -3, marginRight: 4 }}>shield_person</span>{seniorMgrData.parentDirector.parentHrbp}</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink onClick={() => { setDirectorData(seniorMgrData.parentDirector); setView('director'); setSeniorMgrData(null) }}>{seniorMgrData.parentDirector.name}</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>{seniorMgrData.name}</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              }
              name={seniorMgrData.name}
              subtitle={`${seniorMgrData.title} · ${d.name} · ${srHeadcount.toLocaleString()} employees`}
              readiness={{
                value: `${srMeasuredReadiness}%`,
                description: srCollComplete ? `${srReadyCount.toLocaleString()} AI-ready of ${srHeadcount.toLocaleString()}` : `Estimated: ${srReadyCount.toLocaleString()} of ${srHeadcount.toLocaleString()} may be AI-ready`,
                hint: srPlansComplete ? 'After upskilling plans completed.' : srCollComplete ? 'Calibrated from data collection.' : 'Estimated from skill profiles.',
                badge: srBadge,
                onLearnMore: () => setDashOpenMetric('readiness'),
              }}
              potential={{ value: `${d.aiPotential}%`, description: 'Tasks in the augmentation zone', hint: `Role-level potential for ${d.name}`, onLearnMore: () => setDashOpenMetric('potential') }}
              gap={{ value: `${srGap.toLocaleString()} not ready`, description: `out of ${srHeadcount.toLocaleString()} employees`, hint: srMeasuredReadiness >= 50 ? `${srMeasuredReadiness}% adoption meets the 50% threshold.` : `${srMeasuredReadiness}% adoption is below the 50% threshold.`, onLearnMore: () => setDashOpenMetric('gap') }}
              managerTable={{
                title: 'Manager summary',
                hint: d.name,
                hideTitle: true,
                children: (
                  <DataTable bordered>
                    <DataTableHeader>
                      <DataTableRow>
                        <DataTableHead>Manager</DataTableHead>
                        <DataTableHead numeric>Employees</DataTableHead>
                        <DataTableHead metric>AI adoption</DataTableHead>
                        <DataTableHead metric>AI potential</DataTableHead>
                        <DataTableHead numeric>Gap</DataTableHead>
                      </DataTableRow>
                    </DataTableHeader>
                    <DataTableBody>
                      <DataTableRow>
                        <DataTableCell className="font-semibold">
                          <div>
                            <div>{seniorMgrData.name}</div>
                            <div className="text-[#94a3b8] text-[11px] font-normal">{seniorMgrData.title} · {d.name}</div>
                          </div>
                        </DataTableCell>
                        <DataTableCell align="right" numeric>{srHeadcount.toLocaleString()}</DataTableCell>
                        <DataTableCell metric>
                          <DeptTableSoloBar variant="readiness" pct={srMeasuredReadiness} />
                        </DataTableCell>
                        <DataTableCell metric><DeptTableSoloBar variant="potential" pct={d.aiPotential} /></DataTableCell>
                        <DataTableCell align="right">
                          <span style={{ color: srMeasuredReadiness >= 50 ? '#15803d' : '#dc2626' }}>{srMeasuredReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}</span>
                        </DataTableCell>
                      </DataTableRow>
                    </DataTableBody>
                  </DataTable>
                ),
              }}
              tableTitle="Team managers"
              tableHint={`${teamMgrs.length} manager${teamMgrs.length !== 1 ? 's' : ''} · click to view team`}
            >
              <DataTable bordered>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Manager</DataTableHead>
                    <DataTableHead numeric>Employees</DataTableHead>
                    <DataTableHead metric>Team AI adoption</DataTableHead>
                    <DataTableHead metric>Team AI potential</DataTableHead>
                    <DataTableHead numeric>Gap</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {teamMgrs.map((mgr, i) => {
                    const globalIdx = seniorMgrData.mgrIdxStart + i
                    const en = srMgrEnriched[globalIdx]
                    if (!en) return null
                    const notReady = mgr.employees - en.readyCount
                    return (
                      <DataTableRow
                        key={`${mgr.manager}-${globalIdx}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/workforce/manager/${encodeURIComponent(mgr.manager)}?dept=${encodeURIComponent(d.name)}&mgrIdx=${globalIdx}`)}
                      >
                        <DataTableCell className="font-semibold">
                          <div>
                            <div className="text-[#3b5bdb] hover:underline">{mgr.manager}</div>
                            <div className="text-[#94a3b8] text-[11px] font-normal">{mgr.title}</div>
                          </div>
                        </DataTableCell>
                        <DataTableCell align="right" numeric>{mgr.employees.toLocaleString()}</DataTableCell>
                        <DataTableCell metric>
                          <div>
                            <DeptTableSoloBar variant="readiness" pct={en.readiness} />
                            <div className="text-[10px] text-[#94a3b8] mt-0.5">{en.readyCount} of {mgr.employees} AI-ready</div>
                          </div>
                        </DataTableCell>
                        <DataTableCell metric><DeptTableSoloBar variant="potential" pct={d.aiPotential} /></DataTableCell>
                        <DataTableCell align="right">
                          <span style={{ color: en.readiness >= 50 ? '#15803d' : '#dc2626' }}>
                            {notReady} not ready
                          </span>
                        </DataTableCell>
                      </DataTableRow>
                    )
                  })}
                </DataTableBody>
              </DataTable>
            </PersonDetailLayout>
          )
        })()}
        {view === 'dept' && dept && (
          <DeptView
            dept={dept}
            wfrState={wfrState}
            onCollectionActiveChange={handleFocusCollectionActiveChange}
            onCompleteCollection={completeCollection}
            onViewCollectionResults={viewCollectionResults}
            onStartUpskilling={startUpskilling}
            onCompleteUpskilling={completeUpskilling}
            focusLaunchOpen={focusLaunchOpen}
            setFocusLaunchOpen={setFocusLaunchOpen}
            onHrbpClick={(name) => {
              setHrbpName(name)
              setView('hrbp')
              window.scrollTo(0, 0)
            }}
          />
        )}
      </div>

      {/* Metric sheet for HRBP/Director/SeniorMgr views */}
      <WorkforceMetricSheet
        metric={dashOpenMetric}
        onClose={() => setDashOpenMetric(null)}
        ready={0}
        gapPeople={0}
        hrsUnlocked={0}
      />

      {/* Snackbar */}
      {snackbar && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 10, background: '#0f172a', color: '#fff',
          fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 8, zIndex: 10000,
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4ade80' }}>check_circle</span>
          {snackbar}
        </div>
      )}
    </>
  )
}
