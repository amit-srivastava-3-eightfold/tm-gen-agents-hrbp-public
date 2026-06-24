import { useEffect, useState } from 'react'
import { SkillTag } from '@tonyh-2-eightfold/ef-design-system'
import { getTasksForRole } from '../../data/wfrOrgData'

type DemoPhase = 'baseline' | 'calibrated' | 'upskilled'


const CALIBRATION_DELTAS: Record<string, number> = {
  'Schedule management': +10,
  'Bug triage': +15,
  'Documentation': +18,
  'Stakeholder communication': -18,
}

const UPSKILLING_EXTRA_DELTAS: Record<string, number> = {
  'Meeting coordination': +19,
  'Feature implementation': +22,
  'Code review': +15,
}

// Brief descriptions keyed by task name
const TASK_DESCRIPTIONS: Record<string, string> = {
  'Feature implementation': 'Writing and delivering new product features end-to-end, from requirements to deployment.',
  'Code review': 'Reviewing pull requests for correctness, style, security issues, and design quality.',
  'Unit testing': 'Writing automated tests to validate individual functions, components, and edge cases.',
  'API integration': 'Connecting services via REST or GraphQL endpoints and managing data contracts.',
  'Bug triage': 'Investigating, reproducing, and prioritizing reported defects for resolution.',
  'Documentation': 'Creating and maintaining technical docs, READMEs, runbooks, and inline comments.',
  'Schedule management': 'Coordinating calendars, sprint timelines, and team availability.',
  'Email triage and response': 'Processing inboxes, routing messages, and drafting or sending replies.',
  'Report generation': 'Compiling structured reports from data sources, templates, or dashboards.',
  'Data entry and updates': 'Entering, validating, and updating records in systems of record.',
  'Meeting coordination': 'Scheduling meetings, preparing agendas, and following up on action items.',
  'Document formatting': 'Applying consistent formatting, templates, and styles to written materials.',
  'Stakeholder communication': 'Managing relationships and communicating project updates to stakeholders.',
  'Process documentation': 'Documenting workflows, procedures, and standard operating procedures.',
  'System design': 'Architecting scalable, maintainable systems and proposing technical solutions.',
  'Mentoring': 'Coaching junior engineers through code reviews, pair programming, and 1:1s.',
  'Architecture RFCs': 'Writing and reviewing technical proposals for significant system changes.',
  'Incident response': 'Diagnosing and resolving production incidents under time pressure.',
  'Performance profiling': 'Identifying and resolving bottlenecks in CPU, memory, or I/O usage.',
  'Security review': 'Assessing code and systems for vulnerabilities and compliance requirements.',
  'Data analysis': 'Querying and interpreting data to surface trends and actionable insights.',
  'Research': 'Gathering, synthesizing, and summarizing information from multiple sources.',
  'Planning': 'Structuring project plans, milestones, and resource allocation.',
  'Forecasting': 'Building models to predict outcomes, demand, or business metrics.',
}

// Skill tags by keyword match within task name
const AUGMENT_SKILL_KEYWORDS: [string, string[]][] = [
  ['research', ['AI-assisted research', 'Data synthesis']],
  ['draft', ['AI writing', 'Content generation']],
  ['analys', ['Data interpretation', 'Pattern recognition']],
  ['plan', ['AI-assisted planning', 'Scenario modeling']],
  ['review', ['Quality evaluation', 'AI output review']],
  ['track', ['AI analytics', 'Trend detection']],
  ['coordinat', ['AI scheduling', 'Workflow automation']],
  ['report', ['Automated reporting', 'Data visualization']],
  ['forecast', ['Predictive analytics', 'AI modeling']],
  ['screen', ['AI screening', 'Candidate matching']],
  ['document', ['AI documentation', 'Template generation']],
  ['budget', ['Financial modeling', 'AI forecasting']],
  ['implement', ['AI pair programming', 'Code generation']],
  ['test', ['AI test generation', 'Test automation']],
  ['integrat', ['API automation', 'AI-assisted debugging']],
  ['email', ['AI drafting', 'Smart triage']],
  ['schedul', ['AI scheduling', 'Calendar automation']],
  ['format', ['Document automation', 'Template tooling']],
  ['process', ['Workflow automation', 'SOP generation']],
]

