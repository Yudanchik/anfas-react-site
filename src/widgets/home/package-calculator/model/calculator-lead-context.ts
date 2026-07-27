import type { CalculatorLeadContext } from '@/features/brief/model/calculator-lead-context'

import { packageCalculator } from './package-calculator.data'

type CalculatorMode = CalculatorLeadContext['mode']
type PackageVariant = (typeof packageCalculator.packageVariants)[number]['value']
type PropertyType = (typeof packageCalculator.propertyTypes)[number]['value']
type FinishType = (typeof packageCalculator.finishLevels)[number]['value']
type ComplexityType = (typeof packageCalculator.complexityLevels)[number]['value']
type OptionType = (typeof packageCalculator.options)[number]['value']

const moneyFormatter = new Intl.NumberFormat('ru-RU')
const formatMoney = (value: number) => `${moneyFormatter.format(Math.round(value))} ₽`

const propertyLabels = Object.fromEntries(
  packageCalculator.propertyTypes.map((item) => [item.value, item.label]),
) as Record<PropertyType, string>

const finishLabels = Object.fromEntries(
  packageCalculator.finishLevels.map((item) => [item.value, item.label]),
) as Record<FinishType, string>

const complexityLabels = Object.fromEntries(
  packageCalculator.complexityLevels.map((item) => [item.value, item.label]),
) as Record<ComplexityType, string>

type BuildCalculatorLeadContextInput = {
  mode: CalculatorMode
  area: number
  propertyType: PropertyType
  packageVariant: PackageVariant
  finish: FinishType
  complexity: ComplexityType
  selectedOptions: OptionType[]
}

export function buildCalculatorLeadContext({
  mode,
  area,
  propertyType,
  packageVariant,
  finish,
  complexity,
  selectedOptions,
}: BuildCalculatorLeadContextInput): CalculatorLeadContext {
  const propertyLabel = propertyLabels[propertyType]

  if (mode === 'package') {
    const selectedPackage =
      packageCalculator.packageVariants.find((variant) => variant.value === packageVariant) ??
      packageCalculator.packageVariants[1]
    const propertyCoefficient = packageCalculator.rates.propertyCoefficients[propertyType]
    const total = Math.round(area * selectedPackage.ratePerM2 * propertyCoefficient)
    const durationMin = Math.max(3, Math.round(selectedPackage.durationMonths + area / 85))
    const durationMax = durationMin + 1

    return {
      mode,
      modeLabel: 'Пакетный ремонт',
      area,
      propertyLabel,
      packageLabel: selectedPackage.label,
      priceLabel: 'Ориентир стоимости',
      priceValue: formatMoney(total),
      duration: `${durationMin}–${durationMax} мес`,
      rateText: `от ${formatMoney(selectedPackage.ratePerM2)} / м²`,
    }
  }

  const propertyCoefficient = packageCalculator.rates.propertyCoefficients[propertyType]
  const complexityCoefficient = packageCalculator.rates.complexityCoefficients[complexity]
  const workRate = packageCalculator.rates.individualWorkPerM2[finish]
  const basePerM2 =
    (packageCalculator.rates.individualDesignPerM2 + workRate) *
    propertyCoefficient *
    complexityCoefficient
  const selectedExtraOptions = packageCalculator.options.filter((option) =>
    selectedOptions.includes(option.value),
  )
  const extraCost = selectedExtraOptions.reduce((sum, option) => sum + option.cost, 0)
  const extraWeeks = selectedExtraOptions.reduce((sum, option) => sum + option.weeks, 0)
  const total = Math.round(area * basePerM2 + extraCost)
  const rangeMin = Math.round(total * 0.92)
  const rangeMax = Math.round(total * 1.12)
  const durationMin = Math.max(
    6,
    Math.round(packageCalculator.rates.individualMonths[finish] + area / 70 + extraWeeks / 4),
  )
  const durationMax = durationMin + 3

  return {
    mode,
    modeLabel: 'Индивидуальный ремонт',
    area,
    propertyLabel,
    finishLabel: finishLabels[finish],
    complexityLabel: complexityLabels[complexity],
    extraWorks: selectedExtraOptions.map((option) => option.label),
    priceLabel: 'Ориентир стоимости',
    priceValue: `${formatMoney(rangeMin)} — ${formatMoney(rangeMax)}`,
    duration: `${durationMin}–${durationMax} мес`,
    rateText: `от ${formatMoney(basePerM2)} / м²`,
  }
}
