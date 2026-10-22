import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AppRoutes } from '../components/App'
import {
  defaultSettings,
  loadSettings,
  saveMistakePatterns,
  saveSettings,
} from '../services/storage'

function renderSetup() {
  return render(
    <MemoryRouter initialEntries={['/practice/setup']}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('Practice Setup', () => {
  it('starts with Addition, Beginner, and 10 questions selected', () => {
    renderSetup()

    expect(screen.getByRole('checkbox', { name: 'Addition' })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Beginner/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /10.*Just right/i })).toBeChecked()
  })

  it('supports selecting multiple operations and all operations', async () => {
    const user = userEvent.setup()
    renderSetup()

    await user.click(screen.getByRole('checkbox', { name: 'Multiplication' }))

    expect(screen.getByRole('checkbox', { name: 'Addition' })).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Multiplication' }),
    ).toBeChecked()

    await user.click(
      screen.getByRole('button', { name: 'Select all operations' }),
    )

    for (const operation of [
      'Addition',
      'Subtraction',
      'Multiplication',
      'Division',
    ]) {
      expect(screen.getByRole('checkbox', { name: operation })).toBeChecked()
    }
  })

  it('requires at least one operation', async () => {
    const user = userEvent.setup()
    renderSetup()

    await user.click(screen.getByRole('checkbox', { name: 'Addition' }))

    expect(
      screen.getByText(/choose at least one math operation/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /start session/i }),
    ).toBeDisabled()
  })

  it('passes the selected configuration to the practice session', async () => {
    const user = userEvent.setup()
    renderSetup()

    await user.click(screen.getByRole('checkbox', { name: 'Multiplication' }))
    await user.click(screen.getByRole('radio', { name: /Advanced/i }))
    await user.click(screen.getByRole('radio', { name: /Continuous/i }))
    await user.click(screen.getByRole('button', { name: /start session/i }))

    expect(
      screen.getByRole('heading', { name: 'Question 1' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Addition, Multiplication · Advanced · Continuous practice',
      ),
    ).toBeInTheDocument()

    expect(loadSettings()).toMatchObject({
      defaultOperations: ['addition'],
      defaultDifficulty: 1,
      defaultSessionLength: 10,
    })
  })

  it('loads persisted practice defaults without overwriting them', () => {
    saveSettings({
      ...defaultSettings,
      defaultOperations: ['division'],
      defaultDifficulty: 4,
      defaultSessionLength: 20,
    })

    renderSetup()

    expect(screen.getByRole('checkbox', { name: 'Division' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Addition' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /Advanced/i })).toBeChecked()
    expect(
      screen.getByRole('radio', { name: /20.*Power practice/i }),
    ).toBeChecked()
  })

  it('enables mistake review for active saved patterns and hides chosen skill controls', async () => {
    const user = userEvent.setup()
    saveMistakePatterns([
      {
        id: 'mistake-1',
        operation: 'division',
        firstOperand: 12,
        secondOperand: 3,
        correctAnswer: 4,
        difficulty: 2,
        incorrectCount: 2,
        similarCorrectCount: 0,
        lastIncorrectAt: '2026-01-01T00:00:00.000Z',
        isMastered: false,
      },
    ])
    renderSetup()

    const reviewMode = screen.getByRole('radio', {
      name: /Practice Mistakes/i,
    })
    expect(reviewMode).toBeEnabled()
    await user.click(reviewMode)
    expect(
      screen.queryByText('What would you like to practice?'),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Start Session/i }))
    expect(screen.getByText(/Division · Easy/)).toBeInTheDocument()
  })
})
