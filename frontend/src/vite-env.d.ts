// Variables de entorno propias (.env.development / .env.production)
interface ImportMetaEnv {
  readonly VITE_RUTA_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
