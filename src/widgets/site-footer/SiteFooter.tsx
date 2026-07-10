import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router'

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
    <div className={styles.accordion}>
      <button
        type="button"
        className={styles.accordionTrigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{title}</span>
        <i
          className={styles.accordionIcon + (open ? ` ${styles.accordionIconOpen}` : '')}
          aria-hidden="true"
        />
      </button>
      <div className={styles.accordionPanel} id={panelId} hidden={!open}>
        {children}
      </div>
    </div>
  )
}

function FooterContactCards() {
  return (
    <div className={styles.contactCards}>
      <div>
        <span>Телефон</span>
        <a href={company.phoneHref}>{company.phone}</a>
      </div>
      <div>
        <span>Почта</span>
        <a href={company.emailHref}>{company.email}</a>
      </div>
      <div className={styles.contactCardWide}>
        <span>Адрес</span>
        <p>
          Санкт-Петербург,
          <br />
          наб. Обводного канала, 118АХ
        </p>
      </div>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className={styles.siteFooter}>
      <PageWrapper>
        <div className={styles.footerTop}>
          <div className={styles.brandColumn}>
            <Link className={`brand ${styles.footerBrand}`} to="/">
              <span className="brand-word">Анфас</span>
              <span className="brand-caption">
                дизайн
                <br />
                и ремонт
              </span>
            </Link>
            <p className={styles.brandLead}>
              Системный подход к ремонту и дизайну интерьера, прозрачные этапы, понятный бюджет и
              контроль на каждом шаге.
            </p>
            <FooterSocials className={styles.socials} />
          </div>

          <div className={styles.footerColumnsDesktop}>
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
              <FooterContactCards />
            </div>
          </div>

          <div className={styles.footerMobile}>
            <FooterAccordion title="Навигация">
              <nav className={styles.footerNav} aria-label="Навигация по сайту">
                {footerPages.map((page) => (
                  <Link key={page.to} to={page.to}>
                    {page.label}
                  </Link>
                ))}
              </nav>
            </FooterAccordion>

            <FooterAccordion title="Услуги">
              <nav className={styles.footerNav} aria-label="Навигация по услугам">
                {services.slice(0, 5).map((service) => (
                  <Link key={service.id} to={`/services#${service.id}`}>
                    {service.title}
                  </Link>
                ))}
              </nav>
            </FooterAccordion>

            <div className={styles.mobileContacts}>
              <span className={styles.footerTitle}>Контакты</span>
              <FooterContactCards />
            </div>

            <FooterSocials className={styles.mobileSocials} />
            <p className={styles.metaDisclaimer}>{META_DISCLAIMER}</p>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerLegal}>
            <span className={styles.footerCopyright}>© 2012–2026 Анфас</span>
            <p>
              Владелец сайта:{' '}
              <a href={company.legalProfileHref} target="_blank" rel="noreferrer">
                {company.legalOwner}
              </a>
            </p>
            <p>ИНН {company.legalInn}</p>
            <p>ОГРНИП {company.legalOgrnip}</p>
          </div>
          <Link className={styles.footerPrivacy} to="/privacy">
            Политика конфиденциальности
          </Link>
        </div>
      </PageWrapper>
    </footer>
  )
}
