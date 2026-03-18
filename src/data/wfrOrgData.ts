/**
 * Workforce Readiness dashboard demo data.
 * Org-level AI Potential (48%), Readiness (25%), augmentable headcount (7,665), and
 * Transformation Gap (5,749) align with Octave metric definitions (example table).
 */

export const EM = '\u2014'
export const EN = '\u2013'

export const ORG = {
  totalEmployees: 9940,
  aiPotential: 48,
  aiReadiness: 25,
  totalRoleTasks: 220,
  tasksInAugZone: 106,
  tasksAboveThreshold: 38,
  tasksBelowThreshold: 76,
  peopleInAugRoles: 7665,
  hrsPerPersonWeek: 4,
  departments: [
    { name: 'Administrative', employees: 677, aiPotential: 68, aiReadiness: 11 },
    { name: 'Finance', employees: 677, aiPotential: 62, aiReadiness: 13 },
    { name: 'Marketing', employees: 610, aiPotential: 50, aiReadiness: 23 },
    { name: 'Operations', employees: 847, aiPotential: 45, aiReadiness: 17 },
    { name: 'HR', employees: 320, aiPotential: 42, aiReadiness: 18 },
    { name: 'Sales', employees: 1240, aiPotential: 37, aiReadiness: 26 },
    { name: 'Engineering', employees: 2100, aiPotential: 35, aiReadiness: 35 },
    { name: 'Legal', employees: 290, aiPotential: 31, aiReadiness: 17 },
    { name: 'Customer Success', employees: 820, aiPotential: 40, aiReadiness: 22 },
    { name: 'Product', employees: 415, aiPotential: 36, aiReadiness: 33 },
    { name: 'IT & Security', employees: 465, aiPotential: 32, aiReadiness: 42 },
    { name: 'Data & Analytics', employees: 395, aiPotential: 44, aiReadiness: 38 },
    { name: 'Partnerships', employees: 245, aiPotential: 30, aiReadiness: 24 },
    { name: 'Procurement', employees: 195, aiPotential: 57, aiReadiness: 15 },
    { name: 'Facilities', employees: 155, aiPotential: 51, aiReadiness: 12 },
    { name: 'Communications', employees: 125, aiPotential: 43, aiReadiness: 27 },
    { name: 'Quality & Compliance', employees: 364, aiPotential: 38, aiReadiness: 19 },
  ],
  roles: {
    Administrative: [
      { title: 'Data Entry Clerk', employees: 182, aiPotential: 74, aiReadiness: 7, reskillPriority: 'Immediate' as const },
      { title: 'Administrative Assistant', employees: 215, aiPotential: 68, aiReadiness: 12, reskillPriority: 'Immediate' as const },
      { title: 'Document Controller', employees: 140, aiPotential: 62, aiReadiness: 11, reskillPriority: 'This year' as const },
      { title: 'Executive Assistant', employees: 140, aiPotential: 45, aiReadiness: 21, reskillPriority: 'Monitor' as const },
    ],
    Finance: [
      { title: 'Financial Clerk', employees: 318, aiPotential: 63, aiReadiness: 11, reskillPriority: 'Immediate' as const },
      { title: 'Accounts Payable Specialist', employees: 210, aiPotential: 58, aiReadiness: 13, reskillPriority: 'This year' as const },
      { title: 'Financial Analyst', employees: 149, aiPotential: 42, aiReadiness: 22, reskillPriority: 'Monitor' as const },
    ],
    Operations: [
      { title: 'Logistics Coordinator', employees: 310, aiPotential: 53, aiReadiness: 15, reskillPriority: 'This year' as const },
      { title: 'Supply Chain Analyst', employees: 220, aiPotential: 39, aiReadiness: 19, reskillPriority: 'Monitor' as const },
      { title: 'Operations Manager', employees: 317, aiPotential: 25, aiReadiness: 27, reskillPriority: 'Monitor' as const },
    ],
    'Customer Success': [
      { title: 'Customer Success Manager', employees: 340, aiPotential: 45, aiReadiness: 23, reskillPriority: 'This year' as const },
      { title: 'Implementation Consultant', employees: 280, aiPotential: 48, aiReadiness: 20, reskillPriority: 'This year' as const },
      { title: 'Support Specialist', employees: 200, aiPotential: 37, aiReadiness: 17, reskillPriority: 'Monitor' as const },
    ],
    Product: [
      { title: 'Product Manager', employees: 245, aiPotential: 41, aiReadiness: 35, reskillPriority: 'Monitor' as const },
      { title: 'Product Designer', employees: 110, aiPotential: 34, aiReadiness: 29, reskillPriority: 'Monitor' as const },
      { title: 'Technical Program Manager', employees: 60, aiPotential: 30, aiReadiness: 44, reskillPriority: 'Monitor' as const },
    ],
    'IT & Security': [
      { title: 'IT Support Specialist', employees: 220, aiPotential: 37, aiReadiness: 40, reskillPriority: 'Monitor' as const },
      { title: 'Security Operations Analyst', employees: 155, aiPotential: 33, aiReadiness: 44, reskillPriority: 'Monitor' as const },
      { title: 'Systems Administrator', employees: 90, aiPotential: 27, aiReadiness: 43, reskillPriority: 'Monitor' as const },
    ],
    'Data & Analytics': [
      { title: 'Data Analyst', employees: 180, aiPotential: 48, aiReadiness: 35, reskillPriority: 'Monitor' as const },
      { title: 'Analytics Engineer', employees: 135, aiPotential: 42, aiReadiness: 42, reskillPriority: 'Monitor' as const },
      { title: 'BI Developer', employees: 80, aiPotential: 45, aiReadiness: 38, reskillPriority: 'Monitor' as const },
    ],
    Partnerships: [
      { title: 'Partnerships Manager', employees: 140, aiPotential: 35, aiReadiness: 26, reskillPriority: 'Monitor' as const },
      { title: 'Alliance Director', employees: 105, aiPotential: 25, aiReadiness: 22, reskillPriority: 'Monitor' as const },
    ],
    Procurement: [
      { title: 'Procurement Specialist', employees: 120, aiPotential: 60, aiReadiness: 14, reskillPriority: 'Immediate' as const },
      { title: 'Category Manager', employees: 75, aiPotential: 52, aiReadiness: 18, reskillPriority: 'This year' as const },
    ],
    Facilities: [
      { title: 'Workplace Coordinator', employees: 95, aiPotential: 54, aiReadiness: 11, reskillPriority: 'This year' as const },
      { title: 'Facilities Manager', employees: 60, aiPotential: 45, aiReadiness: 14, reskillPriority: 'Monitor' as const },
    ],
    Communications: [
      { title: 'Corporate Communications Manager', employees: 70, aiPotential: 45, aiReadiness: 29, reskillPriority: 'Monitor' as const },
      { title: 'Internal Communications Specialist', employees: 55, aiPotential: 40, aiReadiness: 25, reskillPriority: 'Monitor' as const },
    ],
    'Quality & Compliance': [
      { title: 'Quality Assurance Lead', employees: 165, aiPotential: 40, aiReadiness: 21, reskillPriority: 'This year' as const },
      { title: 'Compliance Specialist', employees: 125, aiPotential: 37, aiReadiness: 18, reskillPriority: 'This year' as const },
      { title: 'Internal Auditor', employees: 74, aiPotential: 34, aiReadiness: 17, reskillPriority: 'Monitor' as const },
    ],
  },
  tasks: {
    'Financial Clerk': [
      { task: 'Data entry', score: 92 },
      { task: 'Transaction processing', score: 88 },
      { task: 'Report generation', score: 82 },
      { task: 'Record maintenance', score: 55 },
      { task: 'Compliance review', score: 45 },
      { task: 'Exception handling', score: 12 },
      { task: 'Client communication', score: 8 },
    ],
    'Data Entry Clerk': [
      { task: 'Form data input', score: 95 },
      { task: 'Data validation', score: 90 },
      { task: 'Document scanning', score: 88 },
      { task: 'Error correction', score: 42 },
      { task: 'Quality review', score: 35 },
      { task: 'Stakeholder queries', score: 10 },
    ],
    'Administrative Assistant': [
      { task: 'Calendar management', score: 85 },
      { task: 'Travel booking', score: 82 },
      { task: 'Expense reporting', score: 80 },
      { task: 'Email drafting', score: 65 },
      { task: 'Meeting minutes', score: 58 },
      { task: 'Vendor coordination', score: 40 },
      { task: 'Stakeholder liaison', score: 12 },
      { task: 'Confidential matters', score: 8 },
    ],
    'Document Controller': [
      { task: 'File indexing', score: 90 },
      { task: 'Version tracking', score: 85 },
      { task: 'Distribution logging', score: 82 },
      { task: 'Compliance checking', score: 52 },
      { task: 'Retention scheduling', score: 45 },
      { task: 'Stakeholder coordination', score: 12 },
      { task: 'Audit support', score: 10 },
    ],
    'Executive Assistant': [
      { task: 'Calendar management', score: 85 },
      { task: 'Travel logistics', score: 78 },
      { task: 'Correspondence drafting', score: 68 },
      { task: 'Meeting prep', score: 55 },
      { task: 'Confidential advisory', score: 12 },
      { task: 'Stakeholder relations', score: 10 },
      { task: 'Strategic coordination', score: 8 },
      { task: 'Executive judgment support', score: 5 },
    ],
    'Accounts Payable Specialist': [
      { task: 'Invoice processing', score: 92 },
      { task: 'Payment scheduling', score: 88 },
      { task: 'Data reconciliation', score: 85 },
      { task: 'Vendor statement matching', score: 58 },
      { task: 'Discrepancy resolution', score: 42 },
      { task: 'Vendor relationships', score: 10 },
    ],
    'Financial Analyst': [
      { task: 'Data aggregation', score: 88 },
      { task: 'Report formatting', score: 82 },
      { task: 'Variance analysis', score: 62 },
      { task: 'Forecast modeling', score: 55 },
      { task: 'Business partnering', score: 12 },
      { task: 'Strategic interpretation', score: 10 },
      { task: 'Risk assessment', score: 8 },
      { task: 'Exec communication', score: 5 },
    ],
    'Logistics Coordinator': [
      { task: 'Shipment tracking', score: 88 },
      { task: 'Performance reporting', score: 82 },
      { task: 'Route optimization', score: 65 },
      { task: 'Carrier communication', score: 48 },
      { task: 'Customs documentation', score: 38 },
      { task: 'Exception management', score: 12 },
      { task: 'Vendor negotiation', score: 8 },
    ],
    'Supply Chain Analyst': [
      { task: 'Inventory reporting', score: 85 },
      { task: 'Demand forecasting', score: 62 },
      { task: 'Supplier performance analysis', score: 48 },
      { task: 'Risk identification', score: 12 },
      { task: 'Process improvement', score: 10 },
      { task: 'Cross-functional coordination', score: 8 },
      { task: 'Strategic sourcing', score: 5 },
    ],
    'Operations Manager': [
      { task: 'Performance dashboarding', score: 55 },
      { task: 'Reporting', score: 48 },
      { task: 'Team leadership', score: 8 },
      { task: 'Process design', score: 10 },
      { task: 'Stakeholder management', score: 7 },
      { task: 'Resource allocation', score: 12 },
      { task: 'Strategic planning', score: 5 },
    ],
    'Customer Success Manager': [
      { task: 'Health score monitoring', score: 72 },
      { task: 'QBR deck preparation', score: 65 },
      { task: 'Renewal forecasting', score: 58 },
      { task: 'Escalation triage', score: 35 },
      { task: 'Executive alignment', score: 18 },
      { task: 'Churn prevention strategy', score: 12 },
    ],
    'Implementation Consultant': [
      { task: 'Onboarding checklist execution', score: 78 },
      { task: 'Training session delivery', score: 62 },
      { task: 'Configuration documentation', score: 55 },
      { task: 'Integration troubleshooting', score: 42 },
      { task: 'Change management', score: 15 },
      { task: 'Stakeholder workshops', score: 10 },
    ],
    'Support Specialist': [
      { task: 'Ticket triage & routing', score: 82 },
      { task: 'Knowledge base updates', score: 75 },
      { task: 'First-response drafting', score: 68 },
      { task: 'Bug reproduction', score: 48 },
      { task: 'Customer empathy calls', score: 22 },
      { task: 'Severity escalation', score: 8 },
    ],
    'Product Manager': [
      { task: 'Backlog grooming', score: 58 },
      { task: 'PRD drafting', score: 52 },
      { task: 'Analytics review', score: 62 },
      { task: 'User interview synthesis', score: 35 },
      { task: 'Roadmap negotiation', score: 15 },
      { task: 'Launch coordination', score: 25 },
    ],
    'Product Designer': [
      { task: 'Wireframing', score: 68 },
      { task: 'Design system application', score: 55 },
      { task: 'Usability test notes', score: 48 },
      { task: 'Prototype handoff', score: 42 },
      { task: 'Accessibility review', score: 38 },
      { task: 'Stakeholder critique sessions', score: 12 },
    ],
    'Technical Program Manager': [
      { task: 'Dependency tracking', score: 48 },
      { task: 'Risk register maintenance', score: 42 },
      { task: 'Cross-team sync facilitation', score: 35 },
      { task: 'Executive reporting', score: 28 },
      { task: 'Technical tradeoff analysis', score: 18 },
      { task: 'Milestone enforcement', score: 10 },
    ],
    'IT Support Specialist': [
      { task: 'Ticket resolution', score: 72 },
      { task: 'Account provisioning', score: 68 },
      { task: 'Hardware imaging', score: 55 },
      { task: 'Knowledge article writing', score: 48 },
      { task: 'Security awareness nudges', score: 32 },
      { task: 'Onsite walk-up support', score: 15 },
    ],
    'Security Operations Analyst': [
      { task: 'Alert triage', score: 65 },
      { task: 'SIEM query building', score: 58 },
      { task: 'Incident timeline docs', score: 45 },
      { task: 'Phishing analysis', score: 52 },
      { task: 'Vendor security review', score: 28 },
      { task: 'Threat intel briefing', score: 12 },
    ],
    'Systems Administrator': [
      { task: 'Patch scheduling', score: 55 },
      { task: 'Capacity monitoring', score: 48 },
      { task: 'Backup verification', score: 42 },
      { task: 'Access reviews', score: 38 },
      { task: 'Change window execution', score: 22 },
      { task: 'Architecture input', score: 8 },
    ],
    'Data Analyst': [
      { task: 'SQL reporting', score: 78 },
      { task: 'Dashboard maintenance', score: 72 },
      { task: 'Ad hoc extracts', score: 65 },
      { task: 'Data quality checks', score: 48 },
      { task: 'Insight storytelling', score: 25 },
      { task: 'Metric definition debates', score: 10 },
    ],
    'Analytics Engineer': [
      { task: 'Pipeline development', score: 62 },
      { task: 'dbt model maintenance', score: 58 },
      { task: 'Schema design', score: 45 },
      { task: 'Job failure debugging', score: 38 },
      { task: 'Self-serve enablement', score: 32 },
      { task: 'Governance policies', score: 15 },
    ],
    'BI Developer': [
      { task: 'Report building', score: 75 },
      { task: 'Semantic layer updates', score: 62 },
      { task: 'Performance tuning', score: 48 },
      { task: 'User training', score: 35 },
      { task: 'Requirement gathering', score: 22 },
      { task: 'Executive briefing support', score: 12 },
    ],
    'Partnerships Manager': [
      { task: 'Partner pipeline tracking', score: 52 },
      { task: 'Contract redlines', score: 38 },
      { task: 'Joint GTM planning', score: 32 },
      { task: 'Quarterly business reviews', score: 28 },
      { task: 'Relationship mapping', score: 15 },
      { task: 'Strategic bets', score: 8 },
    ],
    'Alliance Director': [
      { task: 'Executive partner meetings', score: 22 },
      { task: 'Ecosystem strategy', score: 18 },
      { task: 'Co-selling coordination', score: 35 },
      { task: 'Due diligence support', score: 42 },
      { task: 'Brand alignment', score: 12 },
      { task: 'Board-level narratives', score: 5 },
    ],
    'Procurement Specialist': [
      { task: 'PO processing', score: 88 },
      { task: 'Vendor quote comparison', score: 78 },
      { task: 'Contract filing', score: 72 },
      { task: 'Spend category reporting', score: 55 },
      { task: 'Supplier negotiation prep', score: 28 },
      { task: 'Stakeholder intake', score: 15 },
    ],
    'Category Manager': [
      { task: 'Category strategy decks', score: 48 },
      { task: 'RFx execution', score: 58 },
      { task: 'Savings tracking', score: 52 },
      { task: 'Market benchmarking', score: 42 },
      { task: 'Supplier QBRs', score: 25 },
      { task: 'Risk assessment', score: 18 },
    ],
    'Workplace Coordinator': [
      { task: 'Desk & badge assignments', score: 75 },
      { task: 'Vendor work orders', score: 68 },
      { task: 'Event logistics', score: 55 },
      { task: 'Safety walkthroughs', score: 38 },
      { task: 'Employee requests', score: 32 },
      { task: 'Budget tracking', score: 22 },
    ],
    'Facilities Manager': [
      { task: 'CapEx planning', score: 42 },
      { task: 'Lease administration', score: 38 },
      { task: 'Vendor management', score: 35 },
      { task: 'Emergency response', score: 18 },
      { task: 'Space planning', score: 28 },
      { task: 'Sustainability reporting', score: 15 },
    ],
    'Corporate Communications Manager': [
      { task: 'Press release drafting', score: 58 },
      { task: 'Media monitoring', score: 65 },
      { task: 'Crisis comms playbooks', score: 25 },
      { task: 'Executive talking points', score: 32 },
      { task: 'Agency coordination', score: 22 },
      { task: 'Narrative strategy', score: 12 },
    ],
    'Internal Communications Specialist': [
      { task: 'All-hands content', score: 62 },
      { task: 'Intranet updates', score: 72 },
      { task: 'Change campaigns', score: 48 },
      { task: 'Employee surveys', score: 55 },
      { task: 'Leadership cascades', score: 28 },
      { task: 'Culture programming', score: 15 },
    ],
    'Quality Assurance Lead': [
      { task: 'Test plan authoring', score: 58 },
      { task: 'Regression coordination', score: 52 },
      { task: 'Defect triage', score: 48 },
      { task: 'Release sign-off', score: 35 },
      { task: 'Process audits', score: 28 },
      { task: 'Vendor quality reviews', score: 22 },
    ],
    'Compliance Specialist': [
      { task: 'Policy updates', score: 55 },
      { task: 'Control testing evidence', score: 62 },
      { task: 'Regulatory horizon scanning', score: 38 },
      { task: 'Training assignments', score: 48 },
      { task: 'Audit response drafting', score: 32 },
      { task: 'Exception approvals', score: 18 },
    ],
    'Internal Auditor': [
      { task: 'Sampling & testing', score: 58 },
      { task: 'Finding write-ups', score: 48 },
      { task: 'Walkthrough interviews', score: 35 },
      { task: 'Remediation tracking', score: 42 },
      { task: 'Board reporting input', score: 15 },
      { task: 'Fraud indicators', score: 8 },
    ],
  },
} as const

