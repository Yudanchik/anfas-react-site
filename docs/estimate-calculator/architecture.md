# Архитектура калькулятора сметы

Техническое описание для разработчиков.
Пользовательские инструкции: [README](./README.md), [Зоны](./zones.md), [Полы](./scenarios-floors.md), [Стены](./scenarios-walls.md), [Потолки](./scenarios-ceilings.md), [Плитка](./scenarios-tile.md), [Электрика](./scenarios-electrics.md), [Сантехника](./scenarios-plumbing.md).

Цены и формулы живут в domain; UI только редактирует состояние.

## Domain

```
src/entities/estimate/model/
  shared/     # типы, EstimateZone, calculateLineTotal / section / estimate,
              # zoned clones, conflict scope, line helpers, selected-lines (+ group by zone)
  floors/     # FLOOR_PRICE_MAPPING, builders, presets (+ toZone), groups, conflicts,
              # zone work catalog
  walls/      # WALL_PRICE_MAPPING, builders, scenarios (+ toZone), groups, conflicts,
              # zone work catalog
  ceilings/   # CEILING_PRICE_MAPPING, builders, scenarios (+ toZone), groups, conflicts,
              # zone work catalog
  tile/       # TILE_PRICE_MAPPING, builders, scenarios (+ toZone), groups, conflicts,
              # zone work catalog
  electrics/  # ELECTRIC_PRICE_MAPPING, builders, scenarios (+ toZone), groups, conflicts,
              # zone work catalog, soft zoneType filter
  plumbing/   # PLUMBING_PRICE_MAPPING, builders, scenarios (+ toZone), groups, conflicts,
              # zone work catalog, soft zoneType filter
  index.ts    # публичный barrel — импорт только из @/entities/estimate
```

Автоматические тесты калькулятора удалены по решению владельца. CI: `pnpm check` + `pnpm build`. Локальная проверка входа: `pnpm build` → `pnpm preview:estimate` (нужен PHP). См. [internal-access.md](./internal-access.md).

| Слой                    | Назначение                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **mapping**             | Whitelist работ и цен раздела (`FLOOR_*` / `WALL_*` / `CEILING_*` / `TILE_*` / `ELECTRIC_*` / `PLUMBING_*`). Не смешивать ключи между разделами. |
| **builders**            | Собирают строки из mapping + inputs (по умолчанию выключены).                                                                                    |
| **EstimateZone**        | Сущность зоны объекта (`zone-N`) с площадями floors/walls/ceilings/tile и счётчиками electrics/plumbing.                                         |
| **zoneId / zoneName**   | На `EstimateLine`: `zoneId` — ссылка на зону; `zoneName` — snapshot для UI. Без `zoneId` у canonical = общие работы.                             |
| **presets / scenarios** | Object-level: canonical rows. Zone-level (`*ToZone`): upsert clones по `(zoneId, priceKey)`.                                                     |
| **conflict groups**     | Scope: `zoneId: null` (только canonical) или конкретный `zoneId` (только clones зоны). Manual не трогают.                                        |
| **price-work add**      | «Общие работы» → `enableCanonicalEstimateLine`. Зона → `createZoned*`. Свободная зона → создаёт `EstimateZone`, затем clone.                     |
| **removable lines**     | `removeRemovableEstimateLine`: manual + zoned clones; canonical не удаляет.                                                                      |
| **groups**              | Аккордеон «Строки сметы»; по умолчанию свёрнуты.                                                                                                 |
| **selected / summary**  | `getSelectedEstimateSections` + `attachZonesToSelectedSections` → section → zone → lines.                                                        |

Формула строки (domain): `Math.round(quantity × unitPrice × coefficient)`; выключенная / пустая / отрицательная qty → 0.

Id линии `floors:zone-M` / `walls:zone-M` / `ceilings:zone-M` / `tile:zone-M` / `electrics:zone-M` / `plumbing:zone-M` и id сущности `zone-N` — **разные** счётчики.

### Цены: PDF SoT и audit extract

- PDF `resources/source-documents/anfas-price-2026.pdf` — **source of truth** для mapping (`FLOOR_*` / `WALL_*` / `CEILING_*` / `TILE_*` / `ELECTRIC_*` / `PLUMBING_*`).
- Frontend `prices.data.ts` — только сверка для `source: both` (цена + единица должны совпасть с PDF).
- При извлечении текста из PDF использовать `pdftotext -enc UTF-8 -table` (не `-layout`: колонки цены/единицы съезжают; без `-enc UTF-8` кириллица ломается на pdftotext 4.00).
- Пример артефакта `-layout`: «Демонтаж плитки стеновой» → ложные 1300; в `-table` / PDF = **900**.
- Stage P1 (2026-09): расширены labour whitelist Плитка/Полы/Стены/Сантехника; редкое — через price-add; сценарии default не раздувались. План: [roadmap-price-coverage-and-profiles.md](./roadmap-price-coverage-and-profiles.md).

