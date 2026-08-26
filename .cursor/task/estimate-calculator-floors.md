# Internal estimate calculator — MVP «Полы»

| Поле | Значение |
|------|----------|
| Статус | **MVP ready on branch (UI polish + presets/groups) — merge gate: header «Смета»** |
| Branch | `feature/estimate-calculator-floors` |
| Base | `dev` @ `14ca329` (после `git fetch` + sync) |
| Дата аудита | 2026-08-25 |
| Stage 1 | Completed 2026-08-25 |
| Тип | Внутренний инструмент сметчика (не клиентский калькулятор сайта) |

## Decisions accepted (после Stage 0)

| ID | Решение |
|----|---------|
| D1 | Primary source для калькулятора — PDF; frontend preview только сверка; конфликт цен → stop; PDF-only ok с `source=pdf`; публичный `prices.data.ts` не менять |
| D2 | Полный черновой набор из PDF (демонтаж/подготовка/грунт/стяжки/наливной/гидро/вывоз optional) |
| D3 | Чистовой монтаж ламината вне MVP; демонтаж ламината — цена из PDF/both |
| D4 | Чистовые покрытия вне core MVP (future section) |
| D5 | Вывоз мусора — optional checkbox lines, без авто-включения |
| D6 | Route Stage 2: `/internal/estimate`, noindex, без публичного header |
| D7 | `lineTotal = Math.round(q * price * coef)`; итог = сумма округлённых строк |
| D8 | coefficient default 1, ручной ввод; без таблицы сложностей |

## Stage 1 completed

### Mapping summary

- Файл: `src/entities/estimate/model/floor-price.mapping.ts`
- Позиций: **68** (whitelist)
- `source=both`: совпадающие с frontend preview (проверено `assertFloorMappingMatchesFrontend`)
- `source=pdf`: PDF-only черновые позиции
- Не включено: укладка ламината/кварцвинила/паркета, чистовые плинтусы

Группы: demolition, base-prep, primer, screed-semidry, screed-wet, self-leveling, waterproofing, waste.

### Domain API

- `src/entities/estimate/` — types, calc, mapping, builders
- Функции: `calculateLineTotal`, `calculateSectionTotal`, `calculateEstimateTotal`, `getFloorRecommendation`, `buildFloorEstimateLines`, `buildFloorEstimate`
- Сверка: `assertFloorMappingMatchesFrontend` / `findFloorMappingConflicts`

### Tests

- Script: `pnpm test:floor-estimate` (`tsx --test …/floor-estimate.test.ts`)
- 8/8 pass: disabled=0, empty/neg qty=0, coef, rounding, wet area → waterproofing only, recommendations, mapping vs frontend, enabled totals

### Stage 2 completed

- Route `/internal/estimate` + `noindex, nofollow`
- Feature intro + domain preview stats
- Header convenience link «Смета» (branch-only; revisit before merge)
- Commit: `fc5ebc3` Add internal estimate calculator route

### Stage 3 completed

- Editable estimate table + totals
- Domain apply/manual helpers
- Formulas stay in domain (`calculateLineTotal` / section totals)
- Commit: `6b9bb4d` Add floor estimate table and totals

### Stage 4 completed

- Surveyor input fields
- Recommendation + apply-quantity helpers (no auto-enable)
- Manual labour line
- Reset action
- Commit: `cce56b4` Add floor estimate helpers and manual lines

### Stage 5 completed

- Docs: `docs/internal-floor-estimate.md`
- Self-review: formulas in domain; mapping centralized; no public price changes; noindex route; header link is branch convenience
- Checks: `pnpm check`, `pnpm build`, `pnpm test:floor-estimate` green
- Commit: `6d20d6a` Complete floor estimate calculator MVP

### Commit chain

1. `6e3faaf` Add floor estimate calculation domain
2. `fc5ebc3` Add internal estimate calculator route
3. `6b9bb4d` Add floor estimate table and totals
4. `cce56b4` Add floor estimate helpers and manual lines
5. `6d20d6a` Complete floor estimate calculator MVP
6. `b281c4f` (+ later) UX polish / presets / groups — see git log on branch

### Before merge to `dev` (follow-up)

