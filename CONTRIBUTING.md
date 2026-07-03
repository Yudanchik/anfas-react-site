# Порядок работы с Git

## Ветки

- `main` — стабильная production-версия.
- `dev` — текущая интеграционная версия.
- `feature/<name>` — новая функциональность.
- `fix/<name>` — исправление ошибки.
- `hotfix/<name>` — срочное исправление production.
- `chore/<name>` — инфраструктура и зависимости.
- `docs/<name>` — документация.
- `refactor/<name>` — рефакторинг без изменения поведения.
- `test/<name>` — тесты.

В именах используются только строчные латинские буквы, цифры и дефисы:

```text
feature/project-gallery
fix/mobile-menu
chore/update-dependencies
```

## Рабочий процесс

1. Обновить `dev`.
2. Создать от неё тематическую ветку.
3. Выполнить работу и локальные проверки.
4. Отправить ветку на GitHub.
5. Открыть Pull Request в `dev`.
6. После проверки CI выполнить squash merge.
7. Для выпуска открыть Pull Request `dev` → `main`.

Пример:

```bash
git switch dev
git pull
git switch -c feature/project-gallery

pnpm check
pnpm build

git add .
git commit -m "feat: add project gallery"
git push -u origin feature/project-gallery
```

## Коммиты

Используется простой формат Conventional Commits:

```text
feat: add project gallery
fix: correct mobile navigation
refactor: split homepage sections
chore: update dependencies
docs: document deployment process
```

## Автоматические проверки

GitHub Actions запускает:

- TypeScript typecheck;
- ESLint без допустимых предупреждений;
- Stylelint;
- production-сборку.

Слияние выполняется только после успешного прохождения CI.
