# Backlog актуализации mapping — **P1 implemented**

**Статус:** P1 реализован в mapping (2026-09-10). P2 / ask_owner / XLSX profiles — не в этом проходе.
**SoT:** `resources/source-documents/anfas-price-2026.pdf`
**План этапов:** [`roadmap-price-coverage-and-profiles.md`](./roadmap-price-coverage-and-profiles.md)
**Решения владельца по объёму:** без массового ГКЛ/Грильято; фанера только labour-only; люки только подгонка/облицовка; без экранов/фартука 35k/подоконника; поддон не комплекс; лотки — одна укрупнённая; без Neptun/TV/Wi‑Fi; водяной ПС — add; ТЕСЕ — не сейчас; шаблон XLSX — после Stage 3.

### P1 implementation checklist (итог)

| Раздел | add_now | alias | inputs | scenarios |
|--------|---------|-------|--------|-----------|
| tile | +8 | titles/prices cut/grout/corner/seal-prep; **seal-bath 1050 / seal-door 350** (не 800/600) | нет новых | без изменений (price-add) |
| floors | +17 | sanding note/source | нет новых | без изменений (price-add) |
| walls | +4 | — | нет новых | без изменений (price-add) |
| plumbing | +3 | towel title | нет новых | без изменений (price-add) |
| electrics | 0 | комментарий про лоток; titles не трогали (UX) | — | без изменений |
| ceilings | 0 | — | — | — |

### Легенда status / UI impact

| status | смысл |
|--------|--------|
| `add_now` | Новая labour-строка в mapping |
| `alias_update_only` | Id уже есть — выровнять `title` / цену / unit с PDF |
| `duplicate_do_not_add` | Уже есть смысл в другом id/разделе |
| `future_section` | Отложить в будущий раздел |
| `out_of_scope_now` | Не брать в Stage A (комплекс / материал / выезд / запрет owner) |
| `ask_owner` | Остался спор / низкий приоритет уточнения |

| UI impact | смысл |
|-----------|--------|
| `price_add_only` | Достаточно «Добавить работу из прайса» |
| `scenario_candidate` | Имеет смысл в default/компактном сценарии позже |
| `needs_new_input` | Нужно новое поле замера |
| `no_ui_change` | Только правка mapping title/price |

**P1 / P2** в `reason` — приоритет внутри `add_now` (P1 = обязательно в первом PR Stage A).

---

## 1. tile (Плитка) — приоритет №1

Текущий mapping: **55**. Комментарий в коде уже исключает металлопрофили/люки — Stage A это частично снимает для labour-only.

