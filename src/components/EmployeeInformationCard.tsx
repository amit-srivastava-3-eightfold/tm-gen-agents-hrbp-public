export function EmployeeInformationCard() {
  return (
    <div className="emp-info-card">
      <h3 className="emp-info-card__title">Employee Information</h3>
      <div className="emp-info-card__rows">
        <div className="emp-info-card__row">
          <span className="emp-info-card__label">Employee ID</span>
          <span className="emp-info-card__value">972</span>
        </div>
        <div className="emp-info-card__row">
          <span className="emp-info-card__label">Business Unit</span>
          <span className="emp-info-card__value">Sales Engineering</span>
        </div>
        <div className="emp-info-card__row">
          <span className="emp-info-card__label">Hire Date</span>
          <span className="emp-info-card__value">2019-09-23</span>
        </div>
      </div>
    </div>
  )
}
