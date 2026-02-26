import { Link } from 'react-router-dom'
import { Pill } from '../ui/Pill'
import './ElementCardBottomBar.css'
import './CourseElementCard.css'

export interface CourseElementCardProps {
  course: {
    title: string
    provider?: string
    duration?: string
    skills?: string[]
    completedBy?: string[]
  }
  href?: string
  showBookmark?: boolean
}

export function CourseElementCard({
  course,
  href = '#',
  showBookmark = true,
}: CourseElementCardProps) {
  const content = (
    <>
      <div className="course-element-card__banner">
        <div className="course-element-card__tag-wrap">
          <Pill icon="menu_book" variant="blueGreen" size="small">Course</Pill>
        </div>
        <div className="course-element-card__banner-actions">
          <button
            type="button"
            className="course-element-card__icon-btn"
            aria-label="Add to learning plan"
            onClick={(e) => e.preventDefault()}
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          {showBookmark && (
            <button
              type="button"
              className="course-element-card__icon-btn"
              aria-label="Save course"
              onClick={(e) => e.preventDefault()}
            >
              <span className="material-symbols-outlined">bookmark</span>
            </button>
          )}
        </div>
      </div>
      <div className="course-element-card__body">
        <span className="course-element-card__title">{course.title}</span>
        {(course.provider || course.duration) && (
          <span className="course-element-card__meta">
            {[course.provider, course.duration].filter(Boolean).join(' • ')}
          </span>
        )}
        {course.skills && course.skills.length > 0 && (
          <div className="course-element-card__skills">
            {course.skills.slice(0, 2).map((skill) => (
              <span key={skill} className="course-element-card__skill-tag">{skill}</span>
            ))}
            {course.skills.length > 2 && (
              <span className="course-element-card__skill-tag course-element-card__skill-tag--more">
                +{course.skills.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="course-element-card__divider" aria-hidden />
      <div className="element-card-bottom-bar">
        <div className="element-card-bottom-bar__content">
          {course.completedBy && course.completedBy.length > 0 && (
            <>
              <div className="course-element-card__facepile">
                {course.completedBy.map((avatarSrc, i) => (
                  <img
                    key={i}
                    src={avatarSrc}
                    alt=""
                    className="course-element-card__facepile-avatar"
                  />
                ))}
              </div>
              <span className="course-element-card__completed-text">completed this</span>
            </>
          )}
        </div>
      </div>
    </>
  )

  if (href === '#') {
    return <div className="course-element-card">{content}</div>
  }

  return <Link to={href} className="course-element-card">{content}</Link>
}
