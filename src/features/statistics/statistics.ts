import type {
  ApplicationStatistics,
  MistakePattern,
  PracticeAttempt,
  StatisticsTotals,
} from '../../types'

function emptyTotals(): StatisticsTotals {
  return { attempted: 0, correct: 0, incorrect: 0 }
}

function addAttempt(totals: StatisticsTotals, isCorrect: boolean) {
  totals.attempted += 1
  totals.correct += isCorrect ? 1 : 0
  totals.incorrect += isCorrect ? 0 : 1
}

export function calculateAccuracy(totals: StatisticsTotals): number {
  return totals.attempted === 0
    ? 0
    : Math.round((totals.correct / totals.attempted) * 100)
}

export function calculateStatistics(
  attempts: PracticeAttempt[],
  patterns: MistakePattern[] = [],
): ApplicationStatistics {
  const statistics: ApplicationStatistics = {
    ...emptyTotals(),
    byOperation: {
      addition: emptyTotals(),
      subtraction: emptyTotals(),
      multiplication: emptyTotals(),
      division: emptyTotals(),
    },
    byDifficulty: {
      1: emptyTotals(),
      2: emptyTotals(),
      3: emptyTotals(),
      4: emptyTotals(),
    },
    mistakes: {
      activePatterns: patterns.filter((pattern) => !pattern.isMastered).length,
      masteredPatterns: patterns.filter((pattern) => pattern.isMastered).length,
      similarQuestionsPracticed: attempts.filter(
        (attempt) => attempt.source === 'mistake-review',
      ).length,
      correctReviewAnswers: attempts.filter(
        (attempt) => attempt.source === 'mistake-review' && attempt.isCorrect,
      ).length,
    },
  }

  for (const attempt of attempts) {
    addAttempt(statistics, attempt.isCorrect)
    addAttempt(statistics.byOperation[attempt.operation], attempt.isCorrect)
    addAttempt(statistics.byDifficulty[attempt.difficulty], attempt.isCorrect)
  }

  return statistics
}
