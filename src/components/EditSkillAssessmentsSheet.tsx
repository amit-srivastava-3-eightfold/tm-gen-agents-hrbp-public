import { useState, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { Link } from 'react-router-dom'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { TabsWithLines } from './ui/TabsWithLines'
import type { UserCardData } from './UserCard'
import './EditSkillAssessmentsSheet.css'

export interface SkillWithProficiency {
  name: string
  proficiency: number
}

const PROFICIENCY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
}

function getProficiencyLabel(value: number): string {
  if (value < 2) return PROFICIENCY_LABELS.beginner
  if (value < 3.5) return PROFICIENCY_LABELS.intermediate
  return PROFICIENCY_LABELS.expert
}

function defaultProficiency(skillName: string, user: UserCardData): number {
  if (user.skillGaps?.includes(skillName)) return 1.5
  if (user.skillStrengths?.includes(skillName)) return 4.2
  return 3.5
}

interface EditSkillAssessmentsSheetProps {
  user: UserCardData | null
  requiredByRoleSkills: string[]
  otherSkills: string[]
  /** Saved proficiencies (e.g. from previous Save) so numbers carry over when reopening the sheet */
  initialProficiencies?: Record<string, number>
  open: boolean
  onClose: () => void
  onSave?: (assessments: SkillWithProficiency[]) => void
}

const BODY_SHEET_ATTR = 'data-edit-skill-assessments-open'

export function EditSkillAssessmentsSheet({
  user,
  requiredByRoleSkills,
  otherSkills,
  initialProficiencies,
  open,
  onClose,
  onSave,
}: EditSkillAssessmentsSheetProps) {
  const [proficiencies, setProficiencies] = useState<Record<string, number>>({})

  useEffect(() => {
    if (user && open) {
      const next: Record<string, number> = {}
      const fromSaved = (name: string) => initialProficiencies?.[name] ?? defaultProficiency(name, user)
      for (const name of requiredByRoleSkills) {
        next[name] = fromSaved(name)
      }
      for (const name of otherSkills) {
        next[name] = fromSaved(name)
      }
      setProficiencies(next)
    }
  }, [user, open, requiredByRoleSkills, otherSkills, initialProficiencies])

  useLayoutEffect(() => {
    if (open) document.body.setAttribute(BODY_SHEET_ATTR, 'true')
    return () => document.body.removeAttribute(BODY_SHEET_ATTR)
  }, [open])

  if (!open) return null

  const handleProficiencyChange = (skillName: string, value: number) => {
    setProficiencies((prev) => ({ ...prev, [skillName]: value }))
  }

  const handleSave = () => {
    if (user && onSave) {
      const list: SkillWithProficiency[] = [
        ...requiredByRoleSkills.map((name) => ({ name, proficiency: proficiencies[name] ?? 3.5 })),
        ...otherSkills.map((name) => ({ name, proficiency: proficiencies[name] ?? 3.5 })),
      ]
      onSave(list)
    }
    onClose()
  }

  const renderSkillRow = (skillName: string) => {
    const value = proficiencies[skillName] ?? 3.5
    const label = getProficiencyLabel(value)
    return (
      <li key={skillName} className="edit-skill-assessments__skill-row">
        <span className="edit-skill-assessments__skill-chip">{skillName}</span>
        <div className="edit-skill-assessments__slider-wrap">
          <div className="edit-skill-assessments__bar-container">
            <input
              type="range"
              min={1}
              max={5}
              step={0.1}
              value={value}
              onChange={(e) => handleProficiencyChange(skillName, Number(e.target.value))}
              className="edit-skill-assessments__slider"
              aria-label={`Proficiency for ${skillName}`}
              style={{ ['--slider-pct' as string]: `${((value - 1) / 4) * 100}%` }}
            />
          </div>
          <span className="edit-skill-assessments__proficiency-value">
            {value.toFixed(1)} ({label})
          </span>
        </div>
        <button type="button" className="edit-skill-assessments__options-btn" aria-label={`Options for ${skillName}`}>
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </li>
    )
  }

  const sheetContent = (
    <div className="edit-skill-assessments__root" aria-modal="true" aria-labelledby="edit-skill-assessments-title">
      <div className="edit-skill-assessments__backdrop" onClick={onClose} aria-hidden />
      <div className="edit-skill-assessments__panel" role="dialog">
        <header className="edit-skill-assessments__header">
          <div className="edit-skill-assessments__profile">
            <Avatar
              initials={user?.initials ?? '?'}
              avatarColor={user?.avatarColor ?? '#D9DCE1'}
              avatarPhotoSrc={user?.avatarPhotoSrc}
              size="md"
              className="edit-skill-assessments__avatar"
            />
            <div className="edit-skill-assessments__profile-text">
              <span className="edit-skill-assessments__name">{user?.name ?? ''}</span>
              <span className="edit-skill-assessments__title">{user?.title ?? ''}</span>
            </div>
          </div>
          <div className="edit-skill-assessments__header-actions">
            {user?.id && (
              <Link to={`/people/${user.id}`} className="edit-skill-assessments__view-profile">
                View profile
              </Link>
            )}
            <button type="button" className="edit-skill-assessments__icon-btn" onClick={onClose} aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>
        <div className="edit-skill-assessments__body">
          <h2 id="edit-skill-assessments-title" className="edit-skill-assessments__heading">
            Edit skill assessments
          </h2>
          <TabsWithLines
            tabs={[
              { id: 'required', label: 'Required by role', badge: requiredByRoleSkills.length },
              { id: 'other', label: 'Other skills', badge: otherSkills.length },
            ]}
            defaultValue="required"
            className="edit-skill-assessments__tabs"
          >
            <Tabs.Content value="required" className="tabs-with-lines__content edit-skill-assessments__tab-content">
              <ul className="edit-skill-assessments__skill-list">
                {requiredByRoleSkills.map(renderSkillRow)}
              </ul>
            </Tabs.Content>
            <Tabs.Content value="other" className="tabs-with-lines__content edit-skill-assessments__tab-content">
              <ul className="edit-skill-assessments__skill-list">
                {otherSkills.map(renderSkillRow)}
              </ul>
            </Tabs.Content>
          </TabsWithLines>
        </div>
        <footer className="edit-skill-assessments__footer">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </footer>
      </div>
    </div>
  )

  return createPortal(sheetContent, document.body)
}
