import { YANDEX_METRIKA_ID } from '@/shared/config/analytics'
import {
  captureLeadAttribution,
  type LeadAttribution,
  type LeadTouch,
} from '@/shared/lib/lead-attribution'

type ChatGptEvidence = 'referrer' | 'utm' | 'referrer_and_utm' | 'not_detected'

function chatGptEvidence(touch?: LeadTouch): ChatGptEvidence {
  const host = touch?.referrerHost.toLowerCase() ?? ''
  const referrer =
    host === 'chatgpt.com' || host.endsWith('.chatgpt.com') || host === 'chat.openai.com'
  const utm = ['chatgpt', 'chatgpt.com', 'chat.openai.com'].includes(
    touch?.utmSource.trim().toLowerCase() ?? '',
  )

  if (referrer && utm) return 'referrer_and_utm'
  if (referrer) return 'referrer'
  if (utm) return 'utm'
  return 'not_detected'
}

/** Technical signals only; never infer a source from the visitor's form answer. */
export function automaticAcquisitionParams(attribution?: LeadAttribution) {
  return {
    acquisition: {
      version: 'referrer_utm_v1',
      chatgpt_first_touch: chatGptEvidence(attribution?.firstTouch),
      chatgpt_last_touch: chatGptEvidence(attribution?.lastTouch),
    },
  }
}

let reported = false

/** One parameter update per document; no extra pageview or lead goal is created. */
export function reportAcquisition(attribution = captureLeadAttribution()) {
  if (reported || typeof window === 'undefined' || typeof window.ym !== 'function') return
  try {
    window.ym(YANDEX_METRIKA_ID, 'params', automaticAcquisitionParams(attribution))
    reported = true
  } catch {
    // Analytics must not interrupt a visit or a real enquiry.
  }
}
