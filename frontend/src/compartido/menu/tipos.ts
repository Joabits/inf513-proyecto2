/** Igual a lo que devuelve app/Modulos/Menu/MenuResource.php */
export interface OpcionMenu {
  id: number
  titulo: string
  ruta: string | null
  hijos: OpcionMenu[]
}

export interface MenuRespuesta {
  publico: OpcionMenu[]
  gestion: OpcionMenu[]
}
