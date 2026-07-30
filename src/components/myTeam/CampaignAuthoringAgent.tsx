import { useState, useRef, useEffect, useCallback } from 'react'
import { type CampaignLaunchData } from '../workforceReadiness/FocusFirstLaunchDialog'
import './CampaignAuthoringAgent.css'

// ─── Types ────────────────────────────────────────────────────────────────────

type ChipOption = { label: string; value: string; icon?: string }

type Message = {
  id: string
  role: 'agent' | 'user'
  text: string
  chips?: ChipOption[]
  chipsDisabled?: boolean
}

// All fields required before artifacts can be generated
type RequiredFields = {
  intent: string | null         // purpose / what the campaign is about
  dataToCapture: string | null  // what data/signals to collect from employees
  audience: string | null       // who receives it
  channel: string | null        // AI Interview | Survey Form | Email | Slack/Teams
  periodStart: string | null    // ISO date, must be future
  periodEnd: string | null      // ISO date, must be after start
  isRecurring: boolean | null   // one-time or recurring
  recurringFreq: string | null  // monthly | quarterly | weekly (only if recurring)
}

type PendingField = keyof RequiredFields

type CampaignConfig = {
  name: string
  cohortDescription: string
  cohortSignals: string[]
  channel: string
  cadence: string
  tone: 'light' | 'standard' | 'detailed'
  targetingRationale: string
  employeeCount: number
  periodStart: string
  periodEnd: string
  isRecurring: boolean
  recurringFreq: string
}

type InterviewQuestion = {
  id: string
  text: string
  type: 'open' | 'rating' | 'choice'
  probeCondition: string
  completionCriteria: string
}

type InterviewScript = {
  intro: string
  questions: InterviewQuestion[]
  closingMessage: string
  estimatedDuration: string
}

type AgentPhase = 'idle' | 'thinking' | 'clarifying' | 'generating' | 'review' | 'approved'

// ─── Date helpers ─────────────────────────────────────────────────────────────

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function toIso(d: Date) {
  return d.toISOString().slice(0, 10)
}

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}

function parseDateText(text: string): string | null {
  const lower = text.toLowerCase().trim()

  // ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(lower)) {
    const d = new Date(lower)
    if (!isNaN(d.getTime())) return lower
  }

  // "next week"
  if (lower.includes('next week')) return toIso(addDays(TODAY, 7))
  if (lower.includes('next month')) return toIso(addDays(TODAY, 30))
  if (lower.includes('next quarter')) return toIso(addDays(TODAY, 90))
  if (lower.includes('in 2 weeks') || lower.includes('two weeks')) return toIso(addDays(TODAY, 14))
  if (lower.includes('in 3 weeks') || lower.includes('three weeks')) return toIso(addDays(TODAY, 21))
  if (lower.includes('immediately') || lower.includes('start now') || lower.includes('right away') || lower.includes('asap')) {
    return toIso(addDays(TODAY, 1))
  }

  // "Aug 1" / "August 1" / "Aug 1, 2026"
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    january: 0, february: 1, march: 2, april: 3, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  }
  const monthMatch = text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:,?\s*(\d{4}))?/i)
  if (monthMatch) {
    const mIdx = months[monthMatch[1].toLowerCase()]
    const day = parseInt(monthMatch[2])
    const year = monthMatch[3] ? parseInt(monthMatch[3]) : TODAY.getFullYear()
    const d = new Date(year, mIdx, day)
    if (!isNaN(d.getTime())) return toIso(d)
  }

  return null
}

function isFuture(iso: string) {
  const d = new Date(iso); d.setHours(0, 0, 0, 0)
  return d > TODAY
}

function formatDisplayDate(iso: string) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const d = new Date(iso)
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

// ─── Field parsing from free text ────────────────────────────────────────────

function extractChannelFromText(text: string): string | null {
  const l = text.toLowerCase()
  if (l.includes('slack')) return 'Slack'
  if (l.includes('email')) return 'Email'
  if (l.includes('survey')) return 'Survey Form'
  if (l.includes('ai interview') || l.includes('interview') || l.includes('conversational')) return 'AI Interview'
  if (l.includes('teams') || l.includes('microsoft')) return 'Microsoft Teams'
  return null
}

function extractRecurringFromText(text: string): { isRecurring: boolean; freq: string } | null {
  const l = text.toLowerCase()
  if (l.includes('one-time') || l.includes('once') || l.includes('one time') || l.includes('not recurring') || l.includes('single')) return { isRecurring: false, freq: '' }
  if (l.includes('monthly')) return { isRecurring: true, freq: 'monthly' }
  if (l.includes('quarterly')) return { isRecurring: true, freq: 'quarterly' }
  if (l.includes('weekly')) return { isRecurring: true, freq: 'weekly' }
  if (l.includes('recurring') || l.includes('repeat') || l.includes('regular')) return { isRecurring: true, freq: 'monthly' }
  return null
}