const rolesByDept = ORG.roles as unknown as Record<string, RoleRowType[]>
const tasksByRole = ORG.tasks as unknown as Record<string, { task: string; score: number }[]>

export function getRolesForDept(name: string): RoleRowType[] {
  return rolesByDept[name] ?? []
}

export function getTasksForRole(title: string): { task: string; score: number }[] {
  return tasksByRole[title] ?? []
}

export type Dept = (typeof ORG.departments)[number]
export type RoleRowType = {
  title: string
  employees: number
  aiPotential: number
  aiReadiness: number
  reskillPriority: 'Immediate' | 'This year' | 'Monitor'
}

export function taskZone(score: number): 'above' | 'augment' | 'below' {
  if (score > 75) return 'above'
  if (score >= 15) return 'augment'
  return 'below'
}

export const ZONE = {
  above: { short: 'Automate', color: '#dc2626', bg: '#fef2f2', note: 'Task should be automated, not augmented' },
  augment: { short: 'Augment', color: '#b45309', bg: '#fffbeb', note: 'Human leads, AI assists' },
  below: { short: 'Human-only', color: '#475569', bg: '#f8fafc', note: "AI can't meaningfully help" },
} as const

export function tGap(potential: number, readiness: number) {
  return potential - readiness
}

function deptHeadcountDenominator() {
  return ORG.departments.reduce((s, d) => s + d.employees, 0)
}

