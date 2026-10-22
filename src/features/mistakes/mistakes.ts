import type {
  ApplicationSettings,
  MathOperation,
  MistakePattern,
  PracticeSetupConfiguration,
  Question,
  SessionLength,
} from '../../types'
import { createId } from '../../utils/id'

const operationOrder: MathOperation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
]

function matchesFact(pattern: MistakePattern, question: Question): boolean {
  return (
    pattern.operation === question.operation &&
    pattern.firstOperand === question.firstOperand &&
    pattern.secondOperand === question.secondOperand &&
    pattern.correctAnswer === question.correctAnswer
  )
}

export function getActiveMistakePatterns(
  patterns: MistakePattern[],
): MistakePattern[] {
  return patterns.filter((pattern) => !pattern.isMastered)
}

export function recordQuestionOutcome(
  patterns: MistakePattern[],
  question: Question,
  isCorrect: boolean,
  masteryThreshold: number,
  timestamp = new Date().toISOString(),
  idFactory: () => string = () => createId('mistake'),
): MistakePattern[] {
  if (question.source === 'regular') {
    if (isCorrect) {
      return patterns
    }

    const existingIndex = patterns.findIndex((pattern) =>
      matchesFact(pattern, question),
    )
    if (existingIndex === -1) {
      return [
        ...patterns,
        {
          id: idFactory(),
          operation: question.operation,
          firstOperand: question.firstOperand,
          secondOperand: question.secondOperand,
          correctAnswer: question.correctAnswer,
          difficulty: question.difficulty,
          incorrectCount: 1,
          similarCorrectCount: 0,
          lastIncorrectAt: timestamp,
          isMastered: false,
        },
      ]
    }

    return patterns.map((pattern, index) =>
      index === existingIndex
        ? {
            ...pattern,
            difficulty: question.difficulty,
            incorrectCount: pattern.incorrectCount + 1,
            similarCorrectCount: 0,
            lastIncorrectAt: timestamp,
            isMastered: false,
          }
        : pattern,
    )
  }

  if (!question.mistakePatternId) {
    return patterns
  }

  return patterns.map((pattern) => {
    if (pattern.id !== question.mistakePatternId) {
      return pattern
    }

    if (!isCorrect) {
      return {
        ...pattern,
        incorrectCount: pattern.incorrectCount + 1,
        similarCorrectCount: 0,
        lastIncorrectAt: timestamp,
        isMastered: false,
      }
    }

    const similarCorrectCount = pattern.similarCorrectCount + 1
    return {
      ...pattern,
      similarCorrectCount,
      isMastered: similarCorrectCount >= masteryThreshold,
    }
  })
}

export function prioritizeMistakePatterns(
  patterns: MistakePattern[],
): MistakePattern[] {
  return getActiveMistakePatterns(patterns).sort((first, second) => {
    const incorrectDifference = second.incorrectCount - first.incorrectCount
    if (incorrectDifference !== 0) return incorrectDifference

    const recencyDifference =
      Date.parse(second.lastIncorrectAt) - Date.parse(first.lastIncorrectAt)
    if (recencyDifference !== 0) return recencyDifference

    const progressDifference =
      first.similarCorrectCount - second.similarCorrectCount
    if (progressDifference !== 0) return progressDifference

    return first.id.localeCompare(second.id)
  })
}

export function createMistakeReviewConfiguration(
  patterns: MistakePattern[],
  settings: ApplicationSettings,
  sessionLength: SessionLength = settings.defaultSessionLength,
): PracticeSetupConfiguration | undefined {
  const prioritized = prioritizeMistakePatterns(patterns)
  const firstPattern = prioritized[0]
  if (!firstPattern) return undefined

  return {
    operations: operationOrder.filter((operation) =>
      prioritized.some((pattern) => pattern.operation === operation),
    ),
    difficulty: firstPattern.difficulty,
    sessionLength,
    mode: 'mistake-review',
  }
}

export function getFrequentlyMissedOperations(
  patterns: MistakePattern[],
): MathOperation[] {
  const counts = Object.fromEntries(
    operationOrder.map((operation) => [operation, 0]),
  ) as Record<MathOperation, number>
  for (const pattern of patterns)
    counts[pattern.operation] += pattern.incorrectCount
  const highestCount = Math.max(...Object.values(counts))
  return highestCount === 0
    ? []
    : operationOrder.filter((operation) => counts[operation] === highestCount)
}

export function getFrequentlyMissedFacts(
  patterns: MistakePattern[],
  limit = 5,
): MistakePattern[] {
  return [...patterns]
    .sort(
      (first, second) =>
        second.incorrectCount - first.incorrectCount ||
        Date.parse(second.lastIncorrectAt) -
          Date.parse(first.lastIncorrectAt) ||
        first.id.localeCompare(second.id),
    )
    .slice(0, limit)
}

const operationSymbols: Record<MathOperation, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
}

export function formatMistakeFact(pattern: MistakePattern): string {
  return `${pattern.firstOperand} ${operationSymbols[pattern.operation]} ${pattern.secondOperand} = ${pattern.correctAnswer}`
}
