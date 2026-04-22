import type { Idea } from '../../data/myWorkData'

interface IdeaCardProps {
  idea: Idea
  onCtaClick?: (idea: Idea) => void
}

export function IdeaCard({ idea, onCtaClick }: IdeaCardProps) {
  return (
    <article className={`mw-idea mw-idea--${idea.color}`}>
      <div className="mw-idea__icon" aria-hidden>
        <span className="material-symbols-outlined">{idea.icon}</span>
      </div>
      <h3 className="mw-idea__title">{idea.title}</h3>
      <p className="mw-idea__body">{idea.body}</p>
      <button
        type="button"
        className="mw-idea__cta"
        onClick={() => onCtaClick?.(idea)}
      >
        {idea.ctaLabel} <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </article>
  )
}
