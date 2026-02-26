import { Link } from 'react-router-dom'
import { OpenTo } from '../OpenTo'
import { Pill } from '../ui/Pill'
import './ElementCardBottomBar.css'
import './PeopleElementCard.css'

export interface PeopleElementCardProps {
  person: {
    name: string
    title: string
    email: string
    avatarSrc: string
    openTo: 'mentoring' | 'coffee' | 'project'
  }
  href?: string
  showBookmark?: boolean
}

export function PeopleElementCard({
  person,
  href = '#',
  showBookmark = true,
}: PeopleElementCardProps) {
  const content = (
    <>
      <div className="people-element-card__banner">
        <div className="people-element-card__tag-wrap">
          <Pill icon="person" variant="orange" size="small">People</Pill>
        </div>
        <div className="people-element-card__banner-actions">
          <button
            type="button"
            className="people-element-card__icon-btn"
            aria-label="View org chart"
            onClick={(e) => e.preventDefault()}
          >
            <span className="material-symbols-outlined">account_tree</span>
          </button>
          {showBookmark && (
            <button
              type="button"
              className="people-element-card__icon-btn"
              aria-label="Remove from favorites"
              onClick={(e) => e.preventDefault()}
            >
              <span className="material-symbols-outlined">bookmark</span>
            </button>
          )}
        </div>
        <div className="people-element-card__pattern" aria-hidden />
      </div>
      <div className="people-element-card__avatar-wrap">
        <img src={person.avatarSrc} alt="" className="people-element-card__avatar" />
      </div>
      <div className="people-element-card__body">
        <span className="people-element-card__name">{person.name}</span>
        <span className="people-element-card__title">{person.title}</span>
        <span className="people-element-card__email">{person.email}</span>
      </div>
      <div className="people-element-card__divider" aria-hidden />
      <div className="element-card-bottom-bar">
        <div className="element-card-bottom-bar__content">
          <OpenTo items={[person.openTo]} labelAsButton={false} className="people-element-card__open-to" />
        </div>
      </div>
    </>
  )

  if (href === '#') {
    return <div className="people-element-card">{content}</div>
  }

  return <Link to={href} className="people-element-card">{content}</Link>
}
