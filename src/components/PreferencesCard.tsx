import './PreferencesCard.css'

export function PreferencesCard() {
  return (
    <div className="preferences-card">
      <div className="preferences-card__header">
        <div>
          <h3 className="preferences-card__title">Preferences</h3>
          <p className="preferences-card__description">Personalize your experience and recommendations</p>
        </div>
        <button type="button" className="preferences-card__edit-btn" aria-label="Edit preferences">
          <span className="material-symbols-outlined">edit</span>
        </button>
      </div>
      <div className="preferences-card__list">
        <div className="preferences-card__item">
          <span className="material-symbols-outlined preferences-card__icon" aria-hidden>work</span>
          <div className="preferences-card__item-content">
            <span className="preferences-card__label">Ideal locations to work</span>
            <span className="preferences-card__value">Mountain View, CA, USA +2 more</span>
          </div>
        </div>
        <div className="preferences-card__item">
          <span className="material-symbols-outlined preferences-card__icon" aria-hidden>show_chart</span>
          <div className="preferences-card__item-content">
            <span className="preferences-card__label">Project Preferences</span>
            <span className="preferences-card__value">4-8 hours/week</span>
          </div>
        </div>
      </div>
    </div>
  )
}
