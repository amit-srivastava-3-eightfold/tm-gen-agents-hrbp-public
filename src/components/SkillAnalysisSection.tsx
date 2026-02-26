import { Link } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { Button } from './ui/Button'
import './ui/Button.css'

const MATEO_SKILL_GAPS = [
  { name: 'Product Demos', current: 0, total: 8 },
  { name: 'CRM Systems', current: 0, total: 8 },
  { name: 'API Integration', current: 0, total: 7 },
  { name: 'Technical Sales', current: 0, total: 6 },
  { name: 'Enterprise Sales', current: 0, total: 6 },
]

const MATEO_SKILL_STRENGTHS = [
  { name: 'Solution Architecture', current: 1, total: 1 },
  { name: 'Sales Enablement', current: 1, total: 1 },
  { name: 'Technical Discovery', current: 1, total: 1 },
  { name: 'API Integration', current: 1, total: 7 },
  { name: 'Communication', current: 0, total: 8 },
]

const MATEO_SKILL_INTERESTS = [
  { name: 'Solutions Architecture', count: 2 },
  { name: 'Sales Engineering', count: 2 },
  { name: 'Technical Sales', count: 2 },
  { name: 'Product Management', count: 1 },
  { name: 'Cross-Functional Team Leadership', count: 1 },
]

const LAURA_SKILL_GAPS = [
  { name: 'Performance Management', current: 2, total: 8 },
  { name: 'Workforce Planning', current: 1, total: 6 },
  { name: 'Succession Planning', current: 0, total: 5 },
  { name: 'DEI Initiatives', current: 1, total: 6 },
  { name: 'Change Management', current: 2, total: 7 },
]

const LAURA_SKILL_STRENGTHS = [
  { name: 'Employee Relations', current: 6, total: 6 },
  { name: 'Talent Management', current: 5, total: 5 },
  { name: 'Coaching', current: 4, total: 5 },
  { name: 'Data Analytics', current: 3, total: 6 },
  { name: 'Stakeholder Management', current: 5, total: 6 },
]

const LAURA_SKILL_INTERESTS = [
  { name: 'Leadership Development', count: 4 },
  { name: 'HR Strategy', count: 3 },
  { name: 'Talent Acquisition', count: 2 },
  { name: 'Compensation & Benefits', count: 2 },
  { name: 'Organizational Design', count: 1 },
]

const MATEO_TAB_COUNTS = { direct: 7, all: 11 }

const LAURA_TAB_COUNTS = { direct: 12, all: 48 }

const MATEO_OPEN_POSITIONS = [
  {
    id: '40468430',
    title: 'Sales Engineer',
    details: 'Santa Clara, CA • Mateo Myer • Recruiter not specified • Sourcing Pipeline',
    daysOpen: 12,
    leads: 97,
    employees: 24,
    new: 0,
    recruiterScreen: 0,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
  },
  {
    id: '40468780',
    title: 'Solutions Engineer',
    details: 'Remote • Mateo Myer • Recruiter not specified • Sourcing Pipeline',
    daysOpen: 28,
    leads: 112,
    employees: 18,
    new: 0,
    recruiterScreen: 0,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
  },
  {
    id: '40468912',
    title: 'Technical Account Manager',
    details: 'Santa Clara, CA • Mateo Myer • Recruiter not specified • Sourcing Pipeline',
    daysOpen: 5,
    leads: 84,
    employees: 31,
    new: 3,
    recruiterScreen: 2,
    hiringManagerScreen: 1,
    phoneInterview: 0,
    onsiteInterview: 0,
  },
]

