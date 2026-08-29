/**
 * Russian plural for estimate line counts: «1 позиция», «2 позиции», «5 позиций».
 * Does not affect totals — presentation only.
 */
export function formatEstimatePositionCount(count: number): string {
  const n = Math.abs(Math.trunc(Number.isFinite(count) ? count : 0))
  const mod10 = n % 10
  const mod100 = n % 100

  let word: 'позиция' | 'позиции' | 'позиций'
  if (mod10 === 1 && mod100 !== 11) {
    word = 'позиция'
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    word = 'позиции'
  } else {
    word = 'позиций'
  }

  return `${n} ${word}`
}
