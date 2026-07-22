import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const root = path.dirname(fileURLToPath(import.meta.url))
const sharedStyles = path.resolve(root, 'src/shared/styles')
const homeWidgets = path.resolve(root, 'src/widgets/home')
const themeDefault = path.resolve(sharedStyles, 'themes/default')

const publicPath = process.env.PUBLIC_PATH || '/'
const base = publicPath.endsWith('/') ? publicPath : `${publicPath}/`

export default defineConfig({
  base,
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    host: true,
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [sharedStyles, homeWidgets, themeDefault],
      },
    },
  },
})