| PDF section | PDF code | PDF title | unit | unit_price | proposed section | proposed work_id | group | status | reason | UI impact |
|-------------|----------|-----------|------|------------|------------------|------------------|-------|--------|--------|-----------|
| Плиточные работы | 5.3 | Рез/заусовка керамической плитки под углом 45° | м. пог. | 2500 | tile | `cut-45-ceramic` | cutting | alias_update_only | Id есть; title PDF длиннее («Рез/заусовка…») | no_ui_change |
| Плиточные работы | 5.4 | Рез/заусовка керамогранитной плитки под углом 45° | м. пог. | 2600 | tile | `cut-45-porcelain` | cutting | alias_update_only | Unmatched в audit из‑за title; цена совпадает | no_ui_change |
| Плиточные работы | 5.5 | Рез/заусовка крупноформатной плитки под углом 45° | м. пог. | 3000 | tile | `cut-45-large` | cutting | alias_update_only | Аналогично | no_ui_change |
| Плиточные работы | 5.6 | Рез/заусовка мелкоштучной плитки типа кабанчик/гексагон/ёлка под углом 45° | шт. | 1500 | tile | `cut-45-mosaic-small` | cutting | add_now | **P1** нет отдельного id | price_add_only |
| Плиточные работы | 5.7 | Доработка края плитки абразивом после резки | м. пог. | 500 | tile | `cut-edge-abrasive` | cutting | add_now | **P1** | price_add_only |
| Плиточные работы | 5.8 | Снятие напряжения во внутренних углах плитки | шт. | 1000 | tile | `cut-inner-stress-relief` | cutting | add_now | **P1** | price_add_only |
| Плиточные работы | 5.12 | Сложный фигурный рез плитки по шаблону | шт. | 2500 | tile | `cut-figure-template` | cutting | add_now | **P1** | price_add_only |
| Плиточные работы | 6.2 | Формирование внешнего угла цементным составом | м. пог. | 700 | tile | `corner-cement` | corners | alias_update_only | Id есть; сверить title с PDF | no_ui_change |
| Плиточные работы | 6.3 | Формирование внешнего угла эпоксидным составом | м. пог. | 1200 | tile | `corner-epoxy` | corners | alias_update_only | Id есть | no_ui_change |
| Плиточные работы | 6.4 | Монтаж углового металлического профиля для плитки | м. пог. | 800 | tile | `profile-corner-metal` | accessories | add_now | **P1** labour монтажа; профиль = материал вне суммы | price_add_only |
| Плиточные работы | 6.5 | Монтаж стыковочного декоративного металлического профиля для плитки | м. пог. | 1000 | tile | `profile-joint-metal` | accessories | add_now | **P1** | price_add_only |
| Плиточные работы | 7.6 | Заполнение/затирка межплиточных швов мозаики двухкомпонентными эпоксидными составами | м² | 2500 | tile | `grout-epoxy-mosaic` | grout | alias_update_only | Unmatched title; цена 2500 ок | no_ui_change |
| Плиточные работы | 8.1 | Подготовка примыкания плитки перед герметизацией | м. пог. | 200 | tile | `seal-prep` | sealing | alias_update_only | Unmatched title vs «Подготовка примыканий…» | no_ui_change |
| Плиточные работы | 8.2 | Формирование внутреннего примыкания силиконовым герметиком | м. пог. | 600 | tile | `seal-silicone` | sealing | alias_update_only | Цена совпадает; выровнять title | no_ui_change |
| Плиточные работы | 8.5 | Герметизация примыкания плитки к ванной/поддону/столешнице | м. пог. | 800 | tile | — | sealing | out_of_scope_now / future | **Не** `seal-bath`: у id канон PDF «Монтаж финишной сантехники» **4.9 = 1050**. Плиточная 8.5 — отдельная позиция (пока не добавляли) | no_ui_change |
| Плиточные работы | 8.6 | Герметизация примыкания плитки к дверной коробке/профилю | м. пог. | 600 | tile | — | sealing | out_of_scope_now / future | **Не** `seal-door`: у id канон PDF «Монтаж дверей» **7.6 = 350** | no_ui_change |
| Монтаж финишной сантехники | 4.9 | Герметизация примыкания ванны к стене | м. пог. | 1050 | tile | `seal-bath` | sealing | alias_update_only | **Исправлено после P1-регресса:** title + **1050** (не 800) | no_ui_change |
| Монтаж дверей | 7.6 | Герметизация примыкания дверного блока | м. пог. | 350 | tile | `seal-door` | sealing | alias_update_only | **Исправлено после P1-регресса:** title + **350** (не 600) | no_ui_change |
| Плиточные работы | 9.3 | Подгонка плитки в зоне скрытого люка | шт. | 2500 | tile | `hatch-tile-fit` | hatches | add_now | **P1** labour-only (owner) | price_add_only |
| Плиточные работы | 9.6 | Облицовка скрытого люка плиткой | шт. | 5000 | tile | `hatch-tile-clad` | hatches | add_now | **P1** labour-only | price_add_only |
| Плиточные работы | 9.4 | Монтаж люка на магнитах, включая облицовку плиткой | шт. | 6000 | tile | — | hatches | out_of_scope_now | Combined работа+изделие (owner) | no_ui_change |
| Плиточные работы | 9.5 | Монтаж механизма люка скрытого монтажа, включая облицовку плиткой | шт. | 15000 | tile | — | hatches | out_of_scope_now | Combined (owner) | no_ui_change |
| Плиточные работы | 10.1 | Монтаж экрана ванной из плитки с нишей под ноги | шт. | 14000 | tile | — | screens | out_of_scope_now | Owner: не добавлять | no_ui_change |
| Плиточные работы | 10.2 | Монтаж экрана ванной из плитки без ниши под ноги | шт. | 10000 | tile | — | screens | out_of_scope_now | Owner | no_ui_change |
| Плиточные работы | 4.7 | Облицовка кухонного фартука… малый объём | комплекс | 35000 | tile | — | cladding | out_of_scope_now | Owner | no_ui_change |
| Плиточные работы | 6.10 | Монтаж подоконника из керамогранита или натурального камня | шт. | 10000 | tile | — | accessories | out_of_scope_now | Owner | no_ui_change |
| Плиточные работы | 2.1–2.9 | Гидроизоляция / ленты / мембраны (глава Плитка) | — | — | floors | — | waterproofing | duplicate_do_not_add | Канон гидро = **Полы** | no_ui_change |
| Плиточные работы | 3.1–3.6 | Поддон: опалубка / трап / слои / борт (комплексы) | — | — | — | — | shower | out_of_scope_now | Owner: не комплекс; сантех/гидро/облицовка раздельно | no_ui_change |
| Плиточные работы | 3.7 | Облицовка душевого поддона плиткой или мозаикой | м² | 4500 | tile | `clad-shower-tray` | cladding | duplicate_do_not_add | Уже в Tile mapping | no_ui_change |
| Плиточные работы | 4.14–4.15 | СВП монтаж/снятие | м² | 300/150 | tile | — | leveling | out_of_scope_now | Часто расходники; не Stage A | no_ui_change |
| Плиточные работы | 9.7 | Минимальный выезд плиточника | выход | 15000 | tile | — | callout | out_of_scope_now | Выезд | no_ui_change |
| Плиточные работы | — | `seal-tape` Проклейка примыканий лентой (250) | м. пог. | 250 | tile | `seal-tape` | sealing | ask_owner | Unmatched; риск путаницы с гидро-лентой Полов — оставить id, не плодить гидро в Tile | no_ui_change |
| Сантехника (dup) | — | Герметизация примыкания ванны к стене | — | — | plumbing | `finish-bath-seal` | finish | duplicate_do_not_add | Канон сценариев = Tile `seal-bath`; plumbing не усиливать в scenarios | no_ui_change |

