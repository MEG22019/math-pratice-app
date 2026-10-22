import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AppRoutes } from './App'

function renderRoute(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('App navigation', () => {
  it('shows the Home page and its primary destinations', () => {
    renderRoute()

    expect(
      screen.getByRole('heading', { name: /math feels better/i }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /start practice/i }),
    ).toHaveLength(2)
    expect(
      screen.getAllByRole('link', { name: /view statistics/i }),
    ).toHaveLength(2)
    expect(
      screen.getByRole('link', { name: /open settings/i }),
    ).toBeInTheDocument()
  })

  it('navigates from Home to Practice Setup', async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(
      screen.getAllByRole('link', { name: /start practice/i })[0],
    )

    expect(
      screen.getByRole('heading', { name: 'Practice Setup' }),
    ).toBeInTheDocument()
  })

  it('provides all required application routes', () => {
    const routes = [
      ['/practice/session', 'No practice setup found'],
      ['/practice/summary', 'Session summary unavailable'],
      ['/statistics', 'Statistics'],
      ['/settings', 'Settings'],
    ]

    routes.forEach(([route, heading]) => {
      const { unmount } = renderRoute(route)
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
      unmount()
    })
  })

  it('redirects unknown routes safely to Home', () => {
    renderRoute('/this-page-does-not-exist')

    expect(
      screen.getByRole('heading', { name: /math feels better/i }),
    ).toBeInTheDocument()
  })
})
