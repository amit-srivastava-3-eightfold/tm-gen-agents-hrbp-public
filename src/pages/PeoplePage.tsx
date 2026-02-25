import { useState, useEffect } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { useSearchParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { PageHeader } from '../components/PageHeader'
import { PeopleProfileCard } from '../components/PeopleProfileCard'
import { SEARCH_PEOPLE_CARDS, OPEN_ROLES_PEOPLE_CARDS } from '../data/peopleData'
import '../components/Navbar.css'
import '../components/PageHeader.css'
import './PeoplePage.css'

const ROLE_OPTIONS = [
  { value: 'sales-engineer', label: 'Sales Engineer' },
  { value: 'solutions-engineer', label: 'Solutions Engineer' },
  { value: 'technical-account-manager', label: 'Technical Account Manager' },
  { value: 'senior-sales-engineer', label: 'Senior Sales Engineer' },
]

export function PeoplePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') || 'search'
  const roleFromUrl = searchParams.get('role') || 'senior-sales-engineer'
  const validTab = ['search', 'open-roles', 'mentors', 'mentees', 'coffee', 'saved'].includes(tabFromUrl) ? tabFromUrl : 'search'
  const validRole = ROLE_OPTIONS.some((r) => r.value === roleFromUrl) ? roleFromUrl : 'senior-sales-engineer'

  const [activeTab, setActiveTab] = useState(validTab)
  const [selectedRole, setSelectedRole] = useState(validRole)

  useEffect(() => {
    setActiveTab(validTab)
    setSelectedRole(validRole)
  }, [validTab, validRole])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    if (value === 'open-roles') {
      params.set('role', selectedRole)
    } else {
      params.delete('role')
    }
    setSearchParams(params)
  }

  const handleRoleChange = (value: string) => {
    setSelectedRole(value)
    const params = new URLSearchParams(searchParams)
    params.set('tab', 'open-roles')
    params.set('role', value)
    setSearchParams(params)
  }

  const matchRoleLabel = ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label ?? 'Senior Sales Engineer'

  return (
    <div className="people-page">
      <Navbar />
      <PageHeader title="People" />
      <main className="people-page__main">
        <div className="people-page__content">
          <Tabs.Root value={activeTab} onValueChange={handleTabChange} className="people-page__tabs">
            <Tabs.List className="people-page__tabs-list">
              <Tabs.Trigger value="search" className="people-page__tab">
                Search
              </Tabs.Trigger>
              <Tabs.Trigger value="open-roles" className="people-page__tab">
                My open roles
                <span className="people-page__tab-badge">3</span>
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
                      value={selectedRole}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      aria-label="Role"
                    >
                      <option value="">Role</option>
                      {ROLE_OPTIONS.map((r) => (
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
                <span className="people-page__results-count">Showing {OPEN_ROLES_PEOPLE_CARDS.length} people.</span>
              </div>
              <div className="people-page__cards">
                {OPEN_ROLES_PEOPLE_CARDS.map((person) => (
                  <PeopleProfileCard key={person.id} person={person} matchRole={matchRoleLabel} />
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
