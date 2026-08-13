export type InstagramReel = {
  href: string
  cover: string
  coverAlt: string
  title?: string
}

/**
 * Reels подтверждены через Instagram oEmbed (title + thumbnail).
 * Обложки сохранены локально из thumbnail_url публикации.
 */
export const instagramReels: InstagramReel[] = [
  {
    href: 'https://www.instagram.com/anfas_remont/reel/Db-KN6YERDD/',
    cover: '/images/about/instagram/podvesnoj-potolok.webp',
    coverAlt: 'Превью Reel Анфас: из чего состоит надежный подвесной потолок',
    title: 'Из чего состоит надежный подвесной потолок?',
  },
  {
    href: 'https://www.instagram.com/anfas_remont/reel/Db5ANErkSWt/',
    cover: '/images/about/instagram/svetilniki-technolight.webp',
    coverAlt: 'Превью Reel Анфас: светильники TechnoLight на объекте',
    title: 'Светильники TechnoLight',
  },
  {
    href: 'https://www.instagram.com/anfas_remont/reel/Dbz2tdFFb7N/',
    cover: '/images/about/instagram/layfhak.webp',
    coverAlt: 'Превью Reel Анфас: рабочий лайфхак на объекте',
    title: 'Девочки, годный лайфхак?',
  },
  {
    href: 'https://www.instagram.com/anfas_remont/reel/DbutPhkiUOG/',
    cover: '/images/about/instagram/shtukaturka.webp',
    coverAlt: 'Превью Reel Анфас: последствия некачественной штукатурки',
    title: 'Хотели сэкономить, а потеряли втрое больше?',
  },
  {
    href: 'https://www.instagram.com/anfas_remont/reel/DbsIQuDDqJb/',
    cover: '/images/about/instagram/petrovich.webp',
    coverAlt: 'Превью Reel Анфас: материалы и Петрович',
    title: 'Петрович, место встречи изменить нельзя',
  },
  {
    href: 'https://www.instagram.com/anfas_remont/reel/DbpjdXSgXSn/',
    cover: '/images/about/instagram/chernovoj-etap-nisha.webp',
    coverAlt: 'Превью Reel Анфас: работы на черновом этапе и ниша в ванной',
    title: 'Какие работы нужно проводить ещё на черновом этапе?',
  },
  {
    href: 'https://www.instagram.com/anfas_remont/reel/Dbm-zzhD4vq/',
    cover: '/images/about/instagram/podbor-materialov.webp',
    coverAlt: 'Превью Reel Анфас: почему подбор материалов стоит доверить дизайнеру',
    title: 'Почему стоит доверить подбор материалов дизайнеру?',
  },
  {
    href: 'https://www.instagram.com/anfas_remont/reel/DbkZ5ybks-i/',
    cover: '/images/about/instagram/skrytyj-karniz.webp',
    coverAlt: 'Превью Reel Анфас: скрытый карниз в интерьере',
    title: 'Почему сегодня заказчики всё чаще выбирают скрытый карниз?',
  },
]
