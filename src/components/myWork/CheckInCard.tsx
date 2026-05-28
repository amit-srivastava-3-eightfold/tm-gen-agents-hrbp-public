import { CoachAvatar } from './CoachAvatar'

interface CheckInCardProps {
  onStart: () => void
}

export function CheckInCard({ onStart }: CheckInCardProps) {
  return (
    <section className="checkin">
      <CoachAvatar size="lg" />
      <div className="c-body">
        <div className="coach-label">
          <span className="dot" aria-hidden />
          CAREER COACH
        </div>
        <h3>How's AI fitting into your week so far?</h3>
        <p>Tell me what's clicking and what's still clunky — I'll tune what I suggest next. 90 seconds, promise.</p>
      </div>
      <div className="checkin-buttons">
        <button type="button" onClick={onStart}>
          Start check-in
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </section>
  )
}
