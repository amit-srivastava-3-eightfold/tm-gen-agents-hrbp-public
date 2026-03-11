import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Button as DSButton } from '@tonyh-2-eightfold/ef-design-system'

/** DS variant "default" = primary style */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'orange' | 'link' | 'destructive'

/** DS size: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg */
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  /** Numeric badge (DS shows "99+" when > 99) */
  badge?: number
  children: ReactNode
}

const DS_VARIANT_MAP: Record<ButtonVariant, 'default' | 'secondary' | 'outline' | 'ghost' | 'orange' | 'link' | 'destructive'> = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  orange: 'orange',
  link: 'link',
  destructive: 'destructive',
}

export function Button({
  variant = 'primary',
  size,
  className = '',
  leadingIcon,
  trailingIcon,
  badge,
  children,
  ...props
}: ButtonProps) {
  return (
    <DSButton
      variant={DS_VARIANT_MAP[variant]}
      size={size}
      className={className}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      badge={badge}
      {...props}
    >
      {children}
    </DSButton>
  )
}
