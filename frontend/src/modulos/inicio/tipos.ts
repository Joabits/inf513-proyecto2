export interface Portada {
  distintivo: string | null
  titulo: string
  presentacion: string
  director_nombre: string
  director_cargo: string
  director_mensaje: string
  director_foto: string | null
}

export interface Banner {
  id: number
  imagen: string
  texto_alternativo: string
  enlace: string | null
}

export interface Cifra {
  valor: string
  etiqueta: string
}

export interface Acceso {
  titulo: string
  descripcion: string
  ruta: string
}

/** Igual que NoticiasPortada.php: lo justo para la tarjeta de la portada */
export interface NoticiaPortada {
  id: number
  titulo: string
  resumen: string
  imagen: string | null
  fecha: string | null
  ruta: string
}

/** Igual que EventosPortada.php */
export interface EventoPortada {
  id: number
  titulo: string
  lugar: string
  inicio: string
  fin: string
  ruta: string
}

/** Lo que aportan otros módulos a la portada (CU-01). Una sección falta si su módulo no está instalado. */
export interface SeccionesInicio {
  noticias?: NoticiaPortada[]
  eventos?: EventoPortada[]
}

export interface ContenidoInicio {
  portada: Portada | null
  banners: Banner[]
  cifras: Cifra[]
  accesos: Acceso[]
  secciones: SeccionesInicio
}
