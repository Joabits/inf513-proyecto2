import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarInformacion, getInformacion } from '../api/informacion'
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