function extractAudienceFromText(text: string): string | null {
  const l = text.toLowerCase()
  const patterns: [RegExp, string][] = [
    [/ops\s+gap\s+cluster/i, 'Ops gap cluster'],
    [/engineering\s+team/i, 'Engineering team'],
    [/sales\s+team/i, 'Sales team'],
    [/ops\s+team/i, 'Ops team'],
    [/finance\s+team/i, 'Finance team'],
    [/all\s+employees/i, 'All employees'],
    [/entire\s+org/i, 'All employees'],
    [/my\s+teams?/i, 'All my teams'],
    [/everyone/i, 'All employees'],
    [/document.*(skill|gap)/i, 'Document skill gap group'],
    [/low.?(adoption|readiness)/i, 'Low-adoption group'],
    [/all\s+of\s+(\w+)/i, 'Specified group'],
  ]
  for (const [pat, label] of patterns) {
    if (pat.test(text)) return label
  }
  // If message is short and direct, treat it as audience description
  if (l.length < 80 && (l.includes('team') || l.includes('group') || l.includes('cluster') || l.includes('employees') || l.includes('all'))) {
    return text.trim()
  }
  return null
}

// ─── Completeness checker ─────────────────────────────────────────────────────

type FieldQuestion = {
  field: PendingField
  question: string
  chips?: ChipOption[]
  hint?: string
}

function getNextMissingField(fields: RequiredFields): FieldQuestion | null {
  if (!fields.intent) {
    return {
      field: 'intent',
      question: "What is the **purpose** of this campaign? What do you want to learn from employees?",
      hint: 'e.g. "Understand adoption blockers for our new document drafting tools"',
    }
  }
  if (!fields.dataToCapture) {
    return {
      field: 'dataToCapture',
      question: "What **data should we capture** from employees? What questions or signals matter most?",
      hint: 'e.g. "Tool confidence score, biggest friction point, training gaps"',
    }
  }
  if (!fields.audience) {
    return {
      field: 'audience',
      question: "Who should this campaign reach? Which **audience or group** are you targeting?",
      chips: [
        { label: 'All my teams', value: 'All my teams', icon: 'groups' },
        { label: 'Skill gap group', value: 'Skill gap group', icon: 'psychology' },
        { label: 'Low-adoption cluster', value: 'Low-adoption cluster', icon: 'trending_down' },
        { label: 'Custom audience', value: 'custom', icon: 'tune' },
      ],
    }
  }
  if (!fields.channel) {
    return {
      field: 'channel',
      question: "How should we **reach** these employees?",
      chips: [
        { label: 'AI Interview · Conversational', value: 'AI Interview', icon: 'smart_toy' },
        { label: 'Survey Form · Async', value: 'Survey Form', icon: 'assignment' },
        { label: 'Slack / Teams', value: 'Microsoft Teams', icon: 'message' },
        { label: 'Email', value: 'Email', icon: 'mail' },
      ],
    }
  }
  if (!fields.periodStart) {
    return {
      field: 'periodStart',
      question: "When should this campaign **go live**? (Must be a future date)",
      chips: [
        { label: 'Next week', value: toIso(addDays(TODAY, 7)), icon: 'calendar_today' },
        { label: 'In 2 weeks', value: toIso(addDays(TODAY, 14)), icon: 'calendar_today' },
        { label: 'Next month', value: toIso(addDays(TODAY, 30)), icon: 'event' },
        { label: 'Next quarter', value: toIso(addDays(TODAY, 90)), icon: 'event_repeat' },
      ],
    }
  }
  if (!fields.periodEnd) {
    return {
      field: 'periodEnd',
      question: "When should the campaign **end** (collection window close)?",
      chips: [
        { label: '2 weeks after start', value: '__2w__', icon: 'event' },
        { label: '1 month after start', value: '__1m__', icon: 'event' },
        { label: '3 months after start', value: '__3m__', icon: 'event' },
      ],
    }
  }
  if (fields.isRecurring === null) {
    return {
      field: 'isRecurring',
      question: "Should this run **once**, or repeat on a schedule?",
      chips: [
        { label: 'One-time only', value: 'once', icon: 'looks_one' },
        { label: 'Monthly', value: 'monthly', icon: 'calendar_month' },
        { label: 'Quarterly', value: 'quarterly', icon: 'event_repeat' },
        { label: 'Weekly', value: 'weekly', icon: 'view_week' },
      ],
    }
  }
  return null // all fields collected
}

function allFieldsComplete(f: RequiredFields): boolean {
  return !!(f.intent && f.dataToCapture && f.audience && f.channel && f.periodStart && f.periodEnd && f.isRecurring !== null)
}

// ─── Artifact generation ──────────────────────────────────────────────────────

