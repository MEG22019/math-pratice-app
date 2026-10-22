import {
  Component,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { PageContainer } from '../components/layout/PageContainer'
import { QuestionCard } from '../components/practice/QuestionCard'
import type { QuestionCardState } from '../components/practice/QuestionCard'
import { Button, ButtonLink } from '../components/ui/Button'
import { ErrorPanel } from '../components/ui/ErrorPanel'
import {
  createPracticeSessionState,
  endPracticeSession,
  recordPracticeResult,
} from '../features/practice/session'
import {
  getActiveMistakePatterns,
  prioritizeMistakePatterns,
  recordQuestionOutcome,
} from '../features/mistakes/mistakes'
import {
  generateQuestion,
  generateSimilarQuestion,
} from '../features/questions'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { getEncouragingMessage, playResultSound } from '../services/feedback'
import {
  clearActiveSession,
  isPracticeSetupConfiguration,
  loadActiveSession,
  loadMistakePatterns,
  loadSettings,
  saveActiveSession,
  saveCompletedSession,
  saveMistakePatterns,
} from '../services/storage'
import type {
  ActiveSessionSnapshot,
  PracticeSetupConfiguration,
} from '../types'

interface PracticeSessionLocationState {
  configuration?: unknown
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

class PracticeSessionErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Practice session could not create a question.', {
        message: error.message,
        componentStack: errorInfo.componentStack,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <PageContainer className="placeholder-page">
          <ErrorPanel
            headingLevel={1}
            title="We could not make the next question"
            message="That question did not load correctly. Your saved progress is safe—choose your practice options and try again."
            actions={
              <>
                <ButtonLink to="/practice/setup">Try Practice Again</ButtonLink>
                <ButtonLink to="/" variant="secondary">
                  Return Home
                </ButtonLink>
              </>
            }
          />
        </PageContainer>
      )
    }

    return this.props.children
  }
}

