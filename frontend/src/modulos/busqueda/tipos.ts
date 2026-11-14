/** Igual que FuenteBusqueda::resultado() */
export interface ResultadoBusqueda {
  titulo: string
  resumen: string | null
  meta: string | null
  /** Ruta del portal o, si «externo», un archivo de la API que se abre en otra pestaña */
  ruta: string
  externo: boolean
}

export interface GrupoBusqueda {
  tipo: string
  etiqueta: string
  total: number
  resultados: ResultadoBusqueda[]
}

/** Igual que BusquedaService::buscar() */
export interface RespuestaBusqueda {
  consulta: string
  total: number
  grupos: GrupoBusqueda[]
}
