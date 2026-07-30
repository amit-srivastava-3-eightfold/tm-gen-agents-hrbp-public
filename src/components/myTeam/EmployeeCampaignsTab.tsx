import { useState, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@tonyh-2-eightfold/ef-design-system'
import { FocusFirstLaunchDialog, type CampaignLaunchData, type CampaignDraftData, type HrbpDirector } from '../workforceReadiness/FocusFirstLaunchDialog'
import { CampaignAuthoringAgent } from './CampaignAuthoringAgent'
import './EmployeeCampaignsTab.css'

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignStatus = 'active' | 'completed' | 'draft'

type Campaign = {
  id: string
  name: string
  typeId: string
  typeLabel: string
  typeIcon: string
  status: CampaignStatus
  teamNames: string[]
  employeeCount: number
  channelLabel: string
  periodStart: string
  periodEnd: string
  isRecurring: boolean
  recurringFreq?: string
  responsesReceived: number
  targetCount: number
  launchedAt?: string
  completedAt?: string
  createdAt: string
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Engagement Pulse · Jun 2026',
    typeId: 'engagement-pulse',
    typeLabel: 'Engagement Pulse',
    typeIcon: 'favorite',
    status: 'active',
    teamNames: ['Alex Chen', 'Maria Garcia', 'Jordan Lee'],
    employeeCount: 312,
    channelLabel: 'AI Interviews',
    periodStart: '2026-06-01',
    periodEnd: '2026-07-31',
    isRecurring: true,
    recurringFreq: 'quarterly',
    responsesReceived: 198,
    targetCount: 312,
    launchedAt: '2026-06-01',
    createdAt: '2026-05-28',
  },
  {
    id: 'camp-2',
    name: 'Learning Needs Assessment · Jun 2026',
    typeId: 'learning-needs',
    typeLabel: 'Learning Needs Assessment',
    typeIcon: 'school',
    status: 'active',
    teamNames: ['Sam Rivera', 'Taylor Kim'],
    employeeCount: 187,
    channelLabel: 'Surveys',
    periodStart: '2026-06-15',
    periodEnd: '2026-07-15',
    isRecurring: false,
    responsesReceived: 76,
    targetCount: 187,
    launchedAt: '2026-06-15',
    createdAt: '2026-06-12',
  },
  {
    id: 'camp-3',
    name: 'Onboarding Check-in · Mar 2026',
    typeId: 'onboarding-checkin',
    typeLabel: 'Onboarding Check-in',
    typeIcon: 'waving_hand',
    status: 'completed',
    teamNames: ['Alex Chen', 'Jordan Lee', 'Sam Rivera', 'Taylor Kim', 'Maria Garcia'],
    employeeCount: 89,
    channelLabel: 'AI Interviews',
    periodStart: '2026-03-01',
    periodEnd: '2026-04-30',
    isRecurring: false,
    responsesReceived: 79,
    targetCount: 89,
    launchedAt: '2026-03-01',
    completedAt: '2026-04-30',
    createdAt: '2026-02-25',
  },
  {
    id: 'camp-4',
    name: 'Manager Effectiveness · Jun 2026',
    typeId: 'manager-effectiveness',
    typeLabel: 'Manager Effectiveness',
    typeIcon: 'supervisor_account',
    status: 'draft',
    teamNames: [],
    employeeCount: 0,
    channelLabel: '',
    periodStart: '',
    periodEnd: '',
    isRecurring: false,
    responsesReceived: 0,
    targetCount: 0,
    createdAt: '2026-06-28',
  },
]

