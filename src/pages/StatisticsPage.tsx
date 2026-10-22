import { useMemo, useState } from 'react'

import { PageContainer } from '../components/layout/PageContainer'
import { Button, ButtonLink } from '../components/ui/Button'
import {
  calculateAccuracy,
  calculateStatistics,
} from '../features/statistics/statistics'
import {
  loadAttempts,
  loadSessions,
  resetPracticeHistory,
} from '../services/storage'
import type {
  DifficultyLevel,
  MathOperation,
  PracticeSession,
  StatisticsTotals,
} from '../types'

const operationLabels: Record<MathOperation, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
}

const operationSymbols: Record<MathOperation, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
}

const difficultyLabels: Record<DifficultyLevel, string> = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Intermediate',
  4: 'Advanced',
}

function MetricGroup({ totals }: { totals: StatisticsTotals }) {
  return (
    <dl className="stat-card__metrics">
      <div>
        <dt>Attempted</dt>
        <dd>{totals.attempted}</dd>
      </div>
      <div>
        <dt>Correct</dt>
        <dd>{totals.correct}</dd>
      </div>
      <div>
        <dt>Incorrect</dt>
        <dd>{totals.incorrect}</dd>
      </div>
      <div>
        <dt>Accuracy</dt>
        <dd>{calculateAccuracy(totals)}%</dd>
      </div>
    </dl>
  )
}

function formatSessionDate(session: PracticeSession): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(session.completedAt ?? session.startedAt))
}

export function StatisticsPage() {
  const [attempts, setAttempts] = useState(loadAttempts)
  const [sessions, setSessions] = useState(() =>
    loadSessions()
      .sort(
        (first, second) =>
          Date.parse(second.completedAt ?? second.startedAt) -
          Date.parse(first.completedAt ?? first.startedAt),
      )
      .slice(0, 10),
  )
  const statistics = useMemo(() => calculateStatistics(attempts), [attempts])

  function resetStatistics() {
    const confirmed = window.confirm(
      'Reset all practice statistics and session history? Your Settings will stay the same. This cannot be undone.',
    )

    if (confirmed && resetPracticeHistory()) {
      setAttempts([])
      setSessions([])
    }
  }

  const operations = Object.keys(operationLabels) as MathOperation[]
  const difficulties = [1, 2, 3, 4] as DifficultyLevel[]

  return (
    <PageContainer className="statistics-page">
      <header className="page-heading statistics-heading">
        <div>
          <p className="eyebrow">Watch your skills grow</p>
          <h1>Statistics</h1>
          <p>Every answer adds to your learning story.</p>
        </div>
        <ButtonLink to="/practice/setup">Start Practice</ButtonLink>
      </header>

      {statistics.attempted === 0 ? (
        <section className="statistics-empty" aria-labelledby="empty-title">
          <span aria-hidden="true">🌱</span>
          <h2 id="empty-title">Your progress starts here</h2>
          <p>Complete a practice session and your results will appear here.</p>
          <ButtonLink to="/practice/setup">Try Your First Session</ButtonLink>
        </section>
      ) : (
        <>
          <section aria-labelledby="overall-heading">
            <h2 id="overall-heading" className="section-title">
              Your totals
            </h2>
            <div className="overall-statistics">
              <MetricGroup totals={statistics} />
            </div>
          </section>

          <section aria-labelledby="operations-heading">
            <h2 id="operations-heading" className="section-title">
              By operation
            </h2>
            <div className="statistics-grid">
              {operations.map((operation) => (
                <article
                  className={`stat-card stat-card--${operation}`}
                  key={operation}
                >
                  <div className="stat-card__heading">
                    <span aria-hidden="true">
                      {operationSymbols[operation]}
                    </span>
                    <h3>{operationLabels[operation]}</h3>
                  </div>
                  <MetricGroup totals={statistics.byOperation[operation]} />
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="difficulty-heading">
            <h2 id="difficulty-heading" className="section-title">
              By difficulty
            </h2>
            <div className="statistics-grid">
              {difficulties.map((difficulty) => (
                <article className="stat-card" key={difficulty}>
                  <div className="stat-card__heading">
                    <span aria-hidden="true">{difficulty}</span>
                    <h3>{difficultyLabels[difficulty]}</h3>
                  </div>
                  <MetricGroup totals={statistics.byDifficulty[difficulty]} />
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="recent-heading">
            <h2 id="recent-heading" className="section-title">
              Recent sessions
            </h2>
            <div className="recent-sessions">
              {sessions.map((session) => {
                const accuracy = calculateAccuracy({
                  attempted: session.attemptedCount,
                  correct: session.correctCount,
                  incorrect: session.incorrectCount,
                })

                return (
                  <article className="recent-session" key={session.id}>
                    <div>
                      <time dateTime={session.completedAt ?? session.startedAt}>
                        {formatSessionDate(session)}
                      </time>
                      <h3>
                        {session.operations
                          .map((operation) => operationLabels[operation])
                          .join(', ')}
                      </h3>
                      <p>{difficultyLabels[session.difficulty]}</p>
                    </div>
                    <dl>
                      <div>
                        <dt>Attempted</dt>
                        <dd>{session.attemptedCount}</dd>
                      </div>
                      <div>
                        <dt>Correct</dt>
                        <dd>{session.correctCount}</dd>
                      </div>
                      <div>
                        <dt>Incorrect</dt>
                        <dd>{session.incorrectCount}</dd>
                      </div>
                      <div>
                        <dt>Accuracy</dt>
                        <dd>{accuracy}%</dd>
                      </div>
                    </dl>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="reset-statistics" aria-labelledby="reset-heading">
            <div>
              <h2 id="reset-heading">Reset statistics</h2>
              <p>Clear practice history while keeping all of your settings.</p>
            </div>
            <Button type="button" variant="secondary" onClick={resetStatistics}>
              Reset Statistics
            </Button>
          </section>
        </>
      )}
    </PageContainer>
  )
}
