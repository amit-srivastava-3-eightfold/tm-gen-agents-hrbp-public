import { useState } from 'react'
import { WfrTaskSheetBody, type DemoPhase } from '../components/workforceReadiness/WfrTaskSheetBody'
import '../components/workforceReadiness/WorkforceReadinessDashboard.css'

const ROLE = { title: 'Software Engineer', dept: 'Engineering' }

const PHASE_LABELS: Record<DemoPhase, string> = {
  baseline: 'Baseline estimate',
  calibrated: 'Post-calibration',
  upskilled: 'Post-upskilling',
}

export default function WfrTaskSheetPage() {
  const [phase, setPhase] = useState<DemoPhase>('baseline')

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto', fontFamily: 'var(--font-family)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Task Sheet</h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>Role-level task breakdown by AI zone.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {(['baseline', 'calibrated', 'upskilled'] as DemoPhase[]).map(p => (
          <button key={p} type="button" onClick={() => setPhase(p)} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid',
            borderColor: phase === p ? '#6366f1' : '#e2e8f0',
            background: phase === p ? '#eef2ff' : '#fff',
            color: phase === p ? '#4338ca' : '#475569',
            fontSize: 13, fontWeight: phase === p ? 600 : 400,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="wfr-trend-sheet" style={{ position: 'static', boxShadow: '0 0 0 1px #e2e8f0', transform: 'none', maxWidth: 480 }}>
        <div className="wfr-trend-sheet__header">
          <div>
            <div className="wfr-trend-sheet__title-row">
              <h2 className="wfr-trend-sheet__title">{ROLE.title}</h2>
            </div>
            <p className="wfr-trend-sheet__sub">{ROLE.dept} — Task breakdown</p>
          </div>
        </div>
        <div className="wfr-trend-sheet__body">
          <WfrTaskSheetBody role={ROLE} phase={phase} />
        </div>
      </div>
    </div>
  )
}