const AUTOMATE_SKILL_KEYWORDS: [string, string[]][] = [
  // Financial
  ['invoic', ['Invoice automation', 'Payment processing']],
  ['payroll', ['Payroll automation', 'Compliance checks']],
  ['commission', ['Commission engine', 'Incentive automation']],
  ['transact', ['Transaction processing', 'Payment automation']],
  ['expense', ['Expense processing', 'Receipt automation']],
  ['journal entr', ['Journal automation', 'Ledger sync']],
  ['revenue recogn', ['Revenue automation', 'Financial pipeline']],
  ['tax', ['Tax filing automation', 'Compliance pipeline']],
  ['benefit', ['Benefits automation', 'Deduction processing']],
  ['capex', ['CapEx automation', 'Budget tracking']],
  // Data & records (specific before broad)
  ['form data', ['Form processing', 'Data extraction']],
  ['data entry', ['Data extraction', 'Record sync']],
  ['data val', ['Validation pipeline', 'Quality checks']],
  ['data hyg', ['Data cleansing', 'Quality pipeline']],
  ['data qual', ['Quality monitoring', 'Data pipeline']],
  ['data rec', ['Reconciliation engine', 'Audit pipeline']],
  ['data migr', ['Migration pipeline', 'ETL automation']],
  ['data agg', ['Aggregation pipeline', 'Data sync']],
  ['crm', ['CRM automation', 'Record sync']],
  ['hris', ['HRIS automation', 'Data sync']],
  ['data', ['Data pipeline', 'Quality automation']],
  // Communication
  ['email', ['Inbox automation', 'Smart routing']],
  ['outreach', ['Outreach automation', 'Sequence execution']],
  ['outbound', ['Outbound automation', 'Campaign execution']],
  ['call rout', ['Call routing', 'Smart escalation']],
  // Reporting & analytics
  ['kpi', ['KPI tracking', 'Metric automation']],
  ['dashboard', ['Dashboard automation', 'Live metrics']],
  ['sql report', ['Query automation', 'Report pipeline']],
  ['report', ['Report automation', 'Data pipeline']],
  ['forecast', ['Forecast engine', 'Prediction pipeline']],
  ['analytic', ['Analytics pipeline', 'Insight extraction']],
  ['survey', ['Survey automation', 'Response analysis']],
  ['market research', ['Research automation', 'Intelligence pipeline']],
  ['health score', ['Health scoring', 'Alert pipeline']],
  // Documents & content
  ['format', ['Template automation', 'Layout rendering']],
  ['template', ['Template generation', 'Content automation']],
  ['contract', ['Contract automation', 'Clause extraction']],
  ['proposal', ['Proposal generation', 'Template automation']],
  ['ad copy', ['Ad generation', 'Copy automation']],
  ['seo', ['SEO automation', 'Content optimization']],
  ['course creat', ['Content automation', 'Course generation']],
  ['document', ['Doc automation', 'Content indexing']],
  ['archive', ['Archive automation', 'Retrieval pipeline']],
  ['index', ['Index pipeline', 'File automation']],
  // Compliance & legal
  ['complianc', ['Compliance automation', 'Audit trail']],
  ['trademark', ['IP tracking', 'Filing automation']],
  ['regulat', ['Regulation tracking', 'Change alerts']],
  ['rfx', ['RFx automation', 'Response generation']],
  ['po proc', ['PO automation', 'Procurement processing']],
  // Testing, CI & monitoring (specific before broad)
  ['unit test', ['Test synthesis', 'CI automation']],
  ['test plan', ['Test planning', 'QA automation']],
  ['ci/', ['CI/CD automation', 'Pipeline execution']],
  ['ci pip', ['CI automation', 'Pipeline execution']],
  ['test', ['Test automation', 'Quality pipeline']],
  ['monitor', ['Monitoring automation', 'Alert engine']],
  ['alert', ['Alert automation', 'Incident routing']],
  ['slo', ['SLO monitoring', 'Uptime tracking']],
  ['sla', ['SLA automation', 'Compliance monitoring']],
  ['patch schedul', ['Patch automation', 'Update scheduling']],
  ['patch', ['Patch automation', 'Update scheduling']],
  ['dependency', ['Dependency scanning', 'Update tracking']],
  ['version', ['Version tracking', 'Release automation']],
  ['deployment', ['Deploy automation', 'Release pipeline']],
  ['automation script', ['Script automation', 'Process orchestration']],
  ['app store', ['App submission', 'Store automation']],
  // Logistics & inventory
  ['inventor', ['Inventory automation', 'Stock tracking']],
  ['shipment', ['Logistics tracking', 'Shipping automation']],
  ['travel', ['Travel automation', 'Booking engine']],
  ['supply', ['Procurement automation', 'Order processing']],
  ['order track', ['Order tracking', 'Fulfillment automation']],
  ['order', ['Order automation', 'Fulfillment pipeline']],
  ['fuel', ['Fleet tracking', 'Logistics automation']],
  // HR & people
  ['headcount', ['Headcount analytics', 'Workforce automation']],
  ['onboard', ['Onboarding automation', 'Task assignment']],
  ['ats', ['ATS automation', 'Candidate routing']],
  ['desk', ['Space automation', 'Access management']],
  // Sales & marketing
  ['campaign', ['Campaign automation', 'Audience targeting']],
  ['audience', ['Segmentation engine', 'Targeting automation']],
  ['keyword', ['Keyword automation', 'SEO tooling']],
  ['bid optim', ['Bid automation', 'Campaign optimization']],
  ['bid', ['Bid automation', 'Campaign pipeline']],
  ['deal reg', ['Deal automation', 'CRM sync']],
  ['ticket', ['Ticket automation', 'Smart routing']],
  ['vendor', ['Vendor automation', 'Procurement pipeline']],
  ['media monitor', ['Media monitoring', 'Alert automation']],
  ['media', ['Media automation', 'Alert pipeline']],
  ['brand approv', ['Approval routing', 'Brand automation']],
  // General
  ['schedul', ['Scheduling automation', 'Calendar engine']],
  ['performance profil', ['Profiling automation', 'Analysis pipeline']],
  ['wireframe', ['Wireframe generation', 'Design automation']],
  ['pipeline', ['Pipeline automation', 'Orchestration engine']],
  ['script', ['Script automation', 'Process orchestration']],
]

