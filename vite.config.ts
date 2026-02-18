/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
// @ts-ignore
import path from 'path'

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [
      react(),
      checker({
        typescript: true,
        eslint:
          mode == 'test'
            ? false // disable eslint in test mode
            : {
                lintCommand: 'eslint ./src/**/*.{ts,tsx}',
                dev: { logLevel: ['error'] }
              }
      })
    ],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_REDMINE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/jira-api': {
          target: env.VITE_JIRA_URL || 'https://devstack.vwgroup.com/jira',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/jira-api/, '')
        }
      }
    },
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, 'src')
      }
    }
  })
}
