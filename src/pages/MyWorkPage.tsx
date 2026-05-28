import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { NavbarApp } from '../components/Navbar'
import { ProductBackground, Header, HeaderToolbar, HeaderTextGroup, HeaderTitle } from '@tonyh-2-eightfold/ef-design-system'
import {
  COACH_PICK,
  INITIAL_TASKS, TASKS_STORAGE_KEY,
  type Task, type TaskCat,
} from '../data/myWorkData'
import { CoachPickCard } from '../components/myWork/CoachPickCard'
import { TaskRow } from '../components/myWork/TaskRow'
import { CheckInCard } from '../components/myWork/CheckInCard'
import { CoachDrawer, type CoachDrawerView } from '../components/myWork/CoachDrawer'
import { CoachSessionPanel } from '../components/myWork/CoachSessionPanel'
import { TaskDetailDrawer } from '../components/myWork/TaskDetailDrawer'
import { TaskFormDrawer } from '../components/myWork/TaskFormDrawer'
import '../components/myWork/myWork.css'
import './MyWorkPage.css'

const TASK_CATS: { kind: TaskCat; icon: string; title: string; desc: string }[] = [
  { kind: 'help', icon: 'auto_awesome', title: 'AI can help here', desc: "You're in the driver's seat — AI just takes a pass first." },
  { kind: 'you', icon: 'favorite', title: 'This is all you', desc: 'The work only you can do. Protect this time.' },
  { kind: 'off', icon: 'bolt', title: "Let's take these off your plate", desc: 'These can run on their own — chat with your manager about automating them.' },
]

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(t => t && typeof t.id === 'string' && typeof t.icon === 'string')) return parsed
    }
  } catch {}
  return JSON.parse(JSON.stringify(INITIAL_TASKS))
}

function saveTasks(tasks: Task[]) {
  try { localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks)) } catch {}
}

