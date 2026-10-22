import { validateQuestion } from '../features/questions'
import type {
  ActiveSessionSnapshot,
  ApplicationSettings,
  DifficultyLevel,
  MathOperation,
  MistakePattern,
  PracticeAttempt,
  PracticeMode,
  PracticeSession,
  Question,
  QuestionSource,
  SessionLength,
} from '../types'

export const STORAGE_VERSION = 1
export const MAX_STORED_SESSIONS = 100
export const MAX_STORED_ATTEMPTS = 2_000

export const storageKeys = {
  version: 'math-practice:version',
  settings: 'math-practice:settings',
  sessions: 'math-practice:sessions',
  attempts: 'math-practice:attempts',
  mistakePatterns: 'math-practice:mistake-patterns',
  activeSession: 'math-practice:active-session',
  lastSummarySessionId: 'math-practice:last-summary-session-id',
} as const

export const defaultSettings: ApplicationSettings = {
  soundEffectsEnabled: false,
  cardAnimationEnabled: true,
  showExplanations: true,
  encouragingFeedbackEnabled: true,
  mistakeMasteryThreshold: 3,
  defaultOperations: ['addition'],
  defaultDifficulty: 1,
  defaultSessionLength: 10,
}

type StorageCategory = keyof typeof storageKeys

function getBrowserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMathOperation(value: unknown): value is MathOperation {
  return (
    value === 'addition' ||
    value === 'subtraction' ||
    value === 'multiplication' ||
    value === 'division'
  )
}

function isDifficulty(value: unknown): value is DifficultyLevel {
  return value === 1 || value === 2 || value === 3 || value === 4
}

function isSessionLength(value: unknown): value is SessionLength {
  return value === 5 || value === 10 || value === 20 || value === 'continuous'
}

function isPracticeMode(value: unknown): value is PracticeMode {
  return value === 'regular' || value === 'mistake-review'
}

function isQuestionSource(value: unknown): value is QuestionSource {
  return value === 'regular' || value === 'mistake-review'
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isNonnegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0
}

export function isPracticeAttempt(value: unknown): value is PracticeAttempt {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.questionId === 'string' &&
    typeof value.sessionId === 'string' &&
    isMathOperation(value.operation) &&
    Number.isInteger(value.firstOperand) &&
    Number.isInteger(value.secondOperand) &&
    Number.isInteger(value.correctAnswer) &&
    Number.isInteger(value.selectedAnswer) &&
    typeof value.isCorrect === 'boolean' &&
    isDifficulty(value.difficulty) &&
    isQuestionSource(value.source) &&
    isDateString(value.timestamp) &&
    (value.mistakePatternId === undefined ||
      typeof value.mistakePatternId === 'string')
  )
}

export function isPracticeSession(value: unknown): value is PracticeSession {
  if (!isRecord(value) || !Array.isArray(value.attempts)) {
    return false
  }

  const attempts = value.attempts

  return (
    typeof value.id === 'string' &&
    isDateString(value.startedAt) &&
    (value.completedAt === undefined || isDateString(value.completedAt)) &&
    Array.isArray(value.operations) &&
    value.operations.length > 0 &&
    value.operations.every(isMathOperation) &&
    isDifficulty(value.difficulty) &&
    isSessionLength(value.sessionLength) &&
    isPracticeMode(value.mode) &&
    isNonnegativeInteger(value.attemptedCount) &&
    isNonnegativeInteger(value.correctCount) &&
    isNonnegativeInteger(value.incorrectCount) &&
    attempts.every(isPracticeAttempt) &&
    value.attemptedCount === attempts.length &&
    value.correctCount + value.incorrectCount === value.attemptedCount &&
    attempts.every((attempt) => attempt.sessionId === value.id)
  )
}

function isMistakePattern(value: unknown): value is MistakePattern {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    isMathOperation(value.operation) &&
    Number.isInteger(value.firstOperand) &&
    Number.isInteger(value.secondOperand) &&
    Number.isInteger(value.correctAnswer) &&
    isDifficulty(value.difficulty) &&
    isNonnegativeInteger(value.incorrectCount) &&
    isNonnegativeInteger(value.similarCorrectCount) &&
    isDateString(value.lastIncorrectAt) &&
    typeof value.isMastered === 'boolean'
  )
}

