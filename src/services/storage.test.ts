import { beforeEach, describe, expect, it } from 'vitest'

import { generateQuestion } from '../features/questions'
import type {
  ApplicationSettings,
  PracticeAttempt,
  PracticeSession,
} from '../types'
import {
  clearActiveSession,
  defaultSettings,
  initializeStorage,
  loadActiveSession,
  loadAttempts,
  loadSessions,
  loadSettings,
  MAX_STORED_SESSIONS,
  runStorageMigrations,
  sanitizeSettings,
  saveActiveSession,
  saveCompletedSession,
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
})