export function MyWorkPage() {
  const { currentUser } = useUser()
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [editMode, setEditMode] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formEditingId, setFormEditingId] = useState<string | null>(null)
  const [formDefaultCat, setFormDefaultCat] = useState<TaskCat>('help')
  const [drawerView, setDrawerView] = useState<CoachDrawerView>(null)
  const [sessionOpen, setSessionOpen] = useState(false)
  const [promptInput, setPromptInput] = useState('')
  const [coachingTask, setCoachingTask] = useState<Task | null>(null)

  useEffect(() => { localStorage.removeItem('tm:my-work-tasks-v1') }, [])

  if (currentUser.id !== 'csm') {
    return <Navigate to="/" replace />
  }

  const firstName = currentUser.name.split(' ')[0]
  const selectedTask = selectedTaskId ? (tasks.find(t => t.id === selectedTaskId) ?? null) : null
  const editingTask = formEditingId ? (tasks.find(t => t.id === formEditingId) ?? null) : null

  function openForm(id: string | null, cat: TaskCat) {
    setFormEditingId(id)
    setFormDefaultCat(cat)
    setFormOpen(true)
  }

  function handleSaveTask(updated: Task) {
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === updated.id)
      const next = idx >= 0
        ? prev.map((t, i) => i === idx ? updated : t)
        : [...prev, updated]
      saveTasks(next)
      return next
    })
  }

  function handleDeleteTask(id: string) {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id)
      saveTasks(next)
      return next
    })
  }

  return (
    <div className="my-work-page">
      <NavbarApp />
      <ProductBackground className="my-work-page__bg" variant="career-hub" chevronsVariant="default">
        <Header variant="career-hub" chSize="parent" overlayBackground>
          <HeaderToolbar>
            <HeaderTextGroup>
              <HeaderTitle>My work</HeaderTitle>
            </HeaderTextGroup>
          </HeaderToolbar>
        </Header>
      </ProductBackground>
      <main className="my-work-page__main">
        <div className="my-work-page__wrap">
          <CoachPickCard
            pick={COACH_PICK}
            firstName={firstName}
            onStart={() => setSessionOpen(true)}
          />

          {/* AI prompt card */}
          <div style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: 14, padding: '24px 28px', marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#6366f1' }}>auto_awesome</span>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'var(--font-family)' }}>How can I do my job better?</h2>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px', fontFamily: 'var(--font-family)' }}>Ask anything about your role, tasks, or growth.</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && promptInput.trim()) { setDrawerView('chat') } }}
                placeholder="Ask anything…"
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'var(--font-family)', color: '#1e293b', background: '#fafafa' }}
              />
              <button
                type="button"
                disabled={!promptInput.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 8, border: 'none', background: promptInput.trim() ? '#6366f1' : '#e2e8f0', color: promptInput.trim() ? '#fff' : '#94a3b8', cursor: promptInput.trim() ? 'pointer' : 'default', transition: 'all 0.15s', flexShrink: 0 }}
                onClick={() => { if (promptInput.trim()) setDrawerView('chat') }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                'Help me prep for my architecture review',
                'Draft a stakeholder update',
                'What skills should I grow next?',
                'How can AI help with PR reviews?',
                'Summarize my experiment notes',
              ].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPromptInput(p); setDrawerView('chat') }}
                  style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid #e2e8f0', background: promptInput === p ? '#eef2ff' : '#f8fafc', color: promptInput === p ? '#4338ca' : '#475569', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-family)', transition: 'all 0.15s' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className={`list-card${editMode ? ' editing' : ''}`}>
            <div className="list-head">
              <div>
                <h2>My work tasks</h2>
                <p>
                  The recurring things that fill your time, the skills they use, and how you're tackling each one today — manually, with AI's help, or mostly AI.
                </p>
              </div>
              <div className="list-head-actions">
                <button
                  type="button"
                  className={editMode ? 'btn-primary' : 'btn-ghost'}
                  onClick={() => setEditMode(m => !m)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {editMode ? 'check' : 'edit'}
                  </span>
                  {editMode ? 'Done' : 'Edit list'}
                </button>
              </div>
            </div>

            {TASK_CATS.map(cat => (
              <div key={cat.kind} className={`list-group ${cat.kind}`}>
                <div className="list-group-head">
                  <div className="g-icon" aria-hidden>
                    <span className="material-symbols-outlined">{cat.icon}</span>
                  </div>
                  <div>
                    <div className="g-title">{cat.title}</div>
                    <div className="g-desc">{cat.desc}</div>
                  </div>
                </div>
                <div className="t-grid">
                  {tasks.filter(t => t.cat === cat.kind).map(task => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      editMode={editMode}
                      onClick={() => setSelectedTaskId(task.id)}
                      onEdit={(e) => { e.stopPropagation(); openForm(task.id, task.cat) }}
                      onDelete={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`Remove "${task.name}" from your list?`)) {
                          handleDeleteTask(task.id)
                        }
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    className="add-task-card"
                    onClick={() => openForm(null, cat.kind)}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add a task to this group
                  </button>
                </div>
              </div>
            ))}
          </div>

          <CheckInCard onStart={() => setDrawerView('checkin')} />

          <div className="quiet">
            Task list is based on your role. <a href="#" onClick={(e) => e.preventDefault()}>What's this?</a>
          </div>
        </div>
      </main>

      <CoachDrawer
        view={drawerView}
        firstName={firstName}
        initialPrompt={drawerView === 'chat' && !coachingTask ? promptInput : undefined}
        coachingTaskId={coachingTask?.id}
        coachingTaskName={coachingTask?.name}
        onClose={() => { setDrawerView(null); setPromptInput(''); setCoachingTask(null) }}
      />
      <CoachSessionPanel
        open={sessionOpen}
        onClose={() => setSessionOpen(false)}
        sessionTitle={COACH_PICK.headline}
        sessionDesc={COACH_PICK.desc}
      />
      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onStartCoaching={(task) => {
          setSelectedTaskId(null)
          setCoachingTask(task)
          setDrawerView('chat')
        }}
      />
      <TaskFormDrawer
        open={formOpen}
        editingTask={editingTask}
        defaultCat={formDefaultCat}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onClose={() => { setFormOpen(false); setFormEditingId(null) }}
      />
    </div>
  )
}
