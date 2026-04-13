import { useState } from 'react'
import { useUser } from '../contexts/UserContext'
import { Button } from '@tonyh-2-eightfold/ef-design-system'
import './SkillAssessmentsTab.css'

// Learner(0) → Developing(1) → Proficient(2) → Advanced(3) → Worldclass(4)
const LEVELS = ['Learner', 'Developing', 'Proficient', 'Advanced', 'Worldclass']

interface SkillEntry {
  name: string
  level: number // 0–4
}

const SKILLS_BY_USER: Record<string, SkillEntry[]> = {
  csm: [
    { name: 'Platform Reliability', level: 3 },
    { name: 'Engineering Leadership', level: 3 },
    { name: 'System Design', level: 3 },
    { name: 'Infrastructure', level: 2 },
    { name: 'AI/ML Pipelines', level: 2 },
    { name: 'Python', level: 4 },
    { name: 'Kubernetes', level: 2 },
    { name: 'CI/CD', level: 3 },
    { name: 'Observability', level: 3 },
    { name: 'Incident Management', level: 3 },
    { name: 'Technical Mentorship', level: 2 },
    { name: 'Cross-functional Collaboration', level: 3 },
    { name: 'Stakeholder Communication', level: 2 },
    { name: 'Road-mapping', level: 2 },
  ],
}

function SkillSlider({ skill, selfLevel }: { skill: SkillEntry; selfLevel: number }) {
  const pct = (selfLevel / 4) * 100
  return (
    <div className="skill-assessments__row">
      <div className="skill-assessments__skill-name">
        <span className="skill-assessments__skill-tag">{skill.name}</span>
      </div>
      <div className="skill-assessments__slider-wrap">
        <span className="skill-assessments__slider-label skill-assessments__slider-label--left">Learner</span>
        <div className="skill-assessments__track">
          <div className="skill-assessments__track-fill" style={{ width: `${pct}%` }} />
          <div className="skill-assessments__pin" style={{ left: `${pct}%` }}>
            <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
              <ellipse cx="8" cy="7.5" rx="7" ry="7" fill="#4A90D9" />
              <path d="M8 22 L2 12 Q8 15 14 12 Z" fill="#4A90D9" />
            </svg>
          </div>
        </div>
        <span className="skill-assessments__slider-label skill-assessments__slider-label--right">Worldclass</span>
      </div>
    </div>
  )
}

export function SkillAssessmentsTab() {
  const { currentUser } = useUser()
  const allSkills = SKILLS_BY_USER[currentUser.id] ?? SKILLS_BY_USER.csm ?? []
  const [activeTab, setActiveTab] = useState<'role' | 'other'>('other')
  const [search, setSearch] = useState('')

  const displayed = (activeTab === 'role' ? [] : allSkills).filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="skill-assessments-tab">
      {/* Main panel */}
      <div className="skill-assessments-tab__main">
        {/* Header */}
        <div className="skill-assessments-tab__header">
          <div className="skill-assessments-tab__title-row">
            <h2 className="skill-assessments-tab__title">Skill Assessments</h2>
            <span className="material-symbols-outlined skill-assessments-tab__title-icon">visibility_off</span>
          </div>
          <div className="skill-assessments-tab__actions">
            <Button
              variant="outline"
              size="sm"
              trailingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>}
            >
              Request assessment
            </Button>
            <Button variant="outline" size="sm">
              Edit assessments
            </Button>
          </div>
        </div>

        <p className="skill-assessments-tab__description">
          Complete your self assessment on all skills to personalise your career and learning
          experiences. Role skills and benchmark have been identified for your current role and
          pre-populated for you. You can use the "Other Skills" tab to add and rate more skills. On
          the skill proficiency sliders, "Learner" is the lowest score, "Worldclass" is the highest.
          <br /><br />
          After you receive manager assessment, it is strongly recommended that you and your manager
          to review and discuss the assessment together in your next 1:1 meeting.
        </p>

        {/* Sub-tabs */}
        <div className="skill-assessments-tab__tabs">
          <button
            type="button"
            className={`skill-assessments-tab__tab${activeTab === 'role' ? ' skill-assessments-tab__tab--active' : ''}`}
            onClick={() => setActiveTab('role')}
          >
            Required By Role <span className="skill-assessments-tab__tab-badge">0</span>
          </button>
          <button
            type="button"
            className={`skill-assessments-tab__tab${activeTab === 'other' ? ' skill-assessments-tab__tab--active' : ''}`}
            onClick={() => setActiveTab('other')}
          >
            Other Skills <span className="skill-assessments-tab__tab-badge skill-assessments-tab__tab-badge--blue">{allSkills.length}</span>
          </button>
        </div>

        {/* Search */}
        <div className="skill-assessments-tab__search">
          <span className="material-symbols-outlined skill-assessments-tab__search-icon">search</span>
          <input
            type="text"
            placeholder="Type to search skills"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="skill-assessments-tab__search-input"
          />
        </div>

        {/* Person comparators */}
        <div className="skill-assessments-tab__comparators">
          <button type="button" className="skill-assessments-tab__comparator">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M7 1C4.79 1 3 2.79 3 5s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 7c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" fill="#4A90D9"/>
            </svg>
            {currentUser.name}
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>expand_more</span>
          </button>
          <button type="button" className="skill-assessments-tab__comparator skill-assessments-tab__comparator--green">
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#22c55e' }}>chat_bubble</span>
            Select a person
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>expand_more</span>
          </button>
        </div>

        {/* Skill rows */}
        <div className="skill-assessments-tab__skills">
          {displayed.length === 0 && activeTab === 'role' && (
            <p className="skill-assessments-tab__empty">No required role skills defined.</p>
          )}
          {displayed.map((skill) => (
            <SkillSlider key={skill.name} skill={skill} selfLevel={skill.level} />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="skill-assessments-tab__sidebar">
        <div className="skill-assessments-tab__promo skill-assessments-tab__promo--teal">
          <h3 className="skill-assessments-tab__promo-title">Courses</h3>
          <p className="skill-assessments-tab__promo-text">Check out recommendations and see what's available now</p>
          <Button variant="outline" size="sm" style={{ width: '100%', background: '#fff', marginTop: 4 }}>Explore Courses</Button>
        </div>
        <div className="skill-assessments-tab__promo skill-assessments-tab__promo--purple">
          <h3 className="skill-assessments-tab__promo-title">Projects</h3>
          <p className="skill-assessments-tab__promo-text">Check out recommendations and see what's available now</p>
          <Button variant="outline" size="sm" style={{ width: '100%', background: '#fff', marginTop: 4 }}>Explore Projects</Button>
        </div>
        <div className="skill-assessments-tab__promo skill-assessments-tab__promo--pink">
          <h3 className="skill-assessments-tab__promo-title">Hi {currentUser.name.split(' ')[0]}, create a development plan for your role!</h3>
          <p className="skill-assessments-tab__promo-text">We found some templates that can help you get started</p>
          <Button variant="outline" size="sm" style={{ width: '100%', background: '#fff', color: '#7E3A77', borderColor: '#D8B1D4', marginTop: 4 }}>Create Development Plan</Button>
        </div>
      </aside>
    </div>
  )
}
