export type CoachAvatarSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_CLASS: Record<CoachAvatarSize, string> = {
  sm: 's-32',
  md: 's-40',
  lg: 's-56',
  xl: 's-56',
}

interface CoachAvatarProps {
  size?: CoachAvatarSize
  className?: string
}

export function CoachAvatar({ size = 'md', className = '' }: CoachAvatarProps) {
  return (
    <span className={`coach-av ${SIZE_CLASS[size]} ${className}`} aria-hidden>
      <span className="material-symbols-outlined">auto_awesome</span>
    </span>
  )
}
