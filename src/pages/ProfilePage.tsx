import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { TabsWithLines } from '../components/ui/TabsWithLines'
import { NavbarApp } from '../components/Navbar'
import { useUser } from '../contexts/UserContext'
import { Button } from '../components/ui/Button'
import { Button as DsButton, ProductBackground, StatCard } from '@tonyh-2-eightfold/ef-design-system'
import { WaveBackground } from '../components/WaveBackground'
import { OpenTo } from '../components/OpenTo'
import { AboutCard } from '../components/AboutCard'
import { MentorshipTab } from '../components/MentorshipTab'
import { SkillsCard } from '../components/SkillsCard'
import { OrganizationCard } from '../components/OrganizationCard'
import { EmployeeInformationCard } from '../components/EmployeeInformationCard'
import { ContactLinksCard } from '../components/ContactLinksCard'
import { ResumesCard } from '../components/ResumesCard'
import { MobilityCard } from '../components/MobilityCard'
import { LanguagesCard } from '../components/LanguagesCard'
import { ProjectsCard } from '../components/ProjectsCard'
import { WorkExperienceCard } from '../components/WorkExperienceCard'
import { CoursesCard } from '../components/CoursesCard'
import { EducationCard } from '../components/EducationCard'
import { EmptySectionCard } from '../components/EmptySectionCard'
import { SkillAssessmentsTab } from '../components/SkillAssessmentsTab'
import { SkillGoalsCard } from '../components/SkillGoalsCard'
import { PreferencesCard } from '../components/PreferencesCard'
import '../components/AboutCard.css'
import '../components/SkillsCard.css'
import '../components/OrganizationCard.css'
import './ProfilePage.css'

const viewOptions = [
  { id: 'own', label: 'Own view' },
  { id: 'hrbp', label: 'HRBP view' },
  { id: 'public', label: 'Public view' },
]

const profileTabs = [
  { id: 'experience', label: 'Experience' },
  { id: 'career-interest', label: 'Career interests' },
  { id: 'skills', label: 'Skills and performance' },
  { id: 'development', label: 'Development plans' },
  { id: 'mentorship', label: 'Mentorship' },
]

