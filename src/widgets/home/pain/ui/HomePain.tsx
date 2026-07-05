import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'
import styles from './HomePain.module.scss'

const pains = [
  {
    title: 'Сроки сдвигаются',
    text: 'Когда нет прозрачного графика, ремонт расползается по неделям и превращается в бесконечное ожидание.',
  },
  {
    title: 'Бюджет растёт без предупреждения',
    text: 'Пользователь часто узнаёт о реальной стоимости уже в процессе, когда отказаться сложнее и дороже.',
  },
  {
    title: 'Неясно, что происходит на объекте',
    text: 'Если нет фотоотчётов и понятных этапов, клиент не понимает, на какой стадии находится ремонт.',
  },
]

const solutions = [
  {
    title: 'Понятный график и этапы',
    text: 'Фиксируем последовательность работ, чтобы у клиента был прогноз по срокам и контроль над процессом.',
  },
  {
    title: 'Прозрачная смета и контроль бюджета',
    text: 'Показываем, из чего складывается стоимость, и не прячем важные изменения внутри процесса.',
  },
  {
    title: 'Отчёты и удалённый контроль',
    text: 'Клиент видит фото, видео и статус работ — даже если он находится в другом городе.',
  },
]

export function HomePain({ onOpenBrief }: { onOpenBrief: () => void }) {
  return (
    <section id="pain" className={styles.pain + ' ' + styles.sectionpad}>
      <div className={styles.paintitle} data-reveal>
        <div className={styles.sectionkicker}>
          <span>02</span>
          <p>Боль / решение</p>
        </div>
        <h2>
          Что чаще всего
          <br />
          пугает клиентов <em>в ремонте</em>
        </h2>
        <p className={styles.painlead}>
          Мы не уводим разговор в абстракции. Сначала показываем, что именно обычно вызывает стресс, а затем — как мы снимаем этот риск системой, процессом и понятными правилами.
        </p>
        <button className={styles.paincta} type="button" onClick={onOpenBrief} data-reveal>
          <span>Обсудить формат ремонта</span>
          <ArrowIcon />
        </button>
      </div>

      <div className={styles.paingrid}>
        <div className={styles.paincolumn} data-reveal>
          <p className={styles.paincolumnhead}>Частые боли</p>
          <div className={styles.painlist}>
            {pains.map((item) => (
              <article className={styles.paincard} key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.paincolumn + ' ' + styles.paincolumnsolution} data-reveal>
          <p className={styles.paincolumnhead}>Что делаем мы</p>
          <div className={styles.painlist}>
            {solutions.map((item) => (
              <article className={styles.paincard} key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