- [ ] **Header link «Смета»** (`SiteHeader` `INTERNAL_NAV`): keep / hide DEV-only / remove — decide explicitly
- [ ] Do not merge with unresolved public-nav exposure of `/internal/estimate`
- Walls/ceilings sections, materials, auth, PDF export remain out of scope

---

## 0. Цель Stage 0

Собрать карту прайса по полам, сверку frontend ↔ PDF, формулы, UI/data architecture и staged plan.

**Stage 0:** только task-файл.  
**Stage 1:** domain/model + tests (без UI/route).

---

## 1. Архитектура текущего проекта (релевантная часть)

### 1.1. Routes (`src/routes.ts`)

Публичные маршруты:

- `/` — home (есть клиентский package-calculator widget — **не** этот инструмент)
- `/prices` — хаб прайса
- `/prices/:categorySlug` — категория прайса
- `/prices/thanks` — success после заявки на полный прайс
- `/services`, `/services/:slug`, `/projects`, `/blog`, contacts, legal

**Внутреннего estimate-route пока нет.**

### 1.2. Прайс-entity

| Слой | Путь | Роль |
|------|------|------|
| Types | `src/entities/price/model/price.types.ts` | `PriceCategory`, `PricePosition`, slugs |
| Data (primary for site) | `src/entities/price/model/prices.data.ts` | Превью-позиции категорий |
| Repository | `src/entities/price/api/local-price.repository.ts` | Сейчас active: local data |
| Facade | `src/entities/price/api/index.ts` | `priceRepository = localPriceRepository` |
| Snapshot / Strapi adapters | есть в api/, **не трогать** в рамках MVP | CMS migration out of scope |

Важно из `docs/architecture/price-list.md` и комментария в `prices.data.ts`:

- сайт публикует **превью** (~10–20 позиций на категорию);
- полный перечень — в PDF/файле полного прайса;
- цены на сайте — ориентир «от».

### 1.3. Header / nav

- `src/widgets/site-header/SiteHeader.tsx` + `navigation` в `company.ts`
- Ссылка на `/prices` есть в публичной навигации
- Для internal estimate: **не добавлять публичную ссылку**; опционально только `import.meta.env.DEV`

### 1.4. Существующий «калькулятор»

- `src/widgets/home/package-calculator` — клиентский ориентир пакета, **не** смета работ
- Brief / lead modal — лиды, не смета

### 1.5. Источники для сверки Stage 0

1. **Frontend primary:** `src/entities/price/model/prices.data.ts`
2. **PDF compare:** `C:/Users/1/Desktop/Работа anfas/anfas-price-list.pdf`  
   (байты совпадают с `resources/source-documents/anfas-price-2026.pdf`, дата в PDF: `2026-07-29`)

---

## 2. Scope MVP «Полы» (работы, без материалов)

В MVP включаем позиции, связанные с **черновым полом / демонтажом покрытий / подготовкой / стяжкой / наливным / гидроизоляцией мокрых зон / выносом мусора после демонтажа пола**.

**В MVP не считаем автоматически (но отмечаем в mapping):**

- чистовую укладку ламината/кварцвинила/паркета (раздел `napolnye-pokrytiya`) — можно показать как optional lines позже;
- плиточную облицовку пола (кроме гидроизоляции, если сметчик вручную включает);
- электрический/водяной тёплый пол (категории `elektroremontazh` / `santehmontazh`) — соседние разделы;
- материалы.

---

## 3. Найденные позиции (frontend primary)

### 3.1. Категория `demontazh` — Демонтажные работы

| Название (frontend) | unit | priceFrom | В PDF | Совпадение |
|---------------------|------|-----------|-------|------------|
| Демонтаж плинтуса | м. пог. | 120 | да (`7.4`) | цена/ед. совпадают |
| Демонтаж ламината | м² | 300 | да (`2.4`) | совпадают |
| Демонтаж линолеума | м² | 200 | да (`2.6`) | совпадают |
| Демонтаж стяжки до 70 мм | м² | 1100 | да (`2.1`, «до 70мм») | совпадают |
| Демонтаж плитки пола | м² | 900 | да (`2.3`) | совпадают |