const HUMAN_SKILL_KEYWORDS: [string, string[]][] = [
  ['negotiat', ['Persuasion', 'Relationship building']],
  ['conflict', ['Mediation', 'Emotional intelligence']],
  ['client', ['Trust building', 'Empathy']],
  ['mentor', ['Coaching', 'Leadership']],
  ['train', ['Facilitation', 'Knowledge transfer']],
  ['strateg', ['Vision', 'Business judgment']],
  ['triage', ['Critical judgment', 'Prioritization']],
  ['stakeholder', ['Executive presence', 'Influence']],
  ['security', ['Security expertise', 'Risk assessment']],
  ['incident', ['Crisis management', 'Systems thinking']],
]

function getSkills(taskName: string, zone: 'above' | 'augment' | 'below'): string[] {
  const lower = taskName.toLowerCase()
  if (zone === 'above') {
    for (const [kw, skills] of AUTOMATE_SKILL_KEYWORDS) {
      if (lower.includes(kw)) return skills
    }
    return ['Workflow automation', 'Zero-touch execution']
  }
  if (zone === 'augment') {
    for (const [kw, skills] of AUGMENT_SKILL_KEYWORDS) {
      if (lower.includes(kw)) return skills
    }
    return ['AI collaboration', 'Tool fluency']
  }
  for (const [kw, skills] of HUMAN_SKILL_KEYWORDS) {
    if (lower.includes(kw)) return skills
  }
  return ['Critical thinking', 'Human judgment']
}

function getDescription(taskName: string): string {
  return TASK_DESCRIPTIONS[taskName] ?? `${taskName} performed as part of the day-to-day role responsibilities.`
}

// AI assessment rationale per task
const TASK_ANALYSIS: Record<string, string> = {
  'Feature implementation': 'LLMs can generate boilerplate and routine implementation code, but understanding product requirements, architectural tradeoffs, and team conventions requires developer judgment.',
  'Code review': 'AI excels at catching syntax errors and anti-patterns, but evaluating intent, giving developmental feedback, and making architectural calls remain human strengths.',
  'Unit testing': 'Test case generation is highly automatable — AI enumerates edge cases and writes assertions at scale. Human oversight focuses on test strategy and meaningful coverage goals.',
  'API integration': 'Schema mapping and client generation accelerate well with AI, but non-functional requirements, vendor relationships, and security tradeoffs require human judgment.',
  'Bug triage': 'AI can classify severity and detect duplicates, but customer impact assessment, team capacity awareness, and escalation calls require human judgment.',
  'Documentation': 'AI drafts documentation quickly from code and unstructured input, but audience calibration, tacit knowledge capture, and narrative coherence benefit from human authorship.',
  'Schedule management': 'Calendar AI optimizes scheduling and detects conflicts automatically, but navigating stakeholder priorities and relationship dynamics requires human judgment.',
  'Email triage and response': 'Smart triage, categorization, and draft generation are well within AI capabilities. Tone judgment and relationship-sensitive responses still benefit from human review.',
  'Report generation': 'Data aggregation and narrative generation are highly automatable. Framing insights for executive audiences and identifying meaningful anomalies benefits from human oversight.',
  'Data entry and updates': 'Extraction, validation, and system sync are ideal automation candidates. Exception handling and source credibility judgments may require human review.',
  'Meeting coordination': 'Agenda drafting and action item extraction are strong AI use cases. Facilitating discussion, reading conflict dynamics, and holding decisions require human presence.',
  'Document formatting': 'Style enforcement and template application are straightforward automation tasks. Brand and editorial judgment at the margins benefits from human oversight.',
  'Stakeholder communication': 'AI can draft status updates and summarize project state, but building trust, navigating difficult conversations, and political judgment are distinctly human.',
  'Process documentation': 'AI structures workflows and generates SOP drafts effectively. Capturing tacit knowledge, managing change, and gaining stakeholder buy-in require human expertise.',
  'System design': 'AI aids in pattern generation and documentation, but architectural vision, team-specific context, and long-term tradeoff judgment are inherently human responsibilities.',
  'Mentoring': "Coaching, empathy, and reading an individual's growth trajectory are deeply human. AI can surface learning resources and summarize feedback, but cannot replace the relationship.",
  'Architecture RFCs': 'AI can structure proposals and surface precedents, but the judgment calls on organizational fit, long-term maintainability, and team capability are human.',
  'Incident response': 'AI accelerates log analysis and pattern detection, but crisis judgment under pressure, cross-team coordination, and communication require human leadership.',
  'Performance profiling': 'AI tools automate bottleneck detection and suggest fixes, but understanding system-wide tradeoffs and business impact requires human interpretation.',
  'Security review': 'AI detects known vulnerability patterns effectively, but threat modeling, novel attack surface assessment, and risk acceptance decisions require human expertise.',
  'Data analysis': 'AI can query and surface patterns at scale, but interpreting what the data means for the business and deciding what to do about it remains a human strength.',
  'Research': 'AI accelerates literature search and synthesis, but forming original hypotheses, evaluating source quality, and drawing novel conclusions requires human expertise.',
  'Planning': 'AI can model scenarios and draft project plans, but weighing organizational constraints, aligning stakeholders, and making resource trade-offs require human judgment.',
  'Forecasting': 'AI models excel at pattern-based prediction, but contextualizing forecasts with business strategy, market signals, and judgment calls about uncertainty remains human work.',
}

