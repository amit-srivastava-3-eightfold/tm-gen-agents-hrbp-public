import './WorkExperienceCard.css'
import { useUser } from '../contexts/UserContext'

interface WorkEntry {
  title: string
  company: string
  logoSrc?: string
  logoInitials?: string
  logoColor?: string
  dateRange: string
  bullets?: string[]
  description?: string
}

const WORK_EXPERIENCE_BY_USER: Record<string, WorkEntry[]> = {
  csm: [
    {
      title: 'Engineering Lead',
      company: 'Acme Corp',
      logoInitials: 'AC',
      logoColor: '#054D7B',
      dateRange: 'Jan 2023 – Present',
      bullets: [
        'Lead a team of 8 engineers delivering platform reliability and AI-assisted tooling across 3 product lines.',
        'Defined SLO frameworks and observability standards adopted org-wide, reducing P1 incidents by 35%.',
        'Partnered with product and design to ship AI-assisted development workflows now used by 200+ engineers.',
        'Mentored 4 senior engineers through promotion; grew team from 5 to 8 over 18 months.',
      ],
    },
    {
      title: 'Senior Software Engineer',
      company: 'Cloudbase Technologies',
      logoInitials: 'CB',
      logoColor: '#025966',
      dateRange: 'Mar 2020 – Dec 2022',
      bullets: [
        'Built and maintained distributed infrastructure serving 50M+ requests per day.',
        'Led migration from monolith to microservices architecture, improving deploy frequency by 4×.',
        'On-call rotation lead; reduced MTTR by 50% through runbook automation.',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'Meridian Labs',
      logoInitials: 'ML',
      logoColor: '#414996',
      dateRange: 'Jun 2017 – Feb 2020',
      bullets: [
        'Developed core backend services in Go and Python for a SaaS analytics platform.',
        'Contributed to open-source observability tooling with 2k+ GitHub stars.',
      ],
    },
  ],
}

function CompanyLogo({ entry }: { entry: WorkEntry }) {
  if (entry.logoSrc) {
    return <img src={entry.logoSrc} alt={entry.company} className="work-exp-card__logo" />
  }
  return (
    <div
      className="work-exp-card__logo work-exp-card__logo--initials"
      style={{ background: entry.logoColor ?? '#E8E9EB' }}
    >
      {entry.logoInitials}
    </div>
  )
}

interface WorkExperienceCardProps {
  personId?: string
}

export function WorkExperienceCard({ personId }: WorkExperienceCardProps) {
  const { currentUser } = useUser()
  const id = personId ?? currentUser.id
  const entries = WORK_EXPERIENCE_BY_USER[id] ?? []
  const showEditButton = !personId

  return (
    <div className="work-exp-card">
      <div className="work-exp-card__header">
        <div className="work-exp-card__header-left">
          <h3 className="work-exp-card__title">Work Experience</h3>
          <span className="work-exp-card__badge">{entries.length}</span>
        </div>
        {showEditButton && (
          <button type="button" className="work-exp-card__add-btn" aria-label="Add work experience">
            <span className="material-symbols-outlined">add</span>
          </button>
        )}
      </div>

      <ul className="work-exp-card__list">
        {entries.map((entry, i) => (
          <li key={i} className={`work-exp-card__item${i > 0 ? ' work-exp-card__item--divider' : ''}`}>
            <div className="work-exp-card__item-main">
              <CompanyLogo entry={entry} />
              <div className="work-exp-card__body">
                <div className="work-exp-card__name-row">
                  <div>
                    <p className="work-exp-card__job-title">{entry.title}</p>
                    <p className="work-exp-card__company">{entry.company}</p>
                    <p className="work-exp-card__date">{entry.dateRange}</p>
                  </div>
                  {showEditButton && (
                    <div className="work-exp-card__actions">
                      <button type="button" className="work-exp-card__action-btn" aria-label="Delete">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                      <button type="button" className="work-exp-card__action-btn" aria-label="Edit">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </div>
                  )}
                </div>
                {entry.description && (
                  <p className="work-exp-card__description">{entry.description}</p>
                )}
                {entry.bullets && entry.bullets.length > 0 && (
                  <ul className="work-exp-card__bullets">
                    {entry.bullets.map((b, j) => (
                      <li key={j} className="work-exp-card__bullet">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
