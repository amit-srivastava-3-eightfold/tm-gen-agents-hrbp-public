import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, CourseObjectCard, Progress } from '@tonyh-2-eightfold/ef-design-system'
import { NavbarApp } from '../components/Navbar'
import { useUser } from '../contexts/UserContext'
import './DevPlanTemplateDetailPage.css'
import '../components/workforceReadiness/DevPlanSheet.css'

interface TemplateData {
  name: string
  description: string
  status: string
  createdBy: string
  role: string
  duration: number
  businessUnit: string
  jobFunction: string
  location: string
  skills: string[]
  courses: { title: string; provider: string; duration: string; level: string; free: boolean }[]
}

const TEMPLATE_DATA: Record<string, TemplateData> = {
  'ai-powered-customer-success': {
    name: 'AI-Powered Customer Success',
    description: 'Equip Customer Success Managers with AI tools to automate health score monitoring, generate QBR insights, and use predictive analytics for churn prevention.',
    status: 'Published',
    createdBy: 'Jaydon Torff',
    role: 'Customer Success Manager',
    duration: 6,
    businessUnit: 'Customer Success',
    jobFunction: 'Account Management',
    location: 'All',
    skills: ['AI-assisted research', 'Prompt engineering', 'AI tool fluency', 'Data interpretation with AI', 'AI-powered forecasting', 'Critical evaluation of AI output'],
    courses: [
      { title: 'AI for Business Professionals', provider: 'University of Pennsylvania', duration: '4 weeks at 3 hours a week', level: 'Beginner', free: true },
      { title: 'Generative AI with Large Language Models', provider: 'DeepLearning.AI', duration: '16 hours to complete', level: 'Intermediate', free: true },
      { title: 'Prompt Engineering for ChatGPT', provider: 'Vanderbilt University', duration: '18 hours to complete', level: 'Beginner', free: true },
      { title: 'AI-Powered Customer Workflows', provider: 'Eightfold Academy', duration: 'Self-paced', level: 'Intermediate', free: false },
    ],
  },
  'ai-upskilling-support-specialist': {
    name: 'AI Upskilling — Support Specialist',
    description: 'Train Support Specialists to leverage AI for faster ticket resolution, automated knowledge base management, and AI-assisted troubleshooting workflows.',
    status: 'Draft',
    createdBy: 'Workforce Readiness',
    role: 'Support Specialist',
    duration: 4,
    businessUnit: 'Customer Success',
    jobFunction: 'Customer Support',
    location: 'All',
    skills: ['AI-assisted troubleshooting', 'Knowledge base automation', 'Process automation with AI', 'AI tool fluency', 'AI-powered search'],
    courses: [
      { title: 'AI for Business Professionals', provider: 'University of Pennsylvania', duration: '4 weeks at 3 hours a week', level: 'Beginner', free: true },
      { title: 'Prompt Engineering for ChatGPT', provider: 'Vanderbilt University', duration: '18 hours to complete', level: 'Beginner', free: true },
      { title: 'AI-Powered Ticket Resolution', provider: 'Eightfold Academy', duration: 'Self-paced', level: 'Intermediate', free: false },
      { title: 'Knowledge Base Automation with AI', provider: 'Eightfold Academy', duration: 'Self-paced', level: 'Intermediate', free: false },
    ],
  },
  'platform-reliability-fundamentals': {
    name: 'Platform Reliability Fundamentals',
    description: 'Build a strong foundation in platform reliability engineering — covering observability, incident management, SLO-driven development, and chaos engineering principles for resilient distributed systems.',
    status: 'Published',
    createdBy: 'Alex Nakamura',
    role: 'Engineering Lead',
    duration: 8,
    businessUnit: 'Engineering',
    jobFunction: 'Engineering Management',
    location: 'All',
    skills: ['SRE fundamentals', 'Observability', 'Incident management', 'SLO-driven development', 'Chaos engineering', 'Distributed systems'],
    courses: [
      { title: 'Site Reliability Engineering: Measuring and Managing Reliability', provider: 'Google Cloud', duration: '16 hours to complete', level: 'Intermediate', free: true },
      { title: 'Monitoring and Observability for Development', provider: 'LinkedIn Learning', duration: '6 hours to complete', level: 'Intermediate', free: false },
      { title: 'Incident Management Fundamentals', provider: 'PagerDuty University', duration: '4 hours to complete', level: 'Beginner', free: true },
    ],
  },
  'engineering-leadership-growth': {
    name: 'Engineering Leadership Growth',
    description: 'Develop leadership capabilities for engineering managers and leads — from effective 1:1s and team dynamics to technical strategy, cross-functional collaboration, and growing engineers through coaching.',
    status: 'Published',
    createdBy: 'Alex Nakamura',
    role: 'Engineering Lead',
    duration: 10,
    businessUnit: 'Engineering',
    jobFunction: 'Engineering Management',
    location: 'All',
    skills: ['Engineering leadership', 'Technical communication', 'Team coaching', 'Cross-functional collaboration', 'Technical strategy', 'Performance management'],
    courses: [
      { title: 'Engineering Management Fundamentals', provider: 'Pluralsight', duration: '10 hours to complete', level: 'Intermediate', free: false },
      { title: 'Leading Technical Teams', provider: 'LinkedIn Learning', duration: '5 hours to complete', level: 'Intermediate', free: false },
      { title: 'Coaching Skills for Managers', provider: 'Coursera', duration: '8 hours to complete', level: 'Beginner', free: true },
      { title: 'Technical Strategy and Vision', provider: 'Eightfold Academy', duration: 'Self-paced', level: 'Advanced', free: false },
    ],
  },
  'ai-upskilling-engineering-lead': {
    name: 'AI Upskilling — Engineering Lead',
    description: 'Build AI-augmented engineering workflows — from AI-assisted code review and architecture analysis to using LLMs for documentation, incident response, and technical decision-making.',
    status: 'Draft',
    createdBy: 'Workforce Readiness',
    role: 'Engineering Lead',
    duration: 6,
    businessUnit: 'Engineering',
    jobFunction: 'Engineering Management',
    location: 'All',
    skills: ['AI-assisted code review', 'Prompt engineering', 'AI tool fluency', 'LLM-powered documentation', 'AI-augmented architecture analysis', 'Critical evaluation of AI output'],
    courses: [
      { title: 'AI for Business Professionals', provider: 'University of Pennsylvania', duration: '4 weeks at 3 hours a week', level: 'Beginner', free: true },
      { title: 'Generative AI with Large Language Models', provider: 'DeepLearning.AI', duration: '16 hours to complete', level: 'Intermediate', free: true },
      { title: 'Prompt Engineering for ChatGPT', provider: 'Vanderbilt University', duration: '18 hours to complete', level: 'Beginner', free: true },
      { title: 'AI-Assisted Engineering Workflows', provider: 'Eightfold Academy', duration: 'Self-paced', level: 'Intermediate', free: false },
    ],
  },
}

