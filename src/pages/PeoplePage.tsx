import { useMemo } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { useSearchParams } from 'react-router-dom'
import { NavbarApp } from '../components/Navbar'
import { PageHeader } from '../components/PageHeader'
import { useUser } from '../contexts/UserContext'
import { PeopleProfileCard } from '../components/PeopleProfileCard'
import { SEARCH_PEOPLE_CARDS, OPEN_ROLES_PEOPLE_CARDS } from '../data/peopleData'
import type { PeopleProfileCardData } from '../components/PeopleProfileCard'
import '../components/PageHeader.css'
import './PeoplePage.css'

function getUniqueRolesFromData(cards: PeopleProfileCardData[]): { value: string; label: string }[] {
  const seen = new Set<string>()
  const roles: { value: string; label: string }[] = []
  for (const p of cards) {
    if (p.roleInterest && !seen.has(p.roleInterest)) {
      seen.add(p.roleInterest)
      roles.push({ value: p.roleInterest, label: p.roleInterest })
    }
  }
  return roles.sort((a, b) => a.label.localeCompare(b.label))
}

function filterByRole(cards: PeopleProfileCardData[], roleLabel: string): PeopleProfileCardData[] {
  if (!roleLabel) return cards
  return cards.filter((p) => p.roleInterest === roleLabel)
}

