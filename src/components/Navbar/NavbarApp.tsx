import { Link, NavLink, useLocation } from 'react-router-dom'
import { useUser, MATEO, LAURA } from '../../contexts/UserContext'
import { Navbar } from '@tonyh-2-eightfold/ef-design-system'

const NAV_TABS = [
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

const SWITCH_OPTIONS = [
  { label: 'manager@acme.com', userId: 'mateo' },
  { label: 'hrbp@acme.com', userId: 'laura-shah' },
]

const USER_MAP: Record<string, typeof MATEO | typeof LAURA> = {
  mateo: MATEO,
  'laura-shah': LAURA,
}

/** TM app Navbar wired to UserContext and React Router */
export function NavbarApp() {
  const { currentUser, setCurrentUser } = useUser()
  const location = useLocation()

  return (
    <Navbar
      tabs={NAV_TABS}
      avatarMenuItems={AVATAR_MENU_ITEMS}
      user={{
        name: currentUser.name,
        avatarType: currentUser.avatarType,
        avatarPhotoSrc: currentUser.avatarPhotoSrc,
        avatarInitials: currentUser.avatarInitials,
        avatarColor: currentUser.avatarColor,
      }}
      switchOptions={SWITCH_OPTIONS}
      onSwitchUser={(userId: string) => setCurrentUser(USER_MAP[userId] ?? MATEO)}
      activePath={location.pathname}
      LinkComponent={Link}
      NavLinkComponent={NavLink}
    />
  )
}
