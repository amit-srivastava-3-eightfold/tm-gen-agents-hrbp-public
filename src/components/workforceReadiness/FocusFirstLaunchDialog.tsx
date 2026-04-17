import * as Dialog from '@radix-ui/react-dialog'
import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button, Stepper, StepperList, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperSeparator, Tabs, TabsList, TabsTrigger, DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableHead, DataTableCell } from '@tonyh-2-eightfold/ef-design-system'
import { departments, hrbpAssignments, deptGapHeadcount, formatDollar } from '../../data/wfrOrgData'
import './FocusFirstLaunchDialog.css'

export type FocusAssignOwner = 'hrbp' | 'self'

export type FocusCollectionLaunchSummary = {
  assignOwner: FocusAssignOwner
  scopeLabel: string
  channelsLabel: string
  delegated: boolean
  scopedDepartmentNames: string[]
  selectedHrbpNames?: string[]
}

export type HrbpDirector = {
  name: string
  title: string
  employees: number
  teamManagers: number
  readiness?: number
  readyCount?: number
  aiPotential?: number
}

export interface FocusFirstLaunchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLaunch?: (summary: FocusCollectionLaunchSummary) => void
  initialStep?: 1 | 2 | 3 | 4
  defaultScopeDepartmentName?: string
  /** When true, show simplified dialog: Channels + Review only (for HRBP-initiated collection) */
  hrbpMode?: boolean
  /** Callback for HRBP mode launch — passes channels label and selected director names */
  onHrbpLaunch?: (channelsLabel: string, selectedDirectors?: string[]) => void
  /** Directors/client managers for HRBP team selection */
  hrbpDirectors?: HrbpDirector[]
}

// Unique HRBPs with their departments, headcount, and priority score
const uniqueHrbps = (() => {
  const map = new Map<string, { hrbp: string; depts: string[]; headcount: number }>()
  for (const a of hrbpAssignments) {
    if (!map.has(a.hrbp)) map.set(a.hrbp, { hrbp: a.hrbp, depts: [], headcount: 0 })
    const entry = map.get(a.hrbp)!
    entry.depts.push(a.dept)
    entry.headcount += a.headcount
  }
  return [...map.values()].map(row => {
    const deptObjs = row.depts.map(name => departments.find(d => d.name === name)).filter(Boolean) as typeof departments
    const totalHc = deptObjs.reduce((s, d) => s + d.employees, 0) || row.headcount
    const avgPotential = totalHc > 0 ? Math.round(deptObjs.reduce((s, d) => s + d.aiPotential * d.employees, 0) / totalHc) : 0
    const avgReadiness = totalHc > 0 ? Math.round(deptObjs.reduce((s, d) => s + d.aiReadiness * d.employees, 0) / totalHc) : 0
    const priorityScore = (avgPotential - avgReadiness) * (avgPotential - avgReadiness) / 100
    const totalUnrealizedValue = deptObjs.reduce((s, d) => s + d.unrealizedValue, 0)
    return { ...row, avgPotential, avgReadiness, priorityScore, totalUnrealizedValue }
  }).sort((a, b) => b.totalUnrealizedValue - a.totalUnrealizedValue)
})()

// Top ~30% of HRBPs by priority score get the Priority tag
const hrbpPrioritySet = (() => {
  if (uniqueHrbps.length === 0) return new Set<string>()
  const count = Math.max(1, Math.round(uniqueHrbps.length * 0.3))
  return new Set(uniqueHrbps.slice(0, count).map(h => h.hrbp))
})()

