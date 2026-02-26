import { useState } from 'react'
import { SkillTag } from './SkillTag'
import './SkillGoalsCard.css'

const INITIAL_GOALS = [
  'UX Design',
  'Data Analytics',
  'Data Visualization',
  'UI',
  'Design Systems',
  'Visual Design',
  'Machine Learning',
  'Python',
  'AI',
  'Data-Driven Decision Making',
  'Consumer Product Mastery',
]

const SUGGESTED_SKILLS = [
  'A/B Testing',
  'Accessibility Standards',
  'Agile Methodologies',
  'Analytics',
  'Artificial Intelligence',
  'B2B',
  'Business Development',
  'Business Strategy',
  'Cloud Platforms',
  'Competitive Analysis',
  'Content Strategy',
  'Creative Direction',
  'Cross-Functional Team Leadership',
  'Design Thinking',
  'Digital Product Design',
  'Digital Strategy',
  'Enterprise SaaS',
  'Enterprise Software',
  'Figma',
  'Go to Market Strategy',
]

const MORE_RECOMMENDATIONS_COUNT = 21

export function SkillGoalsCard() {
  const [goals, setGoals] = useState<string[]>(INITIAL_GOALS)
  const [suggestedExpanded, setSuggestedExpanded] = useState(true)

  const addGoal = (skill: string) => {
    if (!goals.includes(skill)) {
      setGoals([...goals, skill])
    }
  }

  const removeGoal = (skill: string) => {
    setGoals(goals.filter((g) => g !== skill))
  }

  return (
    <div className="skill-goals-card">
      <div className="skill-goals-card__header">
        <div className="skill-goals-card__title-row">
          <h3 className="skill-goals-card__title">Skill goals</h3>
          <span className="skill-goals-card__badge">{goals.length}</span>
        </div>
        <button type="button" className="skill-goals-card__add-btn" aria-label="Add skill goal">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <div className="skill-goals-card__goals">
        {goals.map((skill) => (
          <SkillTag key={skill} variant="selected" onRemove={() => removeGoal(skill)}>
            {skill}
          </SkillTag>
        ))}
        <button type="button" className="skill-goals-card__ai-btn" aria-label="AI suggestions">
          <span className="material-symbols-outlined">bolt</span>
        </button>
      </div>

      <div className="skill-goals-card__suggested-card">
        <button
          type="button"
          className="skill-goals-card__suggested-header"
          onClick={() => setSuggestedExpanded(!suggestedExpanded)}
          aria-expanded={suggestedExpanded}
        >
          <h4 className="skill-goals-card__suggested-title">Suggested skills for you</h4>
          <span className="skill-goals-card__badge">{SUGGESTED_SKILLS.length + MORE_RECOMMENDATIONS_COUNT}</span>
          <span className="material-symbols-outlined skill-goals-card__chevron">
            {suggestedExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {suggestedExpanded && (
          <div className="skill-goals-card__suggested-body">
            <div className="skill-goals-card__suggested-tags">
              {SUGGESTED_SKILLS.filter((s) => !goals.includes(s)).map((skill) => (
                <SkillTag key={skill} variant="addable" onAdd={() => addGoal(skill)}>
                  {skill}
                </SkillTag>
              ))}
            </div>
            <button type="button" className="skill-goals-card__more-link">
              See more skill recommendations
              <span className="skill-goals-card__badge skill-goals-card__badge--outline">{MORE_RECOMMENDATIONS_COUNT}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
