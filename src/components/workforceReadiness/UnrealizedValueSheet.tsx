/** Slide-in sheet showing how the Unrealized Value dollar figure was calculated. */
import { useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { formatDollar, ORG } from '../../data/wfrOrgData'
import './ReadinessTrendSheet.css'

const BODY_ATTR = 'data-wfr-uv-sheet-open'

export interface UnrealizedValueSheetData {
  /** Display label — dept name, director name, HRBP name, etc. */
  label: string
  /** Secondary context line shown in header — e.g. "Engineering · 341 employees" */
  subtitle?: string
  /** AI potential % for this scope */
  aiPotential: number
  /** Headcount in scope */
  headcount: number
  /** Pre-computed unrealized value dollar amount */
  unrealizedValue: number
}

interface Props {
  data: UnrealizedValueSheetData | null
  onClose: () => void
}

export function UnrealizedValueSheet({ data, onClose }: Props) {
  const open = data != null

  useLayoutEffect(() => {
    if (open) document.body.setAttribute(BODY_ATTR, 'true')
    return () => document.body.removeAttribute(BODY_ATTR)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!data) return null

  const { label, subtitle, aiPotential, headcount, unrealizedValue } = data

  // Derive formula components
  const weeklyHrs = parseFloat((ORG.hrsPerPersonWeek * (aiPotential / ORG.aiPotential)).toFixed(1))
  const annualValuePerPerson = headcount > 0 ? unrealizedValue / headcount : 0
  const effectiveWage = weeklyHrs > 0 ? annualValuePerPerson / (weeklyHrs * 52) : 0
  const annualPerPersonFormatted = formatDollar(Math.round(annualValuePerPerson))

  return createPortal(
    <div className="wfr-trend-sheet__root">
      <div className="wfr-trend-sheet__backdrop" onClick={onClose} />
      <div className="wfr-trend-sheet" role="dialog" aria-label={`${label} unrealized value breakdown`}>
        {/* Header */}
        <div className="wfr-trend-sheet__header">
          <div>
            <div className="wfr-trend-sheet__title-row">
              <h2 className="wfr-trend-sheet__title">{label}</h2>
            </div>
            <p className="wfr-trend-sheet__sub">{subtitle ?? `${headcount.toLocaleString()} employees`}</p>
          </div>
          <button type="button" className="wfr-trend-sheet__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="wfr-trend-sheet__body">

          {/* Hero value card */}
          <div style={{ padding: '20px', borderRadius: 12, background: '#f5f3ff', border: '1px solid #ddd6fe', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#7c3aed' }}>auto_awesome</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unrealized Value</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{formatDollar(unrealizedValue)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
              Annual productivity value AI can unlock — across {headcount.toLocaleString()} employees
            </div>
          </div>

          {/* Formula steps */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>How this is calculated</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>

              {/* Step 1: AI Potential */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 3 }}>AI Potential</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>7-signal composite (0–100 scale); scores ≥40 indicate roles meaningfully changed by AI</div>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#4f46e5', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{aiPotential}%</div>
                </div>
              </div>

              {/* Step 2: Weekly hours */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 3 }}>Augmentable hours</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{ORG.hrsPerPersonWeek} hrs org baseline × ({aiPotential}% ÷ {ORG.aiPotential}% org avg) — includes 60% realization rate</div>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{weeklyHrs} hrs<span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>/wk</span></div>
                </div>
              </div>

              {/* Step 3: BLS wage */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 3 }}>BLS median wage</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>Role-weighted average, BLS Occupational Employment Statistics</div>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>${effectiveWage.toFixed(2)}<span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>/hr</span></div>
                </div>
              </div>

              {/* Step 4: Headcount */}
              <div style={{ padding: '14px 16px', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 3 }}>Employees in scope</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>Headcount in augmentable roles</div>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{headcount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Formula result */}
          <div style={{ padding: '14px 16px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Formula</div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.8, fontVariantNumeric: 'tabular-nums' }}>
              {weeklyHrs} hrs × ${effectiveWage.toFixed(2)}/hr × 52 weeks × {headcount.toLocaleString()} people
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>=</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{formatDollar(unrealizedValue)}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>/ year</span>
              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>({annualPerPersonFormatted}/person)</span>
            </div>
          </div>

          {/* Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>About this figure</div>
            {[
              'AI Potential score is a 7-signal composite: GenAI Task Analysis (22%), WorkBank Observed Exposure — Massenkoff & McCrory 2026 (22%), 24-Study Meta-Analysis (16%), Frey-Osborne (12%), GPTs-are-GPTs (12%), BLS Skills Framework (8%), BLS Employment Trend (8%)',
              '60% realization rate applied to augmentable hours (McKinsey 2023: 50–70% achievable range)',
              'Wage data from BLS Occupational Employment & Wage Statistics (OEWS), role-weighted per department',
              'Updates quarterly as AI adoption scores improve from data collection',
            ].map((note) => (
              <div key={note} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0, marginTop: 6 }} />
                <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{note}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>,
    document.body
  )
}
