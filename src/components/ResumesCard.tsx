import './ResumesCard.css'

export function ResumesCard() {
  return (
    <div className="resumes-card">
      <div className="resumes-card__header">
        <h3 className="resumes-card__title">Resumes</h3>
        <button type="button" className="resumes-card__edit-btn" aria-label="Edit resumes">
          <span className="material-symbols-outlined">edit</span>
        </button>
      </div>
      <div className="resumes-card__content">
        <p className="resumes-card__empty">No resumes added.</p>
      </div>
    </div>
  )
}
