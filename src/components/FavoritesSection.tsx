import React, { useRef } from 'react'
import { useUser } from '../contexts/UserContext'
import { CourseElementCard, PeopleElementCard } from './element-cards'
import './FavoritesSection.css'

type FavoritePerson = {
  id: string
  name: string
  title: string
  email: string
  avatarSrc: string
  openTo: 'mentoring' | 'coffee' | 'project'
}

type FavoriteCourse = {
  title: string
  provider?: string
  duration?: string
  skills?: string[]
  completedBy?: string[]
}

const MATEO_FAVORITES_PEOPLE: FavoritePerson[] = [
  {
    id: 'o1',
    name: 'Jordan Kim',
    title: 'Solutions Engineer • Sales Engineering',
    email: 'jordan.kim@eightfold.ai',
    avatarSrc: 'https://i.pravatar.cc/144?u=o1-jordan',
    openTo: 'mentoring',
  },
  {
    id: 'o4',
    name: 'Alex Rivera',
    title: 'Solutions Architect • Sales Engineering',
    email: 'alex.rivera@eightfold.ai',
    avatarSrc: 'https://i.pravatar.cc/144?u=o4-alex',
    openTo: 'coffee',
  },
  {
    id: 'o6',
    name: 'Riley Foster',
    title: 'Senior Sales Engineer • Sales Engineering',
    email: 'riley.foster@eightfold.ai',
    avatarSrc: 'https://i.pravatar.cc/144?u=o6-riley',
    openTo: 'mentoring',
  },
]

const MATEO_FAVORITES_COURSE: FavoriteCourse = {
  title: 'Advanced Enterprise Demos',
  provider: 'Eightfold Academy',
  duration: '3h 15m',
  skills: ['Technical Sales', 'Product Demos', 'Enterprise'],
  completedBy: [
    'https://i.pravatar.cc/48?u=mateo-c1',
    'https://i.pravatar.cc/48?u=mateo-c2',
    'https://i.pravatar.cc/48?u=mateo-c3',
  ],
}

const LAURA_FAVORITES_PEOPLE: FavoritePerson[] = [
  {
    id: 'l2',
    name: 'Ethan Declerq',
    title: 'Director of Customer Success • Customer Success',
    email: 'ethan.declerq@eightfold.ai',
    avatarSrc: 'https://i.pravatar.cc/144?u=l2-ethan',
    openTo: 'coffee',
  },
  {
    id: 'l3',
    name: 'Anna Patel',
    title: 'Professional Services Lead • Professional Services',
    email: 'anna.patel@eightfold.ai',
    avatarSrc: 'https://i.pravatar.cc/144?u=l3-anna',
    openTo: 'mentoring',
  },
  {
    id: '1',
    name: 'Maya Baum',
    title: 'Technical Account Manager • Sales',
    email: 'maya.baum@eightfold.ai',
    avatarSrc: 'https://i.pravatar.cc/144?u=m1-maya',
    openTo: 'project',
  },
]

const LAURA_FAVORITES_COURSE: FavoriteCourse = {
  title: 'Talent Review Best Practices',
  provider: 'Eightfold Academy',
  duration: '2h',
  skills: ['Performance Management', 'Talent Planning', 'Feedback'],
  completedBy: [
    'https://i.pravatar.cc/48?u=laura-c1',
    'https://i.pravatar.cc/48?u=laura-c2',
  ],
}

export function FavoritesSection() {
  const { currentUser } = useUser()
  const isLaura = currentUser.id === 'laura-shah'
  const favoritesPeople = isLaura ? LAURA_FAVORITES_PEOPLE : MATEO_FAVORITES_PEOPLE
  const favoritesCourse = isLaura ? LAURA_FAVORITES_COURSE : MATEO_FAVORITES_COURSE
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }

  return (
    <section className="favorites-section">
      <h2 className="favorites-section__title">Favorites</h2>
      <div className="favorites-section__body">
        <button
          type="button"
          className="favorites-section__nav favorites-section__nav--prev"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="favorites-section__scroll" ref={scrollRef}>
          {favoritesPeople.map((person, i) => (
            <React.Fragment key={person.id}>
              <div className="favorites-section__card-wrap">
                <PeopleElementCard person={person} href={`/people/${person.id}`} showBookmark />
              </div>
              {i === 0 && (
                <div className="favorites-section__card-wrap">
                  <CourseElementCard course={favoritesCourse} href="#" showBookmark />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <button
          type="button"
          className="favorites-section__nav favorites-section__nav--next"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </section>
  )
}