// Default HRBP directors for the "Launch new campaign" dialog
const DEFAULT_HRBP_DIRECTORS: HrbpDirector[] = [
  { name: 'Alex Chen', title: 'Director Engineering', employees: 124, teamManagers: 4, readiness: 34, readyCount: 42 },
  { name: 'Maria Garcia', title: 'Director Sales', employees: 98, teamManagers: 3, readiness: 28, readyCount: 27 },
  { name: 'Jordan Lee', title: 'Director Customer Success', employees: 90, teamManagers: 3, readiness: 41, readyCount: 37 },
  { name: 'Sam Rivera', title: 'Sr. Director Operations', employees: 115, teamManagers: 4, readiness: 22, readyCount: 25 },
  { name: 'Taylor Kim', title: 'Director Product', employees: 72, teamManagers: 2, readiness: 45, readyCount: 32 },
  { name: 'Morgan Patel', title: 'Director Finance', employees: 58, teamManagers: 2, readiness: 31, readyCount: 18 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  'ai-adoption': '#8b5cf6',
  'skills-checkin': '#6366f1',
  'engagement-pulse': '#f43f5e',
  'manager-effectiveness': '#a855f7',
  'career-intent': '#f97316',
  'benefits-feedback': '#14b8a6',
  'learning-needs': '#3b82f6',
  'onboarding-checkin': '#22c55e',
}

function typeColor(typeId: string) {
  return TYPE_COLORS[typeId] ?? '#64748b'
}

function fmtDate(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`
}

function daysRemaining(endIso: string) {
  if (!endIso) return null
  const end = new Date(endIso).getTime()
  const now = new Date('2026-06-30').getTime()
  return Math.max(0, Math.round((end - now) / 86400000))
}

function responseRate(c: Campaign) {
  if (c.targetCount === 0) return 0
  return Math.round((c.responsesReceived / c.targetCount) * 100)
}

// Synthetic per-team breakdown for detail view
function teamBreakdown(c: Campaign) {
  if (c.teamNames.length === 0) return []
  const totalEmp = c.teamNames.length > 0 ? c.employeeCount : 0
  let remaining = c.responsesReceived
  return c.teamNames.map((name, i) => {
    const empShare = Math.round(totalEmp / c.teamNames.length) + (i === 0 ? totalEmp % c.teamNames.length : 0)
    const rate = Math.min(100, Math.max(20, responseRate(c) + (i % 3 === 0 ? 8 : i % 3 === 1 ? -5 : 2)))
    const resp = Math.round(empShare * rate / 100)
    remaining -= resp
    return { name, employees: empShare, responses: Math.max(0, resp), rate }
  })
}

// ─── Response data ────────────────────────────────────────────────────────────

type ResponseRow = Record<string, string>

type ResponseTemplate = {
  columns: string[]
  generate: (empId: string, team: string, date: string, idx: number) => ResponseRow
}

const RESPONSE_TEMPLATES: Record<string, ResponseTemplate> = {
  'engagement-pulse': {
    columns: ['Employee ID', 'Team', 'Response Date', 'Work Satisfaction (1–5)', 'Manager Support (1–5)', 'NPS (0–10)', 'Feeling of Belonging (1–5)', 'Top Concern'],
    generate: (empId, team, date, idx) => {
      const sat = [4, 3, 5, 4, 3, 4, 2, 5, 4, 3, 4, 5, 3, 4, 4][idx % 15]
      const mgr = [5, 4, 4, 3, 5, 4, 3, 5, 4, 4, 3, 5, 4, 3, 5][idx % 15]
      const nps = [8, 6, 9, 7, 5, 8, 4, 9, 7, 8, 6, 9, 7, 5, 8][idx % 15]
      const belong = [4, 3, 5, 4, 3, 5, 2, 4, 5, 3, 4, 5, 3, 4, 4][idx % 15]
      const concerns = ['Work-life balance', 'Career growth opportunities', 'Recognition', 'Team collaboration', 'Workload', 'Clarity of goals', 'Compensation', 'Remote flexibility']
      return { 'Employee ID': empId, 'Team': team, 'Response Date': date, 'Work Satisfaction (1–5)': String(sat), 'Manager Support (1–5)': String(mgr), 'NPS (0–10)': String(nps), 'Feeling of Belonging (1–5)': String(belong), 'Top Concern': concerns[idx % concerns.length] }
    },
  },
  'learning-needs': {
    columns: ['Employee ID', 'Team', 'Response Date', 'Top Learning Priority', 'Current Skill Level (1–5)', 'Preferred Format', 'Hours/Week Available', 'Barriers to Learning'],
    generate: (empId, team, date, idx) => {
      const priorities = ['AI & Automation', 'Data Analysis', 'Leadership & Coaching', 'Project Management', 'Communication', 'Technical Skills', 'Product Strategy', 'Customer Empathy']
      const formats = ['Self-paced online', 'Live workshop', '1:1 Coaching', 'Peer learning circles', 'On-the-job projects', 'Mentorship']
      const barriers = ['Not enough time', 'Relevant content is hard to find', 'No clear learning path', 'Manager support needed', 'Prefer in-person', 'Budget constraints']
      const level = [3, 2, 4, 3, 2, 4, 3, 5, 2, 3, 4, 3, 2, 4, 3][idx % 15]
      const hrs = [2, 3, 1, 4, 2, 3, 1, 5, 2, 3, 2, 4, 1, 3, 2][idx % 15]
      return { 'Employee ID': empId, 'Team': team, 'Response Date': date, 'Top Learning Priority': priorities[idx % priorities.length], 'Current Skill Level (1–5)': String(level), 'Preferred Format': formats[idx % formats.length], 'Hours/Week Available': String(hrs), 'Barriers to Learning': barriers[idx % barriers.length] }
    },
  },
  'onboarding-checkin': {
    columns: ['Employee ID', 'Team', 'Response Date', 'Check-in Milestone', 'Role Clarity (1–5)', 'Team Connection (1–5)', 'Onboarding Quality (1–5)', 'Retention Likelihood (1–10)', 'Improvement Suggestion'],
    generate: (empId, team, date, idx) => {
      const milestones = ['30-day', '60-day', '90-day']
      const clarity = [4, 3, 5, 4, 3, 5, 4, 3, 4, 5, 3, 4, 5, 4, 3][idx % 15]
      const conn = [4, 4, 5, 3, 4, 5, 3, 4, 5, 4, 3, 5, 4, 3, 5][idx % 15]
      const qual = [4, 3, 4, 5, 3, 4, 4, 5, 3, 4, 4, 5, 3, 4, 4][idx % 15]
      const retain = [8, 7, 9, 8, 6, 9, 7, 8, 9, 7, 8, 9, 6, 8, 9][idx % 15]
      const suggestions = ['More structured buddy program', 'Earlier system access', 'Clearer 90-day goals', 'More 1:1s with manager', 'Better documentation', 'Intro to cross-functional teams', 'Product training earlier', 'Shadow more experienced teammates']
      return { 'Employee ID': empId, 'Team': team, 'Response Date': date, 'Check-in Milestone': milestones[idx % 3], 'Role Clarity (1–5)': String(clarity), 'Team Connection (1–5)': String(conn), 'Onboarding Quality (1–5)': String(qual), 'Retention Likelihood (1–10)': String(retain), 'Improvement Suggestion': suggestions[idx % suggestions.length] }
    },
  },
  'skills-checkin': {
    columns: ['Employee ID', 'Team', 'Response Date', 'Self-Assessed Skill Level (1–5)', 'Skill Gap Area', 'Confidence in Role (1–5)', 'Key Strength', 'Development Priority'],
    generate: (empId, team, date, idx) => {
      const gaps = ['Data interpretation', 'Stakeholder communication', 'Process automation', 'Strategic thinking', 'Cross-functional collaboration', 'AI tool proficiency', 'Documentation']
      const strengths = ['Problem solving', 'Customer empathy', 'Technical depth', 'Team leadership', 'Attention to detail', 'Adaptability', 'Communication']
      const devPriorities = ['Coaching & mentorship', 'Formal training', 'Stretch assignment', 'External certification', 'Peer learning', 'On-the-job practice']
      const level = [3, 4, 2, 4, 3, 5, 3, 4, 2, 3, 4, 3, 5, 2, 4][idx % 15]
      const conf = [4, 3, 3, 5, 4, 4, 3, 4, 3, 5, 4, 3, 4, 3, 5][idx % 15]
      return { 'Employee ID': empId, 'Team': team, 'Response Date': date, 'Self-Assessed Skill Level (1–5)': String(level), 'Skill Gap Area': gaps[idx % gaps.length], 'Confidence in Role (1–5)': String(conf), 'Key Strength': strengths[idx % strengths.length], 'Development Priority': devPriorities[idx % devPriorities.length] }
    },
  },
  'manager-effectiveness': {
    columns: ['Employee ID', 'Team', 'Response Date', 'Manager Clarity (1–5)', 'Manager Coaching (1–5)', 'Psychological Safety (1–5)', 'Recognition Frequency (1–5)', 'Open Feedback'],
    generate: (empId, team, date, idx) => {
      const clarity = [4, 5, 3, 4, 5, 3, 4, 4, 5, 3, 4, 5, 4, 3, 4][idx % 15]
      const coaching = [3, 4, 5, 3, 4, 4, 3, 5, 4, 3, 4, 5, 3, 4, 4][idx % 15]
      const safety = [4, 4, 5, 3, 4, 5, 4, 3, 5, 4, 3, 5, 4, 4, 3][idx % 15]
      const recog = [3, 4, 4, 3, 5, 3, 4, 4, 3, 5, 4, 3, 4, 5, 3][idx % 15]
      const feedback = ['Good at setting context, could check in more often', 'Very supportive in 1:1s', 'Clear on priorities, sometimes hard to reach', 'Excellent coach, great listener', 'Pushes team to grow', 'Could give more direct feedback', 'Creates a safe space to share ideas']
      return { 'Employee ID': empId, 'Team': team, 'Response Date': date, 'Manager Clarity (1–5)': String(clarity), 'Manager Coaching (1–5)': String(coaching), 'Psychological Safety (1–5)': String(safety), 'Recognition Frequency (1–5)': String(recog), 'Open Feedback': feedback[idx % feedback.length] }
    },
  },
  'career-intent': {
    columns: ['Employee ID', 'Team', 'Response Date', 'Intent to Stay (1–5)', 'Internal Mobility Interest', 'Next Career Move', 'Timeline', 'Support Needed'],
    generate: (empId, team, date, idx) => {
      const intent = [4, 3, 5, 4, 2, 4, 5, 3, 4, 5, 3, 4, 2, 5, 4][idx % 15]
      const mobility = ['Yes', 'No', 'Maybe', 'Yes', 'Yes', 'No', 'Maybe', 'Yes', 'No', 'Yes', 'Maybe', 'Yes', 'No', 'Maybe', 'Yes'][idx % 15]
      const moves = ['Individual contributor growth', 'People management', 'Cross-functional move', 'Specialist track', 'Leadership development', 'Lateral move for breadth', 'Stay in current role']
      const timelines = ['6 months', '1 year', '2+ years', '6 months', '1 year', 'Not sure', '2+ years'][idx % 7]
      const support = ['Mentorship', 'Stretch projects', 'External training budget', 'Clearer growth path', 'More 1:1 time with manager', 'Internal job postings', 'Skill development plan']
      return { 'Employee ID': empId, 'Team': team, 'Response Date': date, 'Intent to Stay (1–5)': String(intent), 'Internal Mobility Interest': mobility, 'Next Career Move': moves[idx % moves.length], 'Timeline': timelines, 'Support Needed': support[idx % support.length] }
    },
  },
  'benefits-feedback': {
    columns: ['Employee ID', 'Team', 'Response Date', 'Overall Benefits Satisfaction (1–5)', 'Most Used Benefit', 'Underused Benefit', 'Missing Benefit', 'NPS (0–10)'],
    generate: (empId, team, date, idx) => {
      const sat = [4, 3, 5, 4, 4, 3, 5, 4, 3, 5, 4, 3, 4, 5, 4][idx % 15]
      const nps = [8, 7, 9, 8, 6, 8, 9, 7, 8, 9, 7, 8, 6, 9, 8][idx % 15]
      const mostUsed = ['Health insurance', 'Flexible PTO', '401k match', 'Remote work', 'Learning stipend', 'Health insurance', 'Gym reimbursement']
      const underused = ['Mental health support', 'Legal assistance', 'Childcare subsidy', 'Financial coaching', 'Fertility benefits', 'Student loan assistance']
      const missing = ['Pet insurance', 'Home office stipend', 'Volunteer time off', 'Elder care support', 'More PTO', 'Sabbatical program', 'None — satisfied']
      return { 'Employee ID': empId, 'Team': team, 'Response Date': date, 'Overall Benefits Satisfaction (1–5)': String(sat), 'Most Used Benefit': mostUsed[idx % mostUsed.length], 'Underused Benefit': underused[idx % underused.length], 'Missing Benefit': missing[idx % missing.length], 'NPS (0–10)': String(nps) }
    },
  },
  'ai-adoption': {
    columns: ['Employee ID', 'Team', 'Response Date', 'AI Usage Frequency', 'Tasks Automated (hrs/wk)', 'Biggest AI Use Case', 'Confidence Using AI (1–5)', 'Barrier to Adoption'],
    generate: (empId, team, date, idx) => {
      const freq = ['Daily', 'Weekly', 'Daily', 'Rarely', 'Daily', 'Weekly', 'Daily', 'Monthly', 'Daily', 'Weekly', 'Daily', 'Daily', 'Weekly', 'Rarely', 'Daily'][idx % 15]
      const hrs = [4, 2, 6, 0, 8, 3, 5, 1, 7, 3, 6, 4, 2, 0, 5][idx % 15]
      const useCases = ['Drafting emails & documents', 'Data summarization', 'Code assistance', 'Meeting summaries', 'Research & analysis', 'Content creation', 'Customer responses', 'Report generation']
      const conf = [4, 3, 5, 2, 5, 3, 4, 2, 5, 4, 4, 5, 3, 2, 4][idx % 15]
      const barriers = ['Not sure which tools to use', 'Concerns about accuracy', 'No training provided', 'Data privacy concerns', 'Manager not supportive', 'Already using it effectively', 'Limited access to approved tools']
      return { 'Employee ID': empId, 'Team': team, 'Response Date': date, 'AI Usage Frequency': freq, 'Tasks Automated (hrs/wk)': String(hrs), 'Biggest AI Use Case': useCases[idx % useCases.length], 'Confidence Using AI (1–5)': String(conf), 'Barrier to Adoption': barriers[idx % barriers.length] }
    },
  },
}

// Fallback template for any unlisted type
const FALLBACK_TEMPLATE: ResponseTemplate = {
  columns: ['Employee ID', 'Team', 'Response Date', 'Score (1–5)', 'Key Theme', 'Open Comment'],
  generate: (empId, team, date, idx) => {
    const score = [4, 3, 5, 4, 3, 5, 4, 3, 4, 5, 3, 4, 5, 4, 3][idx % 15]
    const themes = ['Communication', 'Workload', 'Growth', 'Team dynamics', 'Recognition', 'Processes', 'Tools & resources']
    const comments = ['Generally positive, some areas to improve', 'Good experience overall', 'Would appreciate more clarity', 'Team culture is strong', 'More resources needed', 'Satisfied with current setup', 'Looking for more growth opportunities']
    return { 'Employee ID': empId, 'Team': team, 'Response Date': date, 'Score (1–5)': String(score), 'Key Theme': themes[idx % themes.length], 'Open Comment': comments[idx % comments.length] }
  },
}

function generateResponseRows(campaign: Campaign): ResponseRow[] {
  const template = RESPONSE_TEMPLATES[campaign.typeId] ?? FALLBACK_TEMPLATE
  const total = Math.min(campaign.responsesReceived, 50) // cap for synthetic data
  const breakdown = teamBreakdown(campaign)
  const rows: ResponseRow[] = []

  // Distribute responses across teams
  const teamPool = breakdown.length > 0
    ? breakdown.flatMap(t => Array(Math.max(1, Math.round(t.responses * total / Math.max(1, campaign.responsesReceived)))).fill(t.name) as string[])
    : campaign.teamNames.length > 0 ? campaign.teamNames : ['—']

  // Evenly spaced dates between launch and today (or end date)
  const start = new Date(campaign.launchedAt ?? campaign.periodStart ?? '2026-06-01').getTime()
  const end = new Date(campaign.completedAt ?? campaign.periodEnd ?? '2026-06-30').getTime()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let i = 0; i < total; i++) {
    const empId = `EMP-${String(1001 + i).padStart(4, '0')}`
    const team = teamPool[i % teamPool.length]
    const ts = start + ((end - start) * i) / Math.max(1, total - 1)
    const d = new Date(ts)
    const date = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
    rows.push(template.generate(empId, team, date, i))
  }
  return rows
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCsv(campaign: Campaign, rows: ResponseRow[]) {
  const template = RESPONSE_TEMPLATES[campaign.typeId] ?? FALLBACK_TEMPLATE
  const cols = template.columns
  const header = cols.join(',')
  const body = rows.map(row =>
    cols.map(col => {
      const val = row[col] ?? ''
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
    }).join(',')
  ).join('\n')
  const csv = `${header}\n${body}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${campaign.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-responses.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Insights ────────────────────────────────────────────────────────────────

type InsightKpi = { label: string; value: string; raw: number; outOf: number; color: string }
type InsightDist = { title: string; items: { label: string; count: number; pct: number }[] }
type InsightData = { kpis: InsightKpi[]; distributions: InsightDist[]; summary: string }

const INSIGHTS_CONFIG: Record<string, {
  kpis: { col: string; label: string; outOf: number; color: string }[]
  dists: { col: string; title: string }[]
  summary: (kpis: InsightKpi[], dists: InsightDist[]) => string
}> = {
  'engagement-pulse': {
    kpis: [
      { col: 'Work Satisfaction (1–5)', label: 'Avg Satisfaction', outOf: 5, color: '#f43f5e' },
      { col: 'Manager Support (1–5)', label: 'Avg Manager Support', outOf: 5, color: '#8b5cf6' },
      { col: 'NPS (0–10)', label: 'Avg NPS', outOf: 10, color: '#3b82f6' },
      { col: 'Feeling of Belonging (1–5)', label: 'Avg Belonging', outOf: 5, color: '#22c55e' },
    ],
    dists: [
      { col: 'Top Concern', title: 'Top Concerns' },
    ],
    summary: (kpis, dists) => {
      const sat = kpis.find(k => k.label === 'Avg Satisfaction')
      const nps = kpis.find(k => k.label === 'Avg NPS')
      const topConcern = dists[0]?.items[0]?.label ?? '—'
      return `Overall satisfaction is ${sat?.value ?? '—'}/5 with an NPS of ${nps?.value ?? '—'}/10. The most frequently cited concern is "${topConcern}", suggesting a focused area for action.`
    },
  },
  'learning-needs': {
    kpis: [
      { col: 'Current Skill Level (1–5)', label: 'Avg Skill Level', outOf: 5, color: '#3b82f6' },
      { col: 'Hours/Week Available', label: 'Avg Hrs/Wk Available', outOf: 10, color: '#f97316' },
    ],
    dists: [
      { col: 'Top Learning Priority', title: 'Top Learning Priorities' },
      { col: 'Preferred Format', title: 'Preferred Format' },
      { col: 'Barriers to Learning', title: 'Barriers to Learning' },
    ],
    summary: (_kpis, dists) => {
      const topPriority = dists[0]?.items[0]?.label ?? '—'
      const topFormat = dists[1]?.items[0]?.label ?? '—'
      const topBarrier = dists[2]?.items[0]?.label ?? '—'
      return `The highest-demand learning area is "${topPriority}". Most employees prefer ${topFormat} delivery. The most common barrier is "${topBarrier}".`
    },
  },
  'onboarding-checkin': {
    kpis: [
      { col: 'Role Clarity (1–5)', label: 'Avg Role Clarity', outOf: 5, color: '#22c55e' },
      { col: 'Team Connection (1–5)', label: 'Avg Team Connection', outOf: 5, color: '#6366f1' },
      { col: 'Onboarding Quality (1–5)', label: 'Avg Onboarding Quality', outOf: 5, color: '#f97316' },
      { col: 'Retention Likelihood (1–10)', label: 'Avg Retention Likelihood', outOf: 10, color: '#3b82f6' },
    ],
    dists: [
      { col: 'Improvement Suggestion', title: 'Top Improvement Suggestions' },
      { col: 'Check-in Milestone', title: 'Milestone Breakdown' },
    ],
    summary: (kpis, dists) => {
      const quality = kpis.find(k => k.label === 'Avg Onboarding Quality')
      const retention = kpis.find(k => k.label === 'Avg Retention Likelihood')
      const topSug = dists[0]?.items[0]?.label ?? '—'
      return `Onboarding quality scores ${quality?.value ?? '—'}/5 with a retention likelihood of ${retention?.value ?? '—'}/10. Employees most frequently suggest "${topSug}" as an improvement.`
    },
  },
  'skills-checkin': {
    kpis: [
      { col: 'Self-Assessed Skill Level (1–5)', label: 'Avg Skill Level', outOf: 5, color: '#6366f1' },
      { col: 'Confidence in Role (1–5)', label: 'Avg Confidence', outOf: 5, color: '#22c55e' },
    ],
    dists: [
      { col: 'Skill Gap Area', title: 'Key Skill Gaps' },
      { col: 'Key Strength', title: 'Reported Strengths' },
      { col: 'Development Priority', title: 'Development Priorities' },
    ],
    summary: (kpis, dists) => {
      const conf = kpis.find(k => k.label === 'Avg Confidence')
      const topGap = dists[0]?.items[0]?.label ?? '—'
      const topStrength = dists[1]?.items[0]?.label ?? '—'
      return `Team confidence averages ${conf?.value ?? '—'}/5. The most cited skill gap is "${topGap}" while the top self-reported strength is "${topStrength}".`
    },
  },
  'manager-effectiveness': {
    kpis: [
      { col: 'Manager Clarity (1–5)', label: 'Avg Clarity', outOf: 5, color: '#6366f1' },
      { col: 'Manager Coaching (1–5)', label: 'Avg Coaching', outOf: 5, color: '#f97316' },
      { col: 'Psychological Safety (1–5)', label: 'Avg Psych Safety', outOf: 5, color: '#22c55e' },
      { col: 'Recognition Frequency (1–5)', label: 'Avg Recognition', outOf: 5, color: '#f43f5e' },
    ],
    dists: [],
    summary: (kpis) => {
      const safety = kpis.find(k => k.label === 'Avg Psych Safety')
      const coaching = kpis.find(k => k.label === 'Avg Coaching')
      const recognition = kpis.find(k => k.label === 'Avg Recognition')
      const lowest = [safety, coaching, recognition].filter(Boolean).sort((a, b) => (a?.raw ?? 0) - (b?.raw ?? 0))[0]
      return `Psychological safety scores ${safety?.value ?? '—'}/5. ${lowest ? `"${lowest.label}" is the lowest-rated dimension at ${lowest.value}/5 — a potential focus area for manager development.` : ''}`
    },
  },
  'career-intent': {
    kpis: [
      { col: 'Intent to Stay (1–5)', label: 'Avg Intent to Stay', outOf: 5, color: '#22c55e' },
    ],
    dists: [
      { col: 'Internal Mobility Interest', title: 'Internal Mobility Interest' },
      { col: 'Next Career Move', title: 'Next Career Move Aspirations' },
      { col: 'Timeline', title: 'Move Timeline' },
      { col: 'Support Needed', title: 'Support Needed' },
    ],
    summary: (kpis, dists) => {
      const intent = kpis[0]
      const mobilityYes = dists[0]?.items.find(i => i.label === 'Yes')
      const topMove = dists[1]?.items[0]?.label ?? '—'
      return `Average intent to stay is ${intent?.value ?? '—'}/5. ${mobilityYes ? `${mobilityYes.pct}% of respondents are interested in internal mobility.` : ''} The most common career aspiration is "${topMove}".`
    },
  },
  'benefits-feedback': {
    kpis: [
      { col: 'Overall Benefits Satisfaction (1–5)', label: 'Avg Satisfaction', outOf: 5, color: '#14b8a6' },
      { col: 'NPS (0–10)', label: 'Avg NPS', outOf: 10, color: '#3b82f6' },
    ],
    dists: [
      { col: 'Most Used Benefit', title: 'Most Used Benefits' },
      { col: 'Underused Benefit', title: 'Underused Benefits' },
      { col: 'Missing Benefit', title: 'Requested / Missing Benefits' },
    ],
    summary: (kpis, dists) => {
      const sat = kpis[0]
      const topMissing = dists[2]?.items.find(i => i.label !== 'None — satisfied')?.label ?? '—'
      return `Benefits satisfaction is ${sat?.value ?? '—'}/5. The most commonly requested missing benefit is "${topMissing}".`
    },
  },
  'ai-adoption': {
    kpis: [
      { col: 'Confidence Using AI (1–5)', label: 'Avg AI Confidence', outOf: 5, color: '#8b5cf6' },
      { col: 'Tasks Automated (hrs/wk)', label: 'Avg Hrs Automated/Wk', outOf: 10, color: '#6366f1' },
    ],
    dists: [
      { col: 'AI Usage Frequency', title: 'Usage Frequency' },
      { col: 'Biggest AI Use Case', title: 'Top AI Use Cases' },
      { col: 'Barrier to Adoption', title: 'Barriers to Adoption' },
    ],
    summary: (kpis, dists) => {
      const conf = kpis[0]
      const topFreq = dists[0]?.items[0]?.label ?? '—'
      const topBarrier = dists[2]?.items[0]?.label ?? '—'
      return `AI confidence averages ${conf?.value ?? '—'}/5. ${topFreq} use is the most common cadence. The top adoption barrier is "${topBarrier}".`
    },
  },
}

function computeInsights(campaign: Campaign, rows: ResponseRow[]): InsightData | null {
  const cfg = INSIGHTS_CONFIG[campaign.typeId]
  if (!cfg || rows.length === 0) return null

  const kpis: InsightKpi[] = cfg.kpis.map(k => {
    const nums = rows.map(r => parseFloat(r[k.col] ?? '')).filter(n => !isNaN(n))
    const avg = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
    return { label: k.label, value: avg.toFixed(1), raw: avg, outOf: k.outOf, color: k.color }
  })

  const distributions: InsightDist[] = cfg.dists.map(d => {
    const counts: Record<string, number> = {}
    rows.forEach(r => {
      const val = r[d.col]
      if (val) counts[val] = (counts[val] ?? 0) + 1
    })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)
    const total = sorted.reduce((s, [, c]) => s + c, 0)
    return {
      title: d.title,
      items: sorted.map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) })),
    }
  })

  return { kpis, distributions, summary: cfg.summary(kpis, distributions) }
}

