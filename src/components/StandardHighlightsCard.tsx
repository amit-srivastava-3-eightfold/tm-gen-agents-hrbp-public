import './StandardHighlightsCard.css'

interface StandardHighlightsCardProps {
  title?: string
  items?: string[]
}

const DEFAULT_ITEMS = [
  'Led 12 enterprise POCs last quarter',
  'Top performer in Q3 solutions delivery',
  'Mentored 3 new team members',
]

export function StandardHighlightsCard({
  title = 'Highlights',
  items = DEFAULT_ITEMS,
}: StandardHighlightsCardProps) {
  return (
    <div className="standard-highlights-card">
      <h3 className="standard-highlights-card__title">{title}</h3>
      <ul className="standard-highlights-card__list">
        {items.map((text, i) => (
          <li key={i} className="standard-highlights-card__item">
            <span className="material-symbols-outlined standard-highlights-card__icon">work</span>
            <span className="standard-highlights-card__text">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
