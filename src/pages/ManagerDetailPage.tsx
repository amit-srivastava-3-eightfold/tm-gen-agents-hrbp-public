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
import { departments, getRolesForDept, getEmployeesForRole, getDeptHrbps, wfrDemoDeptResponseRate, type RoleRowType } from '../data/wfrOrgData'
import { DEMO_MANAGERS } from '../components/workforceReadiness/collectionHelpers'
import { PersonDetailLayout } from '../components/workforceReadiness/PersonDetailLayout'
import { deptManagerTeams, deptReadinessTrend } from '../components/workforceReadiness/collectionHelpers'
import { deriveWfrFlags, DeptTableSoloBar, DataCollectionHead, DataCollectionProgressCell, DataCollectionStatusCell, getHrbpEffectiveState, getPersonaEffectiveState, stateNum, type WfrPersistedState } from '../components/workforceReadiness/WorkforceReadinessDashboard'
import { getPersonaHrbpNames } from '../data/wfrOrgData'
import { WorkforceMetricSheet, type WorkforceMetricSheetId } from '../components/workforceReadiness/WorkforceMetricSheet'
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
  const mgrIdxParam = searchParams.get('mgrIdx')
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
        // Preserve delegation state so collection columns show when HRBPs are collecting
        if (parsed.hrbpStates && Object.keys(parsed.hrbpStates).length > 0) return parsed
      }
    } catch { /* ignore */ }
    return { state: 1 }
  }, [])
  // Use persona-aware state so HRBP sees collection status even when org aggregate is still 1
  const personaHrbpNames = isHrbp ? getPersonaHrbpNames(currentUser.id) : []
  const effectiveState = isHrbp && wfrState.hrbpStates
    ? getPersonaEffectiveState(wfrState, personaHrbpNames)
    : wfrState.state
  const { collectionActive, collectionComplete, upskillingActive, hrbpPlansCreated } = deriveWfrFlags(effectiveState)

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

    // Try top-level manager first — prefer index-based lookup to handle duplicate names
    // If parent is specified, treat this as a line-manager navigation (try that path first)
    if (parentParam) {
      const candidateParents = managers.filter(m => m.manager === parentParam)
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
            parentMgrIdx: managers.indexOf(parentMgr),
          }
        }
      }
    }

    // Try top-level manager — prefer index-based lookup to handle duplicate names
    const mgrIdx = mgrIdxParam !== null ? parseInt(mgrIdxParam, 10) : -1
    const topMgr = (mgrIdx >= 0 && mgrIdx < managers.length && managers[mgrIdx].manager === managerName)
      ? managers[mgrIdx]
      : managers.find(m => m.manager === managerName)
    if (topMgr) {
      const employeesWithManager = buildManagerEmps(topMgr)
      return { mgr: topMgr, employees: employeesWithManager, parentManager: null as string | null, parentMgrIdx: null as number | null }
    }

    return null
  }, [dept, managerName, parentParam, mgrIdxParam])

  // Dev plan sheet state
  const [openMetric, setOpenMetric] = useState<WorkforceMetricSheetId | null>(null)
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

  const { mgr, employees, parentManager, parentMgrIdx } = managerData

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
  // Deltas for metric cards
  const readinessDelta = avgReadiness - rawAvgReadiness

  // Collection-related state
  const showCollection = collectionActive && !collectionComplete
  const collectionLaunchSummary = wfrState.collectionLaunchSummary ?? null
  const upskillingLaunchSummary = wfrState.upskillingLaunchSummary ?? null
  // Department is in scope if any of its HRBPs were selected for delegation (per-HRBP state)
  const deptInScope = wfrState.hrbpStates
    ? getDeptHrbps(deptName).some(h => stateNum(getHrbpEffectiveState(wfrState, h.hrbp)) >= 2)
    : !collectionLaunchSummary?.scopedDepartmentNames || collectionLaunchSummary.scopedDepartmentNames.includes(deptName)
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

      <main className="mgr-detail-page__main">
        <div className="mgr-detail-page__content">
          <PersonDetailLayout
            breadcrumb={(() => {
              const mgrIdx = mgrIdxParam !== null ? parseInt(mgrIdxParam, 10) : -1
              const deptHrbpList = getDeptHrbps(deptName)
              const allMgrs = deptManagerTeams(deptName, dept.employees)
              let mgrStart = 0
              for (const h of deptHrbpList) {
                let covered = 0
                const startIdx = mgrStart
                for (let m = mgrStart; m < allMgrs.length; m++) {
                  if (covered + allMgrs[m].employees > h.headcount && covered > 0) break
                  covered += allMgrs[m].employees
                  mgrStart = m + 1
                }
                if (mgrIdx >= startIdx && mgrIdx < mgrStart) {
                  const sliceCount = mgrStart - startIdx
                  const targetDirs = Math.max(4, Math.min(12, Math.round(h.headcount / 300)))
                  const perDir = Math.ceil(sliceCount / targetDirs)
                  const dirIdx = Math.floor((mgrIdx - startIdx) / perDir)
                  const nh = (s: string) => { let hh = 0; for (let i = 0; i < s.length; i++) hh = ((hh << 5) - hh + s.charCodeAt(i)) | 0; return Math.abs(hh) }
                  const dirName = DEMO_MANAGERS[(nh(deptName) + dirIdx * 7) % DEMO_MANAGERS.length]
                  return (
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/workforce')}>Overview</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink onClick={() => navigate(`/workforce?hrbp=${encodeURIComponent(h.hrbp)}`)}><span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: -3, marginRight: 4 }}>shield_person</span>{h.hrbp}</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink onClick={() => navigate(`/workforce?hrbp=${encodeURIComponent(h.hrbp)}&director=${encodeURIComponent(dirName)}&dept=${encodeURIComponent(deptName)}&dirIdx=${dirIdx}`)}>{dirName}</BreadcrumbLink></BreadcrumbItem>
                        {parentManager && (<><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink onClick={() => navigate(`/workforce/manager/${encodeURIComponent(parentManager)}?dept=${encodeURIComponent(dept.name)}${parentMgrIdx !== null ? `&mgrIdx=${parentMgrIdx}` : ''}`)}>{parentManager}</BreadcrumbLink></BreadcrumbItem></>)}
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>{mgr.manager}</BreadcrumbPage></BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  )
                }
              }
              return (
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/workforce')}>Overview</BreadcrumbLink></BreadcrumbItem>
                    {!isHrbp && (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink onClick={() => navigate(`/workforce?dept=${encodeURIComponent(dept.name)}`)}>{dept.name}</BreadcrumbLink></BreadcrumbItem>
                      </>
                    )}
                    {parentManager && (<><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink onClick={() => navigate(`/workforce/manager/${encodeURIComponent(parentManager)}?dept=${encodeURIComponent(dept.name)}${parentMgrIdx !== null ? `&mgrIdx=${parentMgrIdx}` : ''}`)}>{parentManager}</BreadcrumbLink></BreadcrumbItem></>)}
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>{mgr.manager}</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              )
            })()}
            name={mgr.manager}
            subtitle={`${mgr.title} · ${dept.name} · ${employees.length} employees`}
            readiness={{
              value: readinessDelta !== 0 ? (
                <>{avgReadiness}% <DeltaBadge delta={`${readinessDelta > 0 ? '+' : ''}${readinessDelta}pt`} up={readinessDelta > 0} /></>
              ) : `${avgReadiness}%`,
              description: collectionComplete
                ? `${readyCount} AI-ready of ${displayEmployees.length} in this team`
                : `Estimated: ${readyCount} of ${displayEmployees.length} may be AI-ready based on skill profiles`,
              hint: hrbpPlansCreated ? 'After upskilling plans completed.' : collectionComplete ? 'Calibrated from data collection.' : 'Estimated from skill profiles.',
              badge: collectionComplete
                ? <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#15803d', padding: '1px 7px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>
                : <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>,
              onLearnMore: () => setOpenMetric('readiness'),
            }}
            potential={{ value: `${dept.aiPotential}%`, description: 'Tasks in the augmentation zone', hint: `Role-level potential for ${dept.name}`, onLearnMore: () => setOpenMetric('potential') }}
            gap={{
              value: `${notReady.toLocaleString()} not ready`,
              description: `out of ${displayEmployees.length} employees`,
              hint: avgReadiness >= 50 ? `${avgReadiness}% adoption meets the 50% threshold.` : `${avgReadiness}% adoption is below the 50% threshold.`,
              onLearnMore: () => setOpenMetric('gap'),
            }}
            managerTable={{
              title: 'Manager summary',
              hint: dept.name,
              hideTitle: true,
              children: (
                <DataTable bordered>
                  <DataTableHeader>
                    <DataTableRow>
                      <DataTableHead>Manager</DataTableHead>
                      <DataTableHead numeric>Employees</DataTableHead>
                      <DataTableHead metric>AI adoption</DataTableHead>
                      <DataTableHead metric>AI potential</DataTableHead>
                      <DataTableHead numeric>Gap</DataTableHead>
                      {showCollection && <DataCollectionHead />}
                    </DataTableRow>
                  </DataTableHeader>
                  <DataTableBody>
                    <DataTableRow>
                      <DataTableCell className="font-semibold">
                        <div>
                          <div>{mgr.manager}</div>
                          <div className="text-[#94a3b8] text-[11px] font-normal">{mgr.title} · {dept.name}</div>
                        </div>
                      </DataTableCell>
                      <DataTableCell align="right" numeric>{displayEmployees.length.toLocaleString()}</DataTableCell>
                      <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={avgReadiness} /></DataTableCell>
                      <DataTableCell metric><DeptTableSoloBar variant="potential" pct={dept.aiPotential} /></DataTableCell>
                      <DataTableCell align="right">
                        <span style={{ color: avgReadiness >= 50 ? '#15803d' : '#dc2626' }}>{avgReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}</span>
                      </DataTableCell>
                      {showCollection && <DataCollectionProgressCell rate={deptInScope ? wfrDemoDeptResponseRate(deptName) : 0} inScope={deptInScope} />}
                    </DataTableRow>
                  </DataTableBody>
                </DataTable>
              ),
            }}
            tableTitle="Team members"
            tableHint={tableHint}
            sixColTable={showCollection || collectionComplete}
          >
          <DataTable bordered>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Employee</DataTableHead>
                <DataTableHead>Manager</DataTableHead>
                <DataTableHead metric>{'AI adoption'}</DataTableHead>
                <DataTableHead metric>AI potential</DataTableHead>
                <DataTableHead>Gap</DataTableHead>
                {showCollection ? (
                  <DataCollectionHead />
                ) : null}
                {collectionComplete ? (
                    <DataTableHead metric>Upskilling status</DataTableHead>
                ) : null}
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {[...displayEmployees].sort((a, b) => b.displayReadiness - a.displayReadiness).map((emp, i) => {
                const h = nameHash(emp.name)

                // Collection: deterministic response status
                const empResponded = deptInScope && (h % 3 !== 0)

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
                      <span style={{ color: emp.displayReadiness >= 50 ? '#15803d' : '#dc2626' }}>
                        {emp.displayReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}
                      </span>
                      {emp.displayReadiness >= 35 && emp.displayReadiness < 50 && (
                        <div className="text-[10px] text-[#d97706] mt-0.5">Near threshold</div>
                      )}
                    </DataTableCell>

                    {/* Collection column — state 2 */}
                    {showCollection ? (
                      <DataCollectionStatusCell responded={empResponded} inScope={deptInScope} />
                    ) : null}

                    {/* Upskilling status — single column with dev plan link + progress bar */}
                    {collectionComplete ? (
                      <DataTableCell metric className="!whitespace-normal">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <button
                            type="button"
                            className="text-[#3b5bdb] hover:underline shrink-0"
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setDevPlanEmployee({ name: emp.name, title: emp.title, readinessPct: emp.readinessPct, displayReadiness: emp.displayReadiness })
                              setEditingCourses(false)
                              setRemovedCourses(new Set())
                            }}
                          >
                            Development plan
                          </button>
                          <div className="wfr-dash__plan-progress" style={{ flex: '1 1 0', minWidth: 60 }}>
                            <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                              <div className="wfr-dash__plan-progress-fill" style={{ width: `${planPct}%`, background: planBarColor }} />
                            </div>
                            <span className="wfr-dash__plan-progress-label" style={{ color: planTextColor }}>{planPct > 0 ? `${planPct}%` : '—'}</span>
                          </div>
                        </div>
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
          </PersonDetailLayout>
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
      <WorkforceMetricSheet
        metric={openMetric}
        onClose={() => setOpenMetric(null)}
        ready={readyCount}
        gapPeople={notReady}
        hrsUnlocked={0}
        departmentGap={{ departmentName: dept.name, peopleInAugRoles: displayEmployees.length, ready: readyCount, gapPeople: notReady, hrsUnlocked: 0 }}
      />
    </div>
  )
}