function ActivePracticeSession({
  configuration,
  restoredSnapshot,
}: ActivePracticeSessionProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [settings] = useState(loadSettings)
  const sessionConfiguration = configuration ?? {
    operations: restoredSnapshot!.session.operations,
    difficulty: restoredSnapshot!.session.difficulty,
    sessionLength: restoredSnapshot!.session.sessionLength,
    mode: restoredSnapshot!.session.mode,
  }
  const createSessionQuestion = () => {
    if (sessionConfiguration.mode === 'regular') {
      return generateQuestion(
        sessionConfiguration.operations,
        sessionConfiguration.difficulty,
      )
    }

    const pattern = prioritizeMistakePatterns(loadMistakePatterns())[0]
    if (!pattern) {
      throw new Error('No active mistake patterns are available.')
    }
    return generateSimilarQuestion(pattern)
  }
  const sessionDependencies = {
    createQuestion: createSessionQuestion,
    hasReviewQuestions: () =>
      getActiveMistakePatterns(loadMistakePatterns()).length > 0,
  }
  const [state, setState] = useState(() =>
    restoredSnapshot
      ? {
          session: restoredSnapshot.session,
          currentQuestion: restoredSnapshot.currentQuestion,
          isComplete: false,
        }
      : createPracticeSessionState(sessionConfiguration, sessionDependencies),
  )
  const [cardState, setCardState] = useState<QuestionCardState>(() => ({
    selectedAnswer: restoredSnapshot?.selectedAnswer ?? null,
    isRevealed: restoredSnapshot?.isRevealed ?? false,
  }))
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [storageError, setStorageError] = useState('')
  const [pendingDestination, setPendingDestination] = useState<string | null>(
    null,
  )
  const { currentQuestion, isComplete, session } = state
  const isContinuous = session.sessionLength === 'continuous'
  const progressMaximum = isContinuous ? undefined : session.sessionLength
  const currentPosition = session.attemptedCount + 1
  const operationSummary = session.operations
    .map((operation) => operationLabels[operation])
    .join(', ')

  function recordResult(isCorrect: boolean, selectedAnswer: number) {
    if (settings.soundEffectsEnabled) {
      playResultSound(isCorrect)
    }
    setFeedbackMessage(
      settings.encouragingFeedbackEnabled
        ? getEncouragingMessage(isCorrect)
        : '',
    )
    const updatedPatterns = recordQuestionOutcome(
      loadMistakePatterns(),
      currentQuestion,
      isCorrect,
      settings.mistakeMasteryThreshold,
    )
    if (!saveMistakePatterns(updatedPatterns)) {
      setStorageError(
        'We could not save this result. You can keep practicing, but this progress may not return after a refresh.',
      )
    }
    setCardState({ selectedAnswer: null, isRevealed: false })
    setState((currentState) =>
      recordPracticeResult(
        currentState,
        selectedAnswer,
        isCorrect,
        sessionDependencies,
      ),
    )
  }

  useEffect(() => {
    if (isComplete) {
      const sessionSaved = saveCompletedSession(session)
      const snapshotCleared = clearActiveSession()
      navigate('/practice/summary', {
        replace: true,
        state: {
          session,
          sessionId: session.id,
          storageError: !sessionSaved || !snapshotCleared,
        },
      })
      return
    }

    const snapshotSaved = saveActiveSession({
      session,
      currentQuestion,
      selectedAnswer: cardState.selectedAnswer,
      isRevealed: cardState.isRevealed,
    })
    if (!snapshotSaved) {
      const showStorageError = window.setTimeout(() => {
        setStorageError(
          'We could not save this session. You can keep practicing, but it may not return after a refresh.',
        )
      }, 0)
      return () => window.clearTimeout(showStorageError)
    }
  }, [cardState, currentQuestion, isComplete, navigate, session])

  useEffect(() => {
    if (isComplete) {
      return
    }

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [isComplete])

  useEffect(() => {
    if (isComplete) {
      return
    }

    function guardApplicationNavigation(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return
      }

      const target = event.target
      const anchor =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>('a')
          : null
      const href = anchor?.getAttribute('href')
      if (
        !anchor ||
        !href ||
        href.startsWith('#') ||
        anchor.hasAttribute('download') ||
        anchor.target === '_blank'
      ) {
        return
      }

      const destination = new URL(href, window.location.href)
      if (
        destination.origin !== window.location.origin ||
        (destination.pathname === location.pathname &&
          destination.search === location.search)
      ) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      setPendingDestination(
        `${destination.pathname}${destination.search}${destination.hash}`,
      )
    }

    document.addEventListener('click', guardApplicationNavigation, true)
    return () =>
      document.removeEventListener('click', guardApplicationNavigation, true)
  }, [isComplete, location.pathname, location.search])

  function endSessionAndLeave() {
    if (!pendingDestination) {
      return
    }

    const completedSession = endPracticeSession(state).session
    if (!saveCompletedSession(completedSession)) {
      setStorageError(
        'We could not save your session, so we kept you on this page to protect your progress. Please try again.',
      )
      setPendingDestination(null)
      return
    }

    clearActiveSession()
    navigate(pendingDestination)
  }

  if (isComplete) {
    return (
      <PageContainer className="session-transition" aria-live="polite">
        <p>Preparing your session summary…</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="practice-session-page">
      {storageError && (
        <ErrorPanel
          compact
          title="Progress could not be saved"
          message={storageError}
          actions={
            <Button
              type="button"
              variant="quiet"
              onClick={() => setStorageError('')}
            >
              Dismiss
            </Button>
          }
        />
      )}
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
          <p aria-atomic="true" aria-live="polite">
            {session.attemptedCount} completed · Keep going!
          </p>
        ) : (
          <>
            <div className="session-progress__labels">
              <span>{session.attemptedCount} completed</span>
              <span>{session.sessionLength} total</span>
            </div>
            <progress
              aria-label="Session progress"
              aria-valuetext={`${session.attemptedCount} of ${session.sessionLength} questions completed`}
              max={progressMaximum}
              value={session.attemptedCount}
            />
          </>
        )}
      </div>

      <p className="sr-only" aria-atomic="true" aria-live="polite">
        Question {currentPosition}. {currentQuestion.displayText}. Choose from
        four answers.
      </p>

      <QuestionCard
        animationsEnabled={
          settings.cardAnimationEnabled && !prefersReducedMotion
        }
        initialIsRevealed={cardState.isRevealed}
        initialSelectedAnswer={cardState.selectedAnswer}
        key={currentQuestion.id}
        question={currentQuestion}
        showExplanation={settings.showExplanations}
        onResult={recordResult}
        onStateChange={setCardState}
      />
      {feedbackMessage && (
        <p className="session-feedback" role="status">
          {feedbackMessage}
        </p>
      )}
      {pendingDestination && (
        <div className="dialog-backdrop">
          <section
            className="leave-session-dialog"
            aria-labelledby="leave-session-title"
            aria-modal="true"
            role="alertdialog"
          >
            <span aria-hidden="true">✋</span>
            <h2 id="leave-session-title">Leave this practice session?</h2>
            <p>
              Your session is still in progress. You can keep practicing or end
              it safely before you leave.
            </p>
            <div>
              <Button
                autoFocus
                type="button"
                onClick={() => setPendingDestination(null)}
              >
                Keep Practicing
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={endSessionAndLeave}
              >
                End Session
              </Button>
            </div>
          </section>
        </div>
      )}
    </PageContainer>
  )
}

export function PracticeSessionPage() {
  const location = useLocation()
  const { configuration: configurationCandidate } = (location.state ??
    {}) as PracticeSessionLocationState
  const configuration = isPracticeSetupConfiguration(configurationCandidate)
    ? configurationCandidate
    : undefined
  const hasInvalidConfiguration =
    configurationCandidate !== undefined && !configuration
  const [restoredSnapshot] = useState(() =>
    configuration ? undefined : loadActiveSession(),
  )
  const reviewIsUnavailable =
    !restoredSnapshot &&
    configuration?.mode === 'mistake-review' &&
    getActiveMistakePatterns(loadMistakePatterns()).length === 0

  if (
    (!configuration && !restoredSnapshot) ||
    reviewIsUnavailable ||
    hasInvalidConfiguration
  ) {
    const title = reviewIsUnavailable
      ? 'No active mistakes to review'
      : hasInvalidConfiguration
        ? 'That practice setup is not valid'
        : 'No practice setup found'
    const message = reviewIsUnavailable
      ? 'Great work! Try regular practice to discover more skills to strengthen.'
      : hasInvalidConfiguration
        ? 'Something was missing from those practice choices. Pick your options again and we will get you started.'
        : 'Choose your practice options before starting a session.'

    return (
      <PageContainer className="placeholder-page">
        <ErrorPanel
          headingLevel={1}
          title={title}
          message={message}
          actions={
            <>
              <ButtonLink to="/practice/setup">Go to Practice Setup</ButtonLink>
              <ButtonLink to="/" variant="secondary">
                Return Home
              </ButtonLink>
            </>
          }
        />
      </PageContainer>
    )
  }

  return (
    <PracticeSessionErrorBoundary>
      <ActivePracticeSession
        configuration={configuration}
        restoredSnapshot={restoredSnapshot}
      />
    </PracticeSessionErrorBoundary>
  )
}
