import type { ReactNode } from 'react'
import { MetricCard } from './MetricCard'
import '../../pages/ManagerDetailPage.css'
import './WorkforceReadinessDashboard.css'

export interface MetricCardData {
  value: ReactNode
  description: ReactNode
  hint?: string
  badge?: ReactNode
  tag?: ReactNode
  explainer?: ReactNode
  onLearnMore?: () => void
}

export interface TableSectionProps {
  title: string
  hint: string
  /** Hide the section heading (title + hint) */
  hideTitle?: boolean
  children: ReactNode
}

export interface PersonDetailLayoutProps {
  name: string
  subtitle: string
  aiPotential?: MetricCardData
  readiness?: MetricCardData
  potential?: MetricCardData
  gap?: MetricCardData
  tableTitle: ReactNode
  tableHint: React.ReactNode
  /** Optional breadcrumb content rendered in a sticky bar flush under the header */
  breadcrumb?: ReactNode
  /** Optional hero/RA card rendered between the title and metric cards */
  heroCard?: ReactNode
  /** Optional team manager table rendered above the main table */
  managerTable?: TableSectionProps
  /** Enable 6-column table alignment (e.g. when data collection column is shown) */
  sixColTable?: boolean
  /** Disable fixed table layout on the children table (for 7+ column tables that need auto layout) */
  wideTable?: boolean
  /** Remove min-height constraint on metric cards (matches overview/dashboard card style) */
  compactCards?: boolean
  children: ReactNode
}

export function PersonDetailLayout({
  name,
  subtitle,
  aiPotential,
  readiness,
  potential = undefined,
  gap,
  tableTitle,
  tableHint,
  breadcrumb,
  heroCard,
  managerTable,
  sixColTable,
  wideTable,
  compactCards,
  children,
}: PersonDetailLayoutProps) {
  return (
    <>
      {breadcrumb && (
        <div className="person-detail__breadcrumb-bar">
          <div className="person-detail__breadcrumb-inner">
            {breadcrumb}
          </div>
        </div>
      )}
      <div className="wfr-dash" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {(name || subtitle) && (
          <div className="mgr-detail-page__summary">
            <h2 className="mgr-detail-page__name">{name}</h2>
            <p className="mgr-detail-page__subtitle" style={{ margin: 0 }}>{subtitle}</p>
          </div>
        )}

        {heroCard}

        <div className={`wfr-dash__cards-row${compactCards ? '' : ' person-detail__cards'}`} style={{ margin: 0 }}>
            {readiness && (
              <MetricCard
                variant="readiness"
                icon="person_check"
                label="AI readiness"
                value={readiness.value}
                explainer={readiness.explainer}
                description={readiness.description}
                hint={readiness.hint}
                tag={readiness.tag}
                onLearnMore={readiness.onLearnMore}
              />
            )}
            {aiPotential && (
              <MetricCard
                variant="ai-potential"
                icon="bolt"
                label="AI potential"
                value={aiPotential.value}
                explainer={aiPotential.explainer}
                description={aiPotential.description}
                tag={aiPotential.tag}
                onLearnMore={aiPotential.onLearnMore}
              />
            )}
            {potential && (
              <MetricCard
                variant="potential"
                icon="auto_awesome"
                label="Productivity hours"
                value={potential.value}
                description={potential.description}
                hint={potential.hint}
                tag={potential.tag}
                onLearnMore={potential.onLearnMore}
              />
            )}
            {gap && (
              <MetricCard
                variant="gap"
                icon="group"
                label="Transformation gap"
                value={gap.value}
                explainer={gap.explainer}
                description={gap.description}
                hint={gap.hint}
                tag={gap.tag}
                onLearnMore={gap.onLearnMore}
              />
            )}
          </div>

        {managerTable && (
          <div className={!wideTable ? `person-detail__table-aligned${sixColTable ? ' person-detail__table-aligned--6col' : ''}` : undefined} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!managerTable.hideTitle && (
              <div className="wfr-dash__panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 0 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a212e' }}>{managerTable.title}</h3>
                <span className="wfr-dash__panel-hint">{managerTable.hint}</span>
              </div>
            )}
            {managerTable.children}
          </div>
        )}

        <div className={managerTable && !wideTable ? `person-detail__table-aligned${sixColTable ? ' person-detail__table-aligned--6col' : ''}` : undefined} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="wfr-dash__panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a212e' }}>{tableTitle}</h3>
            <span className="wfr-dash__panel-hint">{tableHint}</span>
          </div>
          {children}
        </div>
      </div>
    </>
  )
}
