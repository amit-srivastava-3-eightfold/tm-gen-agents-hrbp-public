import type { ComponentProps } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { MATEO, LAURA, CHRO, CSM } from '../../contexts/demoUsers'
import { Navbar, getNavbarProductConfig } from '@tonyh-2-eightfold/ef-design-system'

type NavbarTabItem = NonNullable<ComponentProps<typeof Navbar>['tabs']>[number]

/** Career Hub navbar tabs for employee/manager. */
const CAREER_HUB_TABS: NavbarTabItem[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'my-career', label: 'My career', chevron: true },
  { id: 'marketplace', label: 'Marketplace', chevron: true },
  { id: 'my-activity', label: 'My activity', chevron: true },
  { id: 'people', label: 'People', path: '/people' },
  { id: 'my-team', label: 'My team', path: '/my-team' },
]

/**
 * HRBP + CHRO tab sets (previously imported from ef-design-system).
 * Kept in-app so builds don’t break when a published DS version omits these exports.
 */
const CAREER_HUB_HRBP_TABS: NavbarTabItem[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'my-goals', label: 'My goals', path: '/goals' },
  { id: 'career-navigator', label: 'Career navigator', path: '/career-navigator' },
  {
    id: 'marketplace',
    label: 'Marketplace',
    path: '/marketplace',
    chevron: true,
    subItems: [
      { label: 'Learning', path: '/marketplace/learning' },
      { label: 'Projects', path: '/marketplace/projects' },
      { label: 'Mentorship', path: '/marketplace/mentorship' },
    ],
  },
  {
    id: 'my-activity',
    label: 'My activity',
    path: '/my-activity',
    chevron: true,
    subItems: [
      { label: 'My Jobs', path: '/my-activity/jobs' },
      { label: 'My Courses', path: '/my-activity/courses' },
      { label: 'My Experts', path: '/my-activity/experts' },
      { label: 'My Projects', path: '/my-activity/projects' },
      { label: 'My Referrals', path: '/my-activity/referrals' },
      { label: 'My skill assessment requests', path: '/my-activity/skill-assessments' },
      { label: 'Development Plan Templates', path: '/my-activity/dev-plan-templates' },
    ],
  },
  { id: 'people', label: 'People', path: '/people' },
  { id: 'my-team', label: 'My team', path: '/my-team' },
  { id: 'workforce', label: 'Workforce Readiness', path: '/workforce' },
]

const CAREER_HUB_CHRO_TABS: NavbarTabItem[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'my-activity', label: 'My activity', path: '/my-activity' },
  { id: 'people', label: 'People', path: '/people' },
  { id: 'my-team', label: 'My team', path: '/my-team' },
  { id: 'workforce', label: 'Workforce Readiness', path: '/workforce' },
  { id: 'insights', label: 'Insights', path: '/insights' },
  {
    id: 'more',
    label: 'More',
    path: '/more',
    chevron: true,
    hideViewAll: true,
    subItems: [
      { label: 'Goals', path: '/goals' },
      { label: 'Career navigator', path: '/career-navigator' },
      { label: 'Marketplace', path: '/marketplace' },
    ],
  },
]

/** Navbar variant is driven solely by the account selected in the user menu. */
const NAVBAR_TABS_BY_USER_ID: Record<string, NavbarTabItem[]> = {
  mateo: CAREER_HUB_TABS,
  'jaydon-torff': CAREER_HUB_HRBP_TABS,
  chro: CAREER_HUB_CHRO_TABS,
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
  { label: 'csm@acme.com', userId: 'csm' },
  { label: 'manager@acme.com', userId: 'mateo' },
  { label: 'hrbp@acme.com', userId: 'jaydon-torff' },
  { label: 'chro@acme.com', userId: 'chro' },
]

const USER_MAP: Record<string, typeof MATEO | typeof LAURA | typeof CHRO | typeof CSM> = {
  mateo: MATEO,
  'jaydon-torff': LAURA,
  chro: CHRO,
  csm: CSM,
}

/** DS Career Hub navbar variant: product name and icon for all of TM. */
const NAVBAR_PRODUCT = getNavbarProductConfig('career-hub', 'medium')
const PRODUCT_ICON_SRC = '/career-hub-icon.svg' // app serves this; DS default path

/** Returns the NavbarProps for the current user — use with CareerHubShell or standalone Navbar. */
export function useNavbarProps() {
  const { currentUser, setCurrentUser } = useUser()
  const location = useLocation()
  const tabs = NAVBAR_TABS_BY_USER_ID[currentUser.id] ?? CAREER_HUB_TABS

  return {
    tabs,
    avatarMenuItems: AVATAR_MENU_ITEMS,
    user: {
      name: currentUser.name,
      avatarType: currentUser.avatarType as 'photo' | 'initials',
      avatarPhotoSrc: currentUser.avatarPhotoSrc,
      avatarInitials: currentUser.avatarInitials,
      avatarColor: currentUser.avatarColor,
    },
    switchOptions: SWITCH_OPTIONS,
    onSwitchUser: (userId: string) => setCurrentUser(USER_MAP[userId] ?? MATEO),
    activePath: location.pathname,
    LinkComponent: Link,
    NavLinkComponent: NavLink,
    productName: NAVBAR_PRODUCT.productName,
    productIconSrc: PRODUCT_ICON_SRC,
  }
}

/** TM app Navbar: the account selected in the user menu drives the navbar variant (tabs). */
export function NavbarApp() {
  const navbarProps = useNavbarProps()
  return <Navbar {...navbarProps} />
}
