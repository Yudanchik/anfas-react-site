export type ProjectSize = 'wide' | 'tall' | 'standard'

export type ProjectReviewRating = 1 | 2 | 3 | 4 | 5

export type ProjectReviewData = {
  quote: string
  details?: string
  author: string
  projectInfo?: string
  location?: string
  rating: ProjectReviewRating
  service?: string
}

export type Project = {
  slug: string
  title: string
  type: string
  location: string
  description: string
  image: string
  area: string
  term: string
  price: string
  size: ProjectSize
  gallery: readonly string[]
  details: readonly string[]
  review?: ProjectReviewData
}
