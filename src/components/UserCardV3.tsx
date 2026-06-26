import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tag } from '@tonyh-2-eightfold/ef-design-system'
import { Avatar } from './ui/Avatar'
import { EditRiskSheet } from './EditRiskSheet'
import { ProfileSheet } from './ProfileSheet'
import type { UserCardData, RiskTag } from './UserCard'
import './UserCardV3.css'

/* ──────────────────────────────────────────────────────────────────────
   Team report card — v3 (WFR-integrated).

   Reorganized around the manager's job-to-be-done: "who needs attention, and
   what do I do." Two headline signals — talent Risk and AI readiness — scan at
   the top; the levers a manager controls (AI adoption, augmentable work,
   upskilling-plan progress) plus succession sit in the signal row; the editable
   risk profile carries the detail; profile-completeness is demoted to a quiet
   footer chip.
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

type RiskLevel = 'high' | 'medium' | 'low'
function getRiskLevel(tags: RiskTag[]): RiskLevel {
  if (tags.some((t) => t.value === 'High' || t.isCritical === true)) return 'high'
  if (tags.some((t) => t.value === 'Medium')) return 'medium'
  return 'low'
}
const RISK_META: Record<RiskLevel, { label: string }> = {
  high: { label: 'High risk' },
  medium: { label: 'Medium risk' },
  low: { label: 'Low risk' },
}

type AiStatus = 'ready' | 'building' | 'gap'
function getAiStatus(u: UserCardData): AiStatus {
  const r = u.aiReadiness ?? 0
  if (r >= 50) return 'ready'
  if (r >= 35 && u.aiAdoption && u.aiAdoption !== 'not-started') return 'building'
  return 'gap'
}
const AI_META: Record<AiStatus, { label: string; icon: string }> = {
  ready: { label: 'AI-ready', icon: 'verified' },
  building: { label: 'Building', icon: 'trending_up' },
  gap: { label: 'Readiness gap', icon: 'priority_high' },
}

const ADOPTION_META: Record<NonNullable<UserCardData['aiAdoption']>, { label: string; tone: string }> = {
  'active': { label: 'Active user', tone: 'good' },
  'exploring': { label: 'Exploring', tone: 'warn' },
  'not-started': { label: 'Not started', tone: 'bad' },
}

interface UserCardV3Props {
  user: UserCardData
  onRiskTagsChange?: (userId: string, riskTags: RiskTag[]) => void
}

export function UserCardV3({ user, onRiskTagsChange }: UserCardV3Props) {
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

  const riskLevel = getRiskLevel(user.riskTags)
  const aiStatus = getAiStatus(user)
  const adoption = ADOPTION_META[user.aiAdoption ?? 'not-started']

  const upDone = user.upskillingCompleted ?? 0
  const upTotal = user.upskillingTotal ?? 0
  const upPct = upTotal > 0 ? Math.round((upDone / upTotal) * 100) : 0
  const upTone = upTotal === 0 ? 'none' : upDone >= upTotal ? 'good' : upDone === 0 ? 'bad' : 'warn'

  return (
    <>
      <div className="ucv3-link" role="button" tabIndex={0} onClick={() => setProfileSheetOpen(true)}>
        <article className="ucv3">
          {/* Header — identity + headline signals, AI/Manager actions on the right */}
          <header className="ucv3__header">
            <div className="ucv3__identity">
              <div className="ucv3__avatar-wrap" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" className="ucv3__checkbox" aria-label={`Select ${user.name}`} />
                <Avatar initials={user.initials} avatarColor={user.avatarColor} avatarPhotoSrc={user.avatarPhotoSrc} size="md" className="ucv3__avatar" />
              </div>
              <div className="ucv3__identity-text">
                <h3 className="ucv3__name">{user.name}</h3>
                <p className="ucv3__meta">{user.title} • {user.location}</p>
                <div className="ucv3__badges">
                  <span className={`ucv3__badge ucv3__badge--risk-${riskLevel}`}>
                    <span className="ucv3__badge-dot" aria-hidden />
                    {RISK_META[riskLevel].label}
                  </span>
                  <span className={`ucv3__badge ucv3__badge--ai-${aiStatus}`}>
                    <span className="material-symbols-outlined ucv3__badge-icon" aria-hidden>{AI_META[aiStatus].icon}</span>
                    {AI_META[aiStatus].label}
                    {user.aiReadiness != null && <span className="ucv3__badge-pct">{user.aiReadiness}%</span>}
                  </span>
                </div>
              </div>
            </div>
            <div className="ucv3__header-actions" onClick={(e) => e.stopPropagation()}>
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
                      <span className="material-symbols-outlined user-card__manager-actions-icon">bolt</span>
                      Nudge AI adoption
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                      <span className="material-symbols-outlined user-card__manager-actions-icon">school</span>
                      Assign upskilling plan
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
                      Send assessment reminder
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </header>

          {/* Toolbar — contact, quick actions, demoted profile-completeness */}
          <div className="ucv3__toolbar" onClick={(e) => e.stopPropagation()}>
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
              <div className="user-card__reports">
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
              </div>
            )}
            <span className="ucv3__completeness" title="Profile completeness">
              <span className="material-symbols-outlined">task_alt</span>
              Profile {user.completionPercent}%
            </span>
          </div>

          <div className="ucv3__divider" />

          {/* Signal row — the levers + succession context */}
          <div className="ucv3__signals" onClick={(e) => e.stopPropagation()}>
            <a href="#" className="ucv3__signal">
              <span className="ucv3__signal-icon"><span className="material-symbols-outlined">bolt</span></span>
              <span className="ucv3__signal-body">
                <span className="ucv3__signal-label">AI adoption</span>
                <span className={`ucv3__signal-value ucv3__tone--${adoption.tone}`}>{adoption.label}</span>
              </span>
            </a>

            <a href="#" className="ucv3__signal">
              <span className="ucv3__signal-icon"><span className="material-symbols-outlined">dashboard_customize</span></span>
              <span className="ucv3__signal-body">
                <span className="ucv3__signal-label">Augmentable work</span>
                <span className="ucv3__signal-value">
                  {user.augmentableTasks ?? 0} of {user.totalTasks ?? 0} tasks
                </span>
                {user.hrsUnlockable != null && (
                  <span className="ucv3__signal-sub">~{user.hrsUnlockable} hrs/wk unlockable</span>
                )}
              </span>
            </a>

            <a href="#" className="ucv3__signal">
              <span className="ucv3__signal-icon"><span className="material-symbols-outlined">school</span></span>
              <span className="ucv3__signal-body">
                <span className="ucv3__signal-label">Upskilling plan</span>
                <span className={`ucv3__signal-value ucv3__tone--${upTone}`}>
                  {upTotal === 0 ? 'No plan' : `${upDone} of ${upTotal} complete`}
                </span>
                {upTotal > 0 && (
                  <span className="ucv3__miniprogress" aria-hidden>
                    <span className={`ucv3__miniprogress-fill ucv3__miniprogress-fill--${upTone}`} style={{ width: `${upPct}%` }} />
                  </span>
                )}
              </span>
            </a>

            <a href="#" className="ucv3__signal">
              <span className="ucv3__signal-icon"><span className="material-symbols-outlined">account_tree</span></span>
              <span className="ucv3__signal-body">
                <span className="ucv3__signal-label">Succession</span>
                <span className="ucv3__signal-value">{user.successionPlanning}</span>
              </span>
            </a>
          </div>

          {/* Risk profile — editable detail */}
          <div className="ucv3__risk" onClick={(e) => e.stopPropagation()}>
            <h4 className="ucv3__risk-title">
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
