import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Badge, Button,
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
  WFR_FIRST_NAMES,
  type Dept,
  type RoleRowType,
} from '../../data/wfrOrgData'
// import { CollectionProgressPanel } from './CollectionProgressPanel'
import { deptReadinessTrend, deptManagerTeams, DEMO_MANAGERS, demoManagerName } from './collectionHelpers'
import './CollectionProgressPanel.css'
import { FocusFirstModule, WfrHeroCard, WfrCtaBar, WFR_CTA_CONTENT, type WfrDemoState, type WfrPersona, type FocusCollectionLaunchSummary } from './FocusFirstModule'
import { FocusFirstLaunchDialog } from './FocusFirstLaunchDialog'
import { UpskillingLaunchDialog, type UpskillingLaunchSummary } from './UpskillingLaunchDialog'
// FocusCollectionDetailSheet removed — collection progress is now inline in the table panel tabs
import { MetricCard } from './MetricCard'
import { PersonDetailLayout } from './PersonDetailLayout'
import { ReadinessTrendSheet } from './ReadinessTrendSheet'
import { UnrealizedValueSheet, type UnrealizedValueSheetData } from './UnrealizedValueSheet'
import { WorkforceMetricSheet, type WorkforceMetricSheetId } from './WorkforceMetricSheet'
import { DevPlanSheet } from './DevPlanSheet'
import './WorkforceReadinessDashboard.css'
import '../../pages/ManagerDetailPage.css'

/* ─── Avatars ─── */

const AVATAR_PHOTOS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face',
]
const AVATAR_COLORS = ['#1565C0','#00838F','#6A1B9A','#C62828','#2E7D32','#E65100','#4527A0','#AD1457','#0277BD','#558B2F']

function nh(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }

function PersonAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const h = nh(name)
  const parts = name.split(' ')
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  if (h % 5 < 2) {
    return <img src={AVATAR_PHOTOS[h % AVATAR_PHOTOS.length]} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  }
  return <div style={{ width: size, height: size, borderRadius: '50%', background: AVATAR_COLORS[h % AVATAR_COLORS.length], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
}

/* ─── Priority Tooltip ─── */

function PriorityTooltip({ tooltip, children }: { tooltip: string; children: React.ReactNode }) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<{ cx: number; y: number } | null>(null)
  const [left, setLeft] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (anchor && tipRef.current) {
      const w = tipRef.current.offsetWidth
      const clamped = Math.max(8, Math.min(window.innerWidth - w - 8, anchor.cx - w / 2))
      setLeft(clamped)
      setReady(true)
    }
  }, [anchor])

  return (
    <span
      ref={triggerRef}
      style={{ display: 'inline-flex', flexShrink: 0 }}
      onMouseEnter={() => {
        const r = triggerRef.current?.getBoundingClientRect()
        if (r) { setReady(false); setAnchor({ cx: r.left + r.width / 2, y: r.top }) }
      }}
      onMouseLeave={() => { setAnchor(null); setReady(false) }}
    >
      {children}
      {anchor && createPortal(
        <div ref={tipRef} style={{ position: 'fixed', top: anchor.y - 6, left, transform: 'translateY(-100%)', opacity: ready ? 1 : 0, background: '#1e293b', color: '#fff', fontSize: 12, fontWeight: 400, lineHeight: 1.5, borderRadius: 6, padding: '7px 10px', maxWidth: 160, zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', pointerEvents: 'none' }}>
          {tooltip}
          <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1e293b' }} />
        </div>,
        document.body
      )}
    </span>
  )
}

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
  return hs?.delegated === true && String(hs.state) === '1'
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
    dim: 180,
    r: 68,
    sw: 14,
    cy: 124,
    vbY: 40,
    vbH: 88,
    labelGroupY: 130,
    pctDy: -12,
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
        <path d={arc(100)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={sw} strokeLinecap="round" />
        <path
          d={arc(readiness)}
          fill="none"
          stroke="#22c55e"
          strokeWidth={sw}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' }}
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
  potential: 'BLS median wages × weekly hours unlocked × 52 weeks',
  gap: 'People in augmentable roles not yet AI-ready — your upskilling pool',
} as const

export function MetricInfoDialog({ open, onClose, collectionComplete = false }: { open: boolean; onClose: () => void; collectionComplete?: boolean }) {
  if (!open) return null
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: 'min(1060px, calc(100vw - 48px))', maxHeight: 'calc(100vh - 48px)', overflow: 'auto', background: '#ffffff', borderRadius: 16, padding: '40px 44px', color: '#1a212e', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <button type="button" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', textAlign: 'center', margin: '0 0 8px' }}>Understanding your four core metrics</h2>
        <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', margin: '0 0 28px' }}>Four numbers that tell you where your workforce stands — and exactly where to act.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {/* AI Potential card */}
          <div style={{ border: '1.5px solid #bbf7d0', borderRadius: 12, padding: '20px 16px', background: '#f0fdf4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#065f46', background: 'rgba(5,150,105,0.12)', borderRadius: 8, padding: 5 }}>bolt</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#065f46' }}>AI Potential</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.35, margin: '0 0 8px' }}>How much of your work AI is capable of supporting.</h3>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 14px' }}>Scored across every role's tasks using 7 research sources. This is the ceiling — the maximum AI could help with today's technology.</p>
            <div style={{ borderTop: '1px solid rgba(5,150,105,0.15)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>Task scoring</strong> — weighted composite of 7 signals including GenAI analysis and real-world exposure data.</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>Augmentation zone</strong> — tasks scoring 15–75% where humans lead and AI assists.</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>Coverage</strong> — 1,016 O*NET occupations, ~5,000 tasks scored.</span>
              </div>
            </div>
          </div>

          {/* Unrealized Value card */}
          <div style={{ border: '1.5px solid #c7d2fe', borderRadius: 12, padding: '20px 16px', background: '#eef2ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#6366f1', background: 'rgba(99,102,241,0.12)', borderRadius: 8, padding: 5 }}>auto_awesome</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6366f1' }}>Unrealized Value</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.35, margin: '0 0 8px' }}>The annual productivity value waiting to be captured.</h3>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 14px' }}>We score every role's tasks for AI augmentability using 7 research sources, then value the unlockable hours at BLS median wages.</p>
            <div style={{ borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>AI Potential %</strong> — share of role tasks in the augmentation zone, scored across 7 research sources.</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>Hours unlocked</strong> — augmentable task-hours × 60% realization rate (McKinsey 2023).</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>Dollar value</strong> — hours unlocked × BLS median wage × 52 weeks.</span>
              </div>
            </div>
          </div>

          {/* AI Adoption card */}
          <div style={{ border: '1.5px solid #bbf7d0', borderRadius: 12, padding: '20px 16px', background: '#f0fdf4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#15803d', background: 'rgba(34,197,94,0.12)', borderRadius: 8, padding: 5 }}>school</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#15803d' }}>AI Adoption</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.35, margin: '0 0 8px' }}>Of the people AI can help — how many are using it today?</h3>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 14px' }}>Measured against employees in augmentable roles only. Estimated from skill profiles until data collection provides observed adoption rates.</p>
            <div style={{ borderTop: '1px solid rgba(34,197,94,0.15)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>AI-Native</strong> — already using AI/ML tools like ChatGPT, Python, or computer vision daily.</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>AI-Ready</strong> — strong technical foundation that transfers directly to AI workflows.</span>
              </div>
            </div>
            {!collectionComplete && (
              <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: '#fefce8', border: '1px solid #fde68a', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#92400e', marginTop: 1, flexShrink: 0 }}>info</span>
                <div>
                  <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.55, margin: '0 0 6px' }}>
                    <strong>Currently estimated</strong> — start data collection to measure real adoption.
                  </p>
                  <button type="button" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#92400e', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    <span style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>Get the real number</span> <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transformation Gap card */}
          <div style={{ border: '1.5px solid #fecaca', borderRadius: 12, padding: '20px 16px', background: '#fef2f2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#dc2626', background: 'rgba(220,38,38,0.10)', borderRadius: 8, padding: 5 }}>groups</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#dc2626' }}>Transformation Gap</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.35, margin: '0 0 8px' }}>Employees in augmentable roles who aren't yet AI-ready.</h3>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 14px' }}>The gap between AI Potential and AI Adoption — counted as people, not percentages. Each person in the gap gets a role-specific development plan.</p>
            <div style={{ borderTop: '1px solid rgba(220,38,38,0.15)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>Scope</strong> — only employees in augmentable roles are counted, not total headcount.</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>Action</strong> — role-specific dev plans sourced from your learning catalog, mapped to augmentable tasks.</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', marginTop: 6, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>Goal</strong> — drive adoption up and this number down, quarter over quarter.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

type MgrSortCol = 'name' | 'readiness' | 'potential' | 'gap'

/** Shared overview layout: hero section (MetricArc + headline + pill) + 3 metric cards row. */
function WfrOverviewLayout({ aiPotentialPct, aiReadinessPct, totalEmployees, headline, pill, cards, beforeCards, heroCta, hideHero, children }: {
  aiPotentialPct: number
  aiReadinessPct: number
  totalEmployees: number
  headline: React.ReactNode
  subtitle?: React.ReactNode
  pill: React.ReactNode
  cards: { id: 'ai-potential' | 'readiness' | 'potential' | 'gap'; icon: string; label: string; badge?: React.ReactNode; value: React.ReactNode; description: React.ReactNode; hint?: string; tag?: React.ReactNode; explainer?: React.ReactNode; onLearnMore?: () => void }[]
  /** Content rendered between hero and cards (e.g. FocusFirst module) */
  beforeCards?: React.ReactNode
  /** CTA bar rendered inside the hero card's ctaBar slot */
  heroCta?: React.ReactNode
  hideHero?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="wfr-dash" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {!hideHero && (
        <WfrHeroCard
          gauge={<div style={{ marginTop: -15 }}><MetricArc potential={aiPotentialPct} readiness={aiReadinessPct} size="lg" /></div>}
          eyebrow={<>{totalEmployees.toLocaleString()} employees {EM} Q1 2026</>}
          headline={<span className="wfr-dash__headline">{headline}</span>}
          supportingText={pill}
          ctaBar={heroCta}
        />
      )}

      {beforeCards}

      <div className="wfr-dash__cards-row">
        {cards.map((c) => (
          <MetricCard key={c.id} variant={c.id} icon={c.icon} label={c.label} badge={c.badge} value={c.value} explainer={c.explainer} description={c.description} hint={c.hint} tag={c.tag} onLearnMore={c.onLearnMore} />
        ))}
      </div>

      {children}
    </div>
  )
}

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

/** Rolled-up upskilling status cell showing a stacked progress bar. */
export function UpskillingProgressCell({ total, pct, plansComplete, nameHash }: { total: number; pct: number; plansComplete?: boolean; nameHash: number }) {
  const [hovered, setHovered] = useState(false)
  const allComplete = plansComplete && pct >= 100
  const notAssigned = plansComplete ? 0 : Math.round(total * Math.max(0, (100 - pct) / 100))
  const pool = total - notAssigned
  const completeFrac = allComplete ? 1 : Math.min(0.95, (pct / 100) * 0.8 + (nameHash % 12) / 100)
  const completeCount = Math.round(pool * completeFrac)
  const remainder = pool - completeCount
  const inProgressFrac = allComplete ? 0 : 0.65 + (nameHash % 15) / 100
  const inProgressCount = Math.min(remainder, Math.round(remainder * inProgressFrac))
  const assignedCount = Math.max(0, pool - completeCount - inProgressCount)
  const assignedTotal = pool
  const totalBarPct = total > 0 ? (completeCount / total) * 100 : 0
  const barColor = allComplete ? '#22c55e' : '#6366f1'
  const label = allComplete
    ? `${total.toLocaleString()} complete`
    : completeCount > 0
      ? `${completeCount.toLocaleString()} of ${total.toLocaleString()} complete`
      : assignedTotal === 0
        ? `${total.toLocaleString()} unassigned`
        : `${assignedTotal.toLocaleString()} assigned`

  const tooltipRows: { label: string; color: string; count: number }[] = [
    { label: 'Completed', color: '#22c55e', count: completeCount },
    { label: 'In progress', color: '#818cf8', count: inProgressCount },
    { label: 'Assigned', color: '#6366f1', count: assignedCount },
    { label: 'Unassigned', color: '#cbd5e1', count: notAssigned },
  ]

  return (
    <DataTableCell className="bg-[#fafbfc] border-l border-[#e2e8f0]" style={{ verticalAlign: 'middle', padding: '10px 14px' }}>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 5, position: 'relative', cursor: 'default' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', background: '#e2e8f0', minWidth: 80 }}>
          <div style={{ width: `${totalBarPct}%`, height: '100%', background: barColor, borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
        {hovered && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', padding: '10px 14px', minWidth: 160, pointerEvents: 'none' }}>
            {tooltipRows.map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: row.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>{row.label}</span>
                </div>
                <span style={{ fontSize: 11, color: '#0f172a', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{row.count.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 4, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Total</span>
              <span style={{ fontSize: 11, color: '#0f172a', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{total.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </DataTableCell>
  )
}

/** Director/senior-manager summary cell: "Dev plan → Assign" when unassigned, progress bar when in-flight. */
export function DevPlanAssignCell({ planPct, plansComplete }: { planPct: number; plansComplete?: boolean }) {
  return (
    <DataTableCell metric className="!whitespace-normal bg-[#fafbfc] border-l border-[#e2e8f0]">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <button
          type="button"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px 3px 6px', borderRadius: 100, background: '#eff3ff', border: '1px solid #c5d3f8', color: '#3b5bdb', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.4 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>description</span>Dev plan
        </button>
        {planPct === 0 && !plansComplete ? (
          <>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>→</span>
            <button
              type="button"
              style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 6, background: '#3b5bdb', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.4 }}
              onClick={(e) => e.stopPropagation()}
            >Assign</button>
          </>
        ) : (() => {
          const finalPct = plansComplete ? 100 : planPct
          const status = finalPct > 85 ? 'Completed' : finalPct > 20 ? 'In progress' : 'Not started'
          const bColor = status === 'Completed' ? '#22c55e' : status === 'In progress' ? '#818cf8' : '#e2e8f0'
          const tColor = status === 'Completed' ? '#15803d' : status === 'In progress' ? '#6366f1' : '#94a3b8'
          return (
            <div className="wfr-dash__plan-progress" style={{ flex: '1 1 0', minWidth: 60 }}>
              <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                <div className="wfr-dash__plan-progress-fill" style={{ width: `${finalPct}%`, background: bColor }} />
              </div>
              <span className="wfr-dash__plan-progress-label" style={{ color: tColor }}>{finalPct}%</span>
            </div>
          )
        })()}
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
  onUnrealizedValueClick,
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
  onUnrealizedValueClick?: (data: UnrealizedValueSheetData) => void
}) {
  // Derive convenience flags from universal state
  const { collectionActive: focusCollectionActive, collectionComplete: focusCollectionComplete, collectionJustCompleted, upskillingActive, hrbpPlansCreated } = deriveWfrFlags(wfrState.state)
  const collectionLaunchSummary = wfrState.collectionLaunchSummary ?? null
  const upskillingLaunchSummary = wfrState.upskillingLaunchSummary ?? null
  const ctaDemoState: WfrDemoState | null = hrbpPlansCreated ? null : upskillingActive ? 4 : focusCollectionComplete ? 3 : focusCollectionActive ? 2 : 1
  const ctaPersona: WfrPersona = isHrbp ? 'hrbp' : 'chro'
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
    ? (isHrbp ? 4 : 3)
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

  const aiPotentialPct = effectiveRollup ? effectiveRollup.aiPotential : ORG.aiPotential
  const orgUnrealizedValue = effectiveRollup ? effectiveRollup.unrealizedValue : departments.reduce((s, d) => s + d.unrealizedValue, 0)
  const totalEmployeesHero = effectiveRollup ? effectiveRollup.totalEmployees : ORG.totalEmployees
  const hrsUnlocked = effectiveRollup ? effectiveRollup.hrsUnlocked : Math.round(gapPeople * ORG.hrsPerPersonWeek)
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
  const cards = [
    {
      id: 'ai-potential' as const,
      label: 'AI potential',
      val: `${aiPotentialPct}%`,
      icon: 'bolt',
      explainer: `How much of your organization's daily work AI is capable of supporting.`,
      l1: <span style={{ color: '#94a3b8' }}>{aiPotentialPct}% AI potential across {totalEmployeesHero.toLocaleString()} employees</span>,
      tag: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '2px 8px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />Above industry median (38%)</span>,
      delta: null,
      deltaUp: true,
    },
    {
      id: 'potential' as const,
      label: 'Unrealized value',
      val: formatDollar(orgUnrealizedValue),
      icon: 'auto_awesome',
      l1: <><span>The annual productivity value waiting to be captured.</span><span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}>{aiPotentialPct}% AI potential across {totalEmployeesHero.toLocaleString()} employees</span></>,
      delta: null,
      deltaUp: true,
    },
  ]

  // Priority tags — gap ≥25pts (Octave §12 Urgent: avg_automation_exposure − avg_preparedness)
  // Fallback to top 30% by gap if no rows exceed threshold (ensures at least some are flagged)
  const hrbpPrioritySet = (() => {
    if (hrbpRows.length === 0) return new Set<string>()
    const sorted = [...hrbpRows].sort((a, b) => b.totalUnrealizedValue - a.totalUnrealizedValue)
    const count = Math.max(1, Math.round(sorted.length * 0.3))
    return new Set(sorted.slice(0, count).map(r => r.hrbp))
  })()

  const ctaButtonClick = ctaDemoState === 1 && !isHrbp
    ? () => { setOpenMetric(null); setFocusLaunchOpen(true) }
    : ctaDemoState === 3 && !isHrbp
      ? () => setChroUpskillingInfoOpen(true)
      : ctaDemoState === 3 && isHrbp
        ? () => { setHrbpDevPlanScope('all'); setHrbpSelectedRoles({}); setHrbpDevPlanDialogOpen(true) }
        : undefined

  return (
    <>
    <WfrOverviewLayout
      aiPotentialPct={aiPotentialPct}
      aiReadinessPct={aiReadinessPct}
      totalEmployees={totalEmployeesHero}
      headline={hrbpPlansCreated ? (
        <>
          <span className="wfr-dash__headline-pct wfr-text-readiness">{aiReadinessPct}%</span>
          <span className="wfr-dash__headline-text">
            {` ${'AI adoption'} — up from ${rawReadinessPct}% before upskilling. ${ready.toLocaleString()} employees are now AI-ready.`}
          </span>
        </>
      ) : (
        <span className="wfr-dash__headline-text">
          Only <span className="wfr-dash__headline-pct wfr-text-readiness" style={{ fontSize: 'inherit' }}>{aiReadinessPct}%</span> of people in augmentable roles are AI-ready.
        </span>
      )}
      subtitle={!hrbpPlansCreated ? <>Your org has <span className="font-bold wfr-text-potential">{formatDollar(orgUnrealizedValue)}</span> in unrealized value. You're capturing less than a third of it.</> : undefined}
      pill={hrbpPlansCreated
        ? <><span className="font-bold text-[#15803d]">{(preCollectionGap - gapPeople).toLocaleString()}</span> employees moved out of the gap through development plans — <span className="font-bold text-[#b91c1c]">{gapPeople.toLocaleString()}</span> remaining.</>
        : <>~<span className="font-bold text-[#b91c1c]">{gapPeople.toLocaleString()}</span> employees in augmentable roles are not yet AI-ready.</>
      }
      cards={cards.map(c => ({
        ...c,
        value: c.delta ? (
          <>{c.val} <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: c.deltaUp ? '#15803d' : '#dc2626', padding: '2px 8px', borderRadius: 12, background: c.deltaUp ? '#f0fdf4' : '#fef2f2', border: `1px solid ${c.deltaUp ? '#bbf7d0' : '#fecaca'}`, verticalAlign: 'middle' }}>{c.deltaUp ? '↑' : '↓'} {c.delta}</span></>
        ) : c.val,
        description: c.l1,
        tag: (c as any).tag,
        explainer: (c as any).explainer,
        onLearnMore: () => setMetricInfoOpen(true),
      }))}
      heroCta={ctaDemoState ? <WfrCtaBar content={WFR_CTA_CONTENT[ctaDemoState][ctaPersona]} onButtonClick={ctaButtonClick} /> : undefined}
    >
        <WorkforceMetricSheet
          metric={openMetric}
          onClose={() => setOpenMetric(null)}
          ready={ready}
          gapPeople={gapPeople}
          hrsUnlocked={hrsUnlocked}
          dataCollection={learnMoreDataCollection}
        />

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
          <div className="wfr-dash__table-scroll">
          <DataTable bordered style={{ minWidth: 600, width: '100%' }}>
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
                        <PriorityTooltip tooltip="Large gap between AI potential and current adoption — team has the most to gain from upskilling">
                          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>
                            Priority
                          </span>
                        </PriorityTooltip>
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
                  <DataTableCell align="right"><button type="button" onClick={(e) => { e.stopPropagation(); onUnrealizedValueClick?.({ label: row.hrbp, subtitle: `${row.depts.map(d => d.name).join(', ')} · ${row.headcount.toLocaleString()} employees`, aiPotential: row.avgPotential, headcount: row.headcount, unrealizedValue: row.totalUnrealizedValue }) }} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 13, fontWeight: 700, color: '#3b5bdb', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(row.totalUnrealizedValue)}</button></DataTableCell>
                  <DataTableCell align="right">
                    <div className="tabular-nums" style={{ textAlign: 'right' }}>
                      <span className="wfr-type-h6">{row.totalGap.toLocaleString()} ({row.headcount > 0 ? Math.round((row.totalGap / row.headcount) * 100) : 0}%)</span>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {row.headcount.toLocaleString()}</div>
                    </div>
                  </DataTableCell>
                  {!focusCollectionComplete && (anyDelegation || focusCollectionActive) && (
                    stateNum(row.hrbpState) === 1 && row.hrbpDelegated
                      ? <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}><HrbpStatusPill state={1} delegated /><span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>Sent Apr 5, 2026</span></div></DataTableCell>
                      : stateNum(row.hrbpState) >= 2
                        ? <DataCollectionProgressCell rate={row.responseRate} inScope />
                        : <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><span className="text-[11px] text-[#94a3b8]">—</span></DataTableCell>
                  )}
                  {focusCollectionComplete && (() => {
                    const hrbpWasInScope = stateNum(row.hrbpState) >= 3
                    if (!hrbpWasInScope) {
                      return <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><span className="text-[11px] text-[#94a3b8]">—</span></DataTableCell>
                    }
                    const nhLocal = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
                    const plansPct = hrbpPlansCreated ? Math.min(90, 45 + (nhLocal(row.hrbp) % 45)) : 0
                    return <UpskillingProgressCell total={row.totalGap} pct={plansPct} plansComplete={hrbpPlansCreated} nameHash={nhLocal(row.hrbp)} />
                  })()}
                </DataTableRow>
              )})}
            </DataTableBody>
          </DataTable>
          </div>
        </TabsContent>

        <TabsContent value="departments">

      {focusCollectionComplete ? (
        <div className="wfr-dash__table-scroll">
          <DataTable bordered style={{ minWidth: 600, width: '100%' }}>
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
                    <DataTableRow key={d.name} style={{ cursor: 'pointer' }} onClick={() => onDeptClick(d)}>
                      <DataTableCell className="font-semibold" style={{ borderLeft: '3px solid transparent', paddingLeft: 17 }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[#3b5bdb] hover:underline">{d.name}</span>
                          {isPriority ? (
                            <PriorityTooltip tooltip={priorityRank === 0 ? 'Largest transformation gap — highest AI potential with lowest current adoption' : 'Top 3 by transformation gap — among the widest adoption gaps in your org'}>
                              <Badge variant="outline" size="24" className="ml-1 shrink-0 font-semibold" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                                {priorityRank === 0 ? 'Top priority' : 'High priority'}
                              </Badge>
                            </PriorityTooltip>
                          ) : null}
                        </div>
                      </DataTableCell>
                      <DataTableCell className="text-[#475569]">
                        {deptHrbps.length > 1
                          ? <><button type="button" className="text-[#3b5bdb] hover:underline font-medium" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onHrbpClick(deptHrbps[0].hrbp) }}>{deptHrbps[0].hrbp}</button>{` +${deptHrbps.length - 1}`}</>
                          : <button type="button" className="text-[#3b5bdb] hover:underline font-medium" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onHrbpClick(deptHrbps[0].hrbp) }}>{deptHrbps[0]?.hrbp ?? '—'}</button>}
                      </DataTableCell>
                      <DataTableCell metric>
                        <div className="wfr-dash__readiness-with-trend">
                          <DeptTableSoloBar variant="readiness" pct={measuredReadiness} />
                          <button type="button" className={`wfr-dash__trend-badge ${trend.direction === 'up' ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setTrendSheetRole(null); setTrendSheetHrbp(null); setTrendSheetDept(d) }} title="View readiness trend details">
                            <span className="wfr-dash__trend-badge-text">{trend.direction === 'up' ? '↑' : '↓'}{Math.abs(trend.delta)}pt</span>
                            <span className="material-symbols-outlined wfr-dash__trend-badge-icon">info</span>
                          </button>
                        </div>
                      </DataTableCell>
                      <DataTableCell align="right"><button type="button" onClick={(e) => { e.stopPropagation(); onUnrealizedValueClick?.({ label: d.name, subtitle: `${d.employees.toLocaleString()} employees`, aiPotential: d.aiPotential, headcount: d.employees, unrealizedValue: d.unrealizedValue }) }} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 13, fontWeight: 700, color: '#3b5bdb', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(d.unrealizedValue)}</button></DataTableCell>
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
                    <DataTableRow key={d.name} style={{ cursor: 'pointer' }} onClick={() => onDeptClick(d)}>
                      <DataTableCell className="font-semibold" style={{ borderLeft: '3px solid transparent', paddingLeft: 17 }}>
                        <span className="text-[#3b5bdb] hover:underline">{d.name}</span>
                      </DataTableCell>
                      <DataTableCell className="text-[#475569]">
                        {deptHrbps.length > 1
                          ? <><button type="button" className="text-[#3b5bdb] hover:underline font-medium" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onHrbpClick(deptHrbps[0].hrbp) }}>{deptHrbps[0].hrbp}</button>{` +${deptHrbps.length - 1}`}</>
                          : <button type="button" className="text-[#3b5bdb] hover:underline font-medium" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onHrbpClick(deptHrbps[0].hrbp) }}>{deptHrbps[0]?.hrbp ?? '—'}</button>}
                      </DataTableCell>
                      <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={d.aiReadiness} /></DataTableCell>
                      <DataTableCell align="right"><button type="button" onClick={(e) => { e.stopPropagation(); onUnrealizedValueClick?.({ label: d.name, subtitle: `${d.employees.toLocaleString()} employees`, aiPotential: d.aiPotential, headcount: d.employees, unrealizedValue: d.unrealizedValue }) }} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 13, fontWeight: 700, color: '#3b5bdb', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(d.unrealizedValue)}</button></DataTableCell>
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
                    <DataTableRow key={d.name} style={{ cursor: 'pointer' }} onClick={() => onDeptClick(d)}>
                      <DataTableCell className="font-semibold" style={{ borderLeft: '3px solid transparent', paddingLeft: 17 }}>
                        <span className="text-[#3b5bdb] hover:underline">{d.name}</span>
                      </DataTableCell>
                      <DataTableCell className="text-[#475569]">
                        {deptHrbps.length > 1
                          ? <><button type="button" className="text-[#3b5bdb] hover:underline font-medium" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onHrbpClick(deptHrbps[0].hrbp) }}>{deptHrbps[0].hrbp}</button>{` +${deptHrbps.length - 1}`}</>
                          : <button type="button" className="text-[#3b5bdb] hover:underline font-medium" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onHrbpClick(deptHrbps[0].hrbp) }}>{deptHrbps[0]?.hrbp ?? '—'}</button>}
                      </DataTableCell>
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
          <div className="wfr-dash__table-scroll">
          <DataTable bordered style={{ minWidth: 600, width: '100%' }}>
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
                    <DataTableCell align="right"><button type="button" onClick={(e) => { e.stopPropagation(); onUnrealizedValueClick?.({ label: r.title, subtitle: `${r.dept} · ${r.employees.toLocaleString()} employees`, aiPotential: r.aiPotential, headcount: r.employees, unrealizedValue: r.unrealizedValue }) }} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 13, fontWeight: 700, color: '#3b5bdb', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(r.unrealizedValue)}</button></DataTableCell>
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
                          const assignedTotal = completed + inProgress
                          const label = total === 0 ? '' : assignedTotal === 0 ? `${total.toLocaleString()} unassigned` : completed === total ? `${total.toLocaleString()} assigned` : `${assignedTotal.toLocaleString()} of ${total.toLocaleString()} assigned`
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 100 }}>
                              <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: '#e2e8f0' }}>
                                <div style={{ width: `${cW}%`, background: '#22c55e' }} />
                                <div style={{ width: `${iW}%`, background: '#818cf8' }} />
                                <div style={{ width: `${nW}%`, background: '#6366f1' }} />
                              </div>
                              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
                            </div>
                          )
                        })() : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 100 }}>
                            <div style={{ height: 6, borderRadius: 3, background: '#e2e8f0' }} />
                            <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', whiteSpace: 'nowrap' }}>{r.gap.toLocaleString()} unassigned</span>
                          </div>
                        )}
                      </DataTableCell>
                    )}
                  </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>
          </div>
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
        onUnrealizedValueClick={onUnrealizedValueClick}
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
    </WfrOverviewLayout>
    <FocusFirstModule
      suppressCard={true}
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
      justLaunched={hrbpJustLaunchedSet.has('__chro__')}
    />
    </>
  )
}

export function WorkforceReadinessDashboard({
  onViewChange,
  autoLaunchCollection = false,
  scopedDepartments,
  isHrbp = false,
  isManager = false,
  personaHrbpNames,
}: {
  onViewChange?: (view: 'board' | 'dept' | 'hrbp' | 'director' | 'seniorMgr') => void
  autoLaunchCollection?: boolean
  /** When set, only show these departments (HRBP scoped view) */
  scopedDepartments?: string[]
  /** HRBP persona — different RA card, no departments tab, scoped roles */
  isHrbp?: boolean
  /** Manager persona — shows team-level view with employee table */
  isManager?: boolean
  /** HRBP names this persona maps to in hrbpAssignments (for per-HRBP state) */
  personaHrbpNames?: string[]
} = {}) {
  const navigate = useNavigate()
  const [dashOpenMetric, setDashOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
  const [dashMetricInfoOpen, setDashMetricInfoOpen] = useState(false)
  const [uvSheetData, setUvSheetData] = useState<UnrealizedValueSheetData | null>(null)
  // Single-dept HRBP goes straight to DeptView (no overview needed)
  const singleDeptHrbp = isHrbp && scopedDepartments?.length === 1

  // Auto-select view from query params (e.g. navigating back from Manager Detail breadcrumbs)
  const [view, setView] = useState<'board' | 'dept' | 'hrbp' | 'director' | 'seniorMgr'>(() => {
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
  const [deptViewName, setDeptViewName] = useState<string | null>(null)

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
  const [hrbpTrendSheetDir, setHrbpTrendSheetDir] = useState<{ manager: string; mgrIndex: number; readiness: number; dept: Dept; directReports?: Array<{ name: string; title: string; employees: number; readiness: number; readyCount: number; unrealizedValue: number }> } | null>(null)
  const [trendSheetDept, setTrendSheetDept] = useState<Dept | null>(null)
  const [trendSheetRole, setTrendSheetRole] = useState<{ title: string; dept: string; measuredReadiness?: number; baseReadiness?: number; employeeName?: string; upskillingComplete?: boolean } | null>(null)
  const [trendSheetHrbp, setTrendSheetHrbp] = useState<{ hrbpName: string; headcount: number } | null>(null)
  const [seniorMgrData, setSeniorMgrData] = useState<{ name: string; title: string; deptName: string; mgrIdxStart: number; mgrCount: number; readiness?: number; parentDirector: { name: string; title: string; deptName: string; mgrIdxStart: number; mgrCount: number; parentHrbp: string; readiness?: number } } | null>(() => {
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
  const [directorData, setDirectorData] = useState<{ name: string; title: string; deptName: string; mgrIdxStart: number; mgrCount: number; parentHrbp: string; readiness?: number } | null>(() => {
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
  const [snackbar, setSnackbar] = useState<string | null>(null)

  // State transition functions — per-HRBP aware
  const advanceToCollection = useCallback((summary: FocusCollectionLaunchSummary) => {
    if (summary.delegated && summary.selectedHrbpNames?.length) {
      // Delegation: CHRO launch advances all selected HRBPs to state 2 (collection active)
      const hrbpStates: Record<string, HrbpState> = {}
      for (const hrbpName of summary.selectedHrbpNames) {
        hrbpStates[hrbpName] = { state: 2, departments: getHrbpDepts(hrbpName).map(d => d.dept), delegated: true }
      }
      hrbpJustLaunchedSet.add('__chro__')
      setWfrState(prev => ({ ...prev, state: 2, collectionLaunchSummary: summary, hrbpStates }))
    } else {
      hrbpJustLaunchedSet.add('__chro__')
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
    setWfrState(prev => advanceAllHrbps(prev, '2' as WfrProgramState, '2b'))
  }, [setWfrState])

  /** Advance the HRBP persona's own HRBPs directly to state 3 (collection complete).
   *  Used by the HRBP view's progress bar — the fill+bell animations have already played
   *  inside FocusFirstCollectionCard, so we skip the '2b' intermediate state. */
  const completeHrbpCollection = useCallback(() => {
    setWfrState(prev => {
      if (!prev.hrbpStates || !personaHrbpNames?.length) return prev
      const nextHrbpStates = { ...prev.hrbpStates }
      for (const name of personaHrbpNames) {
        const hs = nextHrbpStates[name]
        if (hs) nextHrbpStates[name] = { ...hs, state: 3 }
      }
      const next: WfrPersistedState = { ...prev, hrbpStates: nextHrbpStates }
      next.state = computeOrgAggregateState(next)
      return next
    })
  }, [setWfrState, personaHrbpNames])


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

  const [empSort, setEmpSort] = useState<{ col: 'name' | 'tasks' | 'readiness' | 'gap', dir: 'asc' | 'desc' }>({ col: 'readiness', dir: 'desc' })
  const toggleEmpSort = (col: typeof empSort['col']) => {
    setEmpSort(prev => prev.col === col ? { col, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { col, dir: col === 'name' ? 'asc' : 'desc' })
  }
  const [mgrMetricInfoOpen, setMgrMetricInfoOpen] = useState(false)
  const [mgrTaskSheetRole, setMgrTaskSheetRole] = useState<{ title: string; dept: string; employeeName?: string } | null>(null)
  const [mgrTaskSheetZoneFilter, setMgrTaskSheetZoneFilter] = useState<'augment' | 'above' | 'below' | null>(null)
  const [mgrAssignedPlans, _setMgrAssignedPlans] = useState<Set<string>>(new Set())
  const [mgrAllPlansAssigned, setMgrAllPlansAssigned] = useState(false)
  const [mgrAssignConfirmOpen, setMgrAssignConfirmOpen] = useState(false)
  const [mgrAssignReviewed, setMgrAssignReviewed] = useState(false)
  const [mgrToast, setMgrToast] = useState<string | null>(null)
  const [mgrDevPlanEmployee, setMgrDevPlanEmployee] = useState<{ name: string; title?: string; readinessPct: number; displayReadiness: number; planPct?: number } | null>(null)

  // ─── Manager persona: compute team data for Dana Tanaka ───
  const managerTeamData = useMemo(() => {
    if (!isManager) return null
    const dept = departments.find(d => d.name === 'Engineering')
    if (!dept) return null
    const managers = deptManagerTeams(dept.name, dept.employees)
    const mgrIdx = 36
    const mgr = managers[mgrIdx]
    if (!mgr) return null
    const deptRoles = getRolesForDept(dept.name)
    const rawEmps = getEmployeesForRole({ title: dept.name, employees: dept.employees, aiReadiness: dept.aiReadiness, aiPotential: dept.aiPotential } as unknown as Parameters<typeof getEmployeesForRole>[0])
    const allDeptEmps = rawEmps.map((e, i) => ({ ...e, title: deptRoles.length > 0 ? deptRoles[i % deptRoles.length].title : undefined }))
    const cumStart = managers.slice(0, mgrIdx).reduce((s, m) => s + m.employees, 0)
    const mgrEmployees = allDeptEmps.slice(cumStart, Math.min(cumStart + mgr.employees, allDeptEmps.length))
    // Build a team-local shuffled first-name list so all 43 employees get unique first names
    const fnMulberry = (s: number) => { let t = (s + 0x6d2b79f5) >>> 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
    const teamFirstNames = [...WFR_FIRST_NAMES] as string[]
    let fnSeed = (mgrIdx * 2654435761) >>> 0
    for (let i = teamFirstNames.length - 1; i > 0; i--) {
      fnSeed = (fnSeed + 0x6d2b79f5) >>> 0
      const j = Math.floor(fnMulberry(fnSeed) * (i + 1))
      ;[teamFirstNames[i], teamFirstNames[j]] = [teamFirstNames[j]!, teamFirstNames[i]!]
    }

    const displayEmployees = mgrEmployees.map((e, i) => {
      const roleData = deptRoles.find(r => r.title === e.title)
      const roleBase = roleData?.aiReadiness ?? dept.aiReadiness
      // Per-employee noise seeded from team position
      const noise = Math.round(((i * 374761393 + mgrIdx * 2654435761) % 38) - 19)
      const displayReadiness = Math.max(0, Math.min(100, roleBase + noise))
      // Re-assign first name from team-local shuffled list to guarantee uniqueness
      const lastName = e.name.split(' ').slice(1).join(' ')
      const firstName = teamFirstNames[i % teamFirstNames.length]!
      return { ...e, name: `${firstName} ${lastName}`, displayReadiness }
    })
    const avgReadiness = displayEmployees.length > 0 ? Math.round(displayEmployees.reduce((s, e) => s + e.displayReadiness, 0) / displayEmployees.length) : 0
    const readyCount = displayEmployees.filter(e => e.displayReadiness >= 50).length
    const notReady = displayEmployees.length - readyCount
    const unrealizedValue = Math.round(dept.unrealizedValue * mgr.employees / Math.max(1, dept.employees))
    const tasksInAug = Math.round(getTasksForRole(deptRoles[0]?.title ?? '').filter(t => { const s = t.score ?? 0; return s >= 15 && s <= 75 }).length)
    const totalTasks = getTasksForRole(deptRoles[0]?.title ?? '').length
    return { mgr, employees: displayEmployees, dept, avgReadiness, readyCount, notReady, unrealizedValue, tasksInAug, totalTasks }
  }, [isManager])

  if (isManager && managerTeamData) {
    const { mgr: mgrData, employees: mgrEmployees, dept: mgrDept, avgReadiness: mgrReadiness, notReady: mgrNotReady, unrealizedValue: mgrUnrealized, tasksInAug: _mgrTasksInAug, totalTasks: _mgrTotalTasks } = managerTeamData
    const { collectionComplete: mgrCollComplete, upskillingActive: mgrUpskillingActive, hrbpPlansCreated: mgrPlansCreated } = deriveWfrFlags(wfrState.state)
    const mgrTrendDelta = mgrCollComplete ? deptReadinessTrend(mgrDept.name).delta : 0
    const mgrUpskillingBoost = mgrPlansCreated ? 6 : 0
    const engInScope = !wfrState.upskillingLaunchSummary || wfrState.upskillingLaunchSummary.departmentNames.includes(mgrDept.name)
    const showUpskilling = mgrCollComplete && mgrUpskillingActive && engInScope
    // Precompute per-employee display readiness (including per-employee trend noise) so
    // sort order, card counts, and row labels all use the same values and stay consistent.
    const enrichedMgrEmployees = mgrEmployees.map(emp => {
      const h = emp.name.split('').reduce((a: number, c: string) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
      const empTrendNoise = mgrCollComplete && mgrTrendDelta !== 0 ? Math.round(((Math.abs(h) % 70) - 35) / 10) : 0
      const empTrendDelta = mgrTrendDelta + empTrendNoise
      // Plan completion %: ~25% of employees complete (100%), rest are 45–99% in progress.
      // Only 100% completion changes readiness — partial progress doesn't move the number.
      const planPct = mgrPlansCreated
        ? (Math.abs(h) % 4 === 0 ? 100 : Math.min(99, 45 + (Math.abs(h) % 55)))
        : 0
      // Pre-upskilling readiness (trend applied, no plan boost)
      const preUpskillingReadiness = emp.displayReadiness + empTrendDelta
      // Boost is enough to reach AI-ready (52%) when plan is done; applies ONLY at 100% completion
      const deficit = Math.max(0, 52 - preUpskillingReadiness)
      const maxBoost = Math.max(deficit, mgrUpskillingBoost)
      const empUpskillingBoost = (mgrPlansCreated && planPct === 100) ? maxBoost : 0
      const measuredReadiness = Math.max(0, Math.min(100, preUpskillingReadiness + empUpskillingBoost))
      // Cap at 49 before plans are created so no one appears past the AI-ready threshold
      const cappedReadiness = !mgrPlansCreated ? Math.min(49, measuredReadiness) : measuredReadiness
      const displayEmpReadiness = mgrCollComplete ? cappedReadiness : emp.displayReadiness
      // Cap displayed trend delta to match capped readiness
      const displayTrendDelta = !mgrPlansCreated ? Math.min(empTrendDelta, 49 - emp.displayReadiness) : empTrendDelta
      return { ...emp, _displayEmpReadiness: displayEmpReadiness, _empTrendDelta: displayTrendDelta, _planPct: planPct }
    })
    const calibratedAvgReadiness = mgrCollComplete
      ? Math.min(100, Math.round(enrichedMgrEmployees.reduce((s, e) => s + e._displayEmpReadiness, 0) / Math.max(1, enrichedMgrEmployees.length)))
      : mgrReadiness
    const calibratedNotReady = mgrPlansCreated
      ? enrichedMgrEmployees.filter(e => {
          return e.displayReadiness >= 50 ? e._displayEmpReadiness < 50 : e._planPct !== 100
        }).length
      : enrichedMgrEmployees.length
    const displayNotReady = mgrCollComplete ? calibratedNotReady : mgrNotReady
    const displayReadinessPct = mgrCollComplete ? calibratedAvgReadiness : mgrReadiness
    const readinessBadge = mgrCollComplete
      ? <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#166534', padding: '1px 7px', borderRadius: 10, background: '#dcfce7', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>
      : <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>
    return (
      <>
      <WfrOverviewLayout
        aiPotentialPct={mgrDept.aiPotential}
        aiReadinessPct={displayReadinessPct}
        totalEmployees={mgrData.employees}
        hideHero
        headline={<span className="wfr-dash__headline-text">Only <span className="wfr-dash__headline-pct wfr-text-readiness" style={{ fontSize: 'inherit' }}>{displayReadinessPct}%</span> of your team is AI-ready.</span>}
        subtitle={<>Your team has <span className="font-bold wfr-text-potential">{formatDollar(mgrUnrealized)}</span> in unrealized value.</>}
        pill={<>~<span className="font-bold text-[#b91c1c]">{displayNotReady.toLocaleString()}</span> of your {mgrData.employees.toLocaleString()} employees are not yet AI-ready.</>}
        heroCta={showUpskilling && !(mgrPlansCreated || mgrAllPlansAssigned)
          ? <WfrCtaBar content={WFR_CTA_CONTENT[4]['manager']} onButtonClick={() => setMgrAssignConfirmOpen(true)} />
          : undefined
        }
        cards={[
          { id: 'ai-potential' as const, icon: 'bolt', label: 'AI potential', value: `${mgrDept.aiPotential}%`, explainer: `How much of your team's daily work AI is capable of supporting.`, description: <span style={{ color: '#94a3b8' }}>{mgrDept.aiPotential}% AI potential across {mgrData.employees} employees</span>, tag: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '2px 8px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />Above industry median (38%)</span>, onLearnMore: () => setMgrMetricInfoOpen(true) },
          { id: 'potential', icon: 'auto_awesome', label: 'Unrealized value', value: formatDollar(mgrUnrealized), description: <><span>The annual productivity value waiting to be captured.</span><span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}>{mgrDept.aiPotential}% AI potential across {mgrData.employees} employees</span></>, onLearnMore: () => setMgrMetricInfoOpen(true) },
        ]}
      >
        <div>
          {false && null /* CTA card moved to beforeCards */}
          <div className="wfr-dash__panel-head">
            <span className="wfr-dash__panel-title">Team members <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 600, borderRadius: 8, padding: '1px 7px', marginLeft: 4, verticalAlign: 'middle' }}>{mgrEmployees.length}</span></span>
            <span className="wfr-dash__panel-hint">
              {mgrCollComplete
                ? mgrUpskillingActive
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ display: 'inline-block', width: 3, height: 12, background: '#6366f1', borderRadius: 2, flexShrink: 0 }} />
                      <span>{mgrPlansCreated ? 'Upskilling complete' : 'Upskilling in progress'}</span>
                    </span>
                  : null
                : null}
            </span>
          </div>
          <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead style={{ width: showUpskilling ? '18%' : '22%', cursor: 'pointer' }} onClick={() => toggleEmpSort('name')}><span className="inline-flex items-center gap-1">Employee <SortIcon sortDir={empSort.col === 'name' ? empSort.dir : null} onSortClick={() => toggleEmpSort('name')} /></span></DataTableHead>
                <DataTableHead style={{ width: '16%' }}>Role</DataTableHead>
                <DataTableHead numeric style={{ width: showUpskilling ? '10%' : '12%', cursor: 'pointer' }} onClick={() => toggleEmpSort('tasks')}><span className="inline-flex items-center gap-1">Tasks <SortIcon sortDir={empSort.col === 'tasks' ? empSort.dir : null} onSortClick={() => toggleEmpSort('tasks')} /></span></DataTableHead>
                <DataTableHead metric style={{ width: showUpskilling ? '22%' : '24%' }}><MetricHeaderLabel label="AI adoption" metric="readiness" onInfoClick={() => setMgrMetricInfoOpen(true)} sortDir={empSort.col === 'readiness' ? empSort.dir : null} onSortClick={() => toggleEmpSort('readiness')} /></DataTableHead>
                <DataTableHead numeric style={{ width: showUpskilling ? '16%' : '18%' }}><MetricHeaderLabel label="Transformation gap" metric="gap" sortDir={empSort.col === 'gap' ? empSort.dir : null} onSortClick={() => toggleEmpSort('gap')} /></DataTableHead>
                {showUpskilling && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ width: '15%', whiteSpace: 'nowrap' }}>Upskilling</DataTableHead>}
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {[...enrichedMgrEmployees].sort((a, b) => {
                const mul = empSort.dir === 'asc' ? 1 : -1
                switch (empSort.col) {
                  case 'name': return mul * a.name.localeCompare(b.name)
                  case 'tasks': return mul * ((a.title ? getTasksForRole(a.title).length : 0) - (b.title ? getTasksForRole(b.title).length : 0))
                  case 'gap': return mul * (a._displayEmpReadiness - b._displayEmpReadiness) * -1
                  default: return mul * (a._displayEmpReadiness - b._displayEmpReadiness)
                }
              }).map((emp, idx) => {
                const empTaskCount = emp.title ? getTasksForRole(emp.title).length : 0
                const h = emp.name.split('').reduce((a: number, c: string) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
                const empTrendDelta = emp._empTrendDelta
                const displayEmpReadiness = emp._displayEmpReadiness
                const rawDisplayPct = emp._planPct > 0 ? emp._planPct : mgrAssignedPlans.has(emp.name) ? Math.min(85, 10 + (Math.abs(h) % 55)) : 0
                const empDisplayPct = showUpskilling ? rawDisplayPct : 0
                const upskillingComplete = showUpskilling && emp._planPct === 100
                // Base readiness (pre-collection, pre-trend) determines if already AI-ready before any program
                const wasAlreadyReady = emp.displayReadiness >= 50
                // AI-ready: no one crosses threshold until plans are created (narrative)
                // Once plans exist: already-ready employees keep threshold; others need 100% completion
                const isAiReady = mgrPlansCreated
                  ? (wasAlreadyReady ? displayEmpReadiness >= 50 : upskillingComplete)
                  : false
                return (
                <DataTableRow key={`${emp.name}-${idx}`}>
                  <DataTableCell className="font-semibold" style={showUpskilling ? { borderLeft: '3px solid #6366f1', paddingLeft: 17 } : { borderLeft: '3px solid transparent', paddingLeft: 17 }}>
                    <span className="text-[#1e293b]">{emp.name}</span>
                  </DataTableCell>
                  <DataTableCell className="text-[13px] text-[#475569] !max-w-[140px] truncate">{emp.title ?? '—'}</DataTableCell>
                  <DataTableCell align="right">
                    {empTaskCount > 0 && emp.title ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMgrTaskSheetRole({ title: emp.title!, dept: mgrDept.name, employeeName: emp.name }) }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 12, fontWeight: 600, color: '#3b5bdb', cursor: 'pointer' }}
                      >
                        {empTaskCount}
                      </button>
                    ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                  </DataTableCell>
                  <DataTableCell metric>
                    <div>
                      {mgrCollComplete && empTrendDelta !== 0 ? (
                        <div className="wfr-dash__readiness-with-trend">
                          <DeptTableSoloBar variant="readiness" pct={displayEmpReadiness} />
                          <button type="button" className={`wfr-dash__trend-badge ${empTrendDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setTrendSheetRole({ title: emp.title ?? mgrDept.name, dept: mgrDept.name, measuredReadiness: displayEmpReadiness, baseReadiness: emp.displayReadiness, employeeName: emp.name, upskillingComplete }); setTrendSheetHrbp(null); setTrendSheetDept(mgrDept) }} title="View readiness trend details">
                            <span className="wfr-dash__trend-badge-text">{empTrendDelta >= 0 ? '↑' : '↓'}{Math.abs(empTrendDelta)}pt</span>
                            <span className="material-symbols-outlined wfr-dash__trend-badge-icon">info</span>
                          </button>
                        </div>
                      ) : <DeptTableSoloBar variant="readiness" pct={displayEmpReadiness} />}
                      {mgrCollComplete && !upskillingComplete && (
                        <div style={{ fontSize: 10, color: '#15803d', marginTop: 7, display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11, verticalAlign: -1 }}>verified</span>
                          Updated from data collection
                        </div>
                      )}
                      {upskillingComplete && (
                        <div style={{ fontSize: 10, color: '#15803d', marginTop: 7, display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11, verticalAlign: -1 }}>verified</span>
                          Upskilling complete
                        </div>
                      )}
                    </div>
                  </DataTableCell>
                  <DataTableCell align="right">
                    <span style={{ color: isAiReady ? '#15803d' : '#dc2626', fontWeight: 600 }}>{isAiReady ? 'AI-ready' : 'Not AI-ready'}</span>
                  </DataTableCell>
                  {showUpskilling && (() => {
                    const effectivePct = empDisplayPct
                    const dStatus = effectivePct === 100 ? 'Completed' : effectivePct > 20 ? 'In progress' : 'Not started'
                    const bColor = dStatus === 'Completed' ? '#22c55e' : dStatus === 'In progress' ? '#818cf8' : '#e2e8f0'
                    const tColor = dStatus === 'Completed' ? '#15803d' : dStatus === 'In progress' ? '#6366f1' : '#94a3b8'
                    return (
                      <DataTableCell metric className="!whitespace-normal bg-[#fafbfc] border-l border-[#e2e8f0]">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <button
                            type="button"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px 3px 6px', borderRadius: 100, background: '#eff3ff', border: '1px solid #c5d3f8', color: '#3b5bdb', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.4 }}
                            onClick={(e) => { e.stopPropagation(); setMgrDevPlanEmployee({ name: emp.name, title: emp.title, readinessPct: emp.displayReadiness, displayReadiness: displayEmpReadiness, planPct: emp._planPct }) }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>description</span>{!(mgrPlansCreated || mgrAllPlansAssigned) && 'Development plan'}
                          </button>
                          {(empDisplayPct > 0 || mgrPlansCreated || mgrAllPlansAssigned || mgrAssignedPlans.has(emp.name)) ? (
                            <div className="wfr-dash__plan-progress" style={{ flex: '1 1 0', minWidth: 60 }}>
                              <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                                <div className="wfr-dash__plan-progress-fill" style={{ width: `${effectivePct}%`, background: bColor }} />
                              </div>
                              <span className="wfr-dash__plan-progress-label" style={{ color: tColor }}>{effectivePct}%</span>
                            </div>
                          ) : null}
                        </div>
                      </DataTableCell>
                    )
                  })()}
                </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>
        </div>
      </WfrOverviewLayout>
      {mgrAssignConfirmOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)' }} onClick={() => setMgrAssignConfirmOpen(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 12, padding: '28px 28px 24px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Assign development plans</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              This will assign development plans to all <strong>{displayNotReady}</strong> team members who are not yet AI-ready. Employees will be notified and can begin their plans immediately.
            </p>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={mgrAssignReviewed}
                onChange={e => setMgrAssignReviewed(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: '#0ea5e9', flexShrink: 0, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.5 }}>
                I've reviewed the development plans for my team and confirm they're ready to assign.
              </span>
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => { setMgrAssignConfirmOpen(false); setMgrAssignReviewed(false) }}>Cancel</Button>
              <Button variant="primary" disabled={!mgrAssignReviewed} style={{ opacity: mgrAssignReviewed ? 1 : 0.4, cursor: mgrAssignReviewed ? 'pointer' : 'not-allowed' }} onClick={() => { if (!mgrAssignReviewed) return; setMgrAssignConfirmOpen(false); setMgrAssignReviewed(false); setMgrAllPlansAssigned(true); setWfrState(prev => advanceAllHrbps(prev, null, 5)); setMgrToast(`Development plans assigned to ${displayNotReady} team members`); setTimeout(() => setMgrToast(null), 4000) }}>Assign plans</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {mgrTaskSheetRole && createPortal(
        <div className="wfr-trend-sheet__root">
          <div className="wfr-trend-sheet__backdrop" onClick={() => { setMgrTaskSheetRole(null); setMgrTaskSheetZoneFilter(null) }} />
          <div className="wfr-trend-sheet" role="dialog" aria-label={`Tasks for ${mgrTaskSheetRole.employeeName ?? mgrTaskSheetRole.title}`}>
            <div className="wfr-trend-sheet__header">
              <div>
                <div className="wfr-trend-sheet__title-row">
                  <h2 className="wfr-trend-sheet__title">{mgrTaskSheetRole.employeeName ?? mgrTaskSheetRole.title}</h2>
                </div>
                <p className="wfr-trend-sheet__sub">{mgrTaskSheetRole.employeeName ? `${mgrTaskSheetRole.title} — Task breakdown` : `${mgrTaskSheetRole.dept} — Task breakdown`}</p>
              </div>
              <button type="button" className="wfr-trend-sheet__close" onClick={() => { setMgrTaskSheetRole(null); setMgrTaskSheetZoneFilter(null) }} aria-label="Close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="wfr-trend-sheet__body">
              {(() => {
                const tasks = getTasksForRole(mgrTaskSheetRole.title)
                const augCount = tasks.filter(t => t.score >= 15 && t.score <= 75).length
                const aboveCount = tasks.filter(t => t.score > 75).length
                const belowCount = tasks.filter(t => t.score < 15).length
                const zoneCards: { zone: 'augment' | 'above' | 'below'; count: number; label: string; desc: string; color: string; bg: string; border: string; activeBorder: string }[] = [
                  { zone: 'above', count: aboveCount, label: 'Automate', desc: 'AI runs autonomously', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', activeBorder: '#6366f1' },
                  { zone: 'augment', count: augCount, label: 'Augment', desc: 'Human leads, AI assists', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', activeBorder: '#15803d' },
                  { zone: 'below', count: belowCount, label: 'Human', desc: 'Requires judgment or trust', color: '#94a3b8', bg: '#f8fafc', border: '#e5e7eb', activeBorder: '#64748b' },
                ]
                const augmentSkills: Record<string, string[]> = { 'research': ['AI-assisted research', 'Data synthesis'], 'draft': ['AI writing', 'Content generation'], 'analys': ['Data interpretation', 'Pattern recognition'], 'plan': ['AI-assisted planning', 'Scenario modeling'], 'review': ['Quality evaluation', 'AI output review'], 'track': ['AI analytics', 'Trend detection'], 'coordinat': ['AI scheduling', 'Workflow automation'], 'report': ['Automated reporting', 'Data visualization'], 'forecast': ['Predictive analytics', 'AI modeling'], 'screen': ['AI screening', 'Candidate matching'], 'document': ['AI documentation', 'Template generation'], 'budget': ['Financial modeling', 'AI forecasting'] }
                const automateSkills = ['Process automation', 'AI pipeline', 'Zero-touch processing']
                const humanSkills: Record<string, string[]> = { 'negotiat': ['Persuasion', 'Relationship building'], 'conflict': ['Mediation', 'Emotional intelligence'], 'client': ['Trust building', 'Empathy'], 'mentor': ['Coaching', 'Leadership'], 'train': ['Facilitation', 'Knowledge transfer'], 'strateg': ['Vision', 'Business judgment'] }
                function getSkillsForTask(task: string, zone: string): string[] {
                  const lower = task.toLowerCase()
                  if (zone === 'augment') { for (const [key, skills] of Object.entries(augmentSkills)) { if (lower.includes(key)) return skills } return ['AI collaboration', 'Tool fluency'] }
                  if (zone === 'above') return automateSkills.slice(0, 2)
                  for (const [key, skills] of Object.entries(humanSkills)) { if (lower.includes(key)) return skills }
                  return ['Critical thinking', 'Human judgment']
                }
                const groups = [
                  { zone: 'above' as const, label: 'Automate', icon: 'precision_manufacturing', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', desc: 'AI runs autonomously — data entry, routing, ticket processing', tasks: tasks.filter(t => t.score > 75) },
                  { zone: 'augment' as const, label: 'Augment', icon: 'smart_toy', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', desc: 'Human leads, AI assists — research, drafting, analysis, scheduling', tasks: tasks.filter(t => t.score >= 15 && t.score <= 75) },
                  { zone: 'below' as const, label: 'Human', icon: 'person', color: '#64748b', bg: '#f8fafc', border: '#e5e7eb', desc: 'Requires human presence, trust, or judgment', tasks: tasks.filter(t => t.score < 15) },
                ]
                const visibleGroups = mgrTaskSheetZoneFilter ? groups.filter(g => g.zone === mgrTaskSheetZoneFilter && g.tasks.length > 0) : groups.filter(g => g.tasks.length > 0)
                return (
                  <>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      {zoneCards.map((zc) => {
                        const isActive = mgrTaskSheetZoneFilter === zc.zone
                        const isDimmed = mgrTaskSheetZoneFilter != null && !isActive
                        return (
                          <div key={zc.zone} onClick={() => setMgrTaskSheetZoneFilter(prev => prev === zc.zone ? null : zc.zone)} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: isActive ? `2px solid ${zc.activeBorder}` : `1px solid ${zc.border}`, background: zc.bg, cursor: 'pointer', opacity: isDimmed ? 0.45 : 1, transition: 'opacity 0.15s, border-color 0.15s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 20, fontWeight: 700, color: zc.color }}>{zc.count}</span>
                            </div>
                            <div style={{ fontSize: 11, color: zc.color, fontWeight: 500 }}>{zc.label}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>{zc.desc}</div>
                          </div>
                        )
                      })}
                    </div>
                    {visibleGroups.map((group) => (
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
                            return (
                              <div key={i} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                                <div style={{ marginBottom: 4 }}>
                                  <span className="text-[13px] font-medium text-[#1a212e]">{t.task}</span>
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
              })()}
            </div>
          </div>
        </div>,
        document.body,
      )}
      <DevPlanSheet
        employee={mgrDevPlanEmployee}
        open={!!mgrDevPlanEmployee}
        onClose={() => setMgrDevPlanEmployee(null)}
        isAssigned={mgrAssignedPlans.has(mgrDevPlanEmployee?.name ?? '') || mgrAllPlansAssigned || mgrPlansCreated}
      />
      <ReadinessTrendSheet
        open={trendSheetDept != null}
        onClose={() => { setTrendSheetDept(null); setTrendSheetRole(null); setTrendSheetHrbp(null) }}
        dept={trendSheetDept}
        channelsLabel={wfrState.collectionLaunchSummary?.channelsLabel}
        roleContext={trendSheetRole}
        hrbpContext={trendSheetHrbp}
        upskillingActive={deriveWfrFlags(wfrState.state).hrbpPlansCreated}
        collectionComplete={deriveWfrFlags(wfrState.state).collectionComplete}
        onUnrealizedValueClick={setUvSheetData}
      />
      {mgrToast && createPortal(
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', borderRadius: 10, background: '#0f172a', color: '#fff', fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 10000, animation: 'fadeInUp 0.3s ease-out', whiteSpace: 'nowrap' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4ade80' }}>check_circle</span>
          {mgrToast}
        </div>,
        document.body,
      )}
      <MetricInfoDialog open={mgrMetricInfoOpen} onClose={() => setMgrMetricInfoOpen(false)} collectionComplete={mgrCollComplete} />
    </>
    )
  }

  return (
    <>
      <div className="min-w-0">
        {view === 'board' && (
          <BoardView
            onDeptClick={(d) => {
              setDeptViewName(d.name)
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
            onUnrealizedValueClick={setUvSheetData}
          />
        )}
        {view === 'dept' && deptViewName && (() => {
          const d = departments.find(x => x.name === deptViewName)
          if (!d) return null
          const deptHrbpList = getDeptHrbps(d.name)
          const trend = deptReadinessTrend(d.name)
          const { collectionComplete: deptCollComplete, hrbpPlansCreated: deptPlansCreated } = deriveWfrFlags(wfrState.state)
          const deptTrendDelta = deptCollComplete ? trend.delta : 0
          const deptBoostBase = deptPlansCreated ? 10 : 0
          const nhDept = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }

          // Allocate employees globally across all managers (same pattern as HRBP view)
          const allDeptManagers = deptManagerTeams(d.name, d.employees)
          const deptRawEmps = getEmployeesForRole({ title: d.name, employees: d.employees, aiReadiness: d.aiReadiness, aiPotential: d.aiPotential } as RoleRowType)
          let deptRunIdx = 0
          const deptMgrCalibrated = allDeptManagers.map((mgr) => {
            const emps = deptRawEmps.slice(deptRunIdx, Math.min(deptRunIdx + mgr.employees, deptRawEmps.length))
            deptRunIdx += mgr.employees
            return emps.map(e => {
              const empBoost = deptPlansCreated ? Math.round(deptBoostBase * (0.5 + (nhDept(e.name) % 10) / 10)) : 0
              return Math.max(0, Math.min(100, e.readinessPct + deptTrendDelta + empBoost))
            })
          })

          // Compute per-HRBP metrics via manager slicing
          type DeptHrbpRow = { hrbp: string; headcount: number; readiness: number; gap: number; unrealizedValue: number; mgrStartIdx: number; mgrCount: number }
          const deptHrbpRows: DeptHrbpRow[] = []
          let deptMgrStart = 0
          for (const { hrbp, headcount } of deptHrbpList) {
            const slicedIdxs: number[] = []
            let covered = 0
            for (let m = deptMgrStart; m < allDeptManagers.length && covered < headcount; m++) {
              slicedIdxs.push(m)
              covered += allDeptManagers[m].employees
            }
            const calibrated = slicedIdxs.flatMap(i => deptMgrCalibrated[i] ?? [])
            const readiness = calibrated.length > 0
              ? Math.round(calibrated.reduce((s, v) => s + v, 0) / calibrated.length)
              : (deptCollComplete ? d.aiReadiness + deptTrendDelta : d.aiReadiness)
            const gap = Math.max(0, headcount - Math.round(headcount * readiness / 100))
            const unrealizedValue = Math.round(d.unrealizedValue * headcount / Math.max(1, d.employees))
            deptHrbpRows.push({ hrbp, headcount, readiness, gap, unrealizedValue, mgrStartIdx: deptMgrStart, mgrCount: slicedIdxs.length })
            deptMgrStart += slicedIdxs.length
          }

          const deptTotalEmp = deptHrbpRows.reduce((s, r) => s + r.headcount, 0)
          const deptAvgReadiness = deptTotalEmp > 0 ? Math.round(deptHrbpRows.reduce((s, r) => s + r.readiness * r.headcount, 0) / deptTotalEmp) : d.aiReadiness
          const deptTotalGap = deptHrbpRows.reduce((s, r) => s + r.gap, 0)
          const multiHrbp = deptHrbpList.length > 1
          const deptCollBadge = deptCollComplete
            ? <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#15803d', padding: '1px 7px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>
            : <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>

          const deptBreadcrumb = (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink onClick={() => { setView('board'); setDeptViewName(null) }}>Overview</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>{d.name}</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )

          return (
            <PersonDetailLayout
              breadcrumb={deptBreadcrumb}
              name={d.name}
              subtitle={`Department · ${d.employees.toLocaleString()} employees`}
              potential={{ value: formatDollar(d.unrealizedValue), description: <>The annual productivity value waiting to be captured.</>, onLearnMore: () => setDashMetricInfoOpen(true) }}
              tableTitle={multiHrbp ? `${deptHrbpList.length} HR Business Partners` : 'Team managers'}
              tableHint={multiHrbp ? 'Click an HRBP to see their team' : `${deptHrbpRows[0]?.hrbp ?? ''} · ${(deptHrbpRows[0]?.headcount ?? 0).toLocaleString()} employees`}
              compactCards
            >
              {multiHrbp ? (
                <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                  <DataTableHeader>
                    <DataTableRow>
                      <DataTableHead style={{ width: '28%' }}>HRBP</DataTableHead>
                      <DataTableHead metric style={{ width: '22%' }}><MetricHeaderLabel label="Team AI adoption" metric="readiness" onInfoClick={() => setDashMetricInfoOpen(true)} /></DataTableHead>
                      <DataTableHead numeric style={{ width: '22%' }}><MetricHeaderLabel label="Unrealized value" metric="potential" onInfoClick={() => setDashMetricInfoOpen(true)} /></DataTableHead>
                      <DataTableHead numeric style={{ width: '28%' }}><MetricHeaderLabel label="Transformation gap" metric="gap" /></DataTableHead>
                    </DataTableRow>
                  </DataTableHeader>
                  <DataTableBody>
                    {deptHrbpRows.map(row => (
                      <DataTableRow key={row.hrbp} style={{ cursor: 'pointer' }} onClick={() => { setHrbpName(row.hrbp); setView('hrbp'); window.scrollTo(0, 0) }}>
                        <DataTableCell className="font-semibold" style={{ borderLeft: '3px solid transparent', paddingLeft: 17 }}>
                          <div>
                            <span className="text-[#3b5bdb] hover:underline">{row.hrbp}</span>
                            <div className="text-[#94a3b8] text-[11px] font-normal">{row.headcount.toLocaleString()} employees</div>
                          </div>
                        </DataTableCell>
                        <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={row.readiness} /></DataTableCell>
                        <DataTableCell align="right"><button type="button" onClick={(e) => { e.stopPropagation(); setUvSheetData({ label: row.hrbp, subtitle: `${d.name} · ${row.headcount.toLocaleString()} employees`, aiPotential: d.aiPotential, headcount: row.headcount, unrealizedValue: row.unrealizedValue }) }} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 13, fontWeight: 700, color: '#3b5bdb', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(row.unrealizedValue)}</button></DataTableCell>
                        <DataTableCell align="right">
                          <div className="tabular-nums" style={{ textAlign: 'right' }}>
                            <span className="wfr-type-h6">{row.gap.toLocaleString()} ({row.headcount > 0 ? Math.round(row.gap / row.headcount * 100) : 0}%)</span>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {row.headcount.toLocaleString()}</div>
                          </div>
                        </DataTableCell>
                      </DataTableRow>
                    ))}
                  </DataTableBody>
                </DataTable>
              ) : (
                // Single HRBP: show team managers
                <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                  <DataTableHeader>
                    <DataTableRow>
                      <DataTableHead style={{ width: '32%' }}>Manager</DataTableHead>
                      <DataTableHead metric style={{ width: '24%' }}><MetricHeaderLabel label="Team AI adoption" metric="readiness" onInfoClick={() => setDashMetricInfoOpen(true)} /></DataTableHead>
                      <DataTableHead numeric style={{ width: '22%' }}><MetricHeaderLabel label="Unrealized value" metric="potential" onInfoClick={() => setDashMetricInfoOpen(true)} /></DataTableHead>
                      <DataTableHead numeric style={{ width: '22%' }}><MetricHeaderLabel label="Transformation gap" metric="gap" /></DataTableHead>
                    </DataTableRow>
                  </DataTableHeader>
                  <DataTableBody>
                    {allDeptManagers.slice(deptHrbpRows[0]?.mgrStartIdx ?? 0, (deptHrbpRows[0]?.mgrStartIdx ?? 0) + (deptHrbpRows[0]?.mgrCount ?? 0)).map((mgr, localIdx) => {
                      const globalIdx = (deptHrbpRows[0]?.mgrStartIdx ?? 0) + localIdx
                      const cal = deptMgrCalibrated[globalIdx] ?? []
                      const mgrReadiness = cal.length > 0 ? Math.round(cal.reduce((s, v) => s + v, 0) / cal.length) : d.aiReadiness
                      const mgrGap = Math.max(0, mgr.employees - Math.round(mgr.employees * mgrReadiness / 100))
                      const mgrUnrealizedValue = Math.round(d.unrealizedValue * mgr.employees / Math.max(1, d.employees))
                      return (
                        <DataTableRow key={mgr.manager}>
                          <DataTableCell className="font-semibold" style={{ borderLeft: '3px solid transparent', paddingLeft: 17 }}>
                            <div>
                              <span>{mgr.manager}</span>
                              <div className="text-[#94a3b8] text-[11px] font-normal">{mgr.title} · {mgr.employees.toLocaleString()} employees</div>
                            </div>
                          </DataTableCell>
                          <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={mgrReadiness} /></DataTableCell>
                          <DataTableCell align="right"><button type="button" onClick={(e) => { e.stopPropagation(); setUvSheetData({ label: mgr.manager, subtitle: `${d.name} · ${mgr.employees.toLocaleString()} employees`, aiPotential: d.aiPotential, headcount: mgr.employees, unrealizedValue: mgrUnrealizedValue }) }} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 13, fontWeight: 700, color: '#3b5bdb', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(mgrUnrealizedValue)}</button></DataTableCell>
                          <DataTableCell align="right">
                            <div className="tabular-nums" style={{ textAlign: 'right' }}>
                              <span className="wfr-type-h6">{mgrGap.toLocaleString()} ({mgr.employees > 0 ? Math.round(mgrGap / mgr.employees * 100) : 0}%)</span>
                              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {mgr.employees.toLocaleString()}</div>
                            </div>
                          </DataTableCell>
                        </DataTableRow>
                      )
                    })}
                  </DataTableBody>
                </DataTable>
              )}
            </PersonDetailLayout>
          )
        })()}
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
            // Use avg-readiness-based readyCount so gap % is consistent with the team adoption bar
            const ready = Math.round(empCount * avgReadiness / 100)
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

          // Re-derive top-card metrics from actual director data so headline is consistent with the table
          const dirTotalEmp = directors.reduce((s, dir) => s + dir.employees, 0)
          const dirWeightedReadiness = dirTotalEmp > 0
            ? Math.round(directors.reduce((s, dir) => s + dir.readiness * dir.employees, 0) / dirTotalEmp)
            : (hrbpCollectionComplete ? d.aiReadiness + trend.delta : d.aiReadiness)
          const dirReadyCount = Math.round(headcount * dirWeightedReadiness / 100)
          const dirTotalGap = headcount - dirReadyCount

          // Compute direct reports (senior mgrs or team mgrs) for a director — used by trend sheet
          const SR_TITLES_TS = ['Senior Manager', 'Principal Manager', 'Group Manager', 'Associate Director', 'Staff Manager']
          const computeDirDirectReports = (dir: typeof directors[0]) => {
            const dirTeamMgrs = allManagers.slice(dir.firstMgrIdx, dir.firstMgrIdx + dir.teamManagers)
            if (dir.teamManagers <= 4) {
              return dirTeamMgrs.map((mgr, i) => {
                const cal = mgrCalibrated[dir.firstMgrIdx + i] ?? []
                const avgR = cal.length > 0 ? Math.round(cal.reduce((s, e) => s + e.displayReadiness, 0) / cal.length) : d.aiReadiness
                const ready = Math.round(mgr.employees * avgR / 100)
                return { name: mgr.manager, title: 'Team Manager', employees: mgr.employees, readiness: avgR, readyCount: ready, unrealizedValue: Math.round(d.unrealizedValue * mgr.employees / Math.max(1, d.employees)) }
              })
            } else {
              const targetSr = Math.max(2, Math.min(5, Math.round(dir.teamManagers / 3)))
              const perSr = Math.ceil(dir.teamManagers / targetSr)
              return Array.from({ length: targetSr }, (_, si) => {
                const batch = dirTeamMgrs.slice(si * perSr, (si + 1) * perSr)
                if (batch.length === 0) return null
                const empCount = batch.reduce((s, m) => s + m.employees, 0)
                const batchCal = batch.flatMap((_, bi) => mgrCalibrated[dir.firstMgrIdx + si * perSr + bi] ?? [])
                const avgR = batchCal.length > 0 ? Math.round(batchCal.reduce((s, e) => s + e.displayReadiness, 0) / batchCal.length) : d.aiReadiness
                const ready = Math.round(empCount * avgR / 100)
                const srNameIdx = nameHash(dir.name) * 5 + si * 11 + dir.firstMgrIdx
                return { name: demoManagerName(srNameIdx), title: SR_TITLES_TS[si % SR_TITLES_TS.length], employees: empCount, readiness: avgR, readyCount: ready, unrealizedValue: Math.round(d.unrealizedValue * empCount / Math.max(1, d.employees)) }
              }).filter(Boolean) as Array<{ name: string; title: string; employees: number; readiness: number; readyCount: number; unrealizedValue: number }>
            }
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
          const hrbpUpskillingDirNames = wfrState.upskillingLaunchSummary?.selectedDirectorNames
          const hrbpDirInUpskilling = (dirName: string) => !!hrbpUpskillingDirNames && hrbpUpskillingDirNames.includes(dirName)
          // Build the CTA card for the heroCard slot
          const hrbpShowFocusModule = true || hrbpDelegatedPending || hrbpCollecting || (hrbpCollectionComplete && !hrbpUpskillingActive) || (hrbpUpskillingActive && !hrbpPlansComplete)
          const hrbpFocusFirstModule = !hrbpShowFocusModule ? undefined : (
            <FocusFirstModule
              suppressCard={true}
              collectionActive={hrbpCollecting}
              collectionComplete={hrbpCollectionComplete}
              collectionJustCompleted={String(hrbpEffState) === '2b'}
              onCollectionActiveChange={() => {}}
              onCollectionComplete={completeHrbpCollection}
              onViewResults={() => {}}
              launchOpen={focusLaunchOpen}
              onLaunchOpenChange={setFocusLaunchOpen}
              onRequestCloseMetricSheet={() => setDashOpenMetric(null)}
              collectionLaunchSummary={hrbpCollecting || hrbpCollectionComplete ? {
                assignOwner: 'self' as const,
                scopeLabel: isHrbp ? (() => {
                  const inScope = directors.filter(dir => hrbpDirInScope(dir.name))
                  if (inScope.length === 0) return 'your teams'
                  if (inScope.length === 1) return `${inScope[0].name}'s team`
                  return `${inScope[0].name}'s team + ${inScope.length - 1} more`
                })() : hrbpName ?? '',
                channelsLabel: wfrState.hrbpStates?.[hrbpName ?? '']?.channelsLabel ?? 'AI Agent Interviews',
                delegated: !isHrbp,
                scopedDepartmentNames: [],
              } : null}
              onScrollToTable={() => {}}
              onStartUpskilling={() => {
                const inScope = directors.filter(dir => hrbpDirInScope(dir.name)).map(dir => dir.name)
                setHrbpUpskillingSelectedDirs(new Set(inScope))
                setHrbpUpskillingDialogOpen(true)
              }}
              upskillingActive={hrbpUpskillingActive}
              upskillingLaunchSummary={wfrState.upskillingLaunchSummary ?? null}
              isHrbp={isHrbp}
              hrbpPlansCreated={hrbpPlansComplete}
              hrbpDelegationPending={isHrbp && hrbpDelegatedPending}
              delegationDeptName={d.name}
              chroDelegationActive={!isHrbp && hrbpDelegatedPending}
              chroDelegationScopeLabel={hrbpName ?? undefined}
              gapPeopleOverride={dirTotalGap}
              suppressInternalDialog={isHrbp && hrbpDelegatedPending}
              justLaunched={hrbpJustLaunched}
            />
          )
          const hrbpUnrealizedValue = Math.round(d.unrealizedValue * headcount / Math.max(1, d.employees))
          const hrbpOverviewCards: Parameters<typeof WfrOverviewLayout>[0]['cards'] = [
            { id: 'ai-potential', icon: 'bolt', label: 'AI potential', value: `${d.aiPotential}%`, explainer: `How much of your team's daily work AI is capable of supporting.`, description: <span style={{ color: '#94a3b8' }}>{d.aiPotential}% AI potential across {headcount.toLocaleString()} employees</span>, tag: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '2px 8px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />Above industry median (38%)</span>, onLearnMore: () => setDashMetricInfoOpen(true) },
            { id: 'potential', icon: 'auto_awesome', label: 'Unrealized value', value: formatDollar(hrbpUnrealizedValue), description: <><span>The annual productivity value waiting to be captured.</span><span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}>{d.aiPotential}% AI potential across {headcount.toLocaleString()} employees</span></>, onLearnMore: () => setDashMetricInfoOpen(true) },
          ]
          // HRBP persona: use WfrOverviewLayout directly with table as children
          if (isHrbp) {
            return (
              <>
              <WfrOverviewLayout
                aiPotentialPct={d.aiPotential}
                aiReadinessPct={dirWeightedReadiness}
                totalEmployees={headcount}
                headline={<span className="wfr-dash__headline-text">Only <span className="wfr-dash__headline-pct wfr-text-readiness" style={{ fontSize: 'inherit' }}>{dirWeightedReadiness}%</span> of your team is AI-ready.</span>}
                subtitle={<>Your team has <span className="font-bold wfr-text-potential">{formatDollar(hrbpUnrealizedValue)}</span> in unrealized value.</>}
                pill={<>~<span className="font-bold text-[#b91c1c]">{dirTotalGap.toLocaleString()}</span> of your {headcount.toLocaleString()} employees are not yet AI-ready.</>}
                cards={hrbpOverviewCards}
                heroCta={(() => {
                  if (hrbpPlansComplete) return undefined
                  const hrbpCtaState: WfrDemoState = hrbpUpskillingActive ? 4 : hrbpCollectionComplete ? 3 : hrbpCollecting ? 2 : 1
                  const hrbpCtaPersona: WfrPersona = isHrbp ? 'hrbp' : 'chro'
                  const hrbpCtaClick = hrbpCtaState === 1
                    ? () => setFocusLaunchOpen(true)
                    : hrbpCtaState === 3 && isHrbp
                      ? () => { const inScope = directors.filter(dir => hrbpDirInScope(dir.name)).map(dir => dir.name); setHrbpUpskillingSelectedDirs(new Set(inScope)); setHrbpUpskillingDialogOpen(true) }
                      : undefined
                  return <WfrCtaBar content={WFR_CTA_CONTENT[hrbpCtaState][hrbpCtaPersona]} onButtonClick={hrbpCtaClick} />
                })()}
              >
                <div>
                  <div className="wfr-dash__panel-head">
                    <span className="wfr-dash__panel-title">Client managers <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 600, borderRadius: 8, padding: '1px 7px', marginLeft: 4, verticalAlign: 'middle' }}>{directors.length}</span></span>
                    <span className="wfr-dash__panel-hint">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        {showHrbpCollection && directors.some(dir => hrbpDirInScope(dir.name)) && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ display: 'inline-block', width: 3, height: 12, background: '#3b5bdb', borderRadius: 2, flexShrink: 0 }} />
                            <span>In data collection</span>
                          </span>
                        )}
                        {hrbpUpskillingActive && directors.some(dir => hrbpDirInUpskilling(dir.name)) && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ display: 'inline-block', width: 3, height: 12, background: '#6366f1', borderRadius: 2, flexShrink: 0 }} />
                            <span>In upskilling</span>
                          </span>
                        )}
                      </span>
                    </span>
                  </div>
                  <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                    <DataTableHeader>
                      <DataTableRow>
                        <DataTableHead style={{ width: '34%', cursor: 'pointer' }} onClick={() => toggleMgrSort('name')}><span className="inline-flex items-center gap-1">Manager <SortIcon sortDir={mgrSort.col === 'name' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('name')} /></span></DataTableHead>
                        <DataTableHead metric style={{ width: '14%', cursor: 'pointer' }} onClick={() => toggleMgrSort('readiness')}><span className="inline-flex items-center gap-1">Team AI adoption <SortIcon sortDir={mgrSort.col === 'readiness' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('readiness')} /></span></DataTableHead>
                        <DataTableHead numeric style={{ width: '16%', cursor: 'pointer' }} onClick={() => toggleMgrSort('potential')}><span className="inline-flex items-center gap-1">Unrealized value <button type="button" onClick={(e) => { e.stopPropagation(); setDashOpenMetric('potential') }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 14, color: '#94a3b8', verticalAlign: -1 }}>info</span></button><SortIcon sortDir={mgrSort.col === 'potential' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('potential')} /></span></DataTableHead>
                        <DataTableHead numeric style={{ width: '18%', cursor: 'pointer' }} onClick={() => toggleMgrSort('gap')}><span className="inline-flex items-center gap-1">Transformation gap <SortIcon sortDir={mgrSort.col === 'gap' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('gap')} /></span></DataTableHead>
                        {showHrbpCollection && <DataCollectionHead />}
                        {hrbpUpskillingActive && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '20%' }}>Upskilling status</DataTableHead>}
                      </DataTableRow>
                    </DataTableHeader>
                    <DataTableBody>
                      {(() => {
                        const sortedDirs = [...directors].sort((a, b) => {
                          if (hrbpUpskillingActive) {
                            const aIn = hrbpDirInUpskilling(a.name) ? 1 : 0
                            const bIn = hrbpDirInUpskilling(b.name) ? 1 : 0
                            if (aIn !== bIn) return bIn - aIn
                          } else if (showHrbpCollection) {
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
                        const dirScores = sortedDirs.map(dir => ({ key: dir.name, score: Math.round(d.unrealizedValue * dir.employees / Math.max(1, d.employees)) }))
                        const dirScoresSorted = [...dirScores].sort((a, b) => b.score - a.score)
                        const dirPriorityCount = Math.max(1, Math.round(dirScoresSorted.length * 0.3))
                        const dirPrioritySet = new Set(dirScoresSorted.slice(0, dirPriorityCount).map(r => r.key))
                        return sortedDirs.map((dir) => {
                          const notReady = dir.employees - dir.readyCount
                          const dirResponseRate = hrbpCollecting && !hrbpJustLaunched ? Math.max(5, Math.min(95, hrbpResponseRate + ((dir.name.length * 7) % 30) - 15)) : 0
                          return (
                            <DataTableRow
                              key={dir.name}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setDirectorData({ name: dir.name, title: dir.title, deptName: d.name, mgrIdxStart: dir.firstMgrIdx, mgrCount: dir.teamManagers, parentHrbp: hrbpName, readiness: dir.readiness })
                                setView('director')
                                window.scrollTo(0, 0)
                              }}
                            >
                              <DataTableCell className="font-semibold" style={
                                ((showHrbpCollection || hrbpCollectionComplete) && hrbpDirInScope(dir.name)) ? { borderLeft: '3px solid #3b5bdb', paddingLeft: 17 } :
                                (hrbpUpskillingActive && hrbpDirInUpskilling(dir.name)) ? { borderLeft: '3px solid #6366f1', paddingLeft: 17 } :
                                { borderLeft: '3px solid transparent', paddingLeft: 17 }
                              }>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <span className="text-[#3b5bdb] hover:underline">{dir.name}</span>
                                    {dirPrioritySet.has(dir.name) && (
                                      <PriorityTooltip tooltip="Top 30% by unrealized value — highest AI productivity potential in your scope">
                                        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>Priority</span>
                                      </PriorityTooltip>
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
                                      <button type="button" className={`wfr-dash__trend-badge ${deptTrendDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setHrbpTrendSheetDir({ manager: dir.name, mgrIndex: dir.firstMgrIdx, readiness: dir.readiness, dept: d, directReports: computeDirDirectReports(dir) }) }} title="View readiness trend details">
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
                              <DataTableCell align="right"><button type="button" onClick={(e) => { e.stopPropagation(); setUvSheetData({ label: dir.name, subtitle: `${d.name} · Director · ${dir.employees.toLocaleString()} employees`, aiPotential: d.aiPotential, headcount: dir.employees, unrealizedValue: Math.round(d.unrealizedValue * dir.employees / Math.max(1, d.employees)) }) }} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 13, fontWeight: 700, color: '#3b5bdb', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(Math.round(d.unrealizedValue * dir.employees / Math.max(1, d.employees)))}</button></DataTableCell>
                              <DataTableCell align="right">
                                <div className="tabular-nums" style={{ textAlign: 'right' }}>
                                  <span className="wfr-type-h6">{notReady.toLocaleString()} ({dir.employees > 0 ? Math.round((notReady / dir.employees) * 100) : 0}%)</span>
                                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {dir.employees.toLocaleString()}</div>
                                </div>
                              </DataTableCell>
                              {showHrbpCollection && (
                                hrbpDelegatedPending
                                  ? <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}><HrbpStatusPill state={1} delegated /><span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>Sent Apr 5, 2026</span></div></DataTableCell>
                                  : <DataCollectionProgressCell rate={hrbpDirInScope(dir.name) ? dirResponseRate : 0} inScope={hrbpDirInScope(dir.name)} />
                              )}
                              {hrbpUpskillingActive && (
                                hrbpDirInUpskilling(dir.name) ? (() => {
                                  const nh2 = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
                                  const dirPlanPct = hrbpPlansComplete ? Math.min(90, 45 + (nh2(dir.name) % 45)) : 0
                                  return <UpskillingProgressCell total={dir.employees} pct={dirPlanPct} plansComplete={hrbpPlansComplete} nameHash={nh2(dir.name)} />
                                })() : <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><span style={{ color: '#94a3b8' }}>—</span></DataTableCell>
                              )}
                            </DataTableRow>
                          )
                        })
                      })()}
                    </DataTableBody>
                  </DataTable>
                </div>
                {hrbpUpskillingDialogOpen && (() => {
                  const eligibleDirs = directors.filter(dir => hrbpDirInScope(dir.name))
                  const allDirScores = directors.map(dir => ({
                    dir,
                    score: Math.round(d.unrealizedValue * dir.employees / Math.max(1, d.employees)),
                  })).sort((a, b) => b.score - a.score)
                  const priorityCount = Math.max(1, Math.round(allDirScores.length * 0.3))
                  const priorityNames = new Set(allDirScores.slice(0, priorityCount).map(r => r.dir.name))
                  const sortedDirs = eligibleDirs.sort((a, b) => {
                    const scoreA = Math.round(d.unrealizedValue * a.employees / Math.max(1, d.employees))
                    const scoreB = Math.round(d.unrealizedValue * b.employees / Math.max(1, d.employees))
                    return scoreB - scoreA
                  })
                  const selectedCount = hrbpUpskillingSelectedDirs.size
                  const totalGapSelected = sortedDirs.filter(dir => hrbpUpskillingSelectedDirs.has(dir.name)).reduce((s, dir) => s + (dir.employees - dir.readyCount), 0)
                  return createPortal(
                    <>
                      <div className="wfr-focus-launch__overlay" onClick={() => setHrbpUpskillingDialogOpen(false)} />
                      <div className="wfr-focus-launch__content">
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
                          <p className="wfr-focus-launch__sub">Only teams that completed data collection are eligible. Priority teams have the highest unrealized value.</p>
                          <div className="wfr-focus-launch__dept-list" style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', gap: 10, padding: '0 14px 4px', fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', alignItems: 'center' }}>
                              <span
                                className="wfr-focus-launch__check"
                                style={{ cursor: 'pointer', ...(selectedCount === sortedDirs.length ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}) }}
                                onClick={() => setHrbpUpskillingSelectedDirs(selectedCount === sortedDirs.length ? new Set() : new Set(sortedDirs.map(dir => dir.name)))}
                              >{selectedCount === sortedDirs.length ? '✓' : ''}</span>
                              <span style={{ flex: 1 }}>Manager</span>
                              <span style={{ width: 80, textAlign: 'right' }}>AI adoption</span>
                              <span style={{ width: 90, textAlign: 'right' }}>Unrealized value</span>
                              <span style={{ width: 120, textAlign: 'right' }}>Transformation gap</span>
                            </div>
                            {sortedDirs.map(dir => {
                              const checked = hrbpUpskillingSelectedDirs.has(dir.name)
                              const gap = dir.employees - dir.readyCount
                              const isPriority = priorityNames.has(dir.name)
                              const dirUnrealized = Math.round(d.unrealizedValue * dir.employees / Math.max(1, d.employees))
                              return (
                                <button key={dir.name} type="button"
                                  className={`wfr-focus-launch__dept-row ${checked ? 'wfr-focus-launch__dept-row--on' : ''}`}
                                  style={{ alignItems: 'center' }}
                                  onClick={() => setHrbpUpskillingSelectedDirs(prev => {
                                    const next = new Set(prev)
                                    if (next.has(dir.name)) next.delete(dir.name); else next.add(dir.name)
                                    return next
                                  })}>
                                  <span className="wfr-focus-launch__check">{checked ? '✓' : ''}</span>
                                  <span className="wfr-focus-launch__dept-name" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    {dir.name}
                                    {isPriority && <PriorityTooltip tooltip="Top 30% by unrealized value — recommended to start here for most impact"><span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>Priority</span></PriorityTooltip>}
                                  </span>
                                  <span style={{ width: 80, textAlign: 'right', fontSize: 12, color: '#475569', fontWeight: 600 }}>{dir.readiness ?? 0}%</span>
                                  <span style={{ width: 90, textAlign: 'right', fontSize: 12, color: '#475569', fontWeight: 600 }}>{formatDollar(dirUnrealized)}</span>
                                  <span style={{ width: 120, textAlign: 'right', fontSize: 12, color: '#475569', fontWeight: 600 }}>{gap.toLocaleString()} ({dir.employees > 0 ? Math.round((gap / dir.employees) * 100) : 0}%)</span>
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
                          <Button variant="primary" disabled={selectedCount === 0}
                            onClick={() => {
                              setHrbpUpskillingDialogOpen(false)
                              startUpskilling({
                                assignOwner: 'hrbp',
                                departmentNames: [d.name],
                                scopeLabel: hrbpName ?? d.name,
                                delegated: false,
                                totalEmployees: totalGapSelected,
                                selectedDirectorNames: sortedDirs.filter(dir => hrbpUpskillingSelectedDirs.has(dir.name)).map(dir => dir.name),
                              })
                            }}>
                            Start upskilling&nbsp;→
                          </Button>
                        </div>
                      </div>
                    </>,
                    document.body,
                  )
                })()}
              </WfrOverviewLayout>
              {hrbpFocusFirstModule}
              {hrbpDelegatedPending && (
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
          }

          // CHRO persona: use PersonDetailLayout with full chrome
          return (
            <>
            <PersonDetailLayout
              heroCard={(() => {
                if (hrbpPlansComplete) return undefined
                const hrbpCtaState: WfrDemoState = hrbpUpskillingActive ? 4 : hrbpCollectionComplete ? 3 : hrbpCollecting ? 2 : 1
                const hrbpCtaClick = hrbpCtaState === 3
                  ? () => { const inScope = directors.filter(dir => hrbpDirInScope(dir.name)).map(dir => dir.name); setHrbpUpskillingSelectedDirs(new Set(inScope)); setHrbpUpskillingDialogOpen(true) }
                  : undefined
                return <WfrCtaBar content={WFR_CTA_CONTENT[hrbpCtaState]['chro']} onButtonClick={hrbpCtaClick} />
              })()}
              breadcrumb={(
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink onClick={() => { setView('board'); setHrbpName(null) }}>Overview</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage><span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: -3, marginRight: 4 }}>shield_person</span>{hrbpName}</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              )}
              name={hrbpName ?? ''}
              subtitle={`HRBP · ${d.name} · ${headcount.toLocaleString()} of ${d.employees.toLocaleString()} employees`}
              aiPotential={{ value: `${d.aiPotential}%`, explainer: `How much of this team's daily work AI is capable of supporting.`, description: <span style={{ color: '#94a3b8' }}>{d.aiPotential}% AI potential across {d.employees.toLocaleString()} employees</span>, tag: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '2px 8px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />Above industry median (38%)</span>, onLearnMore: () => setDashMetricInfoOpen(true) }}
              potential={{ value: formatDollar(Math.round(d.unrealizedValue * headcount / Math.max(1, d.employees))), description: 'BLS median wages \u00d7 weekly hours unlocked', onLearnMore: () => setDashMetricInfoOpen(true) }}
              tableTitle={<>Client managers <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 600, borderRadius: 8, padding: '1px 7px', marginLeft: 4, verticalAlign: 'middle' }}>{directors.length}</span></>}
              tableHint={
                (showHrbpCollection || hrbpCollectionComplete) && directors.some(dir => hrbpDirInScope(dir.name))
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ display: 'inline-block', width: 3, height: 12, background: '#3b5bdb', borderRadius: 2, flexShrink: 0 }} />
                      <span>{hrbpUpskillingActive ? 'In upskilling' : 'In data collection'}</span>
                    </span>
                  : null
              }
            >
              <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead style={{ width: '34%', cursor: 'pointer' }} onClick={() => toggleMgrSort('name')}><span className="inline-flex items-center gap-1">Manager <SortIcon sortDir={mgrSort.col === 'name' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('name')} /></span></DataTableHead>
                    <DataTableHead metric style={{ width: '14%', cursor: 'pointer' }} onClick={() => toggleMgrSort('readiness')}><span className="inline-flex items-center gap-1">Team AI adoption <SortIcon sortDir={mgrSort.col === 'readiness' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('readiness')} /></span></DataTableHead>
                    <DataTableHead numeric style={{ width: '16%', cursor: 'pointer' }} onClick={() => toggleMgrSort('potential')}><span className="inline-flex items-center gap-1">Unrealized value <button type="button" onClick={(e) => { e.stopPropagation(); setDashOpenMetric('potential') }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 14, color: '#94a3b8', verticalAlign: -1 }}>info</span></button><SortIcon sortDir={mgrSort.col === 'potential' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('potential')} /></span></DataTableHead>
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
                      score: Math.round(d.unrealizedValue * dir.employees / Math.max(1, d.employees)),
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
                            setDirectorData({ name: dir.name, title: dir.title, deptName: d.name, mgrIdxStart: dir.firstMgrIdx, mgrCount: dir.teamManagers, parentHrbp: hrbpName, readiness: dir.readiness })
                            setView('director')
                            window.scrollTo(0, 0)
                          }}
                        >
                          <DataTableCell className="font-semibold" style={(showHrbpCollection || hrbpCollectionComplete) && hrbpDirInScope(dir.name) ? { borderLeft: '3px solid #3b5bdb', paddingLeft: 17 } : { borderLeft: '3px solid transparent', paddingLeft: 17 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span className="text-[#3b5bdb] hover:underline">{dir.name}</span>
                                {dirPrioritySet.has(dir.name) && (
                                  <PriorityTooltip tooltip="Top 30% by unrealized value — highest AI productivity potential in your scope">
                                    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>
                                      Priority
                                    </span>
                                  </PriorityTooltip>
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
                                  <button type="button" className={`wfr-dash__trend-badge ${deptTrendDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`} onClick={(e) => { e.stopPropagation(); setHrbpTrendSheetDir({ manager: dir.name, mgrIndex: dir.firstMgrIdx, readiness: dir.readiness, dept: d, directReports: computeDirDirectReports(dir) }) }} title="View readiness trend details">
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
                          <DataTableCell align="right"><button type="button" onClick={(e) => { e.stopPropagation(); setUvSheetData({ label: dir.name, subtitle: `${d.name} · Director · ${dir.employees.toLocaleString()} employees`, aiPotential: d.aiPotential, headcount: dir.employees, unrealizedValue: Math.round(d.unrealizedValue * dir.employees / Math.max(1, d.employees)) }) }} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 13, fontWeight: 700, color: '#3b5bdb', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(Math.round(d.unrealizedValue * dir.employees / Math.max(1, d.employees)))}</button></DataTableCell>
                          <DataTableCell align="right">
                            <div className="tabular-nums" style={{ textAlign: 'right' }}>
                              <span className="wfr-type-h6">{notReady.toLocaleString()} ({dir.employees > 0 ? Math.round((notReady / dir.employees) * 100) : 0}%)</span>
                              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {dir.employees.toLocaleString()}</div>
                            </div>
                          </DataTableCell>
                          {showHrbpCollection && (
                            hrbpDelegatedPending
                              ? <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}><HrbpStatusPill state={1} delegated /><span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>Sent Apr 5, 2026</span></div></DataTableCell>
                              : <DataCollectionProgressCell rate={hrbpDirInScope(dir.name) ? dirResponseRate : 0} inScope={hrbpDirInScope(dir.name)} />
                          )}
                          {hrbpUpskillingActive && (
                            hrbpDirInScope(dir.name) ? (() => {
                              const nh2 = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
                              const dirPlanPct = hrbpPlansComplete ? Math.min(90, 45 + (nh2(dir.name) % 45)) : 0
                              return <UpskillingProgressCell total={dir.employees} pct={dirPlanPct} plansComplete={hrbpPlansComplete} nameHash={nh2(dir.name)} />
                            })() : <DataTableCell metric className="bg-[#fafbfc] border-l border-[#e2e8f0]"><span style={{ color: '#94a3b8' }}>—</span></DataTableCell>
                          )}
                        </DataTableRow>
                      )
                    })
                  })()}
                </DataTableBody>
              </DataTable>
            </PersonDetailLayout>
            {hrbpFocusFirstModule}
            {hrbpUpskillingDialogOpen && (() => {
              // Only directors who participated in data collection are eligible for upskilling
              const eligibleDirs = directors.filter(dir => hrbpDirInScope(dir.name))
              // Priority is based on ALL directors (same as table), not just eligible subset
              const allDirScores = directors.map(dir => ({
                dir,
                score: Math.round(d.unrealizedValue * dir.employees / Math.max(1, d.employees)),
              })).sort((a, b) => b.score - a.score)
              const priorityCount = Math.max(1, Math.round(allDirScores.length * 0.3))
              const priorityNames = new Set(allDirScores.slice(0, priorityCount).map(r => r.dir.name))
              const sortedDirs = eligibleDirs.sort((a, b) => {
                const scoreA = Math.round(d.unrealizedValue * a.employees / Math.max(1, d.employees))
                const scoreB = Math.round(d.unrealizedValue * b.employees / Math.max(1, d.employees))
                return scoreB - scoreA
              })
              const selectedCount = hrbpUpskillingSelectedDirs.size
              const totalGapSelected = sortedDirs
                .filter(dir => hrbpUpskillingSelectedDirs.has(dir.name))
                .reduce((s, dir) => s + (dir.employees - dir.readyCount), 0)
              return createPortal(
                <>
                  <div className="wfr-focus-launch__overlay" onClick={() => setHrbpUpskillingDialogOpen(false)} />
                  <div className="wfr-focus-launch__content">
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
                      <p className="wfr-focus-launch__sub">Only teams that completed data collection are eligible. Priority teams have the highest unrealized value.</p>
                      <div className="wfr-focus-launch__dept-list" style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', gap: 10, padding: '0 14px 4px', fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', alignItems: 'center' }}>
                          <span
                            className="wfr-focus-launch__check"
                            style={{ cursor: 'pointer', ...(selectedCount === sortedDirs.length ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}) }}
                            onClick={() => setHrbpUpskillingSelectedDirs(selectedCount === sortedDirs.length ? new Set() : new Set(sortedDirs.map(dir => dir.name)))}
                          >{selectedCount === sortedDirs.length ? '✓' : ''}</span>
                          <span style={{ flex: 1 }}>Manager</span>
                          <span style={{ width: 80, textAlign: 'right' }}>AI adoption</span>
                          <span style={{ width: 90, textAlign: 'right' }}>Unrealized value</span>
                          <span style={{ width: 120, textAlign: 'right' }}>Transformation gap</span>
                        </div>
                        {sortedDirs.map(dir => {
                          const checked = hrbpUpskillingSelectedDirs.has(dir.name)
                          const gap = dir.employees - dir.readyCount
                          const isPriority = priorityNames.has(dir.name)
                          const dirUnrealized = Math.round(d.unrealizedValue * dir.employees / Math.max(1, d.employees))
                          return (
                            <button
                              key={dir.name}
                              type="button"
                              className={`wfr-focus-launch__dept-row ${checked ? 'wfr-focus-launch__dept-row--on' : ''}`}
                              style={{ alignItems: 'center' }}
                              onClick={() => setHrbpUpskillingSelectedDirs(prev => {
                                const next = new Set(prev)
                                if (next.has(dir.name)) next.delete(dir.name); else next.add(dir.name)
                                return next
                              })}
                            >
                              <span className="wfr-focus-launch__check">{checked ? '✓' : ''}</span>
                              <span className="wfr-focus-launch__dept-name" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                {dir.name}
                                {isPriority && <PriorityTooltip tooltip="Top 30% by unrealized value — recommended to start here for most impact"><span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>Priority</span></PriorityTooltip>}
                              </span>
                              <span style={{ width: 80, textAlign: 'right', fontSize: 12, color: '#475569', fontWeight: 600 }}>{dir.readiness ?? 0}%</span>
                              <span style={{ width: 90, textAlign: 'right', fontSize: 12, color: '#475569', fontWeight: 600 }}>{formatDollar(dirUnrealized)}</span>
                              <span style={{ width: 120, textAlign: 'right', fontSize: 12, color: '#475569', fontWeight: 600 }}>{gap.toLocaleString()} ({dir.employees > 0 ? Math.round((gap / dir.employees) * 100) : 0}%)</span>
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
                            selectedDirectorNames: sortedDirs.filter(dir => hrbpUpskillingSelectedDirs.has(dir.name)).map(dir => dir.name),
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
          const { collectionComplete: dirCollComplete, upskillingActive: dirUpskillingActive, hrbpPlansCreated: dirPlansComplete } = deriveWfrFlags(dirEffState)
          // Gate collection/upskilling display on whether this director participated in data collection
          const dirSelectedDirs = wfrState.hrbpStates?.[directorData.parentHrbp]?.selectedDirectors
          const dirInScope = !dirSelectedDirs || dirSelectedDirs.includes(directorData.name)
          const effDirCollComplete = dirCollComplete && dirInScope
          const effDirPlansComplete = dirPlansComplete && dirInScope
          const dirHrbpCollecting = stateNum(dirEffState) >= 2 && !dirCollComplete
          const dirShowCollection = dirHrbpCollecting && dirInScope

          const dirTrend = deptReadinessTrend(d.name)
          // Use the director's actual weighted avg readiness (from the directors array) for consistency with the table
          const dirBaseReadiness = directorData.readiness ?? d.aiReadiness
          const dirMeasuredReadiness = effDirCollComplete ? Math.min(100, dirBaseReadiness + dirTrend.delta) : dirBaseReadiness

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
            // Use avg-readiness-based readyCount for consistency with the table adoption bars
            const ready = Math.round(mgr.employees * readiness / 100)
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
                    {!isHrbp && (<><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink onClick={() => { setHrbpName(directorData.parentHrbp); setView('hrbp'); setDirectorData(null) }}><span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: -3, marginRight: 4 }}>shield_person</span>{directorData.parentHrbp}</BreadcrumbLink></BreadcrumbItem></>)}
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>{directorData.name}</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              }
              name={directorData.name}
              subtitle={`${directorData.title} · ${d.name} · ${dirHeadcount.toLocaleString()} employees`}
              aiPotential={{ value: `${d.aiPotential}%`, explainer: `How much of this team's daily work AI is capable of supporting.`, description: <span style={{ color: '#94a3b8' }}>{d.aiPotential}% AI potential across {d.employees.toLocaleString()} employees</span>, tag: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '2px 8px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />Above industry median (38%)</span>, onLearnMore: () => setDashMetricInfoOpen(true) }}
              potential={{ value: formatDollar(Math.round(d.unrealizedValue * dirHeadcount / Math.max(1, d.employees))), description: 'BLS median wages \u00d7 weekly hours unlocked', onLearnMore: () => setDashMetricInfoOpen(true) }}
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
                        <DataTableHead numeric style={{ width: '16%' }} />
                        <DataTableHead numeric style={{ width: '18%' }}>Transformation gap</DataTableHead>
                        {effDirCollComplete && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '20%' }}>Upskilling status</DataTableHead>}
                      </DataTableRow>
                    </DataTableHeader>
                    <DataTableBody>
                      <DataTableRow>
                        <DataTableCell className="font-semibold" style={dirShowCollection ? { borderLeft: '3px solid #3b5bdb', paddingLeft: 17 } : (dirUpskillingActive && dirInScope) ? { borderLeft: '3px solid #6366f1', paddingLeft: 17 } : { borderLeft: '3px solid transparent', paddingLeft: 17 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <PersonAvatar name={directorData.name} size={32} />
                            <div>
                              <div>{directorData.name}</div>
                              <div className="text-[#94a3b8] text-[11px] font-normal">{directorData.title} · {d.name}</div>
                            </div>
                          </div>
                        </DataTableCell>
                        <DataTableCell metric>
                          <div>
                            {effDirCollComplete && trendDelta !== 0 ? (
                              <div className="wfr-dash__readiness-with-trend">
                                <DeptTableSoloBar variant="readiness" pct={dirMeasuredReadiness} />
                                <span className={`wfr-dash__trend-badge ${trendDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`}>
                                  <span className="wfr-dash__trend-badge-text">{trendDelta >= 0 ? '↑' : '↓'}{Math.abs(trendDelta)}pt</span>
                                </span>
                              </div>
                            ) : <DeptTableSoloBar variant="readiness" pct={dirMeasuredReadiness} />}
                          </div>
                        </DataTableCell>
                        <DataTableCell />
                        <DataTableCell align="right">
                          <span style={{ color: dirMeasuredReadiness >= 50 ? '#15803d' : '#dc2626', fontWeight: 600 }}>{dirMeasuredReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}</span>
                        </DataTableCell>
                        {effDirCollComplete && <DevPlanAssignCell planPct={effDirPlansComplete ? 100 : 0} plansComplete={effDirPlansComplete} />}
                      </DataTableRow>
                    </DataTableBody>
                  </DataTable>
                ),
              }}
              tableTitle={teamMgrs.length > 4
                ? (() => {
                    const targetSr = Math.max(2, Math.min(5, Math.round(teamMgrs.length / 3)))
                    return <><span>Teams</span> <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 600, borderRadius: 8, padding: '1px 7px', marginLeft: 4, verticalAlign: 'middle' }}>{targetSr}</span></>
                  })()
                : <><span>Team managers</span> <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 600, borderRadius: 8, padding: '1px 7px', marginLeft: 4, verticalAlign: 'middle' }}>{teamMgrs.length}</span></>
              }
              tableHint={
                dirShowCollection
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ display: 'inline-block', width: 3, height: 12, background: '#3b5bdb', borderRadius: 2, flexShrink: 0 }} />
                      <span>In data collection</span>
                    </span>
                  : (dirUpskillingActive && dirInScope)
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ display: 'inline-block', width: 3, height: 12, background: '#6366f1', borderRadius: 2, flexShrink: 0 }} />
                        <span>In upskilling</span>
                      </span>
                    : null
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
                        <DataTableHead numeric style={{ width: '16%', cursor: 'pointer' }} onClick={() => toggleMgrSort('potential')}><span className="inline-flex items-center gap-1">Unrealized value <button type="button" onClick={(e) => { e.stopPropagation(); setDashOpenMetric('potential') }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 14, color: '#94a3b8', verticalAlign: -1 }}>info</span></button><SortIcon sortDir={mgrSort.col === 'potential' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('potential')} /></span></DataTableHead>
                        <DataTableHead numeric style={{ width: '18%', cursor: 'pointer' }} onClick={() => toggleMgrSort('gap')}><span className="inline-flex items-center gap-1">Transformation gap <SortIcon sortDir={mgrSort.col === 'gap' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('gap')} /></span></DataTableHead>
                        {effDirCollComplete && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '20%' }}>Upskilling status</DataTableHead>}
                      </DataTableRow>
                    </DataTableHeader>
                    <DataTableBody>
                      {[...seniorMgrs].sort((a, b) => { const mul = mgrSort.dir === 'asc' ? 1 : -1; switch (mgrSort.col) { case 'name': return mul * a.name.localeCompare(b.name); case 'readiness': return mul * (a.readiness - b.readiness); case 'potential': return mul * (a.employees - b.employees); case 'gap': return mul * ((a.employees - a.readyCount) - (b.employees - b.readyCount)); default: return 0 } }).map(sr => {
                        const notReady = sr.employees - sr.readyCount
                        const srPlanPct = effDirPlansComplete ? Math.min(90, 45 + (nh(sr.name) % 45)) : 0
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
                                readiness: sr.readiness,
                                parentDirector: directorData,
                              })
                              setView('seniorMgr')
                              window.scrollTo(0, 0)
                            }}
                          >
                            <DataTableCell className="font-semibold" style={dirShowCollection ? { borderLeft: '3px solid #3b5bdb', paddingLeft: 17 } : (dirUpskillingActive && dirInScope) ? { borderLeft: '3px solid #6366f1', paddingLeft: 17 } : { borderLeft: '3px solid transparent', paddingLeft: 17 }}>
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
                            <DataTableCell align="right"><button type="button" onClick={(e) => { e.stopPropagation(); setUvSheetData({ label: sr.name, subtitle: `${d.name} · Senior Manager · ${sr.employees.toLocaleString()} employees`, aiPotential: d.aiPotential, headcount: sr.employees, unrealizedValue: Math.round(d.unrealizedValue * sr.employees / Math.max(1, d.employees)) }) }} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 13, fontWeight: 700, color: '#3b5bdb', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(Math.round(d.unrealizedValue * sr.employees / Math.max(1, d.employees)))}</button></DataTableCell>
                            <DataTableCell align="right">
                              <div className="tabular-nums" style={{ textAlign: 'right' }}>
                                <span className="wfr-type-h6">{notReady.toLocaleString()} ({sr.employees > 0 ? Math.round((notReady / sr.employees) * 100) : 0}%)</span>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {sr.employees.toLocaleString()}</div>
                              </div>
                            </DataTableCell>
                            {effDirCollComplete && <UpskillingProgressCell total={sr.employees} pct={srPlanPct} plansComplete={effDirPlansComplete} nameHash={nh(sr.name)} />}
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
                    <DataTableHead numeric style={{ width: '16%', cursor: 'pointer' }} onClick={() => toggleMgrSort('potential')}><span className="inline-flex items-center gap-1">Unrealized value <button type="button" onClick={(e) => { e.stopPropagation(); setDashOpenMetric('potential') }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 14, color: '#94a3b8', verticalAlign: -1 }}>info</span></button><SortIcon sortDir={mgrSort.col === 'potential' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('potential')} /></span></DataTableHead>
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
                    const mgrPlanPct = effDirPlansComplete ? Math.min(90, 45 + (nh(mgr.manager) % 45)) : 0
                    return (
                      <DataTableRow
                        key={`${mgr.manager}-${globalIdx}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/workforce/manager/${encodeURIComponent(mgr.manager)}?dept=${encodeURIComponent(d.name)}&mgrIdx=${globalIdx}&director=${encodeURIComponent(directorData.name)}&parentHrbp=${encodeURIComponent(directorData.parentHrbp)}`)}
                      >
                        <DataTableCell className="font-semibold" style={dirShowCollection ? { borderLeft: '3px solid #3b5bdb', paddingLeft: 17 } : (dirUpskillingActive && dirInScope) ? { borderLeft: '3px solid #6366f1', paddingLeft: 17 } : { borderLeft: '3px solid transparent', paddingLeft: 17 }}>
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
                        <DataTableCell align="right"><button type="button" onClick={(e) => { e.stopPropagation(); setUvSheetData({ label: mgr.manager, subtitle: `${d.name} · Manager · ${mgr.employees.toLocaleString()} employees`, aiPotential: d.aiPotential, headcount: mgr.employees, unrealizedValue: Math.round(d.unrealizedValue * mgr.employees / Math.max(1, d.employees)) }) }} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 13, fontWeight: 700, color: '#3b5bdb', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(Math.round(d.unrealizedValue * mgr.employees / Math.max(1, d.employees)))}</button></DataTableCell>
                        <DataTableCell align="right">
                          <div className="tabular-nums" style={{ textAlign: 'right' }}>
                            <span className="wfr-type-h6">{notReady.toLocaleString()} ({mgr.employees > 0 ? Math.round((notReady / mgr.employees) * 100) : 0}%)</span>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {mgr.employees.toLocaleString()}</div>
                          </div>
                        </DataTableCell>
                        {effDirCollComplete && <UpskillingProgressCell total={mgr.employees} pct={mgrPlanPct} plansComplete={effDirPlansComplete} nameHash={nh(mgr.manager)} />}
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
          const { collectionComplete: srCollComplete, upskillingActive: srUpskillingActive, hrbpPlansCreated: srPlansComplete } = deriveWfrFlags(srEffState)
          // Gate on parent director's scope
          const srParentDirSelectedDirs = wfrState.hrbpStates?.[seniorMgrData.parentDirector.parentHrbp]?.selectedDirectors
          const srDirInScope = !srParentDirSelectedDirs || srParentDirSelectedDirs.includes(seniorMgrData.parentDirector.name)
          const effSrCollComplete = srCollComplete && srDirInScope
          const effSrPlansComplete = srPlansComplete && srDirInScope
          const srHrbpCollecting = stateNum(srEffState) >= 2 && !srCollComplete
          const srShowCollection = srHrbpCollecting && srDirInScope

          const srTrend = deptReadinessTrend(d.name)
          const srBaseReadiness = seniorMgrData.readiness ?? d.aiReadiness
          const srMeasuredReadiness = effSrCollComplete ? Math.min(100, srBaseReadiness + srTrend.delta) : srBaseReadiness
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
            const ready = Math.round(mgr.employees * readiness / 100)
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
                    {!isHrbp && (<><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink onClick={() => { setHrbpName(seniorMgrData.parentDirector.parentHrbp); setView('hrbp'); setDirectorData(null); setSeniorMgrData(null) }}><span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: -3, marginRight: 4 }}>shield_person</span>{seniorMgrData.parentDirector.parentHrbp}</BreadcrumbLink></BreadcrumbItem></>)}
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink onClick={() => { setDirectorData(seniorMgrData.parentDirector); setView('director'); setSeniorMgrData(null) }}>{seniorMgrData.parentDirector.name}</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>{seniorMgrData.name}</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              }
              name={seniorMgrData.name}
              subtitle={`${seniorMgrData.title} · ${d.name} · ${srHeadcount.toLocaleString()} employees`}
              aiPotential={{ value: `${d.aiPotential}%`, explainer: `How much of this team's daily work AI is capable of supporting.`, description: <span style={{ color: '#94a3b8' }}>{d.aiPotential}% AI potential across {d.employees.toLocaleString()} employees</span>, tag: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '2px 8px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />Above industry median (38%)</span>, onLearnMore: () => setDashMetricInfoOpen(true) }}
              potential={{ value: formatDollar(Math.round(d.unrealizedValue * srHeadcount / Math.max(1, d.employees))), description: 'BLS median wages \u00d7 weekly hours unlocked', onLearnMore: () => setDashMetricInfoOpen(true) }}
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
                        <DataTableHead numeric style={{ width: '16%' }} />
                        <DataTableHead numeric style={{ width: '18%' }}>Transformation gap</DataTableHead>
                        {effSrCollComplete && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ whiteSpace: 'nowrap', width: '20%' }}>Upskilling status</DataTableHead>}
                      </DataTableRow>
                    </DataTableHeader>
                    <DataTableBody>
                      <DataTableRow>
                        <DataTableCell className="font-semibold" style={srShowCollection ? { borderLeft: '3px solid #3b5bdb', paddingLeft: 17 } : (srUpskillingActive && srDirInScope) ? { borderLeft: '3px solid #6366f1', paddingLeft: 17 } : { borderLeft: '3px solid transparent', paddingLeft: 17 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <PersonAvatar name={seniorMgrData.name} size={32} />
                            <div>
                              <div>{seniorMgrData.name}</div>
                              <div className="text-[#94a3b8] text-[11px] font-normal">{seniorMgrData.title} · {d.name}</div>
                            </div>
                          </div>
                        </DataTableCell>
                        <DataTableCell metric>
                          <div>
                            {effSrCollComplete && tDelta !== 0 ? (
                              <div className="wfr-dash__readiness-with-trend">
                                <DeptTableSoloBar variant="readiness" pct={srMeasuredReadiness} />
                                <span className={`wfr-dash__trend-badge ${tDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`}>
                                  <span className="wfr-dash__trend-badge-text">{tDelta >= 0 ? '↑' : '↓'}{Math.abs(tDelta)}pt</span>
                                </span>
                              </div>
                            ) : <DeptTableSoloBar variant="readiness" pct={srMeasuredReadiness} />}
                          </div>
                        </DataTableCell>
                        <DataTableCell />
                        <DataTableCell align="right">
                          <span style={{ color: srMeasuredReadiness >= 50 ? '#15803d' : '#dc2626', fontWeight: 600 }}>{srMeasuredReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}</span>
                        </DataTableCell>
                        {effSrCollComplete && <DevPlanAssignCell planPct={effSrPlansComplete ? 100 : 0} plansComplete={effSrPlansComplete} />}
                      </DataTableRow>
                    </DataTableBody>
                  </DataTable>
                ),
              }}
              tableTitle={<><span>Team managers</span> <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 600, borderRadius: 8, padding: '1px 7px', marginLeft: 4, verticalAlign: 'middle' }}>{teamMgrs.length}</span></>}
              tableHint={
                srShowCollection
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ display: 'inline-block', width: 3, height: 12, background: '#3b5bdb', borderRadius: 2, flexShrink: 0 }} />
                      <span>In data collection</span>
                    </span>
                  : (srUpskillingActive && srDirInScope)
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ display: 'inline-block', width: 3, height: 12, background: '#6366f1', borderRadius: 2, flexShrink: 0 }} />
                        <span>In upskilling</span>
                      </span>
                    : null
              }
            >
              <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead style={{ width: '34%', cursor: 'pointer' }} onClick={() => toggleMgrSort('name')}><span className="inline-flex items-center gap-1">Manager <SortIcon sortDir={mgrSort.col === 'name' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('name')} /></span></DataTableHead>
                    <DataTableHead metric style={{ width: '14%', cursor: 'pointer' }} onClick={() => toggleMgrSort('readiness')}><span className="inline-flex items-center gap-1">Team AI adoption <SortIcon sortDir={mgrSort.col === 'readiness' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('readiness')} /></span></DataTableHead>
                    <DataTableHead numeric style={{ width: '16%', cursor: 'pointer' }} onClick={() => toggleMgrSort('potential')}><span className="inline-flex items-center gap-1">Unrealized value <button type="button" onClick={(e) => { e.stopPropagation(); setDashOpenMetric('potential') }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 14, color: '#94a3b8', verticalAlign: -1 }}>info</span></button><SortIcon sortDir={mgrSort.col === 'potential' ? mgrSort.dir : null} onSortClick={() => toggleMgrSort('potential')} /></span></DataTableHead>
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
                    const mgrPlanPct = effSrPlansComplete ? Math.min(90, 45 + (nh2(mgr.manager) % 45)) : 0
                    return (
                      <DataTableRow
                        key={`${mgr.manager}-${globalIdx}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/workforce/manager/${encodeURIComponent(mgr.manager)}?dept=${encodeURIComponent(d.name)}&mgrIdx=${globalIdx}&director=${encodeURIComponent(seniorMgrData.parentDirector.name)}&parentHrbp=${encodeURIComponent(seniorMgrData.parentDirector.parentHrbp)}&seniorMgr=${encodeURIComponent(seniorMgrData.name)}&srStart=${seniorMgrData.mgrIdxStart - seniorMgrData.parentDirector.mgrIdxStart}`)}
                      >
                        <DataTableCell className="font-semibold" style={srShowCollection ? { borderLeft: '3px solid #3b5bdb', paddingLeft: 17 } : (srUpskillingActive && srDirInScope) ? { borderLeft: '3px solid #6366f1', paddingLeft: 17 } : { borderLeft: '3px solid transparent', paddingLeft: 17 }}>
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
                        <DataTableCell align="right"><button type="button" onClick={(e) => { e.stopPropagation(); setUvSheetData({ label: mgr.manager, subtitle: `${d.name} · Manager · ${mgr.employees.toLocaleString()} employees`, aiPotential: d.aiPotential, headcount: mgr.employees, unrealizedValue: Math.round(d.unrealizedValue * mgr.employees / Math.max(1, d.employees)) }) }} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 13, fontWeight: 700, color: '#3b5bdb', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(Math.round(d.unrealizedValue * mgr.employees / Math.max(1, d.employees)))}</button></DataTableCell>
                        <DataTableCell align="right">
                          <div className="tabular-nums" style={{ textAlign: 'right' }}>
                            <span className="wfr-type-h6">{notReady.toLocaleString()} ({mgr.employees > 0 ? Math.round((notReady / mgr.employees) * 100) : 0}%)</span>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>of {mgr.employees.toLocaleString()}</div>
                          </div>
                        </DataTableCell>
                        {effSrCollComplete && <UpskillingProgressCell total={mgr.employees} pct={mgrPlanPct} plansComplete={effSrPlansComplete} nameHash={nh2(mgr.manager)} />}
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
        managerContext={hrbpTrendSheetDir ? { manager: hrbpTrendSheetDir.manager, mgrIndex: hrbpTrendSheetDir.mgrIndex, readiness: hrbpTrendSheetDir.readiness } : null}
        directReports={hrbpTrendSheetDir?.directReports}
        collectionComplete
        onUnrealizedValueClick={setUvSheetData}
      />

      {/* Unrealized value breakdown sheet */}
      <UnrealizedValueSheet data={uvSheetData} onClose={() => setUvSheetData(null)} />

      {/* Metric sheet for HRBP/Director/SeniorMgr views */}
      <WorkforceMetricSheet
        metric={dashOpenMetric}
        onClose={() => setDashOpenMetric(null)}
        ready={0}
        gapPeople={0}
        hrsUnlocked={0}
      />
      <MetricInfoDialog open={dashMetricInfoOpen} onClose={() => setDashMetricInfoOpen(false)} collectionComplete={deriveWfrFlags(wfrState.state).collectionComplete} />

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
