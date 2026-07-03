# Подключение Git и GitHub

## 1. Проверить данные автора

```bash
git config --global user.name "Ваше имя"
git config --global user.email "email@example.com"
```

Email желательно использовать тот же, что указан в GitHub.

## 2. Создать локальный репозиторий

В корне проекта:

```bash
git init -b main
git add .
git commit -m "chore: initialize anfas website"
```

## 3. Создать репозиторий на GitHub

На GitHub нажать `New repository`:

- имя: `anfas-website`;
- visibility: `Public`, если планируется бесплатный GitHub Pages;
- не добавлять README, `.gitignore` и license — они уже есть локально.

## 4. Подключить remote

GitHub покажет URL репозитория. Для HTTPS:

```bash
git remote add origin https://github.com/USERNAME/anfas-website.git
git push -u origin main
```

Проверка:

```bash
git remote -v
git status
```

## 5. Рабочий процесс

Новая задача:

```bash
git switch -c feature/project-page
```

После изменений:

```bash
git add .
git commit -m "feat: add project page"
git push -u origin feature/project-page
```

Затем на GitHub создаётся Pull Request в `main`.

## 6. GitHub Pages

После первого push открыть:

```text
Settings → Pages → Build and deployment → GitHub Actions
```

Workflow проекта самостоятельно выполнит проверки, сборку и публикацию.
