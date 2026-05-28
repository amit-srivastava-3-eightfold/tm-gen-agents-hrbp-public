import { useEffect } from 'react'
import { SkillTag } from '@tonyh-2-eightfold/ef-design-system'
import { TASK_TIPS, TASK_AI_ANALYSIS } from '../../data/myWorkData'
import type { Task } from '../../data/myWorkData'

interface Props {
  task: Task | null
  onClose: () => void
  onStartCoaching: (task: Task) => void
}

const TIP_SECTION_LABEL: Record<string, string> = {
  help: 'How to use AI here',
  you:  'How to do this well',
  off:  'How to automate this',
}

export function TaskDetailDrawer({ task, onClose, onStartCoaching }: Props) {
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

              {TASK_AI_ANALYSIS[task.id] && (() => {
                const { aiCaps, humanEdge } = TASK_AI_ANALYSIS[task.id]
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#2563eb', fontWeight: 700, fontSize: 11.5, marginBottom: 7 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                        AI Capabilities
                      </div>
                      {aiCaps.map(c => (
                        <div key={c} style={{ fontSize: 12.5, color: '#1e40af', lineHeight: 1.5 }}>· {c}</div>
                      ))}
                    </div>
                    <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#b45309', fontWeight: 700, fontSize: 11.5, marginBottom: 7 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>person</span>
                        Human Strengths
                      </div>
                      {humanEdge.map(h => (
                        <div key={h} style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.5 }}>· {h}</div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {TASK_TIPS[task.id] && (
                <div className="td-section">
                  <div className="td-section-label">{TIP_SECTION_LABEL[task.cat] ?? 'Ways to improve'}</div>
                  <div className="td-tips">
                    {TASK_TIPS[task.id].map((tip, i) => (
                      <div key={i} className="td-tip">
                        <span className="td-tip-num">{i + 1}</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
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
                    {task.skills.map(([name]) => (
                      <SkillTag key={name}>{name}</SkillTag>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="td-footer">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => onStartCoaching(task)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Start coaching session
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
