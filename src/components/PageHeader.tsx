import { ProductBackground } from '@tonyh-2-eightfold/ef-design-system'

interface PageHeaderProps {
  title: string
  /** Medium: shorter header (Octuple medium page header). */
  size?: 'default' | 'medium'
  children?: React.ReactNode
  /** @deprecated Waves variant was removed from the design system; falls back to chevrons. */
  wavesVariant?: 'default' | 'profile' | 'cover'
  hexagonsVariant?: 'default' | 'profile' | 'cover'
  chevronsVariant?: 'default' | 'profile' | 'cover'
}

export function PageHeader({ title, size = 'default', children, wavesVariant, hexagonsVariant, chevronsVariant }: PageHeaderProps) {
  // Waves variant was removed from the DS — map any incoming wavesVariant to the
  // matching chevrons variant so old callers still render a background on Vercel.
  const fallbackChevrons = wavesVariant ?? chevronsVariant
  const bgProps = hexagonsVariant != null
    ? { hexagonsVariant }
    : fallbackChevrons != null
    ? { chevronsVariant: fallbackChevrons === 'cover' ? 'default' : fallbackChevrons }
    : { chevronsVariant: 'default' as const }

  return (
    <ProductBackground
      className={`page-header${size === 'medium' ? ' page-header--medium' : ''}`}
      variant="career-hub"
      {...bgProps}
    >
      <div className="page-header__fade" aria-hidden />
      <div className="page-header__content">
        <h1 className="page-header__title">{title}</h1>
        {children}
      </div>
    </ProductBackground>
  )
}
