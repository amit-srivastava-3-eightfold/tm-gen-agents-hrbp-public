import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button, Tag } from '@tonyh-2-eightfold/ef-design-system'
import { DevPlanStatsBar } from './DevPlanStatsBar'
import './DevPlanSheet.css'

// ── Types ─────────────────────────────────────────────────────────────────────

export type LevelState = 'recognized' | 'current' | 'locked'

export interface Course {
  name: string
  provider: string
  duration: string
  level: string
  free: boolean
  description?: string
}

export interface WorkTask {
  text: string
  description: string
}

export interface CoachTask {
  text: string
  sessionTitle: string
  sessionDesc: string
  /** Optional identifier so consumers can branch on which task spawned the panel. */
  id?: string
}

export interface LevelDef {
  id: number
  name: string
  xpLabel: string
  outcome: string
  courses: Course[]
  tasks: WorkTask[]
  totalHours: number
  adoptionPts: number
  coachTask?: CoachTask
}

export type DevPlanSheetView = 'full' | 'score' | 'stats' | 'curriculum' | 'unlocks'

export interface DevPlanSheetProps {
  employee: { name: string; title?: string; readinessPct: number; displayReadiness: number; planPct?: number } | null
  open: boolean
  onClose: () => void
  isAssigned: boolean
  /** Render the panel inline (no portal, no backdrop) for component explorers */
  inline?: boolean
  /** Which section to show in inline mode (default: 'full') */
  view?: DevPlanSheetView
  /** True when the employee is viewing their own plan — use second person */
  selfView?: boolean
}

// ── Static curriculum data ─────────────────────────────────────────────────────

const LEVEL_BASE: Omit<LevelDef, 'courses'>[] = [
  {
    id: 1,
    name: 'AI Foundations',
    xpLabel: 'Foundation XP',
    outcome: 'Understand how AI works and where it applies to your daily work — so you can evaluate AI output with confidence, not just curiosity.',
    tasks: [
      { text: 'Use AI to draft one piece of content in your regular workflow', description: 'Pick any content you create regularly — a status update, a proposal section, a client email. Use an AI tool to generate a first draft, then revise it. The goal isn\'t perfection; it\'s building the habit of starting with AI.' },
      { text: 'Note what surprised you about how AI handled the task', description: 'Keep a simple log — one or two sentences is enough. What did AI get right? What did you have to fix? These observations sharpen your ability to evaluate AI output over time.' },
    ],
    coachTask: {
      text: 'Debrief your first AI experiment with your coach',
      sessionTitle: 'AI Foundations — Practice Session',
      sessionDesc: 'Share what you tried and what happened. Your coach will help you reflect on what worked, what surprised you, and how to use that to sharpen your judgment going forward.',
    },
    totalHours: 20,
    adoptionPts: 3,
  },
  {
    id: 2,
    name: 'Augmentation-Ready',
    xpLabel: 'Augmentation XP',
    outcome: 'Use AI confidently on routine tasks in your role — with human judgment at every handoff, every time.',
    tasks: [
      { text: 'Apply AI to a recurring task and log the time saved', description: 'Choose a task you do at least weekly — reporting, summarizing, drafting. Apply AI assistance and note how long it took vs. your usual time. Even rough estimates are useful for making the business case later.' },
      { text: 'Review an AI output critically — note at least one error you caught', description: 'Don\'t accept AI output as-is. Read carefully, check claims, spot gaps. Write down one specific thing you corrected or improved. This builds the oversight habit that keeps AI use safe and high-quality.' },
    ],
    coachTask: {
      text: 'Bring an AI output you\'ve reviewed — your coach will walk through it with you',
      sessionTitle: 'Augmentation-Ready — Review Session',
      sessionDesc: 'Bring a recent AI-generated output to your session. Your coach will help you identify what to trust, what to question, and how to build the oversight habit that makes AI use safe and high-quality.',
    },
    totalHours: 16,
    adoptionPts: 5,
  },
  {
    id: 3,
    name: 'Power User',
    xpLabel: 'Power User XP',
    outcome: 'Drive AI adoption within your immediate team — turning personal wins into repeatable, shared workflows that stick.',
    tasks: [
      { text: 'Create a reusable AI workflow template for your team', description: 'Document the exact prompt, steps, and review checklist for one AI task you\'ve mastered. Format it so a colleague could follow it without explanation. Templates are how individual wins become team wins.' },
      { text: 'Demo one AI-powered workflow in your next team standup', description: 'A 3–5 minute demo is enough. Show the before (manual) and after (AI-assisted), and share one thing to watch out for. Real examples move teams faster than any training deck.' },
    ],
    coachTask: {
      text: 'Draft your first team AI workflow template with your coach',
      sessionTitle: 'Power User — Workflow Session',
      sessionDesc: 'Work with your coach to design a reusable AI workflow template your team can actually adopt — complete with prompt, steps, and the gotchas others should know about.',
    },
    totalHours: 8,
    adoptionPts: 4,
  },
  {
    id: 4,
    name: 'AI Champion',
    xpLabel: 'Champion XP',
    outcome: 'Mentor peers, contribute to the team playbook, and help drive quarter-over-quarter readiness improvements across your org.',
    tasks: [
      { text: 'Pair with a colleague for one hour on their AI onboarding', description: 'Work alongside someone earlier in their AI journey. Help them apply a tool to one of their actual tasks. Teaching solidifies your own skills and builds social proof within the team.' },
      { text: 'Submit one workflow improvement to the team AI playbook', description: 'Take a workflow you\'ve refined and document it for others. Include the prompt, the steps, and the gotchas you learned. Shared playbooks are how teams compound their AI gains quarter over quarter.' },
    ],
    coachTask: {
      text: 'Plan your first peer coaching session with your coach',
      sessionTitle: 'AI Champion — Mentor Session',
      sessionDesc: 'Your coach will help you prepare to pair with a teammate on their AI onboarding — and work out how to document and submit your first workflow improvement to the team playbook.',
    },
    totalHours: 6,
    adoptionPts: 2,
  },
]