const DEFAULT_TEMPLATE: TemplateData = {
  name: 'AI Augmentation Template',
  description: 'Build AI-augmented engineering workflows — from AI-assisted code review and architecture analysis to using LLMs for documentation, incident response, and technical decision-making.',
  status: 'Draft',
  createdBy: 'Workforce Readiness',
  role: 'Engineering Lead',
  duration: 6,
  businessUnit: 'Engineering',
  jobFunction: 'Engineering Management',
  location: 'All',
  skills: ['AI-assisted code review', 'Prompt engineering', 'AI tool fluency', 'LLM-powered documentation', 'AI-augmented architecture analysis', 'Critical evaluation of AI output'],
  courses: [
    { title: 'AI for Business Professionals', provider: 'University of Pennsylvania', duration: '4 weeks at 3 hours a week', level: 'Beginner', free: true },
    { title: 'Generative AI with Large Language Models', provider: 'DeepLearning.AI', duration: '16 hours to complete', level: 'Intermediate', free: true },
    { title: 'Prompt Engineering for ChatGPT', provider: 'Vanderbilt University', duration: '18 hours to complete', level: 'Beginner', free: true },
    { title: 'AI-Assisted Engineering Workflows', provider: 'Eightfold Academy', duration: 'Self-paced', level: 'Intermediate', free: false },
  ],
}

