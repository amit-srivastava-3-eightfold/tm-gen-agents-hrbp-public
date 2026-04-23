import { useState, useEffect } from 'react'

interface CoachSessionPanelProps {
  open: boolean
  onClose: () => void
  sessionTitle?: string
  sessionDesc?: string
}

function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function CoachSessionPanel({ open, onClose, sessionTitle = 'Coaching session', sessionDesc = '' }: CoachSessionPanelProps) {
  const [mode, setMode] = useState<'default' | 'conversation'>('default')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!open) { setMode('default'); setElapsed(0) }
  }, [open])

  useEffect(() => {
    if (mode !== 'conversation') return
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [mode])

  return (
    <div className={`coach-session${open ? ' open' : ''}`} aria-hidden={!open} role="dialog" aria-labelledby="cs-title">
      <div className="cs-backdrop" onClick={onClose} />
      <div className="cs-panel" role="document">

        <header className="cs-head">
          <div className="cs-head-title" id="cs-title">
            <span className="material-symbols-outlined cs-spark">auto_awesome</span>
            AI Work Coach
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

        {mode === 'default' ? (
          /* ——— Default mode ——— */
          <>
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
                  <span className="cs-wave"><span /><span /><span /><span /></span>
                  John
                </div>
              </div>
              <div className="cs-chip cs-chip-left">Ask anything</div>
              <div className="cs-chip cs-chip-tr">Focused on you</div>
              <div className="cs-chip cs-chip-br">Always private</div>
            </div>

            <div className="cs-mid">
              <div className="cs-intro">{sessionTitle}</div>
              {sessionDesc && <div className="cs-session-sub" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.6, textAlign: 'center', padding: '0 24px', marginTop: 8 }}>{sessionDesc}</div>}
            </div>

            <div className="cs-foot">
              <button type="button" className="cs-start" onClick={() => setMode('conversation')}>
                <span className="material-symbols-outlined">mic</span>
                Start coaching session
              </button>
            </div>
          </>
        ) : (
          /* ——— Conversation mode ——— */
          <>
            <div className="cs-session-label">
              <div>
                <div className="cs-session-title">{sessionTitle}</div>
                {sessionDesc && <div className="cs-session-sub">{sessionDesc}</div>}
              </div>
              <div className="cs-timer">{fmtTime(elapsed)}</div>
            </div>

            <div className="cs-conv-hero">
              <div className="cs-avatar">
                <div className="cs-ring cs-ring-4" />
                <div className="cs-ring cs-ring-3" />
                <div className="cs-ring cs-ring-2" />
                <div className="cs-ring cs-ring-1" />
                <div className="cs-avatar-img">
                  <img src="/john.png" alt="John" />
                </div>
                <div className="cs-avatar-volume">
                  <span className="material-symbols-outlined">volume_up</span>
                </div>
                <div className="cs-name-badge">
                  <span className="cs-wave"><span /><span /><span /><span /></span>
                  John
                </div>
              </div>
            </div>

            <div className="cs-transcript">
              <p className="cs-t-line cs-t-faded">Regan, good to meet you — I'm your AI career coach.</p>
              <p className="cs-t-line cs-t-mid">I'm here to help you figure out where you want to go and how to get there.</p>
              <p className="cs-t-line cs-t-active"><strong>We'll check in regularly, set goals together, and work through</strong> whatever</p>
            </div>

            <div className="cs-conv-foot">
              <div className="cs-btn-group">
                <button type="button" className="cs-cc-btn" aria-label="Closed captions">
                  <span className="material-symbols-outlined">closed_caption</span>
                </button>
                <div className="cs-conv-divider" />
                <button type="button" className="cs-end-btn" onClick={() => { setMode('default'); setElapsed(0) }}>
                  <span className="material-symbols-outlined">close</span>
                  End
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
