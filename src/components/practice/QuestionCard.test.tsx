import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Question } from '../../types'
import { QuestionCard } from './QuestionCard'

const question: Question = {
  id: 'question-1',
  operation: 'addition',
  firstOperand: 7,
  secondOperand: 5,
  displayText: '7 + 5',
  correctAnswer: 12,
  choices: [10, 11, 12, 13],
  difficulty: 1,
  source: 'regular',
}

describe('QuestionCard', () => {
  it('shows four choices and requires a selection before reveal', async () => {
    const user = userEvent.setup()
    render(<QuestionCard question={question} onResult={vi.fn()} />)

    expect(screen.getAllByRole('button', { name: /^Answer / })).toHaveLength(4)
    const revealButton = screen.getByRole('button', {
      name: 'Check My Answer',
    })
    expect(revealButton).toBeDisabled()

    const selectedChoice = screen.getByRole('button', { name: 'Answer 11' })
    await user.click(selectedChoice)

    expect(selectedChoice).toHaveAttribute('aria-pressed', 'true')
    expect(revealButton).toBeEnabled()
  })

  it('reveals the selected and correct answers', async () => {
    const user = userEvent.setup()
    render(
      <QuestionCard showExplanation question={question} onResult={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Answer 11' }))
    await user.click(screen.getByRole('button', { name: 'Check My Answer' }))

    expect(screen.getByText('Your answer')).toBeInTheDocument()
    expect(screen.getByText('Correct answer')).toBeInTheDocument()
    expect(screen.getByText('7 + 5 equals 12.')).toBeInTheDocument()
  })

  it.each([
    ['I Got It Right', true],
    ['I Got It Wrong', false],
  ] as const)('submits %s once', async (buttonName, expectedResult) => {
    const user = userEvent.setup()
    const onResult = vi.fn()
    render(<QuestionCard question={question} onResult={onResult} />)

    await user.click(screen.getByRole('button', { name: 'Answer 10' }))
    await user.click(screen.getByRole('button', { name: 'Check My Answer' }))
    const resultButton = screen.getByRole('button', { name: buttonName })
    await user.click(resultButton)
    await user.click(resultButton)

    expect(onResult).toHaveBeenCalledOnce()
    expect(onResult).toHaveBeenCalledWith(expectedResult, 10)
  })

  it('can disable the reveal animation class', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <QuestionCard
        animationsEnabled={false}
        question={question}
        onResult={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Answer 12' }))
    await user.click(screen.getByRole('button', { name: 'Check My Answer' }))

    expect(container.firstChild).toHaveClass('question-card--no-animation')
    expect(container.firstChild).toHaveClass('question-card--revealed')
  })

  it('supports 1–4 keyboard shortcuts and announces the selection', async () => {
    const user = userEvent.setup()
    render(<QuestionCard question={question} onResult={vi.fn()} />)

    await user.keyboard('2')

    const selectedChoice = screen.getByRole('button', { name: 'Answer 11' })
    expect(selectedChoice).toHaveAttribute('aria-pressed', 'true')
    expect(selectedChoice).toHaveAttribute('aria-keyshortcuts', '2')
    expect(screen.getByText('Answer 11 selected.')).toBeInTheDocument()
  })

  it('ignores answer shortcuts while the student is typing', async () => {
    const user = userEvent.setup()
    render(
      <>
        <label>
          Notes
          <input />
        </label>
        <QuestionCard question={question} onResult={vi.fn()} />
      </>,
    )

    const notes = screen.getByRole('textbox', { name: 'Notes' })
    await user.click(notes)
    await user.keyboard('3')

    expect(notes).toHaveValue('3')
    expect(screen.getByRole('button', { name: 'Answer 12' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('keeps answer controls operable with native Enter and Space keys', async () => {
    const user = userEvent.setup()
    render(<QuestionCard question={question} onResult={vi.fn()} />)

    await user.tab()
    expect(screen.getByRole('button', { name: 'Answer 10' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: 'Answer 10' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await user.tab()
    await user.keyboard(' ')
    expect(screen.getByRole('button', { name: 'Answer 11' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