function generateArtifacts(fields: RequiredFields): { config: CampaignConfig; script: InterviewScript } {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const seed = (fields.intent ?? '').length + (fields.audience ?? '').length

  const empCount = 35 + (seed % 100)
  const topic = fields.intent ?? 'the topic described'
  const audience = fields.audience ?? 'target employees'

  const signals: string[] = []
  if (audience.toLowerCase().includes('gap')) signals.push('gap_type:primary', 'adoption_gap:high')
  if (audience.toLowerCase().includes('adoption')) signals.push('adoption_gap:high')
  if (signals.length === 0) signals.push('cohort:custom', 'readiness_confidence:medium')

  const cadenceLabel = fields.isRecurring ? (fields.recurringFreq ? fields.recurringFreq.charAt(0).toUpperCase() + fields.recurringFreq.slice(1) : 'Monthly') : 'One-time'

  // Tone derived from dataToCapture length/complexity
  const dataToCaptureLen = (fields.dataToCapture ?? '').length
  const tone: 'light' | 'standard' | 'detailed' = dataToCaptureLen < 40 ? 'light' : dataToCaptureLen < 120 ? 'standard' : 'detailed'
  const qCount = tone === 'light' ? 3 : tone === 'standard' ? 5 : 8

  const config: CampaignConfig = {
    name: `${audience} · ${topic.slice(0, 35)} · ${months[now.getMonth()]} ${now.getFullYear()}`,
    cohortDescription: `${audience} identified for this campaign`,
    cohortSignals: signals,
    channel: fields.channel!,
    cadence: cadenceLabel,
    tone,
    targetingRationale: `${empCount} employees matched. Campaign targets ${audience.toLowerCase()} based on: ${fields.dataToCapture?.slice(0, 80)}.`,
    employeeCount: empCount,
    periodStart: fields.periodStart!,
    periodEnd: fields.periodEnd!,
    isRecurring: fields.isRecurring!,
    recurringFreq: fields.recurringFreq ?? '',
  }

  const dataPoints = (fields.dataToCapture ?? topic).split(/[,;]/).map(s => s.trim()).filter(Boolean)
  const baseQ = (text: string, type: 'open' | 'rating' | 'choice', probe: string, completion: string, i: number): InterviewQuestion => ({
    id: `q${i + 1}`,
    text,
    type,
    probeCondition: probe,
    completionCriteria: completion,
  })

  const allQuestions: InterviewQuestion[] = [
    baseQ(`How would you describe your current experience with ${topic}?`, 'open', 'If vague: "Can you give a specific recent example?"', 'At least one concrete example provided', 0),
    baseQ(`On a scale of 1–5, how confident do you feel in this area?`, 'rating', 'If ≤ 2: "What specifically makes it feel difficult?"', 'Numeric rating given', 1),
    baseQ(`What is your biggest friction point with ${dataPoints[0] ?? topic}?`, 'open', 'If generic: "What impact does that have day-to-day?"', 'Friction point identified', 2),
    baseQ(`How often does this come up in your day-to-day work?`, 'choice', 'None', 'Frequency indicated', 3),
    baseQ(`What would make the biggest difference for you in this area?`, 'open', 'If vague: "Is that a tool, training, or process change?"', 'Actionable suggestion provided', 4),
    baseQ(`Have you had formal training related to ${dataPoints[1] ?? topic} in the past year?`, 'choice', 'If yes: "Was it useful?" If no: "Would you want it?"', 'Yes/no given', 5),
    baseQ(`How supported do you feel by your team when facing challenges here?`, 'rating', 'If ≤ 2: "What kind of support would help?"', 'Numeric rating given', 6),
    baseQ(`Is there anything else you'd like us to know?`, 'open', 'None — allow open-ended closure', 'Any response including "no"', 7),
  ]

  const durationMap: Record<string, string> = { light: '3 min', standard: '5 min', detailed: '10 min' }

  const script: InterviewScript = {
    intro: `Hi [name], I'm reaching out for a quick check-in about ${topic}. This takes about ${durationMap[tone]} and your input directly shapes what support we prioritise.`,
    questions: allQuestions.slice(0, qCount),
    closingMessage: `Thanks [name] — your input helps us prioritise the right support for your team. We'll follow up with any next steps.`,
    estimatedDuration: durationMap[tone],
  }

  return { config, script }
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  onBack: () => void
  onLaunch: (data: CampaignLaunchData) => void
}

const EMPTY_FIELDS: RequiredFields = {
  intent: null,
  dataToCapture: null,
  audience: null,
  channel: null,
  periodStart: null,
  periodEnd: null,
  isRecurring: null,
  recurringFreq: null,
}

