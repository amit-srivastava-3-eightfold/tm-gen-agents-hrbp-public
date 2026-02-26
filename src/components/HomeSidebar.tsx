import { useUser } from '../contexts/UserContext'
import { getHomePageData } from '../data/homePageData'
import { MyTasksCard } from './MyTasksCard'
import { OrganizationCard } from './OrganizationCard'
import { ActivityLinksCard } from './ActivityLinksCard'
import './MyTasksCard.css'
import './OrganizationCard.css'
import './ActivityLinksCard.css'

export function HomeSidebar() {
  const { currentUser } = useUser()
  const { taskCount } = getHomePageData(currentUser)

  return (
    <aside className="home-sidebar">
      <div className="home-sidebar__tab">
        <span className="home-sidebar__tab-label">My Job Tasks</span>
        <span className="home-sidebar__tab-badge">{taskCount}</span>
      </div>
      <div className="home-sidebar__cards">
        <MyTasksCard />
        <OrganizationCard />
        <ActivityLinksCard />
      </div>
    </aside>
  )
}
