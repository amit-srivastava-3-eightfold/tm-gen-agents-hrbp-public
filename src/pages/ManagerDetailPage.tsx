import { useState, useMemo, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useUser } from '../contexts/UserContext'
import { NavbarApp } from '../components/Navbar'
import {
  Button,
  ProductBackground,
  Header,
  HeaderToolbar,
  HeaderTextGroup,
  HeaderTitle,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
  Pill,
} from '@tonyh-2-eightfold/ef-design-system'
import { departments, getRolesForDept, getEmployeesForRole, type RoleRowType } from '../data/wfrOrgData'
import { MetricCard } from '../components/workforceReadiness/MetricCard'
import { deptManagerTeams } from '../components/workforceReadiness/collectionHelpers'
import '../components/workforceReadiness/WorkforceReadinessDashboard.css'
import './ManagerDetailPage.css'

export function ManagerDetailPage() {
  const { currentUser } = useUser()
  const { managerId } = useParams<{ managerId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const deptName = searchParams.get('dept') ?? ''
  const parentParam = searchParams.get('parent') ?? ''
  const managerName = decodeURIComponent(managerId ?? '')
  const isHrbp = currentUser.id === 'jaydon-torff'

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // Find the department
  const dept = departments.find(d => d.name === deptName)

  // Find this manager's data — could be a top-level manager or a line manager
  const managerData = useMemo(() => {
    if (!dept) return null
    const managers = deptManagerTeams(dept.name, dept.employees)

    // Get department roles and all employees (shared across all lookups)
    const deptRoles = getRolesForDept(dept.name)
    const rawEmps = getEmployeesForRole({ title: dept.name, employees: dept.employees, aiReadiness: dept.aiReadiness, aiPotential: dept.aiPotential } as RoleRowType)
    const allDeptEmps = rawEmps.map((e, i) => ({
      ...e,
      title: deptRoles.length > 0 ? deptRoles[i % deptRoles.length].title : undefined,
    }))

    // Helper: build employee list with manager mapping for a top-level manager
    function buildManagerEmps(mgr: typeof managers[0]) {
      const mgrIdx = managers.indexOf(mgr)
      const cumStart = managers.slice(0, mgrIdx).reduce((s, m) => s + m.employees, 0)
      const mgrEmployees = allDeptEmps.slice(cumStart, Math.min(cumStart + mgr.employees, allDeptEmps.length))

      const empManagerMap = new Map<number, string>()
      if (mgr.lineManagers?.length) {
        const directCount = Math.max(3, Math.round(mgrEmployees.length * 0.3))
        for (let j = 0; j < directCount && j < mgrEmployees.length; j++) {
          empManagerMap.set(j, mgr.manager)
        }
        let lmStart = directCount
        const remaining = mgrEmployees.length - directCount
        for (let li = 0; li < mgr.lineManagers.length; li++) {
          const lm = mgr.lineManagers[li]
          const isLast = li === mgr.lineManagers.length - 1
          const share = isLast ? mgrEmployees.length - lmStart : Math.round(remaining / mgr.lineManagers.length)
          for (let j = lmStart; j < lmStart + share && j < mgrEmployees.length; j++) {
            empManagerMap.set(j, lm.name)
          }
          lmStart += share
        }
      }
      for (let j = 0; j < mgrEmployees.length; j++) {
        if (!empManagerMap.has(j)) empManagerMap.set(j, mgr.manager)
      }
      return mgrEmployees.map((e, i) => ({ ...e, manager: empManagerMap.get(i) ?? mgr.manager }))
    }

    // Try top-level manager first
    const topMgr = managers.find(m => m.manager === managerName)
    if (topMgr) {
      const employeesWithManager = buildManagerEmps(topMgr)
      const readyCount = employeesWithManager.filter(e => e.readinessPct >= 50).length
      const avgReadiness = employeesWithManager.length > 0
        ? Math.round(employeesWithManager.reduce((s, e) => s + e.readinessPct, 0) / employeesWithManager.length)
        : 0
      return { mgr: topMgr, employees: employeesWithManager, readyCount, avgReadiness, parentManager: null as string | null }
    }

    // Try line manager — find the parent manager and filter employees assigned to this line manager
    const candidateParents = parentParam
      ? managers.filter(m => m.manager === parentParam)
      : managers
    for (const parentMgr of candidateParents) {
      const lm = parentMgr.lineManagers?.find(l => l.name === managerName)
      if (lm) {
        const allParentEmps = buildManagerEmps(parentMgr)
        const lmEmployees = allParentEmps.filter(e => e.manager === managerName)
        const employeesWithManager = lmEmployees.map(e => ({ ...e, manager: managerName }))
        const readyCount = employeesWithManager.filter(e => e.readinessPct >= 50).length
        const avgReadiness = employeesWithManager.length > 0
          ? Math.round(employeesWithManager.reduce((s, e) => s + e.readinessPct, 0) / employeesWithManager.length)
          : 0
        return {
          mgr: { manager: lm.name, title: lm.title, employees: lmEmployees.length, responseRate: 0 },
          employees: employeesWithManager,
          readyCount,
          avgReadiness,
          parentManager: parentMgr.manager,
        }
      }
    }

    return null
  }, [dept, managerName, parentParam])

  // Dev plan sheet state
  const [devPlanEmployee, setDevPlanEmployee] = useState<{ name: string; title?: string; readinessPct: number } | null>(null)
  const [assignedPlans, setAssignedPlans] = useState<Set<string>>(new Set())
  const [, setEditingCourses] = useState(false)
  const [removedCourses, setRemovedCourses] = useState<Set<number>>(new Set())

  if (!dept || !managerData) {
    return (
      <div className="mgr-detail-page">
        <NavbarApp />
        <div style={{ padding: '100px 24px', textAlign: 'center' }}>
          <p>Manager not found.</p>
          <Button variant="secondary" onClick={() => navigate('/workforce')}>Back to Workforce Readiness</Button>
        </div>
      </div>
    )
  }

  const { mgr, employees, readyCount, avgReadiness, parentManager } = managerData
  const notReady = employees.length - readyCount
  const gapPct = employees.length > 0 ? notReady / employees.length : 0
  // gapColor available for future use: gapPct > 0.75 → red, > 0.25 → amber, else green

  // Courses for the dev plan sheet
  const devPlanCourses = devPlanEmployee ? [
    { course: 'AI for Business Professionals', provider: 'University of Pennsylvania', duration: '4 weeks at 3 hours a week', level: 'Beginner', free: true },
    { course: 'Generative AI with Large Language Models', provider: 'DeepLearning.AI', duration: '16 hours to complete', level: 'Intermediate', free: true },
    { course: 'Prompt Engineering for ChatGPT', provider: 'Vanderbilt University', duration: '18 hours to complete', level: 'Beginner', free: true },
    { course: `AI-Powered ${(devPlanEmployee.title?.split(' ')[0] ?? 'Business')} Workflows`, provider: 'Eightfold Academy', duration: 'Self-paced', level: 'Intermediate', free: false },
  ] : []

  const devPlanSkills = devPlanEmployee ? [
    'Prompt engineering',
    'AI tool fluency',
    'Data interpretation with AI',
    'Critical evaluation of AI output',
    ...(devPlanEmployee.title ? [`AI for ${devPlanEmployee.title.split(' ')[0].toLowerCase()} tasks`] : []),
  ] : []

  return (
    <div className="mgr-detail-page">
      <NavbarApp />

      <ProductBackground
        className="mgr-detail-page__bg"
        variant="career-hub"
        {...(isHrbp ? { hexagonsVariant: 'default' as const } : { chevronsVariant: 'default' as const })}
      >
        <Header variant="career-hub" chSize="child" overlayBackground>
          <HeaderToolbar>
            <HeaderTextGroup>
              <HeaderTitle>{mgr.manager}</HeaderTitle>
            </HeaderTextGroup>
          </HeaderToolbar>
        </Header>
      </ProductBackground>

      <main className="mgr-detail-page__main">
        <div className="mgr-detail-page__content">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6 border-b border-[#e5e7eb] pb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/workforce')}>Workforce Readiness</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate(`/workforce?dept=${encodeURIComponent(dept.name)}`)}>{dept.name}</BreadcrumbLink>
              </BreadcrumbItem>
              {parentManager && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => navigate(`/workforce/manager/${encodeURIComponent(parentManager)}?dept=${encodeURIComponent(dept.name)}`)}>{parentManager}</BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{mgr.manager}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Manager summary */}
          <div className="mgr-detail-page__summary">
            <h2 className="mgr-detail-page__name">{mgr.manager}</h2>
            <p className="mgr-detail-page__subtitle">{mgr.title} · {dept.name} · {employees.length} employees</p>
          </div>

          {/* Summary cards */}
          <div className="wfr-dash__cards-row">
            <MetricCard
              variant="readiness"
              icon="speed"
              label="AI readiness"
              value={`${avgReadiness}%`}
              description={`${readyCount} AI-ready of ${employees.length} in this team`}
              hint={`Org average: ${dept.aiReadiness}%`}
            />
            <MetricCard
              variant="potential"
              icon="auto_awesome"
              label="AI potential"
              value={`${dept.aiPotential}%`}
              description={`Tasks in the augmentation zone`}
              hint={`Role-level potential for ${dept.name}`}
            />
            <MetricCard
              variant="gap"
              icon="trending_down"
              label="Transformation gap"
              value={notReady.toLocaleString()}
              description={`${notReady} people in augmentable roles are not yet AI-ready — that's your prioritized development pool.`}
              hint={`${Math.round(gapPct * 100)}% of team still in the gap.`}
            />
          </div>

          {/* Employee table */}
          <div className="mgr-detail-page__table-head">
            <h3 className="mgr-detail-page__table-title">Team members</h3>
            <span className="mgr-detail-page__table-hint">{employees.length} employees · sorted by readiness</span>
          </div>

          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Employee</DataTableHead>
                <DataTableHead>Manager</DataTableHead>
                <DataTableHead metric>Readiness</DataTableHead>
                <DataTableHead metric>Potential</DataTableHead>
                <DataTableHead>Gap</DataTableHead>
                <DataTableHead>Status</DataTableHead>
                <DataTableHead>Action</DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {[...employees].sort((a, b) => b.readinessPct - a.readinessPct).map((emp, i) => {
                const isAssigned = assignedPlans.has(emp.name)
                return (
                  <DataTableRow key={`emp-${i}`}>
                    <DataTableCell className="font-semibold">
                      <div className="text-[13px] text-[#1a212e]">{emp.name}</div>
                      <div className="text-[11px] text-[#94a3b8] font-normal">{emp.title ?? '—'}</div>
                    </DataTableCell>
                    <DataTableCell>
                      {emp.manager === mgr.manager ? (
                        <span className="text-[12px] text-[#475569]">{emp.manager}</span>
                      ) : (
                        <button
                          type="button"
                          className="text-[12px] text-[#3b5bdb] font-medium hover:underline"
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/workforce/manager/${encodeURIComponent(emp.manager)}?dept=${encodeURIComponent(dept.name)}&parent=${encodeURIComponent(mgr.manager)}`)
                          }}
                        >
                          {emp.manager}
                        </button>
                      )}
                    </DataTableCell>
                    <DataTableCell metric>
                      <div className="flex items-center gap-2">
                        <div className="mgr-detail-page__bar-track">
                          <div className="mgr-detail-page__bar-fill" style={{ width: `${emp.readinessPct}%`, background: emp.readinessPct >= 50 ? '#22c55e' : emp.readinessPct >= 35 ? '#f59e0b' : '#94a3b8' }} />
                        </div>
                        <span className="text-[12px] font-semibold" style={{ color: emp.readinessPct >= 50 ? '#15803d' : emp.readinessPct >= 35 ? '#d97706' : '#64748b' }}>{emp.readinessPct}%</span>
                      </div>
                    </DataTableCell>
                    <DataTableCell metric>
                      <div className="flex items-center gap-2">
                        <div className="mgr-detail-page__bar-track">
                          <div className="mgr-detail-page__bar-fill" style={{ width: `${dept.aiPotential}%`, background: '#6366f1' }} />
                        </div>
                        <span className="text-[12px] font-semibold text-[#6366f1]">{dept.aiPotential}%</span>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <span className="text-[12px] font-medium" style={{ color: emp.readinessPct >= 50 ? '#15803d' : '#dc2626' }}>
                        {emp.readinessPct >= 50 ? 'AI-ready' : 'Not AI-ready'}
                      </span>
                      {emp.readinessPct >= 35 && emp.readinessPct < 50 && (
                        <div className="text-[10px] text-[#d97706] mt-0.5">Near threshold</div>
                      )}
                    </DataTableCell>
                    <DataTableCell>
                      <Pill
                        variant={emp.programStatus === 'Completed' ? 'success' : emp.programStatus === 'Enrolled' ? 'info' : 'neutral'}
                        size="small"
                      >
                        {emp.programStatus}
                      </Pill>
                    </DataTableCell>
                    <DataTableCell>
                      {isAssigned ? (
                        <button
                          type="button"
                          className="text-[12px] font-medium text-[#3b5bdb] hover:underline"
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          onClick={() => {
                            setDevPlanEmployee({ name: emp.name, title: emp.title, readinessPct: emp.readinessPct })
                            setEditingCourses(false)
                            setRemovedCourses(new Set())
                          }}
                        >
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>description</span>
                            View plan
                          </span>
                        </button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setDevPlanEmployee({ name: emp.name, title: emp.title, readinessPct: emp.readinessPct })
                            setEditingCourses(false)
                            setRemovedCourses(new Set())
                          }}
                        >
                          Assign plan
                        </Button>
                      )}
                    </DataTableCell>
                  </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>

          {/* Bulk actions */}
          <div className="mgr-detail-page__bulk-actions">
            <Button
              variant="primary"
              onClick={() => {
                const allNames = employees.map(e => e.name)
                setAssignedPlans(new Set(allNames))
              }}
            >
              Assign plans to all ({employees.length})
            </Button>
          </div>
        </div>
      </main>

      {/* Dev plan sheet */}
      {devPlanEmployee && createPortal(
        <div className="mgr-detail-page__plan-overlay" onClick={() => setDevPlanEmployee(null)}>
          <div className="mgr-detail-page__plan-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mgr-detail-page__plan-header">
              <div>
                <h3 className="mgr-detail-page__plan-name">{devPlanEmployee.name}</h3>
                <p className="mgr-detail-page__plan-meta">{devPlanEmployee.title} · {dept.name} · Readiness: {devPlanEmployee.readinessPct}%</p>
              </div>
              <button type="button" className="mgr-detail-page__plan-close" onClick={() => setDevPlanEmployee(null)}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <div className="mgr-detail-page__plan-body">
              {/* Courses */}
              <div className="mgr-detail-page__plan-section">
                <h4 className="mgr-detail-page__plan-section-title">Recommended Courses</h4>
                {devPlanCourses.filter((_, i) => !removedCourses.has(i)).map((c, i) => (
                  <div key={i} className="mgr-detail-page__plan-course">
                    <div>
                      <div className="mgr-detail-page__plan-course-name">{c.course}</div>
                      <div className="mgr-detail-page__plan-course-meta">{c.provider} · {c.duration} · {c.level}{c.free ? ' · Free' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="mgr-detail-page__plan-section">
                <h4 className="mgr-detail-page__plan-section-title">Target Skills</h4>
                <div className="mgr-detail-page__plan-skills">
                  {devPlanSkills.map((s, i) => (
                    <Pill key={i} variant="neutral" size="small">{s}</Pill>
                  ))}
                </div>
              </div>
            </div>

            <div className="mgr-detail-page__plan-footer">
              {assignedPlans.has(devPlanEmployee.name) ? (
                <Button variant="secondary" onClick={() => setDevPlanEmployee(null)}>Done</Button>
              ) : (
                <Button variant="primary" onClick={() => {
                  setAssignedPlans(prev => new Set([...prev, devPlanEmployee!.name]))
                  setDevPlanEmployee(null)
                }}>
                  Assign plan →
                </Button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
