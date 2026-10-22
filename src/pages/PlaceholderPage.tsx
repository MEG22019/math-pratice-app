import { PageContainer } from '../components/layout/PageContainer'
import { ButtonLink } from '../components/ui/Button'

interface PlaceholderPageProps {
  description: string
  eyebrow: string
  symbol: string
  title: string
}

export function PlaceholderPage({
  description,
  eyebrow,
  symbol,
  title,
}: PlaceholderPageProps) {
  return (
    <PageContainer className="placeholder-page">
      <section className="placeholder-card">
        <div className="placeholder-card__symbol" aria-hidden="true">
          {symbol}
        </div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <ButtonLink to="/" variant="secondary">
          ← Back to Home
        </ButtonLink>
      </section>
    </PageContainer>
  )
}
