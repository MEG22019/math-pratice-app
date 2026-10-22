import { describe, expect, it, vi } from 'vitest'

import type {
  DifficultyLevel,
  MathOperation,
  PracticeSetupConfiguration,
  Question,
} from '../../types'
import {
  createPracticeSessionState,
  endPracticeSession,
  recordPracticeResult,
} from './session'

function createQuestionFactory() {
  let questionNumber = 0

  return vi.fn(
    (
      requestedOperations: MathOperation | readonly MathOperation[],
      difficulty: DifficultyLevel,
    ): Question => {
      questionNumber += 1
      const operations = Array.isArray(requestedOperations)
        ? requestedOperations
        : [requestedOperations]
      const operation = operations[(questionNumber - 1) % operations.length]

      return {
        id: `question-${questionNumber}`,
        operation,
        firstOperand: 2,
        secondOperand: 2,
        displayText: '2 + 2',
        correctAnswer: 4,
        choices: [3, 4, 5, 6],
        difficulty,
        source: 'regular',
      }
    },
  )
}

const fixedConfiguration: PracticeSetupConfiguration = {
  operations: ['addition'],
  difficulty: 1,
  sessionLength: 5,
  mode: 'regular',
}

describe('practice session state', () => {
  it('creates a session and generates its first question', () => {
    const createQuestion = createQuestionFactory()
    const state = createPracticeSessionState(fixedConfiguration, {
      createQuestion,
      createSessionId: () => 'session-1',
      now: () => '2026-01-01T00:00:00.000Z',
    })

    expect(state.session).toMatchObject({
      id: 'session-1',
      attemptedCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      attempts: [],
    })
    expect(state.currentQuestion.id).toBe('question-1')
    expect(createQuestion).toHaveBeenCalledWith(['addition'], 1)
  })

  it('records attempts, preserves totals, and stops a fixed session', () => {
    const createQuestion = createQuestionFactory()
    const dependencies = {
      createQuestion,
      createSessionId: () => 'session-1',
      createAttemptId: () => 'attempt-id',
      now: () => '2026-01-01T00:00:00.000Z',
    }
    let state = createPracticeSessionState(fixedConfiguration, dependencies)

    for (let index = 0; index < 5; index += 1) {
      state = recordPracticeResult(state, 4, index < 3, dependencies)
    }

    expect(state.isComplete).toBe(true)
    expect(state.session.attemptedCount).toBe(5)
    expect(state.session.correctCount).toBe(3)
    expect(state.session.incorrectCount).toBe(2)
    expect(state.session.attempts).toHaveLength(5)
    expect(state.session.attempts[0]).toMatchObject({
      sessionId: 'session-1',
      questionId: 'question-1',
      selectedAnswer: 4,
      isCorrect: true,
      operation: 'addition',
      difficulty: 1,
      source: 'regular',
    })
    expect(state.session.completedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(createQuestion).toHaveBeenCalledTimes(5)

    const unchangedState = recordPracticeResult(state, 4, true, dependencies)
    expect(unchangedState).toBe(state)
  })

  it('continues indefinitely in continuous mode', () => {
    const createQuestion = createQuestionFactory()
    const configuration: PracticeSetupConfiguration = {
      ...fixedConfiguration,
      sessionLength: 'continuous',
    }
    const dependencies = { createQuestion }
    let state = createPracticeSessionState(configuration, dependencies)

    for (let index = 0; index < 25; index += 1) {
      state = recordPracticeResult(state, 4, true, dependencies)
    }

    expect(state.isComplete).toBe(false)
    expect(state.session.attemptedCount).toBe(25)
    expect(state.session.completedAt).toBeUndefined()
    expect(createQuestion).toHaveBeenCalledTimes(26)

    state = endPracticeSession(state, () => '2026-01-02T00:00:00.000Z')
    expect(state.isComplete).toBe(true)
    expect(state.session.completedAt).toBe('2026-01-02T00:00:00.000Z')
  })

  it('passes all selected operations to every mixed-session generation', () => {
    const createQuestion = createQuestionFactory()
    const configuration: PracticeSetupConfiguration = {
      ...fixedConfiguration,
      operations: ['addition', 'subtraction', 'multiplication', 'division'],
    }
    const dependencies = { createQuestion }
    let state = createPracticeSessionState(configuration, dependencies)

    state = recordPracticeResult(state, 4, true, dependencies)
    state = recordPracticeResult(state, 4, false, dependencies)

    expect(createQuestion).toHaveBeenCalledTimes(3)
    for (const call of createQuestion.mock.calls) {
      expect(call[0]).toEqual(configuration.operations)
    }
    expect(state.session.attempts.map((attempt) => attempt.operation)).toEqual([
      'addition',
      'subtraction',
    ])
  })

  it('ends review early when no active mistake questions remain', () => {
    const createQuestion = createQuestionFactory()
    const state = createPracticeSessionState(
      { ...fixedConfiguration, mode: 'mistake-review', sessionLength: 10 },
      { createQuestion },
    )
    const completed = recordPracticeResult(state, 4, true, {
      createQuestion,
      hasReviewQuestions: () => false,
      now: () => '2026-01-01T00:05:00.000Z',
    })

    expect(completed.isComplete).toBe(true)
    expect(completed.session.attemptedCount).toBe(1)
    expect(completed.session.completedAt).toBe('2026-01-01T00:05:00.000Z')
    expect(createQuestion).toHaveBeenCalledTimes(1)
  })
})
