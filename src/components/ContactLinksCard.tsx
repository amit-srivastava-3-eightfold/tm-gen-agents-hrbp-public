import { useUser } from '../contexts/UserContext'
import './ContactLinksCard.css'

export function ContactLinksCard() {
  const { currentUser } = useUser()
  const hasContact = currentUser.phone || currentUser.email

  return (
    <div className="contact-links-card">
      <div className="contact-links-card__header">
        <h3 className="contact-links-card__title">Contact & Links</h3>
        <button type="button" className="contact-links-card__edit-btn" aria-label="Edit contact">
          <span className="material-symbols-outlined">edit</span>
        </button>
      </div>
      {hasContact ? (
        <div className="contact-links-card__items">
          {currentUser.phone && (
            <a href={`tel:${currentUser.phone.replace(/\D/g, '')}`} className="contact-links-card__link">
              <span className="material-symbols-outlined contact-links-card__icon">call</span>
              {currentUser.phone}
            </a>
          )}
          {currentUser.email && (
            <a href={`mailto:${currentUser.email}`} className="contact-links-card__link">
              <span className="material-symbols-outlined contact-links-card__icon">mail</span>
              {currentUser.email}
            </a>
          )}
        </div>
      ) : (
        <p className="contact-links-card__empty">No contact information added.</p>
      )}
    </div>
  )
}
