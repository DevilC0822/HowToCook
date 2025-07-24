import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      __API_BASE_URL__: JSON.stringify(
        isDev ? 'http://localhost:3000/api' : 'https://cooking.mihouo.com/api'
      )
    }
  }
})
