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
    '/contacts',
    '/privacy',
    '/projects',
    '/projects/2-murinskiy-37',
    '/projects/zhk-grafika',
    '/projects/verkhnekamenskaya',
    '/projects/prospekt-slavy-4',
    '/services',
  ],
} satisfies Config
