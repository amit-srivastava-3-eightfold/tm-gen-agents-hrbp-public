/**
 * Design page: Dev Plan Sheet — states, personas & components
 * Shows the full plan panel inline with tabs for state, persona, and sub-component.
 */
import { useState } from 'react'
import { DevPlanSheet, type DevPlanSheetProps, type DevPlanSheetView } from '../components/workforceReadiness/DevPlanSheet'

// ── Scenario definitions ───────────────────────────────────────────────────────

type PlanState = 'pre-assign' | 'in-progress' | 'complete'
type PersonaKey = 'chro' | 'hrbp' | 'employee'

const PLAN_STATES: { key: PlanState; label: string }[] = [
  { key: 'pre-assign',  label: 'Pre-assignment' },
  { key: 'in-progress', label: 'Assigned — in progress' },
  { key: 'complete',    label: 'Plan complete' },
]

const PERSONAS: { key: PersonaKey; label: string }[] = [
  { key: 'chro',     label: 'CHRO' },
  { key: 'hrbp',     label: 'HRBP' },
  { key: 'employee', label: 'Employee' },
]

const COMPONENTS: { key: DevPlanSheetView; label: string }[] = [
  { key: 'full',       label: 'Full panel' },
  { key: 'score',      label: 'AI adoption score' },
  { key: 'stats',      label: 'Stats bar' },
  { key: 'curriculum', label: 'Curriculum steps' },
  { key: 'unlocks',    label: 'Unlocks' },
]

type BaseEmployee = NonNullable<DevPlanSheetProps['employee']>

const BASE_EMPLOYEES: Record<PersonaKey, BaseEmployee> = {
  chro:     { name: 'Alex Kim',     title: 'Engineering Manager',        readinessPct: 31, displayReadiness: 31 },
  hrbp:     { name: 'Priya Mehta',  title: 'Customer Success Manager',   readinessPct: 24, displayReadiness: 24 },
  employee: { name: 'Marcus Chen',  title: 'Senior Software Engineer',   readinessPct: 42, displayReadiness: 49 },
}

function resolveEmployee(base: BaseEmployee, planState: PlanState): BaseEmployee {
  if (planState === 'pre-assign') return { ...base, displayReadiness: base.readinessPct }
  if (planState === 'complete') return { ...base, readinessPct: base.readinessPct + 14, displayReadiness: base.readinessPct + 14, planPct: 100 }
  return base // in-progress: displayReadiness is advanced (shows caret progress)
}

function isAssignedForState(planState: PlanState): boolean {
  return planState !== 'pre-assign'
}

// ── Tab button ─────────────────────────────────────────────────────────────────

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 8, border: '1px solid',
        borderColor: active ? '#6366f1' : '#e2e8f0',
        background: active ? '#eef2ff' : '#fff',
        color: active ? '#4338ca' : '#475569',
        fontSize: 13, fontWeight: active ? 600 : 400,
        cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DevPlansPage() {
  const [planState, setPlanState] = useState<PlanState>('in-progress')
  const [persona, setPersona] = useState<PersonaKey>('employee')
  const [component, setComponent] = useState<DevPlanSheetView>('full')

  const base = BASE_EMPLOYEES[persona]
  const isAssigned = isAssignedForState(planState)
  const employee = resolveEmployee(base, planState)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 700, margin: '0 auto', fontFamily: 'var(--font-family)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
        Dev Plan Sheet
      </h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>
        All states and personas for the employee development plan.
      </p>

      {/* State tabs */}
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>State</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PLAN_STATES.map(s => (
            <Tab key={s.key} active={planState === s.key} onClick={() => setPlanState(s.key)}>
              {s.label}
            </Tab>
          ))}
        </div>
      </div>

      {/* Persona tabs */}
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '12px 0 8px' }}>Persona</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {PERSONAS.map(p => (
            <Tab key={p.key} active={persona === p.key} onClick={() => setPersona(p.key)}>
              {p.label}
            </Tab>
          ))}
        </div>
      </div>

      {/* Component tabs */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '12px 0 8px' }}>Component</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COMPONENTS.map(c => (
            <Tab key={c.key} active={component === c.key} onClick={() => setComponent(c.key)}>
              {c.label}
            </Tab>
          ))}
        </div>
      </div>

      {/* Inline panel */}
      <DevPlanSheet
        key={`${planState}-${persona}-${component}`}
        employee={employee}
        open={true}
        onClose={() => {}}
        isAssigned={isAssigned}
        inline
        view={component}
        selfView={persona === 'employee'}
      />
    </div>
  )
}
