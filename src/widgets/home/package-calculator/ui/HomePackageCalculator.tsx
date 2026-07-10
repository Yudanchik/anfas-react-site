import { useMemo, useState } from 'react'

import { PageWrapper } from '@/shared/ui/page-wrapper'
import { packageCalculator } from '../model/package-calculator.data'
import { SectionHeader } from '../../ui'

import styles from './HomePackageCalculator.module.scss'

type RoomType = (typeof packageCalculator.roomTypes)[number]['value']
type LevelType = (typeof packageCalculator.levels)[number]['value']
type OptionType = (typeof packageCalculator.options)[number]['value']

const areaDefaults = packageCalculator.areaOptions[1].value
const roomDefaults: RoomType = packageCalculator.roomTypes[1].value
const levelDefaults: LevelType = packageCalculator.levels[1].value

const levelRates: Record<LevelType, number> = {
  basic: 108000,
  standard: 132000,
  premium: 162000,
}

const levelWeeks: Record<LevelType, number> = {
  basic: 10,
  standard: 12,
  premium: 14,
}

const optionCosts: Record<OptionType, number> = {
  furniture: 450000,
  appliances: 320000,
  design: 260000,
}

const optionWeeks: Record<OptionType, number> = {
  furniture: 1,
  appliances: 1,
  design: 2,
}

export function HomePackageCalculator({ onOpenBrief }: { onOpenBrief: () => void }) {
  const [area, setArea] = useState<number>(areaDefaults)
  const [roomType, setRoomType] = useState<RoomType>(roomDefaults)
  const [level, setLevel] = useState<LevelType>(levelDefaults)
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([])

  const estimate = useMemo(() => {
    const baseCost = area * levelRates[level]
    const extraCost = selectedOptions.reduce((sum, option) => sum + optionCosts[option], 0)
    const roomMultiplier = roomType === 'studio' ? 0.92 : roomType === 'one' ? 1 : roomType === 'two' ? 1.08 : 1.14
    const totalCost = Math.round((baseCost + extraCost) * roomMultiplier)
    const totalWeeks = Math.round(levelWeeks[level] + selectedOptions.reduce((sum, option) => sum + optionWeeks[option], 0))

    return {
      totalCost,
      totalWeeks,
      rangeMin: Math.round(totalCost * 0.88),
      rangeMax: Math.round(totalCost * 1.08),
    }
  }, [area, level, roomType, selectedOptions])

  const toggleOption = (value: OptionType) => {
    setSelectedOptions((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  return (
    <section id="calculator" className={styles.calculator}>
      <PageWrapper className={styles.layout}>
        <SectionHeader
          number="05"
          label={packageCalculator.eyebrow}
          title={
            <>
              {packageCalculator.title}
              <br />
              <em>за 1 минуту</em>
            </>
          }
          lead={packageCalculator.lead}
        />

        <div className={styles.grid}>
          <div className={styles.form} data-reveal>
            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="calculator-area">Площадь квартиры</label>
                <span className={styles.helper}>{area} м²</span>
              </div>
              <input
                id="calculator-area"
                className={styles.range}
                max={100}
                min={35}
                step={5}
                type="range"
                value={area}
                onChange={(event) => setArea(Number(event.target.value))}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="calculator-room">Тип помещения</label>
              <select id="calculator-room" className={styles.select} value={roomType} onChange={(event) => setRoomType(event.target.value as RoomType)}>
                {packageCalculator.roomTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="calculator-level">Уровень комплектации</label>
              <select id="calculator-level" className={styles.select} value={level} onChange={(event) => setLevel(event.target.value as LevelType)}>
                {packageCalculator.levels.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className={styles.formGroup}>
              <legend>Дополнительные опции</legend>
              <div className={styles.optionList}>
                {packageCalculator.options.map((option) => (
                  <label className={styles.optionLabel} key={option.value}>
                    <input
                      checked={selectedOptions.includes(option.value)}
                      type="checkbox"
                      onChange={() => toggleOption(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <aside className={styles.result} data-reveal>
            <div className={styles.resultTitle}>
              <h3>Ориентир по расчёту</h3>
              <p className={styles.resultBadge}>Пакетный ремонт</p>
            </div>

            <div className={styles.metrics}>
              <div className={styles.metric}>
                <span>Стоимость</span>
                <strong>{estimate.rangeMin.toLocaleString('ru-RU')} — {estimate.rangeMax.toLocaleString('ru-RU')} ₽</strong>
              </div>
              <div className={styles.metric}>
                <span>Срок</span>
                <strong>{estimate.totalWeeks} недель</strong>
              </div>
            </div>

            <ul className={styles.notes}>
              {packageCalculator.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>

            <div className={styles.actions}>
              <button className={styles.button} type="button" onClick={onOpenBrief}>
                Получить расчёт
              </button>
              <button className={styles.buttonAlt} type="button" onClick={onOpenBrief}>
                Обсудить пакет
              </button>
            </div>
          </aside>
        </div>
      </PageWrapper>
    </section>
  )
}
