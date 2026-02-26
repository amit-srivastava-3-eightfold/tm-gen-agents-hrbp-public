import { useState } from 'react'
import type { CareerPathData } from '../data/careerInterestsData'

const LINE = '#2563EB'

interface PathPerson {
  initials: string
  bg: string
}

interface PathRole {
  title: string
  skills: number
  people: PathPerson[]
  label: string
}

interface PathItem {
  id: number
  title: string
  skills: number
  tags: string[]
  people: PathPerson[]
  label: string
  next: PathRole | null
}

function toPathFormat(data: CareerPathData): PathItem[] {
  return data.paths.map((node, idx) => {
    const role = node.role
    const people = role.peopleInRole.slice(0, 3).map((p) => ({
      initials: p.initials,
      bg: p.avatarColor ?? '#A1A6B1',
    }))
    const label =
      role.peopleCount === 1
        ? `${role.peopleInRole[0]?.name ?? 'Someone'} is in this role`
        : `${role.peopleInRole[0]?.name ?? 'Someone'} and ${role.peopleCount - 1} other(s) in this role`

    const nextNode = node.connectsTo?.[0]
      ? data.paths.find((p) => p.role.id === node.connectsTo![0])
      : undefined

    return {
      id: idx + 1,
      title: role.title,
      skills: role.matchingSkills,
      tags: role.domainChange ? ['Domain change'] : [],
      people,
      label,
      next: nextNode
        ? {
            title: nextNode.role.title,
            skills: nextNode.role.matchingSkills,
            people: nextNode.role.peopleInRole.slice(0, 3).map((p) => ({
              initials: p.initials,
              bg: p.avatarColor ?? '#A1A6B1',
            })),
            label:
              nextNode.role.peopleCount === 1
                ? `${nextNode.role.peopleInRole[0]?.name ?? 'Someone'} is in this role`
                : `${nextNode.role.peopleInRole[0]?.name ?? 'Someone'} and ${nextNode.role.peopleCount - 1} other(s) in this role`,
          }
        : null,
    }
  })
}

function Av({ p, size = 28 }: { p: PathPerson; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: p.bg,
        color: '#fff',
        fontSize: size * 0.32,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #fff',
        flexShrink: 0,
      }}
    >
      {p.initials}
    </div>
  )
}

function AvGroup({ people }: { people: PathPerson[] }) {
  return (
    <div style={{ display: 'flex' }}>
      {people.map((p, i) => (
        <div key={i} style={{ marginLeft: i ? -8 : 0, zIndex: people.length - i }}>
          <Av p={p} />
        </div>
      ))}
    </div>
  )
}

function TargetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function Card({ role, w = 248 }: { role: PathRole | PathItem; w?: number }) {
  return (
    <div
      style={{
        width: w,
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: '14px 14px 12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.35,
            flex: 1,
            paddingRight: 6,
          }}
        >
          {role.title}
        </span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <TargetIcon />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <AvGroup people={role.people} />
        <span style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.3 }}>{role.label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <span style={{ fontSize: 12, color: '#F59E0B' }}>⚡</span>
        <span style={{ fontSize: 11.5, color: '#374151', fontWeight: 500 }}>{role.skills} matching skills</span>
      </div>
    </div>
  )
}

function Tag({ text }: { text: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: '#EDE9FE',
        color: '#7C3AED',
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 6,
        lineHeight: '18px',
      }}
    >
      {text}
    </span>
  )
}

function PathRow({ path }: { path: PathItem }) {
  const hasTag = path.tags.length > 0
  const tagH = hasTag ? 22 + 4 : 0
  const cardMid = tagH + 50
  const nodeR = 14
  const gap = 4
  const n1x = 0
  const n2x = n1x + nodeR + gap + nodeR
  const hLineStart = n2x + nodeR
  const hLineEnd = hLineStart + 20
  const cardLeft = hLineEnd

  return (
    <div style={{ position: 'relative', marginBottom: 20 }}>
      <div
        style={{
          position: 'absolute',
          left: n1x - nodeR,
          top: cardMid - nodeR,
          width: nodeR * 2,
          height: nodeR * 2,
          borderRadius: '50%',
          border: `1.5px solid ${LINE}`,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          left: n2x - nodeR,
          top: cardMid - nodeR,
          width: nodeR * 2,
          height: nodeR * 2,
          borderRadius: '50%',
          border: '1.5px solid #D1D5DB',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
          <circle cx="12" cy="5" r="1.5" fill="#9CA3AF" />
          <circle cx="12" cy="12" r="1.5" fill="#9CA3AF" />
          <circle cx="12" cy="19" r="1.5" fill="#9CA3AF" />
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          left: hLineStart,
          top: cardMid - 1,
          width: hLineEnd - hLineStart,
          height: 2,
          background: LINE,
        }}
      />

      <div style={{ marginLeft: cardLeft }}>
        {hasTag && (
          <div style={{ marginBottom: 4 }}>
            {path.tags.map((t) => (
              <Tag key={t} text={t} />
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Card role={path} />
          {path.next && (
            <>
              <div style={{ width: 56, height: 2, background: LINE, flexShrink: 0 }} />
              <Card role={path.next} w={268} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface CareerNavigatorProps {
  data: CareerPathData
  avatarSrc?: string
  avatarInitials?: string
  avatarColor?: string
}

export function CareerNavigator({ data, avatarSrc, avatarInitials, avatarColor }: CareerNavigatorProps) {
  const [showAll, setShowAll] = useState(false)
  const paths = toPathFormat(data)
  const visible = showAll ? paths : paths.slice(0, 3)
  const spineX = 14

  const personTitle = data.currentRole.title
  const personSubtitle = data.currentRole.department
  const personTenure = data.currentRole.tenure

  return (
    <div
      style={{
        fontFamily: "var(--font-family), 'Inter', system-ui, sans-serif",
        background: '#F8FAFC',
        borderRadius: 24,
        border: '1px solid #D9DCE1',
        padding: '32px 40px',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 110,
              flexShrink: 0,
            }}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt=""
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #fff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: avatarColor ?? 'linear-gradient(160deg,#5B6070,#2D3142)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: 700,
                  border: '3px solid #fff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                  flexShrink: 0,
                }}
              >
                {avatarInitials ?? '—'}
              </div>
            )}

            <div style={{ textAlign: 'center', margin: '8px 0 10px' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                {personTitle}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                {personSubtitle}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>{personTenure}</div>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: 5,
                  background: '#E5E7EB',
                  color: '#374151',
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: 20,
                }}
              >
                Current role
              </div>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', paddingTop: 10, marginLeft: 32 }}>
            <div style={{ marginLeft: spineX }}>
              {visible.map((p) => (
                <PathRow key={p.id} path={p} />
              ))}

              {paths.length > 3 && (
                <div style={{ position: 'relative', paddingBottom: 8 }}>
                  <div style={{ marginLeft: 0 }}>
                    <button
                      type="button"
                      onClick={() => setShowAll((v) => !v)}
                      style={{
                        background: '#fff',
                        border: `1.5px solid ${LINE}`,
                        color: LINE,
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '7px 22px',
                        borderRadius: 24,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      }}
                    >
                      {showAll ? 'Show less' : 'See 3 more'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
