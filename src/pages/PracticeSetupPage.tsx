import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { DifficultySelector } from '../components/practice/DifficultySelector'
import { OperationSelector } from '../components/practice/OperationSelector'
import { SessionLengthSelector } from '../components/practice/SessionLengthSelector'
import { Button } from '../components/ui/Button'
import { PageContainer } from '../components/layout/PageContainer'
import type {
  DifficultyLevel,
  MathOperation,
  PracticeSetupConfiguration,
  SessionLength,
} from '../types'

export function PracticeSetupPage() {
  const navigate = useNavigate()
  const [operations, setOperations] = useState<MathOperation[]>(['addition'])
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1)
  const [sessionLength, setSessionLength] = useState<SessionLength>(10)
  const hasOperation = operations.length > 0

  function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasOperation) {
      return
    }

    const configuration: PracticeSetupConfiguration = {
      operations,
      difficulty,
      sessionLength,
      mode: 'regular',
    }

    navigate('/practice/session', { state: { configuration } })
  }

  return (
    <PageContainer className="setup-page">
      <header className="page-heading">
        <p className="eyebrow">Choose today’s math adventure</p>
        <h1>Practice Setup</h1>
        <p>Make your picks, then start when you’re ready.</p>
      </header>

      <form className="setup-form" onSubmit={startSession}>
        <OperationSelector
          selectedOperations={operations}
          onChange={setOperations}
        />
        <DifficultySelector
          selectedDifficulty={difficulty}
          onChange={setDifficulty}
        />
        <SessionLengthSelector
          selectedLength={sessionLength}
          onChange={setSessionLength}
        />

        <div className="setup-submit">
          {!hasOperation && (
            <p className="validation-message" role="alert">
              <span aria-hidden="true">💡</span> Choose at least one math
              operation to start.
            </p>
          )}
          <Button disabled={!hasOperation} type="submit">
            Start Session <span aria-hidden="true">→</span>
          </Button>
          <p>Your choices only apply to this practice session.</p>
        </div>
      </form>
    </PageContainer>
  )
}
