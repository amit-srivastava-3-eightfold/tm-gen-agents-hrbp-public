/**
 * Design page: WFR Hero Card with Integrated CTA Bar
 * Each state tab shows the CHRO and HRBP persona views side by side.
 */
import { useState } from 'react'
import { EM } from '../data/wfrOrgData'
import { WfrHeroCard, WfrCtaBar, WFR_CTA_CONTENT, type WfrDemoState, type WfrPersona } from '../components/workforceReadiness/FocusFirstModule'
import '../components/workforceReadiness/WorkforceReadinessDashboard.css'

// ── Page ──────────────────────────────────────────────────────────────────────

const STATE_LABELS: Record<WfrDemoState, string> = {
  1: 'State 1 — Not started',
  '1b': 'State 1b — Delegated to HRBPs',
  2: 'State 2 — Collection in progress',
  3: 'State 3 — Collection complete / Plans generating',
  4: 'State 4 — Dev plan created',
  5: 'State 5 — Upskilling active',
  6: 'State 6 — Upskilling complete',
}

// Adoption lift per persona (matches WFR_CTA_CONTENT state-6 CTA bars)
const UPSKILLING_LIFT: Record<WfrPersona, number> = { chro: 12, hrbp: 14, manager: 16 }
const BASE_READINESS = 24

function getReadinessPct(persona: WfrPersona, upskilled: boolean) {
  return upskilled ? BASE_READINESS + UPSKILLING_LIFT[persona] : BASE_READINESS
}

function getHeadline(persona: WfrPersona, upskilled: boolean) {
  const pct = getReadinessPct(persona, upskilled)
  if (upskilled) {
    const context = persona === 'hrbp' ? ' across your teams' : persona === 'manager' ? ' on your team' : ''
    return (
      <>
        <span className="wfr-dash__headline-pct wfr-text-readiness">{pct}%</span>
        <span className="wfr-dash__headline-text">{` AI adoption${context} — up from ${BASE_READINESS}% before upskilling.`}</span>
      </>
    )
  }
  return (
    <>Only <span className="wfr-text-readiness" style={{ fontWeight: 700 }}>{pct}%</span>{' '}<span style={{ fontWeight: 500 }}>of your team is AI-ready.</span></>
  )
}

function getSupportingText(persona: WfrPersona, upskilled: boolean) {
  if (!upskilled) {
    return <><strong style={{ fontWeight: 700 }}>31,920</strong> employees in augmentable roles haven't adopted AI yet.</>
  }
  if (persona === 'chro') {
    return <><span style={{ fontWeight: 700, color: '#15803d' }}>3,764</span> employees moved out of the gap through development plans — <span style={{ fontWeight: 700, color: '#b91c1c' }}>1,985</span> remaining.</>
  }
  if (persona === 'hrbp') {
    return <><span style={{ fontWeight: 700, color: '#15803d' }}>1,985</span> employees moved out of the gap through development plans — <span style={{ fontWeight: 700, color: '#b91c1c' }}>0</span> remaining.</>
  }
  return <><strong style={{ fontWeight: 700 }}>18 of 18</strong> team members are now AI-ready.</>
}

export default function WfrHeroOptionsPage() {
  const [state, setState] = useState<WfrDemoState>(1)
  const upskilled = (state as number) >= 5

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
        {([1, '1b', 2, 3, 5, 6] as WfrDemoState[]).map(s => (
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
          const readinessPct = getReadinessPct(persona, upskilled)
          return (
            <div key={persona}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
                {persona === 'chro' ? 'CHRO' : persona === 'hrbp' ? 'HRBP' : 'Manager'}
              </p>
              <WfrHeroCard
                variant="crowd"
                readinessPct={readinessPct}
                eyebrow={<>49,500 employees {EM} Q1 2026</>}
                headline={getHeadline(persona, upskilled)}
                supportingText={getSupportingText(persona, upskilled)}
                ctaBar={<WfrCtaBar content={cta} onBarClick={state === 2 ? () => setState(3) : undefined} />}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
