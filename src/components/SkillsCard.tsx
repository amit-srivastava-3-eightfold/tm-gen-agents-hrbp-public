import './SkillsCard.css'

const SKILLS_DATA = [
  { name: 'Product Demos', endorsementCount: 12, endorsed: true },
  { name: 'Technical Sales', endorsementCount: 8 },
  { name: 'Solution Architecture', endorsementCount: undefined },
  { name: 'API Integration', endorsementCount: 5 },
  { name: 'CRM Systems', endorsementCount: undefined },
  { name: 'Enterprise Solutions', endorsementCount: 6 },
  { name: 'Technical Discovery', endorsementCount: undefined },
  { name: 'REST APIs', endorsementCount: 4 },
  { name: 'AWS', endorsementCount: 7 },
  { name: 'System Design', endorsementCount: undefined },
  { name: 'Communication', endorsementCount: 9 },
  { name: 'Python', endorsementCount: 3 },
  { name: 'POC Delivery', endorsementCount: undefined },
  { name: 'Sales Enablement', endorsementCount: undefined },
]

export function SkillsCard() {
  const primarySkill = SKILLS_DATA.find((s) => s.endorsed)

  return (
    <div className="skills-card">
      <div className="skills-card__header">
        <h2 className="skills-card__title">Skills</h2>
        <span className="skills-card__badge">{SKILLS_DATA.length}</span>
        <button type="button" className="skills-card__info-btn" aria-label="Skills information">
          <span className="material-symbols-outlined">info</span>
        </button>
      </div>
      {primarySkill && (
        <div className="skills-card__endorsement">
          <p className="skills-card__primary-skill">{primarySkill.name}</p>
          <div className="skills-card__endorsement-row">
            <div className="skills-card__endorser-avatar" style={{ background: '#E07C24' }}>
              M
            </div>
            <p className="skills-card__endorsement-text">
              Endorsed by Mateo Myer at Acme
            </p>
          </div>
        </div>
      )}
      <div className="skills-card__tags">
        {SKILLS_DATA.map((skill) => (
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
