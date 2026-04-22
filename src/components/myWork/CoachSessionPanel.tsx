interface CoachSessionPanelProps {
  open: boolean
  onClose: () => void
}

export function CoachSessionPanel({ open, onClose }: CoachSessionPanelProps) {
  return (
    <div
      className={`coach-session${open ? ' open' : ''}`}
      aria-hidden={!open}
      role="dialog"
      aria-labelledby="cs-title"
    >
      <div className="cs-backdrop" onClick={onClose} />
      <div className="cs-panel" role="document">
        <header className="cs-head">
          <div className="cs-head-title" id="cs-title">
            <span className="material-symbols-outlined cs-spark">auto_awesome</span>
            Career Agent
          </div>
          <div className="cs-head-actions">
            <button type="button" className="cs-icon-btn" aria-label="About">
              <span className="material-symbols-outlined">info</span>
            </button>
            <button type="button" className="cs-icon-btn" aria-label="History">
              <span className="material-symbols-outlined">history</span>
            </button>
            <button type="button" className="cs-icon-btn" aria-label="Edit">
              <span className="material-symbols-outlined">edit_square</span>
            </button>
            <button type="button" className="cs-icon-btn" aria-label="Close" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        <div className="cs-hero">
          <div className="cs-avatar">
            <div className="cs-ring cs-ring-4" />
            <div className="cs-ring cs-ring-3" />
            <div className="cs-ring cs-ring-2" />
            <div className="cs-ring cs-ring-1" />
            <div className="cs-avatar-img">
              <img src="/john.png" alt="John, your Career Agent" />
            </div>
            <div className="cs-avatar-volume">
              <span className="material-symbols-outlined">volume_up</span>
            </div>
            <div className="cs-name-badge">
              <span className="cs-wave">
                <span /><span /><span /><span />
              </span>
              John
            </div>
          </div>

          <div className="cs-chip cs-chip-left">Ask anything</div>
          <div className="cs-chip cs-chip-tr">Focused on you</div>
          <div className="cs-chip cs-chip-br">Always private</div>
        </div>

        <div className="cs-mid">
          <div className="cs-intro">
            Let's set up AI pre-review<br />for your model PRs.
          </div>
          <div className="cs-cats">
            <button type="button" className="cs-cat" title="Your profile">
              <span className="material-symbols-outlined">badge</span>
            </button>
            <button type="button" className="cs-cat" title="Explore roles">
              <span className="material-symbols-outlined">explore</span>
            </button>
            <button type="button" className="cs-cat" title="Growth plan">
              <span className="material-symbols-outlined">trending_up</span>
            </button>
            <button type="button" className="cs-cat" title="Learning">
              <span className="material-symbols-outlined">lightbulb</span>
            </button>
          </div>
        </div>

        <div className="cs-foot">
          <button type="button" className="cs-start">
            <span className="material-symbols-outlined">mic</span>
            Start coaching session
          </button>
        </div>
      </div>
    </div>
  )
}
