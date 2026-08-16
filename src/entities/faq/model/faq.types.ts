export type FaqItem = {
  question: string
  answer: string
}

export type FaqGroupKey = 'home' | 'prices-hub'

export type FaqGroup = {
  key: FaqGroupKey
  items: readonly FaqItem[]
}
