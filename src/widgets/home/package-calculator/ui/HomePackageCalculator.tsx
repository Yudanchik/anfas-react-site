import { useMemo, useState } from 'react'

import { ModalTriggerButton } from '@/features/brief/ui/ModalTriggerButton'
import type { CalculatorLeadContext } from '@/features/brief/model/calculator-lead-context'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import { SectionHeader } from '../../ui'
import { buildCalculatorLeadContext } from '../model/calculator-lead-context'
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

export function HomePackageCalculator() {
  const [mode, setMode] = useState<CalculatorMode>('package')
  const [area, setArea] = useState(60)
  const [packageVariant, setPackageVariant] = useState<PackageVariant>('standard')
  const [propertyType, setPropertyType] = useState<PropertyType>('new')
  const [finish, setFinish] = useState<FinishType>('standard')
  const [complexity, setComplexity] = useState<ComplexityType>('normal')
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([])
  const [showMobileResultDetails, setShowMobileResultDetails] = useState(false)

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

  const calculatorLeadContext = useMemo<CalculatorLeadContext>(
    () =>
      buildCalculatorLeadContext({
        mode,
        area,
        propertyType,
        packageVariant,
        finish,
        complexity,
        selectedOptions,
      }),
    [area, complexity, finish, mode, packageVariant, propertyType, selectedOptions],
  )

  const toggleOption = (value: OptionType) => {
    setSelectedOptions((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  return (
    <section id="calculator" className={styles.packageCalculator}>
      <PageWrapper className={styles.packageCalculator__layout}>
        <SectionHeader
          number="06"
          label={packageCalculator.eyebrow}
          title={
            <>
              {packageCalculator.title}
              <br />
              <em>и честной вилкой</em>
            </>
          }
          lead={packageCalculator.lead}
        />

        <div className={styles.packageCalculator__switchRow}>
          {modes.map((item) => (
            <button
              className={`${styles.packageCalculator__switchButton} ${
                mode === item.value ? styles.packageCalculator__switchButton_active : ''
              }`}
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.packageCalculator__grid}>
          <div className={styles.packageCalculator__form} data-reveal>
            <div className={styles.packageCalculator__formHead}>
              <p className={styles.packageCalculator__formKicker}>
                {mode === 'package' ? 'Фиксируем цену' : 'Считаем ориентир по смете'}
              </p>
              <p className={styles.packageCalculator__formHint}>
                {mode === 'package'
                  ? 'В пакетном режиме считаем только площадь и выбранную комплектацию. Это быстрый ориентир по стоимости.'
                  : 'В индивидуальном режиме добавляем параметры квартиры, уровень отделки и дополнительные работы.'}
              </p>
            </div>

            <div className={styles.packageCalculator__formGroup}>
              <div className={styles.packageCalculator__labelRow}>
                <label className={styles.packageCalculator__label} htmlFor="calculator-area">
                  Площадь квартиры
                </label>
                <span className={styles.packageCalculator__helper}>{area} м²</span>
              </div>
              <input
                id="calculator-area"
                className={styles.packageCalculator__range}
                max={130}
                min={35}
                step={1}
                type="range"
                value={area}
                onChange={(event) => setArea(Number(event.target.value))}
              />
              <div className={styles.packageCalculator__areaMarks}>
                {packageCalculator.areaMarks.map((value) => (
                  <button
                    className={`${styles.packageCalculator__areaMark} ${
                      area === value ? styles.packageCalculator__areaMark_active : ''
                    }`}
                    key={value}
                    type="button"
                    onClick={() => setArea(value)}
                  >
                    {value} м²
                  </button>
                ))}
              </div>
            </div>

            <fieldset className={styles.packageCalculator__formGroup}>
              <legend className={styles.packageCalculator__legend}>Тип объекта</legend>
              <div className={styles.packageCalculator__typeGrid}>
                {packageCalculator.propertyTypes.map((option) => (
                  <button
                    className={`${styles.packageCalculator__typeCard} ${
                      propertyType === option.value ? styles.packageCalculator__typeCard_active : ''
                    }`}
                    key={option.value}
                    type="button"
                    onClick={() => setPropertyType(option.value)}
                  >
                    <span className={styles.packageCalculator__typeCardLabel}>{option.label}</span>
                    <span className={styles.packageCalculator__typeCardHelper}>{option.helper}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {mode === 'package' ? (
              <fieldset className={styles.packageCalculator__formGroup}>
                <legend className={styles.packageCalculator__legend}>Вариант комплектации</legend>
                <div className={styles.packageCalculator__variantGrid}>
                  {packageCalculator.packageVariants.map((variant) => (
                    <button
                      className={`${styles.packageCalculator__variantCard} ${
                        packageVariant === variant.value ? styles.packageCalculator__variantCard_active : ''
                      }`}
                      key={variant.value}
                      type="button"
                      onClick={() => setPackageVariant(variant.value)}
                    >
                      <span className={styles.packageCalculator__variantCardLabel}>{variant.label}</span>
                      <span className={styles.packageCalculator__variantCardHelper}>{variant.helper}</span>
                      <strong className={styles.packageCalculator__variantCardRate}>
                        {formatMoney(variant.ratePerM2)} / м²
                      </strong>
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : (
              <>
                <div className={styles.packageCalculator__compactGrid}>
                  <fieldset className={styles.packageCalculator__formGroup}>
                    <legend className={styles.packageCalculator__legend}>Уровень отделки</legend>
                    <div className={styles.packageCalculator__choiceGrid}>
                      {packageCalculator.finishLevels.map((option) => (
                        <button
                          className={`${styles.packageCalculator__choiceButton} ${
                            finish === option.value ? styles.packageCalculator__choiceButton_active : ''
                          }`}
                          key={option.value}
                          type="button"
                          onClick={() => setFinish(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className={styles.packageCalculator__formGroup}>
                    <legend className={styles.packageCalculator__legend}>Сложность проекта</legend>
                    <div className={styles.packageCalculator__choiceGrid}>
                      {packageCalculator.complexityLevels.map((option) => (
                        <button
                          className={`${styles.packageCalculator__choiceButton} ${
                            complexity === option.value ? styles.packageCalculator__choiceButton_active : ''
                          }`}
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

                <fieldset className={styles.packageCalculator__formGroup}>
                  <legend className={styles.packageCalculator__legend}>Дополнительные работы</legend>
                  <div className={styles.packageCalculator__optionGrid}>
                    {visibleOptions.map((option) => (
                      <label className={styles.packageCalculator__optionCard} key={option.value}>
                        <div className={styles.packageCalculator__optionCardHeader}>
                          <input
                            className={styles.packageCalculator__optionCheckbox}
                            checked={selectedOptions.includes(option.value)}
                            type="checkbox"
                            onChange={() => toggleOption(option.value)}
                          />
                          <span className={styles.packageCalculator__optionLabel}>{option.label}</span>
                        </div>
                        <small className={styles.packageCalculator__optionHelper}>{option.helper}</small>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
          </div>

          <aside
            className={`${styles.packageCalculator__result} ${
              showMobileResultDetails ? styles.packageCalculator__result_detailsOpen : ''
            }`}
            data-reveal
          >
            <div className={styles.packageCalculator__resultTop}>
              <p className={styles.packageCalculator__resultEyebrow}>{estimate.label}</p>
              <p className={styles.packageCalculator__resultSummary}>{estimate.summary}</p>
            </div>

            <div className={styles.packageCalculator__resultPanel}>
              <span className={styles.packageCalculator__resultCaption}>{estimate.priceLabel}</span>
              <strong className={styles.packageCalculator__resultPrice}>
                {estimate.mode === 'package'
                  ? formatMoney(estimate.total)
                  : `${formatMoney(estimate.rangeMin)} — ${formatMoney(estimate.rangeMax)}`}
              </strong>
              <div className={styles.packageCalculator__resultMetaLine}>
                <span>{estimate.rateText}</span>
                <span>{estimate.note}</span>
              </div>
            </div>

            <button
              className={styles.packageCalculator__detailsToggle}
              type="button"
              aria-expanded={showMobileResultDetails}
              onClick={() => setShowMobileResultDetails((current) => !current)}
            >
              {showMobileResultDetails ? 'Скрыть детали' : 'Подробнее'}
            </button>

            <div className={styles.packageCalculator__metrics}>
              <div className={styles.packageCalculator__metric}>
                <span className={styles.packageCalculator__metricLabel}>Площадь</span>
                <strong className={styles.packageCalculator__metricValue}>{area} м²</strong>
              </div>
              <div className={styles.packageCalculator__metric}>
                <span className={styles.packageCalculator__metricLabel}>Срок</span>
                <strong className={styles.packageCalculator__metricValue}>{estimate.durationText}</strong>
              </div>
              <div className={styles.packageCalculator__metric}>
                <span className={styles.packageCalculator__metricLabel}>Формат</span>
                <strong className={styles.packageCalculator__metricValue}>
                  {mode === 'package'
                    ? `${selectedPackage.label} • ${propertyLabels[propertyType]}`
                    : `${propertyLabels[propertyType]} • ${finishLabels[finish]}`}
                </strong>
              </div>
            </div>

            <ul className={styles.packageCalculator__notes}>
              {packageCalculator.notes.map((note) => (
                <li className={styles.packageCalculator__note} key={note}>
                  {note}
                </li>
              ))}
            </ul>

            <div className={styles.packageCalculator__actions}>
              <ModalTriggerButton
                className={styles.packageCalculator__button}
                intent="calculation"
                requestType={mode}
                source="home-calculator-result"
                calculatorContext={calculatorLeadContext}
              >
                Получить расчёт
              </ModalTriggerButton>
              <ModalTriggerButton
                className={styles.packageCalculator__buttonAlt}
                intent={mode}
                source="home-calculator-format"
                variant="outline"
                calculatorContext={calculatorLeadContext}
              >
                Обсудить формат
              </ModalTriggerButton>
            </div>
          </aside>
        </div>
      </PageWrapper>
    </section>
  )
}
