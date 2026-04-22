import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { NavbarApp } from '../components/Navbar'
import { ProductBackground, Header, HeaderToolbar, HeaderTextGroup, HeaderTitle } from '@tonyh-2-eightfold/ef-design-system'
import {
  COACH_PICK, IDEAS,
  INITIAL_TASKS, TASKS_STORAGE_KEY,
  type Task, type TaskCat,
} from '../data/myWorkData'
import { CoachPickCard } from '../components/myWork/CoachPickCard'
import { IdeaCard } from '../components/myWork/IdeaCard'
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
      <ProductBackground className="my-work-page__bg" variant="career-hub" wavesVariant="default">
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

          <div className="section-head">
            <div>
              <h2 className="section-title">A few more ideas for your week</h2>
              <p className="section-sub">Small experiments. No pressure.</p>
            </div>
            <button type="button" className="btn-ghost">
              See all <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div className="ideas">
            {IDEAS.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onCtaClick={(i) => {
                  if (i.ctaAction === 'open-coach-chat') setDrawerView('chat')
                }}
              />
            ))}
          </div>

          <div className={`list-card${editMode ? ' editing' : ''}`}>
            <div className="list-head">
              <div>
                <h2>Your work this week</h2>
                <p>
                  The recurring things that fill your time, the skills they stretch, and a gentle read on where AI fits.{' '}
                  <span className="list-blue">Blue</span> skills are ones your role is growing.
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
        onClose={() => setDrawerView(null)}
      />
      <CoachSessionPanel open={sessionOpen} onClose={() => setSessionOpen(false)} />
      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onCreatePlan={() => {
          setSelectedTaskId(null)
          setDrawerView('pr')
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
