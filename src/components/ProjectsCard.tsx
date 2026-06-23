import { useState } from 'react'
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
  tags?: string[]
  description?: string
  role?: string
  managers: Contributor[]
  contributors: Contributor[]
}

/** Projects per page */
const PAGE_SIZE = 3

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

/* Reusable people for the shared default projects. */
const P = {
  mateo: { name: 'Mateo Myer', initials: 'MM', color: '#E07C24' },
  alex: { name: 'Alex Nakamura', initials: 'AN', color: '#1565C0', photoSrc: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
  cong: { name: 'Cong Wang', initials: 'CW', color: '#2E7D32', photoSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face' },
  nina: { name: 'Nina Patel', initials: 'NP', color: '#6A1B9A', photoSrc: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face' },
  riya: { name: 'Riya Desai', initials: 'RD', color: '#0277BD', photoSrc: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
  jordan: { name: 'Jordan Lee', initials: 'JL', color: '#AD1457' },
  zoe: { name: 'Zoe Kim', initials: 'ZK', color: '#E65100' },
  sam: { name: 'Sam Torres', initials: 'ST', color: '#00838F' },
  david: { name: 'David Chen', initials: 'DC', color: '#2E7D32' },
  priya: { name: 'Priya Sharma', initials: 'PS', color: '#7B1FA2', photoSrc: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face' },
  ethan: { name: 'Ethan Declerq', initials: 'ED', color: '#5C6BC0' },
  maya: { name: 'Maya Baum', initials: 'MB', color: '#8D6E63' },
}

/** Shown on profiles without a hand-authored list, so every profile has a projects section. */
const DEFAULT_PROJECTS: Project[] = [
  {
    name: 'Enterprise POC Automation Framework',
    dateRange: 'Apr 2024',
    tags: ['Solution Architecture', 'Python', 'REST APIs'],
    managers: [P.mateo, P.alex],
    contributors: [P.cong, P.nina, P.riya, P.jordan, P.zoe, P.sam, P.david, P.priya, P.maya, P.ethan],
  },
  {
    name: 'HACK0461: Demo Environment Builder',
    dateRange: 'Mar 2023 – Nov 2023',
    tags: ['React', 'TypeScript', 'Docker'],
    managers: [P.alex],
    contributors: [P.cong, P.riya, P.david],
  },
  {
    name: 'Customer Onboarding Playbook',
    dateRange: 'Aug 2022 – Dec 2022',
    managers: [P.ethan],
    contributors: [P.nina, P.sam],
  },
  {
    name: 'Quoting Tool Integration',
    dateRange: 'Jan 2022 – Jun 2022',
    tags: ['Salesforce', 'Node.js'],
    managers: [P.mateo],
    contributors: [P.jordan, P.priya],
  },
  {
    name: 'Technical Win Analysis Dashboard',
    dateRange: 'May 2021 – Oct 2021',
    tags: ['SQL', 'Tableau', 'Python'],
    managers: [P.alex],
    contributors: [P.cong, P.zoe],
  },
  {
    name: 'POC Template Library',
    dateRange: 'Feb 2021 – Apr 2021',
    managers: [P.mateo],
    contributors: [P.david, P.maya, P.sam],
  },
]

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
  const projects = PROJECTS_BY_USER[id] ?? DEFAULT_PROJECTS
  const showEditButton = !personId
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(projects.length / PAGE_SIZE)
  const visible = projects.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

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
        {visible.map((project, i) => (
          <li key={page * PAGE_SIZE + i} className={`projects-card__item${i > 0 ? ' projects-card__item--divider' : ''}`}>
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
                {project.tags && project.tags.length > 0 && (
                  <div className="projects-card__tags">
                    {project.tags.map((t) => (
                      <span key={t} className="projects-card__tag">{t}</span>
                    ))}
                  </div>
                )}
                <button type="button" className="projects-card__details-link">View Project Details</button>
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

      {totalPages > 1 && (
        <div className="projects-card__pagination">
          <button
            type="button"
            className="projects-card__page-btn projects-card__page-nav"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous page"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`projects-card__page-btn${i === page ? ' projects-card__page-btn--active' : ''}`}
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
              aria-current={i === page}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            className="projects-card__page-btn projects-card__page-nav"
            disabled={page === totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            aria-label="Next page"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  )
}
