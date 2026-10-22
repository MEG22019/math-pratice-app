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
      screen.getByRole('heading', { name: 'Great work!' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('You finished all 5 questions.'),
    ).toBeInTheDocument()
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
      screen.getByRole('heading', { name: 'Great work!' }),
    ).toBeInTheDocument()
    expect(screen.getByText('You ended after 1 question.')).toBeInTheDocument()
  })
})
