import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'

const { Response } = globalThis

async function load(entry) {
  const bundle = await build({
    entryPoints: [entry],
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
    define: { 'import.meta.env': '{}' },
  })
  return import(
    `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}#${Math.random()}`
  )
}

const { attributionForVisit, normalizeAttribution } = await load(
  'src/shared/lib/lead-attribution.ts',
)

test('captures the first landing and only allowlisted query fields, without referrer path or query', () => {
  const data = attributionForVisit(
    'https://anfas-remont.ru/services/design?utm_source=chatgpt.com&utm_campaign=design&email=private@example.test#contact',
    'https://chatgpt.com/c/private-conversation?token=private',
  )
  assert.deepEqual(data.firstTouch, {
    landingPath: '/services/design',
    referrerHost: 'chatgpt.com',
    utmSource: 'chatgpt.com',
    utmMedium: '',
    utmCampaign: 'design',
  })
  assert.doesNotMatch(JSON.stringify(data), /private|conversation|email|token/)
})

test('keeps first touch and last external source through internal navigation and direct reload', () => {
  const first = attributionForVisit('https://anfas-remont.ru/projects/', 'https://chatgpt.com/')
  const internal = attributionForVisit(
    'https://anfas-remont.ru/services/',
    'https://anfas-remont.ru/projects/',
    first,
  )
  assert.deepEqual(internal, first)
  assert.deepEqual(attributionForVisit('https://anfas-remont.ru/', '', first), first)
  const later = attributionForVisit(
    'https://anfas-remont.ru/?utm_source=yandex',
    'https://yandex.ru/search/',
    first,
  )
  assert.deepEqual(later.firstTouch, first.firstTouch)
  assert.equal(later.lastTouch.referrerHost, 'yandex.ru')
  assert.equal(later.lastTouch.utmSource, 'yandex')
})

test('cross-site links from the old company site are internal, not a new acquisition', () => {
  assert.equal(
    attributionForVisit('https://anfas-remont.ru/', 'https://anfas-art.ru/').firstTouch
      .referrerHost,
    '',
  )
  assert.equal(
    attributionForVisit('https://anfas-remont.ru/', 'javascript:alert(1)').firstTouch.referrerHost,
    '',
  )
})

test('empty and corrupt values never invent a ChatGPT source', () => {
  assert.equal(attributionForVisit('https://anfas-remont.ru/', '').firstTouch.referrerHost, '')
  for (const value of [null, [], {}, { firstTouch: 'bad', lastTouch: {} }]) {
    assert.equal(normalizeAttribution(value), undefined)
  }
  const dirty = {
    landingPath: '/services/?token=secret',
    referrerHost: 'evil.test/path',
    utmSource: 'a\n'.repeat(120),
  }
  const normalized = normalizeAttribution({ firstTouch: dirty, lastTouch: dirty, extra: 'secret' })
  assert.equal(normalized.firstTouch.landingPath, '/services/')
  assert.equal(normalized.firstTouch.referrerHost, '')
  assert.equal(normalized.firstTouch.utmSource.length, 100)
  assert.doesNotMatch(JSON.stringify(normalized), /secret|\\n/)
})

test('capture survives SPA navigation and unavailable sessionStorage without breaking the form', async () => {
  const savedWindow = globalThis.window
  const savedDocument = globalThis.document
  try {
    globalThis.window = {
      location: new URL('https://anfas-remont.ru/?utm_source=chatgpt.com'),
      sessionStorage: {
        getItem() {
          throw new Error('blocked')
        },
        setItem() {
          throw new Error('blocked')
        },
      },
    }
    globalThis.document = { referrer: 'https://chatgpt.com/c/private' }
    const { captureLeadAttribution } = await load('src/shared/lib/lead-attribution.ts')
    const first = captureLeadAttribution()
    globalThis.window.location = new URL('https://anfas-remont.ru/services/')
    assert.deepEqual(captureLeadAttribution(), first)
    assert.equal(first.firstTouch.utmSource, 'chatgpt.com')
  } finally {
    globalThis.window = savedWindow
    globalThis.document = savedDocument
  }
})

test('existing tab attribution is read safely and updated on a new external document', async () => {
  const savedWindow = globalThis.window
  const savedDocument = globalThis.document
  const first = attributionForVisit('https://anfas-remont.ru/projects/', 'https://chatgpt.com/')
  let stored = JSON.stringify(first)
  try {
    globalThis.window = {
      location: new URL('https://anfas-remont.ru/services/?utm_source=maps'),
      sessionStorage: {
        getItem: () => stored,
        setItem: (_key, value) => {
          stored = value
        },
      },
    }
    globalThis.document = { referrer: 'https://yandex.ru/maps/' }
    const { captureLeadAttribution } = await load('src/shared/lib/lead-attribution.ts')
    const current = captureLeadAttribution()
    assert.deepEqual(current.firstTouch, first.firstTouch)
    assert.equal(current.lastTouch.referrerHost, 'yandex.ru')
    assert.deepEqual(JSON.parse(stored), current)
  } finally {
    globalThis.window = savedWindow
    globalThis.document = savedDocument
  }
})