const LEVEL_COURSES: Record<number, Course[]> = {
  1: [
    { name: 'AI for Business Professionals', provider: 'University of Pennsylvania', duration: '12 hrs', level: 'Beginner', free: true, description: 'A hands-on introduction to AI concepts tailored for business contexts. Covers how AI works, where it applies to daily work, and how to critically evaluate AI-generated outputs so you can act on them with confidence.' },
    { name: 'Prompt Engineering for ChatGPT', provider: 'Vanderbilt University', duration: '8 hrs', level: 'Beginner', free: true, description: 'Learn to write clear, effective prompts that get better results from large language models. Covers zero-shot, few-shot, and chain-of-thought techniques with practical exercises you can apply immediately.' },
  ],
  2: [
    { name: 'Generative AI with Large Language Models', provider: 'DeepLearning.AI', duration: '16 hrs', level: 'Intermediate', free: true, description: 'A deeper look at how LLMs work — from transformer architecture to fine-tuning and deployment. Includes hands-on labs for integrating generative AI into real workflows and evaluating output quality.' },
  ],
  // Level 3 is built dynamically from role title
  4: [
    { name: 'AI Strategy & Governance', provider: 'Eightfold Academy', duration: '6 hrs', level: 'Advanced', free: false, description: 'Frameworks for responsible AI adoption at scale. Covers policy design, risk management, bias mitigation, and how to build governance structures that support sustainable AI use across teams.' },
  ],
}



// ── Completion unlocks ─────────────────────────────────────────────────────────

const CAREER_DOORS: Array<{ pattern: RegExp; roles: string[] }> = [
  { pattern: /engineering manager/i,  roles: ['Director of Engineering', 'Principal Engineer', 'VP Engineering'] },
  { pattern: /senior software/i,      roles: ['Staff Engineer', 'Tech Lead', 'Engineering Lead'] },
  { pattern: /software engineer/i,    roles: ['Senior Software Engineer', 'Tech Lead', 'Platform Engineer'] },
  { pattern: /frontend engineer/i,    roles: ['Senior Frontend Engineer', 'UI/UX Engineer', 'Tech Lead'] },
  { pattern: /qa automation/i,        roles: ['Senior QA Engineer', 'SDET', 'QA Lead'] },
  { pattern: /devops/i,               roles: ['Senior DevOps Engineer', 'Platform Engineer', 'SRE'] },
  { pattern: /platform engineer/i,    roles: ['Staff Platform Engineer', 'Cloud Architect', 'Engineering Lead'] },
  { pattern: /site reliability/i,     roles: ['Senior SRE', 'Platform Engineer', 'Infrastructure Lead'] },
  { pattern: /mobile developer/i,     roles: ['Senior Mobile Engineer', 'Mobile Tech Lead', 'Full-Stack Engineer'] },
  { pattern: /manager/i,              roles: ['Director', 'Senior Manager', 'VP'] },
]

const AI_SKILLS_BY_ROLE: Array<{ pattern: RegExp; skills: string[] }> = [
  { pattern: /engineer|developer/i,   skills: ['writing better prompts', 'AI-assisted code review', 'debugging with LLMs', 'generating test cases with AI'] },
  { pattern: /manager/i,              skills: ['AI-driven status reporting', 'writing better prompts', 'synthesizing team feedback with AI', 'AI-assisted decision memos'] },
  { pattern: /analyst/i,              skills: ['AI-powered data summaries', 'writing better prompts', 'reviewing and editing AI outputs', 'structuring reports with AI'] },
  { pattern: /qa/i,                   skills: ['AI-generated test plans', 'writing better prompts', 'automated defect triage', 'AI-assisted root cause analysis'] },
]

export function getUnlocks(name: string, title: string | undefined, displayReadiness: number, gainPts = 0) {
  const h = Math.abs(Array.from(name).reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0))
  const doorEntry = CAREER_DOORS.find(r => r.pattern.test(title ?? ''))
  const doorRoles = doorEntry?.roles ?? ['Senior Specialist', 'Team Lead', 'Manager']
  const doorCount = Math.min(3 + (h % 3), doorRoles.length) // 3–5, capped to available roles
  const topFit = 38 + (h % 20) // 38–57%
  const currentRisk = 55 + (h % 20) // 55–74%
  const pathsTo = Math.max(15, Math.round(currentRisk * 0.45) + (h % 8)) // 25–42% (realistic post-training residual)
  const riskDrop = currentRisk - pathsTo
  const aiSkillEntry = AI_SKILLS_BY_ROLE.find(r => r.pattern.test(title ?? ''))
  const aiSkills = aiSkillEntry?.skills ?? ['writing better prompts', 'reviewing and editing AI outputs', 'structuring presentations for impact']
  const fitBoost = Math.round(gainPts * 0.55)
  const allFits = doorRoles.slice(0, doorCount).map((role, i) => {
    const baseFit = Math.max(30, topFit - i * (5 + (h % 4)))
    return { role, fit: baseFit + fitBoost, baseFit }
  })
  return { doorCount, topRole: doorRoles[0], topFit, currentRisk, pathsTo, riskDrop, aiSkills: aiSkills.slice(0, 4), displayReadiness, allRoles: allFits }
}

