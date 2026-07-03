export type ProjectSize = 'wide' | 'tall' | 'standard'

export type Project = {
  slug: string
  title: string
  type: string
  description: string
  image: string
  area: string
  term: string
  price: string
  size: ProjectSize
}
