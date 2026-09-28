import type { EstimatePriceProfile } from '@/entities/estimate'
import {
  parseEstimateCalculatorSnapshot,
  type EstimateCalculatorSnapshot,
} from './estimate-calculator-persistence'
import { parseDocumentDetails, type EstimateDocumentDetails } from './estimate-document'
import { parseStoredPriceProfile } from './estimate-price-profile-xlsx'

export type EstimatePayload = {
  snapshot: EstimateCalculatorSnapshot | null
  details: EstimateDocumentDetails
  priceProfile: EstimatePriceProfile | null
}
export type SavedEstimate = {
  id: string
  title: string
  isFavorite: boolean
  revision: number
  createdAt: string
  updatedAt: string
  payload: EstimatePayload
}
export type EstimateSummary = Omit<SavedEstimate, 'payload'> & {
  object: string
  customer: string
  number: string
  date: string
  estimator: string
}

export async function estimateRequest<T>(path = '', method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(import.meta.env.BASE_URL + 'api/estimates' + path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers:
      method === 'GET'
        ? undefined
        : { 'Content-Type': 'application/json', 'X-Anfas-Client': 'web' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 204) return undefined as T
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401)
      throw new Error('Сессия завершилась. Войдите снова; изменения пока не сохранены.')
    if (response.status === 413) throw new Error('Смета слишком большая. Скачайте резервную копию.')
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : 'Не удалось выполнить запрос. Повторите позже.',
    )
  }
  if (!data) throw new Error('Сервер смет недоступен. Повторите позже.')
  return data as T
}

export function readSavedPayload(payload: EstimatePayload): EstimatePayload {
  const snapshot = parseEstimateCalculatorSnapshot(payload.snapshot)
  if (!snapshot) throw new Error('Не удалось прочитать формат сохранённой сметы.')
  const priceProfile = payload.priceProfile ? parseStoredPriceProfile(payload.priceProfile) : null
  if (payload.priceProfile && !priceProfile)
    throw new Error('Не удалось прочитать прайс сохранённой сметы.')
  return { snapshot, details: parseDocumentDetails(payload.details), priceProfile }
}
