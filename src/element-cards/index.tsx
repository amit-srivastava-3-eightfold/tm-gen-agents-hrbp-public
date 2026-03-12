/**
 * Object cards – re-exported from the design system (or local fallback) for use in this app.
 *
 * PeopleObjectCard is provided locally so the app builds when the design system
 * does not export it (e.g. on Vercel). CourseObjectCard and ProjectObjectCard
 * are re-exported from the design system.
 */

export { PeopleObjectCard } from './PeopleObjectCard'
export type { PeopleObjectCardPerson, PeopleObjectCardProps } from './PeopleObjectCard'

export {
  CourseObjectCard,
  ProjectObjectCard,
} from '@tonyh-2-eightfold/ef-design-system'
