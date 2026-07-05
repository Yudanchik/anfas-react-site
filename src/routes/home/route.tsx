import { useState } from 'react'
import { useLoaderData } from 'react-router'

import { projectRepository } from '@/entities/project/api'
import { useBrief } from '@/features/brief/model/BriefContext'
import { HomeContact } from '@/widgets/home/contact'
import { HomeFaq } from '@/widgets/home/faq'
import { HomeHero } from '@/widgets/home/hero'
import { HomeManifesto } from '@/widgets/home/manifesto'
import { HomePartners } from '@/widgets/home/partners'
import { HomeProcess } from '@/widgets/home/process'
import { HomeProjects } from '@/widgets/home/projects'
import { HomeQuote } from '@/widgets/home/quote'
import { HomeSocials } from '@/widgets/home/socials'
import { HomeServices } from '@/widgets/home/services'
import { HomeFormatCompare } from '@/widgets/home/format-compare'
import { SeoContentBlock, seoContentPages } from '@/widgets/seo-content'
import { HomeTicker } from '@/widgets/home/ticker'

export async function loader() {
  return {
    projects: await projectRepository.getAll(),
  }
}

export const meta = () => [
  { title: 'Ремонт квартир под ключ в Санкт-Петербурге | Анфас' },
  {
    name: 'description',
    content:
      'Ремонт квартир под ключ, дизайн-проект и пакетные решения в Санкт-Петербурге. Прозрачные сроки, понятный бюджет и контроль на каждом этапе.',
  },
]

export default function HomeRoute() {
  const { projects } = useLoaderData<typeof loader>()
  const { openBrief } = useBrief()
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <main>
      <HomeHero onOpenBrief={openBrief} />
      <HomeTicker />
      <HomeManifesto />
      <HomeServices />
      <HomeFormatCompare />
      <HomeProjects projects={projects} />
      <HomeProcess onOpenBrief={openBrief} />
      <HomeQuote />
      <HomeFaq openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <HomePartners />
      <HomeSocials />
      <SeoContentBlock {...seoContentPages.home} />
      <HomeContact onOpenBrief={openBrief} />
    </main>
  )
}

