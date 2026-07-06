import { Link } from 'react-router'

import { services } from '@/entities/service/model/services.data'
import { company } from '@/shared/config/company'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './SiteFooter.module.scss'

const footerPages = [
  { label: 'Главная', to: '/' },
  { label: 'Услуги', to: '/services' },
  { label: 'Проекты', to: '/projects' },
  { label: 'О нас', to: '/about' },
  { label: 'Контакты', to: '/contacts' },
  { label: 'Политика', to: '/privacy' },
] as const

export function SiteFooter() {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerTop}>
        <div className={styles.brandColumn}>
          <Link className={`brand ${styles.footerBrand}`} to="/">
            <span className="brand-word">Анфас</span>
            <span className="brand-caption">
              дизайн
              <br />и ремонт
            </span>
          </Link>
          <p className={styles.brandLead}>
            Системный подход к ремонту и дизайну интерьера, прозрачные этапы, понятный бюджет и
            контроль на каждом шаге.
          </p>
          <div className={styles.socials}>
            <a href={company.vkHref} target="_blank" rel="noreferrer">
              VK
            </a>
            <a href={company.telegramHref} target="_blank" rel="noreferrer">
              Telegram
            </a>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <span className={styles.footerTitle}>Навигация</span>
          <nav className={styles.footerNav} aria-label="Навигация по сайту">
            {footerPages.map((page) => (
              <Link key={page.to} to={page.to}>
                {page.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.footerColumn}>
          <span className={styles.footerTitle}>Услуги</span>
          <nav className={styles.footerNav} aria-label="Навигация по услугам">
            {services.slice(0, 5).map((service) => (
              <Link key={service.id} to={`/services#${service.id}`}>
                {service.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.footerColumn}>
          <span className={styles.footerTitle}>Контакты</span>
          <div className={styles.contactCards}>
            <div>
              <span>Телефон</span>
              <a href={company.phoneHref}>{company.phone}</a>
            </div>
            <div>
              <span>Почта</span>
              <a href={company.emailHref}>{company.email}</a>
            </div>
            <div>
              <span>Адрес</span>
              <p>
                Санкт-Петербург,
                <br />наб. Обводного канала, 118АХ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBanner}>
        <div>
          <span className={styles.footerBannerKicker}>Оставайтесь в курсе</span>
          <h3>Подписывайтесь на новости, проекты и полезные материалы по ремонту.</h3>
          <p>
            Мы делимся примерами реализованных объектов, полезными заметками и подходом к ремонту,
            чтобы вам было проще выбрать формат работ.
          </p>
        </div>
        <form className={styles.footerSubscribe}>
          <input type="email" placeholder="Ваша почта" aria-label="Ваш email" />
          <button type="button">
            <span>Подписаться</span>
            <ArrowIcon />
          </button>
        </form>
      </div>

      <div className={styles.footerBottom}>
        <span className={styles.footerCopyright}>© 2012–2026 Анфас</span>
        <Link to="/privacy">Политика конфиденциальности</Link>
        <div className={styles.footerBottomSocials}>
          <a href={company.vkHref} target="_blank" rel="noreferrer">
            VK
          </a>
          <a href={company.telegramHref} target="_blank" rel="noreferrer">
            Telegram
          </a>
        </div>
      </div>
    </footer>
  )
}
