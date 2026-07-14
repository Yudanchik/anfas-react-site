import { useMemo, useState } from 'react'

import { PageWrapper } from '@/shared/ui/page-wrapper'

import { SectionHeader } from '../../ui'
import { packageCalculator } from '../model/package-calculator.data'

import styles from './HomePackageCalculator.module.scss'

type CalculatorMode = 'package' | 'individual'
type PackageVariant = (typeof packageCalculator.packageVariants)[number]['value']
type PropertyType = (typeof packageCalculator.propertyTypes)[number]['value']
type FinishType = (typeof packageCalculator.finishLevels)[number]['value']
type ComplexityType = (typeof packageCalculator.complexityLevels)[number]['value']
type OptionType = (typeof packageCalculator.options)[number]['value']

const modes: ReadonlyArray<{ label: string; value: CalculatorMode }> = [
  { label: 'Пакетный ремонт', value: 'package' },
  { label: 'Индивидуальный ремонт', value: 'individual' },
]

const moneyFormatter = new Intl.NumberFormat('ru-RU')
const formatMoney = (value: number) => `${moneyFormatter.format(Math.round(value))} ₽`

const propertyLabels: Record<PropertyType, string> = {
  new: 'Новостройка',
  secondary: 'Вторичка',
}

const finishLabels: Record<FinishType, string> = {
  basic: 'Базовый',
  standard: 'Стандарт',
  premium: 'Премиум',
}

