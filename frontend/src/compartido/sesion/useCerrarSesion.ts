import { useMutation } from '@tanstack/react-query'
import { cliente, RUTA_BASE } from '@/compartido/api/cliente'

/**
 * Vive en compartido porque lo usan los menús de la cabecera y del panel.
 * Al salir se carga la portada desde cero: se borra todo lo que el panel guardó en memoria
 * y la plantilla del panel no alcanza a mandar al formulario de ingreso (antes pasaba por una carrera de tiempos).
 */
export function useCerrarSesion() {
  return useMutation({
    mutationFn: () => cliente.post('/logout'),
    onSuccess: () => window.location.assign(`${RUTA_BASE}/`),
  })
}
