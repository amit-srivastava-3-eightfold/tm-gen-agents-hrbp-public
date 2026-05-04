import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, CourseObjectCard, Progress } from '@tonyh-2-eightfold/ef-design-system'
import { NavbarApp } from '../components/Navbar'
import { useUser } from '../contexts/UserContext'
import { buildLevels, LevelCard, type CoachTask, type LevelState } from '../components/workforceReadiness/DevPlanSheet'
import { CoachSessionPanel, type CoachTurn } from '../components/myWork/CoachSessionPanel'
import { CoachPickCard } from '../components/myWork/CoachPickCard'
import type { CoachPick } from '../data/myWorkData'
import '../components/myWork/myWork.css'
import './DevPlanTemplateDetailPage.css'
import '../components/workforceReadiness/DevPlanSheet.css'

const DEV_PLAN_COACH_SCRIPT: CoachTurn[] = [
  { speaker: 'ai', text: "Hi Sarah — I'm your AI Coach. I've reviewed the plan from your interview. Want me to walk you through it?" },
  { speaker: 'sarah', text: 'Yeah, please.' },
  { speaker: 'ai', text: 'Three core modules, one optional. Each one ties to something specific from your interview.' },
  { speaker: 'ai', text: '[Module 1: AI-Assisted QBR Storytelling](#dev-plan-step-1) — drafts your QBR commentary from the data you already pull. You said this was the biggest time sink.' },
  { speaker: 'ai', text: '[Module 2: Call-to-Recap Automation](#dev-plan-step-2) — turns your live call notes into a Salesforce-ready recap.' },
  { speaker: 'ai', text: '[Module 3: Account Research Synthesis](#dev-plan-step-3) — one prompt that produces an exec brief from the sources you already use.' },
  { speaker: 'ai', text: 'Optional: [Prompt Engineering Foundations](#dev-plan-step-4) — take it first if you want the underlying skill, or skip it.' },
  { speaker: 'sarah', text: 'Time commitment?' },
  { speaker: 'ai', text: 'Two hours per module over two weeks. Eight weeks total, four to six hours of actual learning time. The rest is just doing your normal work with the new approach.' },
  { speaker: 'sarah', text: "What's in each module?" },
  { speaker: 'ai', text: 'A short video, a written guide with prompt templates you can copy, and a practice exercise.' },
  { speaker: 'sarah', text: 'I tried Otter for Module 2 stuff a year ago and dropped it. Why is this different?' },
  { speaker: 'ai', text: 'Otter made you read a full transcript to find what mattered. This works from your notes, not a transcript, and outputs in your Salesforce template format. If it still feels like more work after week one, we drop it.' },
  { speaker: 'sarah', text: 'What about the judgment calls — when to escalate a usage drop? Anything for that?' },
  { speaker: 'ai', text: "No, deliberately. That's built from rep volume, not training. The plan frees up time so more of it goes into the calls where that judgment gets sharper." },
  { speaker: 'sarah', text: "Okay. I'll start with Module 1." },
  { speaker: 'ai', text: "Good pick. I'll mark it active. Ask me anything as you go — questions on the material, feedback on a draft, prompt adjustments if the output isn't landing." },
  { speaker: 'sarah', text: 'Will do.' },
]

