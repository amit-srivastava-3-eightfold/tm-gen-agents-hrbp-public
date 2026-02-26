import { Button } from './ui/Button'
import './ui/Button.css'
import { useUser } from '../contexts/UserContext'

const managerAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face'
const lauraAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face'

const peerColors = ['#A1A6B1', '#7E3A77', '#9D6309', '#6B7B3C'] // grey, purple, amber, olive

export function OrganizationCard() {
  const { currentUser } = useUser()
  const isLaura = currentUser.id === 'laura-shah'

  if (isLaura) {
    return (
      <div className="org-card">
        <div className="org-card__header">
          <h3 className="org-card__title">Organization</h3>
          <Button variant="outline">View org chart</Button>
        </div>
        <div className="org-card__section">
          <h4 className="org-card__section-title">Manager</h4>
          <div className="org-card__person">
            <div className="org-card__avatar org-card__avatar--initials" style={{ background: '#5C6BC0' }}>
              SC
            </div>
            <div className="org-card__person-info">
              <span className="org-card__person-name">Sarah Chen</span>
              <span className="org-card__person-title">Chief Human Resources Officer</span>
            </div>
          </div>
        </div>
        <div className="org-card__divider" />
        <div className="org-card__section">
          <div className="org-card__section-head">
            <h4 className="org-card__section-title">Business Units Supported</h4>
            <span className="org-card__badge">3</span>
          </div>
          <p className="org-card__names">Sales Engineering, Customer Success, Professional Services</p>
        </div>
        <div className="org-card__divider" />
        <div className="org-card__section">
          <div className="org-card__section-head">
            <h4 className="org-card__section-title">HRBP Peers</h4>
            <span className="org-card__badge">5</span>
          </div>
          <div className="org-card__avatar-row org-card__avatar-row--with-badge">
            <img src={lauraAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[0] }}>JM</div>
            <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[1] }}>KR</div>
            <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[2] }}>DT</div>
            <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[3] }}>AP</div>
            <span className="org-card__badge org-card__badge--plus">+1</span>
          </div>
          <p className="org-card__names">Laura, James, Kim, David, Anna and others</p>
        </div>
      </div>
    )
  }

  return (
    <div className="org-card">
      <div className="org-card__header">
        <h3 className="org-card__title">Organization</h3>
        <Button variant="outline">View org chart</Button>
      </div>
      <div className="org-card__section">
        <h4 className="org-card__section-title">Manager</h4>
        <div className="org-card__person">
          <div className="org-card__avatar org-card__avatar--initials" style={{ background: '#6B7B3C' }}>
            CW
          </div>
          <div className="org-card__person-info">
            <span className="org-card__person-name">Cong Wang</span>
            <span className="org-card__person-title">Director of Sales Engineering</span>
          </div>
        </div>
      </div>
      <div className="org-card__divider" />
      <div className="org-card__section">
        <div className="org-card__section-head">
          <h4 className="org-card__section-title">Direct Reports</h4>
          <span className="org-card__badge">4</span>
        </div>
        <div className="org-card__avatar-row">
          <img src={managerAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
          <div className="org-card__avatar org-card__avatar--initials" style={{ background: '#6B7B3C' }}>MM</div>
          <div className="org-card__avatar org-card__avatar--initials" style={{ background: '#6B7B3C' }}>PL</div>
          <div className="org-card__avatar org-card__avatar--initials" style={{ background: '#6B7B3C' }}>VP</div>
        </div>
        <p className="org-card__names">Mateo, Maureen, Priyanka and Venkat</p>
      </div>
      <div className="org-card__divider" />
      <div className="org-card__section">
        <div className="org-card__section-head">
          <h4 className="org-card__section-title">Peers</h4>
          <span className="org-card__badge">7</span>
        </div>
        <div className="org-card__avatar-row org-card__avatar-row--with-badge">
          <img src={managerAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
          <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[0] }}>YA</div>
          <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[1] }}>YC</div>
          <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[2] }}>RB</div>
          <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[3] }}>CS</div>
          <span className="org-card__badge org-card__badge--plus">+2</span>
        </div>
        <p className="org-card__names">Sachit, Yoseph, Yu, Rajarajan, Clinton and others</p>
      </div>
    </div>
  )
}
