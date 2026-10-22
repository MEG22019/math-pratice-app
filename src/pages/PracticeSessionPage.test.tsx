import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppRoutes } from '../components/App'
import {
  defaultSettings,
  loadMistakePatterns,
  saveMistakePatterns,
  saveSettings,
} from '../services/storage'
import type { MistakePattern, PracticeSetupConfiguration } from '../types'

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderSession(configuration: PracticeSetupConfiguration) {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/practice/session',
          state: { configuration },
        },
      ]}
    >
      <AppRoutes />
    </MemoryRouter>,
  )
}

function renderSessionRoute() {
  return render(
    <MemoryRouter initialEntries={['/practice/session']}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

async function tabTo(
  user: ReturnType<typeof userEvent.setup>,
  element: HTMLElement,
) {
  for (let attempts = 0; attempts < 20; attempts += 1) {
    if (document.activeElement === element) {
      return
    }
    await user.tab()
  }

  expect(element).toHaveFocus()
}

describe('PracticeSessionPage', () => {
  it('runs a complete fixed-length practice session', async () => {
    const user = userEvent.setup()
    renderSession({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
      mode: 'regular',
    })

    for (let questionNumber = 1; questionNumber <= 5; questionNumber += 1) {
      expect(
        screen.getByRole('heading', {
          name: `Question ${questionNumber} of 5`,
        }),
      ).toBeInTheDocument()
      await user.click(screen.getAllByRole('button', { name: /^Answer / })[0])
      await user.click(screen.getByRole('button', { name: 'Check My Answer' }))
      await user.click(screen.getByRole('button', { name: 'I Got It Right' }))
    }

    expect(
      await screen.findByRole('heading', { name: 'Session Summary' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('5', { selector: 'dd' })).toHaveLength(2)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('runs a complete session using only the keyboard', async () => {
    const user = userEvent.setup()
    renderSession({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
      mode: 'regular',
    })

    for (let questionNumber = 1; questionNumber <= 5; questionNumber += 1) {
      await user.keyboard('1')
      const checkButton = screen.getByRole('button', {
        name: 'Check My Answer',
      })
      await tabTo(user, checkButton)
      await user.keyboard('{Enter}')

      const rightButton = screen.getByRole('button', {
        name: 'I Got It Right',
      })
      await tabTo(user, rightButton)
      await user.keyboard('{Enter}')
    }

    expect(
      await screen.findByRole('heading', { name: 'Session Summary' }),
    ).toBeInTheDocument()
  })

  it('announces question changes and exposes readable progress', () => {
    renderSession({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
      mode: 'regular',
    })

    expect(
      screen.getByText(/Question 1\..*Choose from four answers/),
    ).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '0 of 5 questions completed',
    )
  })

  it('disables card motion when the browser requests reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    const { container } = renderSession({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
      mode: 'regular',
    })

    expect(container.querySelector('.question-card')).toHaveClass(
      'question-card--no-animation',
    )
  })

  it('updates continuous progress and totals', async () => {
    const user = userEvent.setup()
    renderSession({
      operations: ['addition', 'multiplication'],
      difficulty: 2,
      sessionLength: 'continuous',
      mode: 'regular',
    })

    await user.click(screen.getAllByRole('button', { name: /^Answer / })[0])
    await user.click(screen.getByRole('button', { name: 'Check My Answer' }))
    await user.click(screen.getByRole('button', { name: 'I Got It Wrong' }))

    expect(
      screen.getByRole('heading', { name: 'Question 2' }),
    ).toBeInTheDocument()
    expect(screen.getByText('1 completed · Keep going!')).toBeInTheDocument()
    expect(screen.getByText(/Addition, Multiplication/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'End Session' }))
    expect(
      await screen.findByRole('heading', { name: 'Session Summary' }),
    ).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('restores the active question and revealed card after a refresh', async () => {
    const user = userEvent.setup()
    const rendered = renderSession({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 'continuous',
      mode: 'regular',
    })

    const selectedChoice = screen.getAllByRole('button', {
      name: /^Answer /,
    })[0]
    const selectedAnswer = selectedChoice
      .getAttribute('aria-label')!
      .replace('Answer ', '')
    await user.click(selectedChoice)
    await user.click(screen.getByRole('button', { name: 'Check My Answer' }))
    expect(screen.getByText('Correct answer')).toBeInTheDocument()

    rendered.unmount()
    renderSessionRoute()

    expect(screen.getByRole('heading', { name: / = / })).toBeInTheDocument()
    expect(screen.getByText('Correct answer')).toBeInTheDocument()
    expect(
      screen.getAllByText(selectedAnswer, { selector: 'strong' }).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('applies animation, explanation, and feedback preferences', async () => {
    const user = userEvent.setup()
    saveSettings({
      ...defaultSettings,
      cardAnimationEnabled: false,
      showExplanations: false,
      encouragingFeedbackEnabled: false,
    })
    const { container } = renderSession({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 'continuous',
      mode: 'regular',
    })

    expect(container.querySelector('.question-card')).toHaveClass(
      'question-card--no-animation',
    )
    await user.click(screen.getAllByRole('button', { name: /^Answer / })[0])
    await user.click(screen.getByRole('button', { name: 'Check My Answer' }))
    expect(screen.queryByText(/ equals /)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'I Got It Right' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('records an incorrect regular-practice question as a saved mistake', async () => {
    const user = userEvent.setup()
    renderSession({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 'continuous',
      mode: 'regular',
    })

    await user.click(screen.getAllByRole('button', { name: /^Answer / })[0])
    await user.click(screen.getByRole('button', { name: 'Check My Answer' }))
    await user.click(screen.getByRole('button', { name: 'I Got It Wrong' }))

    expect(loadMistakePatterns()).toHaveLength(1)
    expect(loadMistakePatterns()[0]).toMatchObject({
      incorrectCount: 1,
      similarCorrectCount: 0,
      isMastered: false,
    })
  })

  it('runs mistake review and completes when the last pattern is mastered', async () => {
    const user = userEvent.setup()
    const mistake: MistakePattern = {
      id: 'mistake-1',
      operation: 'addition',
      firstOperand: 3,
      secondOperand: 4,
      correctAnswer: 7,
      difficulty: 1,
      incorrectCount: 2,
      similarCorrectCount: 0,
      lastIncorrectAt: '2026-01-01T00:00:00.000Z',
      isMastered: false,
    }
    saveMistakePatterns([mistake])
    saveSettings({ ...defaultSettings, mistakeMasteryThreshold: 1 })
    renderSession({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 10,
      mode: 'mistake-review',
    })

    expect(screen.getByText(/Addition · Beginner/)).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /^Answer / })[0])
    await user.click(screen.getByRole('button', { name: 'Check My Answer' }))
    await user.click(screen.getByRole('button', { name: 'I Got It Right' }))

    expect(
      await screen.findByRole('heading', { name: 'Session Summary' }),
    ).toBeInTheDocument()
    expect(loadMistakePatterns()[0]).toMatchObject({
      similarCorrectCount: 1,
      isMastered: true,
    })
    expect(screen.getByText('Mistake review')).toBeInTheDocument()
  })
})
