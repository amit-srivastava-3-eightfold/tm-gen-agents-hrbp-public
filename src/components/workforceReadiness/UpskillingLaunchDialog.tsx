import * as Dialog from '@radix-ui/react-dialog'
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Button,
  Stepper, StepperList, StepperItem, StepperTrigger, StepperSeparator, StepperIndicator, StepperTitle,
} from '@tonyh-2-eightfold/ef-design-system'
import { departments, deptGapHeadcount, tGap } from '../../data/wfrOrgData'
import './FocusFirstLaunchDialog.css' // reuse same dialog styles

export type UpskillingAssignOwner = 'hrbp' | 'self'

export type UpskillingLaunchSummary = {
  assignOwner: UpskillingAssignOwner
  delegated: boolean
  scopeLabel: string
  departmentNames: string[]
  totalEmployees: number
  /** Departments whose plans have been assigned to employees */
  plansAssigned?: string[]
  /** Director/manager names selected for upskilling (HRBP flow only) */
  selectedDirectorNames?: string[]
}

export interface UpskillingLaunchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLaunch?: (summary: UpskillingLaunchSummary) => void
  /** Department names to pre-select (priority departments). */
  priorityDeptNames?: string[]
  /** Department names already in an upskilling launch — excluded from the list. */
  excludeDeptNames?: string[]
}

const ASSIGN_OPTIONS: { value: UpskillingAssignOwner; label: string; desc: string }[] = [
  { value: 'hrbp', label: 'Assign to HRBPs', desc: 'Each HRBP creates development plans for their departments' },
  { value: 'self', label: "I'll manage it", desc: 'You create and manage development plans yourself' },
]

