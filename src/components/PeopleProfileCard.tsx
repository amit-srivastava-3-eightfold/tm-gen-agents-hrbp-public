import { Link } from 'react-router-dom'
import { Button } from './ui/Button'
import { OpenTo } from './OpenTo'
import './ui/Button.css'
import './PeopleProfileCard.css'

export interface PeopleProfileCardData {
  id: string
  name: string
  title: string
  avatarType: 'initials' | 'photo'
  avatarInitials?: string
  avatarColor?: string
  avatarPhotoSrc?: string
  businessUnit: string
  manager: string
  location: string
  timeInCurrentPosition: string
  hasRequestButton: boolean
  openToIcons: ('coffee' | 'mentoring' | 'project')[]
  insights?: string[]
  matchScore?: number
  /** Role interest — shown as first insight when matchRole is provided */
  roleInterest?: string
  hireDate?: string
  mobilityPreference?: string
  eligibleForInternalMobility?: string
}

interface PeopleProfileCardProps {
  person: PeopleProfileCardData
  /** Role title for the match score (e.g. "Senior Sales Engineer") — shown above the score when provided */
  matchRole?: string
}

export function PeopleProfileCard({ person, matchRole }: PeopleProfileCardProps) {
  return (
    <article className="people-profile-card">
      <div className="people-profile-card__left">
        <div className="people-profile-card__profile">
          <Link to={`/people/${person.id}`} className="people-profile-card__avatar-link">
            <div className="people-profile-card__avatar" style={person.avatarColor ? { background: person.avatarColor } : undefined}>
              {person.avatarType === 'photo' && person.avatarPhotoSrc ? (
                <img src={person.avatarPhotoSrc} alt="" className="people-profile-card__avatar-img" />
              ) : (
                <span>{person.avatarInitials}</span>
              )}
            </div>
          </Link>
          <div className="people-profile-card__info">
            <Link to={`/people/${person.id}`} className="people-profile-card__name-link">
              <h3 className="people-profile-card__name">{person.name}</h3>
            </Link>
            <p className="people-profile-card__title">{person.title}</p>
          </div>
        </div>
        <div className="people-profile-card__header-actions">
          <button type="button" className="people-profile-card__icon-btn" aria-label="Org chart">
            <span className="material-symbols-outlined" aria-hidden>account_tree</span>
          </button>
          <button type="button" className="people-profile-card__icon-btn" aria-label="Bookmark">
            <span className="material-symbols-outlined" aria-hidden>bookmark</span>
          </button>
        </div>
        <div className="people-profile-card__actions">
          <Button variant="ghost" className="people-profile-card__ai-btn" aria-label="AI assistant">
            <span className="material-symbols-outlined" aria-hidden>auto_awesome</span>
          </Button>
          {person.hasRequestButton && (
            <Button variant="primary" className="people-profile-card__action-btn">
              <span className="material-symbols-outlined" aria-hidden>handshake</span>
              Request
            </Button>
          )}
          <Button variant="secondary" className="people-profile-card__action-btn">
            <span className="material-symbols-outlined" aria-hidden>bookmark</span>
            Save
          </Button>
        </div>
        <div className="people-profile-card__open-to">
          <OpenTo items={person.openToIcons} />
        </div>
      </div>
      <div className="people-profile-card__metadata">
        <div className="people-profile-card__metadata-grid">
        <div className="people-profile-card__metadata-item">
          <div className="people-profile-card__detail">
            <span className="material-symbols-outlined people-profile-card__detail-icon" aria-hidden>business</span>
            <span className="people-profile-card__detail-value">{person.businessUnit}</span>
          </div>
          <span className="people-profile-card__detail-label">Business Unit</span>
        </div>
        <div className="people-profile-card__metadata-item">
          <div className="people-profile-card__detail">
            <span className="material-symbols-outlined people-profile-card__detail-icon" aria-hidden>person</span>
            <span className="people-profile-card__detail-value">{person.manager}</span>
          </div>
          <span className="people-profile-card__detail-label">Manager</span>
        </div>
        <div className="people-profile-card__metadata-item">
          <div className="people-profile-card__detail">
            <span className="material-symbols-outlined people-profile-card__detail-icon" aria-hidden>location_on</span>
            <span className="people-profile-card__detail-value">{person.location}</span>
          </div>
          <span className="people-profile-card__detail-label">Location</span>
        </div>
        <div className="people-profile-card__metadata-item">
          <div className="people-profile-card__detail">
            <span className="material-symbols-outlined people-profile-card__detail-icon" aria-hidden>schedule</span>
            <span className="people-profile-card__detail-value">{person.timeInCurrentPosition}</span>
          </div>
          <span className="people-profile-card__detail-label">Time in current position</span>
        </div>
        </div>
      </div>
      <div className={`people-profile-card__insights ${person.insights?.length || (matchRole && (person.matchScore != null || person.roleInterest)) ? '' : 'people-profile-card__insights--empty'}`}>
        {matchRole && person.matchScore != null && (
          <div className="people-profile-card__match-score">
            {matchRole && (
              <span className="people-profile-card__match-role">{matchRole}</span>
            )}
            <div className="people-profile-card__match-row">
              <span className="people-profile-card__match-label">Match</span>
              <div className="people-profile-card__match-dots" aria-label={`Match score: ${person.matchScore} out of 5`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`people-profile-card__match-dot ${i <= person.matchScore! ? 'people-profile-card__match-dot--filled' : ''}`}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {matchRole && person.roleInterest && (
          <div className="people-profile-card__insight-item">
            <span className="material-symbols-outlined people-profile-card__insight-icon" aria-hidden>work</span>
            <span>Role interests: <strong>{person.roleInterest}</strong></span>
          </div>
        )}
        {person.insights?.map((text, i) => (
          <div key={i} className="people-profile-card__insight-item">
            <span className="material-symbols-outlined people-profile-card__insight-icon" aria-hidden>work</span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </article>
  )
}
