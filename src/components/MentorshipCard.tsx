import { Button } from './ui/Button'
import { useUser } from '../contexts/UserContext'

const mateoAvatar = '/john.png'
const lauraAvatar = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
const ethanAvatar = 'https://i.pravatar.cc/150?u=ethan'
const sarahAvatar = 'https://i.pravatar.cc/150?u=sarah-chen'

export function MentorshipCard() {
  const { currentUser } = useUser()
  const isLaura = currentUser.id === 'jaydon-torff'
  const userAvatar = isLaura ? lauraAvatar : mateoAvatar

  if (isLaura) {
    return (
      <div className="mentorship-card">
        <div className="mentorship-card__header">
          <h3 className="mentorship-card__title">Coaching</h3>
          <div className="mentorship-card__icon-wrap" aria-hidden>
            <span className="material-symbols-outlined">psychology</span>
          </div>
        </div>
        <div className="mentorship-card__avatars">
          <img src={userAvatar} alt="" className="mentorship-card__avatar mentorship-card__avatar--user" />
          <img src={sarahAvatar} alt="" className="mentorship-card__avatar mentorship-card__avatar--mentor" />
        </div>
        <p className="mentorship-card__cta">Connect with Sarah for leadership coaching</p>
        <ul className="mentorship-card__details">
          <li className="mentorship-card__detail mentorship-card__detail--with-pill">
            <span className="mentorship-card__detail-line">
              <span className="material-symbols-outlined mentorship-card__detail-icon">track_changes</span>
              CHRO with 15+ years HR leadership
            </span>
            <span className="mentorship-card__pill">Executive Coach</span>
          </li>
          <li className="mentorship-card__detail">
            <span className="material-symbols-outlined mentorship-card__detail-icon">domain</span>
            <span>Leads HR strategy across Acme</span>
          </li>
          <li className="mentorship-card__detail">
            <span className="material-symbols-outlined mentorship-card__detail-icon">work</span>
            <span>Expert in talent development</span>
          </li>
        </ul>
        <Button variant="orange" className="mentorship-card__btn mentorship-card__btn--full">
          Request coaching
        </Button>
      </div>
    )
  }

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
          <span className="mentorship-card__pill">Staff ML Engineer</span>
        </li>
        <li className="mentorship-card__detail">
          <span className="material-symbols-outlined mentorship-card__detail-icon">domain</span>
          <span>Also a part of Engineering</span>
        </li>
        <li className="mentorship-card__detail">
          <span className="material-symbols-outlined mentorship-card__detail-icon">work</span>
          <span>Also works on ML Infrastructure</span>
        </li>
      </ul>
      <Button variant="orange" className="mentorship-card__btn mentorship-card__btn--full">
        Request mentorship
      </Button>
    </div>
  )
}