export function UpskillingLaunchDialog({
  open,
  onOpenChange,
  onLaunch,
  priorityDeptNames = [],
  excludeDeptNames = [],
}: UpskillingLaunchDialogProps) {
  const [step, setStep] = useState(1)
  const [assignOwner, setAssignOwner] = useState<UpskillingAssignOwner>('hrbp')
  const [scopeMode, setScopeMode] = useState<'all' | 'select'>('all')
  const [selectedDepts, setSelectedDepts] = useState<Record<string, boolean>>({})

  const delegated = assignOwner === 'hrbp'
  const stepLabels = ['Assign', 'Departments', 'Review'] as const
  const totalSteps = 3

  // Pre-select priority departments when dialog opens (only on open transition)
  const priorityKey = priorityDeptNames.join(',')
  useEffect(() => {
    if (open) {
      setStep(1)
      setAssignOwner('hrbp')
      setScopeMode('all')
      const initial: Record<string, boolean> = {}
      for (const name of priorityDeptNames) initial[name] = true
      setSelectedDepts(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, priorityKey])

  const excludeSet = useMemo(() => new Set(excludeDeptNames), [excludeDeptNames])
  const deptsByGap = useMemo(() => {
    return [...departments]
      .filter((d) => !excludeSet.has(d.name))
      .sort((a, b) => (b.aiPotential - b.aiReadiness) - (a.aiPotential - a.aiReadiness))
  }, [excludeSet])

  const selectedNames = useMemo(() => {
    return Object.keys(selectedDepts).filter((k) => selectedDepts[k])
  }, [selectedDepts])

  const selectedEmployeeCount = useMemo(() => {
    return selectedNames.reduce((sum, name) => {
      const dept = departments.find((d) => d.name === name)
      return sum + (dept?.employees ?? 0)
    }, 0)
  }, [selectedNames])

  const scopeLabel = useMemo(() => {
    if (selectedNames.length === departments.length) return `All ${departments.length} departments`
    if (selectedNames.length === 1) return selectedNames[0]
    return `${selectedNames.length} departments`
  }, [selectedNames])

  const canProceedDepts = selectedNames.length > 0

  const toggleDept = (name: string) => {
    setSelectedDepts((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const handleLaunch = () => {
    const finalNames = scopeMode === 'all'
      ? deptsByGap.map((d) => d.name)
      : selectedNames
    const finalEmployees = scopeMode === 'all'
      ? deptsByGap.reduce((sum, d) => sum + d.employees, 0)
      : selectedEmployeeCount
    const finalLabel = scopeMode === 'all'
      ? `All ${deptsByGap.length} departments`
      : scopeLabel
    onLaunch?.({
      assignOwner,
      delegated,
      scopeLabel: finalLabel,
      departmentNames: finalNames,
      totalEmployees: finalEmployees,
    })
    onOpenChange(false)
  }

  /* ── Step renderers ── */

  function renderAssign(): ReactNode {
    return (
      <>
        <h2 className="wfr-focus-launch__title">Who should manage upskilling?</h2>
        <p className="wfr-focus-launch__sub">Assign to HRBPs or manage development plans yourself.</p>
        <div className="wfr-focus-launch__options" role="radiogroup" aria-label="Assignment">
          {ASSIGN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={assignOwner === opt.value}
              className={`wfr-focus-launch__option ${assignOwner === opt.value ? 'wfr-focus-launch__option--selected' : ''}`}
              onClick={() => setAssignOwner(opt.value)}
            >
              <span className="wfr-focus-launch__radio">
                {assignOwner === opt.value ? <span className="wfr-focus-launch__radio-dot" /> : null}
              </span>
              <span className="wfr-focus-launch__option-text">
                <span className="wfr-focus-launch__option-label">{opt.label}</span>
                <span className="wfr-focus-launch__option-desc">{opt.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </>
    )
  }

  function renderDepartments(): ReactNode {
    const totalGapCount = deptsByGap.reduce((sum, d) => sum + deptGapHeadcount(d), 0)
    const totalEmployeeCount = deptsByGap.reduce((sum, d) => sum + d.employees, 0)
    return (
      <>
        <h2 className="wfr-focus-launch__title">Which departments need development plans?</h2>
        <p className="wfr-focus-launch__sub">Development plans will be created and assigned to {'close adoption gaps'} across selected departments.</p>
        <div className="wfr-focus-launch__options" role="radiogroup" aria-label="Upskilling scope">
          <button
            type="button"
            role="radio"
            aria-checked={scopeMode === 'all'}
            className={`wfr-focus-launch__option${scopeMode === 'all' ? ' wfr-focus-launch__option--selected' : ''}`}
            onClick={() => {
              setScopeMode('all')
              const next: Record<string, boolean> = {}
              for (const d of deptsByGap) next[d.name] = true
              setSelectedDepts(next)
            }}
          >
            <span className="wfr-focus-launch__radio" aria-hidden>
              {scopeMode === 'all' ? <span className="wfr-focus-launch__radio-dot" /> : null}
            </span>
            <span className="wfr-focus-launch__option-text">
              <span className="wfr-focus-launch__option-label">All departments</span>
              <span className="wfr-focus-launch__option-desc">
                {deptsByGap.length} departments, {totalEmployeeCount.toLocaleString()} employees — {totalGapCount.toLocaleString()} to upskill
              </span>
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={scopeMode === 'select'}
            className={`wfr-focus-launch__option${scopeMode === 'select' ? ' wfr-focus-launch__option--selected' : ''}`}
            onClick={() => setScopeMode('select')}
          >
            <span className="wfr-focus-launch__radio" aria-hidden>
              {scopeMode === 'select' ? <span className="wfr-focus-launch__radio-dot" /> : null}
            </span>
            <span className="wfr-focus-launch__option-text">
              <span className="wfr-focus-launch__option-label">Start with specific departments</span>
              <span className="wfr-focus-launch__option-desc">Recommended: begin where the gaps are largest</span>
            </span>
          </button>
        </div>
        {scopeMode === 'select' ? (
          <div style={{ marginTop: 16 }}>
            <div className="wfr-focus-launch__dept-list-header">
              <span className="wfr-focus-launch__dept-count" style={{ paddingLeft: 14 }}>{selectedNames.length} of {deptsByGap.length} selected</span>
            </div>
            <div className="wfr-focus-launch__dept-list">
              {deptsByGap.map((d, idx) => {
                const checked = !!selectedDepts[d.name]
                const gapPp = tGap(d.aiPotential, d.aiReadiness)
                const gapCount = deptGapHeadcount(d)
                const severity = gapPp >= 50 ? 'high' : gapPp >= 30 ? 'mid' : 'low'
                const isRecommended = idx < 3
                const mgrCount = Math.max(2, Math.round(d.employees / 60))
                return (
                  <button
                    key={d.name}
                    type="button"
                    className={`wfr-focus-launch__dept-row ${checked ? 'wfr-focus-launch__dept-row--on' : ''}`}
                    onClick={() => toggleDept(d.name)}
                  >
                    <span className="wfr-focus-launch__check">
                      {checked ? '✓' : ''}
                    </span>
                    <div className="wfr-focus-launch__dept-info">
                      <div className="wfr-focus-launch__dept-name-row">
                        <span className="wfr-focus-launch__dept-name">{d.name}</span>
                        {isRecommended && (
                          <span className="wfr-focus-launch__recommended-tag">Top priority</span>
                        )}
                      </div>
                      <span className="wfr-focus-launch__dept-detail">
                        {mgrCount} HRBPs · {d.employees.toLocaleString()} employees
                      </span>
                    </div>
                    <span className={`wfr-focus-launch__gap-pill wfr-focus-launch__gap-pill--${severity}`}>
                      {gapCount.toLocaleString()} to upskill
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </>
    )
  }

  function renderReview(): ReactNode {
    return (
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
              <p className="wfr-focus-launch__review-k">Departments</p>
              <p className="wfr-focus-launch__review-v">{scopeLabel}</p>
            </div>
            <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(2)}>Edit</button>
          </div>
          <div className="wfr-focus-launch__review-row">
            <div>
              <p className="wfr-focus-launch__review-k">Employees</p>
              <p className="wfr-focus-launch__review-v">{selectedEmployeeCount.toLocaleString()} across selected departments</p>
            </div>
          </div>
          <div className="wfr-focus-launch__review-row">
            <div>
              <p className="wfr-focus-launch__review-k">Action</p>
              <p className="wfr-focus-launch__review-v wfr-focus-launch__review-v--muted">
                {delegated
                  ? 'HRBPs will create development plans for employees in their departments'
                  : 'You will create and manage development plans'}
              </p>
            </div>
          </div>
        </div>
      </>
    )
  }

  /* ── Stepper ── */

  function renderStepper(): ReactNode {
    return (
      <Stepper value={step - 1} size="sm" className="mt-3 mb-4" style={{ maxWidth: 360 }}>
        <StepperList>
          {stepLabels.map((label, i) => (
            <Fragment key={label}>
              {i > 0 && <StepperSeparator />}
              <StepperItem step={i}>
                <StepperTrigger>
                  <StepperIndicator />
                  <StepperTitle>{label}</StepperTitle>
                </StepperTrigger>
              </StepperItem>
            </Fragment>
          ))}
        </StepperList>
      </Stepper>
    )
  }

  /* ── Body ── */

  let body: ReactNode
  if (step === 1) body = renderAssign()
  else if (step === 2) body = renderDepartments()
  else body = renderReview()

  const canNext = step === 1 ? true : step === 2 ? canProceedDepts : true

  const portalContainer = typeof document !== 'undefined' ? document.body : undefined

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal container={portalContainer}>
        <Dialog.Overlay className="wfr-focus-launch__overlay" />
        <Dialog.Content className="wfr-focus-launch__content" aria-describedby={undefined}>
          <div className="wfr-focus-launch__header">
            <div className="wfr-focus-launch__header-top">
              <Dialog.Title className="wfr-focus-launch__dialog-title">Start upskilling</Dialog.Title>
              <Dialog.Close className="wfr-focus-launch__close" aria-label="Close">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </Dialog.Close>
            </div>
            {renderStepper()}
          </div>

          <div className="wfr-focus-launch__body">
            {body}
          </div>

          <div className="wfr-focus-launch__footer">
            {step === 1 ? (
              <>
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="button" variant="primary" onClick={() => setStep(2)}>Next&nbsp;→</Button>
              </>
            ) : step < totalSteps ? (
              <>
                <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>
                <Button type="button" variant="primary" disabled={!canNext} onClick={() => setStep(step + 1)}>Next&nbsp;→</Button>
              </>
            ) : (
              <>
                <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>
                <Button type="button" variant="primary" onClick={handleLaunch}>Start upskilling&nbsp;→</Button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
