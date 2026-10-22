import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppRoutes } from '../components/App'
import {
  defaultSettings,
  loadActiveSession,
  loadMistakePatterns,
  loadSessions,
  saveMistakePatterns,
  saveSettings,
} from '../services/storage'
import type { MistakePattern, PracticeSetupConfiguration } from '../types'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
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

  it('runs a complete mixed-operation session', async () => {
    const user = userEvent.setup()
    let randomCall = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      const positionWithinQuestion = randomCall % 6
      const questionNumber = Math.floor(randomCall / 6)
      randomCall += 1
      if (positionWithinQuestion === 0) {
        return questionNumber % 2 === 0 ? 0 : 0.999_999
      }
      return 0.5
    })
    renderSession({
      operations: ['addition', 'division'],
      difficulty: 1,
      sessionLength: 5,
      mode: 'regular',
    })
    const seenOperations = new Set<string>()

    for (let questionNumber = 1; questionNumber <= 5; questionNumber += 1) {
      const problem = screen.getByRole('heading', {
        level: 2,
        name: / = \?/,
      }).textContent
      if (problem?.includes('+')) seenOperations.add('addition')
      if (problem?.includes('÷')) seenOperations.add('division')

      await user.click(screen.getAllByRole('button', { name: /^Answer / })[0])
      await user.click(screen.getByRole('button', { name: 'Check My Answer' }))
      await user.click(screen.getByRole('button', { name: 'I Got It Right' }))
    }

    expect(seenOperations).toEqual(new Set(['addition', 'division']))
    expect(
      await screen.findByRole('heading', { name: 'Session Summary' }),
    ).toBeInTheDocument()
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

  it('protects application navigation and stops warning after ending', async () => {
    const user = userEvent.setup()
    renderSession({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
      mode: 'regular',
    })

    const unloadWhileActive = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(unloadWhileActive)
    expect(unloadWhileActive.defaultPrevented).toBe(true)

    await user.click(screen.getByRole('link', { name: 'Home' }))
    expect(
      screen.getByRole('heading', { name: 'Leave this practice session?' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Keep Practicing' }))
    expect(
      screen.getByRole('heading', { name: 'Question 1 of 5' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Home' }))
    await user.click(screen.getByRole('button', { name: 'End Session' }))

    expect(
      screen.getByRole('heading', { name: /math feels better/i }),
    ).toBeInTheDocument()
    expect(loadActiveSession()).toBeUndefined()
    expect(loadSessions()[0].completedAt).toBeDefined()
    const unloadAfterEnding = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(unloadAfterEnding)
    expect(unloadAfterEnding.defaultPrevented).toBe(false)
  })

  it('shows a friendly storage error without interrupting practice', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage full', 'QuotaExceededError')
    })

    renderSession({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
      mode: 'regular',
    })

    expect(
      await screen.findByRole('heading', {
        name: 'Progress could not be saved',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Question 1 of 5' }),
    ).toBeInTheDocument()
  })

  it('rejects invalid route configuration with safe next steps', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/practice/session',
            state: {
              configuration: {
                operations: [],
                difficulty: 99,
                sessionLength: 5,
                mode: 'regular',
              },
            },
          },
        ]}
      >
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: 'That practice setup is not valid',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Go to Practice Setup' }),
    ).toHaveAttribute('href', '/practice/setup')
    expect(screen.getByRole('link', { name: 'Return Home' })).toHaveAttribute(
      'href',
      '/',
    )
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