export function DevPlanTemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const { currentUser } = useUser()
  const isEmployee = currentUser.id !== 'jaydon-torff' && currentUser.id !== 'chro'
  const explicitTemplate = TEMPLATE_DATA[templateId ?? '']
  const derivedName = templateId
    ? templateId.split('-').map(w => w === 'ai' ? 'AI' : w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'AI Augmentation Template'
  const template = explicitTemplate ?? { ...DEFAULT_TEMPLATE, name: derivedName, role: derivedName.replace('Ai Upskilling ', '') }
  const isAlreadyPublished = template.status === 'Published'
  const [activeTab, setActiveTab] = useState<'employees' | 'details' | 'assign'>(isEmployee ? 'details' : isAlreadyPublished ? 'assign' : 'details')
  const [published, setPublished] = useState(isAlreadyPublished)
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [assignedCount, setAssignedCount] = useState(isAlreadyPublished ? 75 : 0)
  const [toast, setToast] = useState<string | null>(null)
  const [activeUnlock, setActiveUnlock] = useState<'doors' | 'risk' | 'skills' | null>(null)

  return (
    <div>
      <NavbarApp />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px', paddingTop: 104 }}>
        {/* Back link */}
        <Link to={isEmployee ? '/profile?tab=development' : '/my-activity/dev-plan-templates'} style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>
          <Button variant="default" size="sm">
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>chevron_left</span>
            {isEmployee ? 'My Development Plans' : 'My Templates'}
          </Button>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: isEmployee ? 32 : 8 }}>
          {isEmployee ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {currentUser.avatarPhotoSrc ? (
                    <img
                      src={currentUser.avatarPhotoSrc}
                      alt={currentUser.name}
                      style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: currentUser.avatarColor ?? '#5C6BC0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#fff' }}>
                      {currentUser.avatarInitials}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>{currentUser.name}</div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>{template.name}</h1>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Button variant="outline" size="sm" leadingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>shortcut</span>}>Share</Button>
                  <Button variant="outline" size="sm" leadingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>}>Edit</Button>
                  <Button variant="outline" size="sm" leadingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>description</span>} badge={1}>Notes</Button>
                  <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 22, padding: 4 }}>⋮</button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Created by {template.createdBy}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>Last updated by {template.createdBy} on 24/03/2026</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, color: '#64748b' }}>Template Plan</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>{template.name}</h1>
                  <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#eef2ff', color: '#4338ca' }}>
                    Role based plan
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="outline" size="sm">
                    <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>share</span>
                    Collaborate
                  </Button>
                  <Button variant="outline" size="sm">
                    <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>description</span>
                    Notes 0
                  </Button>
                  <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 20 }}>⋮</button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Created by {template.createdBy}</div>
            </>
          )}
        </div>

        {/* Plan stats row — hidden for employees */}
        {published && !isEmployee && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, background: '#f0fdfa', border: '1px solid #e0f2fe' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#0d9488' }}>groups</span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Total employees</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{assignedCount}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#64748b' }}>radio_button_unchecked</span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Not started</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{isAlreadyPublished ? 28 : assignedCount}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #d1fae5' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#15803d' }}>circle</span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>In progress</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{isAlreadyPublished ? 35 : 0}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, background: '#eff6ff', border: '1px solid #dbeafe' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#2563eb' }}>check_circle</span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Completed</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{isAlreadyPublished ? 12 : 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs — hidden for employees */}
        {!isEmployee && (
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
            {([
              { id: 'employees' as const, label: 'Employees on plan' },
              { id: 'details' as const, label: 'Template details' },
              { id: 'assign' as const, label: 'Assign more employees' },
            ]).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? 'var(--color-secondary-blue, #3b5bdb)' : '#64748b',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-secondary-blue, #3b5bdb)' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'details' && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
            {/* Left sidebar */}
            <div>
              {/* Completion progress — employee only */}
              {isEmployee && (() => {
                const isComplete = template.status === 'Published'
                const pct = isComplete ? 100 : 0
                const done = isComplete ? template.courses.length : 0
                return (
                  <div style={{ marginBottom: 24, padding: '16px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Completion</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isComplete ? '#15803d' : '#0f172a' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: '#e5e7eb', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: isComplete ? '#22c55e' : 'var(--color-button-primary-bg, #3b5bdb)' }} />
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{done} of {template.courses.length} courses completed</div>
                  </div>
                )
              })()}

              {!isEmployee && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Template info</h3>
                  <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(isEmployee ? [
                  { label: 'Description', value: template.description },
                  { label: 'Relevant role', value: template.role },
                  { label: 'Plan Duration (Weeks)', value: String(template.duration) },
                  { label: 'Business unit', value: template.businessUnit },
                  { label: 'Job function', value: template.jobFunction },
                ] : [
                  { label: 'Description', value: template.description },
                  { label: 'Relevant role', value: template.role },
                  { label: 'Plan Duration (Weeks)', value: String(template.duration) },
                  { label: 'Business unit', value: template.businessUnit },
                  { label: 'Job function', value: template.jobFunction },
                  { label: 'Location', value: template.location },
                ]).map((field) => (
                  <div key={field.label}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{field.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: field.value === 'Not specified' ? '#94a3b8' : '#0f172a' }}>{field.value}</div>
                  </div>
                ))}
              </div>

              {!isEmployee && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Skills in plan</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {template.skills.map((skill) => (
                      <span key={skill} style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 4, border: '1px solid #e5e7eb', fontSize: 13, color: '#1a212e', width: 'fit-content' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress summary — employee only */}
              {isEmployee && (
                <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    { label: 'Skills', count: template.skills.length, progress: 0, total: template.skills.length, unit: 'learned' },
                    { label: 'Courses', count: template.courses.length, progress: 0, total: template.courses.length, unit: 'completed' },
                    { label: 'Tasks', count: 1, progress: 0, total: 1, unit: 'completed' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ minWidth: 48 }}>
                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{item.count}</div>
                      </div>
                      <div style={{ flex: 1, paddingTop: 8 }}>
                        <Progress
                          value={item.progress}
                          max={item.total}
                          label={<span style={{ cursor: item.label === 'Skills' ? 'pointer' : undefined }}>{item.progress} {item.unit}{item.label === 'Skills' ? ' ›' : ''}</span>}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right content — Section */}
            <div>{templateId?.includes('ai-upskilling') ? (() => {
                const firstName = currentUser.name.split(' ')[0]
                const currentPct = 48
                const targetPct = 88
                const potentialPct = targetPct - currentPct
                const getTierColor = (pct: number) => pct >= 90 ? 'var(--color-violet-60)' : pct >= 75 ? 'var(--color-blue-60)' : pct >= 50 ? 'var(--color-green-60)' : pct >= 25 ? 'var(--color-orange-60)' : 'var(--color-grey-60)'
                const getTierName = (pct: number) => pct >= 90 ? 'Level 5' : pct >= 75 ? 'Level 4' : pct >= 50 ? 'Level 3' : pct >= 25 ? 'Level 2' : 'Level 1'
                const getTierGlow = (pct: number) => pct >= 90 ? 'rgba(151,85,144,0.4)' : pct >= 75 ? 'rgba(44,140,201,0.4)' : pct >= 50 ? 'rgba(61,143,121,0.4)' : pct >= 25 ? 'rgba(201,126,25,0.4)' : 'rgba(105,113,127,0.35)'
                const curriculum = [
                  { id: 1, name: 'AI Foundations', pts: 8, outcome: 'Understand how AI works and where it applies to your daily work — so you can evaluate AI output with confidence, not just curiosity.', courses: [{ name: 'AI for Business Professionals', provider: 'University of Pennsylvania', duration: '12 hrs', free: true }, { name: 'Prompt Engineering for ChatGPT', provider: 'Vanderbilt University', duration: '8 hrs', free: true }], tasks: ['Complete the AI readiness self-assessment', 'Shadow a colleague who uses AI tools daily and document one observation'] },
                  { id: 2, name: 'Augmentation-Ready', pts: 14, outcome: 'Use AI confidently on routine tasks in your role — with human judgment at every handoff, every time.', courses: [{ name: 'Generative AI with Large Language Models', provider: 'DeepLearning.AI', duration: '16 hrs', free: true }], tasks: ['Apply AI to 2 recurring weekly tasks in your workflow', 'Complete the AI output review checklist for one deliverable'] },
                  { id: 3, name: 'Power User', pts: 10, outcome: 'Drive AI adoption within your immediate team — turning personal wins into repeatable, shared workflows.', courses: [{ name: 'AI-Assisted Engineering Workflows', provider: 'Eightfold Academy', duration: '~8 hrs', free: false }], tasks: ['Document 3 AI-assisted workflows your team can reuse', 'Present one time-saving example to your manager or team'] },
                  { id: 4, name: 'AI Champion', pts: 8, outcome: 'Mentor peers, contribute to the team playbook, and help drive quarter-over-quarter readiness improvements.', courses: [{ name: 'AI Strategy & Governance', provider: 'Eightfold Academy', duration: '6 hrs', free: false }], tasks: ['Coach 2 peers through their AI onboarding journey', 'Contribute at least one workflow to the team AI playbook'] },
                ]
                const unlocks = [
                  { id: 'doors' as const, value: '3', label: 'Career doors unlock', detail: `Top: Staff Engineer (87% fit)`, color: 'var(--color-blue-60)', gid: 'udg-blue-t' },
                  { id: 'risk' as const, value: '−12%', label: 'Automation risk drop', detail: '38% now → 26%', color: 'var(--color-green-60)', gid: 'udg-green-t' },
                  { id: 'skills' as const, value: '4', label: 'AI skills gained', detail: 'AI-assisted code review, debugging with LLMs, generating test cases, writing better prompts', color: 'var(--color-violet-60)', gid: 'udg-violet-t' },
                ]
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Journey bar — uses DevPlanSheet CSS classes */}
                    <div className="dev-plan-sheet__journey" style={{ padding: '20px 0 12px', margin: 0 }}>
                      <div className="dev-plan-sheet__journey-side">
                        <div className="dev-plan-sheet__journey-gem" style={{ background: getTierColor(currentPct), borderColor: getTierColor(currentPct), boxShadow: `0 0 10px ${getTierGlow(currentPct)}` }}>{currentPct}%</div>
                        <div className="dev-plan-sheet__journey-tier" style={{ color: getTierColor(currentPct) }}>{getTierName(currentPct)}</div>
                        <div className="dev-plan-sheet__journey-sublabel">Not started</div>
                      </div>
                      <div className="dev-plan-sheet__journey-bar-area">
                        <div className="dev-plan-sheet__journey-track">
                          <div className="dev-plan-sheet__journey-fill" style={{ width: `${currentPct}%` }} />
                          <div className="dev-plan-sheet__journey-potential" style={{ left: `${currentPct}%`, width: `${potentialPct}%` }} />
                          {currentPct < 50 && <div className="dev-plan-sheet__journey-threshold" style={{ left: '50%' }} />}
                          <div className="dev-plan-sheet__journey-pts" style={{ left: `${currentPct + potentialPct / 2}%` }}>+{potentialPct} pts with this plan</div>
                        </div>
                      </div>
                      <div className="dev-plan-sheet__journey-side dev-plan-sheet__journey-side--target">
                        <div className="dev-plan-sheet__journey-gem dev-plan-sheet__journey-gem--target" style={{ background: getTierColor(targetPct), borderColor: getTierColor(targetPct), boxShadow: `0 0 16px ${getTierGlow(targetPct)}` }}>{targetPct}%</div>
                        <div className="dev-plan-sheet__journey-tier" style={{ color: getTierColor(targetPct) }}>{getTierName(targetPct)}</div>
                        <div className="dev-plan-sheet__journey-sublabel" style={{ color: '#10b981' }}>✓ AI-ready</div>
                      </div>
                    </div>

                    {/* Curriculum — uses DevPlanSheet CSS classes */}
                    <div className="dev-plan-sheet__curriculum-heading">Curriculum · {curriculum.length} steps</div>
                    {curriculum.map((step) => (
                      <div key={step.id} className={`dev-plan-sheet__level ${step.id === 1 ? 'dev-plan-sheet__level--current' : 'dev-plan-sheet__level--locked'}`}>
                        <div className={`dev-plan-sheet__level-header${step.id > 1 ? ' dev-plan-sheet__level-header--clickable' : ''}`} onClick={step.id > 1 ? () => { const d = document.getElementById(`tpl-step-${step.id}`); if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none' } : undefined}>
                          <div className={`dev-plan-sheet__level-badge ${step.id === 1 ? 'dev-plan-sheet__level-badge--current' : 'dev-plan-sheet__level-badge--locked'}`}>
                            {step.id === 1 ? step.id : <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>}
                          </div>
                          <div className="dev-plan-sheet__level-title-group">
                            <div className={`dev-plan-sheet__level-name${step.id > 1 ? ' dev-plan-sheet__level-name--locked' : ''}`}>Step {step.id}: {step.name}</div>
                            {step.id > 1 && <div className="dev-plan-sheet__level-sublabel" style={{ fontSize: 11, color: '#94a3b8' }}>Complete Step {step.id - 1} to unlock</div>}
                          </div>
                          <span className={`dev-plan-sheet__level-pts-chip dev-plan-sheet__level-pts-chip--${step.id === 1 ? 'current' : 'locked'}`}>+{step.pts} pts</span>
                          {step.id > 1 && <span className="material-symbols-outlined dev-plan-sheet__level-chevron">expand_more</span>}
                        </div>
                        <div id={`tpl-step-${step.id}`} style={step.id > 1 ? { display: 'none' } : undefined}>
                          <div className="dev-plan-sheet__level-body">
                            <hr className="dev-plan-sheet__level-divider" />
                            <div className="dev-plan-sheet__section-heading">Outcome</div>
                            <p className="dev-plan-sheet__outcome">{step.outcome}</p>
                            <div className="dev-plan-sheet__section-heading">Courses</div>
                            <div className="dev-plan-sheet__courses">
                              {step.courses.map((c, ci) => (
                                <div key={ci} className="dev-plan-sheet__course">
                                  <span className="material-symbols-outlined dev-plan-sheet__course-icon">school</span>
                                  <div className="dev-plan-sheet__course-info">
                                    <div className="dev-plan-sheet__course-name">{c.name}</div>
                                    <div className="dev-plan-sheet__course-meta">{c.provider} · {c.duration}</div>
                                  </div>
                                  {c.free && <span className="dev-plan-sheet__course-free">Free</span>}
                                </div>
                              ))}
                            </div>
                            <div className="dev-plan-sheet__section-heading">Practice tasks</div>
                            <div className="dev-plan-sheet__tasks">
                              {step.tasks.map((t, ti) => (
                                <div key={ti} className="dev-plan-sheet__task"><div className="dev-plan-sheet__task-dot" />{t}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                        {step.id > 1 && (
                          <div className="dev-plan-sheet__gate">
                            <div className="dev-plan-sheet__gate-info">
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
                              Complete Step {step.id - 1} to unlock
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Unlocks — uses DevPlanSheet CSS classes */}
                    <div className="dev-plan-sheet__unlocks">
                      <div className="dev-plan-sheet__unlocks-heading">What completing this plan unlocks for {firstName}</div>
                      <div className="dev-plan-sheet__unlocks-badges">
                        {unlocks.map(({ id, value, label, detail, color, gid }) => {
                          const isActive = activeUnlock === id
                          return (
                            <button key={gid} type="button" className={`dev-plan-sheet__unlock-badge-item${isActive ? ' dev-plan-sheet__unlock-badge-item--active' : ''}`} onClick={() => setActiveUnlock(isActive ? null : id)} style={{ '--unlock-color': color } as React.CSSProperties}>
                              <svg className="dev-plan-sheet__unlock-shield" viewBox="0 0 100 114" fill="none">
                                <defs><linearGradient id={gid} x1="0" y1="0" x2="100" y2="114" gradientUnits="userSpaceOnUse"><stop offset="0%" style={{ stopColor: color, stopOpacity: isActive ? 0.35 : 0.18 }} /><stop offset="100%" style={{ stopColor: color, stopOpacity: isActive ? 0.12 : 0.05 }} /></linearGradient></defs>
                                <path d="M 50 5 L 95 22 L 95 68 C 95 91 75 106 50 111 C 25 106 5 91 5 68 L 5 22 Z" fill={`url(#${gid})`} stroke={color} strokeWidth={isActive ? 3 : 2.5} />
                                <text x="50" y="62" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: value.length > 3 ? '18px' : '26px', fontWeight: 900, fill: color, letterSpacing: '-0.03em', fontFamily: 'inherit' }}>{value}</text>
                              </svg>
                              <div className="dev-plan-sheet__unlock-badge-label">{label}</div>
                              <div className="dev-plan-sheet__unlock-badge-detail">{detail}</div>
                            </button>
                          )
                        })}
                      </div>
                      {activeUnlock === 'doors' && (
                        <div className="dev-plan-sheet__unlock-panel">
                          <div className="dev-plan-sheet__unlock-panel-heading">Potential new roles</div>
                          <div className="dev-plan-sheet__unlock-panel-roles">
                            {[{ role: 'Staff Engineer', fit: 87 }, { role: 'Cloud Architect', fit: 72 }, { role: 'Engineering Lead', fit: 68 }].map(({ role, fit }) => (
                              <div key={role} className="dev-plan-sheet__unlock-role-row">
                                <span className="dev-plan-sheet__unlock-role-name">{role}</span>
                                <div className="dev-plan-sheet__unlock-role-bar-wrap"><div className="dev-plan-sheet__unlock-role-bar" style={{ width: `${fit}%` }} /></div>
                                <span className="dev-plan-sheet__unlock-role-fit">{fit}% fit</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeUnlock === 'risk' && (
                        <div className="dev-plan-sheet__unlock-panel">
                          <div className="dev-plan-sheet__unlock-panel-heading">Automation risk summary</div>
                          <p className="dev-plan-sheet__unlock-panel-body">
                            {firstName}'s current role has a <strong>38% automation risk</strong> — meaning routine tasks could be automated without AI fluency.
                            Completing this plan develops the judgment, prompt skills, and oversight capabilities that place {firstName} firmly in the <em>augmentation zone</em>, dropping exposure to just 26%.
                          </p>
                          <div className="dev-plan-sheet__unlock-risk-bars">
                            <div className="dev-plan-sheet__unlock-risk-row"><span>Current risk</span><div className="dev-plan-sheet__unlock-role-bar-wrap"><div className="dev-plan-sheet__unlock-role-bar dev-plan-sheet__unlock-role-bar--risk" style={{ width: '38%' }} /></div><span>38%</span></div>
                            <div className="dev-plan-sheet__unlock-risk-row"><span>After plan</span><div className="dev-plan-sheet__unlock-role-bar-wrap"><div className="dev-plan-sheet__unlock-role-bar dev-plan-sheet__unlock-role-bar--safe" style={{ width: '26%' }} /></div><span>26%</span></div>
                          </div>
                        </div>
                      )}
                      {activeUnlock === 'skills' && (
                        <div className="dev-plan-sheet__unlock-panel">
                          <div className="dev-plan-sheet__unlock-panel-heading">Skills {firstName} will gain</div>
                          <div className="dev-plan-sheet__unlock-skills-cloud">
                            {['AI-assisted code review', 'Debugging with LLMs', 'Generating test cases with AI', 'Writing better prompts'].map(skill => (
                              <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 16, background: '#f5f3ff', border: '1px solid #ddd6fe', fontSize: 12, fontWeight: 500, color: '#6d28d9' }}>{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })() : (
              /* Standard courses grid for non-AI plans */
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Courses</h3>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, borderRadius: 12, padding: '0 6px', background: '#f1f5f9', fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                    {template.courses.length}
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  <div className="dev-plan-template-courses" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                    {template.courses.map((course, i) => (
                      <CourseObjectCard
                        key={i}
                        course={{
                          title: course.title,
                          provider: course.provider,
                          duration: course.duration,
                          completedBy: ['_'],
                        }}
                        showBookmark={false}
                        renderFacepile={() => (
                          <button
                            type="button"
                            onClick={(e) => e.preventDefault()}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid #d9dce1', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: template.status === 'Published' ? '#15803d' : '#64748b' }}
                          >
                            <span style={{ width: 8, height: 8, borderRadius: '50%', border: template.status === 'Published' ? 'none' : '1.5px solid #94a3b8', background: template.status === 'Published' ? '#22c55e' : 'transparent', flexShrink: 0 }} />
                            {template.status === 'Published' ? 'Completed' : 'Not started'}
                            <span style={{ fontSize: 10, marginLeft: 2 }}>▼</span>
                          </button>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>group</span>
            <p style={{ fontSize: 14 }}>No employees assigned yet. Use the "Assign more employees" tab to add people to this plan.</p>
          </div>
        )}

        {activeTab === 'assign' && !published && (
          <div style={{ textAlign: 'center', padding: '80px 48px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#c7d2fe', display: 'block', marginBottom: 16 }}>inbox</span>
            <p style={{ fontSize: 16, color: '#94a3b8', fontStyle: 'italic' }}>This template is not yet published, publish it to assign employees</p>
          </div>
        )}

        {activeTab === 'assign' && published && (() => {
          const EMPLOYEES = [
            { name: 'Sarah Mitchell', title: 'Support Specialist', location: 'San Francisco, CA', bu: 'Customer Success', manager: 'Tom Nguyen', managerTitle: 'VP, Customer Success', color: '#5C6BC0', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
            { name: 'James Park', title: 'Implementation Consultant', location: 'New York, NY', bu: 'Customer Success', manager: 'Tom Nguyen', managerTitle: 'VP, Customer Success', color: '#7E3A77', photo: '' },
            { name: 'Priya Sharma', title: 'Renewals Specialist', location: 'Noida, IN', bu: 'Customer Success', manager: 'Sarah Culhane', managerTitle: 'Customer Success Manager', color: '#2E7D32', photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face' },
            { name: 'Alex Rivera', title: 'Customer Insights Analyst', location: 'Austin, TX', bu: 'Customer Success', manager: 'Sarah Culhane', managerTitle: 'Customer Success Manager', color: '#BF360C', photo: '' },
            { name: 'Maya Johnson', title: 'Customer Success Manager', location: 'San Francisco, CA', bu: 'Customer Success', manager: 'Tom Nguyen', managerTitle: 'VP, Customer Success', color: '#00695C', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face' },
            { name: 'David Kim', title: 'Technical Account Manager', location: 'Seattle, WA', bu: 'Customer Success', manager: 'Tom Nguyen', managerTitle: 'VP, Customer Success', color: '#1565C0', photo: '' },
            { name: 'Anika Patel', title: 'Customer Education Specialist', location: 'Bangaluru, IN', bu: 'Customer Success', manager: 'Sarah Culhane', managerTitle: 'Customer Success Manager', color: '#9D6309', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face' },
            { name: 'Jordan Lee', title: 'Onboarding Coordinator', location: 'San Francisco, CA', bu: 'Customer Success', manager: 'Sarah Culhane', managerTitle: 'Customer Success Manager', color: '#6B7B3C', photo: '' },
            { name: 'Sam Okonkwo', title: 'Customer Operations Analyst', location: 'Austin, TX', bu: 'Customer Success', manager: 'Tom Nguyen', managerTitle: 'VP, Customer Success', color: '#A1A6B1', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
            { name: 'Lin Chen', title: 'Support Specialist', location: 'Noida, IN', bu: 'Customer Success', manager: 'Sarah Culhane', managerTitle: 'Customer Success Manager', color: '#5C6BC0', photo: '' },
            { name: 'Emma Wilson', title: 'Implementation Consultant', location: 'New York, NY', bu: 'Customer Success', manager: 'Tom Nguyen', managerTitle: 'VP, Customer Success', color: '#BF360C', photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face' },
            { name: 'Carlos Mendez', title: 'Renewals Specialist', location: 'Santa Clara, CA', bu: 'Customer Success', manager: 'Sarah Culhane', managerTitle: 'Customer Success Manager', color: '#7E3A77', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face' },
          ]
          return (
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Showing {EMPLOYEES.length} results</p>

              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                {/* Filters or Assign button */}
                <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid #e5e7eb', alignItems: 'center' }}>
                  {selectedEmployees.size > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAssignedCount(prev => prev + selectedEmployees.size)
                        setSelectedEmployees(new Set())
                        // Signal WFR dashboard that HRBP has assigned plans (advance to state 5 — upskilled)
                        try {
                          const prev = (() => { try { const r = localStorage.getItem('tm:wfr-state'); return r ? JSON.parse(r) : { state: 1 } } catch { return { state: 1 } } })()
                          localStorage.setItem('tm:wfr-state', JSON.stringify({
                            ...prev,
                            state: 5,
                            collectionLaunchSummary: prev.collectionLaunchSummary ?? { assignOwner: 'self', scopeLabel: 'Customer Success', channelsLabel: 'AI Agent Interviews', delegated: false, scopedDepartmentNames: ['Customer Success'] },
                            upskillingLaunchSummary: prev.upskillingLaunchSummary ?? { assignOwner: 'hrbp', delegated: false, scopeLabel: 'Customer Success', departmentNames: ['Customer Success'], totalEmployees: 820, plansAssigned: ['Customer Success'] },
                          }))
                        } catch { /* ignore */ }
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 24, border: '2px solid #0d9488', background: '#fff', fontSize: 14, fontWeight: 500, color: '#0f172a', cursor: 'pointer' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#0f172a' }}>person</span>
                      Assign selected
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, borderRadius: 12, background: '#e0f2fe', fontSize: 12, fontWeight: 700, color: '#0c4a6e' }}>
                        {selectedEmployees.size}
                      </span>
                    </button>
                  ) : (
                    <>
                      {['Location', 'Business Unit', 'Mentoring'].map((f) => (
                        <button key={f} type="button" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: '1px solid #d9dce1', background: '#fff', fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                          {f} <span style={{ fontSize: 10 }}>▼</span>
                        </button>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: '1px solid #d9dce1', background: '#fff', flex: 1, maxWidth: 220 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#94a3b8' }}>search</span>
                        <span style={{ fontSize: 13, color: '#94a3b8' }}>Search employees</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 140px 1fr 80px 60px', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', background: '#fafbfc' }}>
                  <div><input
                    type="checkbox"
                    checked={selectedEmployees.size === EMPLOYEES.length && EMPLOYEES.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees(new Set(EMPLOYEES.map(emp => emp.name)))
                      } else {
                        setSelectedEmployees(new Set())
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  /></div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Employees ↕</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Location ↕</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Business Unit ↕</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Manager ↕</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Mentoring</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Role</div>
                </div>

                {/* Employee rows */}
                {EMPLOYEES.map((emp) => (
                  <div key={emp.name} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 140px 1fr 80px 60px', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                    <div><input type="checkbox" checked={selectedEmployees.has(emp.name)} onChange={() => setSelectedEmployees(prev => { const next = new Set(prev); if (next.has(emp.name)) next.delete(emp.name); else next.add(emp.name); return next })} style={{ cursor: 'pointer' }} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {emp.photo ? (
                        <img src={emp.photo} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: emp.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#1a212e' }}>{emp.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{emp.title}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#475569' }}>{emp.location}</div>
                    <div style={{ fontSize: 13, color: '#475569' }}>{emp.bu}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#475569', flexShrink: 0 }}>
                        {emp.manager.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#1a212e' }}>{emp.manager}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{emp.managerTitle}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>–</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>–</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </main>

      {/* Sticky bottom bar — hidden for employees */}
      {!published && !isEmployee && (
        <div style={{ position: 'sticky', bottom: 0, zIndex: 50, background: '#fff', borderTop: '1px solid #e5e7eb', padding: '12px 32px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="primary" onClick={() => { setPublished(true); setToast('Template published successfully'); setTimeout(() => setToast(null), 3000) }}>Publish</Button>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 10, background: '#0f172a', color: '#fff',
          fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 8, zIndex: 10000,
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4ade80' }}>check_circle</span>
          {toast}
        </div>
      )}
    </div>
  )
}
