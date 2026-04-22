import { useEffect } from 'react'
import type { Task } from '../../data/myWorkData'

interface Props {
  task: Task | null
  onClose: () => void
  onCreatePlan: () => void
}

export function TaskDetailDrawer({ task, onClose, onCreatePlan }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && task) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [task, onClose])

  const open = !!task

  return (
    <div className={`task-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="td-backdrop" onClick={onClose} />
      <aside className="td-panel" role="dialog" aria-modal="true" aria-labelledby="td-title">
        {task && (
          <>
            <div className="td-head">
              <div className={`td-head-icon ${task.cat}`}>
                <span className="material-symbols-outlined">{task.icon}</span>
              </div>
              <div className="td-head-body">
                <div className="td-title" id="td-title">{task.name}</div>
                <div className="td-sub">
                  <span>{task.hours === 1 ? '1 hr / week' : `${task.hours} hrs / week`}</span>
                  <span className="dot" />
                  <span>{task.category}</span>
                </div>
              </div>
              <button type="button" className="td-close" onClick={onClose} aria-label="Close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="td-body">
              {task.banner && (
                <div className={`td-banner ${task.cat}`}>
                  <span className="material-symbols-outlined">{task.banner.icon}</span>
                  <div
                    className="td-banner-text"
                    dangerouslySetInnerHTML={{ __html: task.banner.text }}
                  />
                </div>
              )}

              {task.desc && (
                <div className="td-section">
                  <div className="td-section-label">What this is</div>
                  <div className="td-desc">{task.desc}</div>
                </div>
              )}

              {task.tools && task.tools.length > 0 && (
                <div className="td-section">
                  <div className="td-section-label">Tools you'd use</div>
                  <div className="td-tools">
                    {task.tools.map(tool => (
                      <div key={tool.name} className="td-tool">
                        <div className="td-tool-icon">{tool.letter}</div>
                        <div className="td-tool-name">{tool.name}</div>
                        {tool.use && <div className="td-tool-use">{tool.use}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.skills.length > 0 && (
                <div className="td-section">
                  <div className="td-section-label">Skills this grows</div>
                  <div className="td-skill-grid">
                    {task.skills.map(([name, match]) => (
                      <span key={name} className={`t-skill${match === 'match' ? ' match' : ''}`}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="td-footer">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn-primary" onClick={onCreatePlan}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span>
                Create a dev plan
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