**Tile Stage A counts:** add_now **8** · alias_update_only **10** · out/dup/ask см. таблицу.

---

## 2. floors (Полы) — приоритет №2

Текущий mapping: **95**. Много укладки/диагонали/ёлки клеевого КВ и ламината **уже есть**.

| PDF section | PDF code | PDF title | unit | unit_price | proposed section | proposed work_id | group | status | reason | UI impact |
|-------------|----------|-----------|------|------------|------------------|------------------|-------|--------|--------|-----------|
| Паркет… | 1.1 | Шлифование, выравнивание основания пола… (существующие полы) | м² | 680 | floors | `finish-base-sanding-leveling` | prep | alias_update_only | Unmatched title; цена 680 = PDF | no_ui_change |
| Ламинат Кварцвинил | 2.2 | Укладка ламинированной доски плавающим способом по диагонали | м² | 900 | floors | `finish-laminate-floating-diagonal` | finish | duplicate_do_not_add | Уже есть | no_ui_change |
| Ламинат Кварцвинил | 2.3 | Укладка ламинированной доски ёлочкой | м² | 1100 | floors | `finish-laminate-floating-herringbone` | finish | duplicate_do_not_add | Уже есть | no_ui_change |
| Ламинат Кварцвинил | 1.3 | Укладка кварцвинила на клей по диагонали | м² | 1400 | floors | `finish-quartz-glue-diagonal` | finish | duplicate_do_not_add | Уже есть | no_ui_change |
| Ламинат Кварцвинил | 1.4 | Укладка кварцвинила на клей ёлочкой | м² | 1600 | floors | `finish-quartz-glue-herringbone` | finish | duplicate_do_not_add | Уже есть | no_ui_change |
| Ламинат Кварцвинил | 2.4 | Укладка замкового кварцвинила плавающим способом по диагонали | м² | 950 | floors | `finish-quartz-lock-diagonal` | finish | add_now | **P1** нет отдельного id | price_add_only |
| Ламинат Кварцвинил | 2.5 | Укладка замкового кварцвинила плавающим способом ёлочкой | м² | 1200 | floors | `finish-quartz-lock-herringbone` | finish | add_now | **P1** | price_add_only |
| Ламинат Кварцвинил | 1.5 | Укладка кварцвинила на ступени | м. пог. | 1800 | floors | `finish-quartz-steps` | finish | add_now | **P1** | price_add_only · scenario_candidate (редко) |
| Ламинат Кварцвинил | 1.2 | Чистый рез кварцвинила или ламинированной доски | шт. | 1200 | floors | `finish-laminate-quartz-clean-cut` | cutting | add_now | **P1** | price_add_only |
| Ламинат Кварцвинил | 3.1 | Подрезка ламинированной доски или кварцвинила вдоль стены | м. пог. | 250 | floors | `finish-laminate-quartz-trim-wall` | cutting | add_now | **P1** | price_add_only |
| Ламинат Кварцвинил | 3.2 | Выпил отверстий под трубы… | шт. | 350 | floors | `finish-laminate-quartz-pipe-hole` | cutting | add_now | **P1** | price_add_only |
| Ламинат Кварцвинил | 3.3 | Подрезка покрытия под дверную коробку | шт. | 500 | floors | `finish-cover-door-jamb-cut` | cutting | add_now | **P2** | price_add_only |
| Ламинат Кварцвинил | 3.4 | Подрезка покрытия по сложному контуру | м. пог. | 450 | floors | `finish-cover-complex-contour` | cutting | add_now | **P2** | price_add_only |
| Ламинат Кварцвинил | 1.6 | Грунтование основания под клеевой кварцвинил отдельным слоем | м² | 150 | floors | `finish-quartz-primer` | prep | add_now | **P1** labour prep (owner) | price_add_only |
| Ламинат Кварцвинил | 1.7 | Нанесение клея под кварцвинил | м² | 250 | floors | `finish-quartz-glue-spread` | prep | add_now | **P1** работа, не материал | price_add_only |
| Ламинат Кварцвинил | 1.8 | Прикатка кварцвинила валиком после укладки | м² | 150 | floors | `finish-quartz-roller` | prep | add_now | **P1** | price_add_only |
| Ламинат Кварцвинил | 5.1 | Локальная шлифовка основания под кварцвинил | м² | 350 | floors | `finish-base-local-sand-qv` | prep | add_now | **P2** | price_add_only |
| Ламинат Кварцвинил | 5.2 | Локальное выравнивание основания под кварцвинил | м² | 500 | floors | `finish-base-local-level-qv` | prep | add_now | **P2** | price_add_only |
| Ламинат Кварцвинил | 5.3 | Проверка основания… правилом | м² | 100 | floors | `finish-base-rule-check` | prep | add_now | **P2** | price_add_only |
| Паркет… | 1.2 | Грунтование основания под инженерную доску или паркет | м² | 250 | floors | `finish-parquet-primer` | prep | add_now | **P1** | price_add_only |
| Паркет… | 1.3 | Нанесение клея под инженерную доску или паркет | м² | 350 | floors | `finish-parquet-glue-spread` | prep | add_now | **P1** | price_add_only |
| Паркет… | 1.4 | Прикатка инженерной доски или паркета после укладки | м² | 200 | floors | `finish-parquet-roller` | prep | add_now | **P1** | price_add_only |
| Паркет… | 2.3 | Раскрой/нарезка фанеры в размер 200х200 или 300х300 | м² | 250 | floors | `finish-plywood-cut` | plywood | add_now | **P1** labour-only (owner) | price_add_only |
| Паркет… | 2.4 | Выравнивающее шлифование фанеры | м² | 250 | floors | `finish-plywood-sand` | plywood | add_now | **P1** | price_add_only |
| Паркет… | 2.5 | Укладка фанеры на клей | м² | 490 | floors | `finish-plywood-glue` | plywood | add_now | **P1** работа укладки; материал фанеры вне суммы | price_add_only |
| Паркет… | 1.7 / 1.6 | Подготовка пола… шлифование + праймер + фанера… | м² | 1470/610 | floors | `finish-parquet-prep` | prep | out_of_scope_now / duplicate | Комплекс с материалами (owner); упрощённый prep 610 уже может быть — не плодить комплекс | no_ui_change |
| Паркет… | 7.5 | Подрезка паркета или инженерной доски вдоль стены | м. пог. | 350 | floors | `finish-parquet-trim-wall` | cutting | add_now | **P1** | price_add_only |
| Паркет… | 7.6 | Подгонка… сложного примыкания | м. пог. | 500 | floors | `finish-parquet-complex-fit` | cutting | add_now | **P2** | price_add_only |
| Паркет… | 7.7 | Выпил отверстий под трубы в паркете… | шт. | 450 | floors | `finish-parquet-pipe-hole` | cutting | add_now | **P1** | price_add_only |
| Паркет… | 3.1–3.2 | Фанера/доска на **потолок** | м² | 900/3240 | ceilings | — | — | future_section | Не в Полы | no_ui_change |
| Ламинат Кварцвинил | 1.9 | Укладка кварцвинила на стену на клей | м² | 1800 | walls / tile? | — | — | ask_owner | Не пол; отложить | no_ui_change |
| Плиточные / Полы | — | Гидроизоляция | — | — | floors | existing hydro ids | waterproofing | duplicate_do_not_add | Канон уже в Полах | no_ui_change |

