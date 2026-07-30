import { NavbarApp } from '../components/Navbar'
import {
  ProductBackground,
  Header,
  HeaderToolbar,
  HeaderTextGroup,
  HeaderTitle,
} from '@tonyh-2-eightfold/ef-design-system'
import { EmployeeCampaignsTab } from '../components/myTeam/EmployeeCampaignsTab'
import '../components/myTeam/EmployeeCampaignsTab.css'
import './MyTeamPage.css'

export function EmployeeCampaignsPage() {
  return (
    <div className="my-team-page">
      <NavbarApp />

      <ProductBackground
        className="my-team-page__bg"
        variant="career-hub"
        hexagonsVariant="default"
      >
        <Header variant="career-hub" chSize="parent" overlayBackground>
          <HeaderToolbar>
            <HeaderTextGroup>
              <HeaderTitle>Employee Campaigns</HeaderTitle>
            </HeaderTextGroup>
          </HeaderToolbar>
        </Header>
      </ProductBackground>

      <main className="my-team-page__main">
        <div className="my-team-page__content">
          <EmployeeCampaignsTab />
        </div>
      </main>
    </div>
  )
}
