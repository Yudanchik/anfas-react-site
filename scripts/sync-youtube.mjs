import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { XMLParser } from 'fast-xml-parser'

const CHANNEL_ID = 'UChZ-WUIYH_sPxI_ZvKf6V-Q'
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`
const LIMIT = 9

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const generatedPath = resolve(
  root,
  'src/shared/content/youtube/youtube-videos.generated.ts',
)
const fallbackJsonPath = resolve(
  root,
  'src/shared/content/youtube/youtube-videos.fallback.json',
)

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
})

function asArray(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function loadFallbackVideos() {
  const source = readFileSync(fallbackJsonPath, 'utf8')
  const videos = JSON.parse(source)
  if (!Array.isArray(videos)) {
    throw new Error('youtube-videos.fallback.json must be an array')
  }
  return videos
}

function keepExistingGenerated() {
  if (!existsSync(generatedPath)) {
    console.warn('[sync:youtube] Нет generated-файла, оставляем как есть.')
    return
  }
  console.warn('[sync:youtube] Сохраняем существующие generated-данные.')
}

function writeGenerated(videos, generatedAt) {
  const contents = `import type { YoutubeVideo } from './youtube-videos.types'

/**
 * Сгенерировано через \`pnpm sync:youtube\`.
 * Не редактировать вручную — обновить скриптом.
 */
export const YOUTUBE_VIDEOS_GENERATED_AT = ${JSON.stringify(generatedAt)} as const

export const GENERATED_YOUTUBE_VIDEOS: readonly YoutubeVideo[] = ${JSON.stringify(videos, null, 2)}
`

  writeFileSync(generatedPath, contents, 'utf8')
  console.log(`[sync:youtube] Записано ${videos.length} видео → ${generatedPath}`)
}

function normalizeEntry(entry) {
  const id = entry.videoId || String(entry.id || '').replace(/^yt:video:/, '')
  const title = String(entry.title || '').trim()
  const publishedAt = String(entry.published || '').trim()
  const links = asArray(entry.link)
  const href =
    links.find((link) => link?.['@_rel'] === 'alternate')?.['@_href'] ||
    links.find((link) => typeof link?.['@_href'] === 'string')?.['@_href'] ||
    ''

  if (!id || !title) return null

  const isShort = href.includes('/shorts/')
  if (isShort) return null

  const mediaGroup = entry.group || entry['media:group']
  const thumbnail =
    mediaGroup?.thumbnail?.['@_url'] ||
    mediaGroup?.['media:thumbnail']?.['@_url'] ||
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

  /** @type {{ id: string, title: string, thumbnailUrl: string, url: string, publishedAt?: string }} */
  const video = {
    id,
    title,
    thumbnailUrl: thumbnail,
    url: href.includes('/watch') ? href : `https://www.youtube.com/watch?v=${id}`,
  }

  if (publishedAt) {
    video.publishedAt = publishedAt
  }

  return video
}

async function main() {
  const fallback = loadFallbackVideos()

  try {
    const response = await fetch(FEED_URL, {
      headers: { Accept: 'application/atom+xml, application/xml, text/xml' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const xml = await response.text()
    const parsed = parser.parse(xml)
    const entries = asArray(parsed?.feed?.entry)
    const fromFeed = entries.map(normalizeEntry).filter(Boolean)

    let videos = fromFeed.slice(0, LIMIT)

    if (videos.length < LIMIT) {
      const seen = new Set(videos.map((video) => video.id))
      for (const item of fallback) {
        if (videos.length >= LIMIT) break
        if (seen.has(item.id)) continue
        videos.push(item)
        seen.add(item.id)
      }
    }

    if (videos.length === 0) {
      console.warn('[sync:youtube] В feed нет обычных видео, оставляем текущие данные.')
      keepExistingGenerated()
      process.exit(0)
    }

    writeGenerated(videos, new Date().toISOString())
  } catch (error) {
    console.warn('[sync:youtube] Не удалось обновить feed:', error instanceof Error ? error.message : error)
    keepExistingGenerated()
    process.exit(0)
  }
}

main()
