import type {
  ApplicationStatistics,
  MistakePattern,
  PracticeAttempt,
  PracticeStatisticsArchive,
  StatisticsTotals,
} from '../../types'

export function emptyTotals(): StatisticsTotals {
  return { attempted: 0, correct: 0, incorrect: 0 }
}

function addAttempt(totals: StatisticsTotals, isCorrect: boolean) {
  totals.attempted += 1
  totals.correct += isCorrect ? 1 : 0
  totals.incorrect += isCorrect ? 0 : 1
}

export function createEmptyStatisticsArchive(): PracticeStatisticsArchive {
  return {
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
    reviewAttempted: 0,
    reviewCorrect: 0,
  }
}

export function archiveAttempts(
  archive: PracticeStatisticsArchive,
  attempts: readonly PracticeAttempt[],
): PracticeStatisticsArchive {
  const updated: PracticeStatisticsArchive = {
    attempted: archive.attempted,
    correct: archive.correct,
    incorrect: archive.incorrect,
    byOperation: {
      addition: { ...archive.byOperation.addition },
      subtraction: { ...archive.byOperation.subtraction },
      multiplication: { ...archive.byOperation.multiplication },
      division: { ...archive.byOperation.division },
    },
    byDifficulty: {
      1: { ...archive.byDifficulty[1] },
      2: { ...archive.byDifficulty[2] },
      3: { ...archive.byDifficulty[3] },
      4: { ...archive.byDifficulty[4] },
    },
    reviewAttempted: archive.reviewAttempted,
    reviewCorrect: archive.reviewCorrect,
  }

  for (const attempt of attempts) {
    addAttempt(updated, attempt.isCorrect)
    addAttempt(updated.byOperation[attempt.operation], attempt.isCorrect)
    addAttempt(updated.byDifficulty[attempt.difficulty], attempt.isCorrect)
    if (attempt.source === 'mistake-review') {
      updated.reviewAttempted += 1
      updated.reviewCorrect += attempt.isCorrect ? 1 : 0
    }
  }

  return updated
}

export function calculateAccuracy(totals: StatisticsTotals): number {
  return totals.attempted === 0
    ? 0
    : Math.round((totals.correct / totals.attempted) * 100)
}

export function calculateStatistics(
  attempts: PracticeAttempt[],
  patterns: MistakePattern[] = [],
  archive: PracticeStatisticsArchive = createEmptyStatisticsArchive(),
): ApplicationStatistics {
  const statistics: ApplicationStatistics = {
    attempted: archive.attempted,
    correct: archive.correct,
    incorrect: archive.incorrect,
    byOperation: {
      addition: { ...archive.byOperation.addition },
      subtraction: { ...archive.byOperation.subtraction },
      multiplication: { ...archive.byOperation.multiplication },
      division: { ...archive.byOperation.division },
    },
    byDifficulty: {
      1: { ...archive.byDifficulty[1] },
      2: { ...archive.byDifficulty[2] },
      3: { ...archive.byDifficulty[3] },
      4: { ...archive.byDifficulty[4] },
    },
    mistakes: {
      activePatterns: patterns.filter((pattern) => !pattern.isMastered).length,
      masteredPatterns: patterns.filter((pattern) => pattern.isMastered).length,
      similarQuestionsPracticed: archive.reviewAttempted,
      correctReviewAnswers: archive.reviewCorrect,
    },
  }

  for (const attempt of attempts) {
    addAttempt(statistics, attempt.isCorrect)
    addAttempt(statistics.byOperation[attempt.operation], attempt.isCorrect)
    addAttempt(statistics.byDifficulty[attempt.difficulty], attempt.isCorrect)
    if (attempt.source === 'mistake-review') {
      statistics.mistakes.similarQuestionsPracticed += 1
      statistics.mistakes.correctReviewAnswers += attempt.isCorrect ? 1 : 0
    }
  }

  return statistics
}
