import { useState } from 'react'
import { Tag } from '@tonyh-2-eightfold/ef-design-system'
import { WfrTaskSheetBody, type DemoPhase } from '../components/workforceReadiness/WfrTaskSheetBody'
import { ManagerEmployeeTaskView } from '../components/workforceReadiness/ManagerEmployeeTaskView'
import { TaskSheetBodyTabs } from '../components/workforceReadiness/TaskSheetBodyTabs'
import { getTasksForRole } from '../data/wfrOrgData'
import { useEmployeeTaskState } from '../hooks/useEmployeeTaskState'
import {
  submitPendingChanges,
  withdrawPendingChanges,
} from '../data/employeeTaskState'
import '../components/workforceReadiness/WorkforceReadinessDashboard.css'

const ROLE = { title: 'Software Engineer', dept: 'Engineering' }
const DEMO_EMPLOYEE = 'Alex Chen'

const PHASE_LABELS: Record<DemoPhase, string> = {
  baseline: 'Baseline estimate',
  calibrated: 'Post-calibration',
  upskilled: 'Post-upskilling',
}

export default function WfrTaskSheetPage() {
  const [phase, setPhase] = useState<DemoPhase>('baseline')
  const [variant, setVariant] = useState<'role' | 'employee' | 'manager' | 'admin'>('role')
  const [compareMode, setCompareMode] = useState(false)
  const [mgrDemoCompareMode, setMgrDemoCompareMode] = useState(false)

  // ── Employee: persisted state (approved + pending, shared with manager) ──
  const employeeState = useEmployeeTaskState(DEMO_EMPLOYEE)
  const empApprovedAdded = employeeState.approved.added
  const empApprovedRemoved = new Set(employeeState.approved.removed)
  const empPending = employeeState.pending
  const empPendingAdded = empPending?.added ?? []
  const empPendingRemoved = new Set(empPending?.removed ?? [])
  // Employee: edit state
  const [empEditing, setEmpEditing] = useState(false)
  // Employee: draft state (cancelable, lives only during an edit session)
  const [empDraftAdded, setEmpDraftAdded] = useState<{ task: string; score: number; description?: string }[]>([])
  const [empDraftRemoved, setEmpDraftRemoved] = useState<Set<string>>(new Set())
  // Employee: quick-restored tasks in compare mode (not yet submitted)
  const [empDraftRestored, setEmpDraftRestored] = useState<Set<string>>(new Set())
  // Employee: AI add-task panel
  const [empTaskAddOpen, setEmpTaskAddOpen] = useState(false)
  const [empTaskAddStep, setEmpTaskAddStep] = useState<'describe' | 'generating' | 'suggested'>('describe')
  const [empTaskDescription, setEmpTaskDescription] = useState('')
  const [empTaskTitle, setEmpTaskTitle] = useState('')
  const [empTaskDescSuggestion, setEmpTaskDescSuggestion] = useState('')
  const [empTaskScore, setEmpTaskScore] = useState(45)
  const [empTaskSkills, setEmpTaskSkills] = useState<string[]>([])
  const [empSkillInput, setEmpSkillInput] = useState('')
  const [empSkillInputOpen, setEmpSkillInputOpen] = useState(false)
  const [empToast, setEmpToast] = useState<{ msg: string; prevAdded: { task: string; score: number; description?: string }[]; prevRemoved: Set<string> } | null>(null)

  // ── Admin: committed state ───────────────────────────────────────────────
  const [adminEditing, setAdminEditing] = useState(false)
  const [adminAdded, setAdminAdded] = useState<{ task: string; score: number; description?: string }[]>([])
  const [adminRemoved, setAdminRemoved] = useState<Set<string>>(new Set())
  // Admin: draft state
  const [draftAdded, setDraftAdded] = useState<{ task: string; score: number; description?: string }[]>([])
  const [draftRemoved, setDraftRemoved] = useState<Set<string>>(new Set())
  // Admin: AI add-task panel
  const [adminTaskAddOpen, setAdminTaskAddOpen] = useState(false)
  const [adminTaskAddStep, setAdminTaskAddStep] = useState<'describe' | 'generating' | 'suggested'>('describe')
  const [adminTaskDescription, setAdminTaskDescription] = useState('')
  const [adminTaskTitle, setAdminTaskTitle] = useState('')
  const [adminTaskDescSuggestion, setAdminTaskDescSuggestion] = useState('')
  const [adminTaskScore, setAdminTaskScore] = useState(45)
  const [adminTaskSkills, setAdminTaskSkills] = useState<string[]>([])
  const [adminSkillInput, setAdminSkillInput] = useState('')
  const [adminSkillInputOpen, setAdminSkillInputOpen] = useState(false)
  const [adminToast, setAdminToast] = useState<{ msg: string; prevAdded: { task: string; score: number }[]; prevRemoved: Set<string> } | null>(null)

  // ── Manager: direct edit state ────────────────────────────────────────────
  const [mgrEditing, setMgrEditing] = useState(false)
  const [mgrEmpAdded, setMgrEmpAdded] = useState<{ task: string; score: number; description?: string }[]>([])
  const [mgrEmpRemoved, setMgrEmpRemoved] = useState<Set<string>>(new Set())
  // Manager: quick-restored tasks in compare mode (not yet committed)
  const [mgrEmpRestored, setMgrEmpRestored] = useState<Set<string>>(new Set())
  // Manager: draft state (cancelable, lives only during an edit session)
  const [mgrDraftAdded, setMgrDraftAdded] = useState<{ task: string; score: number; description?: string }[]>([])
  const [mgrDraftRemoved, setMgrDraftRemoved] = useState<Set<string>>(new Set())
  // Manager: AI add-task panel
  const [mgrTaskAddOpen, setMgrTaskAddOpen] = useState(false)
  const [mgrTaskAddStep, setMgrTaskAddStep] = useState<'describe' | 'generating' | 'suggested'>('describe')
  const [mgrTaskDescription, setMgrTaskDescription] = useState('')
  const [mgrTaskTitle, setMgrTaskTitle] = useState('')
  const [mgrTaskDescSuggestion, setMgrTaskDescSuggestion] = useState('')
  const [mgrTaskScore, setMgrTaskScore] = useState(45)
  const [mgrTaskSkills, setMgrTaskSkills] = useState<string[]>([])
  const [mgrSkillInput, setMgrSkillInput] = useState('')
  const [mgrSkillInputOpen, setMgrSkillInputOpen] = useState(false)
  const [mgrToast, setMgrToast] = useState<{ msg: string; prevAdded: { task: string; score: number; description?: string }[]; prevRemoved: Set<string> } | null>(null)

  const [bodyTab, setBodyTab] = useState<'all' | 'classification' | 'source'>('classification')
  const [demoOpen, setDemoOpen] = useState(true)

  const roleTasks = getTasksForRole(ROLE.title)

  // Employee view: tasks currently shown to the employee, layered as
  //   role base − approved.removed − pending.removed − draft.removed
  //   + approved.added + pending.added + draft.added (deduped by task name)
  const empAllRemoved = new Set<string>([...empApprovedRemoved, ...empPendingRemoved, ...empDraftRemoved])
  const empAllAddedNames = new Set<string>([
    ...empApprovedAdded.map(t => t.task),
    ...empPendingAdded.map(t => t.task),
    ...empDraftAdded.map(t => t.task),
  ])
  const empEffectiveCount =
    roleTasks.filter(t => !empAllRemoved.has(t.task)).length +
    empAllAddedNames.size

  // ── Shared AI suggestion helper ──────────────────────────────────────────
  function computeAISuggestion(description: string): { title: string; score: number; desc: string } {
    const lower = description.toLowerCase()

    const highAI = ['automat', 'generat', 'schedul', 'extract', 'parse', 'format', 'convert', 'process', 'log', 'notif', 'sync', 'fetch', 'export', 'compil']
    const lowAI = ['mentor', 'negotiat', 'mediating', 'trust', 'relationship', 'judgment', 'strateg', 'decision', 'counsel', 'facilitat', 'lead', 'vision', 'inspir']
    const hasHigh = highAI.some(k => lower.includes(k))
    const hasLow = lowAI.some(k => lower.includes(k))
    const score = hasHigh && !hasLow ? Math.floor(62 + Math.random() * 13) : hasLow && !hasHigh ? Math.floor(18 + Math.random() * 18) : Math.floor(38 + Math.random() * 22)

    const actionPatterns: [RegExp, string, number][] = [
      [/\bpull\s*request|\bprs?\b|\bpr\b/, 'PR Review', 10],
      [/\bcode\s+review/, 'Code Review', 10],
      [/\bquality\s+assurance|\bqa\b/, 'Quality Assurance', 9],
      [/\bunit\s+test|integration\s+test/, 'Test Authoring', 9],
      [/\bonboard/, 'Onboarding', 8],
      [/\bapprov/, 'Approval', 7],
      [/\breview|audit|inspect/, 'Review', 6],
      [/\banalyz|analysis|analytics/, 'Analysis', 6],
      [/\bmonitor|track(?:ing)?/, 'Monitoring', 6],
      [/\bdocument/, 'Documentation', 6],
      [/\btriag|prioriti/, 'Triage', 6],
      [/\bdeploy/, 'Deployment', 6],
      [/\bdebugg|troubleshoot/, 'Debugging', 6],
      [/\bschedul|coordinat/, 'Coordination', 5],
      [/\bforecast|predict/, 'Forecasting', 5],
      [/\bplan(?:ning)?/, 'Planning', 5],
      [/\btrain|coach/, 'Training', 5],
      [/\bautomati?on?\b|automat/, 'Automation', 5],
      [/\bresearch|investigat/, 'Research', 5],
      [/\breport(?:ing)?/, 'Reporting', 5],
      [/\bdevelop|build(?:ing)?/, 'Development', 4],
      [/\bdesign/, 'Design', 4],
      [/\btest(?:ing)?/, 'Testing', 4],
      [/\bmanag(?:e|ing)?/, 'Management', 3],
      [/\bimpleme?nt/, 'Implementation', 3],
      [/\bcreat/, 'Creation', 3],
    ]
    const subjectPatterns: [RegExp, string, number][] = [
      [/\bpull\s*request|\bprs?\b/, 'PR', 10],
      [/\bcode\b|\bcodebase|\brepo\b/, 'Code', 9],
      [/\bsprint\b|\bticket|\bstory\b|\bbacklog/, 'Sprint', 9],
      [/\bincident|\boutage|\bpostmortem/, 'Incident', 8],
      [/\bbug\b|\bdefect|\bcrash\b/, 'Bug', 8],
      [/\bcandidate|\brecruit|\bhiring|\bhire\b|\binterview/, 'Candidate', 8],
      [/\bsecurity|\bcompliance|\baudit\b|\brisk\b/, 'Compliance', 7],
      [/\bperformanc|\bmetric|\bkpi\b|\bokr\b/, 'Performance', 7],
      [/\bsales\b|\brevenue|\bpipeline|\bdeal\b/, 'Sales', 7],
      [/\bbudget|\bfinanc|\bcost\b|\bspend\b/, 'Budget', 7],
      [/\bstakeholder|\bexecutive|\bleadership/, 'Stakeholder', 6],
      [/\bvendor|\bsupplier|\bpartner\b/, 'Vendor', 6],
      [/\bemployee|\bstaff\b|\bonboarding|\btalent\b/, 'Employee', 6],
      [/\bproduct\b|\bfeature\b|\broadmap\b/, 'Product', 6],
      [/\bmarket(?:ing)?|\bcampaign\b/, 'Marketing', 6],
      [/\bcustomer|\bclient\b/, 'Client', 6],
      [/\bdata\b|\bdataset|\bdatabase/, 'Data', 5],
      [/\bcontent\b|\bcopy\b/, 'Content', 5],
      [/\bproject\b|\bmilestone\b/, 'Project', 5],
      [/\binfrastructure|\bsystem\b|\bplatform\b/, 'System', 5],
      [/\bprocess\b|\bworkflow|\bprocedure/, 'Process', 4],
      [/\btest\b|\btests\b/, 'Test', 4],
    ]

    let title = ''
    for (const [pat, label, weight] of actionPatterns) {
      if (weight >= 9 && pat.test(lower)) { title = label; break }
    }
    if (!title) {
      let action = ''; let actionWeight = 0
      let subject = ''; let subjectWeight = 0
      for (const [pat, label, weight] of actionPatterns) {
        if (weight > actionWeight && pat.test(lower)) { action = label; actionWeight = weight }
      }
      for (const [pat, label, weight] of subjectPatterns) {
        if (weight > subjectWeight && pat.test(lower)) { subject = label; subjectWeight = weight }
      }
      if (subject && action && subject.toLowerCase() !== action.toLowerCase()) title = `${subject} ${action}`
      else if (action) title = action
      else if (subject) title = `${subject} Management`
      else {
        const stop = new Set(['and','the','a','an','of','for','with','to','in','on','at','by','or','that','this','their','when','how','what','its','our','are','is'])
        const meaningful = description.trim().split(/\s+/).filter(w => !stop.has(w.toLowerCase()) && w.length > 2)
        title = meaningful.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      }
    }

    let desc = description.trim()
    if (!desc.endsWith('.') && !desc.endsWith('?') && !desc.endsWith('!')) desc += '.'
    desc = desc.charAt(0).toUpperCase() + desc.slice(1)

    return { title, score, desc }
  }

  // ── Employee functions ───────────────────────────────────────────────────
  function removeEmpTask(taskName: string) {
    setEmpDraftRemoved(prev => { const s = new Set(prev); s.has(taskName) ? s.delete(taskName) : s.add(taskName); return s })
  }
  function addEmpTask(taskName: string, score = 50, description?: string) {
    if (!taskName.trim()) return
    setEmpDraftAdded(prev => [...prev, { task: taskName.trim(), score, ...(description ? { description } : {}) }])
  }
  function resetEmpTaskAdd() {
    setEmpTaskAddOpen(false); setEmpTaskAddStep('describe')
    setEmpTaskDescription(''); setEmpTaskTitle(''); setEmpTaskDescSuggestion(''); setEmpTaskScore(45)
    setEmpTaskSkills([]); setEmpSkillInput(''); setEmpSkillInputOpen(false)
  }
  function generateEmpSuggestion() {
    if (!empTaskDescription.trim()) return
    setEmpTaskAddStep('generating')
    setTimeout(() => {
      const { title, score, desc } = computeAISuggestion(empTaskDescription)
      setEmpTaskTitle(title); setEmpTaskDescSuggestion(desc); setEmpTaskScore(score)
      const zone = score > 75 ? 'above' : score >= 15 ? 'augment' : 'below'
      setEmpTaskSkills(getSkillsForTask(title, zone))
      setEmpTaskAddStep('suggested')
    }, 1400)
  }
  function saveEmp() {
    // Layer drafts onto existing pending. Drafts that "remove" a previously
    // pending add just take it back out of pending (it never reached the manager).
    const startingAdded = [...empPendingAdded]
    const startingRemoved = new Set(empPendingRemoved)

    // Apply draft adds
    for (const t of empDraftAdded) {
      if (!startingAdded.some(a => a.task === t.task)) startingAdded.push(t)
      startingRemoved.delete(t.task) // un-removes
    }
    // Apply draft removes
    for (const name of empDraftRemoved) {
      const idx = startingAdded.findIndex(a => a.task === name)
      if (idx >= 0) {
        // Removing an item we hadn't yet submitted → just drop the pending add
        startingAdded.splice(idx, 1)
      } else if (!empApprovedRemoved.has(name)) {
        // Otherwise mark for removal (skip if manager has already approved the removal)
        startingRemoved.add(name)
      }
    }

    const removedCount = [...empDraftRemoved].filter(n => !empDraftAdded.some(t => t.task === n)).length
    const addedCount = empDraftAdded.filter(t => !empDraftRemoved.has(t.task)).length

    submitPendingChanges(DEMO_EMPLOYEE, { added: startingAdded, removed: [...startingRemoved] })
    setEmpDraftAdded([]); setEmpDraftRemoved(new Set())
    setEmpEditing(false); resetEmpTaskAdd()
    const parts = [removedCount > 0 ? `${removedCount} removed` : '', addedCount > 0 ? `${addedCount} added` : ''].filter(Boolean)
    setEmpToast({ msg: parts.length > 0 ? `Submitted for manager review — ${parts.join(', ')}` : 'No changes made', prevAdded: [], prevRemoved: new Set() })
  }
  function cancelEmp() {
    setEmpDraftAdded([]); setEmpDraftRemoved(new Set()); setEmpDraftRestored(new Set())
    setEmpEditing(false); resetEmpTaskAdd()
  }
  function withdrawEmpPending() {
    withdrawPendingChanges(DEMO_EMPLOYEE)
    setEmpToast({ msg: 'Pending changes withdrawn', prevAdded: [], prevRemoved: new Set() })
  }
  function revertEmp() {
    // Undo from toast is no longer meaningful with persisted pending state.
    setEmpToast(null)
  }

  // ── Admin functions ──────────────────────────────────────────────────────
  function removeAdminTask(taskName: string) {
    setDraftRemoved(prev => { const s = new Set(prev); s.has(taskName) ? s.delete(taskName) : s.add(taskName); return s })
  }
  function addAdminTask(taskName: string, score = 50, description?: string) {
    if (!taskName.trim()) return
    setDraftAdded(prev => [...prev, { task: taskName.trim(), score, ...(description ? { description } : {}) }])
  }
  function resetAdminTaskAdd() {
    setAdminTaskAddOpen(false); setAdminTaskAddStep('describe')
    setAdminTaskDescription(''); setAdminTaskTitle(''); setAdminTaskDescSuggestion(''); setAdminTaskScore(45)
    setAdminTaskSkills([]); setAdminSkillInput(''); setAdminSkillInputOpen(false)
  }
  function generateAISuggestion() {
    if (!adminTaskDescription.trim()) return
    setAdminTaskAddStep('generating')
    setTimeout(() => {
      const { title, score, desc } = computeAISuggestion(adminTaskDescription)
      setAdminTaskTitle(title); setAdminTaskDescSuggestion(desc); setAdminTaskScore(score)
      const zone = score > 75 ? 'above' : score >= 15 ? 'augment' : 'below'
      setAdminTaskSkills(getSkillsForTask(title, zone))
      setAdminTaskAddStep('suggested')
    }, 1400)
  }
  function saveAdmin() {
    const prevAdded = adminAdded; const prevRemoved = adminRemoved
    const removedCount = [...draftRemoved].filter(n => !draftAdded.some(t => t.task === n)).length
    const addedCount = draftAdded.filter(t => !draftRemoved.has(t.task)).length
    setAdminAdded(prev => [...prev, ...draftAdded.filter(t => !draftRemoved.has(t.task))])
    setAdminRemoved(prev => new Set([...prev, ...draftRemoved]))
    setDraftAdded([]); setDraftRemoved(new Set())
    setAdminEditing(false); resetAdminTaskAdd()
    const parts = [removedCount > 0 ? `${removedCount} removed` : '', addedCount > 0 ? `${addedCount} added` : ''].filter(Boolean)
    setAdminToast({ msg: parts.length > 0 ? `Role tasks updated — ${parts.join(', ')}` : 'No changes made', prevAdded, prevRemoved })
  }
  function cancelAdmin() {
    setDraftAdded([]); setDraftRemoved(new Set())
    setAdminEditing(false); resetAdminTaskAdd()
  }
  function revertAdmin() {
    if (!adminToast) return
    setAdminAdded(adminToast.prevAdded); setAdminRemoved(adminToast.prevRemoved)
    setAdminToast(null)
  }

  // ── Manager functions ────────────────────────────────────────────────────
  function removeMgrEmpTask(taskName: string) {
    setMgrDraftRemoved(prev => { const s = new Set(prev); s.has(taskName) ? s.delete(taskName) : s.add(taskName); return s })
  }
  function addMgrEmpTask(taskName: string, score = 50, description?: string) {
    if (!taskName.trim()) return
    setMgrDraftAdded(prev => [...prev, { task: taskName.trim(), score, ...(description ? { description } : {}) }])
  }
  function resetMgrTaskAdd() {
    setMgrTaskAddOpen(false); setMgrTaskAddStep('describe')
    setMgrTaskDescription(''); setMgrTaskTitle(''); setMgrTaskDescSuggestion(''); setMgrTaskScore(45)
    setMgrTaskSkills([]); setMgrSkillInput(''); setMgrSkillInputOpen(false)
  }
  function generateMgrSuggestion() {
    if (!mgrTaskDescription.trim()) return
    setMgrTaskAddStep('generating')
    setTimeout(() => {
      const { title, score, desc } = computeAISuggestion(mgrTaskDescription)
      setMgrTaskTitle(title); setMgrTaskDescSuggestion(desc); setMgrTaskScore(score)
      const zone = score > 75 ? 'above' : score >= 15 ? 'augment' : 'below'
      setMgrTaskSkills(getSkillsForTask(title, zone))
      setMgrTaskAddStep('suggested')
    }, 1400)
  }
  function saveMgr() {
    const prevAdded = mgrEmpAdded; const prevRemoved = mgrEmpRemoved
    const removedCount = [...mgrDraftRemoved].filter(n => !mgrDraftAdded.some(t => t.task === n)).length
    const addedCount = mgrDraftAdded.filter(t => !mgrDraftRemoved.has(t.task)).length
    setMgrEmpAdded(prev => [...prev, ...mgrDraftAdded.filter(t => !mgrDraftRemoved.has(t.task))])
    setMgrEmpRemoved(prev => new Set([...prev, ...mgrDraftRemoved]))
    setMgrDraftAdded([]); setMgrDraftRemoved(new Set())
    setMgrEditing(false); resetMgrTaskAdd()
    const parts = [removedCount > 0 ? `${removedCount} removed` : '', addedCount > 0 ? `${addedCount} added` : ''].filter(Boolean)
    setMgrToast({ msg: parts.length > 0 ? `Employee tasks updated — ${parts.join(', ')}` : 'No changes made', prevAdded, prevRemoved })
  }
  function cancelMgr() {
    setMgrDraftAdded([]); setMgrDraftRemoved(new Set()); setMgrEmpRestored(new Set())
    setMgrEditing(false); resetMgrTaskAdd()
  }
  function revertMgr() {
    if (!mgrToast) return
    setMgrEmpAdded(mgrToast.prevAdded); setMgrEmpRemoved(mgrToast.prevRemoved)
    setMgrToast(null)
  }

  // ── Skills helper for add panels ─────────────────────────────────────────
  const augmentSkills: Record<string, string[]> = { 'research': ['AI-assisted research', 'Data synthesis'], 'draft': ['AI writing', 'Content generation'], 'analys': ['Data interpretation', 'Pattern recognition'], 'plan': ['AI-assisted planning', 'Scenario modeling'], 'review': ['Quality evaluation', 'AI output review'], 'track': ['AI analytics', 'Trend detection'], 'coordinat': ['AI scheduling', 'Workflow automation'], 'report': ['Automated reporting', 'Data visualization'], 'forecast': ['Predictive analytics', 'AI modeling'], 'screen': ['AI screening', 'Candidate matching'], 'document': ['AI documentation', 'Template generation'], 'budget': ['Financial modeling', 'AI forecasting'] }
  const automateSkills = ['Process automation', 'AI pipeline']
  const humanSkills: Record<string, string[]> = { 'negotiat': ['Persuasion', 'Relationship building'], 'conflict': ['Mediation', 'Emotional intelligence'], 'client': ['Trust building', 'Empathy'], 'mentor': ['Coaching', 'Leadership'], 'strateg': ['Vision', 'Business judgment'] }
  function getSkillsForTask(task: string, zone: string): string[] {
    const lower = task.toLowerCase()
    if (zone === 'augment') { for (const [key, skills] of Object.entries(augmentSkills)) { if (lower.includes(key)) return skills } return ['AI collaboration', 'Tool fluency'] }
    if (zone === 'above') return automateSkills
    for (const [key, skills] of Object.entries(humanSkills)) { if (lower.includes(key)) return skills }
    return ['Critical thinking', 'Human judgment']
  }

  const isEditing =
    (variant === 'manager' && mgrEditing) ||
    (variant === 'admin' && adminEditing) ||
    (variant === 'employee' && empEditing)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto', fontFamily: 'var(--font-family)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Task Sheet</h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>Role-level task breakdown by AI zone.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {(['role', 'employee', 'manager', 'admin'] as const).map(v => (
          <button key={v} type="button" onClick={() => { setVariant(v); if (v !== 'employee') setCompareMode(false); if (v !== 'manager') setMgrDemoCompareMode(false) }} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid',
            borderColor: variant === v ? '#6366f1' : '#e2e8f0',
            background: variant === v ? '#eef2ff' : '#fff',
            color: variant === v ? '#4338ca' : '#475569',
            fontSize: 13, fontWeight: variant === v ? 600 : 400,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {v === 'role' ? 'Role view' : v === 'employee' ? 'Employee view' : v === 'manager' ? 'Manager view' : 'Admin view'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {(['baseline', 'calibrated', 'upskilled'] as DemoPhase[]).map(p => (
          <button key={p} type="button" onClick={() => setPhase(p)} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid',
            borderColor: phase === p ? '#6366f1' : '#e2e8f0',
            background: phase === p ? '#eef2ff' : '#fff',
            color: phase === p ? '#4338ca' : '#475569',
            fontSize: 13, fontWeight: phase === p ? 600 : 400,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {demoOpen ? (
      <div className="wfr-trend-sheet" style={{ position: 'static', boxShadow: isEditing ? '0 0 0 2px #f59e0b' : '0 0 0 1px #e2e8f0', transform: 'none', maxWidth: 480 }}>
        <div className="wfr-trend-sheet__header" style={isEditing ? { background: '#fffbeb', borderBottom: '1px solid #fde68a' } : undefined}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="wfr-trend-sheet__title-row">
              <h2 className="wfr-trend-sheet__title">{variant === 'employee' || variant === 'manager' ? DEMO_EMPLOYEE : ROLE.title}</h2>
            </div>
            <p className="wfr-trend-sheet__sub">{variant === 'employee' || variant === 'manager' ? ROLE.title : ROLE.dept}</p>
          </div>

          {/* Employee header buttons */}
          {variant === 'employee' && !empEditing && (
            <button type="button" onClick={() => setEmpEditing(true)}
              title="Edit tasks"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', color: '#64748b', transition: 'all 0.15s', padding: 0, flexShrink: 0, alignSelf: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
            </button>
          )}
          {variant === 'employee' && empEditing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, alignSelf: 'flex-start' }}>
              <button type="button" onClick={() => { empTaskAddOpen ? resetEmpTaskAdd() : setEmpTaskAddOpen(true) }} title="Add task"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: `1px solid ${empTaskAddOpen ? '#6366f1' : '#e2e8f0'}`, cursor: 'pointer', background: empTaskAddOpen ? '#eef2ff' : '#fff', color: empTaskAddOpen ? '#4338ca' : '#64748b', transition: 'all 0.15s', padding: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
              </button>
              <button type="button" onClick={cancelEmp}
                style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 500, fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="button" onClick={saveEmp}
                style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                Save
              </button>
            </div>
          )}

          {/* Admin header buttons */}
          {variant === 'admin' && !adminEditing && (
            <button type="button" onClick={() => setAdminEditing(true)}
              title="Edit role tasks"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', color: '#64748b', transition: 'all 0.15s', padding: 0, flexShrink: 0, alignSelf: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
            </button>
          )}
          {variant === 'admin' && adminEditing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, alignSelf: 'flex-start' }}>
              <button type="button" onClick={() => { adminTaskAddOpen ? resetAdminTaskAdd() : setAdminTaskAddOpen(true) }} title="Add task to role"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: `1px solid ${adminTaskAddOpen ? '#6366f1' : '#e2e8f0'}`, cursor: 'pointer', background: adminTaskAddOpen ? '#eef2ff' : '#fff', color: adminTaskAddOpen ? '#4338ca' : '#64748b', transition: 'all 0.15s', padding: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
              </button>
              <button type="button" onClick={cancelAdmin}
                style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 500, fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="button" onClick={saveAdmin}
                style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                Save
              </button>
            </div>
          )}

          {/* Manager header buttons */}
          {variant === 'manager' && !mgrEditing && (
            <button type="button" onClick={() => setMgrEditing(true)}
              title="Edit employee tasks"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', color: '#64748b', transition: 'all 0.15s', padding: 0, flexShrink: 0, alignSelf: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
            </button>
          )}
          {variant === 'manager' && mgrEditing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, alignSelf: 'flex-start' }}>
              <button type="button" onClick={() => { mgrTaskAddOpen ? resetMgrTaskAdd() : setMgrTaskAddOpen(true) }} title="Add task for employee"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: `1px solid ${mgrTaskAddOpen ? '#6366f1' : '#e2e8f0'}`, cursor: 'pointer', background: mgrTaskAddOpen ? '#eef2ff' : '#fff', color: mgrTaskAddOpen ? '#4338ca' : '#64748b', transition: 'all 0.15s', padding: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
              </button>
              <button type="button" onClick={cancelMgr}
                style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 500, fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="button" onClick={saveMgr}
                style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                Save
              </button>
            </div>
          )}

          {/* Close button — visible when not editing; Cancel handles exiting edit mode */}
          {!isEditing && (
            <button type="button" onClick={() => setDemoOpen(false)} aria-label="Close"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', borderRadius: 8, background: 'transparent', cursor: 'pointer', color: '#64748b', flexShrink: 0, alignSelf: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          )}
        </div>

        <div className="wfr-trend-sheet__body">
          {variant === 'role' ? (
            <WfrTaskSheetBody role={ROLE} phase={phase} viewMode="classification" />

          ) : variant === 'admin' ? (
            <>
              {/* Admin: AI add-task panel (amber theme) */}
              {adminEditing && adminTaskAddOpen && (
                <div style={{ marginBottom: 24, padding: '12px', borderRadius: 8, border: '1px solid #fde68a', background: '#fffbeb' }}>
                  {adminTaskAddStep === 'describe' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#92400e' }}>auto_awesome</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Describe the task</span>
                      </div>
                      <textarea value={adminTaskDescription} onChange={e => setAdminTaskDescription(e.target.value)}
                        placeholder="What does this task involve? What's the main outcome?" autoFocus rows={3}
                        onKeyDown={e => { if (e.key === 'Escape') resetAdminTaskAdd() }}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 13, outline: 'none', background: 'rgba(255,255,255,0.6)', resize: 'none', fontFamily: 'inherit', color: '#1e293b', boxSizing: 'border-box', display: 'block' }} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
                        <button type="button" onClick={resetAdminTaskAdd}
                          style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', color: '#92400e', border: '1px solid #fcd34d', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                          Cancel
                        </button>
                        <button type="button" onClick={generateAISuggestion} disabled={!adminTaskDescription.trim()}
                          style={{ padding: '5px 12px', borderRadius: 6, background: '#92400e', color: '#fff', border: 'none', cursor: adminTaskDescription.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: adminTaskDescription.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>auto_awesome</span>
                          Suggest
                        </button>
                      </div>
                    </>
                  )}
                  {adminTaskAddStep === 'generating' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#d97706' }}>auto_awesome</span>
                      <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Analyzing description…</span>
                      <span style={{ marginLeft: 'auto', fontSize: 14, color: '#b45309', letterSpacing: 2 }}>· · ·</span>
                    </div>
                  )}
                  {adminTaskAddStep === 'suggested' && (() => {
                    const zone = adminTaskScore > 75 ? 'above' : adminTaskScore >= 15 ? 'augment' : 'below'
                    const zoneMeta = zone === 'above'
                      ? { label: 'Automate', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' }
                      : zone === 'augment'
                        ? { label: 'Augment', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }
                        : { label: 'Human', color: '#64748b', bg: '#f8fafc', border: '#e5e7eb' }
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#92400e' }}>auto_awesome</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>AI suggestion</span>
                          </div>
                          <span style={{ padding: '2px 8px', borderRadius: 10, background: zoneMeta.bg, border: `1px solid ${zoneMeta.border}`, fontSize: 11, fontWeight: 600, color: zoneMeta.color }}>
                            {zoneMeta.label} ≈{adminTaskScore}%
                          </span>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>Title</div>
                          <input type="text" value={adminTaskTitle} onChange={e => setAdminTaskTitle(e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 13, outline: 'none', background: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', color: '#1e293b', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>Description</div>
                          <textarea value={adminTaskDescSuggestion} onChange={e => setAdminTaskDescSuggestion(e.target.value)}
                            rows={2}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 12, outline: 'none', background: 'rgba(255,255,255,0.7)', resize: 'none', fontFamily: 'inherit', color: '#475569', lineHeight: 1.5, boxSizing: 'border-box', display: 'block' }} />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: adminSkillInputOpen ? 6 : 0 }}>
                            <span style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginRight: 2 }}>Skills</span>
                            {adminTaskSkills.map(s => (
                              <Tag key={s} onRemove={() => setAdminTaskSkills(prev => prev.filter(x => x !== s))}>{s}</Tag>
                            ))}
                            <button type="button" onClick={() => setAdminSkillInputOpen(p => !p)}
                              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', border: '1px solid #fde68a', background: adminSkillInputOpen ? '#fde68a' : 'transparent', cursor: 'pointer', color: '#92400e', padding: 0, flexShrink: 0 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
                            </button>
                          </div>
                          {adminSkillInputOpen && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <input autoFocus
                                type="text" value={adminSkillInput} onChange={e => setAdminSkillInput(e.target.value)}
                                placeholder="Add a skill…"
                                onKeyDown={e => { if (e.key === 'Enter' && adminSkillInput.trim()) { setAdminTaskSkills(prev => [...prev, adminSkillInput.trim()]); setAdminSkillInput(''); setAdminSkillInputOpen(false) } if (e.key === 'Escape') setAdminSkillInputOpen(false) }}
                                style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 11, outline: 'none', background: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', color: '#1e293b' }} />
                              <button type="button" onClick={() => { if (adminSkillInput.trim()) { setAdminTaskSkills(prev => [...prev, adminSkillInput.trim()]); setAdminSkillInput(''); setAdminSkillInputOpen(false) } }}
                                style={{ padding: '4px 10px', borderRadius: 6, background: '#fde68a', border: 'none', color: '#92400e', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 16 }}>
                          <button type="button" onClick={resetAdminTaskAdd}
                            style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', color: '#92400e', border: '1px solid #fcd34d', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                            Cancel
                          </button>
                          <button type="button" onClick={() => { setAdminTaskTitle(''); setAdminTaskDescSuggestion(''); setAdminTaskAddStep('describe') }}
                            style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', color: '#92400e', border: '1px solid #fcd34d', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                            Retry
                          </button>
                          <button type="button" onClick={() => { if (!adminTaskTitle.trim()) return; addAdminTask(adminTaskTitle, adminTaskScore, adminTaskDescSuggestion || undefined); resetAdminTaskAdd() }}
                            disabled={!adminTaskTitle.trim()}
                            style={{ padding: '5px 12px', borderRadius: 6, background: '#92400e', color: '#fff', border: 'none', cursor: adminTaskTitle.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: adminTaskTitle.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
                            Add task
                          </button>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
              <WfrTaskSheetBody
                role={ROLE} phase={phase} viewMode="classification"
                adminEditing={adminEditing}
                adminAdded={[...adminAdded, ...draftAdded]}
                adminRemoved={adminRemoved}
                pendingRemoved={draftRemoved}
                draftAddedNames={new Set(draftAdded.map(t => t.task))}
                onAdminRemove={removeAdminTask}
              />
            </>

          ) : variant === 'manager' ? (
            <>
              {/* Manager: AI add-task panel (amber theme) */}
              {mgrEditing && mgrTaskAddOpen && (
                <div style={{ marginBottom: 24, padding: '12px', borderRadius: 8, border: '1px solid #fde68a', background: '#fffbeb' }}>
                  {mgrTaskAddStep === 'describe' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#92400e' }}>auto_awesome</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Describe the task</span>
                      </div>
                      <textarea value={mgrTaskDescription} onChange={e => setMgrTaskDescription(e.target.value)}
                        placeholder="What does this task involve? What's the main outcome?" autoFocus rows={3}
                        onKeyDown={e => { if (e.key === 'Escape') resetMgrTaskAdd() }}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 13, outline: 'none', background: 'rgba(255,255,255,0.6)', resize: 'none', fontFamily: 'inherit', color: '#1e293b', boxSizing: 'border-box', display: 'block' }} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
                        <button type="button" onClick={resetMgrTaskAdd}
                          style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', color: '#92400e', border: '1px solid #fcd34d', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                          Cancel
                        </button>
                        <button type="button" onClick={generateMgrSuggestion} disabled={!mgrTaskDescription.trim()}
                          style={{ padding: '5px 12px', borderRadius: 6, background: '#92400e', color: '#fff', border: 'none', cursor: mgrTaskDescription.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: mgrTaskDescription.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>auto_awesome</span>
                          Suggest
                        </button>
                      </div>
                    </>
                  )}
                  {mgrTaskAddStep === 'generating' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#d97706' }}>auto_awesome</span>
                      <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Analyzing description…</span>
                      <span style={{ marginLeft: 'auto', fontSize: 14, color: '#b45309', letterSpacing: 2 }}>· · ·</span>
                    </div>
                  )}
                  {mgrTaskAddStep === 'suggested' && (() => {
                    const zone = mgrTaskScore > 75 ? 'above' : mgrTaskScore >= 15 ? 'augment' : 'below'
                    const zoneMeta = zone === 'above'
                      ? { label: 'Automate', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' }
                      : zone === 'augment'
                        ? { label: 'Augment', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }
                        : { label: 'Human', color: '#64748b', bg: '#f8fafc', border: '#e5e7eb' }
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#92400e' }}>auto_awesome</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>AI suggestion</span>
                          </div>
                          <span style={{ padding: '2px 8px', borderRadius: 10, background: zoneMeta.bg, border: `1px solid ${zoneMeta.border}`, fontSize: 11, fontWeight: 600, color: zoneMeta.color }}>
                            {zoneMeta.label} ≈{mgrTaskScore}%
                          </span>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>Title</div>
                          <input type="text" value={mgrTaskTitle} onChange={e => setMgrTaskTitle(e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 13, outline: 'none', background: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', color: '#1e293b', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>Description</div>
                          <textarea value={mgrTaskDescSuggestion} onChange={e => setMgrTaskDescSuggestion(e.target.value)}
                            rows={2}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 12, outline: 'none', background: 'rgba(255,255,255,0.7)', resize: 'none', fontFamily: 'inherit', color: '#475569', lineHeight: 1.5, boxSizing: 'border-box', display: 'block' }} />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: mgrSkillInputOpen ? 6 : 0 }}>
                            <span style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginRight: 2 }}>Skills</span>
                            {mgrTaskSkills.map(s => (
                              <Tag key={s} onRemove={() => setMgrTaskSkills(prev => prev.filter(x => x !== s))}>{s}</Tag>
                            ))}
                            <button type="button" onClick={() => setMgrSkillInputOpen(p => !p)}
                              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', border: '1px solid #fde68a', background: mgrSkillInputOpen ? '#fde68a' : 'transparent', cursor: 'pointer', color: '#92400e', padding: 0, flexShrink: 0 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
                            </button>
                          </div>
                          {mgrSkillInputOpen && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <input autoFocus
                                type="text" value={mgrSkillInput} onChange={e => setMgrSkillInput(e.target.value)}
                                placeholder="Add a skill…"
                                onKeyDown={e => { if (e.key === 'Enter' && mgrSkillInput.trim()) { setMgrTaskSkills(prev => [...prev, mgrSkillInput.trim()]); setMgrSkillInput(''); setMgrSkillInputOpen(false) } if (e.key === 'Escape') setMgrSkillInputOpen(false) }}
                                style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 11, outline: 'none', background: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', color: '#1e293b' }} />
                              <button type="button" onClick={() => { if (mgrSkillInput.trim()) { setMgrTaskSkills(prev => [...prev, mgrSkillInput.trim()]); setMgrSkillInput(''); setMgrSkillInputOpen(false) } }}
                                style={{ padding: '4px 10px', borderRadius: 6, background: '#fde68a', border: 'none', color: '#92400e', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 16 }}>
                          <button type="button" onClick={resetMgrTaskAdd}
                            style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', color: '#92400e', border: '1px solid #fcd34d', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                            Cancel
                          </button>
                          <button type="button" onClick={() => { setMgrTaskTitle(''); setMgrTaskDescSuggestion(''); setMgrTaskAddStep('describe') }}
                            style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', color: '#92400e', border: '1px solid #fcd34d', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                            Retry
                          </button>
                          <button type="button" onClick={() => { if (!mgrTaskTitle.trim()) return; addMgrEmpTask(mgrTaskTitle, mgrTaskScore, mgrTaskDescSuggestion || undefined); resetMgrTaskAdd() }}
                            disabled={!mgrTaskTitle.trim()}
                            style={{ padding: '5px 12px', borderRadius: 6, background: '#92400e', color: '#fff', border: 'none', cursor: mgrTaskTitle.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: mgrTaskTitle.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
                            Add task
                          </button>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
              {/* Compare toggle switch — view control for the task list */}
              {!mgrEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: mgrDemoCompareMode ? 8 : 12 }}>
                  <button type="button" onClick={() => setMgrDemoCompareMode(p => !p)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>Compare with role template</span>
                    <div style={{ position: 'relative', width: 32, height: 18, borderRadius: 9, background: mgrDemoCompareMode ? '#4338ca' : '#cbd5e1', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 2, left: mgrDemoCompareMode ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                    </div>
                  </button>
                </div>
              )}
              {/* Compare summary bar */}
              {!mgrEditing && mgrDemoCompareMode && (() => {
                const addedMap = new Map<string, true>()
                for (const t of empApprovedAdded) addedMap.set(t.task, true)
                for (const t of empPendingAdded) addedMap.set(t.task, true)
                for (const t of mgrEmpAdded) addedMap.set(t.task, true)
                for (const t of mgrDraftAdded) addedMap.set(t.task, true)
                const addedCount = addedMap.size
                const removedCount = new Set([
                  ...Array.from(empApprovedRemoved),
                  ...Array.from(mgrEmpRemoved),
                  ...Array.from(mgrDraftRemoved),
                ].filter(t => !mgrEmpRestored.has(t))).size
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 12, fontSize: 12 }}>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>Compared to role</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
                      {addedCount === 0 && removedCount === 0 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#15803d', fontWeight: 600 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13, lineHeight: 1 }}>check_circle</span>
                          No changes
                        </span>
                      ) : (
                        <>
                          {addedCount > 0 && <span style={{ color: '#15803d', fontWeight: 600 }}>+{addedCount} added</span>}
                          {addedCount > 0 && removedCount > 0 && <span style={{ color: '#cbd5e1' }}>·</span>}
                          {removedCount > 0 && <span style={{ color: '#b91c1c', fontWeight: 600 }}>−{removedCount} removed</span>}
                        </>
                      )}
                    </div>
                  </div>
                )
              })()}
              <ManagerEmployeeTaskView
                employeeName={DEMO_EMPLOYEE}
                role={ROLE}
                phase={phase}
                viewMode="classification"
                diffMode={mgrDemoCompareMode}
                mgrEditing={mgrEditing}
                mgrEmpAdded={[...mgrEmpAdded, ...mgrDraftAdded]}
                mgrEmpRemoved={new Set([...mgrEmpRemoved, ...mgrDraftRemoved].filter(t => !mgrEmpRestored.has(t)))}
                onMgrRemove={removeMgrEmpTask}
                onRestore={(t) => setMgrEmpRestored(prev => new Set([...prev, t]))}
              />
            </>

          ) : (
            <>
              {/* Compare toggle switch — view control for the task list */}
              {!empEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: compareMode ? 8 : 12 }}>
                  <button type="button" onClick={() => setCompareMode(p => !p)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>Compare with role template</span>
                    <div style={{ position: 'relative', width: 32, height: 18, borderRadius: 9, background: compareMode ? '#4338ca' : '#cbd5e1', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 2, left: compareMode ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                    </div>
                  </button>
                </div>
              )}
              {/* Compare summary bar */}
              {!empEditing && compareMode && (() => {
                const addedMap = new Map<string, true>()
                for (const t of empApprovedAdded) addedMap.set(t.task, true)
                for (const t of empPendingAdded) addedMap.set(t.task, true)
                for (const t of empDraftAdded) addedMap.set(t.task, true)
                const addedCount = addedMap.size
                const removedCount = new Set(
                  [...Array.from(empApprovedRemoved)].filter(t => !empDraftRestored.has(t))
                ).size
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 12, fontSize: 12 }}>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>Compared to role</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
                      {addedCount === 0 && removedCount === 0 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#15803d', fontWeight: 600 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13, lineHeight: 1 }}>check_circle</span>
                          No changes
                        </span>
                      ) : (
                        <>
                          {addedCount > 0 && <span style={{ color: '#15803d', fontWeight: 600 }}>+{addedCount} added</span>}
                          {addedCount > 0 && removedCount > 0 && <span style={{ color: '#cbd5e1' }}>·</span>}
                          {removedCount > 0 && <span style={{ color: '#b91c1c', fontWeight: 600 }}>−{removedCount} removed</span>}
                        </>
                      )}
                    </div>
                  </div>
                )
              })()}
              {/* Pending manager review banner */}
              {empPending && (empPending.added.length > 0 || empPending.removed.length > 0) && (
                <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 8, border: '1px solid #fde68a', background: '#fffbeb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#b45309' }}>hourglass_top</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending manager review</span>
                    <span style={{ marginLeft: 'auto' }}>
                      <button type="button" onClick={withdrawEmpPending}
                        style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #fcd34d', cursor: 'pointer', background: 'transparent', color: '#92400e', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
                        Withdraw
                      </button>
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {empPending.added.map(t => (
                      <div key={`pa-${t.task}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 4, background: '#dcfce7', color: '#15803d' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>add</span>
                        </span>
                        <span style={{ fontWeight: 500, color: '#0f172a' }}>{t.task}</span>
                        <span style={{ color: '#94a3b8' }}>· score {t.score}</span>
                      </div>
                    ))}
                    {empPending.removed.map(name => (
                      <div key={`pr-${name}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 4, background: '#fee2e2', color: '#b91c1c' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>remove</span>
                        </span>
                        <span style={{ fontWeight: 500, color: '#0f172a', textDecoration: 'line-through' }}>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Employee: AI add-task panel (indigo theme) */}
              {empEditing && empTaskAddOpen && (
                <div style={{ marginBottom: 24, padding: '12px', borderRadius: 8, border: '1px solid #fde68a', background: '#fffbeb' }}>
                  {empTaskAddStep === 'describe' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#92400e' }}>auto_awesome</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Describe the task</span>
                      </div>
                      <textarea value={empTaskDescription} onChange={e => setEmpTaskDescription(e.target.value)}
                        placeholder="What does this task involve? What's the main outcome?" autoFocus rows={3}
                        onKeyDown={e => { if (e.key === 'Escape') resetEmpTaskAdd() }}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 13, outline: 'none', background: 'rgba(255,255,255,0.6)', resize: 'none', fontFamily: 'inherit', color: '#1e293b', boxSizing: 'border-box', display: 'block' }} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
                        <button type="button" onClick={resetEmpTaskAdd}
                          style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', color: '#92400e', border: '1px solid #fde68a', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                          Cancel
                        </button>
                        <button type="button" onClick={generateEmpSuggestion} disabled={!empTaskDescription.trim()}
                          style={{ padding: '5px 12px', borderRadius: 6, background: '#92400e', color: '#fff', border: 'none', cursor: empTaskDescription.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: empTaskDescription.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>auto_awesome</span>
                          Suggest
                        </button>
                      </div>
                    </>
                  )}
                  {empTaskAddStep === 'generating' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#92400e' }}>auto_awesome</span>
                      <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>Analyzing description…</span>
                      <span style={{ marginLeft: 'auto', fontSize: 14, color: '#92400e', letterSpacing: 2 }}>· · ·</span>
                    </div>
                  )}
                  {empTaskAddStep === 'suggested' && (() => {
                    const zone = empTaskScore > 75 ? 'above' : empTaskScore >= 15 ? 'augment' : 'below'
                    const zoneMeta = zone === 'above'
                      ? { label: 'Automate', color: '#6366f1', bg: '#eef2ff', border: '#fde68a' }
                      : zone === 'augment'
                        ? { label: 'Augment', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }
                        : { label: 'Human', color: '#64748b', bg: '#f8fafc', border: '#e5e7eb' }
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#92400e' }}>auto_awesome</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>AI suggestion</span>
                          </div>
                          <span style={{ padding: '2px 8px', borderRadius: 10, background: zoneMeta.bg, border: `1px solid ${zoneMeta.border}`, fontSize: 11, fontWeight: 600, color: zoneMeta.color }}>
                            {zoneMeta.label} ≈{empTaskScore}%
                          </span>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>Title</div>
                          <input type="text" value={empTaskTitle} onChange={e => setEmpTaskTitle(e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 13, outline: 'none', background: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', color: '#1e293b', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>Description</div>
                          <textarea value={empTaskDescSuggestion} onChange={e => setEmpTaskDescSuggestion(e.target.value)}
                            rows={2}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 12, outline: 'none', background: 'rgba(255,255,255,0.7)', resize: 'none', fontFamily: 'inherit', color: '#475569', lineHeight: 1.5, boxSizing: 'border-box', display: 'block' }} />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: empSkillInputOpen ? 6 : 0 }}>
                            <span style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginRight: 2 }}>Skills</span>
                            {empTaskSkills.map(s => (
                              <Tag key={s} onRemove={() => setEmpTaskSkills(prev => prev.filter(x => x !== s))}>{s}</Tag>
                            ))}
                            <button type="button" onClick={() => setEmpSkillInputOpen(p => !p)}
                              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', border: '1px solid #fde68a', background: empSkillInputOpen ? '#fde68a' : 'transparent', cursor: 'pointer', color: '#92400e', padding: 0, flexShrink: 0 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
                            </button>
                          </div>
                          {empSkillInputOpen && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <input autoFocus
                                type="text" value={empSkillInput} onChange={e => setEmpSkillInput(e.target.value)}
                                placeholder="Add a skill…"
                                onKeyDown={e => { if (e.key === 'Enter' && empSkillInput.trim()) { setEmpTaskSkills(prev => [...prev, empSkillInput.trim()]); setEmpSkillInput(''); setEmpSkillInputOpen(false) } if (e.key === 'Escape') setEmpSkillInputOpen(false) }}
                                style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 11, outline: 'none', background: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', color: '#1e293b' }} />
                              <button type="button" onClick={() => { if (empSkillInput.trim()) { setEmpTaskSkills(prev => [...prev, empSkillInput.trim()]); setEmpSkillInput(''); setEmpSkillInputOpen(false) } }}
                                style={{ padding: '4px 10px', borderRadius: 6, background: '#fde68a', border: 'none', color: '#92400e', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 16 }}>
                          <button type="button" onClick={resetEmpTaskAdd}
                            style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', color: '#92400e', border: '1px solid #fde68a', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                            Cancel
                          </button>
                          <button type="button" onClick={() => { setEmpTaskTitle(''); setEmpTaskDescSuggestion(''); setEmpTaskAddStep('describe') }}
                            style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', color: '#92400e', border: '1px solid #fde68a', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                            Retry
                          </button>
                          <button type="button" onClick={() => { if (!empTaskTitle.trim()) return; addEmpTask(empTaskTitle, empTaskScore, empTaskDescSuggestion || undefined); resetEmpTaskAdd() }}
                            disabled={!empTaskTitle.trim()}
                            style={{ padding: '5px 12px', borderRadius: 6, background: '#92400e', color: '#fff', border: 'none', cursor: empTaskTitle.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: empTaskTitle.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
                            Add task
                          </button>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
              <WfrTaskSheetBody
                role={ROLE} phase={phase} viewMode="classification"
                diffMode={compareMode}
                adminEditing={empEditing}
                adminAdded={[...empApprovedAdded, ...empPendingAdded, ...empDraftAdded]}
                adminRemoved={new Set([...empApprovedRemoved].filter(t => !empDraftRestored.has(t)))}
                pendingRemoved={new Set([...empPendingRemoved, ...empDraftRemoved])}
                draftAddedNames={new Set(empDraftAdded.map(t => t.task))}
                pendingAddedNames={new Set(empPendingAdded.map(t => t.task))}
                onAdminRemove={removeEmpTask}
                onRestore={(t) => setEmpDraftRestored(prev => new Set([...prev, t]))}
              />
            </>
          )}
        </div>
      </div>
      ) : (
        <div style={{ maxWidth: 480, padding: '40px 24px', border: '1px dashed #e2e8f0', borderRadius: 12, textAlign: 'center', color: '#94a3b8' }}>
          <span style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>Sheet dismissed</span>
          <button type="button" onClick={() => setDemoOpen(true)}
            style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: '#475569' }}>
            Reopen
          </button>
        </div>
      )}

      {/* Admin toast */}
      {adminToast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', borderRadius: 10, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 9999,
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)', fontSize: 13, fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#86efac' }}>check_circle</span>
          <span style={{ fontWeight: 500 }}>{adminToast.msg}</span>
          <button type="button" onClick={revertAdmin}
            style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            Revert
          </button>
          <button type="button" onClick={() => setAdminToast(null)}
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 2, borderRadius: 4, lineHeight: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      )}

      {/* Employee toast */}
      {empToast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', borderRadius: 10, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 9999,
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)', fontSize: 13, fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#86efac' }}>check_circle</span>
          <span style={{ fontWeight: 500 }}>{empToast.msg}</span>
          <button type="button" onClick={revertEmp}
            style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            Revert
          </button>
          <button type="button" onClick={() => setEmpToast(null)}
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 2, borderRadius: 4, lineHeight: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      )}

      {/* Manager toast */}
      {mgrToast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', borderRadius: 10, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 9999,
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)', fontSize: 13, fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#86efac' }}>check_circle</span>
          <span style={{ fontWeight: 500 }}>{mgrToast.msg}</span>
          <button type="button" onClick={revertMgr}
            style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            Revert
          </button>
          <button type="button" onClick={() => setMgrToast(null)}
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 2, borderRadius: 4, lineHeight: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      )}
    </div>
  )
}
