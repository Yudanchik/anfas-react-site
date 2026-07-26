import { useEffect } from 'react'
import { useLocation } from 'react-router'

import { YANDEX_METRIKA_ID } from '@/shared/config/analytics'

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void
  }
}

export function YandexMetrikaHit() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    window.ym?.(YANDEX_METRIKA_ID, 'hit', window.location.href)
  }, [pathname, search, hash])

  return null
}

export const yandexMetrikaInlineScript = `
(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}', 'ym');

ym(${YANDEX_METRIKA_ID}, 'init', {
  ssr:true,
  webvisor:true,
  clickmap:true,
  ecommerce:"dataLayer",
  accurateTrackBounce:true,
  trackLinks:true
});
`.trim()
