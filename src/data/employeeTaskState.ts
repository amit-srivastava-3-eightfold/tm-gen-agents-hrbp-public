/**
 * Persisted employee task-edit state with a manager approval workflow.
 *
 * Data model (per employee, keyed by employee name):
 * - approved: changes the manager has accepted; these effectively belong to
 *   the employee's task list going forward.
 * - pending:  changes the employee has submitted but the manager hasn't yet
 *   acted on. The manager can Accept (→ approved), Edit (modify in place,
 *   stays pending), or Reject (discard).
 *
 * Effective task list for an employee =
 *   roleTasks(role)
 *     − approved.removed − pending.removed
 *     + approved.added   + pending.added
 *
 * Persisted to localStorage so the showcase Employee view and the manager
 * task sheets can share state across page navigation.
 */

const STORAGE_KEY = 'tm:wfr-employee-task-state'

export interface TaskEntry {
  task: string
  score: number
  description?: string
}

export interface EmployeeTaskChanges {
  added: TaskEntry[]
  removed: string[]
}

export interface PendingChanges extends EmployeeTaskChanges {
  submittedAt: number
}

export interface EmployeeTaskState {
  approved: EmployeeTaskChanges
  pending: PendingChanges | null
}

type Store = Record<string, EmployeeTaskState>

const EMPTY_CHANGES: EmployeeTaskChanges = { added: [], removed: [] }
const EMPTY_STATE: EmployeeTaskState = { approved: EMPTY_CHANGES, pending: null }

// Cache the parsed store so successive reads return the same reference until
// a write occurs. useSyncExternalStore relies on snapshot stability to avoid
// infinite re-renders.
let cachedStore: Store | null = null

function readStore(): Store {
  if (cachedStore != null) return cachedStore
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    cachedStore = raw ? (JSON.parse(raw) as Store) : {}
  } catch {
    cachedStore = {}
  }
  return cachedStore
}

function writeStore(s: Store) {
  cachedStore = s
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* swallow quota / privacy-mode errors */
  }
  listeners.forEach((l) => l())
}

const listeners = new Set<() => void>()

// Cross-tab updates: rebuild cache when another tab writes.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return
    try {
      cachedStore = e.newValue ? (JSON.parse(e.newValue) as Store) : {}
    } catch {
      cachedStore = {}
    }
    listeners.forEach((l) => l())
  })
}

/** Subscribe to any change. Returns an unsubscribe function. */
export function subscribeEmployeeTaskState(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** Read the current state for one employee. Always returns a non-null shape. */
export function getEmployeeTaskState(employeeName: string): EmployeeTaskState {
  const s = readStore()
  return s[employeeName] ?? EMPTY_STATE
}

/** Whether this employee has changes awaiting manager review. */
export function hasPendingChanges(employeeName: string): boolean {
  const p = getEmployeeTaskState(employeeName).pending
  return p != null && (p.added.length > 0 || p.removed.length > 0)
}

/** Counts pending submissions across all employees (for badge-style summaries). */
export function countEmployeesWithPendingChanges(): number {
  const s = readStore()
  let n = 0
  for (const name of Object.keys(s)) {
    const p = s[name]?.pending
    if (p && (p.added.length > 0 || p.removed.length > 0)) n++
  }
  return n
}

/** Employee submits a new batch of changes. Replaces any existing pending. */
export function submitPendingChanges(
  employeeName: string,
  changes: EmployeeTaskChanges,
): void {
  const s = readStore()
  const existing = s[employeeName] ?? EMPTY_STATE
  s[employeeName] = {
    ...existing,
    pending: {
      added: changes.added,
      removed: changes.removed,
      submittedAt: Date.now(),
    },
  }
  writeStore(s)
}

/** Employee withdraws their pending submission entirely (before manager acts). */
export function withdrawPendingChanges(employeeName: string): void {
  const s = readStore()
  if (!s[employeeName]?.pending) return
  s[employeeName] = { ...s[employeeName], pending: null }
  writeStore(s)
}

// ── Manager actions ─────────────────────────────────────────────────────────

/** Accept all pending changes in one go. */
export function acceptAllPending(employeeName: string) {
  const state = getEmployeeTaskState(employeeName)
  if (!state.pending) return
  const s = readStore()
  const approvedAdded = [
    ...state.approved.added.filter(
      (t) => !state.pending!.added.some((p) => p.task === t.task),
    ),
    ...state.pending.added,
  ]
  const approvedRemoved = Array.from(
    new Set([...state.approved.removed, ...state.pending.removed]),
  )
  s[employeeName] = {
    approved: { added: approvedAdded, removed: approvedRemoved },
    pending: null,
  }
  writeStore(s)
}

/** Reject all pending changes in one go. */
export function rejectAllPending(employeeName: string) {
  withdrawPendingChanges(employeeName)
}
