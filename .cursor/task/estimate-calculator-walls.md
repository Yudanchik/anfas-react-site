# Internal estimate calculator — раздел «Стены»

| Поле | Значение |
|------|----------|
| Статус | **Stage 2 DONE (committed) — Ready for Stage 3** |
| Branch | `feature/estimate-calculator-floors` (route `/internal/estimate`) |
| Base floors MVP | commit `3bdfd3d` и цепочка домен/UI полов |
| Дата аудита | 2026-08-29 |
| Stage 1 | 2026-08-29 |
| Stage 2 | 2026-08-29 |
| Тип | Внутренний инструмент сметчика; **материалы не считаем** |
| Scope сейчас | Domain + UI tabs + combined summary; Stage 3 polish |

Связанные docs:

- Architecture: `docs/estimate-calculator-architecture.md`
- Floors usage: `docs/internal-floor-estimate.md`
- Floors task history: `.cursor/task/estimate-calculator-floors.md`

---

## Decisions accepted (GO Stage 1 + Stage 2)

1. Stage 1 mapping включает: демонтаж, подготовку, грунтовку, штукатурку, шпаклёвку, армирование, откосы, локальное выравнивание, **finish labour** (покраска / поклейка обоев), ручные строки.
2. Не включать: декоративные покрытия, плитку как чистовую, материалы, ГКЛ-перегородки, кладку, звукоизоляцию.
3. Finish labour в `WALL_PRICE_MAPPING` + group `finish`; материалы не считаем; сценарии включают finish только при `finishTarget: wallpaper|paint` или `finish-only`; по умолчанию finish выключен; ручное включение/выключение доступно.
4. «Стены с нуля»: гипс + грунт + маяки + базовая шпаклёвка + шлифовка; finish только при явном целевом результате.
5. ЦПС / влажные зоны — без автоматики; ручной выбор строк.
6. UI Stage 2: tabs «Полы / Стены»; итоговая смета объединяет секции.
7. Сценарий = быстрый черновик, не финальная истина.
8. UX сценариев: два select (состояние × целевой результат) + «Применить сценарий» (не 10 карточек).

Ожидаемые комбинации: с нуля/после демонтажа/предчистовая × под обои|под покраску; только демонтаж; локальное выравнивание; только финиш обои|покраска; с нуля без финиша (`finishTarget: none`).

---

## Stage 2 delivered (UI + architecture)

### UI

- `EstimateCalculatorWorkspace` на `/internal/estimate`
- Tabs `Полы | Стены` (keyboard ArrowLeft/Right, `role=tablist`)
- Wall inputs (компактная grid) + scenarios (2 select) + quick actions + grouped table + manual
- Combined summary: раздел · группа · работа · объём · цена · коэф · сумма; итоги floors/walls/всего
- Summary **не** зависит от активной вкладки

### Architecture (reorg)

```
model/shared/   — types, calc, line helpers, selected lines
model/floors/   — floor mapping/builders/presets/groups/tests
model/walls/    — wall mapping/builders/scenarios/groups/tests
features/estimate-calculator/ — shell + shared table/summary + floors/walls panels
features/floor-estimate/      — floor-specific inputs/presets/helpers/editor (оставлены)
```

Public API: `@/entities/estimate` barrel.  
Docs: `docs/estimate-calculator-architecture.md`.

### Follow-ups (Stage 3)

- Mobile polish / denser wall scenario card
- Optionally fold remaining floor UI deeper into `estimate-calculator/floors/`
- `model/export/` when PDF needed (не сейчас)
- Docs polish / screenshots

### Stage 2 polish (pre-commit)

- [x] Combined summary grouped by section (heading + count + subtotal; empty sections hidden)
- [x] Extensible via `getSelectedEstimateSections` + `ESTIMATE_SECTION_LABELS`
- [x] Combined summary collapsible (collapsed by default; compact header with mini section totals)
- [x] Nested section collapses inside summary + `formatEstimatePositionCount` (позиция/позиции/позиций)

### Architectural debt (accepted, temporary)

