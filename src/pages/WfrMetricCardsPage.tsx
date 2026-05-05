/**
 * Design page: WFR Metric Cards — all variants and states
 */
import { useState } from 'react'
import { MetricCard } from '../components/workforceReadiness/MetricCard'

type PersonaKey = 'chro' | 'hrbp' | 'manager'
type StateKey = 'pre-collection' | 'post-collection'

const PERSONAS: { key: PersonaKey; label: string }[] = [
  { key: 'chro',    label: 'CHRO' },
  { key: 'hrbp',    label: 'HRBP' },
  { key: 'manager', label: 'Manager' },
]

const STATES: { key: StateKey; label: string }[] = [
  { key: 'pre-collection',  label: 'Pre-collection (estimated)' },
  { key: 'post-collection', label: 'Post-collection (measured)' },
]

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

const CARD_DATA: Record<PersonaKey, Record<StateKey, Parameters<typeof MetricCard>[0][]>> = {
  manager: {
    'pre-collection': [
      {
        variant: 'ai-potential',
        icon: 'bolt',
        label: 'AI potential',
        value: '41%',
        explainer: 'How much of your team\'s daily work AI is capable of supporting.',
        description: <span style={{ color: '#94a3b8' }}>Across 240 employees</span>,
        onLearnMore: () => {},
      },
      {
        variant: 'potential',
        icon: 'schedule',
        label: 'Productivity hours',
        value: '40k hrs/yr',
        description: (
          <>
            <span>Annual hours AI can unlock across employees in the transformation gap.</span>
            <span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}>Across 240 employees</span>
          </>
        ),
        onLearnMore: () => {},
      },
      {
        variant: 'readiness',
        icon: 'person_check',
        label: 'AI readiness',
        value: '19%',
        explainer: 'Estimated from skill profiles.',
        description: <span style={{ color: '#94a3b8' }}>46 of 240 employees in augmentable roles are AI-ready</span>,
        hint: 'Estimated · collect survey data to measure',
        onLearnMore: () => {},
      },
      {
        variant: 'gap',
        icon: 'group',
        label: 'Transformation gap',
        value: '194',
        explainer: 'People in augmentable roles who aren\'t yet AI-ready.',
        description: <span style={{ color: '#94a3b8' }}>81% of your team needs upskilling</span>,
        onLearnMore: () => {},
      },
    ],
    'post-collection': [
      {
        variant: 'ai-potential',
        icon: 'bolt',
        label: 'AI potential',
        value: '41%',
        explainer: 'How much of your team\'s daily work AI is capable of supporting.',
        description: <span style={{ color: '#94a3b8' }}>Across 240 employees</span>,
        onLearnMore: () => {},
      },
      {
        variant: 'potential',
        icon: 'schedule',
        label: 'Productivity hours',
        value: '36k hrs/yr',
        description: (
          <>
            <span>Annual hours AI can unlock across employees in the transformation gap.</span>
            <span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}>Across 240 employees</span>
          </>
        ),
        onLearnMore: () => {},
      },
      {
        variant: 'readiness',
        icon: 'person_check',
        label: 'AI readiness',
        value: '27%',
        explainer: 'Measured from survey responses — Q1 2026.',
        description: <span style={{ color: '#94a3b8' }}>65 of 240 employees in augmentable roles are AI-ready</span>,
        tag: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '2px 8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
            +8 pts vs. estimated
          </span>
        ),
        onLearnMore: () => {},
      },
      {
        variant: 'gap',
        icon: 'group',
        label: 'Transformation gap',
        value: '175',
        explainer: 'People in augmentable roles who aren\'t yet AI-ready.',
        description: <span style={{ color: '#94a3b8' }}>73% of your team needs upskilling</span>,
        onLearnMore: () => {},
      },
    ],
  },
  chro: {
    'pre-collection': [
      {
        variant: 'ai-potential',
        icon: 'bolt',
        label: 'AI potential',
        value: '48%',
        explainer: `How much of your organization's daily work AI is capable of supporting.`,
        description: <span style={{ color: '#94a3b8' }}>Across 49,500 employees</span>,
        tag: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '2px 8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            Above industry median (38%)
          </span>
        ),
        onLearnMore: () => {},
      },
      {
        variant: 'potential',
        icon: 'schedule',
        label: 'Productivity hours',
        value: '7.8M hrs/yr',
        description: (
          <>
            <span>Annual hours AI can unlock across employees in the transformation gap.</span>
            <span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}>Across 49,500 employees</span>
          </>
        ),
        onLearnMore: () => {},
      },
      {
        variant: 'readiness',
        icon: 'person_check',
        label: 'AI readiness',
        value: '24%',
        explainer: 'Estimated from skill profiles. Collect survey data for measured readiness.',
        description: <span style={{ color: '#94a3b8' }}>11,880 of 49,500 employees in augmentable roles are AI-ready</span>,
        hint: 'Estimated · collect survey data to measure',
        onLearnMore: () => {},
      },
      {
        variant: 'gap',
        icon: 'group',
        label: 'Transformation gap',
        value: '37,620',
        explainer: 'People in augmentable roles who aren\'t yet AI-ready.',
        description: <span style={{ color: '#94a3b8' }}>76% of people in augmentable roles need upskilling</span>,
        onLearnMore: () => {},
      },
    ],
    'post-collection': [
      {
        variant: 'ai-potential',
        icon: 'bolt',
        label: 'AI potential',
        value: '48%',
        explainer: `How much of your organization's daily work AI is capable of supporting.`,
        description: <span style={{ color: '#94a3b8' }}>Across 49,500 employees</span>,
        tag: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '2px 8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            Above industry median (38%)
          </span>
        ),
        onLearnMore: () => {},
      },
      {
        variant: 'potential',
        icon: 'schedule',
        label: 'Productivity hours',
        value: '6.6M hrs/yr',
        description: (
          <>
            <span>Annual hours AI can unlock across employees in the transformation gap.</span>
            <span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}>Across 49,500 employees</span>
          </>
        ),
        onLearnMore: () => {},
      },
      {
        variant: 'readiness',
        icon: 'person_check',
        label: 'AI readiness',
        value: '36%',
        explainer: 'Measured from survey responses — Q1 2026.',
        description: <span style={{ color: '#94a3b8' }}>17,820 of 49,500 employees in augmentable roles are AI-ready</span>,
        tag: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '2px 8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
            +12 pts vs. estimated
          </span>
        ),
        onLearnMore: () => {},
      },
      {
        variant: 'gap',
        icon: 'group',
        label: 'Transformation gap',
        value: '31,680',
        explainer: 'People in augmentable roles who aren\'t yet AI-ready.',
        description: <span style={{ color: '#94a3b8' }}>64% of people in augmentable roles need upskilling</span>,
        onLearnMore: () => {},
      },
    ],
  },
  hrbp: {
    'pre-collection': [
      {
        variant: 'ai-potential',
        icon: 'bolt',
        label: 'AI potential',
        value: '44%',
        explainer: 'How much of your team\'s daily work AI is capable of supporting.',
        description: <span style={{ color: '#94a3b8' }}>Across 3,200 employees</span>,
        onLearnMore: () => {},
      },
      {
        variant: 'potential',
        icon: 'schedule',
        label: 'Productivity hours',
        value: '520k hrs/yr',
        description: (
          <>
            <span>Annual hours AI can unlock across employees in the transformation gap.</span>
            <span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}>Across 3,200 employees</span>
          </>
        ),
        onLearnMore: () => {},
      },
      {
        variant: 'readiness',
        icon: 'person_check',
        label: 'AI readiness',
        value: '22%',
        explainer: 'Estimated from skill profiles.',
        description: <span style={{ color: '#94a3b8' }}>704 of 3,200 employees in augmentable roles are AI-ready</span>,
        hint: 'Estimated · collect survey data to measure',
        onLearnMore: () => {},
      },
      {
        variant: 'gap',
        icon: 'group',
        label: 'Transformation gap',
        value: '2,496',
        explainer: 'People in augmentable roles who aren\'t yet AI-ready.',
        description: <span style={{ color: '#94a3b8' }}>78% of your team needs upskilling</span>,
        onLearnMore: () => {},
      },
    ],
    'post-collection': [
      {
        variant: 'ai-potential',
        icon: 'bolt',
        label: 'AI potential',
        value: '44%',
        explainer: 'How much of your team\'s daily work AI is capable of supporting.',
        description: <span style={{ color: '#94a3b8' }}>Across 3,200 employees</span>,
        onLearnMore: () => {},
      },
      {
        variant: 'potential',
        icon: 'schedule',
        label: 'Productivity hours',
        value: '458k hrs/yr',
        description: (
          <>
            <span>Annual hours AI can unlock across employees in the transformation gap.</span>
            <span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}>Across 3,200 employees</span>
          </>
        ),
        onLearnMore: () => {},
      },
      {
        variant: 'readiness',
        icon: 'person_check',
        label: 'AI readiness',
        value: '31%',
        explainer: 'Measured from survey responses — Q1 2026.',
        description: <span style={{ color: '#94a3b8' }}>992 of 3,200 employees in augmentable roles are AI-ready</span>,
        tag: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '2px 8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
            +9 pts vs. estimated
          </span>
        ),
        onLearnMore: () => {},
      },
      {
        variant: 'gap',
        icon: 'group',
        label: 'Transformation gap',
        value: '2,208',
        explainer: 'People in augmentable roles who aren\'t yet AI-ready.',
        description: <span style={{ color: '#94a3b8' }}>69% of your team needs upskilling</span>,
        onLearnMore: () => {},
      },
    ],
  },
}

export default function WfrMetricCardsPage() {
  const [persona, setPersona] = useState<PersonaKey>('chro')
  const [state, setState] = useState<StateKey>('pre-collection')

  const cards = CARD_DATA[persona][state]

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto', fontFamily: 'var(--font-family)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
        WFR Metric Cards
      </h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>
        All four metric card variants across personas and collection states.
      </p>

      {/* Persona tabs */}
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Persona</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {PERSONAS.map(p => (
            <Tab key={p.key} active={persona === p.key} onClick={() => setPersona(p.key)}>{p.label}</Tab>
          ))}
        </div>
      </div>

      {/* State tabs */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '12px 0 8px' }}>Collection state</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATES.map(s => (
            <Tab key={s.key} active={state === s.key} onClick={() => setState(s.key)}>{s.label}</Tab>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {cards.map((card, i) => (
          <MetricCard key={i} {...card} />
        ))}
      </div>
    </div>
  )
}
