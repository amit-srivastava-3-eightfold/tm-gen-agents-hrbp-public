import { Link } from 'react-router-dom'
import './ElementCard.css'

export interface ElementCardProps {
  title: string
  badge?: string
  description: string
  recommendedLabel?: string
  icon: string
  bgColor: string
  iconBgColor: string
  iconColor: string
  textColor?: string
  buttonLabel: string
  buttonHref?: string
  children: React.ReactNode
  /** Optional: use fixed size for carousel (400×300) */
  fixedSize?: boolean
}

export function ElementCard({
  title,
  badge,
  description,
  recommendedLabel,
  icon,
  bgColor,
  iconBgColor,
  iconColor,
  textColor = '#3B2600',
  buttonLabel,
  buttonHref = '#',
  children,
  fixedSize = true,
}: ElementCardProps) {
  return (
    <div
      className={`element-card ${fixedSize ? 'element-card--fixed' : ''}`}
      style={
        {
          '--element-card-bg': bgColor,
          '--element-card-icon-bg': iconBgColor,
          '--element-card-icon-color': iconColor,
          '--element-card-text-color': textColor,
        } as React.CSSProperties
      }
    >
      <div className="element-card__header">
        <div className="element-card__header-content">
          <div className="element-card__title-row">
            <h3 className="element-card__title">{title}</h3>
            {badge && <span className="element-card__badge">{badge}</span>}
          </div>
          <p className="element-card__description">{description}</p>
        </div>
        <div className="element-card__icon-wrap" aria-hidden>
          <span className="material-symbols-outlined element-card__icon">{icon}</span>
        </div>
      </div>
      {recommendedLabel && (
        <span className="element-card__recommended">{recommendedLabel}</span>
      )}
      <div className="element-card__content">{children}</div>
      <Link to={buttonHref} className="element-card__btn">
        {buttonLabel}
      </Link>
    </div>
  )
}