Не floor-related preview items в той же категории (стены/потолки/сантехника) — вне MVP.

### 3.2. Категория `obshhestroitelnye` — Общестроительные работы

| Название (frontend) | unit | priceFrom | В PDF | Совпадение |
|---------------------|------|-----------|-------|------------|
| Устройство наливного пола | м² | 900 | да (`5.38`) | совпадают |
| Устройство полусухой стяжки пола толщиной до 80 мм | м² | 1300 | да (`5.11`) | совпадают |
| Устройство полусухой стяжки пола толщиной свыше 80 мм | м² | 1600 | да (`5.12`) | совпадают |
| Устройство мокрой стяжки пола толщиной до 50 мм ручным способом | м² | 1800 | да (`5.26`) | совпадают |

### 3.3. Категория `plitka` — гидроизоляция (для мокрых зон)

| Название (frontend) | unit | priceFrom | В PDF | Совпадение |
|---------------------|------|-----------|-------|------------|
| Нанесение гидроизоляции на акриловой основе, 1 слой | м² | 350 | да (`2.3`) | совпадают |
| Нанесение гидроизоляции на акриловой основе, 2 слоя | м² | 700 | да (`2.4`) | совпадают |

### 3.4. Категория `vyvoz-musora` — связанный вывоз после демонтажа пола

| Название (frontend) | unit | priceFrom | В PDF | Совпадение |
|---------------------|------|-----------|-------|------------|
| Вывоз строительного мусора Газелью до 6 м³ | рейс | 8000 | да | совпадают |
| Вывоз … до 12 м³ | рейс | 13000 | да | совпадают |
| Вывоз … до 16 м³ | рейс | 16000 | да | совпадают |
| Подача и вывоз ПУХТО 20 м³ | рейс | 28000 | да | совпадают |
| Подача и вывоз ПУХТО 27 м³ | рейс | 33000 | да | совпадают |
| Ручная погрузка … | м³ | 1200 | да | совпадают |
| Вынос … пешком/через лифт | м³ | 1500 | да | совпадают |
| Доплата за крупногабаритный/тяжёлый мусор | комплекс | 3000 | да | совпадают |
| Организация пропуска … | комплекс | 1000 | да | совпадают |

### 3.5. Связанные floor-позиции в frontend (optional / соседние)

**`napolnye-pokrytiya`** (чистовой монтаж — не core MVP, mapping сохранить):

- подложка 150; плавающая укладка 700; ёлка ламинат 1100; кварцвинил на клей диагональ/ёлка 1400/1600;
- подготовка пола под паркет/инженерку (шлифование+праймер) 610;
- монтаж инженерной/паркетной доски и родственные;
- шлифование/выравнивание существующего основания 680.

**`zvukoizolyaciya`** (перед стяжкой):

- СтопЗвук М на пол 750; базальтовая вата на пол 650; лаги 900; ЗИПС-пол 1600.

**`elektroremontazh` / `santehmontazh`:**

- электрический тёплый пол >4 м² — 1100;
- труба водяного тёплого пола шаг 100 мм — 1200.

**`gipsokarton` / `shtukaturka`:** ниши/плоскости под скрытый плинтус — не черновой пол, optional.

### 3.6. Чего нет в frontend preview, но есть в PDF (критично для сметчика)

PDF содержит развернутые цепочки, которых **нет** в `prices.data.ts`:

**Демонтаж пола (PDF only, примеры):**

| PDF | unit | price |
|-----|------|-------|
| Демонтаж стяжки более 70мм | м² | 1300 |
| Демонтаж покрытия из ламината и инженерной доски (плавающий тип) | м² | 360 |
| Демонтаж деревянных полов | м² | 550 |
| Демонтаж черновых досок (полов) | м² | 250 |
| Демонтаж клея/подложки | м² | 250 |
| Демонтаж лаг | м² | 500 |
| Демонтаж засыпки-мусора до 100 мм | м² | 650 |
| Демонтаж паркетной доски | м² | 500 |
| Демонтаж обрешетки пола | м² | 300 |
| Подрезка/демонтаж демпферных лент и напольной звукоизоляции + герметик | м² | 160 |
| Демонтаж паркета приклеенного к основанию | м² | 750 |

