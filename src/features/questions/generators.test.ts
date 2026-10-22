import { describe, expect, it } from 'vitest'

import type {
  DifficultyLevel,
  MathOperation,
  MistakePattern,
  Question,
} from '../../types'
import {
  additionRules,
  divisionRules,
  generateAdditionQuestion,
  generateDivisionQuestion,
  generateMultiplicationQuestion,
  generateQuestion,
  generateSimilarQuestion,
  generateSubtractionQuestion,
  multiplicationRules,
  subtractionRules,
  validateQuestion,
} from '.'

const difficulties: DifficultyLevel[] = [1, 2, 3, 4]
const operations: MathOperation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
]

function expectValidChoices(question: Question) {
  expect(question.choices).toHaveLength(4)
  expect(new Set(question.choices)).toHaveLength(4)
  expect(
    question.choices.filter((choice) => choice === question.correctAnswer),
  ).toHaveLength(1)
}

describe('addition generation', () => {
  it.each(difficulties)(
    'respects level %s operand and result limits',
    (level) => {
      const rule = additionRules[level]

      for (let index = 0; index < 100; index += 1) {
        const question = generateAdditionQuestion(level)

        expect(question.firstOperand).toBeGreaterThanOrEqual(
          rule.minimumOperand,
        )
        expect(question.firstOperand).toBeLessThanOrEqual(rule.maximumOperand)
        expect(question.secondOperand).toBeGreaterThanOrEqual(
          rule.minimumOperand,
        )
        expect(question.secondOperand).toBeLessThanOrEqual(rule.maximumOperand)
        expect(question.correctAnswer).toBe(
          question.firstOperand + question.secondOperand,
        )
        expect(question.correctAnswer).toBeLessThanOrEqual(rule.maximumResult)
        expect(validateQuestion(question)).toBe(true)
      }
    },
  )

  it.each(difficulties)('can reach level %s range boundaries', (level) => {
    const rule = additionRules[level]
    const minimum = generateAdditionQuestion(level, { random: () => 0 })
    const maximum = generateAdditionQuestion(level, {
      random: () => 0.999_999,
    })

    expect(minimum.firstOperand).toBe(rule.minimumOperand)
    expect(minimum.secondOperand).toBe(rule.minimumOperand)
    expect(maximum.firstOperand).toBe(rule.maximumOperand)
    expect(maximum.secondOperand).toBe(rule.maximumOperand)
    expect(maximum.correctAnswer).toBe(rule.maximumResult)
  })
})

describe('subtraction generation', () => {
  it.each(difficulties)('respects level %s rules', (level) => {
    const rule = subtractionRules[level]

    for (let index = 0; index < 100; index += 1) {
      const question = generateSubtractionQuestion(level)

      expect(question.firstOperand).toBeGreaterThanOrEqual(rule.minimumOperand)
      expect(question.firstOperand).toBeLessThanOrEqual(rule.maximumOperand)
      expect(question.secondOperand).toBeGreaterThanOrEqual(rule.minimumOperand)
      expect(question.secondOperand).toBeLessThanOrEqual(rule.maximumOperand)
      expect(question.correctAnswer).toBe(
        question.firstOperand - question.secondOperand,
      )

      if (!rule.allowNegativeResult) {
        expect(question.firstOperand).toBeGreaterThanOrEqual(
          question.secondOperand,
        )
      }

      expect(validateQuestion(question)).toBe(true)
    }
  })

  it('allows negative results only at the Advanced level', () => {
    const values = [0, 0.999_999, 0.5, 0.5, 0.5]
    const question = generateSubtractionQuestion(4, {
      random: () => values.shift() ?? 0.5,
    })

    expect(question.correctAnswer).toBeLessThan(0)
    expect(validateQuestion(question)).toBe(true)
  })
})

describe('multiplication generation', () => {
  it.each(difficulties)('respects level %s factor ranges', (level) => {
    const rule = multiplicationRules[level]

    for (let index = 0; index < 100; index += 1) {
      const question = generateMultiplicationQuestion(level)

      expect(question.firstOperand).toBeGreaterThanOrEqual(rule.firstFactor[0])
      expect(question.firstOperand).toBeLessThanOrEqual(rule.firstFactor[1])
      expect(question.secondOperand).toBeGreaterThanOrEqual(
        rule.secondFactor[0],
      )
      expect(question.secondOperand).toBeLessThanOrEqual(rule.secondFactor[1])
      expect(question.correctAnswer).toBe(
        question.firstOperand * question.secondOperand,
      )
      expect(validateQuestion(question)).toBe(true)
    }
  })
})