export function ProfilePage() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') ?? 'experience'
  const [view, setView] = useState('own')
  const { currentUser } = useUser()
  const avatarSrc = currentUser.avatarType === 'photo' && currentUser.avatarPhotoSrc
    ? currentUser.avatarPhotoSrc
    : null

  return (
    <div className="profile-page">
      <NavbarApp />
      {currentUser.id === 'csm' ? (
        <WaveBackground variant="profile">
          <header className="profile-page__header" />
        </WaveBackground>
      ) : (
        <ProductBackground variant="career-hub" {...(currentUser.id === 'jaydon-torff' ? { hexagonsVariant: 'profile' as const } : { chevronsVariant: 'profile' as const })}>
          <header className="profile-page__header" />
        </ProductBackground>
      )}
      <main className="profile-page__main">
        <div className="profile-page__content-zone">
          <div className="profile-page__content grid grid-cols-12 gap-6">
            <div className="profile-page__card-row col-span-12 grid grid-cols-12 gap-6">
            <div className="profile-hero col-span-4">
              <div className="profile-hero__avatar-wrap">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={currentUser.name}
                    className="profile-hero__avatar"
                  />
                ) : (
                  <div
                    className="profile-hero__avatar profile-hero__avatar--initials"
                    style={currentUser.avatarColor ? { background: currentUser.avatarColor } : undefined}
                  >
                    {currentUser.avatarInitials}
                  </div>
                )}
              </div>
              <div className="profile-hero__card">
                <button
                  type="button"
                  className="profile-hero__card-menu-btn"
                  aria-label="Notes"
                >
                  <span className="material-symbols-outlined">sticky_note_2</span>
                </button>
                <div className="profile-hero__info">
                  <div className="profile-hero__name-row">
                    <h1 className="profile-hero__name">{currentUser.name}</h1>
                  </div>
                  <p className="profile-hero__title">{currentUser.title}</p>
                  <p className="profile-hero__meta">
                    {currentUser.pronouns && (
                      <>
                        <span className="profile-hero__pronouns">{currentUser.pronouns}</span>
                        <span className="profile-hero__meta-sep">·</span>
                      </>
                    )}
                    <span className="material-symbols-outlined profile-hero__icon">schedule</span>
                    <span className="material-symbols-outlined profile-hero__icon">location_on</span>
                    {currentUser.location}
                  </p>
                  <div className="profile-hero__actions">
                    <div className="profile-hero__actions-inner">
                      <Button variant="primary">
                        <span className="material-symbols-outlined">handshake</span>
                        Request
                      </Button>
                      <Button variant="secondary">
                        <span className="material-symbols-outlined">bookmark</span>
                        Save
                      </Button>
                    </div>
                  </div>
                  <div className="profile-hero__divider" />
                  <div className="profile-hero__open-to">
                    <OpenTo items={['coffee', 'mentoring', 'project']} labelAsButton={false} />
                  </div>
                </div>
              </div>
            </div>
            <div className="profile-page__banner-actions col-span-8 flex justify-end items-center gap-2">
              <DsButton variant="outline" size="icon-sm" aria-label="Settings" style={{ background: '#fff' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>settings</span>
              </DsButton>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <DsButton variant="outline" size="sm" style={{ background: '#fff' }} trailingIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>}>
                    {viewOptions.find((o) => o.id === view)?.label ?? 'Own view'}
                  </DsButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="profile-page__view-menu" align="end" sideOffset={4}>
                    {viewOptions.map((opt) => (
                      <DropdownMenu.Item
                        key={opt.id}
                        className="profile-page__view-item"
                        onSelect={() => setView(opt.id)}
                      >
                        {opt.label}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
            </div>
          </div>
          <div className="profile-page__divider" />
        </div>
        <div className="profile-page__content profile-page__content--tabs grid grid-cols-12 gap-6">
          <TabsWithLines tabs={profileTabs} defaultValue={initialTab} className="col-span-12">
            <Tabs.Content value="experience" className="tabs-with-lines__content">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 flex flex-col gap-6">
                  <AboutCard key={currentUser.id} />
                  <SkillsCard />
                  <LanguagesCard />
                  <MobilityCard
                    relocateValue={currentUser.mobilityPreference}
                    travelValue={currentUser.flexibilityToTravel}
                  />
                  <ProjectsCard />
                  <CoursesCard />
                  <WorkExperienceCard />
                  <EducationCard />
                  <EmptySectionCard title="Awards" />
                  <EmptySectionCard title="Patents" />
                  <EmptySectionCard title="Publications" titleIcon="visibility_off" />
                </div>
                <div className="col-span-4 flex flex-col gap-6">
                  <OrganizationCard />
                  <EmployeeInformationCard />
                  <ContactLinksCard />
                  <ResumesCard />
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content value="career-interest" className="tabs-with-lines__content">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <SkillGoalsCard />
                </div>
                <div className="col-span-4 flex flex-col gap-6">
                  <PreferencesCard />
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content value="skills" className="tabs-with-lines__content">
              <SkillAssessmentsTab />
            </Tabs.Content>
            <Tabs.Content value="development" className="tabs-with-lines__content">
              <div className="profile-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 className="profile-section__title" style={{ margin: 0 }}>All plans</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <DsButton variant="outline" size="sm">Create Development Plan</DsButton>
                    <DsButton variant="outline" size="sm">View Recommendations</DsButton>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <StatCard
                    size="md"
                    icon="assignment"
                    label="My plans"
                    value={currentUser.id === 'csm' ? (() => { try { const s = JSON.parse(localStorage.getItem('tm:wfr-state') || '{}'); return s.state >= 4 ? 3 : 2 } catch { return 2 } })() : 2}
                    color="blue"
                  />
                  <StatCard
                    size="md"
                    icon="group"
                    label="Supporting"
                    value={0}
                    color="grey"
                  />
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: '1px solid #d9dce1', background: '#fff', fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                    Plan status <span style={{ fontSize: 10 }}>▼</span>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: '1px solid #d9dce1', background: '#fff', flex: 1, maxWidth: 240 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#94a3b8' }}>search</span>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Search Plan</span>
                  </div>
                </div>

                {/* Plans table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Plan Name</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Created By</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Roles</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Assign Date</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Updated On</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Duration (Week)</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentUser.id === 'csm' ? [
                      // AI-generated plan appears at top when assigned by manager (WFR state >= 4)
                      // Status derives from WFR state: state 5 + employee hash → Completed; state 4 → Not started
                      ...((() => { try {
                        const s = JSON.parse(localStorage.getItem('tm:wfr-state') || '{}')
                        if (s.state < 4) return []
                        const h = currentUser.name.split('').reduce((a: number, c: string) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
                        const planDone = s.state >= 5 && Math.abs(h) % 4 === 0
                        const status = planDone ? 'Completed' as const : s.state >= 5 ? 'In progress' as const : 'Not started' as const
                        return [{ name: 'AI for Customer Success', status, skills: ['AI-assisted call prep', 'Prompt Engineering'], moreSkills: 4, createdBy: 'Workforce Readiness', role: 'Customer Success Manager', assignDate: '4/10/2026', updatedOn: planDone ? '4/11/2026' : '4/10/2026', duration: 8, href: '/my-activity/dev-plan-templates/ai-powered-customer-success', aiGenerated: true }]
                      } catch { return [] } })()),
                      { name: 'Platform Reliability Fundamentals', status: 'Completed', skills: ['SRE', 'Monitoring'], moreSkills: 3, createdBy: 'Alex Nakamura', role: 'Engineering Lead', assignDate: '1/15/2026', updatedOn: '3/10/2026', duration: 8, href: '/my-activity/dev-plan-templates/platform-reliability-fundamentals' },
                      { name: 'Engineering Leadership Growth', status: 'Completed', skills: ['Leadership', 'Communication'], moreSkills: 2, createdBy: 'Alex Nakamura', role: 'Engineering Lead', assignDate: '11/1/2025', updatedOn: '1/20/2026', duration: 10, href: '/my-activity/dev-plan-templates/engineering-leadership-growth' },
                    ] : [
                      { name: 'Technical Marketing Skills', status: 'In progress', skills: ['CRM', 'Writing'], moreSkills: 6, createdBy: 'Mateo Myer', role: 'Director of Product Marketing', assignDate: '2/25/2026', updatedOn: '2/25/2026', duration: 10 },
                      { name: 'Plan for Marketing Manager', status: 'In progress', skills: ['Forecasting', 'MBA'], moreSkills: 2, createdBy: 'Mateo Myer', role: 'Marketing Manager', assignDate: '2/25/2026', updatedOn: '2/25/2026', duration: 10 },
                    ]).map((plan, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: (plan as any).aiGenerated ? '#f0f4ff' : undefined }}>
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {(plan as any).href ? (
                              <Link to={(plan as any).href} onClick={() => window.scrollTo(0, 0)} style={{ fontWeight: 600, color: 'var(--color-secondary-blue, #3b5bdb)', textDecoration: 'none' }}>{plan.name}</Link>
                            ) : (
                              <div style={{ fontWeight: 600, color: 'var(--color-secondary-blue, #3b5bdb)', cursor: 'pointer' }}>{plan.name}</div>
                            )}
                            {(plan as any).aiGenerated && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: '#6366f1', background: '#eff3ff', border: '1px solid #c5d3f8', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}><span className="material-symbols-outlined" style={{ fontSize: 11 }}>auto_awesome</span>AI generated</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: plan.status === 'Completed' ? '#22c55e' : plan.status === 'In progress' ? '#22c55e' : '#94a3b8' }} />
                            <span style={{ fontSize: 12, color: plan.status === 'Completed' ? '#15803d' : '#475569' }}>{plan.status}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 12px', color: '#475569' }}>{plan.createdBy}</td>
                        <td style={{ padding: '14px 12px', color: '#475569' }}>{plan.role}</td>
                        <td style={{ padding: '14px 12px', color: '#475569' }}>{plan.assignDate}</td>
                        <td style={{ padding: '14px 12px', color: '#475569' }}>{plan.updatedOn}</td>
                        <td style={{ padding: '14px 12px', color: '#475569' }}>{plan.duration}</td>
                        <td style={{ padding: '14px 12px' }}>
                          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>⋮</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tabs.Content>
            <Tabs.Content value="mentorship" className="tabs-with-lines__content">
              <MentorshipTab />
            </Tabs.Content>
          </TabsWithLines>
        </div>
        <footer className="profile-page__footer">
          <span>Powered by</span>
          <span>#WhatsNextForYou</span>
        </footer>
      </main>
    </div>
  )
}
