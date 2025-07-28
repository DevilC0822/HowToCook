import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => {

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 6009,
    },
    preview: {
      port: 6009,
      host: '0.0.0.0',
      allowedHosts: ['cook.mihouo.com'],
    },
    define: {
      __API_BASE_URL__: JSON.stringify('http://localhost:6008/api'),
    }
  }
})