function PriorityTooltip({ tooltip, children }: { tooltip: string; children: ReactNode }) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<{ cx: number; y: number } | null>(null)
  const [left, setLeft] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (anchor && tipRef.current) {
      const w = tipRef.current.offsetWidth
      const clamped = Math.max(8, Math.min(window.innerWidth - w - 8, anchor.cx - w / 2))
      setLeft(clamped)
      setReady(true)
    }
  }, [anchor])

  return (
    <span
      ref={triggerRef}
      style={{ display: 'inline-flex', flexShrink: 0 }}
      onMouseEnter={() => {
        const r = triggerRef.current?.getBoundingClientRect()
        if (r) { setReady(false); setAnchor({ cx: r.left + r.width / 2, y: r.top }) }
      }}
      onMouseLeave={() => { setAnchor(null); setReady(false) }}
    >
      {children}
      {anchor && createPortal(
        <div ref={tipRef} style={{ position: 'fixed', top: anchor.y - 6, left, transform: 'translateY(-100%)', opacity: ready ? 1 : 0, background: '#1e293b', color: '#fff', fontSize: 12, fontWeight: 400, lineHeight: 1.5, borderRadius: 6, padding: '7px 10px', maxWidth: 160, zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', pointerEvents: 'none' }}>
          {tooltip}
          <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1e293b' }} />
        </div>,
        document.body
      )}
    </span>
  )
}

export function FocusFirstLaunchDialog({
  open,
  onOpenChange,
  onLaunch,
  defaultScopeDepartmentName: _defaultScope,
  hrbpMode = false,
  onHrbpLaunch,
  hrbpDirectors,
}: FocusFirstLaunchDialogProps) {
  const [step, setStep] = useState(1)
  const [assignOwner, setAssignOwner] = useState<FocusAssignOwner>('hrbp')
  const [scopeBy, setScopeBy] = useState<'hrbps' | 'departments'>('hrbps')
  const [selectedDepts, setSelectedDepts] = useState<Record<string, boolean>>({})
  const [selectedHrbps, setSelectedHrbps] = useState<Record<string, boolean>>({})
  const [hrbpSelectedDirs, setHrbpSelectedDirs] = useState<Record<string, boolean>>({})

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setStep(1)
      setAssignOwner('hrbp')
      setScopeBy('hrbps')
      setSelectedDepts({})
      setSelectedHrbps({})
      // Default all directors selected
      if (hrbpDirectors?.length) {
        const all: Record<string, boolean> = {}
        hrbpDirectors.forEach(d => { all[d.name] = true })
        setHrbpSelectedDirs(all)
      } else {
        setHrbpSelectedDirs({})
      }
    }
  }, [open, hrbpDirectors])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
  }

  const delegated = assignOwner === 'hrbp'

  // Both flows: Assign → Scope → Review (channel is org-level config, not a user choice)

  // Derive selected HRBP names from either direct selection or department-based derivation
  const selectedHrbpNames = useMemo(() => {
    if (scopeBy === 'hrbps') {
      return Object.keys(selectedHrbps).filter(k => selectedHrbps[k])
    }
    // Derive HRBPs from selected departments
    const selDepts = Object.keys(selectedDepts).filter(k => selectedDepts[k])
    if (selDepts.length === 0) return []
    const deptSet = new Set(selDepts)
    const hrbpSet = new Set<string>()
    for (const a of hrbpAssignments) {
      if (deptSet.has(a.dept)) hrbpSet.add(a.hrbp)
    }
    return [...hrbpSet]
  }, [scopeBy, selectedHrbps, selectedDepts])

  const scopedDeptNames = useMemo(() => {
    if (scopeBy === 'departments') {
      const selDepts = Object.keys(selectedDepts).filter(k => selectedDepts[k])
      return selDepts.length > 0 ? selDepts : departments.map(d => d.name)
    }
    // Derive departments from selected HRBPs
    if (selectedHrbpNames.length === 0) return departments.map(d => d.name)
    const deptSet = new Set<string>()
    for (const a of hrbpAssignments) {
      if (selectedHrbpNames.includes(a.hrbp)) deptSet.add(a.dept)
    }
    return [...deptSet]
  }, [scopeBy, selectedDepts, selectedHrbpNames])

  const hasSelection = scopeBy === 'hrbps' ? selectedHrbpNames.length > 0
    : Object.keys(selectedDepts).filter(k => selectedDepts[k]).length > 0

  const scopeLabel = useMemo(() => {
    if (scopeBy === 'hrbps') {
      if (selectedHrbpNames.length === 0) return `All ${uniqueHrbps.length} HRBPs`
      if (selectedHrbpNames.length === 1) return selectedHrbpNames[0]
      return `${selectedHrbpNames.length} HRBPs`
    }
    const selDepts = Object.keys(selectedDepts).filter(k => selectedDepts[k])
    if (selDepts.length === 0) return `All ${departments.length} departments`
    if (selDepts.length === 1) return selDepts[0]
    return `${selDepts.length} departments`
  }, [scopeBy, selectedHrbpNames, selectedDepts])

  const canNext = step === 1 ? true
    : step === 2 ? hasSelection
    : step === 3 ? true
    : true

  const isReviewStep = step === 3

  const handleLaunch = () => {
    onLaunch?.({
      assignOwner,
      scopeLabel,
      channelsLabel: 'AI Agent Interviews',
      delegated,
      scopedDepartmentNames: scopedDeptNames,
      selectedHrbpNames: delegated ? selectedHrbpNames : undefined,
    })
    onOpenChange(false)
  }

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  // ─── HRBP mode: 2-step dialog (select teams → review + launch) ───
  if (hrbpMode) {
    const hrbpDept = _defaultScope ? departments.find(dd => dd.name === _defaultScope) : null
    const rawDirs = hrbpDirectors ?? []
    // Sort directors by unrealized value (matches overview table sort)
    const dirs = [...rawDirs].sort((a, b) => b.employees - a.employees)
    const dirPriorityCount = Math.max(1, Math.round(dirs.length * 0.3))
    const dirPrioritySet = new Set(dirs.slice(0, dirPriorityCount).map(d => d.name))
    const hrbpSelCount = Object.values(hrbpSelectedDirs).filter(Boolean).length
    const hrbpAllSelected = hrbpSelCount === dirs.length
    const hrbpSelectedEmps = dirs.filter(d => hrbpSelectedDirs[d.name]).reduce((s, d) => s + d.employees, 0)
    const hrbpStep = step // reuse existing step state
    const hrbpIsReview = hrbpStep === 2
    const hrbpTeamLabel = hrbpSelCount === dirs.length
      ? `All ${dirs.length} teams`
      : hrbpSelCount === 1
        ? dirs.find(d => hrbpSelectedDirs[d.name])?.name ?? '1 team'
        : `${hrbpSelCount} teams`

    return (
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="wfr-focus-launch__overlay" />
          <Dialog.Content
            className="wfr-focus-launch__content"
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <div className="wfr-focus-launch__header">
              <div className="wfr-focus-launch__header-top">
                <Dialog.Title className="wfr-focus-launch__dialog-title">Launch data collection</Dialog.Title>
                <Dialog.Close className="wfr-focus-launch__close" aria-label="Close">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                </Dialog.Close>
              </div>
              <Stepper value={hrbpStep - 1} size="sm" className="mt-3 mb-4" style={{ maxWidth: 260 }}>
                <StepperList>
                  <StepperItem step={0}>
                    <StepperTrigger>
                      <StepperIndicator />
                      <StepperTitle>Teams</StepperTitle>
                    </StepperTrigger>
                  </StepperItem>
                  <StepperSeparator />
                  <StepperItem step={1}>
                    <StepperTrigger>
                      <StepperIndicator />
                      <StepperTitle>Review</StepperTitle>
                    </StepperTrigger>
                  </StepperItem>
                </StepperList>
              </Stepper>
            </div>
            <Dialog.Description className="sr-only">Select teams and launch AI-powered data collection.</Dialog.Description>
            <div className="wfr-focus-launch__body">

              {/* Step 1: Select client manager teams */}
              {hrbpStep === 1 && (
                <>
                  <h2 className="wfr-focus-launch__title">Select teams to include</h2>
                  <p className="wfr-focus-launch__sub">Choose which client manager teams to include in data collection. AI-powered interviews will be sent to employees in the selected teams.</p>

                  <div className="wfr-focus-launch__dept-list">
                    <DataTable bordered style={{ width: '100%' }}>
                      <DataTableHeader>
                        <DataTableRow>
                          <DataTableHead style={{ width: 28, padding: '8px 0 8px 14px' }}>
                            <span
                              className="wfr-focus-launch__check"
                              style={{ cursor: 'pointer', ...(hrbpAllSelected ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}) }}
                              onClick={() => { if (hrbpAllSelected) setHrbpSelectedDirs({}); else { const all: Record<string, boolean> = {}; dirs.forEach(d => { all[d.name] = true }); setHrbpSelectedDirs(all) } }}
                            >{hrbpAllSelected ? '✓' : ''}</span>
                          </DataTableHead>
                          <DataTableHead>Manager</DataTableHead>
                          <DataTableHead numeric>AI adoption</DataTableHead>
                          <DataTableHead numeric>Unrealized value</DataTableHead>
                          <DataTableHead numeric>Transformation gap</DataTableHead>
                        </DataTableRow>
                      </DataTableHeader>
                      <DataTableBody>
                        {dirs.map((dir) => {
                          const dirNotReady = dir.employees - (dir.readyCount ?? 0)
                          const dirUnrealized = dir.employees > 0 && hrbpDept ? Math.round(hrbpDept.unrealizedValue * dir.employees / Math.max(1, hrbpDept.employees)) : 0
                          return (
                            <DataTableRow key={dir.name} onClick={() => setHrbpSelectedDirs(prev => ({ ...prev, [dir.name]: !prev[dir.name] }))} style={{ cursor: 'pointer', ...(hrbpSelectedDirs[dir.name] ? { background: '#eef2ff' } : {}) }}>
                              <DataTableCell style={{ width: 28, padding: '10px 0 10px 14px' }}>
                                <span className="wfr-focus-launch__check" style={hrbpSelectedDirs[dir.name] ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}}>{hrbpSelectedDirs[dir.name] ? '✓' : ''}</span>
                              </DataTableCell>
                              <DataTableCell className="font-semibold">
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {dir.name}
                                  {dirPrioritySet.has(dir.name) && (
                                    <PriorityTooltip tooltip="Largest team — most employees to include in data collection">
                                      <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>Priority</span>
                                    </PriorityTooltip>
                                  )}
                                </span>
                              </DataTableCell>
                              <DataTableCell align="right">{dir.readiness ?? 0}%</DataTableCell>
                              <DataTableCell align="right">{formatDollar(dirUnrealized)}</DataTableCell>
                              <DataTableCell align="right">{dirNotReady.toLocaleString()} ({dir.employees > 0 ? Math.round((dirNotReady / dir.employees) * 100) : 0}%)</DataTableCell>
                            </DataTableRow>
                          )
                        })}
                      </DataTableBody>
                    </DataTable>
                  </div>
                </>
              )}

              {/* Step 2: Review */}
              {hrbpIsReview && (
                <>
                  <h2 className="wfr-focus-launch__title">Ready to launch</h2>
                  <p className="wfr-focus-launch__sub">Review your selections.</p>
                  <div className="wfr-focus-launch__review">
                    <div className="wfr-focus-launch__review-row">
                      <div>
                        <p className="wfr-focus-launch__review-k">Teams</p>
                        <p className="wfr-focus-launch__review-v">{hrbpTeamLabel} · {hrbpSelectedEmps.toLocaleString()} employees</p>
                      </div>
                      <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <div className="wfr-focus-launch__review-row">
                      <div>
                        <p className="wfr-focus-launch__review-k">Collection method</p>
                        <p className="wfr-focus-launch__review-v" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <img src="/ai-agent-icon.svg" alt="" style={{ width: 16, height: 16 }} />
                          AI Agent Interviews
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="wfr-focus-launch__footer">
              {hrbpStep === 1 ? (
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
              ) : (
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
              )}
              {hrbpIsReview ? (
                <Button type="button" variant="primary" onClick={() => { onHrbpLaunch?.('AI Agent Interviews', dirs.filter(d => hrbpSelectedDirs[d.name]).map(d => d.name)); onOpenChange(false) }}>Launch →</Button>
              ) : (
                <Button type="button" variant="primary" onClick={() => setStep(2)} disabled={hrbpSelCount === 0}>Next →</Button>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }

  // ─── Standard CHRO dialog ───
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="wfr-focus-launch__overlay" />
        <Dialog.Content
          className="wfr-focus-launch__content"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header + Stepper */}
          <div className="wfr-focus-launch__header">
            <div className="wfr-focus-launch__header-top">
              <Dialog.Title className="wfr-focus-launch__dialog-title">Data collection</Dialog.Title>
              <Dialog.Close className="wfr-focus-launch__close" aria-label="Close">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </Dialog.Close>
            </div>
            <Stepper value={step - 1} size="sm" className="mt-3 mb-4" style={{ maxWidth: 360 }}>
              <StepperList>
                <StepperItem step={0}>
                  <StepperTrigger>
                    <StepperIndicator />
                    <StepperTitle>Assign</StepperTitle>
                  </StepperTrigger>
                </StepperItem>
                <StepperSeparator />
                <StepperItem step={1}>
                  <StepperTrigger>
                    <StepperIndicator />
                    <StepperTitle>Scope</StepperTitle>
                  </StepperTrigger>
                </StepperItem>
                <StepperSeparator />
                <StepperItem step={2}>
                  <StepperTrigger>
                    <StepperIndicator />
                    <StepperTitle>Review</StepperTitle>
                  </StepperTrigger>
                </StepperItem>
              </StepperList>
            </Stepper>
          </div>

          <Dialog.Description className="sr-only">
            Step through assignment, scope, channels, and review to launch data collection.
          </Dialog.Description>

          {/* Body */}
          <div className="wfr-focus-launch__body">

            {/* Step 1: Assign */}
            {step === 1 && (
              <>
                <h2 className="wfr-focus-launch__title">Who should manage data collection?</h2>
                <p className="wfr-focus-launch__sub">Assign to HRBPs or manage it yourself.</p>
                <div className="wfr-focus-launch__options">
                  {([
                    { id: 'hrbp' as const, label: 'Assign to HRBPs', desc: 'Each HRBP manages collection for their departments' },
                    { id: 'self' as const, label: "I'll manage it", desc: 'You manage data collection yourself' },
                  ]).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`wfr-focus-launch__option ${assignOwner === opt.id ? 'wfr-focus-launch__option--selected' : ''}`}
                      onClick={() => setAssignOwner(opt.id)}
                    >
                      <span className="wfr-focus-launch__radio">
                        {assignOwner === opt.id ? <span className="wfr-focus-launch__radio-dot" /> : null}
                      </span>
                      <span className="wfr-focus-launch__option-text">
                        <span className="wfr-focus-launch__option-label">{opt.label}</span>
                        <span className="wfr-focus-launch__option-desc">{opt.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Scope — select by Departments or HRBPs */}
            {step === 2 && (
              <>
                <h2 className="wfr-focus-launch__title">Select scope</h2>
                <p className="wfr-focus-launch__sub">Choose departments or HRBPs to include in data collection.</p>

                {/* Toggle: Departments / HRBPs */}
                <Tabs value={scopeBy} onValueChange={(v: string) => setScopeBy(v as 'departments' | 'hrbps')} style={{ marginBottom: 12 }}>
                  <TabsList style={{ width: '100%' }}>
                    <TabsTrigger value="departments" style={{ flex: 1 }}>Departments</TabsTrigger>
                    <TabsTrigger value="hrbps" style={{ flex: 1 }}>HRBPs</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* List */}
                <div className="wfr-focus-launch__dept-list">
                  {scopeBy === 'hrbps'
                    ? (() => {
                        const allHrbpSelected = selectedHrbpNames.length === uniqueHrbps.length
                        return (
                        <DataTable bordered style={{ width: '100%' }}>
                          <DataTableHeader>
                            <DataTableRow>
                              <DataTableHead style={{ width: 28, padding: '8px 0 8px 14px' }}>
                                <span
                                  className="wfr-focus-launch__check"
                                  style={{ cursor: 'pointer', ...(allHrbpSelected ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}) }}
                                  onClick={() => { if (allHrbpSelected) setSelectedHrbps({}); else { const all: Record<string, boolean> = {}; uniqueHrbps.forEach(h => { all[h.hrbp] = true }); setSelectedHrbps(all) } }}
                                >{allHrbpSelected ? '✓' : ''}</span>
                              </DataTableHead>
                              <DataTableHead>HRBP</DataTableHead>
                              <DataTableHead numeric>AI adoption</DataTableHead>
                              <DataTableHead numeric>Unrealized value</DataTableHead>
                              <DataTableHead numeric>Transformation gap</DataTableHead>
                            </DataTableRow>
                          </DataTableHeader>
                          <DataTableBody>
                            {uniqueHrbps.map((h) => {
                              const hDept = departments.find(dd => dd.name === h.depts[0])
                              const hReadiness = hDept?.aiReadiness ?? 0
                              const hUnrealized = hDept ? Math.round(hDept.unrealizedValue * h.headcount / Math.max(1, hDept.employees)) : 0
                              const hGap = hDept ? Math.round(deptGapHeadcount(hDept) * h.headcount / Math.max(1, hDept.employees)) : 0
                              return (
                                <DataTableRow key={h.hrbp} onClick={() => setSelectedHrbps((prev) => ({ ...prev, [h.hrbp]: !prev[h.hrbp] }))} style={{ cursor: 'pointer', ...(selectedHrbps[h.hrbp] ? { background: '#eef2ff' } : {}) }}>
                                  <DataTableCell style={{ width: 28, padding: '10px 0 10px 14px' }}>
                                    <span className="wfr-focus-launch__check" style={selectedHrbps[h.hrbp] ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}}>{selectedHrbps[h.hrbp] ? '✓' : ''}</span>
                                  </DataTableCell>
                                  <DataTableCell className="font-semibold">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      {h.hrbp}
                                      {hrbpPrioritySet.has(h.hrbp) && (
                                        <PriorityTooltip tooltip="Highest priority score — widest gap between AI potential and current adoption">
                                          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '1px 7px', whiteSpace: 'nowrap' }}>Priority</span>
                                        </PriorityTooltip>
                                      )}
                                    </span>
                                  </DataTableCell>
                                  <DataTableCell align="right">{hReadiness}%</DataTableCell>
                                  <DataTableCell align="right">{formatDollar(hUnrealized)}</DataTableCell>
                                  <DataTableCell align="right">{hGap.toLocaleString()} ({h.headcount > 0 ? Math.round((hGap / h.headcount) * 100) : 0}%)</DataTableCell>
                                </DataTableRow>
                              )
                            })}
                          </DataTableBody>
                        </DataTable>)
                    })()
                    : (() => {
                        const allDeptSelected = Object.keys(selectedDepts).filter(k => selectedDepts[k]).length === departments.length
                        return (
                        <DataTable bordered style={{ width: '100%' }}>
                          <DataTableHeader>
                            <DataTableRow>
                              <DataTableHead style={{ width: 28, padding: '8px 0 8px 14px' }}>
                                <span
                                  className="wfr-focus-launch__check"
                                  style={{ cursor: 'pointer', ...(allDeptSelected ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}) }}
                                  onClick={() => { if (allDeptSelected) setSelectedDepts({}); else { const all: Record<string, boolean> = {}; departments.forEach(d => { all[d.name] = true }); setSelectedDepts(all) } }}
                                >{allDeptSelected ? '✓' : ''}</span>
                              </DataTableHead>
                              <DataTableHead>Department</DataTableHead>
                              <DataTableHead numeric>AI adoption</DataTableHead>
                              <DataTableHead numeric>Unrealized value</DataTableHead>
                              <DataTableHead numeric>Transformation gap</DataTableHead>
                            </DataTableRow>
                          </DataTableHeader>
                          <DataTableBody>
                            {departments.map((d) => {
                              const gapCount = deptGapHeadcount(d)
                              return (
                                <DataTableRow key={d.name} onClick={() => setSelectedDepts((prev) => ({ ...prev, [d.name]: !prev[d.name] }))} style={{ cursor: 'pointer', ...(selectedDepts[d.name] ? { background: '#eef2ff' } : {}) }}>
                                  <DataTableCell style={{ width: 28, padding: '10px 0 10px 14px' }}>
                                    <span className="wfr-focus-launch__check" style={selectedDepts[d.name] ? { borderColor: 'var(--wfr-potential-text, #6366f1)', background: 'var(--wfr-potential-text, #6366f1)', color: '#fff' } : {}}>{selectedDepts[d.name] ? '✓' : ''}</span>
                                  </DataTableCell>
                                  <DataTableCell className="font-semibold">{d.name}</DataTableCell>
                                  <DataTableCell align="right">{d.aiReadiness}%</DataTableCell>
                                  <DataTableCell align="right">{formatDollar(d.unrealizedValue)}</DataTableCell>
                                  <DataTableCell align="right">{gapCount.toLocaleString()} ({d.employees > 0 ? Math.round((gapCount / d.employees) * 100) : 0}%)</DataTableCell>
                                </DataTableRow>
                              )
                            })}
                          </DataTableBody>
                        </DataTable>)
                    })()}
                </div>
              </>
            )}

            {/* Step 3: Review */}
            {isReviewStep && (
              <>
                <h2 className="wfr-focus-launch__title">Ready to launch</h2>
                <p className="wfr-focus-launch__sub">Review your selections.</p>
                <div className="wfr-focus-launch__review">
                  <div className="wfr-focus-launch__review-row">
                    <div>
                      <p className="wfr-focus-launch__review-k">Owner</p>
                      <p className="wfr-focus-launch__review-v">{delegated ? 'HRBPs' : 'You'}</p>
                    </div>
                    <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <div className="wfr-focus-launch__review-row">
                    <div>
                      <p className="wfr-focus-launch__review-k">Scope</p>
                      <p className="wfr-focus-launch__review-v">{scopeLabel}</p>
                    </div>
                    <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(2)}>Edit</button>
                  </div>
                  <div className="wfr-focus-launch__review-row">
                    <div>
                      <p className="wfr-focus-launch__review-k">Collection method</p>
                      <p className="wfr-focus-launch__review-v" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src="/ai-agent-icon.svg" alt="" style={{ width: 16, height: 16 }} />
                        AI Agent Interviews
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="wfr-focus-launch__footer">
            {step === 1 ? (
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            ) : (
              <Button type="button" variant="secondary" onClick={handleBack}>Back</Button>
            )}
            {isReviewStep ? (
              <Button type="button" variant="primary" onClick={handleLaunch}>Launch →</Button>
            ) : (
              <Button type="button" variant="primary" onClick={handleNext} disabled={!canNext}>Next →</Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