- `features/floor-estimate` ещё живёт рядом с `estimate-calculator` (не полный перенос floor UI)
- Старый `FloorEstimateTable` / `FloorEstimateWorkspace` остаются как legacy/compat; route использует shell
- Finish quantity field `finishArea` в input; mapping `defaultQuantityFrom` для finish kinds по-прежнему может указывать puttyArea — builder override на `finishArea`

---

## Stage 1 delivered

### Files

| File | Role |
|------|------|
| `wall-price.mapping.ts` | `WALL_PRICE_MAPPING` (57 позиций), `WALL_SECTION_ID` |
| `estimate.types.ts` | `WallWorkKind`, `WallEstimateInput`, `EstimateWorkKind` union |
| `build-wall-estimate-lines.ts` / `build-wall-estimate.ts` | builders |
| `apply-wall-quantities.ts` | quantity helpers + `createManualWallEstimateLine` |
| `apply-wall-scenario.ts` | state × finishTarget scenarios |
| `wall-estimate-groups.ts` | accordion groups incl. `finish` |
| `wall-conflict-groups.ts` | conflicts + wallpaper↔paint exclusivity |
| `assert-wall-mapping.ts` | PDF/frontend both check |
| `wall-estimate.test.ts` | domain tests |
| `package.json` | `test:wall-estimate`, `test:estimate` |

Minimal floors touch (no rewrite): `EstimateLine.kind` → `EstimateWorkKind`; `createManualEstimateLine({ sectionId?, kind? })`; safe group/kind includes in floor helpers + `quick-action-feedback.ts`.

### Groups

`demolition` → `prep` → `primer` → `plaster` → `putty` → `reinforce` → `slopes` → `finish` → `manual`

### Conflict groups

`demolition-covering`, `plaster-system`, `putty-base-layers`, `putty-finish-layers`, `paint-layers`, `wallpaper-type`, `slopes-panel` + wallpaper↔paint end-finish.

### Scenarios API

`applyWallScenario(lines, input, { state, finishTarget, demolitionCovering?, wallpaperType?, paintLayers? })`

### Checks (Stage 1)

- [x] `pnpm test:floor-estimate`
- [x] `pnpm test:wall-estimate`
- [x] `pnpm check`
- [x] `pnpm build`
- [x] `git diff --check`
- [ ] commit — **не делался** (ждать подтверждения)

---

## 0. Принцип UX (обязательный)

> **Сценарий = быстрый черновик сметы, не финальное решение.**

Баланс «быстро, но не жёстко»:

- сценарии состояния объекта — **быстрый старт**;
- сценарий может включить типовой набор строк и подставить объёмы из inputs;
- сценарий **не** считается финальной истиной;
- после применения сметчик видит **все** строки (включённые и остальные в группах) и может всё изменить;
- **не** делать линейный wizard с обязательными шагами;
- **не** скрывать строки, которые вошли в расчёт.

Правила применения сценария (как у полов):

- только по явному нажатию (площадь / высота сами строки **не** включают);
- не удалять `manual` строки;
- не ломать вручную включённые строки **вне** conflict groups;
- внутри conflict group — отключать альтернативы (как `disableConflictingAlternatives` у полов);
- feedback: «Выбран сценарий …, добавлено N строк» + (желательно) краткий список ключей/названий.

---

## 1. Архитектура текущего калькулятора (floors) — что переиспользовать

### 1.1. Слои

| Слой | Путь | Роль |
|------|------|------|
| Domain types/calc | `src/entities/estimate/model/` | `calculateLineTotal`, section/estimate totals |
| Floor mapping | `floor-price.mapping.ts` | whitelist PDF-primary |
| Floor builders | `build-floor-estimate*.ts`, `apply-floor-quantities.ts` | lines from input |
| Floor groups | `floor-estimate-groups.ts` | accordion buckets |
| Floor conflicts | `floor-conflict-groups.ts` | mutually exclusive keys |
| Floor presets | `apply-floor-preset.ts` | explicit scenarios |
| Feature UI | `src/features/floor-estimate/` | workspace, table, presets, summary |
| Route | `src/routes/internal/estimate/` | `/internal/estimate`, `noindex` |

### 1.2. Что уже multi-section ready

