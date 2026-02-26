import { useState } from 'react'
import './AboutCard.css'
import { useUser } from '../contexts/UserContext'

export function AboutCard() {
  const { currentUser } = useUser()
  const [value, setValue] = useState(currentUser.about ?? '')

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
