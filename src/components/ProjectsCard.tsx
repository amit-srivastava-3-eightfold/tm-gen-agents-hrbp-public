import './ProjectsCard.css'
import { useUser } from '../contexts/UserContext'

interface Contributor {
  name: string
  photoSrc?: string
  initials: string
  color: string
}

interface Project {
  name: string
  dateRange: string
  description?: string
  role?: string
  managers: Contributor[]
  contributors: Contributor[]
}

const PROJECTS_BY_USER: Record<string, Project[]> = {
  csm: [
    {
      name: 'Platform Reliability Initiative',
      dateRange: 'Jan 2025 – Present',
      description: 'Led the platform reliability initiative to improve uptime and reduce incident response time across all engineering services.',
      role: 'Engineering lead responsible for SLO definition, observability tooling, and cross-team alignment on reliability targets.',
      managers: [
        { name: 'Alex Nakamura', initials: 'AN', color: '#1565C0', photoSrc: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
      ],
      contributors: [
        { name: 'Cong Wang', initials: 'CW', color: '#2E7D32', photoSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face' },
        { name: 'Nina Patel', initials: 'NP', color: '#6A1B9A', photoSrc: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face' },
        { name: 'Jordan Lee', initials: 'JL', color: '#AD1457' },
        { name: 'Zoe Kim', initials: 'ZK', color: '#E65100' },
      ],
    },
    {
      name: 'AI-Assisted Development Workflows',
      dateRange: 'Aug 2024 – Present',
      role: 'Designed and implemented AI-assisted code review and incident triage pipelines, reducing mean time to resolution by 40%.',
      managers: [
        { name: 'Alex Nakamura', initials: 'AN', color: '#1565C0', photoSrc: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
      ],
      contributors: [
        { name: 'Riya Desai', initials: 'RD', color: '#0277BD', photoSrc: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
        { name: 'Cong Wang', initials: 'CW', color: '#2E7D32', photoSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face' },
      ],
    },
    {
      name: 'Engineering On-call Modernization',
      dateRange: 'Mar 2024 – Dec 2024',
      role: 'Rebuilt on-call runbooks and escalation paths; integrated PagerDuty with internal dashboards.',
      managers: [
        { name: 'Alex Nakamura', initials: 'AN', color: '#1565C0', photoSrc: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
      ],
      contributors: [
        { name: 'Jordan Lee', initials: 'JL', color: '#AD1457' },
        { name: 'Nina Patel', initials: 'NP', color: '#6A1B9A', photoSrc: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face' },
      ],
    },
  ],
}

function Avatar({ person, size = 28 }: { person: Contributor; size?: number }) {
  if (person.photoSrc) {
    return (
      <img
        src={person.photoSrc}
        alt={person.name}
        className="projects-card__avatar"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="projects-card__avatar projects-card__avatar--initials"
      style={{ width: size, height: size, background: person.color, fontSize: size * 0.34 }}
    >
      {person.initials}
    </div>
  )
}

interface ProjectsCardProps {
  personId?: string
}

export function ProjectsCard({ personId }: ProjectsCardProps) {
  const { currentUser } = useUser()
  const id = personId ?? currentUser.id
  const projects = PROJECTS_BY_USER[id] ?? []
  const showEditButton = !personId

  return (
    <div className="projects-card">
      <div className="projects-card__header">
        <div className="projects-card__header-left">
          <h3 className="projects-card__title">Projects</h3>
          <span className="projects-card__badge">{projects.length}</span>
        </div>
        {showEditButton && (
          <button type="button" className="projects-card__add-btn" aria-label="Add project">
            <span className="material-symbols-outlined">add</span>
          </button>
        )}
      </div>

      <ul className="projects-card__list">
        {projects.map((project, i) => (
          <li key={project.name} className={`projects-card__item${i > 0 ? ' projects-card__item--divider' : ''}`}>
            <div className="projects-card__item-main">
              <div className="projects-card__icon-wrap">
                <span className="material-symbols-outlined projects-card__icon">account_tree</span>
              </div>
              <div className="projects-card__body">
                <div className="projects-card__name-row">
                  <div>
                    <p className="projects-card__name">{project.name}</p>
                    <p className="projects-card__date">{project.dateRange}</p>
                  </div>
                  {showEditButton && (
                    <div className="projects-card__actions">
                      <button type="button" className="projects-card__action-btn" aria-label="Delete">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                      <button type="button" className="projects-card__action-btn" aria-label="Edit">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </div>
                  )}
                </div>
                {project.description && (
                  <p className="projects-card__description">{project.description}</p>
                )}
                {project.role && (
                  <p className="projects-card__role">
                    <strong>Role on the project:</strong> {project.role}
                  </p>
                )}
                {project.managers.length > 0 && (
                  <div className="projects-card__people-row">
                    <span className="projects-card__people-label">Project manager(s):</span>
                    <div className="projects-card__people">
                      {project.managers.map((m) => (
                        <span key={m.name} className="projects-card__person">
                          <Avatar person={m} size={24} />
                          <span className="projects-card__person-name">{m.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.contributors.length > 0 && (
                  <div className="projects-card__people-row">
                    <span className="projects-card__people-label">Contributors:</span>
                    <div className="projects-card__people projects-card__people--wrap">
                      {project.contributors.map((c) => (
                        <span key={c.name} className="projects-card__person">
                          <Avatar person={c} size={24} />
                          <span className="projects-card__person-name">{c.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
