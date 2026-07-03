# Путь от GitHub Pages до VPS

## GitHub Pages

1. Создать репозиторий на GitHub.
2. Добавить remote и отправить ветку `main`.
3. В `Settings → Pages → Source` выбрать `GitHub Actions`.
4. Workflow `.github/workflows/pages.yml` соберёт и опубликует сайт.

Если сайт размещается в корне собственного домена, создать repository variable
`PUBLIC_PATH` со значением `/`.

## Docker локально

```bash
docker compose up --build
```

Сайт будет доступен на `http://localhost:8080`.

## Будущий VPS

1. Создать VPS с Linux.
2. Направить DNS-запись домена на IP VPS.
3. Установить Docker и Docker Compose.
4. Запустить контейнер сайта.
5. Поставить Caddy или Nginx перед контейнером для HTTPS.
6. Автоматизировать обновление через GitHub Actions и GHCR.
