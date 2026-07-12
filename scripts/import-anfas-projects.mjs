import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const SOURCE_API =
  'https://anfas-art.ru/wp-json/wp/v2/posts?categories=49&per_page=100&_embed=1'
const MEDIA_API = 'https://anfas-art.ru/wp-json/wp/v2/media?per_page=100&parent='
const OUT_DIR = path.resolve('public/images/projects')
const DATA_FILE = path.resolve('src/entities/project/model/projects.data.ts')

const slugMap = {
  '2murinskiy': '2-murinskiy-37',
  '%d0%b6%d0%ba-%d0%b3%d1%80%d0%b0%d1%84%d0%b8%d0%ba%d0%b0': 'zhk-grafika',
  'verkhnekamenskaya': 'verkhnekamenskaya',
  'slavy4': 'prospekt-slavy-4',
  'forestakvilon': 'forest-akvilon',
  'idkudrovo': 'id-kudrovo',
  'grandhouse': 'grand-house',
}

const sizePattern = ['tall', 'wide', 'standard', 'standard', 'wide', 'standard', 'tall']

function decodeHtml(value = '') {
  const named = {
    amp: '&',
    nbsp: ' ',
    quot: '"',
    apos: "'",
    laquo: '«',
    raquo: '»',
    mdash: '—',
    ndash: '–',
  }

  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (_, code) => named[code.toLowerCase()] ?? `&${code};`)
}

function stripHtml(value = '') {
  return decodeHtml(value)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTags(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean)
}

function cleanParagraphs(html) {
  return extractTags(html, 'p')
    .map((text) => text.replace(/^[-–—]\s*/, '').trim())
    .filter((text) => {
      if (!text) return false
      if (text.includes('.fusion-body')) return false
      if (/^(м\s*2|месяц|месяца|месяцев|стоимость)$/i.test(text)) return false
      return true
    })
}

function extractHeroImage(html) {
  return decodeHtml(html.match(/id="project-hero"[\s\S]*?data-bg="([^"]+)"/i)?.[1] ?? '')
}

function extractMetric(text, label) {
  const match = text.match(new RegExp(`${label}\\s+([^\\s]+(?:\\s*₽)?)`, 'iu'))
  return match?.[1]?.trim() ?? ''
}

function formatArea(value) {
  return value ? `${value.replace('.', ',')} м²` : '—'
}

function formatTerm(value) {
  if (!value) return '—'
  const number = Number(value.replace(',', '.'))
  const ending = number === 1 ? 'месяц' : number >= 2 && number <= 4 ? 'месяца' : 'месяцев'
  return `${value} ${ending}`
}

function formatPrice(value) {
  if (!value) return 'По запросу'
  const normalized = value.replace(/[^\d]/g, '')
  if (!normalized) return value

  return `${Number(normalized).toLocaleString('ru-RU')} ₽`
}

function slugFromTitle(value) {
  return decodeURIComponent(value)
    .toLowerCase()
    .replace(/жк/g, 'zhk')
    .replace(/[^a-zа-я0-9]+/giu, '-')
    .replace(/^-+|-+$/g, '')
}

function imageExtension(url) {
  const clean = new URL(url).pathname
  const ext = path.extname(clean).toLowerCase()
  if (ext === '.jpeg') return '.jpg'
  if (['.jpg', '.png', '.webp'].includes(ext)) return ext
  return '.jpg'
}

function pickMediaUrl(media) {
  const sizes = media.media_details?.sizes ?? {}
  return (
    sizes['1536x1536']?.source_url ??
    sizes['large']?.source_url ??
    sizes['fusion-1200']?.source_url ??
    sizes['portfolio-full']?.source_url ??
    media.source_url
  )
}

