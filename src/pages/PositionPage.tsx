import { useParams, Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import '../components/Navbar.css'

export function PositionPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="position-page">
      <Navbar />
      <main style={{ padding: 24, paddingTop: 104, fontFamily: 'var(--font-family)' }}>
        <Link to="/my-team" style={{ color: '#146DA6', marginBottom: 16, display: 'inline-block' }}>
          ← Back to My Team
        </Link>
        <h1>Position {id}</h1>
        <p>Position details go here.</p>
      </main>
    </div>
  )
}
