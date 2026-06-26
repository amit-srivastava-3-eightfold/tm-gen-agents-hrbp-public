import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tag } from '@tonyh-2-eightfold/ef-design-system'
import { Avatar } from './ui/Avatar'
import { EditRiskSheet } from './EditRiskSheet'
import { ProfileSheet } from './ProfileSheet'
import type { UserCardData, RiskTag } from './UserCard'
import './UserCardV2.css'

/* ──────────────────────────────────────────────────────────────────────
   Team report card — v2 layout variation.

   Same data, handlers, sheets, and shared atoms (Manager actions, Contact
   select, risk pills) as the Current card — only the LAYOUT differs:
   a full-width vertical card with an identity header, a prominent completion
   progress bar, and a responsive metrics grid that wraps instead of scrolling
   horizontally (so nothing gets cut off on the right edge).
   ────────────────────────────────────────────────────────────────────── */

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

/* Completion is surfaced as the progress bar; the rest fill the metrics grid. */
const V2_METRICS = [
  { key: 'careerInterests', label: 'Career interests', getValue: (u: UserCardData) => u.careerInterests, icon: 'work' },
  { key: 'selfAssessment', label: 'Self assessment', getValue: (u: UserCardData) => u.selfAssessment, icon: 'person' },
  { key: 'managerAssessment', label: 'Manager assessment', getValue: (u: UserCardData) => u.managerAssessment, icon: 'supervisor_account' },
  { key: 'developmentPlanning', label: 'Development planning', getValue: (u: UserCardData) => u.developmentPlanning, icon: 'trending_up' },
  { key: 'successionPlanning', label: 'Succession planning', getValue: (u: UserCardData) => u.successionPlanning, icon: 'account_tree' },
] as const

interface UserCardV2Props {
  user: UserCardData
  onRiskTagsChange?: (userId: string, riskTags: RiskTag[]) => void
}

