
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const appMode =
    mode === 'public' || mode === 'admin'
      ? mode
      : env.VITE_APP_MODE || 'combined'

  return {
    plugins: [react()],

    define: {
      'import.meta.env.VITE_APP_MODE': JSON.stringify(appMode),
    },

    build: {
      outDir: `dist/${appMode}`,
      emptyOutDir: true,
    },

    server: {
      host: '127.0.0.1',
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3333',
          changeOrigin: true,
        },
      },
    },
  }
})
