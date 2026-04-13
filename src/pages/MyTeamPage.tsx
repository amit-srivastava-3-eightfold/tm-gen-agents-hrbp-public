import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { useUser } from '../contexts/UserContext'
import { NavbarApp } from '../components/Navbar'
import {
  Button,
  ProductBackground,
  Header,
  HeaderToolbar,
  HeaderTextGroup,
  HeaderTitle,
} from '@tonyh-2-eightfold/ef-design-system'
import { PersonBanner } from '../components/PersonBanner'
import { SkillAnalysisSection } from '../components/SkillAnalysisSection'
import '../components/PersonBanner.css'
import '../components/SkillAnalysisSection.css'
import './MyTeamPage.css'

export function MyTeamPage() {
  const { currentUser } = useUser()
  const [reportScope, setReportScope] = useState<'direct' | 'all'>('direct')
  const [sustainedHighPerformersFilter, setSustainedHighPerformersFilter] = useState(false)
  const isHrbp = currentUser.id === 'jaydon-torff'
  const isEmployee = currentUser.id === 'csm'

  return (
    <div className="my-team-page">
      <NavbarApp />

      <ProductBackground
        className="my-team-page__bg"
        variant="career-hub"
        {...(isEmployee ? { wavesVariant: 'default' as const } : isHrbp ? { hexagonsVariant: 'default' as const } : { chevronsVariant: 'default' as const })}
      >
        <Header variant="career-hub" chSize="parent" overlayBackground>
          <HeaderToolbar>
            <HeaderTextGroup>
              <HeaderTitle>My Team</HeaderTitle>
            </HeaderTextGroup>
          </HeaderToolbar>
        </Header>
      </ProductBackground>

      <main className="my-team-page__main">
        <div className="my-team-page__content">
          <Tabs.Root defaultValue="reports" className="my-team-page__tabs">
            <Tabs.List className="my-team-page__tabs-list">
              <Tabs.Trigger value="reports" className="my-team-page__tab">
                {isHrbp ? 'My client groups' : 'My reports'}
              </Tabs.Trigger>
              <Tabs.Trigger value="succession" className="my-team-page__tab">
                Succession planning
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="reports" className="my-team-page__tabs-content">
              <div className="my-team-page__banner-wrap">
                <PersonBanner />
              </div>
              <div className="my-team-page__skill-card">
                <SkillAnalysisSection
                  reportScope={reportScope}
                  onReportScopeChange={setReportScope}
                  sustainedHighPerformersFilter={sustainedHighPerformersFilter}
                  onSustainedHighPerformersClick={() => setSustainedHighPerformersFilter((v) => !v)}
                />
              </div>
            </Tabs.Content>
            <Tabs.Content value="succession" className="my-team-page__tabs-content">
              <div className="my-team-page__page-header grid grid-cols-12 gap-6">
                <div className="my-team-page__header-actions col-span-12 flex justify-end">
                  <Button variant="default">
                    <span className="material-symbols-outlined">account_tree</span>
                    View org chart
                  </Button>
                </div>
              </div>
              <div className="my-team-page__grid grid grid-cols-12 gap-6">
                <p className="my-team-page__placeholder col-span-12">Succession planning content goes here.</p>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
        <footer className="my-team-page__footer">
          <span>Powered by</span>
          <span>#WhatsNextForYou</span>
        </footer>
      </main>
    </div>
  )
}
