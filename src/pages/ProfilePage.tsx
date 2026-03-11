import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { TabsWithLines } from '../components/ui/TabsWithLines'
import { NavbarApp } from '../components/Navbar'
import { useUser } from '../contexts/UserContext'
import { Button } from '../components/ui/Button'
import { OpenTo } from '../components/OpenTo'
import { AboutCard } from '../components/AboutCard'
import { MentorshipCard } from '../components/MentorshipCard'
import { SkillsCard } from '../components/SkillsCard'
import { OrganizationCard } from '../components/OrganizationCard'
import { EmployeeInformationCard } from '../components/EmployeeInformationCard'
import { ContactLinksCard } from '../components/ContactLinksCard'
import { ResumesCard } from '../components/ResumesCard'
import { MobilityCard } from '../components/MobilityCard'
import { SkillGoalsCard } from '../components/SkillGoalsCard'
import { PreferencesCard } from '../components/PreferencesCard'
import '../components/AboutCard.css'
import '../components/MentorshipCard.css'
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
  const [view, setView] = useState('own')
  const { currentUser } = useUser()
  const avatarSrc = currentUser.avatarType === 'photo' && currentUser.avatarPhotoSrc
    ? currentUser.avatarPhotoSrc
    : null

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
              <button type="button" className="profile-page__settings-btn" aria-label="Settings">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button type="button" className="profile-page__view-btn" aria-label="Select view">
                    <span className="profile-page__view-label">{viewOptions.find((o) => o.id === view)?.label ?? 'Own view'}</span>
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
            </div>
            </div>
          </div>
          <div className="profile-page__divider" />
        </div>
        <div className="profile-page__content profile-page__content--tabs grid grid-cols-12 gap-6">
          <TabsWithLines tabs={profileTabs} defaultValue="experience" className="col-span-12">
            <Tabs.Content value="experience" className="tabs-with-lines__content">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 flex flex-col gap-6">
                  <AboutCard key={currentUser.id} />
                  <SkillsCard />
                  <MobilityCard
                    relocateValue={currentUser.mobilityPreference}
                    travelValue={currentUser.flexibilityToTravel}
                  />
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
              <div className="profile-section">
                <h2 className="profile-section__title">Skills and performance</h2>
                <p className="profile-section__text">Skills content goes here.</p>
              </div>
            </Tabs.Content>
            <Tabs.Content value="development" className="tabs-with-lines__content">
              <div className="profile-section">
                <h2 className="profile-section__title">Development plans</h2>
                <p className="profile-section__text">Development plans content goes here.</p>
              </div>
            </Tabs.Content>
            <Tabs.Content value="mentorship" className="tabs-with-lines__content">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <MentorshipCard />
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
