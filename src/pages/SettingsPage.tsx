import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { DifficultySelector } from '../components/practice/DifficultySelector'
import { OperationSelector } from '../components/practice/OperationSelector'
import { SessionLengthSelector } from '../components/practice/SessionLengthSelector'
import { PageContainer } from '../components/layout/PageContainer'
import { Button } from '../components/ui/Button'
import {
  clearAllApplicationData,
  defaultSettings,
  loadSettings,
  saveSettings,
} from '../services/storage'
import type { ApplicationSettings } from '../types'

export function SettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<ApplicationSettings>(loadSettings)
  const [masteryThreshold, setMasteryThreshold] = useState(() =>
    String(settings.mistakeMasteryThreshold),
  )
  const [saveMessage, setSaveMessage] = useState('')

  function updateSetting<Key extends keyof ApplicationSettings>(
    key: Key,
    value: ApplicationSettings[Key],
  ) {
    setSettings((current) => ({ ...current, [key]: value }))
    setSaveMessage('')
  }

  function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedMasteryThreshold = Number(masteryThreshold)

    if (settings.defaultOperations.length === 0) {
      setSaveMessage('Choose at least one default operation.')
      return
    }

    if (
      !Number.isInteger(parsedMasteryThreshold) ||
      parsedMasteryThreshold < 1 ||
      parsedMasteryThreshold > 10
    ) {
      setSaveMessage('Choose a mastery threshold from 1 to 10.')
      return
    }

    const validatedSettings = {
      ...settings,
      mistakeMasteryThreshold: parsedMasteryThreshold,
    }
    setSettings(validatedSettings)

    setSaveMessage(
      saveSettings(validatedSettings)
        ? 'Settings saved! Your next practice session will use these defaults.'
        : 'Settings could not be saved. Please check your browser storage settings.',
    )
  }

  function clearAllData() {
    const confirmed = window.confirm(
      'Clear ALL application data? This permanently removes settings, sessions, attempts, progress, mistake patterns, and any active session.',
    )

    if (!confirmed) {
      return
    }

    if (clearAllApplicationData()) {
      setSettings({
        ...defaultSettings,
        defaultOperations: [...defaultSettings.defaultOperations],
      })
      setMasteryThreshold(String(defaultSettings.mistakeMasteryThreshold))
      navigate('/', { replace: true })
    } else {
      setSaveMessage(
        'We could not clear the saved data. Please check your browser storage settings and try again.',
      )
    }
  }

  return (
    <PageContainer className="settings-page">
      <header className="page-heading">
        <p className="eyebrow">Make practice yours</p>
        <h1>Settings</h1>
        <p>Choose how Math Practice looks, sounds, and starts.</p>
      </header>

      <form className="settings-form" onSubmit={submitSettings}>
        <fieldset className="settings-panel">
          <legend>Practice preferences</legend>
          <p>Turn helpful effects and messages on or off.</p>
          <div className="toggle-list">
            <label className="toggle-row">
              <span>
                <strong>Sound effects</strong>
                <small>Play a short tone after each answer.</small>
              </span>
              <input
                checked={settings.soundEffectsEnabled}
                type="checkbox"
                onChange={(event) =>
                  updateSetting('soundEffectsEnabled', event.target.checked)
                }
              />
            </label>
            <label className="toggle-row">
              <span>
                <strong>Card animation</strong>
                <small>Animate question cards when answers are checked.</small>
              </span>
              <input
                checked={settings.cardAnimationEnabled}
                type="checkbox"
                onChange={(event) =>
                  updateSetting('cardAnimationEnabled', event.target.checked)
                }
              />
            </label>
            <label className="toggle-row">
              <span>
                <strong>Show explanations</strong>
                <small>
                  Show the completed number sentence after checking.
                </small>
              </span>
              <input
                checked={settings.showExplanations}
                type="checkbox"
                onChange={(event) =>
                  updateSetting('showExplanations', event.target.checked)
                }
              />
            </label>
            <label className="toggle-row">
              <span>
                <strong>Encouraging feedback</strong>
                <small>Show a supportive message after each result.</small>
              </span>
              <input
                checked={settings.encouragingFeedbackEnabled}
                type="checkbox"
                onChange={(event) =>
                  updateSetting(
                    'encouragingFeedbackEnabled',
                    event.target.checked,
                  )
                }
              />
            </label>
          </div>

          <label className="number-setting">
            <span>
              <strong>Mastery threshold</strong>
              <small>Correct review answers needed to master a mistake.</small>
            </span>
            <input
              aria-describedby="mastery-help"
              min="1"
              max="10"
              step="1"
              type="number"
              value={masteryThreshold}
              onChange={(event) => {
                setMasteryThreshold(event.target.value)
                setSaveMessage('')
              }}
            />
          </label>
          <p id="mastery-help" className="field-help">
            Choose a number from 1 to 10.
          </p>
        </fieldset>

        <section
          className="settings-defaults"
          aria-labelledby="defaults-heading"
        >
          <div className="settings-defaults__heading">
            <h2 id="defaults-heading">Default practice choices</h2>
            <p>These choices will be ready whenever you open Practice Setup.</p>
          </div>
          <OperationSelector
            selectedOperations={settings.defaultOperations}
            onChange={(operations) =>
              updateSetting('defaultOperations', operations)
            }
          />
          <DifficultySelector
            selectedDifficulty={settings.defaultDifficulty}
            onChange={(difficulty) =>
              updateSetting('defaultDifficulty', difficulty)
            }
          />
          <SessionLengthSelector
            selectedLength={settings.defaultSessionLength}
            onChange={(length) => updateSetting('defaultSessionLength', length)}
          />
        </section>

        <div className="settings-save">
          {saveMessage && <p role="status">{saveMessage}</p>}
          <Button type="submit">Save Settings</Button>
        </div>
      </form>

      <section className="danger-zone" aria-labelledby="clear-data-heading">
        <div>
          <p className="eyebrow">Danger zone</p>
          <h2 id="clear-data-heading">Clear all application data</h2>
          <p>
            This permanently removes settings, practice history, progress, and
            active sessions from this browser.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={clearAllData}>
          Clear All Application Data
        </Button>
      </section>
    </PageContainer>
  )
}
