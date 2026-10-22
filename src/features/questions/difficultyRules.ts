import type { DifficultyLevel } from '../../types'

interface AdditionRule {
  maximumOperand: number
  maximumResult: number
  minimumOperand: number
}

interface SubtractionRule {
  allowNegativeResult: boolean
  maximumOperand: number
  minimumOperand: number
}

interface MultiplicationRule {
  firstFactor: readonly [number, number]
  secondFactor: readonly [number, number]
}

interface DivisionRule {
  divisor: readonly [number, number]
  maximumDividend: number
  quotient: readonly [number, number]
}

export const additionRules: Record<DifficultyLevel, AdditionRule> = {
  1: { minimumOperand: 0, maximumOperand: 10, maximumResult: 20 },
  2: { minimumOperand: 0, maximumOperand: 50, maximumResult: 100 },
  3: { minimumOperand: 0, maximumOperand: 250, maximumResult: 500 },
  4: { minimumOperand: 0, maximumOperand: 1_000, maximumResult: 2_000 },
}

export const subtractionRules: Record<DifficultyLevel, SubtractionRule> = {
  1: { minimumOperand: 0, maximumOperand: 10, allowNegativeResult: false },
  2: { minimumOperand: 0, maximumOperand: 100, allowNegativeResult: false },
  3: { minimumOperand: 0, maximumOperand: 500, allowNegativeResult: false },
  4: { minimumOperand: 0, maximumOperand: 1_000, allowNegativeResult: true },
}

export const multiplicationRules: Record<DifficultyLevel, MultiplicationRule> =
  {
    1: { firstFactor: [0, 5], secondFactor: [0, 5] },
    2: { firstFactor: [0, 12], secondFactor: [0, 12] },
    3: { firstFactor: [2, 9], secondFactor: [10, 99] },
    4: { firstFactor: [10, 99], secondFactor: [10, 99] },
  }

export const divisionRules: Record<DifficultyLevel, DivisionRule> = {
  1: { divisor: [1, 5], quotient: [0, 10], maximumDividend: 50 },
  2: { divisor: [1, 12], quotient: [0, 12], maximumDividend: 144 },
  3: { divisor: [2, 12], quotient: [2, 50], maximumDividend: 600 },
  4: { divisor: [10, 50], quotient: [2, 50], maximumDividend: 2_500 },
}
