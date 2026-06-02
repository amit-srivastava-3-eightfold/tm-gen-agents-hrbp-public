/**
 * Per-role "tasks reviewed" state for the admin Roles table.
 *
 * Every role's tasks start as AI-drafted. An admin reviewing them (opening the
 * task sheet and saving, or marking reviewed) flips the role to "reviewed".
 *
 * For the demo we seed a deterministic ~2/3 of roles as already-reviewed so the
 * Tasks badge shows real variation; the rest read as "needs review". Explicit
 * marks (in-memory, this session) win over the seed. Newly-created roles are
 * never seeded, so they correctly start as needs-review.
 */

const reviewedOverrides = new Set<string>()
const listeners = new Set<() => void>()

function notify() { listeners.forEach((l) => l()) }

/** Stable key for a role across departments. */
export function roleReviewKey(deptName: string, title: string): string {
  return `${deptName}::${title}`
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Deterministic seed: ~2/3 of pre-existing roles read as reviewed. */
function seedReviewed(key: string): boolean {
  return hash(key) % 3 !== 0
}

export function isRoleReviewed(key: string): boolean {
  return reviewedOverrides.has(key) || seedReviewed(key)
}

export function markRoleReviewed(key: string): void {
  if (reviewedOverrides.has(key)) return
  reviewedOverrides.add(key)
  notify()
}

export function subscribeRoleReview(cb: () => void): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}
