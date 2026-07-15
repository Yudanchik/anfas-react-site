# SEO route matrix

Дата: 15 июля 2026.

| Маршрут | Тип | Индексация | Canonical | Sitemap | Meta-источник | Комментарий |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Главная | index, follow | `https://anfas-art.ru/` | Да | `src/routes/home/route.tsx` | Основная посадочная под ремонт квартир под ключ |
| `/services` | Услуги | index, follow | `https://anfas-art.ru/services` | Да | `src/routes/services/route.tsx` | Индивидуальный и пакетный ремонт |
| `/projects` | Портфолио | index, follow | `https://anfas-art.ru/projects` | Да | `src/routes/projects/route.tsx` | Список реализованных проектов |
| `/projects/2-murinskiy-37` | Проект | index, follow | `https://anfas-art.ru/projects/2-murinskiy-37` | Да | `src/routes/project/route.tsx` | OG-картинка из данных проекта |
| `/projects/zhk-grafika` | Проект | index, follow | `https://anfas-art.ru/projects/zhk-grafika` | Да | `src/routes/project/route.tsx` | OG-картинка из данных проекта |
| `/projects/verkhnekamenskaya` | Проект | index, follow | `https://anfas-art.ru/projects/verkhnekamenskaya` | Да | `src/routes/project/route.tsx` | OG-картинка из данных проекта |
| `/projects/prospekt-slavy-4` | Проект | index, follow | `https://anfas-art.ru/projects/prospekt-slavy-4` | Да | `src/routes/project/route.tsx` | OG-картинка из данных проекта |
| `/projects/forest-akvilon` | Проект | index, follow | `https://anfas-art.ru/projects/forest-akvilon` | Да | `src/routes/project/route.tsx` | OG-картинка из данных проекта |
| `/projects/id-kudrovo` | Проект | index, follow | `https://anfas-art.ru/projects/id-kudrovo` | Да | `src/routes/project/route.tsx` | OG-картинка из данных проекта |
| `/projects/grand-house` | Проект | index, follow | `https://anfas-art.ru/projects/grand-house` | Да | `src/routes/project/route.tsx` | OG-картинка из данных проекта |
| `/about` | О компании | index, follow | `https://anfas-art.ru/about` | Да | `src/routes/about/route.tsx` | Информация о подходе и компании |
| `/contacts` | Контакты | index, follow | `https://anfas-art.ru/contacts` | Да | `src/routes/contacts/route.tsx` | Телефон, почта, адрес и реквизиты |
| `/privacy` | Документ | noindex, nofollow | `https://anfas-art.ru/privacy` | Нет | `src/routes/privacy/route.tsx` | Служебная страница, исключена из sitemap |
| `*` | 404 | noindex, nofollow | `https://anfas-art.ru/` | Нет | `src/routes/not-found/route.tsx` | Служебный маршрут ошибки |

## Ручная проверка после деплоя

- Открыть HTML каждой индексируемой страницы и проверить один canonical.
- Проверить, что canonical совпадает с фактическим production URL.
- Проверить, что privacy и 404 не попали в sitemap.
- Проверить, что страницы проектов отдают уникальные `title`, `description`, `og:url` и `og:image`.