// AI capabilities by task keyword
const AI_CAPS_KEYWORDS: [string, string[]][] = [
  ['implement', ['Code generation', 'AI pair programming', 'Boilerplate synthesis']],
  ['review', ['Static analysis', 'Bug pattern detection', 'Semantic diff']],
  ['test', ['Test case generation', 'Edge case discovery', 'Coverage analysis']],
  ['integrat', ['Schema mapping', 'Client generation', 'Error pattern detection']],
  ['triage', ['Severity classification', 'Duplicate detection', 'Regression linking']],
  ['document', ['AI drafting', 'Template generation', 'Changelog synthesis']],
  ['schedul', ['Calendar optimization', 'Conflict detection', 'Availability matching']],
  ['email', ['Smart triage', 'Draft generation', 'Intent classification']],
  ['report', ['Data aggregation', 'Narrative generation', 'Chart automation']],
  ['data entry', ['OCR + extraction', 'Field mapping', 'Validation pipeline']],
  ['coordinat', ['Agenda generation', 'Action item extraction', 'Follow-up drafting']],
  ['format', ['Style enforcement', 'Template application', 'Layout automation']],
  ['stakeholder', ['Status summarization', 'Draft generation', 'Sentiment tracking']],
  ['process', ['Workflow mapping', 'SOP drafting', 'Gap identification']],
  ['design', ['Pattern suggestion', 'Diagram generation', 'Doc synthesis']],
  ['mentor', ['Resource curation', 'Feedback summarization', 'Progress tracking']],
  ['architect', ['Proposal structuring', 'Precedent search', 'Trade-off framing']],
  ['incident', ['Log analysis', 'Pattern detection', 'Runbook automation']],
  ['profil', ['Bottleneck detection', 'Automated tracing', 'Regression detection']],
  ['security', ['Vulnerability scanning', 'Dependency audit', 'Pattern matching']],
  ['analys', ['Pattern recognition', 'Automated querying', 'Insight surfacing']],
  ['research', ['Literature search', 'Synthesis & summarization', 'Citation management']],
  ['plan', ['Scenario modeling', 'Timeline generation', 'Dependency mapping']],
  ['forecast', ['Time-series modeling', 'Scenario simulation', 'Anomaly detection']],
]

// Human edge by task keyword
const HUMAN_EDGE_KEYWORDS: [string, string[]][] = [
  ['implement', ['Architecture judgment', 'Product tradeoffs', 'Team context']],
  ['review', ['Intent understanding', 'Mentorship framing', 'Domain expertise']],
  ['test', ['Exploratory testing', 'User empathy', 'Risk prioritization']],
  ['integrat', ['Vendor relationships', 'Non-functional tradeoffs', 'Security judgment']],
  ['triage', ['Customer impact judgment', 'Team capacity awareness', 'Escalation calls']],
  ['document', ['Audience calibration', 'Tacit knowledge', 'Narrative coherence']],
  ['schedul', ['Stakeholder priorities', 'Political sensitivity', 'Relationship context']],
  ['email', ['Tone judgment', 'Relationship nuance', 'Escalation decisions']],
  ['report', ['Insight framing', 'Executive narrative', 'Anomaly judgment']],
  ['data entry', ['Exception handling', 'Source validation', 'Edge case judgment']],
  ['coordinat', ['Facilitating conflict', 'Reading the room', 'Decision authority']],
  ['format', ['Brand judgment', 'Audience awareness', 'Editorial decisions']],
  ['stakeholder', ['Trust building', 'Difficult conversations', 'Political navigation']],
  ['process', ['Change management', 'Tacit knowledge', 'Stakeholder buy-in']],
  ['design', ['Architectural vision', 'Long-term tradeoffs', 'Team capability fit']],
  ['mentor', ['Empathy', 'Growth trajectory reading', 'Relationship depth']],
  ['architect', ['Organizational fit', 'Maintainability judgment', 'Team capability']],
  ['incident', ['Crisis judgment', 'Cross-team coordination', 'Communication leadership']],
  ['profil', ['System-wide tradeoffs', 'Business impact', 'Optimization priorities']],
  ['security', ['Threat modeling', 'Novel attack surface', 'Risk acceptance']],
  ['analys', ['Contextual interpretation', 'Business framing', 'Stakeholder narrative']],
  ['research', ['Hypothesis formation', 'Source evaluation', 'Novel synthesis']],
  ['plan', ['Stakeholder alignment', 'Constraint navigation', 'Resource judgment']],
  ['forecast', ['Assumption validation', 'Uncertainty communication', 'Strategy alignment']],
]

