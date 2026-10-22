import type {
  DifficultyLevel,
  MathOperation,
  MistakePattern,
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

export interface GeneratorOptions {
  idFactory?: () => string
  mistakePatternId?: string
  random?: RandomSource
  source?: QuestionSource
}

export function generateSimilarQuestion(
  pattern: MistakePattern,
  options: GeneratorOptions = {},
): Question {
  const random = options.random ?? Math.random
  const candidates: Question[] = []
  const reviewOptions: GeneratorOptions = {
    ...options,
    mistakePatternId: pattern.id,
    source: 'mistake-review',
  }

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = generateQuestion(
      pattern.operation,
      pattern.difficulty,
      reviewOptions,
    )
    if (
      candidate.firstOperand !== pattern.firstOperand ||
      candidate.secondOperand !== pattern.secondOperand
    ) {
      candidates.push(candidate)
    }
  }

  if (candidates.length > 0) {
    return candidates.sort(
      (first, second) =>
        Math.abs(first.firstOperand - pattern.firstOperand) +
        Math.abs(first.secondOperand - pattern.secondOperand) -
        (Math.abs(second.firstOperand - pattern.firstOperand) +
          Math.abs(second.secondOperand - pattern.secondOperand)),
    )[0]
  }

  for (const fallbackRandom of [0.15, 0.35, 0.65, 0.85]) {
    const candidate = generateQuestion(pattern.operation, pattern.difficulty, {
      ...reviewOptions,
      random: () => fallbackRandom,
    })
    if (
      candidate.firstOperand !== pattern.firstOperand ||
      candidate.secondOperand !== pattern.secondOperand
    ) {
      return candidate
    }
  }

  return generateQuestion(pattern.operation, pattern.difficulty, {
    ...reviewOptions,
    random,
  })
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

export const QUESTION_GENERATION_MAX_ATTEMPTS = 25

const knownGoodFacts: Record<
  MathOperation,
  Record<DifficultyLevel, readonly [number, number, number]>
> = {
  addition: {
    1: [4, 3, 7],
    2: [24, 15, 39],
    3: [125, 75, 200],
    4: [750, 250, 1_000],
  },
  subtraction: {
    1: [8, 3, 5],
    2: [62, 17, 45],
    3: [325, 125, 200],
    4: [250, 725, -475],
  },
  multiplication: {
    1: [4, 3, 12],
    2: [8, 7, 56],
    3: [6, 24, 144],
    4: [25, 16, 400],
  },
  division: {
    1: [12, 3, 4],
    2: [56, 7, 8],
    3: [144, 6, 24],
    4: [600, 20, 30],
  },
}

function knownGoodFallbackQuestion(
  operation: MathOperation,
  difficulty: DifficultyLevel,
  options: GeneratorOptions,
): Question {
  const [firstOperand, secondOperand, correctAnswer] =
    knownGoodFacts[operation][difficulty]
  const question: Question = {
    id: createId('question'),
    operation,
    firstOperand,
    secondOperand,
    displayText: `${firstOperand} ${operationSymbols[operation]} ${secondOperand}`,
    correctAnswer,
    choices: [
      correctAnswer - 1,
      correctAnswer,
      correctAnswer + 1,
      correctAnswer + 2,
    ],
    difficulty,
    source: options.source ?? 'regular',
  }

  if (options.mistakePatternId) {
    question.mistakePatternId = options.mistakePatternId
  }

  return question
}

export function generateQuestion(
  requestedOperations: MathOperation | readonly MathOperation[],
  difficulty: DifficultyLevel,
  options: GeneratorOptions = {},
): Question {
  const operations = Array.isArray(requestedOperations)
    ? requestedOperations
    : [requestedOperations]

  const validOperations = operations.filter(
    (operation): operation is MathOperation => operation in generators,
  )

  if (validOperations.length === 0) {
    throw new Error('At least one operation is required.')
  }

  const random = options.random ?? Math.random
  let operation: MathOperation

  try {
    operation =
      validOperations[randomInteger(0, validOperations.length - 1, random)]
  } catch {
    operation = validOperations[0]
  }

  for (
    let attempt = 0;
    attempt < QUESTION_GENERATION_MAX_ATTEMPTS;
    attempt += 1
  ) {
    try {
      const question = generators[operation](difficulty, options)

      if (validateQuestion(question)) {
        return question
      }
    } catch {
      // Retry before using the known-safe fallback below.
    }
  }

  if (import.meta.env.DEV) {
    console.warn(
      `Question generation needed its safe fallback after ${QUESTION_GENERATION_MAX_ATTEMPTS} attempts.`,
      { difficulty, operation },
    )
  }

  const question = knownGoodFallbackQuestion(operation, difficulty, options)

  if (!validateQuestion(question)) {
    throw new Error('Unable to generate a valid question.')
  }

  return question
}