// ── BarWithTip ────────────────────────────────────────────────────────────────

function BarWithTip({ style, tip }: { style: React.CSSProperties; tip: string }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      style={{ ...style, overflow: 'visible' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 7px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', fontSize: 11, fontWeight: 500,
          padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 20,
        }}>
          {tip}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
            borderTop: '4px solid #1e293b',
          }} />
        </div>
      )}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function nameHash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Returns a deterministic completion date string like "Feb 5" for a given level.
// Level 1 = oldest (8–10 weeks ago), Level 4 = most recent (1–3 weeks ago).
function getCompletedDate(name: string, levelId: number): string {
  const h = nameHash(name + levelId)
  const ranges: [number, number][] = [
    [56, 70], // Level 1
    [42, 55], // Level 2
    [21, 41], // Level 3
    [7, 20],  // Level 4
  ]
  const [min, max] = ranges[levelId - 1] ?? [7, 20]
  const daysAgo = min + (h % (max - min + 1))
  const d = new Date('2026-04-16')
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}




// CSM-specific curriculum — mirrors the AI Coach discovery interview.
// Used when the employee's title matches the Customer Success Manager pattern.
const CSM_LEVEL_BASE: Omit<LevelDef, 'courses'>[] = [
  {
    id: 1,
    name: 'AI-Assisted Pre-Call Prep',
    xpLabel: 'Prep XP',
    outcome: 'Walk into every customer call with a one-page brief generated in 60 seconds — usage trends, open tickets, recent product changes, and the questions you\'d otherwise scramble to find.',
    tasks: [
      { text: 'Generate a pre-call brief for three customer calls this week using the prompt template', description: 'Pick three upcoming calls — a renewal, an exec check-in, and a routine pulse. Run the prep prompt against your CRM activity, usage analytics, and recent tickets. Read the brief instead of opening five tabs.' },
      { text: 'Compare each AI brief to your usual prep notes — flag what it surfaced that you would have missed', description: 'A few notes per call is enough. Where did AI catch a usage drop or contract detail you\'d have skimmed past? Those moments are why this scales — and they sharpen the prompt for the next call.' },
    ],
    coachTask: {
      text: 'Walk through your first AI-generated pre-call brief with your coach',
      sessionTitle: 'AI-Assisted Pre-Call Prep — Session 1',
      sessionDesc: 'Bring an upcoming call and the AI brief. Your coach will help you tune the prompt for your accounts and lock in a workflow that holds up on a busy week.',
    },
    totalHours: 2,
    adoptionPts: 4,
  },
  {
    id: 2,
    name: 'Call-to-Recap Automation',
    xpLabel: 'Recap XP',
    outcome: 'Turn your live call notes into a Salesforce-ready follow-up email in minutes — without staring at a transcript or starting from a blank template.',
    tasks: [
      { text: 'Run the recap workflow on three customer calls this week', description: 'Use your normal in-call note style. After the call, paste the notes into the prompt and review the generated recap. Send it from Salesforce after a quick edit.' },
      { text: 'Tune the prompt so the output matches your Salesforce template format', description: 'Tighten the structure: action items, owners, dates. Save the refined prompt to your account playbook so the next call doesn\'t restart from scratch.' },
    ],
    coachTask: {
      text: 'Refine the recap prompt with your coach',
      sessionTitle: 'Call-to-Recap Automation — Session 2',
      sessionDesc: 'Bring three recent recaps and any feedback from customers. Your coach will help you tighten the format and lock in a workflow that survives a busy week.',
    },
    totalHours: 2,
    adoptionPts: 5,
  },
  {
    id: 3,
    name: 'Account Research Synthesis',
    xpLabel: 'Research XP',
    outcome: 'Build an exec brief in one prompt by pulling CRM history, usage data, LinkedIn context, and recent news into a single ready-to-read summary.',
    tasks: [
      { text: 'Generate an exec brief for an upcoming renewal call', description: 'Use the synthesis prompt against your CRM activity, the usage analytics module, and a quick LinkedIn check. Aim for a one-page brief you could hand to a colleague cold.' },
      { text: 'Spot-check what AI got right vs. what you needed to add manually', description: 'AI synthesis is fastest when you know exactly where it tends to miss. Make a short list of what you added — that\'s your manual oversight muscle.' },
    ],
    coachTask: {
      text: 'Review your first exec brief with your coach',
      sessionTitle: 'Account Research Synthesis — Session 3',
      sessionDesc: 'Bring an AI-generated brief alongside your edits. Your coach will help you sharpen the prompt and identify where AI synthesis is reliable vs. where you still need to look.',
    },
    totalHours: 2,
    adoptionPts: 4,
  },
  {
    id: 4,
    name: 'Prompt Engineering Foundations',
    xpLabel: 'Foundations XP',
    outcome: 'Optional but useful — build the underlying skill that makes every other AI workflow sharper. Clear, structured prompts get usable output the first time.',
    tasks: [
      { text: 'Rewrite one of your existing prompts using the structured framework', description: 'Take a prompt you already use (pre-call brief, recap, research) and restructure it: role + context + task + format. Compare the output to your old prompt.' },
      { text: 'Save your top three prompts to your account playbook', description: 'Document the prompt, when to use it, and one gotcha you learned. This is how individual wins become a team\'s shared toolkit.' },
    ],
    coachTask: {
      text: 'Review your prompt library with your coach',
      sessionTitle: 'Prompt Engineering Foundations — Optional Session',
      sessionDesc: 'Bring the prompts you\'ve been using and want to share. Your coach will help you spot patterns and turn them into reusable templates.',
    },
    totalHours: 2,
    adoptionPts: 2,
  },
]

