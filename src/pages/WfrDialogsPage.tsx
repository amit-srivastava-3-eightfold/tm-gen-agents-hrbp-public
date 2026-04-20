/**
 * Design page: WFR Dialogs
 * Interactive preview of Data Collection and Upskilling launch wizards.
 */
import { useState } from 'react'
import { Button } from '@tonyh-2-eightfold/ef-design-system'
import { FocusFirstLaunchDialog, type HrbpDirector } from '../components/workforceReadiness/FocusFirstLaunchDialog'
import { UpskillingLaunchDialog } from '../components/workforceReadiness/UpskillingLaunchDialog'
import { departments } from '../data/wfrOrgData'
import { deptManagerTeams } from '../components/workforceReadiness/collectionHelpers'
import '../components/workforceReadiness/WorkforceReadinessDashboard.css'

// Build demo directors from Engineering dept for the HRBP component preview
const DEMO_HRBP_DIRECTORS: HrbpDirector[] = (() => {
  const dept = departments.find(d => d.name === 'Engineering')
  if (!dept) return []
  const mgrs = deptManagerTeams('Engineering', dept.employees)
  const names = ['Robin Cohen', 'Taylor Reyes', 'Morgan Brown', 'Blake Culhane', 'Emery Johansson', 'Kendall Gupta', 'Devon Larsson', 'Rowan Petrov', 'Priya Thompson', 'Logan Wilson']
  const titles = ['VP Engineering', 'Sr. Director Engineering', 'Director Platform', 'Director Frontend', 'Director QA', 'Director DevOps', 'Director Mobile', 'Director Infrastructure', 'Director ML', 'Director SRE']
  const perDir = Math.ceil(mgrs.length / 10)
  return Array.from({ length: 10 }, (_, i) => {
    const batch = mgrs.slice(i * perDir, (i + 1) * perDir)
    const employees = batch.reduce((s, m) => s + m.employees, 0)
    return { name: names[i], title: titles[i], employees, readiness: dept.aiReadiness, readyCount: Math.round(employees * dept.aiReadiness / 100), teamManagers: batch.length }
  }).filter(d => d.employees > 0)
})()

export default function WfrDialogsPage() {
  const [collectionOpen, setCollectionOpen] = useState(false)
  const [collectionHrbpOpen, setCollectionHrbpOpen] = useState(false)
  const [upskillingOpen, setUpskillingOpen] = useState(false)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto', fontFamily: 'var(--font-family)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
        WFR Dialogs
      </h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>
        Data Collection and Upskilling launch wizards.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Data Collection — CHRO flow */}
        <div style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 4px' }}>
            Data Collection — CHRO
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>
            4-step wizard: Assign &rarr; Scope &rarr; Channels &rarr; Review
          </p>
          <Button text="Open dialog" variant="Default" onClick={() => setCollectionOpen(true)} />
        </div>

        {/* Data Collection — HRBP flow */}
        <div style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 4px' }}>
            Data Collection — HRBP
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>
            Simplified wizard: Channels &rarr; Review (HRBP-initiated)
          </p>
          <Button text="Open dialog" variant="Default" onClick={() => setCollectionHrbpOpen(true)} />
        </div>

        {/* Upskilling */}
        <div style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 4px' }}>
            Upskilling Launch
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>
            2-step wizard: Departments &rarr; Review
          </p>
          <Button text="Open dialog" variant="Default" onClick={() => setUpskillingOpen(true)} />
        </div>
      </div>

      <FocusFirstLaunchDialog
        open={collectionOpen}
        onOpenChange={setCollectionOpen}
        onLaunch={() => setCollectionOpen(false)}
      />

      <FocusFirstLaunchDialog
        open={collectionHrbpOpen}
        onOpenChange={setCollectionHrbpOpen}
        hrbpMode
        hrbpDirectors={DEMO_HRBP_DIRECTORS}
        defaultScopeDepartmentName="Engineering"
        onHrbpLaunch={() => setCollectionHrbpOpen(false)}
      />

      <UpskillingLaunchDialog
        open={upskillingOpen}
        onOpenChange={setUpskillingOpen}
        onLaunch={() => setUpskillingOpen(false)}
      />
    </div>
  )
}
