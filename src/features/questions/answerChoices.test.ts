import { describe, expect, it } from 'vitest'

import type { MathOperation } from '../../types'
import { generateAnswerChoices, generateDistractors } from './answerChoices'

const examples: Record<
  MathOperation,
  { correctAnswer: number; firstOperand: number; secondOperand: number }
> = {
  addition: { firstOperand: 8, secondOperand: 7, correctAnswer: 15 },
  subtraction: { firstOperand: 13, secondOperand: 5, correctAnswer: 8 },
  multiplication: { firstOperand: 6, secondOperand: 7, correctAnswer: 42 },
  division: { firstOperand: 48, secondOperand: 6, correctAnswer: 8 },
}

describe.each(Object.entries(examples))(
  '%s answer choices',
  (operation, example) => {
    const input = { ...example, operation: operation as MathOperation }

    it('creates three unique plausible distractors', () => {
      const distractors = generateDistractors(input)

      expect(distractors).toHaveLength(3)
      expect(new Set(distractors)).toHaveLength(3)
      expect(distractors).not.toContain(example.correctAnswer)
      expect(
        distractors.some(
          (choice) => Math.abs(choice - example.correctAnswer) <= 2,
        ),
      ).toBe(true)
    })

    it('creates four unique choices with one correct answer', () => {
      const choices = generateAnswerChoices(input, () => 0.25)

      expect(choices).toHaveLength(4)
      expect(new Set(choices)).toHaveLength(4)
      expect(
        choices.filter((choice) => choice === example.correctAnswer),
      ).toHaveLength(1)
    })
  },
)

it('shuffles the correct answer into different positions', () => {
  const input = { ...examples.addition, operation: 'addition' as const }
  const firstChoices = generateAnswerChoices(input, () => 0)
  const secondChoices = generateAnswerChoices(input, () => 0.999_999)

  expect(firstChoices.indexOf(input.correctAnswer)).not.toBe(
    secondChoices.indexOf(input.correctAnswer),
  )
})
