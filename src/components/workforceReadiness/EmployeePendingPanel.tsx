/**
 * Manager-facing panel that surfaces an employee's pending task changes.
 * Manager can Accept all or Reject all — no per-row actions.
 *
 * Rendered above the regular task list inside an employee task sheet.
 * Reads & mutates state via the persisted employeeTaskState store, so the
 * employee surface sees the result on their next render.
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useEmployeeTaskState } from '../../hooks/useEmployeeTaskState'
import { acceptAllPending, rejectAllPending } from '../../data/employeeTaskState'

interface Props {
  employeeName: string
}

interface ToastState {
  msg: string
  icon: string
  iconColor: string
  // Bumped each time a toast fires so the effect re-runs even for same message
  key: number
}

export function EmployeePendingPanel({ employeeName }: Props) {
  const state = useEmployeeTaskState(employeeName)
  const pending = state.pending
  const [toast, setToast] = useState<ToastState | null>(null)

  // Auto-dismiss toast after ~2.5s
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(t)
  }, [toast])

  const hasPending = pending != null && (pending.added.length > 0 || pending.removed.length > 0)

  function handleAcceptAll() {
    if (!pending) return
    const n = pending.added.length + pending.removed.length
    acceptAllPending(employeeName)
    setToast({
      msg: `Accepted ${n} change${n === 1 ? '' : 's'}`,
      icon: 'check_circle',
      iconColor: '#4ade80',
      key: Date.now(),
    })
  }

  function handleRejectAll() {
    if (!pending) return
    const n = pending.added.length + pending.removed.length
    rejectAllPending(employeeName)
    setToast({
      msg: `Rejected ${n} change${n === 1 ? '' : 's'}`,
      icon: 'block',
      iconColor: '#fca5a5',
      key: Date.now(),
    })
  }

  return (
    <>
      {hasPending && pending && (() => {
        const totalCount = pending.added.length + pending.removed.length
        const submittedAgo = formatRelativeTime(pending.submittedAt)
        return (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 8, border: '1px solid #fde68a', background: '#fffbeb' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#b45309' }}>hourglass_top</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Employee proposed {totalCount} change{totalCount === 1 ? '' : 's'}
              </span>
              <span style={{ fontSize: 11, color: '#a16207' }}>· {submittedAgo}</span>
            </div>

            {/* Per-task rows (read-only) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {pending.added.map(t => (
                <PendingRow
                  key={`pa-${t.task}`}
                  icon="add"
                  iconBg="#dcfce7"
                  iconColor="#15803d"
                  name={t.task}
                  meta={`Score ${t.score}${t.description ? ` · ${t.description}` : ''}`}
                />
              ))}
              {pending.removed.map(name => (
                <PendingRow
                  key={`pr-${name}`}
                  icon="remove"
                  iconBg="#fee2e2"
                  iconColor="#b91c1c"
                  name={name}
                  strikethrough
                />
              ))}
            </div>

            {/* Bulk actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
              <button type="button" onClick={handleRejectAll}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #fcd34d', background: 'transparent', color: '#92400e', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                Reject all
              </button>
              <button type="button" onClick={handleAcceptAll}
                style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#15803d', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                Accept all
              </button>
            </div>
          </div>
        )
      })()}

      {toast && createPortal(
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 10, background: '#0f172a', color: '#fff',
          fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 8, zIndex: 10000, whiteSpace: 'nowrap',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: toast.iconColor }}>{toast.icon}</span>
          {toast.msg}
        </div>,
        document.body,
      )}
    </>
  )
}

interface PendingRowProps {
  icon: string
  iconBg: string
  iconColor: string
  name: string
  meta?: string
  strikethrough?: boolean
}

function PendingRow({ icon, iconBg, iconColor, name, meta, strikethrough }: PendingRowProps) {
  return (
    <div style={{ padding: '8px 10px', borderRadius: 6, background: '#fff', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 4, background: iconBg, color: iconColor, flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{icon}</span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', textDecoration: strikethrough ? 'line-through' : 'none' }}>{name}</div>
        {meta && <div style={{ fontSize: 11, color: '#94a3b8' }}>{meta}</div>}
      </div>
    </div>
  )
}

function formatRelativeTime(ts: number): string {
  const diffMs = Date.now() - ts
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
