import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button, Tag } from '@tonyh-2-eightfold/ef-design-system'
import { Avatar } from './ui/Avatar'
import { EditRiskSheet } from './EditRiskSheet'
import { ProfileSheet, type ProfileContact, type ProfileGlance } from './ProfileSheet'
import { TasksReviewBadge } from './workforceReadiness/TasksReviewBadge'
import { WfrSheet } from './workforceReadiness/WfrSheet'
import { WfrTaskSheetBody } from './workforceReadiness/WfrTaskSheetBody'
import './workforceReadiness/WorkforceReadinessDashboard.css'
import type { UserCardData, RiskTag } from './UserCard'
import './UserCardTable.css'

/* ──────────────────────────────────────────────────────────────────────
   Team report card — v5 (comparison table + progressive disclosure).

   Closed row: dense, column-aligned, and deliberately quiet — values are
   neutral text; color shrinks to a single status dot per signal (green /
   amber / grey, amber = needs attention) so the eye is drawn only to
   problems. Expanding tells a story: a synthesized summary + recommended
   action, then themed evidence groups. "Open full profile" is the deepest level.
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
const RISK_LABEL: Record<RiskLevel, string> = { high: 'High', medium: 'Medium', low: 'Low' }
const RISK_DOT: Record<RiskLevel, string> = { high: 'amber', medium: 'grey', low: 'green' }

type AiStatus = 'ready' | 'building' | 'gap'
function getAiStatus(u: UserCardData): AiStatus {
  const r = u.aiReadiness ?? 0
  if (r >= 50) return 'ready'
  if (r >= 35 && u.aiAdoption && u.aiAdoption !== 'not-started') return 'building'
  return 'gap'
}
const AI_LABEL: Record<AiStatus, string> = { ready: 'AI-ready', building: 'Building', gap: 'Gap' }

const ADOPTION_LABEL: Record<NonNullable<UserCardData['aiAdoption']>, string> = {
  'active': 'Active user',
  'exploring': 'Exploring',
  'not-started': 'Not started',
}

/* Synthesize the row's signals into a one-line situation summary — the story. */
function buildStory(u: UserCardData, aiStatus: AiStatus, riskLevel: RiskLevel, upDone: number, upTotal: number): string {
  const parts: string[] = []
  const r = u.aiReadiness
  if (aiStatus === 'ready') parts.push(`AI-ready${r != null ? ` (${r}%)` : ''}${u.aiAdoption === 'active' ? ' and an active user' : ''}`)
  else if (aiStatus === 'building') parts.push(`building AI fluency${r != null ? ` (${r}%)` : ''}${u.aiAdoption === 'exploring' ? ' and exploring tools' : ''}`)
  else parts.push(`not using AI yet${r != null ? ` (${r}% readiness)` : ''}`)

  if (u.totalTasks) parts.push(`${u.augmentableTasks ?? 0} of ${u.totalTasks} tasks are augmentable${u.hrsUnlockable != null ? ` (~${u.hrsUnlockable} hrs/wk)` : ''}`)

  if (upTotal === 0) parts.push('no upskilling plan in place')
  else if (upDone >= upTotal) parts.push('upskilling complete')
  else parts.push(`${upDone} of ${upTotal} upskilling steps done`)

  if (riskLevel === 'high') parts.push('flagged as a high talent risk')

  const s = parts.join(', ')
  return `${u.name.split(' ')[0]} is ${s}.`
}

/* The single most relevant next step, derived from the same signals. */
function recommendation(u: UserCardData, aiStatus: AiStatus, upDone: number, upTotal: number): { label: string; icon: string } {
  if ((u.aiAdoption ?? 'not-started') === 'not-started') return { label: 'Nudge AI adoption', icon: 'bolt' }
  if (upTotal === 0) return { label: 'Assign upskilling plan', icon: 'school' }
  if (upDone < upTotal) return { label: 'Assign next upskilling step', icon: 'school' }
  if (aiStatus === 'ready') return { label: 'Add to succession shortlist', icon: 'account_tree' }
  return { label: 'Review development plan', icon: 'trending_up' }
}

/* WFR-style metric bar — mirrors the dashboard's DeptTableSoloBar
   (purple potential / green readiness fill, % label beneath). */
function UctBar({ variant, pct }: { variant: 'potential' | 'readiness'; pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <span className="uct-bar">
      <span className="uct-bar__track">
        <span className={`uct-bar__fill uct-bar__fill--${variant}`} style={{ width: `${clamped}%` }} />
      </span>
      <span className={`uct-bar__pct uct-bar__pct--${variant}`}>{pct}%</span>
    </span>
  )
}

