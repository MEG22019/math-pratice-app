import { render } from '@testing-library/react'
import axe from 'axe-core'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AppRoutes } from './components/App'

describe('application accessibility', () => {
  it.each([
    ['Home', '/'],
    ['Practice Setup', '/practice/setup'],
    ['Statistics', '/statistics'],
    ['Settings', '/settings'],
  ])('has no automated accessibility violations on %s', async (_name, path) => {
    const { container } = render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>,
    )

    const results = await axe.run(container, {
      rules: {
        // JSDOM cannot calculate rendered colors. Contrast is reviewed in the
        // real-browser responsive checks instead.
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toEqual([])
  })
})
