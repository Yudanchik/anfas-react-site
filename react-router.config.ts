import type { Config } from '@react-router/dev/config'

import { resolvePrerenderPaths } from './src/shared/content/articles/prerender-paths'

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
  async prerender() {
    return resolvePrerenderPaths()
  },
} satisfies Config
