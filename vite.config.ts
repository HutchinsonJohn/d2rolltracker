import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig, loadEnv } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'SENTRY_')

  // Add your configuration options here
  return {
    plugins: [
      basicSsl(),
      sentryVitePlugin({
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
    ],

    envPrefix: ['VITE_', 'SENTRY_'],

    server: {
      port: 3000,
    },

    build: {
      sourcemap: env.SENTRY_ENABLE === 'true',
    },
  }
})
