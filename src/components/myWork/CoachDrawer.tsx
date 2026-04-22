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

const BODY_ATTR = 'data-mw-coach-open'

function CoachMessage({ children }: { children: ReactNode }) {
  return (
    <div className="mw-msg">
      <CoachAvatar size="sm" />
      <div className="mw-msg__bubble">{children}</div>
    </div>
  )
}

function PrWalkthroughView() {
  return (
    <>
      <CoachMessage>{COACH_GREETING_PR}</CoachMessage>
      <div className="mw-steps">
        {WALKTHROUGH_STEPS.map((step, idx) => (
          <div
            key={step.id}
            className={`mw-step${step.state === 'active' ? ' mw-step--active' : ''}${step.state === 'done' ? ' mw-step--done' : ''}`}
          >
            <div className="mw-step__dot">
              {step.state === 'done' ? (
                <span className="material-symbols-outlined">check</span>
              ) : (
                idx + 1
              )}
            </div>
            <div>
              <div className="mw-step__title">{step.title}</div>
              <div className="mw-step__body">
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
                <button type="button" className="mw-step__btn">
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
      <div className="mw-drawer__input">
        <input placeholder="Stuck? Ask me anything about this step…" />
        <button type="button" className="mw-drawer__send" aria-label="Send">
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
        <div key={q.id} className="mw-q">
          <div className="mw-q__label">{q.label}</div>
          {q.kind === 'single' ? (
            <div className="mw-q__opts">
              {q.options?.map((opt) => {
                const active = selected[q.id] === opt.label
                return (
                  <button
                    key={opt.label}
                    type="button"
                    className={`mw-chip${active ? ' mw-chip--selected' : ''}`}
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
      <div className="mw-drawer__actions">
        <button type="button" className="mw-btn-primary" onClick={onClose}>
          Send it
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <button type="button" className="mw-btn-ghost" onClick={onClose}>
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
      <div className="mw-suggest">
        <div className="mw-suggest__label">Some things I can help with:</div>
        {CHAT_SUGGESTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="mw-suggest__chip"
            onClick={() => setInput(s.text)}
          >
            {s.emoji} {s.text}
          </button>
        ))}
      </div>
      <div className="mw-drawer__input">
        <input
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="button" className="mw-drawer__send" aria-label="Send">
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
    <div
      className={`my-work mw-drawer${open ? ' mw-drawer--open' : ''}`}
      aria-hidden={!open}
    >
      <div className="mw-drawer__backdrop" onClick={onClose} aria-hidden />
      <aside className="mw-drawer__panel" role="dialog" aria-modal="true">
        <header className="mw-drawer__head">
          <CoachAvatar size="md" />
          <div>
            <div className="mw-drawer__title">Your AI coach</div>
            <div className="mw-drawer__sub">
              <span className="mw-drawer__online-dot" aria-hidden />
              Here to help, not to grade
            </div>
          </div>
          <button
            type="button"
            className="mw-drawer__close"
            onClick={onClose}
            aria-label="Close coach"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        <div className="mw-drawer__view">
          {view === 'pr' ? <PrWalkthroughView /> : null}
          {view === 'checkin' ? <CheckInView onClose={onClose} /> : null}
          {view === 'chat' ? <ChatView firstName={firstName} /> : null}
        </div>
      </aside>
    </div>
  )

  return createPortal(content, document.body)
}
