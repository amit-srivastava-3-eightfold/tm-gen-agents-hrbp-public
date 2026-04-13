import './MobilityCard.css'

interface MobilityCardProps {
  relocateValue?: string
  travelValue?: string
  showEditButton?: boolean
}

export function MobilityCard({ relocateValue, travelValue, showEditButton = true }: MobilityCardProps) {
  return (
    <div className="mobility-card">
      <div className="mobility-card__header">
        <h3 className="mobility-card__title">Mobility</h3>
        {showEditButton && (
          <button type="button" className="mobility-card__edit-btn" aria-label="Edit mobility">
            <span className="material-symbols-outlined">edit</span>
          </button>
        )}
      </div>
      <div className="mobility-card__items">
        <div className="mobility-card__item">
          <div className="mobility-card__item-row">
            <span className="material-symbols-outlined mobility-card__icon mobility-card__icon--relocate">local_shipping</span>
            <span className="mobility-card__value">{relocateValue ?? '--'}</span>
          </div>
          <span className="mobility-card__label">Flexibility to relocate</span>
        </div>
        <div className="mobility-card__item">
          <div className="mobility-card__item-row">
            <span className="material-symbols-outlined mobility-card__icon mobility-card__icon--travel">flight</span>
            <span className="mobility-card__value">{travelValue ?? '--'}</span>
          </div>
          <span className="mobility-card__label">Flexibility to travel</span>
        </div>
      </div>
    </div>
  )
}
