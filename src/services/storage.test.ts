import { beforeEach, describe, expect, it } from 'vitest'

import { generateQuestion } from '../features/questions'
import { calculateStatistics } from '../features/statistics/statistics'
import type {
  ApplicationSettings,
  PracticeAttempt,
  PracticeSession,
} from '../types'
import {
  clearActiveSession,
  clearAllApplicationData,
  defaultSettings,
  getStorageUsage,
  initializeStorage,
  initializeStorageWithReport,
  loadActiveSession,
  loadArchivedStatistics,
  loadAttempts,
  loadMistakePatterns,
  loadSessions,
  loadSettings,
  MAX_STORED_ATTEMPTS,
  MAX_STORED_SESSION_ATTEMPTS,
  MAX_STORED_SESSIONS,
  resetPracticeHistory,
  runStorageMigrations,
  sanitizeSettings,
  saveActiveSession,
  saveCompletedSession,
  saveMistakePatterns,
  saveSettings,
  STORAGE_VERSION,
  storageKeys,
} from './storage'

function createCompletedSession(id = 'session-1'): PracticeSession {
  const attempt: PracticeAttempt = {
    id: `attempt-${id}`,
    questionId: `question-${id}`,
    sessionId: id,
    operation: 'addition',
    firstOperand: 2,
    secondOperand: 3,
    correctAnswer: 5,
    selectedAnswer: 5,
    isCorrect: true,
    difficulty: 1,
    source: 'regular',
    timestamp: '2026-01-01T00:01:00.000Z',
  }

  return {
    id,
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:01:00.000Z',
    operations: ['addition'],
    difficulty: 1,
    sessionLength: 5,
    mode: 'regular',
    attemptedCount: 1,
    correctCount: 1,
    incorrectCount: 0,
    attempts: [attempt],
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe('storage initialization and settings', () => {
  it('initializes versioned storage categories', () => {
    expect(initializeStorage()).toBe(true)
    expect(JSON.parse(localStorage.getItem(storageKeys.version)!)).toBe(
      STORAGE_VERSION,
    )
    expect(loadSettings()).toEqual(defaultSettings)
    expect(loadSessions()).toEqual([])
    expect(loadAttempts()).toEqual([])
  })

  it('sanitizes invalid setting fields independently', () => {
    const sanitized = sanitizeSettings({
      soundEffectsEnabled: true,
      cardAnimationEnabled: 'not-a-boolean',
      showExplanations: false,
      encouragingFeedbackEnabled: true,
      mistakeMasteryThreshold: -1,
      defaultOperations: ['division', 'invalid'],
      defaultDifficulty: 9,
      defaultSessionLength: 20,
    })

    expect(sanitized).toEqual({
      ...defaultSettings,
      soundEffectsEnabled: true,
      showExplanations: false,
      defaultOperations: ['division'],
      defaultSessionLength: 20,
    })
  })

  it('saves and reloads valid settings', () => {
    const settings: ApplicationSettings = {
      ...defaultSettings,
      defaultOperations: ['multiplication', 'division'],
      defaultDifficulty: 3,
      defaultSessionLength: 20,
    }

    expect(saveSettings(settings)).toBe(true)
    expect(loadSettings()).toEqual(settings)
  })

  it('repairs invalid categories independently and reports the recovery', () => {
    expect(initializeStorage()).toBe(true)
    const validSettings = { ...defaultSettings, defaultDifficulty: 4 as const }
    saveSettings(validSettings)
    localStorage.setItem(storageKeys.sessions, '{broken json')
    localStorage.setItem(
      storageKeys.attempts,
      JSON.stringify([{ id: 'invalid-attempt' }]),
    )
    localStorage.setItem(
      storageKeys.archivedStatistics,
      JSON.stringify({ attempted: -1 }),
    )
    localStorage.setItem(
      storageKeys.mistakePatterns,
      JSON.stringify([{ id: 'invalid-pattern' }]),
    )
    localStorage.setItem(
      storageKeys.activeSession,
      JSON.stringify({ session: 'invalid' }),
    )

    const report = initializeStorageWithReport()

    expect(report).toEqual({
      recoveredCategories: [
        'sessions',
        'attempts',
        'archivedStatistics',
        'mistakePatterns',
        'activeSession',
      ],
      storageAvailable: true,
      succeeded: true,
    })
    expect(loadSettings()).toEqual(validSettings)
    expect(loadSessions()).toEqual([])
    expect(loadAttempts()).toEqual([])
    expect(loadMistakePatterns()).toEqual([])
    expect(localStorage.getItem(storageKeys.activeSession)).toBeNull()
  })

  it('recovers invalid settings without clearing valid history', () => {
    expect(initializeStorage()).toBe(true)
    const session = createCompletedSession()
    saveCompletedSession(session)
    localStorage.setItem(
      storageKeys.settings,
      JSON.stringify({ defaultDifficulty: 99 }),
    )

    const report = initializeStorageWithReport()

    expect(report.recoveredCategories).toEqual(['settings'])
    expect(loadSettings()).toEqual(defaultSettings)
    expect(loadSessions()).toEqual([session])
  })
})

describe('history persistence', () => {
  it('saves sessions and attempts without duplicating them', () => {
    const session = createCompletedSession()

    expect(saveCompletedSession(session)).toBe(true)
    expect(saveCompletedSession(session)).toBe(true)
    expect(loadSessions()).toEqual([session])
    expect(loadAttempts()).toEqual(session.attempts)
  })

  it('filters invalid records without damaging another category', () => {
    const settings = { ...defaultSettings, defaultDifficulty: 4 as const }
    saveSettings(settings)
    localStorage.setItem(storageKeys.sessions, '{broken json')
    localStorage.setItem(
      storageKeys.attempts,
      JSON.stringify([{ id: 'invalid attempt' }]),
    )

    expect(loadSessions()).toEqual([])
    expect(loadAttempts()).toEqual([])
    expect(loadSettings()).toEqual(settings)
  })

  it('limits stored raw sessions', () => {
    for (let index = 0; index < MAX_STORED_SESSIONS + 5; index += 1) {
      saveCompletedSession(createCompletedSession(`session-${index}`))
    }

    expect(loadSessions()).toHaveLength(MAX_STORED_SESSIONS)
    expect(loadSessions()[0].id).toBe(`session-${MAX_STORED_SESSIONS + 4}`)
  })

  it('caps large raw histories while preserving archived statistics', () => {
    const sessionId = 'large-session'
    const attempts: PracticeAttempt[] = Array.from(
      { length: MAX_STORED_ATTEMPTS + 5 },
      (_, index) => ({
        id: `large-attempt-${index}`,
        questionId: `large-question-${index}`,
        sessionId,
        operation: 'addition',
        firstOperand: 2,
        secondOperand: 3,
        correctAnswer: 5,
        selectedAnswer: 5,
        isCorrect: true,
        difficulty: 1,
        source: 'regular',
        timestamp: new Date(Date.UTC(2026, 0, 1, 0, 0, 0, index)).toISOString(),
      }),
    )
    const session: PracticeSession = {
      id: sessionId,
      startedAt: attempts[0].timestamp,
      completedAt: attempts.at(-1)!.timestamp,
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 'continuous',
      mode: 'regular',
      attemptedCount: attempts.length,
      correctCount: attempts.length,
      incorrectCount: 0,
      attempts,
    }

    expect(saveCompletedSession(session)).toBe(true)

    const rawAttempts = loadAttempts()
    const archive = loadArchivedStatistics()
    expect(rawAttempts).toHaveLength(MAX_STORED_ATTEMPTS)
    expect(loadSessions()[0].attempts).toHaveLength(MAX_STORED_SESSION_ATTEMPTS)
    expect(archive).toMatchObject({ attempted: 5, correct: 5, incorrect: 0 })
    expect(calculateStatistics(rawAttempts, [], archive)).toMatchObject({
      attempted: MAX_STORED_ATTEMPTS + 5,
      correct: MAX_STORED_ATTEMPTS + 5,
      incorrect: 0,
    })
  })

  it('measures application storage usage', () => {
    initializeStorage()
    saveCompletedSession(createCompletedSession())

    const usage = getStorageUsage()

    expect(usage?.bytes).toBeGreaterThan(0)
    expect(usage?.kilobytes).toBeGreaterThan(0)
  })

  it('resets practice history while preserving settings', () => {
    const settings = { ...defaultSettings, showExplanations: false }
    saveSettings(settings)
    saveCompletedSession(createCompletedSession())

    expect(resetPracticeHistory()).toBe(true)
    expect(loadSessions()).toEqual([])
    expect(loadAttempts()).toEqual([])
    expect(loadSettings()).toEqual(settings)
  })

  it('clears every application category and restores defaults', () => {
    saveSettings({ ...defaultSettings, defaultDifficulty: 4 })
    saveCompletedSession(createCompletedSession())
    localStorage.setItem(
      storageKeys.activeSession,
      JSON.stringify({ invalid: true }),
    )

    expect(clearAllApplicationData()).toBe(true)
    expect(loadSettings()).toEqual(defaultSettings)
    expect(loadSessions()).toEqual([])
    expect(loadAttempts()).toEqual([])
    expect(localStorage.getItem(storageKeys.activeSession)).toBeNull()
  })

  it('persists valid mistake patterns and filters malformed records', () => {
    const validPattern = {
      id: 'mistake-1',
      operation: 'subtraction' as const,
      firstOperand: 9,
      secondOperand: 4,
      correctAnswer: 5,
      difficulty: 2 as const,
      incorrectCount: 2,
      similarCorrectCount: 1,
      lastIncorrectAt: '2026-01-01T00:00:00.000Z',
      isMastered: false,
    }

    expect(saveMistakePatterns([validPattern])).toBe(true)
    expect(loadMistakePatterns()).toEqual([validPattern])
    localStorage.setItem(
      storageKeys.mistakePatterns,
      JSON.stringify([validPattern, { id: 'bad' }]),
    )
    expect(loadMistakePatterns()).toEqual([validPattern])
  })
})

describe('active-session persistence', () => {
  it('round-trips and clears a validated active snapshot', () => {
    const session = createCompletedSession()
    delete session.completedAt
    const currentQuestion = generateQuestion('addition', 1)
    const snapshot = {
      session,
      currentQuestion,
      selectedAnswer: currentQuestion.choices[0],
      isRevealed: true,
    }

    expect(saveActiveSession(snapshot)).toBe(true)
    expect(loadActiveSession()).toEqual(snapshot)
    expect(clearActiveSession()).toBe(true)
    expect(loadActiveSession()).toBeUndefined()
  })

  it('rejects malformed snapshots safely', () => {
    localStorage.setItem(
      storageKeys.activeSession,
      JSON.stringify({ session: 'invalid' }),
    )

    expect(loadActiveSession()).toBeUndefined()
  })

  it('rejects completed and internally inconsistent active snapshots', () => {
    const completedSession = createCompletedSession()
    const currentQuestion = generateQuestion('addition', 1)

    expect(
      saveActiveSession({
        session: completedSession,
        currentQuestion,
        selectedAnswer: null,
        isRevealed: false,
      }),
    ).toBe(false)

    delete completedSession.completedAt
    expect(
      saveActiveSession({
        session: { ...completedSession, difficulty: 2 },
        currentQuestion,
        selectedAnswer: null,
        isRevealed: false,
      }),
    ).toBe(false)
  })
})

describe('storage failure handling', () => {
  it('handles unavailable or quota-limited storage', () => {
    const failingStorage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('Storage full', 'QuotaExceededError')
      },
      removeItem: () => {
        throw new DOMException('Unavailable', 'SecurityError')
      },
    } as unknown as Storage

    expect(initializeStorage(failingStorage)).toBe(false)
    expect(saveSettings(defaultSettings, failingStorage)).toBe(false)
    expect(loadSettings(failingStorage)).toEqual(defaultSettings)
    expect(clearActiveSession(failingStorage)).toBe(false)
  })

  it('does not overwrite an unknown future schema', () => {
    localStorage.setItem(storageKeys.version, JSON.stringify(99))
    localStorage.setItem('unrelated-key', 'keep-me')

    expect(runStorageMigrations()).toBe(false)
    expect(localStorage.getItem(storageKeys.version)).toBe('99')
    expect(localStorage.getItem('unrelated-key')).toBe('keep-me')
  })

  it('migrates version 1 data with an empty statistics archive', () => {
    localStorage.setItem(storageKeys.version, JSON.stringify(1))
    localStorage.setItem(storageKeys.settings, JSON.stringify(defaultSettings))
    localStorage.setItem(storageKeys.sessions, JSON.stringify([]))
    localStorage.setItem(storageKeys.attempts, JSON.stringify([]))
    localStorage.setItem(storageKeys.mistakePatterns, JSON.stringify([]))

    expect(runStorageMigrations()).toBe(true)
    expect(JSON.parse(localStorage.getItem(storageKeys.version)!)).toBe(
      STORAGE_VERSION,
    )
    expect(loadArchivedStatistics()).toEqual({
      attempted: 0,
      correct: 0,
      incorrect: 0,
      byOperation: {
        addition: { attempted: 0, correct: 0, incorrect: 0 },
        subtraction: { attempted: 0, correct: 0, incorrect: 0 },
        multiplication: { attempted: 0, correct: 0, incorrect: 0 },
        division: { attempted: 0, correct: 0, incorrect: 0 },
      },
      byDifficulty: {
        1: { attempted: 0, correct: 0, incorrect: 0 },
        2: { attempted: 0, correct: 0, incorrect: 0 },
        3: { attempted: 0, correct: 0, incorrect: 0 },
        4: { attempted: 0, correct: 0, incorrect: 0 },
      },
      reviewAttempted: 0,
      reviewCorrect: 0,
    })
  })
})
