# Архитектура калькулятора сметы

Техническое описание для разработчиков.
Пользовательские инструкции: [README](./README.md), [Полы](./scenarios-floors.md), [Стены](./scenarios-walls.md).

Кратко о текущей раскладке. Цены и формулы живут в domain; UI только редактирует состояние.

## Domain

```
src/entities/estimate/model/
  shared/     # типы, calculateLineTotal / section / estimate, line helpers, selected-lines
  floors/     # FLOOR_PRICE_MAPPING, builders, presets, groups, conflicts, tests
  walls/      # WALL_PRICE_MAPPING, builders, scenarios, groups, conflicts, tests
  index.ts    # публичный barrel — импорт только из @/entities/estimate
```

| Слой | Назначение |
|------|------------|
| **mapping** | Whitelist работ и цен раздела (`FLOOR_*` / `WALL_*`). Не смешивать ключи между разделами. |
| **builders** | Собирают строки из mapping + inputs (по умолчанию выключены). |
| **presets / scenarios** | Явно включают набор ключей и ставят объёмы; конфликтующие альтернативы гасятся. |
| **conflict groups** | Взаимоисключающие варианты (типы стяжки, обои↔краска и т.п.). |
| **groups** | Аккордеон «Строки сметы»; по умолчанию все группы свёрнуты. |
| **selected / summary** | `getSelectedEstimateSections` + `calculateEstimateTotal` для объединённого итога. |

Формула строки (domain): `Math.round(quantity × unitPrice × coefficient)`; выключенная / пустая / отрицательная qty → 0.

Будущий PDF/Excel: отдельно (`model/export/` или `features/estimate-export/`), не внутри floors/walls. Пока нет.

## UI

```
src/features/estimate-calculator/   # shell: tabs, table, summary, workspace, persistence, NumberInput
  floors/                           # FloorEstimatePanel
  walls/                            # inputs / scenarios / helpers / panel / editor
src/features/floor-estimate/        # floor-specific inputs/presets/helpers/editor (временно рядом)
src/routes/internal/estimate/       # монтирует EstimateCalculatorWorkspace
```

## Persistence

Ключ: `anfas:estimate-calculator:v1`.

Сохраняется: вкладка, inputs, патчи строк, manual rows, draft пресетов/сценариев.
**Не** сохраняется: открытые группы аккордеона (после reload свёрнуты), состояние раскрытия итоговой сметы.

«Сбросить всю смету» (вкладка Полы) очищает storage и оба раздела.
«Сбросить стены» затрагивает только стены.

## Как добавить следующий раздел

1. Domain: `model/<section>/` — mapping, builders, groups, conflicts, scenarios/presets, tests.
2. Экспорт из `model/index.ts`.
3. UI: `estimate-calculator/<section>/` + tab в `EstimateTabs`.
4. Итоги через `calculateEstimateTotal` + `getSelectedEstimateSections` (порядок = порядок регистрации).

Не переписывать уже существующий раздел и не класть чужие ключи в чужой mapping.

## Не делать

- Формулы в JSX
- Жёсткие цены в UI
- Материалы в labour-строках
- Strapi / CMS / production deploy «заодно»
