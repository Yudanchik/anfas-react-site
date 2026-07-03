import { Link } from 'react-router'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link className="brand footer-brand" to="/">
          <span className="brand-word">анфас</span>
          <span className="brand-caption">
            дизайн
            <br />и ремонт
          </span>
        </Link>
        <div>
          <span>Позвонить</span>
          <a href="tel:+78122008071">+7 (812) 200-80-71</a>
        </div>
        <div>
          <span>Написать</span>
          <a href="mailto:anfas-art@mail.ru">anfas-art@mail.ru</a>
        </div>
        <div>
          <span>Приехать</span>
          <p>
            Санкт-Петербург,
            <br />
            наб. Обводного канала, 118АХ
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2012–2026 «Анфас»</span>
        <Link to="/privacy">Политика конфиденциальности</Link>
        <div>
          <a href="https://vk.com/anfas_remont" target="_blank" rel="noreferrer">
            VK
          </a>
          <a href="https://t.me/anfas_remont" target="_blank" rel="noreferrer">
            Telegram
          </a>
        </div>
      </div>
    </footer>
  )
}
