import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { PageContainer } from '../components/layout/PageContainer'
import { Button, ButtonLink } from '../components/ui/Button'
import { ErrorPanel } from '../components/ui/ErrorPanel'
import {
  createMistakeReviewConfiguration,
  getActiveMistakePatterns,
} from '../features/mistakes/mistakes'
import {
  loadLastSummarySessionId,
  loadMistakePatterns,
  loadSession,
  loadSettings,
  isPracticeSession,
} from '../services/storage'
import type { PracticeSession, PracticeSetupConfiguration } from '../types'

interface SummaryLocationState {
  session?: PracticeSession
  sessionId?: string
  storageError?: boolean
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

export function SessionSummaryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const summaryState = (location.state ?? {}) as SummaryLocationState
  const [session] = useState(() => {
    const { session: stateSession, sessionId } = summaryState
    if (isPracticeSession(stateSession) && stateSession.completedAt) {
      return stateSession
    }
    const resolvedSessionId = sessionId ?? loadLastSummarySessionId()
    return resolvedSessionId ? loadSession(resolvedSessionId) : undefined
  })
  const [reviewConfiguration] = useState(() =>
    createMistakeReviewConfiguration(
      getActiveMistakePatterns(loadMistakePatterns()),
      loadSettings(),
    ),
  )

  if (!session) {
    return (
      <PageContainer className="placeholder-page">
        <ErrorPanel
          headingLevel={1}
          title="Session summary unavailable"
          message="We could not find those session results. Start a new practice session or return home—you did not do anything wrong."
          actions={
            <>
              <ButtonLink to="/practice/setup">Start Practice</ButtonLink>
              <ButtonLink to="/" variant="secondary">
                Return Home
              </ButtonLink>
            </>
          }
        />
      </PageContainer>
    )
  }

  const accuracy =
    session.attemptedCount === 0
      ? 0
      : Math.round((session.correctCount / session.attemptedCount) * 100)
  const reviewQuestionCount = session.attempts.filter(
    (attempt) => attempt.source === 'mistake-review',
  ).length
  const sessionLength =
    session.sessionLength === 'continuous'
      ? 'Continuous'
      : `${session.sessionLength} questions`

  function practiceAgain() {
    if (session!.mode === 'mistake-review') {
      if (reviewConfiguration) {
        navigate('/practice/session', {
          state: { configuration: reviewConfiguration },
        })
      } else {
        navigate('/practice/setup')
      }
      return
    }

    const configuration: PracticeSetupConfiguration = {
      operations: [...session!.operations],
      difficulty: session!.difficulty,
      sessionLength: session!.sessionLength,
      mode: session!.mode,
    }

    navigate('/practice/session', { state: { configuration } })
  }

  function practiceMistakes() {
    if (reviewConfiguration) {
      navigate('/practice/session', {
        state: { configuration: reviewConfiguration },
      })
    }
  }

  return (
    <PageContainer className="session-summary-page">
      {summaryState.storageError && (
        <ErrorPanel
          compact
          title="This result could not be saved"
          message="Your summary is ready, but browser storage was unavailable. These results may disappear when you leave or refresh this page."
        />
      )}
      <section className="session-summary-card" aria-labelledby="summary-title">
        <div className="session-complete-card__icon" aria-hidden="true">
          🏆
        </div>
        <p className="eyebrow">Practice complete</p>
        <h1 id="summary-title">Session Summary</h1>
        <p className="session-summary-card__message">
          Great effort! Every question helps your math skills grow.
        </p>

        <dl className="session-results">
          <div>
            <dt>Attempted</dt>
            <dd>{session.attemptedCount}</dd>
          </div>
          <div>
            <dt>Correct</dt>
            <dd>{session.correctCount}</dd>
          </div>
          <div>
            <dt>Incorrect</dt>
            <dd>{session.incorrectCount}</dd>
          </div>
          <div>
            <dt>Accuracy</dt>
            <dd>{accuracy}%</dd>
          </div>
        </dl>

        <dl className="summary-details">
          <div>
            <dt>Practice mode</dt>
            <dd>
              {session.mode === 'regular'
                ? 'Regular practice'
                : 'Mistake review'}
            </dd>
          </div>
          <div>
            <dt>Operations</dt>
            <dd>
              {session.operations
                .map((operation) => operationLabels[operation])
                .join(', ')}
            </dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{difficultyLabels[session.difficulty]}</dd>
          </div>
          <div>
            <dt>Session length</dt>
            <dd>{sessionLength}</dd>
          </div>
          {reviewQuestionCount > 0 && (
            <div>
              <dt>Mistake-review questions</dt>
              <dd>{reviewQuestionCount}</dd>
            </div>
          )}
        </dl>

        <div className="summary-actions">
          <Button type="button" onClick={practiceAgain}>
            Practice Again
          </Button>
          <div className="summary-actions__grid">
            <Button
              disabled={!reviewConfiguration}
              type="button"
              variant="secondary"
              onClick={practiceMistakes}
            >
              Practice Mistakes
            </Button>
            <ButtonLink to="/practice/setup" variant="secondary">
              Change Settings
            </ButtonLink>
            <ButtonLink to="/statistics" variant="secondary">
              View Statistics
            </ButtonLink>
            <ButtonLink to="/" variant="secondary">
              Return Home
            </ButtonLink>
          </div>
          <p>
            {reviewConfiguration
              ? 'Practice Mistakes is ready with your saved skills.'
              : 'Practice Mistakes unlocks when mistake patterns are available.'}
          </p>
        </div>
      </section>
    </PageContainer>
  )
}
