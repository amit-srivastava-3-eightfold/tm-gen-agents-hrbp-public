import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, CourseObjectCard, Progress } from '@tonyh-2-eightfold/ef-design-system'
import { NavbarApp } from '../components/Navbar'
import { useUser } from '../contexts/UserContext'
import './DevPlanTemplateDetailPage.css'

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
    createdBy: 'Laura Shah',
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
}

const DEFAULT_TEMPLATE: TemplateData = {
  name: 'AI Augmentation Template',
  description: 'Develop AI augmentation skills for employees in augmentable roles. This plan focuses on building practical AI fluency, prompt engineering, and the ability to evaluate and direct AI outputs effectively.',
  status: 'Draft',
  createdBy: 'Workforce Readiness',
  role: 'Customer Success Manager',
  duration: 6,
  businessUnit: 'Customer Success',
  jobFunction: 'Not specified',
  location: 'All',
  skills: ['AI-assisted research', 'Prompt engineering', 'AI tool fluency', 'Data interpretation with AI', 'Critical evaluation of AI output', 'AI-human collaboration'],
  courses: [
    { title: 'AI for Business Professionals', provider: 'University of Pennsylvania', duration: '4 weeks at 3 hours a week', level: 'Beginner', free: true },
    { title: 'Generative AI with Large Language Models', provider: 'DeepLearning.AI', duration: '16 hours to complete', level: 'Intermediate', free: true },
    { title: 'Prompt Engineering for ChatGPT', provider: 'Vanderbilt University', duration: '18 hours to complete', level: 'Beginner', free: true },
    { title: 'AI-Powered Customer Workflows', provider: 'Eightfold Academy', duration: 'Self-paced', level: 'Intermediate', free: false },
  ],
}

export function DevPlanTemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const { currentUser } = useUser()
  const isEmployee = currentUser.id !== 'laura-shah' && currentUser.id !== 'chro'
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
              {isEmployee && (
                <div style={{ marginBottom: 24, padding: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Completion</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>0%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: '#e5e7eb', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '0%', borderRadius: 4, background: 'var(--color-button-primary-bg, #3b5bdb)' }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>0 of {template.courses.length} courses completed</div>
                </div>
              )}

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
            <div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Courses</h3>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, borderRadius: 12, padding: '0 6px', background: '#f1f5f9', fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                    {template.courses.length}
                  </span>
                </div>

                {/* Section content */}
                <div style={{ padding: 16 }}>

                  {/* Course object cards */}
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
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid #d9dce1', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#64748b' }}
                          >
                            <span style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid #94a3b8', flexShrink: 0 }} />
                            Not started
                            <span style={{ fontSize: 10, marginLeft: 2 }}>▼</span>
                          </button>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
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
            { name: 'Priya Sharma', title: 'Renewals Specialist', location: 'Noida, IN', bu: 'Customer Success', manager: 'Riley Chen', managerTitle: 'Customer Success Manager', color: '#2E7D32', photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face' },
            { name: 'Alex Rivera', title: 'Customer Insights Analyst', location: 'Austin, TX', bu: 'Customer Success', manager: 'Riley Chen', managerTitle: 'Customer Success Manager', color: '#BF360C', photo: '' },
            { name: 'Maya Johnson', title: 'Customer Success Manager', location: 'San Francisco, CA', bu: 'Customer Success', manager: 'Tom Nguyen', managerTitle: 'VP, Customer Success', color: '#00695C', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face' },
            { name: 'David Kim', title: 'Technical Account Manager', location: 'Seattle, WA', bu: 'Customer Success', manager: 'Tom Nguyen', managerTitle: 'VP, Customer Success', color: '#1565C0', photo: '' },
            { name: 'Anika Patel', title: 'Customer Education Specialist', location: 'Bangaluru, IN', bu: 'Customer Success', manager: 'Riley Chen', managerTitle: 'Customer Success Manager', color: '#9D6309', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face' },
            { name: 'Jordan Lee', title: 'Onboarding Coordinator', location: 'San Francisco, CA', bu: 'Customer Success', manager: 'Riley Chen', managerTitle: 'Customer Success Manager', color: '#6B7B3C', photo: '' },
            { name: 'Sam Okonkwo', title: 'Customer Operations Analyst', location: 'Austin, TX', bu: 'Customer Success', manager: 'Tom Nguyen', managerTitle: 'VP, Customer Success', color: '#A1A6B1', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
            { name: 'Lin Chen', title: 'Support Specialist', location: 'Noida, IN', bu: 'Customer Success', manager: 'Riley Chen', managerTitle: 'Customer Success Manager', color: '#5C6BC0', photo: '' },
            { name: 'Emma Wilson', title: 'Implementation Consultant', location: 'New York, NY', bu: 'Customer Success', manager: 'Tom Nguyen', managerTitle: 'VP, Customer Success', color: '#BF360C', photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face' },
            { name: 'Carlos Mendez', title: 'Renewals Specialist', location: 'Santa Clara, CA', bu: 'Customer Success', manager: 'Riley Chen', managerTitle: 'Customer Success Manager', color: '#7E3A77', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face' },
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
                  <div><input type="checkbox" style={{ cursor: 'pointer' }} /></div>
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
          <Button variant="primary" onClick={() => { setPublished(true); setActiveTab('assign') }}>Publish</Button>
        </div>
      )}
    </div>
  )
}