// Research confidence data per task
const TASK_CONFIDENCE: Record<string, { pct: number; sources: number; companies: number }> = {
  'Feature implementation': { pct: 82, sources: 7, companies: 178 },
  'Code review': { pct: 74, sources: 5, companies: 143 },
  'Unit testing': { pct: 91, sources: 8, companies: 220 },
  'API integration': { pct: 78, sources: 6, companies: 165 },
  'Bug triage': { pct: 69, sources: 5, companies: 112 },
  'Documentation': { pct: 85, sources: 7, companies: 196 },
  'Schedule management': { pct: 80, sources: 6, companies: 134 },
  'Email triage and response': { pct: 88, sources: 8, companies: 241 },
  'Report generation': { pct: 87, sources: 7, companies: 198 },
  'Data entry and updates': { pct: 94, sources: 9, companies: 312 },
  'Meeting coordination': { pct: 76, sources: 6, companies: 129 },
  'Document formatting': { pct: 92, sources: 7, companies: 267 },
  'Stakeholder communication': { pct: 65, sources: 5, companies: 89 },
  'Process documentation': { pct: 81, sources: 6, companies: 147 },
  'System design': { pct: 58, sources: 4, companies: 67 },
  'Mentoring': { pct: 42, sources: 4, companies: 34 },
  'Architecture RFCs': { pct: 61, sources: 5, companies: 78 },
  'Incident response': { pct: 71, sources: 6, companies: 108 },
  'Performance profiling': { pct: 79, sources: 6, companies: 134 },
  'Security review': { pct: 73, sources: 6, companies: 121 },
  'Data analysis': { pct: 83, sources: 7, companies: 189 },
  'Research': { pct: 68, sources: 5, companies: 97 },
  'Planning': { pct: 63, sources: 5, companies: 84 },
  'Forecasting': { pct: 77, sources: 6, companies: 142 },
}

function getAnalysis(taskName: string): string {
  return TASK_ANALYSIS[taskName] ?? `AI tools can assist with parts of ${taskName.toLowerCase()}, with the specific balance depending on complexity and context.`
}

function getAICaps(taskName: string, zone: 'above' | 'augment' | 'below'): string[] {
  const lower = taskName.toLowerCase()
  for (const [kw, caps] of AI_CAPS_KEYWORDS) {
    if (lower.includes(kw)) return caps
  }
  if (zone === 'above') return ['Workflow automation', 'Zero-touch execution', 'Pipeline orchestration']
  if (zone === 'augment') return ['AI-assisted completion', 'Pattern recognition', 'Draft generation']
  return ['Research summarization', 'Document support', 'Data lookup']
}

function getHumanEdge(taskName: string, zone: 'above' | 'augment' | 'below'): string[] {
  const lower = taskName.toLowerCase()
  for (const [kw, edges] of HUMAN_EDGE_KEYWORDS) {
    if (lower.includes(kw)) return edges
  }
  if (zone === 'above') return ['Exception handling', 'Process design', 'Oversight']
  if (zone === 'augment') return ['Contextual judgment', 'Relationship awareness', 'Quality oversight']
  return ['Domain expertise', 'Ethical judgment', 'Relationship trust']
}

function getConfidence(taskName: string): { pct: number; sources: number; companies: number } {
  return TASK_CONFIDENCE[taskName] ?? { pct: 72, sources: 5, companies: 118 }
}

function getZone(score: number): 'above' | 'augment' | 'below' {
  if (score > 75) return 'above'
  if (score >= 15) return 'augment'
  return 'below'
}

function getPriority(score: number): 'Primary' | 'Secondary' {
  return score >= 15 && score <= 75 ? 'Primary' : 'Secondary'
}

