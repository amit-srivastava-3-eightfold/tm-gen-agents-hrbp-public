import { Link, NavLink, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { MATEO, LAURA, CHRO } from '../../contexts/demoUsers'
import {
  Navbar,
  getNavbarProductConfig,
  TALENT_ACQUISITION_RECRUITER_TABS,
} from '@tonyh-2-eightfold/ef-design-system'

/** Career Hub navbar tabs for employee/manager (and HRBP). */
const CAREER_HUB_TABS = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'my-career', label: 'My career', chevron: true },
  { id: 'marketplace', label: 'Marketplace', chevron: true },
  { id: 'my-activity', label: 'My activity', chevron: true },
  { id: 'people', label: 'People', path: '/people' },
  { id: 'my-team', label: 'My team', path: '/my-team' },
]

/** Navbar variant is driven solely by the account selected in the user menu. */
const NAVBAR_TABS_BY_USER_ID: Record<string, typeof CAREER_HUB_TABS | typeof TALENT_ACQUISITION_RECRUITER_TABS> = {
  mateo: CAREER_HUB_TABS,
  'laura-shah': CAREER_HUB_TABS,
  chro: TALENT_ACQUISITION_RECRUITER_TABS,
}

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
  { label: 'chro@acme.com', userId: 'chro' },
]

const USER_MAP: Record<string, typeof MATEO | typeof LAURA | typeof CHRO> = {
  mateo: MATEO,
  'laura-shah': LAURA,
  chro: CHRO,
}

/** DS Career Hub navbar variant: product name and icon for all of TM. */
const NAVBAR_PRODUCT = getNavbarProductConfig('career-hub', 'medium')
const PRODUCT_ICON_SRC = '/career-hub-icon.svg' // app serves this; DS default path

/** TM app Navbar: the account selected in the user menu drives the navbar variant (tabs). */
export function NavbarApp() {
  const { currentUser, setCurrentUser } = useUser()
  const location = useLocation()
  const tabs = NAVBAR_TABS_BY_USER_ID[currentUser.id] ?? CAREER_HUB_TABS

  return (
    <Navbar
      tabs={tabs}
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
      productName={NAVBAR_PRODUCT.productName}
      productIconSrc={PRODUCT_ICON_SRC}
    />
  )
}
