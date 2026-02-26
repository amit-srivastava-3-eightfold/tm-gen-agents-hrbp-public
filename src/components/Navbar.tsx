import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tabs from '@radix-ui/react-tabs'
import { useUser, MATEO, LAURA } from '../contexts/UserContext'

const navTabs: { id: string; label: string; chevron?: boolean; path?: string }[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'my-career', label: 'My career', chevron: true },
  { id: 'marketplace', label: 'Marketplace', chevron: true },
  { id: 'my-activity', label: 'My activity', chevron: true },
  { id: 'people', label: 'People', path: '/people' },
  { id: 'my-team', label: 'My team', path: '/my-team' },
]

const AVATAR_MENU_ITEMS = [
  { label: 'My Profile', path: '/profile' },
  { label: 'Career Interests', path: '/profile?tab=career' },
  { label: 'Skill and Performance', path: '/profile?tab=skills' },
  { label: 'Development Plans', path: '/profile?tab=development' },
  { label: 'Settings', path: '#' },
  { label: 'Logout', path: '#' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const { currentUser, setCurrentUser } = useUser()
  const location = useLocation()
  const isOnProfile = location.pathname === '/profile'

  const avatarSrc = currentUser.avatarType === 'photo' && currentUser.avatarPhotoSrc
    ? currentUser.avatarPhotoSrc.replace('w=200&h=200', 'w=80&h=80')
    : null

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
          <Link to="/" className="navbar__branding">
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
          </Link>
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="navbar__avatar" aria-label="Open profile menu">
                <span className="navbar__avatar-inner" style={currentUser.avatarColor ? { background: currentUser.avatarColor } : undefined}>
                  {avatarError || !avatarSrc ? (
                    currentUser.avatarInitials ?? 'MM'
                  ) : (
                    <img
                      src={avatarSrc}
                      alt={currentUser.name}
                      className="navbar__avatar-img"
                      onError={() => setAvatarError(true)}
                    />
                  )}
                </span>
                <span className="material-symbols-outlined navbar__avatar-caret" aria-hidden>expand_more</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="navbar__avatar-menu" align="end" sideOffset={8}>
                <div className="navbar__avatar-menu-inner">
                {AVATAR_MENU_ITEMS.map((item) => (
                  <DropdownMenu.Item key={item.label} asChild>
                    <Link
                      to={item.path}
                      className={`navbar__avatar-menu-item ${item.label === 'My Profile' && isOnProfile ? 'navbar__avatar-menu-item--active' : ''}`}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenu.Item>
                ))}
                <div className="navbar__avatar-menu-divider" />
                <div className="navbar__avatar-menu-switch">
                  <input
                    type="text"
                    placeholder="Switch To..."
                    className="navbar__avatar-menu-input"
                    aria-label="Switch to"
                  />
                  <DropdownMenu.Item asChild>
                    <button
                      type="button"
                      className="navbar__avatar-menu-option"
                      onClick={() => setCurrentUser(MATEO)}
                    >
                      manager@acme.com
                    </button>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <button
                      type="button"
                      className="navbar__avatar-menu-option"
                      onClick={() => setCurrentUser(LAURA)}
                    >
                      hrbp@acme.com
                    </button>
                  </DropdownMenu.Item>
                </div>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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