const PRIORITY_META = {
  Primary: { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb' },
  Secondary: { bg: '#f8fafc', border: '#e2e8f0', color: '#94a3b8' },
} as const

const SOURCE_META = {
  Inferred: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' },
  Added: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
  Modified: { bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
} as const

function getAdjustedScore(taskName: string, baseScore: number, phase: DemoPhase): number {
  if (phase === 'baseline') return baseScore
  const calDelta = CALIBRATION_DELTAS[taskName] ?? 0
  const upDelta = phase === 'upskilled' ? (UPSKILLING_EXTRA_DELTAS[taskName] ?? 0) : 0
  return Math.min(100, Math.max(0, baseScore + calDelta + upDelta))
}

const ZONE_META = {
  above: { label: 'Automate', icon: 'precision_manufacturing', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', activeBorder: '#6366f1', desc: 'AI runs autonomously' },
  augment: { label: 'Augment', icon: 'smart_toy', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', activeBorder: '#15803d', desc: 'Human leads, AI assists' },
  below: { label: 'Human', icon: 'person', color: '#64748b', bg: '#f8fafc', border: '#e5e7eb', activeBorder: '#64748b', desc: 'Requires judgment or trust' },
}

export type { DemoPhase }

interface Props {
  role: { title: string }
  phase?: DemoPhase
  viewMode?: 'all' | 'classification' | 'source'
  /**
   * Diff mode: instead of hiding adminRemoved tasks, keep them in the list
   * with "Not included" styling so users can compare employee vs. role template.
   * Employee-added tasks get an "Employee" badge.
   */
  diffMode?: boolean
  adminEditing?: boolean
  adminAdded?: { task: string; score: number; description?: string }[]
  adminRemoved?: Set<string>
  pendingRemoved?: Set<string>
  draftAddedNames?: Set<string>
  /** Tasks already submitted for review (pending approval) — shown with normal bg + "Pending" badge. */
  pendingAddedNames?: Set<string>
  onAdminRemove?: (taskName: string) => void
  /** Called when the user clicks "Add back" on a Not Included row in compare mode (non-editing). */
  onRestore?: (taskName: string) => void
}

export function WfrTaskSheetBody({ role, phase = 'baseline', viewMode = 'classification', diffMode, adminEditing, adminAdded, adminRemoved, pendingRemoved, draftAddedNames, pendingAddedNames, onAdminRemove, onRestore }: Props) {
  const [zoneFilter, setZoneFilter] = useState<'augment' | 'above' | 'below' | null>(null)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  useEffect(() => { setZoneFilter(null) }, [phase])

  const toggleTask = (name: string) =>
    setExpandedTasks(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })

  const rawBaseTasks = getTasksForRole(role.title)
  const baseTasks = diffMode
    // Keep ALL role template tasks + any employee-added tasks not already in the template
    ? [...rawBaseTasks, ...(adminAdded?.filter(a => !rawBaseTasks.some(b => b.task === a.task)) ?? [])]
    : (adminAdded || adminRemoved)
      ? [...rawBaseTasks.filter(t => !adminRemoved?.has(t.task)), ...(adminAdded ?? [])]
      : rawBaseTasks
  const adminAddedNames = new Set((adminAdded ?? []).map(t => t.task))
  const adminAddedMap = new Map((adminAdded ?? []).map(t => [t.task, t]))

  const tasks = baseTasks.map(t => ({
    ...t,
    adjustedScore: getAdjustedScore(t.task, t.score, phase),
    baseZone: getZone(t.score),
    zone: getZone(getAdjustedScore(t.task, t.score, phase)),
  }))

  const baselineCounts = {
    above: baseTasks.filter(t => getZone(t.score) === 'above').length,
    augment: baseTasks.filter(t => getZone(t.score) === 'augment').length,
    below: baseTasks.filter(t => getZone(t.score) === 'below').length,
  }

  const groups = (['above', 'augment', 'below'] as const).map(zone => ({
    zone,
    ...ZONE_META[zone],
    tasks: tasks.filter(t => t.zone === zone),
    delta: phase !== 'baseline' ? tasks.filter(t => t.zone === zone).length - baselineCounts[zone] : 0,
  }))

  const visibleGroups = zoneFilter
    ? groups.filter(g => g.zone === zoneFilter && g.tasks.length > 0)
    : groups.filter(g => g.tasks.length > 0)

  const renderTaskRow = (t: typeof tasks[number], i: number) => {
    const meta = ZONE_META[t.zone]
    const isPendingDelete = pendingRemoved?.has(t.task) ?? false
    const isOpen = expandedTasks.has(t.task)
    const skills = getSkills(t.task, t.zone)
    const analysis = getAnalysis(t.task)
    const aiCaps = getAICaps(t.task, t.zone)
    const humanEdge = getHumanEdge(t.task, t.zone)
    const confidence = getConfidence(t.task)
    return (
      <div key={i} onClick={() => !isPendingDelete && toggleTask(t.task)}
        style={{ padding: '10px 12px', borderRadius: 6, cursor: isPendingDelete ? 'default' : 'pointer', opacity: isPendingDelete ? 0.6 : 1,
          border: `1px solid ${isPendingDelete ? '#fecaca' : draftAddedNames?.has(t.task) ? '#fde68a' : '#e5e7eb'}`,
          background: isPendingDelete ? '#fff1f2' : draftAddedNames?.has(t.task) ? '#fffbeb' : '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="text-[13px] font-medium" style={{ flex: 1, minWidth: 0, color: isPendingDelete ? '#94a3b8' : '#1a212e', textDecoration: isPendingDelete ? 'line-through' : 'none' }}>{t.task}</span>
          {!isPendingDelete && <span style={{ padding: '2px 7px', borderRadius: 10, background: meta.bg, border: `1px solid ${meta.border}`, fontSize: 11, fontWeight: 600, color: meta.color, whiteSpace: 'nowrap', flexShrink: 0 }}>{meta.label}</span>}
          {isPendingDelete && <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 500, flexShrink: 0 }}>Removed</span>}
          {adminEditing && onAdminRemove && (
            <button type="button" onClick={e => { e.stopPropagation(); onAdminRemove(t.task) }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', color: isPendingDelete ? '#ef4444' : '#cbd5e1', padding: 0, flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = isPendingDelete ? '#be123c' : '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = isPendingDelete ? '#ef4444' : '#cbd5e1')}
              title={isPendingDelete ? 'Restore task' : 'Remove task'}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{isPendingDelete ? 'undo' : 'delete'}</span>
            </button>
          )}
          {!isPendingDelete && <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#94a3b8', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', lineHeight: 1, flexShrink: 0 }}>expand_more</span>}
        </div>
        {!isPendingDelete && isOpen && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px', lineHeight: 1.5 }}>{adminAddedMap.get(t.task)?.description ?? getDescription(t.task)}</p>
            <p style={{ fontSize: 12, color: '#475569', margin: '0 0 14px', lineHeight: 1.6 }}>{analysis}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13, lineHeight: 1 }}>smart_toy</span>
                  AI Capabilities
                </div>
                {aiCaps.map(cap => <div key={cap} style={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>• {cap}</div>)}
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13, lineHeight: 1 }}>person</span>
                  Human Strengths
                </div>
                {humanEdge.map(edge => <div key={edge} style={{ fontSize: 11, color: '#92400e', lineHeight: 1.6 }}>• {edge}</div>)}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {skills.map(skill => <SkillTag key={skill}>{skill}</SkillTag>)}
            </div>
            {!adminAddedNames.has(t.task) && (
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{confidence.pct}% confidence · {confidence.sources} sources · {confidence.companies} companies using AI</span>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {(() => { const p = getPriority(t.adjustedScore); const pm = PRIORITY_META[p]; return <span key="pri" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}><span style={{ color: '#94a3b8' }}>Priority</span><span style={{ color: pm.color, fontWeight: 600 }}>{p}</span></span> })()}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}><span style={{ color: '#94a3b8' }}>Source</span><span style={{ color: adminAddedNames.has(t.task) ? SOURCE_META.Added.color : SOURCE_META.Inferred.color, fontWeight: 600 }}>{adminAddedNames.has(t.task) ? 'Added' : 'Inferred'}</span></span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (viewMode === 'all') {
    const primaryTasks = [...tasks].filter(t => getPriority(t.adjustedScore) === 'Primary').sort((a, b) => b.adjustedScore - a.adjustedScore)
    const secondaryTasks = [...tasks].filter(t => getPriority(t.adjustedScore) === 'Secondary').sort((a, b) => b.adjustedScore - a.adjustedScore)
    return (
      <>
        {primaryTasks.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>Primary</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{primaryTasks.length} tasks</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{primaryTasks.map(renderTaskRow)}</div>
          </div>
        )}
        {secondaryTasks.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Secondary</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{secondaryTasks.length} tasks</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{secondaryTasks.map(renderTaskRow)}</div>
          </div>
        )}
      </>
    )
  }

  if (viewMode === 'source') {
    const inferred = [...tasks].filter(t => !adminAddedNames.has(t.task)).sort((a, b) => b.adjustedScore - a.adjustedScore)
    const added = [...tasks].filter(t => adminAddedNames.has(t.task)).sort((a, b) => b.adjustedScore - a.adjustedScore)
    return (
      <div>
        {inferred.length > 0 && (
          <div style={{ marginBottom: added.length > 0 ? 20 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Inferred</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{inferred.length} tasks</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{inferred.map(renderTaskRow)}</div>
          </div>
        )}
        {added.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>Added</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{added.length} tasks</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{added.map(renderTaskRow)}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Zone filter cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {groups.map(g => {
          const isActive = zoneFilter === g.zone
          const isDimmed = zoneFilter != null && !isActive
          return (
            <div key={g.zone} onClick={() => setZoneFilter(prev => prev === g.zone ? null : g.zone)} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: isActive ? `2px solid ${g.activeBorder}` : `1px solid ${g.border}`, background: g.bg, cursor: 'pointer', opacity: isDimmed ? 0.45 : 1, transition: 'opacity 0.15s, border-color 0.15s' }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: g.color }}>{g.tasks.length}</span>
              <div style={{ fontSize: 12, color: g.color, fontWeight: 700 }}>{g.label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{g.desc}</div>
            </div>
          )
        })}
      </div>

      {/* Task groups */}
      {visibleGroups.map(group => (
        <div key={group.label} style={{ marginBottom: 16 }}>
          <div style={{ padding: '8px 12px', borderRadius: 8, background: group.bg, border: `1px solid ${group.border}`, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: group.color }}>{group.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: group.color }}>{group.label}</span>
              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>{group.tasks.length} tasks</span>
              <span style={{ flex: 1 }} />
              {group.delta !== 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '1px 6px', borderRadius: 8, background: group.delta > 0 ? group.bg : '#fff1f2', border: `1px solid ${group.delta > 0 ? group.border : '#fecaca'}`, fontSize: 11, fontWeight: 700, color: group.delta > 0 ? group.color : '#be123c' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 11, lineHeight: 1 }}>{group.delta > 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                  {group.delta > 0 ? `+${group.delta}` : group.delta}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {group.tasks.sort((a, b) => b.adjustedScore - a.adjustedScore).map((t, i) => {
              const moved = phase !== 'baseline' && t.zone !== t.baseZone
              const movedUp = moved && (['above', 'augment', 'below'].indexOf(t.zone) < ['above', 'augment', 'below'].indexOf(t.baseZone))
              const isPendingDelete = pendingRemoved?.has(t.task) ?? false
              const isNotIncluded = !!(diffMode && adminRemoved?.has(t.task))
              const isOpen = expandedTasks.has(t.task)
              const skills = getSkills(t.task, group.zone)
              const analysis = getAnalysis(t.task)
              const aiCaps = getAICaps(t.task, t.zone)
              const humanEdge = getHumanEdge(t.task, t.zone)
              const confidence = getConfidence(t.task)
              return (
                <div
                  key={i}
                  onClick={() => !isPendingDelete && !isNotIncluded && toggleTask(t.task)}
                  style={{ padding: '10px 12px', borderRadius: 6,
                    cursor: isNotIncluded || isPendingDelete ? 'default' : 'pointer',
                    opacity: isPendingDelete ? 0.6 : 1,
                    transition: 'background 0.1s',
                    border: `1px solid ${isNotIncluded ? '#e2e8f0' : isPendingDelete ? '#fecaca' : moved ? (movedUp ? '#c7d2fe' : '#fecaca') : draftAddedNames?.has(t.task) ? '#fde68a' : '#e5e7eb'}`,
                    background: isNotIncluded ? '#f8fafc' : isPendingDelete ? '#fff1f2' : moved ? (movedUp ? '#fafafe' : '#fff8f8') : draftAddedNames?.has(t.task) ? '#fffbeb' : '#fff' }}
                >
                  {/* Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span className="text-[13px] font-medium" style={{ color: isNotIncluded ? '#94a3b8' : isPendingDelete ? '#94a3b8' : '#1a212e', textDecoration: isNotIncluded || isPendingDelete ? 'line-through' : 'none' }}>{t.task}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {/* Not-included state (diffMode: approved removal) */}
                      {isNotIncluded && adminEditing && onAdminRemove && (
                        <button type="button" onClick={e => { e.stopPropagation(); onAdminRemove(t.task) }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#15803d')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                          title="Restore task">
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>undo</span>
                        </button>
                      )}
                      {isNotIncluded && !adminEditing && onRestore && (
                        <button type="button" onClick={e => { e.stopPropagation(); onRestore(t.task) }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 10, border: '1px solid #bbf7d0', background: '#f0fdf4', cursor: 'pointer', color: '#15803d', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#86efac' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#bbf7d0' }}
                          title="Add">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>add</span>
                          Add
                        </button>
                      )}
                      {/* Normal / pending-delete states */}
                      {!isNotIncluded && isPendingDelete && <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 500 }}>Removed</span>}
                      {!isNotIncluded && !isPendingDelete && moved && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 10, background: movedUp ? '#eef2ff' : '#fff1f2', border: `1px solid ${movedUp ? '#c7d2fe' : '#fecaca'}`, fontSize: 11, fontWeight: 600, color: movedUp ? '#4338ca' : '#be123c', whiteSpace: 'nowrap' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11, lineHeight: 1 }}>{movedUp ? 'arrow_upward' : 'arrow_downward'}</span>
                          was {ZONE_META[t.baseZone].label}
                        </span>
                      )}
                      {/* Pending badge — task submitted but awaiting manager approval */}
                      {!isNotIncluded && !isPendingDelete && pendingAddedNames?.has(t.task) && (
                        <span style={{ padding: '2px 6px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', fontSize: 10, fontWeight: 700, color: '#b45309', whiteSpace: 'nowrap' }}>Pending</span>
                      )}
                      {/* Employee-added badge in diffMode */}
                      {!isNotIncluded && !isPendingDelete && diffMode && adminAddedNames.has(t.task) && (
                        <span style={{ padding: '2px 6px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 10, fontWeight: 700, color: '#15803d', whiteSpace: 'nowrap' }}>Added</span>
                      )}
                      {!isNotIncluded && adminEditing && onAdminRemove && (
                        <button type="button" onClick={e => { e.stopPropagation(); onAdminRemove(t.task) }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', color: isPendingDelete ? '#ef4444' : '#cbd5e1', padding: 0 }}
                          onMouseEnter={e => (e.currentTarget.style.color = isPendingDelete ? '#be123c' : '#ef4444')}
                          onMouseLeave={e => (e.currentTarget.style.color = isPendingDelete ? '#ef4444' : '#cbd5e1')}
                          title={isPendingDelete ? 'Restore task' : 'Remove task'}>
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{isPendingDelete ? 'undo' : 'delete'}</span>
                        </button>
                      )}
                      {!isNotIncluded && !isPendingDelete && <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#94a3b8', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', lineHeight: 1 }}>expand_more</span>}
                    </div>
                  </div>
                  {/* Expanded content — suppressed for not-included rows */}
                  {!isNotIncluded && !isPendingDelete && isOpen && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                      {adminAddedMap.get(t.task)?.description && (
                        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px', lineHeight: 1.5 }}>{adminAddedMap.get(t.task)!.description}</p>
                      )}
                      <p style={{ fontSize: 12, color: '#475569', margin: '0 0 14px', lineHeight: 1.6 }}>{analysis}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                        <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13, lineHeight: 1 }}>smart_toy</span>
                            AI Capabilities
                          </div>
                          {aiCaps.map(cap => <div key={cap} style={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>• {cap}</div>)}
                        </div>
                        <div style={{ padding: '10px 12px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13, lineHeight: 1 }}>person</span>
                            Human Strengths
                          </div>
                          {humanEdge.map(edge => <div key={edge} style={{ fontSize: 11, color: '#92400e', lineHeight: 1.6 }}>• {edge}</div>)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                        {skills.map(skill => <SkillTag key={skill}>{skill}</SkillTag>)}
                      </div>
                      {!adminAddedNames.has(t.task) && (
                        <div style={{ marginBottom: 10 }}>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{confidence.pct}% confidence · {confidence.sources} sources · {confidence.companies} companies using AI</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {(() => { const p = getPriority(t.adjustedScore); const pm = PRIORITY_META[p]; return <span key="pri" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}><span style={{ color: '#94a3b8' }}>Priority</span><span style={{ color: pm.color, fontWeight: 600 }}>{p}</span></span> })()}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}><span style={{ color: '#94a3b8' }}>Source</span><span style={{ color: adminAddedNames.has(t.task) ? SOURCE_META.Added.color : SOURCE_META.Inferred.color, fontWeight: 600 }}>{adminAddedNames.has(t.task) ? 'Added' : 'Inferred'}</span></span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