### Плитка: пересечения и SoT

- PDF — source of truth для `TILE_PRICE_MAPPING` (см. выше).
- `source: both` только при совпадении цены и единицы с frontend preview **и** PDF.
- Демонтаж стеновой плитки: PDF/FE/Walls/Tile = **900** ₽/м² (`source: both`).
- Гидроизоляция **не** в Tile mapping; канон — Floors.
- Герметизация плитка↔ванна — канон **Плитка** (`seal-bath` = PDF финиш-сантех 4.9, **1050** ₽); `plumbing.finish-bath-seal` не усиливать в сценариях. Плиточная позиция 8.5 (800) — отдельная строка PDF, в mapping пока нет.
- Labour монтажа металлопрофиля и labour подгонки/облицовки люка — в Tile (price-add); экраны/комплексные люки с изделием — вне scope.
- Floors/Walls tile-related keys **не удаляем**; Tile имеет собственные `priceKey`.
- Soft-filter сценариев по `EstimateZone.zoneType` (helper `partitionScenariosByZoneType`) — Tile, Electrics и Plumbing.

### Электрика: mapping vs scenarios

- `ELECTRIC_PRICE_MAPPING` — **широкий** labour-only whitelist PDF (редкие позиции доступны через price-add).
- Default-сценарии — **компактные** (типовой набор; не весь mapping).
- Не включать материалы, TV+кронштейн, unclear Wi‑Fi/домофон, водяной ТП, заделку штроб, выезд 15k, Neptun в default.
- Лотки: одна укрупнённая строка (`conduit-tray-mount`), без семейства по ширинам.
- Zone fields: counters (sockets/switches/lights/data/boxes/…) + strobe/cable м.п. + panel modules + warm floor area + appliance connections.
- Soft `zoneType` filter: kitchen / bathroom / room-rewire; остальные сценарии — `all`.
- Водяной ТП — **не** в электрике; канон в Сантехнике. Электрический ТП остаётся здесь.

### Сантехника: mapping vs scenarios

- `PLUMBING_PRICE_MAPPING` — **широкий** labour-only whitelist PDF (редкие позиции через price-add).
- Default-сценарии — **компактные**.
- Out MVP: отопление (радиаторы/котлы/конвекторы), штробы дм³, заделка штроб, выезд 15k, материалы/изделия, электрический ПС / эл. ТП, ТЕСЕ-конструкции.
- In: водяной ТП; монтаж коллектора/фильтра/счётчика/инсталляции как **работа**; водяной полотенцесушитель + выводы/байпас/опрессовка (price-add / счётчик ПС).
- Zone fields: раздельные counters приборов (не один `fixtureCount`) + pipe lengths + warm floor area.
- Soft `zoneType` filter: bathroom / kitchen scenarios; остальные — `all`.

## UI

```
src/features/estimate-calculator/
  ui/           # workspace, intro, tabs, zones+measures, table, search filter,
                # section lines, summary tree, EstimateSelect, confirm dialog, clearable input
  floors/       # FloorEstimatePanel, FloorZoneWorkAdd
  walls/        # WallEstimatePanel, scenarios, helpers, WallZoneWorkAdd, editor
  ceilings/     # CeilingEstimatePanel, scenarios, helpers, CeilingZoneWorkAdd, editor
  tile/         # TileEstimatePanel, scenarios, helpers, TileZoneWorkAdd, editor
  electrics/    # ElectricEstimatePanel, scenarios, helpers, ElectricZoneWorkAdd, editor
  plumbing/     # PlumbingEstimatePanel, scenarios, helpers, PlumbingZoneWorkAdd, editor
  model/        # persistence v2, zone name validation, search filter, manual validation
src/features/floor-estimate/   # floor editor/presets/helpers (временно рядом; optional fold later)
src/routes/internal/estimate/  # монтирует EstimateCalculatorWorkspace; noindex
```

Поток экрана: **Intro + Разделы** → **Tabs** → **Зоны и замеры** → **Сценарии** → **Быстрые действия** → **Строки сметы** (add по клику) → **Итоговая смета**.

| UI-деталь          | Где                                                                         |
| ------------------ | --------------------------------------------------------------------------- |
| **EstimateSelect** | Кастомный select (сценарии, прайс-работы); keyboard arrows + Escape         |
| **search/filter**  | `filterEstimateGroupsByQuery` — только visibility; totals/enabled не меняет |
| **Confirm dialog** | Удаление зоны                                                               |
| **Summary tree**   | Section accordion → nested zone/common accordion (indent + border)          |

## Persistence

Ключ localStorage: `anfas:estimate-calculator:v1` (имя ключа историческое).
Схема снимка: **version 2** (`zones[]` + `zoneId` на строках + optional `ceilings` / `tile` / `electrics` / `plumbing`).

