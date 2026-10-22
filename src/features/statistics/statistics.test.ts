import { describe, expect, it } from 'vitest'

import type { MistakePattern, PracticeAttempt } from '../../types'
import {
  archiveAttempts,
  calculateAccuracy,
  calculateStatistics,
  createEmptyStatisticsArchive,
} from './statistics'

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

  it('calculates active, mastered, and review statistics', () => {
    const patterns: MistakePattern[] = [
      {
        id: 'active',
        operation: 'addition',
        firstOperand: 2,
        secondOperand: 3,
        correctAnswer: 5,
        difficulty: 1,
        incorrectCount: 2,
        similarCorrectCount: 1,
        lastIncorrectAt: '2026-01-01T00:00:00.000Z',
        isMastered: false,
      },
      {
        id: 'mastered',
        operation: 'division',
        firstOperand: 8,
        secondOperand: 2,
        correctAnswer: 4,
        difficulty: 2,
        incorrectCount: 1,
        similarCorrectCount: 3,
        lastIncorrectAt: '2026-01-02T00:00:00.000Z',
        isMastered: true,
      },
    ]
    const statistics = calculateStatistics(
      [
        attempt({ id: '1', source: 'mistake-review' }),
        attempt({ id: '2', source: 'mistake-review', isCorrect: false }),
      ],
      patterns,
    )

    expect(statistics.mistakes).toEqual({
      activePatterns: 1,
      masteredPatterns: 1,
      similarQuestionsPracticed: 2,
      correctReviewAnswers: 1,
    })
  })

  it('combines compact archived totals with recent raw attempts', () => {
    const archivedAttempts = [
      attempt({ id: 'old-1', source: 'mistake-review' }),
      attempt({ id: 'old-2', operation: 'division', isCorrect: false }),
    ]
    const archive = archiveAttempts(
      createEmptyStatisticsArchive(),
      archivedAttempts,
    )
    const statistics = calculateStatistics(
      [attempt({ id: 'recent', difficulty: 4 })],
      [],
      archive,
    )

    expect(statistics).toMatchObject({ attempted: 3, correct: 2, incorrect: 1 })
    expect(statistics.byOperation.addition.attempted).toBe(2)
    expect(statistics.byOperation.division.incorrect).toBe(1)
    expect(statistics.byDifficulty[4].attempted).toBe(1)
    expect(statistics.mistakes).toMatchObject({
      similarQuestionsPracticed: 1,
      correctReviewAnswers: 1,
    })
  })
})
