import './EducationCard.css'
import { useUser } from '../contexts/UserContext'

interface EducationEntry {
  school: string
  degree?: string
  field?: string
  dateRange?: string
  /** Comma-separated coursework / subjects shown below the date */
  coursework?: string
  logoSrc?: string
  logoBg?: string
  logoInitials?: string
}

const EDUCATION_BY_USER: Record<string, EducationEntry[]> = {
  csm: [
    {
      school: 'Carnegie Mellon University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      dateRange: '2013 – 2017',
      logoBg: '#C41230',
      logoInitials: 'CMU',
    },
  ],
}

/** Shown on profiles without a hand-authored history, so every profile has an education section. */
const DEFAULT_EDUCATION: EducationEntry[] = [
  {
    school: 'Santa Clara University',
    degree: 'BSc',
    field: 'Computer Science',
    dateRange: 'Sep 2006 – Jun 2010',
    coursework: 'Programming, Databases, Distributed Systems, Networking, Algorithms',
  },
  {
    school: 'Foothill College',
    degree: 'Associate',
    field: 'Information Technology',
    dateRange: 'Sep 2004 – Jun 2006',
    coursework: 'Web Development, Systems Administration, Technical Writing, Data Structures',
  },
]

interface EducationCardProps {
  personId?: string
}

export function EducationCard({ personId }: EducationCardProps) {
  const { currentUser } = useUser()
  const id = personId ?? currentUser.id
  const entries = EDUCATION_BY_USER[id] ?? DEFAULT_EDUCATION
  const showEditButton = !personId

  return (
    <div className="education-card">
      <div className="education-card__header">
        <div className="education-card__header-left">
          <h3 className="education-card__title">Education</h3>
          {entries.length > 0 && (
            <span className="education-card__badge">{entries.length}</span>
          )}
        </div>
        {showEditButton && (
          <button type="button" className="education-card__add-btn" aria-label="Add education">
            <span className="material-symbols-outlined">add</span>
          </button>
        )}
      </div>

      {entries.length > 0 && (
        <ul className="education-card__list">
          {entries.map((entry, i) => (
            <li key={i} className={`education-card__item${i > 0 ? ' education-card__item--divider' : ''}`}>
              <div
                className="education-card__logo"
                style={{ background: entry.logoBg ?? '#56568C' }}
              >
                {entry.logoSrc ? (
                  <img src={entry.logoSrc} alt="" className="education-card__logo-img" />
                ) : entry.logoInitials ? (
                  <span className="education-card__logo-text">{entry.logoInitials}</span>
                ) : (
                  <span className="material-symbols-outlined education-card__logo-icon">school</span>
                )}
              </div>
              <div className="education-card__body">
                <p className="education-card__school">{entry.school}</p>
                {(entry.degree || entry.field) && (
                  <p className="education-card__degree">
                    {[entry.degree, entry.field].filter(Boolean).join(', ')}
                  </p>
                )}
                {entry.dateRange && (
                  <p className="education-card__date">{entry.dateRange}</p>
                )}
                {entry.coursework && (
                  <p className="education-card__coursework">{entry.coursework}</p>
                )}
              </div>
              {showEditButton && (
                <div className="education-card__actions">
                  <button type="button" className="education-card__action-btn" aria-label="Delete">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                  <button type="button" className="education-card__action-btn" aria-label="Edit">
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
