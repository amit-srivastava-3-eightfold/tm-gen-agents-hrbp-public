import { Button } from '@tonyh-2-eightfold/ef-design-system'
import type { CoachPick } from '../../data/myWorkData'
import { LiveCoachingVisual } from './LiveCoachingVisual'

interface CoachPickCardProps {
  pick: CoachPick
  firstName: string
  onStart: () => void
  onDismiss?: () => void
  moduleName?: string
}

export function CoachPickCard({ pick, onStart, onDismiss, moduleName }: CoachPickCardProps) {
  return (
    <section className="pick">
      <div>
        {pick.eyebrow && <div className="pick-eyebrow">{pick.eyebrow}</div>}
        <h2>{pick.headline}</h2>
        <p>{pick.body}{moduleName && <> You're currently on <strong>{moduleName}</strong>.</>}</p>
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
          <Button
            variant="primary"
            onClick={onStart}
            leadingIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>videocam</span>}
          >
            {pick.primaryCtaLabel}
          </Button>
          {onDismiss && (
            <Button variant="default" onClick={onDismiss}>
              {pick.secondaryCtaLabel}
            </Button>
          )}
          {pick.durationHint && (
            <div className="coach-steps-hint">
              <span className="material-symbols-outlined">forum</span>
              {pick.durationHint}
            </div>
          )}
        </div>
      </div>
      <LiveCoachingVisual caption={pick.videoCaption} onClick={onStart} />
    </section>
  )
}
