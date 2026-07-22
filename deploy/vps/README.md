# Деплой на VPS

GitHub Actions публикует Docker-образы в GitHub Container Registry:

- `main` -> `ghcr.io/<owner>/<repo>:prod`
- `dev` -> `ghcr.io/<owner>/<repo>:dev`

SSH-деплой на VPS будет пропущен, пока в настройках репозитория не добавлены секреты:

- `VPS_HOST` - публичный IP-адрес сервера или доменное имя сервера
- `VPS_USER` - SSH-пользователь, например `root` или `deploy`
- `VPS_SSH_KEY` - приватный SSH-ключ, у которого есть доступ к серверу
- `VPS_PORT` - SSH-порт, необязательно; по умолчанию используется `22`

## Структура на сервере

На VPS нужно создать две папки:

```bash
mkdir -p /opt/anfas/prod /opt/anfas/dev
```

Файл `deploy/vps/compose.yaml` нужно скопировать в обе папки.

Файл `.env` для production-стенда: `/opt/anfas/prod/.env`

```env
DEPLOY_IMAGE=ghcr.io/<owner>/<repo>:prod
APP_PORT=8080
```

Файл `.env` для dev-стенда: `/opt/anfas/dev/.env`

```env
DEPLOY_IMAGE=ghcr.io/<owner>/<repo>:dev
APP_PORT=8081
```

Файл `deploy/vps/Caddyfile.example` можно использовать как основу для настройки HTTPS и маршрутизации доменов:

- основной домен -> production-стенд
- `www` -> production-стенд
- `dev` -> dev-стенд
