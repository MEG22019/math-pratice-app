export type MathOperation =
  'addition' | 'subtraction' | 'multiplication' | 'division'

export type DifficultyLevel = 1 | 2 | 3 | 4

export type QuestionSource = 'regular' | 'mistake-review'

export type SessionLength = 5 | 10 | 20 | 'continuous'

export type PracticeMode = 'regular' | 'mistake-review'

export interface PracticeSetupConfiguration {
  operations: MathOperation[]
  difficulty: DifficultyLevel
  sessionLength: SessionLength
  mode: PracticeMode
}

export interface Question {
  id: string
  operation: MathOperation
  firstOperand: number
  secondOperand: number
  displayText: string
  correctAnswer: number
  choices: number[]
  difficulty: DifficultyLevel
  source: QuestionSource
  mistakePatternId?: string
}

export interface PracticeAttempt {
  id: string
  questionId: string
  sessionId: string
  operation: MathOperation
  firstOperand: number
  secondOperand: number
  correctAnswer: number
  selectedAnswer: number
  isCorrect: boolean
  difficulty: DifficultyLevel
  source: QuestionSource
  timestamp: string
  mistakePatternId?: string
}

export interface PracticeSession {
  id: string
  startedAt: string
  completedAt?: string
  operations: MathOperation[]
  difficulty: DifficultyLevel
  sessionLength: SessionLength
  mode: PracticeMode
  attemptedCount: number
  correctCount: number
  incorrectCount: number
  attempts: PracticeAttempt[]
}

export interface MistakePattern {
  id: string
  operation: MathOperation
  firstOperand: number
  secondOperand: number
  correctAnswer: number
  difficulty: DifficultyLevel
  incorrectCount: number
  similarCorrectCount: number
  lastIncorrectAt: string
  isMastered: boolean
}

export interface StatisticsTotals {
  attempted: number
  correct: number
  incorrect: number
}

export type OperationStatistics = Record<MathOperation, StatisticsTotals>

export type DifficultyStatistics = Record<DifficultyLevel, StatisticsTotals>

export interface MistakeStatistics {
  activePatterns: number
  masteredPatterns: number
  similarQuestionsPracticed: number
  correctReviewAnswers: number
}

export interface ApplicationStatistics extends StatisticsTotals {
  byOperation: OperationStatistics
  byDifficulty: DifficultyStatistics
  mistakes: MistakeStatistics
}

export interface ApplicationSettings {
  soundEffectsEnabled: boolean
  cardAnimationEnabled: boolean
  showExplanations: boolean
  encouragingFeedbackEnabled: boolean
  mistakeMasteryThreshold: number
  defaultOperations: MathOperation[]
  defaultDifficulty: DifficultyLevel
  defaultSessionLength: SessionLength
}
