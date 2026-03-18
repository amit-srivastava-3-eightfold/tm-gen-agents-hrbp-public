import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { ChevronRight } from 'lucide-react'
import './Breadcrumb.css'

export function Breadcrumb({ className, ...props }: React.ComponentPropsWithoutRef<'nav'>) {
  return <nav aria-label="Breadcrumb" className={className ? `ds-breadcrumb ${className}` : 'ds-breadcrumb'} {...props} />
}

export function BreadcrumbList({ className, ...props }: React.ComponentPropsWithoutRef<'ol'>) {
  return <ol className={className ? `ds-breadcrumb__list ${className}` : 'ds-breadcrumb__list'} {...props} />
}

export function BreadcrumbItem({ className, ...props }: React.ComponentPropsWithoutRef<'li'>) {
  return <li className={className ? `ds-breadcrumb__item ${className}` : 'ds-breadcrumb__item'} {...props} />
}

type BreadcrumbLinkProps = React.ComponentPropsWithoutRef<'button'> & {
  asChild?: boolean
}

export const BreadcrumbLink = React.forwardRef<HTMLButtonElement, BreadcrumbLinkProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        type={asChild ? undefined : 'button'}
        className={className ? `ds-breadcrumb__link ${className}` : 'ds-breadcrumb__link'}
        {...props}
      />
    )
  },
)
BreadcrumbLink.displayName = 'BreadcrumbLink'

export function BreadcrumbPage({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={className ? `ds-breadcrumb__page ${className}` : 'ds-breadcrumb__page'}
      {...props}
    />
  )
}

export function BreadcrumbSeparator({ children, className, ...props }: React.ComponentPropsWithoutRef<'li'>) {
  return (
    <li
      role="presentation"
      aria-hidden
      className={className ? `ds-breadcrumb__separator ${className}` : 'ds-breadcrumb__separator'}
      {...props}
    >
      {children ?? <ChevronRight aria-hidden />}
    </li>
  )
}
