import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppRoutes } from '../components/App'
import {
  defaultSettings,
  loadAttempts,
  loadSessions,
  loadSettings,
  saveCompletedSession,
  saveMistakePatterns,
  saveSettings,
} from '../services/storage'
import type { PracticeAttempt, PracticeSession } from '../types'

function createSession(
  id: string,
  completedAt: string,
  operation: PracticeAttempt['operation'],
  difficulty: PracticeAttempt['difficulty'],
  isCorrect: boolean,
): PracticeSession {
  const attempt: PracticeAttempt = {
    id: `attempt-${id}`,
    questionId: `question-${id}`,
    sessionId: id,
    operation,
    firstOperand: 8,
    secondOperand: 2,
    correctAnswer: 4,
    selectedAnswer: isCorrect ? 4 : 5,
    isCorrect,
    difficulty,
    source: 'regular',
    timestamp: completedAt,
  }

  return {
    id,
    startedAt: completedAt,
    completedAt,
    operations: [operation],
    difficulty,
    sessionLength: 5,
    mode: 'regular',
    attemptedCount: 1,
    correctCount: isCorrect ? 1 : 0,
    incorrectCount: isCorrect ? 0 : 1,
    attempts: [attempt],
  }
}

function renderStatistics() {
  return render(
    <MemoryRouter initialEntries={['/statistics']}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('StatisticsPage', () => {
  it('shows a useful empty state when no questions were attempted', () => {
    renderStatistics()

    expect(
      screen.getByRole('heading', { name: 'Your progress starts here' }),
    ).toBeInTheDocument()
  })

  it('displays totals, every breakdown category, and newest sessions first', () => {
    saveCompletedSession(
      createSession('older', '2026-01-01T12:00:00.000Z', 'addition', 1, true),
    )
    saveCompletedSession(
      createSession('newer', '2026-02-01T12:00:00.000Z', 'division', 4, false),
    )

    renderStatistics()

    const overall = screen.getByRole('heading', { name: 'Your totals' })
      .nextElementSibling as HTMLElement
    expect(within(overall).getByText('2')).toBeInTheDocument()
    expect(within(overall).getByText('50%')).toBeInTheDocument()
    const operationSection = screen
      .getByRole('heading', { name: 'By operation' })
      .closest('section')!
    for (const heading of [
      'Addition',
      'Subtraction',
      'Multiplication',
      'Division',
    ]) {
      expect(
        within(operationSection).getByRole('heading', { name: heading }),
      ).toBeInTheDocument()
    }
    const difficultySection = screen
      .getByRole('heading', { name: 'By difficulty' })
      .closest('section')!
    for (const heading of ['Beginner', 'Easy', 'Intermediate', 'Advanced']) {
      expect(
        within(difficultySection).getByRole('heading', { name: heading }),
      ).toBeInTheDocument()
    }

    const recent = screen.getByRole('heading', { name: 'Recent sessions' })
      .nextElementSibling as HTMLElement
    const sessionHeadings = within(recent).getAllByRole('heading', { level: 3 })
    expect(sessionHeadings.map((heading) => heading.textContent)).toEqual([
      'Division',
      'Addition',
    ])
  })

  it('resets history after confirmation without changing settings', async () => {
    const user = userEvent.setup()
    const settings = { ...defaultSettings, showExplanations: false }
    saveSettings(settings)
    saveCompletedSession(
      createSession(
        'session',
        '2026-02-01T12:00:00.000Z',
        'division',
        4,
        false,
      ),
    )
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderStatistics()

    await user.click(screen.getByRole('button', { name: 'Reset Statistics' }))

    expect(loadSessions()).toEqual([])
    expect(loadAttempts()).toEqual([])
    expect(loadSettings()).toEqual(settings)
    expect(
      screen.getByRole('heading', { name: 'Your progress starts here' }),
    ).toBeInTheDocument()
  })

  it('shows mistake totals, frequent areas, and active/mastered views', async () => {
    const user = userEvent.setup()
    saveCompletedSession(
      createSession(
        'session',
        '2026-02-01T12:00:00.000Z',
        'division',
        2,
        false,
      ),
    )
    saveMistakePatterns([
      {
        id: 'active',
        operation: 'division',
        firstOperand: 12,
        secondOperand: 3,
        correctAnswer: 4,
        difficulty: 2,
        incorrectCount: 4,
        similarCorrectCount: 1,
        lastIncorrectAt: '2026-02-01T12:00:00.000Z',
        isMastered: false,
      },
      {
        id: 'mastered',
        operation: 'addition',
        firstOperand: 5,
        secondOperand: 5,
        correctAnswer: 10,
        difficulty: 1,
        incorrectCount: 2,
        similarCorrectCount: 3,
        lastIncorrectAt: '2026-01-01T12:00:00.000Z',
        isMastered: true,
      },
    ])
    renderStatistics()

    expect(
      screen.getByRole('heading', { name: 'Mistake progress' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Most-missed operations')).toBeInTheDocument()
    const details = screen
      .getByRole('group', { name: 'Mistake views' })
      .closest('.mistake-details') as HTMLElement
    expect(within(details).getByText('12 ÷ 3 = 4')).toBeInTheDocument()
    expect(within(details).queryByText('5 + 5 = 10')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mastered (1)' }))
    expect(within(details).getByText('5 + 5 = 10')).toBeInTheDocument()
    expect(within(details).queryByText('12 ÷ 3 = 4')).not.toBeInTheDocument()
  })
})
