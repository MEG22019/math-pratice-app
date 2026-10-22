import { PageContainer } from '../components/layout/PageContainer'
import { ButtonLink } from '../components/ui/Button'

const operations = [
  { symbol: '+', label: 'Add', className: 'operation--blue' },
  { symbol: '−', label: 'Subtract', className: 'operation--coral' },
  { symbol: '×', label: 'Multiply', className: 'operation--purple' },
  { symbol: '÷', label: 'Divide', className: 'operation--green' },
]

export function HomePage() {
  return (
    <PageContainer className="home-page">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero__content">
          <p className="eyebrow">
            <span aria-hidden="true">✨</span> Your daily brain boost
          </p>
          <h1 id="home-title">
            Math feels better
            <span>with practice.</span>
          </h1>
          <p className="hero__intro">
            Pick a challenge, solve at your own pace, and watch your confidence
            grow with every answer.
          </p>

          <div className="hero__actions">
            <ButtonLink to="/practice/setup">
              Start Practice <span aria-hidden="true">→</span>
            </ButtonLink>
            <ButtonLink to="/statistics" variant="secondary">
              View Statistics
            </ButtonLink>
          </div>

          <p className="hero__note">
            <span aria-hidden="true">✓</span> No account needed
            <span aria-hidden="true">•</span> Learn at your pace
          </p>
        </div>

        <div className="hero__playground" aria-label="Four math operations">
          <div className="orbit orbit--one" aria-hidden="true" />
          <div className="orbit orbit--two" aria-hidden="true" />
          <div className="mascot-card">
            <span className="mascot-card__star" aria-hidden="true">
              ★
            </span>
            <strong>You’ve got this!</strong>
            <span>Every problem makes your brain stronger.</span>
          </div>
          <div className="operation-grid">
            {operations.map((operation) => (
              <div
                className={`operation ${operation.className}`}
                key={operation.label}
              >
                <strong aria-hidden="true">{operation.symbol}</strong>
                <span>{operation.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="quick-links" aria-labelledby="quick-links-title">
        <div>
          <p className="eyebrow">Your learning space</p>
          <h2 id="quick-links-title">Where would you like to go?</h2>
        </div>
        <div className="quick-links__grid">
          <article className="quick-card quick-card--practice">
            <span className="quick-card__icon" aria-hidden="true">
              🚀
            </span>
            <div>
              <h3>Ready, set, practice!</h3>
              <p>Choose the kind of math you want to work on today.</p>
              <ButtonLink to="/practice/setup" variant="quiet">
                Start Practice <span aria-hidden="true">→</span>
              </ButtonLink>
            </div>
          </article>

          <article className="quick-card quick-card--stats">
            <span className="quick-card__icon" aria-hidden="true">
              📊
            </span>
            <div>
              <h3>See how you’re growing</h3>
              <p>Visit your statistics to celebrate what you’ve learned.</p>
              <ButtonLink to="/statistics" variant="quiet">
                View Statistics <span aria-hidden="true">→</span>
              </ButtonLink>
            </div>
          </article>

          <article className="quick-card quick-card--settings">
            <span className="quick-card__icon" aria-hidden="true">
              🎨
            </span>
            <div>
              <h3>Make practice yours</h3>
              <p>Choose the sounds, motion, and defaults you like best.</p>
              <ButtonLink to="/settings" variant="quiet">
                Open Settings <span aria-hidden="true">→</span>
              </ButtonLink>
            </div>
          </article>
        </div>
      </section>
    </PageContainer>
  )
}