- `EstimateSection.id` / `EstimateLine.sectionId` — строки секций;
- `calculateEstimateTotal(sections)` / `calculateEstimateSelectedCount` — сумма по нескольким секциям;
- docs floors уже описывают путь: новый mapping + builders, **не** класть стены в `FLOOR_PRICE_MAPPING`.

### 1.3. Coupling, который нужно учесть (маленький type-touch, не rewrite полов)

- Сейчас `EstimateLine.kind: FloorWorkKind` — для стен либо:
  - **A (предпочтительно):** расширить до `kind: string` / union `FloorWorkKind | WallWorkKind` без смены floor-логики; или
  - **B:** отдельный `WallEstimateLine` (хуже — дублирование UI).
- `createManualEstimateLine` сейчас hardcode `FLOOR_SECTION_ID` — для стен нужен `sectionId` param или `createManualEstimateLineForSection`.
- Summary floors: `getSelectedEstimateLines` + group titles floors-only — обобщить до multi-section **или** собирать selected lines из floors+walls в workspace.

**Stop condition:** большой refactor всего калькулятора **не** нужен. Достаточно parallel package + тонкий shell tabs + shared calc.

---

## 2. Источники прайса (стены)

1. **Frontend preview:** `src/entities/price/model/prices.data.ts`
2. **PDF primary:** `C:/Users/1/Desktop/Работа anfas/anfas-price-list.pdf`  
   (= `resources/source-documents/anfas-price-2026.pdf`)

Правило как у полов (D1):

- runtime цены калькулятора — whitelist mapping (PDF primary);
- `prices.data.ts` только сверка для `source=both`;
- конфликт цифр → stop / не маскировать;
- публичный прайс не менять.

---

## 3. Найденные работы по стенам

### 3.1. Core MVP «Стены» (черновая подготовка + демонтаж отделки)

Трудозатраты **без материалов**. Чистовые материалы (краска, обои, шпаклёвка как товар) **не** добавлять.

#### A. Демонтаж отделки стен (`demontazh`)

| # | Название | unit | Frontend | PDF | source |
|---|----------|------|----------|-----|--------|
| 1 | Демонтаж обоев | м² | 250 | 250 | both |
| 2 | Демонтаж краски | м² | 400 | 400 | both |
| 3 | Демонтаж штукатурки стен | м² | 700 | 700 | both |
| 4 | Демонтаж плитки стеновой | м² | 900 | 900 | both |
| 5 | Демонтаж стеклохолста | м² | — | 350 | pdf |
| 6 | Демонтаж штукатурки с откосов | м. пог. | — | 720 | pdf |
| 7 | Демонтаж панелей и уголков с откосов | м. пог. | — | 200 | pdf |
| 8 | Демонтаж откосов (гипсокартон, штукатурка) | м. пог. | — | 200 | pdf |
| 9 | Демонтаж уголков штукатурных | м. пог. | — | 200 | pdf |
| 10 | Демонтаж обшивки стен из ГКЛ с каркасом | м² | — | 1260 | pdf |

Снос несущих/блочных/кирпичных стен и демонтаж перегородок ГКЛ — **рядом, но отдельный блок** (см. 3.3), не core «отделка стен».

#### B. Подготовка / грунт / зачистка (`obshhestroitelnye` + малярка PDF)

| # | Название | unit | Frontend | PDF | source |
|---|----------|------|----------|-----|--------|
| 1 | Зачистка краски со стен | м² | 450 | 450 | both |
| 2 | Шлифование алмазными чашками стеновых поверхностей | м² | 500 | 500 | both |
| 3 | Грунтование основания грунтовкой глубокого проникновения | м² | —* | 120 | pdf (*в preview как общая позиция без wall-only slug; сверка по имени) |
| 4 | Обеспыливание поверхности перед грунтованием/шпаклеванием | м² | — | 70 | pdf |
| 5 | Грунтование поверхностей в 1 слой | м² | — | 120 | pdf |
| 6 | Нанесение адгезионного праймера / Sous-Couche под окраску | м² | — | 180 | pdf |

\*Frontend preview не всегда дублирует полный малярный грунт-набор — PDF богаче.

