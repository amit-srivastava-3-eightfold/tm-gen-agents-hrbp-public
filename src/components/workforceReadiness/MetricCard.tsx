import React, { useMemo } from 'react'
import { InsightCard } from '@tonyh-2-eightfold/ef-design-system'
import type { ReactNode } from 'react'

export interface MetricCardProps {
  variant?: string
  icon: string
  label: string
  badge?: ReactNode
  value: ReactNode
  explainer?: ReactNode
  description: React.ReactNode
  hint?: string
  tag?: ReactNode
  onLearnMore?: () => void
  actionLabel?: string
  children?: ReactNode
}

const VARIANT_THEME: Record<string, { bgColor: string; iconBgColor: string; iconColor: string; textColor: string }> = {
  'ai-potential': { bgColor: '#eef2ff', iconBgColor: '#e0e7ff', iconColor: '#4338ca', textColor: '#1e1b4b' },
  'potential':    { bgColor: '#eef2ff', iconBgColor: '#e0e7ff', iconColor: '#7c3aed', textColor: '#1e1b4b' },
  'readiness':    { bgColor: '#eef2ff', iconBgColor: '#e0e7ff', iconColor: '#2563eb', textColor: '#1e3a8a' },
  'gap':          { bgColor: '#fff7ed', iconBgColor: '#ffedd5', iconColor: '#ea580c', textColor: '#7c2d12' },
}

const DEFAULT_THEME = { bgColor: '#f4f5f7', iconBgColor: '#e2e8f0', iconColor: '#475569', textColor: '#1a212e' }

export function MetricCard({
  variant,
  icon,
  label,
  badge,
  value,
  description,
  hint,
  tag,
  explainer,
  onLearnMore,
  actionLabel = 'Learn more',
  children,
}: MetricCardProps) {
  const theme = (variant ? VARIANT_THEME[variant] : undefined) ?? DEFAULT_THEME

  // Suppress unused-variable warning — actionLabel kept for API compat
  void useMemo(() => actionLabel, [actionLabel])

  const learnMoreBtn = onLearnMore ? (
    <button
      type="button"
      onClick={onLearnMore}
      style={{
        font: 'var(--typography-body3)',
        color: '#146DA6',
        fontWeight: 600,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {actionLabel} <span style={{ fontSize: 13 }}>→</span>
    </button>
  ) : null

  const cardChildren = (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <p style={{ font: 'var(--typography-header2)', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '0 0 10px', color: theme.textColor }}>
        {value}
      </p>
      {explainer && <p style={{ font: 'var(--typography-body3)', color: '#1a212e', margin: '0 0 4px' }}>{explainer}</p>}
      <div style={{ font: 'var(--typography-body3)', color: '#4f5666', margin: '0 0 6px' }}>{description}</div>
      {hint && <p style={{ font: 'var(--typography-body3)', color: '#94a3b8', margin: '0 0 6px' }}>{hint}</p>}
      {/* Footer row: badge/tag and/or children on the left, Learn more on the right — pushed to bottom */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto', paddingTop: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {tag}
          {children}
        </div>
        {learnMoreBtn}
      </div>
    </div>
  )

  return (
    <InsightCard
      title={label}
      badge={badge}
      description=""
      icon={icon}
      bgColor={theme.bgColor}
      iconBgColor={theme.iconBgColor}
      iconColor={theme.iconColor}
      textColor={theme.textColor}
      fixedSize={false}
    >
      {cardChildren}
    </InsightCard>
  )
}
