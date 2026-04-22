import type { CoachPick } from '../../data/myWorkData'
import { LiveCoachingVisual } from './LiveCoachingVisual'

interface CoachPickCardProps {
  pick: CoachPick
  firstName: string
  onStart: () => void
  onDismiss?: () => void
}

export function CoachPickCard({ pick, onStart, onDismiss }: CoachPickCardProps) {
  return (
    <section className="pick">
      <div>
        {pick.eyebrow && <div className="pick-eyebrow">{pick.eyebrow}</div>}
        <h2>{pick.headline}</h2>
        <p>{pick.body}</p>
        {pick.outcomes && pick.outcomes.length > 0 && (
          <div className="pick-outcomes">
            {pick.outcomes.map((o) => (
              <div key={o.icon} className="pick-outcome">
                <span className="material-symbols-outlined">{o.icon}</span>
                <div><b>{o.bold}</b>{o.label}</div>
              </div>
            ))}
          </div>
        )}
        <div className="cta-row">
          <button type="button" className="btn-primary" onClick={onStart}>
            <span className="material-symbols-outlined">videocam</span>
            {pick.primaryCtaLabel}
          </button>
          <button type="button" className="btn-ghost" onClick={onDismiss}>
            {pick.secondaryCtaLabel}
          </button>
          <div className="coach-steps-hint">
            <span className="material-symbols-outlined">forum</span>
            {pick.durationHint}
          </div>
        </div>
      </div>
      <LiveCoachingVisual caption={pick.videoCaption} onClick={onStart} />
    </section>
  )
}
