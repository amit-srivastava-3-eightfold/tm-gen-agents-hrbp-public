import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tag } from '@tonyh-2-eightfold/ef-design-system'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { EditRiskSheet } from './EditRiskSheet'
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
  /** Optional professional headshot URL; when set, avatar shows photo instead of initials */
  avatarPhotoSrc?: string
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
  /** Skill names where this person has a gap (for filtering by skill gap row click) */
  skillGaps?: string[]
  /** Skill names where this person has strength (for filtering by skill strength row click) */
  skillStrengths?: string[]
  /** Skill interest names (for filtering by skill interests row click) */
  skillInterests?: string[]
  /** Years in current role (for Tenure sort) */
  tenureYears?: number
}

interface UserCardProps {
  user: UserCardData
  onRiskTagsChange?: (userId: string, riskTags: RiskTag[]) => void
}

const RISK_TAG_LABEL_ORDER = ['Retention risk', 'Loss impact', 'Employee criticality'] as const

function sortRiskTags(tags: RiskTag[]): RiskTag[] {
  const byLabel = new Map(tags.map((t) => [t.label, t]))
  const inOrder = RISK_TAG_LABEL_ORDER.map((label) => byLabel.get(label)).filter(Boolean) as RiskTag[]
  return inOrder.sort((a, b) => {
    const aSelected = !a.isEmpty && a.value != null
    const bSelected = !b.isEmpty && b.value != null
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    const aHigh = a.value === 'High' || a.isCritical === true
    const bHigh = b.value === 'High' || b.isCritical === true
    if (aHigh && !bHigh) return -1
    if (!aHigh && bHigh) return 1
    return RISK_TAG_LABEL_ORDER.indexOf(a.label as (typeof RISK_TAG_LABEL_ORDER)[number]) - RISK_TAG_LABEL_ORDER.indexOf(b.label as (typeof RISK_TAG_LABEL_ORDER)[number])
  })
}

const METRIC_ITEMS = [
  { key: 'completion', label: 'Completion', getValue: (u: UserCardData) => `${u.completionPercent}% complete`, icon: 'task_alt' },
  { key: 'careerInterests', label: 'Career interests', getValue: (u: UserCardData) => u.careerInterests, icon: 'work' },
  { key: 'selfAssessment', label: 'Self assessment', getValue: (u: UserCardData) => u.selfAssessment, icon: 'person' },
  { key: 'managerAssessment', label: 'Manager assessment', getValue: (u: UserCardData) => u.managerAssessment, icon: 'supervisor_account' },
  { key: 'developmentPlanning', label: 'Development planning', getValue: (u: UserCardData) => u.developmentPlanning, icon: 'trending_up' },
  { key: 'successionPlanning', label: 'Succession planning', getValue: (u: UserCardData) => u.successionPlanning, icon: 'account_tree' },
] as const

export function UserCard({ user, onRiskTagsChange }: UserCardProps) {
  const [editSheetOpen, setEditSheetOpen] = useState(false)

  const handleEditRiskClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditSheetOpen(true)
  }

  const handleSaveRisk = (riskTags: RiskTag[]) => {
    onRiskTagsChange?.(user.id, riskTags)
  }

  return (
    <>
    <Link to={`/people/${user.id}`} className="user-card-link">
    <article className="user-card">
      <div className="user-card__left">
        <div className="user-card__avatar-wrap" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" className="user-card__checkbox" aria-label={`Select ${user.name}`} />
          <Avatar initials={user.initials} avatarColor={user.avatarColor} avatarPhotoSrc={user.avatarPhotoSrc} size="md" className="user-card__avatar" />
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
              <button type="button" className="user-card__icon-btn" aria-label="Org chart" hidden>
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
            <Button
              variant="secondary"
              size="sm"
              className="user-card__reports-btn"
              trailingIcon={<span className="material-symbols-outlined">chevron_right</span>}
            >
              Direct reports
            </Button>
          </div>
        </div>
      </div>
      <div className="user-card__right">
        <div className="user-card__top-right" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="icon-sm" className="user-card__ai-btn" aria-label="AI assistant">
            <span className="material-symbols-outlined">auto_awesome</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="user-card__manager-actions"
            badge={user.managerActionsCount != null && user.managerActionsCount > 0 ? user.managerActionsCount : undefined}
            trailingIcon={<span className="material-symbols-outlined">expand_more</span>}
          >
            Manager actions
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
            {sortRiskTags(user.riskTags).map((tag) => {
              const isHigh = tag.value === 'High' || tag.isCritical === true
              const hasRating = !tag.isEmpty && tag.value != null
              return (
                <span
                  key={tag.label}
                  className={`user-card__risk-tag-wrap ${tag.isEmpty ? 'user-card__risk-tag--empty' : ''} ${hasRating && !isHigh ? 'user-card__risk-tag--secondary' : ''} ${isHigh ? 'user-card__risk-tag--critical' : ''}`}
                >
                  <Tag
                    value={tag.label}
                    variant={tag.isEmpty ? 'outline' : hasRating ? 'secondary' : 'outline'}
                    size="24"
                    className="user-card__risk-tag"
                  >
                    {tag.isEmpty ? tag.label : `${tag.label}: ${tag.value}`}
                  </Tag>
                  <button type="button" className="user-card__risk-tag-pencil" aria-label="Edit risk profile" onClick={handleEditRiskClick}>
                    <span className="material-symbols-outlined">create</span>
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </article>
    </Link>
    <EditRiskSheet
      user={editSheetOpen ? user : null}
      open={editSheetOpen}
      onClose={() => setEditSheetOpen(false)}
      onSave={handleSaveRisk}
    />
    </>
  )
}
