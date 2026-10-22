import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { PageContainer } from '../components/layout/PageContainer'
import { QuestionCard } from '../components/practice/QuestionCard'
import type { QuestionCardState } from '../components/practice/QuestionCard'
import { Button, ButtonLink } from '../components/ui/Button'
import {
  createPracticeSessionState,
  endPracticeSession,
  recordPracticeResult,
} from '../features/practice/session'
import {
  clearActiveSession,
  loadActiveSession,
  loadSettings,
  saveActiveSession,
  saveCompletedSession,
} from '../services/storage'
import type {
  ActiveSessionSnapshot,
  PracticeSetupConfiguration,
} from '../types'

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
  configuration?: PracticeSetupConfiguration
  restoredSnapshot?: ActiveSessionSnapshot
}

function ActivePracticeSession({
  configuration,
  restoredSnapshot,
}: ActivePracticeSessionProps) {
  const navigate = useNavigate()
  const [settings] = useState(loadSettings)
  const [state, setState] = useState(() =>
    restoredSnapshot
      ? {
          session: restoredSnapshot.session,
          currentQuestion: restoredSnapshot.currentQuestion,
          isComplete: false,
        }
      : createPracticeSessionState(configuration!),
  )
  const [cardState, setCardState] = useState<QuestionCardState>(() => ({
    selectedAnswer: restoredSnapshot?.selectedAnswer ?? null,
    isRevealed: restoredSnapshot?.isRevealed ?? false,
  }))
  const { currentQuestion, isComplete, session } = state
  const isContinuous = session.sessionLength === 'continuous'
  const progressMaximum = isContinuous ? undefined : session.sessionLength
  const currentPosition = session.attemptedCount + 1
  const operationSummary = session.operations
    .map((operation) => operationLabels[operation])
    .join(', ')

  function recordResult(isCorrect: boolean, selectedAnswer: number) {
    setCardState({ selectedAnswer: null, isRevealed: false })
    setState((currentState) =>
      recordPracticeResult(currentState, selectedAnswer, isCorrect),
    )
  }

  useEffect(() => {
    if (isComplete) {
      saveCompletedSession(session)
      clearActiveSession()
      navigate('/practice/summary', {
        replace: true,
        state: { sessionId: session.id },
      })
      return
    }

    saveActiveSession({
      session,
      currentQuestion,
      selectedAnswer: cardState.selectedAnswer,
      isRevealed: cardState.isRevealed,
    })
  }, [cardState, currentQuestion, isComplete, navigate, session])

  if (isComplete) {
    return (
      <PageContainer className="session-transition" aria-live="polite">
        <p>Preparing your session summary…</p>
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
        animationsEnabled={settings.cardAnimationEnabled}
        initialIsRevealed={cardState.isRevealed}
        initialSelectedAnswer={cardState.selectedAnswer}
        key={currentQuestion.id}
        question={currentQuestion}
        showExplanation={settings.showExplanations}
        onResult={recordResult}
        onStateChange={setCardState}
      />
    </PageContainer>
  )
}

export function PracticeSessionPage() {
  const location = useLocation()
  const { configuration } = (location.state ??
    {}) as PracticeSessionLocationState
  const [restoredSnapshot] = useState(() =>
    configuration ? undefined : loadActiveSession(),
  )

  if (!configuration && !restoredSnapshot) {
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

  return (
    <ActivePracticeSession
      configuration={configuration}
      restoredSnapshot={restoredSnapshot}
    />
  )
}