export function CampaignAuthoringAgent({ onBack, onLaunch }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'agent',
      text: "Hi! I'm your Campaign Authoring Agent. Describe the campaign you have in mind — I'll gather everything needed and build the campaign config and interview script for your review.\n\nYou can include as much or as little as you like. I'll ask follow-up questions for anything missing.\n\n*Example: \"Check in with the Ops gap cluster about tool usage in document drafting — quarterly, keep it light.\"*",
    },
  ])
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<AgentPhase>('idle')
  const [fields, setFields] = useState<RequiredFields>({ ...EMPTY_FIELDS })
  const [pendingField, setPendingField] = useState<PendingField | null>(null)
  const [config, setConfig] = useState<CampaignConfig | null>(null)
  const [script, setScript] = useState<InterviewScript | null>(null)
  const [editingConfig, setEditingConfig] = useState(false)
  const [editingScript, setEditingScript] = useState(false)
  const [configDraft, setConfigDraft] = useState<CampaignConfig | null>(null)
  const [scriptDraft, setScriptDraft] = useState<InterviewScript | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, phase])

  const addAgentMessage = useCallback((text: string, chips?: ChipOption[]) => {
    const id = `msg-${Date.now()}-${Math.random()}`
    setMessages(prev => [...prev, { id, role: 'agent', text, chips }])
    return id
  }, [])

  const addUserMessage = useCallback((text: string) => {
    const id = `msg-${Date.now()}-${Math.random()}`
    setMessages(prev => [...prev, { id, role: 'user', text }])
  }, [])

  const disableChips = useCallback(() => {
    setMessages(prev => prev.map(m => m.chips ? { ...m, chipsDisabled: true } : m))
  }, [])

  // ── Ask next missing field ──
  const askNextField = useCallback((updatedFields: RequiredFields) => {
    const next = getNextMissingField(updatedFields)
    if (!next) {
      // All fields collected — generate
      setPhase('generating')
      addAgentMessage('✦ I have everything I need. Building your campaign config and interview script…')
      setTimeout(() => {
        const { config: newConfig, script: newScript } = generateArtifacts(updatedFields)
        setConfig(newConfig)
        setScript(newScript)
        setPhase('review')
        addAgentMessage(
          `Here's your draft — a **${newScript.questions.length}-question ${newConfig.tone} ${newConfig.channel.toLowerCase()}** for **${newConfig.employeeCount} employees** in ${updatedFields.audience}.\n\nBoth artifacts are in **Pending Review**. Check the panel on the right, edit if needed, and approve when ready.`
        )
      }, 1800)
      return
    }
    setPendingField(next.field)
    setPhase('clarifying')
    const hintLine = next.hint ? `\n\n*${next.hint}*` : ''
    addAgentMessage(next.question + hintLine, next.chips)
  }, [addAgentMessage])

  // ── Parse any field values from text ──
  const extractFromText = useCallback((text: string, currentFields: RequiredFields, targetField: PendingField | null): Partial<RequiredFields> => {
    const updates: Partial<RequiredFields> = {}

    // If we're explicitly asking for a field, try to extract it
    if (targetField === 'intent' || (!targetField && !currentFields.intent && text.length > 10)) {
      updates.intent = text.trim()
    }
    if (targetField === 'dataToCapture') {
      updates.dataToCapture = text.trim()
    }
    if (targetField === 'audience') {
      const extracted = extractAudienceFromText(text)
      updates.audience = extracted ?? text.trim()
    }
    if (targetField === 'channel') {
      const ch = extractChannelFromText(text)
      if (ch) updates.channel = ch
    }
    if (targetField === 'periodStart') {
      const d = parseDateText(text)
      if (d && isFuture(d)) updates.periodStart = d
    }
    if (targetField === 'periodEnd') {
      const base = currentFields.periodStart ? new Date(currentFields.periodStart) : TODAY
      const d = parseDateText(text)
      if (d) updates.periodEnd = d
      else if (text.includes('2 week')) updates.periodEnd = toIso(addDays(base, 14))
      else if (text.includes('month')) updates.periodEnd = toIso(addDays(base, 30))
      else if (text.includes('3 month') || text.includes('quarter')) updates.periodEnd = toIso(addDays(base, 90))
    }
    if (targetField === 'isRecurring') {
      const r = extractRecurringFromText(text)
      if (r) { updates.isRecurring = r.isRecurring; updates.recurringFreq = r.freq }
    }

    // Also opportunistically parse fields not currently being asked
    if (!currentFields.channel && !updates.channel) {
      const ch = extractChannelFromText(text)
      if (ch) updates.channel = ch
    }
    if (!currentFields.audience && !updates.audience && targetField !== 'intent' && targetField !== 'dataToCapture') {
      const a = extractAudienceFromText(text)
      if (a) updates.audience = a
    }
    if (currentFields.isRecurring === null && !updates.isRecurring) {
      const r = extractRecurringFromText(text)
      if (r) { updates.isRecurring = r.isRecurring; updates.recurringFreq = r.freq }
    }

    return updates
  }, [])

  // ── Handle first user message: parse everything greedily ──
  const handleFirstMessage = useCallback((text: string) => {
    const lower = text.toLowerCase()

    const parsed: Partial<RequiredFields> = {}

    // Intent — use full message as the starting point
    parsed.intent = text.trim()

    // Audience
    const aud = extractAudienceFromText(text)
    if (aud) parsed.audience = aud

    // Channel
    const ch = extractChannelFromText(text)
    if (ch) parsed.channel = ch

    // Recurring/cadence
    const rec = extractRecurringFromText(text)
    if (rec) { parsed.isRecurring = rec.isRecurring; parsed.recurringFreq = rec.freq }

    // Data to capture — look for "about X", "on X", "regarding X" phrases
    const aboutMatch = text.match(/(?:about|on|regarding|covering|check(?:ing)?\s+(?:in\s+)?(?:on|about)?)\s+(.{5,80})(?:[.,]|$)/i)
    if (aboutMatch) {
      parsed.dataToCapture = aboutMatch[1].trim().replace(/[.,]$/, '')
      // Also refine intent to be cleaner
      parsed.intent = text.trim()
    }

    const newFields = { ...EMPTY_FIELDS, ...parsed }
    setFields(newFields)

    // Build acknowledgement of what was understood
    const parts: string[] = []
    if (parsed.audience) parts.push(`audience: **${parsed.audience}**`)
    if (parsed.intent && parsed.dataToCapture) parts.push(`topic: **${parsed.dataToCapture}**`)
    if (parsed.channel) parts.push(`channel: **${parsed.channel}**`)
    if (parsed.isRecurring !== undefined) parts.push(`cadence: **${parsed.isRecurring ? (parsed.recurringFreq ?? 'recurring') : 'one-time'}**`)

    const ack = parts.length > 0
      ? `Got it — I've understood: ${parts.join(', ')}.\n\nNow let me fill in the rest.`
      : `Got it! Let me ask a few questions to complete the campaign setup.`

    setTimeout(() => {
      addAgentMessage(ack)
      setTimeout(() => askNextField(newFields), 600)
    }, 900)
  }, [addAgentMessage, askNextField])

  // ── Handle chip selection ──
  const handleChipSelect = useCallback((chip: ChipOption) => {
    disableChips()
    addUserMessage(chip.label)

    setFields(prev => {
      let updated = { ...prev }

      if (pendingField === 'audience') {
        if (chip.value === 'custom') {
          // Ask them to describe it
          setPendingField('audience')
          setPhase('clarifying')
          setTimeout(() => addAgentMessage('Please describe the specific audience — e.g. a team name, skill gap group, or criteria.'), 400)
          return prev
        }
        updated.audience = chip.value
      }
      if (pendingField === 'channel') updated.channel = chip.value
      if (pendingField === 'periodStart') updated.periodStart = chip.value
      if (pendingField === 'periodEnd') {
        const base = updated.periodStart ? new Date(updated.periodStart) : TODAY
        if (chip.value === '__2w__') updated.periodEnd = toIso(addDays(base, 14))
        else if (chip.value === '__1m__') updated.periodEnd = toIso(addDays(base, 30))
        else if (chip.value === '__3m__') updated.periodEnd = toIso(addDays(base, 90))
        else updated.periodEnd = chip.value
      }
      if (pendingField === 'isRecurring') {
        if (chip.value === 'once') { updated.isRecurring = false; updated.recurringFreq = '' }
        else { updated.isRecurring = true; updated.recurringFreq = chip.value }
      }

      setPhase('thinking')
      setTimeout(() => askNextField(updated), 600)
      return updated
    })
  }, [pendingField, disableChips, addUserMessage, addAgentMessage, askNextField])

  // ── Handle free-text reply ──
  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || phase === 'thinking' || phase === 'generating' || phase === 'approved') return
    setInput('')
    addUserMessage(text)

    if (phase === 'idle') {
      setPhase('thinking')
      handleFirstMessage(text)
      return
    }

    // Clarifying phase — extract the pending field value from the text
    setFields(prev => {
      const updates = extractFromText(text, prev, pendingField)

      // Validate periodStart must be future
      if (updates.periodStart && !isFuture(updates.periodStart)) {
        setPhase('clarifying')
        setTimeout(() => addAgentMessage("That date is in the past. Please provide a **future** start date."), 400)
        return prev
      }

      // Validate periodEnd must be after periodStart
      if (updates.periodEnd && prev.periodStart) {
        const start = new Date(prev.periodStart)
        const end = new Date(updates.periodEnd)
        if (end <= start) {
          setPhase('clarifying')
          setTimeout(() => addAgentMessage(`The end date must be **after** the start date (${formatDisplayDate(prev.periodStart!)}). Try again.`), 400)
          return prev
        }
      }

      if (Object.keys(updates).length === 0) {
        // Couldn't extract anything useful
        setPhase('clarifying')
        setTimeout(() => {
          const next = getNextMissingField(prev)
          if (next?.field === 'periodStart' || next?.field === 'periodEnd') {
            addAgentMessage("I didn't catch a valid date. You can say something like *\"next week\"*, *\"Aug 15\"*, or *\"2026-09-01\"*.")
          } else {
            addAgentMessage("I didn't quite catch that. Could you rephrase?")
          }
        }, 400)
        return prev
      }

      const updated = { ...prev, ...updates }
      setPendingField(null)
      setPhase('thinking')
      setTimeout(() => askNextField(updated), 600)
      return updated
    })
  }, [input, phase, pendingField, addUserMessage, handleFirstMessage, extractFromText, addAgentMessage, askNextField])

  // ── Config editing ──
  function startEditConfig() { setConfigDraft(config ? { ...config, cohortSignals: [...config.cohortSignals] } : null); setEditingConfig(true) }
  function saveConfig() {
    if (configDraft) setConfig(configDraft)
    setEditingConfig(false)
    addAgentMessage('Campaign config updated. Review the changes and approve when ready.')
  }

  // ── Script editing ──
  function startEditScript() { setScriptDraft(script ? { ...script, questions: script.questions.map(q => ({ ...q })) } : null); setEditingScript(true) }
  function saveScript() {
    if (scriptDraft) setScript(scriptDraft)
    setEditingScript(false)
    addAgentMessage('Interview script updated. The changes are reflected in the artifact.')
  }

  // ── Approve ──
  function handleApprove() {
    if (!config) return
    onLaunch({
      name: config.name,
      typeId: 'custom-campaign',
      typeLabel: 'Custom Campaign',
      typeIcon: 'edit_note',
      teamNames: [],
      employeeCount: config.employeeCount,
      channelLabel: config.channel,
      periodStart: config.periodStart,
      periodEnd: config.periodEnd,
      isRecurring: config.isRecurring,
      recurringFreq: config.recurringFreq || 'monthly',
    })
    setPhase('approved')
    addAgentMessage(`Campaign activated! **${config.name}** is now live and will reach ${config.employeeCount} employees starting ${formatDisplayDate(config.periodStart)}. You can track progress from the campaigns list.`)
    setTimeout(() => onBack(), 2200)
  }

  // ── Progress summary strip ──
  const fieldLabels: { key: keyof RequiredFields; label: string; icon: string }[] = [
    { key: 'intent', label: 'Intent', icon: 'lightbulb' },
    { key: 'dataToCapture', label: 'Data to capture', icon: 'dataset' },
    { key: 'audience', label: 'Audience', icon: 'groups' },
    { key: 'channel', label: 'Channel', icon: 'send' },
    { key: 'periodStart', label: 'Start date', icon: 'calendar_today' },
    { key: 'periodEnd', label: 'End date', icon: 'event' },
    { key: 'isRecurring', label: 'Cadence', icon: 'event_repeat' },
  ]

  const statusLabel = phase === 'approved' ? 'Approved' : phase === 'review' ? 'Pending Review' : 'Drafting'
  const statusMod = phase === 'approved' ? 'approved' : phase === 'review' ? 'review' : 'drafting'
  const canSend = input.trim().length > 0 && phase !== 'thinking' && phase !== 'generating' && phase !== 'approved'

  return (
    <div className="caa-root">
      {/* Header */}
      <div className="caa-header">
        <button type="button" className="caa-back" onClick={onBack}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back
        </button>
        <span style={{ color: '#e2e8f0', fontSize: 16 }}>|</span>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#6366f1' }}>auto_awesome</span>
        <span className="caa-header-title">Campaign Authoring Agent</span>
        <span className={`caa-status-badge caa-status-badge--${statusMod}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
            {phase === 'approved' ? 'check_circle' : phase === 'review' ? 'rate_review' : 'edit'}
          </span>
          {statusLabel}
        </span>
      </div>

      {/* Field completion strip */}
      {phase !== 'idle' && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 0', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', flexShrink: 0 }}>
          {fieldLabels.map(({ key, label, icon }) => {
            const done = key === 'isRecurring' ? fields.isRecurring !== null : !!fields[key]
            const active = pendingField === key
            return (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: done ? '#f0fdf4' : active ? '#eef2ff' : '#f8fafc',
                color: done ? '#166534' : active ? '#4338ca' : '#94a3b8',
                border: `1px solid ${done ? '#bbf7d0' : active ? '#c7d2fe' : '#e2e8f0'}`,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{done ? 'check_circle' : active ? 'radio_button_checked' : icon}</span>
                {label}
              </div>
            )
          })}
        </div>
      )}

      {/* Body */}
      <div className="caa-body">
        {/* Chat pane */}
        <div className="caa-chat">
          <div className="caa-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`caa-msg caa-msg--${msg.role}`}>
                <div className="caa-msg__avatar">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {msg.role === 'agent' ? 'auto_awesome' : 'person'}
                  </span>
                </div>
                <div>
                  <div
                    className="caa-msg__bubble"
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                        .replace(/\n/g, '<br/>'),
                    }}
                  />
                  {msg.chips && (
                    <div className="caa-msg__chips">
                      {msg.chips.map(chip => (
                        <button
                          key={chip.value}
                          type="button"
                          className="caa-chip"
                          disabled={!!msg.chipsDisabled}
                          onClick={() => !msg.chipsDisabled && handleChipSelect(chip)}
                        >
                          {chip.icon && <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{chip.icon}</span>}
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(phase === 'thinking' || phase === 'generating') && (
              <div className="caa-msg caa-msg--agent">
                <div className="caa-msg__avatar">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
                </div>
                <div className="caa-thinking">
                  <div className="caa-thinking__dots"><span /><span /><span /></div>
                  {phase === 'generating' ? 'Building artifacts…' : 'Thinking…'}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="caa-input-wrap">
            <textarea
              className="caa-input"
              rows={1}
              placeholder={phase === 'idle' ? 'Describe your campaign…' : 'Reply or select an option above…'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (canSend) handleSend() } }}
              disabled={phase === 'approved'}
            />
            <button type="button" className="caa-send" disabled={!canSend} onClick={handleSend}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
            </button>
          </div>
        </div>

        {/* Artifact panel */}
        {config && script && (
          <div className="caa-artifacts">
            <div className="caa-artifacts__header">
              <div className="caa-artifacts__title">Generated artifacts</div>
              <div className="caa-artifacts__sub">Review and edit before approving</div>
            </div>

            <div className="caa-artifacts__body">
              {/* Campaign Config */}
              <div className="caa-artifact-card">
                <div className="caa-artifact-card__header">
                  <div className="caa-artifact-card__label">
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#6366f1' }}>settings</span>
                    Campaign Config
                  </div>
                  {phase !== 'approved' && (
                    <button type="button" className="caa-artifact-card__edit" onClick={() => editingConfig ? saveConfig() : startEditConfig()}>
                      {editingConfig ? 'Save' : 'Edit'}
                    </button>
                  )}
                </div>

                {editingConfig && configDraft ? (
                  <div className="caa-edit-form">
                    <div><label>Campaign name</label><input value={configDraft.name} onChange={e => setConfigDraft({ ...configDraft, name: e.target.value })} /></div>
                    <div><label>Cohort / audience</label><textarea rows={2} value={configDraft.cohortDescription} onChange={e => setConfigDraft({ ...configDraft, cohortDescription: e.target.value })} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div><label>Channel</label>
                        <select value={configDraft.channel} onChange={e => setConfigDraft({ ...configDraft, channel: e.target.value })}>
                          <option>AI Interview</option><option>Survey Form</option><option>Microsoft Teams</option><option>Email</option>
                        </select>
                      </div>
                      <div><label>Cadence</label>
                        <select value={configDraft.cadence} onChange={e => setConfigDraft({ ...configDraft, cadence: e.target.value })}>
                          <option>One-time</option><option>Monthly</option><option>Quarterly</option><option>Weekly</option>
                        </select>
                      </div>
                      <div><label>Start date</label><input type="date" value={configDraft.periodStart} onChange={e => setConfigDraft({ ...configDraft, periodStart: e.target.value })} /></div>
                      <div><label>End date</label><input type="date" value={configDraft.periodEnd} onChange={e => setConfigDraft({ ...configDraft, periodEnd: e.target.value })} /></div>
                    </div>
                    <div><label>Targeting rationale</label><textarea rows={3} value={configDraft.targetingRationale} onChange={e => setConfigDraft({ ...configDraft, targetingRationale: e.target.value })} /></div>
                    <div className="caa-edit-form__actions">
                      <button type="button" className="caa-edit-cancel" onClick={() => setEditingConfig(false)}>Cancel</button>
                      <button type="button" className="caa-edit-save" onClick={saveConfig}>Save changes</button>
                    </div>
                  </div>
                ) : (
                  <div className="caa-artifact-card__body">
                    <div className="caa-field-row"><span className="caa-field-label">Name</span><span className="caa-field-value">{config.name}</span></div>
                    <div className="caa-field-row"><span className="caa-field-label">Audience</span><span className="caa-field-value">{config.cohortDescription}</span>
                      <div className="caa-field-tags">{config.cohortSignals.map(s => <span key={s} className="caa-field-tag">{s}</span>)}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div className="caa-field-row"><span className="caa-field-label">Channel</span><span className="caa-field-value">{config.channel}</span></div>
                      <div className="caa-field-row"><span className="caa-field-label">Cadence</span><span className="caa-field-value">{config.cadence}</span></div>
                      <div className="caa-field-row"><span className="caa-field-label">Start date</span><span className="caa-field-value">{formatDisplayDate(config.periodStart)}</span></div>
                      <div className="caa-field-row"><span className="caa-field-label">End date</span><span className="caa-field-value">{formatDisplayDate(config.periodEnd)}</span></div>
                      <div className="caa-field-row"><span className="caa-field-label">Employees</span><span className="caa-field-value">{config.employeeCount}</span></div>
                      <div className="caa-field-row"><span className="caa-field-label">Tone</span><span className="caa-field-value" style={{ textTransform: 'capitalize' }}>{config.tone}</span></div>
                    </div>
                    <div className="caa-field-row" style={{ marginTop: 4 }}><span className="caa-field-label">Targeting rationale</span><span className="caa-field-value" style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>{config.targetingRationale}</span></div>
                  </div>
                )}
              </div>

              {/* Interview Script */}
              <div className="caa-artifact-card">
                <div className="caa-artifact-card__header">
                  <div className="caa-artifact-card__label">
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#6366f1' }}>quiz</span>
                    Interview Script
                  </div>
                  {phase !== 'approved' && (
                    <button type="button" className="caa-artifact-card__edit" onClick={() => editingScript ? saveScript() : startEditScript()}>
                      {editingScript ? 'Save' : 'Edit'}
                    </button>
                  )}
                </div>

                {editingScript && scriptDraft ? (
                  <div className="caa-edit-form">
                    <div><label>Opening message</label><textarea rows={2} value={scriptDraft.intro} onChange={e => setScriptDraft({ ...scriptDraft, intro: e.target.value })} /></div>
                    <div>
                      <label>Questions</label>
                      <div className="caa-question-list" style={{ gap: 6 }}>
                        {scriptDraft.questions.map((q, i) => (
                          <div key={q.id} className="caa-question-edit-item">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1' }}>Q{i + 1}</span>
                              <button type="button" className="caa-q-del" onClick={() => setScriptDraft({ ...scriptDraft, questions: scriptDraft.questions.filter((_, j) => j !== i) })}>Remove</button>
                            </div>
                            <input value={q.text} onChange={e => setScriptDraft({ ...scriptDraft, questions: scriptDraft.questions.map((qq, j) => j === i ? { ...qq, text: e.target.value } : qq) })} />
                            <select value={q.type} onChange={e => setScriptDraft({ ...scriptDraft, questions: scriptDraft.questions.map((qq, j) => j === i ? { ...qq, type: e.target.value as 'open' | 'rating' | 'choice' } : qq) })}>
                              <option value="open">Open-ended</option><option value="rating">Rating (1–5)</option><option value="choice">Multiple choice</option>
                            </select>
                          </div>
                        ))}
                        <button type="button" className="caa-q-add" onClick={() => setScriptDraft({ ...scriptDraft, questions: [...scriptDraft.questions, { id: `q-new-${scriptDraft.questions.length}`, text: 'New question', type: 'open', probeCondition: 'None', completionCriteria: 'Any response' }] })}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                          Add question
                        </button>
                      </div>
                    </div>
                    <div><label>Closing message</label><textarea rows={2} value={scriptDraft.closingMessage} onChange={e => setScriptDraft({ ...scriptDraft, closingMessage: e.target.value })} /></div>
                    <div className="caa-edit-form__actions">
                      <button type="button" className="caa-edit-cancel" onClick={() => setEditingScript(false)}>Cancel</button>
                      <button type="button" className="caa-edit-save" onClick={saveScript}>Save changes</button>
                    </div>
                  </div>
                ) : (
                  <div className="caa-artifact-card__body">
                    <div className="caa-field-row"><span className="caa-field-label">Opening</span><span className="caa-field-value" style={{ fontSize: 12, color: '#64748b', fontWeight: 400, fontStyle: 'italic' }}>{script.intro}</span></div>
                    <div className="caa-field-row">
                      <span className="caa-field-label">Questions · {script.questions.length} · est. {script.estimatedDuration}</span>
                      <div className="caa-question-list" style={{ marginTop: 6 }}>
                        {script.questions.map((q, i) => (
                          <div key={q.id} className="caa-question-item">
                            <div className="caa-question-item__num">Q{i + 1} · {q.type}</div>
                            <div className="caa-question-item__text">{q.text}</div>
                            {q.probeCondition !== 'None' && <div className="caa-question-item__meta">↳ {q.probeCondition}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="caa-field-row" style={{ marginTop: 4 }}><span className="caa-field-label">Closing</span><span className="caa-field-value" style={{ fontSize: 12, color: '#64748b', fontWeight: 400, fontStyle: 'italic' }}>{script.closingMessage}</span></div>
                  </div>
                )}
              </div>
            </div>

            {phase === 'review' && (
              <div className="caa-approve-bar">
                <span className="caa-approve-bar__hint">Both artifacts are in Pending Review. Edit if needed, then activate.</span>
                <button type="button" className="caa-approve-btn" onClick={handleApprove}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>rocket_launch</span>
                  Approve & Activate
                </button>
              </div>
            )}

            {phase === 'approved' && (
              <div className="caa-approve-bar">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#16a34a' }}>check_circle</span>
                <span className="caa-approve-bar__hint" style={{ color: '#16a34a', fontWeight: 600 }}>Campaign activated — redirecting…</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
