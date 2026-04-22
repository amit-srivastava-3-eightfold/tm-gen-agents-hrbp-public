import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  CHAT_SUGGESTIONS,
  CHECKIN_QUESTIONS,
  COACH_GREETING_CHAT,
  COACH_GREETING_CHECKIN,
  COACH_GREETING_PR,
  WALKTHROUGH_STEPS,
} from '../../data/myWorkData'
import { CoachAvatar } from './CoachAvatar'

export type CoachDrawerView = 'pr' | 'checkin' | 'chat' | null

interface CoachDrawerProps {
  view: CoachDrawerView
  firstName: string
  onClose: () => void
}

const BODY_ATTR = 'data-coach-open'

function CoachMessage({ children }: { children: ReactNode }) {
  return (
    <div className="coach-msg">
      <CoachAvatar size="sm" />
      <div className="bubble">{children}</div>
    </div>
  )
}

function PrWalkthroughView() {
  return (
    <>
      <CoachMessage>{COACH_GREETING_PR}</CoachMessage>
      <div className="coach-steps">
        {WALKTHROUGH_STEPS.map((step, idx) => (
          <div
            key={step.id}
            className={`coach-step${step.state === 'active' ? ' active' : ''}${step.state === 'done' ? ' done' : ''}`}
          >
            <div className="step-dot">
              {step.state === 'done' ? (
                <span className="material-symbols-outlined">check</span>
              ) : (
                idx + 1
              )}
            </div>
            <div>
              <div className="step-title">{step.title}</div>
              <div className="step-body">
                {step.body}
                {step.link ? (
                  <>
                    {' '}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      {step.link.label}
                    </a>
                    .
                  </>
                ) : null}
              </div>
              {step.ctaLabel ? (
                <button type="button" className="step-btn">
                  {step.ctaLabel}
                  {step.ctaIcon ? (
                    <span className="material-symbols-outlined">{step.ctaIcon}</span>
                  ) : null}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="coach-input">
        <input placeholder="Stuck? Ask me anything about this step…" />
        <button type="button" className="send-btn" aria-label="Send">
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      </div>
    </>
  )
}

function CheckInView({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<Record<string, string>>({
    feel: 'Lighter than usual',
    help: 'Code review',
  })
  const [comment, setComment] = useState('')

  return (
    <>
      <CoachMessage>{COACH_GREETING_CHECKIN}</CoachMessage>
      {CHECKIN_QUESTIONS.map((q) => (
        <div key={q.id} className="checkin-q">
          <div className="q-label">{q.label}</div>
          {q.kind === 'single' ? (
            <div className="q-opts">
              {q.options?.map((opt) => {
                const active = selected[q.id] === opt.label
                return (
                  <button
                    key={opt.label}
                    type="button"
                    className={`q-chip${active ? ' selected' : ''}`}
                    onClick={() => setSelected((prev) => ({ ...prev, [q.id]: opt.label }))}
                  >
                    {opt.emoji ? <>{opt.emoji} </> : null}
                    {opt.label}
                  </button>
                )
              })}
            </div>
          ) : (
            <textarea
              placeholder={q.placeholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          )}
        </div>
      ))}
      <div className="coach-actions">
        <button type="button" className="btn-primary" onClick={onClose}>
          Send it
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <button type="button" className="btn-ghost" onClick={onClose}>
          Skip for now
        </button>
      </div>
    </>
  )
}

function ChatView({ firstName }: { firstName: string }) {
  const [input, setInput] = useState('')
  const greeting = COACH_GREETING_CHAT.replace('{firstName}', firstName)

  return (
    <>
      <CoachMessage>{greeting}</CoachMessage>
      <div className="chat-suggest">
        <div className="cs-label">Some things I can help with:</div>
        {CHAT_SUGGESTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="cs-chip-suggest"
            onClick={() => setInput(s.text)}
          >
            {s.emoji} {s.text}
          </button>
        ))}
      </div>
      <div className="coach-input">
        <input
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="button" className="send-btn" aria-label="Send">
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      </div>
    </>
  )
}

export function CoachDrawer({ view, firstName, onClose }: CoachDrawerProps) {
  const open = view !== null

  useLayoutEffect(() => {
    if (open) {
      document.body.setAttribute(BODY_ATTR, 'true')
    } else {
      document.body.removeAttribute(BODY_ATTR)
    }
    return () => document.body.removeAttribute(BODY_ATTR)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const content = (
    <div className={`my-work-page coach-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="coach-backdrop" onClick={onClose} aria-hidden />
      <aside className="coach-panel" role="dialog" aria-modal="true">
        <header className="coach-panel-head">
          <CoachAvatar size="md" />
          <div>
            <div className="coach-panel-title">Your AI coach</div>
            <div className="coach-panel-sub">
              <span className="online-dot" aria-hidden />
              Here to help, not to grade
            </div>
          </div>
          <button
            type="button"
            className="coach-close"
            onClick={onClose}
            aria-label="Close coach"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        <div className="coach-view">
          {view === 'pr' ? <PrWalkthroughView /> : null}
          {view === 'checkin' ? <CheckInView onClose={onClose} /> : null}
          {view === 'chat' ? <ChatView firstName={firstName} /> : null}
        </div>
      </aside>
    </div>
  )

  return createPortal(content, document.body)
}
