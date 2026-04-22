import { useState, useEffect, useRef } from 'react'
import type { Task, TaskCat, TaskTool } from '../../data/myWorkData'

interface Props {
  open: boolean
  editingTask: Task | null
  defaultCat?: TaskCat
  onSave: (task: Task) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

function iconForCat(cat: TaskCat): string {
  if (cat === 'help') return 'auto_awesome'
  if (cat === 'you') return 'favorite'
  return 'bolt'
}

function defaultBanner(cat: TaskCat): { icon: string; text: string } {
  if (cat === 'help') return { icon: 'auto_awesome', text: "<b>AI can help here.</b> Small experiment — try giving an AI tool a pass at this and see what's useful." }
  if (cat === 'you') return { icon: 'favorite', text: '<b>This is all you.</b> The work only you can do — protect this time.' }
  return { icon: 'bolt', text: '<b>Take this off your plate.</b> This is a candidate for automation — chat with your manager.' }
}

export function TaskFormDrawer({ open, editingTask, defaultCat = 'help', onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState('')
  const [hours, setHours] = useState('')
  const [cat, setCat] = useState<TaskCat>('help')
  const [desc, setDesc] = useState('')
  const [skillChips, setSkillChips] = useState<string[]>([])
  const [toolChips, setToolChips] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [toolInput, setToolInput] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (editingTask) {
      setName(editingTask.name)
      setHours(editingTask.hours > 0 ? String(editingTask.hours) : '')
      setCat(editingTask.cat)
      setDesc(editingTask.desc || '')
      setSkillChips(editingTask.skills.map(([s]) => s))
      setToolChips((editingTask.tools || []).map(t => t.name))
    } else {
      setName('')
      setHours('')
      setCat(defaultCat)
      setDesc('')
      setSkillChips([])
      setToolChips([])
    }
    setSkillInput('')
    setToolInput('')
    setTimeout(() => nameRef.current?.focus(), 280)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = skillInput.trim()
      if (val && !skillChips.includes(val)) setSkillChips(prev => [...prev, val])
      setSkillInput('')
    } else if (e.key === 'Backspace' && !skillInput && skillChips.length > 0) {
      setSkillChips(prev => prev.slice(0, -1))
    }
  }

  function handleToolKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = toolInput.trim()
      if (val && !toolChips.includes(val)) setToolChips(prev => [...prev, val])
      setToolInput('')
    } else if (e.key === 'Backspace' && !toolInput && toolChips.length > 0) {
      setToolChips(prev => prev.slice(0, -1))
    }
  }

  function handleSave() {
    if (!name.trim()) { nameRef.current?.focus(); return }
    const task: Task = {
      id: editingTask?.id ?? `user-${Date.now()}`,
      cat,
      name: name.trim(),
      icon: editingTask?.icon ?? iconForCat(cat),
      hours: parseFloat(hours) || 0,
      category: editingTask?.category ?? 'Added by you',
      desc: desc.trim() || undefined,
      skills: skillChips.map(s => [s, ''] as [string, '' | 'match']),
      tools: toolChips.map(n => ({ letter: n[0]?.toUpperCase() ?? '?', name: n, use: '' } as TaskTool)),
      banner: editingTask?.banner ?? defaultBanner(cat),
      tag: editingTask?.tag,
    }
    onSave(task)
    onClose()
  }

  function handleDelete() {
    if (!editingTask || !onDelete) return
    if (!window.confirm(`Remove "${editingTask.name}" from your list?`)) return
    onDelete(editingTask.id)
    onClose()
  }

  const isEditing = !!editingTask

  return (
    <div className={`form-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="td-backdrop" onClick={onClose} />
      <aside className="form-panel" role="dialog" aria-modal="true">
        <div className="td-head">
          <div className={`td-head-icon ${cat}`}>
            <span className="material-symbols-outlined">add_task</span>
          </div>
          <div className="td-head-body">
            <div className="td-title">{isEditing ? 'Edit task' : 'Add a task'}</div>
            <div className="td-sub">
              {isEditing ? 'Make changes and save.' : "Type a task name and I'll fill in the rest — you can tweak anything."}
            </div>
          </div>
          <button type="button" className="td-close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="form-body">
          <div className="form-row">
            <label htmlFor="f-name">Task name</label>
            <input
              ref={nameRef}
              id="f-name"
              type="text"
              placeholder="e.g. Weekly eval triage"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {!isEditing && (
              <button type="button" className="ai-fill-btn">
                <span className="material-symbols-outlined">auto_awesome</span>
                Fill in the rest for me
              </button>
            )}
          </div>

          <div className="form-row-inline">
            <div className="form-row">
              <label htmlFor="f-hours">Hours per week</label>
              <input
                id="f-hours"
                type="number"
                min="0"
                max="40"
                step="0.5"
                placeholder="3"
                value={hours}
                onChange={e => setHours(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="f-cat">Category</label>
              <select id="f-cat" value={cat} onChange={e => setCat(e.target.value as TaskCat)}>
                <option value="help">AI can help</option>
                <option value="you">This is all you</option>
                <option value="off">Off your plate</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="f-desc">What this is</label>
            <textarea
              id="f-desc"
              placeholder="A sentence or two about what the work involves."
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Skills this grows</label>
            <div className="chip-input">
              {skillChips.map(chip => (
                <span key={chip} className="ci-chip">
                  {chip}
                  <button
                    type="button"
                    aria-label={`Remove ${chip}`}
                    onClick={() => setSkillChips(prev => prev.filter(s => s !== chip))}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={skillChips.length === 0 ? 'Type a skill and press Enter' : ''}
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
            </div>
            <span className="form-hint">Press Enter to add each skill</span>
          </div>

          <div className="form-row">
            <label>Tools you'd use</label>
            <div className="chip-input">
              {toolChips.map(chip => (
                <span key={chip} className="ci-chip">
                  {chip}
                  <button
                    type="button"
                    aria-label={`Remove ${chip}`}
                    onClick={() => setToolChips(prev => prev.filter(t => t !== chip))}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={toolChips.length === 0 ? 'e.g. Claude, Cursor, W&B' : ''}
                value={toolInput}
                onChange={e => setToolInput(e.target.value)}
                onKeyDown={handleToolKeyDown}
              />
            </div>
          </div>
        </div>

        <div className="td-footer">
          {isEditing && onDelete && (
            <button type="button" className="btn-ghost" style={{ color: '#c44' }} onClick={handleDelete}>
              Delete task
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>
            <span className="material-symbols-outlined">check</span>
            {isEditing ? 'Save changes' : 'Add task'}
          </button>
        </div>
      </aside>
    </div>
  )
}