describe('division generation', () => {
  it.each(difficulties)('respects level %s limits and stays whole', (level) => {
    const rule = divisionRules[level]

    for (let index = 0; index < 100; index += 1) {
      const question = generateDivisionQuestion(level)

      expect(question.secondOperand).toBeGreaterThanOrEqual(rule.divisor[0])
      expect(question.secondOperand).toBeLessThanOrEqual(rule.divisor[1])
      expect(question.secondOperand).not.toBe(0)
      expect(question.firstOperand).toBeLessThanOrEqual(rule.maximumDividend)
      expect(Number.isInteger(question.correctAnswer)).toBe(true)
      expect(question.firstOperand % question.secondOperand).toBe(0)
      expect(question.correctAnswer).toBe(
        question.firstOperand / question.secondOperand,
      )
      expect(validateQuestion(question)).toBe(true)
    }
  })
})

describe('main question generator', () => {
  it.each(
    operations.flatMap((operation) =>
      difficulties.map((d) => [operation, d] as const),
    ),
  )('generates a valid %s question at level %s', (operation, difficulty) => {
    const question = generateQuestion(operation, difficulty)

    expect(question.operation).toBe(operation)
    expect(question.difficulty).toBe(difficulty)
    expect(question.displayText).toBeTruthy()
    expect(question.source).toBe('regular')
    expectValidChoices(question)
    expect(validateQuestion(question)).toBe(true)
  })

  it('selects from multiple enabled operations', () => {
    const question = generateQuestion(['addition', 'division'], 2, {
      random: () => 0.999_999,
    })

    expect(question.operation).toBe('division')
    expect(validateQuestion(question)).toBe(true)
  })

  it('rejects an empty operation selection', () => {
    expect(() => generateQuestion([], 1)).toThrow(
      'At least one operation is required.',
    )
  })

  it('falls back safely after repeated generation failures', () => {
    const question = generateQuestion('addition', 1, {
      random: () => Number.NaN,
    })

    expect(question.operation).toBe('addition')
    expect(validateQuestion(question)).toBe(true)
  })
})

describe('similar question generation', () => {
  it.each(operations)(
    'creates a valid, varied %s review question linked to its pattern',
    (operation) => {
      const original = generateQuestion(operation, 2)
      const pattern: MistakePattern = {
        id: `mistake-${operation}`,
        operation,
        firstOperand: original.firstOperand,
        secondOperand: original.secondOperand,
        correctAnswer: original.correctAnswer,
        difficulty: 2,
        incorrectCount: 1,
        similarCorrectCount: 0,
        lastIncorrectAt: '2026-01-01T00:00:00.000Z',
        isMastered: false,
      }
      let randomValue = 0.07
      const similar = generateSimilarQuestion(pattern, {
        random: () => {
          randomValue = (randomValue + 0.173) % 1
          return randomValue
        },
      })

      expect(similar).toMatchObject({
        operation,
        difficulty: 2,
        source: 'mistake-review',
        mistakePatternId: pattern.id,
      })
      expect([similar.firstOperand, similar.secondOperand]).not.toEqual([
        pattern.firstOperand,
        pattern.secondOperand,
      ])
      expect(validateQuestion(similar)).toBe(true)
    },
  )

  it('uses a safe varied fallback when random generation repeats the fact', () => {
    const original = generateQuestion('addition', 2, { random: () => 0.5 })
    const pattern: MistakePattern = {
      id: 'mistake-repeat',
      operation: 'addition',
      firstOperand: original.firstOperand,
      secondOperand: original.secondOperand,
      correctAnswer: original.correctAnswer,
      difficulty: 2,
      incorrectCount: 1,
      similarCorrectCount: 0,
      lastIncorrectAt: '2026-01-01T00:00:00.000Z',
      isMastered: false,
    }

    const similar = generateSimilarQuestion(pattern, { random: () => 0.5 })

    expect([similar.firstOperand, similar.secondOperand]).not.toEqual([
      pattern.firstOperand,
      pattern.secondOperand,
    ])
    expect(validateQuestion(similar)).toBe(true)
  })
})

describe('question validation', () => {
  it('rejects duplicate choices and incorrect arithmetic', () => {
    const question = generateQuestion('addition', 1)

    expect(validateQuestion({ ...question, choices: [1, 1, 2, 3] })).toBe(false)
    expect(
      validateQuestion({
        ...question,
        correctAnswer: question.correctAnswer + 1,
      }),
    ).toBe(false)
  })

  it('rejects division by zero', () => {
    const question = generateQuestion('division', 1)

    expect(
      validateQuestion({
        ...question,
        secondOperand: 0,
        correctAnswer: 0,
        choices: [0, 1, 2, 3],
      }),
    ).toBe(false)
  })
})