function escapeTs(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function arrayTs(values, indent = '    ') {
  if (!values.length) return '[]'

  return `[\n${values.map((value) => `${indent}'${escapeTs(value)}'`).join(',\n')},\n  ]`
}

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Fetch failed ${response.status}: ${url}`)
  return response.json()
}

async function downloadImage(url, filePath) {
  if (existsSync(filePath)) return

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Image failed ${response.status}: ${url}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  await writeFile(filePath, buffer)
}

async function main() {
  const posts = await fetchJson(SOURCE_API)
  const projects = []

  await mkdir(OUT_DIR, { recursive: true })

  for (const [index, post] of posts.entries()) {
    const sourceSlug = post.slug
    const localSlug = slugMap[sourceSlug] ?? slugFromTitle(sourceSlug)
    const html = post.content.rendered
    const pageText = stripHtml(html)
    const paragraphs = cleanParagraphs(html)
    const headings = extractTags(html, 'h1')
    const title = stripHtml(post.title.rendered)
    const type = headings.find((heading) => heading !== title) ?? headings[0] ?? title
    const location = paragraphs[0] && paragraphs[0].length <= 60 ? paragraphs[0] : title

    const areaRaw = extractMetric(pageText, 'м\\s*2')
    const termRaw = extractMetric(pageText, 'месяц(?:ев|а)?')
    const priceRaw = pageText.match(/стоимость\s+([\d\s,.]+₽)/iu)?.[1] ?? ''
    const contentParagraphs = paragraphs.filter((paragraph) => paragraph !== location)
    const description = contentParagraphs.find((paragraph) => paragraph.length > 45) ?? type
    const details = contentParagraphs.filter((paragraph) => paragraph !== description).slice(0, 8)

    const media = await fetchJson(`${MEDIA_API}${post.id}`)
    const heroImage = extractHeroImage(html)
    const projectDir = path.join(OUT_DIR, localSlug)
    const urlToLocalPath = new Map()
    const gallery = []

    await mkdir(projectDir, { recursive: true })

    const sortedMedia = [...media]
    const heroMediaIndex = heroImage
      ? sortedMedia.findIndex((item) => item.source_url === heroImage || pickMediaUrl(item) === heroImage)
      : -1

    if (heroMediaIndex > 0) {
      const [heroMedia] = sortedMedia.splice(heroMediaIndex, 1)
      sortedMedia.unshift(heroMedia)
    }

    for (const [imageIndex, item] of sortedMedia.entries()) {
      const imageUrl = pickMediaUrl(item)
      const ext = imageExtension(imageUrl)
      const localFile = `${String(imageIndex + 1).padStart(2, '0')}${ext}`
      const localPath = `images/projects/${localSlug}/${localFile}`
      const absolutePath = path.join(projectDir, localFile)

      await downloadImage(imageUrl, absolutePath)
      urlToLocalPath.set(imageUrl, localPath)
      urlToLocalPath.set(item.source_url, localPath)
      gallery.push(localPath)
    }

    projects.push({
      slug: localSlug,
      title,
      type,
      location,
      description,
      image: (heroImage && urlToLocalPath.get(heroImage)) || gallery[0] || '',
      area: formatArea(areaRaw),
      term: formatTerm(termRaw),
      price: formatPrice(priceRaw),
      size: sizePattern[index % sizePattern.length],
      sourceUrl: post.link,
      gallery,
      details,
    })
  }

  const content = `import type { Project } from './project.types'\n\nexport const projects: readonly Project[] = [\n${projects
    .map(
      (project) => `  {
    slug: '${escapeTs(project.slug)}',
    title: '${escapeTs(project.title)}',
    type: '${escapeTs(project.type)}',
    location: '${escapeTs(project.location)}',
    description: '${escapeTs(project.description)}',
    image: '${escapeTs(project.image)}',
    area: '${escapeTs(project.area)}',
    term: '${escapeTs(project.term)}',
    price: '${escapeTs(project.price)}',
    size: '${project.size}',
    sourceUrl: '${escapeTs(project.sourceUrl)}',
    gallery: ${arrayTs(project.gallery)},
    details: ${arrayTs(project.details)},
  }`,
    )
    .join(',\n')},\n] as const\n`

  await writeFile(DATA_FILE, content, 'utf8')
  console.log(`Imported ${projects.length} projects`)
  console.log(`Downloaded images to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
