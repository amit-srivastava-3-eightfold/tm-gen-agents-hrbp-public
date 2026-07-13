import * as Dialog from '@radix-ui/react-dialog'
import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button, Stepper, StepperList, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperSeparator, Tabs, TabsList, TabsTrigger, DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableHead, DataTableCell } from '@tonyh-2-eightfold/ef-design-system'
import { departments, hrbpAssignments, deptGapHeadcount, formatHours } from '../../data/wfrOrgData'
import './FocusFirstLaunchDialog.css'

export type FocusAssignOwner = 'hrbp' | 'self'

export type FocusCollectionLaunchSummary = {
  assignOwner: FocusAssignOwner
  scopeLabel: string
  channelsLabel: string
  delegated: boolean
  scopedDepartmentNames: string[]
  selectedHrbpNames?: string[]
}

export type HrbpDirector = {
  name: string
  title: string
  employees: number
  teamManagers: number
  readiness?: number
  readyCount?: number
  aiPotential?: number
}

export type CampaignLaunchData = {
  name: string
  typeId: string
  typeLabel: string
  typeIcon: string
  teamNames: string[]
  employeeCount: number
  channelLabel: string
  periodStart: string
  periodEnd: string
  isRecurring: boolean
  recurringFreq: string
}

export type CampaignDraftData = {
  name: string
  typeId: string
  typeLabel: string
  typeIcon: string
  periodStart: string
  periodEnd: string
  isRecurring: boolean
  recurringFreq: string
}

export interface FocusFirstLaunchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLaunch?: (summary: FocusCollectionLaunchSummary) => void
  initialStep?: 1 | 2 | 3 | 4
  defaultScopeDepartmentName?: string
  /** When true, show simplified dialog: Channels + Review only (for HRBP-initiated collection) */
  hrbpMode?: boolean
  /** Callback for HRBP mode launch — passes channels label and selected director names */
  onHrbpLaunch?: (channelsLabel: string, selectedDirectors?: string[]) => void
  /** Full campaign launch data — used by the campaigns tab to create a campaign record */
  onCampaignLaunch?: (data: CampaignLaunchData) => void
  /** Save as draft — called when user saves before launching */
  onSaveAsDraft?: (data: CampaignDraftData) => void
  /** Directors/client managers for HRBP team selection */
  hrbpDirectors?: HrbpDirector[]
}

type CollectionTypeOption = {
  id: string
  label: string
  desc: string
  icon: string
  lastRun: string | null
  responses: number | null
  learnMoreUrl: string
  supportsProfileUpdates: boolean
}

const COLLECTION_TYPE_OPTIONS: CollectionTypeOption[] = [
  {
    id: 'ai-adoption',
    label: 'AI Adoption Assessment',
    desc: "Measure how much of your team's work AI can augment and how ready employees are to use it. Identifies the transformation gap and informs role-specific upskilling plans.",
    icon: 'smart_toy',
    lastRun: 'May 2026',
    responses: 312,
    learnMoreUrl: 'https://help.eightfold.ai/collection/ai-adoption',
    supportsProfileUpdates: true,
  },
  {
    id: 'skills-checkin',
    label: 'Skills Check-in',
    desc: 'Capture current skill levels across your team to identify strengths and development areas. Employees self-assess against role-specific competencies.',
    icon: 'checklist',
    lastRun: 'Mar 2026',
    responses: 142,
    learnMoreUrl: 'https://help.eightfold.ai/collection/skills-checkin',
    supportsProfileUpdates: false,
  },
  {
    id: 'engagement-pulse',
    label: 'Engagement Pulse',
    desc: 'Measure employee sentiment and engagement levels with short, frequent pulse surveys. Track trends over time and spot early warning signs.',
    icon: 'favorite',
    lastRun: 'Apr 2026',
    responses: 218,
    learnMoreUrl: 'https://help.eightfold.ai/collection/engagement-pulse',
    supportsProfileUpdates: false,
  },
  {
    id: 'manager-effectiveness',
    label: 'Manager Effectiveness',
    desc: 'Gather upward feedback on manager behaviors across communication, coaching, and inclusion. Helps managers grow and supports succession planning.',
    icon: 'supervisor_account',
    lastRun: null,
    responses: null,
    learnMoreUrl: 'https://help.eightfold.ai/collection/manager-effectiveness',
    supportsProfileUpdates: false,
  },
  {
    id: 'career-intent',
    label: 'Career Intent',
    desc: 'Understand where employees see their career heading — retention risk, internal mobility interest, and growth aspirations — to inform workforce planning.',
    icon: 'trending_up',
    lastRun: 'Jan 2026',
    responses: 97,
    learnMoreUrl: 'https://help.eightfold.ai/collection/career-intent',
    supportsProfileUpdates: false,
  },
  {
    id: 'benefits-feedback',
    label: 'Benefits Feedback',
    desc: 'Collect structured feedback on benefits utilization and satisfaction to help HR optimize benefits offerings for the next cycle.',
    icon: 'health_and_safety',
    lastRun: 'Dec 2025',
    responses: 331,
    learnMoreUrl: 'https://help.eightfold.ai/collection/benefits-feedback',
    supportsProfileUpdates: false,
  },
  {
    id: 'learning-needs',
    label: 'Learning Needs Assessment',
    desc: "Identify skill gaps and learning priorities before planning L&D programs. Aligns training investment with employees' actual development needs.",
    icon: 'school',
    lastRun: 'Feb 2026',
    responses: 189,
    learnMoreUrl: 'https://help.eightfold.ai/collection/learning-needs',
    supportsProfileUpdates: false,
  },
  {
    id: 'onboarding-checkin',
    label: 'Onboarding Check-in',
    desc: 'Pulse new hires at 30, 60, and 90 days to surface friction points early and improve time-to-productivity.',
    icon: 'waving_hand',
    lastRun: 'May 2026',
    responses: 44,
    learnMoreUrl: 'https://help.eightfold.ai/collection/onboarding-checkin',
    supportsProfileUpdates: false,
  },
  {
    id: 'custom-campaign',
    label: 'Blank Template',
    desc: "Design your own campaign from scratch. Describe the purpose, what data you want to collect, and any special instructions — in plain language. The AI will shape the conversation accordingly.",
    icon: 'edit_note',
    lastRun: null,
    responses: null,
    learnMoreUrl: '#',
    supportsProfileUpdates: false,
  },
]

const PRESET_COLLECTION_TYPES = COLLECTION_TYPE_OPTIONS.filter(c => c.id !== 'custom-campaign')
const CUSTOM_COLLECTION_TYPE = COLLECTION_TYPE_OPTIONS.find(c => c.id === 'custom-campaign')!

const CUSTOM_CAMPAIGN_SAMPLE = `Example: "We're launching this ahead of our hybrid work policy update. I want to understand how employees feel about the change and what their preferences are.\n\nData to capture:\n• Preferred number of in-office days per week\n• Top concerns about the hybrid model\n• Whether they feel they have the right tools to work remotely\n• Any specific support they need from their manager\n\nKeep the tone conversational. Avoid yes/no questions — push for specifics."`

const CHANNEL_OPTIONS = [
  { id: 'profile-updates', label: 'Profile updates', desc: 'Employees update their skill profiles directly — no interviews required.', icon: 'manage_accounts' },
  { id: 'surveys', label: 'Surveys', desc: 'Short structured questionnaires sent to employees on a schedule.', icon: 'poll' },
  { id: 'ai-interviews', label: 'AI Interviews', desc: 'Conversational AI agent interviews each employee about their role and AI usage.', icon: 'smart_toy', recommended: true },
]

type TeamColDef = { label: string; tooltip?: string }
type TeamColConfig = {
  cols: TeamColDef[]
  cells: (dir: HrbpDirector, idx: number, hrbpDept: { hrsUnlocked: number; employees: number } | null) => string[]
  priorityTooltip: string
}