#### C. Штукатурка (`shtukaturka`)

| # | Название | unit | Frontend | PDF | source |
|---|----------|------|----------|-----|--------|
| 1 | Монтаж штукатурных маяков под гипсовую штукатурку | м² | 160 | 160 | both |
| 2 | Нанесение контактного слоя клеевыми составами перед оштукатуриванием | м² | 240 | 240 | both |
| 3 | Армирование стеклотканевой или базальтовой сеткой в толще штукатурки | м² | 240 | 240 | both |
| 4 | Оштукатуривание стен гипсовыми смесями (слой до 40 мм) | м² | 700 | 700 | both |
| 5 | Оштукатуривание узких поверхностей (Ш&lt;600) гипсовыми | м. пог. | 850 | 850 | both |
| 6 | Доп. слой гипсовой штукатурки свыше 40 мм | м² | 240 | 240 | both |
| 7 | Выведение углов 90° (гипсовые смеси) | м. пог. | 650 | 650 | both |
| 8 | Оштукатуривание стен ЦПС (слой до 40 мм) | м² | 800 | 800 | both |
| 9 | Узкие поверхности ЦПС (Ш&lt;300) | м. пог. | 715 | 715 | both |
| 10 | Доп. слой ЦПС свыше 40 мм | м² | 290 | 290 | both |
| 11 | Выведение углов 90° (ЦПС) | м. пог. | 325 | 325 | both |
| 12 | Локальное исправление плоскости после оштукатуривания | м² | 240 | 240 | both |
| 13 | Наращивание откоса газобетонным блоком | м. пог. | 3500 | 3500 | both |

PDF также содержит цепочку маяков/грунта под гипс и ЦПС (номера секции штукатурки) — включать в mapping как `source=pdf`, если нет точного frontend preview.

#### D. Шпаклёвка / армирование / подготовка под финиш (`malyarnye`, labour only)

| # | Название | unit | Frontend | PDF | source |
|---|----------|------|----------|-----|--------|
| 1 | Расшивка незаводских швов ГКЛ под шпаклевание | м. пог. | 160 | 160 | both |
| 2 | Базовая шпаклёвка стен, 1 слой | м² | 350 | 350 | both |
| 3 | Базовая шпаклёвка стен, 2 слоя | м² | 700 | 700 | both |
| 4 | Финишная шпаклёвка стен, 1 слой | м² | 350 | 350 | both |
| 5 | Финишная шпаклёвка стен, 2 слоя | м² | — | 700 | pdf |
| 6 | Шлифовка стен после шпаклевания | м² | 220 | 220 | both |
| 7 | Финишная шлифовка стен | м² | — | 350 | pdf |
| 8 | Монтаж стеклохолста на стены | м² | 450 | 450 | both |
| 9 | Монтаж малярной сетки в слой шпаклевки | м² | — | 250 | pdf |
| 10 | Ошкуривание штукатурки перед шпаклеванием | м² | — | 180 | pdf |
| 11 | Локальное выравнивание шпаклёвкой до 3 мм | м² | — | 380 | pdf |
| 12 | Шпаклевание откосов 2 слоя | м. пог. | — | 700 | pdf |
| 13 | Шлифовка откосов и узких поверхностей | м. пог. | — | 250 | pdf |

#### E. Откосы (labour, не материалы панелей)

| # | Название | unit | Frontend | PDF | source | Note |
|---|----------|------|----------|-----|--------|------|
| 1 | Монтаж откосов из сэндвич-панелей | м. пог. | 1200 | 1200 | both | optional / adjacent |
| 2 | Монтаж откосов из Ruspanel | м. пог. | 1500 | 1500 | both | optional |
| 3 | Облицовка откосов плиткой | м. пог. | 5100 | 5100 | both | **finish tile — out of core MVP** |

### 3.2. Finish labour (опционально в scenarios «под покраску/обои», без материалов)

Можно показывать как optional lines / scenario options, **не** как авто-материалы:

- покраска стен 1/2/3 слоя, механизированная 2 слоя (`malyarnye`, both/pdf);
- оклейка малярным флизелином; поклейка обоев (разные типы) — labour only;
- проверка проявочным светом (pdf).

