import { useState } from 'react'
import { ProfileSheet, type ProfileContact, type ProfileGlance } from '../components/ProfileSheet'
import { Button } from '../components/ui/Button'
import type { OpenToItem } from '../components/OpenTo'
import type { UserCardData } from '../components/UserCard'

type Variant = 'manager' | 'peer'

/* Demo subjects use real peopleData ids so "View Profile" opens an actual profile (/people/:id). */

const MANAGER_USER: UserCardData = {
  id: 's6',
  initials: 'SM',
  avatarColor: '#C62828',
  name: 'Sarah Mitchell',
  title: 'Senior Sales Engineer',
  location: 'Santa Clara, CA',
  directReports: [],
  completionPercent: 100,
  careerInterests: 'Senior Sales Engineer',
  selfAssessment: 'More than 12 months',
  managerAssessment: 'More than 12 months',
  developmentPlanning: '2 not started',
  successionPlanning: '1 ready',
  riskTags: [
    { label: 'Retention risk', value: 'Low' },
    { label: 'Loss impact', value: 'Medium' },
    { label: 'Employee criticality', value: 'High', isCritical: true },
  ],
}

const MANAGER_HIGHLIGHTS = [
  'You started at Eightfold 3 years 6 months before Sarah',
  'Sarah participated in: Q4 Product Launch',
]

const MANAGER_CONTACT: ProfileContact = {
  phone: '4156843003',
  email: 'smitchell@eightfold.ai',
}

const MANAGER_GLANCE: ProfileGlance = {
  manager: {
    name: 'Mateo Myer',
    title: 'Sales Engineering Manager',
    initials: 'MM',
    avatarColor: '#1B6FA8',
  },
  businessUnit: 'Sales Engineering',
  currentTenure: '3 years 2 months',
}

const MANAGER_OPEN_TO: OpenToItem[] = ['coffee', 'mentoring', 'project']

const PEER_USER: UserCardData = {
  id: 's3',
  initials: 'MW',
  avatarColor: '#5D4037',
  avatarPhotoSrc: 'https://i.pravatar.cc/80?u=s3-marcus',
  name: 'Marcus Webb',
  title: 'Support Engineer',
  location: 'Los Angeles, CA',
  directReports: [],
  completionPercent: 0,
  careerInterests: '',
  selfAssessment: '',
  managerAssessment: '',
  developmentPlanning: '',
  successionPlanning: '',
  riskTags: [],
}

const PEER_HIGHLIGHTS = [
  'Both you and Marcus previously worked at Upwork',
  'You started at Eightfold 6 years 9 months before Marcus',
]

const PEER_CONTACT: ProfileContact = {
  phone: '(312) 477-1792',
  email: 'mwebb@eightfold.ai',
}

const PEER_GLANCE: ProfileGlance = {
  manager: {
    name: 'Ethan Declerq',
    title: 'Customer Success Manager',
    initials: 'ED',
    avatarColor: '#0288D1',
  },
  businessUnit: 'Customer Success',
  currentTenure: '1 year 2 months',
}

const PEER_OPEN_TO: OpenToItem[] = ['coffee', 'project']

export default function ProfileSheetPage() {
  const [open, setOpen] = useState(true)
  const [variant, setVariant] = useState<Variant>('manager')

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto', fontFamily: 'var(--font-family)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Profile Sheet</h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>
        Slide-in person panel. The <strong>manager view</strong> shows Manage actions, risk profile, and a Manager
        actions menu; the <strong>peer view</strong> omits those. Both show Highlights, Contact &amp; Links, and At a
        glance. "View Profile" navigates to the person's profile page.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['manager', 'peer'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => { setVariant(v); setOpen(true) }}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid',
              borderColor: variant === v ? '#6366f1' : '#e2e8f0',
              background: variant === v ? '#eef2ff' : '#fff',
              color: variant === v ? '#4338ca' : '#475569',
              fontSize: 13, fontWeight: variant === v ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {v === 'manager' ? 'Manager view' : 'Peer view'}
          </button>
        ))}
      </div>

      <Button variant="primary" onClick={() => setOpen(true)}>Open profile sheet</Button>

      {variant === 'manager' ? (
        <ProfileSheet
          key="manager"
          variant="manager"
          user={MANAGER_USER}
          open={open}
          onClose={() => setOpen(false)}
          openToIcons={MANAGER_OPEN_TO}
          highlights={MANAGER_HIGHLIGHTS}
          contact={MANAGER_CONTACT}
          glance={MANAGER_GLANCE}
        />
      ) : (
        <ProfileSheet
          key="peer"
          variant="peer"
          user={PEER_USER}
          open={open}
          onClose={() => setOpen(false)}
          openToIcons={PEER_OPEN_TO}
          highlights={PEER_HIGHLIGHTS}
          contact={PEER_CONTACT}
          glance={PEER_GLANCE}
        />
      )}
    </div>
  )
}
