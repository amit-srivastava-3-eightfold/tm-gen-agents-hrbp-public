/**
 * MetricArc — WFR gauge components
 *
 * `MetricArc size="lg"` — full hero semicircle (readiness only, white text)
 * `MetricArc size="sm"` — small full-circle arc (potential + readiness)
 */
import './WorkforceReadinessDashboard.css'

// ── Config ────────────────────────────────────────────────────────────────────

const READINESS_SEMICIRCLE = {
  hero: {
    dim: 180, r: 68, sw: 14, cy: 124, vbY: 49, vbH: 82,
    labelGroupY: 130, pctDy: -12,
    svgClass: 'wfr-metric-arc--lg wfr-metric-arc--readiness-hero wfr-metric-arc--semicircle',
  },
  compact: {
    dim: 136, r: 52, sw: 10, cy: 94, vbY: 26, vbH: 70,
    labelGroupY: 102, pctDy: -9,
    svgClass: 'wfr-metric-arc--readiness-hero wfr-metric-arc--semicircle wfr-metric-arc--semicircle--compact',
  },
} as const

const ARC_SM = { dim: 102, r: 40, sw: 6, vbH: 102, svgH: 90 } as const

// ── Semicircle (lg / compact) ─────────────────────────────────────────────────

function MetricArcReadinessSemicircle({ readiness, compact = false }: { readiness: number; compact?: boolean }) {
  const cfg = compact ? READINESS_SEMICIRCLE.compact : READINESS_SEMICIRCLE.hero
  const { dim, r, sw, cy, vbY, vbH, labelGroupY, pctDy, svgClass } = cfg
  const cx = dim / 2
  const rad = (d: number) => (d * Math.PI) / 180
  const arc = (pct: number) => {
    const sweepDeg = (pct / 100) * 180
    const x1 = cx + r * Math.cos(rad(180))
    const y1 = cy + r * Math.sin(rad(180))
    const x2 = cx + r * Math.cos(rad(180 + sweepDeg))
    const y2 = cy + r * Math.sin(rad(180 + sweepDeg))
    return `M${x1} ${y1} A${r} ${r} 0 ${sweepDeg > 180 ? 1 : 0} 1 ${x2} ${y2}`
  }
  return (
    <div className="flex shrink-0 flex-col items-center gap-0" role="img" aria-label={`AI readiness ${readiness} percent of augmentable-role headcount`}>
      <svg className={`wfr-metric-arc wfr-metric-arc--semicircle ${svgClass}`} width={dim} height={vbH} viewBox={`0 ${vbY} ${dim} ${vbH}`} overflow="visible" aria-hidden>
        <path d={arc(100)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={sw} strokeLinecap="round" />
        <path d={arc(readiness)} fill="none" stroke="var(--wfr-readiness)" strokeWidth={sw} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' }} />
        <g transform={`translate(${cx}, ${labelGroupY})`} className="wfr-metric-arc__semicircle-labels">
          <text x={0} y={pctDy} textAnchor="middle" dominantBaseline="text-after-edge" className="wfr-metric-arc__pct wfr-metric-arc__pct--readiness-hero">
            {readiness}%
          </text>
          <text x={0} y={0} textAnchor="middle" dominantBaseline="text-after-edge" className="wfr-metric-arc__label">
            {'AI ADOPTION'}
          </text>
        </g>
      </svg>
    </div>
  )
}

// ── Full arc (sm) ─────────────────────────────────────────────────────────────

function MetricArcSmall({ potential, readiness, showLegend, showInteriorLabels }: {
  potential: number; readiness: number; showLegend: boolean; showInteriorLabels: boolean
}) {
  const { dim, r, sw, vbH, svgH } = ARC_SM
  const cx = dim / 2, cy = dim / 2
  const rad = (d: number) => (d * Math.PI) / 180
  const arc = (pct: number) => {
    const s = 210, sw2 = (pct / 100) * 120
    const x1 = cx + r * Math.cos(rad(s)), y1 = cy + r * Math.sin(rad(s))
    const x2 = cx + r * Math.cos(rad(s + sw2)), y2 = cy + r * Math.sin(rad(s + sw2))
    return `M${x1} ${y1} A${r} ${r} 0 ${sw2 > 180 ? 1 : 0} 1 ${x2} ${y2}`
  }
  const ty = { lab: 7, ready: 20 }
  const pctY = showInteriorLabels ? cy - 5 : cy
  return (
    <div className="flex flex-col items-center gap-0">
      <svg
        className={`wfr-metric-arc wfr-metric-arc--sm ${!showInteriorLabels ? 'wfr-metric-arc--number-only' : ''}`}
        width={dim} height={showInteriorLabels ? svgH : 76} viewBox={`0 0 ${dim} ${vbH}`} overflow="visible" aria-hidden
      >
        <path d={arc(100)} fill="none" stroke="#f1f5f9" strokeWidth={sw} strokeLinecap="round" />
        <path d={arc(potential)} fill="none" stroke="var(--wfr-potential)" strokeWidth={sw} strokeLinecap="round" opacity={0.85} />
        <path d={arc(readiness)} fill="none" stroke="var(--wfr-readiness)" strokeWidth={sw} strokeLinecap="round" />
        <text x={cx} y={pctY} textAnchor="middle" {...(!showInteriorLabels ? { dominantBaseline: 'central' as const } : {})} className="wfr-metric-arc__pct">
          {potential}%
        </text>
        {showInteriorLabels && (
          <>
            <text x={cx} y={cy + ty.lab} textAnchor="middle" className="wfr-metric-arc__label">UNREALIZED VALUE</text>
            <text x={cx} y={cy + ty.ready} textAnchor="middle" className="wfr-metric-arc__ready">{readiness}% ready</text>
          </>
        )}
      </svg>
      {showLegend && (
        <div className="mt-1 flex gap-3.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-[var(--wfr-potential)]" />
            <span className="wfr-type-caption-sb wfr-text-potential">Productivity potential</span>
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

// ── Public API ────────────────────────────────────────────────────────────────

export interface MetricArcProps {
  potential: number
  readiness: number
  size: 'lg' | 'sm'
  showLegend?: boolean
  showInteriorLabels?: boolean
}

export function MetricArc({ potential, readiness, size, showLegend = true, showInteriorLabels = true }: MetricArcProps) {
  if (size === 'lg') return <MetricArcReadinessSemicircle readiness={readiness} />
  return <MetricArcSmall potential={potential} readiness={readiness} showLegend={showLegend} showInteriorLabels={showInteriorLabels} />
}

export function MetricArcCompact({ readiness }: { readiness: number }) {
  return <MetricArcReadinessSemicircle readiness={readiness} compact />
}
