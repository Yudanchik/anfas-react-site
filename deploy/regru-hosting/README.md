# Деплой на обычный хостинг REG.RU

Этот вариант подходит для услуги `Хостинг Host-0`.

Проект собирается в статические файлы командой:

```bash
pnpm build
```

GitHub Actions загружает содержимое папки `build/client` на хостинг через FTP:

- пуш в `main` -> production-сайт
- пуш в `dev` -> dev-стенд

## Что нужно настроить в REG.RU

1. Открыть услугу `Хостинг Host-0`.
2. Перейти в раздел `Доступы`.
3. Найти или создать FTP-доступ.
4. Проверить, какая папка является корнем сайта `anfas-remont.ru`.
5. Создать отдельный dev-сайт или поддомен, например `dev.anfas-remont.ru`, и узнать его папку на хостинге.

Обычно production и dev должны лежать в разных папках, например:

```text
/www/anfas-remont.ru/
/www/dev.anfas-remont.ru/
```

Точный путь нужно взять в панели REG.RU или через файловый менеджер/FTP.

## GitHub Secrets

В репозитории GitHub нужно открыть:

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

И добавить:

```text
REG_RU_FTP_SERVER
REG_RU_FTP_USERNAME
REG_RU_FTP_PASSWORD
REG_RU_PROD_DIR
REG_RU_DEV_DIR
```

Опционально:

```text
REG_RU_FTP_PROTOCOL
```

Если не знаем протокол, сначала можно не добавлять `REG_RU_FTP_PROTOCOL`: workflow попробует обычный `ftp`.

## Зачем нужен `.htaccess`

Файл `public/.htaccess` нужен, чтобы внутренние страницы сайта открывались после перезагрузки браузера.

Например, без него хостинг может отдавать 404 на таких адресах:

```text
/projects
/projects/2-murinskiy-37
/contacts
```

После сборки `.htaccess` попадает в `build/client` и загружается на хостинг вместе с сайтом.
