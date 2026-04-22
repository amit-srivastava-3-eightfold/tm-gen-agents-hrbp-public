export type CoachAvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface CoachAvatarProps {
  size?: CoachAvatarSize
  className?: string
}

export function CoachAvatar({ size = 'md', className = '' }: CoachAvatarProps) {
  return (
    <span className={`mw-coach-av mw-coach-av--${size} ${className}`} aria-hidden>
      <span className="material-symbols-outlined">auto_awesome</span>
    </span>
  )
}
