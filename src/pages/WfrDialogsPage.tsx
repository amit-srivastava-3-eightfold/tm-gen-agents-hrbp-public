/**
 * Design page: WFR Dialogs
 * Interactive preview of Data Collection and Upskilling launch wizards.
 */
import { useState } from 'react'
import { Button } from '@tonyh-2-eightfold/ef-design-system'
import { FocusFirstLaunchDialog } from '../components/workforceReadiness/FocusFirstLaunchDialog'
import { UpskillingLaunchDialog } from '../components/workforceReadiness/UpskillingLaunchDialog'
import '../components/workforceReadiness/WorkforceReadinessDashboard.css'

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
            3-step wizard: Assign &rarr; Departments &rarr; Review
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
