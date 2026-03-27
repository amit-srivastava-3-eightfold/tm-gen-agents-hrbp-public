import { Button } from '@tonyh-2-eightfold/ef-design-system'
import { useUser } from '../contexts/UserContext'

const mateoAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face'
const sachitAvatar = 'https://i.pravatar.cc/80?u=sachit'

// CHRO org photos
const ceoAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
const sarahChenAvatar = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face'
const rachelKimAvatar = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face'
const tomNguyenAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
const anaMartinezAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face'
const davidParkAvatar = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face'
const karenLeeAvatar = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face'
const jamesWuAvatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face'
const ninaShahAvatar = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face'

const peerColors = ['#A1A6B1', '#7E3A77', '#9D6309', '#6B7B3C'] // grey, purple, amber, olive

export function OrganizationCard() {
  const { currentUser } = useUser()
  const isChro = currentUser.id === 'chro'
  const isLaura = currentUser.id === 'jaydon-torff'
  const isCsm = currentUser.id === 'csm'

  if (isCsm) {
    return (
      <div className="org-card">
        <div className="org-card__header">
          <h3 className="org-card__title">Organization</h3>
          <Button variant="default">View org chart</Button>
        </div>
        <div className="org-card__section">
          <h4 className="org-card__section-title">Manager</h4>
          <div className="org-card__person">
            <img src={tomNguyenAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <div className="org-card__person-info">
              <span className="org-card__person-name">Tom Nguyen</span>
              <span className="org-card__person-title">VP, Customer Success</span>
            </div>
          </div>
        </div>
        <div className="org-card__divider" />
        <div className="org-card__section">
          <div className="org-card__section-head">
            <h4 className="org-card__section-title">Direct Reports</h4>
            <span className="org-card__badge">6</span>
          </div>
          <div className="org-card__avatar-row org-card__avatar-row--with-badge">
            <img src={rachelKimAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <img src={anaMartinezAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <img src={karenLeeAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[0] }}>JP</div>
            <span className="org-card__badge org-card__badge--plus">+2</span>
          </div>
          <p className="org-card__names">Rachel, Ana, Karen, Jamie and others</p>
        </div>
        <div className="org-card__divider" />
        <div className="org-card__section">
          <div className="org-card__section-head">
            <h4 className="org-card__section-title">Peers</h4>
            <span className="org-card__badge">8</span>
          </div>
          <div className="org-card__avatar-row org-card__avatar-row--with-badge">
            <img src={davidParkAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <img src={sarahChenAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[1] }}>MK</div>
            <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[2] }}>SL</div>
            <span className="org-card__badge org-card__badge--plus">+4</span>
          </div>
          <p className="org-card__names">David, Sarah, Maya, Sam and others</p>
        </div>
      </div>
    )
  }

  if (isChro) {
    return (
      <div className="org-card">
        <div className="org-card__header">
          <h3 className="org-card__title">Organization</h3>
          <Button variant="default">View org chart</Button>
        </div>
        <div className="org-card__section">
          <h4 className="org-card__section-title">Reports to</h4>
          <div className="org-card__person">
            <img src={ceoAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <div className="org-card__person-info">
              <span className="org-card__person-name">Michael Torres</span>
              <span className="org-card__person-title">Chief Executive Officer</span>
            </div>
          </div>
        </div>
        <div className="org-card__divider" />
        <div className="org-card__section">
          <div className="org-card__section-head">
            <h4 className="org-card__section-title">HR Leadership Team</h4>
            <span className="org-card__badge">6</span>
          </div>
          <div className="org-card__avatar-row org-card__avatar-row--with-badge">
            <img src={sarahChenAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <img src={rachelKimAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <img src={tomNguyenAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <img src={anaMartinezAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <span className="org-card__badge org-card__badge--plus">+2</span>
          </div>
          <p className="org-card__names">Sarah Chen, Rachel Kim, Tom Nguyen, Ana Martinez and others</p>
        </div>
        <div className="org-card__divider" />
        <div className="org-card__section">
          <div className="org-card__section-head">
            <h4 className="org-card__section-title">C-Suite Peers</h4>
            <span className="org-card__badge">5</span>
          </div>
          <div className="org-card__avatar-row org-card__avatar-row--with-badge">
            <img src={davidParkAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <img src={karenLeeAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <img src={jamesWuAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <img src={ninaShahAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <span className="org-card__badge org-card__badge--plus">+1</span>
          </div>
          <p className="org-card__names">David Park (CFO), Karen Lee (CTO), James Wu (COO), Nina Shah (CMO) and others</p>
        </div>
      </div>
    )
  }

  if (isLaura) {
    return (
      <div className="org-card">
        <div className="org-card__header">
          <h3 className="org-card__title">Organization</h3>
          <Button variant="default">View org chart</Button>
        </div>
        <div className="org-card__section">
          <h4 className="org-card__section-title">Manager</h4>
          <div className="org-card__person">
            <img src={sarahChenAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <div className="org-card__person-info">
              <span className="org-card__person-name">Sarah Chen</span>
              <span className="org-card__person-title">VP, People Operations</span>
            </div>
          </div>
        </div>
        <div className="org-card__divider" />
        <div className="org-card__section">
          <div className="org-card__section-head">
            <h4 className="org-card__section-title">Department Supported</h4>
            <span className="org-card__badge">1</span>
          </div>
          <p className="org-card__names">Customer Success</p>
        </div>
        <div className="org-card__divider" />
        <div className="org-card__section">
          <div className="org-card__section-head">
            <h4 className="org-card__section-title">HRBP Peers</h4>
            <span className="org-card__badge">5</span>
          </div>
          <div className="org-card__avatar-row org-card__avatar-row--with-badge">
            <img src={rachelKimAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <img src={tomNguyenAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <img src={anaMartinezAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
            <div className="org-card__avatar org-card__avatar--initials" style={{ background: peerColors[0] }}>JM</div>
            <span className="org-card__badge org-card__badge--plus">+1</span>
          </div>
          <p className="org-card__names">Rachel, Tom, Ana, James and others</p>
        </div>
      </div>
    )
  }

  return (
    <div className="org-card">
      <div className="org-card__header">
        <h3 className="org-card__title">Organization</h3>
        <Button variant="default">View org chart</Button>
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
          <img src={mateoAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
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
          <img src={sachitAvatar} alt="" className="org-card__avatar org-card__avatar--photo" />
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
