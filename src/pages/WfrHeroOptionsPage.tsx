/**
 * Design page: WFR Hero Card with Integrated CTA Bar
 * Each state tab shows the CHRO and HRBP persona views side by side.
 */
import { useState } from 'react'
import { EM } from '../data/wfrOrgData'
import { WfrHeroCard, WfrCtaBar, WFR_CTA_CONTENT, type WfrDemoState, type WfrPersona } from '../components/workforceReadiness/FocusFirstModule'
import '../components/workforceReadiness/WorkforceReadinessDashboard.css'

// ── Gauge ─────────────────────────────────────────────────────────────────────

function GaugeSVG({ pct }: { pct: number }) {
  const dim = 180, r = 68, sw = 14, cy = 124, vbY = 40, vbH = 88, cx = dim / 2
  const rad = (d: number) => (d * Math.PI) / 180
  const arc = (p: number) => {
    const deg = (p / 100) * 180
    const x1 = cx + r * Math.cos(rad(180)), y1 = cy + r * Math.sin(rad(180))
    const x2 = cx + r * Math.cos(rad(180 + deg)), y2 = cy + r * Math.sin(rad(180 + deg))
    return `M${x1} ${y1} A${r} ${r} 0 ${deg > 180 ? 1 : 0} 1 ${x2} ${y2}`
  }
  return (
    <div style={{ marginTop: -15 }}>
      <svg width={dim} height={vbH} viewBox={`0 ${vbY} ${dim} ${vbH}`} overflow="visible">
        <path d={arc(100)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={sw} strokeLinecap="round" />
        <path d={arc(pct)} fill="none" stroke="#22c55e" strokeWidth={sw} strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' }} />
        <text x={cx} y={cy - 12} textAnchor="middle" fill="#22c55e" fontSize={28} fontWeight={700} fontFamily="inherit">{pct}%</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={11} fontFamily="inherit" letterSpacing="0.07em">AI ADOPTION</text>
      </svg>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const STATE_LABELS: Record<WfrDemoState, string> = {
  1: 'State 1 — Not started',
  '1b': 'State 1b — Delegated to HRBPs',
  2: 'State 2 — Collection in progress',
  3: 'State 3 — Collection complete',
  4: 'State 4 — Dev plan created',
  5: 'State 5 — Upskilling active',
  6: 'State 6 — Upskilling complete',
}

export default function WfrHeroOptionsPage() {
  const [state, setState] = useState<WfrDemoState>(1)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto', fontFamily: 'var(--font-family)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
        Hero Card · Integrated CTA Bar
      </h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>
        CHRO, HRBP, and Manager views for each WFR state.
      </p>

      {/* State tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap' }}>
        {([1, '1b', 2, 3, 4, 5, 6] as WfrDemoState[]).map(s => (
          <button key={s} type="button" onClick={() => setState(s)} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid',
            borderColor: state === s ? '#6366f1' : '#e2e8f0',
            background: state === s ? '#eef2ff' : '#fff',
            color: state === s ? '#4338ca' : '#475569',
            fontSize: 13, fontWeight: state === s ? 600 : 400,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {STATE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Persona cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {(['chro', 'hrbp', 'manager'] as WfrPersona[]).map(persona => {
          const cta = WFR_CTA_CONTENT[state][persona]
          return (
            <div key={persona}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
                {persona === 'chro' ? 'CHRO' : persona === 'hrbp' ? 'HRBP' : 'Manager'}
              </p>
              <WfrHeroCard
                gauge={<GaugeSVG pct={24} />}
                eyebrow={<>49,500 employees {EM} Q1 2026</>}
                headline={<>Only <span style={{ fontWeight: 700 }}>24%</span>{' '}<span style={{ fontWeight: 500 }}>are AI-ready.</span></>}
                supportingText="31,920 employees in augmentable roles haven't adopted AI yet."
                ctaBar={state === 6 ? undefined : <WfrCtaBar content={cta} onBarClick={state === 2 ? () => setState(3) : undefined} />}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
