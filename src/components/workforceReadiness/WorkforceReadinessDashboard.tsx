import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
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
  getEmployeesForRole,
  getRolesForDept,
  getTasksForRole,
  wfrDemoDeptResponseRate,
  wfrRollupDepartmentsByName,
  getDeptHrbps,
  getHrbpDepts,
  hrbpAssignments,
  formatDollar,
  type Dept,
  type RoleRowType,
} from '../../data/wfrOrgData'
// import { CollectionProgressPanel } from './CollectionProgressPanel'
import { deptReadinessTrend, deptManagerTeams, DEMO_MANAGERS, demoManagerName } from './collectionHelpers'
import './CollectionProgressPanel.css'
import { FocusFirstModule, type FocusCollectionLaunchSummary } from './FocusFirstModule'
import { FocusFirstLaunchDialog } from './FocusFirstLaunchDialog'
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

/** Per-HRBP independent state — only created for HRBPs selected during delegation. */
export type HrbpState = {
  state: WfrProgramState
  /** Departments this HRBP is responsible for (from hrbpAssignments) */
  departments: string[]
  /** true when CHRO has delegated but HRBP hasn't launched collection yet */
  delegated?: boolean
  /** Collection method chosen by HRBP when they launch (e.g. 'AI Agent Interviews') */
  channelsLabel?: string
  /** Director names selected for collection (when HRBP launches from delegation) */
  selectedDirectors?: string[]
}

export type WfrPersistedState = {
  state: WfrProgramState
  collectionLaunchSummary?: FocusCollectionLaunchSummary | null
  upskillingLaunchSummary?: UpskillingLaunchSummary | null
  /** Per-HRBP state map — keyed by HRBP name. Only populated when delegation flow is used. */
  hrbpStates?: Record<string, HrbpState>
}

const WFR_STATE_KEY = 'tm:wfr-state'

// Track HRBPs who just launched collection in this session — start at 0% response rate
const hrbpJustLaunchedSet = new Set<string>()

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

/** Numeric value for state comparison (2b → 2.5). */
export function stateNum(s: WfrProgramState): number { return s === '2b' ? 2.5 : (s as number) }

/** Get the effective state for a specific HRBP. Falls back to org state if no per-HRBP tracking. */
export function getHrbpEffectiveState(wfrState: WfrPersistedState, hrbpName: string): WfrProgramState {
  if (wfrState.hrbpStates?.[hrbpName]) return wfrState.hrbpStates[hrbpName].state
  // HRBP not in the delegated set → stays at state 1
  if (wfrState.hrbpStates) return 1
  // No delegation active → use org-level state
  return wfrState.state
}

/** Effective state for the demo HRBP persona — min of all their mapped HRBP states. */
export function getPersonaEffectiveState(wfrState: WfrPersistedState, personaHrbpNames: string[]): WfrProgramState {
  if (!wfrState.hrbpStates || personaHrbpNames.length === 0) return wfrState.state
  const states = personaHrbpNames
    .map(name => wfrState.hrbpStates?.[name]?.state)
    .filter((s): s is WfrProgramState => s !== undefined)
  if (states.length === 0) return 1 // persona's HRBPs weren't delegated to
  return states.reduce((min, s) => stateNum(s) < stateNum(min) ? s : min)
}

/** Org-level aggregate state for CHRO view — min of all delegated HRBP states. */
export function computeOrgAggregateState(wfrState: WfrPersistedState): WfrProgramState {
  if (!wfrState.hrbpStates) return wfrState.state
  const entries = Object.values(wfrState.hrbpStates)
  if (entries.length === 0) return wfrState.state
  return entries.reduce((min, e) => stateNum(e.state) < stateNum(min.state) ? e : min).state
}

/** Check if a specific HRBP has a pending delegation (CHRO delegated, HRBP hasn't launched yet). */
export function hasHrbpPendingDelegation(wfrState: WfrPersistedState, hrbpName: string): boolean {
  const hs = wfrState.hrbpStates?.[hrbpName]
  return hs?.delegated === true && hs.state === 1
}

/** Check if any of the persona's mapped HRBPs have a pending delegation. */
export function hasPersonaPendingDelegation(wfrState: WfrPersistedState, personaHrbpNames: string[]): boolean {
  return personaHrbpNames.some(name => hasHrbpPendingDelegation(wfrState, name))
}

/** Advance every HRBP that is currently at `from` to `to`. Returns new state with recomputed org aggregate. */
function advanceAllHrbps(prev: WfrPersistedState, from: WfrProgramState | null, to: WfrProgramState): WfrPersistedState {
  if (!prev.hrbpStates) return { ...prev, state: to }
  const next = { ...prev, hrbpStates: { ...prev.hrbpStates } }
  for (const name of Object.keys(next.hrbpStates!)) {
    const hs = next.hrbpStates![name]
    if (from === null || hs.state === from) {
      next.hrbpStates![name] = { ...hs, state: to }
    }
  }
  next.state = computeOrgAggregateState(next)
  return next
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
              UNREALIZED VALUE
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
            <span className="wfr-type-caption-sb wfr-text-potential">Unrealized value</span>
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
  potential: 'BLS median wages × automation probability × 60% realization rate',
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
          {/* Unrealized Value card */}
          <div style={{ border: '1.5px solid #c7d2fe', borderRadius: 12, padding: '24px 20px', background: '#eef2ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#6366f1', background: 'rgba(99,102,241,0.12)', borderRadius: 8, padding: 6 }}>layers</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6366f1' }}>Unrealized Value</span>
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
              <span style={{ fontSize: 13, color: '#6366f1', width: 90, flexShrink: 0 }}>Unrealized value</span>
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

type MgrSortCol = 'name' | 'readiness' | 'potential' | 'gap'

function SortIcon({ sortDir, onSortClick }: { sortDir?: 'asc' | 'desc' | null; onSortClick?: () => void }) {
  if (sortDir) return <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
  if (onSortClick) return <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>
  return null
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
      <SortIcon sortDir={sortDir} onSortClick={onSortClick} />
    </span>
  )
}

const HRBP_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  '1': { label: 'Not started', color: '#64748b', bg: '#f1f5f9' },
  '2': { label: 'Collecting', color: '#d97706', bg: '#fef3c7' },
  '2b': { label: 'Completing', color: '#d97706', bg: '#fef3c7' },
  '3': { label: 'Complete', color: '#15803d', bg: '#f0fdf4' },
  '4': { label: 'Upskilling', color: '#7c3aed', bg: '#f5f3ff' },
  '5': { label: 'Plans created', color: '#15803d', bg: '#f0fdf4' },
}

function HrbpStatusPill({ state, delegated }: { state: WfrProgramState; delegated?: boolean }) {
  const cfg = (delegated && state === 1)
    ? { label: 'Awaiting launch', color: '#d97706', bg: '#fef3c7' }
    : HRBP_STATUS_CONFIG[String(state)] ?? HRBP_STATUS_CONFIG['1']
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 10px', borderRadius: 12,
      fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.color}20`, whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

/* ─── Data Collection column templates ─── */

/** Standardized header for the data collection column. Shows method (e.g. "AI Agent Interviews") below the title. */
export function DataCollectionHead() {
  return (
    <DataTableHead metric className="bg-[#f8fafc] border-l border-[#e2e8f0]">
      Data collection
    </DataTableHead>
  )
}

/** Progress bar cell for aggregate collection rates (departments, HRBPs, managers). */
export function DataCollectionProgressCell({ rate, inScope = true }: { rate: number; inScope?: boolean }) {
  if (!inScope) return <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><span className="text-[11px] text-[#94a3b8]">—</span></DataTableCell>
  return (
    <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]">
      <div className="wfr-dash__plan-progress">
        <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(217, 119, 6, 0.15)' }}>
          <div className="wfr-dash__plan-progress-fill" style={{ width: `${Math.max(0, rate)}%`, background: '#d97706' }} />
        </div>
        <span className="wfr-dash__plan-progress-label">{Math.max(0, rate)}%</span>
      </div>
    </DataTableCell>
  )
}

/** Individual employee status cell ("Responded" / "Pending"). */
export function DataCollectionStatusCell({ responded, inScope = true }: { responded: boolean; inScope?: boolean }) {
  if (!inScope) return <DataTableCell className="bg-[#fafbfc] border-l border-[#e2e8f0]"><span className="text-[11px] text-[#94a3b8]">—</span></DataTableCell>
  return (
    <DataTableCell className="bg-[#fafbfc] border-l border-[#e2e8f0]">
      <span className={`inline-flex items-center gap-1 text-[12px] ${responded ? 'text-[#15803d]' : 'text-[#94a3b8]'}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{responded ? 'check_circle' : 'pending'}</span>
        {responded ? 'Responded' : 'Pending'}
      </span>
    </DataTableCell>
  )
}

/* ─── End Data Collection column templates ─── */

/** Rolled-up upskilling status cell showing 4 KPI counts for a manager's team. */
export function UpskillingKpiCell({ total, pct, plansComplete, nameHash }: { total: number; pct: number; plansComplete?: boolean; nameHash: number }) {
  const notAssigned = plansComplete ? 0 : Math.round(total * Math.max(0, (100 - pct) / 100))
  const pool = total - notAssigned
  // Complete scales with pct: higher progress → more people done (with small hash variation per row)
  const completeFrac = plansComplete ? 1 : Math.min(0.95, (pct / 100) * 0.8 + (nameHash % 12) / 100)
  const completeCount = Math.round(pool * completeFrac)
  // Of remaining pool: bulk are actively in progress (65–80%), rest just assigned not yet started
  const remainder = pool - completeCount
  const inProgressFrac = plansComplete ? 0 : 0.65 + (nameHash % 15) / 100
  const inProgressCount = Math.min(remainder, Math.round(remainder * inProgressFrac))
  const assignedCount = Math.max(0, pool - completeCount - inProgressCount)
  const kpis = [
    { label: 'Unassigned', count: notAssigned, color: '#94a3b8', bg: '#f1f5f9' },
    { label: 'Assigned',   count: assignedCount,   color: '#6366f1', bg: '#eef2ff' },
    { label: 'In progress', count: inProgressCount, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Complete',   count: completeCount,   color: '#15803d', bg: '#f0fdf4' },
  ]
  return (
    <DataTableCell className="bg-[#fafbfc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '1%', verticalAlign: 'middle', padding: '8px 14px' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {kpis.map(k => k.count > 0 && (
          <div key={k.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 8px', borderRadius: 6, background: k.bg, minWidth: 44 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: k.color, lineHeight: 1.2 }}>{k.count}</span>
            <span style={{ fontSize: 10, color: k.color, opacity: 0.8, lineHeight: 1.3, whiteSpace: 'nowrap' }}>{k.label}</span>
          </div>
        ))}
      </div>
    </DataTableCell>
  )
}

/** Dev plan status cell with an optional "View plan" link in front of the progress bar. */
export function DevPlanStatusCell({ pct, plansComplete, showLink }: { pct: number; plansComplete?: boolean; showLink?: boolean }) {
  const finalPct = plansComplete ? 100 : pct
  const barColor = finalPct === 100 ? '#22c55e' : finalPct > 0 ? '#818cf8' : '#e2e8f0'
  const labelColor = finalPct === 100 ? '#15803d' : finalPct > 0 ? '#6366f1' : '#94a3b8'
  const label = plansComplete ? 'Assigned' : finalPct > 0 ? `${finalPct}%` : 'Ready'
  return (
    <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showLink && (
          <button
            type="button"
            className="text-[#3b5bdb] hover:underline"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}
            onClick={(e) => e.stopPropagation()}
          >
            View plan
          </button>
        )}
        <div className="wfr-dash__plan-progress" style={{ flex: 1 }}>
          <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
            <div className="wfr-dash__plan-progress-fill" style={{ width: `${finalPct}%`, background: barColor }} />
          </div>
          <span className="wfr-dash__plan-progress-label" style={{ color: labelColor }}>{label}</span>
        </div>
      </div>
    </DataTableCell>
  )
}

