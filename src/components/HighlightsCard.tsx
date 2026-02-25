import './HighlightsCard.css'

interface HighlightsCardProps {
  matchRole?: string
  matchScore?: number
  roleInterest?: string
  insights?: string[]
  hireDate?: string
  timeInCurrentPosition?: string
  businessUnit?: string
  mobilityPreference?: string
  eligibleForInternalMobility?: string
}

const DEFAULT_INSIGHTS = ['Led 12 enterprise POCs last quarter']

export function HighlightsCard({
  matchRole,
  matchScore,
  roleInterest,
  insights,
  hireDate,
  timeInCurrentPosition,
  businessUnit,
  mobilityPreference,
  eligibleForInternalMobility,
}: HighlightsCardProps) {
  const items = (insights ?? DEFAULT_INSIGHTS).slice(0, -2)

  return (
    <div className="highlights-card">
      <h3 className="highlights-card__title">Internal mobility</h3>
      {matchScore != null && (
        <div className="highlights-card__match">
          {matchRole && (
            <span className="highlights-card__match-role">{matchRole}</span>
          )}
          <div className="highlights-card__match-row">
            <span className="highlights-card__match-label">Match</span>
            <div className="highlights-card__match-dots" aria-label={`Match score: ${matchScore} out of 5`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`highlights-card__match-dot ${i <= matchScore ? 'highlights-card__match-dot--filled' : ''}`}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {matchRole && roleInterest && (
        <div className="highlights-card__item">
          <span className="material-symbols-outlined highlights-card__icon">work</span>
          <span className="highlights-card__text">Role interests: <strong>{roleInterest}</strong></span>
        </div>
      )}
      {items.map((text, i) => (
        <div key={i} className="highlights-card__item">
          <span className="material-symbols-outlined highlights-card__icon">work</span>
          <span className="highlights-card__text">{text}</span>
        </div>
      ))}
      {(hireDate || timeInCurrentPosition || businessUnit || mobilityPreference || eligibleForInternalMobility) && (
        <>
          <div className="highlights-card__divider" />
          <div className="highlights-card__info-grid">
            {hireDate && (
              <div className="highlights-card__info-item">
                <span className="highlights-card__info-label">Hire Date</span>
                <span className="highlights-card__info-value">{hireDate}</span>
              </div>
            )}
            {timeInCurrentPosition && (
              <div className="highlights-card__info-item">
                <span className="highlights-card__info-label">Time in current position</span>
                <span className="highlights-card__info-value">{timeInCurrentPosition}</span>
              </div>
            )}
            {businessUnit && (
              <div className="highlights-card__info-item">
                <span className="highlights-card__info-label">Business Unit</span>
                <span className="highlights-card__info-value">{businessUnit}</span>
              </div>
            )}
            {mobilityPreference && (
              <div className="highlights-card__info-item">
                <span className="highlights-card__info-label">
                  Mobility preference
                  <button type="button" className="highlights-card__info-icon" aria-label="Information">
                    <span className="material-symbols-outlined">info</span>
                  </button>
                </span>
                <span className="highlights-card__info-value">{mobilityPreference}</span>
              </div>
            )}
            {eligibleForInternalMobility && (
              <div className="highlights-card__info-item highlights-card__info-item--full">
                <span className="highlights-card__info-label">
                  Eligible for internal mobility
                  <button type="button" className="highlights-card__info-icon" aria-label="Information">
                    <span className="material-symbols-outlined">info</span>
                  </button>
                </span>
                <span className="highlights-card__info-value">{eligibleForInternalMobility}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
