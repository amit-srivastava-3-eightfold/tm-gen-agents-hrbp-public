import { Button, InsightCard } from '@tonyh-2-eightfold/ef-design-system'
import './MentorshipTab.css'

export function MentorshipTab() {
  return (
    <div className="mentorship-tab">
      {/* Left column */}
      <div className="mentorship-tab__main">

        {/* Get started card */}
        <div className="mentorship-tab__card mentorship-tab__card--onboard">
          <div className="mentorship-tab__onboard-content">
            <h3 className="mentorship-tab__onboard-title">Get started as a mentor</h3>
            <p className="mentorship-tab__onboard-desc">
              To help potential mentees find you and request mentorship, complete your mentor profile.
            </p>
            <div className="mentorship-tab__steps">
              <div className="mentorship-tab__step">
                <div className="mentorship-tab__step-dot" />
                <span className="mentorship-tab__step-label">Add mentor "about me"</span>
                <Button
                  size="sm"
                  style={{ background: '#2DB3C7', color: '#fff', border: 'none', marginLeft: 'auto' }}
                >
                  Start
                </Button>
              </div>
              <div className="mentorship-tab__step">
                <div className="mentorship-tab__step-dot" />
                <span className="mentorship-tab__step-label">Select mentorship topics</span>
                <Button variant="link" size="sm" style={{ marginLeft: 'auto', fontWeight: 600 }}>
                  Select topics
                </Button>
              </div>
            </div>
          </div>
          {/* Illustration */}
          <div className="mentorship-tab__illustration" aria-hidden>
            <div className="mentorship-tab__illustration-blob" />
            <div className="mentorship-tab__illustration-card">
              <div className="mentorship-tab__illustration-avatar" />
              <div className="mentorship-tab__illustration-lines">
                <div className="mentorship-tab__illustration-line mentorship-tab__illustration-line--long" />
                <div className="mentorship-tab__illustration-line mentorship-tab__illustration-line--med" />
                <div className="mentorship-tab__illustration-line mentorship-tab__illustration-line--long" />
                <div className="mentorship-tab__illustration-line mentorship-tab__illustration-line--short" />
                <div className="mentorship-tab__illustration-line mentorship-tab__illustration-line--med" />
                <div className="mentorship-tab__illustration-line mentorship-tab__illustration-line--accent" />
              </div>
            </div>
          </div>
        </div>

        {/* About you as a mentor */}
        <div className="mentorship-tab__card">
          <div className="mentorship-tab__about-row">
            <div>
              <h3 className="mentorship-tab__section-title">About you as a mentor</h3>
              <span className="mentorship-tab__visibility">
                <span className="material-symbols-outlined mentorship-tab__visibility-icon">visibility</span>
                Visible to everyone
              </span>
            </div>
            <button type="button" className="mentorship-tab__icon-btn" aria-label="Edit about">
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
          <div className="mentorship-tab__divider" />
          <div className="mentorship-tab__about-row">
            <h3 className="mentorship-tab__section-title">Topics you are open to mentoring</h3>
            <button type="button" className="mentorship-tab__icon-btn" aria-label="Edit topics">
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
          <p className="mentorship-tab__empty-text">You have no topics set</p>
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="mentorship-tab__sidebar">

        {/* Mentorships card */}
        <InsightCard
          title="Mentorships"
          icon="supervisor_account"
          bgColor="#FFF0D6"
          iconBgColor="#FFE8C2"
          iconColor="#7D4F07"
          textColor="#3B2600"
          buttonLabel="Find a mentor"
          fixedSize={false}
        >
          <div className="mentorship-tab__mentorship-section">
            <button type="button" className="mentorship-tab__mentorship-link">
              Mentees <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
            </button>
            <p className="mentorship-tab__mentorship-empty">No mentees or pending requests</p>
          </div>
          <div className="mentorship-tab__divider mentorship-tab__divider--amber" />
          <div className="mentorship-tab__mentorship-section">
            <button type="button" className="mentorship-tab__mentorship-link">
              Mentors <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
            </button>
            <p className="mentorship-tab__mentorship-empty">No current mentors</p>
          </div>
        </InsightCard>

        {/* Mentorship preferences card */}
        <div className="mentorship-tab__sidebar-card mentorship-tab__sidebar-card--grey">
          <h3 className="mentorship-tab__sidebar-title mentorship-tab__sidebar-title--dark">Mentorship preferences</h3>
          <p className="mentorship-tab__pref-desc">Personalize your mentorship experience.</p>
          <div className="mentorship-tab__divider" />
          <div className="mentorship-tab__pref-row">
            <span className="mentorship-tab__pref-label">
              Max mentees
              <span className="material-symbols-outlined mentorship-tab__pref-info">info</span>
            </span>
            <input
              type="number"
              defaultValue={5}
              min={0}
              max={20}
              className="mentorship-tab__pref-input"
              aria-label="Max mentees"
            />
          </div>
        </div>

      </aside>
    </div>
  )
}
