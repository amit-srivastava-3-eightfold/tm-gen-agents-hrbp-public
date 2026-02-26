import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import './index.css'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { MyTeamPage } from './pages/MyTeamPage'
import { PeoplePage } from './pages/PeoplePage'
import { PositionPage } from './pages/PositionPage'
import { PeopleProfilePage } from './pages/PeopleProfilePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/people/:id" element={<PeopleProfilePage />} />
        <Route path="/my-team" element={<MyTeamPage />} />
        <Route path="/positions/:id" element={<PositionPage />} />
      </Routes>
    </BrowserRouter>
    </UserProvider>
  </StrictMode>,
)
