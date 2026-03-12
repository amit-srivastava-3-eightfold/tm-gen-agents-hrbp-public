import * as Tabs from '@radix-ui/react-tabs'
import './TabsWithLines.css'

export type TabItem = { id: string; label: string; badge?: number | string }

export interface TabsWithLinesProps {
  tabs: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  rootKey?: string
  children: React.ReactNode
}

export function TabsWithLines({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  rootKey,
  children,
}: TabsWithLinesProps) {
  return (
    <Tabs.Root
      key={rootKey}
      defaultValue={defaultValue ?? tabs[0]?.id}
      value={value}
      onValueChange={onValueChange}
      className={`tabs-with-lines ${className ?? ''}`.trim()}
    >
      <Tabs.List className="tabs-with-lines__list">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="tabs-with-lines__trigger"
          >
            {tab.label}
            {tab.badge != null && (
              <span className="tabs-with-lines__badge">{tab.badge}</span>
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {children}
    </Tabs.Root>
  )
}
