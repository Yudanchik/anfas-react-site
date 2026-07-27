export type CalculatorLeadContext = {
  mode: 'package' | 'individual'
  modeLabel: string
  area: number
  propertyLabel: string
  packageLabel?: string
  finishLabel?: string
  complexityLabel?: string
  extraWorks?: string[]
  priceLabel: string
  priceValue: string
  duration: string
  rateText: string
}
