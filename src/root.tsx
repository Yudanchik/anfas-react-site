import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from 'react-router'
import type { ReactNode } from 'react'

import { AppProviders } from '@/app/providers/AppProviders'
import { LeadModalProvider } from '@/features/brief/model/LeadModalContext'
import { BriefModal } from '@/features/brief/ui/BriefModal'
import { company } from '@/shared/config/company'
import { HERO_LCP_IMAGE } from '@/shared/config/hero-media'
import { absoluteUrl } from '@/shared/config/seo'
import { useScrollEffects } from '@/shared/hooks/useScrollEffects'
import { ScrollToTop } from '@/shared/ui/scroll-to-top/ScrollToTop'
import { CookieBanner } from '@/widgets/cookie-banner'
import { SiteFooter } from '@/widgets/site-footer/SiteFooter'
import { SiteHeader } from '@/widgets/site-header/SiteHeader'

import '@/shared/styles/globals.scss'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: company.legalOwner,
  alternateName: company.name,
  url: absoluteUrl('/'),
  logo: absoluteUrl('/images/anfas-logo-official.svg'),
  email: company.email,
  telephone: company.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: company.address,
    addressLocality: 'Санкт-Петербург',
    addressCountry: 'RU',
  },
  sameAs: [company.vkHref, company.telegramHref, company.youtubeHref, company.instagramHref],
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#161713" />
        <link rel="icon" href="/images/anfas-logo-official.svg" type="image/svg+xml" />
        <link rel="preload" href={HERO_LCP_IMAGE} as="image" fetchPriority="high" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  const { pathname } = useLocation()

  useScrollEffects(pathname)

  return (
    <AppProviders>
      <LeadModalProvider>
        <div className="site-shell">
          <div className="scroll-progress" aria-hidden="true" />
          <SiteHeader />
          <Outlet />
          <SiteFooter />
          <BriefModal />
          <ScrollToTop />
          <CookieBanner />
        </div>
      </LeadModalProvider>
    </AppProviders>
  )
}
