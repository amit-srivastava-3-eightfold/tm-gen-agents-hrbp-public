import { useParams, Navigate } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/ui/Button'
import { OpenTo } from '../components/OpenTo'
import { MentorshipCard } from '../components/MentorshipCard'
import { SkillsCard } from '../components/SkillsCard'
import { HighlightsCard } from '../components/HighlightsCard'
import { StandardHighlightsCard } from '../components/StandardHighlightsCard'
import { OrganizationCard } from '../components/OrganizationCard'
import { getPersonById } from '../data/peopleData'
import '../components/ui/Button.css'
import '../components/Navbar.css'
import '../components/MentorshipCard.css'
import '../components/SkillsCard.css'
import '../components/HighlightsCard.css'
import '../components/StandardHighlightsCard.css'
import '../components/OrganizationCard.css'
import './ProfilePage.css'

const profileTabs = [
  { id: 'experience', label: 'Experience' },
  { id: 'mentorship', label: 'Mentorship' },
]

export function PeopleProfilePage() {
  const { id } = useParams<{ id: string }>()
  const person = id ? getPersonById(id) : undefined

  if (!person) {
    return <Navigate to="/people" replace />
  }

  const avatarSrc = person.avatarType === 'photo' && person.avatarPhotoSrc
    ? person.avatarPhotoSrc.replace('w=80&h=80', 'w=200&h=200')
    : undefined

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
                        {person.hasRequestButton && (
                          <Button variant="primary">
                            <span className="material-symbols-outlined">handshake</span>
                            Request
                          </Button>
                        )}
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
            <Tabs.Content value="mentorship" className="profile-tabs__content">
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
