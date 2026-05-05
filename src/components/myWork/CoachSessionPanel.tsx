import { useState, useEffect, useRef } from 'react'
import { speak as voiceSpeak, stop as voiceStop, DEFAULT_VOICE_ID, SARAH_VOICE_ID } from '../../utils/voice'

export interface CoachTurn {
  speaker: 'ai' | 'sarah'
  text: string
}

interface CoachSessionPanelProps {
  open: boolean
  onClose: () => void
  sessionTitle?: string
  sessionDesc?: string
  script?: CoachTurn[]
  /** Optional plan name shown under the "Career Coach" header (e.g. an IDP name). */
  planName?: string
  /** Intercept a transcript link click. Return true to suppress the default
   *  close-and-scroll behavior — useful for opening a modal instead. */
  onLinkClick?: (href: string) => boolean
}

function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function CoachSessionPanel({ open, onClose, sessionTitle = 'Coaching session', sessionDesc = '', script, planName, onLinkClick }: CoachSessionPanelProps) {
  const [mode, setMode] = useState<'default' | 'conversation'>('default')
  const [elapsed, setElapsed] = useState(0)
  const [turnIdx, setTurnIdx] = useState(0)
  const [partial, setPartial] = useState('')
  const transcriptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) { setMode('default'); setElapsed(0); setTurnIdx(0); setPartial(''); voiceStop() }
  }, [open])

  useEffect(() => {
    if (mode !== 'conversation') return
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [mode])

  // Scripted transcript: type out each turn while ElevenLabs voice plays in
  // parallel; advance only after both typing and audio finish.
  useEffect(() => {
    if (mode !== 'conversation' || !script || turnIdx >= script.length) return
    const turn = script[turnIdx]
    setPartial('')
    let cancelled = false
    const charDelay = turn.speaker === 'sarah' ? 18 : 22
    const startDelay = turnIdx === 0 ? 800 : 500

    let typingDone = false
    let audioDone = false
    const advanceIfReady = () => {
      if (typingDone && audioDone && !cancelled) {
        setTimeout(() => { if (!cancelled) setTurnIdx(idx => idx + 1) }, 600)
      }
    }

    let i = 0
    const tick = () => {
      if (cancelled) return
      if (i >= turn.text.length) {
        typingDone = true
        advanceIfReady()
        return
      }
      i++
      setPartial(turn.text.slice(0, i))
      setTimeout(tick, charDelay)
    }
    const t = setTimeout(() => {
      if (cancelled) return
      tick()
      const voiceId = turn.speaker === 'sarah' ? SARAH_VOICE_ID : DEFAULT_VOICE_ID
      voiceSpeak(turn.text, voiceId).then(() => {
        audioDone = true
        advanceIfReady()
      })
    }, startDelay)

    return () => { cancelled = true; clearTimeout(t); voiceStop() }
  }, [mode, turnIdx, script])

  // Auto-scroll transcript to keep latest line in view
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [turnIdx, partial])

  const startConversation = () => {
    setTurnIdx(0)
    setPartial('')
    setMode('conversation')
  }

  return (
    <div className={`coach-session${open ? ' open' : ''}`} aria-hidden={!open} role="dialog" aria-labelledby="cs-title">
      <div className="cs-backdrop" onClick={onClose} />
      <div className="cs-panel" role="document">

        <header className="cs-head">
          <div className="cs-head-title" id="cs-title">
            <span className="material-symbols-outlined cs-spark">auto_awesome</span>
            Career Coach
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
                  <img src="/john.png" alt="John, your Career Coach" />
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
              <div className="cs-intro">{planName ?? sessionTitle}</div>
              {sessionDesc && <div className="cs-session-sub" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.6, textAlign: 'center', padding: '0 24px', marginTop: 8 }}>{sessionDesc}</div>}
            </div>

            <div className="cs-foot">
              <button type="button" className="cs-start" onClick={startConversation}>
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

            <div className="cs-transcript" ref={transcriptRef}>
              {script ? (() => {
                const renderLinks = (text: string) => {
                  const parts: React.ReactNode[] = []
                  const re = /\[([^\]]+)\]\(([^)]+)\)/g
                  let lastIdx = 0
                  let m: RegExpExecArray | null
                  let key = 0
                  while ((m = re.exec(text)) !== null) {
                    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index))
                    const label = m[1]
                    const href = m[2]
                    parts.push(
                      <a key={`l-${key++}`} href={href} className="cs-t-link" onClick={(e) => { e.preventDefault(); if (onLinkClick?.(href)) return; onClose(); setTimeout(() => { const el = document.querySelector(href); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, 280) }}>
                        {label}
                        <span className="material-symbols-outlined cs-t-link-icon">arrow_outward</span>
                      </a>
                    )
                    lastIdx = m.index + m[0].length
                  }
                  if (lastIdx < text.length) parts.push(text.slice(lastIdx))
                  return parts
                }
                const lines = script.slice(0, turnIdx + 1).map((turn, i) => {
                  const isCurrent = i === turnIdx
                  const text = isCurrent ? partial : turn.text
                  if (!text) return null
                  const ageClass = i === turnIdx ? 'cs-t-active' : i === turnIdx - 1 ? 'cs-t-mid' : 'cs-t-faded'
                  const speakerClass = turn.speaker === 'sarah' ? 'cs-t-sarah' : 'cs-t-coach'
                  return (
                    <p key={i} className={`cs-t-line ${ageClass} ${speakerClass}`}>
                      <span className="cs-t-speaker">{turn.speaker === 'sarah' ? 'Sarah' : 'AI Coach'}</span>
                      <span className="cs-t-body">{renderLinks(text)}{isCurrent && <span className="cs-t-caret" />}</span>
                    </p>
                  )
                })
                return lines
              })() : (
                <>
                  <p className="cs-t-line cs-t-faded">Regan, good to meet you — I'm your AI career coach.</p>
                  <p className="cs-t-line cs-t-mid">I'm here to help you figure out where you want to go and how to get there.</p>
                  <p className="cs-t-line cs-t-active"><strong>We'll check in regularly, set goals together, and work through</strong> whatever</p>
                </>
              )}
            </div>

            <div className="cs-conv-foot">
              <div className="cs-btn-group">
                <button type="button" className="cs-cc-btn" aria-label="Closed captions">
                  <span className="material-symbols-outlined">closed_caption</span>
                </button>
                <div className="cs-conv-divider" />
                <button type="button" className="cs-end-btn" onClick={() => { voiceStop(); setMode('default'); setElapsed(0); setTurnIdx(0); setPartial('') }}>
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
