import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router'

import { useBrief } from '@/features/brief/model/BriefContext'
import { services } from '@/entities/service/model/services.data'
import { company } from '@/shared/config/company'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { META_DISCLAIMER } from '@/widgets/home/socials/model/socials.data'

import styles from './SiteFooter.module.scss'

const footerPages = [
  { label: 'Главная', to: '/' },
  { label: 'Услуги', to: '/services' },
  { label: 'Проекты', to: '/projects' },
  { label: 'О нас', to: '/about' },
  { label: 'Контакты', to: '/contacts' },
  { label: 'Политика', to: '/privacy' },
] as const

const footerSocials = [
  { label: 'VK', href: company.vkHref },
  { label: 'Telegram', href: company.telegramHref },
  { label: 'YouTube', href: company.youtubeHref },
  { label: 'Instagram', href: company.instagramHref },
] as const

function FooterSocials({ className }: { className?: string }) {
  return (
    <div className={className}>
      {footerSocials.map((social) => (
        <a href={social.href} key={social.label} target="_blank" rel="noreferrer">
          {social.label}
        </a>
      ))}
    </div>
  )
}

function FooterAccordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className={styles.siteFooter__accordion}>
      <button
        type="button"
        className={styles.siteFooter__accordionTrigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{title}</span>
        <i
          className={
            styles.siteFooter__accordionIcon +
            (open ? ` ${styles.siteFooter__accordionIcon_open}` : '')
          }
          aria-hidden="true"
        />
      </button>
      <div className={styles.siteFooter__accordionPanel} id={panelId} hidden={!open}>
        {children}
      </div>
    </div>
  )
}

function FooterContactCards() {
  return (
    <div className={styles.siteFooter__contactCards}>
      <div className={styles.siteFooter__contactCard}>
        <span className={styles.siteFooter__contactLabel}>Телефон</span>
        <a className={styles.siteFooter__contactValue} href={company.phoneHref}>
          {company.phone}
        </a>
      </div>
      <div className={styles.siteFooter__contactCard}>
        <span className={styles.siteFooter__contactLabel}>Почта</span>
        <a className={styles.siteFooter__contactValue} href={company.emailHref}>
          {company.email}
        </a>
      </div>
      <div className={`${styles.siteFooter__contactCard} ${styles.siteFooter__contactCard_wide}`}>
        <span className={styles.siteFooter__contactLabel}>Адрес</span>
        <p className={styles.siteFooter__contactValue}>{company.address}</p>
      </div>
    </div>
  )
}

export function SiteFooter() {
  const { openBrief } = useBrief()

  return (
    <footer className={styles.siteFooter}>
      <PageWrapper>
        <div className={styles.siteFooter__top}>
          <div className={styles.siteFooter__brandColumn}>
            <Link className={`brand ${styles.siteFooter__brand}`} to="/" aria-label={`${company.name} — на главную`}>
              <img className="brand-logo" src="/images/anfas-logo-official.svg" alt={company.name} />
            </Link>
            <p className={styles.siteFooter__brandLead}>
              Ремонт квартир под ключ в Санкт-Петербурге: дизайн, комплектация и реализация в одной
              системе без хаоса, плавающих сроков и непрозрачных решений.
            </p>
            <button className={styles.siteFooter__cta} type="button" onClick={() => openBrief('general')}>
              Обсудить проект
            </button>
            <FooterSocials className={styles.siteFooter__socials} />
          </div>

          <div className={styles.siteFooter__columnsDesktop}>
            <div className={styles.siteFooter__column}>
              <span className={styles.siteFooter__title}>Навигация</span>
              <nav className={styles.siteFooter__nav} aria-label="Навигация по сайту">
                {footerPages.map((page) => (
                  <Link key={page.to} to={page.to}>
                    {page.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className={styles.siteFooter__column}>
              <span className={styles.siteFooter__title}>Услуги</span>
              <nav className={styles.siteFooter__nav} aria-label="Навигация по услугам">
                {services.slice(0, 5).map((service) => (
                  <Link key={service.id} to={`/services#${service.id}`}>
                    {service.title}
                  </Link>
                ))}
              </nav>
            </div>

            <div className={styles.siteFooter__column}>
              <span className={styles.siteFooter__title}>Контакты</span>
              <FooterContactCards />
            </div>
          </div>

          <div className={styles.siteFooter__mobile}>
            <FooterAccordion title="Навигация">
              <nav className={styles.siteFooter__nav} aria-label="Навигация по сайту">
                {footerPages.map((page) => (
                  <Link key={page.to} to={page.to}>
                    {page.label}
                  </Link>
                ))}
              </nav>
            </FooterAccordion>

            <FooterAccordion title="Услуги">
              <nav className={styles.siteFooter__nav} aria-label="Навигация по услугам">
                {services.slice(0, 5).map((service) => (
                  <Link key={service.id} to={`/services#${service.id}`}>
                    {service.title}
                  </Link>
                ))}
              </nav>
            </FooterAccordion>

            <div className={styles.siteFooter__mobileContacts}>
              <FooterContactCards />
            </div>

            <FooterSocials className={styles.siteFooter__mobileSocials} />
            <p className={styles.siteFooter__metaDisclaimer}>{META_DISCLAIMER}</p>
          </div>
        </div>

        <div className={styles.siteFooter__bottom}>
          <div className={styles.siteFooter__legal}>
            <span className={styles.siteFooter__copyright}>© 2012–2026 Анфас</span>
            <p className={styles.siteFooter__legalText}>
              Владелец сайта:{' '}
              <a
                className={styles.siteFooter__legalLink}
                href={company.legalProfileHref}
                target="_blank"
                rel="noreferrer"
              >
                {company.legalOwner}
              </a>
            </p>
            <p className={styles.siteFooter__legalText}>ИНН {company.legalInn}</p>
            <p className={styles.siteFooter__legalText}>
              {company.legalRegLabel} {company.legalRegNumber}
            </p>
          </div>
          <Link className={styles.siteFooter__privacy} to="/privacy">
            Политика конфиденциальности
          </Link>
        </div>
      </PageWrapper>
    </footer>
  )
}
