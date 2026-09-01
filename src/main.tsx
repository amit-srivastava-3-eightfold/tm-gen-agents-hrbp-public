import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DemoProvider } from './contexts/DemoContext'
import { UserProvider } from './contexts/UserContext'
import { ErrorBoundary } from './ErrorBoundary'
import './index.css'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { MyTeamPage } from './pages/MyTeamPage'
import { MyWorkPage } from './pages/MyWorkPage'
import { PeoplePage } from './pages/PeoplePage'
import { PositionPage } from './pages/PositionPage'
import { PeopleProfilePage } from './pages/PeopleProfilePage'
import { SkillTagPage } from './pages/SkillTagPage'
import { WorkforceReadinessPage } from './pages/WorkforceReadinessPage'
import { DevPlanTemplatesPage } from './pages/DevPlanTemplatesPage'
import { MyJobsPage } from './pages/MyJobsPage'
import { DevPlanTemplateDetailPage } from './pages/DevPlanTemplateDetailPage'
import { ManagerDetailPage } from './pages/ManagerDetailPage'
import WfrHeroOptionsPage from './pages/WfrHeroOptionsPage'
import DevPlansPage from './pages/DevPlansPage'
import WfrMetricCardsPage from './pages/WfrMetricCardsPage'
import WfrDialogsPage from './pages/WfrDialogsPage'
import WfrTaskSheetPage from './pages/WfrTaskSheetPage'
import ProfileSheetPage from './pages/ProfileSheetPage'
import UserCardPage from './pages/UserCardPage'
import { MyDevPlanPage } from './pages/MyDevPlanPage'
import { EmployeeCampaignsPage } from './pages/EmployeeCampaignsPage'
import { ComponentsLayout } from './pages/ComponentsLayout'
import { AIHomePage } from './pages/AIHomePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <DemoProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/people/:id" element={<PeopleProfilePage />} />
            <Route path="/my-team" element={<MyTeamPage />} />
            <Route path="/employee-campaigns" element={<EmployeeCampaignsPage />} />
            <Route path="/ai-home" element={<AIHomePage />} />
            <Route path="/my-work" element={<MyWorkPage />} />
            <Route path="/my-development-plans" element={<MyDevPlanPage />} />
            <Route path="/workforce" element={<WorkforceReadinessPage />} />
            <Route path="/workforce/manager/:managerId" element={<ManagerDetailPage />} />
            <Route path="/my-activity/jobs" element={<MyJobsPage />} />
            <Route path="/my-activity/dev-plan-templates" element={<DevPlanTemplatesPage />} />
            <Route path="/my-activity/dev-plan-templates/:templateId" element={<DevPlanTemplateDetailPage />} />
            <Route path="/positions/:id" element={<PositionPage />} />
            <Route path="/components" element={<ComponentsLayout />}>
              <Route path="skill-tag" element={<SkillTagPage />} />
              <Route path="wfr-hero-options" element={<WfrHeroOptionsPage />} />
              <Route path="dev-plans" element={<DevPlansPage />} />
              <Route path="wfr-metric-cards" element={<WfrMetricCardsPage />} />
              <Route path="wfr-dialogs" element={<WfrDialogsPage />} />
              <Route path="wfr-task-sheet" element={<WfrTaskSheetPage />} />
              <Route path="profile-sheet" element={<ProfileSheetPage />} />
              <Route path="user-card" element={<UserCardPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
      </DemoProvider>
    </ErrorBoundary>
  </StrictMode>,
)
