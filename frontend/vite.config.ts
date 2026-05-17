import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const internalApiUrl = env.INTERNAL_API_URL || 'http://127.0.0.1:8000'

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: Number(env.FRONTEND_PORT || env.PORT || 5173),
      proxy: {
        '/api': {
          target: internalApiUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
