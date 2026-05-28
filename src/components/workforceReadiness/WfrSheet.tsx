/**
 * Slide-in sheet shell used across WFR.
 *
 * Handles the chrome — backdrop, portal, scroll lock, close button, Escape key,
 * and a consistent header layout (title + subtitle + optional action slot).
 * Pass body content as children.
 *
 * Existing namespaced styles (`wfr-trend-sheet__*`, etc.) continue to work for
 * body-content classes; the shell itself uses `wfr-sheet__*`.
 */
import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './WfrSheet.css'

const DEFAULT_BODY_ATTR = 'data-wfr-sheet-open'

export interface WfrSheetProps {
  /** Whether the sheet is open. When false, nothing renders. */
  open: boolean
  /** Called when the backdrop is clicked, Escape is pressed, or the close button is clicked. */
  onClose: () => void
  /** Title text (or node — e.g. a string with adjacent badges). */
  title: ReactNode
  /** Optional subtitle rendered below the title. */
  subtitle?: ReactNode
  /** Optional extra content rendered alongside the title in the same row (e.g. a delta badge). */
  titleExtras?: ReactNode
  /** Optional content rendered below the subtitle but still inside the header (e.g. a view-toggle pill). */
  belowHeader?: ReactNode
  /** Optional action buttons rendered in the top-right, before the close button. */
  headerActions?: ReactNode
  /** Accessible label for the dialog. Defaults to the title when it's a string. */
  ariaLabel?: string
  /**
   * Data attribute placed on document.body while the sheet is open, used by CSS
   * to lock background scroll. Override only if multiple sheet variants must
   * coexist with independent scroll-lock semantics.
   */
  bodyAttr?: string
  /** Body content. */
  children: ReactNode
}

export function WfrSheet({
  open,
  onClose,
  title,
  subtitle,
  titleExtras,
  belowHeader,
  headerActions,
  ariaLabel,
  bodyAttr = DEFAULT_BODY_ATTR,
  children,
}: WfrSheetProps) {
  useLayoutEffect(() => {
    if (!open) return
    document.body.setAttribute(bodyAttr, 'true')
    return () => document.body.removeAttribute(bodyAttr)
  }, [open, bodyAttr])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const computedAriaLabel = ariaLabel ?? (typeof title === 'string' ? title : undefined)

  return createPortal(
    <div className="wfr-sheet__root">
      <div className="wfr-sheet__backdrop" onClick={onClose} aria-hidden />
      <div className="wfr-sheet" role="dialog" aria-label={computedAriaLabel}>
        <div className="wfr-sheet__header">
          <div className="wfr-sheet__header-main">
            <div className="wfr-sheet__title-row">
              <h2 className="wfr-sheet__title">{title}</h2>
              {titleExtras}
            </div>
            {subtitle != null && <p className="wfr-sheet__sub">{subtitle}</p>}
            {belowHeader}
          </div>
          {headerActions}
          <button type="button" className="wfr-sheet__close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="wfr-sheet__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
