import { ProductBackground } from '@tonyh-2-eightfold/ef-design-system'

interface PageHeaderProps {
  title: string
  /** Medium: shorter header (Octuple medium page header). */
  size?: 'default' | 'medium'
  children?: React.ReactNode
  wavesVariant?: 'default' | 'profile' | 'cover'
  hexagonsVariant?: 'default' | 'profile' | 'cover'
  chevronsVariant?: 'default' | 'profile' | 'cover'
}

export function PageHeader({ title, size = 'default', children, wavesVariant, hexagonsVariant, chevronsVariant }: PageHeaderProps) {
  const bgProps = wavesVariant != null
    ? { wavesVariant }
    : hexagonsVariant != null
    ? { hexagonsVariant }
    : chevronsVariant != null
    ? { chevronsVariant }
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
