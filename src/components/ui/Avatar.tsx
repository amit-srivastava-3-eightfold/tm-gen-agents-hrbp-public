import './Avatar.css'

export interface AvatarProps {
  initials: string
  avatarColor: string
  /** When set, shows professional photo instead of initials */
  avatarPhotoSrc?: string
  size?: 'sm' | 'md'
  className?: string
}

export function Avatar({ initials, avatarColor, avatarPhotoSrc, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = `avatar--${size}`
  if (avatarPhotoSrc) {
    return (
      <img
        src={avatarPhotoSrc}
        alt=""
        className={`avatar avatar--photo ${sizeClass} ${className}`.trim()}
      />
    )
  }
  return (
    <div
      className={`avatar ${sizeClass} ${className}`.trim()}
      style={{ background: avatarColor }}
    >
      {initials}
    </div>
  )
}
