# Анфас — дизайн и ремонт

React-сайт компании «Анфас» с маршрутизацией, статической генерацией страниц и
подготовленным deployment-контуром.

## Стек

- React 19 + TypeScript
- React Router Framework Mode
- TanStack Query
- SCSS Modules
- React Hook Form + Zod
- pnpm
- Docker + Nginx
- GitHub Actions + GitHub Pages

## Требования

- Node.js 24
- pnpm 11.7
- Docker Desktop — только для проверки контейнера

Версия Node зафиксирована в `.nvmrc`, версия pnpm — в `package.json`.

## Разработка

```bash
pnpm install
pnpm dev
```

## Проверки

```bash
pnpm typecheck
pnpm lint
pnpm lint:styles
pnpm build
```

## Docker

```bash
docker compose up --build
```

Сайт будет доступен на `http://localhost:8080`.

## Документация

- [Архитектура](./ARCHITECTURE.md)
- [Git и GitHub](./docs/GIT_SETUP.md)
- [Публикация](./docs/DEPLOYMENT.md)
