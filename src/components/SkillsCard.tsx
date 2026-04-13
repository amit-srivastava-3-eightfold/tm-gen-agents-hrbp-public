import './SkillsCard.css'
import { useUser } from '../contexts/UserContext'
import { getProfileSkills } from '../data/skillsData'

interface SkillsCardProps {
  /** When viewing a profile, pass the person ID to show their skills. Omit for own profile. */
  personId?: string
}

export function SkillsCard({ personId }: SkillsCardProps) {
  const { currentUser } = useUser()
  const id = personId ?? currentUser.id
  const { skills, endorserInitials, endorserName, endorserColor, featuredSkills, expertBlock } = getProfileSkills(id)
  const primarySkill = skills.find((s) => s.endorsed)
  const showEditButton = !personId
  const hasFeaturedSection = featuredSkills && featuredSkills.length > 0

  return (
    <div className="skills-card">
      <div className="skills-card__header">
        <div className="skills-card__header-left">
          <h2 className="skills-card__title">Skills</h2>
          <span className="skills-card__badge">{skills.length}</span>
          <button type="button" className="skills-card__info-btn" aria-label="Skills information">
            <span className="material-symbols-outlined">info</span>
          </button>
        </div>
        <div className="skills-card__header-right">
          {showEditButton && hasFeaturedSection && (
            <button type="button" className="skills-card__assessments-btn">
              Skill assessments
            </button>
          )}
          {showEditButton && (
            <button type="button" className="skills-card__edit-btn" aria-label="Edit skills">
              <span className="material-symbols-outlined">edit</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-column featured skills highlight */}
      {hasFeaturedSection && (
        <div className="skills-card__featured">
          {featuredSkills!.map((fs) => (
            <div key={fs.name} className="skills-card__featured-col">
              <p className="skills-card__featured-skill">{fs.name}</p>
              <p className="skills-card__featured-endorser">{`Endorsed by ${fs.endorserSummary}`}</p>
              <div className="skills-card__featured-avatars">
                {fs.endorsers.map((e, i) => (
                  e.photoSrc ? (
                    <img
                      key={i}
                      src={e.photoSrc}
                      alt={e.initials}
                      className="skills-card__featured-avatar"
                    />
                  ) : (
                    <div
                      key={i}
                      className="skills-card__featured-avatar skills-card__featured-avatar--initials"
                      style={{ background: e.color }}
                    >
                      {e.initials}
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
          {expertBlock && (
            <div className="skills-card__featured-col">
              <p className="skills-card__featured-skill">Expert in {expertBlock.count} skill(s)</p>
              <p className="skills-card__featured-expert-list">
                {expertBlock.skills.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Legacy single-endorsement display for non-featured profiles */}
      {!hasFeaturedSection && primarySkill && (
        <div className="skills-card__endorsement">
          <p className="skills-card__primary-skill">{primarySkill.name}</p>
          {endorserName !== '—' && (
            <div className="skills-card__endorsement-row">
              <div className="skills-card__endorser-avatar" style={{ background: endorserColor }}>
                {endorserInitials}
              </div>
              <p className="skills-card__endorsement-text">
                Endorsed by {endorserName}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="skills-card__section-label">All Skills</div>
      <div className="skills-card__tags">
        {skills.map((skill) => (
          <div key={skill.name} className="skills-card__tag">
            <span className="skills-card__tag-name">{skill.name}</span>
            <span className="skills-card__tag-endorsement">
              <span className={`material-symbols-outlined skills-card__tag-icon ${skill.endorsementCount ? 'skills-card__tag-icon--endorsed' : ''}`}>
                thumb_up
              </span>
              {skill.endorsementCount != null && (
                <span className="skills-card__tag-count">{skill.endorsementCount}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
