import { SkillTag } from '@tonyh-2-eightfold/ef-design-system'
import type { Task } from '../../data/myWorkData'

interface TaskRowProps {
  task: Task
  editMode: boolean
  onClick: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

const ADOPTION_LABELS: Record<string, string> = {
  'manual':      'Manual',
  'ai-assisted': 'AI-assisted',
  'mostly-ai':   'Mostly AI',
}

export function TaskRow({ task, editMode, onClick, onEdit, onDelete }: TaskRowProps) {
  if (!task?.icon) return null
  return (
    <div className="t-row" onClick={() => { if (!editMode) onClick() }}>
      <div className="t-icon" aria-hidden>
        <span className="material-symbols-outlined">{task.icon}</span>
      </div>
      <div className="t-main">
        <div className="t-name">{task.name}</div>
        <div className="t-skills">
          {task.skills.map(([name]) => (
            <SkillTag key={name}>{name}</SkillTag>
          ))}
        </div>
      </div>
      <div className="t-note">
        <span className="t-hours">
          {task.hours === 1 ? '1 hr / week' : `${task.hours} hrs / week`}
        </span>
        {!editMode && task.cat === 'help' && task.aiAdoption && (
          <span className={`t-tag ${task.aiAdoption}`}>
            {ADOPTION_LABELS[task.aiAdoption]}
          </span>
        )}
        {editMode && (
          <div className="t-row-actions">
            <button type="button" className="t-row-btn" onClick={onEdit} aria-label="Edit">
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button type="button" className="t-row-btn delete" onClick={onDelete} aria-label="Delete">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