**Вне core whitelist на Stage 1**, если хотим короче MVP; включить на Stage 2 scenarios «предчистовая…» как optional toggles.

### 3.3. Separately (не core «Стены-отделка»)

| Блок | Почему отдельно |
|------|-----------------|
| ГКЛ перегородки / облицовка каркасом (`gipsokarton`) | отдельный конструктивный раздел |
| Кладка блоков/кирпича (`kladka`) | возведение, не подготовка поверхности |
| Снос блочных/кирпичных стен | конструктивный демонтаж |
| Звукоизоляция стен (`zvukoizolyaciya`) | соседний раздел |
| Плиточная облицовка стен (`plitka`) | чистовая облицовка (как ламинат у полов) |
| Вывоз мусора | общий; можно ссылаться на floor waste keys или shared waste section later |

### 3.4. Конфликты PDF ↔ frontend

| ID | Позиция | Статус |
|----|---------|--------|
| W1 | Ключевые both-позиции (обои/краска/штукатурка/плитка стеновая/маяки/гипсовая&ЦПС/шпаклёвка 1–2/шлифовка/стеклохолст) | **цифры совпадают** в выборке Stage 0 |
| W2 | Полнота малярной цепочки (обеспыливание, грунт 1 слой, финишная шпаклёвка 2 слоя, финишная шлифовка, сетка) | **PDF-only** — включать с `source=pdf` |
| W3 | Naming «Демонтаж краски» vs «Зачистка краски со стен» | разные работы (400 vs 450), **не конфликт одной позиции** |
| W4 | Поклейка обоев / покраска | labour есть в обоих; **материалы out of scope** — UI disclaimer |
| W5 | Frontend preview недостаточен для полного wall MVP | как у полов: mapping whitelist, не `prices.data.ts` runtime |

**На Stage 0 блокера конфликта цифр по совпадающим именам не найдено.**  
При реализации: `assertWallMappingMatchesFrontend()` по образцу floors.

---

## 4. Предлагаемая модель данных

### 4.1. Types (новые, parallel)

```ts
type WallWorkKind =
  | 'demolition'
  | 'prep'          // зачистка / алмаз / обеспыливание
  | 'primer'
  | 'plaster-gypsum'
  | 'plaster-cement'
  | 'putty'
  | 'reinforce'     // сетка / стеклохолст / лента
  | 'slopes'
  | 'finish-paint'  // optional labour
  | 'finish-wallpaper' // optional labour
  | 'waste'
  | 'other'

type WallQuantityField =
  | 'totalWallArea'
  | 'demolitionArea'
  | 'plasterArea'
  | 'puttyArea'
  | 'slopesLength'
  | 'cornersLength'
  | 'manual'

type WallEstimateInput = {
  totalWallArea: number
  demolitionArea: number
  plasterArea: number
  puttyArea: number
  wallHeightM: number      // справка / future helpers
  slopesLengthM: number
  cornersLengthM: number
  surveyorComment?: string
}

type WallPriceMappingItem = {
  id: string
  title: string
  unit: string
  unitPrice: number
  source: 'pdf' | 'frontend' | 'both' | 'manual'
  kind: WallWorkKind
  frontendCategorySlug?: PriceCategorySlug
  frontendName?: string
  frontendUnitPrice?: number
  note?: string
  defaultEnabled: false
  defaultQuantityFrom: WallQuantityField
}
```

Константы: `WALL_SECTION_ID = 'walls'`, `WALL_SECTION_TITLE = 'Стены (черновые / подготовка)'`, `WALL_PRICE_MAPPING`.

### 4.2. Groups (accordion)

| Group id | Title | kinds |
|----------|-------|-------|
| `demolition` | Демонтаж | demolition |
| `prep` | Подготовка / зачистка | prep |
| `primer` | Грунтование | primer |
| `plaster` | Штукатурка | plaster-gypsum, plaster-cement |
| `putty` | Шпаклёвка / шлифовка | putty |
| `reinforce` | Армирование / холст | reinforce |
| `slopes` | Откосы / углы | slopes |
| `finish` | Финиш labour (optional) | finish-paint, finish-wallpaper |
| `manual` | Ручные строки | source=manual |

