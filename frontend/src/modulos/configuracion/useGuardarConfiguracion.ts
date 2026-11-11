import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CLAVE_CONFIGURACION } from '@/compartido/configuracion/useConfiguracion'
import type { Configuracion } from '@/compartido/configuracion/tipos'

/** Guarda una sección y deja en caché la configuración que devuelve la API (el pie cambia al instante). */
export function useGuardarConfiguracion<T>(guardar: (datos: T) => Promise<Configuracion>) {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: guardar,
    onSuccess: (configuracion) => consultas.setQueryData(CLAVE_CONFIGURACION, configuracion),
  })
}
