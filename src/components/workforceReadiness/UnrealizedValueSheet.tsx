/** Slide-in sheet showing how the Productivity Potential figure is calculated. */
import { formatHours, ORG } from '../../data/wfrOrgData'
import { WfrSheet } from './WfrSheet'

export interface UnrealizedValueSheetData {
  /** Display label — dept name, director name, HRBP name, etc. */
  label: string
  /** Secondary context line shown in header — e.g. "Engineering · 341 employees" */
  subtitle?: string
  /** AI potential % for this scope */
  aiPotential: number
  /** Headcount in scope */
  headcount: number
  /** Pre-computed weekly hours unlocked (display annualizes via formatHours) */
  hrsUnlocked: number
}

interface Props {
  data: UnrealizedValueSheetData | null
  onClose: () => void
}

export function UnrealizedValueSheet({ data, onClose }: Props) {
  if (!data) return null

  const { label, subtitle, aiPotential, headcount, hrsUnlocked } = data

  const hrsPerPersonWeek = parseFloat((ORG.hrsPerPersonWeek * (aiPotential / ORG.aiPotential)).toFixed(1))
  const hrsPerPersonYear = Math.round(hrsPerPersonWeek * 52)
  const gapPeople = hrsPerPersonWeek > 0 ? Math.round(hrsUnlocked / hrsPerPersonWeek) : 0

  return (
    <WfrSheet
      open
      onClose={onClose}
      title={label}
      subtitle={subtitle ?? `${headcount.toLocaleString()} employees`}
      ariaLabel={`${label} productivity potential breakdown`}
    >
      {/* Hero value card */}
      <div style={{ padding: '20px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#16a34a' }}>schedule</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Productivity Potential</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{formatHours(hrsUnlocked)}</span>
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
          Annual hours AI can unlock — across {headcount.toLocaleString()} employees in the transformation gap
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
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>% of work in the augmentation zone (15–75% range) — tasks where AI assists but humans lead</div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#4f46e5', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{aiPotential}%</div>
            </div>
          </div>

          {/* Step 2: Augmentable hours per person */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 3 }}>Augmentable hours / person</div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{ORG.hrsPerPersonWeek} hrs/wk org baseline × ({aiPotential}% ÷ {ORG.aiPotential}% org avg) × 52 wks — includes 60% realization rate</div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{hrsPerPersonYear.toLocaleString()} hrs<span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>/yr</span></div>
            </div>
          </div>

          {/* Step 3: People in gap */}
          <div style={{ padding: '14px 16px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 3 }}>People in transformation gap</div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>In augmentable roles but not yet AI-ready — each gets a targeted development plan</div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{gapPeople.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Formula result */}
      <div style={{ padding: '14px 16px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Formula</div>
        <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.8, fontVariantNumeric: 'tabular-nums' }}>
          {hrsPerPersonYear.toLocaleString()} hrs/person/yr × {gapPeople.toLocaleString()} people in gap
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>=</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{formatHours(hrsUnlocked)}</span>
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>({hrsPerPersonYear.toLocaleString()} hrs/person/yr)</span>
        </div>
      </div>

      {/* Notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>About this figure</div>
        {[
          'AI Potential is a 7-signal composite: GenAI Task Analysis (22%), WorkBank Observed Exposure — Massenkoff & McCrory 2026 (22%), 24-Study Meta-Analysis (16%), Frey-Osborne (12%), GPTs-are-GPTs (12%), BLS Skills Framework (8%), BLS Employment Trend (8%)',
          '60% realization rate applied to augmentable hours (McKinsey 2023: 50–70% achievable range)',
          'Hours represent annual capacity freed when people in the gap reach AI-readiness',
          'Updates quarterly as AI adoption scores improve from data collection',
        ].map((note) => (
          <div key={note} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0, marginTop: 6 }} />
            <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{note}</span>
          </div>
        ))}
      </div>
    </WfrSheet>
  )
}