### 4.3. Conflict groups (черновик)

| Conflict id | Keys (examples) |
|-------------|-----------------|
| `demolition-finish` | wallpaper vs paint vs plaster vs wall-tile vs glassfiber (не все сразу) |
| `plaster-system` | gypsum-main vs cement-main |
| `putty-base-layers` | base-1 vs base-2 |
| `putty-finish-layers` | finish-1 vs finish-2 |
| `paint-layers` | paint-1 / 2 / 3 / mech-2 (если finish включён) |
| `wallpaper-type` | flizelin / vinyl / photo / textile (если finish включён) |

---

## 5. Inputs (стены)

| Поле | Ед. | Назначение |
|------|-----|------------|
| `totalWallArea` | м² | общая площадь стен; apply-to-м² helper |
| `demolitionArea` | м² | демонтаж отделки |
| `plasterArea` | м² | штукатурка / маяки / сетка |
| `puttyArea` | м² | шпаклёвка / шлифовка / холст |
| `wallHeightM` | м | справка; future (углы = f(периметр, высота) — **не** авто без GO) |
| `slopesLengthM` | м. пог. | откосы |
| `cornersLengthM` | м. пог. | углы 90° |
| `surveyorComment` | text | комментарий |

Площадь **не** включает строки сама — только presets / apply helpers / ручной enable.

---

## 6. Сценарии состояния объекта (presets)

Принцип: **черновик**, не истина. После apply — полный список строк виден, всё редактируемо.

### 6.1. «Только демонтаж»

- Choice covering: обои / краска / штукатурка / плитка стеновая / стеклохолст (по одной conflict-альтернативе).
- Qty ← `demolitionArea`.
- Keys (пример): `demolition-wallpaper` **или** `demolition-paint` **или** …

### 6.2. «Стены с нуля»

Типовой черновик под новую плоскость (гипсовая система по умолчанию; ЦПС — option):

1. грунт глубокого проникновения / грунт 1 слой  
2. контактный слой (если нужно)  
3. маяки  
4. армирование сеткой (optional toggle)  
5. оштукатуривание гипс до 40 мм  
6. базовая шпаклёвка 2 слоя  
7. финишная шпаклёвка 1 слой  
8. шлифовка  

Qty: plaster/putty ← `plasterArea` / `puttyArea` с fallback на `totalWallArea`.

### 6.3. «После демонтажа»

Как «с нуля», но **без** строк демонтажа (предполагается, что демонтаж уже сделан или отдельным сценарием).  
Может добавить: обеспыливание + алмаз/зачистка при необходимости (optional).

### 6.4. «Предчистовая под обои»

1. грунт  
2. ошкуривание штукатурки (если нужно)  
3. базовая шпаклёвка 1–2 слоя (choice)  
4. шлифовка  
5. **не** включать покраску; **не** авто-обои (optional labour later)

### 6.5. «Предчистовая под покраску»

1. грунт (+ адгезионный праймер optional)  
2. базовая 2 слоя + финиш 1–2  
3. стеклохолст (часто)  
4. шлифовка / финишная шлифовка  
5. покраска labour — **optional** explicit sub-choice (1/2/3 слоя), материалы всё равно out of scope

### 6.6. «Локальное выравнивание»

1. локальное исправление плоскости после штукатурки **и/или**  
2. локальное выравнивание шпаклёвкой до 3 мм  
Qty ← `puttyArea` / `plasterArea` (малые зоны).

### 6.7. Ручная строка

Не preset mapping — существующий manual line UI, с `sectionId: 'walls'`.

Для каждого сценария UI должен показывать:

- название сценария;
- краткий список работ, которые будут включены (до/после apply);
- feedback после apply.

---

## 7. UI proposal (без ломки полов)

### 7.1. Shell

На `/internal/estimate`:

- **Segmented control / tabs:** `Полы` | `Стены` (default: Полы).
- Активный tab рендерит feature workspace (`floor-estimate` / `wall-estimate`).
- **Одна** итоговая смета внизу: объединяет enabled lines **всех** секций (`calculateEstimateTotal([floors, walls])`).
- Intro: короткий заголовок «Калькулятор сметы» + disclaimer материалов + stats по **сумме** секций.

