import type { CareerInterestRole } from '../data/careerInterestsData'
import './CareerInterestsSidebar.css'

interface CareerInterestsSidebarProps {
  roles: CareerInterestRole[]
}

function TargetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export function CareerInterestsSidebar({ roles }: CareerInterestsSidebarProps) {
  return (
    <div className="career-interests-sidebar">
      <h3 className="career-interests-sidebar__title">Career interests</h3>
      <div className="career-interests-sidebar__list">
        {roles.map((role) => (
          <div key={role.id} className="career-interests-sidebar__card">
            <div className="career-interests-sidebar__card-header">
              {role.archived && (
                <span className="career-interests-sidebar__tag">Archived</span>
              )}
              <div className="career-interests-sidebar__goal-icon" aria-hidden>
                <TargetIcon />
              </div>
            </div>
            <h4 className="career-interests-sidebar__card-title">{role.title}</h4>
            {role.peopleInRole.length > 0 && (
              <div className="career-interests-sidebar__people">
                <div className="career-interests-sidebar__avatars">
                  {role.peopleInRole.slice(0, 3).map((p, i) => (
                    <div
                      key={p.name}
                      className="career-interests-sidebar__avatar"
                      style={{
                        background: p.avatarColor ?? '#A1A6B1',
                        marginLeft: i > 0 ? -8 : 0,
                        zIndex: role.peopleInRole.length - i,
                      }}
                    >
                      {p.initials}
                    </div>
                  ))}
                </div>
                <span className="career-interests-sidebar__people-label">
                  {role.peopleCount === 1
                    ? `${role.peopleInRole[0]?.name ?? 'Someone'} is in this role`
                    : `${role.peopleInRole[0]?.name ?? 'Someone'} and ${role.peopleCount - 1} other(s) in this role`}
                </span>
              </div>
            )}
            <div className="career-interests-sidebar__footer">
              <span className="career-interests-sidebar__skills">
                <span className="career-interests-sidebar__skills-icon" aria-hidden>⚡</span>
                {role.matchingSkills} matching skills
              </span>
              <button type="button" className="career-interests-sidebar__view-btn">
                View career path
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
