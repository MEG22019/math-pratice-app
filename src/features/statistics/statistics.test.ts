import { describe, expect, it } from 'vitest'

import type { PracticeAttempt } from '../../types'
import { calculateAccuracy, calculateStatistics } from './statistics'

function attempt(
  overrides: Partial<PracticeAttempt> & Pick<PracticeAttempt, 'id'>,
): PracticeAttempt {
  return {
    questionId: `question-${overrides.id}`,
    sessionId: 'session-1',
    operation: 'addition',
    firstOperand: 2,
    secondOperand: 3,
    correctAnswer: 5,
    selectedAnswer: 5,
    isCorrect: true,
    difficulty: 1,
    source: 'regular',
    timestamp: '2026-10-21T12:00:00.000Z',
    ...overrides,
    id: overrides.id,
  }
}

describe('statistics calculations', () => {
  it('handles an empty history safely and includes every category', () => {
    const statistics = calculateStatistics([])

    expect(statistics).toMatchObject({ attempted: 0, correct: 0, incorrect: 0 })
    expect(calculateAccuracy(statistics)).toBe(0)
    expect(Object.keys(statistics.byOperation)).toHaveLength(4)
    expect(Object.keys(statistics.byDifficulty)).toHaveLength(4)
  })

  it('calculates overall, operation, and difficulty totals', () => {
    const statistics = calculateStatistics([
      attempt({ id: '1' }),
      attempt({
        id: '2',
        operation: 'division',
        difficulty: 4,
        isCorrect: false,
        selectedAnswer: 4,
      }),
      attempt({ id: '3', operation: 'division', difficulty: 4 }),
    ])

    expect(statistics).toMatchObject({ attempted: 3, correct: 2, incorrect: 1 })
    expect(calculateAccuracy(statistics)).toBe(67)
    expect(statistics.byOperation.division).toEqual({
      attempted: 2,
      correct: 1,
      incorrect: 1,
    })
    expect(statistics.byDifficulty[4]).toEqual({
      attempted: 2,
      correct: 1,
      incorrect: 1,
    })
    expect(statistics.byOperation.multiplication.attempted).toBe(0)
  })
})
