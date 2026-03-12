import { useState, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import type { UserCardData, RiskTag } from './UserCard'
import './EditRiskSheet.css'

type RiskLevel = 'Low' | 'Medium' | 'High'

interface EditRiskSheetProps {
  user: UserCardData | null
  open: boolean
  onClose: () => void
  onSave?: (riskTags: RiskTag[]) => void
}

function getTagValue(tags: RiskTag[], label: string): RiskLevel | '' {
  const tag = tags.find((t) => t.label === label)
  if (!tag || tag.isEmpty || tag.value == null) return ''
  return tag.value as RiskLevel
}

const BODY_SHEET_ATTR = 'data-edit-sheet-open'

export function EditRiskSheet({ user, open, onClose, onSave }: EditRiskSheetProps) {
  const [retention, setRetention] = useState<RiskLevel | ''>('')
  const [lossImpact, setLossImpact] = useState<RiskLevel | ''>('')
  const [employeeCriticality, setEmployeeCriticality] = useState<RiskLevel | ''>('')

  useEffect(() => {
    if (user && open) {
      setRetention(getTagValue(user.riskTags, 'Retention risk'))
      setLossImpact(getTagValue(user.riskTags, 'Loss impact'))
      setEmployeeCriticality(getTagValue(user.riskTags, 'Employee criticality'))
    }
  }, [user, open])

  /* Force navbar/headers below sheet; run before paint so no flash */
  useLayoutEffect(() => {
    if (open) document.body.setAttribute(BODY_SHEET_ATTR, 'true')
    return () => document.body.removeAttribute(BODY_SHEET_ATTR)
  }, [open])

  if (!open) return null

  const handleSave = () => {
    if (user && onSave) {
      onSave([
        { label: 'Retention risk', ...(retention ? { value: retention } : { isEmpty: true }) },
        { label: 'Loss impact', ...(lossImpact ? { value: lossImpact } : { isEmpty: true }) },
        {
          label: 'Employee criticality',
          ...(employeeCriticality
            ? { value: employeeCriticality, isCritical: employeeCriticality === 'High' }
            : { isEmpty: true }),
        },
      ])
    }
    onClose()
  }

  const renderRadioGroup = (
    label: string,
    value: RiskLevel | '',
    onChange: (v: RiskLevel | '') => void
  ) => (
    <div className="edit-risk-sheet__field">
      <div className="edit-risk-sheet__field-label">
        <span>{label}</span>
        <span className="material-symbols-outlined edit-risk-sheet__info-icon" aria-label="Info">info</span>
      </div>
      <div className="edit-risk-sheet__radios" role="radiogroup" aria-label={label}>
        {(['Low', 'Medium', 'High'] as const).map((level) => (
          <label key={level} className="edit-risk-sheet__radio-label">
            <input
              type="radio"
              name={label}
              checked={value === level}
              onChange={() => onChange(value === level ? '' : level)}
              className="edit-risk-sheet__radio"
            />
            <span className="edit-risk-sheet__radio-text">{level}</span>
          </label>
        ))}
      </div>
    </div>
  )

  const sheetContent = (
    <div className="edit-risk-sheet__root" aria-modal="true" aria-labelledby="edit-risk-sheet-title">
      <div className="edit-risk-sheet__backdrop" onClick={onClose} aria-hidden />
      <div className="edit-risk-sheet" role="dialog">
        <header className="edit-risk-sheet__header">
          <div className="edit-risk-sheet__profile">
            <Avatar
              initials={user?.initials ?? '?'}
              avatarColor={user?.avatarColor ?? '#D9DCE1'}
              avatarPhotoSrc={user?.avatarPhotoSrc}
              size="md"
              className="edit-risk-sheet__avatar"
            />
            <div className="edit-risk-sheet__profile-text">
              <span className="edit-risk-sheet__name">{user?.name ?? ''}</span>
              <span className="edit-risk-sheet__title">{user?.title ?? ''}</span>
            </div>
          </div>
          <div className="edit-risk-sheet__header-actions">
            <button type="button" className="edit-risk-sheet__icon-btn" aria-label="More options">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            <button type="button" className="edit-risk-sheet__icon-btn" onClick={onClose} aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>
        <div className="edit-risk-sheet__body">
          <h2 id="edit-risk-sheet-title" className="edit-risk-sheet__heading">
            Edit information
          </h2>
          <div className="edit-risk-sheet__form">
            {renderRadioGroup('Retention risk', retention, setRetention)}
            {renderRadioGroup('Loss impact', lossImpact, setLossImpact)}
            {renderRadioGroup('Employee criticality', employeeCriticality, setEmployeeCriticality)}
          </div>
        </div>
        <footer className="edit-risk-sheet__footer">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </footer>
        <div className="edit-risk-sheet__help-tab" aria-hidden>
          Get Help
        </div>
      </div>
    </div>
  )

  return createPortal(sheetContent, document.body)
}