/* WFR-style metric column header — label + info tooltip. */
function MetricHead({ label, info }: { label: string; info: string }) {
  return (
    <span className="uct__h-metric">
      {label}
      <span className="material-symbols-outlined uct__h-info" title={info} aria-hidden>info</span>
    </span>
  )
}

/* Profile-sheet cards, derived from the person's data (no extra source fields needed). */
function profileHighlights(u: UserCardData): string[] {
  const h: string[] = []
  if (u.tenureYears != null) h.push(`${u.tenureYears} ${u.tenureYears === 1 ? 'year' : 'years'} in current role`)
  if (u.skillStrengths?.length) h.push(`Strengths: ${u.skillStrengths.slice(0, 3).join(', ')}`)
  if (u.skillInterests?.length) h.push(`Interested in ${u.skillInterests.slice(0, 2).join(' & ')}`)
  return h
}

function profileContact(u: UserCardData): ProfileContact {
  const [first, ...rest] = u.name.split(' ')
  const last = rest.join('') || first
  return {
    email: `${first[0]}${last}@eightfold.ai`.toLowerCase(),
    phone: `(415) 555-0${100 + (Number(u.id) || 0)}`,
  }
}

function profileGlance(u: UserCardData): ProfileGlance {
  const t = u.title.toLowerCase()
  const businessUnit = /success|insight|support|account|renewal|customer/.test(t) ? 'Customer Success'
    : /sales|revenue/.test(t) ? 'Sales'
    : /engineer|developer|software|technical/.test(t) ? 'Engineering'
    : 'Customer Success'
  return {
    businessUnit,
    currentTenure: u.tenureYears != null ? `${u.tenureYears} ${u.tenureYears === 1 ? 'year' : 'years'}` : undefined,
  }
}

interface UserCardTableProps {
  users: UserCardData[]
  onRiskTagsChange?: (userId: string, riskTags: RiskTag[]) => void
}

