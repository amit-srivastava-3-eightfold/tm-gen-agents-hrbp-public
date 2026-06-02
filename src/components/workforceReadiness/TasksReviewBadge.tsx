/**
 * Tasks count badge that doubles as a review-state indicator for admins.
 *
 *   - Reviewed      → indigo badge (the existing look)
 *   - Needs review  → amber badge with a filled dot
 *
 * Clicking opens the task sheet. Non-admin callers get the plain indigo badge
 * by passing `showReviewState={false}`.
 */
import { useRoleReviewed } from '../../hooks/useRoleReview'
import { roleReviewKey } from '../../data/roleReviewState'

interface Props {
  dept: string
  title: string
  count: number
  showReviewState: boolean
  onClick: (e: React.MouseEvent) => void
}

export function TasksReviewBadge({ dept, title, count, showReviewState, onClick }: Props) {
  const reviewed = useRoleReviewed(roleReviewKey(dept, title))
  const needsReview = showReviewState && !reviewed

  const palette = needsReview
    ? { bg: '#fffbeb', border: '#fde68a', color: '#b45309' }
    : { bg: '#f0f4ff', border: '#c7d2fe', color: '#3b5bdb' }

  return (
    <button
      type="button"
      onClick={onClick}
      title={needsReview ? 'Tasks are AI-drafted — needs review' : 'View tasks'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 12,
        background: palette.bg, border: `1px solid ${palette.border}`,
        fontSize: 13, fontWeight: 600, color: palette.color,
        cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
      }}
    >
      {needsReview && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} aria-hidden />
      )}
      {count}
      <span className="material-symbols-outlined" style={{ fontSize: 12, lineHeight: 1 }}>chevron_right</span>
    </button>
  )
}
