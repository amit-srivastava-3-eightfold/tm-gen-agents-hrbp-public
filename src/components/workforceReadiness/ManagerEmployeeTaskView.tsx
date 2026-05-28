/**
 * Manager-facing render of one employee's tasks inside a task sheet.
 *
 * Composes the pending-approval panel with the standard WfrTaskSheetBody so
 * managers see the same visual treatment used in the showcase Manager view.
 * Layers any direct manager edits (mgrEmpAdded / mgrEmpRemoved) on top of the
 * employee's approved + pending state.
 */
import { useEmployeeTaskState } from '../../hooks/useEmployeeTaskState'
import { EmployeePendingPanel } from './EmployeePendingPanel'
import { WfrTaskSheetBody, type DemoPhase } from './WfrTaskSheetBody'

interface Props {
  employeeName: string
  role: { title: string; dept?: string }
  phase: DemoPhase
  viewMode?: 'all' | 'classification' | 'source'
  /** Show removed tasks as "Not included" instead of hiding them. */
  diffMode?: boolean
  /** Manager's direct edits stored outside the pending workflow. */
  mgrEmpAdded?: { task: string; score: number; description?: string }[]
  mgrEmpRemoved?: Set<string>
  mgrEditing?: boolean
  onMgrRemove?: (taskName: string) => void
  onRestore?: (taskName: string) => void
}

export function ManagerEmployeeTaskView({
  employeeName,
  role,
  phase,
  viewMode = 'classification',
  diffMode,
  mgrEmpAdded = [],
  mgrEmpRemoved,
  mgrEditing = false,
  onMgrRemove,
  onRestore,
}: Props) {
  const state = useEmployeeTaskState(employeeName)
  const approvedAdded = state.approved.added
  const approvedRemoved = state.approved.removed
  const pendingAdded = state.pending?.added ?? []
  const pendingRemoved = state.pending?.removed ?? []

  // Merge approved + pending + manager direct adds (dedupe by task name)
  const adminAddedMap = new Map<string, { task: string; score: number; description?: string }>()
  for (const t of approvedAdded) adminAddedMap.set(t.task, t)
  for (const t of pendingAdded) adminAddedMap.set(t.task, t)
  for (const t of mgrEmpAdded) adminAddedMap.set(t.task, t)
  const adminAdded = Array.from(adminAddedMap.values())

  // Tasks fully excluded from the list: approved removals + manager direct removals
  const adminRemoved = new Set<string>([
    ...approvedRemoved,
    ...(mgrEmpRemoved ?? []),
  ])

  // Tasks shown with strikethrough (still in the list, marked for review)
  const strikethroughSet = new Set<string>(pendingRemoved)

  // Tasks highlighted as added (recently changed)
  const draftAddedNames = new Set<string>([
    ...pendingAdded.map(t => t.task),
    ...mgrEmpAdded.map(t => t.task),
  ])

  return (
    <>
      <EmployeePendingPanel employeeName={employeeName} />
      <WfrTaskSheetBody
        role={role}
        phase={phase}
        viewMode={viewMode}
        diffMode={diffMode}
        adminEditing={mgrEditing}
        adminAdded={adminAdded}
        adminRemoved={adminRemoved}
        pendingRemoved={strikethroughSet}
        draftAddedNames={draftAddedNames}
        onAdminRemove={onMgrRemove}
        onRestore={onRestore}
      />
    </>
  )
}
