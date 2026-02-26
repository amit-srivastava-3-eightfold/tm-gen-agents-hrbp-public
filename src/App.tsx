import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tabs from '@radix-ui/react-tabs'
import { Navbar } from './components/Navbar'

const DEMO_NAVBAR_PROPS = {
  tabs: [{ id: 'home', label: 'Home', path: '/' }],
  avatarMenuItems: [{ label: 'Profile', path: '/profile' }],
  user: { name: 'Demo', avatarType: 'initials' as const, avatarInitials: 'D' },
}

function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <Navbar {...DEMO_NAVBAR_PROPS} />
      <main style={{ padding: 24, paddingTop: 104 }}>
      <h1>TM</h1>
      <p>Welcome to your new project.</p>

      <div style={{ marginTop: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: '#fff',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Open menu
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              style={{
                minWidth: 160,
                background: '#fff',
                borderRadius: 8,
                padding: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
              }}
            >
              <DropdownMenu.Item style={itemStyle}>New tab</DropdownMenu.Item>
              <DropdownMenu.Item style={itemStyle}>New window</DropdownMenu.Item>
              <DropdownMenu.Separator style={{ height: 1, background: '#e2e8f0', margin: '4px 0' }} />
              <DropdownMenu.Item style={itemStyle}>Settings</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <Tabs.Root defaultValue="tab1" style={{ width: 280 }}>
          <Tabs.List style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e2e8f0', marginBottom: 12 }}>
            <Tabs.Trigger value="tab1" style={tabTriggerStyle}>
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger value="tab2" style={tabTriggerStyle}>
              Details
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tab1" style={{ fontSize: 14, color: '#64748b' }}>
            Overview content goes here.
          </Tabs.Content>
          <Tabs.Content value="tab2" style={{ fontSize: 14, color: '#64748b' }}>
            Details content goes here.
          </Tabs.Content>
        </Tabs.Root>
      </div>
      </main>
    </div>
  )
}

const itemStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 4,
  fontSize: 13,
  cursor: 'default',
  outline: 'none',
}
const tabTriggerStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
  color: '#64748b',
  borderBottom: '2px solid transparent',
  marginBottom: -1,
}
export default App
