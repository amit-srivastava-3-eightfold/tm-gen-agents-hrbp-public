export interface DevPlanStatsBarProps {
  adoptionGain: number
  planComplete: boolean
  totalHours: number
  targetWeeks?: number
  actualHours?: number
  actualWeeks?: number
}

function StatCell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc' }}>
      {children}
    </div>
  )
}

function StatIcon({ bg, color, icon }: { bg: string; color: string; icon: string }) {
  return (
    <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 20, color }}>{icon}</span>
    </div>
  )
}

function StatValue({ value, unit }: { value: React.ReactNode; unit: string }) {
  return (
    <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
      {value}<span style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginLeft: 3 }}>{unit}</span>
    </span>
  )
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{children}</div>
}

function Divider() {
  return <div style={{ width: 1, background: '#e2e8f0', flexShrink: 0 }} />
}

export function DevPlanStatsBar({ adoptionGain, planComplete, totalHours, targetWeeks = 6, actualHours, actualWeeks }: DevPlanStatsBarProps) {
  const displayHours = planComplete && actualHours != null ? actualHours : totalHours
  const displayWeeks = planComplete && actualWeeks != null ? actualWeeks : targetWeeks
  return (
    <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <StatCell>
        <StatIcon bg="#f5f3ff" color="#7c3aed" icon="trending_up" />
        <div>
          <StatValue
            value={<span style={{ color: planComplete ? '#15803d' : '#7c3aed' }}>+{adoptionGain}</span>}
            unit="pts"
          />
          <StatLabel>{planComplete ? 'AI adoption' : 'Est. adoption gain'}</StatLabel>
        </div>
      </StatCell>
      <Divider />
      <StatCell>
        <StatIcon bg="#eff3ff" color="#3b5bdb" icon="schedule" />
        <div>
          <StatValue value={<span style={{ color: '#0f172a' }}>{displayHours}</span>} unit="hrs" />
          <StatLabel>{planComplete ? 'Total effort' : 'Estimated effort'}</StatLabel>
        </div>
      </StatCell>
      <Divider />
      <StatCell>
        <StatIcon bg="#f0fdf4" color="#15803d" icon="event_available" />
        <div>
          <StatValue value={<span style={{ color: '#0f172a' }}>{displayWeeks}</span>} unit="weeks" />
          <StatLabel>{planComplete ? 'Completed in' : 'Target duration'}</StatLabel>
        </div>
      </StatCell>
    </div>
  )
}
