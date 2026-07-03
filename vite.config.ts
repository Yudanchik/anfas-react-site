import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const publicPath = process.env.PUBLIC_PATH || '/'
const base = publicPath.endsWith('/') ? publicPath : `${publicPath}/`

export default defineConfig({
  base,
  plugins: [reactRouter(), tsconfigPaths()],
})
