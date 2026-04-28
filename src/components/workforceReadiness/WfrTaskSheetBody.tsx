import { useEffect, useState } from 'react'
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

const AUTOMATE_SKILLS = ['Zero-touch processing', 'AI pipeline', 'Process automation']

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
  if (zone === 'above') return AUTOMATE_SKILLS.slice(0, 2)
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

function getZone(score: number): 'above' | 'augment' | 'below' {
  if (score > 75) return 'above'
  if (score >= 15) return 'augment'
  return 'below'
}

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
}

export function WfrTaskSheetBody({ role, phase = 'baseline' }: Props) {
  const [zoneFilter, setZoneFilter] = useState<'augment' | 'above' | 'below' | null>(null)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  useEffect(() => { setZoneFilter(null) }, [phase])

  const toggleTask = (name: string) =>
    setExpandedTasks(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })

  const baseTasks = getTasksForRole(role.title)

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
              const isOpen = expandedTasks.has(t.task)
              const skills = getSkills(t.task, group.zone)
              const description = getDescription(t.task)
              return (
                <div
                  key={i}
                  onClick={() => toggleTask(t.task)}
                  style={{ padding: '10px 12px', borderRadius: 6, border: `1px solid ${moved ? (movedUp ? '#c7d2fe' : '#fecaca') : '#e5e7eb'}`, background: moved ? (movedUp ? '#fafafe' : '#fff8f8') : '#fff', cursor: 'pointer', transition: 'background 0.1s' }}
                >
                  {/* Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span className="text-[13px] font-medium text-[#1a212e]">{t.task}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {moved && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 10, background: movedUp ? '#eef2ff' : '#fff1f2', border: `1px solid ${movedUp ? '#c7d2fe' : '#fecaca'}`, fontSize: 11, fontWeight: 600, color: movedUp ? '#4338ca' : '#be123c', whiteSpace: 'nowrap' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11, lineHeight: 1 }}>{movedUp ? 'arrow_upward' : 'arrow_downward'}</span>
                          was {ZONE_META[t.baseZone].label}
                        </span>
                      )}
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#94a3b8', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', lineHeight: 1 }}>expand_more</span>
                    </div>
                  </div>
                  {/* Expanded content */}
                  {isOpen && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px', lineHeight: 1.55 }}>{description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {skills.map(skill => (
                          <span key={skill} style={{ padding: '2px 8px', borderRadius: 4, background: group.bg, border: `1px solid ${group.border}`, fontSize: 11, fontWeight: 500, color: group.color }}>{skill}</span>
                        ))}
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
