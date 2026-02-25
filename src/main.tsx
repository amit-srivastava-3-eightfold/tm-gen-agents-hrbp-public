import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import { ProfilePage } from './pages/ProfilePage'
import { MyTeamPage } from './pages/MyTeamPage'
import { PeoplePage } from './pages/PeoplePage'
import { PositionPage } from './pages/PositionPage'
import { PeopleProfilePage } from './pages/PeopleProfilePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/people/:id" element={<PeopleProfilePage />} />
        <Route path="/my-team" element={<MyTeamPage />} />
        <Route path="/positions/:id" element={<PositionPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
