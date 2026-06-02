/**
 * Admin-only toolbar above the Roles tab. Minimal by design — three filters
 * that directly serve the admin use cases:
 *
 *   - Search:           find a specific role by title, department, or family
 *   - Segments:         All · Needs curation · Low AI adoption
 *   - Department:       narrow to one org slice
 *   - "+ New role" CTA
 *
 * All controls use design-system primitives (Button, Select) so they stay
 * consistent with the rest of the app and inherit future DS updates.
 */
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tonyh-2-eightfold/ef-design-system'

export type RolesAdminSegment = 'all' | 'low-adoption'

export interface RolesAdminFilter {
  search: string
  segment: RolesAdminSegment
  department: string | null
}

export const EMPTY_ROLES_ADMIN_FILTER: RolesAdminFilter = {
  search: '',
  segment: 'all',
  department: null,
}

const SEGMENT_META: { id: RolesAdminSegment; label: string }[] = [
  { id: 'all',          label: 'All' },
  { id: 'low-adoption', label: 'Low AI adoption' },
]

const ANY_DEPT = '__any__'

interface Props {
  value: RolesAdminFilter
  onChange: (next: RolesAdminFilter) => void
  departments: string[]
  resultCount: number
  totalCount: number
  onNewRole: () => void
}

export function RolesAdminToolbar({
  value,
  onChange,
  departments,
  resultCount,
  totalCount,
  onNewRole,
}: Props) {
  const filtered = resultCount !== totalCount
  function patch(p: Partial<RolesAdminFilter>) { onChange({ ...value, ...p }) }
  function clearAll() { onChange(EMPTY_ROLES_ADMIN_FILTER) }
  const anyActive = value.search.length > 0 || value.segment !== 'all' || value.department != null

  return (
    <div className="wfr-roles-admin">
      {/* Row 1: search + dept dropdown + result count + New role CTA */}
      <div className="wfr-roles-admin__row">
        <div className="wfr-roles-admin__search">
          <span className="material-symbols-outlined wfr-roles-admin__search-icon" aria-hidden>search</span>
          <input
            type="text"
            value={value.search}
            onChange={(e) => patch({ search: e.target.value })}
            placeholder="Search roles or departments…"
            className="wfr-roles-admin__search-input"
            aria-label="Search roles"
          />
          {value.search && (
            <button
              type="button"
              onClick={() => patch({ search: '' })}
              className="wfr-roles-admin__search-clear"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        <Select
          value={value.department ?? ANY_DEPT}
          onValueChange={(v: string) => patch({ department: v === ANY_DEPT ? null : v })}
        >
          <SelectTrigger variant="outline" size="sm" className="wfr-roles-admin__dept-trigger" aria-label="Filter by department">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_DEPT}>All departments</SelectItem>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <span className="wfr-roles-admin__count">
          {filtered ? `${resultCount} of ${totalCount} roles` : `${totalCount} roles`}
        </span>

        {anyActive && (
          <Button type="button" variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
        )}

        <span style={{ flex: 1 }} />

        <Button type="button" variant="primary" size="sm" onClick={onNewRole}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }} aria-hidden>add</span>
          New role
        </Button>
      </div>

      {/* Row 2: segments — Button rail with active/inactive variants */}
      <div className="wfr-roles-admin__segments">
        {SEGMENT_META.map((seg) => {
          const active = value.segment === seg.id
          return (
            <Button
              key={seg.id}
              type="button"
              variant={active ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => patch({ segment: seg.id })}
              aria-pressed={active}
              className={`wfr-roles-admin__segment${active ? ' is-active' : ''}`}
            >
              {seg.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