const CSM_LEVEL_COURSES: Record<number, Course[]> = {
  1: [
    { name: 'AI-Assisted Pre-Call Prep', provider: 'Eightfold Academy', duration: '2 hrs · self-paced', level: 'Beginner', free: true, description: 'Workflow guide for generating a one-page customer call brief from CRM activity, usage analytics, and support ticket history — with prompt templates for renewal calls, escalations, exec QBRs, and routine check-ins.' },
  ],
  2: [
    { name: 'Call-to-Recap Automation', provider: 'Eightfold Academy', duration: '2 hrs · self-paced', level: 'Beginner', free: true, description: 'Workflow guide for going from in-call notes to a Salesforce-ready follow-up email — including prompt templates that match common CSM call formats.' },
  ],
  3: [
    { name: 'Account Research Synthesis', provider: 'Eightfold Academy', duration: '2 hrs · self-paced', level: 'Beginner', free: true, description: 'One-prompt synthesis for renewal prep and new exec outreach. Pulls CRM activity, usage trends, and external context into a single executive brief.' },
  ],
  4: [
    { name: 'Prompt Engineering Foundations', provider: 'Vanderbilt University', duration: '2 hrs · self-paced', level: 'Beginner', free: true, description: 'Optional primer on writing clearer, more structured prompts — covers role, context, task, and format conventions that translate across every AI workflow.' },
  ],
}

const CSM_TITLE_PATTERN = /customer success|csm|account manager/i

export function buildLevels(employee: DevPlanSheetProps['employee']): LevelDef[] {
  const isCsm = CSM_TITLE_PATTERN.test(employee?.title ?? '')
  if (isCsm) {
    return CSM_LEVEL_BASE.map(base => ({
      ...base,
      courses: CSM_LEVEL_COURSES[base.id] ?? [],
    }))
  }
  const roleWord = employee?.title?.split(' ')[0] ?? 'Business'
  return LEVEL_BASE.map(base => ({
    ...base,
    courses: base.id === 3
      ? [{ name: `AI-Powered ${roleWord} Workflows`, provider: 'Eightfold Academy', duration: 'Self-paced · ~8 hrs', level: 'Intermediate', free: false, description: `Role-specific playbook for using AI in ${roleWord} work. Walks through the highest-impact augmentable tasks in your role, with guided exercises for building repeatable AI-assisted workflows your team can adopt.` }]
      : (LEVEL_COURSES[base.id] ?? []),
  }))
}

// ── Sub-components ────────────────────────────────────────────────────────────

