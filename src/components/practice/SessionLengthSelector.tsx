import type { SessionLength } from '../../types'

interface SessionLengthSelectorProps {
  onChange: (sessionLength: SessionLength) => void
  selectedLength: SessionLength
}

const sessionLengthOptions: Array<{
  description: string
  label: string
  value: SessionLength
}> = [
  { value: 5, label: '5', description: 'Quick warm-up' },
  { value: 10, label: '10', description: 'Just right' },
  { value: 20, label: '20', description: 'Power practice' },
  { value: 'continuous', label: '∞', description: 'Continuous' },
]

export function SessionLengthSelector({
  onChange,
  selectedLength,
}: SessionLengthSelectorProps) {
  return (
    <fieldset className="setup-section">
      <legend>How long do you want to practice?</legend>
      <p>You can choose a goal or keep going as long as you like.</p>

      <div className="choice-grid choice-grid--length">
        {sessionLengthOptions.map(({ description, label, value }) => (
          <label
            className={`choice-card length-choice${selectedLength === value ? ' choice-card--selected' : ''}`}
            key={value}
          >
            <input
              checked={selectedLength === value}
              name="session-length"
              type="radio"
              onChange={() => onChange(value)}
            />
            <span className="length-choice__value">{label}</span>
            <span className="choice-card__description">{description}</span>
            <span className="choice-card__check" aria-hidden="true">
              ✓
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
