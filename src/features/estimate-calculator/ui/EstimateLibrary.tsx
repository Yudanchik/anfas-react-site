import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { emptyDocumentDetails, type EstimateDocumentDetails } from '../model/estimate-document'
import {
  estimateRequest,
  readSavedPayload,
  type EstimatePayload,
  type EstimateSummary,
  type SavedEstimate,
} from '../model/saved-estimates'
import { EstimateCalculatorWorkspace } from './EstimateCalculatorWorkspace'
import { EstimateRenameDialog } from './EstimateRenameDialog'
import { EstimateActionIcon } from './EstimateActionIcon'
import { EstimateDocumentFields } from './EstimateDocumentFields'
import { EstimateConfirmDialog } from './EstimateConfirmDialog'
import styles from './EstimateLibrary.module.scss'

type Draft = { id?: string; revision?: number; seed: EstimatePayload; epoch: number }
type Props = { userId: number; onDirtyChange: (dirty: boolean) => void }
type SortKey = 'title' | 'object' | 'customer' | 'estimator' | 'createdAt' | 'updatedAt'
const sortColumns: { key: SortKey; label: string }[] = [
  { key: 'title', label: 'Название' },
  { key: 'object', label: 'Объект' },
  { key: 'customer', label: 'Заказчик' },
  { key: 'estimator', label: 'Составил' },
  { key: 'createdAt', label: 'Дата создания' },
  { key: 'updatedAt', label: 'Последнее изменение' },
]
const date = (value: string) =>
  new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export function EstimateLibrary({ userId, onDirtyChange }: Props) {
  const list = useQuery({
    queryKey: ['saved-estimates', userId],
    queryFn: () => estimateRequest<{ estimates: EstimateSummary[] }>(),
    retry: false,
  })
  const [draft, setDraft] = useState<Draft | null>(null)
  const [details, setDetails] = useState<EstimateDocumentDetails>(emptyDocumentDetails)
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'updatedAt',
    direction: 'desc',
  })
  const [renaming, setRenaming] = useState<EstimateSummary | null>(null)
  const [renameError, setRenameError] = useState('')
  const [title, setTitle] = useState('')
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState<EstimateSummary | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const latest = useRef<EstimatePayload | null>(null)
  const baseline = useRef<string | null>(null)
  const titleRef = useRef('')
  const savedId = useRef<string | undefined>(undefined)
  const blocker = useBlocker(dirty || busy)

  useEffect(() => {
    onDirtyChange(dirty || busy)
    return () => onDirtyChange(false)
  }, [dirty, busy, onDirtyChange])
  useEffect(() => {
    if (!dirty && !busy) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, busy])

  const changed = useCallback((payload: EstimatePayload) => {
    latest.current = payload
    const serialized = JSON.stringify([titleRef.current, payload])
    if (baseline.current === null && savedId.current) baseline.current = serialized
    setDirty(!savedId.current || serialized !== baseline.current)
  }, [])

  function begin(seed: EstimatePayload, name: string, record?: SavedEstimate) {
    latest.current = null
    baseline.current = null
    savedId.current = record?.id
    titleRef.current = name
    setTitle(name)
    setDetails(seed.details)
    setDraft({ id: record?.id, revision: record?.revision, seed, epoch: 0 })
    setDirty(!record)
    setError('')
    setMessage('')
  }
  async function open(id: string) {
    setBusy(true)
    setError('')
    try {
      const { estimate } = await estimateRequest<{ estimate: SavedEstimate }>('/' + id)
      begin(readSavedPayload(estimate.payload), estimate.title, estimate)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось открыть смету.')
    } finally {
      setBusy(false)
    }
  }
  async function save() {
    if (!latest.current?.snapshot || !draft || busy || !title.trim()) return
    setBusy(true)
    setError('')
    setMessage('')
    const payload = latest.current
    const requestedTitle = title
    const name = title.trim()
    try {
      const { estimate } = await estimateRequest<{ estimate: SavedEstimate }>(
        draft.id ? '/' + draft.id : '',
        draft.id ? 'PATCH' : 'POST',
        {
          title: name,
          payload,
          ...(draft.id ? { revision: draft.revision } : {}),
        },
      )
      if (titleRef.current === requestedTitle) {
        titleRef.current = name
        setTitle(name)
      }
      savedId.current = estimate.id
      baseline.current = JSON.stringify([name, payload])
      setDraft((current) =>
        current ? { ...current, id: estimate.id, revision: estimate.revision } : current,
      )
      // Edits made while the request was running remain unsaved.
      setDirty(JSON.stringify([titleRef.current, latest.current]) !== baseline.current)
      setMessage('Смета сохранена в вашем аккаунте.')
      await list.refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить смету.')
    } finally {
      setBusy(false)
    }
  }
  function back() {
    setDraft(null)
    setDirty(false)
    setError('')
    setMessage('')
    latest.current = null
    void list.refetch()
  }
  async function remove() {
    if (!deleting || busy) return
    setBusy(true)
    setError('')
    try {
      await estimateRequest('/' + deleting.id, 'DELETE', { revision: deleting.revision })
      setMessage('Смета удалена.')
      await list.refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить смету.')
      await list.refetch()
    } finally {
      setBusy(false)
      setDeleting(null)
    }
  }

  async function copy(estimate: EstimateSummary) {
    if (busy) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const { estimate: created } = await estimateRequest<{ estimate: SavedEstimate }>(
        '/' + estimate.id + '/copy',
        'POST',
        {},
      )
      setSearch('')
      setPage(0)
      setOnlyFavorites(false)
      setSort({ key: 'updatedAt', direction: 'desc' })
      setMessage(
        'Создана «' +
          created.title +
          '». Номер и реквизиты скопированы — измените их при необходимости.',
      )
      await list.refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать копию.')
    } finally {
      setBusy(false)
    }
  }
  async function favorite(estimate: EstimateSummary) {
    if (busy) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await estimateRequest('/' + estimate.id + '/favorite', 'PATCH', {
        isFavorite: !estimate.isFavorite,
      })
      await list.refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось изменить избранное.')
    } finally {
      setBusy(false)
    }
  }

  async function rename(title: string) {
    if (!renaming || busy) return
    if (!title) {
      setRenameError('Введите название сметы.')
      return
    }
    setBusy(true)
    setRenameError('')
    setMessage('')
    try {
      await estimateRequest('/' + renaming.id + '/title', 'PATCH', {
        title,
        revision: renaming.revision,
      })
      setRenaming(null)
      setMessage('Название сметы обновлено.')
      await list.refetch()
    } catch (e) {
      setRenameError(e instanceof Error ? e.message : 'Не удалось изменить название.')
      await list.refetch()
    } finally {
      setBusy(false)
    }
  }
  function toggleSort(key: SortKey) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
    setPage(0)
  }

  const estimates = list.data?.estimates ?? []
  const query = search.trim().toLocaleLowerCase('ru-RU').replaceAll('ё', 'е')
  const filtered = estimates.filter(
    (estimate) =>
      (!onlyFavorites || estimate.isFavorite) &&
      [estimate.title, estimate.number, estimate.object, estimate.customer, estimate.estimator]
        .join(' ')
        .toLocaleLowerCase('ru-RU')
        .replaceAll('ё', 'е')
        .includes(query),
  )
  const ordered = [...filtered].sort((a, b) => {
    const left = a[sort.key]
    const right = b[sort.key]
    if (!left && right) return 1
    if (left && !right) return -1
    const result = (left || '').localeCompare(right || '', 'ru', {
      numeric: true,
      sensitivity: 'base',
    })
    return (sort.direction === 'asc' ? result : -result) || a.id.localeCompare(b.id)
  })
  const pageSize = 20
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pages - 1)
  const visible = ordered.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  return (
    <div className={styles.library + ' ym-hide-content'}>
      <section className={styles.panel} aria-labelledby="my-estimates-title">
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Личный кабинет</span>
            <h1 id="my-estimates-title">{draft ? 'Ваша смета' : 'Мои сметы'}</h1>
            <p>
              {draft
                ? 'Сохраните изменения, чтобы открыть их на другом устройстве.'
                : 'Все ваши расчёты в одном месте. Сметы доступны только вам.'}
            </p>
          </div>
          <div className={styles.actions}>
            {draft ? (
              <>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={busy}
                  onClick={() => (dirty ? setLeaving(true) : back())}
                >
                  К списку
                </button>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={busy || !title.trim() || !dirty}
                  onClick={() => void save()}
                >
                  {busy ? 'Сохраняем…' : 'Сохранить смету'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className={styles.primary}
                disabled={busy}
                onClick={() =>
                  begin(
                    { snapshot: null, details: emptyDocumentDetails(), priceProfile: null },
                    'Новая смета',
                  )
                }
              >
                Новая смета
              </button>
            )}
          </div>
        </div>
        {draft && (
          <label className={styles.name}>
            Название сметы
            <input
              maxLength={120}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                titleRef.current = event.target.value
                setDirty(JSON.stringify([event.target.value, latest.current]) !== baseline.current)
              }}
            />
          </label>
        )}
        {draft && <EstimateDocumentFields value={details} onChange={setDetails} />}
        {draft && (
          <p className={styles.status} role="status">
            {dirty ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}
          </p>
        )}
        {message && <p role="status">{message}</p>}
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </section>
      {draft ? (
        <EstimateCalculatorWorkspace
          key={draft.epoch}
          accountPayload={draft.seed}
          accountDetails={details}
          onAccountDetailsChange={setDetails}
          onAccountChange={changed}
          onAccountImport={(payload) => {
            latest.current = payload
            setDetails(payload.details)
            setDraft((current) =>
              current ? { ...current, seed: payload, epoch: current.epoch + 1 } : current,
            )
            setDirty(true)
          }}
        />
      ) : (
        <>
          {list.isPending && <p role="status">Загружаем ваши сметы…</p>}
          {list.error && (
            <section className={styles.panel}>
              <p role="alert">Не удалось загрузить сметы. {list.error.message}</p>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => void list.refetch()}
              >
                Повторить
              </button>
            </section>
          )}
          {list.data?.estimates.length === 0 && (
            <section className={styles.empty}>
              <h2>Здесь появится ваша первая смета</h2>
              <p>Создайте расчёт, добавьте работы и сохраните результат в аккаунте.</p>
            </section>
          )}
          {estimates.length > 0 && (
            <section className={styles.listPanel} aria-label="Список сохранённых смет">
              <div className={styles.filters} role="group" aria-label="Раздел списка смет">
                <button
                  type="button"
                  className={styles.filterButton}
                  aria-pressed={!onlyFavorites}
                  onClick={() => {
                    setOnlyFavorites(false)
                    setPage(0)
                  }}
                >
                  Все сметы <span>{estimates.length}</span>
                </button>
                <button
                  type="button"
                  className={styles.filterButton}
                  aria-pressed={onlyFavorites}
                  onClick={() => {
                    setOnlyFavorites(true)
                    setPage(0)
                  }}
                >
                  Избранное <span>{estimates.filter((e) => e.isFavorite).length}</span>
                </button>
              </div>
              <div className={styles.toolbar}>
                <label className={styles.search}>
                  <span className={styles.visuallyHidden}>Поиск по сметам</span>
                  <input
                    type="search"
                    placeholder="Название, номер, заказчик или составитель"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPage(0)
                    }}
                  />
                </label>
                <span className={styles.count} role="status">
                  {query || onlyFavorites
                    ? 'Найдено: ' + filtered.length + ' из ' + estimates.length
                    : 'Всего смет: ' + estimates.length}
                </span>
              </div>
              {filtered.length === 0 ? (
                <div className={styles.noResults}>
                  <p>
                    {onlyFavorites && !query
                      ? 'В избранном пока нет смет. Отметьте нужную смету сердечком в общем списке.'
                      : 'По вашему запросу смет не найдено.'}
                  </p>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => {
                      setSearch('')
                      setOnlyFavorites(false)
                      setPage(0)
                    }}
                  >
                    Сбросить поиск
                  </button>
                </div>
              ) : (
                <table className={styles.table}>
                  <caption className={styles.visuallyHidden}>Ваши сохранённые сметы</caption>
                  <thead>
                    <tr>
                      {sortColumns.map((column) => (
                        <th
                          key={column.key}
                          scope="col"
                          aria-sort={
                            sort.key === column.key
                              ? sort.direction === 'asc'
                                ? 'ascending'
                                : 'descending'
                              : 'none'
                          }
                        >
                          <button
                            type="button"
                            className={styles.sortHeader}
                            onClick={() => toggleSort(column.key)}
                          >
                            {column.label}
                            <span aria-hidden="true" className={styles.sortArrow}>
                              {sort.key === column.key
                                ? sort.direction === 'asc'
                                  ? '↑'
                                  : '↓'
                                : '↕'}
                            </span>
                          </button>
                        </th>
                      ))}
                      <th scope="col">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((estimate) => (
                      <tr
                        key={estimate.id}
                        className={styles.estimateRow}
                        onPointerUp={(event) => {
                          // The title button provides keyboard access; pointer clicks anywhere else in a row open the estimate.
                          if (
                            busy ||
                            event.button !== 0 ||
                            (event.target as Element).closest('button') ||
                            window.getSelection()?.toString()
                          )
                            return
                          void open(estimate.id)
                        }}
                      >
                        <th scope="row" className={styles.titleCell}>
                          <button
                            type="button"
                            className={styles.titleButton}
                            disabled={busy}
                            onClick={() => void open(estimate.id)}
                          >
                            {estimate.title}
                          </button>
                          <small className={styles.number}>
                            {estimate.number ? '№ ' + estimate.number : 'Без номера'}
                          </small>
                        </th>
                        <td className={styles.objectCell} data-label="Объект">
                          {estimate.object || '—'}
                        </td>
                        <td className={styles.customerCell} data-label="Заказчик">
                          {estimate.customer || '—'}
                        </td>
                        <td className={styles.estimatorCell} data-label="Составил">
                          {estimate.estimator || '—'}
                        </td>
                        <td className={styles.dateCell} data-label="Создана">
                          <time dateTime={estimate.createdAt}>{date(estimate.createdAt)}</time>
                        </td>
                        <td className={styles.dateCell} data-label="Изменена">
                          <time dateTime={estimate.updatedAt}>{date(estimate.updatedAt)}</time>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.iconButton}
                              disabled={busy}
                              title="Изменить название"
                              aria-label={'Изменить название сметы «' + estimate.title + '»'}
                              onClick={() => {
                                setRenameError('')
                                setRenaming(estimate)
                              }}
                            >
                              <EstimateActionIcon name="rename" />
                            </button>
                            <button
                              type="button"
                              className={styles.iconButton}
                              disabled={busy}
                              title={estimate.isFavorite ? 'Убрать из избранного' : 'В избранное'}
                              aria-pressed={estimate.isFavorite}
                              aria-label={
                                (estimate.isFavorite ? 'Убрать из избранного: ' : 'В избранное: ') +
                                estimate.title
                              }
                              onClick={() => void favorite(estimate)}
                            >
                              <EstimateActionIcon name="favorite" filled={estimate.isFavorite} />
                            </button>
                            <button
                              type="button"
                              className={styles.iconButton}
                              disabled={busy}
                              title="Скопировать смету"
                              aria-label={'Скопировать смету «' + estimate.title + '»'}
                              onClick={() => void copy(estimate)}
                            >
                              <EstimateActionIcon name="copy" />
                            </button>
                            <button
                              type="button"
                              className={styles.iconButton + ' ' + styles.dangerIcon}
                              disabled={busy}
                              title="Удалить смету"
                              aria-label={'Удалить смету «' + estimate.title + '»'}
                              onClick={() => setDeleting(estimate)}
                            >
                              <EstimateActionIcon name="delete" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {pages > 1 && (
                <nav className={styles.pagination} aria-label="Страницы списка смет">
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={currentPage === 0}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Назад
                  </button>
                  <span aria-live="polite">
                    {currentPage + 1} / {pages}
                  </span>
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={currentPage + 1 === pages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Далее
                  </button>
                </nav>
              )}
            </section>
          )}
        </>
      )}
      {renaming && (
        <EstimateRenameDialog
          key={renaming.id}
          title={renaming.title}
          busy={busy}
          error={renameError}
          onSave={(title) => void rename(title)}
          onCancel={() => setRenaming(null)}
        />
      )}
      <EstimateConfirmDialog
        open={!!deleting && !busy}
        title="Удалить смету?"
        description={`«${deleting?.title ?? ''}» будет удалена из аккаунта. Это действие нельзя отменить.`}
        onConfirm={() => void remove()}
        onCancel={() => setDeleting(null)}
      />
      <EstimateConfirmDialog
        open={leaving}
        title="Выйти без сохранения?"
        description="Последние изменения не сохранены. Сохранённая версия сметы останется в аккаунте."
        confirmLabel="Выйти без сохранения"
        onConfirm={() => {
          setLeaving(false)
          back()
        }}
        onCancel={() => setLeaving(false)}
      />
      <EstimateConfirmDialog
        open={blocker.state === 'blocked' && !busy}
        title="Покинуть смету?"
        description="Сначала сохраните изменения или продолжите без сохранения."
        confirmLabel="Продолжить без сохранения"
        onConfirm={() => blocker.state === 'blocked' && blocker.proceed()}
        onCancel={() => blocker.state === 'blocked' && blocker.reset()}
      />
    </div>
  )
}