test('submits source with the enquiry and records success only after a successful backend response', async () => {
  const savedWindow = globalThis.window
  const savedDocument = globalThis.document
  const savedFetch = globalThis.fetch
  const goals = []
  let request
  let response = new Response(JSON.stringify({ ok: false }), { status: 502 })
  try {
    globalThis.window = {
      location: new URL(
        'https://anfas-remont.ru/services/design?utm_source=chatgpt.com&email=secret@example.test',
      ),
      sessionStorage: { getItem: () => null, setItem() {} },
      ym: (...args) => goals.push(args),
    }
    globalThis.document = { referrer: 'https://chatgpt.com/c/private' }
    globalThis.fetch = async (_url, options) => {
      request = JSON.parse(options.body)
      return response
    }
    const { submitLead } = await load('src/features/brief/api/submitLead.ts')
    const payload = {
      name: 'Тест',
      phone: '+7 (999) 000-00-00',
      service: 'design',
      sourceSelfReported: 'other',
    }
    assert.equal((await submitLead(payload)).ok, false)
    assert.equal(goals.length, 0)
    response = new Response(JSON.stringify({ ok: true }))
    assert.equal((await submitLead(payload)).ok, true)
    assert.equal(request.service, 'design')
    assert.equal(request.sourceSelfReported, 'other')
    assert.equal(request.attribution.firstTouch.referrerHost, 'chatgpt.com')
    assert.equal(request.page, 'https://anfas-remont.ru/services/design')
    assert.equal(goals[0][2], 'lead_form_success')
    assert.equal(goals[0][3].acquisition.chatgpt_first_touch, 'referrer_and_utm')
    assert.equal(goals[0][3].source_self_reported, 'other')
    assert.doesNotMatch(JSON.stringify(goals), /999|Тест|secret|private/)
    globalThis.fetch = async () => {
      throw new Error('offline')
    }
    assert.equal((await submitLead(payload)).ok, false)
    assert.equal(goals.length, 1)
  } finally {
    globalThis.window = savedWindow
    globalThis.document = savedDocument
    globalThis.fetch = savedFetch
  }
})

test('automatic acquisition distinguishes referrer and UTM without treating a form answer as proof', async () => {
  const { automaticAcquisitionParams } = await load('src/shared/lib/yandex-metrika/acquisition.ts')
  const visit = (referrerHost, utmSource = '') => ({
    landingPath: '/', referrerHost, utmSource, utmMedium: '', utmCampaign: '',
  })
  for (const [host, utm, expected] of [
    ['chatgpt.com', '', 'referrer'],
    ['chat.openai.com', '', 'referrer'],
    ['search.chatgpt.com', '', 'referrer'],
    ['', 'ChatGPT.com', 'utm'],
    ['chatgpt.com', 'chatgpt', 'referrer_and_utm'],
    ['chatgpt.com.evil.test', '', 'not_detected'],
    ['notchatgpt.com', '', 'not_detected'],
    ['', '', 'not_detected'],
  ]) {
    const params = automaticAcquisitionParams({ firstTouch: visit(host, utm), lastTouch: visit('yandex.ru'), sourceSelfReported: 'chatgpt' })
    assert.equal(params.acquisition.chatgpt_first_touch, expected)
    assert.equal(params.acquisition.chatgpt_last_touch, 'not_detected')
    assert.doesNotMatch(JSON.stringify(params), /yandex|landingPath|referrerHost|utmSource|sourceSelfReported/)
  }
  assert.equal(automaticAcquisitionParams().acquisition.chatgpt_first_touch, 'not_detected')
})

test('visit reporting survives unavailable analytics, queues one params update and creates no goal', async () => {
  const savedWindow = globalThis.window
  try {
    const { reportAcquisition } = await load('src/shared/lib/yandex-metrika/acquisition.ts')
    const attribution = attributionForVisit('https://anfas-remont.ru/', 'https://chatgpt.com/')
    globalThis.window = {}
    assert.doesNotThrow(() => reportAcquisition(attribution))
    globalThis.window.ym = () => { throw new Error('blocked') }
    assert.doesNotThrow(() => reportAcquisition(attribution))
    const calls = []
    globalThis.window.ym = (...args) => calls.push(args)
    reportAcquisition(attribution)
    reportAcquisition(attribution)
    assert.equal(calls.length, 1)
    assert.equal(calls[0][1], 'params')
    assert.equal(calls[0][2].acquisition.chatgpt_first_touch, 'referrer')
  } finally {
    globalThis.window = savedWindow
  }
})