Не делать wizard. Не прятать строки сценария.

### 7.2. Переиспользование UI

| Компонент | Стратегия |
|-----------|-----------|
| `FloorEstimateTable` / group header / line row | обобщить props (`lines`, group resolver) **или** скопировать thin `WallEstimateTable` на Stage 1 |
| Inputs / Presets / Helpers | parallel wall components (разные поля/тексты) |
| Summary | multi-section: group by `sectionId` + group title |
| Domain calc | 100% reuse |
| Mapping/presets/conflicts | parallel wall files |

### 7.3. State

Вариант A (проще на старте): два editor hooks + compose totals в route/workspace shell.  
Вариант B: один `useEstimateEditor` с `sections: { floors, walls }` — позже, если tabs усложнятся.

Рекомендация Stage 1: **A**, без большого refactor floors.

---

## 8. Архитектура расширения (без раздувания)

```
src/entities/estimate/model/
  wall-price.mapping.ts
  build-wall-estimate-lines.ts
  apply-wall-quantities.ts
  apply-wall-preset.ts
  wall-estimate-groups.ts
  wall-conflict-groups.ts
  assert-wall-mapping.ts
  wall-estimate.test.ts

src/features/wall-estimate/   # UI mirror floors
src/features/estimate-shell/  # optional: tabs + combined summary (можно временно в route)
```

Минимальный type change floors: ослабить `EstimateLine.kind` / manual `sectionId` — **без** переписывания floor formulas.

---

## 9. Staged plan

### Stage 0 — этот документ — DONE when reviewed

- audit architecture
- price map walls
- scenarios / groups / conflicts draft
- stop conditions

### Stage 1 — domain walls — DONE

- [x] `WALL_PRICE_MAPPING` (57) incl. finish labour
- [x] builders, conflicts, scenarios (state × finishTarget)
- [x] tests: totals floors+walls, conflicts, finish gating, manual survives, no auto-enable from input
- [x] без UI tabs

### Stage 2 — UI walls + shell — DONE

- [x] tabs Полы/Стены
- [x] wall inputs / compact scenario selects / grouped table
- [x] combined summary
- [x] domain folder split shared/floors/walls
- [x] docs/estimate-calculator-architecture.md

### Stage 3 — polish — NEXT

- apply-area helpers UX / mobile sanity
- optional deeper fold of floor-estimate into estimate-calculator
- docs polish

### Stage 4 — QA / commit (когда попросят)

- checks green
- commit messages staged
- **no push/merge** unless asked

---

## 10. Open questions — resolved for Stage 1

1. Scope: **finish labour включён** (покраска/обои); материалы нет.
2. ГКЛ/кладка/звук/плитка чистовая: **out of Stage 1**.
3. Штукатурка default: **гипс**; ЦПС вручную.
4. Стеклохолст под покраску: **default on** в paint-сценариях (from-scratch / after-demolition / prefinish).
5. Types: **`EstimateWorkKind` union** — минимальный touch.
6. UI: **tabs** на Stage 2.

---

## 11. Stop conditions

Остановиться и спросить, если:

- нельзя однозначно отделить wall vs ceiling/partition позиции;
- PDF и frontend **конфликтуют цифрами** на `both` (на Stage 0/1 не выявлено);
- потребуется расчёт **материалов**;
- потребуется **ломать** готовую floor-логику / большой rewrite;
- потребуется новая dependency / Strapi / deploy / merge.

---

## 12. Non-goals (повтор)

- UI tabs на Stage 1 (отложено на Stage 2)
- commit/push/merge без отдельного подтверждения
- материалы, auth, PDF export, Strapi/CMS
- изменение публичного `prices.data.ts`
- production deploy

---

## 13. Checks

### Stage 0

- [x] floors architecture reviewed
- [x] frontend wall-related positions listed
- [x] PDF wall-related positions sampled / compared
- [x] task file created

### Stage 1

- [x] wall domain implemented
- [x] tests green (floor + wall)
- [x] check + build green
- [ ] commit — waiting for user