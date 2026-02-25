import { Button } from './ui/Button'
import './ui/Button.css'

export function MentorshipCard() {
  const ethanAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  const userAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'

  return (
    <div className="mentorship-card">
      <div className="mentorship-card__header">
        <h3 className="mentorship-card__title">Mentorship</h3>
        <div className="mentorship-card__icon-wrap" aria-hidden>
          <span className="material-symbols-outlined">supervisor_account</span>
        </div>
      </div>
      <div className="mentorship-card__avatars">
        <img src={userAvatar} alt="" className="mentorship-card__avatar mentorship-card__avatar--user" />
        <img src={ethanAvatar} alt="" className="mentorship-card__avatar mentorship-card__avatar--mentor" />
      </div>
      <p className="mentorship-card__cta">Connect with Ethan for mentorship</p>
      <ul className="mentorship-card__details">
        <li className="mentorship-card__detail mentorship-card__detail--with-pill">
          <span className="mentorship-card__detail-line">
            <span className="material-symbols-outlined mentorship-card__detail-icon">track_changes</span>
            Experience in 1 of your role interests
          </span>
          <span className="mentorship-card__pill">Solutions Architect</span>
        </li>
        <li className="mentorship-card__detail">
          <span className="material-symbols-outlined mentorship-card__detail-icon">domain</span>
          <span>Also a part of Sales Engineering</span>
        </li>
        <li className="mentorship-card__detail">
          <span className="material-symbols-outlined mentorship-card__detail-icon">work</span>
          <span>Also works on Enterprise Solutions</span>
        </li>
      </ul>
      <Button variant="orange" className="mentorship-card__btn mentorship-card__btn--full">
        Request mentorship
      </Button>
    </div>
  )
}
