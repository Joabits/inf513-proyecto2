/** Igual que EstadisticasService.php */
export interface Estadisticas {
  periodo: { dias: number; desde: string; hasta: string }
  visitas: {
    total_periodo: number
    total_historico: number
    por_dia: { fecha: string; total: number }[]
    paginas: { pagina: string; total: number }[]
  }
  ingresos: { correctos: number; fallidos: number }
  acciones: { accion: string; total: number }[]
  secciones: { seccion: string; total: number }[]
  contenido: {
    noticias_publicadas: number
    eventos_proximos: number
    documentos_publicados: number
    graduados: number
    mensajes_pendientes: number
    solicitudes_innova_pendientes: number
    usuarios_activos: number
  }
}

export type Periodo = 7 | 30 | 90
