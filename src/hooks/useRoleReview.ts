import { useSyncExternalStore } from 'react'
import { isRoleReviewed, subscribeRoleReview } from '../data/roleReviewState'

/** Subscribe to one role's tasks-reviewed state. */
export function useRoleReviewed(key: string): boolean {
  return useSyncExternalStore(
    subscribeRoleReview,
    () => isRoleReviewed(key),
    () => true,
  )
}
