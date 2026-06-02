/**
 * Pure filter pipeline + curation-status helper for the admin Roles table.
 * Side-effect free so it's reusable and easy to reason about.
 */
import type { RolesAdminFilter } from './RolesAdminToolbar'

/** Minimum shape a row needs to be filterable. Subset of the real RoleRow. */
export interface FilterableRole {
  title: string
  dept: string
  family?: string
  employees: number
  tasks: number
  aiReadiness: number
  measuredReadiness?: number
  hrsUnlocked: number
}

/** Adoption % threshold for the "Low AI adoption" segment. */
const LOW_ADOPTION_THRESHOLD = 25

export function applyRolesAdminFilter<R extends FilterableRole>(
  roles: R[],
  filter: RolesAdminFilter,
): R[] {
  let next = roles

  // Search — case-insensitive substring across title / dept / family
  const q = filter.search.trim().toLowerCase()
  if (q) {
    next = next.filter((r) =>
      r.title.toLowerCase().includes(q) ||
      r.dept.toLowerCase().includes(q) ||
      (r.family ?? '').toLowerCase().includes(q)
    )
  }

  // Segment
  switch (filter.segment) {
    case 'low-adoption': {
      const readinessOf = (r: R) => r.measuredReadiness ?? r.aiReadiness
      next = next.filter((r) => readinessOf(r) < LOW_ADOPTION_THRESHOLD)
      break
    }
    case 'all':
    default:
      break
  }

  // Department facet
  if (filter.department) next = next.filter((r) => r.dept === filter.department)

  return next
}