const DEV_PLAN_COACH_PICK: CoachPick = {
  eyebrow: 'Weekly check-in',
  quip:
    "Hey {firstName} — let's check in. How's the plan landing this week?",
  headline: 'Check in with your Career Coach.',
  desc: 'Quick conversation about how the plan is going.',
  body: 'A quick chat with John to talk through what you tried this week, what got in the way, and what to focus on next.',
  primaryCtaLabel: 'Start check-in',
  secondaryCtaLabel: '',
  videoCaption: 'How are things going this week?',
}

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
    name: 'AI for Customer Success',
    description: 'Three core modules — QBR storytelling, call-to-recap automation, and account research synthesis — plus an optional Prompt Engineering Foundations primer. Each module ties to a specific time sink Sarah called out in her discovery interview, with a short video, a written guide of prompt templates, and one practice exercise.',
    status: 'Published',
    createdBy: 'Workforce Readiness',
    role: 'Customer Success Manager',
    duration: 8,
    businessUnit: 'Customer Success',
    jobFunction: 'Account Management',
    location: 'All',
    skills: ['AI-assisted commentary', 'Prompt engineering', 'AI tool fluency', 'Account research synthesis', 'Critical evaluation of AI output'],
    courses: [
      { title: 'AI-Assisted QBR Storytelling', provider: 'Eightfold Academy', duration: '2 hrs', level: 'Beginner', free: true },
      { title: 'Call-to-Recap Automation', provider: 'Eightfold Academy', duration: '2 hrs', level: 'Beginner', free: true },
      { title: 'Account Research Synthesis', provider: 'Eightfold Academy', duration: '2 hrs', level: 'Beginner', free: true },
      { title: 'Prompt Engineering Foundations (Optional)', provider: 'Vanderbilt University', duration: '2 hrs', level: 'Beginner', free: true },
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
  // Templates that should render the rich curriculum layout (modules + AI score) for employees,
  // not the courses-grid layout used for generic templates.
  const useCurriculumLayout = !!templateId && (templateId.includes('ai-upskilling') || templateId === 'ai-powered-customer-success')
  const [activeTab, setActiveTab] = useState<'employees' | 'details' | 'assign'>(isEmployee ? 'details' : isAlreadyPublished ? 'assign' : 'details')
  const [published, setPublished] = useState(isAlreadyPublished)
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [assignedCount, setAssignedCount] = useState(isAlreadyPublished ? 75 : 0)
  const [toast, setToast] = useState<string | null>(null)
  const [activeUnlock, setActiveUnlock] = useState<'doors' | 'risk' | 'skills' | null>(null)
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const [coachSession, setCoachSession] = useState<CoachTask | null>(null)

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

        {/* Coaching banner — employee view only */}
        {isEmployee && (
          <div style={{ marginBottom: 24 }}>
            <CoachPickCard
              pick={DEV_PLAN_COACH_PICK}
              firstName={currentUser.name.split(' ')[0]}
              onStart={() => setCoachSession({ id: 'dev-plan-pick', text: DEV_PLAN_COACH_PICK.headline, sessionTitle: DEV_PLAN_COACH_PICK.headline, sessionDesc: DEV_PLAN_COACH_PICK.desc })}
            />
          </div>
        )}

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
              {/* Completion progress — employee only, hidden for AI upskilling (score bar handles it) */}
              {isEmployee && !useCurriculumLayout && (() => {
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
                  ...(templateId === 'ai-powered-customer-success' ? [
                    { label: 'Estimated effort', value: '8 hours' },
                    { label: 'Target duration', value: '8 weeks' },
                  ] : templateId?.includes('ai-upskilling') ? [
                    { label: 'Estimated effort', value: '50 hours' },
                    { label: 'Target duration', value: '6 weeks' },
                  ] : [
                    { label: 'Plan Duration (Weeks)', value: String(template.duration) },
                  ]),
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

              {/* Progress summary — employee only, hidden for AI upskilling */}
              {isEmployee && !useCurriculumLayout && (
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
            <div>{useCurriculumLayout ? (() => {
                const firstName = currentUser.name.split(' ')[0]
                // Read WFR state to determine plan completion
                let wfrState = 1
                try { wfrState = JSON.parse(localStorage.getItem('tm:wfr-state') || '{}').state ?? 1 } catch {}
                // Employee's plan is complete when WFR state >= 5 and their hash gives 100%
                // For Sarah Culhane (the employee persona), use a fixed planPct based on state
                const planComplete = wfrState >= 5 && (() => { const h = currentUser.name.split('').reduce((a: number, c: string) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0); return Math.abs(h) % 4 === 0 })()
                const basePct = 48
                const totalPlanPts = 14
                const currentPct = planComplete ? basePct + totalPlanPts : basePct
                const targetPct = basePct + totalPlanPts
                const potentialPct = planComplete ? 0 : targetPct - currentPct
                const levels = buildLevels({ name: currentUser.name, title: currentUser.title, readinessPct: basePct, displayReadiness: currentPct, planPct: planComplete ? 100 : 0 })
                const unlocks = [
                  { id: 'doors' as const, value: '3', label: 'Career doors unlock', detail: `Top: Staff Engineer (87% fit)`, color: 'var(--color-blue-60)', gid: 'udg-blue-t' },
                  { id: 'risk' as const, value: '−12%', label: 'Automation risk drop', detail: '38% now → 26%', color: 'var(--color-green-60)', gid: 'udg-green-t' },
                  { id: 'skills' as const, value: '4', label: 'AI skills gained', detail: 'AI-assisted code review, debugging with LLMs, generating test cases, writing better prompts', color: 'var(--color-violet-60)', gid: 'udg-violet-t' },
                ]
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Completion banner */}
                    {planComplete && (
                      <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20, background: 'linear-gradient(135deg, #065f46 0%, #047857 40%, #059669 100%)', color: '#fff', position: 'relative' }}>
                        {/* Subtle pattern overlay */}
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                        <div style={{ position: 'relative', padding: '24px 24px 20px', display: 'flex', gap: 16 }}>
                          {/* Trophy icon */}
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#fbbf24' }}>emoji_events</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>Plan complete</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, lineHeight: 1.5 }}>
                              Your AI adoption score increased by <strong style={{ color: '#fff' }}>+{totalPlanPts} pts</strong> — you're now AI-ready. Keep the momentum going.
                            </div>
                            <div style={{ marginTop: 14 }}>
                              <Button variant="default" size="sm">
                                <span className="material-symbols-outlined" style={{ fontSize: 15, marginRight: 4 }}>arrow_forward</span>
                                Create next plan
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Adoption Score — horizontal bar */}
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '24px 28px', marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 16 }}>AI Adoption Score</div>
                      {/* Score + bar row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12 }}>
                        <div style={{ fontSize: 40, fontWeight: 800, color: planComplete ? '#15803d' : '#0f172a', lineHeight: 1, minWidth: 70 }}>{currentPct}<span style={{ fontSize: 20, fontWeight: 600, color: planComplete ? '#15803d' : '#64748b' }}>%</span></div>
                        <div style={{ flex: 1, position: 'relative' }}>
                          {/* Track */}
                          <div style={{ height: 14, borderRadius: 7, background: '#f1f5f9', position: 'relative', overflow: 'visible' }}>
                            {/* Current fill */}
                            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${currentPct}%`, borderRadius: 7, background: planComplete ? 'linear-gradient(90deg, #15803d, #22c55e)' : 'linear-gradient(90deg, #d97706, #f59e0b)' }} />
                            {/* Projected fill */}
                            {potentialPct > 0 && (
                              <div style={{ position: 'absolute', left: `${currentPct}%`, top: 0, height: '100%', width: `${potentialPct}%`, borderRadius: '0 7px 7px 0', background: 'linear-gradient(90deg, rgba(99,102,241,0.2), rgba(99,102,241,0.12))' }} />
                            )}
                            {/* 50% threshold */}
                            <div style={{ position: 'absolute', left: '50%', top: -4, bottom: -4, width: 2, background: '#22c55e', borderRadius: 1 }} />
                          </div>
                          {/* Labels below bar */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, position: 'relative' }}>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>0%</span>
                            <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 600, color: '#15803d', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 11 }}>verified</span>
                              AI-Ready
                            </span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>100%</span>
                          </div>
                        </div>
                      </div>
                      {/* Legend row */}
                      <div style={{ display: 'flex', gap: 24, paddingLeft: 90 }}>
                        {planComplete ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#15803d' }}>check_circle</span>
                            <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>All 4 modules completed · +{totalPlanPts} pts earned</span>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#d97706' }} />
                              <span style={{ fontSize: 12, color: '#475569' }}>You are here · <strong>{currentPct}%</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#6366f1', opacity: 0.35 }} />
                              <span style={{ fontSize: 12, color: '#475569' }}>After this plan · <strong>{targetPct}%</strong></span>
                              <span style={{ fontSize: 10, fontWeight: 600, color: '#6366f1', background: '#eff3ff', border: '1px solid #c5d3f8', borderRadius: 8, padding: '1px 6px' }}>+{potentialPct}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Curriculum */}
                    <div className="dev-plan-sheet__curriculum-heading">Curriculum · {levels.length} modules</div>
                    {levels.map(level => {
                      const state: LevelState = planComplete ? 'recognized' : level.id === 1 ? 'current' : 'locked'
                      return (
                        <div key={level.id} id={`dev-plan-step-${level.id}`} style={{ scrollMarginTop: 120 }}>
                          <LevelCard
                            level={{ ...level, name: `Module ${level.id}: ${level.name}` }}
                            state={state}
                            xpPct={0}
                            isAssigned={planComplete}
                            expanded={expandedLevels.has(level.id)}
                            onToggle={() => setExpandedLevels(prev => { const next = new Set(prev); next.has(level.id) ? next.delete(level.id) : next.add(level.id); return next })}
                            onCoachTask={task => setCoachSession(task)}
                          />
                        </div>
                      )
                    })}

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
      <CoachSessionPanel
        open={coachSession !== null}
        onClose={() => setCoachSession(null)}
        sessionTitle={coachSession?.sessionTitle}
        sessionDesc={coachSession?.sessionDesc}
        script={coachSession?.id === 'dev-plan-pick' ? DEV_PLAN_COACH_SCRIPT : undefined}
        planName={template.name}
      />
    </div>
  )
}
