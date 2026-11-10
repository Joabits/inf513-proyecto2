import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // VITE_RUTA_BASE: '' en desarrollo, '/inf513/grupo17sa/proyecto2' en producción (.env.production)
  const rutaBase = loadEnv(mode, process.cwd()).VITE_RUTA_BASE ?? ''

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(import.meta.dirname, 'src') },
    },
    // Los archivos compilados se sirven desde <rutaBase>/spa/
    base: mode === 'production' ? `${rutaBase}/spa/` : '/',
    build: {
      outDir: '../backend/public/spa',
      emptyOutDir: true,
    },
    server: {
      // En desarrollo React (5173) reenvía la API a Laravel (8000): mismo origen, sin CORS
      proxy: {
        '/api': 'http://127.0.0.1:8000',
        '/sanctum': 'http://127.0.0.1:8000',
      },
    },
  }
})
