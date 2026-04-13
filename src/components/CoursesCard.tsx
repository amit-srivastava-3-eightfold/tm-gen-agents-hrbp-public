import './CoursesCard.css'
import { useUser } from '../contexts/UserContext'

interface Course {
  title: string
  provider: string
  completedDate?: string
  logoInitials?: string
  logoColor?: string
  logoSrc?: string
  skills?: string[]
}

const COURSES_BY_USER: Record<string, Course[]> = {
  csm: [
    {
      title: 'AI for Software Engineers',
      provider: 'Coursera',
      completedDate: 'Mar 2026',
      logoInitials: 'CO',
      logoColor: '#054D7B',
      skills: ['AI Collaboration', 'Prompt Engineering'],
    },
    {
      title: 'Site Reliability Engineering Fundamentals',
      provider: 'Google Cloud',
      completedDate: 'Nov 2025',
      logoInitials: 'GC',
      logoColor: '#0B7B8B',
      skills: ['Observability', 'Incident Management'],
    },
    {
      title: 'Engineering Leadership Essentials',
      provider: 'LinkedIn Learning',
      completedDate: 'Aug 2025',
      logoInitials: 'LI',
      logoColor: '#2B3271',
      skills: ['Technical Mentorship', 'Stakeholder Communication'],
    },
  ],
}

interface CoursesCardProps {
  personId?: string
}

export function CoursesCard({ personId }: CoursesCardProps) {
  const { currentUser } = useUser()
  const id = personId ?? currentUser.id
  const courses = COURSES_BY_USER[id] ?? []
  const showEditButton = !personId

  return (
    <div className="courses-card">
      <div className="courses-card__header">
        <div className="courses-card__header-left">
          <h3 className="courses-card__title">Courses</h3>
          {courses.length > 0 && (
            <span className="courses-card__badge">{courses.length}</span>
          )}
        </div>
        {showEditButton && (
          <button type="button" className="courses-card__add-btn" aria-label="Add course">
            <span className="material-symbols-outlined">add</span>
          </button>
        )}
      </div>

      {courses.length > 0 && (
        <ul className="courses-card__list">
          {courses.map((course, i) => (
            <li key={i} className={`courses-card__item${i > 0 ? ' courses-card__item--divider' : ''}`}>
              <div
                className="courses-card__logo"
                style={{ background: course.logoColor ?? '#E8E9EB' }}
              >
                {course.logoInitials}
              </div>
              <div className="courses-card__body">
                <p className="courses-card__course-title">{course.title}</p>
                <p className="courses-card__provider">
                  {course.provider}
                  {course.completedDate && (
                    <span className="courses-card__date"> · {course.completedDate}</span>
                  )}
                </p>
                {course.skills && course.skills.length > 0 && (
                  <div className="courses-card__skills">
                    {course.skills.map((s) => (
                      <span key={s} className="courses-card__skill-tag">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              {showEditButton && (
                <div className="courses-card__actions">
                  <button type="button" className="courses-card__action-btn" aria-label="Delete">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                  <button type="button" className="courses-card__action-btn" aria-label="Edit">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
