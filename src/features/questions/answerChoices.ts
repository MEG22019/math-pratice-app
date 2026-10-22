import type { MathOperation } from '../../types'
import { shuffle, type RandomSource } from '../../utils/random'

interface AnswerChoiceInput {
  correctAnswer: number
  firstOperand: number
  operation: MathOperation
  secondOperand: number
}

function normalizeAnswer(value: number): number {
  return Object.is(value, -0) ? 0 : value
}

function operationSpecificCandidates({
  correctAnswer,
  firstOperand,
  operation,
  secondOperand,
}: AnswerChoiceInput): number[] {
  switch (operation) {
    case 'addition':
      return [
        firstOperand - secondOperand,
        secondOperand - firstOperand,
        correctAnswer - 10,
        correctAnswer + 10,
      ]
    case 'subtraction':
      return [
        firstOperand + secondOperand,
        secondOperand - firstOperand,
        correctAnswer - secondOperand,
        correctAnswer + secondOperand,
      ]
    case 'multiplication':
      return [
        firstOperand + secondOperand,
        correctAnswer - firstOperand,
        correctAnswer + firstOperand,
        correctAnswer - secondOperand,
        correctAnswer + secondOperand,
      ]
    case 'division':
      return [
        firstOperand - secondOperand,
        correctAnswer + secondOperand,
        correctAnswer - secondOperand,
        secondOperand,
      ]
  }
}

export function generateDistractors(input: AnswerChoiceInput): number[] {
  const { correctAnswer } = input
  const candidates = [
    correctAnswer - 1,
    correctAnswer + 1,
    ...operationSpecificCandidates(input),
    correctAnswer - 2,
    correctAnswer + 2,
    correctAnswer - 5,
    correctAnswer + 5,
  ]
  const uniqueDistractors = new Set<number>()

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeAnswer(candidate)

    if (
      Number.isInteger(normalizedCandidate) &&
      normalizedCandidate !== correctAnswer
    ) {
      uniqueDistractors.add(normalizedCandidate)
    }

    if (uniqueDistractors.size === 3) {
      break
    }
  }

  return [...uniqueDistractors]
}

export function generateAnswerChoices(
  input: AnswerChoiceInput,
  random: RandomSource = Math.random,
): number[] {
  const distractors = generateDistractors(input)

  if (distractors.length !== 3) {
    throw new Error('Unable to generate three unique answer choices.')
  }

  return shuffle([input.correctAnswer, ...distractors], random)
}
