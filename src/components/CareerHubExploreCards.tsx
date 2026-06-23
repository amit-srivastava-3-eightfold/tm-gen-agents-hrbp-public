import { useState } from 'react'
import { Link } from 'react-router-dom'
import { InsightCard } from '@tonyh-2-eightfold/ef-design-system'
import { useUser } from '../contexts/UserContext'
import { getHomePageData } from '../data/homePageData'
import './CareerHubExploreCards.css'

function JobCardContent({
  job,
}: {
  job: { title: string; tags: { label: string; checked?: boolean }[] }
}) {
  return (
    <div className="career-hub-card__job">
      <span className="career-hub-card__job-title">{job.title}</span>
      <div className="career-hub-card__tags">
        {job.tags.map((t) => (
          <span
            key={t.label}
            className={`career-hub-card__tag${t.checked ? ' career-hub-card__tag--checked' : ''}`}
          >
            {t.checked && <span className="material-symbols-outlined">check</span>}
            {t.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function ProjectCardContent({ project }: { project: { title: string; tags: string[] } }) {
  return (
    <div className="career-hub-card__project">
      <span className="career-hub-card__project-title">{project.title}</span>
      <div className="career-hub-card__tags">
        {project.tags.map((tag) => (
          <span key={tag} className="career-hub-card__tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function MentorCardContent({ mentor }: { mentor: { name: string; role: string; avatarSrc: string } }) {
  return (
    <div className="career-hub-card__mentor">
      <div className="career-hub-card__mentor-profile">
        <img src={mentor.avatarSrc} alt="" className="career-hub-card__avatar" />
        <div className="career-hub-card__mentor-info">
          <span className="career-hub-card__name">{mentor.name}</span>
          <span className="career-hub-card__role">{mentor.role}</span>
        </div>
      </div>
    </div>
  )
}

function CareerNavigatorCardContent({
  path,
}: {
  path: {
    currentTitle: string
    currentSubtitle: string
    targetTitle: string
    targetSubtitle: string
    stepsAway: number
  }
}) {
  return (
    <div className="career-hub-card__navigator">
      <div className="career-hub-card__path">
        <div className="career-hub-card__path-line">
          <span className="career-hub-card__path-dot" aria-hidden />
          <span className="career-hub-card__path-badge">
            {path.stepsAway} {path.stepsAway === 1 ? 'step' : 'steps'} away
          </span>
          <span className="career-hub-card__path-dot" aria-hidden />
        </div>
        <div className="career-hub-card__path-roles">
          <div className="career-hub-card__path-role career-hub-card__path-role--current">
            <span className="career-hub-card__path-role-title">{path.currentTitle}</span>
            <span className="career-hub-card__path-role-subtitle">{path.currentSubtitle}</span>
            <span className="career-hub-card__path-role-tag">Current Role</span>
          </div>
          <div className="career-hub-card__path-role career-hub-card__path-role--target">
            <span className="career-hub-card__path-role-title">{path.targetTitle}</span>
            <span className="career-hub-card__path-role-subtitle">{path.targetSubtitle}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const CARD_TEMPLATES = [
  {
    id: 'mentors',
    title: 'Mentors',
    badge: '11',
    description: 'Get guidance and support',
    bgColor: '#FFF0D6',
    iconBgColor: '#FFE8C2',
    iconColor: '#7D4F07',
    textColor: '#3B2600',
    icon: 'groups',
    recommendedLabel: 'Recommended for you',
    buttonLabel: 'Explore Mentors',
  },
  {
    id: 'jobs',
    title: 'Jobs',
    badge: '51',
    description: 'Browse opportunities for you or friends',
    bgColor: '#FEF9C3',
    iconBgColor: '#FEF08A',
    iconColor: '#D97706',
    textColor: '#78350F',
    icon: 'work',
    recommendedLabel: 'Recommended for you',
    buttonLabel: 'Explore Jobs',
  },
  {
    id: 'projects',
    title: 'Projects',
    badge: '23',
    description: 'Get hands-on experience',
    bgColor: '#DBEAFE',
    iconBgColor: '#BFDBFE',
    iconColor: '#1E40AF',
    textColor: '#1A212E',
    icon: 'folder',
    recommendedLabel: 'Recommended',
    buttonLabel: 'Explore Projects',
  },
  {
    id: 'career-navigator',
    title: 'Career Navigator',
    badge: '',
    description: 'Check out your potential career paths',
    bgColor: '#EFF6FF',
    iconBgColor: '#BFDBFE',
    iconColor: '#1E40AF',
    textColor: '#1E40AF',
    icon: 'route',
    recommendedLabel: '',
    buttonLabel: 'Explore Career Navigator',
    buttonHref: '/profile?tab=career',
  },
]

const PAGE_SIZE = 2

export function CareerHubExploreCards() {
  const { currentUser } = useUser()
  const homeData = getHomePageData(currentUser)
  const [expanded, setExpanded] = useState(true)
  const [page, setPage] = useState(0)

  const cards = [
    {
      ...CARD_TEMPLATES[0],
      content: <MentorCardContent mentor={homeData.mentor} />,
    },
    {
      ...CARD_TEMPLATES[1],
      content: <JobCardContent job={homeData.recommendedJob} />,
    },
    {
      ...CARD_TEMPLATES[2],
      content: <ProjectCardContent project={homeData.recommendedProject} />,
    },
    {
      ...CARD_TEMPLATES[3],
      content: <CareerNavigatorCardContent path={homeData.careerPath} />,
    },
  ]

  const totalPages = Math.ceil(cards.length / PAGE_SIZE)
  const pageCards = cards.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <section className="career-hub-explore">
      <div className="career-hub-explore__header">
        <div>
          <h2 className="career-hub-explore__title">Get more from Career Hub</h2>
          <p className="career-hub-explore__subtitle">
            Explore the many ways you can grow here
          </p>
        </div>
        <button
          type="button"
          className="career-hub-explore__expand"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          <span className="material-symbols-outlined">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>
      {expanded && (
        <div className="career-hub-explore__body">
          <button
            type="button"
            className="career-hub-explore__nav"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous"
            disabled={page === 0}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="career-hub-explore__grid">
            {pageCards.map((card) => {
              const c = card as {
                bgColor: string
                iconBgColor: string
                iconColor: string
                textColor?: string
                title: string
                badge?: string
                description: string
                recommendedLabel?: string
                icon: string
                content: React.ReactNode
                buttonLabel: string
                buttonHref?: string
              }
              return (
                <InsightCard
                  key={card.id}
                  title={c.title}
                  badge={c.badge}
                  description={c.description}
                  recommendedLabel={c.recommendedLabel}
                  icon={c.icon}
                  bgColor={c.bgColor}
                  iconBgColor={c.iconBgColor}
                  iconColor={c.iconColor}
                  textColor={c.textColor}
                  buttonLabel={c.buttonLabel}
                  buttonHref={c.buttonHref ?? '#'}
                  fixedSize={false}
                  LinkComponent={Link}
                >
                  {c.content}
                </InsightCard>
              )
            })}
          </div>
          <button
            type="button"
            className="career-hub-explore__nav"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            aria-label="Next"
            disabled={page >= totalPages - 1}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </section>
  )
}
