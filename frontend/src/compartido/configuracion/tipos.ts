/** Igual que ConfiguracionController::mostrar() (CU-28). */
export type RedSocial = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'x'

export const NOMBRE_RED: Record<RedSocial, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
}

export interface DatosContacto {
  direccion: string
  referencia: string | null
  ciudad: string
  telefono: string | null
  /** Solo números, con el código de país: 59170000000 */
  whatsapp: string | null
  correo: string | null
  horario: string | null
  mapa_url: string | null
}

export interface Enlace {
  titulo: string
  /** Página del portal (/documentos) o sitio externo (https://...) */
  url: string
}

export interface Configuracion {
  contacto: DatosContacto | null
  redes: { red: RedSocial; url: string }[]
  enlaces: Enlace[]
}
