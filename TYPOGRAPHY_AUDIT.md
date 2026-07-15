# Дизайнерский аудит типографики Anfas

Дата: 15 июля 2026.

## Краткий вывод

В проект внедрена одна финальная типографическая система на Montserrat. Старый слой текстовых токенов, временные алиасы, локальные числовые размеры текста, локальные `clamp()` для текста, старые Sass-миксины типографики и случайные `line-height` / `letter-spacing` удалены из `src`.

Цель системы: каждый текстовый элемент получает роль по смыслу, а не по названию компонента. Hero использует display-роли, секции используют heading/body, карточки используют heading/body/caption, формы и кнопки используют control-роли.

## Финальные решения

- Оставлена одна система CSS custom properties с префиксом `--type-*`.
- Старые текстовые токены удалены, алиасы обратной совместимости не создавались.
- Mobile minimum для читаемого текста: `12px`.
- `body-md` на mobile: `16px`.
- `button` на mobile: `14px`.
- `caption` на mobile: `12px`.
- Сильный отрицательный tracking не используется.
- Для кириллицы закреплены мягкие значения: display `-0.03em`, heading `-0.02em`, card heading `-0.01em`, body `0`.
- Плавающие размеры текста в `src` не используются. Адаптивность размеров централизована в токенах.
- Локальные числовые `font-size` в `src` не используются: текстовые элементы используют только смысловые `--type-*` токены.
- Локальные `line-height` и `letter-spacing` в `src` заменены на токены.

## Проверка значений меньше 12px

Финальный поиск по `src` не нашёл читаемых или декоративных `font-size` меньше `12px`.

| Файл | Класс | Компонент | Текущее значение | Назначение | Тип текста | Новая роль | Новое значение | Риск |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Не найдено | Не найдено | Не найдено | Нет | Нет | Нет | Нет | Нет | Нет |

## Внедрённые роли

| Роль | Desktop | Tablet | Mobile | Назначение |
| --- | ---: | ---: | ---: | --- |
| display-xl | 72px | 52px | 36px | главный Hero |
| display-lg | 64px | 44px | 32px | Hero внутренних страниц |
| display-md | 52px | 40px | 30px | крупный editorial-заголовок |
| heading-xl | 44px | 36px | 28px | крупная секция |
| heading-lg | 36px | 30px | 24px | обычная секция |
| heading-md | 28px | 24px | 22px | feature-карточка |
| heading-sm | 24px | 22px | 20px | обычная карточка |
| heading-xs | 20px | 20px | 18px | компактная карточка |
| body-lg | 18px | 18px | 16px | лид секции |
| body-md | 16px | 16px | 16px | основной текст |
| body-sm | 14px | 14px | 13px | короткий вторичный текст |
| caption | 12px | 12px | 12px | теги, labels, служебные подписи |
| button | 14px | 14px | 14px | кнопки и интерактивные подписи |
| nav | 14px | 14px | 14px | навигация |
| stat | 44px | 36px | 28px | крупные числа |

## Итог после внедрения

### Что мигрировано

- `src/shared/styles/design-tokens.scss`: финальная шкала, line-height, weights, tracking.
- `src/shared/styles/themes/default/_fonts.scss`: оставлены только семейства шрифтов.
- `src/shared/styles/mixins.scss`: удалена обёртка старого heading-mixin.
- Компоненты главной страницы: Hero, Manifesto, Pains, ProjectControl, Individual, Capsule, Paths, Calculator, Partners, Socials, Process, Contact, FAQ, Projects, Services.
- Shared-компоненты и layout: SiteHeader, SiteFooter, SectionHeader, PageWrapper, SeoContentBlock.
- Route styles: services, shared inner pages, pages project/about/contacts/privacy through shared styles.
- BriefModal: формы, labels, errors, submit, success state.

### Что удалено

- Старые текстовые CSS variables.
- Старые Sass typography mixins и px-функция для них.
- Локальные числовые `font-size` в `src`.
- Локальные плавающие размеры текста в `src`.
- Локальные `letter-spacing` числом в `src`.
- Локальные `line-height` числом в `src`.

### Что осталось как осознанное исключение

- В типографике `src` нет локальных исключений по `font-size`, `line-height`, `letter-spacing`.
- В проекте могут оставаться `clamp()` для layout/spacing, например gap или размеры контейнеров. Это не часть типографики и не менялось.

### Ручная визуальная проверка

Обязательно проверить:

- Главный Hero на 1440, 1024, 768, 375, 320.
- Внутренние Hero: `/services`, `/projects`, `/about`, `/contacts`, `/privacy`.
- Карточки проектов и детальную страницу проекта.
- BriefModal: поля, ошибки, submit, success.
- Calculator: переключатели, варианты, итоговая цена.
- SiteHeader: desktop nav и mobile menu.
- SiteFooter: nav, контакты, форма подписки.
- SectionHeader во всех светлых и тёмных секциях.

## Контрольные поиски

Финальное состояние должно сохранять:

- нет старых текстовых токенов;
- нет typography aliases;
- нет локальных числовых `font-size` в `src`;
- нет локальных плавающих размеров текста в `src`;
- нет читаемого текста меньше `12px`;
- нет кнопок меньше `14px`;
- нет длинного body-текста на `body-sm`;
- нет локальных числовых `line-height` и `letter-spacing` в `src`.
