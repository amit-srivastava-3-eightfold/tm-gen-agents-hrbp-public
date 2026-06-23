import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@tonyh-2-eightfold/ef-design-system'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/Select'

export type PlanRow = {
  name: string
  status: 'Completed' | 'In progress' | 'Not started'
  createdBy: string
  role: string
  planTitle: string
  assignDate: string
  updatedOn: string
  duration: number
  aiGenerated?: boolean
  planPct?: number
  href?: string
}

/** Plan-status filter + searchable table of development plans. Shared by own profile and people profiles. */
export function DevPlansTable({ plans }: { plans: PlanRow[] }) {
  const navigate = useNavigate()
  const [hoveredPlanRow, setHoveredPlanRow] = useState<number | null>(null)
  const [planStatusFilter, setPlanStatusFilter] = useState('all')
  const [planSearch, setPlanSearch] = useState('')

  const filteredPlans = plans.filter((plan) => {
    const matchesStatus = planStatusFilter === 'all' || plan.status === planStatusFilter
    const matchesSearch = !planSearch || plan.name.toLowerCase().includes(planSearch.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <Select value={planStatusFilter} onValueChange={setPlanStatusFilter}>
          <SelectTrigger style={{ minWidth: 140 }}>
            <SelectValue placeholder="Plan status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="In progress">In progress</SelectItem>
            <SelectItem value="Not started">Not started</SelectItem>
          </SelectContent>
        </Select>
        <Input
          size="medium"
          leadingIcon="search"
          placeholder="Search Plan"
          value={planSearch}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlanSearch(e.target.value)}
          style={{ maxWidth: 240 }}
        />
      </div>

      {/* Plans table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Plan Name</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Created By</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Roles</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Assign Date</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Updated On</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Duration (Week)</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlans.map((plan, i) => (
            <tr
              key={i}
              onClick={() => { if (plan.href) { window.scrollTo(0, 0); navigate(plan.href) } }}
              onMouseEnter={() => setHoveredPlanRow(i)}
              onMouseLeave={() => setHoveredPlanRow(null)}
              style={{ borderBottom: '1px solid #f1f5f9', background: hoveredPlanRow === i ? '#f8fafc' : undefined, cursor: plan.href ? 'pointer' : undefined }}
            >
              <td style={{ padding: '14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-secondary-blue, #3b5bdb)' }}>{plan.name}</span>
                  {plan.aiGenerated && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: '#6366f1', background: '#eff3ff', border: '1px solid #c5d3f8', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}><span className="material-symbols-outlined" style={{ fontSize: 11 }}>auto_awesome</span>AI generated</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: plan.status === 'Completed' ? '#22c55e' : plan.status === 'In progress' ? '#f59e0b' : '#94a3b8' }} />
                  <span style={{ fontSize: 12, color: plan.status === 'Completed' ? '#15803d' : plan.status === 'In progress' ? '#b45309' : '#475569' }}>{plan.status}</span>
                </div>
              </td>
              <td style={{ padding: '14px 12px', color: '#475569' }}>{plan.createdBy}</td>
              <td style={{ padding: '14px 12px', color: '#475569' }}>{plan.role}</td>
              <td style={{ padding: '14px 12px', color: '#475569' }}>{plan.assignDate}</td>
              <td style={{ padding: '14px 12px', color: '#475569' }}>{plan.updatedOn}</td>
              <td style={{ padding: '14px 12px', color: '#475569' }}>{plan.duration}</td>
              <td style={{ padding: '14px 12px' }}>
                <button type="button" onClick={(e) => e.stopPropagation()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>⋮</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
