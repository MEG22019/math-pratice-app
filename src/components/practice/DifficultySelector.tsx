import type { DifficultyLevel } from '../../types'

interface DifficultySelectorProps {
  onChange: (difficulty: DifficultyLevel) => void
  selectedDifficulty: DifficultyLevel
}

const difficultyOptions: Array<{
  description: string
  label: string
  level: DifficultyLevel
}> = [
  {
    level: 1,
    label: 'Beginner',
    description: 'Small numbers and gentle starts',
  },
  { level: 2, label: 'Easy', description: 'A little more to think about' },
  {
    level: 3,
    label: 'Intermediate',
    description: 'Bigger numbers and new twists',
  },
  {
    level: 4,
    label: 'Advanced',
    description: 'A challenge for math explorers',
  },
]

export function DifficultySelector({
  onChange,
  selectedDifficulty,
}: DifficultySelectorProps) {
  return (
    <fieldset className="setup-section">
      <legend>Choose your challenge</legend>
      <p>Find the level that feels right today.</p>

      <div className="choice-grid choice-grid--difficulty">
        {difficultyOptions.map(({ description, label, level }) => (
          <label
            className={`choice-card difficulty-choice${selectedDifficulty === level ? ' choice-card--selected' : ''}`}
            key={level}
          >
            <input
              checked={selectedDifficulty === level}
              name="difficulty"
              type="radio"
              value={level}
              onChange={() => onChange(level)}
            />
            <span className="difficulty-choice__number" aria-hidden="true">
              {level}
            </span>
            <span>
              <span className="choice-card__label">{label}</span>
              <span className="choice-card__description">{description}</span>
            </span>
            <span className="choice-card__check" aria-hidden="true">
              ✓
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
