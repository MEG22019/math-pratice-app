import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { usePrefersReducedMotion } from './usePrefersReducedMotion'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usePrefersReducedMotion', () => {
  it('detects and responds to the reduced-motion media preference', () => {
    let matches = true
    let changeListener: (() => void) | undefined
    const mediaQuery = {
      get matches() {
        return matches
      },
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: (_event: string, listener: () => void) => {
        changeListener = listener
      },
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mediaQuery),
    )

    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)

    act(() => {
      matches = false
      changeListener?.()
    })
    expect(result.current).toBe(false)
  })
})
