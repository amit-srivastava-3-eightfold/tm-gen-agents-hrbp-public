import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tag } from '@tonyh-2-eightfold/ef-design-system'
import { Avatar } from './ui/Avatar'
import { EditRiskSheet } from './EditRiskSheet'
import { ProfileSheet } from './ProfileSheet'
import type { UserCardData, RiskTag } from './UserCard'
import './UserCardV4.css'

/* ──────────────────────────────────────────────────────────────────────
   Team report card — v4 (scannable + progressive disclosure).

   Level 1 — collapsed summary row (default): avatar, name/role, and the two
             triage chips (Risk + AI readiness) + an action flag. Built to scan
             down a long list of reports.
   Level 2 — expanded detail (click the row): the WFR levers, succession,
             editable risk profile, and quick actions.
   Level 3 — full ProfileSheet ("Open full profile").
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
const RISK_LABEL: Record<RiskLevel, string> = { high: 'High risk', medium: 'Medium risk', low: 'Low risk' }

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

interface UserCardV4Props {
  user: UserCardData
  onRiskTagsChange?: (userId: string, riskTags: RiskTag[]) => void
}

export function UserCardV4({ user, onRiskTagsChange }: UserCardV4Props) {
  const [expanded, setExpanded] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)

  const stop = (e: React.MouseEvent) => e.stopPropagation()
  const handleEditRiskClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditSheetOpen(true)
  }
  const handleSaveRisk = (riskTags: RiskTag[]) => onRiskTagsChange?.(user.id, riskTags)

  const riskLevel = getRiskLevel(user.riskTags)
  const aiStatus = getAiStatus(user)
  const adoption = ADOPTION_META[user.aiAdoption ?? 'not-started']
  const actionCount = user.managerActionsCount ?? 0

  const upDone = user.upskillingCompleted ?? 0
  const upTotal = user.upskillingTotal ?? 0
  const upPct = upTotal > 0 ? Math.round((upDone / upTotal) * 100) : 0
  const upTone = upTotal === 0 ? 'none' : upDone >= upTotal ? 'good' : upDone === 0 ? 'bad' : 'warn'

  const toggle = () => setExpanded((v) => !v)

  return (
    <>
      <article className={`ucv4 ${expanded ? 'is-expanded' : ''}`}>
        {/* Level 1 — scannable summary row */}
        <div
          className="ucv4__summary"
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onClick={toggle}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() } }}
        >
          <span className="ucv4__check-avatar" onClick={stop}>
            <input type="checkbox" className="ucv4__checkbox" aria-label={`Select ${user.name}`} />
            <Avatar initials={user.initials} avatarColor={user.avatarColor} avatarPhotoSrc={user.avatarPhotoSrc} size="sm" className="ucv4__avatar" />
          </span>

          <span className="ucv4__id">
            <span className="ucv4__name">{user.name}</span>
            <span className="ucv4__role">{user.title} • {user.location}</span>
          </span>

          <span className="ucv4__chips">
            {actionCount > 0 && (
              <span className="ucv4__action-flag" title={`${actionCount} suggested action${actionCount > 1 ? 's' : ''}`}>
                <span className="material-symbols-outlined" aria-hidden>bolt</span>
                {actionCount}
              </span>
            )}
            <span className={`ucv4__chip ucv4__chip--risk-${riskLevel}`}>
              <span className="ucv4__chip-dot" aria-hidden />
              {RISK_LABEL[riskLevel]}
            </span>
            <span className={`ucv4__chip ucv4__chip--ai-${aiStatus}`}>
              <span className="material-symbols-outlined ucv4__chip-icon" aria-hidden>{AI_META[aiStatus].icon}</span>
              {AI_META[aiStatus].label}
              {user.aiReadiness != null && <span className="ucv4__chip-pct">{user.aiReadiness}%</span>}
            </span>
          </span>

          <span className="material-symbols-outlined ucv4__chevron" aria-hidden>expand_more</span>
        </div>

        {/* Level 2 — progressive disclosure */}
        {expanded && (
          <div className="ucv4__detail">
            <div className="ucv4__stats">
              <div className="ucv4__stat">
                <span className="ucv4__stat-label">AI adoption</span>
                <span className={`ucv4__stat-value ucv4__tone--${adoption.tone}`}>{adoption.label}</span>
              </div>
              <div className="ucv4__stat">
                <span className="ucv4__stat-label">Augmentable work</span>
                <span className="ucv4__stat-value">
                  {user.augmentableTasks ?? 0} of {user.totalTasks ?? 0} tasks
                  {user.hrsUnlockable != null && <span className="ucv4__stat-sub"> · ~{user.hrsUnlockable} hrs/wk</span>}
                </span>
              </div>
              <div className="ucv4__stat">
                <span className="ucv4__stat-label">Upskilling plan</span>
                <span className={`ucv4__stat-value ucv4__tone--${upTone}`}>
                  {upTotal === 0 ? 'No plan' : `${upDone} of ${upTotal} complete`}
                </span>
                {upTotal > 0 && (
                  <span className="ucv4__miniprogress" aria-hidden>
                    <span className={`ucv4__miniprogress-fill ucv4__miniprogress-fill--${upTone}`} style={{ width: `${upPct}%` }} />
                  </span>
                )}
              </div>
              <div className="ucv4__stat">
                <span className="ucv4__stat-label">Succession</span>
                <span className="ucv4__stat-value">{user.successionPlanning}</span>
              </div>
              <div className="ucv4__stat">
                <span className="ucv4__stat-label">Profile</span>
                <span className="ucv4__stat-value ucv4__stat-value--muted">{user.completionPercent}% complete</span>
              </div>
            </div>

            <div className="ucv4__risk">
              <span className="ucv4__risk-title">Risk profile</span>
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

            <div className="ucv4__actions">
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

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button type="button" className="user-card__manager-actions user-card__manager-actions--select-outline" aria-haspopup="menu">
                    <span className="user-card__manager-actions-label-text">Manager actions</span>
                    {actionCount > 0 ? <span className="user-card__manager-actions-badge" aria-hidden>{actionCount}</span> : null}
                    <span className="material-symbols-outlined user-card__manager-actions-chevron" aria-hidden>expand_more</span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="user-card__manager-actions-content" align="start" sideOffset={4}>
                    <DropdownMenu.Label className="user-card__manager-actions-label">Suggested actions</DropdownMenu.Label>
                    <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                      <span className="material-symbols-outlined user-card__manager-actions-icon">bolt</span>
                      Nudge AI adoption
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                      <span className="material-symbols-outlined user-card__manager-actions-icon">school</span>
                      Assign upskilling plan
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="user-card__manager-actions-separator" />
                    <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={() => setEditSheetOpen(true)}>
                      <span className="material-symbols-outlined user-card__manager-actions-icon">label</span>
                      Edit Risk Indicators
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              <Button
                variant="secondary"
                size="sm"
                className="ucv4__open-profile"
                trailingIcon={<span className="material-symbols-outlined">arrow_forward</span>}
                onClick={() => setProfileSheetOpen(true)}
              >
                Open full profile
              </Button>
            </div>
          </div>
        )}
      </article>

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
