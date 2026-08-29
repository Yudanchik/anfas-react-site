# Estimate calculator — Stage 5: зоны объекта + сценарии по зонам

| Поле | Значение |
|------|----------|
| Статус | **Completed locally (Stage 5)** — commit/push только после отдельного подтверждения |
| Branch | `feature/estimate-calculator-floors` |
| Route | `/internal/estimate` |
| Дата | 2026-08-29 |
| Базовый commit | `c216d27` |
| Не трогать | Strapi/CMS, mapping/цены/формулы, новые deps без согласования |

Связанные docs: `docs/estimate-calculator/` (README, architecture, zones, scenarios-floors/walls)

---

## Acceptance

- Visual Stage 5 accepted
- Final review: P1 orphan ZoneWorkAdd clones **fixed** (canonical for «Общие работы»; free zone creates `EstimateZone`; zoned clones removable)
- Docs synced (RU)
- Checks: `test:floor-estimate`, `test:wall-estimate`, `test:estimate`, `check`, `build`, `git diff --check`

## Merge / follow-up (P3)

- **Header «Смета»** (`SiteHeader` → `INTERNAL_NAV`): branch convenience, **не** в `company.navigation`. Перед merge в `dev`: оставить / DEV-only / убрать.
- Optional: свернуть legacy `features/floor-estimate` в `estimate-calculator/floors/`.
- Future: PDF/export (отдельный пакет).
- Next sections: потолки / сантехника / электрика.
- Optional a11y polish `EstimateSelect` (combobox pattern) — не блокер.

---

## Сделано (Stage 5)

- `EstimateZone` + optional `zoneId` на `EstimateLine` (`zoneName` — snapshot)
- Persistence snapshot **v2** + migrate v1 → v2
- Grouping helper section → zone/common → lines + nested summary accordion
- UI «Зоны и замеры» (CRUD, шаблоны, confirm delete, rename validation)
- Floor/Wall сценарии: «Применить к» + `*ToZone` + scoped conflicts
- «Добавить работу из прайса» floors **и** walls (общие / зона / новая зона)
- Manual lines + delete; zoned clone delete; search filter (UI-only)
- UI polish: tabs, разделы cards, chevrons, danger hover, summary nest indent
- Docs + tests

## Поведение reset / delete

| Действие | Зоны | Строки |
|----------|------|--------|
| Сбросить всю смету | очистить | оба раздела |
| Сбросить стены | оставить | только стены |
| Удалить зону | удалить | clones с этим `zoneId` в floors+walls |

## Не сделано в этом срезе (намеренно)

- Wizard / BIM / валидация «сумма зон = объект»
- Commit / push
- Изменения mapping / формул / материалов
- PDF export
- Публичный header styling под internal page


---

## 1. Проблема (исторический контекст задачи)

Сейчас зональность существует только как **ручной clone** («Добавить работу по зоне»):

- сметчик каждый раз выбирает тип → работу → зону → объём;
- площади зоны не переиспользуются;
- сценарии floors/walls работают только на **object-level**;
- в итоговой смете зона — подпись у строки, а не уровень дерева.

*(Ниже — исходный план Stage 5; реализация завершена — см. Acceptance выше.)*
