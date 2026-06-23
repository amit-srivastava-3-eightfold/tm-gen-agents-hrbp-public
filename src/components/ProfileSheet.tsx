import { useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { OpenTo, type OpenToItem } from './OpenTo'
import type { UserCardData } from './UserCard'
import './ProfileSheet.css'

/** Mini person reference (e.g. the subject's manager) shown in the peer "At a glance" card */
export interface ProfilePersonRef {
  name: string
  title: string
  initials: string
  avatarColor: string
  avatarPhotoSrc?: string
}

/** Peer-view "At a glance" facts */
export interface ProfileGlance {
  manager?: ProfilePersonRef
  businessUnit?: string
  currentTenure?: string
}

/** Peer-view "Contact & Links" details */
export interface ProfileContact {
  phone?: string
  email?: string
}

export interface ProfileSheetProps {
  /** Person to render; sheet is empty when null */
  user: UserCardData | null
  open: boolean
  onClose: () => void
  /**
   * Which composition to render.
   * - `manager` (default): Manage actions, risk profile, Manager actions menu, then Highlights.
   * - `peer`: Highlights, Contact & Links, and At a glance.
   */
  variant?: 'manager' | 'peer'
  /** "Open to" icons shown under the action row (defaults to coffee + mentoring) */
  openToIcons?: OpenToItem[]
  /** Highlights bullets (yellow card) */
  highlights?: string[]
  /** Peer view: contact details for the "Contact & Links" card */
  contact?: ProfileContact
  /** Peer view: facts for the "At a glance" card */
  glance?: ProfileGlance
  /** Manager view: fires when a "Manage" row is clicked */
  onManageAction?: (key: ManageRowKey) => void
  /** Manager view: fires when a risk tag's edit pencil or the "Edit Risk Indicators" menu item is clicked */
  onEditRisk?: () => void
}

type ManageRowKey =
  | 'profile-completeness'
  | 'career-interests'
  | 'self-assessment'
  | 'development-planning'

interface ManageRow {
  key: ManageRowKey
  icon: string
  label: string
  getValue: (u: UserCardData) => string
}

const MANAGE_ROWS: ManageRow[] = [
  { key: 'profile-completeness', icon: 'person', label: 'Profile completeness', getValue: (u) => `${u.completionPercent}% complete` },
  { key: 'career-interests', icon: 'work', label: 'Career interests', getValue: (u) => u.careerInterests },
  { key: 'self-assessment', icon: 'assignment_ind', label: 'Self assessment', getValue: (u) => u.selfAssessment },
  { key: 'development-planning', icon: 'trending_up', label: 'Development planning', getValue: (u) => u.developmentPlanning },
]

const RISK_TAG_LABEL_ORDER = ['Retention risk', 'Loss impact', 'Employee criticality'] as const

/* Reuse the EditRiskSheet body attribute so the global navbar-lowering CSS applies */
const BODY_SHEET_ATTR = 'data-edit-sheet-open'

export function ProfileSheet({
  user,
  open,
  onClose,
  variant = 'manager',
  openToIcons = ['coffee', 'mentoring'],
  highlights = [],
  contact,
  glance,
  onManageAction,
  onEditRisk,
}: ProfileSheetProps) {
  useLayoutEffect(() => {
    if (open) document.body.setAttribute(BODY_SHEET_ATTR, 'true')
    return () => document.body.removeAttribute(BODY_SHEET_ATTR)
  }, [open])

  if (!open || !user) return null

  const orderedRiskTags = RISK_TAG_LABEL_ORDER
    .map((label) => user.riskTags.find((t) => t.label === label))
    .filter((t): t is NonNullable<typeof t> => t != null)

  const highlightsBlock = highlights.length > 0 && (
    <div className="profile-sheet__highlights">
      <h3 className="profile-sheet__highlights-title">Highlights</h3>
      <ul className="profile-sheet__highlights-list">
        {highlights.map((text, i) => (
          <li key={i} className="profile-sheet__highlight">
            <span className="material-symbols-outlined profile-sheet__highlight-icon">work</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  const contactBlock = contact && (contact.phone || contact.email) && (
    <div className="profile-sheet__surface">
      <h3 className="profile-sheet__section-title">Contact &amp; Links</h3>
      <div className="profile-sheet__contact-list">
        {contact.phone && (
          <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="profile-sheet__contact-row">
            <span className="material-symbols-outlined profile-sheet__contact-icon">call</span>
            {contact.phone}
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="profile-sheet__contact-row">
            <span className="material-symbols-outlined profile-sheet__contact-icon">mail</span>
            {contact.email}
          </a>
        )}
      </div>
    </div>
  )

  const glanceBlock = glance && (glance.manager || glance.businessUnit || glance.currentTenure) && (
    <div className="profile-sheet__surface">
      <h3 className="profile-sheet__section-title">At a glance</h3>
      {glance.manager && (
        <div className="profile-sheet__glance-field">
          <span className="profile-sheet__glance-label">Manager</span>
          <div className="profile-sheet__glance-manager">
            <Avatar
              initials={glance.manager.initials}
              avatarColor={glance.manager.avatarColor}
              avatarPhotoSrc={glance.manager.avatarPhotoSrc}
              size="sm"
            />
            <div className="profile-sheet__glance-manager-text">
              <span className="profile-sheet__glance-manager-name">{glance.manager.name}</span>
              <span className="profile-sheet__glance-manager-title">{glance.manager.title}</span>
            </div>
          </div>
        </div>
      )}
      {glance.businessUnit && (
        <div className="profile-sheet__glance-field">
          <span className="profile-sheet__glance-label">Business unit</span>
          <span className="profile-sheet__glance-value">{glance.businessUnit}</span>
        </div>
      )}
      {glance.currentTenure && (
        <div className="profile-sheet__glance-field">
          <span className="profile-sheet__glance-label">Current tenure</span>
          <span className="profile-sheet__glance-value">{glance.currentTenure}</span>
        </div>
      )}
    </div>
  )

  const sheetContent = (
    <div className="profile-sheet__root" aria-modal="true" aria-labelledby="profile-sheet-name">
      <div className="profile-sheet__backdrop" onClick={onClose} aria-hidden />
      <div className="profile-sheet" role="dialog">
        {/* Floating header actions — always visible over the panel */}
        <div className="profile-sheet__banner-actions">
          <Link to={`/people/${user.id}`} className="profile-sheet__view-profile">
            View Profile
          </Link>
          <button type="button" className="profile-sheet__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="profile-sheet__scroll">
          {/* Banner strip; card overlaps it from below */}
          <div className="profile-sheet__banner" aria-hidden />

          {/* Identity card overlapping the banner */}
          <div className="profile-sheet__card">
            <div className="profile-sheet__card-top">
              <Avatar
                initials={user.initials}
                avatarColor={user.avatarColor}
                avatarPhotoSrc={user.avatarPhotoSrc}
                size="md"
                className="profile-sheet__avatar"
              />
              <button type="button" className="profile-sheet__doc-btn" aria-label="View documents">
                <span className="material-symbols-outlined">description</span>
              </button>
            </div>
            <h2 id="profile-sheet-name" className="profile-sheet__name">{user.name}</h2>
            <p className="profile-sheet__title">{user.title}</p>
            <p className="profile-sheet__location">
              <span className="material-symbols-outlined">location_on</span>
              {user.location}
            </p>
            <div className="profile-sheet__actions">
              <Button variant="secondary" className="profile-sheet__action profile-sheet__action--ask" leadingIcon={<span className="material-symbols-outlined">chat_bubble</span>}>
                Ask
              </Button>
              <Button variant="outline" className="profile-sheet__action" leadingIcon={<span className="material-symbols-outlined">handshake</span>}>
                Request
              </Button>
              <Button variant="outline" className="profile-sheet__action" leadingIcon={<span className="material-symbols-outlined">bookmark</span>}>
                Save
              </Button>
            </div>
            <div className="profile-sheet__open-to">
              <OpenTo items={openToIcons} labelAsButton={false} />
            </div>
          </div>

          {/* Manage section — manager view only */}
          {variant === 'manager' && (
          <div className="profile-sheet__section">
            <h3 className="profile-sheet__section-title">Manage {user.name.split(' ')[0]}</h3>
            <div className="profile-sheet__manage-list">
              {MANAGE_ROWS.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  className="profile-sheet__manage-row"
                  onClick={() => onManageAction?.(row.key)}
                >
                  <span className="profile-sheet__manage-head">
                    <span className="material-symbols-outlined profile-sheet__manage-icon">{row.icon}</span>
                    {row.label}
                  </span>
                  <span className="profile-sheet__manage-value-row">
                    <span className="profile-sheet__manage-value">{row.getValue(user)}</span>
                    <span className="material-symbols-outlined profile-sheet__manage-chevron">chevron_right</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="profile-sheet__risk">
              <h4 className="profile-sheet__risk-title">
                <span className="material-symbols-outlined">speed</span>
                Risk profile
              </h4>
              <div className="profile-sheet__risk-tags">
                {orderedRiskTags.map((tag) => {
                  const isHigh = tag.value === 'High' || tag.isCritical === true
                  const hasRating = !tag.isEmpty && tag.value != null
                  return (
                    <span
                      key={tag.label}
                      className={`profile-sheet__risk-tag ${isHigh ? 'profile-sheet__risk-tag--critical' : ''} ${tag.isEmpty ? 'profile-sheet__risk-tag--empty' : ''}`}
                    >
                      <span className="profile-sheet__risk-tag-text">
                        {hasRating ? `${tag.label}: ${tag.value}` : tag.label}
                      </span>
                      <button
                        type="button"
                        className="profile-sheet__risk-tag-pencil"
                        aria-label={`Edit ${tag.label}`}
                        onClick={onEditRisk}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button type="button" className="profile-sheet__manager-actions" aria-haspopup="menu">
                  Manager actions
                  <span className="material-symbols-outlined profile-sheet__manager-actions-chevron" aria-hidden>expand_more</span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="profile-sheet__ma-content" align="start" sideOffset={4}>
                  <DropdownMenu.Label className="profile-sheet__ma-label">Suggested actions</DropdownMenu.Label>
                  <DropdownMenu.Item className="profile-sheet__ma-item" onSelect={(e) => e.preventDefault()}>
                    <span className="material-symbols-outlined profile-sheet__ma-icon">mail</span>
                    Send self assessment reminder
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="profile-sheet__ma-item" onSelect={(e) => e.preventDefault()}>
                    <span className="material-symbols-outlined profile-sheet__ma-icon">format_list_bulleted</span>
                    Assess skills
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="profile-sheet__ma-item" onSelect={(e) => e.preventDefault()}>
                    <span className="material-symbols-outlined profile-sheet__ma-icon">add</span>
                    Create succession plan
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="profile-sheet__ma-separator" />
                  <DropdownMenu.Label className="profile-sheet__ma-label">All actions</DropdownMenu.Label>
                  <DropdownMenu.Item className="profile-sheet__ma-item" onSelect={() => onEditRisk?.()}>
                    <span className="material-symbols-outlined profile-sheet__ma-icon">label</span>
                    Edit Risk Indicators
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="profile-sheet__ma-item" onSelect={(e) => e.preventDefault()}>
                    <span className="material-symbols-outlined profile-sheet__ma-icon">mail</span>
                    Send development plan reminder
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="profile-sheet__ma-item" onSelect={(e) => e.preventDefault()}>
                    <span className="material-symbols-outlined profile-sheet__ma-icon">add</span>
                    Create development plan
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          )}

          {/* Shared across both views */}
          {highlightsBlock}
          {contactBlock}
          {glanceBlock}
        </div>
      </div>
    </div>
  )

  return createPortal(sheetContent, document.body)
}
