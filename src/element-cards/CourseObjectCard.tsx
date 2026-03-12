import type { ComponentType, ReactNode } from 'react'

export type CourseObjectCardCourse = {
  title: string
  provider?: string
  duration?: string
  skills?: string[]
  completedBy?: string[]
}

type LinkLikeProps = { to: string; className?: string; children: ReactNode }

const DefaultLink: ComponentType<LinkLikeProps> = ({ to, className, children }) => (
  <a href={to} className={className}>{children}</a>
)

export type CourseObjectCardProps = {
  course: CourseObjectCardCourse
  href?: string
  showBookmark?: boolean
  LinkComponent?: ComponentType<LinkLikeProps>
}

/**
 * Local CourseObjectCard so the app builds when the design system
 * does not export it (e.g. on Vercel). Uses same class names as DS for styling.
 */
export function CourseObjectCard({
  course,
  href = '#',
  showBookmark = true,
  LinkComponent = DefaultLink,
}: CourseObjectCardProps) {
  const meta = [course.provider, course.duration].filter(Boolean).join(' • ')
  const content = (
    <div className="course-object-card__inner">
      <div className="course-object-card__banner">
        <div className="course-object-card__tag-wrap">
          <span className="pill pill--blueGreen pill--small" data-icon="menu_book">Course</span>
        </div>
        <div className="course-object-card__banner-actions">
          <button type="button" className="course-object-card__icon-btn" aria-label="Add to learning plan">
            <span className="material-symbols-outlined">add</span>
          </button>
          {showBookmark && (
            <button type="button" className="course-object-card__icon-btn" aria-label="Save course">
              <span className="material-symbols-outlined">bookmark</span>
            </button>
          )}
        </div>
      </div>
      <div className="course-object-card__body">
        <span className="course-object-card__title">{course.title}</span>
        {meta && <span className="course-object-card__meta">{meta}</span>}
        {course.skills && course.skills.length > 0 && (
          <div className="course-object-card__skills">
            {course.skills.slice(0, 2).map((s) => (
              <span key={s} className="course-object-card__skill-tag">{s}</span>
            ))}
            {course.skills.length > 2 && (
              <span className="course-object-card__skill-tag course-object-card__skill-tag--more">
                +{course.skills.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="course-object-card__divider" aria-hidden />
      <div className="object-card-bottom-bar">
        <div className="object-card-bottom-bar__content">
          {course.completedBy && course.completedBy.length > 0 && (
            <>
              <div className="course-object-card__facepile">
                {course.completedBy.map((url, i) => (
                  <img key={i} src={url} alt="" className="course-object-card__facepile-avatar" />
                ))}
              </div>
              <span className="course-object-card__completed-text">completed this</span>
            </>
          )}
        </div>
      </div>
    </div>
  )

  if (href === '#') {
    return <div className="course-object-card">{content}</div>
  }

  return (
    <LinkComponent to={href} className="course-object-card">
      {content}
    </LinkComponent>
  )
}
