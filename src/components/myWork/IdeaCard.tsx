import type { Idea } from '../../data/myWorkData'

const COLOR_CLASS: Record<string, string> = { lavender: 'c1', sage: 'c2', peach: 'c3' }

interface IdeaCardProps {
  idea: Idea
  onCtaClick?: (idea: Idea) => void
}

export function IdeaCard({ idea, onCtaClick }: IdeaCardProps) {
  return (
    <article className={`idea ${COLOR_CLASS[idea.color] ?? 'c1'}`}>
      <div className="icon-wrap" aria-hidden>
        <span className="material-symbols-outlined">{idea.icon}</span>
      </div>
      <h3>{idea.title}</h3>
      <p>{idea.body}</p>
      <button type="button" className="foot" onClick={() => onCtaClick?.(idea)}>
        {idea.ctaLabel} <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </article>
  )
}
