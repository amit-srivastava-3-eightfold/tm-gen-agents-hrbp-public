import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { TabsWithLines } from '../components/ui/TabsWithLines'
import { NavbarApp } from '../components/Navbar'
import { useUser } from '../contexts/UserContext'
import { Button } from '../components/ui/Button'
import { Button as DsButton, ProductBackground, StatCard } from '@tonyh-2-eightfold/ef-design-system'
import { DevPlansTable, type PlanRow } from '../components/DevPlansTable'
import { WfrTaskSheetBody } from '../components/workforceReadiness/WfrTaskSheetBody'
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
  { id: 'tasks', label: 'Tasks' },
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
            <Tabs.Content value="tasks" className="tabs-with-lines__content">
              <div className="profile-section">
                <h2 className="profile-section__title" style={{ marginTop: 0, marginBottom: 8 }}>Tasks</h2>
                <p className="profile-section__text" style={{ marginBottom: 20 }}>
                  Your role tasks, classified by how AI can help — Automate, Augment, or Human-led.
                </p>
                <WfrTaskSheetBody role={{ title: currentUser.title }} viewMode="classification" />
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
                    value={currentUser.id === 'csm' ? (() => { try { const s = JSON.parse(localStorage.getItem('tm:wfr-state') || '{}'); return s.state >= 4 ? 5 : 4 } catch { return 4 } })() : 2}
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

                {/* Plans table */}
                {(() => {
                  const wfrState = (() => { try { return JSON.parse(localStorage.getItem('tm:wfr-state') || '{}') } catch { return {} } })()
                  const nameHash = currentUser.name.split('').reduce((a: number, c: string) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
                  const aiPlanDone = wfrState.state >= 5 && Math.abs(nameHash) % 4 === 0
                  const aiStatus: PlanRow['status'] = aiPlanDone ? 'Completed' : wfrState.state >= 5 ? 'In progress' : 'Not started'

                  const plans: PlanRow[] = currentUser.id === 'csm' ? [
                    ...(wfrState.state >= 4 ? [{ name: 'AI for Customer Success', status: aiStatus, createdBy: 'Workforce Readiness', role: 'Customer Success Manager', planTitle: 'Customer Success Manager', assignDate: '4/10/2026', updatedOn: aiPlanDone ? '4/11/2026' : '4/10/2026', duration: 8, aiGenerated: true, planPct: aiPlanDone ? 100 : undefined, href: '/my-activity/dev-plan-templates/ai-powered-customer-success' }] : []),
                    { name: 'Strategic Account Management', status: 'In progress', createdBy: 'Alex Nakamura', role: 'Customer Success Manager', planTitle: 'Senior Customer Success Manager', assignDate: '4/1/2026', updatedOn: '5/20/2026', duration: 10, planPct: 40, href: '/my-activity/dev-plan-templates/strategic-account-management' },
                    { name: 'Platform Reliability Fundamentals', status: 'Completed', createdBy: 'Alex Nakamura', role: 'Customer Success Manager', planTitle: 'Site Reliability Engineer', assignDate: '1/15/2026', updatedOn: '3/10/2026', duration: 8, planPct: 100, href: '/my-activity/dev-plan-templates/platform-reliability-fundamentals' },
                    { name: 'Engineering Leadership Growth', status: 'Completed', createdBy: 'Alex Nakamura', role: 'Customer Success Manager', planTitle: 'Engineering Manager', assignDate: '11/1/2025', updatedOn: '1/20/2026', duration: 10, planPct: 100, href: '/my-activity/dev-plan-templates/engineering-leadership-growth' },
                    { name: 'Data-Driven Customer Success', status: 'Completed', createdBy: 'Workforce Readiness', role: 'Customer Success Manager', planTitle: 'Customer Success Manager', assignDate: '8/5/2025', updatedOn: '10/20/2025', duration: 8, planPct: 100, href: '/my-activity/dev-plan-templates/data-driven-customer-success' },
                    { name: 'Executive Presence & Influence', status: 'Completed', createdBy: 'Alex Nakamura', role: 'Customer Success Manager', planTitle: 'Customer Success Manager', assignDate: '5/12/2025', updatedOn: '7/25/2025', duration: 6, planPct: 100, href: '/my-activity/dev-plan-templates/executive-presence-influence' },
                  ] : [
                    { name: 'Technical Marketing Skills', status: 'In progress', createdBy: 'Mateo Myer', role: 'Director of Product Marketing', planTitle: 'Director of Product Marketing', assignDate: '2/25/2026', updatedOn: '2/25/2026', duration: 10 },
                    { name: 'Plan for Marketing Manager', status: 'In progress', createdBy: 'Mateo Myer', role: 'Marketing Manager', planTitle: 'Marketing Manager', assignDate: '2/25/2026', updatedOn: '2/25/2026', duration: 10 },
                  ]

                  return <DevPlansTable plans={plans} />
                })()}

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
