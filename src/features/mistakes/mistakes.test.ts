import { describe, expect, it } from 'vitest'

import { defaultSettings } from '../../services/storage'
import type { MistakePattern, Question } from '../../types'
import {
  createMistakeReviewConfiguration,
  formatMistakeFact,
  getActiveMistakePatterns,
  getFrequentlyMissedFacts,
  getFrequentlyMissedOperations,
  prioritizeMistakePatterns,
  recordQuestionOutcome,
} from './mistakes'

const question: Question = {
  id: 'question-1',
  operation: 'multiplication',
  firstOperand: 6,
  secondOperand: 7,
  displayText: '6 × 7',
  correctAnswer: 42,
  choices: [35, 40, 42, 48],
  difficulty: 2,
  source: 'regular',
}

function pattern(overrides: Partial<MistakePattern> = {}): MistakePattern {
  return {
    id: 'mistake-1',
    operation: 'multiplication',
    firstOperand: 6,
    secondOperand: 7,
    correctAnswer: 42,
    difficulty: 2,
    incorrectCount: 1,
    similarCorrectCount: 0,
    lastIncorrectAt: '2026-01-01T00:00:00.000Z',
    isMastered: false,
    ...overrides,
  }
}

describe('mistake tracking', () => {
  it('creates one pattern and updates it for repeated misses', () => {
    const created = recordQuestionOutcome(
      [],
      question,
      false,
      3,
      '2026-01-01T00:00:00.000Z',
      () => 'mistake-1',
    )
    const repeated = recordQuestionOutcome(
      created,
      question,
      false,
      3,
      '2026-02-01T00:00:00.000Z',
    )

    expect(repeated).toHaveLength(1)
    expect(repeated[0]).toMatchObject({
      incorrectCount: 2,
      lastIncorrectAt: '2026-02-01T00:00:00.000Z',
      similarCorrectCount: 0,
      isMastered: false,
    })
  })

  it('tracks review mastery, resets misses, and reactivates regular mistakes', () => {
    const reviewQuestion = {
      ...question,
      source: 'mistake-review' as const,
      mistakePatternId: 'mistake-1',
    }
    let patterns = recordQuestionOutcome([pattern()], reviewQuestion, true, 2)
    expect(patterns[0]).toMatchObject({
      similarCorrectCount: 1,
      isMastered: false,
    })

    patterns = recordQuestionOutcome(patterns, reviewQuestion, true, 2)
    expect(patterns[0]).toMatchObject({
      similarCorrectCount: 2,
      isMastered: true,
    })
    expect(getActiveMistakePatterns(patterns)).toEqual([])

    patterns = recordQuestionOutcome(
      patterns,
      question,
      false,
      2,
      '2026-03-01T00:00:00.000Z',
    )
    expect(patterns[0]).toMatchObject({
      incorrectCount: 2,
      similarCorrectCount: 0,
      isMastered: false,
    })

    patterns = recordQuestionOutcome(patterns, reviewQuestion, false, 2)
    expect(patterns[0]).toMatchObject({
      incorrectCount: 3,
      similarCorrectCount: 0,
      isMastered: false,
    })
  })

  it('prioritizes frequent, recent, and low-progress active mistakes', () => {
    const patterns = [
      pattern({ id: 'mastered', incorrectCount: 10, isMastered: true }),
      pattern({ id: 'low', incorrectCount: 2 }),
      pattern({
        id: 'older',
        incorrectCount: 3,
        lastIncorrectAt: '2026-02-01T00:00:00.000Z',
        similarCorrectCount: 0,
      }),
      pattern({
        id: 'recent',
        incorrectCount: 3,
        lastIncorrectAt: '2026-03-01T00:00:00.000Z',
        similarCorrectCount: 2,
      }),
      pattern({
        id: 'priority',
        incorrectCount: 3,
        lastIncorrectAt: '2026-03-01T00:00:00.000Z',
        similarCorrectCount: 0,
      }),
    ]

    expect(prioritizeMistakePatterns(patterns).map(({ id }) => id)).toEqual([
      'priority',
      'recent',
      'older',
      'low',
    ])
  })

  it('builds review configuration and frequently missed insights with ties', () => {
    const patterns = [
      pattern({ id: 'add', operation: 'addition', incorrectCount: 3 }),
      pattern({ id: 'divide', operation: 'division', incorrectCount: 3 }),
      pattern({ id: 'multiply', incorrectCount: 1 }),
    ]

    expect(getFrequentlyMissedOperations(patterns)).toEqual([
      'addition',
      'division',
    ])
    expect(getFrequentlyMissedFacts(patterns).map(({ id }) => id)).toEqual([
      'add',
      'divide',
      'multiply',
    ])
    expect(formatMistakeFact(patterns[0])).toBe('6 + 7 = 42')
    expect(
      createMistakeReviewConfiguration(patterns, defaultSettings, 5),
    ).toMatchObject({
      operations: ['addition', 'multiplication', 'division'],
      sessionLength: 5,
      mode: 'mistake-review',
    })
  })
})
