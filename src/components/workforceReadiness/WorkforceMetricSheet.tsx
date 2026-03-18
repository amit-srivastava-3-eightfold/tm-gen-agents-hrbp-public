import { useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@tonyh-2-eightfold/ef-design-system'
import { EM, EN, ORG } from '../../data/wfrOrgData'
import './WorkforceMetricSheet.css'

export type WorkforceMetricSheetId = 'potential' | 'readiness' | 'gap'

const BODY_ATTR = 'data-wfr-metric-sheet-open'

export interface DepartmentGapNarrative {
  departmentName: string
  peopleInAugRoles: number
  ready: number
  gapPeople: number
  hrsUnlocked: number
}

export interface WorkforceMetricSheetProps {
  metric: WorkforceMetricSheetId | null
  onClose: () => void
  ready: number
  gapPeople: number
  hrsUnlocked: number
  /** When set, Transformation gap sheet uses this department’s counts instead of org totals. */
  departmentGap?: DepartmentGapNarrative | null
}

export function WorkforceMetricSheet({
  metric,
  onClose,
  ready,
  gapPeople,
  hrsUnlocked,
  departmentGap = null,
}: WorkforceMetricSheetProps) {
  useLayoutEffect(() => {
    if (metric) document.body.setAttribute(BODY_ATTR, 'true')
    return () => document.body.removeAttribute(BODY_ATTR)
  }, [metric])

  useEffect(() => {
    if (!metric) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [metric, onClose])

  if (!metric) return null

  const titleId = 'wfr-metric-sheet-title'

  const title =
    metric === 'potential'
      ? 'What does AI Potential measure?'
      : metric === 'readiness'
        ? 'What does AI Readiness measure?'
        : 'What does the Transformation Gap measure?'

  const sheetContent = (
    <div className="wfr-metric-sheet__root" aria-modal="true" role="presentation">
      <div className="wfr-metric-sheet__backdrop" onClick={onClose} aria-hidden />
      <div className="wfr-metric-sheet" role="dialog" aria-labelledby={titleId}>
        <header className="wfr-metric-sheet__header">
          <h2 id={titleId} className="wfr-metric-sheet__title">
            {title}
          </h2>
          <button type="button" className="wfr-metric-sheet__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined" aria-hidden>
              close
            </span>
          </button>
        </header>
        <div className="wfr-metric-sheet__body">
          {metric === 'potential' && (
            <>
              <p>
                We break every role into its tasks and score each one for how much AI can help. Tasks where AI can
                meaningfully assist but humans still lead (the 15{EN}75% range) count toward this number. Tasks that
                should be fully automated or where AI can&apos;t help are excluded.
              </p>
              <p>
                Scores are based on 8 independent research sources including real-world AI adoption data, academic
                studies, and government labor statistics {EM} not a single model&apos;s opinion.
              </p>
              <Button
                type="button"
                variant="ghost"
                className="wfr-metric-sheet__methodology !h-auto !p-0 !font-normal"
              >
                View full methodology →
              </Button>
            </>
          )}
          {metric === 'readiness' && (
            <>
              <p>
                Of the people whose work AI can improve, how many already have the skills to use it? We look at domain
                expertise, AI exposure, technical fluency, and judgment skills in each employee&apos;s profile.
              </p>
              <p>
                This is currently an <strong>estimate</strong> based on skill profiles. Launch employee surveys to replace
                it with measured data {EM} employees report which tasks they already do with AI assistance.
              </p>
              <Button
                type="button"
                variant="ghost"
                className="wfr-metric-sheet__methodology !h-auto !p-0 !font-normal"
              >
                View full methodology →
              </Button>
            </>
          )}
          {metric === 'gap' && (
            <>
              <p>
                {departmentGap ? (
                  <>
                    In <strong>{departmentGap.departmentName}</strong>,{' '}
                    {departmentGap.peopleInAugRoles.toLocaleString()} employees are in roles where AI can help.{' '}
                    {departmentGap.ready.toLocaleString()} are already AI-ready. The remaining{' '}
                    <strong className="text-red-600">{departmentGap.gapPeople.toLocaleString()}</strong> are this
                    department&apos;s upskilling opportunity.
                  </>
                ) : (
                  <>
                    {ORG.peopleInAugRoles.toLocaleString()} employees are in roles where AI can help.{' '}
                    {ready.toLocaleString()} are already AI-ready. The remaining{' '}
                    <strong className="text-red-600">{gapPeople.toLocaleString()}</strong> are your upskilling
                    opportunity.
                  </>
                )}
              </p>
              <p>
                Each person in the gap gets a tailored development plan based on the specific tasks in their role.
                Closing this gap could unlock ~
                {(departmentGap ? departmentGap.hrsUnlocked : hrsUnlocked).toLocaleString()} hours/week of productivity{' '}
                {departmentGap ? `for ${departmentGap.departmentName}.` : 'across the org.'}
              </p>
              <Button
                type="button"
                variant="ghost"
                className="wfr-metric-sheet__methodology !h-auto !p-0 !font-normal"
              >
                View full methodology →
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(sheetContent, document.body)
}
