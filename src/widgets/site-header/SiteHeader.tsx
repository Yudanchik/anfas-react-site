import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'

import { useBrief } from '@/features/brief/model/BriefContext'
import { company, navigation } from '@/shared/config/company'
import { PageWrapper } from '@/shared/ui/page-wrapper'

import styles from './SiteHeader.module.scss'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { openBrief } = useBrief()
  const { pathname } = useLocation()
  const isHeroPage =
    pathname === '/' ||
    pathname === '/services' ||
    pathname === '/about' ||
    pathname === '/contacts' ||
    pathname === '/projects' ||
    pathname.startsWith('/projects/')

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
            <img className="brand-logo" src="/images/anfas-logo-official.svg" alt={company.name} />
          </Link>

          <nav className={styles.siteHeader__nav} aria-label="Основная навигация">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button className={styles.siteHeader__phone} type="button" onClick={() => openBrief('general')}>
            <span>Обсудить проект</span>
            <b>{company.phone}</b>
          </button>

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
          {navigation.map((item, index) => (
            <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>
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
