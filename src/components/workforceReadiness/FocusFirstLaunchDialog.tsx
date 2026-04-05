import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useMemo, useState } from 'react'
import { Button, Stepper, StepperList, StepperItem, StepperIndicator, StepperTitle, StepperSeparator } from '@tonyh-2-eightfold/ef-design-system'
import { departments, ORG, hrbpAssignments } from '../../data/wfrOrgData'
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

export interface FocusFirstLaunchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLaunch?: (summary: FocusCollectionLaunchSummary) => void
  initialStep?: 1 | 2 | 3 | 4
  defaultScopeDepartmentName?: string
}

// Unique HRBPs with their departments and headcount
const uniqueHrbps = (() => {
  const map = new Map<string, { hrbp: string; depts: string[]; headcount: number }>()
  for (const a of hrbpAssignments) {
    if (!map.has(a.hrbp)) map.set(a.hrbp, { hrbp: a.hrbp, depts: [], headcount: 0 })
    const entry = map.get(a.hrbp)!
    entry.depts.push(a.dept)
    entry.headcount += a.headcount
  }
  return [...map.values()].sort((a, b) => b.headcount - a.headcount)
})()

export function FocusFirstLaunchDialog({
  open,
  onOpenChange,
  onLaunch,
  defaultScopeDepartmentName: _defaultScope,
}: FocusFirstLaunchDialogProps) {
  const [step, setStep] = useState(1)
  const [assignOwner, setAssignOwner] = useState<FocusAssignOwner>('hrbp')
  const [scopeMode, setScopeMode] = useState<'all' | 'select'>('all')
  const [selectedDepts, setSelectedDepts] = useState<Record<string, boolean>>({})
  const [selectedHrbps, setSelectedHrbps] = useState<Record<string, boolean>>({})

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setStep(1)
      setAssignOwner('hrbp')
      setScopeMode('all')
      setSelectedDepts({})
      setSelectedHrbps({})
    }
  }, [open])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
  }

  const delegated = assignOwner === 'hrbp'

  // Total steps depends on flow
  const totalSteps = delegated ? 3 : 4

  const scopedDeptNames = useMemo(() => {
    if (delegated) {
      // Derive departments from selected HRBPs
      const selectedNames = Object.keys(selectedHrbps).filter(k => selectedHrbps[k])
      if (selectedNames.length === 0) return departments.map(d => d.name)
      const deptSet = new Set<string>()
      for (const a of hrbpAssignments) {
        if (selectedNames.includes(a.hrbp)) deptSet.add(a.dept)
      }
      return [...deptSet]
    }
    if (scopeMode === 'all') return departments.map((d) => d.name)
    return Object.keys(selectedDepts).filter((k) => selectedDepts[k])
  }, [delegated, scopeMode, selectedDepts, selectedHrbps])

  const selectedHrbpNames = useMemo(() => {
    return Object.keys(selectedHrbps).filter(k => selectedHrbps[k])
  }, [selectedHrbps])

  const scopeLabel = useMemo(() => {
    if (delegated) {
      if (selectedHrbpNames.length === 0) return `All ${uniqueHrbps.length} HRBPs`
      if (selectedHrbpNames.length === 1) return selectedHrbpNames[0]
      return `${selectedHrbpNames.length} HRBPs`
    }
    if (scopeMode === 'all') return `All ${departments.length} departments`
    if (scopedDeptNames.length === 1) return scopedDeptNames[0]
    return `${scopedDeptNames.length} departments`
  }, [delegated, scopeMode, scopedDeptNames, selectedHrbpNames])

  const canNext = step === 1 ? true
    : step === 2 ? (delegated ? selectedHrbpNames.length > 0 : (scopeMode === 'all' || scopedDeptNames.length > 0))
    : step === 3 ? true
    : true

  const isReviewStep = delegated ? step === 3 : step === 4

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

  const handleNext = () => {
    if (delegated && step === 2) {
      // Skip channels, go to review (step 3)
      setStep(3)
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (delegated && step === 3) {
      // From review, go back to HRBP selection (step 2)
      setStep(2)
    } else {
      setStep(step - 1)
    }
  }

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
            {delegated ? (
              <Stepper value={step - 1} size="sm" className="mt-3 mb-4">
                <StepperList>
                  <StepperItem step={0} className="flex-row gap-1.5">
                    <StepperIndicator />
                    <StepperTitle>Assign</StepperTitle>
                  </StepperItem>
                  <StepperSeparator />
                  <StepperItem step={1} className="flex-row gap-1.5">
                    <StepperIndicator />
                    <StepperTitle>Select HRBPs</StepperTitle>
                  </StepperItem>
                  <StepperSeparator />
                  <StepperItem step={2} className="flex-row gap-1.5">
                    <StepperIndicator />
                    <StepperTitle>Review</StepperTitle>
                  </StepperItem>
                </StepperList>
              </Stepper>
            ) : (
              <Stepper value={step - 1} size="sm" className="mt-3 mb-4">
                <StepperList>
                  <StepperItem step={0} className="flex-row gap-1.5">
                    <StepperIndicator />
                    <StepperTitle>Assign</StepperTitle>
                  </StepperItem>
                  <StepperSeparator />
                  <StepperItem step={1} className="flex-row gap-1.5">
                    <StepperIndicator />
                    <StepperTitle>Scope</StepperTitle>
                  </StepperItem>
                  <StepperSeparator />
                  <StepperItem step={2} className="flex-row gap-1.5">
                    <StepperIndicator />
                    <StepperTitle>Channels</StepperTitle>
                  </StepperItem>
                  <StepperSeparator />
                  <StepperItem step={3} className="flex-row gap-1.5">
                    <StepperIndicator />
                    <StepperTitle>Review</StepperTitle>
                  </StepperItem>
                </StepperList>
              </Stepper>
            )}
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

            {/* Step 2: HRBP selection (delegated) or Scope (self) */}
            {step === 2 && delegated && (
              <>
                <h2 className="wfr-focus-launch__title">Select HRBPs</h2>
                <p className="wfr-focus-launch__sub">Choose which HRBPs will manage data collection for their teams.</p>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#3b5bdb', fontWeight: 500 }}
                    onClick={() => {
                      if (selectedHrbpNames.length === uniqueHrbps.length) {
                        setSelectedHrbps({})
                      } else {
                        const all: Record<string, boolean> = {}
                        uniqueHrbps.forEach(h => { all[h.hrbp] = true })
                        setSelectedHrbps(all)
                      }
                    }}
                  >
                    {selectedHrbpNames.length === uniqueHrbps.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="wfr-focus-launch__dept-list">
                  {uniqueHrbps.map((h) => (
                    <button
                      key={h.hrbp}
                      type="button"
                      className={`wfr-focus-launch__dept-row ${selectedHrbps[h.hrbp] ? 'wfr-focus-launch__dept-row--on' : ''}`}
                      onClick={() => setSelectedHrbps((prev) => ({ ...prev, [h.hrbp]: !prev[h.hrbp] }))}
                    >
                      <span className="wfr-focus-launch__check">{selectedHrbps[h.hrbp] ? '✓' : ''}</span>
                      <span className="wfr-focus-launch__dept-name">{h.hrbp}</span>
                      <span className="wfr-focus-launch__dept-detail">{h.depts.join(', ')} · {h.headcount.toLocaleString()} employees</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && !delegated && (
              <>
                <h2 className="wfr-focus-launch__title">Which departments?</h2>
                <p className="wfr-focus-launch__sub">Roll out to all departments or select specific ones.</p>
                <div className="wfr-focus-launch__options">
                  <button
                    type="button"
                    className={`wfr-focus-launch__option ${scopeMode === 'all' ? 'wfr-focus-launch__option--selected' : ''}`}
                    onClick={() => setScopeMode('all')}
                  >
                    <span className="wfr-focus-launch__radio">
                      {scopeMode === 'all' ? <span className="wfr-focus-launch__radio-dot" /> : null}
                    </span>
                    <span className="wfr-focus-launch__option-text">
                      <span className="wfr-focus-launch__option-label">All departments</span>
                      <span className="wfr-focus-launch__option-desc">{departments.length} departments, {ORG.totalEmployees.toLocaleString()} employees</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`wfr-focus-launch__option ${scopeMode === 'select' ? 'wfr-focus-launch__option--selected' : ''}`}
                    onClick={() => setScopeMode('select')}
                  >
                    <span className="wfr-focus-launch__radio">
                      {scopeMode === 'select' ? <span className="wfr-focus-launch__radio-dot" /> : null}
                    </span>
                    <span className="wfr-focus-launch__option-text">
                      <span className="wfr-focus-launch__option-label">Select specific departments</span>
                      <span className="wfr-focus-launch__option-desc">Choose which departments to include</span>
                    </span>
                  </button>
                </div>
                {scopeMode === 'select' && (
                  <div className="wfr-focus-launch__dept-list" style={{ marginTop: 16 }}>
                    {departments.map((d) => (
                      <button
                        key={d.name}
                        type="button"
                        className={`wfr-focus-launch__dept-row ${selectedDepts[d.name] ? 'wfr-focus-launch__dept-row--on' : ''}`}
                        onClick={() => setSelectedDepts((prev) => ({ ...prev, [d.name]: !prev[d.name] }))}
                      >
                        <span className="wfr-focus-launch__check">{selectedDepts[d.name] ? '✓' : ''}</span>
                        <span className="wfr-focus-launch__dept-name">{d.name}</span>
                        <span className="wfr-focus-launch__dept-detail">{d.employees.toLocaleString()} employees</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Step 3: Channels (self-managed only) */}
            {step === 3 && !delegated && (
              <>
                <h2 className="wfr-focus-launch__title">Collection method</h2>
                <p className="wfr-focus-launch__sub">Data will be collected using AI-powered interviews to measure {'task-level adoption'}.</p>
                <div className="wfr-focus-launch__options">
                  <button type="button" className="wfr-focus-launch__option wfr-focus-launch__option--selected">
                    <img src="/ai-agent-icon.svg" alt="" style={{ width: 28, height: 28, flexShrink: 0 }} />
                    <span className="wfr-focus-launch__option-text">
                      <span className="wfr-focus-launch__option-label">AI Agent Interviews</span>
                      <span className="wfr-focus-launch__option-desc">AI-powered conversations that map real workflows, measure {'task-level adoption'}, and surface upskilling opportunities.</span>
                    </span>
                  </button>
                </div>
              </>
            )}

            {/* Review step: step 3 (delegated) or step 4 (self) */}
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
                  {delegated ? (
                    <div className="wfr-focus-launch__review-row">
                      <div>
                        <p className="wfr-focus-launch__review-k">HRBPs</p>
                        <p className="wfr-focus-launch__review-v">{scopeLabel}</p>
                      </div>
                      <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(2)}>Edit</button>
                    </div>
                  ) : (
                    <>
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
                          <p className="wfr-focus-launch__review-v">AI Agent Interviews</p>
                        </div>
                      </div>
                    </>
                  )}
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
