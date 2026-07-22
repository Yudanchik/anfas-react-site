export const PROCESS_STACK = {
  base: 88,
  head: 52,
  gap: 24,
  step: 76,
  minScale: 0.85,
  stackPhase: 0.86,
  cardRunVh: 32,
  releaseVh: 52,
} as const

export function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2
}

export function cardSegmentRange(index: number, total: number) {
  const segment = PROCESS_STACK.stackPhase / total
  const blend = segment * 0.14
  const start = Math.max(0, index * segment - (index > 0 ? blend : 0))
  const end = Math.min(
    PROCESS_STACK.stackPhase,
    (index + 1) * segment + (index < total - 1 ? blend * 0.35 : 0),
  )

  return { start, end }
}

export function targetScale(index: number, total: number) {
  if (total <= 1) return 1
  return PROCESS_STACK.minScale + (index / (total - 1)) * (1 - PROCESS_STACK.minScale)
}
