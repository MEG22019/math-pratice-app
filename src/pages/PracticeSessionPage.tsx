import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import { PageContainer } from '../components/layout/PageContainer'
import { QuestionCard } from '../components/practice/QuestionCard'
import { Button, ButtonLink } from '../components/ui/Button'
import {
  createPracticeSessionState,
  endPracticeSession,
  recordPracticeResult,
} from '../features/practice/session'
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

interface ActivePracticeSessionProps {
  configuration: PracticeSetupConfiguration
}

function ActivePracticeSession({ configuration }: ActivePracticeSessionProps) {
  const [state, setState] = useState(() =>
    createPracticeSessionState(configuration),
  )
  const { currentQuestion, isComplete, session } = state
  const isContinuous = session.sessionLength === 'continuous'
  const progressMaximum = isContinuous ? undefined : session.sessionLength
  const currentPosition = session.attemptedCount + 1
  const operationSummary = session.operations
    .map((operation) => operationLabels[operation])
    .join(', ')

  function recordResult(isCorrect: boolean, selectedAnswer: number) {
    setState((currentState) =>
      recordPracticeResult(currentState, selectedAnswer, isCorrect),
    )
  }

  if (isComplete) {
    const accuracy =
      session.attemptedCount === 0
        ? 0
        : Math.round((session.correctCount / session.attemptedCount) * 100)
    const questionLabel =
      session.attemptedCount === 1 ? 'question' : 'questions'
    const completionMessage = isContinuous
      ? `You ended after ${session.attemptedCount} ${questionLabel}.`
      : `You finished all ${session.attemptedCount} ${questionLabel}.`

    return (
      <PageContainer className="session-complete-page">
        <section className="session-complete-card" aria-live="polite">
          <div className="session-complete-card__icon" aria-hidden="true">
            🎉
          </div>
          <p className="eyebrow">Practice complete</p>
          <h1>Great work!</h1>
          <p>{completionMessage}</p>
          <dl className="session-results">
            <div>
              <dt>Right</dt>
              <dd>{session.correctCount}</dd>
            </div>
            <div>
              <dt>Wrong</dt>
              <dd>{session.incorrectCount}</dd>
            </div>
            <div>
              <dt>Accuracy</dt>
              <dd>{accuracy}%</dd>
            </div>
          </dl>
          <ButtonLink to="/practice/setup">Choose New Practice</ButtonLink>
        </section>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="practice-session-page">
      <header className="session-header">
        <div>
          <p className="eyebrow">Practice Session</p>
          <h1>
            {isContinuous
              ? `Question ${currentPosition}`
              : `Question ${currentPosition} of ${session.sessionLength}`}
          </h1>
          <p className="session-header__details">
            {operationSummary} · {difficultyLabels[session.difficulty]}
            {isContinuous ? ' · Continuous practice' : ''}
          </p>
        </div>

        <div className="session-header__actions">
          <dl className="session-score" aria-label="Session score">
            <div>
              <dt>Right</dt>
              <dd>{session.correctCount}</dd>
            </div>
            <div>
              <dt>Wrong</dt>
              <dd>{session.incorrectCount}</dd>
            </div>
          </dl>
          {isContinuous && (
            <Button
              type="button"
              variant="quiet"
              onClick={() => setState((current) => endPracticeSession(current))}
            >
              End Session
            </Button>
          )}
        </div>
      </header>

      <div className="session-progress">
        {isContinuous ? (
          <p>{session.attemptedCount} completed · Keep going!</p>
        ) : (
          <>
            <div className="session-progress__labels">
              <span>{session.attemptedCount} completed</span>
              <span>{session.sessionLength} total</span>
            </div>
            <progress
              aria-label="Session progress"
              max={progressMaximum}
              value={session.attemptedCount}
            />
          </>
        )}
      </div>

      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        onResult={recordResult}
      />
    </PageContainer>
  )
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

  return <ActivePracticeSession configuration={configuration} />
}
