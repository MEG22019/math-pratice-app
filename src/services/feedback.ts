export function getEncouragingMessage(isCorrect: boolean): string {
  return isCorrect
    ? 'Nice work! Keep that math momentum going!'
    : 'Good effort! Every try helps your brain grow.'
}

export function playResultSound(isCorrect: boolean): void {
  if (typeof window === 'undefined') {
    return
  }

  const AudioContextConstructor = window.AudioContext
  if (!AudioContextConstructor) {
    return
  }

  try {
    const context = new AudioContextConstructor()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.frequency.value = isCorrect ? 660 : 330
    gain.gain.setValueAtTime(0.08, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.16)
    oscillator.addEventListener('ended', () => void context.close())
  } catch {
    // Sound is optional; browser audio restrictions must not interrupt practice.
  }
}
