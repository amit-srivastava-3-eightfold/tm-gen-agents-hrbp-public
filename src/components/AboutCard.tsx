import { useState } from 'react'
import './AboutCard.css'
import { useUser } from '../contexts/UserContext'

interface AboutCardProps {
  /** When provided, the card renders this text read-only (e.g. another person's profile). */
  text?: string
  /** Force read-only: hides the edit affordance and renders a paragraph instead of a textarea. Implied when `text` is set. */
  readOnly?: boolean
}

export function AboutCard({ text, readOnly = false }: AboutCardProps = {}) {
  const { currentUser } = useUser()
  const [value, setValue] = useState(currentUser.about ?? '')

  if (readOnly || text != null) {
    return (
      <div className="about-card">
        <div className="about-card__header">
          <h3 className="about-card__title">About</h3>
        </div>
        <p className="about-card__text">{text ?? value}</p>
      </div>
    )
  }

  return (
    <div className="about-card">
      <div className="about-card__header">
        <h3 className="about-card__title">About</h3>
        <button type="button" className="about-card__edit-btn" aria-label="Edit about">
          <span className="material-symbols-outlined">edit</span>
        </button>
      </div>
      <textarea
        className="about-card__textarea"
        placeholder="Give a personalized description of yourself as a professional in this section."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        aria-label="About"
      />
    </div>
  )
}
