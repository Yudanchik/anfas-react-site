import type {
  Service,
  ServiceIndividual,
  ServicePackage,
} from '@/entities/service/model/services.data'
import type { StrapiServiceDto } from '@/shared/content/strapi/service.dto'

/** Frontend Service.image uses public paths without a leading slash. */
export function toFrontendImagePath(path: string): string {
  return path.replace(/^\/+/, '')
}

function toFrontendMetric(stat: { label: string; value: string }) {
  // Local Service metrics use { value, label } order for UI.
  return { value: stat.value, label: stat.label }
}

function adaptBase(dto: StrapiServiceDto) {
  return {
    slug: dto.slug,
    number: dto.number,
    title: dto.title,
    shortText: dto.shortText,
    text: dto.text,
    tags: [...dto.tags],
    image: toFrontendImagePath(dto.imagePath),
    imageWidth: dto.imageWidth ?? 0,
    imageHeight: dto.imageHeight ?? 0,
    lead: dto.lead,
    hero: {
      eyebrow: dto.hero.eyebrow,
      titleLine: dto.hero.titleLine,
      titleAccent: dto.hero.titleAccent,
      lead: dto.hero.lead,
      stats: dto.hero.stats.map((stat) => ({ label: stat.label, value: stat.value })),
      aside: {
        eyebrow: dto.hero.aside.eyebrow,
        title: dto.hero.aside.title,
        text: dto.hero.aside.text,
      },
    },
    bullets: [...dto.bullets],
    metrics: dto.metrics.map(toFrontendMetric),
    price: dto.price,
    duration: dto.duration,
    ctaLabel: dto.ctaLabel,
    included: {
      label: dto.included.label,
      titleMain: dto.included.titleMain,
      titleAccent: dto.included.titleAccent,
      lead: dto.included.lead,
      groups: dto.included.groups.map((group) => ({
        number: group.number,
        title: group.title,
        text: group.text,
        items: [...group.items],
      })),
      fit: {
        label: dto.included.fit.label,
        title: dto.included.fit.title,
        text: dto.included.fit.text,
        points: [...dto.included.fit.points],
      },
      note: dto.included.note,
    },
    seo: {
      title: dto.seo.title,
      description: dto.seo.description,
      keywords: dto.seo.keywords,
    },
  }
}

export function adaptStrapiService(dto: StrapiServiceDto): Service {
  if (dto.serviceId === 'individual') {
    if (!dto.storyIndividual) {
      throw new Error(`Service ${dto.slug}: storyIndividual required for individual`)
    }
    const story = dto.storyIndividual
    const service: ServiceIndividual = {
      id: 'individual',
      ...adaptBase(dto),
      story: {
        eyebrow: story.eyebrow,
        title: story.title,
        lead: story.lead,
        hero: {
          overline: story.hero.overline,
          title: story.hero.title,
          text: story.hero.text,
          metrics: story.hero.metrics.map(toFrontendMetric),
        },
        highlights: story.highlights.map((item) => ({
          label: item.label,
          title: item.title,
          text: item.text,
        })),
        steps: story.steps.map((item) => ({
          label: item.label,
          title: item.title,
          text: item.text,
        })),
      },
    }
    return service
  }

  if (!dto.storyPackage) {
    throw new Error(`Service ${dto.slug}: storyPackage required for package`)
  }
  const story = dto.storyPackage
  const service: ServicePackage = {
    id: 'package',
    ...adaptBase(dto),
    story: {
      eyebrow: story.eyebrow,
      title: story.title,
      lead: story.lead,
      summary: {
        overline: story.summary.overline,
        title: story.summary.title,
        text: story.summary.text,
        bullets: [...story.summary.bullets],
      },
      steps: story.steps.map((item) => ({
        number: item.number,
        title: item.title,
        text: item.text,
        meta: item.meta,
      })),
    },
  }
  return service
}
