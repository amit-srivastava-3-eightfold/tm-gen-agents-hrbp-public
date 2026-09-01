import { NavbarApp } from '../components/Navbar'
import { EmployeeAgentHomeAI } from '../components/employeeHome/EmployeeAgentHomeAI'
import { useUser } from '../contexts/UserContext'

export function AIHomePage() {
  const { currentUser } = useUser()
  const firstName = currentUser.name.split(' ')[0] ?? currentUser.name

  return (
    <div className="home-page home-page--agent">
      <NavbarApp />
      <EmployeeAgentHomeAI userName={firstName} />
    </div>
  )
}
