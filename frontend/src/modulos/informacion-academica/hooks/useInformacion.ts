import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarInformacion, getInformacion, getPlanEstudios } from '../api/informacion'
import type { DatosInformacion } from '../tipos'

export function useInformacion() {
  return useQuery({
    queryKey: ['informacion-academica'],
    queryFn: getInformacion,
  })
}

export function useActualizarInformacion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: DatosInformacion) => actualizarInformacion(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['informacion-academica'] })
    },
  })
}

/** Plan de estudios vigente, para la banda de cifras de la página pública. */
export function usePlanEstudios() {
  return useQuery({
    queryKey: ['plan-estudios'],
    queryFn: getPlanEstudios,
    staleTime: 5 * 60 * 1000,
  })
}
