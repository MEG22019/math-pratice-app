import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppRoutes } from '../components/App'
import {
  defaultSettings,
  loadSessions,
  loadSettings,
  saveCompletedSession,
} from '../services/storage'
import type { PracticeSession } from '../types'

async function renderSettings() {
  const rendered = render(
    <MemoryRouter initialEntries={['/settings']}>
      <AppRoutes />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { name: 'Settings' })
  return rendered
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SettingsPage', () => {
  it('saves preferences and practice defaults that Practice Setup loads', async () => {
    const user = userEvent.setup()
    const rendered = await renderSettings()

    await user.click(screen.getByRole('checkbox', { name: /Sound effects/i }))
    await user.click(screen.getByRole('checkbox', { name: 'Addition' }))
    await user.click(screen.getByRole('checkbox', { name: 'Division' }))
    await user.click(screen.getByRole('radio', { name: /Advanced/i }))
    await user.click(screen.getByRole('radio', { name: /20.*Power practice/i }))
    const threshold = screen.getByRole('spinbutton', {
      name: /Mastery threshold/i,
    })
    await user.clear(threshold)
    await user.type(threshold, '5')
    await user.click(screen.getByRole('button', { name: 'Save Settings' }))

    expect(screen.getByRole('status')).toHaveTextContent('Settings saved')
    expect(loadSettings()).toMatchObject({
      soundEffectsEnabled: true,
      defaultOperations: ['division'],
      defaultDifficulty: 4,
      defaultSessionLength: 20,
      mistakeMasteryThreshold: 5,
    })

    rendered.unmount()
    render(
      <MemoryRouter initialEntries={['/practice/setup']}>
        <AppRoutes />
      </MemoryRouter>,
    )
    expect(screen.getByRole('checkbox', { name: 'Division' })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Advanced/i })).toBeChecked()
    expect(
      screen.getByRole('radio', { name: /20.*Power practice/i }),
    ).toBeChecked()
  })

  it('requires at least one default operation', async () => {
    const user = userEvent.setup()
    await renderSettings()

    await user.click(screen.getByRole('checkbox', { name: 'Addition' }))
    await user.click(screen.getByRole('button', { name: 'Save Settings' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Choose at least one default operation',
    )
    expect(loadSettings()).toEqual(defaultSettings)
  })

  it('clears all application data after a strong confirmation and returns home', async () => {
    const user = userEvent.setup()
    const session: PracticeSession = {
      id: 'session-1',
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:01:00.000Z',
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
      mode: 'regular',
      attemptedCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      attempts: [],
    }
    saveCompletedSession(session)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await renderSettings()

    await user.click(
      screen.getByRole('button', { name: 'Clear All Application Data' }),
    )

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('ALL'))
    expect(loadSessions()).toEqual([])
    expect(loadSettings()).toEqual(defaultSettings)
    expect(
      screen.getByRole('heading', { name: /math feels better/i }),
    ).toBeInTheDocument()
  })
})