const TEAM_COLUMNS_BY_TYPE: Record<string, TeamColConfig> = {
  'ai-adoption': {
    cols: [
      { label: 'AI adoption', tooltip: 'Share of employees actively using AI for augmentable tasks' },
      { label: 'Productivity potential', tooltip: 'Est. weekly hours unlocked if team reaches AI readiness target' },
      { label: 'Transformation gap', tooltip: 'Employees in augmentable roles not yet AI-ready' },
    ],
    cells: (dir, _idx, hrbpDept) => {
      const notReady = dir.employees - (dir.readyCount ?? 0)
      const hrsUnlocked = dir.employees > 0 && hrbpDept ? Math.round(hrbpDept.hrsUnlocked * dir.employees / Math.max(1, hrbpDept.employees)) : 0
      return [
        `${dir.readiness ?? 0}%`,
        formatHours(hrsUnlocked),
        `${notReady.toLocaleString()} (${dir.employees > 0 ? Math.round((notReady / dir.employees) * 100) : 0}%)`,
      ]
    },
    priorityTooltip: 'Largest team — most employees to include in data collection',
  },
  'skills-checkin': {
    cols: [
      { label: 'Profile completion', tooltip: 'Share of employees with a complete skill profile' },
      { label: 'Open skill gaps', tooltip: 'Roles where critical skills are unmet against requirements' },
      { label: 'Last assessed', tooltip: 'When this team last completed a skills check-in' },
    ],
    cells: (dir, idx) => {
      const completion = Math.min(94, Math.round(62 + (dir.readiness ?? 50) * 0.3 + idx * 3))
      const gaps = Math.max(1, Math.round(dir.employees * 0.12 + idx * 0.5))
      const dates = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Never', 'Apr 2026']
      return [`${completion}%`, gaps.toString(), dates[idx % dates.length]]
    },
    priorityTooltip: 'Lowest profile completion — prioritize for skills data quality',
  },
  'engagement-pulse': {
    cols: [
      { label: 'Engagement score', tooltip: 'Average score from last pulse (out of 5)' },
      { label: 'Response rate', tooltip: 'Participation rate in the most recent pulse' },
      { label: 'At-risk employees', tooltip: 'Employees scoring below the engagement threshold' },
    ],
    cells: (dir, idx) => {
      const score = Math.min(4.8, 3.2 + (dir.readiness ?? 50) * 0.015 + idx * 0.1)
      const responseRate = Math.min(96, 68 + idx * 4)
      const atRisk = Math.max(1, Math.round(dir.employees * Math.max(0.05, 0.25 - (dir.readiness ?? 50) * 0.002)))
      return [`${score.toFixed(1)} / 5`, `${responseRate}%`, atRisk.toLocaleString()]
    },
    priorityTooltip: 'Lowest engagement score — most urgent for pulse outreach',
  },
  'manager-effectiveness': {
    cols: [
      { label: 'Direct reports', tooltip: 'Number of managers in this team eligible for 360 feedback' },
      { label: 'Last rating', tooltip: 'Avg manager effectiveness score from most recent 360 (out of 5)' },
      { label: '360 participation', tooltip: 'Share of direct reports who completed last feedback cycle' },
    ],
    cells: (dir, idx) => {
      const reports = dir.teamManagers ?? Math.max(2, Math.round(dir.employees / 8))
      const rating = Math.min(4.8, 3.5 + (dir.readiness ?? 50) * 0.01 + idx * 0.08)
      const participation = Math.min(92, 55 + idx * 6)
      return [reports.toString(), `${rating.toFixed(1)} / 5`, `${participation}%`]
    },
    priorityTooltip: 'Largest team — most managers to include in effectiveness review',
  },
  'career-intent': {
    cols: [
      { label: 'Flight risk', tooltip: 'Share of employees flagged as at-risk of leaving in next 6 months' },
      { label: 'Mobility interest', tooltip: 'Share interested in internal role moves based on prior surveys' },
      { label: 'Avg tenure', tooltip: 'Average years at the company for employees in this team' },
    ],
    cells: (dir, idx) => {
      const flightRisk = Math.max(5, Math.round(35 - (dir.readiness ?? 50) * 0.3 + idx * 2))
      const mobility = Math.min(55, 18 + idx * 5)
      const tenure = (2.5 + idx * 0.4).toFixed(1)
      return [`${flightRisk}%`, `${mobility}%`, `${tenure} yrs`]
    },
    priorityTooltip: 'Highest flight risk — most urgent for career intent data',
  },
  'benefits-feedback': {
    cols: [
      { label: 'Enrollment rate', tooltip: 'Share of employees enrolled in at least one benefits program' },
      { label: 'Utilization rate', tooltip: 'Share of enrolled employees who actively used a benefit last quarter' },
      { label: 'Pending responses', tooltip: 'Employees who have not yet responded to the last benefits survey' },
    ],
    cells: (dir, idx) => {
      const enrollment = Math.min(98, 82 + idx * 2)
      const utilization = Math.min(88, Math.round(58 + (dir.readiness ?? 50) * 0.4 + idx))
      const pending = Math.max(0, Math.round(dir.employees * Math.max(0.04, 0.15 - idx * 0.01)))
      return [`${enrollment}%`, `${utilization}%`, pending.toLocaleString()]
    },
    priorityTooltip: 'Lowest utilization — most to gain from benefits feedback',
  },
  'learning-needs': {
    cols: [
      { label: 'Avg learning hrs/qtr', tooltip: 'Average hours of formal learning completed per employee last quarter' },
      { label: 'Open skill gaps', tooltip: 'Roles in this team with unmet critical skill requirements' },
      { label: 'Plan completion', tooltip: 'Share of employees who completed their last assigned development plan' },
    ],
    cells: (dir, idx) => {
      const hrs = Math.round(8 + idx * 3 + (dir.readiness ?? 50) * 0.1)
      const gaps = Math.max(1, Math.round(dir.employees * 0.3 - idx * 2))
      const completion = Math.min(90, Math.round(40 + (dir.readiness ?? 50) * 0.5 + idx * 2))
      return [`${hrs} hrs`, gaps.toLocaleString(), `${completion}%`]
    },
    priorityTooltip: 'Most open skill gaps — highest learning needs priority',
  },
  'onboarding-checkin': {
    cols: [
      { label: 'New hires (90d)', tooltip: 'Employees who joined in the last 90 days and are in the onboarding window' },
      { label: 'Avg days onboard', tooltip: 'Average number of days since start date for current new hires' },
      { label: 'Check-in completion', tooltip: 'Share of new hires who completed their last scheduled check-in' },
    ],
    cells: (dir, idx) => {
      const newHires = Math.max(1, Math.round(dir.employees * 0.06 - idx * 0.3))
      const avgDays = Math.round(45 + idx * 8)
      const completion = Math.min(96, 60 + idx * 6)
      return [`${newHires}`, `${avgDays}d`, `${completion}%`]
    },
    priorityTooltip: 'Most new hires — largest onboarding cohort to check in with',
  },
  'custom-campaign': {
    cols: [
      { label: 'Team size', tooltip: 'Total number of employees in this team' },
      { label: 'Last contacted', tooltip: 'When this team was last included in a data collection campaign' },
      { label: 'Avg response rate', tooltip: 'Participation rate from most recent campaign run' },
    ],
    cells: (dir, idx) => {
      const lastContacted = ['Jan 2026', 'Mar 2026', 'Never', 'Apr 2026', 'Feb 2026', 'May 2026'][idx % 6]
      const rate = Math.min(90, 55 + idx * 5)
      return [dir.employees.toLocaleString(), lastContacted, `${rate}%`]
    },
    priorityTooltip: 'Largest team — broadest reach for your custom campaign',
  },
}

// Unique HRBPs with their departments, headcount, and priority score
const uniqueHrbps = (() => {
  const map = new Map<string, { hrbp: string; depts: string[]; headcount: number }>()
  for (const a of hrbpAssignments) {
    if (!map.has(a.hrbp)) map.set(a.hrbp, { hrbp: a.hrbp, depts: [], headcount: 0 })
    const entry = map.get(a.hrbp)!
    entry.depts.push(a.dept)
    entry.headcount += a.headcount
  }
  return [...map.values()].map(row => {
    const deptObjs = row.depts.map(name => departments.find(d => d.name === name)).filter(Boolean) as typeof departments
    const totalHc = deptObjs.reduce((s, d) => s + d.employees, 0) || row.headcount
    const avgPotential = totalHc > 0 ? Math.round(deptObjs.reduce((s, d) => s + d.aiPotential * d.employees, 0) / totalHc) : 0
    const avgReadiness = totalHc > 0 ? Math.round(deptObjs.reduce((s, d) => s + d.aiReadiness * d.employees, 0) / totalHc) : 0
    const priorityScore = (avgPotential - avgReadiness) * (avgPotential - avgReadiness) / 100
    const totalHrsUnlocked = deptObjs.reduce((s, d) => s + d.hrsUnlocked, 0)
    return { ...row, avgPotential, avgReadiness, priorityScore, totalHrsUnlocked }
  }).sort((a, b) => b.totalHrsUnlocked - a.totalHrsUnlocked)
})()

// Top ~30% of HRBPs by priority score get the Priority tag
const hrbpPrioritySet = (() => {
  if (uniqueHrbps.length === 0) return new Set<string>()
  const count = Math.max(1, Math.round(uniqueHrbps.length * 0.3))
  return new Set(uniqueHrbps.slice(0, count).map(h => h.hrbp))
})()

// ─── Preview generation ───────────────────────────────────────────────────────

type TranscriptTurn = { role: 'ai' | 'employee'; text: string }
type SurveyQuestion = { id: string; text: string; type: 'open' | 'rating' | 'choice' }

function extractTopics(text: string): string[] {
  return text
    .replace(/[•\-\*]|\d+\./g, '\n')
    .split(/[\n,;]+/)
    .map(s => s.replace(/^(capture|include|understand|measure|track|ask about|collect)\s+/i, '').trim())
    .filter(s => s.length > 6 && s.length < 100)
    .slice(0, 6)
}