const LAURA_OPEN_POSITIONS = [
  {
    id: '40468430',
    title: 'Sales Engineer',
    details: 'Santa Clara, CA • Mateo Myer • Laura Shah • Sourcing Pipeline',
    daysOpen: 12,
    leads: 97,
    employees: 24,
    new: 0,
    recruiterScreen: 0,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
  },
  {
    id: '40468780',
    title: 'Solutions Engineer',
    details: 'Remote • Mateo Myer • Laura Shah • Sourcing Pipeline',
    daysOpen: 28,
    leads: 112,
    employees: 18,
    new: 0,
    recruiterScreen: 0,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
  },
  {
    id: '40468912',
    title: 'Customer Success Manager',
    details: 'Los Angeles, CA • Ethan Declerq • Laura Shah • Sourcing Pipeline',
    daysOpen: 8,
    leads: 62,
    employees: 15,
    new: 2,
    recruiterScreen: 1,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
  },
  {
    id: '40468920',
    title: 'Implementation Consultant',
    details: 'San Francisco, CA • Anna Patel • Laura Shah • Sourcing Pipeline',
    daysOpen: 15,
    leads: 45,
    employees: 12,
    new: 1,
    recruiterScreen: 0,
    hiringManagerScreen: 0,
    phoneInterview: 0,
    onsiteInterview: 0,
  },
]

interface SkillAnalysisSectionProps {
  reportScope: 'direct' | 'open' | 'all'
  onReportScopeChange: (scope: 'direct' | 'open' | 'all') => void
  sustainedHighPerformersFilter?: boolean
  onSustainedHighPerformersClick?: () => void
}

