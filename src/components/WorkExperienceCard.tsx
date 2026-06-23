import { useState } from 'react'
import './WorkExperienceCard.css'
import { useUser } from '../contexts/UserContext'

interface WorkEntry {
  title: string
  company: string
  logoSrc?: string
  logoInitials?: string
  logoColor?: string
  dateRange: string
  tags?: string[]
  bullets?: string[]
  description?: string
}

/** Entries per page */
const PAGE_SIZE = 3

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

/** Shown on profiles without a hand-authored history, so every profile has a work-experience section. */
const DEFAULT_WORK_EXPERIENCE: WorkEntry[] = [
  {
    title: 'Senior Sales Engineer',
    company: 'Acme Corp',
    logoInitials: 'AC',
    logoColor: '#054D7B',
    dateRange: 'Jan 2022 – Current',
  },
  {
    title: 'Sales Engineer',
    company: 'Cloudbase Technologies',
    logoInitials: 'CB',
    logoColor: '#025966',
    dateRange: 'Jun 2019 – Jan 2022',
    tags: ['Solution Architecture', 'Technical Sales', 'Product Demos', 'API Integration', 'Enterprise Solutions', 'Technical Discovery', 'POC Delivery', 'CRM Systems'],
    bullets: [
      'Owned technical pre-sales for enterprise accounts — discovery, demos, and proof-of-concept builds.',
      'Partnered with account executives to close $4M+ in new ARR across the financial-services vertical.',
      'Built reusable demo environments and POC templates adopted across the SE org.',
      'Mentored two junior sales engineers through onboarding and their first solo POCs.',
    ],
  },
  {
    title: 'Solutions Consultant',
    company: 'Meridian Labs',
    logoInitials: 'ML',
    logoColor: '#414996',
    dateRange: 'Mar 2017 – May 2019',
    bullets: [
      'Led implementation and integration projects for mid-market SaaS customers.',
      'Translated complex technical requirements into clear solution designs for stakeholders.',
    ],
  },
  {
    title: 'Technical Account Manager',
    company: 'Northwind Software',
    logoInitials: 'NW',
    logoColor: '#7B1FA2',
    dateRange: 'Aug 2015 – Feb 2017',
    bullets: [
      'Managed post-sale technical relationships for a portfolio of 20+ enterprise accounts.',
    ],
  },
  {
    title: 'Implementation Specialist',
    company: 'Northwind Software',
    logoInitials: 'NW',
    logoColor: '#7B1FA2',
    dateRange: 'Jan 2014 – Jul 2015',
  },
  {
    title: 'Support Engineer',
    company: 'DataForge',
    logoInitials: 'DF',
    logoColor: '#2E7D32',
    dateRange: 'Jun 2012 – Dec 2013',
  },
  {
    title: 'Technical Analyst',
    company: 'DataForge',
    logoInitials: 'DF',
    logoColor: '#2E7D32',
    dateRange: 'Sep 2010 – May 2012',
  },
]

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
  const entries = WORK_EXPERIENCE_BY_USER[id] ?? DEFAULT_WORK_EXPERIENCE
  const showEditButton = !personId
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(entries.length / PAGE_SIZE)
  const visible = entries.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

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
        {visible.map((entry, i) => (
          <li key={page * PAGE_SIZE + i} className={`work-exp-card__item${i > 0 ? ' work-exp-card__item--divider' : ''}`}>
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
                {entry.tags && entry.tags.length > 0 && (
                  <div className="work-exp-card__tags">
                    {entry.tags.map((t) => (
                      <span key={t} className="work-exp-card__tag">{t}</span>
                    ))}
                  </div>
                )}
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

      {totalPages > 1 && (
        <div className="work-exp-card__pagination">
          <button
            type="button"
            className="work-exp-card__page-btn work-exp-card__page-nav"
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
              className={`work-exp-card__page-btn${i === page ? ' work-exp-card__page-btn--active' : ''}`}
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
              aria-current={i === page}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            className="work-exp-card__page-btn work-exp-card__page-nav"
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