export function PeoplePage() {
  const { currentUser } = useUser()
  const isEmployee = currentUser.id === 'csm'
  const isHrbp = currentUser.id === 'jaydon-torff'
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') || 'search'
  const roleFromUrl = searchParams.get('role') ?? ''
  const validTab = ['search', 'open-roles', 'mentors', 'mentees', 'coffee', 'saved'].includes(tabFromUrl) ? tabFromUrl : 'search'

  const roleOptions = useMemo(() => getUniqueRolesFromData(OPEN_ROLES_PEOPLE_CARDS), [])
  const defaultRole = roleOptions[0]?.value ?? ''
  const validRole = roleOptions.some((r) => r.value === roleFromUrl) ? roleFromUrl : defaultRole

  const totalOpenRequisitions = OPEN_ROLES_PEOPLE_CARDS.length
  const filteredOpenRolesCards = useMemo(
    () => filterByRole(OPEN_ROLES_PEOPLE_CARDS, validRole),
    [validRole]
  )

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    if (value === 'open-roles') {
      params.set('role', validRole)
    } else {
      params.delete('role')
    }
    setSearchParams(params)
  }

  const handleRoleChange = (value: string) => {
    const role = roleOptions.some((r) => r.value === value) ? value : defaultRole
    const params = new URLSearchParams(searchParams)
    params.set('tab', 'open-roles')
    params.set('role', role)
    setSearchParams(params)
  }

  const matchRoleLabel = validRole

  return (
    <div className="people-page">
      <NavbarApp />
      <PageHeader title="People" {...(isEmployee ? { wavesVariant: 'default' as const } : isHrbp ? { hexagonsVariant: 'default' as const } : { chevronsVariant: 'default' as const })} />
      <main className="people-page__main">
        <div className="people-page__content">
          <Tabs.Root value={validTab} onValueChange={handleTabChange} className="people-page__tabs">
            <Tabs.List className="people-page__tabs-list">
              <Tabs.Trigger value="search" className="people-page__tab">
                Search
              </Tabs.Trigger>
              <Tabs.Trigger value="open-roles" className="people-page__tab">
                My open positions
                <span className="people-page__tab-badge">{totalOpenRequisitions}</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="mentors" className="people-page__tab">
                My mentors
                <span className="people-page__tab-badge">5</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="mentees" className="people-page__tab">
                My mentees
                <span className="people-page__tab-badge">2</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="coffee" className="people-page__tab">
                Coffee chats
              </Tabs.Trigger>
              <Tabs.Trigger value="saved" className="people-page__tab">
                Saved
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="search" className="people-page__tabs-content">
              <div className="people-page__search-bar">
                <div className="people-page__search-inputs">
                  <div className="people-page__search-field">
                    <span className="material-symbols-outlined people-page__search-icon" aria-hidden>person_search</span>
                    <input
                      type="search"
                      placeholder="Search people"
                      className="people-page__search-input"
                      aria-label="Search people"
                    />
                  </div>
                  <div className="people-page__search-field">
                    <span className="material-symbols-outlined people-page__search-icon" aria-hidden>location_on</span>
                    <input
                      type="search"
                      placeholder="Search by location"
                      className="people-page__search-input"
                      aria-label="Search by location"
                    />
                  </div>
                </div>
                <div className="people-page__filters">
                  <select className="people-page__filter-select" defaultValue="" aria-label="Skills">
                    <option value="">Skills</option>
                  </select>
                  <select className="people-page__filter-select" defaultValue="" aria-label="Title">
                    <option value="">Title</option>
                  </select>
                  <select className="people-page__filter-select" defaultValue="" aria-label="Work experience">
                    <option value="">Work experience</option>
                  </select>
                  <select className="people-page__filter-select" defaultValue="" aria-label="Mentoring">
                    <option value="">Mentoring</option>
                  </select>
                  <select className="people-page__filter-select" defaultValue="" aria-label="My open roles">
                    <option value="">My open roles</option>
                  </select>
                </div>
              </div>
              <div className="people-page__results-banner">
                <span className="people-page__results-count">Showing {SEARCH_PEOPLE_CARDS.length} people.</span>
              </div>
              <div className="people-page__cards">
                {SEARCH_PEOPLE_CARDS.map((person) => (
                  <PeopleProfileCard key={person.id} person={person} />
                ))}
              </div>
            </Tabs.Content>
            <Tabs.Content value="open-roles" className="people-page__tabs-content people-page__tabs-content--open-roles">
              <div className="people-page__search-bar people-page__search-bar--open-roles">
                <div className="people-page__search-inputs">
                  <div className="people-page__search-field">
                    <span className="material-symbols-outlined people-page__search-icon" aria-hidden>person_search</span>
                    <input
                      type="search"
                      placeholder="Search people"
                      className="people-page__search-input"
                      aria-label="Search people"
                    />
                  </div>
                  <label className="people-page__filter-label">
                    Role
                    <select
                      className="people-page__filter-select"
                      value={validRole}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      aria-label="Role"
                    >
                      {roleOptions.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <select className="people-page__filter-select" defaultValue="" aria-label="Skills">
                    <option value="">Skills</option>
                  </select>
                  <select className="people-page__filter-select" defaultValue="" aria-label="Title">
                    <option value="">Title</option>
                  </select>
                  <select className="people-page__filter-select" defaultValue="" aria-label="Work experience">
                    <option value="">Work experience</option>
                  </select>
                </div>
              </div>
              <div className="people-page__results-banner">
                <span className="people-page__results-count">
                  Showing {filteredOpenRolesCards.length} people for {matchRoleLabel}.
                </span>
              </div>
              <div className="people-page__cards">
                {filteredOpenRolesCards.map((person) => (
                  <PeopleProfileCard key={person.id} person={person} matchRole={matchRoleLabel} showSaveLead />
                ))}
              </div>
            </Tabs.Content>
            <Tabs.Content value="mentors" className="people-page__tabs-content">
              <p className="people-page__placeholder">My mentors content goes here.</p>
            </Tabs.Content>
            <Tabs.Content value="mentees" className="people-page__tabs-content">
              <p className="people-page__placeholder">My mentees content goes here.</p>
            </Tabs.Content>
            <Tabs.Content value="coffee" className="people-page__tabs-content">
              <p className="people-page__placeholder">Coffee chats content goes here.</p>
            </Tabs.Content>
            <Tabs.Content value="saved" className="people-page__tabs-content">
              <p className="people-page__placeholder">Saved content goes here.</p>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </main>
    </div>
  )
}
