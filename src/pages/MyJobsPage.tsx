import { useState } from 'react'
import {
  ProductBackground,
  Header,
  HeaderToolbar,
  HeaderTextGroup,
  HeaderTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@tonyh-2-eightfold/ef-design-system'
import { NavbarApp } from '../components/Navbar'

type JobStatus = 'saved' | 'applied' | 'in_review' | 'interview' | 'offer' | 'closed'
type TabId = 'applications' | 'interviews' | 'offers' | 'saved'
type AppFilter = 'active' | 'draft' | 'inactive'

const APP_FILTER_STATUSES: Record<AppFilter, JobStatus[]> = {
  active: ['applied', 'in_review'],
  draft: [],
  inactive: ['closed'],
}

interface Job {
  id: string
  jobId: string
  title: string
  department: string
  location: string
  type: 'internal' | 'external'
  postedDate: string
  appliedDate?: string
  status: JobStatus
  matchPercent: number
  skills: string[]
}

const JOBS: Job[] = [
  {
    id: '1',
    jobId: '4821',
    title: 'Principal Software Engineer',
    department: 'Platform Engineering',
    location: 'Remote',
    type: 'internal',
    postedDate: '2 weeks ago',
    appliedDate: 'Apr 9, 2026',
    status: 'interview',
    matchPercent: 94,
    skills: ['Distributed Systems', 'Go', 'Platform Architecture'],
  },
  {
    id: '2',
    jobId: '5103',
    title: 'Staff Engineer, AI Infrastructure',
    department: 'AI & Machine Learning',
    location: 'San Francisco, CA',
    type: 'internal',
    postedDate: '3 weeks ago',
    appliedDate: 'Apr 3, 2026',
    status: 'in_review',
    matchPercent: 88,
    skills: ['Python', 'LLM Infrastructure', 'MLOps'],
  },
  {
    id: '3',
    jobId: '4956',
    title: 'Engineering Manager, Developer Experience',
    department: 'Engineering',
    location: 'Hybrid — SF or NYC',
    type: 'internal',
    postedDate: '1 month ago',
    appliedDate: 'Mar 31, 2026',
    status: 'applied',
    matchPercent: 81,
    skills: ['People Management', 'Developer Tooling', 'CI/CD'],
  },
  {
    id: '4',
    jobId: '5210',
    title: 'Director of Platform Engineering',
    department: 'Engineering Leadership',
    location: 'San Francisco, CA',
    type: 'internal',
    postedDate: '5 days ago',
    status: 'saved',
    matchPercent: 79,
    skills: ['Platform Strategy', 'Team Leadership', 'Cloud Infrastructure'],
  },
  {
    id: '5',
    jobId: '5247',
    title: 'VP of Engineering',
    department: 'Engineering Leadership',
    location: 'San Francisco, CA',
    type: 'internal',
    postedDate: '3 days ago',
    status: 'saved',
    matchPercent: 72,
    skills: ['Executive Leadership', 'Org Design', 'Technical Strategy'],
  },
  {
    id: '6',
    jobId: '4602',
    title: 'Senior Engineering Manager, Reliability',
    department: 'Site Reliability',
    location: 'Remote',
    type: 'internal',
    postedDate: '2 months ago',
    appliedDate: 'Mar 5, 2026',
    status: 'closed',
    matchPercent: 87,
    skills: ['SRE', 'Incident Management', 'Observability'],
  },
]

const STATUS_CONFIG: Record<JobStatus, { label: string; icon: string; bg: string; color: string }> = {
  saved: { label: 'Saved', icon: 'bookmark', bg: '#eff6ff', color: '#1d4ed8' },
  applied: { label: 'Applied', icon: 'send', bg: '#fffbeb', color: '#b45309' },
  in_review: { label: 'In review', icon: 'manage_search', bg: '#f5f3ff', color: '#6d28d9' },
  interview: { label: 'Interview', icon: 'calendar_today', bg: '#ecfdf5', color: '#065f46' },
  offer: { label: 'Offer', icon: 'star', bg: '#f0fdf4', color: '#15803d' },
  closed: { label: 'Closed', icon: 'cancel', bg: '#f8fafc', color: '#94a3b8' },
}

const TAB_STATUSES: Record<TabId, JobStatus[]> = {
  applications: ['applied', 'in_review', 'closed'],
  interviews: ['interview'],
  offers: ['offer'],
  saved: ['saved'],
}


function AppStatusCard({
  label, count, icon, active, onClick,
}: { label: string; count: number; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '9px 12px', borderRadius: 16, cursor: 'pointer',
        border: active ? '1px solid #BCE4FF' : '1px solid #e5e7eb',
        background: active ? '#EBF5FF' : '#F6F7F8',
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: active ? '#1B4FA8' : '#69717F',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>{icon}</span>
      </span>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 10, color: '#4F5666', lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A212E', lineHeight: 1.2 }}>{count}</div>
      </div>
    </button>
  )
}

export function MyJobsPage() {
  const [tab, setTab] = useState<TabId>('applications')
  const [appFilter, setAppFilter] = useState<AppFilter>('active')

  const tabCount = (t: TabId) => JOBS.filter(j => TAB_STATUSES[t].includes(j.status)).length
  const appFilterCount = (f: AppFilter) => JOBS.filter(j => APP_FILTER_STATUSES[f].includes(j.status)).length

  const filtered = JOBS.filter(j => tab === 'applications'
    ? APP_FILTER_STATUSES[appFilter].includes(j.status)
    : TAB_STATUSES[tab].includes(j.status))

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <NavbarApp />

      <ProductBackground
        style={{ position: 'relative', zIndex: 1, marginTop: 'var(--navbar-height, 60px)' }}
        variant="career-hub"
        wavesVariant="default"
      >
        <Header variant="career-hub" chSize="parent" overlayBackground>
          <HeaderToolbar>
            <HeaderTextGroup>
              <HeaderTitle>My Jobs</HeaderTitle>
            </HeaderTextGroup>
          </HeaderToolbar>
        </Header>
      </ProductBackground>

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 32px 32px' }}>
        <div>
        <Tabs value={tab} onValueChange={v => setTab(v as TabId)}>
          <TabsList variant="line" style={{ width: '100%', marginBottom: 24, justifyContent: 'flex-start' }}>
            <TabsTrigger className="!flex-none" value="applications" badge={tabCount('applications')}>Applications</TabsTrigger>
            <TabsTrigger className="!flex-none" value="interviews" badge={tabCount('interviews')}>Interviews</TabsTrigger>
            <TabsTrigger className="!flex-none" value="offers" badge={tabCount('offers')}>Offers</TabsTrigger>
            <TabsTrigger className="!flex-none" value="saved" badge={tabCount('saved')}>Saved</TabsTrigger>
          </TabsList>

          {(['applications', 'interviews', 'offers', 'saved'] as TabId[]).map(t => (
            <TabsContent key={t} value={t}>
              {/* Application status bar */}
              {t === 'applications' && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  <AppStatusCard label="Active" count={appFilterCount('active')} icon="task_alt" active={appFilter === 'active'} onClick={() => setAppFilter('active')} />
                  <AppStatusCard label="Draft" count={appFilterCount('draft')} icon="edit_document" active={appFilter === 'draft'} onClick={() => setAppFilter('draft')} />
                  <AppStatusCard label="Inactive" count={appFilterCount('inactive')} icon="assignment_late" active={appFilter === 'inactive'} onClick={() => setAppFilter('inactive')} />
                </div>
              )}
              {/* Job cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>work_off</span>
              No jobs found
            </div>
          )}
          {filtered.map(job => {
            const statusCfg = STATUS_CONFIG[job.status]
            const isClosed = job.status === 'closed'
            return (
              <div
                key={job.id}
                style={{
                  padding: '14px 20px',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  background: isClosed ? '#fafafa' : '#fff',
                  opacity: isClosed ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  background: isClosed ? '#94a3b8' : '#1B4FA8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#fff', fontVariationSettings: "'FILL' 1" }}>description</span>
                </div>

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1a212e', marginBottom: 4 }}>{job.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{job.location}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 500, color: '#4F5666',
                      background: '#F1F3F5', borderRadius: 4, padding: '2px 7px',
                    }}>
                      Job ID: {job.jobId}
                    </span>
                  </div>
                </div>

                {/* Status + date */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusCfg.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: statusCfg.color, fontWeight: 500 }}>{statusCfg.label}</span>
                  </div>
                  {job.appliedDate && (
                    <div style={{ fontSize: 13, color: '#64748b' }}>Applied on {job.appliedDate}</div>
                  )}
                </div>
              </div>
            )
          })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        </div>
      </main>
    </div>
  )
}
