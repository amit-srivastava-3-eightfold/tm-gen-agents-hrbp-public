import usageHeaderImg from '../assets/usage-default.svg'

interface PageHeaderProps {
  title: string
  /** Medium: shorter header (Octuple medium page header). */
  size?: 'default' | 'medium'
  children?: React.ReactNode
}

export function PageHeader({ title, size = 'default', children }: PageHeaderProps) {
  return (
    <header className={`page-header${size === 'medium' ? ' page-header--medium' : ''}`}>
      <img
        src={usageHeaderImg}
        alt=""
        className="page-header__img"
        aria-hidden
      />
      <div className="page-header__fade" aria-hidden />
      <div className="page-header__content">
        <h1 className="page-header__title">{title}</h1>
        {children}
      </div>
    </header>
  )
}