/* ─── End Dev Plan column templates ─── */

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
  // CHRO has delegated but HRBPs haven't all started yet
  const chroDelegationActive = !isHrbp && !!wfrState.hrbpStates && Object.values(wfrState.hrbpStates).some(h => h.delegated)
  // Any HRBP has been delegated (for showing Data Collection column)
  const anyDelegation = !!wfrState.hrbpStates && Object.keys(wfrState.hrbpStates).length > 0
  const [openMetric, setOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
  const [trendSheetDept, setTrendSheetDept] = useState<Dept | null>(null)
  const [trendSheetRole, setTrendSheetRole] = useState<{ title: string; dept: string; measuredReadiness?: number } | null>(null)
  const [trendSheetHrbp, setTrendSheetHrbp] = useState<{ hrbpName: string; headcount: number } | null>(null)
  const [boardTab, setBoardTab] = useState<'hrbps' | 'roles' | 'departments'>('hrbps')
  const [deptSort, setDeptSort] = useState<{ col: 'name' | 'hrbp' | 'headcount' | 'readiness' | 'potential' | 'gap', dir: 'asc' | 'desc' }>({ col: 'gap', dir: 'desc' })
  const toggleDeptSort = (col: typeof deptSort['col']) => {
    setDeptSort(prev => prev.col === col ? { col, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { col, dir: col === 'name' || col === 'hrbp' ? 'asc' : 'desc' })
  }
  const [hrbpSort, setHrbpSort] = useState<{ col: 'hrbp' | 'readiness' | 'potential' | 'gap', dir: 'asc' | 'desc' }>({ col: 'potential', dir: 'desc' })
  const toggleHrbpSort = (col: typeof hrbpSort['col']) => {
    setHrbpSort(prev => prev.col === col ? { col, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { col, dir: col === 'hrbp' ? 'asc' : 'desc' })
  }
  const [roleSort, setRoleSort] = useState<{ col: 'name' | 'dept' | 'headcount' | 'readiness' | 'potential' | 'gap', dir: 'asc' | 'desc' }>({ col: 'potential', dir: 'desc' })
  const toggleRoleSort = (col: typeof roleSort['col']) => {
    setRoleSort(prev => prev.col === col ? { col, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { col, dir: col === 'name' || col === 'dept' ? 'asc' : 'desc' })
  }
  const [taskSheetRole, setTaskSheetRole] = useState<{ title: string; dept: string } | null>(null)
  const [metricInfoOpen, setMetricInfoOpen] = useState(false)
  const [taskSheetZoneFilter, setTaskSheetZoneFilter] = useState<'augment' | 'above' | 'below' | null>(null)

  const [chroUpskillingInfoOpen, setChroUpskillingInfoOpen] = useState(false)
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
        case 'potential': return mul * (a.unrealizedValue - b.unrealizedValue)
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
      const totalUnrealizedValue = row.depts.reduce((s, d) => { const dept = departments.find(x => x.name === d.name); return s + (dept ? Math.round(dept.unrealizedValue * d.headcount / Math.max(1, dept.employees)) : 0) }, 0)
      const totalGap = row.depts.reduce((s, d) => s + d.gap, 0)
      const hrbpState = getHrbpEffectiveState(wfrState, row.hrbp)
      // Headcount-weighted response rate across the HRBP's departments (for collection-active view)
      const responseRate = stateNum(hrbpState) >= 2 && headcount > 0 && !hrbpJustLaunchedSet.has(row.hrbp)
        ? Math.round(row.depts.reduce((s, d) => s + wfrDemoDeptResponseRate(d.name) * d.headcount, 0) / headcount)
        : 0
      const hrbpDelegated = wfrState.hrbpStates?.[row.hrbp]?.delegated
      // Pre-collection baseline readiness (before calibration delta)
      const baseReadiness = headcount > 0 ? Math.round(row.depts.reduce((s, d2) => {
        const dept = allDeptsSorted.find(x => x.name === d2.name)
        return s + (dept?.aiReadiness ?? d2.readiness) * d2.headcount
      }, 0) / headcount) : 0
      const trendDelta = avgReadiness - baseReadiness
      return { hrbp: row.hrbp, depts: row.depts, headcount, avgReadiness, avgPotential, totalUnrealizedValue, totalGap, hrbpState, responseRate, hrbpDelegated, trendDelta }
    }).sort((a, b) => {
      // Pin delegated/active HRBPs to the top
      const aActive = a.hrbpDelegated || stateNum(a.hrbpState) >= 2 ? 1 : 0
      const bActive = b.hrbpDelegated || stateNum(b.hrbpState) >= 2 ? 1 : 0
      if (aActive !== bActive) return bActive - aActive
      const mul = hrbpSort.dir === 'asc' ? 1 : -1
      switch (hrbpSort.col) {
        case 'hrbp': return mul * a.hrbp.localeCompare(b.hrbp)
        case 'readiness': return mul * (a.avgReadiness - b.avgReadiness)
        case 'potential': return mul * (a.totalUnrealizedValue - b.totalUnrealizedValue)
        case 'gap': return mul * (a.totalGap - b.totalGap)
        default: return 0
      }
    })
  }, [allDeptsSorted, focusCollectionComplete, wfrState, hrbpSort])

  // All roles across org for the Roles tab
  const allRoles = useMemo(() => {
    const roles: { title: string; dept: string; employees: number; tasks: number; aiReadiness: number; measuredReadiness: number; aiPotential: number; unrealizedValue: number; gap: number }[] = []
    for (const d of allDeptsSorted) {
      const trend = deptReadinessTrend(d.name)
      for (const r of getRolesForDept(d.name)) {
        // Only apply collection delta and upskilling boost when collection is complete (state >= 3)
        const collectionDelta = focusCollectionComplete ? trend.delta + ((r.title.length % 3) - 1) : 0
        const upskillingBoost = hrbpPlansCreated ? Math.round(5 + ((r.aiPotential - r.aiReadiness) / 100) * 15 + (r.title.length % 4)) : 0
        const measured = Math.max(0, Math.min(100, r.aiReadiness + collectionDelta + upskillingBoost))
        roles.push({ title: r.title, dept: d.name, employees: r.employees, tasks: getTasksForRole(r.title).length, aiReadiness: r.aiReadiness, measuredReadiness: measured, aiPotential: r.aiPotential, unrealizedValue: r.unrealizedValue, gap: r.aiPotential - measured })
      }
    }
    const mul = roleSort.dir === 'asc' ? 1 : -1
    return roles.sort((a, b) => {
      switch (roleSort.col) {
        case 'name': return mul * a.title.localeCompare(b.title)
        case 'dept': return mul * a.dept.localeCompare(b.dept)
        case 'headcount': return mul * (a.employees - b.employees)
        case 'readiness': return mul * ((focusCollectionComplete ? a.measuredReadiness : a.aiReadiness) - (focusCollectionComplete ? b.measuredReadiness : b.aiReadiness))
        case 'potential': return mul * (a.unrealizedValue - b.unrealizedValue)
        case 'gap': return mul * (a.gap - b.gap)
        default: return 0
      }
    })
  }, [allDeptsSorted, hrbpPlansCreated, focusCollectionComplete, roleSort])


  // Top 3 departments by gap for opportunity tags in complete state
  const topGapDeptRanks = useMemo(() => {
    const byGap = [...departments].sort((a, b) => (b.aiPotential - b.aiReadiness) - (a.aiPotential - a.aiReadiness))
    const map = new Map<string, number>()
    byGap.slice(0, 3).forEach((d, i) => map.set(d.name, i))
    return map
  }, [])

  // Show all departments — collection scope is reflected via the Data Collection cell (progress vs "—")
  const sorted = useMemo(() => allDeptsSorted, [allDeptsSorted])

  // HRBP scoped rollup — always active when scopedDepartments is set
  const hrbpRollup = useMemo(() => {
    if (!scopedDepartments?.length) return null
    return wfrRollupDepartmentsByName(scopedDepartments)
  }, [scopedDepartments])

  const effectiveRollup = hrbpRollup ?? scopedRollup

  // When CHRO has delegated to HRBPs, scope the collection-complete card to just those HRBPs' headcounts.
  // Engineering has 10,500 total employees but Jaydon only covers 3,000 — use per-HRBP headcount,
  // not the full dept headcount, and use calibrated readiness to match the table numbers.
  const chroDelegatedGap = useMemo(() => {
    if (!chroDelegationActive || !wfrState.hrbpStates) return undefined
    const upskillingDeptSet = new Set(upskillingLaunchSummary?.departmentNames ?? [])
    return Object.entries(wfrState.hrbpStates)
      .filter(([, h]) => h.delegated)
      .reduce((total, [hrbpName]) => {
        return total + getHrbpDepts(hrbpName).reduce((sum, { dept: deptName, headcount: hrbpHeadcount }) => {
          if (upskillingDeptSet.has(deptName)) return sum
          const dept = departments.find(d => d.name === deptName)
          if (!dept) return sum
          const trend = focusCollectionComplete ? deptReadinessTrend(deptName) : { delta: 0 }
          const calibratedReadiness = Math.min(100, dept.aiReadiness + trend.delta)
          const augPeople = Math.round((hrbpHeadcount / ORG.totalEmployees) * ORG.peopleInAugRoles)
          return sum + Math.round(augPeople * (1 - calibratedReadiness / 100))
        }, 0)
      }, 0)
  }, [chroDelegationActive, wfrState, upskillingLaunchSummary, focusCollectionComplete])

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
  const orgUnrealizedValue = effectiveRollup ? effectiveRollup.unrealizedValue : departments.reduce((s, d) => s + d.unrealizedValue, 0)
  const totalEmployeesHero = effectiveRollup ? effectiveRollup.totalEmployees : ORG.totalEmployees
  const hrsUnlocked = effectiveRollup ? effectiveRollup.hrsUnlocked : Math.round(gapPeople * ORG.hrsPerPersonWeek)
  const gapSharePct =
    peopleInAugForCards > 0 ? Math.min(100, Math.round((gapPeople / peopleInAugForCards) * 100)) : 0
  const tasksInAug = effectiveRollup ? effectiveRollup.tasksInAugZone : ORG.tasksInAugZone
  const totalRoleTasks = effectiveRollup ? effectiveRollup.totalRoleTasks : ORG.totalRoleTasks
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
      label: 'Unrealized value',
      val: formatDollar(orgUnrealizedValue),
      icon: 'auto_awesome',
      l1: `${tasksInAug} of ${totalRoleTasks} tasks in the augmentation zone`,
      hint: `BLS median wages \u00d7 automation probability \u00d7 60% realization`,
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

  // Priority tags — top ~30% of rows by combined opportunity score
  const hrbpPrioritySet = (() => {
    if (hrbpRows.length === 0) return new Set<string>()
    const scores = hrbpRows.map(row => ({
      key: row.hrbp,
      score: (row.avgPotential - row.avgReadiness) * (row.totalGap / Math.max(1, row.headcount)),
    }))
    const sorted = [...scores].sort((a, b) => b.score - a.score)
    const count = Math.max(1, Math.round(sorted.length * 0.3))
    return new Set(sorted.slice(0, count).map(r => r.key))
  })()

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
              Your org has <span className="font-bold wfr-text-potential">{formatDollar(orgUnrealizedValue)}</span> in unrealized value. You're capturing less than a third of it.
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
              setChroUpskillingInfoOpen(true)
            }
          }}
          upskillingActive={upskillingActive}
          upskillingLaunchSummary={upskillingLaunchSummary}
          isHrbp={isHrbp}
          hrbpPlansCreated={hrbpPlansCreated}
          chroDelegationActive={chroDelegationActive}
          chroDelegationScopeLabel={collectionLaunchSummary?.scopeLabel}
          gapPeopleOverride={chroDelegatedGap}
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
              {isHrbp && <TabsTrigger value="roles">Roles</TabsTrigger>}
            </TabsList>
            <span className="wfr-dash__panel-hint">
              {boardTab === 'roles'
                ? `${allRoles.length} roles across ${allDeptsSorted.length} departments`
                : boardTab === 'hrbps'
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                      <span>{hrbpRows.length} HRBPs across {allDeptsSorted.length} departments</span>
                      {(anyDelegation || focusCollectionActive || upskillingActive) && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ display: 'inline-block', width: 1, height: 10, background: '#cbd5e1', flexShrink: 0 }} />
                          <span style={{ display: 'inline-block', width: 3, height: 12, background: '#3b5bdb', borderRadius: 2, flexShrink: 0 }} />
                          <span>{focusCollectionComplete ? 'In upskilling' : 'In data collection'}</span>
                        </span>
                      )}
                    </span>
                  : `Click to drill down`}
            </span>
          </div>
        )}

        <TabsContent value="hrbps">
          <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead style={{ width: '22%', cursor: 'pointer' }} onClick={() => toggleHrbpSort('hrbp')}><span className="inline-flex items-center gap-1">HRBP <SortIcon sortDir={hrbpSort.col === 'hrbp' ? hrbpSort.dir : null} onSortClick={() => toggleHrbpSort('hrbp')} /></span></DataTableHead>
                <DataTableHead style={{ width: '16%' }}>Departments</DataTableHead>
                <DataTableHead metric style={{ width: '14%' }}><MetricHeaderLabel label={'Team AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} sortDir={hrbpSort.col === 'readiness' ? hrbpSort.dir : null} onSortClick={() => toggleHrbpSort('readiness')} /></DataTableHead>
                <DataTableHead numeric style={{ width: '16%' }}><MetricHeaderLabel label="Unrealized value" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} sortDir={hrbpSort.col === 'potential' ? hrbpSort.dir : null} onSortClick={() => toggleHrbpSort('potential')} /></DataTableHead>
                <DataTableHead numeric style={{ width: '18%' }}><MetricHeaderLabel label="Transformation gap" metric="gap" sortDir={hrbpSort.col === 'gap' ? hrbpSort.dir : null} onSortClick={() => toggleHrbpSort('gap')} /></DataTableHead>
                {!focusCollectionComplete && (anyDelegation || focusCollectionActive) && <DataCollectionHead />}
                {focusCollectionComplete && <DataTableHead metric className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ width: '18%' }}>Upskilling progress</DataTableHead>}
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {hrbpRows.map((row) => {
                const hrbpInUpskilling = stateNum(row.hrbpState) >= 4
                const isHighlighted = stateNum(row.hrbpState) >= 2 || !!row.hrbpDelegated
                return (
                <DataTableRow key={row.hrbp}>
                  <DataTableCell className="font-semibold" style={isHighlighted ? { borderLeft: '3px solid #3b5bdb', paddingLeft: 17 } : { borderLeft: '3px solid transparent', paddingLeft: 17 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="text-[#3b5bdb] hover:underline"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', fontWeight: 'inherit' }}
                        onClick={() => onHrbpClick(row.hrbp)}
                      >
                        {row.hrbp}
                      </button>
                      {hrbpPrioritySet.has(row.hrbp) && (!focusCollectionActive && !focusCollectionComplete || isHighlighted) && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>
                          Priority
                        </span>
                      )}
                    </div>
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.depts.map(d => (
                        <button
                          key={d.name}
                          type="button"
                          className="text-[#3b5bdb] font-medium hover:underline"
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          onClick={() => onHrbpClick(row.hrbp)}
                        >
                          {d.name}{row.depts.length > 1 && d !== row.depts[row.depts.length - 1] ? ',' : ''}
                        </button>
                      ))}
                    </div>
                  </DataTableCell>
                  <DataTableCell metric>
                    <div>
                      {stateNum(row.hrbpState) >= 3 && row.trendDelta !== 0 ? (
                        <div className="wfr-dash__readiness-with-trend">
                          <DeptTableSoloBar variant="readiness" pct={row.avgReadiness} width={90} />
                          <button type="button" className={`wfr-dash__trend-badge ${row.trendDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setTrendSheetRole(null); setTrendSheetHrbp({ hrbpName: row.hrbp, headcount: row.headcount }); setTrendSheetDept(allDeptsSorted.find(x => x.name === row.depts[0].name) ?? null) }} title="View readiness trend details">
                            <span className="wfr-dash__trend-badge-text">{row.trendDelta >= 0 ? '↑' : '↓'}{Math.abs(row.trendDelta)}pt</span>
                            <span className="material-symbols-outlined wfr-dash__trend-badge-icon">info</span>
                          </button>
                        </div>
                      ) : <DeptTableSoloBar variant="readiness" pct={row.avgReadiness} width={90} />}
                      {stateNum(row.hrbpState) >= 3 && (
                        <div style={{ fontSize: 10, color: '#15803d', marginTop: 7, display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11, verticalAlign: -1 }}>verified</span>
                          Updated from data collection
                        </div>
                      )}
                    </div>
                  </DataTableCell>
                  <DataTableCell align="right"><span className="wfr-type-h6 tabular-nums">{formatDollar(row.totalUnrealizedValue)}</span></DataTableCell>
                  <DataTableCell align="right">
                    <div className="tabular-nums" style={{ textAlign: 'right' }}>
                      <span className="wfr-type-h6">{row.totalGap.toLocaleString()} ({row.headcount > 0 ? Math.round((row.totalGap / row.headcount) * 100) : 0}%)</span>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {row.headcount.toLocaleString()}</div>
                    </div>
                  </DataTableCell>
                  {!focusCollectionComplete && (anyDelegation || focusCollectionActive) && (
                    stateNum(row.hrbpState) === 1 && row.hrbpDelegated
                      ? <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}><HrbpStatusPill state={1} delegated /><span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>Sent Apr 5, 2026</span></div></DataTableCell>
                      : stateNum(row.hrbpState) >= 2
                        ? <DataCollectionProgressCell rate={row.responseRate} inScope />
                        : <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><span className="text-[11px] text-[#94a3b8]">—</span></DataTableCell>
                  )}
                  {focusCollectionComplete && (() => {
                    const hrbpWasInScope = stateNum(row.hrbpState) >= 3
                    if (!hrbpWasInScope) {
                      return <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><span className="text-[11px] text-[#94a3b8]">—</span></DataTableCell>
                    }
                    const nh = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
                    const plansPct = hrbpPlansCreated ? 100
                      : hrbpInUpskilling ? Math.max(15, Math.min(85, 30 + (nh(row.hrbp) % 50)))
                      : 0
                    const barColor = plansPct === 100 ? '#22c55e' : '#818cf8'
                    const pctColor = plansPct === 100 ? '#15803d' : plansPct > 0 ? '#6366f1' : '#94a3b8'
                    return (
                      <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]">
                        {plansPct > 0 ? (
                          <div className="wfr-dash__plan-progress">
                            <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                              <div className="wfr-dash__plan-progress-fill" style={{ width: `${plansPct}%`, background: barColor }} />
                            </div>
                            <span className="wfr-dash__plan-progress-label" style={{ color: pctColor }}>{plansPct}%</span>
                          </div>
                        ) : <span className="text-[11px] text-[#94a3b8]">—</span>}
                      </DataTableCell>
                    )
                  })()}
                </DataTableRow>
              )})}
            </DataTableBody>
          </DataTable>
        </TabsContent>

        <TabsContent value="departments">

      {focusCollectionComplete ? (
        <div>
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('name')}><span className="inline-flex items-center gap-1">Department <SortIcon sortDir={deptSort.col === 'name' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('name')} /></span></DataTableHead>
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('hrbp')}><span className="inline-flex items-center gap-1">HRBP <SortIcon sortDir={deptSort.col === 'hrbp' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('hrbp')} /></span></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label={'Team AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'readiness' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('readiness')} /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Unrealized value" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'potential' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('potential')} /></DataTableHead>
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
                      <DataTableCell metric>
                        <div className="wfr-dash__readiness-with-trend">
                          <DeptTableSoloBar variant="readiness" pct={measuredReadiness} />
                          <button type="button" className={`wfr-dash__trend-badge ${trend.direction === 'up' ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setTrendSheetRole(null); setTrendSheetHrbp(null); setTrendSheetDept(d) }} title="View readiness trend details">
                            <span className="wfr-dash__trend-badge-text">{trend.direction === 'up' ? '↑' : '↓'}{Math.abs(trend.delta)}pt</span>
                            <span className="material-symbols-outlined wfr-dash__trend-badge-icon">info</span>
                          </button>
                        </div>
                      </DataTableCell>
                      <DataTableCell align="right"><span className="wfr-type-h6 tabular-nums">{formatDollar(d.unrealizedValue)}</span></DataTableCell>
                      <DataTableCell align="right" title={`${gapCount.toLocaleString()} of ${d.employees.toLocaleString()} people in augmentable roles are not yet AI-ready`}>
                        <div className="tabular-nums" style={{ textAlign: 'right' }}>
                          <span className="wfr-type-h6">{gapCount.toLocaleString()} ({d.employees > 0 ? Math.round((gapCount / d.employees) * 100) : 0}%)</span>
                          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {d.employees.toLocaleString()}</div>
                        </div>
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
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('name')}><span className="inline-flex items-center gap-1">Department <SortIcon sortDir={deptSort.col === 'name' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('name')} /></span></DataTableHead>
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('hrbp')}><span className="inline-flex items-center gap-1">HRBP <SortIcon sortDir={deptSort.col === 'hrbp' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('hrbp')} /></span></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label={'Team AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'readiness' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('readiness')} /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Unrealized value" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'potential' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('potential')} /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Transformation gap" metric="gap" sortDir={deptSort.col === 'gap' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('gap')} /></DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {allDeptsSorted.map((d) => {
                const gapCount = deptGapHeadcount(d)
                const deptHrbps = getDeptHrbps(d.name)
                return (
                    <DataTableRow key={d.name} onClick={() => onDeptClick(d)}>
                      <DataTableCell className="font-semibold">{d.name}</DataTableCell>
                      <DataTableCell className="text-[#475569]">{deptHrbps.length > 1 ? `${deptHrbps[0].hrbp} +${deptHrbps.length - 1}` : deptHrbps[0]?.hrbp ?? '—'}</DataTableCell>
                      <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={d.aiReadiness} /></DataTableCell>
                      <DataTableCell align="right"><span className="wfr-type-h6 tabular-nums">{formatDollar(d.unrealizedValue)}</span></DataTableCell>
                      <DataTableCell align="right">
                        <div className="tabular-nums" style={{ textAlign: 'right' }}>
                          <span className="wfr-type-h6">{gapCount.toLocaleString()} ({d.employees > 0 ? Math.round((gapCount / d.employees) * 100) : 0}%)</span>
                          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {d.employees.toLocaleString()}</div>
                        </div>
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
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('name')}><span className="inline-flex items-center gap-1">Department <SortIcon sortDir={deptSort.col === 'name' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('name')} /></span></DataTableHead>
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleDeptSort('hrbp')}><span className="inline-flex items-center gap-1">HRBP <SortIcon sortDir={deptSort.col === 'hrbp' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('hrbp')} /></span></DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label={'Team AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'readiness' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('readiness')} /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Unrealized value" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} sortDir={deptSort.col === 'potential' ? deptSort.dir : null} onSortClick={() => toggleDeptSort('potential')} /></DataTableHead>
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
                      <DataTableCell metric>
                        <DeptTableSoloBar variant="readiness" pct={d.aiReadiness} />
                      </DataTableCell>
                      <DataTableCell align="right">
                        <span className="wfr-type-h6 tabular-nums">{formatDollar(d.unrealizedValue)}</span>
                      </DataTableCell>
                      <DataTableCell align="right">
                        <div className="tabular-nums" style={{ textAlign: 'right' }}>
                          <span className="wfr-type-h6">{gapCount.toLocaleString()} ({d.employees > 0 ? Math.round((gapCount / d.employees) * 100) : 0}%)</span>
                          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {d.employees.toLocaleString()}</div>
                        </div>
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
                <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleRoleSort('name')}><span className="inline-flex items-center gap-1">Role <SortIcon sortDir={roleSort.col === 'name' ? roleSort.dir : null} onSortClick={() => toggleRoleSort('name')} /></span></DataTableHead>
                {!isHrbp && <DataTableHead style={{ cursor: 'pointer' }} onClick={() => toggleRoleSort('dept')}><span className="inline-flex items-center gap-1">Department <SortIcon sortDir={roleSort.col === 'dept' ? roleSort.dir : null} onSortClick={() => toggleRoleSort('dept')} /></span></DataTableHead>}
                <DataTableHead numeric style={{ cursor: 'pointer' }} onClick={() => toggleRoleSort('headcount')}><span className="inline-flex items-center gap-1">Headcount <SortIcon sortDir={roleSort.col === 'headcount' ? roleSort.dir : null} onSortClick={() => toggleRoleSort('headcount')} /></span></DataTableHead>
                <DataTableHead numeric>Tasks</DataTableHead>
                <DataTableHead metric><MetricHeaderLabel label={'AI adoption'} metric="readiness" onInfoClick={() => setMetricInfoOpen(true)} sortDir={roleSort.col === 'readiness' ? roleSort.dir : null} onSortClick={() => toggleRoleSort('readiness')} /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Unrealized value" metric="potential" onInfoClick={() => setMetricInfoOpen(true)} sortDir={roleSort.col === 'potential' ? roleSort.dir : null} onSortClick={() => toggleRoleSort('potential')} /></DataTableHead>
                <DataTableHead numeric><MetricHeaderLabel label="Transformation gap" metric="gap" sortDir={roleSort.col === 'gap' ? roleSort.dir : null} onSortClick={() => toggleRoleSort('gap')} /></DataTableHead>
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
                            onClick={(e) => { e.stopPropagation(); setTrendSheetRole({ title: r.title, dept: r.dept, measuredReadiness: r.measuredReadiness }); setTrendSheetHrbp(null); setTrendSheetDept(allDeptsSorted.find(d => d.name === r.dept) ?? null) }}
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
                    <DataTableCell align="right"><span className="wfr-type-h6 tabular-nums">{formatDollar(r.unrealizedValue)}</span></DataTableCell>
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
        onClose={() => { setTrendSheetDept(null); setTrendSheetRole(null); setTrendSheetHrbp(null) }}
        dept={trendSheetDept}
        channelsLabel={collectionLaunchSummary?.channelsLabel}
        roleContext={trendSheetRole}
        hrbpContext={trendSheetHrbp}
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

      {/* CHRO upskilling info dialog — explains next stage before launching wizard */}
      {chroUpskillingInfoOpen && (() => {
        const deptCount = allDeptsSorted.length
        const empCount = gapPeople
        return (
          <>
            <div className="wfr-focus-launch__overlay" onClick={() => setChroUpskillingInfoOpen(false)} />
            <div className="wfr-focus-launch__content" style={{ width: 'min(560px, calc(100vw - 32px))' }}>
              <div className="wfr-focus-launch__header">
                <div className="wfr-focus-launch__header-top">
                  <h2 className="wfr-focus-launch__dialog-title">What's next — upskilling</h2>
                  <button type="button" className="wfr-focus-launch__close" onClick={() => setChroUpskillingInfoOpen(false)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>How development plans close the adoption gap</p>
              </div>
              <div className="wfr-focus-launch__body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {([
                    {
                      icon: 'groups',
                      color: '#3b5bdb',
                      bg: '#eff3ff',
                      title: 'HRBPs are notified',
                      desc: 'Each HRBP sees their team\'s transformation gap and top priority roles. They choose which roles to target first.',
                    },
                    {
                      icon: 'assignment',
                      color: '#0f766e',
                      bg: '#f0fdfa',
                      title: 'Development plans assigned',
                      desc: 'HRBPs assign role-specific plans from the Degreed catalog. Each plan is matched to that role\'s augmentable tasks.',
                    },
                    {
                      icon: 'trending_up',
                      color: '#b45309',
                      bg: '#fffbeb',
                      title: 'AI adoption improves',
                      desc: 'As employees complete training, readiness scores update each quarter. Track progress on this dashboard.',
                    },
                  ] as { icon: string; color: string; bg: string; title: string; desc: string }[]).map((step, i) => (
                    <div key={step.title} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: step.color }}>{step.icon}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{step.title}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#15803d' }}>check_circle</span>
                  <span style={{ fontSize: 13, color: '#334155' }}>
                    Ready to upskill <strong>{empCount.toLocaleString()}</strong> employees across <strong>{deptCount}</strong> department{deptCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="wfr-focus-launch__footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="button" variant="secondary" onClick={() => setChroUpskillingInfoOpen(false)}>Close</Button>
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
  personaHrbpNames,
}: {
  onViewChange?: (view: 'board' | 'hrbp' | 'director' | 'seniorMgr') => void
  autoLaunchCollection?: boolean
  /** When set, only show these departments (HRBP scoped view) */
  scopedDepartments?: string[]
  /** HRBP persona — different RA card, no departments tab, scoped roles */
  isHrbp?: boolean
  /** HRBP names this persona maps to in hrbpAssignments (for per-HRBP state) */
  personaHrbpNames?: string[]
} = {}) {
  const navigate = useNavigate()
  const [dashOpenMetric, setDashOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
  // Single-dept HRBP goes straight to DeptView (no overview needed)
  const singleDeptHrbp = isHrbp && scopedDepartments?.length === 1

  // Auto-select view from query params (e.g. navigating back from Manager Detail breadcrumbs)
  const [view, setView] = useState<'board' | 'hrbp' | 'director' | 'seniorMgr'>(() => {
    const p = new URLSearchParams(window.location.search)
    // URL params take precedence over singleDeptHrbp default (e.g. breadcrumb back-nav)
    if (p.get('seniorMgr') && p.get('director')) return 'seniorMgr'
    if (p.get('director')) return 'director'
    if (singleDeptHrbp) return 'hrbp'
    if (p.get('hrbp')) return 'hrbp'
    return 'board'
  })
  const [hrbpName, setHrbpName] = useState<string | null>(() => {
    if (singleDeptHrbp && personaHrbpNames?.length) return personaHrbpNames[0]
    const p = new URLSearchParams(window.location.search)
    return p.get('hrbp') ?? null
  })

  // Reset view when persona changes (e.g. HRBP → CHRO via avatar dropdown)
  // Force full reload when persona changes — useState initializers don't re-run on prop changes
  const prevIsHrbpRef = useRef(isHrbp)
  useEffect(() => {
    if (prevIsHrbpRef.current !== isHrbp) {
      prevIsHrbpRef.current = isHrbp
      window.location.href = `/workforce?user=${isHrbp ? 'jaydon-torff' : 'chro'}`
    }
  }, [isHrbp])
  const [mgrSort, setMgrSort] = useState<{ col: MgrSortCol, dir: 'asc' | 'desc' }>({ col: 'potential', dir: 'desc' })
  const toggleMgrSort = (col: MgrSortCol) => {
    setMgrSort(prev => prev.col === col ? { col, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { col, dir: col === 'name' ? 'asc' : 'desc' })
  }
  const [hrbpTrendSheetDir, setHrbpTrendSheetDir] = useState<{ manager: string; mgrIndex: number; dept: Dept } | null>(null)
  const [seniorMgrData, setSeniorMgrData] = useState<{ name: string; title: string; deptName: string; mgrIdxStart: number; mgrCount: number; parentDirector: { name: string; title: string; deptName: string; mgrIdxStart: number; mgrCount: number; parentHrbp: string } } | null>(() => {
    const p = new URLSearchParams(window.location.search)
    const srName = p.get('seniorMgr')
    const srStartStr = p.get('srStart')
    const directorName = p.get('director')
    const hrbp = p.get('hrbp') ?? (singleDeptHrbp && personaHrbpNames?.length ? personaHrbpNames[0] : null)
    const deptParam = p.get('dept')
    const dirIdxStr = p.get('dirIdx')
    if (!srName || srStartStr === null || !directorName || !hrbp || !deptParam || dirIdxStr === null) return null
    const d = departments.find(x => x.name === deptParam)
    if (!d) return null
    const dirIdx = parseInt(dirIdxStr, 10)
    const deptHrbpList = getDeptHrbps(deptParam)
    const allMgrs = deptManagerTeams(deptParam, d.employees)
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
        const parentDir = {
          name: directorName,
          title: dirTitles[dirIdx % dirTitles.length],
          deptName: deptParam,
          mgrIdxStart: startIdx + dirIdx * perDir,
          mgrCount: Math.min(perDir, sliceCount - dirIdx * perDir),
          parentHrbp: hrbp,
        }
        const teamMgrs = allMgrs.slice(parentDir.mgrIdxStart, parentDir.mgrIdxStart + parentDir.mgrCount)
        const srStart = parseInt(srStartStr, 10)
        const targetSr = Math.max(2, Math.min(5, Math.round(teamMgrs.length / 3)))
        const perSr = Math.ceil(teamMgrs.length / targetSr)
        const si = Math.floor(srStart / perSr)
        const SR_TITLES = ['Senior Manager', 'Principal Manager', 'Group Manager', 'Associate Director', 'Staff Manager']
        const batch = teamMgrs.slice(si * perSr, (si + 1) * perSr)
        if (batch.length === 0) return null
        return {
          name: srName,
          title: SR_TITLES[si % SR_TITLES.length],
          deptName: deptParam,
          mgrIdxStart: parentDir.mgrIdxStart + si * perSr,
          mgrCount: batch.length,
          parentDirector: parentDir,
        }
      }
    }
    return null
  })
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
  const [_dept] = useState<Dept | null>(() => {
    if (singleDeptHrbp) {
      return departments.find(d => d.name === scopedDepartments![0]) ?? null
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
    // Restore state 5 (upskilled) and any state with per-HRBP delegation tracking.
    // All other states start fresh at 1 so the demo flow is always clean.
    try {
      const stored = localStorage.getItem(WFR_STATE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as WfrPersistedState
        if (parsed.state === 5) return parsed
        // Preserve delegation state (hrbpStates) so HRBPs see the delegation CTA across navigation
        if (parsed.hrbpStates && Object.keys(parsed.hrbpStates).length > 0) return parsed
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



  // UI-local dialog toggles (not program state)
  const [focusLaunchOpen, setFocusLaunchOpen] = useState(autoLaunchCollection)
  const [upskillingLaunchOpen, setUpskillingLaunchOpen] = useState(false)
  const [hrbpUpskillingDialogOpen, setHrbpUpskillingDialogOpen] = useState(false)
  const [hrbpUpskillingSelectedDirs, setHrbpUpskillingSelectedDirs] = useState<Set<string>>(new Set())
  // HRBP collection progress bar animation state
  const [hrbpBarPhase, setHrbpBarPhase] = useState<'idle' | 'filling' | 'done'>('idle')
  const [hrbpBarPct, setHrbpBarPct] = useState(0)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  // State transition functions — per-HRBP aware
  const advanceToCollection = useCallback((summary: FocusCollectionLaunchSummary) => {
    if (summary.delegated && summary.selectedHrbpNames?.length) {
      // Delegation: set HRBPs to state 1 + delegated (they choose their own method and launch)
      const hrbpStates: Record<string, HrbpState> = {}
      for (const hrbpName of summary.selectedHrbpNames) {
        hrbpStates[hrbpName] = { state: 1, departments: getHrbpDepts(hrbpName).map(d => d.dept), delegated: true }
      }
      setWfrState(prev => ({ ...prev, state: 1, collectionLaunchSummary: summary, hrbpStates }))
    } else {
      setWfrState(prev => ({ ...prev, state: 2, collectionLaunchSummary: summary, hrbpStates: undefined }))
    }
  }, [setWfrState])

  /** Called when an individual HRBP launches collection from the delegation CTA */
  const advanceHrbpToCollection = useCallback((hrbpName: string, channelsLabel: string, selectedDirectors?: string[]) => {
    hrbpJustLaunchedSet.add(hrbpName)
    setWfrState(prev => {
      if (!prev.hrbpStates?.[hrbpName]) return prev
      const next: WfrPersistedState = {
        ...prev,
        hrbpStates: {
          ...prev.hrbpStates,
          [hrbpName]: { ...prev.hrbpStates[hrbpName], state: 2, channelsLabel, selectedDirectors },
        },
      }
      next.state = computeOrgAggregateState(next)
      return next
    })
  }, [setWfrState])

  const cancelCollection = useCallback(() => {
    setWfrState({ state: 1 })
  }, [setWfrState])

  const completeCollection = useCallback(() => {
    setWfrState(prev => advanceAllHrbps(prev, 2 as WfrProgramState, '2b'))
  }, [setWfrState])

  const handleHrbpBarClick = useCallback((startPct: number) => {
    if (hrbpBarPhase !== 'idle') return
    setHrbpBarPhase('filling')
    setHrbpBarPct(startPct)
    const startTime = performance.now()
    const duration = 3000
    const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
      let t = x
      for (let i = 0; i < 8; i++) {
        const ct = 1 - t
        const bx = 3 * ct * ct * t * x1 + 3 * ct * t * t * x2 + t * t * t - x
        const dx = 3 * ct * ct * x1 + 6 * ct * t * (x2 - x1) + 3 * t * t * (1 - x2)
        if (Math.abs(dx) < 1e-6) break
        t -= bx / dx
        t = Math.max(0, Math.min(1, t))
      }
      const ct = 1 - t
      return 3 * ct * ct * t * y1 + 3 * ct * t * t * y2 + t * t * t
    }
    const ease = cubicBezier(0.25, 0.1, 0.25, 1)
    const tick = (now: number) => {
      const linear = Math.min((now - startTime) / duration, 1)
      setHrbpBarPct(Math.round(startPct + (100 - startPct) * (linear >= 1 ? 1 : ease(linear))))
      if (linear < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    setTimeout(() => {
      setHrbpBarPct(100)
      setHrbpBarPhase('done')
      setTimeout(() => {
        setHrbpBarPhase('idle')
        setHrbpBarPct(0)
        completeCollection()
      }, 1500)
    }, duration)
  }, [hrbpBarPhase, completeCollection])

  const viewCollectionResults = useCallback(() => {
    setWfrState(prev => advanceAllHrbps(prev, '2b', 3))
  }, [setWfrState])

  const startUpskilling = useCallback((summary: UpskillingLaunchSummary) => {
    setWfrState(prev => {
      const next = advanceAllHrbps(prev, 3 as WfrProgramState, 4)
      return { ...next, upskillingLaunchSummary: summary }
    })
    const deptCount = summary.departmentNames.length
    const empCount = summary.totalEmployees.toLocaleString()
    setSnackbar(`Upskilling launched for ${deptCount} department${deptCount === 1 ? '' : 's'} · ${empCount} employees`)
    setTimeout(() => setSnackbar(null), 4000)
  }, [setWfrState])

  const completeUpskilling = useCallback(() => {
    setWfrState(prev => advanceAllHrbps(prev, null, 5))
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
  const anyAt2b = wfrState.state === '2b' || (wfrState.hrbpStates && Object.values(wfrState.hrbpStates).some(h => h.state === '2b'))
  useEffect(() => {
    if (!anyAt2b) return
    const timer = setTimeout(() => {
      setWfrState(prev => advanceAllHrbps(prev, '2b', 3))
    }, 1000)
    return () => clearTimeout(timer)
  }, [anyAt2b, setWfrState])

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
      <div className="min-w-0">
        {view === 'board' && (
          <BoardView
            onDeptClick={(d) => {
              // Dept view removed — navigate to the first HRBP for this dept
              const deptHrbps = getDeptHrbps(d.name)
              if (deptHrbps.length > 0) {
                setHrbpName(deptHrbps[0].hrbp)
                setView('hrbp')
              }
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
          const hrbpEffState = getHrbpEffectiveState(wfrState, hrbpName)
          const { collectionComplete: hrbpCollectionComplete, upskillingActive: hrbpUpskillingActive, hrbpPlansCreated: hrbpPlansComplete } = deriveWfrFlags(hrbpEffState)
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
          // Data collection status for this HRBP (covers both delegation and non-delegation flows)
          const hrbpDelegatedPending = hasHrbpPendingDelegation(wfrState, hrbpName)
          const hrbpCollecting = stateNum(hrbpEffState) >= 2 && !hrbpCollectionComplete
          const showHrbpCollection = hrbpCollecting
          const hrbpJustLaunched = hrbpJustLaunchedSet.has(hrbpName)
          const hrbpResponseRate = hrbpCollecting && !hrbpJustLaunched ? wfrDemoDeptResponseRate(d.name) : 0
          const hrbpSelectedDirNames = wfrState.hrbpStates?.[hrbpName]?.selectedDirectors
          const hrbpDirInScope = (dirName: string) => !hrbpSelectedDirNames || hrbpSelectedDirNames.includes(dirName)
          // Build the CTA card for the heroCard slot
          const hrbpHeroCard = hrbpDelegatedPending ? (
            <div className="wfr-dash__focus-module">
              <div className={`wfr-ra-card ${isHrbp ? 'wfr-ra-card--warn' : 'wfr-ra-card--warn'}`}>
                <div className="wfr-ra-card__header">
                  <span className="wfr-ra-card__eyebrow" style={{ color: isHrbp ? '#dc2626' : '#d97706' }}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>{isHrbp ? 'flag' : 'assignment_ind'}</span> {isHrbp ? 'Ready to launch' : 'Awaiting launch'}</span>
                </div>
                <div className="wfr-ra-card__cta-row">
                  {isHrbp ? (
                    <>
                      <div>
                        <p className="wfr-ra-card__cta-text">
                          Launch data collection for your team to measure how your {headcount.toLocaleString()} employees are actually using AI today. Results will replace estimated scores with measured adoption data.
                        </p>
                        <p className="wfr-ra-card__hint">AI-powered interviews take ~3 minutes per employee. You'll see responses roll in as people complete them.</p>
                      </div>
                      <Button type="button" variant="primary" className="wfr-ra-card__cta-btn shrink-0" onClick={() => setFocusLaunchOpen(true)}>
                        Get started&nbsp;→
                      </Button>
                    </>
                  ) : (
                    <p className="wfr-ra-card__cta-text">
                      Data collection has been delegated to <strong>{hrbpName}</strong>. Waiting for them to launch for their client managers in {d.name}.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : hrbpCollecting ? (
            <div className="wfr-dash__focus-module">
              <div className="wfr-ra-card wfr-ra-card--warn">
                <div className="wfr-ra-card__header">
                  <span className="wfr-ra-card__eyebrow" style={{ color: '#d97706' }}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>sync</span> Collection in progress</span>
                </div>
                <div className="wfr-ra-card__cta-row">
                  <div style={{ flex: 1 }}>
                    <p className="wfr-ra-card__cta-text">
                      {isHrbp
                        ? <>AI-powered interviews are underway with your teams. Responses are rolling in — check back as participation grows.</>
                        : (() => { const scopedDirs = directors.filter(dir => hrbpDirInScope(dir.name)); const scopedHeadcount = scopedDirs.reduce((s, d) => s + d.employees, 0); return <><strong>{Math.round(scopedHeadcount * hrbpResponseRate / 100).toLocaleString()} of {scopedHeadcount.toLocaleString()}</strong> employees across <strong>{hrbpName}</strong>'s {scopedDirs.length} selected client manager team{scopedDirs.length !== 1 ? 's' : ''} have responded.</>; })()
                      }
                    </p>
                    <div
                      className="wfr-dash__plan-progress"
                      style={{ marginTop: 8, maxWidth: 320, cursor: hrbpBarPhase === 'idle' ? 'pointer' : 'default' }}
                      title={hrbpBarPhase === 'idle' ? 'Click to simulate collection complete' : undefined}
                      onClick={() => hrbpBarPhase === 'idle' && handleHrbpBarClick(hrbpResponseRate)}
                    >
                      <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(217, 119, 6, 0.15)', height: 8 }}>
                        <div
                          className="wfr-dash__plan-progress-fill"
                          style={{
                            width: `${hrbpBarPhase !== 'idle' ? hrbpBarPct : hrbpResponseRate}%`,
                            background: hrbpBarPhase === 'done' ? '#15803d' : '#d97706',
                            transition: hrbpBarPhase === 'filling' ? 'none' : undefined,
                          }}
                        />
                      </div>
                      <span className="wfr-dash__plan-progress-label">
                        {hrbpBarPhase !== 'idle' ? `${hrbpBarPct}% responded` : `${hrbpResponseRate}% responded`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : hrbpCollectionComplete && !hrbpUpskillingActive ? (
            <div className="wfr-dash__focus-module">
              <div className="wfr-ra-card wfr-ra-card--success">
                <div className="wfr-ra-card__header">
                  <span className="wfr-ra-card__eyebrow" style={{ color: '#15803d' }}><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>check_circle</span> Collection complete</span>
                </div>
                <div className="wfr-ra-card__cta-row">
                  <div>
                    <p className="wfr-ra-card__cta-text">
                      {(() => {
                        const scopedDirs = directors.filter(dir => hrbpDirInScope(dir.name))
                        const scopedHeadcount = scopedDirs.reduce((s, dir) => s + dir.employees, 0)
                        const totalHeadcount = directors.reduce((s, dir) => s + dir.employees, 0)
                        const scopedGap = totalHeadcount > 0 ? Math.round(totalGap * scopedHeadcount / totalHeadcount) : 0
                        return <>Based on AI Coaching, you can close adoption gaps for <strong>{scopedGap.toLocaleString()}</strong> employees across the <strong>{scopedDirs.length} client manager team{scopedDirs.length !== 1 ? 's' : ''}</strong> that completed data collection.</>
                      })()}
                    </p>
                    <p className="wfr-ra-card__hint">Assign development plans to your client managers so they can enroll their teams in targeted upskilling courses.</p>
                  </div>
                  <Button type="button" variant="primary" className="shrink-0" onClick={() => {
                    // Pre-select all directors who participated in data collection
                    const inScope = directors.filter(dir => hrbpDirInScope(dir.name)).map(dir => dir.name)
                    setHrbpUpskillingSelectedDirs(new Set(inScope))
                    setHrbpUpskillingDialogOpen(true)
                  }}>
                    Start upskilling&nbsp;→
                  </Button>
                </div>
              </div>
            </div>
          ) : hrbpUpskillingActive && !hrbpPlansComplete ? (() => {
            const scopedDirs = directors.filter(dir => hrbpDirInScope(dir.name))
            const scopedGap = scopedDirs.reduce((s, dir) => s + Math.max(0, dir.employees - dir.readyCount), 0)
            return (
              <div className="wfr-dash__focus-module">
                <div className="wfr-ra-card wfr-ra-card--warn">
                  <div className="wfr-ra-card__header">
                    <span className="wfr-ra-card__eyebrow" style={{ color: '#b45309' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: -2 }}>rocket_launch</span> Upskilling started
                    </span>
                  </div>
                  <div className="wfr-ra-card__cta-row">
                    <div>
                      <p className="wfr-ra-card__cta-text">
                        Development plans are being created for <strong>{scopedGap.toLocaleString()}</strong> employees across <strong>{scopedDirs.length} client manager team{scopedDirs.length !== 1 ? 's' : ''}</strong>.
                      </p>
                      <p className="wfr-ra-card__hint">
                        Once plans are assigned, adoption scores will update to reflect upskilling progress.
                      </p>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#fef3c7', border: '1px solid #fcd34d', fontSize: 13, fontWeight: 600, color: '#b45309', whiteSpace: 'nowrap' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>rocket_launch</span>
                      Upskilling started
                    </span>
                  </div>
                </div>
              </div>
            )
          })() : undefined
          return (
            <>
            <PersonDetailLayout
              breadcrumb={isHrbp ? undefined : (
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink onClick={() => { setView('board'); setHrbpName(null) }}>Overview</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage><span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: -3, marginRight: 4 }}>shield_person</span>{hrbpName}</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              )}
              name={isHrbp ? '' : (hrbpName ?? '')}
              subtitle={isHrbp ? '' : `HRBP · ${d.name} · ${headcount.toLocaleString()} of ${d.employees.toLocaleString()} employees`}
              heroCard={hrbpHeroCard}
              readiness={{
                value: `${measuredReadiness}%`,
                description: hrbpCollectionComplete ? `${readyCount.toLocaleString()} AI-ready of ${headcount.toLocaleString()}` : `Estimated: ${readyCount.toLocaleString()} of ${headcount.toLocaleString()} may be AI-ready`,
                hint: hrbpPlansComplete ? 'After upskilling plans completed.' : hrbpCollectionComplete ? 'Calibrated from data collection.' : 'Estimated from skill profiles.',
                badge: collBadge,
                onLearnMore: () => setDashOpenMetric('readiness'),
              }}
              potential={{ value: formatDollar(Math.round(d.unrealizedValue * headcount / Math.max(1, d.employees))), description: 'BLS median wages \u00d7 automation probability', hint: `Unrealized value for ${hrbpName ?? d.name}'s team`, onLearnMore: () => setDashOpenMetric('potential') }}
              gap={{ value: `${totalGap.toLocaleString()} not ready`, description: `out of ${headcount.toLocaleString()} employees`, hint: measuredReadiness >= 50 ? `${measuredReadiness}% adoption meets the 50% threshold.` : `${measuredReadiness}% adoption is below the 50% threshold.`, onLearnMore: () => setDashOpenMetric('gap') }}
              managerTable={isHrbp ? undefined : {
                title: 'Manager summary',
                hint: d.name,
                hideTitle: true,
                children: (
                  <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                    <DataTableHeader>
                      <DataTableRow>
                        <DataTableHead style={{ width: '34%' }}>Manager</DataTableHead>
                        <DataTableHead metric style={{ width: '14%' }}>AI adoption</DataTableHead>
                        <DataTableHead numeric style={{ width: '34%' }}>Transformation gap</DataTableHead>
                        {hrbpCollectionComplete && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '18%' }}>Upskilling status</DataTableHead>}
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
                        <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={measuredReadiness} /></DataTableCell>
                        <DataTableCell align="right">
                          <span style={{ color: measuredReadiness >= 50 ? '#15803d' : '#dc2626', fontWeight: 600 }}>{measuredReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}</span>
                        </DataTableCell>
                        {hrbpCollectionComplete && (() => {
                          const hnh = nameHash(hrbpName ?? '')
                          const hPlanPct = hrbpPlansComplete ? 100 : Math.max(0, Math.min(90, 20 + (hnh % 60)))
                          return (
                            <DataTableCell className="bg-[#fafbfc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px 3px 6px', borderRadius: 100, background: '#eff3ff', border: '1px solid #c5d3f8', color: '#3b5bdb', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.4 }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>description</span>
                                  Dev plan
                                </button>
                                {hPlanPct === 0 ? (
                                  <button type="button" style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 6, background: '#3b5bdb', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.4 }}>
                                    Assign
                                  </button>
                                ) : (() => {
                                  const hStatus = hPlanPct > 85 ? 'Completed' : hPlanPct > 20 ? 'In progress' : 'Not started'
                                  const bColor = hStatus === 'Completed' ? '#22c55e' : hStatus === 'In progress' ? '#818cf8' : '#e2e8f0'
                                  const tColor = hStatus === 'Completed' ? '#15803d' : hStatus === 'In progress' ? '#6366f1' : '#94a3b8'
                                  return (
                                    <div className="wfr-dash__plan-progress" style={{ flex: '1 1 0', minWidth: 60 }}>
                                      <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                                        <div className="wfr-dash__plan-progress-fill" style={{ width: `${hPlanPct}%`, background: bColor }} />
                                      </div>
                                      <span className="wfr-dash__plan-progress-label" style={{ color: tColor }}>{hPlanPct}%</span>
                                    </div>
                                  )
                                })()}
                              </div>
                            </DataTableCell>
                          )
                        })()}
                      </DataTableRow>
                    </DataTableBody>
                  </DataTable>
                ),
              }}
              tableTitle="Client managers"
              tableHint={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span>{directors.length} client manager{directors.length !== 1 ? 's' : ''} · click to view team</span>
                  {(showHrbpCollection || hrbpCollectionComplete) && directors.some(dir => hrbpDirInScope(dir.name)) && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ display: 'inline-block', width: 1, height: 10, background: '#cbd5e1', flexShrink: 0 }} />
                      <span style={{ display: 'inline-block', width: 3, height: 12, background: '#3b5bdb', borderRadius: 2, flexShrink: 0 }} />
                      <span>{hrbpCollectionComplete ? 'In upskilling' : 'In data collection'}</span>
                    </span>
                  )}
                </span>
              }
            >
              <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead style={{ width: '34%', cursor: 'pointer' }} onClick={() => toggleMgrSort('name')}><span className="inline-flex items-center gap-1">Manager <SortIcon sortDir={mgrSort.col === 'name' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('name')} /></span></DataTableHead>
                    <DataTableHead metric style={{ width: '14%', cursor: 'pointer' }} onClick={() => toggleMgrSort('readiness')}><span className="inline-flex items-center gap-1">Team AI adoption <SortIcon sortDir={mgrSort.col === 'readiness' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('readiness')} /></span></DataTableHead>
                    <DataTableHead numeric style={{ width: '16%', cursor: 'pointer' }} onClick={() => toggleMgrSort('potential')}><span className="inline-flex items-center gap-1">Unrealized value <SortIcon sortDir={mgrSort.col === 'potential' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('potential')} /></span></DataTableHead>
                    <DataTableHead numeric style={{ width: '18%', cursor: 'pointer' }} onClick={() => toggleMgrSort('gap')}><span className="inline-flex items-center gap-1">Transformation gap <SortIcon sortDir={mgrSort.col === 'gap' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('gap')} /></span></DataTableHead>
                    {showHrbpCollection && <DataCollectionHead />}
                    {hrbpUpskillingActive && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '20%' }}>Upskilling status</DataTableHead>}
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {(() => {
                    const sortedDirs = [...directors].sort((a, b) => {
                      // Pin in-scope directors to top when collection is active or complete
                      if (showHrbpCollection || hrbpCollectionComplete) {
                        const aIn = hrbpDirInScope(a.name) ? 1 : 0
                        const bIn = hrbpDirInScope(b.name) ? 1 : 0
                        if (aIn !== bIn) return bIn - aIn
                      }
                      const mul = mgrSort.dir === 'asc' ? 1 : -1
                      switch (mgrSort.col) {
                        case 'name': return mul * a.name.localeCompare(b.name)
                        case 'readiness': return mul * (a.readiness - b.readiness)
                        case 'potential': return mul * (Math.round(d.unrealizedValue * a.employees / Math.max(1, d.employees)) - Math.round(d.unrealizedValue * b.employees / Math.max(1, d.employees)))
                        case 'gap': return mul * ((a.employees - a.readyCount) - (b.employees - b.readyCount))
                        default: return 0
                      }
                    })
                    const dirScores = sortedDirs.map(dir => ({
                      key: dir.name,
                      score: (d.aiPotential - dir.readiness) * ((dir.employees - dir.readyCount) / Math.max(1, dir.employees)),
                    }))
                    const dirScoresSorted = [...dirScores].sort((a, b) => b.score - a.score)
                    const dirPriorityCount = Math.max(1, Math.round(dirScoresSorted.length * 0.3))
                    const dirPrioritySet = new Set(dirScoresSorted.slice(0, dirPriorityCount).map(r => r.key))
                    return sortedDirs.map((dir) => {
                      const notReady = dir.employees - dir.readyCount
                      // Deterministic per-director response rate (varies around HRBP dept rate)
                      const dirResponseRate = hrbpCollecting && !hrbpJustLaunched ? Math.max(5, Math.min(95, hrbpResponseRate + ((dir.name.length * 7) % 30) - 15)) : 0
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
                          <DataTableCell className="font-semibold" style={(showHrbpCollection || hrbpCollectionComplete) && hrbpDirInScope(dir.name) ? { borderLeft: '3px solid #3b5bdb', paddingLeft: 17 } : { borderLeft: '3px solid transparent', paddingLeft: 17 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span className="text-[#3b5bdb] hover:underline">{dir.name}</span>
                                {dirPrioritySet.has(dir.name) && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>
                                    Priority
                                  </span>
                                )}
                              </div>
                              <div className="text-[#94a3b8] text-[11px] font-normal">{dir.title} · {dir.teamManagers} teams</div>
                            </div>
                          </DataTableCell>
                          <DataTableCell metric>
                            <div>
                              {hrbpCollectionComplete && deptTrendDelta !== 0 && hrbpDirInScope(dir.name) ? (
                                <div className="wfr-dash__readiness-with-trend">
                                  <DeptTableSoloBar variant="readiness" pct={dir.readiness} />
                                  <button type="button" className={`wfr-dash__trend-badge ${deptTrendDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setHrbpTrendSheetDir({ manager: dir.name, mgrIndex: dir.firstMgrIdx, dept: d }) }} title="View readiness trend details">
                                    <span className="wfr-dash__trend-badge-text">{deptTrendDelta >= 0 ? '↑' : '↓'}{Math.abs(deptTrendDelta)}pt</span>
                                    <span className="material-symbols-outlined wfr-dash__trend-badge-icon">info</span>
                                  </button>
                                </div>
                              ) : <DeptTableSoloBar variant="readiness" pct={dir.readiness} />}
                              {hrbpCollectionComplete && hrbpDirInScope(dir.name) && (
                                <div style={{ fontSize: 10, color: '#15803d', marginTop: 7, display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 11, verticalAlign: -1 }}>verified</span>
                                  Updated from data collection
                                </div>
                              )}
                            </div>
                          </DataTableCell>
                          <DataTableCell align="right"><span className="wfr-type-h6 tabular-nums">{formatDollar(Math.round(d.unrealizedValue * dir.employees / Math.max(1, d.employees)))}</span></DataTableCell>
                          <DataTableCell align="right">
                            <div className="tabular-nums" style={{ textAlign: 'right' }}>
                              <span className="wfr-type-h6">{notReady.toLocaleString()} ({dir.employees > 0 ? Math.round((notReady / dir.employees) * 100) : 0}%)</span>
                              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {dir.employees.toLocaleString()}</div>
                            </div>
                          </DataTableCell>
                          {showHrbpCollection && (
                            hrbpDelegatedPending
                              ? <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}><HrbpStatusPill state={1} delegated /><span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>Sent Apr 5, 2026</span></div></DataTableCell>
                              : <DataCollectionProgressCell rate={hrbpDirInScope(dir.name) ? dirResponseRate : 0} inScope={hrbpDirInScope(dir.name)} />
                          )}
                          {hrbpUpskillingActive && (
                            hrbpDirInScope(dir.name) ? (() => {
                              const nh2 = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
                              const dirPlanPct = hrbpPlansComplete ? 100 : 0
                              return <UpskillingKpiCell total={dir.employees} pct={dirPlanPct} plansComplete={hrbpPlansComplete} nameHash={nh2(dir.name)} />
                            })() : <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><span style={{ color: '#94a3b8' }}>—</span></DataTableCell>
                          )}
                        </DataTableRow>
                      )
                    })
                  })()}
                </DataTableBody>
              </DataTable>
            </PersonDetailLayout>
            {hrbpUpskillingDialogOpen && (() => {
              // Only directors who participated in data collection are eligible for upskilling
              const eligibleDirs = directors.filter(dir => hrbpDirInScope(dir.name))
              // Priority is based on ALL directors (same as table), not just eligible subset
              const allDirScores = directors.map(dir => ({
                dir,
                score: (d.aiPotential - dir.readiness) * ((dir.employees - dir.readyCount) / Math.max(1, dir.employees)),
              })).sort((a, b) => b.score - a.score)
              const priorityCount = Math.max(1, Math.round(allDirScores.length * 0.3))
              const priorityNames = new Set(allDirScores.slice(0, priorityCount).map(r => r.dir.name))
              const sortedDirs = eligibleDirs.sort((a, b) => {
                const scoreA = (d.aiPotential - a.readiness) * ((a.employees - a.readyCount) / Math.max(1, a.employees))
                const scoreB = (d.aiPotential - b.readiness) * ((b.employees - b.readyCount) / Math.max(1, b.employees))
                return scoreB - scoreA
              })
              const selectedCount = hrbpUpskillingSelectedDirs.size
              const totalGapSelected = sortedDirs
                .filter(dir => hrbpUpskillingSelectedDirs.has(dir.name))
                .reduce((s, dir) => s + (dir.employees - dir.readyCount), 0)
              return createPortal(
                <>
                  <div className="wfr-focus-launch__overlay" onClick={() => setHrbpUpskillingDialogOpen(false)} />
                  <div className="wfr-focus-launch__content" style={{ width: 'min(520px, calc(100vw - 32px))' }}>
                    <div className="wfr-focus-launch__header">
                      <div className="wfr-focus-launch__header-top">
                        <h2 className="wfr-focus-launch__dialog-title">Start upskilling</h2>
                        <button type="button" className="wfr-focus-launch__close" onClick={() => setHrbpUpskillingDialogOpen(false)}>
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    </div>
                    <div className="wfr-focus-launch__body">
                      <h3 className="wfr-focus-launch__title">Which client manager teams should start upskilling?</h3>
                      <p className="wfr-focus-launch__sub">
                        Only teams that completed data collection are eligible. Priority teams have the highest gap-to-potential ratio.
                      </p>
                      <div className="wfr-focus-launch__dept-list-header" style={{ marginTop: 16 }}>
                        <span className="wfr-focus-launch__dept-count" style={{ paddingLeft: 4 }}>
                          {selectedCount} of {sortedDirs.length} selected · {totalGapSelected.toLocaleString()} employees to upskill
                        </span>
                        <button type="button" className="wfr-focus-launch__select-all"
                          onClick={() => {
                            const allSelected = selectedCount === sortedDirs.length
                            setHrbpUpskillingSelectedDirs(allSelected ? new Set() : new Set(sortedDirs.map(dir => dir.name)))
                          }}>
                          {selectedCount === sortedDirs.length ? 'Deselect all' : 'Select all'}
                        </button>
                      </div>
                      <div className="wfr-focus-launch__dept-list">
                        {sortedDirs.map(dir => {
                          const checked = hrbpUpskillingSelectedDirs.has(dir.name)
                          const gap = dir.employees - dir.readyCount
                          const isPriority = priorityNames.has(dir.name)
                          return (
                            <button
                              key={dir.name}
                              type="button"
                              className={`wfr-focus-launch__dept-row ${checked ? 'wfr-focus-launch__dept-row--on' : ''}`}
                              onClick={() => setHrbpUpskillingSelectedDirs(prev => {
                                const next = new Set(prev)
                                if (next.has(dir.name)) next.delete(dir.name); else next.add(dir.name)
                                return next
                              })}
                            >
                              <span className="wfr-focus-launch__check">{checked ? '✓' : ''}</span>
                              <div className="wfr-focus-launch__dept-info">
                                <div className="wfr-focus-launch__dept-name-row">
                                  <span className="wfr-focus-launch__dept-name" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    {dir.name}
                                    {isPriority && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>Priority</span>
                                    )}
                                  </span>
                                </div>
                                <span className="wfr-focus-launch__dept-detail">
                                  {dir.title} · {dir.employees.toLocaleString()} employees · {gap.toLocaleString()} to upskill
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                      {directors.length > sortedDirs.length && (
                        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10, paddingLeft: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 12, verticalAlign: -2, marginRight: 3 }}>info</span>
                          {directors.length - sortedDirs.length} team{directors.length - sortedDirs.length !== 1 ? 's' : ''} not shown — did not participate in data collection.
                        </p>
                      )}
                    </div>
                    <div className="wfr-focus-launch__footer">
                      <Button variant="outline" onClick={() => setHrbpUpskillingDialogOpen(false)}>Cancel</Button>
                      <Button
                        variant="primary"
                        disabled={selectedCount === 0}
                        onClick={() => {
                          setHrbpUpskillingDialogOpen(false)
                          startUpskilling({
                            assignOwner: 'hrbp',
                            departmentNames: [d.name],
                            scopeLabel: hrbpName ?? d.name,
                            delegated: false,
                            totalEmployees: totalGapSelected,
                          })
                        }}
                      >
                        Start upskilling&nbsp;→
                      </Button>
                    </div>
                  </div>
                </>,
                document.body,
              )
            })()}
            {isHrbp && hrbpDelegatedPending && (
              <FocusFirstLaunchDialog
                open={focusLaunchOpen}
                onOpenChange={setFocusLaunchOpen}
                hrbpMode
                defaultScopeDepartmentName={d.name}
                hrbpDirectors={directors.map(dir => ({
                  name: dir.name,
                  title: dir.title,
                  employees: dir.employees,
                  teamManagers: dir.teamManagers,
                  readiness: dir.readiness,
                  readyCount: dir.readyCount,
                  aiPotential: d.aiPotential,
                }))}
                onHrbpLaunch={(channelsLabel, selectedDirectors) => {
                  if (personaHrbpNames?.length) {
                    for (const name of personaHrbpNames) {
                      advanceHrbpToCollection(name, channelsLabel, selectedDirectors)
                    }
                  }
                  setFocusLaunchOpen(false)
                }}
              />
            )}
            </>
          )
        })()}
        {view === 'director' && directorData && (() => {
          const d = departments.find(x => x.name === directorData.deptName)
          if (!d) return null
          const allMgrs = deptManagerTeams(d.name, d.employees)
          const teamMgrs = allMgrs.slice(directorData.mgrIdxStart, directorData.mgrIdxStart + directorData.mgrCount)
          const dirHeadcount = teamMgrs.reduce((s, m) => s + m.employees, 0)
          const dirEffState = isHrbp && wfrState.hrbpStates && personaHrbpNames?.length
            ? getPersonaEffectiveState(wfrState, personaHrbpNames)
            : wfrState.state
          const { collectionComplete: dirCollComplete, hrbpPlansCreated: dirPlansComplete } = deriveWfrFlags(dirEffState)
          // Gate collection/upskilling display on whether this director participated in data collection
          const dirSelectedDirs = wfrState.hrbpStates?.[directorData.parentHrbp]?.selectedDirectors
          const dirInScope = !dirSelectedDirs || dirSelectedDirs.includes(directorData.name)
          const effDirCollComplete = dirCollComplete && dirInScope
          const effDirPlansComplete = dirPlansComplete && dirInScope
          const dirTrend = deptReadinessTrend(d.name)
          const dirMeasuredReadiness = effDirCollComplete ? d.aiReadiness + dirTrend.delta : d.aiReadiness

          // Calibrate per team manager
          const nh = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
          const trendDelta = effDirCollComplete ? dirTrend.delta : 0
          const boostBase = effDirPlansComplete ? (isHrbp ? 10 : 8) : 0
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

          const dirBadge = effDirCollComplete
            ? <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#15803d', padding: '1px 7px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>
            : <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>
          return (
            <PersonDetailLayout
              breadcrumb={
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink onClick={() => { setView(singleDeptHrbp ? 'hrbp' : 'board'); if (!singleDeptHrbp) setHrbpName(null); setDirectorData(null) }}>Overview</BreadcrumbLink></BreadcrumbItem>
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
                description: effDirCollComplete ? `${dirReadyCount.toLocaleString()} AI-ready of ${dirHeadcount.toLocaleString()}` : `Estimated: ${dirReadyCount.toLocaleString()} of ${dirHeadcount.toLocaleString()} may be AI-ready`,
                hint: effDirPlansComplete ? 'After upskilling plans completed.' : effDirCollComplete ? 'Calibrated from data collection.' : 'Estimated from skill profiles.',
                badge: dirBadge,
                onLearnMore: () => setDashOpenMetric('readiness'),
              }}
              potential={{ value: formatDollar(Math.round(d.unrealizedValue * dirHeadcount / Math.max(1, d.employees))), description: 'BLS median wages \u00d7 automation probability', hint: `Unrealized value for ${directorData.name}'s team`, onLearnMore: () => setDashOpenMetric('potential') }}
              gap={{ value: `${dirGap.toLocaleString()} not ready`, description: `out of ${dirHeadcount.toLocaleString()} employees`, hint: dirMeasuredReadiness >= 50 ? `${dirMeasuredReadiness}% adoption meets the 50% threshold.` : `${dirMeasuredReadiness}% adoption is below the 50% threshold.`, onLearnMore: () => setDashOpenMetric('gap') }}
              managerTable={{
                title: 'Manager summary',
                hint: d.name,
                hideTitle: true,
                children: (
                  <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                    <DataTableHeader>
                      <DataTableRow>
                        <DataTableHead style={{ width: '34%' }}>Manager</DataTableHead>
                        <DataTableHead metric style={{ width: '14%' }}>AI adoption</DataTableHead>
                        <DataTableHead numeric style={{ width: '34%' }}>Transformation gap</DataTableHead>
                        {effDirCollComplete && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '18%' }}>Upskilling status</DataTableHead>}
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
                        <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={dirMeasuredReadiness} /></DataTableCell>
                        <DataTableCell align="right">
                          <span style={{ color: dirMeasuredReadiness >= 50 ? '#15803d' : '#dc2626', fontWeight: 600 }}>{dirMeasuredReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}</span>
                        </DataTableCell>
                        {effDirCollComplete && (() => {
                          const dirPlanPct = effDirPlansComplete ? 100 : 0
                          return (
                            <DataTableCell className="bg-[#fafbfc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px 3px 6px', borderRadius: 100, background: '#eff3ff', border: '1px solid #c5d3f8', color: '#3b5bdb', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.4 }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>description</span>
                                  Dev plan
                                </button>
                                {dirPlanPct === 0 ? (
                                  <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                                ) : (() => {
                                  const dStatus = dirPlanPct > 85 ? 'Completed' : dirPlanPct > 20 ? 'In progress' : 'Not started'
                                  const bColor = dStatus === 'Completed' ? '#22c55e' : dStatus === 'In progress' ? '#818cf8' : '#e2e8f0'
                                  const tColor = dStatus === 'Completed' ? '#15803d' : dStatus === 'In progress' ? '#6366f1' : '#94a3b8'
                                  return (
                                    <div className="wfr-dash__plan-progress" style={{ flex: '1 1 0', minWidth: 60 }}>
                                      <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                                        <div className="wfr-dash__plan-progress-fill" style={{ width: `${dirPlanPct}%`, background: bColor }} />
                                      </div>
                                      <span className="wfr-dash__plan-progress-label" style={{ color: tColor }}>{dirPlanPct}%</span>
                                    </div>
                                  )
                                })()}
                              </div>
                            </DataTableCell>
                          )
                        })()}
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
                  <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                    <DataTableHeader>
                      <DataTableRow>
                        <DataTableHead style={{ width: '34%', cursor: 'pointer' }} onClick={() => toggleMgrSort('name')}><span className="inline-flex items-center gap-1">Manager <SortIcon sortDir={mgrSort.col === 'name' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('name')} /></span></DataTableHead>
                        <DataTableHead metric style={{ width: '14%', cursor: 'pointer' }} onClick={() => toggleMgrSort('readiness')}><span className="inline-flex items-center gap-1">Team AI adoption <SortIcon sortDir={mgrSort.col === 'readiness' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('readiness')} /></span></DataTableHead>
                        <DataTableHead numeric style={{ width: '16%', cursor: 'pointer' }} onClick={() => toggleMgrSort('potential')}><span className="inline-flex items-center gap-1">Unrealized value <SortIcon sortDir={mgrSort.col === 'potential' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('potential')} /></span></DataTableHead>
                        <DataTableHead numeric style={{ width: '18%', cursor: 'pointer' }} onClick={() => toggleMgrSort('gap')}><span className="inline-flex items-center gap-1">Transformation gap <SortIcon sortDir={mgrSort.col === 'gap' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('gap')} /></span></DataTableHead>
                        {effDirCollComplete && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '20%' }}>Upskilling status</DataTableHead>}
                      </DataTableRow>
                    </DataTableHeader>
                    <DataTableBody>
                      {[...seniorMgrs].sort((a, b) => { const mul = mgrSort.dir === 'asc' ? 1 : -1; switch (mgrSort.col) { case 'name': return mul * a.name.localeCompare(b.name); case 'readiness': return mul * (a.readiness - b.readiness); case 'potential': return mul * (a.employees - b.employees); case 'gap': return mul * ((a.employees - a.readyCount) - (b.employees - b.readyCount)); default: return 0 } }).map(sr => {
                        const notReady = sr.employees - sr.readyCount
                        const srPlanPct = effDirPlansComplete ? 100 : 0
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
                            <DataTableCell metric>
                              <div>
                                {effDirCollComplete && trendDelta !== 0 ? (
                                  <div className="wfr-dash__readiness-with-trend">
                                    <DeptTableSoloBar variant="readiness" pct={sr.readiness} />
                                    <span className={`wfr-dash__trend-badge ${trendDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`}>
                                      <span className="wfr-dash__trend-badge-text">{trendDelta >= 0 ? '↑' : '↓'}{Math.abs(trendDelta)}pt</span>
                                    </span>
                                  </div>
                                ) : <DeptTableSoloBar variant="readiness" pct={sr.readiness} />}
                              </div>
                            </DataTableCell>
                            <DataTableCell align="right"><span className="wfr-type-h6 tabular-nums">{formatDollar(Math.round(d.unrealizedValue * sr.employees / Math.max(1, d.employees)))}</span></DataTableCell>
                            <DataTableCell align="right">
                              <div className="tabular-nums" style={{ textAlign: 'right' }}>
                                <span className="wfr-type-h6">{notReady.toLocaleString()} ({sr.employees > 0 ? Math.round((notReady / sr.employees) * 100) : 0}%)</span>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {sr.employees.toLocaleString()}</div>
                              </div>
                            </DataTableCell>
                            {effDirCollComplete && <UpskillingKpiCell total={sr.employees} pct={srPlanPct} plansComplete={effDirPlansComplete} nameHash={nh(sr.name)} />}
                          </DataTableRow>
                        )
                      })}
                    </DataTableBody>
                  </DataTable>
                )
              })() : (
              <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead style={{ width: '34%', cursor: 'pointer' }} onClick={() => toggleMgrSort('name')}><span className="inline-flex items-center gap-1">Manager <SortIcon sortDir={mgrSort.col === 'name' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('name')} /></span></DataTableHead>
                    <DataTableHead metric style={{ width: '14%', cursor: 'pointer' }} onClick={() => toggleMgrSort('readiness')}><span className="inline-flex items-center gap-1">Team AI adoption <SortIcon sortDir={mgrSort.col === 'readiness' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('readiness')} /></span></DataTableHead>
                    <DataTableHead numeric style={{ width: '16%', cursor: 'pointer' }} onClick={() => toggleMgrSort('potential')}><span className="inline-flex items-center gap-1">Unrealized value <SortIcon sortDir={mgrSort.col === 'potential' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('potential')} /></span></DataTableHead>
                    <DataTableHead numeric style={{ width: '18%', cursor: 'pointer' }} onClick={() => toggleMgrSort('gap')}><span className="inline-flex items-center gap-1">Transformation gap <SortIcon sortDir={mgrSort.col === 'gap' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('gap')} /></span></DataTableHead>
                    {effDirCollComplete && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '20%' }}>Upskilling status</DataTableHead>}
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {[...teamMgrs.map((mgr, i) => ({ mgr, i }))].sort((a, b) => { const enA = mgrEnriched[directorData.mgrIdxStart + a.i]; const enB = mgrEnriched[directorData.mgrIdxStart + b.i]; if (!enA || !enB) return 0; const mul = mgrSort.dir === 'asc' ? 1 : -1; switch (mgrSort.col) { case 'name': return mul * a.mgr.manager.localeCompare(b.mgr.manager); case 'readiness': return mul * (enA.readiness - enB.readiness); case 'potential': return mul * (a.mgr.employees - b.mgr.employees); case 'gap': return mul * ((a.mgr.employees - enA.readyCount) - (b.mgr.employees - enB.readyCount)); default: return 0 } }).map(({ mgr, i }) => {
                    const globalIdx = directorData.mgrIdxStart + i
                    const en = mgrEnriched[globalIdx]
                    if (!en) return null
                    const notReady = mgr.employees - en.readyCount
                    const mgrPlanPct = effDirPlansComplete ? 100 : 0
                    return (
                      <DataTableRow
                        key={`${mgr.manager}-${globalIdx}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/workforce/manager/${encodeURIComponent(mgr.manager)}?dept=${encodeURIComponent(d.name)}&mgrIdx=${globalIdx}&director=${encodeURIComponent(directorData.name)}&parentHrbp=${encodeURIComponent(directorData.parentHrbp)}`)}
                      >
                        <DataTableCell className="font-semibold">
                          <div>
                            <div className="text-[#3b5bdb] hover:underline">{mgr.manager}</div>
                            <div className="text-[#94a3b8] text-[11px] font-normal">{mgr.title}</div>
                          </div>
                        </DataTableCell>
                        <DataTableCell metric>
                          <div>
                            {effDirCollComplete && trendDelta !== 0 ? (
                              <div className="wfr-dash__readiness-with-trend">
                                <DeptTableSoloBar variant="readiness" pct={en.readiness} />
                                <span className={`wfr-dash__trend-badge ${trendDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`}>
                                  <span className="wfr-dash__trend-badge-text">{trendDelta >= 0 ? '↑' : '↓'}{Math.abs(trendDelta)}pt</span>
                                </span>
                              </div>
                            ) : <DeptTableSoloBar variant="readiness" pct={en.readiness} />}
                          </div>
                        </DataTableCell>
                        <DataTableCell align="right"><span className="wfr-type-h6 tabular-nums">{formatDollar(Math.round(d.unrealizedValue * mgr.employees / Math.max(1, d.employees)))}</span></DataTableCell>
                        <DataTableCell align="right">
                          <div className="tabular-nums" style={{ textAlign: 'right' }}>
                            <span className="wfr-type-h6">{notReady.toLocaleString()} ({mgr.employees > 0 ? Math.round((notReady / mgr.employees) * 100) : 0}%)</span>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {mgr.employees.toLocaleString()}</div>
                          </div>
                        </DataTableCell>
                        {effDirCollComplete && <UpskillingKpiCell total={mgr.employees} pct={mgrPlanPct} plansComplete={effDirPlansComplete} nameHash={nh(mgr.manager)} />}
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
          const srEffState = isHrbp && wfrState.hrbpStates && personaHrbpNames?.length
            ? getPersonaEffectiveState(wfrState, personaHrbpNames)
            : wfrState.state
          const { collectionComplete: srCollComplete, hrbpPlansCreated: srPlansComplete } = deriveWfrFlags(srEffState)
          // Gate on parent director's scope
          const srParentDirSelectedDirs = wfrState.hrbpStates?.[seniorMgrData.parentDirector.parentHrbp]?.selectedDirectors
          const srDirInScope = !srParentDirSelectedDirs || srParentDirSelectedDirs.includes(seniorMgrData.parentDirector.name)
          const effSrCollComplete = srCollComplete && srDirInScope
          const effSrPlansComplete = srPlansComplete && srDirInScope
          const srTrend = deptReadinessTrend(d.name)
          const srMeasuredReadiness = effSrCollComplete ? d.aiReadiness + srTrend.delta : d.aiReadiness
          const nh2 = (s: string) => { let hh = 0; for (let i = 0; i < s.length; i++) hh = ((hh << 5) - hh + s.charCodeAt(i)) | 0; return Math.abs(hh) }
          const tDelta = effSrCollComplete ? srTrend.delta : 0
          const bBase = effSrPlansComplete ? (isHrbp ? 10 : 8) : 0
          const sRoles = getRolesForDept(d.name)
          const sEmpsRaw = getEmployeesForRole({ title: d.name, employees: d.employees, aiReadiness: d.aiReadiness, aiPotential: d.aiPotential } as RoleRowType)
          const sEmps = sEmpsRaw.map((e, i) => ({ ...e, title: sRoles.length > 0 ? sRoles[i % sRoles.length].title : undefined }))
          let sIdx = 0
          const srMgrEnriched = allMgrs.map((mgr) => {
            const emps = sEmps.slice(sIdx, Math.min(sIdx + mgr.employees, sEmps.length))
            sIdx += mgr.employees
            const cal = emps.map(e => {
              const eb = effSrPlansComplete ? Math.round(bBase * (0.5 + (nh2(e.name) % 10) / 10)) : 0
              return { ...e, displayReadiness: Math.max(0, Math.min(100, e.readinessPct + tDelta + eb)) }
            })
            const readiness = cal.length > 0 ? Math.round(cal.reduce((s, e) => s + e.displayReadiness, 0) / cal.length) : d.aiReadiness
            const ready = cal.filter(e => e.displayReadiness >= 50).length
            return { mgr, readiness, readyCount: ready }
          })
          const srReadyCount = teamMgrs.reduce((s, _, i) => s + (srMgrEnriched[seniorMgrData.mgrIdxStart + i]?.readyCount ?? 0), 0)
          const srGap = srHeadcount - srReadyCount
          const srBadge = effSrCollComplete
            ? <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#15803d', padding: '1px 7px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>
            : <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>
          return (
            <PersonDetailLayout
              breadcrumb={
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink onClick={() => { setView(singleDeptHrbp ? 'hrbp' : 'board'); if (!singleDeptHrbp) setHrbpName(null); setDirectorData(null); setSeniorMgrData(null) }}>Overview</BreadcrumbLink></BreadcrumbItem>
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
                description: effSrCollComplete ? `${srReadyCount.toLocaleString()} AI-ready of ${srHeadcount.toLocaleString()}` : `Estimated: ${srReadyCount.toLocaleString()} of ${srHeadcount.toLocaleString()} may be AI-ready`,
                hint: effSrPlansComplete ? 'After upskilling plans completed.' : effSrCollComplete ? 'Calibrated from data collection.' : 'Estimated from skill profiles.',
                badge: srBadge,
                onLearnMore: () => setDashOpenMetric('readiness'),
              }}
              potential={{ value: formatDollar(Math.round(d.unrealizedValue * srHeadcount / Math.max(1, d.employees))), description: 'BLS median wages \u00d7 automation probability', hint: `Unrealized value for ${seniorMgrData.name}'s team`, onLearnMore: () => setDashOpenMetric('potential') }}
              gap={{ value: `${srGap.toLocaleString()} not ready`, description: `out of ${srHeadcount.toLocaleString()} employees`, hint: srMeasuredReadiness >= 50 ? `${srMeasuredReadiness}% adoption meets the 50% threshold.` : `${srMeasuredReadiness}% adoption is below the 50% threshold.`, onLearnMore: () => setDashOpenMetric('gap') }}
              managerTable={{
                title: 'Manager summary',
                hint: d.name,
                hideTitle: true,
                children: (
                  <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                    <DataTableHeader>
                      <DataTableRow>
                        <DataTableHead style={{ width: '34%' }}>Manager</DataTableHead>
                        <DataTableHead metric style={{ width: '14%' }}>AI adoption</DataTableHead>
                        <DataTableHead numeric style={{ width: '34%' }}>Transformation gap</DataTableHead>
                        {effSrCollComplete && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '18%' }}>Upskilling status</DataTableHead>}
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
                        <DataTableCell metric>
                          <DeptTableSoloBar variant="readiness" pct={srMeasuredReadiness} />
                        </DataTableCell>
                        <DataTableCell align="right">
                          <span style={{ color: srMeasuredReadiness >= 50 ? '#15803d' : '#dc2626', fontWeight: 600 }}>{srMeasuredReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}</span>
                        </DataTableCell>
                        {effSrCollComplete && (() => {
                          const srPlanPct = effSrPlansComplete ? 100 : 0
                          const srAssigned = srPlanPct > 0
                          return (
                            <DataTableCell className="bg-[#fafbfc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px 3px 6px', borderRadius: 100, background: '#eff3ff', border: '1px solid #c5d3f8', color: '#3b5bdb', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.4 }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>description</span>
                                  Dev plan
                                </button>
                                {!srAssigned ? (
                                  <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                                ) : (() => {
                                  const sStatus = srPlanPct > 85 ? 'Completed' : srPlanPct > 20 ? 'In progress' : 'Not started'
                                  const bColor = sStatus === 'Completed' ? '#22c55e' : sStatus === 'In progress' ? '#818cf8' : '#e2e8f0'
                                  const tColor = sStatus === 'Completed' ? '#15803d' : sStatus === 'In progress' ? '#6366f1' : '#94a3b8'
                                  return (
                                    <div className="wfr-dash__plan-progress" style={{ flex: '1 1 0', minWidth: 60 }}>
                                      <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                                        <div className="wfr-dash__plan-progress-fill" style={{ width: `${srPlanPct}%`, background: bColor }} />
                                      </div>
                                      <span className="wfr-dash__plan-progress-label" style={{ color: tColor }}>{srPlanPct}%</span>
                                    </div>
                                  )
                                })()}
                              </div>
                            </DataTableCell>
                          )
                        })()}
                      </DataTableRow>
                    </DataTableBody>
                  </DataTable>
                ),
              }}
              tableTitle="Team managers"
              tableHint={`${teamMgrs.length} manager${teamMgrs.length !== 1 ? 's' : ''} · click to view team`}
            >
              <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead style={{ width: '34%', cursor: 'pointer' }} onClick={() => toggleMgrSort('name')}><span className="inline-flex items-center gap-1">Manager <SortIcon sortDir={mgrSort.col === 'name' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('name')} /></span></DataTableHead>
                    <DataTableHead metric style={{ width: '14%', cursor: 'pointer' }} onClick={() => toggleMgrSort('readiness')}><span className="inline-flex items-center gap-1">Team AI adoption <SortIcon sortDir={mgrSort.col === 'readiness' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('readiness')} /></span></DataTableHead>
                    <DataTableHead numeric style={{ width: '16%', cursor: 'pointer' }} onClick={() => toggleMgrSort('potential')}><span className="inline-flex items-center gap-1">Unrealized value <SortIcon sortDir={mgrSort.col === 'potential' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('potential')} /></span></DataTableHead>
                    <DataTableHead numeric style={{ width: '18%', cursor: 'pointer' }} onClick={() => toggleMgrSort('gap')}><span className="inline-flex items-center gap-1">Transformation gap <SortIcon sortDir={mgrSort.col === 'gap' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('gap')} /></span></DataTableHead>
                    {effSrCollComplete && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '20%' }}>Upskilling status</DataTableHead>}
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {[...teamMgrs.map((mgr, i) => ({ mgr, i }))].sort((a, b) => { const enA = srMgrEnriched[seniorMgrData.mgrIdxStart + a.i]; const enB = srMgrEnriched[seniorMgrData.mgrIdxStart + b.i]; if (!enA || !enB) return 0; const mul = mgrSort.dir === 'asc' ? 1 : -1; switch (mgrSort.col) { case 'name': return mul * a.mgr.manager.localeCompare(b.mgr.manager); case 'readiness': return mul * (enA.readiness - enB.readiness); case 'potential': return mul * (a.mgr.employees - b.mgr.employees); case 'gap': return mul * ((a.mgr.employees - enA.readyCount) - (b.mgr.employees - enB.readyCount)); default: return 0 } }).map(({ mgr, i }) => {
                    const globalIdx = seniorMgrData.mgrIdxStart + i
                    const en = srMgrEnriched[globalIdx]
                    if (!en) return null
                    const notReady = mgr.employees - en.readyCount
                    const mgrPlanPct = effSrPlansComplete ? 100 : 0
                    return (
                      <DataTableRow
                        key={`${mgr.manager}-${globalIdx}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/workforce/manager/${encodeURIComponent(mgr.manager)}?dept=${encodeURIComponent(d.name)}&mgrIdx=${globalIdx}&director=${encodeURIComponent(seniorMgrData.parentDirector.name)}&parentHrbp=${encodeURIComponent(seniorMgrData.parentDirector.parentHrbp)}&seniorMgr=${encodeURIComponent(seniorMgrData.name)}&srStart=${seniorMgrData.mgrIdxStart - seniorMgrData.parentDirector.mgrIdxStart}`)}
                      >
                        <DataTableCell className="font-semibold">
                          <div>
                            <div className="text-[#3b5bdb] hover:underline">{mgr.manager}</div>
                            <div className="text-[#94a3b8] text-[11px] font-normal">{mgr.title}</div>
                          </div>
                        </DataTableCell>
                        <DataTableCell metric>
                          <div>
                            {effSrCollComplete && tDelta !== 0 ? (
                              <div className="wfr-dash__readiness-with-trend">
                                <DeptTableSoloBar variant="readiness" pct={en.readiness} />
                                <span className={`wfr-dash__trend-badge ${tDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`}>
                                  <span className="wfr-dash__trend-badge-text">{tDelta >= 0 ? '↑' : '↓'}{Math.abs(tDelta)}pt</span>
                                </span>
                              </div>
                            ) : <DeptTableSoloBar variant="readiness" pct={en.readiness} />}
                          </div>
                        </DataTableCell>
                        <DataTableCell align="right"><span className="wfr-type-h6 tabular-nums">{formatDollar(Math.round(d.unrealizedValue * mgr.employees / Math.max(1, d.employees)))}</span></DataTableCell>
                        <DataTableCell align="right">
                          <div className="tabular-nums" style={{ textAlign: 'right' }}>
                            <span className="wfr-type-h6">{notReady.toLocaleString()} ({mgr.employees > 0 ? Math.round((notReady / mgr.employees) * 100) : 0}%)</span>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {mgr.employees.toLocaleString()}</div>
                          </div>
                        </DataTableCell>
                        {effSrCollComplete && <UpskillingKpiCell total={mgr.employees} pct={mgrPlanPct} plansComplete={effSrPlansComplete} nameHash={nh2(mgr.manager)} />}
                      </DataTableRow>
                    )
                  })}
                </DataTableBody>
              </DataTable>
            </PersonDetailLayout>
          )
        })()}
      </div>

      {/* Readiness trend sheet for HRBP client managers table */}
      <ReadinessTrendSheet
        open={hrbpTrendSheetDir != null}
        onClose={() => setHrbpTrendSheetDir(null)}
        dept={hrbpTrendSheetDir?.dept ?? null}
        managerContext={hrbpTrendSheetDir ? { manager: hrbpTrendSheetDir.manager, mgrIndex: hrbpTrendSheetDir.mgrIndex } : null}
        collectionComplete
      />

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
