import { CoachAvatar } from './CoachAvatar'

interface CoachFabProps {
  onClick: () => void
}

export function CoachFab({ onClick }: CoachFabProps) {
  return (
    <button
      type="button"
      className="mw-fab"
      onClick={onClick}
      aria-label="Chat with your AI coach"
    >
      <CoachAvatar size="md" />
      <div className="mw-fab__body">
        <div className="mw-fab__title">Ask your AI coach</div>
        <div className="mw-fab__sub">Always here when you need a nudge</div>
      </div>
    </button>
  )
}