export function UserCardV2({ user, onRiskTagsChange }: UserCardV2Props) {
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)

  const handleEditRiskClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditSheetOpen(true)
  }

  const handleSaveRisk = (riskTags: RiskTag[]) => {
    onRiskTagsChange?.(user.id, riskTags)
  }

  const hasDirectReports = user.directReports.length > 0 || (user.directReportCount ?? 0) > 0
  const completion = Math.max(0, Math.min(100, user.completionPercent))

  return (
    <>
      <div className="ucv2-link" role="button" tabIndex={0} onClick={() => setProfileSheetOpen(true)}>
        <article className="ucv2">
          {/* Header — identity + AI/Manager actions */}
          <header className="ucv2__header">
            <div className="ucv2__identity" onClick={(e) => e.stopPropagation()}>
              <input type="checkbox" className="ucv2__checkbox" aria-label={`Select ${user.name}`} />
              <Avatar initials={user.initials} avatarColor={user.avatarColor} avatarPhotoSrc={user.avatarPhotoSrc} size="md" className="ucv2__avatar" />
              <div className="ucv2__identity-text">
                <h3 className="ucv2__name">{user.name}</h3>
                <p className="ucv2__meta">{user.title} • {user.location}</p>
              </div>
            </div>
            <div className="ucv2__header-actions" onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" size="icon-sm" className="user-card__ai-btn" aria-label="AI assistant">
                <span className="material-symbols-outlined">auto_awesome</span>
              </Button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="user-card__manager-actions user-card__manager-actions--select-outline"
                    aria-haspopup="menu"
                  >
                    <span className="user-card__manager-actions-label-text">Manager actions</span>
                    {user.managerActionsCount != null && user.managerActionsCount > 0 ? (
                      <span className="user-card__manager-actions-badge" aria-hidden>{user.managerActionsCount}</span>
                    ) : null}
                    <span className="material-symbols-outlined user-card__manager-actions-chevron" aria-hidden>expand_more</span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="user-card__manager-actions-content" align="end" sideOffset={4} onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu.Label className="user-card__manager-actions-label">Suggested actions</DropdownMenu.Label>
                    <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                      <span className="material-symbols-outlined user-card__manager-actions-icon">mail</span>
                      Send self assessment reminder
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                      <span className="material-symbols-outlined user-card__manager-actions-icon">format_list_bulleted</span>
                      Assess skills
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                      <span className="material-symbols-outlined user-card__manager-actions-icon">add</span>
                      Create succession plan
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="user-card__manager-actions-separator" />
                    <DropdownMenu.Label className="user-card__manager-actions-label">All actions</DropdownMenu.Label>
                    <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={() => setEditSheetOpen(true)}>
                      <span className="material-symbols-outlined user-card__manager-actions-icon">label</span>
                      Edit Risk Indicators
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                      <span className="material-symbols-outlined user-card__manager-actions-icon">mail</span>
                      Send development plan reminder
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                      <span className="material-symbols-outlined user-card__manager-actions-icon">add</span>
                      Create development plan
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </header>

          {/* Toolbar — contact, quick actions, direct reports */}
          <div className="ucv2__toolbar" onClick={(e) => e.stopPropagation()}>
            <div className="user-card__contact-wrap">
              <div className="user-card__contact-inner">
                <Select value="contact" onValueChange={() => {}}>
                  <SelectTrigger variant="secondary" className="user-card__contact-select">
                    <SelectValue placeholder="Contact" />
                  </SelectTrigger>
                  <SelectContent className="user-card__contact-content">
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="schedule">Schedule call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="user-card__action-icons">
              <Button variant="secondary" size="icon" className="user-card__icon-btn" aria-label="Document">
                <span className="material-symbols-outlined">description</span>
              </Button>
              <Button variant="secondary" size="icon" className="user-card__icon-btn" aria-label="Org chart">
                <span className="material-symbols-outlined">account_tree</span>
              </Button>
              <Button variant="secondary" size="icon" className="user-card__icon-btn" aria-label="More options">
                <span className="material-symbols-outlined">more_vert</span>
              </Button>
            </div>
            {hasDirectReports && (
              <div className="ucv2__reports user-card__reports">
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
            )}
          </div>

          <div className="ucv2__divider" />

          {/* Completion — progress bar */}
          <a href="#" className="ucv2__completion" onClick={(e) => e.stopPropagation()}>
            <div className="ucv2__completion-head">
              <span className="ucv2__completion-label">
                <span className="material-symbols-outlined">task_alt</span>
                Completion
              </span>
              <span className="ucv2__completion-value">{user.completionPercent}% complete</span>
            </div>
            <div className="ucv2__progress" role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}>
              <div className="ucv2__progress-fill" style={{ width: `${completion}%` }} />
            </div>
          </a>

          {/* Metrics — responsive grid (wraps, no horizontal scroll) */}
          <div className="ucv2__metrics" onClick={(e) => e.stopPropagation()}>
            {V2_METRICS.map(({ key, label, getValue, icon }) => (
              <a key={key} href="#" className="ucv2__metric">
                <span className="ucv2__metric-icon">
                  <span className="material-symbols-outlined">{icon}</span>
                </span>
                <span className="ucv2__metric-text">
                  <span className="ucv2__metric-label">{label}</span>
                  <span className="ucv2__metric-value">{getValue(user)}</span>
                </span>
                <span className="material-symbols-outlined ucv2__metric-arrow">arrow_forward</span>
              </a>
            ))}
          </div>

          {/* Risk profile */}
          <div className="ucv2__risk" onClick={(e) => e.stopPropagation()}>
            <h4 className="ucv2__risk-title">
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
        </article>
      </div>
      <EditRiskSheet
        key={editSheetOpen && user ? user.id : 'edit-risk-closed'}
        user={editSheetOpen ? user : null}
        open={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        onSave={handleSaveRisk}
      />
      <ProfileSheet
        key={profileSheetOpen ? `sheet-${user.id}` : 'profile-sheet-closed'}
        user={profileSheetOpen ? user : null}
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        variant="manager"
        onEditRisk={() => { setProfileSheetOpen(false); setEditSheetOpen(true) }}
      />
    </>
  )
}