export function HomePackageCalculator({
  onOpenBrief,
}: {
  onOpenBrief: (service?: 'individual' | 'package') => void
}) {
  const [mode, setMode] = useState<CalculatorMode>('package')
  const [area, setArea] = useState(60)
  const [packageVariant, setPackageVariant] = useState<PackageVariant>('standard')
  const [propertyType, setPropertyType] = useState<PropertyType>('new')
  const [finish, setFinish] = useState<FinishType>('standard')
  const [complexity, setComplexity] = useState<ComplexityType>('normal')
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([])

  const visibleOptions = packageCalculator.options

  const selectedPackage = useMemo(
    () =>
      packageCalculator.packageVariants.find((variant) => variant.value === packageVariant) ??
      packageCalculator.packageVariants[1],
    [packageVariant],
  )

  const estimate = useMemo(() => {
    if (mode === 'package') {
      const propertyCoefficient = packageCalculator.rates.propertyCoefficients[propertyType]
      const total = Math.round(area * selectedPackage.ratePerM2 * propertyCoefficient)
      const durationMin = Math.max(3, Math.round(selectedPackage.durationMonths + area / 85))
      const durationMax = durationMin + 1

      return {
        mode: 'package' as const,
        total,
        priceLabel: 'Фиксированная ставка за м²',
        summary:
          'Пакетный ремонт считает стоимость только по площади и выбранной комплектации. Без типа квартиры, скрытых доплат и лишних фильтров.',
        rateText: `от ${formatMoney(selectedPackage.ratePerM2)} / м²`,
        durationText: `${durationMin}–${durationMax} мес`,
        durationHint: 'срок зависит от площади и выбранного пакета',
        label: 'Пакетный формат',
        note: selectedPackage.helper,
        variantLabel: selectedPackage.label,
        propertyLabel: propertyLabels[propertyType],
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
      mode: 'individual' as const,
      total,
      rangeMin,
      rangeMax,
      priceLabel: 'Ориентир по индивидуальному проекту',
      summary:
        'Индивидуальный сценарий учитывает площадь, уровень отделки, сложность и дополнительные работы. Это уже более точная вилка.',
      rateText: `от ${formatMoney(basePerM2)} / м²`,
      durationText: `${durationMin}–${durationMax} мес`,
      durationHint: 'после замера вилку уточняем точнее',
      label: 'Индивидуальный формат',
      note: 'Итог уточняется после брифа и замера квартиры.',
      propertyLabel: propertyLabels[propertyType],
    }
  }, [area, complexity, finish, mode, propertyType, selectedOptions, selectedPackage])

  const toggleOption = (value: OptionType) => {
    setSelectedOptions((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  return (
    <section id="calculator" className={styles.calculator}>
      <PageWrapper className={styles.layout}>
        <SectionHeader
          number="06"
          label={packageCalculator.eyebrow}
          title={
            <>
              {packageCalculator.title}
              <br />
              <em>и понятной вилкой</em>
            </>
          }
          lead={packageCalculator.lead}
        />

        <div className={styles.switchRow}>
          {modes.map((item) => (
            <button
              className={`${styles.switchButton} ${mode === item.value ? styles.switchButtonActive : ''}`}
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          <div className={styles.form} data-reveal>
            <div className={styles.formHead}>
              <p className={styles.formKicker}>
                {mode === 'package' ? 'Фиксируем цену' : 'Считаем ориентир по смете'}
              </p>
              <p className={styles.formHint}>
                {mode === 'package'
                  ? 'В пакетном режиме считаем только площадь и выбранную комплектацию. Это быстрый и понятный ориентир.'
                  : 'В индивидуальном режиме добавляем параметры квартиры, уровень отделки и дополнительные работы.'}
              </p>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="calculator-area">Площадь квартиры</label>
                <span className={styles.helper}>{area} м²</span>
              </div>
              <input
                id="calculator-area"
                className={styles.range}
                max={130}
                min={35}
                step={1}
                type="range"
                value={area}
                onChange={(event) => setArea(Number(event.target.value))}
              />
              <div className={styles.areaMarks}>
                {packageCalculator.areaMarks.map((value) => (
                  <button
                    className={`${styles.areaMark} ${area === value ? styles.areaMarkActive : ''}`}
                    key={value}
                    type="button"
                    onClick={() => setArea(value)}
                  >
                    {value} м²
                  </button>
                ))}
              </div>
            </div>

            <fieldset className={styles.formGroup}>
              <legend>Тип объекта</legend>
              <div className={styles.typeGrid}>
                {packageCalculator.propertyTypes.map((option) => (
                  <button
                    className={`${styles.typeCard} ${
                      propertyType === option.value ? styles.typeCardActive : ''
                    }`}
                    key={option.value}
                    type="button"
                    onClick={() => setPropertyType(option.value)}
                  >
                    <span className={styles.typeCardLabel}>{option.label}</span>
                    <span className={styles.typeCardHelper}>{option.helper}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {mode === 'package' ? (
              <fieldset className={styles.formGroup}>
                <legend>Вариант комплектации</legend>
                <div className={styles.variantGrid}>
                  {packageCalculator.packageVariants.map((variant) => (
                    <button
                      className={`${styles.variantCard} ${
                        packageVariant === variant.value ? styles.variantCardActive : ''
                      }`}
                      key={variant.value}
                      type="button"
                      onClick={() => setPackageVariant(variant.value)}
                    >
                      <span className={styles.variantCardLabel}>{variant.label}</span>
                      <span className={styles.variantCardHelper}>{variant.helper}</span>
                      <strong className={styles.variantCardRate}>{formatMoney(variant.ratePerM2)} / м²</strong>
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : (
              <>
                <div className={styles.compactGrid}>
                  <fieldset className={styles.formGroup}>
                    <legend>Уровень отделки</legend>
                    <div className={styles.choiceGrid}>
                      {packageCalculator.finishLevels.map((option) => (
                        <button
                          className={`${styles.choiceButton} ${finish === option.value ? styles.choiceButtonActive : ''}`}
                          key={option.value}
                          type="button"
                          onClick={() => setFinish(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className={styles.formGroup}>
                    <legend>Сложность проекта</legend>
                    <div className={styles.choiceGrid}>
                      {packageCalculator.complexityLevels.map((option) => (
                        <button
                          className={`${styles.choiceButton} ${complexity === option.value ? styles.choiceButtonActive : ''}`}
                          key={option.value}
                          type="button"
                          onClick={() => setComplexity(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <fieldset className={styles.formGroup}>
                  <legend>Дополнительные работы</legend>
                  <div className={styles.optionGrid}>
                    {visibleOptions.map((option) => (
                      <label className={styles.optionCard} key={option.value}>
                        <div className={styles.optionCardHeader}>
                          <input
                            checked={selectedOptions.includes(option.value)}
                            type="checkbox"
                            onChange={() => toggleOption(option.value)}
                          />
                          <span>{option.label}</span>
                        </div>
                        <small>{option.helper}</small>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
          </div>

          <aside className={styles.result} data-reveal>
            <div className={styles.resultTop}>
              <p className={styles.resultEyebrow}>{estimate.label}</p>
              <p className={styles.resultSummary}>{estimate.summary}</p>
            </div>

            <div className={styles.resultPanel}>
              <span className={styles.resultCaption}>{estimate.priceLabel}</span>
              <strong className={styles.resultPrice}>
                {estimate.mode === 'package'
                  ? formatMoney(estimate.total)
                  : `${formatMoney(estimate.rangeMin)} — ${formatMoney(estimate.rangeMax)}`}
              </strong>
              <div className={styles.resultMetaLine}>
                <span>{estimate.rateText}</span>
                <span>{estimate.note}</span>
              </div>
            </div>

            <div className={styles.metrics}>
              <div className={styles.metric}>
                <span>Площадь</span>
                <strong>{area} м²</strong>
              </div>
              <div className={styles.metric}>
                <span>Срок</span>
                <strong>{estimate.durationText}</strong>
              </div>
              <div className={styles.metric}>
                <span>Формат</span>
                <strong>
                  {mode === 'package'
                    ? `${selectedPackage.label} • ${propertyLabels[propertyType]}`
                    : `${propertyLabels[propertyType]} • ${finishLabels[finish]}`}
                </strong>
              </div>
            </div>

            <ul className={styles.notes}>
              {packageCalculator.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>

            <div className={styles.actions}>
              <button className={styles.button} type="button" onClick={() => onOpenBrief(mode)}>
                Получить расчёт
              </button>
              <button className={styles.buttonAlt} type="button" onClick={() => onOpenBrief(mode)}>
                Обсудить формат
              </button>
            </div>
          </aside>
        </div>
      </PageWrapper>
    </section>
  )
}
