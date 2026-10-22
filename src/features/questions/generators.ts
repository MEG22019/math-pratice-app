import type {
  DifficultyLevel,
  MathOperation,
  Question,
  QuestionSource,
} from '../../types'
import { createId } from '../../utils/id'
import { randomInteger, type RandomSource } from '../../utils/random'
import { generateAnswerChoices } from './answerChoices'
import {
  additionRules,
  divisionRules,
  multiplicationRules,
  subtractionRules,
} from './difficultyRules'
import { validateQuestion } from './validation'

interface GeneratorOptions {
  idFactory?: () => string
  mistakePatternId?: string
  random?: RandomSource
  source?: QuestionSource
}

type OperationGenerator = (
  difficulty: DifficultyLevel,
  options?: GeneratorOptions,
) => Question

const operationSymbols: Record<MathOperation, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
}

function createQuestion(
  operation: MathOperation,
  difficulty: DifficultyLevel,
  firstOperand: number,
  secondOperand: number,
  correctAnswer: number,
  options: GeneratorOptions,
): Question {
  const random = options.random ?? Math.random
  const source = options.source ?? 'regular'
  const question: Question = {
    id: options.idFactory?.() ?? createId('question'),
    operation,
    firstOperand,
    secondOperand,
    displayText: `${firstOperand} ${operationSymbols[operation]} ${secondOperand}`,
    correctAnswer,
    choices: generateAnswerChoices(
      { operation, firstOperand, secondOperand, correctAnswer },
      random,
    ),
    difficulty,
    source,
  }

  if (options.mistakePatternId) {
    question.mistakePatternId = options.mistakePatternId
  }

  return question
}

export const generateAdditionQuestion: OperationGenerator = (
  difficulty,
  options = {},
) => {
  const random = options.random ?? Math.random
  const rule = additionRules[difficulty]
  const firstOperand = randomInteger(
    rule.minimumOperand,
    rule.maximumOperand,
    random,
  )
  const secondOperand = randomInteger(
    rule.minimumOperand,
    Math.min(rule.maximumOperand, rule.maximumResult - firstOperand),
    random,
  )

  return createQuestion(
    'addition',
    difficulty,
    firstOperand,
    secondOperand,
    firstOperand + secondOperand,
    options,
  )
}

export const generateSubtractionQuestion: OperationGenerator = (
  difficulty,
  options = {},
) => {
  const random = options.random ?? Math.random
  const rule = subtractionRules[difficulty]
  let firstOperand = randomInteger(
    rule.minimumOperand,
    rule.maximumOperand,
    random,
  )
  let secondOperand = randomInteger(
    rule.minimumOperand,
    rule.maximumOperand,
    random,
  )

  if (!rule.allowNegativeResult && secondOperand > firstOperand) {
    ;[firstOperand, secondOperand] = [secondOperand, firstOperand]
  }

  return createQuestion(
    'subtraction',
    difficulty,
    firstOperand,
    secondOperand,
    firstOperand - secondOperand,
    options,
  )
}

export const generateMultiplicationQuestion: OperationGenerator = (
  difficulty,
  options = {},
) => {
  const random = options.random ?? Math.random
  const rule = multiplicationRules[difficulty]
  const firstOperand = randomInteger(...rule.firstFactor, random)
  const secondOperand = randomInteger(...rule.secondFactor, random)

  return createQuestion(
    'multiplication',
    difficulty,
    firstOperand,
    secondOperand,
    firstOperand * secondOperand,
    options,
  )
}

export const generateDivisionQuestion: OperationGenerator = (
  difficulty,
  options = {},
) => {
  const random = options.random ?? Math.random
  const rule = divisionRules[difficulty]
  const divisor = randomInteger(...rule.divisor, random)
  const maximumQuotient = Math.min(
    rule.quotient[1],
    Math.floor(rule.maximumDividend / divisor),
  )
  const quotient = randomInteger(rule.quotient[0], maximumQuotient, random)
  const dividend = divisor * quotient

  return createQuestion(
    'division',
    difficulty,
    dividend,
    divisor,
    quotient,
    options,
  )
}

const generators: Record<MathOperation, OperationGenerator> = {
  addition: generateAdditionQuestion,
  subtraction: generateSubtractionQuestion,
  multiplication: generateMultiplicationQuestion,
  division: generateDivisionQuestion,
}

function fallbackQuestion(
  operation: MathOperation,
  difficulty: DifficultyLevel,
  options: GeneratorOptions,
): Question {
  const safeOptions = {
    ...options,
    random: () => 0.5,
    idFactory: options.idFactory ?? (() => createId('question')),
  }

  return generators[operation](difficulty, safeOptions)
}

export function generateQuestion(
  requestedOperations: MathOperation | readonly MathOperation[],
  difficulty: DifficultyLevel,
  options: GeneratorOptions = {},
): Question {
  const operations = Array.isArray(requestedOperations)
    ? requestedOperations
    : [requestedOperations]

  if (operations.length === 0) {
    throw new Error('At least one operation is required.')
  }

  const random = options.random ?? Math.random
  let operation: MathOperation

  try {
    operation = operations[randomInteger(0, operations.length - 1, random)]
  } catch {
    operation = operations[0]
  }

  for (let attempt = 0; attempt < 25; attempt += 1) {
    try {
      const question = generators[operation](difficulty, options)

      if (validateQuestion(question)) {
        return question
      }
    } catch {
      // Retry before using the known-safe fallback below.
    }
  }

  const question = fallbackQuestion(operation, difficulty, options)

  if (!validateQuestion(question)) {
    throw new Error('Unable to generate a valid question.')
  }

  return question
}
