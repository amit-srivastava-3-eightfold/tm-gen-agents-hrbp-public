import './MentoringCard.css'

interface MentoringCardProps {
  mentors?: number
  mentees?: number
}

export function MentoringCard({ mentors = 0, mentees = 0 }: MentoringCardProps) {
  return (
    <div className="mentoring-card">
      <h3 className="mentoring-card__title">Mentoring</h3>

      <div className="mentoring-card__group">
        <p className="mentoring-card__label">Mentors ({mentors})</p>
        <button type="button" className="mentoring-card__add" aria-label="Add mentor">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <div className="mentoring-card__group">
        <p className="mentoring-card__label">Mentees ({mentees})</p>
        <button type="button" className="mentoring-card__add" aria-label="Add mentee">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </div>
  )
}
