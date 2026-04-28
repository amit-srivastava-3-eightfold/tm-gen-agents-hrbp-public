import { NavLink, Outlet } from 'react-router-dom'
import { NavbarApp } from '../components/Navbar'
import './ComponentsLayout.css'

interface NavSection {
  title: string
  items: { label: string; path: string }[]
}

const SECTIONS: NavSection[] = [
  {
    title: 'Career Hub Components',
    items: [
      { label: 'WFR Hero Card', path: '/components/wfr-hero-options' },
      { label: 'WFR Metric Cards', path: '/components/wfr-metric-cards' },
      { label: 'WFR Dialogs', path: '/components/wfr-dialogs' },
      { label: 'WFR Task Sheet', path: '/components/wfr-task-sheet' },
      { label: 'Dev plans', path: '/components/dev-plans' },
    ],
  },
]

export function ComponentsLayout() {
  return (
    <div className="components-layout">
      <NavbarApp />
      <div className="components-layout__body">
        <aside className="components-layout__sidebar">
          {SECTIONS.map((section) => (
            <div key={section.title} className="components-layout__section">
              <p className="components-layout__section-title">{section.title}</p>
              <nav>
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      isActive
                        ? 'components-layout__nav-link components-layout__nav-link--active'
                        : 'components-layout__nav-link'
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </aside>
        <main className="components-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
