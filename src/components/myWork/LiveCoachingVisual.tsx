interface LiveCoachingVisualProps {
  caption?: string
  onClick?: () => void
}

export function LiveCoachingVisual({ onClick }: LiveCoachingVisualProps) {
  return (
    <div className="pick-visual video-visual" role="button" tabIndex={0} onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } }}
      aria-label="Start coaching session"
    >
      <span className="live-badge">
        <span className="material-symbols-outlined agent-sparkle">auto_awesome</span>
        Career Agent
      </span>
      <div className="video-face">
        <div className="vv-avatar-wrap">
          <div className="vv-avatar-ring" />
          <div className="vv-avatar">
            <img src="/john.png" alt="" />
          </div>
          <div className="vv-speaker-chip">
            <span className="material-symbols-outlined">volume_up</span>
          </div>
          <div className="vv-chip vv-chip--ask">Ask anything</div>
          <div className="vv-chip vv-chip--focused">Focused on you</div>
          <div className="vv-chip vv-chip--private">Always private</div>
        </div>
        <div className="vv-name-chip">
          <div className="vv-bars" aria-hidden>
            <span /><span /><span /><span />
          </div>
          John
        </div>
      </div>
    </div>
  )
}