function generateAITranscript(purpose: string, dataCapture: string, seed: number): TranscriptTurn[] {
  const topics = extractTopics(dataCapture)
  const t = (i: number) => (topics[i] ?? topics[Math.max(0, topics.length - 1)] ?? 'your experience').toLowerCase()
  const shortPurpose = (purpose.split(/[.\n]/)[0] ?? purpose).trim().toLowerCase()

  const variants: TranscriptTurn[][] = [
    [
      { role: 'ai', text: `Thanks for making time. We're running this to better understand ${shortPurpose}. To start — ${t(0)}, can you walk me through how that looks for you right now?` },
      { role: 'employee', text: `Sure. Honestly, it's mixed. Some days it works well, but there are friction points I keep running into that nobody seems to be fixing.` },
      { role: 'ai', text: `Appreciate the honesty. When you say friction — what comes up most around ${t(1)}?` },
      { role: 'employee', text: `Mostly a lack of clarity on expectations. I end up making assumptions that don't always land the way I intended.` },
      { role: 'ai', text: `That's a useful signal. Shifting to ${t(2)} — what would meaningful improvement actually look like from where you sit?` },
      { role: 'employee', text: `More proactive communication from my manager, and clearer norms across the team. Right now it feels inconsistent — some people get more flexibility than others.` },
      { role: 'ai', text: `Understood. Last one — if you could change one thing about ${t(3) !== t(2) ? t(3) : 'how things work here'}, what would have the biggest impact?` },
      { role: 'employee', text: `I'd want leadership to actually act on feedback. It's demotivating when you share something and nothing visibly changes.` },
    ],
    [
      { role: 'ai', text: `Hi, good to connect. We're gathering input on ${shortPurpose}. Starting simple — how satisfied are you with ${t(0)} overall, and why?` },
      { role: 'employee', text: `I'd say a 3 out of 5. The basics are covered, but it's not great. There's a gap between what's promised and what I actually experience day to day.` },
      { role: 'ai', text: `A 3 — helpful. What's the single biggest thing holding it back from a 4 or 5?` },
      { role: 'employee', text: `${topics[1] ? `Honestly, ${t(1)}.` : 'Consistency.'} We have the right intentions but the follow-through is inconsistent. It depends too much on who your manager is.` },
      { role: 'ai', text: `Can you give me a specific example of that inconsistency?` },
      { role: 'employee', text: `Yeah — last quarter the process changed twice without warning. By the time I'd adapted, it had already shifted again. No explanation.` },
      { role: 'ai', text: `That's a pattern worth surfacing. When it comes to ${t(2)}, do you feel you have the support you need?` },
      { role: 'employee', text: `In 1:1s, yes. But my manager doesn't always have visibility into the day-to-day blockers, so the support is there in spirit but not always in practice.` },
    ],
    [
      { role: 'ai', text: `Hi, happy to chat. Your input on ${shortPurpose} really matters to us. In your own words — how would you describe ${t(0)} right now?` },
      { role: 'employee', text: `It's something I think about a lot. For me it comes down to having the right environment and the right information to do good work. I have one, not always the other.` },
      { role: 'ai', text: `Which one are you missing more often — environment or information?` },
      { role: 'employee', text: `Information, for sure. I find out about decisions after they've already been made. That's frustrating, especially when the decision directly affects my work.` },
      { role: 'ai', text: `That makes sense. On ${t(1) !== t(0) ? t(1) : 'that topic'} — what would "better" actually look like in practice?` },
      { role: 'employee', text: `Proactive communication. Don't wait for me to ask — tell me what's changing and why, before I hear it through the grapevine.` },
      { role: 'ai', text: `Absolutely. One more area — ${t(2)}. How are you feeling about that?` },
      { role: 'employee', text: `Cautiously optimistic. I see the path forward, but I'd like more intentional support from my manager to actually get there.` },
    ],
  ]
  return variants[seed % variants.length]
}

function generateSurveyQuestions(purpose: string, dataCapture: string, seed: number): SurveyQuestion[] {
  const topics = extractTopics(dataCapture)
  const shortPurpose = (purpose.split(/[.\n]/)[0] ?? purpose).trim().toLowerCase()
  const typeRotation: SurveyQuestion['type'][] = ['rating', 'open', 'choice', 'open', 'rating', 'open']

  const questions: SurveyQuestion[] = [
    { id: 'q-0', text: `Overall, how satisfied are you with ${shortPurpose || 'the current situation'}? (1 = not at all, 5 = very satisfied)`, type: 'rating' },
  ]

  topics.slice(0, 5).forEach((topic, i) => {
    const type = typeRotation[(i + seed) % typeRotation.length]
    const text = type === 'rating'
      ? `How would you rate ${topic.toLowerCase()} on a scale of 1–5?`
      : type === 'choice'
        ? `Which best describes your experience with ${topic.toLowerCase()}?`
        : `In your own words, what would improve ${topic.toLowerCase()}?`
    questions.push({ id: `q-${i + 1}`, text, type })
  })

  questions.push({ id: `q-${questions.length}`, text: "Is there anything else you'd like us to know?", type: 'open' })
  return questions
}

