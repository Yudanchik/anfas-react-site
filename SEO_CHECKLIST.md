# SEO checklist

## Сделано в текущем этапе

- [x] Проверена ветка и чистота рабочего дерева перед началом.
- [x] Создана рабочая ветка `feat/seo-improvements`.
- [x] Добавлен единый SEO-хелпер.
- [x] Добавлены canonical URL для route meta.
- [x] Добавлены `robots` meta для route meta.
- [x] Добавлены Open Graph URL/image/type/locale.
- [x] Добавлен Twitter Card.
- [x] Добавлен JSON-LD `Organization`.
- [x] Добавлен favicon на существующий официальный SVG-логотип.
- [x] Добавлен `robots.txt`.
- [x] Добавлен `sitemap.xml`.
- [x] Служебные страницы privacy и 404 оставлены `noindex`.
- [x] Создана SEO route matrix.

## Что проверить перед production

- [ ] Подтвердить production-домен `https://anfas-art.ru`.
- [ ] Проверить доступность `/robots.txt`.
- [ ] Проверить доступность `/sitemap.xml`.
- [ ] Проверить canonical в production HTML.
- [ ] Проверить Open Graph через валидатор соцсетей.
- [ ] Проверить индексацию в Яндекс.Вебмастере и Google Search Console.
- [ ] Добавить подтверждённые ID аналитики, если они есть у заказчика.

## Что можно улучшить позже

- [ ] Генерировать sitemap автоматически из `react-router.config.ts` и данных проектов.
- [ ] Добавить отдельное production OG-изображение 1200x630.
- [ ] Добавить `site.webmanifest` и PNG-иконки разных размеров.
- [ ] Расширить schema.org для услуг и проектов после подтверждения юридических и коммерческих данных.
- [ ] Добавить хлебные крошки `BreadcrumbList` для проектов.
- [ ] Добавить FAQ schema только для реально видимого FAQ-контента.
- [ ] Проверить Core Web Vitals после production-деплоя.
