# Архитектура проекта

Проект использует React Router Framework Mode со статической генерацией страниц.

## Направление зависимостей

```text
routes → widgets → features → entities → shared
```

Нижележащий слой не импортирует вышележащий.

## Слои

- `app` — providers и глобальная инициализация приложения.
- `routes` — URL, metadata, loaders и композиция страниц.
- `widgets` — крупные самостоятельные блоки: header, footer.
- `features` — пользовательские сценарии: заявка, FAQ.
- `entities` — бизнес-сущности: проект, услуга, этап процесса.
- `shared` — переиспользуемые hooks, UI, styles и утилиты.

## Источник контента

UI обращается к интерфейсу `ProjectRepository`. Сейчас используется
`localProjectRepository`. Позже его можно заменить WordPress-реализацией без изменения
route-компонентов.

## Стили

- `shared/styles/globals.scss` содержит reset, tokens и временные legacy-стили главной.
- Новые страницы и features используют `*.module.scss`.
- Legacy-стили переносятся в modules постепенно, по одному компоненту за изменение.

## Состояние

- локальное UI-состояние — React;
- server state — TanStack Query;
- URL-состояние — React Router;
- Redux/Zustand добавляются только при появлении отдельной сложной задачи.