/** Augmentable-role headcount for a dept (org total allocated by dept employee share). */
export function deptPeopleInAugRoles(d: Dept): number {
  const denom = deptHeadcountDenominator()
  if (denom <= 0) return 0
  return Math.max(0, Math.round((ORG.peopleInAugRoles * d.employees) / denom))
}

/** People in augmentable roles not yet AI-ready — same definition as the Transformation gap card. */
export function deptGapHeadcount(d: Dept): number {
  const aug = deptPeopleInAugRoles(d)
  const ready = Math.round((aug * d.aiReadiness) / 100)
  return Math.max(0, aug - ready)
}

export const PM = {
  Immediate: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  'This year': { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  Monitor: { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
} as const

export function deptStatus(d: Dept) {
  const g = tGap(d.aiPotential, d.aiReadiness)
  if (g >= 50) return { label: 'Immediate action', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
  if (g >= 30) return { label: 'Monitor closely', color: '#b45309', bg: '#fffbeb', border: '#fde68a' }
  return { label: 'On track', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }
}

export function peopleOutcome(tasks: { score: number }[] | undefined): 'at-risk' | 'transforms' | 'survives' | null {
  if (!tasks?.length) return null
  const ab = tasks.filter((t) => taskZone(t.score) === 'above').length
  const bl = tasks.filter((t) => taskZone(t.score) === 'below').length
  if (ab / tasks.length >= 0.55 && bl < 2) return 'at-risk'
  if (ab / tasks.length >= 0.35) return 'transforms'
  return 'survives'
}

export const OUTCOME = {
  'at-risk': { label: 'Role at risk', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  transforms: { label: 'Role transforms', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  survives: { label: 'Role survives', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
} as const
