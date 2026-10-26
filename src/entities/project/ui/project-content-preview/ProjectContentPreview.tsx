import type { Project } from '@/entities/project/model/project.types'

import styles from './ProjectContentPreview.module.scss'

const stages = [
  { title: 'До начала работ', task: '2–4 фото исходного состояния и короткое описание задачи.' },
  { title: 'Подготовка и черновые работы', task: '3–5 фото демонтажа, перегородок и подготовки оснований с подписями.' },
  { title: 'Инженерия', task: '3–5 фото электрики, сантехники и вентиляции до закрытия конструкций.' },
  { title: 'Отделка и комплектация', task: '3–5 фото промежуточных этапов и готовых решений с пояснениями.' },
] as const

const budgetRows = ['Проектирование', 'Работы', 'Черновые материалы', 'Чистовые материалы', 'Мебель, техника и комплектация']

export function ProjectContentPreview({ project }: { project: Project }) {
  return (
    <section className={styles.preview} aria-labelledby="project-content-preview-title">
      <header className={styles.banner}>
        <p className={styles.eyebrow}>Макет для подготовки контента</p>
        <h2 id="project-content-preview-title">Собираем подробный кейс: {project.title}</h2>
        <p>
          Пунктиром отмечены места для материалов. Это задания на подготовку, а не готовые
          сведения об объекте. Обычная страница проекта их не показывает.
        </p>
      </header>

      <div className={styles.section}>
        <h3>01 · Паспорт и задача проекта</h3>
        <div className={styles.placeholder}>
          <strong>Подготовить информацию</strong>
          <p>Год начала и завершения, исходное состояние, задачи заказчика и ограничения объекта.</p>
          <p>Уточнить: что входило в срок «{project.term}» и в опубликованный бюджет {project.price}.</p>
        </div>
      </div>

      <div className={styles.section}>
        <h3>02 · Как шли работы</h3>
        <p className={styles.caption}>Для каждого этапа: фотографии, дата или порядок и подпись «что сделали и зачем».</p>
        <div className={styles.stageGrid}>
          {stages.map((stage, index) => (
            <article className={styles.placeholder} key={stage.title}>
              <div className={styles.photoSlot} aria-label={`Место для фото: ${stage.title}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>Подготовить фотографии</span>
              </div>
              <h4>{stage.title}</h4>
              <p>{stage.task}</p>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3>03 · Скрытые работы и контроль</h3>
        <div className={styles.stageGrid}>
          <div className={styles.placeholder}>
            <strong>Подготовить фото узлов до закрытия</strong>
            <p>Подходящие для этого объекта примеры: разводка коммуникаций, гидроизоляция, звукоизоляция или армирование. Для каждого — задача, решение и способ проверки.</p>
          </div>
          <div className={styles.placeholder}>
            <strong>Подготовить подтверждения</strong>
            <p>Акты скрытых работ, испытания и замеры — если они есть по выбранному объекту. Убрать персональные данные перед публикацией.</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>04 · Из чего сложился бюджет</h3>
        <p className={styles.caption}>На сайте сейчас указано {project.price}. Это исходная цифра, а не сумма заполненных строк ниже. Нужны год цен, состав и исключения.</p>
        <div className={styles.budget}>
          <table>
            <caption>Макет разбивки стоимости — суммы пока не внесены</caption>
            <thead><tr><th scope="col">Раздел</th><th scope="col">Сумма и что включено</th></tr></thead>
            <tbody>
              {budgetRows.map((row) => <tr key={row}><th scope="row">{row}</th><td>Подготовить сумму и состав</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className={styles.placeholder}>
          <strong>Подготовить обезличенную смету</strong>
          <p>Выбрать подтверждённые статьи, проверить итог и отдельно указать то, что оплачивалось вне договора. Внутренние расходы компании не подменяют стоимость для заказчика.</p>
        </div>
      </div>

      <div className={styles.section}>
        <h3>05 · Документы и подтверждение результата</h3>
        <div className={styles.stageGrid}>
          <div className={styles.placeholder}>
            <strong>Место для чертежей и материалов проекта</strong>
            <p>План до/после, 2–3 листа рабочей документации или спецификация. Указать авторство и разрешённый к публикации состав.</p>
          </div>
          <div className={styles.placeholder}>
            <strong>Место для проверенного отзыва</strong>
            <p>Оригинал или ссылка на площадку, дата, согласованное имя и связь с этим объектом. Подтвердить происхождение уже размещённого отзыва.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
