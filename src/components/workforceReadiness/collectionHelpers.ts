/** Shared helpers for data collection progress UI (used by inline tab + detail views). */

export const DEMO_MANAGERS = [
  'Priya Thompson',
  'Alex Rivera',
  'Jordan Kim',
  'Sam Okonkwo',
  'Riley Chen',
  'Morgan Patel',
  'Casey Nguyen',
  'Taylor Brooks',
  'Dana Washington',
  'Jamie Reyes',
  'Avery Nakamura',
  'Quinn Sullivan',
  'Blake Martinez',
  'Skyler Johansson',
  'Rowan Kapoor',
  'Drew Andersson',
  'Harper Obi',
  'Cameron Duval',
  'Sage Petrov',
  'Emery Chang',
]

export function deptNameHash(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i)
  return h
}

export type WfrCollSheetChannelDemo = {
  key: string
  label: string
  icon: string
  rate: number
}

/** Deterministic demo row chrome (manager, channels, activity). */
export function deptCollectionRowDemo(deptName: string) {
  const h = deptNameHash(deptName)
  const activeChannelCount = (1 + (h % 2)) as 1 | 2
  const useHours = h % 5 === 0
  const lastActivityDaysAgo = 1 + (h % 21)
  const lastActivityHoursAgo = 1 + (h % 12)
  const channelsDetail: WfrCollSheetChannelDemo[] =
    activeChannelCount >= 2
      ? [
          {
            key: 'profile',
            label: 'Profile Updates',
            icon: '\u270f\ufe0f',
            rate: Math.min(100, 28 + (h % 55)),
          },
          {
            key: 'survey',
            label: 'Contextual Surveys',
            icon: '\ud83d\udccb',
            rate: Math.min(100, 8 + ((h * 3) % 42)),
          },
        ]
      : []
  return {
    manager: DEMO_MANAGERS[h % DEMO_MANAGERS.length],
    activeChannelCount,
    useHours,
    lastActivityDaysAgo,
    lastActivityHoursAgo,
    channelsDetail,
  }
}

export function barColor(rate: number) {
  if (rate >= 70) return '#15803d'
  if (rate >= 30) return 'var(--wfr-potential-text, #6366f1)'
  return '#94a3b8'
}

export type DeptManagerTeam = {
  manager: string
  title: string
  employees: number
  responseRate: number
}

const DEPT_TITLES: Record<string, string[]> = {
  Administrative: ['Office Manager', 'Admin Services Lead', 'Facilities Coordinator', 'Executive Assistant Manager', 'Records Manager', 'Office Operations Lead', 'Reception Manager', 'Travel Coordinator', 'Mailroom Supervisor', 'Document Services Lead'],
  Finance: ['Controller', 'FP&A Manager', 'Accounting Lead', 'Treasury Manager', 'Tax Manager', 'Payroll Manager', 'Revenue Accounting Lead', 'Internal Audit Manager', 'Billing Operations Lead', 'Financial Systems Manager'],
  Procurement: ['Sourcing Manager', 'Vendor Relations Lead', 'Category Manager', 'Supply Chain Manager'],
  Facilities: ['Facilities Manager', 'Workplace Operations Lead', 'Building Services Manager', 'Space Planning Lead'],
  Operations: ['Operations Manager', 'Process Improvement Lead', 'Logistics Manager', 'Program Manager', 'Shift Director', 'Supply Chain Lead', 'Production Manager', 'Quality Ops Lead', 'Planning Manager', 'Distribution Lead', 'Fleet Manager', 'Ops Analytics Lead', 'Regional Ops Lead', 'Continuous Improvement Mgr'],
  Marketing: ['Brand Manager', 'Growth Marketing Lead', 'Content Strategy Manager', 'Demand Gen Manager'],
  HR: ['Talent Acquisition Lead', 'L&D Manager', 'Compensation Manager', 'Employee Experience Lead', 'Benefits Manager', 'HRIS Manager', 'DEI Program Lead', 'Workforce Planning Lead'],
  'Quality & Compliance': ['QA Manager', 'Compliance Lead', 'Audit Manager', 'Risk & Controls Lead'],
  'Customer Success': ['CS Manager', 'Implementation Lead', 'Renewals Manager', 'Customer Ops Lead', 'Onboarding Lead', 'Support Manager', 'Success Architect', 'Escalation Manager', 'Customer Insights Lead', 'Adoption Manager', 'Technical CS Lead', 'CS Ops Manager'],
  Communications: ['Internal Comms Lead', 'PR Manager', 'Corporate Comms Manager', 'Content Lead'],
  Legal: ['Associate General Counsel', 'Contracts Manager', 'IP Counsel', 'Employment Law Lead'],
  Sales: ['Regional Sales Manager', 'Enterprise Account Lead', 'Sales Ops Manager', 'Channel Manager', 'Inside Sales Lead', 'Territory Manager', 'Solutions Sales Lead', 'Sales Enablement Mgr', 'Key Account Manager', 'Mid-Market Lead', 'SDR Manager', 'Revenue Ops Lead', 'Strategic Sales Lead', 'Commercial Sales Mgr', 'Sales Training Lead', 'Partnerships Sales Lead'],
  'Data & Analytics': ['Analytics Manager', 'Data Engineering Lead', 'BI Manager', 'Data Science Lead'],
  Partnerships: ['Alliance Manager', 'Partner Development Lead', 'Channel Partnerships Manager', 'BD Lead'],
  Product: ['Product Manager', 'Product Ops Lead', 'Technical PM', 'Platform PM'],
  Engineering: ['Engineering Manager', 'Staff Engineer', 'Tech Lead', 'Platform Engineering Lead', 'Frontend Lead', 'Backend Lead', 'DevOps Manager', 'QA Engineering Lead', 'Mobile Lead', 'Infrastructure Manager', 'Security Engineering Lead', 'Data Engineering Mgr', 'ML Engineering Lead', 'Release Manager', 'SRE Lead', 'Architecture Lead'],
  'IT & Security': ['IT Manager', 'Security Operations Lead', 'Infrastructure Manager', 'InfoSec Lead'],
}

