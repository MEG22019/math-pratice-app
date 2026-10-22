import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'

describe('App', () => {
  it('introduces the Math Practice application', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Math Practice' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Build your math skills one question at a time.'),
    ).toBeInTheDocument()
  })
})
