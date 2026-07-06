import { company } from '@/shared/config/company'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './HomeSocials.module.scss'

const socials = [
  {
    title: 'VK',
    text: 'Показываем проекты, заметки о ремонте и полезные публикации для клиентов.',
    href: company.vkHref,
  },
  {
    title: 'Telegram',
    text: 'Публикуем новости, быстрые обновления и короткие рабочие заметки с объектов.',
    href: company.telegramHref,
  },
  {
    title: 'YouTube',
    text: 'Видеообзоры с объектов, примеры работ и ответы на частые вопросы.',
    href: null,
  },
] as const

export function HomeSocials() {
  return (
    <section className={styles.socials + ' ' + styles.sectionpad}>
      <div className={styles.socialslayout}>
        <div className={styles.socialsintro} data-reveal>
          <div className={styles.sectionkicker + ' ' + styles.sectionkickerlight}>
            <span>08</span>
            <p>Следите за нами</p>
          </div>
          <h2>
            Живые проекты,
            <br />
            полезные материалы и <em>новости компании</em>
          </h2>
          <p>
            Соцсети помогают быстрее увидеть стиль работы и почувствовать, как мы ведём проекты. В
            них же мы показываем промежуточные этапы, полезные советы и новости команды.
          </p>
        </div>

        <div className={styles.socialscontent} data-reveal>
          <div className={styles.socialsvisual}>
            <div className={styles.visualframe}>
              <span className={styles.visualkicker}>Что публикуем в первую очередь</span>
              <div className={styles.visualfeed}>
                <article>
                  <span>01</span>
                  <p>Реальные кадры с объектов</p>
                </article>
                <article>
                  <span>02</span>
                  <p>До и после ремонта</p>
                </article>
                <article>
                  <span>03</span>
                  <p>Полезные заметки по ремонту</p>
                </article>
              </div>
            </div>
          </div>

          <div className={styles.sociallinks}>
            {socials.map((social) =>
              social.href ? (
                <a className={styles.socialcard} href={social.href} key={social.title} target="_blank" rel="noreferrer">
                  <div>
                    <strong>{social.title}</strong>
                    <p>{social.text}</p>
                  </div>
                  <ArrowIcon />
                </a>
              ) : (
                <div className={styles.socialcard + ' ' + styles.socialcarddisabled} key={social.title}>
                  <div>
                    <strong>{social.title}</strong>
                    <p>{social.text}</p>
                  </div>
                  <span>Скоро</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
