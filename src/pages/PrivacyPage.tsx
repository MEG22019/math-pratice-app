import { PageContainer } from '../components/layout/PageContainer'
import { ButtonLink } from '../components/ui/Button'

export function PrivacyPage() {
  return (
    <PageContainer className="privacy-page">
      <header className="page-heading">
        <p className="eyebrow">Simple and private</p>
        <h1>Your privacy matters</h1>
        <p>
          Math Practice is designed for learning without accounts, ads, or
          tracking.
        </p>
      </header>

      <div className="privacy-grid">
        <section className="privacy-card" aria-labelledby="privacy-data-title">
          <span aria-hidden="true">🏠</span>
          <div>
            <h2 id="privacy-data-title">Your progress stays here</h2>
            <p>
              Practice answers, statistics, settings, and active sessions are
              saved only in this browser using local storage. No personal
              information or account is required.
            </p>
          </div>
        </section>

        <section
          className="privacy-card"
          aria-labelledby="privacy-tracking-title"
        >
          <span aria-hidden="true">🛡️</span>
          <div>
            <h2 id="privacy-tracking-title">No ads or tracking</h2>
            <p>
              The app has no third-party analytics or behavioral tracking, and
              the child-facing experience contains no advertisements.
            </p>
          </div>
        </section>

        <section
          className="privacy-card"
          aria-labelledby="privacy-control-title"
        >
          <span aria-hidden="true">🧹</span>
          <div>
            <h2 id="privacy-control-title">You control saved data</h2>
            <p>
              Clearing this browser’s site data removes saved progress. You can
              also remove all Math Practice data at any time from Settings.
            </p>
            <ButtonLink to="/settings" variant="quiet">
              Open Settings <span aria-hidden="true">→</span>
            </ButtonLink>
          </div>
        </section>
      </div>
    </PageContainer>
  )
}
