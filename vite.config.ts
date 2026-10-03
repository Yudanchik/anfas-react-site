import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { reactRouter } from '@react-router/dev/vite'
import { defineConfig, loadEnv, type UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const root = path.dirname(fileURLToPath(import.meta.url))
const sharedStyles = path.resolve(root, 'src/shared/styles')
const homeWidgets = path.resolve(root, 'src/widgets/home')
const themeDefault = path.resolve(sharedStyles, 'themes/default')

const publicPath = process.env.PUBLIC_PATH || '/'
const base = publicPath.endsWith('/') ? publicPath : `${publicPath}/`

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, root, '')
  return {
    base,
    plugins: [reactRouter(), tsconfigPaths()],
    resolve: { dedupe: ['react', 'react-dom'] },
    optimizeDeps: {
      include: [
        '@tanstack/react-query',
        'framer-motion',
        'react-hook-form',
        '@hookform/resolvers/zod',
        'zod',
        'swiper/react',
        'swiper/modules',
        'jspdf',
        'jspdf-autotable',
        'xlsx',
      ],
    },
    build: {
      rollupOptions: {
        output: {
          onlyExplicitManualChunks: true,
          manualChunks(id) {
            const normalized = id.replaceAll('\\', '/')
            if (
              /\/src\/(entities\/estimate|features\/(estimate-calculator|floor-estimate))\//.test(
                normalized,
              )
            ) {
              return 'estimate-private/calculator'
            }
          },
        },
      },
    },
    server: {
      host: true,
      allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io'],
      proxy:
        env.VITE_AUTH_MODE === 'nest'
          ? {
              '/api': {
                target: env.AUTH_BACKEND_ORIGIN || 'http://127.0.0.1:3000',
                changeOrigin: true,
              },
            }
          : process.env.ESTIMATE_PHP_ORIGIN
            ? {
                '/api/estimate-': { target: process.env.ESTIMATE_PHP_ORIGIN, changeOrigin: true },
              }
            : undefined,
    },
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [sharedStyles, homeWidgets, themeDefault],
        },
      },
    },
  }
})
