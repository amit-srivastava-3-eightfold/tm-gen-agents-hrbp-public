/**
 * Design page: WFR Hero Card with Integrated CTA Bar
 * Each state tab shows the CHRO and HRBP persona views side by side.
 */
import { useState } from 'react'
import { EM } from '../data/wfrOrgData'
import { WfrHeroCard, WfrCtaBar, WFR_CTA_CONTENT, type WfrDemoState, type WfrPersona } from '../components/workforceReadiness/FocusFirstModule'
import { MetricArc } from '../components/workforceReadiness/MetricArc'
import '../components/workforceReadiness/WorkforceReadinessDashboard.css'

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
                gauge={<MetricArc potential={48} readiness={24} size="lg" />}
                eyebrow={<>49,500 employees {EM} Q1 2026</>}
                headline={<>Only <span className="wfr-text-readiness" style={{ fontWeight: 700 }}>24%</span>{' '}<span style={{ fontWeight: 500 }}>are AI-ready.</span></>}
                supportingText={<><strong style={{ fontWeight: 700 }}>31,920</strong> employees in augmentable roles haven't adopted AI yet.</>}
                ctaBar={<WfrCtaBar content={cta} onBarClick={state === 2 ? () => setState(3) : undefined} />}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
