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
import { deptManagerTeams, deptReadinessTrend } from '../components/workforceReadiness/collectionHelpers'
import { deriveWfrFlags, DeptTableSoloBar, type WfrPersistedState } from '../components/workforceReadiness/WorkforceReadinessDashboard'
import '../components/workforceReadiness/WorkforceReadinessDashboard.css'
import './ManagerDetailPage.css'

const WFR_STATE_KEY = 'tm:wfr-state'

/** Simple deterministic hash from a string */
function nameHash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Delta badge inline — matches BoardView pattern */
function DeltaBadge({ delta, up }: { delta: string; up: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: up ? '#15803d' : '#dc2626', padding: '2px 8px', borderRadius: 12, background: up ? '#f0fdf4' : '#fef2f2', border: `1px solid ${up ? '#bbf7d0' : '#fecaca'}`, verticalAlign: 'middle' }}>
      {up ? '↑' : '↓'} {delta}
    </span>
  )
}

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

  // ─── Read WFR state from localStorage ───
  const wfrState: WfrPersistedState = useMemo(() => {
    try {
      const stored = localStorage.getItem(WFR_STATE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as WfrPersistedState
        if (parsed.state === 5) return parsed
      }
    } catch { /* ignore */ }
    return { state: 1 }
  }, [])
  const { collectionActive, collectionComplete, upskillingActive, hrbpPlansCreated } = deriveWfrFlags(wfrState.state)

  // Find the department
  const dept = departments.find(d => d.name === deptName)

  // Calibration delta for this department
  const deptTrend = deptName ? deptReadinessTrend(deptName) : { delta: 0, direction: 'up' as const }
  const calibrationDelta = collectionComplete ? deptTrend.delta : 0
  const upskillingBoostBase = hrbpPlansCreated ? (isHrbp ? 10 : 8) : 0

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
      return { mgr: topMgr, employees: employeesWithManager, parentManager: null as string | null }
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
        return {
          mgr: { manager: lm.name, title: lm.title, employees: lmEmployees.length, responseRate: 0 },
          employees: employeesWithManager,
          parentManager: parentMgr.manager,
        }
      }
    }

    return null
  }, [dept, managerName, parentParam])

  // Dev plan sheet state
  const [devPlanEmployee, setDevPlanEmployee] = useState<{ name: string; title?: string; readinessPct: number; displayReadiness: number } | null>(null)
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

  const { mgr, employees, parentManager } = managerData

  // Apply calibration: add deptTrend delta + per-employee upskilling boost
  const displayEmployees = employees.map(e => {
    const empBoost = hrbpPlansCreated ? Math.round(upskillingBoostBase * (0.5 + (nameHash(e.name) % 10) / 10)) : 0
    const displayReadiness = Math.max(0, Math.min(100, e.readinessPct + calibrationDelta + empBoost))
    return { ...e, displayReadiness }
  })

  const readyCount = displayEmployees.filter(e => e.displayReadiness >= 50).length
  const avgReadiness = displayEmployees.length > 0
    ? Math.round(displayEmployees.reduce((s, e) => s + e.displayReadiness, 0) / displayEmployees.length)
    : 0
  const rawAvgReadiness = employees.length > 0
    ? Math.round(employees.reduce((s, e) => s + e.readinessPct, 0) / employees.length)
    : 0
  const notReady = displayEmployees.length - readyCount
  const gapPct = displayEmployees.length > 0 ? notReady / displayEmployees.length : 0

  // Deltas for metric cards
  const readinessDelta = avgReadiness - rawAvgReadiness
  const rawReadyCount = employees.filter(e => e.readinessPct >= 50).length
  const rawNotReady = employees.length - rawReadyCount
  const gapDelta = (collectionComplete || hrbpPlansCreated) ? notReady - rawNotReady : 0

  // Collection-related state
  const showCollection = collectionActive && !collectionComplete
  const collectionLaunchSummary = wfrState.collectionLaunchSummary ?? null
  const upskillingLaunchSummary = wfrState.upskillingLaunchSummary ?? null
  const deptInScope = !collectionLaunchSummary?.scopedDepartmentNames || collectionLaunchSummary.scopedDepartmentNames.includes(deptName)
  const deptInUpskilling = upskillingActive && upskillingLaunchSummary?.departmentNames?.includes(deptName)

  // Table hint
  const tableHint = hrbpPlansCreated
    ? `${displayEmployees.length} employees · upskilling complete`
    : upskillingActive
      ? `${displayEmployees.length} employees · upskilling in progress`
      : collectionComplete
        ? `${displayEmployees.length} employees · calibrated readiness`
        : showCollection
          ? `${displayEmployees.length} employees · data collection in progress`
          : `${displayEmployees.length} employees · sorted by readiness`

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
              <HeaderTitle>Workforce Readiness</HeaderTitle>
            </HeaderTextGroup>
          </HeaderToolbar>
        </Header>
      </ProductBackground>

      {/* Sticky breadcrumb bar */}
      <div className="mgr-detail-page__breadcrumb-bar">
        <div className="mgr-detail-page__breadcrumb-inner">
          <Breadcrumb>
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
        </div>
      </div>

      <main className="mgr-detail-page__main">
        <div className="mgr-detail-page__content">
          {/* Manager summary */}
          <div className="mgr-detail-page__summary">
            <h2 className="mgr-detail-page__name">{mgr.manager}</h2>
            <p className="mgr-detail-page__subtitle">{mgr.title} · {dept.name} · {employees.length} employees</p>
          </div>

          {/* Summary cards */}
          <div className="wfr-dash__cards-row">
            <MetricCard
              variant="readiness"
              icon="school"
              label="AI readiness"
              badge={collectionComplete
                ? <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#15803d', padding: '1px 7px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>
                : <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>
              }
              value={readinessDelta !== 0 ? (
                <>{avgReadiness}% <DeltaBadge delta={`${readinessDelta > 0 ? '+' : ''}${readinessDelta}pt`} up={readinessDelta > 0} /></>
              ) : `${avgReadiness}%`}
              description={collectionComplete
                ? `${readyCount} AI-ready of ${displayEmployees.length} in this team`
                : `Estimated: ${readyCount} of ${displayEmployees.length} may be AI-ready based on skill profiles`}
              hint={hrbpPlansCreated
                ? 'After upskilling plans completed.'
                : collectionComplete
                  ? 'Calibrated from data collection.'
                  : 'Estimated from skill profiles.'}
            />
            <MetricCard
              variant="potential"
              icon="auto_awesome"
              label="AI adoption"
              value={`${dept.aiPotential}%`}
              description={`Tasks in the augmentation zone`}
              hint={`Role-level potential for ${dept.name}`}
            />
            <MetricCard
              variant="gap"
              icon="groups"
              label="Transformation gap"
              value={gapDelta !== 0 ? (
                <>{notReady.toLocaleString()} <DeltaBadge delta={`${gapDelta > 0 ? '+' : ''}${gapDelta}`} up={gapDelta < 0} /></>
              ) : notReady.toLocaleString()}
              description={`${notReady} people in augmentable roles are not yet AI-ready — that's your prioritized development pool.`}
              hint={`${Math.round(gapPct * 100)}% of team still in the gap.`}
            />
          </div>

          {/* Employee table */}
          <div className="mgr-detail-page__table-head">
            <h3 className="mgr-detail-page__table-title">Team members</h3>
            <span className="mgr-detail-page__table-hint">{tableHint}</span>
          </div>

          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Employee</DataTableHead>
                <DataTableHead>Manager</DataTableHead>
                <DataTableHead metric>AI readiness</DataTableHead>
                <DataTableHead metric>AI adoption</DataTableHead>
                <DataTableHead>Gap</DataTableHead>
                {showCollection ? (
                  <>
                    <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]">Collection progress</DataTableHead>
                    <DataTableHead className="bg-[#f8fafc]">Channels</DataTableHead>
                  </>
                ) : null}
                <DataTableHead>Upskilling status</DataTableHead>
                <DataTableHead>{collectionComplete ? 'Plan' : 'Action'}</DataTableHead>
                {collectionComplete ? <DataTableHead>Plan progress</DataTableHead> : null}
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {[...displayEmployees].sort((a, b) => b.displayReadiness - a.displayReadiness).map((emp, i) => {
                const isAssigned = assignedPlans.has(emp.name)
                const h = nameHash(emp.name)

                // Collection: deterministic response status
                const empResponded = deptInScope && (h % 3 !== 0)

                // Upskilling: deterministic progress
                const upskillingPct = hrbpPlansCreated
                  ? Math.min(95, 35 + (h % 45) + 15)
                  : Math.min(80, 10 + (h % 40))
                const upskillingStatus = upskillingPct > 85 ? 'Completed' : upskillingPct > 30 ? 'In progress' : 'Not started'
                const upskillingBarColor = upskillingStatus === 'Completed' ? '#22c55e' : upskillingStatus === 'In progress' ? '#818cf8' : '#e2e8f0'
                const upskillingTextColor = upskillingStatus === 'Completed' ? '#15803d' : upskillingStatus === 'In progress' ? '#6366f1' : '#94a3b8'

                // Plan progress: deterministic
                const planPct = hrbpPlansCreated
                  ? Math.min(100, 25 + (h % 55) + 20)
                  : deptInUpskilling
                    ? Math.min(80, 10 + (h % 50))
                    : 0
                const planStatus = planPct > 85 ? 'Completed' : planPct > 20 ? 'In progress' : 'Not started'
                const planBarColor = planStatus === 'Completed' ? '#22c55e' : planStatus === 'In progress' ? '#818cf8' : '#e2e8f0'
                const planTextColor = planStatus === 'Completed' ? '#15803d' : planStatus === 'In progress' ? '#6366f1' : '#94a3b8'

                // Readiness trend badge
                const empDelta = emp.displayReadiness - emp.readinessPct

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
                        <DeptTableSoloBar variant="readiness" pct={emp.displayReadiness} />
                        {collectionComplete && empDelta !== 0 && (
                          <span className="text-[10px] font-semibold" style={{ color: empDelta > 0 ? '#15803d' : '#dc2626' }}>
                            {empDelta > 0 ? '↑' : '↓'}{Math.abs(empDelta)}pt
                          </span>
                        )}
                      </div>
                    </DataTableCell>
                    <DataTableCell metric>
                      <DeptTableSoloBar variant="potential" pct={dept.aiPotential} />
                    </DataTableCell>
                    <DataTableCell>
                      <span className="text-[12px] font-medium" style={{ color: emp.displayReadiness >= 50 ? '#15803d' : '#dc2626' }}>
                        {emp.displayReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}
                      </span>
                      {emp.displayReadiness >= 35 && emp.displayReadiness < 50 && (
                        <div className="text-[10px] text-[#d97706] mt-0.5">Near threshold</div>
                      )}
                    </DataTableCell>

                    {/* Collection columns — state 2 */}
                    {showCollection ? (
                      <>
                        <DataTableCell className="bg-[#fafbfc] border-l border-[#e2e8f0]">
                          {deptInScope ? (
                            <span className={`inline-flex items-center gap-1 text-[12px] ${empResponded ? 'text-[#15803d]' : 'text-[#94a3b8]'}`}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                {empResponded ? 'check_circle' : 'pending'}
                              </span>
                              {empResponded ? 'Responded' : 'Pending'}
                            </span>
                          ) : <span className="text-[11px] text-[#94a3b8]">—</span>}
                        </DataTableCell>
                        <DataTableCell className="bg-[#fafbfc]">
                          {deptInScope ? (
                            <span className="inline-flex items-center gap-1 text-[12px] text-[#1a212e]">
                              {(collectionLaunchSummary?.channelsLabel ?? '').includes('AI') ? (
                                <img src="/ai-agent-icon.svg" alt="" style={{ width: 14, height: 14 }} />
                              ) : (
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>assignment</span>
                              )}
                              {collectionLaunchSummary?.channelsLabel ?? 'Survey'}
                            </span>
                          ) : <span className="text-[11px] text-[#94a3b8]">—</span>}
                        </DataTableCell>
                      </>
                    ) : null}

                    {/* Upskilling status */}
                    <DataTableCell>
                      {upskillingActive ? (
                        <div>
                          <div className="wfr-dash__plan-progress">
                            <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                              <div className="wfr-dash__plan-progress-fill" style={{ width: `${upskillingPct}%`, background: upskillingBarColor }} />
                            </div>
                            <span className="wfr-dash__plan-progress-label" style={{ color: upskillingTextColor }}>{upskillingPct}%</span>
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: upskillingTextColor }}>{upskillingStatus}</div>
                        </div>
                      ) : (
                        <span className="text-[12px] font-medium text-[#94a3b8]">Not started</span>
                      )}
                    </DataTableCell>

                    {/* Plan / Action column */}
                    <DataTableCell>
                      {(collectionComplete && deptInUpskilling) || isAssigned ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setDevPlanEmployee({ name: emp.name, title: emp.title, readinessPct: emp.readinessPct, displayReadiness: emp.displayReadiness })
                            setEditingCourses(false)
                            setRemovedCourses(new Set())
                          }}
                        >
                          View plan
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setDevPlanEmployee({ name: emp.name, title: emp.title, readinessPct: emp.readinessPct, displayReadiness: emp.displayReadiness })
                            setEditingCourses(false)
                            setRemovedCourses(new Set())
                          }}
                        >
                          Assign plan
                        </Button>
                      )}
                    </DataTableCell>

                    {/* Plan progress column — state 3+ */}
                    {collectionComplete ? (
                      <DataTableCell>
                        {(deptInUpskilling || isAssigned) ? (
                          <div>
                            <div className="wfr-dash__plan-progress">
                              <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                                <div className="wfr-dash__plan-progress-fill" style={{ width: `${planPct}%`, background: planBarColor }} />
                              </div>
                              <span className="wfr-dash__plan-progress-label" style={{ color: planTextColor }}>{planPct}%</span>
                            </div>
                            <div className="text-[10px] mt-0.5" style={{ color: planTextColor }}>{planStatus}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#94a3b8]">—</span>
                        )}
                      </DataTableCell>
                    ) : null}
                  </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>

          {/* Bulk actions */}
          {!collectionComplete && (
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
          )}
        </div>
      </main>

      {/* Dev plan sheet */}
      {devPlanEmployee && createPortal(
        <div className="mgr-detail-page__plan-overlay" onClick={() => setDevPlanEmployee(null)}>
          <div className="mgr-detail-page__plan-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mgr-detail-page__plan-header">
              <div>
                <h3 className="mgr-detail-page__plan-name">{devPlanEmployee.name}</h3>
                <p className="mgr-detail-page__plan-meta">{devPlanEmployee.title} · {dept.name} · Readiness: {devPlanEmployee.displayReadiness}%</p>
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
