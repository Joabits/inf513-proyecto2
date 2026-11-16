import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { consultarBitacora, exportarBitacora, obtenerOpciones } from './api'
import type { FiltrosBitacora } from './tipos'

/** Al cambiar de página o de filtro se sigue mostrando la página anterior hasta que llega la nueva: la lista no salta. */
export function useBitacora(filtros: FiltrosBitacora, pagina: number) {
  return useQuery({
    queryKey: ['bitacora', filtros, pagina],
    queryFn: () => consultarBitacora(filtros, pagina),
    placeholderData: keepPreviousData,
  })
}

export function useOpcionesBitacora() {
  return useQuery({ queryKey: ['bitacora-opciones'], queryFn: obtenerOpciones, staleTime: 5 * 60_000 })
}

export function useExportarBitacora() {
  return useMutation({ mutationFn: exportarBitacora })
}
