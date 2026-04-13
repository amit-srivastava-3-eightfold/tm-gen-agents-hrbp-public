import './EducationCard.css'
import { useUser } from '../contexts/UserContext'

interface EducationEntry {
  school: string
  degree?: string
  field?: string
  dateRange?: string
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

interface EducationCardProps {
  personId?: string
}

export function EducationCard({ personId }: EducationCardProps) {
  const { currentUser } = useUser()
  const id = personId ?? currentUser.id
  const entries = EDUCATION_BY_USER[id] ?? []
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
                style={{ background: entry.logoBg ?? '#E8E9EB' }}
              >
                <span className="education-card__logo-text">{entry.logoInitials}</span>
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
