import { briefServiceOptions, type BriefService } from '../model/brief.form'
import type { BriefFormValues } from '../model/brief.schema'

export type SubmitLeadPayload = BriefFormValues & {
  source?: string
  page?: string
  company?: string
}

export type SubmitLeadResult =
  | { ok: true }
  | { ok: false; error: string; status?: number }

const DEFAULT_ENDPOINT = '/api/lead.php'

function resolveEndpoint() {
  const fromEnv = import.meta.env.VITE_LEAD_API_URL
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim()
  }
  return DEFAULT_ENDPOINT
}

export function getServiceLabel(service: BriefService) {
  return briefServiceOptions.find((option) => option.value === service)?.label ?? service
}

export async function submitLead(payload: SubmitLeadPayload): Promise<SubmitLeadResult> {
  const endpoint = resolveEndpoint()

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        phone: payload.phone,
        service: payload.service,
        wishes: payload.wishes ?? '',
        source: payload.source ?? 'site',
        page: payload.page ?? (typeof window !== 'undefined' ? window.location.href : ''),
        company: payload.company ?? '',
      }),
    })

    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null

    if (!response.ok || !data?.ok) {
      return {
        ok: false,
        status: response.status,
        error: data?.error || 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.',
      }
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      error: 'Нет связи с сервером. Проверьте интернет или позвоните нам.',
    }
  }
}
