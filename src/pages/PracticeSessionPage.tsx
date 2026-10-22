import { useLocation } from 'react-router-dom'

import { PageContainer } from '../components/layout/PageContainer'
import { ButtonLink } from '../components/ui/Button'
import type { PracticeSetupConfiguration } from '../types'

interface PracticeSessionLocationState {
  configuration?: PracticeSetupConfiguration
}

const operationLabels = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
}

const difficultyLabels = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Intermediate',
  4: 'Advanced',
}

export function PracticeSessionPage() {
  const location = useLocation()
  const { configuration } = (location.state ??
    {}) as PracticeSessionLocationState

  if (!configuration) {
    return (
      <PageContainer className="placeholder-page">
        <section className="placeholder-card">
          <div className="placeholder-card__symbol" aria-hidden="true">
            🧭
          </div>
          <p className="eyebrow">Let’s get ready first</p>
          <h1>No practice setup found</h1>
          <p>Choose your practice options before starting a session.</p>
          <ButtonLink to="/practice/setup">Go to Practice Setup</ButtonLink>
        </section>
      </PageContainer>
    )
  }

  const lengthLabel =
    configuration.sessionLength === 'continuous'
      ? 'Continuous practice'
      : `${configuration.sessionLength} questions`

  return (
    <PageContainer className="session-ready-page">
      <section className="session-ready-card">
        <div className="session-ready-card__icon" aria-hidden="true">
          🚀
        </div>
        <p className="eyebrow">Setup complete</p>
        <h1>Your practice is ready!</h1>
        <p>
          Your choices made it safely to the practice session. Questions will be
          added in the next phase.
        </p>

        <dl className="configuration-summary">
          <div>
            <dt>Operations</dt>
            <dd>
              {configuration.operations
                .map((operation) => operationLabels[operation])
                .join(', ')}
            </dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{difficultyLabels[configuration.difficulty]}</dd>
          </div>
          <div>
            <dt>Session length</dt>
            <dd>{lengthLabel}</dd>
          </div>
        </dl>

        <ButtonLink to="/practice/setup" variant="secondary">
          ← Change Setup
        </ButtonLink>
      </section>
    </PageContainer>
  )
}