function PriorityTooltip({ tooltip, children }: { tooltip: string; children: ReactNode }) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<{ cx: number; y: number } | null>(null)
  const [left, setLeft] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (anchor && tipRef.current) {
      const w = tipRef.current.offsetWidth
      const clamped = Math.max(8, Math.min(window.innerWidth - w - 8, anchor.cx - w / 2))
      setLeft(clamped)
      setReady(true)
    }
  }, [anchor])

  return (
    <span
      ref={triggerRef}
      style={{ display: 'inline-flex', flexShrink: 0 }}
      onMouseEnter={() => {
        const r = triggerRef.current?.getBoundingClientRect()
        if (r) { setReady(false); setAnchor({ cx: r.left + r.width / 2, y: r.top }) }
      }}
      onMouseLeave={() => { setAnchor(null); setReady(false) }}
    >
      {children}
      {anchor && createPortal(
        <div ref={tipRef} style={{ position: 'fixed', top: anchor.y - 6, left, transform: 'translateY(-100%)', opacity: ready ? 1 : 0, background: '#1e293b', color: '#fff', fontSize: 12, fontWeight: 400, lineHeight: 1.5, borderRadius: 6, padding: '7px 10px', maxWidth: 160, zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', pointerEvents: 'none' }}>
          {tooltip}
          <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1e293b' }} />
        </div>,
        document.body
      )}
    </span>
  )
}

export function FocusFirstLaunchDialog({
  open,
  onOpenChange,
  onLaunch,
  defaultScopeDepartmentName: _defaultScope,
  hrbpMode = false,
  onHrbpLaunch,
  onCampaignLaunch,
  onSaveAsDraft,
  hrbpDirectors,
}: FocusFirstLaunchDialogProps) {
  const [step, setStep] = useState(1)
  const [selectedCollectionType, setSelectedCollectionType] = useState<string>('ai-adoption')
  const [campaignName, setCampaignName] = useState('')
  const campaignNameManual = useRef(false)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFreq, setRecurringFreq] = useState('monthly')
  const [selectedChannel, setSelectedChannel] = useState<string>('ai-interviews')
  const [assignOwner, setAssignOwner] = useState<FocusAssignOwner>('hrbp')
  const [scopeBy, setScopeBy] = useState<'hrbps' | 'departments'>('hrbps')
  const [selectedDepts, setSelectedDepts] = useState<Record<string, boolean>>({})
  const [selectedHrbps, setSelectedHrbps] = useState<Record<string, boolean>>({})
  const [hrbpSelectedDirs, setHrbpSelectedDirs] = useState<Record<string, boolean>>({})
  const [customPurpose, setCustomPurpose] = useState('')
  const [customDataCapture, setCustomDataCapture] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')
  const [showCustomSample, setShowCustomSample] = useState(false)
  const [previewMode, setPreviewMode] = useState<'ai-interview' | 'survey'>('ai-interview')
  const [previewSeed, setPreviewSeed] = useState(0)
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([])
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [showNextHint, setShowNextHint] = useState(false)
  const nextHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setStep(1)
      setAssignOwner('hrbp')
      setScopeBy('hrbps')
      setSelectedDepts({})
      setSelectedHrbps({})
      // Default all directors selected
      if (hrbpDirectors?.length) {
        const all: Record<string, boolean> = {}
        hrbpDirectors.forEach(d => { all[d.name] = true })
        setHrbpSelectedDirs(all)
      } else {
        setHrbpSelectedDirs({})
      }
      setSelectedCollectionType('ai-adoption')
      const d = new Date()
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      setCampaignName(`AI Adoption Assessment · ${months[d.getMonth()]} ${d.getFullYear()}`)
      campaignNameManual.current = false
      setPeriodStart('')
      setPeriodEnd('')
      setIsRecurring(false)
      setRecurringFreq('monthly')
      setSelectedChannel('ai-interviews')
      setCustomPurpose('')
      setCustomDataCapture('')
      setCustomInstructions('')
      setShowCustomSample(false)
      setPreviewMode('ai-interview')
      setPreviewSeed(0)
      setSurveyQuestions([])
      setEditingQuestionId(null)
    }
  }, [open, hrbpDirectors])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
  }

  const delegated = assignOwner === 'hrbp'

  // Both flows: Assign → Scope → Review (channel is org-level config, not a user choice)

  // Derive selected HRBP names from either direct selection or department-based derivation
  const selectedHrbpNames = useMemo(() => {
    if (scopeBy === 'hrbps') {
      return Object.keys(selectedHrbps).filter(k => selectedHrbps[k])
    }
    // Derive HRBPs from selected departments
    const selDepts = Object.keys(selectedDepts).filter(k => selectedDepts[k])
    if (selDepts.length === 0) return []
    const deptSet = new Set(selDepts)
    const hrbpSet = new Set<string>()
    for (const a of hrbpAssignments) {
      if (deptSet.has(a.dept)) hrbpSet.add(a.hrbp)
    }
    return [...hrbpSet]
  }, [scopeBy, selectedHrbps, selectedDepts])

  const scopedDeptNames = useMemo(() => {
    if (scopeBy === 'departments') {
      const selDepts = Object.keys(selectedDepts).filter(k => selectedDepts[k])
      return selDepts.length > 0 ? selDepts : departments.map(d => d.name)
    }
    // Derive departments from selected HRBPs
    if (selectedHrbpNames.length === 0) return departments.map(d => d.name)
    const deptSet = new Set<string>()
    for (const a of hrbpAssignments) {
      if (selectedHrbpNames.includes(a.hrbp)) deptSet.add(a.dept)
    }
    return [...deptSet]
  }, [scopeBy, selectedDepts, selectedHrbpNames])

  const hasSelection = scopeBy === 'hrbps' ? selectedHrbpNames.length > 0
    : Object.keys(selectedDepts).filter(k => selectedDepts[k]).length > 0

  const scopeLabel = useMemo(() => {
    if (scopeBy === 'hrbps') {
      if (selectedHrbpNames.length === 0) return `All ${uniqueHrbps.length} HRBPs`
      if (selectedHrbpNames.length === 1) return selectedHrbpNames[0]
      return `${selectedHrbpNames.length} HRBPs`
    }
    const selDepts = Object.keys(selectedDepts).filter(k => selectedDepts[k])
    if (selDepts.length === 0) return `All ${departments.length} departments`
    if (selDepts.length === 1) return selDepts[0]
    return `${selDepts.length} departments`
  }, [scopeBy, selectedHrbpNames, selectedDepts])

  const canNext = step === 1 ? true
    : step === 2 ? hasSelection
    : step === 3 ? true
    : true

  const isReviewStep = step === 3

  const handleLaunch = () => {
    onLaunch?.({
      assignOwner,
      scopeLabel,
      channelsLabel: 'AI Agent Interviews',
      delegated,
      scopedDepartmentNames: scopedDeptNames,
      selectedHrbpNames: delegated ? selectedHrbpNames : undefined,
    })
    onOpenChange(false)
  }

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  // ─── HRBP mode: 3-step dialog (select teams → channels → review + launch) ───
  if (hrbpMode) {
    const hrbpDept = _defaultScope ? departments.find(dd => dd.name === _defaultScope) : null
    const rawDirs = hrbpDirectors ?? []
    // Sort directors by unrealized value (matches overview table sort)
    const dirs = [...rawDirs].sort((a, b) => b.employees - a.employees)
    const dirPriorityCount = Math.max(1, Math.round(dirs.length * 0.3))
    const dirPrioritySet = new Set(dirs.slice(0, dirPriorityCount).map(d => d.name))
    const hrbpSelCount = Object.values(hrbpSelectedDirs).filter(Boolean).length
    const hrbpAllSelected = hrbpSelCount === dirs.length
    const hrbpSelectedEmps = dirs.filter(d => hrbpSelectedDirs[d.name]).reduce((s, d) => s + d.employees, 0)
    const hrbpStep = step // reuse existing step state
    const isCustom = selectedCollectionType === 'custom-campaign'
    const hrbpIsPreview = isCustom && hrbpStep === 2
    const hrbpIsTeams = isCustom ? hrbpStep === 3 : hrbpStep === 2
    const hrbpIsChannels = isCustom ? hrbpStep === 4 : hrbpStep === 3
    const hrbpIsReview = isCustom ? hrbpStep === 5 : hrbpStep === 4
    const channelsLabel = CHANNEL_OPTIONS.find(c => c.id === selectedChannel)?.label ?? 'None'
    const collectionTypeLabel = COLLECTION_TYPE_OPTIONS.find(c => c.id === selectedCollectionType)?.label ?? 'None'
    const hrbpTeamLabel = hrbpSelCount === dirs.length
      ? `All ${dirs.length} teams`
      : hrbpSelCount === 1
        ? dirs.find(d => hrbpSelectedDirs[d.name])?.name ?? '1 team'
        : `${hrbpSelCount} teams`

    return (
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="wfr-focus-launch__overlay" />
          <Dialog.Content
            className="wfr-focus-launch__content"
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <div className="wfr-focus-launch__header">
              <div className="wfr-focus-launch__header-top">
                <Dialog.Title className="wfr-focus-launch__dialog-title">Launch data collection</Dialog.Title>
                <Dialog.Close className="wfr-focus-launch__close" aria-label="Close">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                </Dialog.Close>
              </div>
              <Stepper value={hrbpStep - 1} size="sm" className="mt-3 mb-4" style={{ maxWidth: isCustom ? 560 : 480 }}>
                <StepperList>
                  <StepperItem step={0}>
                    <StepperTrigger>
                      <StepperIndicator />
                      <StepperTitle>Type</StepperTitle>
                    </StepperTrigger>
                  </StepperItem>
                  <StepperSeparator />
                  {isCustom && (
                    <>
                      <StepperItem step={1}>
                        <StepperTrigger>
                          <StepperIndicator />
                          <StepperTitle>Preview</StepperTitle>
                        </StepperTrigger>
                      </StepperItem>
                      <StepperSeparator />
                    </>
                  )}
                  <StepperItem step={isCustom ? 2 : 1}>
                    <StepperTrigger>
                      <StepperIndicator />
                      <StepperTitle>Teams</StepperTitle>
                    </StepperTrigger>
                  </StepperItem>
                  <StepperSeparator />
                  <StepperItem step={isCustom ? 3 : 2}>
                    <StepperTrigger>
                      <StepperIndicator />
                      <StepperTitle>Channels</StepperTitle>
                    </StepperTrigger>
                  </StepperItem>
                  <StepperSeparator />
                  <StepperItem step={isCustom ? 4 : 3}>
                    <StepperTrigger>
                      <StepperIndicator />
                      <StepperTitle>Review</StepperTitle>
                    </StepperTrigger>
                  </StepperItem>
                </StepperList>
              </Stepper>
            </div>
            <Dialog.Description className="sr-only">Select teams and launch AI-powered data collection.</Dialog.Description>
            <div className="wfr-focus-launch__body">

              {/* Step 1: Collection type */}
              {hrbpStep === 1 && (() => {
                const selectedTypeDef = COLLECTION_TYPE_OPTIONS.find(c => c.id === selectedCollectionType) ?? null
                const isCustom = selectedCollectionType === 'custom-campaign'
                const inputStyle: React.CSSProperties = { width: '100%', fontSize: 13, padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }
                const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }
                const hintStyle: React.CSSProperties = { fontSize: 11, color: '#94a3b8', marginTop: 3 }

                const typeListItem = (ct: CollectionTypeOption) => {
                  const sel = selectedCollectionType === ct.id
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => {
                        setSelectedCollectionType(ct.id)
                        if (!campaignNameManual.current) {
                          const d = new Date()
                          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                          setCampaignName(ct.id === 'custom-campaign' ? `Custom Campaign · ${months[d.getMonth()]} ${d.getFullYear()}` : `${ct.label} · ${months[d.getMonth()]} ${d.getFullYear()}`)
                        }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7,
                        border: sel ? '1.5px solid var(--wfr-potential-text, #6366f1)' : '1.5px solid transparent',
                        background: sel ? '#eef2ff' : 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.1s',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: sel ? 'var(--wfr-potential-text, #6366f1)' : '#94a3b8', flexShrink: 0 }}>{ct.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? '#1e293b' : '#475569', lineHeight: 1.3 }}>{ct.label}</span>
                    </button>
                  )
                }

                return (
                  <div style={{ display: 'flex', gap: 16, minHeight: 380 }}>
                    {/* Left: type list */}
                    <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Collection type</p>
                      {PRESET_COLLECTION_TYPES.map(ct => typeListItem(ct))}

                      {/* Divider before blank template */}
                      <div style={{ margin: '8px 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>Custom</span>
                        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                      </div>

                      {/* Blank template — styled to stand out */}
                      {(() => {
                        const ct = CUSTOM_COLLECTION_TYPE
                        const sel = selectedCollectionType === ct.id
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCollectionType(ct.id)
                              if (!campaignNameManual.current) {
                                const d = new Date()
                                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                                setCampaignName(`Custom Campaign · ${months[d.getMonth()]} ${d.getFullYear()}`)
                              }
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 7,
                              border: sel ? '1.5px solid #f97316' : '1.5px dashed #cbd5e1',
                              background: sel ? '#fff7ed' : 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.1s, border-color 0.1s',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: sel ? '#f97316' : '#94a3b8', flexShrink: 0 }}>{ct.icon}</span>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: sel ? 600 : 500, color: sel ? '#c2410c' : '#475569', display: 'block', lineHeight: 1.3 }}>{ct.label}</span>
                              <span style={{ fontSize: 11, color: sel ? '#ea580c' : '#94a3b8' }}>Build your own</span>
                            </div>
                          </button>
                        )
                      })()}
                    </div>

                    {/* Right: detail panel */}
                    <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto' }}>
                      {!selectedTypeDef ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', gap: 8 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 32 }}>arrow_back</span>
                          <p style={{ fontSize: 13 }}>Select a type to see details</p>
                        </div>
                      ) : (
                        <>
                          {/* Type summary */}
                          <div style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: isCustom ? '#c2410c' : '#1e293b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                              {isCustom && <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#f97316' }}>edit_note</span>}
                              {selectedTypeDef.label}
                            </p>
                            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 8 }}>{selectedTypeDef.desc}</p>
                            {!isCustom && (
                              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>history</span>
                                  {selectedTypeDef.lastRun ? `Last run: ${selectedTypeDef.lastRun}` : 'Never run'}
                                </span>
                                {selectedTypeDef.responses !== null && (
                                  <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
                                    {selectedTypeDef.responses} responses
                                  </span>
                                )}
                                <a href={selectedTypeDef.learnMoreUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--wfr-potential-text, #6366f1)', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>open_in_new</span>
                                  Learn more
                                </a>
                              </div>
                            )}
                          </div>

                          <div style={{ height: 1, background: '#e2e8f0', marginBottom: 12 }} />

                          {/* Campaign name */}
                          <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>Campaign name</label>
                            <input
                              type="text"
                              value={campaignName}
                              onChange={e => { setCampaignName(e.target.value); campaignNameManual.current = true }}
                              placeholder={isCustom ? 'e.g. Hybrid Work Preferences · Jul 2026' : 'e.g. Engagement Pulse · Jun 2026'}
                              style={inputStyle}
                            />
                            <p style={hintStyle}>Defaults to type + month. Edit to give this campaign a custom name.</p>
                          </div>

                          {/* Custom-only: purpose + data + instructions */}
                          {isCustom && (
                            <>
                              <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>
                                  Purpose <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                  value={customPurpose}
                                  onChange={e => setCustomPurpose(e.target.value)}
                                  placeholder="What is this campaign trying to understand or achieve? e.g. Understand how employees feel about the upcoming office relocation."
                                  rows={3}
                                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }}
                                />
                              </div>

                              <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>
                                  What data do you want to capture? <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                  value={customDataCapture}
                                  onChange={e => setCustomDataCapture(e.target.value)}
                                  placeholder="List the specific questions or data points you want from employees. e.g. Preferred commute days, top concerns, tools needed."
                                  rows={3}
                                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }}
                                />
                              </div>

                              <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Special instructions <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                                <textarea
                                  value={customInstructions}
                                  onChange={e => setCustomInstructions(e.target.value)}
                                  placeholder="Tone, format, anything the AI should keep in mind. e.g. Keep it conversational, avoid yes/no questions."
                                  rows={2}
                                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }}
                                />
                              </div>

                              {/* Sample instruction */}
                              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 4 }}>
                                <button
                                  type="button"
                                  onClick={() => setShowCustomSample(v => !v)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#64748b', textAlign: 'left' }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#94a3b8' }}>lightbulb</span>
                                  See an example
                                  <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 'auto', color: '#94a3b8', transform: showCustomSample ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>expand_more</span>
                                </button>
                                {showCustomSample && (
                                  <div style={{ padding: '0 12px 12px', borderTop: '1px solid #e2e8f0' }}>
                                    <pre style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, margin: '10px 0 0', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{CUSTOM_CAMPAIGN_SAMPLE}</pre>
                                  </div>
                                )}
                              </div>
                            </>
                          )}

                          {/* Period */}
                          <div style={{ marginBottom: 12, marginTop: isCustom ? 12 : 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Collection period <span style={{ color: '#ef4444' }}>*</span></p>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Start date</label>
                                <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} style={inputStyle} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>End date</label>
                                <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} style={inputStyle} />
                              </div>
                            </div>
                          </div>

                          {/* Recurrence */}
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Frequency</p>
                            <div style={{ display: 'flex', gap: 8, marginBottom: isRecurring ? 10 : 0 }}>
                              {(['one-time', 'recurring'] as const).map(opt => {
                                const sel = isRecurring ? opt === 'recurring' : opt === 'one-time'
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setIsRecurring(opt === 'recurring')}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6, border: sel ? '1.5px solid var(--wfr-potential-text, #6366f1)' : '1.5px solid #e2e8f0', background: sel ? '#eef2ff' : '#fff', fontSize: 13, color: sel ? 'var(--wfr-potential-text, #6366f1)' : '#475569', fontWeight: sel ? 600 : 400, cursor: 'pointer' }}
                                  >
                                    <span className="wfr-focus-launch__radio" style={{ width: 13, height: 13, minWidth: 13 }}>
                                      {sel ? <span className="wfr-focus-launch__radio-dot" /> : null}
                                    </span>
                                    {opt === 'one-time' ? 'One-time' : 'Recurring'}
                                  </button>
                                )
                              })}
                            </div>
                            {isRecurring && (
                              <div>
                                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Repeat every</label>
                                <select
                                  value={recurringFreq}
                                  onChange={e => setRecurringFreq(e.target.value)}
                                  style={{ fontSize: 13, padding: '5px 28px 5px 8px', borderRadius: 6, border: '1px solid #cbd5e1', color: '#1e293b', background: '#fff', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%2364748b\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                                >
                                  <option value="weekly">Week</option>
                                  <option value="biweekly">2 Weeks</option>
                                  <option value="monthly">Month</option>
                                  <option value="quarterly">Quarter</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Step 2 (custom only): Preview */}
              {hrbpIsPreview && (() => {
                const transcript = generateAITranscript(customPurpose, customDataCapture, previewSeed)
                const handleRegenerate = () => {
                  const next = previewSeed + 1
                  setPreviewSeed(next)
                  setSurveyQuestions(generateSurveyQuestions(customPurpose, customDataCapture, next))
                }
                const handleEnterPreview = () => {
                  if (surveyQuestions.length === 0) {
                    setSurveyQuestions(generateSurveyQuestions(customPurpose, customDataCapture, previewSeed))
                  }
                }
                if (surveyQuestions.length === 0) handleEnterPreview()

                const inputStyle: React.CSSProperties = { width: '100%', fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid #cbd5e1', color: '#1e293b', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5, fontFamily: 'inherit', resize: 'vertical' as const }
                const sectionLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em', margin: '0 0 6px' }

                return (
                  <div style={{ display: 'flex', gap: 16, minHeight: 420 }}>
                    {/* Left: editable prompts */}
                    <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                      <div>
                        <p style={sectionLabel}>Refine prompts</p>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.5 }}>Edit your prompts and regenerate to refine the output.</p>
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Purpose <span style={{ color: '#ef4444' }}>*</span></label>
                        <textarea value={customPurpose} onChange={e => setCustomPurpose(e.target.value)} rows={3} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Data to capture <span style={{ color: '#ef4444' }}>*</span></label>
                        <textarea value={customDataCapture} onChange={e => setCustomDataCapture(e.target.value)} rows={4} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Special instructions <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                        <textarea value={customInstructions} onChange={e => setCustomInstructions(e.target.value)} rows={2} style={inputStyle} />
                      </div>
                    </div>

                    {/* Right: preview */}
                    <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0 }}>
                      {/* Mode toggle + regenerate */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
                          {(['ai-interview', 'survey'] as const).map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setPreviewMode(m)
                                if (m === 'survey' && surveyQuestions.length === 0) {
                                  setSurveyQuestions(generateSurveyQuestions(customPurpose, customDataCapture, previewSeed))
                                }
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.1s', background: previewMode === m ? '#fff' : 'transparent', color: previewMode === m ? '#6366f1' : '#94a3b8', boxShadow: previewMode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{m === 'ai-interview' ? 'forum' : 'checklist'}</span>
                              {m === 'ai-interview' ? 'AI Interview' : 'Survey'}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleRegenerate()
                            if (previewMode === 'survey') {
                              setSurveyQuestions(generateSurveyQuestions(customPurpose, customDataCapture, previewSeed + 1))
                            }
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#6366f1', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 7, padding: '5px 11px', cursor: 'pointer' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
                          Regenerate
                        </button>
                      </div>

                      {/* AI Interview transcript */}
                      {previewMode === 'ai-interview' && (
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                          <p style={{ ...sectionLabel, marginBottom: 10 }}>Sample conversation</p>
                          <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.5 }}>This is how an employee conversation might unfold based on your prompts. The AI adapts in real conversations — this is illustrative.</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {transcript.map((turn, i) => {
                              const isAI = turn.role === 'ai'
                              return (
                                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: isAI ? 'row' : 'row-reverse' }}>
                                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isAI ? '#eef2ff' : '#f1f5f9', fontSize: 13 }}>
                                    {isAI ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#6366f1' }}>smart_toy</span> : <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b' }}>person</span>}
                                  </div>
                                  <div style={{ maxWidth: '78%' }}>
                                    <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', margin: '0 0 3px', textAlign: isAI ? 'left' : 'right', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isAI ? 'AI Interviewer' : 'Employee'}</p>
                                    <div style={{ background: isAI ? '#f8fafc' : '#eef2ff', border: `1px solid ${isAI ? '#e2e8f0' : '#c7d2fe'}`, borderRadius: isAI ? '4px 12px 12px 12px' : '12px 4px 12px 12px', padding: '8px 12px' }}>
                                      <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.55 }}>{turn.text}</p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Survey question list */}
                      {previewMode === 'survey' && (
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                          <p style={{ ...sectionLabel, marginBottom: 10 }}>Generated questions</p>
                          <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.5 }}>Edit questions inline. Click Regenerate to get a new set based on your prompts.</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {surveyQuestions.map((q, i) => (
                              <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: editingQuestionId === q.id ? '#f0f4ff' : '#f8fafc', border: `1px solid ${editingQuestionId === q.id ? '#c7d2fe' : '#e2e8f0'}`, borderRadius: 8, padding: '8px 10px', transition: 'border-color 0.15s' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', minWidth: 18, marginTop: 2 }}>{i + 1}.</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {editingQuestionId === q.id ? (
                                    <textarea
                                      autoFocus
                                      value={q.text}
                                      onChange={e => setSurveyQuestions(prev => prev.map(sq => sq.id === q.id ? { ...sq, text: e.target.value } : sq))}
                                      onBlur={() => setEditingQuestionId(null)}
                                      rows={2}
                                      style={{ width: '100%', fontSize: 13, padding: '3px 6px', borderRadius: 5, border: '1px solid #c7d2fe', color: '#1e293b', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
                                    />
                                  ) : (
                                    <p
                                      style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.5, cursor: 'text' }}
                                      onClick={() => setEditingQuestionId(q.id)}
                                      title="Click to edit"
                                    >{q.text}</p>
                                  )}
                                  <span style={{ fontSize: 10, fontWeight: 600, color: q.type === 'rating' ? '#6366f1' : q.type === 'choice' ? '#f97316' : '#22c55e', background: q.type === 'rating' ? '#eef2ff' : q.type === 'choice' ? '#fff7ed' : '#f0fdf4', borderRadius: 6, padding: '1px 6px', display: 'inline-block', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {q.type === 'rating' ? '1–5 rating' : q.type === 'choice' ? 'Multiple choice' : 'Open text'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                  <button type="button" onClick={() => setEditingQuestionId(q.id)} title="Edit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                                  </button>
                                  <button type="button" onClick={() => setSurveyQuestions(prev => prev.filter(sq => sq.id !== q.id))} title="Delete" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setSurveyQuestions(prev => [...prev, { id: `q-custom-${prev.length}`, text: 'New question', type: 'open' }])}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 8, border: '1.5px dashed #cbd5e1', background: 'transparent', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 2 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
                              Add question
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Step 2/3: Select client manager teams */}
              {hrbpIsTeams && (() => {
                const colConfig = TEAM_COLUMNS_BY_TYPE[selectedCollectionType] ?? TEAM_COLUMNS_BY_TYPE['ai-adoption']
                return (
                  <>
                    <h2 className="wfr-focus-launch__title">Select teams to include</h2>
                    <p className="wfr-focus-launch__sub">Choose which client manager teams to include in the <strong>{collectionTypeLabel}</strong>. Employees in selected teams will be contacted via the method you choose next.</p>

                    <div className="wfr-focus-launch__dept-list">
                      <div className="wfr-focus-launch__table-wrap"><DataTable className="wfr-focus-launch__table" style={{ width: '100%' }}>
                        <DataTableHeader>
                          <DataTableRow>
                            <DataTableHead style={{ width: 28, padding: '8px 0 8px 14px' }}>
                              <span
                                className="wfr-focus-launch__check"
                                style={{ cursor: 'pointer', ...(hrbpAllSelected ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}) }}
                                onClick={() => { if (hrbpAllSelected) setHrbpSelectedDirs({}); else { const all: Record<string, boolean> = {}; dirs.forEach(d => { all[d.name] = true }); setHrbpSelectedDirs(all) } }}
                              >{hrbpAllSelected ? '✓' : ''}</span>
                            </DataTableHead>
                            <DataTableHead>Manager</DataTableHead>
                            <DataTableHead numeric>{colConfig.cols[0].label}</DataTableHead>
                            <DataTableHead numeric>{colConfig.cols[1].label}</DataTableHead>
                            <DataTableHead numeric>{colConfig.cols[2].label}</DataTableHead>
                          </DataTableRow>
                        </DataTableHeader>
                        <DataTableBody>
                          {dirs.map((dir, idx) => {
                            const cells = colConfig.cells(dir, idx, hrbpDept)
                            return (
                              <DataTableRow key={dir.name} onClick={() => setHrbpSelectedDirs(prev => ({ ...prev, [dir.name]: !prev[dir.name] }))} style={{ cursor: 'pointer', ...(hrbpSelectedDirs[dir.name] ? { background: '#eef2ff' } : {}) }}>
                                <DataTableCell style={{ width: 28, padding: '10px 0 10px 14px' }}>
                                  <span className="wfr-focus-launch__check" style={hrbpSelectedDirs[dir.name] ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}}>{hrbpSelectedDirs[dir.name] ? '✓' : ''}</span>
                                </DataTableCell>
                                <DataTableCell className="font-semibold">
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {dir.name}
                                    {dirPrioritySet.has(dir.name) && (
                                      <PriorityTooltip tooltip={colConfig.priorityTooltip}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>Priority</span>
                                      </PriorityTooltip>
                                    )}
                                  </span>
                                </DataTableCell>
                                <DataTableCell align="right">{cells[0]}</DataTableCell>
                                <DataTableCell align="right">{cells[1]}</DataTableCell>
                                <DataTableCell align="right">{cells[2]}</DataTableCell>
                              </DataTableRow>
                            )
                          })}
                        </DataTableBody>
                      </DataTable></div>
                    </div>
                  </>
                )
              })()}

              {/* Step 3: Channels */}
              {hrbpIsChannels && (() => {
                const selectedTypeDef = COLLECTION_TYPE_OPTIONS.find(c => c.id === selectedCollectionType)
                const availableChannels = CHANNEL_OPTIONS.filter(ch =>
                  ch.id !== 'profile-updates' || (selectedTypeDef?.supportsProfileUpdates ?? false)
                )
                return (
                <>
                  <h2 className="wfr-focus-launch__title">How should we collect data?</h2>
                  <p className="wfr-focus-launch__sub">Choose how you want to reach employees for the <strong>{collectionTypeLabel}</strong>.</p>
                  <div className="wfr-focus-launch__options" style={{ gap: 10 }}>
                    {availableChannels.map((ch) => {
                      const selected = selectedChannel === ch.id
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          className={`wfr-focus-launch__option ${selected ? 'wfr-focus-launch__option--selected' : ''}`}
                          onClick={() => setSelectedChannel(ch.id)}
                          style={{ alignItems: 'flex-start', gap: 12 }}
                        >
                          <span className="wfr-focus-launch__radio" style={{ marginTop: 2, flexShrink: 0 }}>
                            {selected ? <span className="wfr-focus-launch__radio-dot" /> : null}
                          </span>
                          <span className="wfr-focus-launch__option-text">
                            <span className="wfr-focus-launch__option-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16, color: selected ? 'var(--wfr-potential-text, #6366f1)' : '#94a3b8' }}>{ch.icon}</span>
                              {ch.label}
                              {ch.recommended && <span style={{ fontSize: 10, fontWeight: 600, color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 8, padding: '1px 7px' }}>Recommended</span>}
                            </span>
                            <span className="wfr-focus-launch__option-desc">{ch.desc}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </>
                )
              })()}

              {/* Step 4: Review */}
              {hrbpIsReview && (
                <>
                  <h2 className="wfr-focus-launch__title">Ready to launch</h2>
                  <p className="wfr-focus-launch__sub">Review your selections.</p>
                  <div className="wfr-focus-launch__review">
                    <div className="wfr-focus-launch__review-row">
                      <div>
                        <p className="wfr-focus-launch__review-k">Campaign name</p>
                        <p className="wfr-focus-launch__review-v">{campaignName || collectionTypeLabel}</p>
                      </div>
                      <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <div className="wfr-focus-launch__review-row">
                      <div>
                        <p className="wfr-focus-launch__review-k">Collection type</p>
                        <p className="wfr-focus-launch__review-v">{collectionTypeLabel}</p>
                      </div>
                    </div>
                    {selectedCollectionType === 'custom-campaign' && customPurpose && (
                      <div className="wfr-focus-launch__review-row">
                        <div style={{ flex: 1 }}>
                          <p className="wfr-focus-launch__review-k">Purpose</p>
                          <p className="wfr-focus-launch__review-v" style={{ whiteSpace: 'pre-wrap' }}>{customPurpose}</p>
                        </div>
                        <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(1)}>Edit</button>
                      </div>
                    )}
                    {selectedCollectionType === 'custom-campaign' && customDataCapture && (
                      <div className="wfr-focus-launch__review-row">
                        <div style={{ flex: 1 }}>
                          <p className="wfr-focus-launch__review-k">Data to capture</p>
                          <p className="wfr-focus-launch__review-v" style={{ whiteSpace: 'pre-wrap' }}>{customDataCapture}</p>
                        </div>
                        <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(1)}>Edit</button>
                      </div>
                    )}
                    {selectedCollectionType === 'custom-campaign' && customInstructions && (
                      <div className="wfr-focus-launch__review-row">
                        <div style={{ flex: 1 }}>
                          <p className="wfr-focus-launch__review-k">Special instructions</p>
                          <p className="wfr-focus-launch__review-v" style={{ whiteSpace: 'pre-wrap' }}>{customInstructions}</p>
                        </div>
                        <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(1)}>Edit</button>
                      </div>
                    )}
                    <div className="wfr-focus-launch__review-row">
                      <div>
                        <p className="wfr-focus-launch__review-k">Teams</p>
                        <p className="wfr-focus-launch__review-v">{hrbpTeamLabel} · {hrbpSelectedEmps.toLocaleString()} employees</p>
                      </div>
                      <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(2)}>Edit</button>
                    </div>
                    <div className="wfr-focus-launch__review-row">
                      <div>
                        <p className="wfr-focus-launch__review-k">Collection method</p>
                        <p className="wfr-focus-launch__review-v">{channelsLabel}</p>
                      </div>
                      <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(3)}>Edit</button>
                    </div>
                    <div className="wfr-focus-launch__review-row">
                      <div>
                        <p className="wfr-focus-launch__review-k">Period</p>
                        <p className="wfr-focus-launch__review-v">{periodStart && periodEnd ? `${periodStart} → ${periodEnd}` : periodStart || 'Not set'}</p>
                      </div>
                      <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <div className="wfr-focus-launch__review-row">
                      <div>
                        <p className="wfr-focus-launch__review-k">Frequency</p>
                        <p className="wfr-focus-launch__review-v">{isRecurring ? `Recurring · ${recurringFreq.charAt(0).toUpperCase() + recurringFreq.slice(1)}` : 'One-time'}</p>
                      </div>
                      <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(1)}>Edit</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            {(() => {
              const nextHint = hrbpIsReview ? null
                : hrbpStep === 1 ? (
                    !periodStart && !periodEnd ? 'Set a start and end date to continue'
                    : !periodStart ? 'Set a start date to continue'
                    : !periodEnd ? 'Set an end date to continue'
                    : isCustom && !customPurpose.trim() ? 'Describe the purpose of this campaign to continue'
                    : isCustom && !customDataCapture.trim() ? 'Describe what data to capture to continue'
                    : null
                  )
                : hrbpIsTeams && hrbpSelCount === 0 ? 'Select at least one team to continue'
                : hrbpIsChannels && !selectedChannel ? 'Choose a collection method to continue'
                : null

              const handleNextClick = () => {
                if (nextHint) {
                  setShowNextHint(true)
                  if (nextHintTimer.current) clearTimeout(nextHintTimer.current)
                  nextHintTimer.current = setTimeout(() => setShowNextHint(false), 3000)
                  return
                }
                setShowNextHint(false)
                setStep(hrbpStep + 1)
              }

              return (
                <div className="wfr-focus-launch__footer">
                  {hrbpStep === 1 ? (
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                  ) : (
                    <Button type="button" variant="secondary" onClick={() => { setShowNextHint(false); setStep(hrbpStep - 1) }}>Back</Button>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {onSaveAsDraft && selectedCollectionType && (
                      <Button type="button" variant="secondary" onClick={() => {
                        const typeDef = COLLECTION_TYPE_OPTIONS.find(c => c.id === selectedCollectionType)
                        onSaveAsDraft({ name: campaignName || collectionTypeLabel, typeId: selectedCollectionType, typeLabel: collectionTypeLabel, typeIcon: typeDef?.icon ?? '', periodStart, periodEnd, isRecurring, recurringFreq })
                        onOpenChange(false)
                      }}>Save as draft</Button>
                    )}
                    {hrbpIsReview ? (
                      <Button type="button" variant="primary" onClick={() => {
                        const selectedDirObjs = dirs.filter(d => hrbpSelectedDirs[d.name])
                        const typeDef = COLLECTION_TYPE_OPTIONS.find(c => c.id === selectedCollectionType)
                        onHrbpLaunch?.(channelsLabel, selectedDirObjs.map(d => d.name))
                        onCampaignLaunch?.({
                          name: campaignName || collectionTypeLabel,
                          typeId: selectedCollectionType,
                          typeLabel: collectionTypeLabel,
                          typeIcon: typeDef?.icon ?? '',
                          teamNames: selectedDirObjs.map(d => d.name),
                          employeeCount: selectedDirObjs.reduce((s, d) => s + d.employees, 0),
                          channelLabel: channelsLabel,
                          periodStart,
                          periodEnd,
                          isRecurring,
                          recurringFreq,
                        })
                        onOpenChange(false)
                      }}>Launch →</Button>
                    ) : (
                      <div style={{ position: 'relative' }} onMouseEnter={() => { if (nextHint) setShowNextHint(true) }} onMouseLeave={() => { if (nextHintTimer.current) clearTimeout(nextHintTimer.current); setShowNextHint(false) }}>
                        {/* Popover — appears on hover or click when blocked */}
                        {showNextHint && nextHint && (
                          <div style={{
                            position: 'absolute', bottom: 'calc(100% + 10px)', right: 0,
                            background: '#1e293b', color: '#fff', fontSize: 12, fontWeight: 500,
                            lineHeight: 1.5, borderRadius: 8, padding: '8px 12px',
                            whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            animation: 'hintFadeIn 0.15s ease',
                            zIndex: 10,
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 5, color: '#fbbf24' }}>warning</span>
                            {nextHint}
                            {/* Arrow */}
                            <div style={{ position: 'absolute', bottom: -5, right: 18, width: 10, height: 10, background: '#1e293b', transform: 'rotate(45deg)', borderRadius: 1 }} />
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="primary"
                          onClick={handleNextClick}
                          style={nextHint ? { opacity: 0.5, cursor: 'default' } : undefined}
                        >Next →</Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }

  // ─── Standard CHRO dialog ───
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="wfr-focus-launch__overlay" />
        <Dialog.Content
          className="wfr-focus-launch__content"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header + Stepper */}
          <div className="wfr-focus-launch__header">
            <div className="wfr-focus-launch__header-top">
              <Dialog.Title className="wfr-focus-launch__dialog-title">Data collection</Dialog.Title>
              <Dialog.Close className="wfr-focus-launch__close" aria-label="Close">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </Dialog.Close>
            </div>
            <Stepper value={step - 1} size="sm" className="mt-3 mb-4" style={{ maxWidth: 360 }}>
              <StepperList>
                <StepperItem step={0}>
                  <StepperTrigger>
                    <StepperIndicator />
                    <StepperTitle>Assign</StepperTitle>
                  </StepperTrigger>
                </StepperItem>
                <StepperSeparator />
                <StepperItem step={1}>
                  <StepperTrigger>
                    <StepperIndicator />
                    <StepperTitle>Scope</StepperTitle>
                  </StepperTrigger>
                </StepperItem>
                <StepperSeparator />
                <StepperItem step={2}>
                  <StepperTrigger>
                    <StepperIndicator />
                    <StepperTitle>Review</StepperTitle>
                  </StepperTrigger>
                </StepperItem>
              </StepperList>
            </Stepper>
          </div>

          <Dialog.Description className="sr-only">
            Step through assignment, scope, channels, and review to launch data collection.
          </Dialog.Description>

          {/* Body */}
          <div className="wfr-focus-launch__body">

            {/* Step 1: Assign */}
            {step === 1 && (
              <>
                <h2 className="wfr-focus-launch__title">Who should manage data collection?</h2>
                <p className="wfr-focus-launch__sub">Assign to HRBPs or manage it yourself.</p>
                <div className="wfr-focus-launch__options">
                  {([
                    { id: 'hrbp' as const, label: 'Assign to HRBPs', desc: 'Each HRBP manages collection for their departments' },
                    { id: 'self' as const, label: "I'll manage it", desc: 'You manage data collection yourself' },
                  ]).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`wfr-focus-launch__option ${assignOwner === opt.id ? 'wfr-focus-launch__option--selected' : ''}`}
                      onClick={() => setAssignOwner(opt.id)}
                    >
                      <span className="wfr-focus-launch__radio">
                        {assignOwner === opt.id ? <span className="wfr-focus-launch__radio-dot" /> : null}
                      </span>
                      <span className="wfr-focus-launch__option-text">
                        <span className="wfr-focus-launch__option-label">{opt.label}</span>
                        <span className="wfr-focus-launch__option-desc">{opt.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Scope — select by Departments or HRBPs */}
            {step === 2 && (
              <>
                <h2 className="wfr-focus-launch__title">Select scope</h2>
                <p className="wfr-focus-launch__sub">Choose departments or HRBPs to include in data collection.</p>

                {/* Toggle: Departments / HRBPs */}
                <Tabs value={scopeBy} onValueChange={(v: string) => setScopeBy(v as 'departments' | 'hrbps')} style={{ marginBottom: 12 }}>
                  <TabsList style={{ width: '100%' }}>
                    <TabsTrigger value="departments" style={{ flex: 1 }}>Departments</TabsTrigger>
                    <TabsTrigger value="hrbps" style={{ flex: 1 }}>HRBPs</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* List */}
                <div className="wfr-focus-launch__dept-list">
                  {scopeBy === 'hrbps'
                    ? (() => {
                        const allHrbpSelected = selectedHrbpNames.length === uniqueHrbps.length
                        return (
                        <div className="wfr-focus-launch__table-wrap"><DataTable className="wfr-focus-launch__table" style={{ width: '100%' }}>
                          <DataTableHeader>
                            <DataTableRow>
                              <DataTableHead style={{ width: 28, padding: '8px 0 8px 14px' }}>
                                <span
                                  className="wfr-focus-launch__check"
                                  style={{ cursor: 'pointer', ...(allHrbpSelected ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}) }}
                                  onClick={() => { if (allHrbpSelected) setSelectedHrbps({}); else { const all: Record<string, boolean> = {}; uniqueHrbps.forEach(h => { all[h.hrbp] = true }); setSelectedHrbps(all) } }}
                                >{allHrbpSelected ? '✓' : ''}</span>
                              </DataTableHead>
                              <DataTableHead>HRBP</DataTableHead>
                              <DataTableHead numeric>AI adoption</DataTableHead>
                              <DataTableHead numeric>Productivity potential</DataTableHead>
                              <DataTableHead numeric>Transformation gap</DataTableHead>
                            </DataTableRow>
                          </DataTableHeader>
                          <DataTableBody>
                            {uniqueHrbps.map((h) => {
                              const hDept = departments.find(dd => dd.name === h.depts[0])
                              const hReadiness = hDept?.aiReadiness ?? 0
                              const hHrsUnlocked = hDept ? Math.round(hDept.hrsUnlocked * h.headcount / Math.max(1, hDept.employees)) : 0
                              const hGap = hDept ? Math.round(deptGapHeadcount(hDept) * h.headcount / Math.max(1, hDept.employees)) : 0
                              return (
                                <DataTableRow key={h.hrbp} onClick={() => setSelectedHrbps((prev) => ({ ...prev, [h.hrbp]: !prev[h.hrbp] }))} style={{ cursor: 'pointer', ...(selectedHrbps[h.hrbp] ? { background: '#eef2ff' } : {}) }}>
                                  <DataTableCell style={{ width: 28, padding: '10px 0 10px 14px' }}>
                                    <span className="wfr-focus-launch__check" style={selectedHrbps[h.hrbp] ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}}>{selectedHrbps[h.hrbp] ? '✓' : ''}</span>
                                  </DataTableCell>
                                  <DataTableCell className="font-semibold">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      {h.hrbp}
                                      {hrbpPrioritySet.has(h.hrbp) && (
                                        <PriorityTooltip tooltip="Highest priority score — widest gap between AI potential and current adoption">
                                          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>Priority</span>
                                        </PriorityTooltip>
                                      )}
                                    </span>
                                  </DataTableCell>
                                  <DataTableCell align="right">{hReadiness}%</DataTableCell>
                                  <DataTableCell align="right">{formatHours(hHrsUnlocked)}</DataTableCell>
                                  <DataTableCell align="right">{hGap.toLocaleString()} ({h.headcount > 0 ? Math.round((hGap / h.headcount) * 100) : 0}%)</DataTableCell>
                                </DataTableRow>
                              )
                            })}
                          </DataTableBody>
                        </DataTable></div>)
                    })()
                    : (() => {
                        const allDeptSelected = Object.keys(selectedDepts).filter(k => selectedDepts[k]).length === departments.length
                        return (
                        <div className="wfr-focus-launch__table-wrap"><DataTable className="wfr-focus-launch__table" style={{ width: '100%' }}>
                          <DataTableHeader>
                            <DataTableRow>
                              <DataTableHead style={{ width: 28, padding: '8px 0 8px 14px' }}>
                                <span
                                  className="wfr-focus-launch__check"
                                  style={{ cursor: 'pointer', ...(allDeptSelected ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}) }}
                                  onClick={() => { if (allDeptSelected) setSelectedDepts({}); else { const all: Record<string, boolean> = {}; departments.forEach(d => { all[d.name] = true }); setSelectedDepts(all) } }}
                                >{allDeptSelected ? '✓' : ''}</span>
                              </DataTableHead>
                              <DataTableHead>Department</DataTableHead>
                              <DataTableHead numeric>AI adoption</DataTableHead>
                              <DataTableHead numeric>Productivity potential</DataTableHead>
                              <DataTableHead numeric>Transformation gap</DataTableHead>
                            </DataTableRow>
                          </DataTableHeader>
                          <DataTableBody>
                            {departments.map((d) => {
                              const gapCount = deptGapHeadcount(d)
                              return (
                                <DataTableRow key={d.name} onClick={() => setSelectedDepts((prev) => ({ ...prev, [d.name]: !prev[d.name] }))} style={{ cursor: 'pointer', ...(selectedDepts[d.name] ? { background: '#eef2ff' } : {}) }}>
                                  <DataTableCell style={{ width: 28, padding: '10px 0 10px 14px' }}>
                                    <span className="wfr-focus-launch__check" style={selectedDepts[d.name] ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}}>{selectedDepts[d.name] ? '✓' : ''}</span>
                                  </DataTableCell>
                                  <DataTableCell className="font-semibold">{d.name}</DataTableCell>
                                  <DataTableCell align="right">{d.aiReadiness}%</DataTableCell>
                                  <DataTableCell align="right">{formatHours(d.hrsUnlocked)}</DataTableCell>
                                  <DataTableCell align="right">{gapCount.toLocaleString()} ({d.employees > 0 ? Math.round((gapCount / d.employees) * 100) : 0}%)</DataTableCell>
                                </DataTableRow>
                              )
                            })}
                          </DataTableBody>
                        </DataTable></div>)
                    })()}
                </div>
              </>
            )}

            {/* Step 3: Review */}
            {isReviewStep && (
              <>
                <h2 className="wfr-focus-launch__title">Ready to launch</h2>
                <p className="wfr-focus-launch__sub">Review your selections.</p>
                <div className="wfr-focus-launch__review">
                  <div className="wfr-focus-launch__review-row">
                    <div>
                      <p className="wfr-focus-launch__review-k">Owner</p>
                      <p className="wfr-focus-launch__review-v">{delegated ? 'HRBPs' : 'You'}</p>
                    </div>
                    <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <div className="wfr-focus-launch__review-row">
                    <div>
                      <p className="wfr-focus-launch__review-k">Scope</p>
                      <p className="wfr-focus-launch__review-v">{scopeLabel}</p>
                    </div>
                    <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(2)}>Edit</button>
                  </div>
                  <div className="wfr-focus-launch__review-row">
                    <div>
                      <p className="wfr-focus-launch__review-k">Collection method</p>
                      <p className="wfr-focus-launch__review-v" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src="/ai-agent-icon.svg" alt="" style={{ width: 16, height: 16 }} />
                        AI Agent Interviews
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="wfr-focus-launch__footer">
            {step === 1 ? (
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            ) : (
              <Button type="button" variant="secondary" onClick={handleBack}>Back</Button>
            )}
            {isReviewStep ? (
              <Button type="button" variant="primary" onClick={handleLaunch}>Launch →</Button>
            ) : (
              <Button type="button" variant="primary" onClick={handleNext} disabled={!canNext}>Next →</Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
