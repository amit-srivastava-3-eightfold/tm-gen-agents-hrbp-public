import { useUser } from '../contexts/UserContext'
import './EmployeeInformationCard.css'

export function EmployeeInformationCard() {
  const { currentUser } = useUser()

  return (
    <div className="emp-info-card">
      <h3 className="emp-info-card__title">Employee Information</h3>
      <div className="emp-info-card__rows">
        {currentUser.employeeId && (
          <div className="emp-info-card__row">
            <span className="emp-info-card__label">Employee ID</span>
            <span className="emp-info-card__value">{currentUser.employeeId}</span>
          </div>
        )}
        {currentUser.businessUnit && (
          <div className="emp-info-card__row">
            <span className="emp-info-card__label">Business Unit</span>
            <span className="emp-info-card__value">{currentUser.businessUnit}</span>
          </div>
        )}
        {currentUser.hireDate && (
          <div className="emp-info-card__row">
            <span className="emp-info-card__label">Hire Date</span>
            <span className="emp-info-card__value">{currentUser.hireDate}</span>
          </div>
        )}
      </div>
    </div>
  )
}
