import { strapiMediaUrl } from '@/shared/content/strapi/media-url'
import type { Project, ProjectReviewData } from '@/entities/project/model/project.types'
import type { StrapiProjectDto } from '@/shared/content/strapi/project.dto'

/** Frontend Project.image / gallery use public paths without a leading slash. */
export function toFrontendImagePath(path: string): string {
  return path.replace(/^\/+/, '')
}

function adaptReview(review: NonNullable<StrapiProjectDto['review']>): ProjectReviewData {
  const data: ProjectReviewData = {
    quote: review.quote,
    author: review.author,
    rating: review.rating,
  }
  if (typeof review.details === 'string' && review.details.length > 0) {
    data.details = review.details
  }
  if (typeof review.projectInfo === 'string' && review.projectInfo.length > 0) {
    data.projectInfo = review.projectInfo
  }
  if (typeof review.location === 'string' && review.location.length > 0) {
    data.location = review.location
  }
  if (typeof review.service === 'string' && review.service.length > 0) {
    data.service = review.service
  }
  return data
}

export function adaptStrapiProject(dto: StrapiProjectDto): Project {
  const gallery = [...dto.gallery]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => strapiMediaUrl(item.image?.url, toFrontendImagePath(item.imagePath)))

  const project: Project = {
    slug: dto.slug,
    title: dto.title,
    type: dto.type,
    typeAccent: dto.typeAccent,
    location: dto.location,
    description: dto.description,
    image: strapiMediaUrl(dto.image?.url, toFrontendImagePath(dto.imagePath)),
    area: dto.area,
    term: dto.term,
    price: dto.price,
    size: dto.size,
    gallery,
    details: [...dto.details],
  }

  if (dto.review) {
    project.review = adaptReview(dto.review)
  }

  return project
}
