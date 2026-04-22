import { CoachAvatar } from './CoachAvatar'

interface LiveCoachingVisualProps {
  caption: string
  onClick?: () => void
}

export function LiveCoachingVisual({ caption, onClick }: LiveCoachingVisualProps) {
  return (
    <div
      className="mw-video"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label="Start live coaching session"
    >
      <span className="mw-video__live">
        <span className="mw-video__live-dot" aria-hidden />
        LIVE COACHING
      </span>
      <div className="mw-video__face">
        <CoachAvatar size="xl" />
        <div className="mw-video__wave" aria-hidden>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="mw-video__caption">“{caption}”</div>
      </div>
      <div className="mw-video__controls">
        <button type="button" className="mw-call-btn" aria-label="Mute">
          <span className="material-symbols-outlined">mic</span>
        </button>
        <button type="button" className="mw-call-btn mw-call-btn--primary" aria-label="Join call">
          <span className="material-symbols-outlined">videocam</span>
        </button>
        <button type="button" className="mw-call-btn" aria-label="Chat">
          <span className="material-symbols-outlined">chat</span>
        </button>
      </div>
    </div>
  )
}
