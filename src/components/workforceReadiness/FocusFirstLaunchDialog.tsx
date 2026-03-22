import * as Dialog from '@radix-ui/react-dialog'
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button } from '@tonyh-2-eightfold/ef-design-system'
import { ORG, tGap, type Dept } from '../../data/wfrOrgData'
import './FocusFirstLaunchDialog.css'

const ARROW = '\u2192'

export type FocusAssignOwner = 'hrbp' | 'self'

/** Snapshot of Review-step choices; drives “data collection is underway” copy. */
export type FocusCollectionLaunchSummary = {
  assignOwner: FocusAssignOwner
  /** Same string as Review “Scope” (e.g. “All 17 departments”, “Sales only”). */
  scopeLabel: string
  /** Channel name when user manages; placeholder when delegated. */
  channelsLabel: string
  delegated: boolean
  /** Departments in scope; drives overview metrics, Learn more copy, and the dept table. */
  scopedDepartmentNames: string[]
}

export interface FocusFirstLaunchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with wizard selections when user confirms launch (dialog closes after). */
  onLaunch?: (summary: FocusCollectionLaunchSummary) => void
  /** Which step to show when the dialog opens (default 1). With “I’ll manage it”, step 4 is Review. */
  initialStep?: 1 | 2 | 3 | 4
  /**
   * When set (e.g. Get started from a department page), Scope defaults to that department
   * for the first option; it is also excluded from the “Other departments” list.
   */
  defaultScopeDepartmentName?: string
}

type DeptLaunchScopeKind = 'focus_only' | 'all' | 'other'

type BoardScopeMode = 'all' | 'select'

type ChannelEffort = 'low' | 'medium' | 'deep'

const CHANNEL_OPTIONS: {
  id: string
  label: string
  desc: string
  icon: string
  effort: ChannelEffort
  effortLabel: string
}[] = [
  {
    id: 'ai_agent_interviews',
    label: 'AI Agent Interviews',
    desc: 'AI conversations to map real workflows.',
    icon: '\ud83e\udd16',
    effort: 'deep',
    effortLabel: 'Deepest signal',
  },
  {
    id: 'contextual_surveys',
    label: 'Contextual Surveys',
    desc: 'Role-specific questions about actual AI usage.',
    icon: '\ud83d\udccb',
    effort: 'medium',
    effortLabel: 'Strong signal',
  },
  {
    id: 'career_hub_profiles',
    label: 'Career Hub Profiles',
    desc: 'Employees update their skills and AI tool usage in Career Hub.',
    icon: '\u270f\ufe0f',
    effort: 'low',
    effortLabel: 'Light signal',
  },
]

const DEFAULT_CHANNEL_ID = 'ai_agent_interviews'

function channelEffortPillClass(effort: ChannelEffort) {
  if (effort === 'low') return 'wfr-focus-launch__effort-pill wfr-focus-launch__effort-pill--low'
  if (effort === 'medium') return 'wfr-focus-launch__effort-pill wfr-focus-launch__effort-pill--medium'
  return 'wfr-focus-launch__effort-pill wfr-focus-launch__effort-pill--deep'
}

const ASSIGN_OPTIONS: { id: FocusAssignOwner; label: string; desc: string }[] = [
  {
    id: 'hrbp',
    label: 'Assign to HRBPs',
    desc: 'Each HRBP configures and monitors their departments',
  },
  {
    id: 'self',
    label: "I'll manage it",
    desc: 'Configure and launch data collection yourself',
  },
]

function gapPillClass(pp: number) {
  if (pp >= 50) return 'wfr-focus-launch__gap-pill wfr-focus-launch__gap-pill--high'
  if (pp >= 30) return 'wfr-focus-launch__gap-pill wfr-focus-launch__gap-pill--mid'
  return 'wfr-focus-launch__gap-pill wfr-focus-launch__gap-pill--low'
}

