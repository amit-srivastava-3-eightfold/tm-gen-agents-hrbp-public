import { CoachAvatar } from './CoachAvatar'

interface CheckInCardProps {
  onStart: () => void
}

export function CheckInCard({ onStart }: CheckInCardProps) {
  return (
    <section className="mw-checkin">
      <CoachAvatar size="lg" />
      <div className="mw-checkin__body">
        <div className="mw-coach-label mw-checkin__label">
          <span className="mw-coach-label__dot" aria-hidden />
          YOUR AI COACH
        </div>
        <h3>How's AI fitting into your week so far?</h3>
        <p>Tell me what's clicking and what's still clunky — I'll tune what I suggest next. 90 seconds, promise.</p>
      </div>
      <button type="button" className="mw-checkin__btn" onClick={onStart}>
        Start check-in
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </section>
  )
}
