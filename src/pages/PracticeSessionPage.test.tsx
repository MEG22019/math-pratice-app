import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AppRoutes } from '../components/App'
import type { PracticeSetupConfiguration } from '../types'

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
})
