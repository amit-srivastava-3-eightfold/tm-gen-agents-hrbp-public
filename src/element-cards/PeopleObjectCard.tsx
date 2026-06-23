import type { ComponentType, ReactNode } from 'react'
import { OpenTo, type OpenToItem } from '../components/OpenTo'

export type PeopleObjectCardPerson = {
  id?: string
  name: string
  title: string
  email: string
  avatarSrc: string
  openTo: string
}

type LinkLikeProps = { to: string; className?: string; children: ReactNode }

const DefaultLink: ComponentType<LinkLikeProps> = ({ to, className, children }) => (
  <a href={to} className={className}>{children}</a>
)

export type PeopleObjectCardProps = {
  person: PeopleObjectCardPerson
  href?: string
  showBookmark?: boolean
  LinkComponent?: ComponentType<LinkLikeProps>
}

/**
 * Local PeopleObjectCard so the app builds when the design system
 * does not export it (e.g. on Vercel). Uses same class names as DS for styling.
 */
export function PeopleObjectCard({
  person,
  href = '#',
  showBookmark = true,
  LinkComponent = DefaultLink,
}: PeopleObjectCardProps) {
  const content = (
    <>
      <div className="people-object-card__banner">
        <div className="people-object-card__tag-wrap">
          <span className="pill pill--orange pill--small" data-icon="person">
            People
          </span>
        </div>
        <div className="people-object-card__banner-actions">
          <button type="button" className="people-object-card__icon-btn" aria-label="View org chart">
            <span className="material-symbols-outlined">account_tree</span>
          </button>
          {showBookmark && (
            <button type="button" className="people-object-card__icon-btn" aria-label="Remove from favorites">
              <span className="material-symbols-outlined">bookmark</span>
            </button>
          )}
        </div>
        <div className="people-object-card__pattern" aria-hidden />
      </div>
      <div className="people-object-card__avatar-wrap">
        <img src={person.avatarSrc} alt="" className="people-object-card__avatar" />
      </div>
      <div className="people-object-card__body">
        <span className="people-object-card__name">{person.name}</span>
        <span className="people-object-card__title">{person.title}</span>
        <span className="people-object-card__email">{person.email}</span>
      </div>
      <div className="people-object-card__divider" aria-hidden />
      <div className="object-card-bottom-bar">
        <div className="object-card-bottom-bar__content">
          <OpenTo items={[person.openTo as OpenToItem]} labelAsButton={false} className="people-object-card__open-to" />
        </div>
      </div>
    </>
  )

  if (href === '#') {
    return <div className="people-object-card">{content}</div>
  }

  const Link = LinkComponent
  return (
    <Link to={href} className="people-object-card">
      {content}
    </Link>
  )
}