export function SkillAnalysisSection({
  reportScope: scope,
  onReportScopeChange: setReportScope,
  sustainedHighPerformersFilter = false,
  onSustainedHighPerformersClick,
}: SkillAnalysisSectionProps) {
  const { currentUser } = useUser()
  const isLaura = currentUser.id === 'laura-shah'

  const skillGaps = isLaura ? LAURA_SKILL_GAPS : MATEO_SKILL_GAPS
  const skillStrengths = isLaura ? LAURA_SKILL_STRENGTHS : MATEO_SKILL_STRENGTHS
  const skillInterests = isLaura ? LAURA_SKILL_INTERESTS : MATEO_SKILL_INTERESTS
  const tabCounts = isLaura ? LAURA_TAB_COUNTS : MATEO_TAB_COUNTS
  const openPositions = isLaura ? LAURA_OPEN_POSITIONS : MATEO_OPEN_POSITIONS

  return (
    <div className="skill-analysis">
      <div className="skill-analysis__tabs">
        <Button
          variant="ghost"
          className={`skill-analysis__tab ${scope === 'direct' ? 'skill-analysis__tab--active' : ''}`}
          onClick={() => setReportScope('direct')}
        >
          {isLaura ? 'Supported employees' : 'Direct reports'}
          <span className="skill-analysis__tab-badge">{tabCounts.direct}</span>
        </Button>
        <Button
          variant="ghost"
          className={`skill-analysis__tab ${scope === 'open' ? 'skill-analysis__tab--active' : ''}`}
          onClick={() => setReportScope('open')}
        >
          Open positions
          <span className="skill-analysis__tab-badge">{openPositions.length}</span>
        </Button>
        <Button
          variant="ghost"
          className={`skill-analysis__tab ${scope === 'all' ? 'skill-analysis__tab--active' : ''}`}
          onClick={() => setReportScope('all')}
        >
          {isLaura ? 'All supported' : 'All reports'}
          <span className="skill-analysis__tab-badge">{tabCounts.all}</span>
        </Button>
      </div>

      {scope !== 'open' && (
      <div className="skill-analysis__filters skill-analysis__filters--top">
        <select className="skill-analysis__select" defaultValue="gaps">
          <option value="gaps">View: Gaps analysis</option>
        </select>
        <select className="skill-analysis__select" defaultValue="all-roles">
          <option value="all-roles">All roles</option>
        </select>
        <select className="skill-analysis__select" defaultValue="all-skills">
          <option value="all-skills">All skills</option>
        </select>
      </div>
      )}

      {scope === 'open' ? (
        <div className="skill-analysis__positions-table-wrap">
          <table className="skill-analysis__positions-table">
            <thead>
              <tr>
                <th className="skill-analysis__positions-th skill-analysis__positions-th--position">Position</th>
                <th className="skill-analysis__positions-th">
                  Days Open
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Leads
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Employees
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  New
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Recruiter Screen
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Hiring Manager Screen
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Phone Interview
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th">
                  Onsite Interview
                  <span className="material-symbols-outlined skill-analysis__sort-icon">unfold_more</span>
                </th>
                <th className="skill-analysis__positions-th skill-analysis__positions-th--actions">
                  Actions
                  <span className="material-symbols-outlined skill-analysis__sort-icon">more_horiz</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {openPositions.map((pos) => (
                <tr key={pos.id} className="skill-analysis__positions-row">
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--position">
                    <div className="skill-analysis__position-info">
                      <Link to={`/positions/${pos.id}`} className="skill-analysis__position-title skill-analysis__position-title--link">
                        {pos.title} ({pos.id})
                      </Link>
                      <span className="skill-analysis__position-details">
                        <span className="skill-analysis__position-dot" aria-hidden />
                        {pos.details}
                      </span>
                    </div>
                  </td>
                  <td className="skill-analysis__positions-td">{pos.daysOpen}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--lead">{pos.leads}</td>
                  <td className="skill-analysis__positions-td">
                    <Link
                      to={`/people?tab=open-roles&role=${encodeURIComponent(pos.title.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="skill-analysis__positions-badge-link"
                    >
                      {pos.employees}
                    </Link>
                  </td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.new}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.recruiterScreen}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.hiringManagerScreen}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.phoneInterview}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--link">{pos.onsiteInterview}</td>
                  <td className="skill-analysis__positions-td skill-analysis__positions-td--actions">
                    <button type="button" className="skill-analysis__positions-actions-btn" aria-label="Actions">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
      <>
      <div className="skill-analysis__cards">
        <div className="skill-analysis__card">
          <div className="skill-analysis__card-header skill-analysis__card-header--gaps">
            <span className="material-symbols-outlined skill-analysis__card-icon skill-analysis__card-icon--red">trending_down</span>
            <span>Skill gaps</span>
            <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
          </div>
          <ul className="skill-analysis__list">
            {skillGaps.map((skill) => (
              <li key={skill.name} className="skill-analysis__item">
                <span className="skill-analysis__skill-name">{skill.name}</span>
                <div className="skill-analysis__item-right">
                  <span className="material-symbols-outlined skill-analysis__person-icon">person</span>
                  <div className="skill-analysis__bar-wrap">
                    <div className="skill-analysis__bar">
                      <div
                        className="skill-analysis__bar-fill"
                        style={{ width: `${skill.total > 0 ? (skill.current / skill.total) * 100 : 0}%` }}
                      >
                        {skill.current > 0 && <span className="skill-analysis__bar-value">{skill.current}</span>}
                      </div>
                      {skill.current === 0 && (
                        <span className="skill-analysis__bar-value skill-analysis__bar-value--empty">{skill.current}</span>
                      )}
                    </div>
                    <span className="skill-analysis__bar-total">{skill.total}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="skill-analysis__card">
          <div className="skill-analysis__card-header skill-analysis__card-header--strengths">
            <span className="material-symbols-outlined skill-analysis__card-icon skill-analysis__card-icon--green">trending_up</span>
            <span>Skill strengths</span>
            <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
          </div>
          <ul className="skill-analysis__list">
            {skillStrengths.map((skill) => (
              <li key={skill.name} className="skill-analysis__item">
                <span className="skill-analysis__skill-name">{skill.name}</span>
                <div className="skill-analysis__item-right">
                  <span className="material-symbols-outlined skill-analysis__person-icon">person</span>
                  <div className="skill-analysis__bar-wrap">
                    <div className="skill-analysis__bar">
                      <div
                        className="skill-analysis__bar-fill"
                        style={{ width: `${skill.total > 0 ? (skill.current / skill.total) * 100 : 0}%` }}
                      >
                        {skill.current > 0 && <span className="skill-analysis__bar-value">{skill.current}</span>}
                      </div>
                      {skill.current === 0 && (
                        <span className="skill-analysis__bar-value skill-analysis__bar-value--empty">{skill.current}</span>
                      )}
                    </div>
                    <span className="skill-analysis__bar-total">{skill.total}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="skill-analysis__card">
          <div className="skill-analysis__card-header skill-analysis__card-header--interests">
            <span className="material-symbols-outlined skill-analysis__card-icon">settings</span>
            <span>Skill interests</span>
            <span className="material-symbols-outlined skill-analysis__info-icon" aria-label="Info">info</span>
          </div>
          <ul className="skill-analysis__list">
            {skillInterests.map((skill) => (
              <li key={skill.name} className="skill-analysis__item skill-analysis__item--no-input">
                <span className="skill-analysis__skill-name">{skill.name}</span>
                <div className="skill-analysis__item-right">
                  <span className="material-symbols-outlined skill-analysis__person-icon">person</span>
                  <span className="skill-analysis__count">{skill.count}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isLaura && (
        <div className="skill-analysis__stat-cards">
          <div
            role="button"
            tabIndex={0}
            className={`skill-analysis__stat-card ${sustainedHighPerformersFilter ? 'skill-analysis__stat-card--active' : ''}`}
            onClick={onSustainedHighPerformersClick}
            onKeyDown={(e) => { if (e.key === 'Enter') onSustainedHighPerformersClick?.() }}
          >
            <span className="skill-analysis__stat-help-wrap" onClick={(e) => e.stopPropagation()}>
              <span className="material-symbols-outlined skill-analysis__stat-help" aria-label="More information">help</span>
              <span className="skill-analysis__stat-tooltip">Employees who have consistently met or exceeded performance expectations over multiple review cycles</span>
            </span>
            <span className="skill-analysis__stat-label">Sustained High Performers</span>
            <span className="skill-analysis__stat-value">8.4% of Workforce</span>
          </div>
          <div className="skill-analysis__stat-card">
            <span className="skill-analysis__stat-help-wrap">
              <span className="material-symbols-outlined skill-analysis__stat-help" aria-label="More information">help</span>
              <span className="skill-analysis__stat-tooltip">Average tenure of employees in their current job level</span>
            </span>
            <span className="skill-analysis__stat-label">Avg Time in Level</span>
            <span className="skill-analysis__stat-value">2.4 yrs</span>
          </div>
          <div className="skill-analysis__stat-card">
            <span className="skill-analysis__stat-help-wrap">
              <span className="material-symbols-outlined skill-analysis__stat-help" aria-label="More information">help</span>
              <span className="skill-analysis__stat-tooltip">Percentage of employees at or near the maximum of their pay band</span>
            </span>
            <span className="skill-analysis__stat-label">% Near Pay Band Max</span>
            <span className="skill-analysis__stat-value">18%</span>
          </div>
          <div className="skill-analysis__stat-card">
            <span className="skill-analysis__stat-help-wrap">
              <span className="material-symbols-outlined skill-analysis__stat-help" aria-label="More information">help</span>
              <span className="skill-analysis__stat-tooltip">Employees identified as high risk of voluntary turnover</span>
            </span>
            <span className="skill-analysis__stat-label">% High Flight Risk</span>
            <span className="skill-analysis__stat-value">12%</span>
          </div>
        </div>
      )}

      <div className="skill-analysis__filters skill-analysis__filters--bottom">
        <select className="skill-analysis__select">
          <option>Role</option>
        </select>
        <select className="skill-analysis__select">
          <option>Skills</option>
        </select>
        <select className="skill-analysis__select">
          <option>Job Level</option>
        </select>
        <select className="skill-analysis__select">
          <option>Development Plan Status</option>
        </select>
        <div className="skill-analysis__search">
          <span className="material-symbols-outlined skill-analysis__search-icon">search</span>
          <input type="search" placeholder="Search name or role" className="skill-analysis__search-input" />
        </div>
      </div>

      <div className="skill-analysis__results">
        <span className="skill-analysis__results-text">Showing {tabCounts.all} results</span>
        <Button variant="ghost" className="skill-analysis__select-all">Select all on this page</Button>
      </div>
      </>
      )}
    </div>
  )
}
