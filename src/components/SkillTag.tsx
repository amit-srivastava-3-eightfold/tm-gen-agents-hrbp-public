import type { ReactNode } from 'react'
import './SkillTag.css'

export type SkillTagVariant = 'selected' | 'addable' | 'matched'

export type SkillTagSize = 'sm' | 'md' | 'lg'

export interface SkillTagProps {
  children: ReactNode
  variant?: SkillTagVariant
  size?: SkillTagSize
  onRemove?: () => void
  onAdd?: () => void
  className?: string
}

export function SkillTag({ children, variant = 'selected', size = 'md', onRemove, onAdd, className = '' }: SkillTagProps) {
  const baseClass = `skill-tag skill-tag--${variant} skill-tag--${size} ${className}`.trim()

  if (variant === 'addable') {
    return (
      <button type="button" className={baseClass} onClick={onAdd}>
        {children}
        <span className="material-symbols-outlined skill-tag__action">add</span>
      </button>
    )
  }

  if (variant === 'matched') {
    return (
      <span className={baseClass}>
        <span className="material-symbols-outlined skill-tag__matched-icon" aria-hidden>check</span>
        {children}
      </span>
    )
  }

  return (
    <span className={baseClass}>
      {children}
      {onRemove && (
        <button
          type="button"
          className="skill-tag__remove"
          onClick={onRemove}
          aria-label={`Remove ${children}`}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </span>
  )
}
