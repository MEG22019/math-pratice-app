import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { PrivacyPage } from './PrivacyPage'

describe('PrivacyPage', () => {
  it('clearly explains the application privacy protections', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Your privacy matters' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/no personal information/i)).toBeInTheDocument()
    expect(screen.getByText(/no third-party analytics/i)).toBeInTheDocument()
    expect(screen.getByText(/no advertisements/i)).toBeInTheDocument()
    expect(screen.getByText(/removes saved progress/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /open settings/i }),
    ).toHaveAttribute('href', '/settings')
  })
})
