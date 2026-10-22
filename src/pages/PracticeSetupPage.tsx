import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { DifficultySelector } from '../components/practice/DifficultySelector'
import { OperationSelector } from '../components/practice/OperationSelector'
import { SessionLengthSelector } from '../components/practice/SessionLengthSelector'
import { Button } from '../components/ui/Button'
import { PageContainer } from '../components/layout/PageContainer'
import {
  createMistakeReviewConfiguration,
  getActiveMistakePatterns,
} from '../features/mistakes/mistakes'
import { loadMistakePatterns, loadSettings } from '../services/storage'
import type {
  DifficultyLevel,
  MathOperation,
  PracticeSetupConfiguration,
  PracticeMode,
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
  const [activeMistakes] = useState(() =>
    getActiveMistakePatterns(loadMistakePatterns()),
  )
  const [mode, setMode] = useState<PracticeMode>('regular')
  const canStart =
    mode === 'regular' ? operations.length > 0 : activeMistakes.length > 0

  function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canStart) {
      return
    }

    const configuration: PracticeSetupConfiguration | undefined =
      mode === 'regular'
        ? { operations, difficulty, sessionLength, mode }
        : createMistakeReviewConfiguration(
            activeMistakes,
            settings,
            sessionLength,
          )

    if (!configuration) return

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
        <fieldset className="setup-section practice-mode-selector">
          <legend>Choose a practice mode</legend>
          <p>Start something new or strengthen skills you’ve missed before.</p>
          <div className="practice-mode-grid">
            <label
              className={
                mode === 'regular'
                  ? 'practice-mode practice-mode--selected'
                  : 'practice-mode'
              }
            >
              <input
                checked={mode === 'regular'}
                name="practice-mode"
                type="radio"
                onChange={() => setMode('regular')}
              />
              <span aria-hidden="true">🚀</span>
              <strong>Regular Practice</strong>
              <small>Practice the operations and level you choose.</small>
            </label>
            <label
              className={
                mode === 'mistake-review'
                  ? 'practice-mode practice-mode--selected'
                  : 'practice-mode'
              }
            >
              <input
                checked={mode === 'mistake-review'}
                disabled={activeMistakes.length === 0}
                name="practice-mode"
                type="radio"
                onChange={() => setMode('mistake-review')}
              />
              <span aria-hidden="true">🎯</span>
              <strong>Practice Mistakes</strong>
              <small>
                {activeMistakes.length > 0
                  ? `${activeMistakes.length} active ${activeMistakes.length === 1 ? 'skill' : 'skills'} to review`
                  : 'Finish a missed question to unlock this mode.'}
              </small>
            </label>
          </div>
        </fieldset>

        {mode === 'regular' && (
          <>
            <OperationSelector
              selectedOperations={operations}
              onChange={setOperations}
            />
            <DifficultySelector
              selectedDifficulty={difficulty}
              onChange={setDifficulty}
            />
          </>
        )}
        <SessionLengthSelector
          selectedLength={sessionLength}
          onChange={setSessionLength}
        />

        <div className="setup-submit">
          {!canStart && (
            <p className="validation-message" role="alert">
              <span aria-hidden="true">💡</span>{' '}
              {mode === 'regular'
                ? 'Choose at least one math operation to start.'
                : 'No active mistakes are ready to practice yet.'}
            </p>
          )}
          <Button disabled={!canStart} type="submit">
            Start Session <span aria-hidden="true">→</span>
          </Button>
          <p>You can change your saved defaults in Settings.</p>
        </div>
      </form>
    </PageContainer>
  )
}
