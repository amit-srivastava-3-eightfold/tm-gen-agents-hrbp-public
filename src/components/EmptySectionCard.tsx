import './EmptySectionCard.css'

interface EmptySectionCardProps {
  title: string
  /** Optional material icon name shown next to the title (e.g. for privacy indicator) */
  titleIcon?: string
}

export function EmptySectionCard({ title, titleIcon }: EmptySectionCardProps) {
  return (
    <div className="empty-section-card">
      <div className="empty-section-card__header">
        <div className="empty-section-card__header-left">
          <h3 className="empty-section-card__title">{title}</h3>
          {titleIcon && (
            <span className="material-symbols-outlined empty-section-card__title-icon">{titleIcon}</span>
          )}
        </div>
        <button type="button" className="empty-section-card__add-btn" aria-label={`Add ${title}`}>
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </div>
  )
}
