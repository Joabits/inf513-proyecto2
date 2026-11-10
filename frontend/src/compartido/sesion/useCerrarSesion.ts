import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { cliente } from '@/compartido/api/cliente'

/** Vive en compartido porque lo usan los menús de la cabecera. */
export function useCerrarSesion() {
  const consultas = useQueryClient()
  const navegar = useNavigate()

  return useMutation({
    mutationFn: () => cliente.post('/logout'),
    onSuccess: () => {
      // Primero se sale de la página, para que RutaProtegida no mande al formulario de ingreso
      navegar('/')

      return Promise.all([
        consultas.invalidateQueries({ queryKey: ['sesion'] }),
        consultas.invalidateQueries({ queryKey: ['menu'] }),
      ])
    },
  })
}