**Подготовка / грунт / стяжка / наливной (PDF only, фрагмент):**

| PDF | unit | price |
|-----|------|-------|
| Обеспыливание основания (общее / под стяжку / под наливной) | м² | 80–100 |
| Грунтование основания глубокого проникновения | м² | 120 |
| Бетонконтакт | м² | 180 |
| Подготовка основания под полусухую стяжку | м² | 300 |
| Грунт под полусухую / мокрую / наливной | м² | 120–150 |
| Керамзит / плёнка / шумослой / демпфер / маяки / армирование / уход | … | см. PDF 5.4–5.37 |
| Мокрая стяжка 50–80 мм | м² | 2200 |
| Мокрая стяжка свыше 80 мм | м² | 2600 |
| Локальная мокрая стяжка (малый объём) | м² | 2800 |
| Локальный наливной пол (малый объём) | м² | 1600 |

**Гидроизоляция (PDF only сверх frontend):**

- цементная гидроизоляция 2 слоя 850;
- гидроизоляция душевого поддона 900;
- лента/манжета/трап и т.п.

**Вывод:** frontend preview **недостаточен** как единственный источник для реального сметного MVP по полам. PDF богаче. Цены совпадающих позиций в основном согласованы; конфликт — в **полноте набора**, не в «разных цифрах» для одинаковых имён.

---

## 4. Таблица расхождений PDF ↔ frontend

Правило Stage 0: **не выбирать цену самостоятельно**. Ниже — статусы для решения заказчиком.

| ID | Позиция | Frontend | PDF | Тип расхождения | Решение нужно? |
|----|---------|----------|-----|-----------------|----------------|
| D1 | Демонтаж стяжки >70 мм | отсутствует | 1300 м² | PDF-only | Да: включать ли в MVP mapping из PDF |
| D2 | Демонтаж плавающего покрытия ламинат+инженерка 360 | есть только «Демонтаж ламината» 300 | обе позиции | naming overlap | Да: какую строку показывать сметчику |
| D3 | Цепочка подготовки под стяжку/наливной | отсутствует | десятки позиций | PDF-only | Да: MVP = только «головные» работы или полная цепочка |
| D4 | Мокрая стяжка 50–80 / >80 / локальная | только «до 50 мм» | полный набор | PDF-only | Да |
| D5 | Локальный наливной 1600 | только 900 | обе | PDF-only | Да |
| D6 | Отдельный грунт пола | нет отдельной floor-позиции в preview | есть | PDF-only | Да |
| D7 | Источник данных runtime | `prices.data.ts` (preview) | полный PDF | архитектурный | Да: читать preview / snapshot / hardcoded floor mapping / PDF extract |
| D8 | Название «ровнитель» | нет | нет (есть «наливной пол») | naming | Нет конфликта цены; в UI использовать «наливной пол» + рекомендация |

**Совпадающие цены** по ключевым совпадающим именам (ламинат 300, линолеум 200, плитка пола 900, стяжка до 70 1100, полусухая 1300/1600, мокрая до 50 1800, наливной 900, гидро 350/700) — **конфликта цифр нет**.

---

## 5. Формулы MVP (только работы)

### 5.1. Базовая

```
lineTotalRaw = quantity * unitPrice * coefficient
lineTotal    = roundRub(lineTotalRaw)   // до целых рублей
```

Правила:

- `quantity >= 0`; пустое → `0`
- `unitPrice >= 0`
- `coefficient > 0`; default `1`
- строка с `enabled === false` **не** входит в итог
- ручное изменение `unitPrice` — разрешить в Stage 3 (override поверх прайса)
- материалы = 0 / out of scope

### 5.2. Агрегаты

```
sectionTotal = Σ lineTotal where enabled
selectedCount = count(enabled)
grandTotalFloors = sectionTotal   // MVP один раздел
```

### 5.3. Рекомендации по перепаду (не авто-начисление)