**Floors Stage A:** add_now **22** (P1 ≈ **16**, P2 ≈ **6**) · alias **1** · остальное dup/out/ask/future.

---

## 3. walls (Стены) — приоритет №3

Текущий mapping: **57**. Откосы шпаклёвка/шлифовка уже есть; не хватает коробов/покраски откосов/линий цвета.

| PDF section | PDF code | PDF title | unit | unit_price | proposed section | proposed work_id | group | status | reason | UI impact |
|-------------|----------|-----------|------|------------|------------------|------------------|-------|--------|--------|-----------|
| Малярные работы | 3.8 | Шпаклевание коробов и ниш под покраску | м. пог. | 700 | walls | `putty-boxes-niches` | putty | add_now | **P1** | price_add_only |
| Малярные работы | 7.10 | Покраска коробов и ниш в 2 слоя | м. пог. | 420 | walls | `paint-boxes-niches-2` | paint | add_now | **P1** | price_add_only |
| Малярные работы | 7.9 | Покраска откосов валиком в 2 слоя | м. пог. | 550 | walls | `paint-slopes-roller-2` | paint | add_now | **P1** шпаклёвка откосов уже есть | price_add_only |
| Малярные работы | 7.11 | Покраска узких поверхностей шириной до 300 мм | м. пог. | 350 | walls | `paint-narrow-300-2` | paint | add_now | **P2** | price_add_only |
| Малярные работы | 8.1 | Формирование линии примыкания разных цветов краски | м. пог. | 700 | walls | `paint-color-junction-line` | paint | add_now | **P1** | price_add_only |
| Малярные работы | 7.12 | Механизированная покраска откосов в 2 слоя | м. пог. | 700 | walls | `paint-slopes-spray-2` | paint | add_now | **P2** опционально | price_add_only |
| Малярные работы | 3.9 | Шпаклевание откосов 2 слоя | м. пог. | 700 | walls | `putty-slopes-2` | putty | duplicate_do_not_add | Уже есть | no_ui_change |
| Демонтажные работы | 6.1 | Демонтаж обшивки стен из гкл с демонтажем каркасов | м² | 1260 | walls | `demolition-gkl-wall-frame` | demolition | add_now | **P2** единственный полезный demo ГКЛ (owner: 1–2 max) | price_add_only |
| Гипсокартонные работы | * | Каркас / обшивка / короба / порталы / люки (глава ~70) | — | — | gkl | — | — | future_section | Вкладка «ГКЛ / каркасы» | no_ui_change |
| Малярные работы | 8.3–8.5 | Теневой узел / скрытая дверь / скрытый люк под покраску | м. пог. | 950 | walls | — | paint | out_of_scope_now | Редкое; не раздувать Stage A | no_ui_change |
| Кладочные работы | * | Кладка | — | — | — | — | — | future_section | Отдельный раздел | no_ui_change |

