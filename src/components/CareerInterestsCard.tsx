import type { CareerPathData, CareerPathNode } from '../data/careerInterestsData'
import './CareerInterestsCard.css'

interface CareerInterestsCardProps {
  data: CareerPathData
  avatarSrc?: string
  avatarInitials?: string
  avatarColor?: string
}

function RoleCard({
  node,
  isCurrent,
  avatarSrc,
  avatarInitials,
  avatarColor,
}: {
  node: CareerPathNode
  isCurrent?: boolean
  avatarSrc?: string
  avatarInitials?: string
  avatarColor?: string
}) {
  const { role } = node
  const peopleText =
    role.peopleCount === 1
      ? `${role.peopleInRole[0]?.name ?? 'Someone'} is in this role`
      : `${role.peopleInRole[0]?.name ?? 'Someone'} and ${role.peopleCount - 1} other(s) in this role`

  if (isCurrent) {
    return (
      <div className="career-interests__current">
        <div className="career-interests__current-avatar-wrap">
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="career-interests__avatar career-interests__avatar--photo" />
          ) : (
            <div
              className="career-interests__avatar career-interests__avatar--initials"
              style={avatarColor ? { background: avatarColor } : undefined}
            >
              {avatarInitials ?? '—'}
            </div>
          )}
        </div>
        <p className="career-interests__current-title">{role.title}</p>
        <p className="career-interests__current-dept">{role.department}</p>
        <p className="career-interests__current-tenure">{role.tenure}</p>
        <span className="career-interests__current-tag">Current role</span>
      </div>
    )
  }

  return (
    <div className="career-interests__role-card">
      <div className="career-interests__role-card-header">
        <h4 className="career-interests__role-title">{role.title}</h4>
        <button type="button" className="career-interests__goal-btn" aria-label="Set as career goal">
          <span className="material-symbols-outlined">track_changes</span>
        </button>
      </div>
      <div className="career-interests__role-people">
        <div className="career-interests__role-avatars">
          {role.peopleInRole.slice(0, 3).map((p, i) => (
            <div
              key={p.name}
              className="career-interests__avatar career-interests__avatar--initials career-interests__avatar--sm"
              style={{ background: p.avatarColor ?? '#A1A6B1', marginLeft: i > 0 ? -8 : 0 }}
            >
              {p.initials}
            </div>
          ))}
        </div>
        <p className="career-interests__role-people-text">{peopleText}</p>
      </div>
      <div className="career-interests__role-skills">
        <span className="material-symbols-outlined career-interests__skills-icon">trending_up</span>
        <span>{role.matchingSkills} matching skills</span>
      </div>
    </div>
  )
}

export function CareerInterestsCard({ data, avatarSrc, avatarInitials, avatarColor }: CareerInterestsCardProps) {
  const currentRoleNode: CareerPathNode = {
    role: {
      id: 'current',
      title: data.currentRole.title,
      department: data.currentRole.department,
      tenure: data.currentRole.tenure,
      matchingSkills: 0,
      peopleInRole: [],
      peopleCount: 0,
    },
  }

  return (
    <div className="career-interests">
      <div className="career-interests__diagram">
        <div className="career-interests__left">
          <RoleCard
            node={currentRoleNode}
            isCurrent
            avatarSrc={avatarSrc}
            avatarInitials={avatarInitials}
            avatarColor={avatarColor}
          />
          <div className="career-interests__line career-interests__line--vertical" aria-hidden />
        </div>
        <div className="career-interests__paths">
          {data.paths.map((node) => (
            <div key={node.role.id} className="career-interests__path-group">
              <div className="career-interests__path-connector">
                <div className="career-interests__line career-interests__line--horizontal" aria-hidden />
                {node.role.domainChange && (
                  <div className="career-interests__domain-tags">
                    <span className="career-interests__domain-tag">Domain change</span>
                    <span className="career-interests__domain-tag">Domain change</span>
                  </div>
                )}
                <button type="button" className="career-interests__path-action" aria-label="View path details">
                  <span className="material-symbols-outlined">description</span>
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              <RoleCard node={node} />
              {node.connectsTo && node.connectsTo.length > 0 && (
                <div className="career-interests__sub-paths">
                  {node.connectsTo.map((targetId) => {
                    const targetNode = data.paths.find((p) => p.role.id === targetId)
                    if (!targetNode) return null
                    return (
                      <div key={targetId} className="career-interests__path-group career-interests__path-group--nested">
                        <div className="career-interests__path-connector">
                          <div className="career-interests__line career-interests__line--horizontal" aria-hidden />
                          {targetNode.role.domainChange && (
                            <div className="career-interests__domain-tags">
                              <span className="career-interests__domain-tag">Domain change</span>
                              <span className="career-interests__domain-tag">Domain change</span>
                            </div>
                          )}
                          <button type="button" className="career-interests__path-action" aria-label="View path details">
                            <span className="material-symbols-outlined">description</span>
                            <span className="material-symbols-outlined">more_horiz</span>
                          </button>
                        </div>
                        <RoleCard node={targetNode} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