| Перепад | Рекомендация сметчику (текст) | Типовые работы из прайса (включить вручную) |
|---------|-------------------------------|---------------------------------------------|
| ≤ 5 мм | Обычно достаточно локальной подготовки / тонкого наливного | наливной + грунт/обеспыливание (если mapping разрешён) |
| 5–20 мм | Финишное выравнивание наливным по подготовленному основанию | наливной; при необходимости полусухая не обязательна |
| 20–50 мм | Рассмотреть стяжку (полусухая до 80 мм или мокрая до 50 мм) + при необходимости наливной | полусухая ≤80 / мокрая ≤50 + наливной |
| > 50 мм | Стяжка большей толщины (полусухая >80 / мокрая 50–80 / >80 по PDF) | позиции толщины; **не выбирать автоматически** |

Важно:

- рекомендация = `getFloorRecommendation(deltaMm)` → `{ level, message, suggestedPriceKeys[] }`
- **не** включает строки автоматически;
- UI показывает «Применить рекомендации?» только как подсказку (Stage 4).

### 5.4. Привязка quantity к полям ввода (черновик)

| Поле ввода | Какие строки по умолчанию получают quantity |
|------------|---------------------------------------------|
| `totalFloorArea` | общая справка; кнопка «применить ко всем м²» |
| `demolitionArea` | демонтаж покрытий/стяжки |
| `screedArea` | стяжка / наливной |
| `wetZonesArea` | гидроизоляция |
| `wasteVolumeM3` / рейсы | вывоз (ручной выбор типа рейса) |
| `avgDeltaMm` | только recommendation |

---

## 6. Будущая UI-структура

### 6.1. Route

**Предложение:** `/internal/estimate`

Альтернатива: `/estimate-calculator`

Обоснование `/internal/estimate`:

- явно «не публичный SEO-раздел»;
- расширяемо: `/internal/estimate?section=floors` или `/internal/estimate/floors`.

Страница:

- без индексации (`robots: noindex, nofollow` в meta);
- **без** ссылки в публичном header;
- опционально DEV-only линк.

### 6.2. Экран сметчика (wireframe)

1. **Шапка инструмента:** «Смета — Полы (MVP)», предупреждение «Материалы не учитываются».
2. **Блок ввода замера:**
   - общая площадь пола, м²
   - площадь демонтажа, м²
   - площадь стяжки/выравнивания, м²
   - площадь мокрых зон, м²
   - средний перепад, мм
   - комментарий замерщика
3. **Блок рекомендации по перепаду** (read-only chips + suggested keys).
4. **Таблица строк:**
   - enable checkbox
   - работа (name)
   - единица
   - объём (editable)
   - цена (editable override)
   - коэффициент
   - сумма
   - комментарий строки
5. **Итог:** сумма по полу; число выбранных работ; disclaimer материалов.
6. **Действия Stage 4+:** применить площадь ко всем м²; добавить ручную строку.

Дизайн: рабочий, в существующих токенах сайта, без маркетингового hero.

---

## 7. Data / model architecture (будущая)

### 7.1. Модели

```ts
type EstimateLine = {
  id: string
  priceKey: string          // stable key: `${categorySlug}::${name}` or mapping id
  categorySlug: PriceCategorySlug | 'manual'
  name: string
  unit: string
  unitPrice: number         // from price or override
  quantity: number
  coefficient: number
  enabled: boolean
  comment?: string
  source: 'frontend-preview' | 'pdf-only' | 'manual'
}

type EstimateSection = {
  id: 'floors' | 'walls' | 'ceilings' | 'electro' | 'santeh' | 'tile' | string
  title: string
  lines: EstimateLine[]
}

type FloorEstimateInput = {
  totalFloorArea: number
  demolitionArea: number
  screedArea: number
  wetZonesArea: number
  avgDeltaMm: number
  surveyorComment?: string
}

type FloorEstimateResult = {
  section: EstimateSection
  recommendation: FloorRecommendation
  selectedCount: number
  totalRub: number
  materialsExcluded: true
}

type PriceMapping = {
  priceKey: string
  categorySlug: PriceCategorySlug
  name: string
  unit: string
  unitPriceFromFrontend?: number
  unitPriceFromPdf?: number
  mvpDefaultEnabled: boolean
  quantityField?: keyof FloorEstimateInput
  notes?: string
}
```

### 7.2. Чистые функции (domain, без UI)

