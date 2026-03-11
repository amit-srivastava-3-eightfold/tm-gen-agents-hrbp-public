import { useUser } from '../contexts/UserContext'
import { Button } from './ui/Button'

export function PersonBanner() {
  const { currentUser } = useUser()
  const avatarSrc = currentUser.avatarType === 'photo' && currentUser.avatarPhotoSrc
    ? currentUser.avatarPhotoSrc
    : null

  return (
    <div className="person-banner">
      <div className="person-banner__info">
        {avatarSrc ? (
          <img src={avatarSrc} alt="" className="person-banner__avatar person-banner__avatar--photo" />
        ) : (
          <div
            className="person-banner__avatar person-banner__avatar--initials"
            style={currentUser.avatarColor ? { background: currentUser.avatarColor } : undefined}
          >
            {currentUser.avatarInitials}
          </div>
        )}
        <div className="person-banner__details">
          <h2 className="person-banner__name">{currentUser.name}</h2>
          <p className="person-banner__role">{currentUser.title} • {currentUser.location}</p>
        </div>
      </div>
      <Button variant="primary">
        <span className="material-symbols-outlined">account_tree</span>
        View org chart
      </Button>
    </div>
  )
}
