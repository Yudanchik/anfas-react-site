import type { Service } from '../model/services.data'

export type ServiceRepository = {
  getAll(): Promise<readonly Service[]>
  getBySlug(slug: string): Promise<Service | null>
}
