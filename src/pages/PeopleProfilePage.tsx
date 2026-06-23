import { useState, useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import * as Tabs from '@radix-ui/react-tabs'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { TabsWithLines } from '../components/ui/TabsWithLines'
import { NavbarApp } from '../components/Navbar'
import { Button } from '../components/ui/Button'
import { OpenTo } from '../components/OpenTo'
import { MentorshipCard } from '../components/MentorshipCard'
import { AboutCard } from '../components/AboutCard'
import { SkillsCard } from '../components/SkillsCard'
import { WorkExperienceCard } from '../components/WorkExperienceCard'
import { EducationCard } from '../components/EducationCard'
import { MentoringCard } from '../components/MentoringCard'
import { ProjectsCard } from '../components/ProjectsCard'
import { SkillAssessmentsTab } from '../components/SkillAssessmentsTab'
import { DevPlansTable, type PlanRow } from '../components/DevPlansTable'
import { HighlightsCard } from '../components/HighlightsCard'
import { StandardHighlightsCard } from '../components/StandardHighlightsCard'
import { OrganizationCard } from '../components/OrganizationCard'
import { MobilityCard } from '../components/MobilityCard'
import { CareerNavigator } from '../components/CareerNavigator'
import { CareerInterestsSidebar } from '../components/CareerInterestsSidebar'
import { getPersonById, getAboutText } from '../data/peopleData'
import { getCareerPathForPerson, getCareerInterestsForSidebar } from '../data/careerInterestsData'
import '../components/MentorshipCard.css'
import '../components/SkillsCard.css'
import '../components/HighlightsCard.css'
import '../components/StandardHighlightsCard.css'
import '../components/OrganizationCard.css'
import './ProfilePage.css'

const ALL_VIEW_OPTIONS = [
  { id: 'own', label: 'Own view' },
  { id: 'hrbp', label: 'HRBP view' },
  { id: 'manager', label: 'Manager view' },
  { id: 'public', label: 'Public view' },
]

const MANAGER_VIEW_OPTIONS = [
  { id: 'manager', label: 'Manager view' },
  { id: 'public', label: 'Public view' },
]

const PUBLIC_ONLY_VIEW_OPTIONS = [
  { id: 'public', label: 'Public view' },
]

const HRBP_MANAGER_TABS = [
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills and performance' },
  { id: 'development', label: 'Development plans' },
  { id: 'career-interest', label: 'Career navigator' },
  { id: 'mentorship', label: 'Mentorship' },
]

const PUBLIC_TABS = [
  { id: 'experience', label: 'Experience' },
  { id: 'mentorship', label: 'Mentorship' },
]

export function PeopleProfilePage() {
  const { currentUser } = useUser()
  const { id } = useParams<{ id: string }>()
  const person = id ? getPersonById(id) : undefined

  const isMateo = currentUser.id === 'mateo' || currentUser.name === 'Mateo Myer'
  const isOnMateosTeam = person?.manager === 'Mateo Myer'

  const { viewOptions, defaultView } = useMemo(() => {
    if (isMateo) {
      if (isOnMateosTeam) {
        return { viewOptions: MANAGER_VIEW_OPTIONS, defaultView: 'manager' as const }
      }
      return { viewOptions: PUBLIC_ONLY_VIEW_OPTIONS, defaultView: 'public' as const }
    }
    return { viewOptions: ALL_VIEW_OPTIONS, defaultView: 'hrbp' as const }
  }, [isMateo, isOnMateosTeam])

  if (!person) {
    return <Navigate to="/people" replace />
  }

  return (
    <PeopleProfileContent
      key={id}
      person={person}
      defaultView={defaultView}
      viewOptions={viewOptions}
    />
  )
}

function PeopleProfileContent({
  person,
  defaultView,
  viewOptions,
}: {
  person: NonNullable<ReturnType<typeof getPersonById>>
  defaultView: string
  viewOptions: { id: string; label: string }[]
}) {
  const [view, setView] = useState<string>(defaultView)

  const avatarSrc = person.avatarType === 'photo' && person.avatarPhotoSrc
    ? person.avatarPhotoSrc.replace('w=80&h=80', 'w=200&h=200')
    : undefined

  const profileTabs = (view === 'hrbp' || view === 'manager') ? HRBP_MANAGER_TABS : PUBLIC_TABS

  return (
    <div className="profile-page">
      <div className="profile-page__cover" aria-hidden />
      <div className="profile-page__cover-fade" aria-hidden />
      <header className="profile-page__header">
        <NavbarApp />
      </header>
      <main className="profile-page__main">
        <div className="profile-page__content-zone">
          <div className="profile-page__content grid grid-cols-12 gap-6">
            <div className="profile-page__card-row col-span-12 grid grid-cols-12 gap-6">
              <div className="profile-hero col-span-4">
                <div className="profile-hero__avatar-wrap">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" className="profile-hero__avatar" />
                  ) : (
                    <div
                      className="profile-hero__avatar profile-hero__avatar--initials"
                      style={person.avatarColor ? { background: person.avatarColor } : undefined}
                    >
                      {person.avatarInitials}
                    </div>
                  )}
                </div>
                <div className="profile-hero__card">
                  <div className="profile-hero__info">
                    <div className="profile-hero__name-row">
                      <h1 className="profile-hero__name">{person.name}</h1>
                    </div>
                    <p className="profile-hero__title">{person.title}</p>
                    <p className="profile-hero__meta">
                      <span className="material-symbols-outlined profile-hero__icon">location_on</span>
                      {person.location}
                    </p>
                    <div className="profile-hero__actions">
                      <div className="profile-hero__actions-inner">
                        <Button variant="ghost" className="profile-hero__ai-btn" aria-label="AI assistant">
                          <span className="material-symbols-outlined">auto_awesome</span>
                        </Button>
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
                      <OpenTo items={person.openToIcons} labelAsButton={false} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="profile-page__banner-actions col-span-8 flex justify-end items-center gap-2">
                {viewOptions.length > 1 && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button type="button" className="profile-page__view-btn" aria-label="Select view">
                        <span className="profile-page__view-label">{viewOptions.find((o) => o.id === view)?.label ?? viewOptions[0]?.label}</span>
                        <span className="material-symbols-outlined profile-page__view-chevron">expand_more</span>
                      </button>
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
                )}
              </div>
            </div>
          </div>
          <div className="profile-page__divider" />
        </div>
        <div className="profile-page__content profile-page__content--tabs grid grid-cols-12 gap-6">
          <TabsWithLines key={view} tabs={profileTabs} defaultValue="experience" className="col-span-12">
            <Tabs.Content value="experience" className="tabs-with-lines__content">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 flex flex-col gap-6">
                  <AboutCard text={getAboutText(person)} readOnly />
                  <SkillsCard personId={person.id} />
                  <MobilityCard
                    relocateValue={person.mobilityPreference}
                    travelValue={person.flexibilityToTravel}
                  />
                  <WorkExperienceCard personId={person.id} />
                  <EducationCard personId={person.id} />
                  <MentoringCard />
                  <ProjectsCard personId={person.id} />
                </div>
                <div className="col-span-4 flex flex-col gap-6">
                  <HighlightsCard
                    matchRole="Senior Sales Engineer"
                    matchScore={person.matchScore}
                    roleInterest={person.roleInterest}
                    insights={person.insights}
                    hireDate={person.hireDate}
                    timeInCurrentPosition={person.timeInCurrentPosition}
                    businessUnit={person.businessUnit}
                    mobilityPreference={person.mobilityPreference}
                    eligibleForInternalMobility={person.eligibleForInternalMobility}
                  />
                  <StandardHighlightsCard />
                  <OrganizationCard />
                </div>
              </div>
            </Tabs.Content>
            {(view === 'hrbp' || view === 'manager') && (
              <>
                <Tabs.Content value="skills" className="tabs-with-lines__content">
                  <SkillAssessmentsTab personId={person.id} />
                </Tabs.Content>
                <Tabs.Content value="development" className="tabs-with-lines__content">
                  <div className="profile-section">
                    {(() => {
                      const firstName = person.name.split(' ')[0]
                      const roleName = person.title.split('•')[0].trim()
                      const devPlans: PlanRow[] = [
                        { name: `Plan for ${roleName}`, status: 'In progress', createdBy: person.name, role: roleName, planTitle: roleName, assignDate: '2/23/2026', updatedOn: '5/26/2026', duration: 10 },
                        { name: `${firstName}'s Onboarding Plan`, status: 'Not started', createdBy: person.name, role: '', planTitle: '', assignDate: '1/29/2026', updatedOn: '2/2/2026', duration: 4 },
                        { name: 'Career Plan', status: 'Not started', createdBy: person.name, role: 'Lead Solutions Architect - SE', planTitle: '', assignDate: '10/30/2025', updatedOn: '10/31/2025', duration: 26 },
                        { name: 'Onboarding Week 1 Schedule', status: 'Not started', createdBy: person.name, role: roleName, planTitle: '', assignDate: '6/14/2024', updatedOn: '11/23/2024', duration: 1 },
                        { name: 'Learning path for solution experts', status: 'Not started', createdBy: person.name, role: 'Solutions Architect I, [C] Solution Architect, Lead Solutions Architect', planTitle: '', assignDate: '11/10/2023', updatedOn: '11/23/2024', duration: 4 },
                      ]
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 className="profile-section__title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                              All plans
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 20, padding: '0 8px', background: '#E8E9EB', color: '#4F5666', fontSize: 12, fontWeight: 600, borderRadius: 10 }}>{devPlans.length}</span>
                            </h2>
                            <Button variant="outline" size="sm">Create Plan for {firstName}</Button>
                          </div>
                          <DevPlansTable plans={devPlans} />
                        </>
                      )
                    })()}
                  </div>
                </Tabs.Content>
                <Tabs.Content value="career-interest" className="tabs-with-lines__content">
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-8">
                      <CareerNavigator
                        data={getCareerPathForPerson(person.id, person.title, person.businessUnit, person.timeInCurrentPosition)}
                        avatarSrc={person.avatarType === 'photo' ? person.avatarPhotoSrc : undefined}
                        avatarInitials={person.avatarInitials}
                        avatarColor={person.avatarColor}
                      />
                    </div>
                    <div className="col-span-4 flex flex-col gap-6">
                      <CareerInterestsSidebar
                        roles={getCareerInterestsForSidebar(person.id, person.title, person.businessUnit)}
                      />
                    </div>
                  </div>
                </Tabs.Content>
              </>
            )}
            <Tabs.Content value="mentorship" className="tabs-with-lines__content">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <MentorshipCard />
                </div>
                <div className="col-span-4 flex flex-col gap-6">
                  <HighlightsCard
                    matchRole="Senior Sales Engineer"
                    matchScore={person.matchScore}
                    roleInterest={person.roleInterest}
                    insights={person.insights}
                    hireDate={person.hireDate}
                    timeInCurrentPosition={person.timeInCurrentPosition}
                    businessUnit={person.businessUnit}
                    mobilityPreference={person.mobilityPreference}
                    eligibleForInternalMobility={person.eligibleForInternalMobility}
                  />
                  <StandardHighlightsCard />
                  <OrganizationCard />
                </div>
              </div>
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
