import { generateQuestion } from '../questions'
import type {
  PracticeAttempt,
  PracticeSession,
  PracticeSetupConfiguration,
  Question,
} from '../../types'
import { createId } from '../../utils/id'

export interface PracticeSessionState {
  currentQuestion: Question
  isComplete: boolean
  session: PracticeSession
}

interface SessionDependencies {
  createAttemptId?: () => string
  createQuestion?: typeof generateQuestion
  createSessionId?: () => string
  now?: () => string
}

function isFixedSessionComplete(session: PracticeSession): boolean {
  return (
    session.sessionLength !== 'continuous' &&
    session.attemptedCount >= session.sessionLength
  )
}

export function createPracticeSessionState(
  configuration: PracticeSetupConfiguration,
  dependencies: SessionDependencies = {},
): PracticeSessionState {
  const now = dependencies.now ?? (() => new Date().toISOString())
  const createQuestion = dependencies.createQuestion ?? generateQuestion
  const session: PracticeSession = {
    id: dependencies.createSessionId?.() ?? createId('session'),
    startedAt: now(),
    operations: [...configuration.operations],
    difficulty: configuration.difficulty,
    sessionLength: configuration.sessionLength,
    mode: configuration.mode,
    attemptedCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    attempts: [],
  }

  return {
    session,
    currentQuestion: createQuestion(
      configuration.operations,
      configuration.difficulty,
    ),
    isComplete: false,
  }
}

export function recordPracticeResult(
  state: PracticeSessionState,
  selectedAnswer: number,
  isCorrect: boolean,
  dependencies: SessionDependencies = {},
): PracticeSessionState {
  if (state.isComplete) {
    return state
  }

  const now = dependencies.now ?? (() => new Date().toISOString())
  const createQuestion = dependencies.createQuestion ?? generateQuestion
  const { currentQuestion, session } = state
  const attempt: PracticeAttempt = {
    id: dependencies.createAttemptId?.() ?? createId('attempt'),
    questionId: currentQuestion.id,
    sessionId: session.id,
    operation: currentQuestion.operation,
    firstOperand: currentQuestion.firstOperand,
    secondOperand: currentQuestion.secondOperand,
    correctAnswer: currentQuestion.correctAnswer,
    selectedAnswer,
    isCorrect,
    difficulty: currentQuestion.difficulty,
    source: currentQuestion.source,
    timestamp: now(),
  }

  if (currentQuestion.mistakePatternId) {
    attempt.mistakePatternId = currentQuestion.mistakePatternId
  }

  const updatedSession: PracticeSession = {
    ...session,
    attemptedCount: session.attemptedCount + 1,
    correctCount: session.correctCount + (isCorrect ? 1 : 0),
    incorrectCount: session.incorrectCount + (isCorrect ? 0 : 1),
    attempts: [...session.attempts, attempt],
  }
  const isComplete = isFixedSessionComplete(updatedSession)

  if (isComplete) {
    updatedSession.completedAt = now()
  }

  return {
    session: updatedSession,
    currentQuestion: isComplete
      ? currentQuestion
      : createQuestion(updatedSession.operations, updatedSession.difficulty),
    isComplete,
  }
}

export function endPracticeSession(
  state: PracticeSessionState,
  now: () => string = () => new Date().toISOString(),
): PracticeSessionState {
  if (state.isComplete) {
    return state
  }

  return {
    ...state,
    isComplete: true,
    session: {
      ...state.session,
      completedAt: now(),
    },
  }
}
