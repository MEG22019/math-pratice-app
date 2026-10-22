import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { DifficultySelector } from '../components/practice/DifficultySelector'
import { OperationSelector } from '../components/practice/OperationSelector'
import { SessionLengthSelector } from '../components/practice/SessionLengthSelector'
import { Button } from '../components/ui/Button'
import { PageContainer } from '../components/layout/PageContainer'
import { loadSettings } from '../services/storage'
import type {
  DifficultyLevel,
  MathOperation,
  PracticeSetupConfiguration,
  SessionLength,
} from '../types'

export function PracticeSetupPage() {
  const navigate = useNavigate()
  const [settings] = useState(loadSettings)
  const [operations, setOperations] = useState<MathOperation[]>(() => [
    ...settings.defaultOperations,
  ])
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    settings.defaultDifficulty,
  )
  const [sessionLength, setSessionLength] = useState<SessionLength>(
    settings.defaultSessionLength,
  )
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
          <p>You can change your saved defaults in Settings.</p>
        </div>
      </form>
    </PageContainer>
  )
}
