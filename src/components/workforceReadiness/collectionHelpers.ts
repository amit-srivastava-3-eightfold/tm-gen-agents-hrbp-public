/** Shared helpers for data collection progress UI (used by inline tab + detail views). */

export const DEMO_MANAGERS = [
  'Priya Thompson',
  'Alex Rivera',
  'Jordan Kim',
  'Sam Okonkwo',
  'Riley Chen',
  'Morgan Patel',
  'Casey Nguyen',
  'Taylor Brooks',
]

export function deptNameHash(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i)
  return h
}

export type WfrCollSheetChannelDemo = {
  key: string
  label: string
  icon: string
  rate: number
}

/** Deterministic demo row chrome (manager, channels, activity). */
export function deptCollectionRowDemo(deptName: string) {
  const h = deptNameHash(deptName)
  const activeChannelCount = (1 + (h % 2)) as 1 | 2
  const useHours = h % 5 === 0
  const lastActivityDaysAgo = 1 + (h % 21)
  const lastActivityHoursAgo = 1 + (h % 12)
  const channelsDetail: WfrCollSheetChannelDemo[] =
    activeChannelCount >= 2
      ? [
          {
            key: 'profile',
            label: 'Profile Updates',
            icon: '\u270f\ufe0f',
            rate: Math.min(100, 28 + (h % 55)),
          },
          {
            key: 'survey',
            label: 'Contextual Surveys',
            icon: '\ud83d\udccb',
            rate: Math.min(100, 8 + ((h * 3) % 42)),
          },
        ]
      : []
  return {
    manager: DEMO_MANAGERS[h % DEMO_MANAGERS.length],
    activeChannelCount,
    useHours,
    lastActivityDaysAgo,
    lastActivityHoursAgo,
    channelsDetail,
  }
}

export function barColor(rate: number) {
  if (rate >= 70) return '#15803d'
  if (rate >= 30) return 'var(--wfr-potential-text, #6366f1)'
  return '#94a3b8'
}

export function activityLabel(deptName: string) {
  const meta = deptCollectionRowDemo(deptName)
  if (meta.useHours) {
    return meta.lastActivityHoursAgo === 1
      ? 'Last activity: 1 hour ago'
      : `Last activity: ${meta.lastActivityHoursAgo} hours ago`
  }
  return meta.lastActivityDaysAgo === 1
    ? 'Last activity: 1 day ago'
    : `Last activity: ${meta.lastActivityDaysAgo} days ago`
}
