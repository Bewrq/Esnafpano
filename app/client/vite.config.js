import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
const envDir = fileURLToPath(new URL('../../global/config', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '')
  return {
    plugins: [react()],
    envDir,
    server: {
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${process.env.PORT || env.PORT || 5000}`,
          changeOrigin: true,
        },
      },
    },
  }
})
