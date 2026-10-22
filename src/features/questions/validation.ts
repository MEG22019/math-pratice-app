import type { DifficultyLevel, MathOperation, Question } from '../../types'
import {
  additionRules,
  divisionRules,
  multiplicationRules,
  subtractionRules,
} from './difficultyRules'

const operations: MathOperation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
]

const difficulties: DifficultyLevel[] = [1, 2, 3, 4]

function hasValidArithmetic(question: Question): boolean {
  const { correctAnswer, firstOperand, operation, secondOperand } = question

  switch (operation) {
    case 'addition':
      return correctAnswer === firstOperand + secondOperand
    case 'subtraction':
      return correctAnswer === firstOperand - secondOperand
    case 'multiplication':
      return correctAnswer === firstOperand * secondOperand
    case 'division':
      return (
        secondOperand !== 0 &&
        Number.isInteger(correctAnswer) &&
        correctAnswer === firstOperand / secondOperand
      )
  }
}

function isInRange(value: number, range: readonly [number, number]): boolean {
  return value >= range[0] && value <= range[1]
}

function followsDifficultyRules(question: Question): boolean {
  const { difficulty, firstOperand, operation, secondOperand } = question

  switch (operation) {
    case 'addition': {
      const rule = additionRules[difficulty]
      return (
        firstOperand >= rule.minimumOperand &&
        firstOperand <= rule.maximumOperand &&
        secondOperand >= rule.minimumOperand &&
        secondOperand <= rule.maximumOperand &&
        firstOperand + secondOperand <= rule.maximumResult
      )
    }
    case 'subtraction': {
      const rule = subtractionRules[difficulty]
      return (
        firstOperand >= rule.minimumOperand &&
        firstOperand <= rule.maximumOperand &&
        secondOperand >= rule.minimumOperand &&
        secondOperand <= rule.maximumOperand &&
        (rule.allowNegativeResult || firstOperand >= secondOperand)
      )
    }
    case 'multiplication': {
      const rule = multiplicationRules[difficulty]
      return (
        isInRange(firstOperand, rule.firstFactor) &&
        isInRange(secondOperand, rule.secondFactor)
      )
    }
    case 'division': {
      const rule = divisionRules[difficulty]
      return (
        isInRange(secondOperand, rule.divisor) &&
        isInRange(question.correctAnswer, rule.quotient) &&
        firstOperand <= rule.maximumDividend
      )
    }
  }
}

export function validateQuestion(question: Question): boolean {
  const choices = question.choices

  return (
    typeof question.id === 'string' &&
    question.id.length > 0 &&
    operations.includes(question.operation) &&
    difficulties.includes(question.difficulty) &&
    Number.isInteger(question.firstOperand) &&
    Number.isInteger(question.secondOperand) &&
    Number.isInteger(question.correctAnswer) &&
    typeof question.displayText === 'string' &&
    question.displayText.trim().length > 0 &&
    (question.source === 'regular' || question.source === 'mistake-review') &&
    choices.length === 4 &&
    choices.every(Number.isInteger) &&
    new Set(choices).size === 4 &&
    choices.filter((choice) => choice === question.correctAnswer).length ===
      1 &&
    hasValidArithmetic(question) &&
    followsDifficultyRules(question)
  )
}
