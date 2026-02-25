import { Button } from './ui/Button'
import './ui/Button.css'

const USER_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'

export function PersonBanner() {
  return (
    <div className="person-banner">
      <div className="person-banner__info">
        <img src={USER_AVATAR} alt="" className="person-banner__avatar person-banner__avatar--photo" />
        <div className="person-banner__details">
          <h2 className="person-banner__name">Mateo Myer</h2>
          <p className="person-banner__role">Sales Engineering Manager • Santa Clara, CA</p>
        </div>
      </div>
      <Button variant="primary">
        <span className="material-symbols-outlined">account_tree</span>
        View org chart
      </Button>
    </div>
  )
}
