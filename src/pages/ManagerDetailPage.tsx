import { useState, useMemo, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Navigate } from 'react-router-dom'
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
} from '@tonyh-2-eightfold/ef-design-system'
import { departments, getRolesForDept, getEmployeesForRole, getDeptHrbps, formatDollar, getTasksForRole, type RoleRowType } from '../data/wfrOrgData'
import { DEMO_MANAGERS } from '../components/workforceReadiness/collectionHelpers'
import { PersonDetailLayout } from '../components/workforceReadiness/PersonDetailLayout'
import { deptManagerTeams, deptReadinessTrend } from '../components/workforceReadiness/collectionHelpers'
import { deriveWfrFlags, DeptTableSoloBar, getHrbpEffectiveState, getPersonaEffectiveState, type WfrPersistedState } from '../components/workforceReadiness/WorkforceReadinessDashboard'
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

function SortIcon({ sortDir }: { sortDir?: 'asc' | 'desc' | null }) {
  if (sortDir) return <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b', verticalAlign: -1 }}>{sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
  return <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#cbd5e1', verticalAlign: -1 }}>unfold_more</span>
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
  const directorParam = searchParams.get('director') ?? ''
  const parentHrbpParam = searchParams.get('parentHrbp') ?? ''
  const seniorMgrParam = searchParams.get('seniorMgr') ?? ''
  const srStartParam = searchParams.get('srStart') ?? ''
  const managerName = decodeURIComponent(managerId ?? '')
  const isHrbp = currentUser.id === 'jaydon-torff'
  const isManager = currentUser.id === 'mateo'

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
  const { collectionActive, collectionComplete: rawCollectionComplete, upskillingActive, hrbpPlansCreated: rawHrbpPlansCreated } = deriveWfrFlags(effectiveState)
  // Gate on director scope — if this manager's director didn't participate in collection, hide upskilling data
  const dirSelectedDirs = directorParam && parentHrbpParam ? wfrState.hrbpStates?.[parentHrbpParam]?.selectedDirectors : undefined
  const dirInScope = !dirSelectedDirs || !directorParam || dirSelectedDirs.includes(directorParam)
  const collectionComplete = rawCollectionComplete && dirInScope
  const hrbpPlansCreated = rawHrbpPlansCreated && dirInScope
  // Upskilling column gates on the specific HRBP's state (not org-level) so the CHRO drilling into
  // an HRBP's team only sees upskilling after THAT HRBP has launched upskilling (state >= 4).
  const parentHrbpEffState = parentHrbpParam
    ? getHrbpEffectiveState(wfrState, parentHrbpParam)
    : effectiveState
  const hrbpUpskillingActive = deriveWfrFlags(parentHrbpEffState).upskillingActive
  const upskillingInScope = hrbpUpskillingActive && dirInScope

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
  const [assignedPlans, _setAssignedPlans] = useState<Set<string>>(new Set())
  const [allPlansAssigned, setAllPlansAssigned] = useState(false)
  const [assignConfirmOpen, setAssignConfirmOpen] = useState(false)
  const [assignReviewed, setAssignReviewed] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [editingCourses, setEditingCourses] = useState(false)
  const [editingSkills, setEditingSkills] = useState(false)
  const [removedCourses, setRemovedCourses] = useState<Set<number>>(new Set())
  const [removedSkills, setRemovedSkills] = useState<Set<string>>(new Set())
  const [empSort, setEmpSort] = useState<{ col: 'name' | 'readiness' | 'upskilling', dir: 'asc' | 'desc' }>({ col: 'readiness', dir: 'desc' })
  const toggleEmpSort = (col: typeof empSort['col']) => setEmpSort(s => ({ col, dir: s.col === col && s.dir === 'desc' ? 'asc' : 'desc' }))

  if (!dept || !managerData) {
    return <Navigate to="/workforce" replace />
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
  const mgrUnrealizedValue = Math.round(dept.unrealizedValue * employees.length / Math.max(1, dept.employees))
  // Deltas for metric cards
  const readinessDelta = avgReadiness - rawAvgReadiness

  // Collection-related state
  const showCollection = collectionActive && !collectionComplete
  // Table hint
  const tableHint = showCollection
    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ display: 'inline-block', width: 3, height: 12, background: '#3b5bdb', borderRadius: 2, flexShrink: 0 }} />
        <span>Data collection in progress</span>
      </span>
    : upskillingActive
      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ display: 'inline-block', width: 3, height: 12, background: '#6366f1', borderRadius: 2, flexShrink: 0 }} />
          <span>{hrbpPlansCreated ? 'Upskilling complete' : 'Upskilling in progress'}</span>
        </span>
      : null

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
        {...(isHrbp || isManager ? { hexagonsVariant: 'default' as const } : { chevronsVariant: 'default' as const })}
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
            compactCards
            breadcrumb={(() => {
              // Manager persona — simple breadcrumb, no drill-up navigation
              if (isManager) {
                return (
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbPage>{mgr.manager}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                )
              }
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
                  // Use explicit directorParam from URL if available (more reliable), else hash-derive
                  const dirName = directorParam || DEMO_MANAGERS[(nh(deptName) + dirIdx * 7) % DEMO_MANAGERS.length]
                  const dirUrl = `/workforce?hrbp=${encodeURIComponent(h.hrbp)}&director=${encodeURIComponent(dirName)}&dept=${encodeURIComponent(deptName)}&dirIdx=${dirIdx}`
                  return (
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/workforce')}>Overview</BreadcrumbLink></BreadcrumbItem>
                        {!isHrbp && (<><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink onClick={() => navigate(`/workforce?hrbp=${encodeURIComponent(h.hrbp)}`)}><span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: -3, marginRight: 4 }}>shield_person</span>{h.hrbp}</BreadcrumbLink></BreadcrumbItem></>)}
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink onClick={() => navigate(dirUrl)}>{dirName}</BreadcrumbLink></BreadcrumbItem>
                        {seniorMgrParam && (<><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink onClick={() => navigate(`${dirUrl}&seniorMgr=${encodeURIComponent(seniorMgrParam)}&srStart=${encodeURIComponent(srStartParam)}`)}>{seniorMgrParam}</BreadcrumbLink></BreadcrumbItem></>)}
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
            heroCard={upskillingInScope && !hrbpPlansCreated && !allPlansAssigned ? (
              <div style={{ padding: '18px 24px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#dc2626', marginTop: 2, flexShrink: 0 }}>rocket_launch</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Development plans ready</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>
                      <strong>{displayEmployees.length}</strong> development plans have been created for your team.
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Review each plan and assign to employees to get started. Adoption scores will update as employees complete their plans.</div>
                  </div>
                </div>
                <button
                  type="button"
                  style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' }}
                  onClick={() => setAssignConfirmOpen(true)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assignment_turned_in</span>
                  Assign plans
                </button>
              </div>
            ) : undefined}
            name={mgr.manager}
            subtitle={`${mgr.title} · ${dept.name} · ${employees.length} employees`}
            readiness={{
              value: readinessDelta !== 0 ? (
                <>{avgReadiness}% <DeltaBadge delta={`${readinessDelta > 0 ? '+' : ''}${readinessDelta}pt`} up={readinessDelta > 0} /></>
              ) : `${avgReadiness}%`,
              description: <><span>Of the people AI can help — how many are using it today?</span><span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}>{collectionComplete ? `${readyCount} AI-ready of ${displayEmployees.length} in this team` : `Estimated: ${readyCount} of ${displayEmployees.length} may be AI-ready based on skill profiles`}</span></>,
              badge: collectionComplete
                ? <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#15803d', padding: '1px 7px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Measured</span>
                : <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#92400e', padding: '1px 7px', borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', verticalAlign: 'middle', letterSpacing: '0.02em' }}>Estimated</span>,
              onLearnMore: () => setOpenMetric('readiness'),
            }}
            potential={{ value: formatDollar(mgrUnrealizedValue), description: <><span>The annual productivity value waiting to be captured.</span><span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}><span style={{ fontWeight: 600, color: '#6366f1' }}>{dept.aiPotential}% AI potential</span> across {employees.length.toLocaleString()} employees — hours unlocked × BLS median wages</span></>, onLearnMore: () => setOpenMetric('potential') }}
            gap={{
              value: `${notReady.toLocaleString()} not ready`,
              description: <><span>Employees in augmentable roles who aren't yet AI-ready.</span><span style={{ display: 'block', color: '#94a3b8', marginTop: 3 }}>out of {displayEmployees.length} employees</span></>,
              onLearnMore: () => setOpenMetric('gap'),
            }}
            managerTable={{
              title: 'Manager summary',
              hint: dept.name,
              hideTitle: true,
              children: (
                <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                  <DataTableHeader>
                    <DataTableRow>
                      <DataTableHead style={{ width: '42%' }}>Manager</DataTableHead>
                      <DataTableHead metric style={{ width: '20%' }}>AI adoption</DataTableHead>
                      <DataTableHead numeric style={{ width: '12%' }}>Transformation gap</DataTableHead>
                      {upskillingInScope && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ width: '16%' }}>Upskilling</DataTableHead>}
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
                      <DataTableCell metric><DeptTableSoloBar variant="readiness" pct={avgReadiness} /></DataTableCell>
                      <DataTableCell align="right">
                        <span style={{ color: avgReadiness >= 50 ? '#15803d' : '#dc2626', fontWeight: 600 }}>{avgReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}</span>
                      </DataTableCell>
                      {upskillingInScope && (() => {
                        const mgrH = nameHash(mgr.manager)
                        const mgrPlanPct = hrbpPlansCreated
                          ? Math.min(100, 25 + (mgrH % 55) + 20)
                          : 0
                        const mgrDisplayPct = mgrPlanPct > 0 ? mgrPlanPct : assignedPlans.has(mgr.manager) ? Math.min(85, 10 + (mgrH % 55)) : 0
                        return (
                          <DataTableCell className="bg-[#fafbfc] border-l border-[#e2e8f0]" style={{ verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px 3px 6px', borderRadius: 100, background: '#eff3ff', border: '1px solid #c5d3f8', color: '#3b5bdb', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.4 }}
                                onClick={(e) => { e.stopPropagation(); setDevPlanEmployee({ name: mgr.manager, title: mgr.title, readinessPct: avgReadiness, displayReadiness: avgReadiness }); setEditingCourses(false); setRemovedCourses(new Set()) }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>description</span>{!(hrbpPlansCreated || allPlansAssigned) && 'Development plan'}
                              </button>
                              {(mgrDisplayPct > 0 || allPlansAssigned || assignedPlans.has(mgr.manager)) && (() => {
                                const bColor = mgrDisplayPct === 100 ? '#22c55e' : '#818cf8'
                                const tColor = mgrDisplayPct === 100 ? '#15803d' : '#6366f1'
                                return (
                                  <div className="wfr-dash__plan-progress" style={{ flex: '1 1 0', minWidth: 60 }}>
                                    <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                                      <div className="wfr-dash__plan-progress-fill" style={{ width: `${mgrDisplayPct}%`, background: bColor }} />
                                    </div>
                                    <span className="wfr-dash__plan-progress-label" style={{ color: tColor }}>{mgrDisplayPct}%</span>
                                  </div>
                                )
                              })()}
                            </div>
                          </DataTableCell>
                        )
                      })()}
                    </DataTableRow>
                  </DataTableBody>
                </DataTable>
              ),
            }}
            tableTitle={<>Team members <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 600, borderRadius: 8, padding: '1px 7px', marginLeft: 4, verticalAlign: 'middle' }}>{displayEmployees.length}</span></>}
            tableHint={tableHint}
          >
          <DataTable bordered style={{ tableLayout: 'fixed', width: '100%' }}>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead style={{ width: '18%', cursor: 'pointer' }} onClick={() => toggleEmpSort('name')}><span className="inline-flex items-center gap-1">Employee <SortIcon sortDir={empSort.col === 'name' ? empSort.dir : null} /></span></DataTableHead>
                <DataTableHead style={{ width: '16%' }}>Role</DataTableHead>
                <DataTableHead numeric style={{ width: '8%' }}>Tasks</DataTableHead>
                <DataTableHead metric style={{ width: upskillingInScope ? '20%' : '26%', cursor: 'pointer' }} onClick={() => toggleEmpSort('readiness')}><span className="inline-flex items-center gap-1">AI adoption <SortIcon sortDir={empSort.col === 'readiness' ? empSort.dir : null} /></span></DataTableHead>
                <DataTableHead numeric style={{ width: '12%', cursor: 'pointer' }} onClick={() => toggleEmpSort('readiness')}><span className="inline-flex items-center gap-1">Transformation gap <SortIcon sortDir={empSort.col === 'readiness' ? empSort.dir : null} /></span></DataTableHead>
                {upskillingInScope && <DataTableHead className="bg-[#f8fafc] border-l border-[#e2e8f0]" style={{ width: '16%', cursor: 'pointer' }} onClick={() => toggleEmpSort('upskilling')}><span className="inline-flex items-center gap-1">Upskilling <SortIcon sortDir={empSort.col === 'upskilling' ? empSort.dir : null} /></span></DataTableHead>}
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {[...displayEmployees].sort((a, b) => {
                const mul = empSort.dir === 'asc' ? 1 : -1
                if (empSort.col === 'name') return mul * a.name.localeCompare(b.name)
                if (empSort.col === 'upskilling') {
                  const ha = nameHash(a.name), hb = nameHash(b.name)
                  const pa = hrbpPlansCreated ? Math.min(100, 25 + (ha % 55) + 20) : (allPlansAssigned || assignedPlans.has(a.name) ? Math.min(85, 10 + (ha % 55)) : 0)
                  const pb = hrbpPlansCreated ? Math.min(100, 25 + (hb % 55) + 20) : (allPlansAssigned || assignedPlans.has(b.name) ? Math.min(85, 10 + (hb % 55)) : 0)
                  return mul * (pa - pb)
                }
                return mul * (a.displayReadiness - b.displayReadiness)
              }).map((emp, i) => {
                const h = nameHash(emp.name)
                const empTaskCount = emp.title ? getTasksForRole(emp.title).length : 0

                // Plan progress: 0 until state 5 (hrbpPlansCreated); Assign button shows until then
                const planPct = hrbpPlansCreated
                  ? Math.min(100, 25 + (h % 55) + 20)
                  : 0
                // Readiness trend badge
                const empDelta = emp.displayReadiness - emp.readinessPct

                return (
                  <DataTableRow key={`emp-${i}`}>
                    <DataTableCell className="font-semibold" style={
                      (showCollection && dirInScope) ? { borderLeft: '3px solid #3b5bdb', paddingLeft: 17 } :
                      upskillingInScope ? { borderLeft: '3px solid #6366f1', paddingLeft: 17 } :
                      { borderLeft: '3px solid transparent', paddingLeft: 17 }
                    }>
                      <div className="text-[13px] text-[#1a212e]">{emp.name}</div>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="text-[13px] text-[#475569]">{emp.title ?? '—'}</div>
                    </DataTableCell>
                    <DataTableCell align="right">
                      {empTaskCount > 0 && emp.title ? (
                        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', fontSize: 12, fontWeight: 600, color: '#3b5bdb', cursor: 'pointer' }}>
                          {empTaskCount}
                        </button>
                      ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </DataTableCell>
                    <DataTableCell metric>
                      <div>
                        {collectionComplete && empDelta !== 0 ? (
                          <div className="wfr-dash__readiness-with-trend">
                            <DeptTableSoloBar variant="readiness" pct={emp.displayReadiness} />
                            <span className={`wfr-dash__trend-badge ${empDelta >= 0 ? 'wfr-dash__trend-badge--up' : 'wfr-dash__trend-badge--down'}`}>
                              <span className="wfr-dash__trend-badge-text">{empDelta >= 0 ? '↑' : '↓'}{Math.abs(empDelta)}pt</span>
                            </span>
                          </div>
                        ) : <DeptTableSoloBar variant="readiness" pct={emp.displayReadiness} />}
                      </div>
                    </DataTableCell>
                    <DataTableCell align="right">
                      <span style={{ color: emp.displayReadiness >= 50 ? '#15803d' : '#dc2626', fontWeight: 600 }}>
                        {emp.displayReadiness >= 50 ? 'AI-ready' : 'Not AI-ready'}
                      </span>
                    </DataTableCell>

                    {/* Upskilling status — dev plan chip; post-assign: progress bar */}
                    {upskillingInScope ? (
                      <DataTableCell metric className="!whitespace-normal">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <button
                            type="button"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px 3px 6px', borderRadius: 100, background: '#eff3ff', border: '1px solid #c5d3f8', color: '#3b5bdb', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.4 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setDevPlanEmployee({ name: emp.name, title: emp.title, readinessPct: emp.readinessPct, displayReadiness: emp.displayReadiness })
                              setEditingCourses(false)
                              setRemovedCourses(new Set())
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>description</span>
                            {!(hrbpPlansCreated || allPlansAssigned) && 'Development plan'}
                          </button>
                          {(planPct > 0 || allPlansAssigned || assignedPlans.has(emp.name)) && (() => {
                            const displayPct = planPct > 0 ? planPct : Math.min(85, 10 + (h % 55))
                            const bColor = displayPct === 100 ? '#22c55e' : '#818cf8'
                            const tColor = displayPct === 100 ? '#15803d' : '#6366f1'
                            return (
                              <div className="wfr-dash__plan-progress" style={{ flex: '1 1 0', minWidth: 60 }}>
                                <div className="wfr-dash__plan-progress-bar" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                                  <div className="wfr-dash__plan-progress-fill" style={{ width: `${displayPct}%`, background: bColor }} />
                                </div>
                                <span className="wfr-dash__plan-progress-label" style={{ color: tColor }}>{displayPct}%</span>
                              </div>
                            )
                          })()}
                        </div>
                      </DataTableCell>
                    ) : null}
                  </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>

          </PersonDetailLayout>
        </div>
      </main>

      {/* Dev plan sheet */}
      {devPlanEmployee && createPortal(
        <div className="mgr-detail-page__plan-overlay" onClick={() => { setDevPlanEmployee(null); setEditingCourses(false); setEditingSkills(false) }}>
          <div className="mgr-detail-page__plan-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mgr-detail-page__plan-header">
              <div>
                <h3 className="mgr-detail-page__plan-name">{devPlanEmployee.name}</h3>
                <p className="mgr-detail-page__plan-meta">{devPlanEmployee.title} · {dept.name} — Development plan</p>
              </div>
              <button type="button" className="mgr-detail-page__plan-close" onClick={() => { setDevPlanEmployee(null); setEditingCourses(false); setEditingSkills(false) }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <div className="mgr-detail-page__plan-body">
              {/* Status row */}
              {(() => {
                const isAssigned = assignedPlans.has(devPlanEmployee.name)
                const planHash = devPlanEmployee.name.split('').reduce((h2: number, c: string) => ((h2 << 5) - h2 + c.charCodeAt(0)) | 0, 0)
                const overallPct = isAssigned ? (Math.abs(planHash) % 100 > 85 ? 100 : Math.abs(planHash) % 100 > 20 ? (20 + Math.abs(planHash) % 60) : 0) : 0
                const overallStatus = !isAssigned ? 'Not assigned' : overallPct === 100 ? 'Completed' : overallPct > 0 ? 'In progress' : 'Not started'
                const statusColor = overallStatus === 'Completed' ? '#15803d' : overallStatus === 'In progress' ? '#6366f1' : overallStatus === 'Not assigned' ? '#d97706' : '#94a3b8'
                const statusIcon = overallStatus === 'Completed' ? 'check_circle' : overallStatus === 'In progress' ? 'sync' : 'schedule'
                return (
                  <>
                    <div style={{ display: 'flex', gap: 24, marginBottom: isAssigned ? 12 : 20 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>Status</div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: statusColor }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{statusIcon}</span>
                          {overallStatus}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>AI adoption</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: devPlanEmployee.displayReadiness >= 50 ? '#15803d' : '#dc2626' }}>
                          {devPlanEmployee.displayReadiness}%
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>Gap status</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: devPlanEmployee.displayReadiness < 50 ? '#dc2626' : '#15803d' }}>
                          {devPlanEmployee.displayReadiness < 50 ? 'Not AI-ready' : 'AI-ready'}
                        </span>
                      </div>
                    </div>
                    {isAssigned && (
                      <div style={{ marginBottom: 20, padding: '12px 14px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#1a212e' }}>Plan progress</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>{overallPct}%</span>
                        </div>
                        <div style={{ background: 'rgba(99, 102, 241, 0.08)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${overallPct}%`, background: overallPct === 100 ? '#22c55e' : '#818cf8', height: 6, borderRadius: 3, transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}

              {/* Courses */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 className="mgr-detail-page__plan-section-title" style={{ margin: 0 }}>Courses</h4>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: editingCourses ? '#15803d' : '#3b5bdb', fontSize: 12, fontWeight: 500 }}
                  onClick={() => setEditingCourses(!editingCourses)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{editingCourses ? 'check' : 'edit'}</span>
                    {editingCourses ? 'Done' : 'Edit'}
                  </span>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {devPlanCourses.map((c, i) => {
                  if (removedCourses.has(i)) return null
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                      <div style={{ flex: 1 }}>
                        <div className="mgr-detail-page__plan-course-name">{c.course}</div>
                        <div className="mgr-detail-page__plan-course-meta">{c.provider} · {c.duration} · {c.level}{c.free ? ' · Free to audit' : ''}</div>
                      </div>
                      {editingCourses && (
                        <button
                          type="button"
                          className="material-symbols-outlined"
                          style={{ fontSize: 18, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                          onClick={() => setRemovedCourses(prev => new Set([...prev, i]))}
                        >
                          remove_circle
                        </button>
                      )}
                    </div>
                  )
                })}
                {editingCourses && (
                  <button
                    type="button"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', borderRadius: 8, border: '1px dashed #c7d2fe', background: '#fafbff', cursor: 'pointer', color: '#3b5bdb', fontSize: 13, fontWeight: 500 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    Add course
                  </button>
                )}
              </div>

              {/* Skills */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 }}>
                <h4 className="mgr-detail-page__plan-section-title" style={{ margin: 0 }}>Skills to develop</h4>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: editingSkills ? '#15803d' : '#3b5bdb', fontSize: 12, fontWeight: 500 }}
                  onClick={() => setEditingSkills(!editingSkills)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{editingSkills ? 'check' : 'edit'}</span>
                    {editingSkills ? 'Done' : 'Edit'}
                  </span>
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {devPlanSkills.filter(s => !removedSkills.has(s)).map((s) => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: '#eef2ff', border: '1px solid #c7d2fe', fontSize: 12, fontWeight: 500, color: '#4338ca' }}>
                    {s}
                    {editingSkills && (
                      <button
                        type="button"
                        className="material-symbols-outlined"
                        style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0, lineHeight: 1 }}
                        onClick={() => setRemovedSkills(prev => new Set([...prev, s]))}
                      >
                        close
                      </button>
                    )}
                  </span>
                ))}
                {editingSkills && (
                  <button
                    type="button"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: '#fafbff', border: '1px dashed #c7d2fe', fontSize: 12, fontWeight: 500, color: '#3b5bdb', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                    Add skill
                  </button>
                )}
              </div>

              {/* Estimated completion */}
              <div style={{ marginTop: 20, padding: '12px 14px', background: '#fefce8', borderRadius: 8, border: '1px solid #fde68a' }}>
                <div style={{ fontSize: 12, color: '#92400e' }}>
                  <strong>Estimated completion:</strong> 6–8 weeks after assignment · ~46 hours of coursework
                </div>
              </div>
            </div>

            <div className="mgr-detail-page__plan-footer">
              <span style={{ fontSize: 13, color: '#64748b' }}>{devPlanCourses.filter((_, i) => !removedCourses.has(i)).length} courses · {devPlanSkills.filter(s => !removedSkills.has(s)).length} skills</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={() => { setDevPlanEmployee(null); setEditingCourses(false); setEditingSkills(false) }}>Close</Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Assign plans confirmation dialog */}
      {assignConfirmOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={() => setAssignConfirmOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', maxWidth: 420, width: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#dc2626' }}>assignment_turned_in</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Assign development plans</h3>
            </div>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 24, lineHeight: 1.6 }}>
              This will assign development plans to all <strong>{displayEmployees.length} employees</strong> on your team. They'll receive a notification and can start their AI upskilling courses immediately.
            </p>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={assignReviewed}
                onChange={e => setAssignReviewed(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: '#0ea5e9', flexShrink: 0, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.5 }}>
                I've reviewed the development plans for my team and confirm they're ready to assign.
              </span>
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="secondary" onClick={() => { setAssignConfirmOpen(false); setAssignReviewed(false) }}>Cancel</Button>
              <button
                type="button"
                disabled={!assignReviewed}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 8, background: assignReviewed ? '#dc2626' : '#e2e8f0', color: assignReviewed ? '#fff' : '#94a3b8', fontSize: 14, fontWeight: 600, cursor: assignReviewed ? 'pointer' : 'not-allowed', border: 'none', transition: 'background 0.15s, color 0.15s' }}
                onClick={() => {
                  if (!assignReviewed) return
                  setAllPlansAssigned(true)
                  setAssignConfirmOpen(false)
                  setAssignReviewed(false)
                  setToast(`Development plans assigned to all ${displayEmployees.length} employees`)
                  setTimeout(() => setToast(null), 4000)
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assignment_turned_in</span>
                Assign all plans
              </button>
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
      {toast && createPortal(
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', borderRadius: 10, background: '#0f172a', color: '#fff', fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 10000, animation: 'fadeInUp 0.3s ease-out', whiteSpace: 'nowrap' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4ade80' }}>check_circle</span>
          {toast}
        </div>,
        document.body
      )}
    </div>
  )
}
