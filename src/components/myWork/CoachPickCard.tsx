import type { CoachPick } from '../../data/myWorkData'
import { CoachAvatar } from './CoachAvatar'
import { LiveCoachingVisual } from './LiveCoachingVisual'

interface CoachPickCardProps {
  pick: CoachPick
  firstName: string
  onStart: () => void
  onDismiss?: () => void
}

export function CoachPickCard({ pick, firstName, onStart, onDismiss }: CoachPickCardProps) {
  const quip = pick.quip.replace('{firstName}', firstName)

  return (
    <section className="mw-pick">
      <div>
        <div className="mw-pick__from">
          <CoachAvatar size="md" />
          <div>
            <div className="mw-coach-label">
              <span className="mw-coach-label__dot" aria-hidden />
              FROM YOUR AI COACH
            </div>
            <div className="mw-pick__quip">{quip}</div>
          </div>
        </div>
        <h2 className="mw-pick__h">{pick.headline}</h2>
        <p className="mw-pick__p">{pick.body}</p>
        <div className="mw-pick__ctas">
          <button type="button" className="mw-btn-primary" onClick={onStart}>
            <span className="material-symbols-outlined">videocam</span>
            {pick.primaryCtaLabel}
          </button>
          <button type="button" className="mw-btn-ghost" onClick={onDismiss}>
            {pick.secondaryCtaLabel}
          </button>
          <div className="mw-pick__hint">
            <span className="material-symbols-outlined">forum</span>
            {pick.durationHint}
          </div>
        </div>
      </div>
      <LiveCoachingVisual caption={pick.videoCaption} onClick={onStart} />
    </section>
  )
}
