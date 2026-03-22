/** Inline collection status data table — shows per-department data collection progress. */
import { useMemo } from 'react'
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
} from '@tonyh-2-eightfold/ef-design-system'
import {
  ORG,
  wfrDemoDeptResponseRate,
  type Dept,
} from '../../data/wfrOrgData'
import {
  barColor,
  deptCollectionRowDemo,
  activityLabel,
} from './collectionHelpers'
import './CollectionProgressPanel.css'

export interface CollectionProgressPanelProps {
  /** Limit to these department names (from launch scope). Null = all. */
  scopedDepartmentNames?: string[] | null
  /** When set, show single-department view. */
  scopeDepartment?: Dept | null
}

export function CollectionProgressPanel({
  scopedDepartmentNames = null,
  scopeDepartment = null,
}: CollectionProgressPanelProps) {
  const isDeptScope = scopeDepartment != null

  const deptRows = useMemo(() => {
    if (isDeptScope) {
      return [{ name: scopeDepartment.name, employees: scopeDepartment.employees, rate: wfrDemoDeptResponseRate(scopeDepartment.name) }]
    }
    const filterSet = scopedDepartmentNames?.length ? new Set(scopedDepartmentNames) : null
    const depts = filterSet ? ORG.departments.filter((d) => filterSet.has(d.name)) : ORG.departments
    return depts
      .map((d) => ({ name: d.name, employees: d.employees, rate: wfrDemoDeptResponseRate(d.name) }))
      .sort((a, b) => a.rate - b.rate)
  }, [isDeptScope, scopeDepartment, scopedDepartmentNames])

  return (
    <DataTable>
      <DataTableHeader>
        <DataTableRow>
          <DataTableHead>Department</DataTableHead>
          <DataTableHead>HRBP</DataTableHead>
          <DataTableHead align="right">Employees</DataTableHead>
          <DataTableHead>Channels</DataTableHead>
          <DataTableHead metric>Progress</DataTableHead>
          <DataTableHead>Last updated</DataTableHead>
          <DataTableHead shrink>Actions</DataTableHead>
        </DataTableRow>
      </DataTableHeader>
      <DataTableBody>
        {deptRows.map((row) => {
          const meta = deptCollectionRowDemo(row.name)
          const low = row.rate < 20
          const c = barColor(row.rate)
          const showNudge = low
          const showRemind = !low && row.rate < 100
          return (
            <DataTableRow key={row.name} variant={low ? 'warn' : 'default'}>
              <DataTableCell className="font-semibold">
                {row.name}
                {low ? <span className="wfr-coll-table__badge">Needs attention</span> : null}
              </DataTableCell>
              <DataTableCell className="text-[#475569]">{meta.manager}</DataTableCell>
              <DataTableCell align="right" numeric>{row.employees.toLocaleString()}</DataTableCell>
              <DataTableCell>
                <span className="wfr-coll-table__channels">
                  <span aria-hidden>{meta.activeChannelCount === 1 ? '\u270f\ufe0f' : '\u270f\ufe0f \ud83d\udccb'}</span>
                  {meta.activeChannelCount}
                </span>
              </DataTableCell>
              <DataTableCell metric>
                <div className="wfr-coll-table__progress">
                  <div className="wfr-coll-table__track" aria-hidden>
                    <div className="wfr-coll-table__fill" style={{ width: `${row.rate}%`, background: c }} />
                  </div>
                  <span className="wfr-coll-table__pct tabular-nums" style={{ color: c }}>
                    {row.rate}%
                  </span>
                </div>
              </DataTableCell>
              <DataTableCell className="text-[#94a3b8] text-[13px]">{activityLabel(row.name)}</DataTableCell>
              <DataTableCell>
                {showNudge ? (
                  <button type="button" className="wfr-coll-table__action-btn wfr-coll-table__action-btn--nudge">
                    Nudge
                  </button>
                ) : null}
                {showRemind ? (
                  <button type="button" className="wfr-coll-table__action-btn wfr-coll-table__action-btn--remind">
                    Remind
                  </button>
                ) : null}
              </DataTableCell>
            </DataTableRow>
          )
        })}
      </DataTableBody>
    </DataTable>
  )
}
