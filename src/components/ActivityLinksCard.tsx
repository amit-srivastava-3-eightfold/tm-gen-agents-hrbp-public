import { useUser } from '../contexts/UserContext'
import { getHomePageData } from '../data/homePageData'
import './ActivityLinksCard.css'

const CENTER_LINKS = [
  { label: 'Plan your career with career navigator', path: '/profile?tab=career' },
  { label: 'Refer a friend', path: '#' },
]

const HELPFUL_LINKS = [
  'Confluence Resource Hubs',
  'Intranet Ideas & Feedback',
  'Company Holidays 2022',
  'Sequoia - Benefits',
  'Navia - FSA / HSA platform',
  'Empower - 401k Provider',
  'Cultureamp - Performance Reviews and Goals',
  'Carta - Equity Management System',
  'Paylocity - HR and Payroll',
]

export function ActivityLinksCard() {
  const { currentUser } = useUser()
  const { activity } = getHomePageData(currentUser)
  const activityItems = [
    { label: 'Project Applications', count: activity.projectApplications },
    { label: 'Job Applications', count: activity.jobApplications },
    { label: 'Referrals', count: activity.referrals },
  ]

  return (
    <div className="activity-links-card">
      <div className="activity-links-card__section">
        <h3 className="activity-links-card__title">My activity</h3>
        <ul className="activity-links-card__list">
          {activityItems.map((item) => (
            <li key={item.label} className="activity-links-card__item">
              <a href="#" className="activity-links-card__link">
                {item.label}
              </a>
              <span className="activity-links-card__count">{item.count}</span>
            </li>
          ))}
        </ul>
        <div className="activity-links-card__center">
          {CENTER_LINKS.map((item) => (
            <a key={item.label} href={item.path} className="activity-links-card__center-link">
              {item.label}
            </a>
          ))}
        </div>
      </div>
      <div className="activity-links-card__divider" />
      <div className="activity-links-card__section">
        <h3 className="activity-links-card__title">Helpful Links</h3>
        <ul className="activity-links-card__links-list">
          {HELPFUL_LINKS.map((label) => (
            <li key={label}>
              <a href="#" className="activity-links-card__link">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
