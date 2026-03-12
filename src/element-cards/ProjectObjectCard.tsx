import type { ComponentType, ReactNode } from 'react'

export type ProjectObjectCardProject = {
  title: string
  owner?: string
  status?: string
  skills?: string[]
  contributedBy?: string[]
  projectManager?: { name: string; avatarSrc?: string }
}

type LinkLikeProps = { to: string; className?: string; children: ReactNode }

const DefaultLink: ComponentType<LinkLikeProps> = ({ to, className, children }) => (
  <a href={to} className={className}>{children}</a>
)

export type ProjectObjectCardProps = {
  project: ProjectObjectCardProject
  href?: string
  showBookmark?: boolean
  showBottomBar?: boolean
  LinkComponent?: ComponentType<LinkLikeProps>
}

/**
 * Local ProjectObjectCard so the app builds when the design system
 * does not export it (e.g. on Vercel). Uses same class names as DS for styling.
 */
export function ProjectObjectCard({
  project,
  href = '#',
  showBookmark = true,
  showBottomBar = true,
  LinkComponent = DefaultLink,
}: ProjectObjectCardProps) {
  const meta = [project.owner, project.status].filter(Boolean).join(' • ')
  const content = (
    <div className="project-object-card__inner">
      <div className="project-object-card__banner">
        <div className="project-object-card__tag-wrap">
          <span className="pill pill--blueGreen pill--small" data-icon="folder">Project</span>
        </div>
        <div className="project-object-card__banner-actions">
          <button type="button" className="project-object-card__icon-btn" aria-label="Add to workspace">
            <span className="material-symbols-outlined">add</span>
          </button>
          {showBookmark && (
            <button type="button" className="project-object-card__icon-btn" aria-label="Save project">
              <span className="material-symbols-outlined">bookmark</span>
            </button>
          )}
        </div>
      </div>
      <div className="project-object-card__body">
        <span className="project-object-card__title">{project.title}</span>
        {meta && <span className="project-object-card__meta">{meta}</span>}
        {project.skills && project.skills.length > 0 && (
          <div className="project-object-card__skills">
            {project.skills.slice(0, 2).map((s) => (
              <span key={s} className="project-object-card__skill-tag">{s}</span>
            ))}
            {project.skills.length > 2 && (
              <span className="project-object-card__skill-tag project-object-card__skill-tag--more">
                +{project.skills.length - 2}
              </span>
            )}
          </div>
        )}
        {project.projectManager && (
          <div className="project-object-card__manager">
            {project.projectManager.avatarSrc ? (
              <img src={project.projectManager.avatarSrc} alt="" className="project-object-card__manager-avatar" />
            ) : (
              <span className="project-object-card__manager-avatar project-object-card__manager-avatar--fallback" aria-hidden>
                {project.projectManager.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="project-object-card__manager-info">
              <span className="project-object-card__manager-name">{project.projectManager.name}</span>
              <span className="project-object-card__manager-label">Project manager</span>
            </div>
          </div>
        )}
      </div>
      {showBottomBar && (
        <>
          <div className="project-object-card__divider" aria-hidden />
          <div className="object-card-bottom-bar">
            <div className="object-card-bottom-bar__content">
              {project.contributedBy && project.contributedBy.length > 0 && (
                <>
                  <div className="project-object-card__facepile">
                    {project.contributedBy.map((url, i) => (
                      <img key={i} src={url} alt="" className="project-object-card__facepile-avatar" />
                    ))}
                  </div>
                  <span className="project-object-card__contributed-text">contributors</span>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )

  if (href === '#') {
    return <div className="project-object-card">{content}</div>
  }

  return (
    <LinkComponent to={href} className="project-object-card">
      {content}
    </LinkComponent>
  )
}
