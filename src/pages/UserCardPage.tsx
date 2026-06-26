import { useState } from 'react'
import { UserCard, type UserCardData, type RiskTag } from '../components/UserCard'
import { UserCardV2 } from '../components/UserCardV2'
import { UserCardV3 } from '../components/UserCardV3'
import { UserCardV4 } from '../components/UserCardV4'
import { UserCardTable } from '../components/UserCardTable'
import { MATEO_USER_CARDS } from '../data/teamData'

/* Showcase a few real report cards so the gallery reflects the varied
   states (completion, assessments, risk levels) seen on My team. */
const SAMPLE: UserCardData[] = MATEO_USER_CARDS.slice(0, 3)

type ReportCardVersion = 'current' | 'v2' | 'v3' | 'v4' | 'v5'

const VERSIONS: { value: ReportCardVersion; label: string }[] = [
  { value: 'current', label: 'Current' },
  { value: 'v2', label: 'v2' },
  { value: 'v3', label: 'v3' },
  { value: 'v4', label: 'v4' },
  { value: 'v5', label: 'v5' },
]

export default function UserCardPage() {
  const [riskOverrides, setRiskOverrides] = useState<Record<string, RiskTag[]>>({})
  const [version, setVersion] = useState<ReportCardVersion>('current')

  const handleRiskTagsChange = (userId: string, riskTags: RiskTag[]) =>
    setRiskOverrides((prev) => ({ ...prev, [userId]: riskTags }))

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto', fontFamily: 'var(--font-family)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Team report card</h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px', maxWidth: 760 }}>
        The manager-facing report card used on <strong>My team → My reports</strong>. Each card shows a
        direct report's completion, career interests, self &amp; manager assessments, development and
        succession planning, and an editable risk profile, alongside a <strong>Manager actions</strong>{' '}
        menu. Click a card to open the profile sheet; use a risk pencil or “Edit Risk Indicators” to edit
        risk tags.
      </p>

      {/* Version selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 24px' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Version</span>
        <div
          role="tablist"
          aria-label="Report card version"
          style={{ display: 'inline-flex', background: '#eef1f5', border: '1px solid #dde2e9', borderRadius: 10, padding: 3, gap: 2 }}
        >
          {VERSIONS.map((v) => {
            const active = version === v.value
            return (
              <button
                key={v.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setVersion(v.value)}
                style={{
                  appearance: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 18px',
                  borderRadius: 7,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'var(--font-family)',
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#146DA6' : '#64748b',
                  boxShadow: active ? '0 1px 2px rgba(16,24,40,0.12)' : 'none',
                  transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                }}
              >
                {v.label}
              </button>
            )
          })}
        </div>
      </div>

      {version === 'v5' ? (
        <UserCardTable
          users={SAMPLE.map((u) => ({ ...u, riskTags: riskOverrides[u.id] ?? u.riskTags }))}
          onRiskTagsChange={handleRiskTagsChange}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {SAMPLE.map((u) => {
            const card = { ...u, riskTags: riskOverrides[u.id] ?? u.riskTags }
            const Card = version === 'current' ? UserCard : version === 'v2' ? UserCardV2 : version === 'v3' ? UserCardV3 : UserCardV4
            return <Card key={u.id} user={card} onRiskTagsChange={handleRiskTagsChange} />
          })}
        </div>
      )}
    </div>
  )
}
