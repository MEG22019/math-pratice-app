export type RandomSource = () => number

export function randomInteger(
  minimum: number,
  maximum: number,
  random: RandomSource = Math.random,
): number {
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum)) {
    throw new TypeError('Random integer bounds must be integers.')
  }

  if (minimum > maximum) {
    throw new RangeError('The minimum cannot be greater than the maximum.')
  }

  const randomValue = random()

  if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
    throw new RangeError('The random source must return a value from 0 to 1.')
  }

  return Math.floor(randomValue * (maximum - minimum + 1)) + minimum
}

export function shuffle<T>(
  values: readonly T[],
  random: RandomSource = Math.random,
): T[] {
  const shuffled = [...values]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(0, index, random)
    ;[shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ]
  }

  return shuffled
}
