import { useSyncExternalStore } from 'react'
import {
  getEmployeeTaskState,
  subscribeEmployeeTaskState,
  type EmployeeTaskState,
} from '../data/employeeTaskState'

/**
 * React hook that subscribes to one employee's persisted task state and
 * re-renders whenever it changes (including from another tab via storage
 * events when we add that, or from a sibling component in the same tab).
 */
export function useEmployeeTaskState(employeeName: string | null | undefined): EmployeeTaskState {
  const name = employeeName ?? ''
  return useSyncExternalStore(
    subscribeEmployeeTaskState,
    () => (name ? getEmployeeTaskState(name) : EMPTY),
    () => EMPTY,
  )
}

const EMPTY: EmployeeTaskState = { approved: { added: [], removed: [] }, pending: null }