export function FocusFirstLaunchDialog({
  open,
  onOpenChange,
  onLaunch,
  initialStep = 1,
  defaultScopeDepartmentName,
}: FocusFirstLaunchDialogProps) {
  const [step, setStep] = useState(1)
  const [assignOwner, setAssignOwner] = useState<FocusAssignOwner>('hrbp')
  const [deptLaunchScopeKind, setDeptLaunchScopeKind] = useState<DeptLaunchScopeKind>('focus_only')
  const [otherDeptSelection, setOtherDeptSelection] = useState<Record<string, boolean>>({})
  const [boardScopeMode, setBoardScopeMode] = useState<BoardScopeMode>('all')
  const [boardSelectedDepts, setBoardSelectedDepts] = useState<Record<string, boolean>>({})
  const [selectedChannelId, setSelectedChannelId] = useState<string>(DEFAULT_CHANNEL_ID)

  const deptsByGap = useMemo(
    () =>
      [...ORG.departments].sort(
        (a, b) => tGap(b.aiPotential, b.aiReadiness) - tGap(a.aiPotential, a.aiReadiness),
      ),
    [],
  )

  const launchDept = useMemo(
    () =>
      defaultScopeDepartmentName
        ? ORG.departments.find((d) => d.name === defaultScopeDepartmentName)
        : undefined,
    [defaultScopeDepartmentName],
  )

  const otherDeptsExcludingLaunch = useMemo(
    () =>
      defaultScopeDepartmentName
        ? deptsByGap.filter((d) => d.name !== defaultScopeDepartmentName)
        : [],
    [deptsByGap, defaultScopeDepartmentName],
  )

  const delegated = assignOwner !== 'self'

  const scopeLabel = useMemo(() => {
    if (defaultScopeDepartmentName) {
      if (deptLaunchScopeKind === 'all') {
        return `All ${ORG.departments.length} departments`
      }
      if (deptLaunchScopeKind === 'focus_only') {
        return `${defaultScopeDepartmentName} only`
      }
      const n = Object.keys(otherDeptSelection).filter((k) => otherDeptSelection[k]).length
      return n === 0 ? 'No departments selected' : `${n} other department${n === 1 ? '' : 's'}`
    }
    if (boardScopeMode === 'all') {
      return `All ${ORG.departments.length} departments`
    }
    const n = Object.keys(boardSelectedDepts).filter((k) => boardSelectedDepts[k]).length
    return n === 0 ? 'No departments selected' : `${n} department${n === 1 ? '' : 's'}`
  }, [
    defaultScopeDepartmentName,
    deptLaunchScopeKind,
    otherDeptSelection,
    boardScopeMode,
    boardSelectedDepts,
  ])

  const scopedDepartmentNames = useMemo((): string[] => {
    if (defaultScopeDepartmentName) {
      if (deptLaunchScopeKind === 'all') {
        return ORG.departments.map((d) => d.name)
      }
      if (deptLaunchScopeKind === 'focus_only') {
        return [defaultScopeDepartmentName]
      }
      return Object.keys(otherDeptSelection).filter((k) => otherDeptSelection[k])
    }
    if (boardScopeMode === 'all') {
      return ORG.departments.map((d) => d.name)
    }
    return Object.keys(boardSelectedDepts).filter((k) => boardSelectedDepts[k])
  }, [
    defaultScopeDepartmentName,
    deptLaunchScopeKind,
    otherDeptSelection,
    boardScopeMode,
    boardSelectedDepts,
  ])

  const ownerLabel = assignOwner === 'hrbp' ? 'HRBPs' : 'You'

  const canProceedScope = defaultScopeDepartmentName
    ? deptLaunchScopeKind === 'all' ||
      deptLaunchScopeKind === 'focus_only' ||
      (deptLaunchScopeKind === 'other' && Object.values(otherDeptSelection).some(Boolean))
    : boardScopeMode === 'all' || Object.values(boardSelectedDepts).some(Boolean)
  const canProceedChannels = Boolean(selectedChannelId)

  const stepLabels = useMemo(
    () => (delegated ? (['Assign', 'Scope', 'Review'] as const) : (['Assign', 'Scope', 'Channels', 'Review'] as const)),
    [delegated],
  )

  const totalSteps = delegated ? 3 : 4

  const channelsLabel = useMemo(() => {
    const ch = CHANNEL_OPTIONS.find((c) => c.id === selectedChannelId)
    return ch?.label ?? 'None selected'
  }, [selectedChannelId])

  useEffect(() => {
    if (open) {
      setAssignOwner('hrbp')
      if (defaultScopeDepartmentName) {
        setDeptLaunchScopeKind('focus_only')
        setOtherDeptSelection({})
      } else {
        setBoardScopeMode('all')
        setBoardSelectedDepts({})
      }
      setSelectedChannelId(DEFAULT_CHANNEL_ID)
      setStep(Math.min(initialStep, 3))
    } else {
      setStep(1)
      setAssignOwner('hrbp')
      setDeptLaunchScopeKind('focus_only')
      setOtherDeptSelection({})
      setBoardScopeMode('all')
      setBoardSelectedDepts({})
      setSelectedChannelId(DEFAULT_CHANNEL_ID)
    }
  }, [open, initialStep, defaultScopeDepartmentName])

  useEffect(() => {
    if (delegated && step > 3) setStep(3)
  }, [delegated, step])

  const toggleOtherDept = (name: string) => {
    setOtherDeptSelection((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const toggleBoardDept = (name: string) => {
    setBoardSelectedDepts((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const handleLaunch = () => {
    onLaunch?.({
      assignOwner,
      scopeLabel,
      channelsLabel,
      delegated,
      scopedDepartmentNames,
    })
    onOpenChange(false)
  }

  const renderStepper = () => (
    <div className="wfr-focus-launch__stepper" aria-hidden>
      {stepLabels.map((label, i) => {
        const n = i + 1
        const isDone = n < step
        const isActive = n === step
        const lineDone = step > i + 1
        return (
          <Fragment key={label}>
            <div className="wfr-focus-launch__stepper-step">
              <div
                className={`wfr-focus-launch__stepper-node${isDone ? ' wfr-focus-launch__stepper-node--done' : ''}${isActive && !isDone ? ' wfr-focus-launch__stepper-node--active' : ''}`}
              >
                {isDone ? '✓' : n}
              </div>
              <span
                className={`wfr-focus-launch__stepper-label${isActive ? ' wfr-focus-launch__stepper-label--active' : ''}`}
              >
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 ? (
              <div
                className={`wfr-focus-launch__stepper-line${lineDone ? ' wfr-focus-launch__stepper-line--done' : ''}`}
              />
            ) : null}
          </Fragment>
        )
      })}
    </div>
  )

  const renderAssign = () => (
    <>
      <h2 className="wfr-focus-launch__title">Who should run this?</h2>
      <p className="wfr-focus-launch__sub">You can delegate or manage it yourself.</p>
      <div className="wfr-focus-launch__options" role="radiogroup" aria-label="Collection owner">
        {ASSIGN_OPTIONS.map((opt) => {
          const selected = assignOwner === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`wfr-focus-launch__option${selected ? ' wfr-focus-launch__option--selected' : ''}`}
              onClick={() => setAssignOwner(opt.id)}
            >
              <span className="wfr-focus-launch__radio" aria-hidden>
                {selected ? <span className="wfr-focus-launch__radio-dot" /> : null}
              </span>
              <span className="wfr-focus-launch__option-text">
                <span className="wfr-focus-launch__option-label">{opt.label}</span>
                <p className="wfr-focus-launch__option-desc">{opt.desc}</p>
              </span>
            </button>
          )
        })}
      </div>
    </>
  )

  const renderScopeBoard = () => (
    <>
      <h2 className="wfr-focus-launch__title">Where should we start?</h2>
      <p className="wfr-focus-launch__sub">Roll out everywhere or start with specific departments.</p>
      <div className="wfr-focus-launch__options" role="radiogroup" aria-label="Rollout scope">
        <button
          type="button"
          role="radio"
          aria-checked={boardScopeMode === 'all'}
          className={`wfr-focus-launch__option${boardScopeMode === 'all' ? ' wfr-focus-launch__option--selected' : ''}`}
          onClick={() => setBoardScopeMode('all')}
        >
          <span className="wfr-focus-launch__radio" aria-hidden>
            {boardScopeMode === 'all' ? <span className="wfr-focus-launch__radio-dot" /> : null}
          </span>
          <span className="wfr-focus-launch__option-text">
            <span className="wfr-focus-launch__option-label">All departments</span>
            <p className="wfr-focus-launch__option-desc">
              {ORG.departments.length} departments, {ORG.totalEmployees.toLocaleString()} employees
            </p>
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={boardScopeMode === 'select'}
          className={`wfr-focus-launch__option${boardScopeMode === 'select' ? ' wfr-focus-launch__option--selected' : ''}`}
          onClick={() => setBoardScopeMode('select')}
        >
          <span className="wfr-focus-launch__radio" aria-hidden>
            {boardScopeMode === 'select' ? <span className="wfr-focus-launch__radio-dot" /> : null}
          </span>
          <span className="wfr-focus-launch__option-text">
            <span className="wfr-focus-launch__option-label">Start with specific departments</span>
            <p className="wfr-focus-launch__option-desc">Recommended: begin where the gaps are largest</p>
          </span>
        </button>
      </div>
      {boardScopeMode === 'select' ? (
        <div className="wfr-focus-launch__dept-list">
          {deptsByGap.map((d: Dept) => {
            const on = Boolean(boardSelectedDepts[d.name])
            const pp = tGap(d.aiPotential, d.aiReadiness)
            return (
              <button
                key={d.name}
                type="button"
                className={`wfr-focus-launch__dept-row${on ? ' wfr-focus-launch__dept-row--on' : ''}`}
                onClick={() => toggleBoardDept(d.name)}
              >
                <span className="wfr-focus-launch__check" aria-hidden>
                  {on ? '✓' : ''}
                </span>
                <span className="wfr-focus-launch__dept-name">{d.name}</span>
                <span className="wfr-focus-launch__dept-meta tabular-nums">
                  {d.employees.toLocaleString()} employees
                </span>
                <span className={gapPillClass(pp)}>{pp}pp gap</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </>
  )

  const renderScopeDeptLaunch = () => {
    const name = defaultScopeDepartmentName ?? ''
    const empLine =
      launchDept != null
        ? `${launchDept.employees.toLocaleString()} employees · run collection for this department only`
        : 'Run collection for this department only'
    return (
      <>
        <h2 className="wfr-focus-launch__title">Where should we start?</h2>
        <p className="wfr-focus-launch__sub">This department, the full org, or a custom set of others.</p>
        <div className="wfr-focus-launch__options" role="radiogroup" aria-label="Rollout scope">
          <button
            type="button"
            role="radio"
            aria-checked={deptLaunchScopeKind === 'focus_only'}
            className={`wfr-focus-launch__option${deptLaunchScopeKind === 'focus_only' ? ' wfr-focus-launch__option--selected' : ''}`}
            onClick={() => setDeptLaunchScopeKind('focus_only')}
          >
            <span className="wfr-focus-launch__radio" aria-hidden>
              {deptLaunchScopeKind === 'focus_only' ? <span className="wfr-focus-launch__radio-dot" /> : null}
            </span>
            <span className="wfr-focus-launch__option-text">
              <span className="wfr-focus-launch__option-label">{name}</span>
              <p className="wfr-focus-launch__option-desc">{empLine}</p>
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={deptLaunchScopeKind === 'all'}
            className={`wfr-focus-launch__option${deptLaunchScopeKind === 'all' ? ' wfr-focus-launch__option--selected' : ''}`}
            onClick={() => setDeptLaunchScopeKind('all')}
          >
            <span className="wfr-focus-launch__radio" aria-hidden>
              {deptLaunchScopeKind === 'all' ? <span className="wfr-focus-launch__radio-dot" /> : null}
            </span>
            <span className="wfr-focus-launch__option-text">
              <span className="wfr-focus-launch__option-label">All departments</span>
              <p className="wfr-focus-launch__option-desc">
                {ORG.departments.length} departments, {ORG.totalEmployees.toLocaleString()} employees
              </p>
            </span>
          </button>
          {otherDeptsExcludingLaunch.length > 0 ? (
            <button
              type="button"
              role="radio"
              aria-checked={deptLaunchScopeKind === 'other'}
              className={`wfr-focus-launch__option${deptLaunchScopeKind === 'other' ? ' wfr-focus-launch__option--selected' : ''}`}
              onClick={() => setDeptLaunchScopeKind('other')}
            >
              <span className="wfr-focus-launch__radio" aria-hidden>
                {deptLaunchScopeKind === 'other' ? <span className="wfr-focus-launch__radio-dot" /> : null}
              </span>
              <span className="wfr-focus-launch__option-text">
                <span className="wfr-focus-launch__option-label">Other departments</span>
                <p className="wfr-focus-launch__option-desc">Pick any combination besides {name}</p>
              </span>
            </button>
          ) : null}
        </div>
        {deptLaunchScopeKind === 'other' ? (
          <div className="wfr-focus-launch__dept-list">
            {otherDeptsExcludingLaunch.map((d: Dept) => {
              const on = Boolean(otherDeptSelection[d.name])
              const pp = tGap(d.aiPotential, d.aiReadiness)
              return (
                <button
                  key={d.name}
                  type="button"
                  className={`wfr-focus-launch__dept-row${on ? ' wfr-focus-launch__dept-row--on' : ''}`}
                  onClick={() => toggleOtherDept(d.name)}
                >
                  <span className="wfr-focus-launch__check" aria-hidden>
                    {on ? '✓' : ''}
                  </span>
                  <span className="wfr-focus-launch__dept-name">{d.name}</span>
                  <span className="wfr-focus-launch__dept-meta tabular-nums">
                    {d.employees.toLocaleString()} employees
                  </span>
                  <span className={gapPillClass(pp)}>{pp}pp gap</span>
                </button>
              )
            })}
          </div>
        ) : null}
      </>
    )
  }

  const renderScope = () =>
    defaultScopeDepartmentName ? renderScopeDeptLaunch() : renderScopeBoard()

  const renderChannels = () => (
    <>
      <h2 className="wfr-focus-launch__title">How should we reach people?</h2>
      <p className="wfr-focus-launch__sub">
        Choose one collection method. Higher signal options usually need more employee time.
      </p>
      <div className="wfr-focus-launch__options" role="radiogroup" aria-label="Collection method">
        {CHANNEL_OPTIONS.map((ch) => {
          const selected = selectedChannelId === ch.id
          return (
            <button
              key={ch.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`wfr-focus-launch__option wfr-focus-launch__option--channel${selected ? ' wfr-focus-launch__option--selected' : ''}`}
              onClick={() => setSelectedChannelId(ch.id)}
            >
              <span className="wfr-focus-launch__radio" aria-hidden>
                {selected ? <span className="wfr-focus-launch__radio-dot" /> : null}
              </span>
              <span className="wfr-focus-launch__channel-icon" aria-hidden>
                {ch.icon}
              </span>
              <span className="wfr-focus-launch__option-text wfr-focus-launch__option-text--channel">
                <span className="wfr-focus-launch__option-label">{ch.label}</span>
                <p className="wfr-focus-launch__option-desc">{ch.desc}</p>
              </span>
              <span className={channelEffortPillClass(ch.effort)}>{ch.effortLabel}</span>
            </button>
          )
        })}
      </div>
    </>
  )

  const renderReview = () => (
    <>
      <h2 className="wfr-focus-launch__title">Ready to launch</h2>
      <p className="wfr-focus-launch__sub">Review your selections.</p>
      <div className="wfr-focus-launch__review">
        <div className="wfr-focus-launch__review-row">
          <div>
            <p className="wfr-focus-launch__review-k">Owner</p>
            <p className="wfr-focus-launch__review-v">{ownerLabel}</p>
          </div>
          <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(1)}>
            Edit
          </button>
        </div>
        <div className="wfr-focus-launch__review-row">
          <div>
            <p className="wfr-focus-launch__review-k">Scope</p>
            <p className="wfr-focus-launch__review-v">{scopeLabel}</p>
          </div>
          <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(2)}>
            Edit
          </button>
        </div>
        {delegated ? (
          <div className="wfr-focus-launch__review-row">
            <div>
              <p className="wfr-focus-launch__review-k">Channels</p>
              <p className="wfr-focus-launch__review-v wfr-focus-launch__review-v--muted">
                Delegates will choose the collection method
              </p>
            </div>
          </div>
        ) : (
          <div className="wfr-focus-launch__review-row">
            <div>
              <p className="wfr-focus-launch__review-k">Channels</p>
              <p className="wfr-focus-launch__review-v">{channelsLabel}</p>
            </div>
            <button type="button" className="wfr-focus-launch__edit" onClick={() => setStep(3)}>
              Edit
            </button>
          </div>
        )}
      </div>
    </>
  )

  let body: ReactNode
  if (step === 1) body = renderAssign()
  else if (step === 2) body = renderScope()
  else if (delegated) body = renderReview()
  else if (step === 3) body = renderChannels()
  else body = renderReview()

  const footerPrimary =
    step === totalSteps ? (
      <Button type="button" variant="primary" onClick={handleLaunch}>
        Launch {ARROW}
      </Button>
    ) : (
      <Button
        type="button"
        variant="primary"
        onClick={() => setStep((s) => s + 1)}
        disabled={(step === 2 && !canProceedScope) || (step === 3 && !delegated && !canProceedChannels)}
      >
        Next {ARROW}
      </Button>
    )

  const portalContainer = typeof document !== 'undefined' ? document.body : undefined

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal container={portalContainer}>
        <Dialog.Overlay className="wfr-focus-launch__overlay" />
        <Dialog.Content className="wfr-focus-launch__content">
          <div className="wfr-focus-launch__header">
            <div className="wfr-focus-launch__header-top">
              <Dialog.Title className="wfr-focus-launch__dialog-title">Data collection</Dialog.Title>
              <Dialog.Close className="wfr-focus-launch__close" aria-label="Close">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  close
                </span>
              </Dialog.Close>
            </div>
            {renderStepper()}
          </div>
          <Dialog.Description className="wfr-focus-launch__sr-title">
            Step through owner, scope, optional channels when you manage it yourself, and review to launch
            readiness data collection.
          </Dialog.Description>
          <div className="wfr-focus-launch__body">{body}</div>
          <div className="wfr-focus-launch__footer">
            {step === 1 ? (
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {footerPrimary}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
