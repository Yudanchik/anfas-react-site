import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'

import { useBrief } from '@/features/brief/model/BriefContext'

const navigation = [
  { label: 'Услуги', to: '/services' },
  { label: 'Проекты', to: '/projects' },
  { label: 'О нас', to: '/about' },
  { label: 'Контакты', to: '/contacts' },
] as const

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
      <header className={`site-header ${isHome ? '' : 'is-inner'}`}>
        <Link
          className="brand"
          to="/"
          aria-label="Анфас — на главную"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-word">анфас</span>
          <span className="brand-caption">
            дизайн
            <br />и ремонт
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Основная навигация">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="header-phone" type="button" onClick={openBrief}>
          <span>Обсудить проект</span>
          <b>+7 (812) 200-80-71</b>
        </button>

        <button
          className={`menu-button ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav>
          {navigation.map((item, index) => (
            <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-menu-footer">
          <a href="tel:+78122008071">+7 (812) 200-80-71</a>
          <a href="mailto:anfas-art@mail.ru">anfas-art@mail.ru</a>
        </div>
      </div>
    </>
  )
}