function safeRead(
  key: StorageCategory,
  storage = getBrowserStorage(),
): unknown {
  if (!storage) {
    return undefined
  }

  try {
    const storedValue = storage.getItem(storageKeys[key])
    return storedValue === null ? undefined : JSON.parse(storedValue)
  } catch {
    return undefined
  }
}

function safeWrite(
  key: StorageCategory,
  value: unknown,
  storage = getBrowserStorage(),
): boolean {
  if (!storage) {
    return false
  }

  try {
    storage.setItem(storageKeys[key], JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function safeRemove(
  key: StorageCategory,
  storage = getBrowserStorage(),
): boolean {
  if (!storage) {
    return false
  }

  try {
    storage.removeItem(storageKeys[key])
    return true
  } catch {
    return false
  }
}

function migrateFromVersion0(storage: Storage): boolean {
  const categories: Array<[StorageCategory, unknown]> = [
    ['settings', defaultSettings],
    ['sessions', []],
    ['attempts', []],
    ['mistakePatterns', []],
  ]

  for (const [category, fallback] of categories) {
    try {
      if (storage.getItem(storageKeys[category]) === null) {
        safeWrite(category, fallback, storage)
      }
    } catch {
      return false
    }
  }

  return safeWrite('version', STORAGE_VERSION, storage)
}

export function runStorageMigrations(storage = getBrowserStorage()): boolean {
  if (!storage) {
    return false
  }

  const storedVersion = safeRead('version', storage)

  if (storedVersion === STORAGE_VERSION) {
    return true
  }

  if (storedVersion === undefined || storedVersion === 0) {
    return migrateFromVersion0(storage)
  }

  // Unknown future versions are left untouched to avoid destructive downgrades.
  return false
}

export function initializeStorage(storage = getBrowserStorage()): boolean {
  return runStorageMigrations(storage)
}

export function sanitizeSettings(value: unknown): ApplicationSettings {
  if (!isRecord(value)) {
    return {
      ...defaultSettings,
      defaultOperations: [...defaultSettings.defaultOperations],
    }
  }

  const operations = Array.isArray(value.defaultOperations)
    ? value.defaultOperations.filter(isMathOperation)
    : []

  return {
    soundEffectsEnabled:
      typeof value.soundEffectsEnabled === 'boolean'
        ? value.soundEffectsEnabled
        : defaultSettings.soundEffectsEnabled,
    cardAnimationEnabled:
      typeof value.cardAnimationEnabled === 'boolean'
        ? value.cardAnimationEnabled
        : defaultSettings.cardAnimationEnabled,
    showExplanations:
      typeof value.showExplanations === 'boolean'
        ? value.showExplanations
        : defaultSettings.showExplanations,
    encouragingFeedbackEnabled:
      typeof value.encouragingFeedbackEnabled === 'boolean'
        ? value.encouragingFeedbackEnabled
        : defaultSettings.encouragingFeedbackEnabled,
    mistakeMasteryThreshold:
      Number.isInteger(value.mistakeMasteryThreshold) &&
      Number(value.mistakeMasteryThreshold) > 0
        ? Number(value.mistakeMasteryThreshold)
        : defaultSettings.mistakeMasteryThreshold,
    defaultOperations:
      operations.length > 0
        ? operations
        : [...defaultSettings.defaultOperations],
    defaultDifficulty: isDifficulty(value.defaultDifficulty)
      ? value.defaultDifficulty
      : defaultSettings.defaultDifficulty,
    defaultSessionLength: isSessionLength(value.defaultSessionLength)
      ? value.defaultSessionLength
      : defaultSettings.defaultSessionLength,
  }
}

export function loadSettings(
  storage = getBrowserStorage(),
): ApplicationSettings {
  return sanitizeSettings(safeRead('settings', storage))
}

export function saveSettings(
  settings: ApplicationSettings,
  storage = getBrowserStorage(),
): boolean {
  return safeWrite('settings', sanitizeSettings(settings), storage)
}

export function loadSessions(storage = getBrowserStorage()): PracticeSession[] {
  const value = safeRead('sessions', storage)
  return Array.isArray(value)
    ? value.filter(isPracticeSession).slice(0, MAX_STORED_SESSIONS)
    : []
}

export function loadAttempts(storage = getBrowserStorage()): PracticeAttempt[] {
  const value = safeRead('attempts', storage)
  return Array.isArray(value)
    ? value.filter(isPracticeAttempt).slice(0, MAX_STORED_ATTEMPTS)
    : []
}

export function loadMistakePatterns(
  storage = getBrowserStorage(),
): MistakePattern[] {
  const value = safeRead('mistakePatterns', storage)
  return Array.isArray(value) ? value.filter(isMistakePattern) : []
}

export function saveMistakePatterns(
  patterns: MistakePattern[],
  storage = getBrowserStorage(),
): boolean {
  return safeWrite(
    'mistakePatterns',
    patterns.filter(isMistakePattern),
    storage,
  )
}

export function saveCompletedSession(
  session: PracticeSession,
  storage = getBrowserStorage(),
): boolean {
  if (!session.completedAt || !isPracticeSession(session)) {
    return false
  }

  const sessions = [
    session,
    ...loadSessions(storage).filter((stored) => stored.id !== session.id),
  ].slice(0, MAX_STORED_SESSIONS)
  const attemptIds = new Set(session.attempts.map((attempt) => attempt.id))
  const attempts = [
    ...session.attempts,
    ...loadAttempts(storage).filter((attempt) => !attemptIds.has(attempt.id)),
  ].slice(0, MAX_STORED_ATTEMPTS)

  const sessionsSaved = safeWrite('sessions', sessions, storage)
  const attemptsSaved = safeWrite('attempts', attempts, storage)
  const summarySaved = safeWrite('lastSummarySessionId', session.id, storage)
  return sessionsSaved && attemptsSaved && summarySaved
}

export function loadSession(
  sessionId: string,
  storage = getBrowserStorage(),
): PracticeSession | undefined {
  return loadSessions(storage).find((session) => session.id === sessionId)
}

export function loadLastSummarySessionId(
  storage = getBrowserStorage(),
): string | undefined {
  const value = safeRead('lastSummarySessionId', storage)
  return typeof value === 'string' ? value : undefined
}

export function isActiveSessionSnapshot(
  value: unknown,
): value is ActiveSessionSnapshot {
  if (!isRecord(value)) {
    return false
  }

  if (
    !isPracticeSession(value.session) ||
    !isRecord(value.currentQuestion) ||
    typeof value.isRevealed !== 'boolean' ||
    !(value.selectedAnswer === null || Number.isInteger(value.selectedAnswer))
  ) {
    return false
  }

  try {
    const question = value.currentQuestion as unknown as Question
    return (
      validateQuestion(question) &&
      (value.selectedAnswer === null ||
        question.choices.includes(Number(value.selectedAnswer))) &&
      (!value.isRevealed || value.selectedAnswer !== null)
    )
  } catch {
    return false
  }
}

export function loadActiveSession(
  storage = getBrowserStorage(),
): ActiveSessionSnapshot | undefined {
  const value = safeRead('activeSession', storage)
  return isActiveSessionSnapshot(value) ? value : undefined
}

export function saveActiveSession(
  snapshot: ActiveSessionSnapshot,
  storage = getBrowserStorage(),
): boolean {
  return isActiveSessionSnapshot(snapshot)
    ? safeWrite('activeSession', snapshot, storage)
    : false
}

export function clearActiveSession(storage = getBrowserStorage()): boolean {
  return safeRemove('activeSession', storage)
}

export function resetPracticeHistory(storage = getBrowserStorage()): boolean {
  const categories: StorageCategory[] = [
    'sessions',
    'attempts',
    'mistakePatterns',
    'lastSummarySessionId',
  ]

  return categories
    .map((category) => safeRemove(category, storage))
    .every(Boolean)
}

export function clearAllApplicationData(
  storage = getBrowserStorage(),
): boolean {
  if (!storage) {
    return false
  }

  const cleared = (Object.keys(storageKeys) as StorageCategory[])
    .map((category) => safeRemove(category, storage))
    .every(Boolean)

  return cleared && initializeStorage(storage)
}
