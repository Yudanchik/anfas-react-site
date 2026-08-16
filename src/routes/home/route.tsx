import { useState } from 'react'
import { useLoaderData } from 'react-router'

import { faqRepository } from '@/entities/faq/api'
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
import { HomeProjectControl } from '@/widgets/home/project-control'
import { createSeoMeta } from '@/shared/config/seo'

export async function loader() {
  const group = await faqRepository.getByKey('home')
  return {
    faqItems: group?.items ?? [],
  }
}

export const meta = () =>
  createSeoMeta({
    title: 'Ремонт квартир под ключ в Санкт-Петербурге | Анфас',
    description:
      'Дизайн-проект, пакетный и индивидуальный ремонт квартир в Санкт-Петербурге. Фиксированные сроки, согласованный бюджет и контроль на каждом этапе.',
    keywords:
      'ремонт квартир под ключ, ремонт квартиры спб, дизайн-проект квартиры, пакетный ремонт квартиры, ремонт с фиксированной ценой, индивидуальный ремонт квартиры',
    path: '/',
  })

export default function HomeRoute() {
  const { faqItems } = useLoaderData<typeof loader>()
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <main>
      <HomeHero />
      <HomeTicker />

      {/* Meta stats: быстрое доверие */}
      <HomeManifesto />

      {/* 01: боли → решения */}
      <HomePains />

      {/* 02: контроль ремонта в личном кабинете */}
      <HomeProjectControl />

      {/* 05: выбор тарифов */}
      <HomePaths />

      {/* 06: калькулятор */}
      <HomePackageCalculator />

      {/* 07–09: хвостовые секции */}
      <HomePartners />
      <HomeSocials />
      <HomeProcess />
      <HomeFaq items={faqItems} openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <HomeContact />
    </main>
  )
}
