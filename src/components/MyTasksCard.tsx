import { Link } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { getHomePageData } from '../data/homePageData'
import './MyTasksCard.css'

export function MyTasksCard() {
  const { currentUser } = useUser()
  const { tasks } = getHomePageData(currentUser)
  const firstTask = tasks[0]

  return (
    <div className="my-tasks-card">
      <div className="my-tasks-card__header">
        <h3 className="my-tasks-card__title">My Tasks</h3>
        <span className="my-tasks-card__badge">{tasks.length}</span>
        <Link to="#" className="my-tasks-card__view-all">
          View all tasks
        </Link>
      </div>
      {firstTask && (
        <>
          <div className="my-tasks-card__task">
            <span className="material-symbols-outlined my-tasks-card__arrow">arrow_forward</span>
            <a href={firstTask.href} className="my-tasks-card__task-label">
              {firstTask.label}
            </a>
            <span className="my-tasks-card__task-meta">{firstTask.meta}</span>
          </div>
          <div className="my-tasks-card__tag">
            <span className="material-symbols-outlined my-tasks-card__tag-icon">{firstTask.tagIcon}</span>
            {firstTask.tag}
          </div>
        </>
      )}
    </div>
  )
}
