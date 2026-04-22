import type { TaskRowData } from '../../data/myWorkData'

interface TaskRowProps {
  row: TaskRowData
}

const STATUS_LABELS: Record<'try' | 'using', string> = {
  try: 'try this',
  using: 'already doing it',
}

export function TaskRow({ row }: TaskRowProps) {
  return (
    <div className="mw-row">
      <div className="mw-row__icon" aria-hidden>
        <span className="material-symbols-outlined">{row.icon}</span>
      </div>
      <div className="mw-row__main">
        <div className="mw-row__name">{row.name}</div>
        <div className="mw-row__skills">
          {row.skills.map((skill) => (
            <span
              key={skill.name}
              className={`mw-skill${skill.variant === 'match' ? ' mw-skill--match' : ''}`}
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>
      <div className="mw-row__hours">{row.hoursPerWeek} hrs / week</div>
      {row.status ? (
        <span className={`mw-tag mw-tag--${row.status}`}>{STATUS_LABELS[row.status]}</span>
      ) : null}
    </div>
  )
}
