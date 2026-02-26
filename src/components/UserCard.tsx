import { Link } from 'react-router-dom'
import { Button } from './ui/Button'
import './ui/Button.css'
import './UserCard.css'

export interface DirectReport {
  initials: string
  color: string
}

export interface RiskTag {
  label: string
  value?: string
  isCritical?: boolean
  isEmpty?: boolean
}

export interface UserCardData {
  id: string
  initials: string
  avatarColor: string
  name: string
  title: string
  location: string
  directReports: DirectReport[]
  directReportCount?: number
  completionPercent: number
  careerInterests: string
  selfAssessment: string
  managerAssessment: string
  developmentPlanning: string
  successionPlanning: string
  managerActionsCount?: number
  riskTags: RiskTag[]
  /** High tenure in current role without recent promotion (for Sustained High Performers filter) */
  highTenureNoPromotion?: boolean
}

interface UserCardProps {
  user: UserCardData
}

const METRIC_ITEMS = [
  { key: 'completion', label: 'Completion', getValue: (u: UserCardData) => `${u.completionPercent}% complete`, icon: 'task_alt' },
  { key: 'careerInterests', label: 'Career interests', getValue: (u: UserCardData) => u.careerInterests, icon: 'work' },
  { key: 'selfAssessment', label: 'Self assessment', getValue: (u: UserCardData) => u.selfAssessment, icon: 'person' },
  { key: 'managerAssessment', label: 'Manager assessment', getValue: (u: UserCardData) => u.managerAssessment, icon: 'supervisor_account' },
  { key: 'developmentPlanning', label: 'Development planning', getValue: (u: UserCardData) => u.developmentPlanning, icon: 'trending_up' },
  { key: 'successionPlanning', label: 'Succession planning', getValue: (u: UserCardData) => u.successionPlanning, icon: 'account_tree' },
] as const

export function UserCard({ user }: UserCardProps) {
  return (
    <Link to={`/people/${user.id}`} className="user-card-link">
    <article className="user-card">
      <div className="user-card__left">
        <div className="user-card__avatar-wrap" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" className="user-card__checkbox" aria-label={`Select ${user.name}`} />
          <div className="user-card__avatar" style={{ background: user.avatarColor }}>
            {user.initials}
          </div>
        </div>
        <div className="user-card__info">
          <h3 className="user-card__name">{user.name}</h3>
          <p className="user-card__meta">
            {user.title} • {user.location}
          </p>
          <div className="user-card__actions" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" className="user-card__contact-btn">
              Contact
              <span className="material-symbols-outlined">expand_more</span>
            </Button>
            <div className="user-card__action-icons" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="user-card__icon-btn user-card__icon-btn--with-badge" aria-label="Document">
                <span className="material-symbols-outlined">description</span>
                <span className="user-card__icon-badge" aria-hidden />
              </button>
              <button type="button" className="user-card__icon-btn" aria-label="Career navigator">
                <span className="material-symbols-outlined">route</span>
              </button>
              <button type="button" className="user-card__icon-btn" aria-label="Org chart">
                <span className="material-symbols-outlined">account_tree</span>
              </button>
              <button type="button" className="user-card__icon-btn" aria-label="More options">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>
          <div className="user-card__reports" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined user-card__reports-arrow">subdirectory_arrow_right</span>
            <div className="user-card__report-avatars">
              {user.directReports.map((r, i) => (
                <div
                  key={i}
                  className="user-card__report-avatar"
                  style={{ background: r.color, marginLeft: i > 0 ? -8 : 0 }}
                  title={r.initials}
                >
                  {r.initials}
                </div>
              ))}
              {user.directReportCount != null && user.directReportCount > 0 && (
                <span className="user-card__report-more">+{user.directReportCount}</span>
              )}
            </div>
            <Button variant="ghost" className="user-card__reports-btn">
              Direct reports
              <span className="material-symbols-outlined">arrow_forward</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="user-card__right">
        <div className="user-card__top-right" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" className="user-card__ai-btn" aria-label="AI assistant">
            <span className="material-symbols-outlined">auto_awesome</span>
          </Button>
          <Button variant="outline" className="user-card__manager-actions">
            Manager actions
            {user.managerActionsCount != null && user.managerActionsCount > 0 && (
              <span className="user-card__badge">{user.managerActionsCount}</span>
            )}
            <span className="material-symbols-outlined">expand_more</span>
          </Button>
        </div>
        <div className="user-card__metrics" onClick={(e) => e.stopPropagation()}>
          {METRIC_ITEMS.map(({ key, label, getValue, icon }) => (
            <a key={key} href="#" className="user-card__metric">
              <span className="user-card__metric-icon">
                <span className="material-symbols-outlined">{icon}</span>
              </span>
              <span className="user-card__metric-content">
                <span className="user-card__metric-label">{label}</span>
                <span className="user-card__metric-value">{getValue(user)}</span>
              </span>
              <span className="material-symbols-outlined user-card__metric-arrow">arrow_forward</span>
            </a>
          ))}
        </div>
        <div className="user-card__risk" onClick={(e) => e.stopPropagation()}>
          <h4 className="user-card__risk-title">
            <span className="material-symbols-outlined">speed</span>
            Risk profile
          </h4>
          {user.highTenureNoPromotion && (
            <p className="user-card__risk-note">High performer with high time in level</p>
          )}
          <div className="user-card__risk-tags">
            {user.riskTags.map((tag) => (
              <span
                key={tag.label}
                className={`user-card__risk-tag ${tag.isCritical ? 'user-card__risk-tag--critical' : ''} ${tag.isEmpty ? 'user-card__risk-tag--empty' : ''}`}
              >
                {tag.label}{tag.isEmpty ? ' ' : `: ${tag.value} `}
                {tag.isEmpty ? <span className="material-symbols-outlined">add</span> : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
    </Link>
  )
}
