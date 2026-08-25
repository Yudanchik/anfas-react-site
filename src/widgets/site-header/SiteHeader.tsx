import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'

import { company, navigation } from '@/shared/config/company'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './SiteHeader.module.scss'

/** Branch convenience link for internal estimate tool; revisit before merge to dev. */
const INTERNAL_NAV = { label: 'Смета', to: '/internal/estimate' } as const

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const navItems = [...navigation, INTERNAL_NAV]
  const isHeroPage =
    pathname === '/' ||
    pathname === '/services' ||
    pathname.startsWith('/services/') ||
    pathname === '/about' ||
    pathname === '/blog' ||
    pathname.startsWith('/blog/') ||
    pathname === '/contacts' ||
    pathname === '/projects' ||
    pathname.startsWith('/projects/') ||
    pathname === '/prices' ||
    pathname.startsWith('/prices/')

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)

    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  return (
    <>
      <header className={`${styles.siteHeader} ${isHeroPage ? styles.siteHeader_glass : styles.siteHeader_innerPage}`}>
        <PageWrapper className={styles.siteHeader__inner}>
          <Link
            className="brand"
            to="/"
            aria-label={`${company.name} — на главную`}
            onClick={() => setMenuOpen(false)}
          >
            <img
              className="brand-logo"
              src="/images/anfas-logo-official.svg"
              alt={company.name}
              width="24460"
              height="3341"
            />
          </Link>

          <nav className={styles.siteHeader__nav} aria-label="Основная навигация">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <a
            className={styles.siteHeader__phone}
            href={company.phoneHref}
            aria-label={`Позвонить по номеру ${company.phone}`}
          >
            <span>Обсудить проект</span>
            <b>{company.phone}</b>
          </a>

          <button
            className={`${styles.siteHeader__menuButton} ${menuOpen ? styles.siteHeader__menuButton_open : ''}`}
            type="button"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className={styles.siteHeader__menuLine} />
            <span className={styles.siteHeader__menuLine} />
          </button>
        </PageWrapper>
      </header>

      <div
        className={`${styles.siteHeader__mobileMenu} ${menuOpen ? styles.siteHeader__mobileMenu_open : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav className={styles.siteHeader__mobileNav}>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.siteHeader__mobileFooter}>
          <a href={company.phoneHref}>{company.phone}</a>
          <a href={company.emailHref}>{company.email}</a>
        </div>
      </div>
    </>
  )
}
