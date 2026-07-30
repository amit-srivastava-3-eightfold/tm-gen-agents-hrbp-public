import { useEffect, type ComponentProps } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { MATEO, LAURA, CHRO, CSM } from '../../contexts/demoUsers'
import { Navbar, getNavbarProductConfig } from '@tonyh-2-eightfold/ef-design-system'

type NavbarTabItem = NonNullable<ComponentProps<typeof Navbar>['tabs']>[number]

/** Shared "My career" submenu. */
const MY_CAREER_SUBITEMS = [
  { label: 'Career Interests', path: '/profile?tab=career' },
  { label: 'Career Navigator', path: '/career-navigator' },
  { label: 'Resume Coach', path: '/resume-coach' },
]

/** Shared "Marketplace" submenu. */
const MARKETPLACE_SUBITEMS = [
  { label: 'Projects', path: '/marketplace/projects' },
  { label: 'Jobs', path: '/marketplace/jobs' },
  { label: 'Courses', path: '/marketplace/courses' },
  { label: 'Development Plans', path: '/marketplace/development-plans' },
  { label: 'Nectar', path: '/marketplace/nectar' },
  { label: 'Google Drive', path: '/marketplace/google-drive' },
]

/** Career Hub navbar tabs for employee/manager. */
const CAREER_HUB_TABS: NavbarTabItem[] = [
  { id: 'home', label: 'Home', path: '/' },
  {
    id: 'my-career',
    label: 'My career',
    path: '/my-career',
    chevron: true,
    subItems: [...MY_CAREER_SUBITEMS],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    path: '/marketplace',
    chevron: true,
    subItems: [...MARKETPLACE_SUBITEMS],
  },
  { id: 'my-activity', label: 'My activity', chevron: true },
  { id: 'people', label: 'People', path: '/people' },
  { id: 'my-team', label: 'My team', path: '/my-team' },
  { id: 'workforce', label: 'Workforce Readiness', path: '/workforce' },
]

/**
 * HRBP + CHRO tab sets (previously imported from ef-design-system).
 * Kept in-app so builds don’t break when a published DS version omits these exports.
 */
const CAREER_HUB_HRBP_TABS: NavbarTabItem[] = [
  { id: 'home', label: 'Home', path: '/' },
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
  { id: 'employee-campaigns', label: 'Employee Campaigns', path: '/employee-campaigns' },
  { id: 'workforce', label: 'Workforce Readiness', path: '/workforce' },
  {
    id: 'more',
    label: 'More',
    path: '/more',
    chevron: true,
    hideViewAll: true,
    subItems: [
      { label: 'My goals', path: '/goals' },
      { label: 'Career navigator', path: '/career-navigator' },
      { label: 'Marketplace', path: '/marketplace' },
    ],
  },
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

const CAREER_HUB_EMPLOYEE_TABS: NavbarTabItem[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'my-work', label: 'My work', path: '/my-work' },
  {
    id: 'my-career',
    label: 'My career',
    path: '/my-career',
    chevron: true,
    subItems: [...MY_CAREER_SUBITEMS],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    path: '/marketplace',
    chevron: true,
    subItems: [...MARKETPLACE_SUBITEMS],
  },
  {
    id: 'my-activity',
    label: 'My activity',
    path: '/my-activity',
    chevron: true,
    subItems: [
      { label: 'My Jobs', path: '/my-activity/jobs' },
      { label: 'My Experts', path: '/my-activity/experts' },
      { label: 'My Projects', path: '/my-activity/projects' },
      { label: 'My Courses', path: '/my-activity/courses' },
      { label: 'My Referrals', path: '/my-activity/referrals' },
      { label: 'My skill assessment requests', path: '/my-activity/skill-assessments' },
      { label: 'Development Plan Templates', path: '/my-activity/dev-plan-templates' },
    ],
  },
  { id: 'people', label: 'People', path: '/people' },
]

/** Navbar variant is driven solely by the account selected in the user menu. */
const NAVBAR_TABS_BY_USER_ID: Record<string, NavbarTabItem[]> = {
  csm: CAREER_HUB_EMPLOYEE_TABS,
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
  { label: 'employee@acme.com', userId: 'csm' },
  { label: 'manager@acme.com', userId: 'mateo' },
  { label: 'hrbp@acme.com', userId: 'jaydon-torff' },
  { label: 'chro@acme.com', userId: 'chro' },
  { label: 'Components', userId: '__components__' },
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
const PERSONA_HOME: Record<string, string> = {
  mateo: '/',
  'jaydon-torff': '/',
  chro: '/',
  csm: '/',
}

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
    onSwitchUser: (userId: string) => {
      if (userId === '__components__') {
        window.location.href = '/components/wfr-hero-options'
        return
      }
      // setCurrentUser saves the user to localStorage; on WFR pages it also sets
      // window.location.href to the current WFR path. We assign window.location.href
      // AFTER so our assignment wins (browser uses the last synchronous assignment).
      setCurrentUser(USER_MAP[userId] ?? MATEO)
      window.location.href = PERSONA_HOME[userId] ?? '/'
    },
    activePath: location.pathname.startsWith('/workforce') ? '/workforce' : location.pathname,
    LinkComponent: Link,
    NavLinkComponent: NavLink,
    productName: NAVBAR_PRODUCT.productName,
    productIconSrc: PRODUCT_ICON_SRC,
  }
}

const WFR_STATE_KEY = 'tm:wfr-state'

/** TM app Navbar: the account selected in the user menu drives the navbar variant (tabs). */
export function NavbarApp() {
  const navbarProps = useNavbarProps()
  const { setCurrentUser } = useUser()

  // Clicking the Eightfold logo resets all state and navigates to CHRO home
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const logo = (e.target as HTMLElement).closest('.navbar__logo')
      if (!logo) return
      e.preventDefault()
      e.stopPropagation()
      try { localStorage.removeItem(WFR_STATE_KEY) } catch { /* ignore */ }
      setCurrentUser(CHRO)
      window.location.href = '/'
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [setCurrentUser])

  // Clicking the WFR nav tab while already on /workforce reloads the page so React
  // state resets to the persona's home view (same-path clicks don't trigger navigation)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href="/workforce"]')
      if (!link) return
      if (!window.location.pathname.startsWith('/workforce')) return
      e.preventDefault()
      e.stopPropagation()
      window.location.href = '/workforce'
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  return <Navbar {...navbarProps} />
}