**Walls Stage A:** add_now **6–7** (P1: 5, P2: 1–2 demo/опции).

---

## 4. plumbing (Сантехника) — приоритет №4

Текущий mapping: **163** (полное title+price совпадение audit). Водяной ПС частично уже есть.

| PDF section | PDF code | PDF title | unit | unit_price | proposed section | proposed work_id | group | status | reason | UI impact |
|-------------|----------|-----------|------|------------|------------------|------------------|-------|--------|--------|-----------|
| Сантехмонтажные работы | 9.6 | Монтаж водяного полотенцесушителя | шт. | 7500 | plumbing | `finish-towel-water` | finish | alias_update_only | Id есть («Установка…»); цена 7500; выровнять title к PDF «Монтаж…» | no_ui_change |
| Сантехмонтажные работы | 9.7 | Монтаж выводов под водяной полотенцесушитель | компл. | 5500 | plumbing | `towel-outlets-mount` | rough / finish | add_now | **P1** owner; labour | price_add_only · scenario_candidate (санузел) |
| Сантехмонтажные работы | 9.8 | Монтаж байпаса полотенцесушителя | шт. | 4500 | plumbing | `towel-bypass-mount` | rough | add_now | **P1** | price_add_only |
| Сантехмонтажные работы | 9.9 | Опрессовка узла полотенцесушителя | компл. | 2500 | plumbing | `towel-node-pressure-test` | check | add_now | **P1** | price_add_only |
| Сантехмонтажные работы | — | `finish-towel-reflectors` | комплекс | 1200 | plumbing | `finish-towel-reflectors` | finish | duplicate_do_not_add | Уже есть; не путать с 9.7 | no_ui_change |
| Конструкции ТЕСЕ | 1.1 | Монтаж профиля TECE (деталь) | шт. | 230 | plumbing | — | tece | future_section | Owner: ТЕСЕ 4 поз. пока future | no_ui_change |
| Конструкции ТЕСЕ | 1.2 | Монтаж кронштейна TECE | шт. | 230 | plumbing | — | tece | future_section | | no_ui_change |
| Конструкции ТЕСЕ | 1.3 | Монтаж соединительного элемента TECE | шт. | 120 | plumbing | — | tece | future_section | | no_ui_change |
| Конструкции ТЕСЕ | 1.4 | Монтаж прочих конструктивных элементов TECE | шт. | 230 | plumbing | — | tece | future_section | | no_ui_change |
| Сантехмонтажные работы | 9.* / 10.* / 11.* | Отопление: радиаторы, котлы, конвекторы… | — | — | heating | — | — | future_section | Отопление | no_ui_change |
| Сантехмонтажные работы | 12.* | Звукоизоляция стояка | — | — | — | — | — | out_of_scope_now | Docs out MVP | no_ui_change |
| Сантехмонтажные работы | 14.5 | Минимальный выезд… | выход | 15000 | — | — | — | out_of_scope_now | Выезд | no_ui_change |
| Монтаж финишной сантехники | 5.14 / 7.* | Гидромассаж / тумбы / зеркала | — | — | — | — | — | out_of_scope_now | Изделия / combined | no_ui_change |
| Монтаж финишной сантехники | 6.2 | Герметизация стеклянной душевой перегородки | м. пог. | 1050 | plumbing | `finish-shower-glass-seal` | finish | ask_owner | Labour ок, но не в утверждённом минимуме Stage A | price_add_only |

