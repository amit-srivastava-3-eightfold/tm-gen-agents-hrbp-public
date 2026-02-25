import './OpenTo.css'

export type OpenToItem = 'coffee' | 'mentoring' | 'project'

interface OpenToProps {
  items: OpenToItem[]
  showLabel?: boolean
  /** When true, label is a button (select style). When false, label is plain text. */
  labelAsButton?: boolean
  className?: string
}

const OPEN_TO_CONFIG: Record<OpenToItem, { icon: string; title: string }> = {
  coffee: { icon: 'local_cafe', title: 'Coffee chat' },
  mentoring: { icon: 'group', title: 'Mentoring' },
  project: { icon: 'bar_chart', title: 'Project' },
}

export function OpenTo({ items, showLabel = true, labelAsButton = true, className = '' }: OpenToProps) {
  return (
    <div className={`open-to ${className}`.trim()}>
      {showLabel && (
        labelAsButton ? (
          <button type="button" className="open-to__select" aria-haspopup="listbox" aria-expanded={false}>
            <span className="open-to__label">Open to</span>
            <span className="material-symbols-outlined open-to__chevron" aria-hidden>expand_more</span>
          </button>
        ) : (
          <span className="open-to__label open-to__label--plain">Open to</span>
        )
      )}
      <div className="open-to__icons">
        {items.map((item) => {
          const { icon, title } = OPEN_TO_CONFIG[item]
          return (
            <span
              key={item}
              className={`open-to__icon open-to__icon--${item}`}
              title={title}
              aria-hidden
            >
              <span className="material-symbols-outlined open-to__icon-symbol">{icon}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
