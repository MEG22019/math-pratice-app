import { useId, type ReactNode } from 'react'

interface ErrorPanelProps {
  actions?: ReactNode
  compact?: boolean
  headingLevel?: 1 | 2
  message: ReactNode
  title: string
}

export function ErrorPanel({
  actions,
  compact = false,
  headingLevel = 2,
  message,
  title,
}: ErrorPanelProps) {
  const titleId = useId()
  const Heading = headingLevel === 1 ? 'h1' : 'h2'

  return (
    <section
      className={`error-panel${compact ? ' error-panel--compact' : ''}`}
      aria-labelledby={titleId}
      role="alert"
    >
      <span className="error-panel__icon" aria-hidden="true">
        🧭
      </span>
      <div className="error-panel__content">
        <Heading id={titleId}>{title}</Heading>
        <p>{message}</p>
        {actions && <div className="error-panel__actions">{actions}</div>}
      </div>
    </section>
  )
}
