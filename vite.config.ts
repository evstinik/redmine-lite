/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
// @ts-ignore
import path from 'path'

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Debug: Log Jira configuration
  console.log('Vite Config - Jira Domain:', env.VITE_JIRA_DOMAIN)
  console.log('Vite Config - Has Access Token:', !!env.VITE_JIRA_ACCESS_TOKEN)

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
          target: env.VITE_JIRA_DOMAIN || 'https://devstack.vwgroup.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/jira-api/, '/jira'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Add authentication header for Jira requests
              // Check if we have an API token (for Basic Auth with email:token)
              const apiToken = env.VITE_JIRA_API_TOKEN
              const username = env.VITE_JIRA_USERNAME
              const accessToken = env.VITE_JIRA_ACCESS_TOKEN

              if (apiToken && username) {
                // Basic Auth: email:api_token (needs to be Base64 encoded)
                const credentials = Buffer.from(`${username}:${apiToken}`).toString('base64')
                proxyReq.setHeader('Authorization', `Basic ${credentials}`)
                console.log('Using Basic Auth with username and API token')
              } else if (accessToken) {
                // If access token is already Base64 encoded, use it directly
                // Otherwise, treat it as a Bearer token
                if (accessToken.includes(':') || accessToken.length > 100) {
                  // Looks like it might need encoding or is already encoded
                  proxyReq.setHeader('Authorization', `Basic ${accessToken}`)
                  console.log('Using pre-encoded Basic Auth token')
                } else {
                  // Treat as Bearer token (PAT)
                  proxyReq.setHeader('Authorization', `Bearer ${accessToken}`)
                  console.log('Using Bearer token authentication')
                }
              } else {
                console.warn('No Jira credentials found!')
              }

              console.log('Proxying Jira request to:', proxyReq.path)
              console.log('Target:', env.VITE_JIRA_DOMAIN)
            })
          }
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