const FALLBACK_TITLES = ['Team Lead', 'Senior Manager', 'Group Manager', 'Director', 'Associate Director', 'Principal Lead', 'Department Manager', 'Operations Lead']

/** Deterministic demo: manager teams per department, sized so each team is ~40–80 people.
 *  Manager response rates are computed so their weighted average equals the department rate. */
export function deptManagerTeams(deptName: string, totalEmployees: number, deptRate?: number): DeptManagerTeam[] {
  const h = deptNameHash(deptName)
  const avgTeamSize = 25 + (h % 20) // 25–44
  const count = Math.max(4, Math.round(totalEmployees / avgTeamSize))
  const titles = DEPT_TITLES[deptName] ?? FALLBACK_TITLES
  const teams: DeptManagerTeam[] = []
  let remaining = totalEmployees
  for (let i = 0; i < count; i++) {
    const mgrIndex = (h + i * 3) % DEMO_MANAGERS.length
    const isLast = i === count - 1
    const base = Math.round(totalEmployees / count)
    const jitter = ((h + i * 13) % 15) - 7 // -7 to +7
    const share = isLast ? remaining : Math.max(10, base + jitter)
    remaining -= share
    const titleIndex = (h + i * 3) % titles.length
    teams.push({ manager: DEMO_MANAGERS[mgrIndex], title: titles[titleIndex], employees: share, responseRate: 0 })
  }

  // Distribute rates so their employee-weighted average equals deptRate exactly.
  if (deptRate != null && teams.length > 0) {
    const totalEmpl = teams.reduce((s, t) => s + t.employees, 0)
    // Target: total responded = deptRate% of totalEmpl
    const targetResponded = Math.round((deptRate / 100) * totalEmpl)
    // Generate raw seeds (0–1 range) for proportional variation
    const rawSeeds = teams.map((_, i) => 0.2 + ((h + i * 17) % 80) / 100) // 0.20 – 0.99
    // Scale seeds so they sum to targetResponded when multiplied by team size
    const rawTotal = teams.reduce((s, t, i) => s + rawSeeds[i] * t.employees, 0)
    const scale = rawTotal > 0 ? targetResponded / rawTotal : 0
    // Assign each team a responded count (integer), ensuring rollup is exact
    let assignedTotal = 0
    for (let i = 0; i < teams.length; i++) {
      const responded = Math.round(rawSeeds[i] * scale * teams[i].employees)
      teams[i].responseRate = Math.min(100, Math.max(1, Math.round((responded / teams[i].employees) * 100)))
      assignedTotal += Math.round((teams[i].responseRate / 100) * teams[i].employees)
    }
    // Fix rounding error: adjust the largest team so the weighted avg matches exactly
    const actualPct = Math.round((assignedTotal / totalEmpl) * 100)
    if (actualPct !== deptRate) {
      let largestIdx = 0
      for (let i = 1; i < teams.length; i++) {
        if (teams[i].employees > teams[largestIdx].employees) largestIdx = i
      }
      // How many more/fewer responded people do we need?
      const respondedDelta = targetResponded - assignedTotal
      const lgTeam = teams[largestIdx]
      const lgResponded = Math.round((lgTeam.responseRate / 100) * lgTeam.employees) + respondedDelta
      lgTeam.responseRate = Math.min(100, Math.max(1, Math.round((lgResponded / lgTeam.employees) * 100)))
    }
  } else {
    // Fallback: random rates (no dept rate provided)
    for (let i = 0; i < teams.length; i++) {
      teams[i].responseRate = Math.min(100, Math.max(5, 10 + ((h + i * 17) % 70)))
    }
  }

  return teams.sort((a, b) => a.responseRate - b.responseRate)
}

export type ReadinessTrend = {
  /** Percentage point change (positive = up, negative = down) */
  delta: number
  direction: 'up' | 'down'
}

/** Deterministic demo readiness trend after collection completes. Most go up, a few go down. */
export function deptReadinessTrend(deptName: string): ReadinessTrend {
  const h = deptNameHash(deptName)
  // ~75% of departments go up, ~25% go down
  const goesDown = h % 4 === 0
  if (goesDown) {
    const delta = -(1 + (h % 2)) // -1 or -2
    return { delta, direction: 'down' }
  }
  const delta = 1 + (h % 5) // +1 to +5
  return { delta, direction: 'up' }
}

export function activityLabel(deptName: string) {
  const meta = deptCollectionRowDemo(deptName)
  if (meta.useHours) {
    return meta.lastActivityHoursAgo === 1 ? '1h ago' : `${meta.lastActivityHoursAgo}h ago`
  }
  return meta.lastActivityDaysAgo === 1 ? '1d ago' : `${meta.lastActivityDaysAgo}d ago`
}
