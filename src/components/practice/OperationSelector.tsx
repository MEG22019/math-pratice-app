import type { MathOperation } from '../../types'

interface OperationSelectorProps {
  onChange: (operations: MathOperation[]) => void
  selectedOperations: MathOperation[]
}

const operationOptions: Array<{
  label: string
  operation: MathOperation
  symbol: string
}> = [
  { operation: 'addition', label: 'Addition', symbol: '+' },
  { operation: 'subtraction', label: 'Subtraction', symbol: '−' },
  { operation: 'multiplication', label: 'Multiplication', symbol: '×' },
  { operation: 'division', label: 'Division', symbol: '÷' },
]

const allMathOperations = operationOptions.map(({ operation }) => operation)

export function OperationSelector({
  onChange,
  selectedOperations,
}: OperationSelectorProps) {
  const allSelected = selectedOperations.length === operationOptions.length

  function toggleOperation(operation: MathOperation) {
    if (selectedOperations.includes(operation)) {
      onChange(selectedOperations.filter((item) => item !== operation))
      return
    }

    onChange([...selectedOperations, operation])
  }

  return (
    <fieldset className="setup-section">
      <legend>What would you like to practice?</legend>
      <div className="setup-section__heading">
        <p>Pick one or mix as many as you like.</p>
        <button
          className="select-all-button"
          type="button"
          onClick={() => onChange(allSelected ? [] : allMathOperations)}
        >
          {allSelected ? 'Clear all operations' : 'Select all operations'}
        </button>
      </div>

      <div className="choice-grid choice-grid--operations">
        {operationOptions.map(({ label, operation, symbol }) => {
          const isSelected = selectedOperations.includes(operation)

          return (
            <label
              className={`choice-card operation-choice operation-choice--${operation}${isSelected ? ' choice-card--selected' : ''}`}
              key={operation}
            >
              <input
                checked={isSelected}
                type="checkbox"
                onChange={() => toggleOperation(operation)}
              />
              <span className="operation-choice__symbol" aria-hidden="true">
                {symbol}
              </span>
              <span className="choice-card__label">{label}</span>
              <span className="choice-card__check" aria-hidden="true">
                ✓
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