- Parse принимает **v1** и мигрирует в v2 (`zones: []`; строки floors/walls сохраняются; orphan `zoneName` без `zoneId` остаются валидными).
- Блоки `ceilings`, `tile`, `electrics` и `plumbing` **опциональны** при чтении (нет → пустой input + пустые строки); при записи всегда сериализуются.
- Поля потолка / плитки / электрики / сантехники на зоне при отсутствии → `0` (старые v2-снимки не ломаются).
- Сохраняется: вкладка, зоны, inputs floors/walls/ceilings/tile/electrics/plumbing, патчи строк, manual/zoned extras, draft пресетов/сценариев.
- **Не** сохраняется: открытые группы аккордеона, search query, раскрытие итоговой сметы.

| Действие           | Зоны          | Floors                      | Walls        | Ceilings        | Tile        | Electrics        | Plumbing        |
| ------------------ | ------------- | --------------------------- | ------------ | --------------- | ----------- | ---------------- | --------------- |
| Сбросить всю смету | очистить      | очистить                    | очистить     | очистить        | очистить    | очистить         | очистить        |
| Сбросить раздел    | оставить      | только floors               | только walls | только ceilings | только tile | только electrics | только plumbing |
| Удалить зону Z     | удалить Z     | удалить clones с `zoneId=Z` | то же        | то же           | то же       | то же            | то же           |
| Rename зоны        | обновить name | sync `zoneName` на clones   | то же        | то же           | то же       | то же            | то же           |

## PDF / export

`features/estimate-calculator/model/estimate-document.ts` готовит клиентские данные, CSV и проверки перед выдачей. `estimate-pdf.ts` создаёт PDF через jsPDF/AutoTable с Montserrat, таблицами A4 и пагинацией. Итоги поступают из domain selected sections; формулы повторно не реализуются. Поиск и accordion state на экспорт не влияют.

Данные документа сохраняются отдельно (`anfas:estimate-document:v1`), существующая схема snapshot v2 не менялась. Резервная копия JSON объединяет details и snapshot, при импорте проходит существующий tolerant parser. CSV защищает текстовые ячейки от выполнения формул в Excel.

Пользовательская инструкция: [работа с заказчиком](./customer-workflow.md). Ограничения: нет серверного архива, электронной подписи и синхронизации между устройствами; CSV доступен для Excel как выгрузка сметы.

### Пользовательский прайс XLSX

`features/estimate-calculator/model/estimate-price-profile-xlsx.ts` создаёт XLSX-шаблон и читает пользовательский XLSX client-side. PDF/CSV как импорт прайса не поддерживаются. Активный профиль хранится отдельно от snapshot сметы в `anfas:estimate-price-profile:v1`; на сервер файл не отправляется. Snapshot хранит `priceProfileRef` (id/name/source/contentHash) для диагностики расхождений, но суммы документа — в строках сметы.

Контракт:

- новые строки / price-add / новые clones сценария берут title/price из `buildActiveEstimateMappings`;
- restore/JSON не перезаписывают сохранённые title/unitPrice; ручные правки помечаются `priceEdited`;
- смена профиля по умолчанию — `new-only`; явный `recalculate` через `recalculateSectionLinesFromMapping` (с опцией overwriteCustom);
- выключенная в прайсе работа (`profileActive: false`) недоступна в каталоге и блокирует сценарий до изменения выбора.

Сценарии и price-add продолжают работать по стабильным `sectionId + priceKey`. Русское название не используется как ключ. Ручные строки (`source: manual`) профилем не синхронизируются.

## Доступ администратора

Ссылка «Смета» удалена из публичной шапки. `EstimateAccess` загружает workspace после проверки PHP-сессии. `.htaccess` направляет защищённые JS/CSS chunks через `estimate-asset.php`; простой скрытой ссылки недостаточно. Вариант с чистым nginx закрывает private assets и PHP, не имитирует авторизацию.

REG.RU требует отдельного серверного конфига администратора, HTTPS и проверки rewrite после выкладки. Пароли и конфиг не входят в Git/артефакт сборки. Подробнее: [internal-access.md](./internal-access.md).

## Как добавить следующий раздел

1. Domain: `model/<section>/` — mapping, builders, groups, conflicts, scenarios, zone catalog.
2. Экспорт из `model/index.ts`.
3. UI: `estimate-calculator/<section>/` + tab в `EstimateTabs`.
4. Итоги через `calculateEstimateTotal` + `getSelectedEstimateSections`.
5. Zone-level: `*ToZone` + scoped conflicts.
6. Persistence: tolerant optional block + zone fields с default `0`.

Stage 10 «Прочие работы» отложен. Stage 11 (PDF, CSV, резервные копии) и Stage 12 (PHP-доступ) реализованы локально; live acceptance на хостинге выполняется отдельно.

## Не делать

- Формулы в JSX
- Жёсткие цены в UI
- Материалы в labour-строках
- Strapi / CMS / production deploy «заодно»
- Линейный wizard комнат / BIM-геометрия
- Новые dependencies без согласования
