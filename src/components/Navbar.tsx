import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'

const navTabs: { id: string; label: string; chevron?: boolean; path?: string }[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'my-career', label: 'My career', chevron: true },
  { id: 'marketplace', label: 'Marketplace', chevron: true },
  { id: 'my-activity', label: 'My activity', chevron: true },
  { id: 'people', label: 'People', path: '/people' },
  { id: 'my-team', label: 'My team', path: '/my-team' },
]

const AVATAR_SRC = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <button
            type="button"
            className="navbar__menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined navbar__menu-btn-icon">menu</span>
          </button>
          <div className="navbar__branding">
            <img
              src="/eightfold-logo.svg"
              alt="Eightfold"
              className="navbar__logo"
            />
            <div className="navbar__divider" />
            <div className="navbar__product">
              <img
                src="/career-hub-icon.svg"
                alt=""
                className="navbar__product-icon"
                width={40}
                height={40}
              />
              <span className="navbar__product-name">Career Hub</span>
            </div>
          </div>
          <Tabs.Root defaultValue="home" className="navbar__tabs">
            <Tabs.List className="navbar__tabs-list">
              {navTabs.map((tab) =>
                tab.path ? (
                  <NavLink
                    key={tab.id}
                    to={tab.path}
                    className={({ isActive }) =>
                      `navbar__tab navbar__tab--link ${isActive ? 'navbar__tab--active' : ''}`
                    }
                  >
                    <span className="navbar__tab-label">
                      {tab.label}
                      {tab.chevron && (
                        <span className="material-symbols-outlined navbar__tab-chevron" aria-hidden>
                          expand_more
                        </span>
                      )}
                    </span>
                  </NavLink>
                ) : (
                  <Tabs.Trigger
                    key={tab.id}
                    value={tab.id}
                    className="navbar__tab"
                  >
                    <span className="navbar__tab-label">
                      {tab.label}
                      {tab.chevron && (
                        <span className="material-symbols-outlined navbar__tab-chevron" aria-hidden>
                          expand_more
                        </span>
                      )}
                    </span>
                  </Tabs.Trigger>
                ),
              )}
            </Tabs.List>
          </Tabs.Root>
        </div>
        <div className="navbar__right">
          <div className="navbar__search">
            <span className="material-symbols-outlined navbar__search-icon">search</span>
            <input
              type="search"
              placeholder="Type to search"
              className="navbar__search-input"
              aria-label="Search"
            />
          </div>
          <div className="navbar__divider navbar__divider--vertical" />
          <button type="button" className="navbar__btn navbar__btn--menu" aria-label="App switcher">
            <span className="material-symbols-outlined navbar__btn-icon">apps</span>
            <span className="material-symbols-outlined navbar__btn-icon navbar__btn-icon--sm">expand_more</span>
          </button>
          <Link to="/profile" className="navbar__avatar" aria-label="Mateo Myer">
            <span className="navbar__avatar-inner">
              {avatarError ? (
                'MM'
              ) : (
                <img
                  src={AVATAR_SRC}
                  alt="Mateo Myer"
                  className="navbar__avatar-img"
                  onError={() => setAvatarError(true)}
                />
              )}
            </span>
            <span className="material-symbols-outlined navbar__avatar-caret" aria-hidden>expand_more</span>
          </Link>
        </div>
      </div>

      <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="navbar__menu-overlay" />
          <Dialog.Content className="navbar__menu-drawer" aria-describedby={undefined}>
            <div className="navbar__menu-header">
              <span className="navbar__product-name">Career Hub</span>
              <Dialog.Close asChild>
                <button type="button" className="navbar__menu-close" aria-label="Close menu">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </Dialog.Close>
            </div>
            <nav className="navbar__menu-nav">
              {navTabs.map((tab) =>
                tab.path ? (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className="navbar__menu-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {tab.label}
                    {tab.chevron && (
                      <span className="material-symbols-outlined navbar__tab-chevron" aria-hidden>
                        expand_more
                      </span>
                    )}
                  </Link>
                ) : (
                  <a
                    key={tab.id}
                    href="#"
                    className="navbar__menu-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {tab.label}
                    {tab.chevron && (
                      <span className="material-symbols-outlined navbar__tab-chevron" aria-hidden>
                        expand_more
                      </span>
                    )}
                  </a>
                )
              )}
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </nav>
  )
}
