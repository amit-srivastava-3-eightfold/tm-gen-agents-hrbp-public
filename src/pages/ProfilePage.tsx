import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/ui/Button'
import { OpenTo } from '../components/OpenTo'
import { MentorshipCard } from '../components/MentorshipCard'
import { SkillsCard } from '../components/SkillsCard'
import { OrganizationCard } from '../components/OrganizationCard'
import '../components/ui/Button.css'
import '../components/Navbar.css'
import '../components/MentorshipCard.css'
import '../components/SkillsCard.css'
import '../components/OrganizationCard.css'
import './ProfilePage.css'

const AVATAR_SRC = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'

const viewOptions = [
  { id: 'hrbp', label: 'HRBP view' },
  { id: 'public', label: 'Public view' },
]

const profileTabs = [
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills and performance' },
  { id: 'development', label: 'Development plans' },
]

export function ProfilePage() {
  const [view, setView] = useState('public')

  return (
    <div className="profile-page">
      <div className="profile-page__cover" aria-hidden />
      <div className="profile-page__cover-fade" aria-hidden />
      <header className="profile-page__header">
        <Navbar />
      </header>
      <main className="profile-page__main">
        <div className="profile-page__content-zone">
          <div className="profile-page__content grid grid-cols-12 gap-6">
            <div className="profile-page__card-row col-span-12 grid grid-cols-12 gap-6">
            <div className="profile-hero col-span-4">
              <div className="profile-hero__avatar-wrap">
                <img
                  src={AVATAR_SRC}
                  alt="Mateo Myer"
                  className="profile-hero__avatar"
                />
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
                    <h1 className="profile-hero__name">Mateo Myer</h1>
                  </div>
                  <p className="profile-hero__title">Sales Engineering Manager</p>
                  <p className="profile-hero__meta">
                    <span className="profile-hero__pronouns">He/Him/His</span>
                    <span className="profile-hero__meta-sep">·</span>
                    <span className="material-symbols-outlined profile-hero__icon">schedule</span>
                    <span className="material-symbols-outlined profile-hero__icon">location_on</span>
                    Santa Clara, CA
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
            <div className="profile-page__banner-actions col-span-8 flex justify-end">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button type="button" className="profile-page__view-btn" aria-label="Select view">
                    <span className="profile-page__view-label">{viewOptions.find((o) => o.id === view)?.label ?? 'Public view'}</span>
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
          <Tabs.Root defaultValue="experience" className="profile-tabs col-span-12">
            <Tabs.List className="profile-tabs__list">
              {profileTabs.map((tab) => (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className="profile-tabs__trigger"
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value="experience" className="profile-tabs__content">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <SkillsCard />
                </div>
                <div className="col-span-4 flex flex-col gap-6">
                  <MentorshipCard />
                  <OrganizationCard />
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content value="skills" className="profile-tabs__content">
              <div className="profile-section">
                <h2 className="profile-section__title">Skills and performance</h2>
                <p className="profile-section__text">Skills content goes here.</p>
              </div>
            </Tabs.Content>
            <Tabs.Content value="development" className="profile-tabs__content">
              <div className="profile-section">
                <h2 className="profile-section__title">Development plans</h2>
                <p className="profile-section__text">Development plans content goes here.</p>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
        <footer className="profile-page__footer">
          <span>Powered by</span>
          <span>#WhatsNextForYou</span>
        </footer>
      </main>
    </div>
  )
}
