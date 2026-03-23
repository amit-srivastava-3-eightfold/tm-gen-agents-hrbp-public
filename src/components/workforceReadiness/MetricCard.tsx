import { Button } from '@tonyh-2-eightfold/ef-design-system'
import type { ReactNode } from 'react'

export interface MetricCardProps {
  /** Card variant — maps to CSS modifier for accent color. */
  variant?: string
  /** Material Symbols icon name. */
  icon: string
  /** Short label above the value (e.g. "AI readiness"). */
  label: string
  /** Large metric value (e.g. "24%", "6,384"). */
  value: string
  /** Primary description below the value. */
  description: string
  /** Secondary hint text in the footer. */
  hint: string
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
  value,
  description,
  hint,
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
          <p className="wfr-metric-card__label">{label}</p>
        </div>
      </div>
      <p className="wfr-metric-card__value">{value}</p>
      <p className="wfr-metric-card__primary">{description}</p>
      <div className="wfr-metric-card__footer">
        <p className="wfr-metric-card__hint">{hint}</p>
        {onLearnMore ? (
          <Button type="button" variant="secondary" onClick={onLearnMore} className="shrink-0">
            {actionLabel}
          </Button>
        ) : null}
        {children}
      </div>
    </article>
  )
}
