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
  const isHome = pathname === '/'

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)

    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  return (
    <>
      <header className={`${styles.siteHeader} ${isHome ? '' : styles.isInner}`}>
        <PageWrapper className={styles.headerInner}>
          <Link
            className="brand"
            to="/"
            aria-label={`${company.name} — на главную`}
            onClick={() => setMenuOpen(false)}
          >
            <img className="brand-logo" src="/images/anfas-logo-official.svg" alt={company.name} />
          </Link>

          <nav className={styles.desktopNav} aria-label="Основная навигация">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button className={styles.headerPhone} type="button" onClick={openBrief}>
            <span>Обсудить проект</span>
            <b>{company.phone}</b>
          </button>

          <button
            className={`${styles.menuButton} ${menuOpen ? styles.isOpen : ''}`}
            type="button"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </PageWrapper>
      </header>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.isOpen : ''}`} aria-hidden={!menuOpen}>
        <nav>
          {navigation.map((item, index) => (
            <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.mobileMenuFooter}>
          <a href={company.phoneHref}>{company.phone}</a>
          <a href={company.emailHref}>{company.email}</a>
        </div>
      </div>
    </>
  )
}
