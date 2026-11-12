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

export interface ContenidoInicio {
  portada: Portada | null
  banners: Banner[]
  cifras: Cifra[]
  accesos: Acceso[]
}
