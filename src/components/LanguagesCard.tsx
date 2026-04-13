import './LanguagesCard.css'
import { useUser } from '../contexts/UserContext'

interface Language {
  name: string
  proficiency: string
}

const LANGUAGES_BY_USER: Record<string, Language[]> = {
  csm: [
    { name: 'English', proficiency: 'Native or bilingual proficiency' },
    { name: 'Spanish', proficiency: 'Professional working proficiency' },
  ],
}

interface LanguagesCardProps {
  personId?: string
}

export function LanguagesCard({ personId }: LanguagesCardProps) {
  const { currentUser } = useUser()
  const id = personId ?? currentUser.id
  const languages = LANGUAGES_BY_USER[id] ?? []
  const showEditButton = !personId

  return (
    <div className="languages-card">
      <div className="languages-card__header">
        <div className="languages-card__header-left">
          <h3 className="languages-card__title">Languages</h3>
          <span className="languages-card__badge">{languages.length}</span>
        </div>
        {showEditButton && (
          <button type="button" className="languages-card__edit-btn" aria-label="Edit languages">
            <span className="material-symbols-outlined">edit</span>
          </button>
        )}
      </div>
      {languages.length > 0 && (
        <ul className="languages-card__list">
          {languages.map((lang) => (
            <li key={lang.name} className="languages-card__item">
              <span className="languages-card__name">{lang.name}</span>
              <span className="languages-card__proficiency">{lang.proficiency}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
