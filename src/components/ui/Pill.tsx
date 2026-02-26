import type { ReactNode } from 'react'
import './Pill.css'

type PillVariant = 'neutral' | 'critical' | 'empty' | 'orange' | 'blueGreen'
type PillSize = 'small' | 'medium' | 'large'

interface PillProps {
  icon?: string
  children: ReactNode
  variant?: PillVariant
  size?: PillSize
  className?: string
}

/** Octuple DS Theme 2 Pill / Tag */
export function Pill({ icon, children, variant = 'neutral', size = 'medium', className = '' }: PillProps) {
  return (
    <span className={`pill pill--${variant} pill--${size} ${className}`.trim()}>
      {icon && <span className="material-symbols-outlined pill__icon">{icon}</span>}
      {children}
    </span>
  )
}
