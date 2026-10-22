import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AppRoutes } from '../components/App'
import { saveCompletedSession } from '../services/storage'
import type { PracticeSession } from '../types'

function createSession(): PracticeSession {
  const sessionId = 'summary-session'
  const attempts = [true, true, false, true].map((isCorrect, index) => ({
    id: `attempt-${index}`,
    questionId: `question-${index}`,
    sessionId,
    operation: 'addition' as const,
    firstOperand: 2,
    secondOperand: 2,
    correctAnswer: 4,
    selectedAnswer: isCorrect ? 4 : 5,
    isCorrect,
    difficulty: 2 as const,
    source: 'regular' as const,
    timestamp: `2026-01-01T00:0${index}:00.000Z`,
  }))

  return {
    id: sessionId,
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:05:00.000Z',
    operations: ['addition', 'multiplication'],
    difficulty: 2,
    sessionLength: 5,
    mode: 'regular',
    attemptedCount: 4,
    correctCount: 3,
    incorrectCount: 1,
    attempts,
  }
}

function renderSummary() {
  return render(
    <MemoryRouter initialEntries={['/practice/summary']}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('SessionSummaryPage', () => {
  it('reloads the last summary from storage with accurate values', () => {
    saveCompletedSession(createSession())
    renderSummary()

    expect(
      screen.getByRole('heading', { name: 'Session Summary' }),
    ).toBeInTheDocument()

    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('Addition, Multiplication')).toBeInTheDocument()
    expect(screen.getByText('Easy')).toBeInTheDocument()
    expect(screen.getByText('5 questions')).toBeInTheDocument()
  })

  it('provides all summary actions and disables mistake practice', async () => {
    const user = userEvent.setup()
    saveCompletedSession(createSession())
    renderSummary()

    expect(
      screen.getByRole('button', { name: 'Practice Mistakes' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('link', { name: 'Change Settings' }),
    ).toHaveAttribute('href', '/practice/setup')
    expect(
      screen.getByRole('link', { name: 'View Statistics' }),
    ).toHaveAttribute('href', '/statistics')
    expect(screen.getByRole('link', { name: 'Return Home' })).toHaveAttribute(
      'href',
      '/',
    )

    await user.click(screen.getByRole('button', { name: 'Practice Again' }))
    expect(
      screen.getByRole('heading', { name: 'Question 1 of 5' }),
    ).toBeInTheDocument()
  })

  it('shows a safe empty state when summary data is unavailable', () => {
    renderSummary()

    const card = screen
      .getByRole('heading', { name: 'Session summary unavailable' })
      .closest('section')
    expect(card).not.toBeNull()
    expect(
      within(card!).getByRole('link', { name: 'Start Practice' }),
    ).toHaveAttribute('href', '/practice/setup')
  })
})
