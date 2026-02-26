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
  const { skills, endorserInitials, endorserName, endorserColor } = getProfileSkills(id)
  const primarySkill = skills.find((s) => s.endorsed)
  const showEditButton = !personId

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
        {showEditButton && (
          <button type="button" className="skills-card__edit-btn" aria-label="Edit skills">
            <span className="material-symbols-outlined">edit</span>
          </button>
        )}
      </div>
      {primarySkill && (
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
