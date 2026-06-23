import { useState } from 'react'
import { UserCard, type UserCardData, type RiskTag } from '../components/UserCard'
import { MATEO_USER_CARDS } from '../data/teamData'

/* Showcase a few real report cards so the gallery reflects the varied
   states (completion, assessments, risk levels) seen on My team. */
const SAMPLE: UserCardData[] = MATEO_USER_CARDS.slice(0, 3)

export default function UserCardPage() {
  const [riskOverrides, setRiskOverrides] = useState<Record<string, RiskTag[]>>({})

  const handleRiskTagsChange = (userId: string, riskTags: RiskTag[]) =>
    setRiskOverrides((prev) => ({ ...prev, [userId]: riskTags }))

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto', fontFamily: 'var(--font-family)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Team report card</h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', maxWidth: 760 }}>
        The manager-facing report card used on <strong>My team → My reports</strong>. Each card shows a
        direct report's completion, career interests, self &amp; manager assessments, development and
        succession planning, and an editable risk profile, alongside a <strong>Manager actions</strong>{' '}
        menu. Click a card to open the profile sheet; use a risk pencil or “Edit Risk Indicators” to edit
        risk tags.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SAMPLE.map((u) => (
          <UserCard
            key={u.id}
            user={{ ...u, riskTags: riskOverrides[u.id] ?? u.riskTags }}
            onRiskTagsChange={handleRiskTagsChange}
          />
        ))}
      </div>
    </div>
  )
}