// ─── Qualitative (open-text) column config per type ──────────────────────────

const QUALITATIVE_COLS: Record<string, { col: string; label: string }[]> = {
  'engagement-pulse': [{ col: 'Top Concern', label: 'Concerns raised' }],
  'learning-needs': [{ col: 'Barriers to Learning', label: 'Barriers mentioned' }, { col: 'Top Learning Priority', label: 'Learning priorities' }],
  'onboarding-checkin': [{ col: 'Improvement Suggestion', label: 'Improvement suggestions' }],
  'skills-checkin': [{ col: 'Skill Gap Area', label: 'Skill gaps identified' }, { col: 'Key Strength', label: 'Strengths reported' }],
  'manager-effectiveness': [{ col: 'Open Feedback', label: 'Open feedback' }],
  'career-intent': [{ col: 'Support Needed', label: 'Support needed' }, { col: 'Next Career Move', label: 'Career aspirations' }],
  'benefits-feedback': [{ col: 'Missing Benefit', label: 'Requested benefits' }],
  'ai-adoption': [{ col: 'Barrier to Adoption', label: 'Adoption barriers' }, { col: 'Biggest AI Use Case', label: 'Use cases' }],
}

// ─── Detailed insights modal ───────────────────────────────────────────────────

function DetailedInsightsModal({ campaign, rows, open, onClose }: { campaign: Campaign; rows: ResponseRow[]; open: boolean; onClose: () => void }) {
  const color = typeColor(campaign.typeId)
  const qualCols = QUALITATIVE_COLS[campaign.typeId] ?? []

  // Score distribution for numeric columns
  const template = RESPONSE_TEMPLATES[campaign.typeId] ?? FALLBACK_TEMPLATE
  const numericCols = template.columns.filter(col => {
    const sample = rows[0]?.[col]
    return sample !== undefined && !isNaN(parseFloat(sample)) && col !== 'Employee ID'
  })

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
        <Dialog.Content style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 'min(700px, 95vw)', maxHeight: '88vh', overflowY: 'auto',
          background: '#fff', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          zIndex: 201, padding: '28px 28px 24px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, background: color + '18', color, flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>manage_search</span>
              </span>
              <div>
                <Dialog.Title style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: '0 0 3px' }}>
                  Detailed Insights
                </Dialog.Title>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{campaign.name} · {rows.length} responses</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </Dialog.Close>
          </div>

          {rows.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>No response data available yet.</p>
          ) : (
            <>
              {/* Score distributions */}
              {numericCols.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 14px' }}>Score Distributions</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {numericCols.map(col => {
                      const vals = rows.map(r => parseFloat(r[col] ?? '')).filter(n => !isNaN(n))
                      const maxVal = Math.max(...vals)
                      const buckets: Record<string, number> = {}
                      vals.forEach(v => { const k = String(v); buckets[k] = (buckets[k] ?? 0) + 1 })
                      const sorted = Object.entries(buckets).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
                      const maxCount = Math.max(...sorted.map(([, c]) => c))
                      const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
                      return (
                        <div key={col}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{col}</span>
                            <span style={{ fontSize: 12, color: '#64748b' }}>avg <strong style={{ color }}>{avg}</strong> / {maxVal}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 48 }}>
                            {sorted.map(([val, count]) => {
                              const barH = Math.round((count / maxCount) * 44)
                              const pct = Math.round((count / vals.length) * 100)
                              return (
                                <div key={val} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{pct}%</span>
                                  <div style={{ width: '100%', height: barH, background: color, borderRadius: '3px 3px 0 0', minHeight: 4 }} title={`${count} responses`} />
                                  <span style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>{val}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Qualitative / open-text quotes */}
              {qualCols.map(({ col, label }) => {
                const quotes = rows.map(r => r[col]).filter(Boolean) as string[]
                // deduplicate and pick a sample of up to 12 distinct values
                const seen = new Set<string>()
                const sample = quotes.filter(q => { if (seen.has(q)) return false; seen.add(q); return true }).slice(0, 12)
                if (sample.length === 0) return null
                return (
                  <div key={col} style={{ marginBottom: 22 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>{label}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {sample.map((q, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#f8fafc', borderRadius: 8, padding: '9px 12px', border: '1px solid #e2e8f0' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: color, flexShrink: 0, marginTop: 1 }}>format_quote</span>
                          <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CampaignStatus }) {
  const cfg = {
    active: { label: 'Active', bg: '#dcfce7', color: '#16a34a', dot: '#22c55e' },
    completed: { label: 'Completed', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
    draft: { label: 'Draft', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
  }[status]
  return (
    <span className="ec-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ─── Response progress bar ────────────────────────────────────────────────────

function ResponseBar({ rate, color }: { rate: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ width: `${rate}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', minWidth: 32 }}>{rate}%</span>
    </div>
  )
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <div className="ec-stat-tile">
      <span className="material-symbols-outlined ec-stat-icon">{icon}</span>
      <div>
        <p className="ec-stat-value">{value}</p>
        <p className="ec-stat-label">{label}</p>
        {sub && <p className="ec-stat-sub">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Campaign detail view ─────────────────────────────────────────────────────

function CampaignDetail({ campaign, onBack }: { campaign: Campaign; onBack: () => void }) {
  const rate = responseRate(campaign)
  const color = typeColor(campaign.typeId)
  const days = daysRemaining(campaign.periodEnd)
  const breakdown = teamBreakdown(campaign)
  const [showAllResponses, setShowAllResponses] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [copied, setCopied] = useState(false)

  const allRows = campaign.responsesReceived > 0 ? generateResponseRows(campaign) : []
  const template = RESPONSE_TEMPLATES[campaign.typeId] ?? FALLBACK_TEMPLATE
  const displayRows = showAllResponses ? allRows : allRows.slice(0, 8)

  const handleShare = useCallback(() => {
    const mockUrl = `https://tm-tau-neon.vercel.app/campaigns/${campaign.id}`
    navigator.clipboard.writeText(mockUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [campaign.id])

  const insights = computeInsights(campaign, allRows)

  return (
    <div className="ec-detail">
      {/* Back nav */}
      <button type="button" className="ec-detail__back" onClick={onBack}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        Employee campaigns
      </button>

      {/* Header */}
      <div className="ec-detail__header">
        <div className="ec-detail__header-left">
          <span className="ec-type-icon" style={{ background: color + '18', color }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{campaign.typeIcon}</span>
          </span>
          <div>
            <h2 className="ec-detail__title">{campaign.name}</h2>
            <p className="ec-detail__meta" style={{ marginBottom: 2 }}>{campaign.typeLabel}</p>
            <p className="ec-detail__meta">
              {fmtDate(campaign.periodStart)} → {fmtDate(campaign.periodEnd)}
              {campaign.isRecurring && <span className="ec-detail__freq"> · Recurring ({campaign.recurringFreq})</span>}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge status={campaign.status} />
          {allRows.length > 0 && (
            <>
              <button type="button" className="ec-action-btn" onClick={handleShare} title="Copy shareable link">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>share</span>
                {copied ? 'Copied!' : 'Share'}
              </button>
              <button type="button" className="ec-action-btn ec-action-btn--primary" onClick={() => exportCsv(campaign, allRows)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Campaign Insights ── */}
      {insights ? (
        <div className="ec-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="ec-section__title" style={{ margin: 0 }}>Campaign Insights</p>
            <button type="button" className="ec-action-btn" style={{ fontSize: 12 }} onClick={() => setShowInsights(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>manage_search</span>
              Detailed insights
            </button>
          </div>

          {/* Summary callout */}
          <div style={{ background: color + '0d', border: `1.5px solid ${color}28`, borderRadius: 10, padding: '11px 14px', marginBottom: 18, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color, flexShrink: 0, marginTop: 2 }}>auto_awesome</span>
            <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.55 }}>{insights.summary}</p>
          </div>

          {/* KPI tiles */}
          {insights.kpis.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(insights.kpis.length, 4)}, 1fr)`, gap: 10, marginBottom: insights.distributions.some(d => d.items.length > 0) ? 20 : 0 }}>
              {insights.kpis.map(kpi => {
                const fillPct = Math.round((kpi.raw / kpi.outOf) * 100)
                return (
                  <div key={kpi.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 14px 12px' }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: kpi.color, margin: '0 0 2px', lineHeight: 1 }}>
                      {kpi.value}<span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>/{kpi.outOf}</span>
                    </p>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px', fontWeight: 600 }}>{kpi.label}</p>
                    <div style={{ height: 4, borderRadius: 2, background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ width: `${fillPct}%`, height: '100%', borderRadius: 2, background: kpi.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Distribution charts — two-column grid */}
          {insights.distributions.filter(d => d.items.length > 0).length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: insights.distributions.filter(d => d.items.length > 0).length === 1 ? '1fr' : '1fr 1fr', gap: 16 }}>
              {insights.distributions.map(dist =>
                dist.items.length === 0 ? null : (
                  <div key={dist.title}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>{dist.title}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {dist.items.map((item, i) => (
                        <div key={item.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 12, color: '#374151', fontWeight: i === 0 ? 600 : 400 }}>{item.label}</span>
                            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, minWidth: 52, textAlign: 'right' }}>{item.count} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({item.pct}%)</span></span>
                          </div>
                          <div style={{ height: 5, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                            <div style={{ width: `${item.pct}%`, height: '100%', borderRadius: 3, background: i === 0 ? color : color + '55' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      ) : campaign.status !== 'draft' ? (
        <div className="ec-section" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#cbd5e1' }}>insights</span>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '8px 0 0' }}>Insights will appear once responses start coming in.</p>
        </div>
      ) : null}

      <DetailedInsightsModal campaign={campaign} rows={allRows} open={showInsights} onClose={() => setShowInsights(false)} />

      {/* ── Campaign Analytics ── */}
      <div className="ec-section">
        <p className="ec-section__title">Campaign Analytics</p>

        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: campaign.status !== 'draft' ? 18 : 0 }}>
          <StatTile label="Response rate" value={`${rate}%`} icon="bar_chart" />
          <StatTile label="Responses received" value={campaign.responsesReceived.toLocaleString()} sub={`of ${campaign.targetCount.toLocaleString()} targeted`} icon="check_circle" />
          <StatTile
            label={campaign.status === 'completed' ? 'Completed' : 'Days remaining'}
            value={campaign.status === 'completed' ? fmtDate(campaign.completedAt ?? '') : days !== null ? `${days}d` : '—'}
            icon={campaign.status === 'completed' ? 'done_all' : 'schedule'}
          />
          <StatTile label="Collection method" value={campaign.channelLabel || '—'} icon="sensors" />
        </div>

        {/* Progress bar */}
        {campaign.status !== 'draft' && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Overall progress</p>
            <ResponseBar rate={rate} color={color} />
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 6, marginBottom: breakdown.length > 0 ? 18 : 0 }}>
              {campaign.responsesReceived.toLocaleString()} responses received · {(campaign.targetCount - campaign.responsesReceived).toLocaleString()} pending
            </p>
          </>
        )}

        {/* Team breakdown */}
        {breakdown.length > 0 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>By manager</p>
            <table className="ec-table">
              <thead>
                <tr>
                  <th>Manager</th>
                  <th className="ec-table__num">Employees</th>
                  <th className="ec-table__num">Responses</th>
                  <th style={{ width: 160 }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map(row => (
                  <tr key={row.name}>
                    <td className="ec-table__name">{row.name}</td>
                    <td className="ec-table__num">{row.employees.toLocaleString()}</td>
                    <td className="ec-table__num">{row.responses.toLocaleString()}</td>
                    <td><ResponseBar rate={row.rate} color={color} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {breakdown.length === 0 && campaign.status === 'draft' && (
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>No teams configured yet.</p>
        )}
      </div>

      {/* Individual responses */}
      {allRows.length > 0 && (
        <div className="ec-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="ec-section__title" style={{ margin: 0 }}>Responses ({allRows.length})</p>
            {allRows.length > 8 && (
              <button type="button" className="ec-detail__back" style={{ margin: 0, fontSize: 12 }} onClick={() => setShowAllResponses(v => !v)}>
                {showAllResponses ? 'Show fewer' : `Show all ${allRows.length}`}
              </button>
            )}
          </div>
          <div className="ec-responses-wrap">
            <table className="ec-table ec-responses-table">
              <thead>
                <tr>
                  {template.columns.map(col => (
                    <th key={col} style={{ whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, i) => (
                  <tr key={i}>
                    {template.columns.map(col => (
                      <td key={col} style={{ whiteSpace: col === 'Open Feedback' || col === 'Improvement Suggestion' || col === 'Open Comment' ? 'normal' : 'nowrap', maxWidth: col === 'Open Feedback' || col === 'Improvement Suggestion' || col === 'Open Comment' ? 220 : undefined }}>
                        {row[col] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!showAllResponses && allRows.length > 8 && (
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
              Showing 8 of {allRows.length} responses. <button type="button" style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0 }} onClick={() => setShowAllResponses(true)}>Show all →</button>
            </p>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="ec-section">
        <p className="ec-section__title">Timeline</p>
        <div className="ec-timeline">
          <div className="ec-timeline__item">
            <span className="material-symbols-outlined ec-timeline__icon" style={{ color: '#6366f1' }}>play_circle</span>
            <div>
              <p className="ec-timeline__label">Launched</p>
              <p className="ec-timeline__val">{fmtDate(campaign.launchedAt ?? campaign.createdAt)}</p>
            </div>
          </div>
          <div className="ec-timeline__item">
            <span className="material-symbols-outlined ec-timeline__icon" style={{ color: '#f97316' }}>flag</span>
            <div>
              <p className="ec-timeline__label">End date</p>
              <p className="ec-timeline__val">{fmtDate(campaign.periodEnd)}</p>
            </div>
          </div>
          {campaign.completedAt && (
            <div className="ec-timeline__item">
              <span className="material-symbols-outlined ec-timeline__icon" style={{ color: '#22c55e' }}>done_all</span>
              <div>
                <p className="ec-timeline__label">Completed</p>
                <p className="ec-timeline__val">{fmtDate(campaign.completedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Campaign card ────────────────────────────────────────────────────────────

function CampaignCard({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
  const rate = responseRate(campaign)
  const color = typeColor(campaign.typeId)
  const days = daysRemaining(campaign.periodEnd)

  return (
    <button type="button" className="ec-card" onClick={onClick}>
      <div className="ec-card__top">
        <span className="ec-type-icon" style={{ background: color + '18', color }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{campaign.typeIcon}</span>
        </span>
        <div className="ec-card__info">
          <p className="ec-card__name">{campaign.name}</p>
          <p className="ec-card__meta" style={{ marginBottom: 1 }}>{campaign.typeLabel}</p>
          <p className="ec-card__meta">
            {campaign.teamNames.length > 0
              ? `${campaign.teamNames.length} team${campaign.teamNames.length !== 1 ? 's' : ''} · ${campaign.employeeCount.toLocaleString()} employees`
              : 'No teams configured'}
            {campaign.channelLabel && ` · ${campaign.channelLabel}`}
          </p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      {campaign.status !== 'draft' && (
        <div className="ec-card__progress">
          <ResponseBar rate={rate} color={color} />
          <p className="ec-card__progress-sub">
            {campaign.responsesReceived.toLocaleString()} / {campaign.targetCount.toLocaleString()} responses
            {campaign.status === 'active' && days !== null && ` · ${days}d remaining`}
            {campaign.status === 'completed' && campaign.completedAt && ` · Completed ${fmtDate(campaign.completedAt)}`}
          </p>
        </div>
      )}

      <div className="ec-card__footer">
        <span style={{ fontSize: 12, color: '#94a3b8' }}>
          {campaign.periodStart ? `${fmtDate(campaign.periodStart)} → ${fmtDate(campaign.periodEnd)}` : 'Period not set'}
          {campaign.isRecurring && ' · Recurring'}
        </span>
        <span className="ec-card__cta">
          View details <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
        </span>
      </div>
    </button>
  )
}

// ─── Draft row ────────────────────────────────────────────────────────────────

function DraftRow({ campaign, onDelete }: { campaign: Campaign; onDelete: () => void }) {
  const color = typeColor(campaign.typeId)
  return (
    <div className="ec-draft-row">
      <span className="ec-type-icon ec-type-icon--sm" style={{ background: color + '18', color }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{campaign.typeIcon}</span>
      </span>
      <div className="ec-draft-row__info">
        <p className="ec-draft-row__name">{campaign.name}</p>
        <p className="ec-draft-row__meta">Saved {fmtDate(campaign.createdAt)} · Configuration incomplete</p>
      </div>
      <button
        type="button"
        className="ec-draft-row__delete"
        onClick={e => { e.stopPropagation(); onDelete() }}
        aria-label="Delete draft"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
      </button>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="ec-section-header">
      <span className="ec-section-header__label">{label}</span>
      <span className="ec-section-header__count">{count}</span>
    </div>
  )
}

// ─── Table row (list view) ────────────────────────────────────────────────────

function CampaignTableRow({ campaign, onClick, onDelete }: { campaign: Campaign; onClick: () => void; onDelete?: () => void }) {
  const rate = responseRate(campaign)
  const color = typeColor(campaign.typeId)
  const days = daysRemaining(campaign.periodEnd)

  return (
    <tr className="ec-trow" onClick={campaign.status !== 'draft' ? onClick : undefined} style={{ cursor: campaign.status !== 'draft' ? 'pointer' : 'default' }}>
      <td style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="ec-type-icon ec-type-icon--sm" style={{ background: color + '18', color }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{campaign.typeIcon}</span>
          </span>
          <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', display: 'block' }}>{campaign.name}</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{campaign.typeLabel}</span>
            </div>
        </div>
      </td>
      <td style={{ padding: '10px 12px' }}><StatusBadge status={campaign.status} /></td>
      <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
        {campaign.teamNames.length > 0 ? `${campaign.teamNames.length} team${campaign.teamNames.length !== 1 ? 's' : ''}` : '—'}
        {campaign.employeeCount > 0 && <span style={{ color: '#94a3b8' }}> · {campaign.employeeCount.toLocaleString()} emp.</span>}
      </td>
      <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
        {campaign.channelLabel || '—'}
      </td>
      <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
        {campaign.periodStart ? `${fmtDate(campaign.periodStart)} → ${fmtDate(campaign.periodEnd)}` : '—'}
        {campaign.isRecurring && <span style={{ color: '#94a3b8' }}> · Recurring</span>}
      </td>
      <td style={{ padding: '10px 12px', minWidth: 140 }}>
        {campaign.status !== 'draft' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ResponseBar rate={rate} color={color} />
          </div>
        ) : (
          <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
        )}
      </td>
      <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
        {campaign.status === 'active' && days !== null ? `${days}d left` : campaign.status === 'completed' && campaign.completedAt ? fmtDate(campaign.completedAt) : '—'}
      </td>
      <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
        {campaign.status === 'draft' && onDelete ? (
          <button type="button" className="ec-draft-row__delete" style={{ width: 28, height: 28 }} onClick={onDelete} aria-label="Delete draft">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
          </button>
        ) : (
          <button type="button" className="ec-trow__view" onClick={onClick} aria-label="View details">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── View toggle ──────────────────────────────────────────────────────────────

function ViewToggle({ value, onChange }: { value: 'card' | 'list'; onChange: (v: 'card' | 'list') => void }) {
  return (
    <div className="ec-view-toggle">
      <button
        type="button"
        className={`ec-view-toggle__btn ${value === 'card' ? 'ec-view-toggle__btn--active' : ''}`}
        onClick={() => onChange('card')}
        title="Card view"
        aria-label="Card view"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>grid_view</span>
      </button>
      <button
        type="button"
        className={`ec-view-toggle__btn ${value === 'list' ? 'ec-view-toggle__btn--active' : ''}`}
        onClick={() => onChange('list')}
        title="List view"
        aria-label="List view"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>list</span>
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EmployeeCampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [showAuthoring, setShowAuthoring] = useState(false)

  const active = campaigns.filter(c => c.status === 'active')
  const completed = campaigns.filter(c => c.status === 'completed')
  const drafts = campaigns.filter(c => c.status === 'draft')

  function handleCampaignLaunch(data: CampaignLaunchData) {
    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: data.name,
      typeId: data.typeId,
      typeLabel: data.typeLabel,
      typeIcon: data.typeIcon,
      status: 'active',
      teamNames: data.teamNames,
      employeeCount: data.employeeCount,
      channelLabel: data.channelLabel,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      isRecurring: data.isRecurring,
      recurringFreq: data.recurringFreq,
      responsesReceived: 0,
      targetCount: data.employeeCount,
      launchedAt: '2026-06-30',
      createdAt: '2026-06-30',
    }
    setCampaigns(prev => [newCampaign, ...prev])
  }

  function handleSaveAsDraft(data: CampaignDraftData) {
    const draft: Campaign = {
      id: `draft-${Date.now()}`,
      name: data.name,
      typeId: data.typeId,
      typeLabel: data.typeLabel,
      typeIcon: data.typeIcon,
      status: 'draft',
      teamNames: [],
      employeeCount: 0,
      channelLabel: '',
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      isRecurring: data.isRecurring,
      recurringFreq: data.recurringFreq,
      responsesReceived: 0,
      targetCount: 0,
      createdAt: '2026-06-30',
    }
    setCampaigns(prev => [...prev, draft])
  }

  function deleteDraft(id: string) {
    setCampaigns(prev => prev.filter(c => c.id !== id))
  }

  // Authoring agent view
  if (showAuthoring) {
    return (
      <CampaignAuthoringAgent
        onBack={() => setShowAuthoring(false)}
        onLaunch={data => { handleCampaignLaunch(data); setShowAuthoring(false) }}
      />
    )
  }

  // Detail view
  if (selectedCampaign) {
    return <CampaignDetail campaign={selectedCampaign} onBack={() => setSelectedCampaign(null)} />
  }

  const nonDraft = [...active, ...completed]

  // List view
  return (
    <div className="ec-root">
      {/* Toolbar */}
      <div className="ec-toolbar">
        <div>
          <h2 className="ec-toolbar__title">Employee campaigns</h2>
          <p className="ec-toolbar__sub">Track ongoing data collection and launch new campaigns for your teams.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <button
            type="button"
            title="Campaign Authoring Agent — draft with AI"
            onClick={() => setShowAuthoring(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 8,
              border: '1.5px solid #818cf8', background: '#eef2ff',
              color: '#4f46e5', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
            AI Authoring Agent
          </button>
          <Button type="button" variant="primary" onClick={() => setDialogOpen(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            Launch new campaign
          </Button>
        </div>
      </div>

      {/* ── List (table) view ── */}
      {viewMode === 'list' && nonDraft.length > 0 && (
        <div className="ec-list-section">
          <div className="ec-responses-wrap">
            <table className="ec-table" style={{ minWidth: 780 }}>
              <thead>
                <tr>
                  <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Campaign</th>
                  <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Status</th>
                  <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Teams</th>
                  <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Channel</th>
                  <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Period</th>
                  <th style={{ padding: '9px 12px', background: '#f8fafc', minWidth: 140 }}>Response rate</th>
                  <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Timeline</th>
                  <th style={{ padding: '9px 12px', background: '#f8fafc', width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {nonDraft.map(c => (
                  <CampaignTableRow key={c.id} campaign={c} onClick={() => setSelectedCampaign(c)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Card view ── */}
      {viewMode === 'card' && (
        <>
          {/* Active */}
          {active.length > 0 && (
            <div className="ec-list-section">
              <SectionHeader label="Active" count={active.length} />
              <div className="ec-cards-grid">
                {active.map(c => <CampaignCard key={c.id} campaign={c} onClick={() => setSelectedCampaign(c)} />)}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="ec-list-section">
              <SectionHeader label="Completed" count={completed.length} />
              <div className="ec-cards-grid">
                {completed.map(c => <CampaignCard key={c.id} campaign={c} onClick={() => setSelectedCampaign(c)} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Drafts — always shown as rows regardless of view mode */}
      {drafts.length > 0 && (
        <div className="ec-list-section">
          <SectionHeader label="Drafts" count={drafts.length} />
          {viewMode === 'list' ? (
            <div className="ec-responses-wrap">
              <table className="ec-table" style={{ minWidth: 780 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Campaign</th>
                    <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Status</th>
                    <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Teams</th>
                    <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Channel</th>
                    <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Period</th>
                    <th style={{ padding: '9px 12px', background: '#f8fafc', minWidth: 140 }}>Response rate</th>
                    <th style={{ padding: '9px 12px', background: '#f8fafc' }}>Timeline</th>
                    <th style={{ padding: '9px 12px', background: '#f8fafc', width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {drafts.map(c => (
                    <CampaignTableRow key={c.id} campaign={c} onClick={() => {}} onDelete={() => deleteDraft(c.id)} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="ec-drafts-list">
              {drafts.map(c => (
                <DraftRow key={c.id} campaign={c} onDelete={() => deleteDraft(c.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {active.length === 0 && completed.length === 0 && drafts.length === 0 && (
        <div className="ec-empty">
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#cbd5e1' }}>campaign</span>
          <p>No campaigns yet. Launch your first one above.</p>
        </div>
      )}

      <FocusFirstLaunchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hrbpMode
        hrbpDirectors={DEFAULT_HRBP_DIRECTORS}
        onCampaignLaunch={handleCampaignLaunch}
        onSaveAsDraft={handleSaveAsDraft}
      />
    </div>
  )
}
