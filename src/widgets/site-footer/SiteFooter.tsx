import { Link } from 'react-router'

import { company } from '@/shared/config/company'

import styles from './SiteFooter.module.scss'

export function SiteFooter() {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerTop}>
        <Link className={`brand ${styles.footerBrand}`} to="/">
          <span className="brand-word">анфас</span>
          <span className="brand-caption">
            дизайн
            <br />и ремонт
          </span>
        </Link>
        <div className={styles.footerItem}>
          <span className={styles.footerLabel}>Позвонить</span>
          <a href={company.phoneHref}>{company.phone}</a>
        </div>
        <div className={styles.footerItem}>
          <span className={styles.footerLabel}>Написать</span>
          <a href={company.emailHref}>{company.email}</a>
        </div>
        <div className={styles.footerItem}>
          <span className={styles.footerLabel}>Приехать</span>
          <p className={styles.footerText}>
            Санкт-Петербург,
            <br />
            наб. Обводного канала, 118АХ
          </p>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span className={styles.footerCopyright}>© 2012–2026 «Анфас»</span>
        <Link to="/privacy">Политика конфиденциальности</Link>
        <div className={styles.footerSocials}>
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