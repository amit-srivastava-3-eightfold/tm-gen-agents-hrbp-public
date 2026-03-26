import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CareerHubShell } from '@tonyh-2-eightfold/ef-design-system'
import { useNavbarProps } from '../components/Navbar'
import { useUser } from '../contexts/UserContext'

const TEMPLATES = [
  { name: 'AI-Powered Customer Success', status: 'Published' as const, role: 'Owner', courses: 4, skills: ['AI Collaboration', 'Prompt Engineering'] },
  { name: 'Advanced Account Strategy', status: 'Published' as const, role: 'Owner', courses: 5, skills: ['Forecasting', 'Retention Strategy'] },
  { name: 'Support Specialist AI Toolkit', status: 'Published' as const, role: 'Owner', courses: 3, skills: ['AI Troubleshooting', 'Process Automation'] },
  { name: 'AI for Customer Education', status: 'Published' as const, role: 'Owner', courses: 4, skills: ['AI Content Creation', 'Learning Design'] },
  { name: 'Data-Driven Customer Insights', status: 'Published' as const, role: 'Owner', courses: 3, skills: ['Analytics', 'AI Tools'] },
  { name: 'Customer Onboarding Excellence', status: 'Published' as const, role: 'Owner', courses: 3, skills: ['Workflow Automation', 'AI Scheduling'] },
  { name: 'Renewal Strategy with AI', status: 'Published' as const, role: 'Owner', courses: 4, skills: ['Predictive Analytics', 'Churn Prevention'] },
  { name: 'Technical Account Management', status: 'Published' as const, role: 'Owner', courses: 3, skills: ['API Knowledge', 'AI Documentation'] },
  { name: 'Customer Operations Automation', status: 'Published' as const, role: 'Owner', courses: 3, skills: ['Process Automation', 'Dashboard Creation'] },
  { name: 'AI Communication Skills', status: 'Published' as const, role: 'Owner', courses: 2, skills: ['AI Writing', 'Presentation'] },
  { name: 'QBR Preparation with AI', status: 'Published' as const, role: 'Owner', courses: 2, skills: ['AI Analytics', 'Report Generation'] },
  { name: 'AI Upskilling — Support Specialist', status: 'Draft' as const, role: 'WFR', courses: 4, skills: ['AI Troubleshooting', 'Tool Fluency'] },
  { name: 'AI Upskilling — Implementation Consultant', status: 'Draft' as const, role: 'WFR', courses: 4, skills: ['AI Collaboration', 'Process Automation'] },
  { name: 'AI Upskilling — Renewals Specialist', status: 'Draft' as const, role: 'WFR', courses: 4, skills: ['Predictive Analytics', 'AI Tools'] },
  { name: 'AI Upskilling — Customer Insights Analyst', status: 'Draft' as const, role: 'WFR', courses: 4, skills: ['Data Interpretation', 'AI Analytics'] },
  { name: 'AI Upskilling — Customer Success Manager', status: 'Draft' as const, role: 'WFR', courses: 4, skills: ['AI Collaboration', 'Prompt Engineering'] },
  { name: 'AI Upskilling — Technical Account Manager', status: 'Draft' as const, role: 'WFR', courses: 4, skills: ['AI Documentation', 'API Knowledge'] },
  { name: 'AI Upskilling — Customer Education Specialist', status: 'Draft' as const, role: 'WFR', courses: 4, skills: ['AI Content Creation', 'Learning Design'] },
  { name: 'AI Upskilling — Onboarding Coordinator', status: 'Draft' as const, role: 'WFR', courses: 4, skills: ['Workflow Automation', 'AI Scheduling'] },
  { name: 'AI Upskilling — Customer Operations Analyst', status: 'Draft' as const, role: 'WFR', courses: 4, skills: ['Process Automation', 'Dashboard Creation'] },
]

export function DevPlanTemplatesPage() {
  const { currentUser: _currentUser } = useUser()
  const navbarProps = useNavbarProps()
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [search, setSearch] = useState('')

  const publishedCount = TEMPLATES.filter(t => t.status === 'Published').length
  const draftCount = TEMPLATES.filter(t => t.status === 'Draft').length

  const filtered = TEMPLATES
    .filter(t => filter === 'all' || t.status.toLowerCase() === filter)
    .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <CareerHubShell
      chSize="parent"
      title="Development Plan Templates"
      navbarProps={navbarProps}
    >
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px' }}>
        {/* Stat pills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20, maxWidth: 520 }}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12,
              border: filter === 'all' ? '2px solid #3b5bdb' : '1px solid #e5e7eb',
              background: filter === 'all' ? '#f0f4ff' : '#fff', cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#64748b' }}>description</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>All templates</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1a212e' }}>{TEMPLATES.length}</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFilter('published')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12,
              border: filter === 'published' ? '2px solid #3b5bdb' : '1px solid #e5e7eb',
              background: filter === 'published' ? '#f0f4ff' : '#fff', cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#3b82f6' }}>check_circle</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Published</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1a212e' }}>{publishedCount}</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFilter('draft')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12,
              border: filter === 'draft' ? '2px solid #3b5bdb' : '1px solid #e5e7eb',
              background: filter === 'draft' ? '#f0f4ff' : '#fff', cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#94a3b8' }}>radio_button_unchecked</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Draft</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1a212e' }}>{draftCount}</div>
            </div>
          </button>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #d9dce1', background: '#fff', maxWidth: 280, marginBottom: 20 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#94a3b8' }}>search</span>
          <input
            type="text"
            placeholder="Type to search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 13, color: '#1a212e', width: '100%', background: 'transparent' }}
          />
        </div>

        {/* Template cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((template) => (
            <Link
              key={template.name}
              to={`/my-activity/dev-plan-templates/${template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                background: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c7d2fe' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1a212e' }}>{template.name}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                    background: template.status === 'Published' ? '#dbeafe' : '#f1f5f9',
                    color: template.status === 'Published' ? '#1d4ed8' : '#64748b',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                      {template.status === 'Published' ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    {template.status}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                    background: '#fef9c3', color: '#854d0e',
                  }}>
                    Owner
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  {template.courses > 0 ? `${template.courses} course${template.courses !== 1 ? 's' : ''}` : 'The plan is empty'}
                </div>
              </div>
              <button type="button" onClick={(e) => e.preventDefault()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, padding: 4 }}>⋮</button>
            </Link>
          ))}
        </div>
      </main>
    </CareerHubShell>
  )
}