export function CourseItem({ course, recognized = false }: { course: Course; recognized?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const canExpand = !!course.description
  return (
    <div className={`dev-plan-sheet__course${recognized ? ' dev-plan-sheet__course--recognized' : ''}`}
      style={canExpand ? { flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer', userSelect: 'none' } : undefined}
      onClick={canExpand ? () => setExpanded(e => !e) : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={`material-symbols-outlined dev-plan-sheet__course-icon${recognized ? ' dev-plan-sheet__course-icon--recognized' : ''}`}>
          {recognized ? 'check_circle' : 'menu_book'}
        </span>
        <div className="dev-plan-sheet__course-info" style={{ flex: 1 }}>
          <div className={`dev-plan-sheet__course-name${recognized ? ' dev-plan-sheet__course-name--recognized' : ''}`}>
            {course.name}
          </div>
          <div className="dev-plan-sheet__course-meta">
            {course.provider} · {course.duration} · {course.level}
          </div>
        </div>
        {course.free && <span className="dev-plan-sheet__course-free">Free</span>}
        {canExpand && (
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#94a3b8', transition: 'transform 0.15s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
            expand_more
          </span>
        )}
      </div>
      {expanded && course.description && (
        <div style={{ display: 'flex', gap: 10, marginTop: 8, marginBottom: 2 }}>
          <span style={{ width: 16, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
            {course.description}
          </p>
        </div>
      )}
    </div>
  )
}

export function TaskItem({ task, recognized = false }: { task: WorkTask; recognized?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className={`dev-plan-sheet__course${recognized ? ' dev-plan-sheet__course--recognized' : ''}`}
      style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer', userSelect: 'none' }}
      onClick={() => setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={`material-symbols-outlined dev-plan-sheet__course-icon${recognized ? ' dev-plan-sheet__course-icon--recognized' : ''}`} style={recognized ? undefined : { color: '#94a3b8' }}>{recognized ? 'check_circle' : 'task_alt'}</span>
        <div className="dev-plan-sheet__course-info" style={{ flex: 1 }}>
          <div className="dev-plan-sheet__course-name">{task.text}</div>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#94a3b8', transition: 'transform 0.15s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          expand_more
        </span>
      </div>
      {expanded && (
        <div style={{ display: 'flex', gap: 10, marginTop: 8, marginBottom: 2 }}>
          <span style={{ width: 16, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{task.description}</p>
        </div>
      )}
    </div>
  )
}

// ── CoachTaskItem ─────────────────────────────────────────────────────────────

export function CoachTaskItem({ task, onOpen }: { task: CoachTask; onOpen: () => void }) {
  return (
    <button
      type="button"
      className="dev-plan-sheet__coach-task"
      onClick={onOpen}
    >
      <div className="dev-plan-sheet__coach-task-icon">
        <span className="material-symbols-outlined">auto_awesome</span>
      </div>
      <div className="dev-plan-sheet__coach-task-text">{task.text}</div>
      <div className="dev-plan-sheet__coach-task-cta">
        Start with coach
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
      </div>
    </button>
  )
}

// ── LevelCard ─────────────────────────────────────────────────────────────────

export function LevelCard({
  level,
  state,
  xpPct,
  isAssigned,
  expanded,
  onToggle,
  completedAt,
  onCoachTask,
}: {
  level: LevelDef
  state: LevelState
  xpPct: number
  isAssigned: boolean
  expanded: boolean
  onToggle: () => void
  completedAt?: string
  onCoachTask?: (task: CoachTask) => void
}) {
  const isCurrent = state === 'current'
  const isRecognized = state === 'recognized'
  const isLocked = state === 'locked'

  const cardClass = isRecognized
    ? 'dev-plan-sheet__level--recognized'
    : isCurrent
      ? 'dev-plan-sheet__level--current'
      : 'dev-plan-sheet__level--locked'

  const badgeClass = isRecognized
    ? 'dev-plan-sheet__level-badge--recognized'
    : isCurrent
      ? 'dev-plan-sheet__level-badge--current'
      : 'dev-plan-sheet__level-badge--locked'

  const badgeContent = isRecognized
    ? <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
    : isLocked
      ? <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
      : level.id

  const hoursComplete = isAssigned ? Math.round(level.totalHours * xpPct / 100) : 0

  return (
    <div className={`dev-plan-sheet__level ${cardClass}`}>
      {/* Header */}
      <div
        className={`dev-plan-sheet__level-header${(isRecognized || isLocked) ? ' dev-plan-sheet__level-header--clickable' : ''}`}
        onClick={(isRecognized || isLocked) ? onToggle : undefined}
        role={isRecognized || isLocked ? 'button' : undefined}
        aria-expanded={isRecognized || isLocked ? expanded : undefined}
      >
        <div className={`dev-plan-sheet__level-badge ${badgeClass}`}>
          {badgeContent}
        </div>

        <div className="dev-plan-sheet__level-title-group">
          <div className={`dev-plan-sheet__level-name${isLocked ? ' dev-plan-sheet__level-name--locked' : ''}`}>
            {level.name}
          </div>
          <div style={{ fontSize: 11, color: completedAt ? '#15803d' : '#94a3b8', marginTop: 1 }}>
            {completedAt ? `Completed ${completedAt}` : `${level.totalHours} hrs est.`}
          </div>
        </div>

        <span className={`dev-plan-sheet__level-pts-chip dev-plan-sheet__level-pts-chip--${isRecognized ? 'credited' : isLocked ? 'locked' : 'current'}`}>
          {isRecognized ? `+${level.adoptionPts} pts credited` : `+${level.adoptionPts} pts`}
        </span>

        {(isRecognized || isLocked) && (
          <span className={`material-symbols-outlined dev-plan-sheet__level-chevron${expanded ? ' dev-plan-sheet__level-chevron--open' : ''}`}>
            expand_more
          </span>
        )}
      </div>

      {/* XP bar — current level only, hidden pre-assignment */}
      {isCurrent && isAssigned && (
        <div className="dev-plan-sheet__xp">
          <div className="dev-plan-sheet__xp-header">
            <span className="dev-plan-sheet__xp-label">Module progress</span>
            <span className="dev-plan-sheet__xp-pct">
              {isAssigned ? `${xpPct}%` : '—'}
            </span>
          </div>
          <div className="dev-plan-sheet__xp-track">
            <div
              className="dev-plan-sheet__xp-fill"
              style={{ width: isAssigned ? `${xpPct}%` : '0%' }}
            />
          </div>
          {isAssigned && (
            <div className="dev-plan-sheet__xp-sub">
              {hoursComplete} of {level.totalHours} hrs complete
            </div>
          )}
        </div>
      )}

      {/* Level body — current always shown; recognized/locked toggled */}
      {(isCurrent || expanded) && (
        <div className="dev-plan-sheet__level-body">
          <hr className="dev-plan-sheet__level-divider" />

          {/* Outcome */}
          <div className="dev-plan-sheet__section-heading">Outcome</div>
          <p className="dev-plan-sheet__outcome">{level.outcome}</p>

          {/* Courses */}
          <div className="dev-plan-sheet__section-heading">Courses</div>
          <div className="dev-plan-sheet__courses">
            {level.courses.map((c, i) => (
              <CourseItem key={i} course={c} recognized={isRecognized} />
            ))}
          </div>

          {/* Tasks */}
          <div className="dev-plan-sheet__section-heading">Practice Tasks</div>
          <div className="dev-plan-sheet__tasks">
            {level.tasks.map((t, i) => (
              <TaskItem key={i} task={t} recognized={isRecognized} />
            ))}
            {level.coachTask && onCoachTask && !isRecognized && (
              <CoachTaskItem
                task={level.coachTask}
                onOpen={() => onCoachTask(level.coachTask!)}
              />
            )}
          </div>
        </div>
      )}

      {/* Locked gate row */}
      {isLocked && !expanded && (
        <div className="dev-plan-sheet__gate">
          <div className="dev-plan-sheet__gate-info">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
            Complete Module {level.id - 1} to unlock
          </div>
        </div>
      )}
    </div>
  )
}

// ── DevPlanSheet ──────────────────────────────────────────────────────────────

export function DevPlanSheet({ employee, open, onClose, isAssigned, inline, view = 'full', selfView = false }: DevPlanSheetProps) {
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const [modified, setModified] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [activeUnlock, setActiveUnlock] = useState<'doors' | 'risk' | 'skills' | null>(null)

  // Reset state when a different employee's plan is opened
  useEffect(() => {
    setModified(false)
    setRegenerating(false)
    setExpandedLevels(new Set())
    setActiveUnlock(null)
  }, [employee?.name])

  function handleRegenerate() {
    setRegenerating(true)
    setTimeout(() => {
      setRegenerating(false)
      setModified(true)
    }, 1500)
  }

  if (!open || !employee) return null

  const planComplete = (employee.planPct ?? 0) === 100
  const recognizedCount = planComplete ? 4 : 0
  const levels = buildLevels(employee)

  // Derive XP per level from name hash (only shown for current/override levels)
  function getXpPct(levelId: number) {
    if (planComplete) return 100
    if (!isAssigned) return 0
    return Math.min(80, 10 + (nameHash(employee!.name + levelId) % 71))
  }

  function getLevelState(levelId: number): LevelState {
    if (planComplete) return 'recognized'
    if (levelId <= recognizedCount) return 'recognized'
    // Pre-assignment: all steps enabled for manager review
    if (!isAssigned) return 'current'
    if (levelId === recognizedCount + 1) return 'current'
    return 'locked'
  }

  function toggleExpand(levelId: number) {
    setExpandedLevels(prev => {
      const next = new Set(prev)
      next.has(levelId) ? next.delete(levelId) : next.add(levelId)
      return next
    })
  }

  // Footer stats
  const totalAdoptionPts = levels.reduce((s, l) => s + l.adoptionPts, 0)
  const remainingLevels = planComplete ? [] : levels.filter(l => l.id > recognizedCount)
  const remainingAdoptionPts = planComplete ? 0 : remainingLevels.reduce((s, l) => s + l.adoptionPts, 0)
  const projectedScore = Math.min(100, employee.readinessPct + totalAdoptionPts)
  const potentialPct = planComplete ? 0 : projectedScore - employee.displayReadiness

  // Completion unlocks
  const firstName = employee.name.split(' ')[0]
  const unlocks = getUnlocks(employee.name, employee.title, employee.displayReadiness, planComplete ? totalAdoptionPts : 0)

  const showScore      = view === 'full' || view === 'score'      || !inline
  const showStats      = view === 'full' || view === 'stats'      || !inline
  const showCurriculum = view === 'full' || view === 'curriculum' || !inline
  const showUnlocks    = view === 'full' || view === 'unlocks'    || !inline
  const showHeader     = view === 'full' || !inline
  const showFooter     = view === 'full' || !inline
  const showBanner     = planComplete && (view === 'full' || view === 'score' || !inline)

  const panelContent = (
    <div
      className="dev-plan-sheet__panel"
      onClick={(e) => e.stopPropagation()}
      style={inline ? { position: 'relative', top: 'auto', right: 'auto', bottom: 'auto', maxWidth: '100%', boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: 16, maxHeight: '80vh', overflowY: 'auto' } : undefined}
    >
      {/* Header */}
      {showHeader && (
        <div className="dev-plan-sheet__header">
          <div className="dev-plan-sheet__header-info">
            <h2 className="dev-plan-sheet__name">{employee.name}</h2>
            <div className="dev-plan-sheet__meta">
              {employee.title && <span>{employee.title}</span>}
              {employee.title && <span style={{ color: '#e2e8f0' }}>·</span>}
              <span>Development plan</span>
            </div>
          </div>
          <button type="button" className="dev-plan-sheet__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
      )}

      {/* Completion banner */}
      {showBanner && (
        <div style={{ margin: '16px 24px 0', borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(135deg, #065f46 0%, #047857 40%, #059669 100%)', color: '#fff', position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div style={{ position: 'relative', padding: '20px 20px 16px', display: 'flex', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#fbbf24' }}>emoji_events</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Plan complete</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3, lineHeight: 1.5 }}>
                AI adoption score increased by <strong style={{ color: '#fff' }}>+{totalAdoptionPts} pts</strong> — {selfView ? 'you are' : `${firstName} is`} now AI-ready.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Adoption Score */}
      {showScore && (
        <div style={{ padding: '20px 24px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 14 }}>AI Adoption Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: planComplete ? '#15803d' : '#0f172a', lineHeight: 1, minWidth: 60 }}>{employee.readinessPct}<span style={{ fontSize: 18, fontWeight: 600, color: planComplete ? '#15803d' : '#64748b' }}>%</span></div>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ height: 12, borderRadius: 6, background: '#f1f5f9', position: 'relative', overflow: 'visible' }}>
                <BarWithTip
                  style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${employee.readinessPct}%`, borderRadius: 6, background: planComplete ? 'linear-gradient(90deg, #15803d, #22c55e)' : '#22c55e' }}
                  tip={`Baseline · ${employee.readinessPct}%`}
                />
                {potentialPct > 0 && (
                  <BarWithTip
                    style={{ position: 'absolute', left: `${employee.readinessPct}%`, top: 0, height: '100%', width: `${projectedScore - employee.readinessPct}%`, borderRadius: '0 6px 6px 0', background: '#6366f1', opacity: 0.5 }}
                    tip={`After plan · ${projectedScore}% (+${remainingAdoptionPts} pts)`}
                  />
                )}
                <div style={{ position: 'absolute', left: '50%', top: -3, bottom: -3, width: 2, background: '#22c55e', borderRadius: 1 }} />
                {potentialPct > 0 && (
                  <div style={{ position: 'absolute', left: `${employee.displayReadiness}%`, top: -9, transform: 'translateX(-50%)', zIndex: 2, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #16a34a' }} />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, position: 'relative' }}>
                <span style={{ fontSize: 10, color: '#cbd5e1' }}>0%</span>
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 600, color: '#15803d', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 10 }}>verified</span>
                  AI-Ready
                </span>
                <span style={{ fontSize: 10, color: '#cbd5e1' }}>100%</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, paddingLeft: 76 }}>
            {planComplete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#15803d' }}>check_circle</span>
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>All 4 modules completed · +{totalAdoptionPts} pts earned</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid #16a34a' }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>Current · <strong style={{ color: '#0f172a' }}>{employee.readinessPct}%</strong></span>
                </div>
                {potentialPct > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: '#6366f1', opacity: 0.5 }} />
                    <span style={{ fontSize: 11, color: '#64748b' }}>After plan · <strong style={{ color: '#0f172a' }}>{projectedScore}%</strong></span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#6366f1', background: '#eff3ff', border: '1px solid #c5d3f8', borderRadius: 8, padding: '0px 5px' }}>+{remainingAdoptionPts}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="dev-plan-sheet__body">

        {/* Stats bar */}
        {showStats && (
          <div style={{ marginBottom: 24 }}>
            <DevPlanStatsBar
              adoptionGain={planComplete ? totalAdoptionPts : potentialPct}
              planComplete={planComplete}
              totalHours={levels.reduce((s, l) => s + l.totalHours, 0)}
              actualHours={planComplete ? levels.reduce((s, l) => s + l.totalHours, 0) - (nameHash(employee.name) % 6 + 1) : undefined}
              actualWeeks={planComplete ? 7 + (nameHash(employee.name + 'wk') % 3) : undefined}
            />
          </div>
        )}

        {/* Curriculum */}
        {showCurriculum && (
          <>
            <div className="dev-plan-sheet__curriculum-heading">Curriculum · {levels.length} modules</div>
            {levels.map(level => {
              const state = getLevelState(level.id)
              return (
                <LevelCard
                  key={level.id}
                  level={level}
                  state={state}
                  xpPct={getXpPct(level.id)}
                  isAssigned={isAssigned}
                  expanded={expandedLevels.has(level.id)}
                  onToggle={() => toggleExpand(level.id)}
                  completedAt={planComplete ? getCompletedDate(employee.name, level.id) : undefined}
                />
              )
            })}
          </>
        )}

        {/* Completion unlocks */}
        {showUnlocks && (
          <div className="dev-plan-sheet__unlocks">
            <div className="dev-plan-sheet__unlocks-heading">
              {planComplete
                ? selfView ? 'What this plan unlocked for you' : `What this plan unlocked for ${firstName}`
                : selfView ? 'What completing this plan unlocks for you' : `What completing this plan unlocks for ${firstName}`}
            </div>
            <div className="dev-plan-sheet__unlocks-badges">
              {([
                { id: 'doors' as const, value: String(unlocks.doorCount), label: 'Career doors unlock', detail: `Top: ${unlocks.topRole} (${unlocks.topFit}% fit)`, color: 'var(--color-blue-60)', gid: 'udg-blue' },
                { id: 'risk' as const,  value: `−${unlocks.riskDrop}%`,   label: 'Automation risk drop', detail: `${unlocks.currentRisk}% now → ${unlocks.pathsTo}%`, color: 'var(--color-green-60)', gid: 'udg-green' },
                { id: 'skills' as const, value: String(unlocks.aiSkills.length), label: 'AI skills gained', detail: unlocks.aiSkills.join(', '), color: 'var(--color-violet-60)', gid: 'udg-violet' },
              ]).map(({ id, value, label, detail, color, gid }) => {
                const isActive = activeUnlock === id
                return (
                  <button
                    key={gid}
                    type="button"
                    className={`dev-plan-sheet__unlock-badge-item${isActive ? ' dev-plan-sheet__unlock-badge-item--active' : ''}`}
                    onClick={() => setActiveUnlock(isActive ? null : id)}
                    style={{ '--unlock-color': color } as React.CSSProperties}
                  >
                    <svg className="dev-plan-sheet__unlock-shield" viewBox="0 0 100 114" fill="none">
                      <defs>
                        <linearGradient id={gid} x1="0" y1="0" x2="100" y2="114" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" style={{ stopColor: color, stopOpacity: isActive ? 0.35 : 0.18 }} />
                          <stop offset="100%" style={{ stopColor: color, stopOpacity: isActive ? 0.12 : 0.05 }} />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 50 5 L 95 22 L 95 68 C 95 91 75 106 50 111 C 25 106 5 91 5 68 L 5 22 Z"
                        fill={`url(#${gid})`}
                        stroke={color}
                        strokeWidth={isActive ? 3 : 2.5}
                      />
                      <text
                        x="50" y="62"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: value.length > 3 ? '18px' : '26px',
                          fontWeight: 900,
                          fill: color,
                          letterSpacing: '-0.03em',
                          fontFamily: 'inherit',
                        }}
                      >{value}</text>
                      {planComplete && (
                        <>
                          <circle cx="83" cy="97" r="12" fill="#15803d" />
                          <path d="M78 97 L82 101 L89 92" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </>
                      )}
                    </svg>
                    <div className="dev-plan-sheet__unlock-badge-label">{label}</div>
                    <div className="dev-plan-sheet__unlock-badge-detail">{detail}</div>
                  </button>
                )
              })}
            </div>

            {activeUnlock === 'doors' && (
              <div className="dev-plan-sheet__unlock-panel">
                <div className="dev-plan-sheet__unlock-panel-heading">Potential new roles</div>
                <div className="dev-plan-sheet__unlock-panel-roles">
                  {unlocks.allRoles.map(({ role, fit, baseFit }) => {
                    const gain = fit - baseFit
                    return (
                      <div key={role} className="dev-plan-sheet__unlock-role-row">
                        <span className="dev-plan-sheet__unlock-role-name">{role}</span>
                        <div className="dev-plan-sheet__unlock-role-bar-wrap" style={{ display: 'flex' }}>
                          <div className="dev-plan-sheet__unlock-role-bar" style={{ width: `${baseFit}%`, borderRadius: gain > 0 ? '3px 0 0 3px' : undefined }} />
                          {gain > 0 && <div style={{ height: '100%', width: `${gain}%`, background: 'var(--color-green-60)', borderRadius: '0 3px 3px 0' }} />}
                        </div>
                        <span className="dev-plan-sheet__unlock-role-fit" style={{ width: gain > 0 ? 64 : undefined }}>
                          {gain > 0 ? <><strong style={{ color: '#15803d' }}>{fit}%</strong> <span style={{ fontSize: 10, color: '#15803d', fontWeight: 600 }}>+{gain}</span></> : `${fit}% fit`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeUnlock === 'risk' && (
              <div className="dev-plan-sheet__unlock-panel">
                <div className="dev-plan-sheet__unlock-panel-heading">Automation risk summary</div>
                <p className="dev-plan-sheet__unlock-panel-body">
                  {selfView ? 'Your' : `${firstName}'s`} current role has a <strong>{unlocks.currentRisk}% automation risk</strong> — meaning most routine tasks could be automated without AI fluency.
                  Completing this plan develops the judgment, prompt skills, and oversight capabilities that place {selfView ? 'you' : firstName} firmly in the <em>augmentation zone</em>, dropping exposure to just {unlocks.pathsTo}%.
                </p>
                <div className="dev-plan-sheet__unlock-risk-bars">
                  <div className="dev-plan-sheet__unlock-risk-row">
                    <span>Current risk</span>
                    <div className="dev-plan-sheet__unlock-role-bar-wrap">
                      <div className="dev-plan-sheet__unlock-role-bar dev-plan-sheet__unlock-role-bar--risk" style={{ width: `${unlocks.currentRisk}%` }} />
                    </div>
                    <span>{unlocks.currentRisk}%</span>
                  </div>
                  <div className="dev-plan-sheet__unlock-risk-row">
                    <span>After plan</span>
                    <div className="dev-plan-sheet__unlock-role-bar-wrap">
                      <div className="dev-plan-sheet__unlock-role-bar dev-plan-sheet__unlock-role-bar--safe" style={{ width: `${unlocks.pathsTo}%` }} />
                    </div>
                    <span>{unlocks.pathsTo}%</span>
                  </div>
                </div>
              </div>
            )}

            {activeUnlock === 'skills' && (
              <div className="dev-plan-sheet__unlock-panel">
                <div className="dev-plan-sheet__unlock-panel-heading">Skills {selfView ? 'you' : firstName} will gain</div>
                <div className="dev-plan-sheet__unlock-skills-cloud">
                  {unlocks.aiSkills.map(skill => (
                    <Tag key={skill} className="dev-plan-sheet__skill-tag">{skill}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="dev-plan-sheet__footer">
          <div className="dev-plan-sheet__footer-left">
            <Button variant="secondary" aria-label="Share">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
            </Button>
            <Button variant="secondary" aria-label="Download">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
            </Button>
          </div>
          <div className="dev-plan-sheet__footer-actions">
            <Button variant="secondary" onClick={handleRegenerate} disabled={regenerating}>
              <span className={`material-symbols-outlined dev-plan-sheet__regen-icon${regenerating ? ' dev-plan-sheet__regen-icon--spinning' : ''}`} style={{ fontSize: 15 }}>
                {regenerating ? 'sync' : 'auto_awesome'}
              </span>
              {regenerating ? 'Regenerating…' : 'Regenerate plan'}
            </Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
            {modified && <Button variant="primary" onClick={onClose}>Save changes</Button>}
          </div>
        </div>
      )}
    </div>
  )

  if (inline) return panelContent

  return createPortal(
    <div className="dev-plan-sheet__root">
      <div className="dev-plan-sheet__backdrop" onClick={onClose} />
      {panelContent}
    </div>,
    document.body
  )
}