**Plumbing Stage A:** add_now **3** · alias **1** · TECE **4** future.

---

## 5. electrics (Электрика) — приоритет №5 (alias-pass)

Текущий mapping: **159**. Лотки: оставить **одну** укрупнённую строку (owner).

| PDF section | PDF code | PDF title | unit | unit_price | proposed section | proposed work_id | group | status | reason | UI impact |
|-------------|----------|-----------|------|------------|------------------|------------------|-------|--------|--------|-----------|
| Электромонтажные работы | 4.12–4.17 | Лотки по ширинам / повороты / крышка / траверса | м. пог. / шт. | разное | electrics | `conduit-tray-mount` | conduit | duplicate_do_not_add | Owner: **не плодить**; держать одну укрупнённую (350) | no_ui_change |
| Электромонтажные работы | — | Монтаж кабельного лотка (укрупнённо) | м. пог. | 350 | electrics | `conduit-tray-mount` | conduit | alias_update_only | Сверить title/note: «укрупнённо, без семейства ширин» | no_ui_change |
| Электромонтажные работы | — | Прокладка кабеля в лотке | м. пог. | 160 | electrics | `cable-tray` | cable | alias_update_only | Уже есть | no_ui_change |
| Монтаж финишной электрики | 1.* | TV + кронштейн / настройка | — | — | — | — | — | out_of_scope_now | Owner | no_ui_change |
| * | * | Neptun / Wi‑Fi / домофон | — | — | — | — | — | out_of_scope_now | Owner | no_ui_change |

### 5.1 Alias-pass: unmatched mapping titles (45)

Все ниже — **`alias_update_only`** (строка уже в калькуляторе; machine-audit не сматчил PDF title). **Не добавлять новые id в Stage A.**

| proposed work_id | current title (mapping) | unit_price | UI impact |
|------------------|-------------------------|------------|-----------|
| `layout-survey` | Электротехническое обследование объекта | 3000 | no_ui_change |
| `cable-ceiling` | Прокладка кабеля по потолку на крепёж | 170 | no_ui_change |
| `cable-ceiling-corrugated` | Прокладка кабеля по потолку в гофре | 190 | no_ui_change |
| `cable-low-current` | Прокладка слаботочного кабеля | 130 | no_ui_change |
| `conduit-gopher-pull` | Протяжка кабеля в готовую гофротрубу | 90 | no_ui_change |
| `conduit-gopher-pull-large` | Протяжка кабеля в гофротрубу большого сечения | 160 | no_ui_change |
| `conduit-gopher-mount` | Монтаж гофрированной трубы | 120 | no_ui_change |
| `conduit-pvc-rigid` | Монтаж жёсткой ПВХ-трубы | 180 | no_ui_change |
| `conduit-metal-hose` | Монтаж металлорукава | 200 | no_ui_change |
| `conduit-cable-channel` | Монтаж кабель-канала | 200 | no_ui_change |
| `conduit-tray-mount` | Монтаж кабельного лотка | 350 | no_ui_change |
| `podrozetnik-level` | Выравнивание подрозетников в один уровень | 300 | no_ui_change |
| `boxes-temp-plug` | Установка временной заглушки в подрозетник | 100 | no_ui_change |
| `cable-outlet-box` | Монтаж кабельного вывода | 250 | no_ui_change |
| `switching-crimp` | Опрессовка соединений проводов гильзами | 150 | no_ui_change |
| `junction-crimp` | Коммутация в распределительной коробке опрессовкой | 1000 | no_ui_change |
| `junction-solder` | Коммутация в распределительной коробке пайкой | 1400 | no_ui_change |
| `panel-enclosure-indoor-12` | Монтаж корпуса электрощита встраиваемого типа до 12 модулей | 6000 | no_ui_change |
| `panel-enclosure-indoor-24` | Монтаж корпуса электрощита встраиваемого типа до 24 модулей | 8400 | no_ui_change |
| `panel-cable-org` | Организация кабеля в электрощите | 2500 | no_ui_change |
| `panel-mark-breakers` | Маркировка автоматов в электрощите | 100 | no_ui_change |
| `panel-rebuild` | Реконструкция существующего электрощита | 8000 | no_ui_change |
| `terminals` | Монтаж клеммных колодок | 400 | no_ui_change |
| `comb-bus` | Монтаж гребёнчатой шины в электрощите | 400 | no_ui_change |
| `earthing-bath` | Заземление ванны | 800 | no_ui_change |
| `earthing-towel` | Заземление полотенцесушителя | 800 | no_ui_change |
| `earthing-dsup-conductor` | Прокладка проводника ДСУП | 150 | no_ui_change |
| `earthing-continuity-check` | Проверка непрерывности цепи заземления | 500 | no_ui_change |
| `underfloor-tubes` | Монтаж гофротрубки под датчик тёплого пола | 400 | no_ui_change |
| `underfloor-check` | Проверка сопротивления нагревательного мата тёплого пола | 500 | no_ui_change |
| `finish-outlet-block-3` | Монтаж и подключение блока из 3 розеток | 1700 | no_ui_change |
| `finish-outlet-blank` | Монтаж заглушки в рамку | 100 | no_ui_change |
| `finish-chandelier-complex` | Монтаж люстры повышенной сложности | 6500 | no_ui_change |
| `low-current-org-cables` | Организация слаботочных кабелей | 2000 | no_ui_change |
| `low-current-tv-crimp` | Монтаж телевизионного разъёма | 200 | no_ui_change |
| `low-current-test-tv` | Тестирование телевизионных линий | 500 | no_ui_change |
| `appliance-cooktop` | Подключение варочной панели | 2000 | no_ui_change |
| `appliance-hood` | Подключение кухонной вытяжки | 1200 | no_ui_change |
| `appliance-food-waste` | Подключение измельчителя пищевых отходов | 1500 | no_ui_change |
| `appliance-curtain-drive` | Подключение электропривода штор | 2000 | no_ui_change |
| `appliance-fan-ready` | Подключение вентилятора к готовой линии | 900 | no_ui_change |
| `appliance-pump` | Подключение насоса | 1800 | no_ui_change |
| `check-temp-cable-protect` | Временная защита кабеля на период отделки | 50 | no_ui_change |
| `check-group-after-mount` | Проверка группы после монтажа | 500 | no_ui_change |
| `check-final-mark` | Финальная маркировка электрики перед отделкой | 1000 | no_ui_change |

