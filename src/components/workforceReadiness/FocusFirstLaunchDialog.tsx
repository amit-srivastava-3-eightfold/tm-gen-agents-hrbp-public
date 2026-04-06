import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useMemo, useState } from 'react'
import { Button, Stepper, StepperList, StepperItem, StepperIndicator, StepperTitle, StepperSeparator } from '@tonyh-2-eightfold/ef-design-system'
import { departments, hrbpAssignments } from '../../data/wfrOrgData'
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
  /** When true, show simplified dialog: Channels + Review only (for HRBP-initiated collection) */
  hrbpMode?: boolean
  /** Callback for HRBP mode launch — passes just the channels label */
  onHrbpLaunch?: (channelsLabel: string) => void
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
  hrbpMode = false,
  onHrbpLaunch,
}: FocusFirstLaunchDialogProps) {
  const [step, setStep] = useState(1)
  const [assignOwner, setAssignOwner] = useState<FocusAssignOwner>('hrbp')
  const [scopeBy, setScopeBy] = useState<'hrbps' | 'departments'>('hrbps')
  const [selectedDepts, setSelectedDepts] = useState<Record<string, boolean>>({})
  const [selectedHrbps, setSelectedHrbps] = useState<Record<string, boolean>>({})

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setStep(1)
      setAssignOwner('hrbp')
      setScopeBy('hrbps')
      setSelectedDepts({})
      setSelectedHrbps({})
    }
  }, [open])

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

  // ─── HRBP mode: single-step confirmation dialog ───
  if (hrbpMode) {
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
            </div>
            <Dialog.Description className="sr-only">Launch AI-powered data collection for your teams.</Dialog.Description>
            <div className="wfr-focus-launch__body">
              <p className="wfr-focus-launch__sub">AI-powered interviews will be sent to employees in your teams to measure task-level AI adoption. Results will refine readiness scores and surface upskilling priorities.</p>
              <div className="wfr-focus-launch__review">
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
            </div>
            <div className="wfr-focus-launch__footer">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="button" variant="primary" onClick={() => { onHrbpLaunch?.('AI Agent Interviews'); onOpenChange(false) }}>Launch →</Button>
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
                  <StepperTitle>Review</StepperTitle>
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
                <div style={{ display: 'flex', gap: 0, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                  {(['departments', 'hrbps'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      style={{
                        flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                        background: scopeBy === mode ? '#3b5bdb' : '#fff',
                        color: scopeBy === mode ? '#fff' : '#475569',
                      }}
                      onClick={() => setScopeBy(mode)}
                    >
                      {mode === 'departments' ? 'Departments' : 'HRBPs'}
                    </button>
                  ))}
                </div>

                {/* Select all / Deselect all */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#3b5bdb', fontWeight: 500, fontSize: 13 }}
                    onClick={() => {
                      if (scopeBy === 'hrbps') {
                        if (selectedHrbpNames.length === uniqueHrbps.length) setSelectedHrbps({})
                        else { const all: Record<string, boolean> = {}; uniqueHrbps.forEach(h => { all[h.hrbp] = true }); setSelectedHrbps(all) }
                      } else {
                        const selDepts = Object.keys(selectedDepts).filter(k => selectedDepts[k])
                        if (selDepts.length === departments.length) setSelectedDepts({})
                        else { const all: Record<string, boolean> = {}; departments.forEach(d => { all[d.name] = true }); setSelectedDepts(all) }
                      }
                    }}
                  >
                    {scopeBy === 'hrbps'
                      ? (selectedHrbpNames.length === uniqueHrbps.length ? 'Deselect all' : 'Select all')
                      : (Object.keys(selectedDepts).filter(k => selectedDepts[k]).length === departments.length ? 'Deselect all' : 'Select all')}
                  </button>
                </div>

                {/* List */}
                <div className="wfr-focus-launch__dept-list">
                  {scopeBy === 'hrbps'
                    ? uniqueHrbps.map((h) => (
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
                      ))
                    : departments.map((d) => (
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
