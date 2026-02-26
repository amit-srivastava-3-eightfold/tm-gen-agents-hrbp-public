import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NavbarApp } from '../components/Navbar'
import { SkillTag } from '../components/SkillTag'

export function SkillTagPage() {
  const [selectedSkills, setSelectedSkills] = useState(['Python', 'React', 'TypeScript'])
  const suggestedSkills = ['Node.js', 'SQL', 'AWS', 'GraphQL']

  const removeGoal = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill))
  }

  const addGoal = (skill: string) => {
    setSelectedSkills((prev) => [...prev, skill])
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <NavbarApp />
      </header>
      <main style={{ padding: 24, paddingTop: 104, maxWidth: 800, margin: '0 auto' }}>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            marginBottom: 16,
            color: '#146DA6',
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          ← Back to Home
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>SkillTag</h1>
        <p style={{ color: '#4F5666', marginBottom: 32 }}>
          Reusable skill tag component from the design system. Used in Skill goals and suggested skills.
        </p>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Selected (with remove)</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {selectedSkills.map((skill) => (
              <SkillTag key={skill} variant="selected" onRemove={() => removeGoal(skill)}>
                {skill}
              </SkillTag>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Addable</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {suggestedSkills
              .filter((s) => !selectedSkills.includes(s))
              .map((skill) => (
                <SkillTag key={skill} variant="addable" onAdd={() => addGoal(skill)}>
                  {skill}
                </SkillTag>
              ))}
          </div>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Selected (no remove)</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <SkillTag variant="selected">Read-only skill</SkillTag>
          </div>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Matched</h2>
          <p style={{ fontSize: 14, color: '#69717F', marginBottom: 12 }}>
            Indicates a skill that matches (e.g. role requirement). Green styling with check icon.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <SkillTag size="sm" variant="matched">Python</SkillTag>
            <SkillTag size="md" variant="matched">React</SkillTag>
            <SkillTag size="lg" variant="matched">TypeScript</SkillTag>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Size variants</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, color: '#69717F', marginRight: 8 }}>sm</span>
              <SkillTag size="sm" variant="selected" onRemove={() => {}}>Python</SkillTag>
              <SkillTag size="sm" variant="addable" onAdd={() => {}}>React</SkillTag>
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#69717F', marginRight: 8 }}>md (default)</span>
              <SkillTag size="md" variant="selected" onRemove={() => {}}>Python</SkillTag>
              <SkillTag size="md" variant="addable" onAdd={() => {}}>React</SkillTag>
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#69717F', marginRight: 8 }}>lg</span>
              <SkillTag size="lg" variant="selected" onRemove={() => {}}>Python</SkillTag>
              <SkillTag size="lg" variant="addable" onAdd={() => {}}>React</SkillTag>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
