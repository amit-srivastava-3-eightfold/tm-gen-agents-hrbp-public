import type { ReactNode } from 'react'
import { MetricCard } from './MetricCard'
import '../../pages/ManagerDetailPage.css'
import './WorkforceReadinessDashboard.css'

export interface MetricCardData {
  value: ReactNode
  description: string
  hint: string
  badge?: ReactNode
  onLearnMore?: () => void
}

export interface PersonDetailLayoutProps {
  name: string
  subtitle: string
  readiness: MetricCardData
  potential: MetricCardData
  gap: MetricCardData
  tableTitle: string
  tableHint: string
  /** Optional hero/RA card rendered between the title and metric cards */
  heroCard?: ReactNode
  children: ReactNode
}

export function PersonDetailLayout({
  name,
  subtitle,
  readiness,
  potential,
  gap,
  tableTitle,
  tableHint,
  heroCard,
  children,
}: PersonDetailLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="mgr-detail-page__summary">
        <h2 className="mgr-detail-page__name">{name}</h2>
        <p className="mgr-detail-page__subtitle" style={{ margin: 0 }}>{subtitle}</p>
      </div>

      {heroCard}

      <div className="wfr-dash__cards-row" style={{ margin: 0 }}>
        <MetricCard
          variant="readiness"
          icon="school"
          label="AI adoption"
          badge={readiness.badge}
          value={readiness.value}
          description={readiness.description}
          hint={readiness.hint}
          onLearnMore={readiness.onLearnMore}
        />
        <MetricCard
          variant="potential"
          icon="auto_awesome"
          label="AI potential"
          value={potential.value}
          description={potential.description}
          hint={potential.hint}
          onLearnMore={potential.onLearnMore}
        />
        <MetricCard
          variant="gap"
          icon="groups"
          label="Transformation gap"
          value={gap.value}
          description={gap.description}
          hint={gap.hint}
          onLearnMore={gap.onLearnMore}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="wfr-dash__panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a212e' }}>{tableTitle}</h3>
          <span className="wfr-dash__panel-hint">{tableHint}</span>
        </div>
        {children}
      </div>
    </div>
  )
}