**Electrics Stage A add_now: 0.**

---

## 6. ceilings (Потолки) — приоритет №6 (почти без добавлений)

Текущий mapping: **35**. Демонтаж ГКЛ потолка уже есть (`demolition-gkl-frame`).

| PDF section | PDF code | PDF title | unit | unit_price | proposed section | proposed work_id | group | status | reason | UI impact |
|-------------|----------|-----------|------|------------|------------------|------------------|-------|--------|--------|-----------|
| Потолки «Грильято» | 1.*–6.* | Грильято / Armstrong (вся глава) | — | — | suspended-ceilings | — | — | future_section | Owner: будущий блок «Подвесные потолки» | no_ui_change |
| Общестроительные работы | 9.6 | Монтаж потолков Грильято, Армстронг | м² | 900 | suspended-ceilings | — | — | future_section | Не агрегировать в Stage A | no_ui_change |
| Гипсокартонные работы | * | Потолочные короба / каркасы ГКЛ | — | — | gkl | — | — | future_section | | no_ui_change |
| Малярные работы | 4.* | Потолочная шпаклёвка/шлифовка gaps | — | — | ceilings | — | — | out_of_scope_now | Stage A потолки почти не трогать; при необходимости — отдельный микро-pass | no_ui_change |

**Ceilings Stage A add_now: 0** (кроме косвенного: не трогать существующие alias).

---

## Итоги для утверждения

### 1. Финальный список `add_now`

**Tile (8):**
`cut-45-mosaic-small`, `cut-edge-abrasive`, `cut-inner-stress-relief`, `cut-figure-template`, `profile-corner-metal`, `profile-joint-metal`, `hatch-tile-fit`, `hatch-tile-clad`

**Floors P1 (17):**
`finish-quartz-lock-diagonal`, `finish-quartz-lock-herringbone`, `finish-quartz-steps`, `finish-laminate-quartz-clean-cut`, `finish-laminate-quartz-trim-wall`, `finish-laminate-quartz-pipe-hole`, `finish-quartz-primer`, `finish-quartz-glue-spread`, `finish-quartz-roller`, `finish-parquet-primer`, `finish-parquet-glue-spread`, `finish-parquet-roller`, `finish-plywood-cut`, `finish-plywood-sand`, `finish-plywood-glue`, `finish-parquet-trim-wall`, `finish-parquet-pipe-hole`

**Floors P2 (6):**
`finish-cover-door-jamb-cut`, `finish-cover-complex-contour`, `finish-base-local-sand-qv`, `finish-base-local-level-qv`, `finish-base-rule-check`, `finish-parquet-complex-fit`

