import React from 'react'
import { Button } from '@tonyh-2-eightfold/ef-design-system'
import type { ReactNode } from 'react'

export interface MetricCardProps {
  /** Card variant — maps to CSS modifier for accent color. */
  variant?: string
  /** Material Symbols icon name. */
  icon: string
  /** Short label above the value (e.g. "AI readiness"). */
  label: string
  /** Optional badge rendered inline after the label (e.g. "Estimated", "Measured"). */
  badge?: ReactNode
  /** Large metric value (e.g. "24%", "6,384"). */
  value: ReactNode
  /** Optional explainer rendered between label and value. */
  explainer?: ReactNode
  /** Primary description below the value. */
  description: React.ReactNode
  /** Secondary hint text in the footer. */
  hint?: string
  /** Quality tag rendered below description (e.g. "Above industry median"). */
  tag?: ReactNode
  /** Called when "Learn more" is clicked. */
  onLearnMore?: () => void
  /** Override the footer action label. */
  actionLabel?: string
  /** Optional children rendered after the hint (e.g. custom footer content). */
  children?: ReactNode
}

export function MetricCard({
  variant,
  icon,
  label,
  badge,
  value,
  description,
  hint,
  tag,
  explainer,
  onLearnMore,
  actionLabel = 'Learn more',
  children,
}: MetricCardProps) {
  return (
    <article className={`wfr-metric-card${variant ? ` wfr-metric-card--${variant}` : ''}`}>
      <div className="wfr-metric-card__top">
        <div className="wfr-metric-card__icon-wrap" aria-hidden>
          <span className="material-symbols-outlined wfr-metric-card__icon">{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="wfr-metric-card__label">{label}{badge ? <> {badge}</> : null}</p>
        </div>
      </div>
      <p className="wfr-metric-card__value">{value}</p>
      {explainer && <p className="wfr-metric-card__primary" style={{ flex: 'none' }}>{explainer}</p>}
      <p className="wfr-metric-card__primary" style={tag ? { marginBottom: 6, flex: 'none' } : undefined}>{description}</p>
      {tag && <div style={{ marginBottom: 12 }}>{tag}</div>}
      <div className="wfr-metric-card__footer">
        {hint ? <p className="wfr-metric-card__hint">{hint}</p> : null}
        {onLearnMore ? (
          <Button type="button" variant="outline" size="sm" onClick={onLearnMore} className="shrink-0">
            {actionLabel}
          </Button>
        ) : null}
        {children}
      </div>
    </article>
  )
}
