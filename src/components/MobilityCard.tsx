import './MobilityCard.css'

interface MobilityCardProps {
  relocateValue?: string
  travelValue?: string
}

export function MobilityCard({ relocateValue, travelValue }: MobilityCardProps) {
  return (
    <div className="mobility-card">
      <h3 className="mobility-card__title">Mobility</h3>
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
