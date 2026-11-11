import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cambiarPublicacion, eliminarProyecto, guardarComplementos, guardarLineas, obtenerGestion } from './api'
import type { DatosProyecto } from './investigacion.esquema'
import type { GestionInvestigacion, Proyecto } from './tipos'

const CLAVE = ['investigacion-gestion']

export function useGestionInvestigacion() {
  return useQuery({ queryKey: CLAVE, queryFn: obtenerGestion })
}

/** Cambia una parte de la caché del panel sin volver a pedir todo. */
function useActualizarCache() {
  const consultas = useQueryClient()
  return (cambio: (actual: GestionInvestigacion) => Partial<GestionInvestigacion>) =>
    consultas.setQueryData<GestionInvestigacion>(CLAVE, (actual) => (actual ? { ...actual, ...cambio(actual) } : actual))
}

/**
 * Crear o editar un proyecto. Además se vuelven a pedir las líneas en segundo plano,
 * porque cambia cuántos proyectos tiene cada una.
 */
export function useGuardarProyecto(guardar: (datos: DatosProyecto) => Promise<Proyecto>) {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: guardar,
    onSuccess: () => consultas.invalidateQueries({ queryKey: CLAVE }),
  })
}

export function useCambiarPublicacion() {
  const actualizar = useActualizarCache()

  return useMutation({
    mutationFn: ({ id, publicado }: { id: number; publicado: boolean }) => cambiarPublicacion(id, publicado),
    onSuccess: (cambiado) => actualizar(({ proyectos }) => ({ proyectos: proyectos.map((p) => (p.id === cambiado.id ? cambiado : p)) })),
  })
}

export function useEliminarProyecto() {
  const consultas = useQueryClient()

  return useMutation({ mutationFn: eliminarProyecto, onSuccess: () => consultas.invalidateQueries({ queryKey: CLAVE }) })
}

export function useGuardarLineas() {
  const actualizar = useActualizarCache()

  return useMutation({ mutationFn: guardarLineas, onSuccess: (lineas) => actualizar(() => ({ lineas })) })
}

export function useGuardarComplementos() {
  const actualizar = useActualizarCache()

  return useMutation({ mutationFn: guardarComplementos, onSuccess: (complementos) => actualizar(() => complementos) })
}
