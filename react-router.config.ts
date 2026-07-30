import type { Config } from '@react-router/dev/config'

const publicPath = process.env.PUBLIC_PATH || '/'
const basename = publicPath === '/' ? '/' : publicPath.replace(/\/$/, '')

export default {
  appDirectory: 'src',
  basename,
  buildDirectory: 'build',
  routeDiscovery: {
    mode: 'initial',
  },
  ssr: false,
  prerender: [
    '/',
    '/about',
    '/blog',
    '/blog/elektrika-v-kvartire-pri-remonte',
    '/blog/zachem-zalivat-poly-rovnitelem',
    '/blog/kak-vybrat-santehniku-dlya-remonta',
    '/blog/ventilyaciya-i-vytyazhka-v-kvartire-pri-remonte',
    '/blog/shtukaturka-sten-pri-remonte',
    '/blog/laminat-kvartsvinil-ili-parket',
    '/contacts',
    '/cookies',
    '/prices',
    '/privacy',
    '/projects',
    '/projects/2-murinskiy-37',
    '/projects/zhk-grafika',
    '/projects/verkhnekamenskaya',
    '/projects/prospekt-slavy-4',
    '/projects/forest-akvilon',
    '/projects/id-kudrovo',
    '/projects/grand-house',
    '/services',
    '/services/individual',
    '/services/package',
  ],
} satisfies Config
