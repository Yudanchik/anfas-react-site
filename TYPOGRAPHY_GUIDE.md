# Гайд по типографике Anfas

## Цель

Типографика проекта должна выглядеть как одна система: одинаковые по смыслу элементы используют одинаковые роли, а не случайные локальные размеры. Все размеры, веса, высоты строки и tracking берутся из `src/shared/styles/design-tokens.scss`.

## Шрифт

Используем только Montserrat.

Доступные веса:

- `--weight-regular`: 400, основной текст.
- `--weight-medium`: 500, display, headings, карточки.
- `--weight-semibold`: 600, кнопки, labels, навигация.
- `--weight-bold`: 700, редкие короткие акценты.

Не добавляем новые веса без отдельного решения.

## Роли

| Роль | Desktop | Tablet | Mobile | Где использовать |
| --- | ---: | ---: | ---: | --- |
| `--type-display-xl` | 72px | 52px | 36px | главный Hero |
| `--type-display-lg` | 64px | 44px | 32px | Hero внутренних страниц |
| `--type-display-md` | 52px | 40px | 30px | крупный editorial-заголовок |
| `--type-heading-xl` | 44px | 36px | 28px | крупная секция |
| `--type-heading-lg` | 36px | 30px | 24px | обычная секция |
| `--type-heading-md` | 28px | 24px | 22px | feature-карточка |
| `--type-heading-sm` | 24px | 22px | 20px | обычная карточка |
| `--type-heading-xs` | 20px | 20px | 18px | компактная карточка |
| `--type-body-lg` | 18px | 18px | 16px | лид секции |
| `--type-body-md` | 16px | 16px | 16px | основной текст |
| `--type-body-sm` | 14px | 14px | 13px | короткий вторичный текст |
| `--type-caption` | 12px | 12px | 12px | теги, labels, служебные подписи |
| `--type-button` | 14px | 14px | 14px | кнопки, CTA, кликабельные подписи |
| `--type-nav` | 14px | 14px | 14px | навигация |
| `--type-stat` | 44px | 36px | 28px | крупные числа |

## Line-height

- `--leading-display`: крупные display-заголовки и большие числа.
- `--leading-heading`: заголовки.
- `--leading-heading-compact`: заголовки карточек, где нужна плотная посадка.
- `--leading-body`: обычные абзацы.
- `--leading-body-sm`: короткий вторичный текст.
- `--leading-caption`: подписи и labels.
- `--leading-control`: кнопки и controls.

Предпочитаем unitless значения. Не ставим локальный `line-height`, если есть подходящий токен.

## Letter-spacing

- `--tracking-display`: крупные display-заголовки.
- `--tracking-heading`: заголовки.
- `--tracking-card`: карточные заголовки.
- `--tracking-body`: обычный текст.
- `--tracking-label`: uppercase labels, tags, kicker.

Для кириллицы не используем сильный отрицательный tracking. Если слова вроде “ремонт”, “проектирование”, “Санкт-Петербург”, “индивидуальный”, “строительство”, “комплектация” выглядят слипшимися, берём более мягкую роль или `--tracking-body`.

## Hero

- Главный Hero: title `--type-display-xl`.
- Hero внутренних страниц: title `--type-display-lg`.
- Hero страницы проекта можно делать `--type-display-md`, если композиция не выдерживает более крупный размер.
- Lead Hero: `--type-body-md` или `--type-body-lg`, если нужен более editorial-вид.
- CTA: `--type-button`.

Не опускаем главный H1 на mobile ниже `36px`.

## Секции

Паттерн секции:

- kicker: `--type-caption`;
- title: `--type-heading-lg`;
- lead: `--type-body-lg`.

Для крупной секции допустим title `--type-heading-xl`.

## Карточки

- Обычная карточка: title `--type-heading-sm`.
- Компактная карточка: title `--type-heading-xs`.
- Feature-карточка: title `--type-heading-md`.
- Описание карточки: `--type-body-md`.
- Короткая вторичная подпись: `--type-body-sm`.
- Label/tag: `--type-caption`.

Не используем `--type-body-sm` для длинного основного текста карточки.

## Body-текст

Основной абзац: `--type-body-md` + `--leading-body`.

`--type-body-sm` допустим только для короткой вторичной информации: note, helper, meta, маленький caption-like текст без длинного чтения.

## Формы

- Label: `--type-caption` или `--type-body-sm`.
- Input: `--type-body-md`.
- Error: минимум `--type-caption`.
- Helper text: `--type-body-sm`.
- Submit: `--type-button`.

Текст ошибки не должен быть меньше `12px`.

## Кнопки

Все кнопки, CTA и кликабельные подписи используют `--type-button`.

Не ставим кнопкам `--type-caption` и не используем mobile-уменьшение ниже `14px`.

## Header и Footer

- Навигация: `--type-nav`.
- Контакты и обычный footer text: `--type-body-md` или `--type-body-sm`.
- Служебные подписи: `--type-caption`.
- CTA и submit в footer: `--type-button`.

## Mobile minimum

Минимум читаемого текста на mobile: `12px`.

Запрещено:

- читаемый текст 10px или 11px;
- кнопки меньше 14px;
- labels/errors меньше 12px;
- уменьшение текста через transform;
- локальные размеры, если есть подходящая роль.

## Когда допустим локальный размер

Локальный размер допустим только для полностью декоративного элемента, который не несёт пользовательской информации, или для уникального SVG/иконки, где это не текстовый контент. Такой случай нужно добавить в аудит как исключение.

## Когда допустим новый токен

Новый токен допустим только если появилась новая повторяемая смысловая роль, которую нельзя корректно выразить текущими ролями. Не создаём токены под конкретный компонент.

Правильно:

```scss
font-size: var(--type-heading-sm);
line-height: var(--leading-heading-compact);
letter-spacing: var(--tracking-card);
```

Неправильно:

```scss
font-size: 23px;
line-height: 1.37;
letter-spacing: -0.043em;
```

## Запрещённые сценарии

- Две параллельные типографические системы.
- Алиасы для старых токенов.
- Компонентные типографические токены.
- Локальный `font-size` в пикселях для обычного текста.
- Плавающие размеры текста в карточках, body, кнопках, формах, FAQ, footer, navigation.
- Случайные line-height и letter-spacing.
- Body-sm для длинных абзацев.