**Walls P1 (4):**
`putty-boxes-niches`, `paint-boxes-niches-2`, `paint-slopes-roller-2`, `paint-color-junction-line`

**Walls P2 (3):**
`paint-narrow-300-2`, `paint-slopes-spray-2`, `demolition-gkl-wall-frame`

**Plumbing P1 (3):**
`towel-outlets-mount`, `towel-bypass-mount`, `towel-node-pressure-test`

**Electrics / Ceilings:** нет `add_now`.

| Раздел | add_now (все) | из них P1 | из них P2 |
|--------|---------------|-----------|-----------|
| tile | 8 | 8 | 0 |
| floors | 23 | 17 | 6 |
| walls | 7 | 4 | 3 |
| plumbing | 3 | 3 | 0 |
| electrics | 0 | 0 | 0 |
| ceilings | 0 | 0 | 0 |
| **Σ** | **41** | **32** | **9** |

Рекомендация к первому PR: только **P1 (32)**; P2 — вторым коммитом Stage A после приёмки.

### 2. `alias_update_only`

- **Tile (~10):** `cut-45-*` (3), `corner-cement/epoxy`, `grout-epoxy-mosaic`, `seal-prep`, `seal-silicone`; `seal-bath`/**1050** (финиш-сантех 4.9), `seal-door`/**350** (двери 7.6). *Не* путать с плиточными 8.5/8.6 (800/600).
- **Floors (1):** `finish-base-sanding-leveling`
- **Plumbing (1):** `finish-towel-water` title
- **Electrics (~45 + tray notes):** полный список §5.1

### 3. `future_section`

- ГКЛ / каркасы (глава гипсокартон + массовый монтаж)
- Подвесные потолки (Грильято / Armstrong)
- Отопление
- Конструкции ТЕСЕ (1.1–1.4)
- Кладка, двери, кондиционирование, звукоизоляция, Stage 10 «Прочее»
- Фанера/доска на потолок (паркет 3.x)

### 4. Осталось `ask_owner`

1. `seal-tape` (Tile 250) — оставить как есть / удалить / перенести смысл в Полы?
2. Кварцвинил на стену (Ламинат 1.9) — стены / плитка / out?
3. Герметизация стеклянной душевой перегородки (финиш сантех 6.2) — в Stage A P2 или нет?
4. Нужен ли P2 floors/walls в том же PR, что P1?

### 5. Оценка роста mapping

| Mapping | Сейчас | + add_now (все) | После (все) | + только P1 | После P1 |
|---------|--------|-----------------|-------------|-------------|----------|
| tile | 55 | +8 | 63 | +8 | 63 |
| floors | 95 | +23 | 118 | +17 | 112 |
| walls | 57 | +7 | 64 | +4 | 61 |
| ceilings | 35 | +0 | 35 | +0 | 35 |
| electrics | 159 | +0 | 159 | +0 | 159 |
| plumbing | 163 | +3 | 166 | +3 | 166 |
| **Σ** | **564** | **+41** | **605** | **+32** | **596** |

### 6. Сценарии vs только price-add

| Обновить сценарии? | Что |
|--------------------|-----|
| **Нет / минимально** в Stage A | Почти все `add_now` → **`price_add_only`** |
| **Возможный scenario_candidate позже** | `towel-outlets-mount` (+ существующий `finish-towel-water`) в санузловом сценарии сантехники; `finish-quartz-steps` — только если часто на замере |
| **Не трогать** | Default электрика/компактные сценарии; лотки; Грильято; ГКЛ |

Alias-pass **не** требует правок сценариев.

### 7. Новые input-поля

| Поле | Нужно? |
|------|--------|
| Новые zone counters | **Нет** для P1: резы/профили/люки/подрезки → `manual` или существующие `cuttingLength` / area / `plumbingTowelWarmersCount` |
| `plumbingTowelWarmersCount` | Уже есть для `finish-towel-water`; для 9.7–9.9 — **`manual`** или тот же counter (предложение: outlets/bypass/press = `manual`, чтобы не плодить поля) |
| Длины профиля / заусовки | Использовать существующий tile `cuttingLength` / `cornerLength` где есть; иначе `manual` |
| Вывод | **`needs_new_input` ≈ 0** для Stage A P1 |

---

## Чеклист перед реализацией (Stage 3)

- [x] Утвердить объём: **только P1 (~32)**
- [x] ask_owner: seal-tape / КВ на стену / стекло душ — **не делать**
- [x] P1 mapping + docs
- [ ] Stage 4–5 XLSX template/import — следующий эпик

**Не делать вне P1:** импорт прайса; массовый ГКЛ/Грильято; Neptun/TV/Wi‑Fi; экраны/фартук 35k/подоконник; ТЕСЕ; семейство лотков.