- `calculateLineTotal(line) -> number`
- `calculateSectionTotal(section) -> number`
- `getFloorRecommendation(avgDeltaMm) -> FloorRecommendation`
- `buildFloorEstimateLines(input, mapping, overrides?) -> EstimateLine[]`

Размещение (предложение FSD):

```
src/entities/estimate/model/   # types + pure calc
src/features/floor-estimate/   # build lines + mapping for floors
src/routes/internal/estimate/  # page shell
```

Не менять `prices.data.ts`. Mapping — отдельный файл `floor-price.mapping.ts`, который **ссылается** на прайс / явный PDF-only whitelist после решения open questions.

### 7.3. Расширяемость

- `EstimateSection.id` уже multi-section;
- новые разделы = новый mapping + `buildXEstimateLines`;
- общие calc-функции переиспользуются.

---

## 8. Staged plan

### Stage 0 (этот документ) — DONE when reviewed

- аудит архитектуры
- price mapping draft
- формулы
- open questions / stop conditions

### Stage 1 — domain

- types + pure functions
- lightweight tests (`calculateLineTotal`, rounding, disabled lines, recommendation bands)
- **без** UI/route

### Stage 2 — shell

- route `/internal/estimate` (noindex)
- page shell + inputs
- подключение approved mapping (после ответа на D1–D7)
- без публичного header

### Stage 3 — table + totals

- enable/disable
- edit quantity / price / coefficient / comment
- section total + selected count + materials warning

### Stage 4 — UX helpers

- recommendation panel
- «применить площадь ко всем м²»
- manual line

### Stage 5 — QA

- mobile sanity
- `pnpm check` / build
- docs note
- решение по DEV-link в header

---

## 9. Open questions (блокер до Stage 1–2)

1. **Источник цен для MVP:** только frontend preview, или разрешён whitelist PDF-only позиций (без изменения публичного `prices.data.ts`)?
2. **Полнота цепочки стяжки:** только «головные» работы (как в preview) или полная PDF-цепочка подготовки?
3. **Демонтаж ламината 300 vs плавающий комплекс 360:** какую строку/обе?
4. **Включать ли `napolnye-pokrytiya` в MVP «Полы»** как optional блок или строго черновые работы?
5. **Вывоз мусора:** в MVP сразу или отдельным Stage?
6. **Route path:** `/internal/estimate` vs `/estimate-calculator`?
7. **Округление:** `Math.round` (банковское/half-up) — подтвердить?
8. **Коэффициенты сложности:** есть ли утверждённая таблица коэффициентов или только ручной ввод?

---

## 10. Stop conditions

Остановиться и спросить, если:

- нельзя однозначно сопоставить позицию frontend ↔ PDF;
- потребуется **менять** публичный прайс / Strapi / CMS;
- потребуется расчёт материалов;
- потребуется auth / admin / persist / PDF export;
- потребуется трогать `main` / production / deploy;
- бизнес-логика толщины/перепада не выводится из прайса (нужен внутренний регламент сметчика).

---

## 11. Non-goals (повтор)

Не делать на Stage 0 и до явного GO:

- код калькулятора / UI / routing / header
- изменение прайса, Strapi, PHP, deploy
- материалы, стены/потолки/электрика/сантехника/плитка как отдельные MVP
- merge в `dev`/`main`

---

## 12. Checks (Stage 0)

- [x] branch от актуальной `dev`
- [x] audit routes / price entity / PDF extract
- [x] task file created
- [ ] реализация — **не начиналась**
- [ ] `git diff` должен содержать только этот md (после удаления temp extract files)

---

## 13. Suggested default MVP line set (после GO, черновик)

При ответе «сначала только frontend preview» — стартовый набор:

1. Демонтаж плинтуса  
2. Демонтаж ламината  
3. Демонтаж линолеума  
4. Демонтаж стяжки до 70 мм  
5. Демонтаж плитки пола  
6. Полусухая стяжка ≤80 / >80  
7. Мокрая стяжка ≤50  
8. Наливной пол  
9. Гидроизоляция 1/2 слоя  
10. (optional) позиции вывоза мусора  

PDF-only позиции — только после явного GO по D1–D5.
