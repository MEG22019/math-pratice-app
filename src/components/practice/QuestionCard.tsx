import { useCallback, useEffect, useState } from 'react'

import type { Question } from '../../types'
import { Button } from '../ui/Button'

interface QuestionCardProps {
  animationsEnabled?: boolean
  initialIsRevealed?: boolean
  initialSelectedAnswer?: number | null
  onResult: (isCorrect: boolean, selectedAnswer: number) => void
  onStateChange?: (state: QuestionCardState) => void
  question: Question
  showExplanation?: boolean
}

export interface QuestionCardState {
  isRevealed: boolean
  selectedAnswer: number | null
}

export function QuestionCard({
  animationsEnabled = true,
  initialIsRevealed = false,
  initialSelectedAnswer = null,
  onResult,
  onStateChange,
  question,
  showExplanation = false,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(
    initialSelectedAnswer,
  )
  const [isRevealed, setIsRevealed] = useState(initialIsRevealed)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const selectAnswer = useCallback(
    (choice: number) => {
      setSelectedAnswer(choice)
      onStateChange?.({ selectedAnswer: choice, isRevealed: false })
    },
    [onStateChange],
  )

  useEffect(() => {
    function handleAnswerShortcut(event: KeyboardEvent) {
      const target = event.target
      if (
        isRevealed ||
        (target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT'))
      ) {
        return
      }

      const choiceIndex = Number(event.key) - 1
      if (choiceIndex >= 0 && choiceIndex < question.choices.length) {
        event.preventDefault()
        selectAnswer(question.choices[choiceIndex])
      }
    }

    window.addEventListener('keydown', handleAnswerShortcut)
    return () => window.removeEventListener('keydown', handleAnswerShortcut)
  }, [isRevealed, question.choices, selectAnswer])

  function submitResult(isCorrect: boolean) {
    if (selectedAnswer === null || hasSubmitted) {
      return
    }

    setHasSubmitted(true)
    onResult(isCorrect, selectedAnswer)
  }

  const cardClasses = [
    'question-card',
    isRevealed && 'question-card--revealed',
    !animationsEnabled && 'question-card--no-animation',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={cardClasses}
      aria-describedby="answer-shortcut-hint"
      aria-labelledby="question-title"
    >
      {!isRevealed ? (
        <div className="question-card__face question-card__front">
          <p className="question-card__eyebrow">Solve this one</p>
          <h2 id="question-title" className="question-card__problem">
            {question.displayText} = ?
          </h2>

          <div className="answer-grid" aria-label="Answer choices" role="group">
            {question.choices.map((choice, index) => (
              <button
                aria-keyshortcuts={`${index + 1}`}
                aria-label={`Answer ${choice}`}
                aria-pressed={selectedAnswer === choice}
                className={`answer-choice${selectedAnswer === choice ? ' answer-choice--selected' : ''}`}
                key={choice}
                type="button"
                onClick={() => selectAnswer(choice)}
              >
                <span className="answer-choice__key" aria-hidden="true">
                  {index + 1}
                </span>
                <span>{choice}</span>
                <span className="answer-choice__check" aria-hidden="true">
                  ✓
                </span>
              </button>
            ))}
          </div>

          <p className="question-card__shortcut" id="answer-shortcut-hint">
            Tip: press 1, 2, 3, or 4 to choose an answer.
          </p>
          <p className="sr-only" aria-atomic="true" aria-live="polite">
            {selectedAnswer === null
              ? 'No answer selected.'
              : `Answer ${selectedAnswer} selected.`}
          </p>

          <Button
            className="question-card__reveal"
            disabled={selectedAnswer === null}
            type="button"
            onClick={() => {
              setIsRevealed(true)
              onStateChange?.({ selectedAnswer, isRevealed: true })
            }}
          >
            Check My Answer
          </Button>
          {selectedAnswer === null && (
            <p className="question-card__hint">Choose an answer first.</p>
          )}
        </div>
      ) : (
        <div className="question-card__face question-card__back">
          <p className="question-card__eyebrow">Check your work</p>
          <h2 id="question-title" className="question-card__problem">
            {question.displayText} = {question.correctAnswer}
          </h2>

          <div className="answer-review">
            <div>
              <span>Your answer</span>
              <strong>{selectedAnswer}</strong>
            </div>
            <div>
              <span>Correct answer</span>
              <strong>{question.correctAnswer}</strong>
            </div>
          </div>
          <p className="sr-only" aria-atomic="true" aria-live="polite">
            Answer revealed. Your answer is {selectedAnswer}. The correct answer
            is {question.correctAnswer}.
          </p>

          {showExplanation && (
            <p className="question-explanation">
              {question.displayText} equals {question.correctAnswer}.
            </p>
          )}

          <fieldset className="self-report">
            <legend>How did you do?</legend>
            <p>Be honest with yourself—it helps you learn!</p>
            <div>
              <Button
                disabled={hasSubmitted}
                type="button"
                onClick={() => submitResult(true)}
              >
                <span aria-hidden="true">✓</span> I Got It Right
              </Button>
              <Button
                disabled={hasSubmitted}
                type="button"
                variant="secondary"
                onClick={() => submitResult(false)}
              >
                <span aria-hidden="true">↻</span> I Got It Wrong
              </Button>
            </div>
          </fieldset>
        </div>
      )}
    </section>
  )
}
