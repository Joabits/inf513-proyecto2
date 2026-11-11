import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atenderSolicitud, listarSolicitudes, obtenerInnova } from './api'
import type { DatosAtencion } from './innova.esquema'
import type { InformacionInnova, SolicitudInnova } from './tipos'

const CLAVE_INNOVA = ['innova']
const CLAVE_SOLICITUDES = ['innova-solicitudes']

export function useInnova() {
  return useQuery({ queryKey: CLAVE_INNOVA, queryFn: obtenerInnova })
}

/** Cada guardado devuelve la página completa: se deja en caché y la vista pública queda al día. */
export function useGuardarInnova<T>(guardar: (datos: T) => Promise<InformacionInnova>) {
  const consultas = useQueryClient()

  return useMutation({ mutationFn: guardar, onSuccess: (info) => consultas.setQueryData(CLAVE_INNOVA, info) })
}

export function useSolicitudes() {
  return useQuery({ queryKey: CLAVE_SOLICITUDES, queryFn: listarSolicitudes })
}

/** Reemplaza solo esa solicitud en la lista. */
export function useAtenderSolicitud(id: number) {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: (datos: DatosAtencion) => atenderSolicitud(id, datos),
    onSuccess: (cambiada) =>
      consultas.setQueryData<SolicitudInnova[]>(CLAVE_SOLICITUDES, (lista) => lista?.map((s) => (s.id === cambiada.id ? cambiada : s))),
  })
}
