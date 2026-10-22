import { afterEach, describe, expect, it, vi } from 'vitest'

import { getEncouragingMessage, playResultSound } from './feedback'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('practice feedback', () => {
  it('provides supportive messages for both result choices', () => {
    expect(getEncouragingMessage(true)).toContain('Nice work')
    expect(getEncouragingMessage(false)).toContain('Good effort')
  })

  it('plays different optional tones without blocking practice', () => {
    const frequencies: number[] = []

    class FakeAudioContext {
      currentTime = 0
      destination = {}

      createOscillator() {
        const frequency = { value: 0 }
        return {
          frequency,
          connect: vi.fn(),
          start: () => frequencies.push(frequency.value),
          stop: vi.fn(),
          addEventListener: (_event: string, callback: () => void) =>
            callback(),
        }
      }

      createGain() {
        return {
          gain: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
        }
      }

      close = vi.fn()
    }

    vi.stubGlobal('AudioContext', FakeAudioContext)
    playResultSound(true)
    playResultSound(false)

    expect(frequencies).toEqual([660, 330])
  })
})
