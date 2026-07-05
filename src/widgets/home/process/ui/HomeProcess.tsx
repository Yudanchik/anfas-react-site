import { processSteps } from '@/entities/process/model/process.data'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import styles from './HomeProcess.module.scss'

export function HomeProcess({ onOpenBrief }: { onOpenBrief: () => void }) {
  return (
    <section id="process" className={styles.process + ' ' + styles.sectionpad}>
      <div className={styles.processintro}>
        <div className={styles.sectionkicker} data-reveal>
          <span>05</span>
          <p>Как всё устроено</p>
        </div>
        <h2 data-reveal>
          Пять понятных
          <br />
          шагов до <em>дома.</em>
        </h2>
        <p data-reveal>
          Без туманных формулировок и «разберёмся по ходу». Каждый этап имеет результат, срок и
          ответственного.
        </p>
        <button className={styles.outlinebutton} type="button" onClick={onOpenBrief} data-reveal>
          <span>Начать с первого шага</span>
          <ArrowIcon />
        </button>
      </div>

      <div className={styles.processsteps}>
        {processSteps.map((step, index) => (
          <article key={step.title} data-reveal>
            <span>0{index + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
