/**
 * The "All tasks / By classification / By source" pill tab bar that sits
 * above a WfrTaskSheetBody render. Extracted so the showcase and every
 * production task-sheet surface render the same control.
 */
export type TaskSheetBodyTab = 'all' | 'classification' | 'source'

interface Props {
  value: TaskSheetBodyTab
  onChange: (tab: TaskSheetBodyTab) => void
  /** Total task count shown next to the "All tasks" pill. */
  count: number
}

export function TaskSheetBodyTabs({ value, onChange, count }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
      {(['all', 'classification', 'source'] as const).map(tab => {
        const active = value === tab
        return (
          <button key={tab} type="button" onClick={() => onChange(tab)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 20,
              border: `1px solid ${active ? '#6366f1' : '#e2e8f0'}`,
              background: active ? '#eef2ff' : 'transparent',
              color: active ? '#4338ca' : '#64748b',
              fontSize: 12, fontWeight: active ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
            {tab === 'all' ? (
              <>
                All tasks
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 18, height: 18, borderRadius: 9, padding: '0 5px',
                  background: active ? '#6366f1' : '#e2e8f0',
                  color: active ? '#fff' : '#64748b',
                  fontSize: 10, fontWeight: 700, lineHeight: 1,
                }}>{count}</span>
              </>
            ) : tab === 'classification' ? 'By classification' : 'By source'}
          </button>
        )
      })}
    </div>
  )
}
