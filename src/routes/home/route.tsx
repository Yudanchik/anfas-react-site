import { useState } from 'react'
import { useLoaderData } from 'react-router'

import { projectRepository } from '@/entities/project/api'
import { useBrief } from '@/features/brief/model/BriefContext'
import {
  HomeContact,
  HomeFaq,
  HomeHero,
  HomeManifesto,
  HomeProcess,
  HomeProjects,
  HomeQuote,
  HomeServices,
  HomeTicker,
} from './home.blocks'

export async function loader() {
  return {
    projects: await projectRepository.getAll(),
  }
}

export const meta = () => [
  { title: 'Анфас — дизайн интерьера и ремонт под ключ' },
  {
    name: 'description',
    content: 'Дизайн интерьеров и ремонт под ключ в Санкт-Петербурге.',
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
      <HomeProjects projects={projects} />
      <HomeProcess onOpenBrief={openBrief} />
      <HomeQuote />
      <HomeFaq openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <HomeContact onOpenBrief={openBrief} />
    </main>
  )
}
