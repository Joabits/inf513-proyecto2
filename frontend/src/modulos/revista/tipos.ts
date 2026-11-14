/** PDF guardado: el archivo no se expone por su ruta, se descarga por la API */
export interface ArchivoPdf {
  nombre: string
  tamano: number
}

/** Igual que ArticuloResource.php */
export interface Articulo {
  id: number
  titulo: string
  autores: string
  resumen: string | null
  archivo: ArchivoPdf | null
}

/** Igual que EdicionResource.php */
export interface Edicion {
  id: number
  volumen: number | null
  numero: number
  anio: number
  titulo: string | null
  descripcion: string | null
  /** «Volumen 1 · Número 2 · 2026» */
  nombre: string
  portada: string | null
  archivo: ArchivoPdf | null
  publicada: boolean
  articulos: Articulo[]
}

export interface ContenidoRevista {
  presentacion: string
  colaboradores: string | null
}

/** Igual que RevistaController::respuesta(): lo mismo para el visitante (solo publicadas) y para el panel (todas) */
export interface ContenidoCompleto {
  revista: ContenidoRevista | null
  ediciones: Edicion[]
}
