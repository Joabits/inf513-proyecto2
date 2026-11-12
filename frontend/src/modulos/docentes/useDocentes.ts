import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eliminarPersona, obtenerGestion, obtenerPublico, ordenarPersonas } from './api'
import type { Grupo, Persona } from './tipos'

const CLAVE_GESTION = ['docentes-gestion']

export function useDocentesPublico() {
  return useQuery({ queryKey: ['docentes-publico'], queryFn: obtenerPublico })
}

export function useDocentesGestion() {
  return useQuery({ queryKey: CLAVE_GESTION, queryFn: obtenerGestion })
}

/** Crear o editar: el orden puede cambiar (al cambiar de grupo), así que se vuelve a pedir la lista. */
export function useGuardarPersona(guardar: (datos: FormData) => Promise<Persona>) {
  const consultas = useQueryClient()

  return useMutation({ mutationFn: guardar, onSuccess: () => consultas.invalidateQueries({ queryKey: CLAVE_GESTION }) })
}

export function useEliminarPersona() {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: eliminarPersona,
    onSuccess: (_respuesta, id) => consultas.setQueryData<Persona[]>(CLAVE_GESTION, (lista) => lista?.filter((p) => p.id !== id)),
  })
}

/** El servidor devuelve la lista completa ya ordenada: se guarda tal cual. */
export function useOrdenarPersonas() {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: ({ grupo, ids }: { grupo: Grupo; ids: number[] }) => ordenarPersonas(grupo, ids),
    onSuccess: (lista) => consultas.setQueryData(CLAVE_GESTION, lista),
  })
}
