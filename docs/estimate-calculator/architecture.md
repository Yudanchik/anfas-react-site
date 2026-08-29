# Архитектура калькулятора сметы

Техническое описание для разработчиков.
Пользовательские инструкции: [README](./README.md), [Зоны](./zones.md), [Полы](./scenarios-floors.md), [Стены](./scenarios-walls.md).

Цены и формулы живут в domain; UI только редактирует состояние.

## Domain

```
src/entities/estimate/model/
  shared/     # типы, EstimateZone, calculateLineTotal / section / estimate,
              # zoned clones, conflict scope, line helpers, selected-lines (+ group by zone)
  floors/     # FLOOR_PRICE_MAPPING, builders, presets (+ toZone), groups, conflicts,
              # zone work catalog, tests
  walls/      # WALL_PRICE_MAPPING, builders, scenarios (+ toZone), groups, conflicts,
              # zone work catalog, tests
  index.ts    # публичный barrel — импорт только из @/entities/estimate
```

| Слой | Назначение |
|------|------------|
| **mapping** | Whitelist работ и цен раздела (`FLOOR_*` / `WALL_*`). Не смешивать ключи между разделами. |
| **builders** | Собирают строки из mapping + inputs (по умолчанию выключены). |
| **EstimateZone** | Сущность зоны объекта (`zone-N`) с площадями floors/walls. |
| **zoneId / zoneName** | На `EstimateLine`: `zoneId` — ссылка на зону; `zoneName` — snapshot для UI. Без `zoneId` у canonical = общие работы. |
| **presets / scenarios** | Object-level: canonical rows. Zone-level (`*ToZone`): upsert clones по `(zoneId, priceKey)`. |
| **conflict groups** | Scope: `zoneId: null` (только canonical) или конкретный `zoneId` (только clones зоны). Manual не трогают. |
| **price-work add** | «Общие работы» → `enableCanonicalEstimateLine`. Зона → `createZoned*`. Свободная зона → создаёт `EstimateZone`, затем clone. |
| **removable lines** | `removeRemovableEstimateLine`: manual + zoned clones; canonical не удаляет. |
| **groups** | Аккордеон «Строки сметы»; по умолчанию свёрнуты. |
| **selected / summary** | `getSelectedEstimateSections` + `attachZonesToSelectedSections` → section → zone → lines. |

Формула строки (domain): `Math.round(quantity × unitPrice × coefficient)`; выключенная / пустая / отрицательная qty → 0.

Id линии `floors:zone-M` / `walls:zone-M` и id сущности `zone-N` — **разные** счётчики.

## UI

```
src/features/estimate-calculator/
  ui/           # workspace, intro, tabs, zones+measures, table, search filter,
                # section lines, summary tree, EstimateSelect, confirm dialog, clearable input
  floors/       # FloorEstimatePanel, FloorZoneWorkAdd
  walls/        # WallEstimatePanel, scenarios, helpers, WallZoneWorkAdd, editor
  model/        # persistence v2, zone name validation, search filter, manual validation
src/features/floor-estimate/   # floor editor/presets/helpers (временно рядом; optional fold later)
src/routes/internal/estimate/  # монтирует EstimateCalculatorWorkspace; noindex
```

Поток экрана: **Intro + Разделы** → **Tabs** → **Зоны и замеры** → **Сценарии** → **Быстрые действия** → **Строки сметы** (add по клику) → **Итоговая смета**.

| UI-деталь | Где |
|-----------|-----|
| **EstimateSelect** | Кастомный select (сценарии, прайс-работы); keyboard arrows + Escape |
| **search/filter** | `filterEstimateGroupsByQuery` — только visibility; totals/enabled не меняет |
| **Confirm dialog** | Удаление зоны |
| **Summary tree** | Section accordion → nested zone/common accordion (indent + border) |

## Persistence

Ключ localStorage: `anfas:estimate-calculator:v1` (имя ключа историческое).
Схема снимка: **version 2** (`zones[]` + `zoneId` на строках).

- Parse принимает **v1** и мигрирует в v2 (`zones: []`; строки floors/walls сохраняются; orphan `zoneName` без `zoneId` остаются валидными).
- Сохраняется: вкладка, зоны, inputs, патчи строк, manual/zoned extras, draft пресетов/сценариев.
- **Не** сохраняется: открытые группы аккордеона, search query, раскрытие итоговой сметы.

| Действие | Зоны | Floors | Walls |
|----------|------|--------|-------|
| Сбросить всю смету | очистить | очистить | очистить |
| Сбросить стены | оставить | — | очистить |
| Удалить зону Z | удалить Z | удалить clones с `zoneId=Z` | то же |
| Rename зоны | обновить name | sync `zoneName` на clones | то же |

## PDF / export (будущее)

Отдельный слой: `model/export/` или `features/estimate-export/`.
Не класть в floors/walls и не смешивать с mapping. Пока **нет**.

## Header «Смета»

`SiteHeader` → `INTERNAL_NAV` — **branch convenience**, не в `company.navigation`.
Перед merge в `dev`: оставить / DEV-only / убрать (см. task notes).

## Как добавить следующий раздел

1. Domain: `model/<section>/` — mapping, builders, groups, conflicts, scenarios, zone catalog, tests.
2. Экспорт из `model/index.ts`.
3. UI: `estimate-calculator/<section>/` + tab в `EstimateTabs`.
4. Итоги через `calculateEstimateTotal` + `getSelectedEstimateSections`.
5. Zone-level: `*ToZone` + scoped conflicts.

Кандидаты: потолки / сантехника / электрика.

## Не делать

- Формулы в JSX
- Жёсткие цены в UI
- Материалы в labour-строках
- Strapi / CMS / production deploy «заодно»
- Линейный wizard комнат / BIM-геометрия
- Новые dependencies без согласования