export function UserCardTable({ users, onRiskTagsChange }: UserCardTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editUser, setEditUser] = useState<UserCardData | null>(null)
  const [profileUser, setProfileUser] = useState<UserCardData | null>(null)
  const [taskSheetUser, setTaskSheetUser] = useState<UserCardData | null>(null)

  const stop = (e: React.MouseEvent) => e.stopPropagation()
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="uct">
      {/* Column header — makes the columns comparable */}
      <div className="uct__head" role="row">
        <span className="uct__h">Report</span>
        <span className="uct__h"><MetricHead label="AI potential" info="Share of daily tasks in the augmentation zone — work AI can help with today." /></span>
        <span className="uct__h"><MetricHead label="AI readiness" info="Estimated from skill profiles — ≥50% is AI-ready." /></span>
        <span className="uct__h"><MetricHead label="Tasks" info="Number of role tasks — open to view the AI classification." /></span>
        <span className="uct__h">Risk</span>
        <span className="uct__h" />
        <span className="uct__h" />
      </div>

      {users.map((u) => {
        const riskLevel = getRiskLevel(u.riskTags)
        const aiStatus = getAiStatus(u)
        const actionCount = u.managerActionsCount ?? 0
        const isOpen = expanded.has(u.id)

        const upDone = u.upskillingCompleted ?? 0
        const upTotal = u.upskillingTotal ?? 0
        const upPct = upTotal > 0 ? Math.round((upDone / upTotal) * 100) : 0
        const upTone = upTotal === 0 ? 'none' : upDone >= upTotal ? 'good' : upDone === 0 ? 'bad' : 'warn'
        const aiPotential = u.totalTasks ? Math.round(((u.augmentableTasks ?? 0) / u.totalTasks) * 100) : null
        const rec = recommendation(u, aiStatus, upDone, upTotal)

        return (
          <div key={u.id} className={`uct__group ${isOpen ? 'is-open' : ''}`}>
            <div
              className="uct__row"
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => toggle(u.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(u.id) } }}
            >
              {/* Person — opens the profile sheet */}
              <span className="uct__person">
                <span className="uct__check" onClick={stop}>
                  <input type="checkbox" className="uct__checkbox" aria-label={`Select ${u.name}`} />
                </span>
                <span
                  className="uct__person-link"
                  role="button"
                  tabIndex={0}
                  title={`Open ${u.name}'s profile`}
                  onClick={(e) => { e.stopPropagation(); setProfileUser(u) }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setProfileUser(u) } }}
                >
                  <Avatar initials={u.initials} avatarColor={u.avatarColor} avatarPhotoSrc={u.avatarPhotoSrc} size="sm" className="uct__avatar" />
                  <span className="uct__person-text">
                    <span className="uct__name">{u.name}</span>
                    <span className="uct__role">{u.title} • {u.location}</span>
                  </span>
                </span>
              </span>

              {/* AI potential */}
              <span className="uct__cell">
                {aiPotential != null ? <UctBar variant="potential" pct={aiPotential} /> : <span className="uct__augment-sub">—</span>}
              </span>

              {/* AI readiness */}
              <span className="uct__cell">
                {u.aiReadiness != null ? <UctBar variant="readiness" pct={u.aiReadiness} /> : <span className="uct__augment-sub">—</span>}
              </span>

              {/* Tasks */}
              <span className="uct__cell" onClick={stop}>
                <TasksReviewBadge
                  dept={u.title}
                  title={u.name}
                  count={u.totalTasks ?? 0}
                  showReviewState={false}
                  onClick={(e) => { e.stopPropagation(); setTaskSheetUser(u) }}
                />
              </span>

              {/* Risk */}
              <span className="uct__cell uct__signal">
                <span className={`uct__dot uct__dot--${RISK_DOT[riskLevel]}`} aria-hidden />
                <span className="uct__signal-text">{RISK_LABEL[riskLevel]}</span>
              </span>

              {/* Actions — always visible */}
              <span className="uct__cell uct__actions" onClick={stop}>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button type="button" className="user-card__manager-actions user-card__manager-actions--select-outline uct__actions-btn" aria-haspopup="menu">
                      <span className="user-card__manager-actions-label-text">Actions</span>
                      {actionCount > 0 ? <span className="user-card__manager-actions-badge" aria-hidden>{actionCount}</span> : null}
                      <span className="material-symbols-outlined user-card__manager-actions-chevron" aria-hidden>expand_more</span>
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="user-card__manager-actions-content" align="end" sideOffset={4}>
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
                      <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                        <span className="material-symbols-outlined user-card__manager-actions-icon">mail</span>
                        Send career interest reminder
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={() => setEditUser(u)}>
                        <span className="material-symbols-outlined user-card__manager-actions-icon">label</span>
                        Edit Risk Indicators
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                        <span className="material-symbols-outlined user-card__manager-actions-icon">mail</span>
                        Send self assessment reminder
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

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button type="button" className="uct__kebab" aria-label="More options">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="user-card__manager-actions-content" align="end" sideOffset={4}>
                      <DropdownMenu.Label className="user-card__manager-actions-label">Contact</DropdownMenu.Label>
                      <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                        <span className="material-symbols-outlined user-card__manager-actions-icon">mail</span>
                        Email
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                        <span className="material-symbols-outlined user-card__manager-actions-icon">chat</span>
                        Message
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                        <span className="material-symbols-outlined user-card__manager-actions-icon">calendar_today</span>
                        Schedule call
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="user-card__manager-actions-separator" />
                      <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={() => setProfileUser(u)}>
                        <span className="material-symbols-outlined user-card__manager-actions-icon">description</span>
                        Open full profile
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="user-card__manager-actions-item" onSelect={(e) => e.preventDefault()}>
                        <span className="material-symbols-outlined user-card__manager-actions-icon">account_tree</span>
                        Org chart
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </span>

              {/* Expand */}
              <span className="material-symbols-outlined uct__chevron" aria-hidden>expand_more</span>
            </div>

            {isOpen && (
              <div className="uct__detail">
                {/* The story — synthesized summary + recommended next step */}
                <div className="uct__story">
                  <span className="material-symbols-outlined uct__story-icon" aria-hidden>insights</span>
                  <p className="uct__story-text">{buildStory(u, aiStatus, riskLevel, upDone, upTotal)}</p>
                  <Button variant="primary" size="sm" className="uct__story-cta" onClick={(e: React.MouseEvent) => e.preventDefault()}>
                    <span className="material-symbols-outlined" aria-hidden>{rec.icon}</span>
                    {rec.label}
                  </Button>
                </div>

                {/* Evidence — themed groups inside a clean panel */}
                <div className="uct__panel">
                  <div className="uct__groups">
                    <div className="uct__group-col">
                      <h5 className="uct__group-h"><span className="material-symbols-outlined uct__group-icon" aria-hidden>auto_awesome</span>AI transformation</h5>
                      <div className="uct__drow">
                        <span className="uct__drow-label">AI potential</span>
                        <span className="uct__drow-value">
                          <span className="uct__ibar"><span className="uct__ibar-fill uct__ibar-fill--potential" style={{ width: `${aiPotential ?? 0}%` }} /></span>
                          {aiPotential != null ? `${aiPotential}%` : '—'}
                        </span>
                      </div>
                      <div className="uct__drow">
                        <span className="uct__drow-label">Readiness</span>
                        <span className="uct__drow-value">
                          <span className="uct__ibar"><span className="uct__ibar-fill uct__ibar-fill--readiness" style={{ width: `${u.aiReadiness ?? 0}%` }} /></span>
                          {AI_LABEL[aiStatus]}{u.aiReadiness != null ? ` · ${u.aiReadiness}%` : ''}
                        </span>
                      </div>
                      <div className="uct__drow">
                        <span className="uct__drow-label">Adoption</span>
                        <span className="uct__drow-value">{ADOPTION_LABEL[u.aiAdoption ?? 'not-started']}</span>
                      </div>
                      <div className="uct__drow">
                        <span className="uct__drow-label">Productivity upside</span>
                        <span className="uct__drow-value">{u.hrsUnlockable != null ? `~${u.hrsUnlockable} hrs/wk` : '—'}</span>
                      </div>
                      <div className="uct__drow">
                        <span className="uct__drow-label">Upskilling plan</span>
                        <span className="uct__drow-value">
                          {upTotal > 0 && (
                            <span className="uct__ibar"><span className={`uct__ibar-fill uct__ibar-fill--${upTone}`} style={{ width: `${upPct}%` }} /></span>
                          )}
                          {upTotal === 0 ? 'No plan' : `${upDone} of ${upTotal}`}
                        </span>
                      </div>
                    </div>

                    <div className="uct__group-col">
                      <h5 className="uct__group-h"><span className="material-symbols-outlined uct__group-icon" aria-hidden>workspace_premium</span>Talent</h5>
                      <div className="uct__drow">
                        <span className="uct__drow-label">Self assessment</span>
                        <span className="uct__drow-value">{u.selfAssessment}</span>
                      </div>
                      <div className="uct__drow">
                        <span className="uct__drow-label">Manager assessment</span>
                        <span className="uct__drow-value">{u.managerAssessment}</span>
                      </div>
                      <div className="uct__drow">
                        <span className="uct__drow-label">Career interests</span>
                        <span className="uct__drow-value">{u.careerInterests}</span>
                      </div>
                      <div className="uct__drow">
                        <span className="uct__drow-label">Succession</span>
                        <span className="uct__drow-value">{u.successionPlanning}</span>
                      </div>
                      <div className="uct__drow">
                        <span className="uct__drow-label">Profile completeness</span>
                        <span className="uct__drow-value">
                          <span className="uct__ibar"><span className="uct__ibar-fill uct__ibar-fill--neutral" style={{ width: `${u.completionPercent}%` }} /></span>
                          {u.completionPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk — full width, editable */}
                  <div className="uct__risk-row">
                    <span className="uct__group-h"><span className="material-symbols-outlined uct__group-icon" aria-hidden>shield</span>Risk profile</span>
                    <div className="user-card__risk-tags">
                      {sortRiskTags(u.riskTags).map((tag) => {
                        const isHigh = tag.value === 'High' || tag.isCritical === true
                        const hasRating = !tag.isEmpty && tag.value != null
                        return (
                          <span
                            key={tag.label}
                            className={`user-card__risk-tag-wrap ${tag.isEmpty ? 'user-card__risk-tag--empty' : ''} ${hasRating && !isHigh ? 'user-card__risk-tag--secondary' : ''} ${isHigh ? 'user-card__risk-tag--critical' : ''}`}
                          >
                            <Tag value={tag.label} variant={tag.isEmpty ? 'outline' : hasRating ? 'secondary' : 'outline'} size="24" className="user-card__risk-tag">
                              {tag.isEmpty ? tag.label : `${tag.label}: ${tag.value}`}
                            </Tag>
                            <button type="button" className="user-card__risk-tag-pencil" aria-label="Edit risk profile" onClick={() => setEditUser(u)}>
                              <span className="material-symbols-outlined">create</span>
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      <EditRiskSheet
        key={editUser ? editUser.id : 'edit-risk-closed'}
        user={editUser}
        open={!!editUser}
        onClose={() => setEditUser(null)}
        onSave={(tags) => { if (editUser) onRiskTagsChange?.(editUser.id, tags) }}
      />
      <ProfileSheet
        key={profileUser ? `sheet-${profileUser.id}` : 'profile-sheet-closed'}
        user={profileUser}
        open={!!profileUser}
        onClose={() => setProfileUser(null)}
        variant="manager"
        highlights={profileUser ? profileHighlights(profileUser) : []}
        contact={profileUser ? profileContact(profileUser) : undefined}
        glance={profileUser ? profileGlance(profileUser) : undefined}
        onEditRisk={() => { const u = profileUser; setProfileUser(null); setEditUser(u) }}
      />
      {taskSheetUser && (
        <WfrSheet
          open
          onClose={() => setTaskSheetUser(null)}
          title={taskSheetUser.title}
          subtitle={taskSheetUser.name}
          ariaLabel={`${taskSheetUser.title} tasks`}
        >
          <WfrTaskSheetBody role={{ title: taskSheetUser.title }} phase="baseline" viewMode="classification" />
        </WfrSheet>
      )}
    </div>
  )
}
