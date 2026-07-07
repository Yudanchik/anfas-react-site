import { useState } from 'react'

import { useBrief } from '@/features/brief/model/BriefContext'
import { HomeContact } from '@/widgets/home/contact'
import { HomeFaq } from '@/widgets/home/faq'
import { HomeHero } from '@/widgets/home/hero'
import { HomeManifesto } from '@/widgets/home/manifesto'
import { HomePackageCalculator } from '@/widgets/home/package-calculator'
import { HomePartners } from '@/widgets/home/partners'
import { HomeProcess } from '@/widgets/home/process'
import { HomePaths } from '@/widgets/home/paths'
import { HomeSocials } from '@/widgets/home/socials'
import { HomeTicker } from '@/widgets/home/ticker'
import { HomePains } from '@/widgets/home/pains'
import { HomeStoryIndividual } from '@/widgets/home/story-individual'
import { HomeStoryCapsule } from '@/widgets/home/story-capsule'

export const meta = () => [
  { title: 'Ремонт квартир под ключ в Санкт-Петербурге | Анфас' },
  {
    name: 'description',
    content:
      'Ремонт квартир под ключ, дизайн-проект и пакетные решения в Санкт-Петербурге. Прозрачные сроки, понятный бюджет и контроль на каждом этапе.',
  },
  {
    name: 'keywords',
    content:
      'ремонт квартир под ключ, ремонт квартиры спб, дизайн-проект квартиры, пакетный ремонт квартиры, ремонт с фиксированной ценой, ремонт с понятными сроками',
  },
  { property: 'og:title', content: 'Ремонт квартир под ключ в Санкт-Петербурге | Анфас' },
  {
    property: 'og:description',
    content:
      'Ремонт квартир под ключ, дизайн-проект и пакетные решения в Санкт-Петербурге. Прозрачные сроки, понятный бюджет и контроль на каждом этапе.',
  },
]

export default function HomeRoute() {
  const { openBrief } = useBrief()
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <main>
      <HomeHero onOpenBrief={openBrief} />
      <HomeTicker />

      {/* 03: meta stats (быстрое доверие) */}
      <HomeManifesto />

      {/* 01: боли → решения */}
      <HomePains onOpenBrief={openBrief} />

      {/* 02: индивидуальный путь */}
      <HomeStoryIndividual onOpenBrief={openBrief} />

      {/* 03: капсула */}
      <HomeStoryCapsule onOpenBrief={openBrief} />

      {/* 04: выбор тарифов */}
      <HomePaths onOpenBrief={openBrief} />

      {/* 05: калькулятор */}
      <HomePackageCalculator onOpenBrief={openBrief} />

      {/* 06–09: хвостовые секции */}
      <HomePartners />
      <HomeSocials />
      <HomeProcess onOpenBrief={openBrief} />
      <HomeFaq openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <HomeContact onOpenBrief={openBrief} />
    </main>
  )
}
