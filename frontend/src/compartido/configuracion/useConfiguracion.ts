import { useQuery } from '@tanstack/react-query'
import { cliente } from '@/compartido/api/cliente'
import type { Configuracion } from './tipos'

export const CLAVE_CONFIGURACION = ['configuracion']

/**
 * Datos de contacto, redes sociales y enlaces de interés (CU-28).
 * Los usan el pie de todas las páginas, la página de contacto y el panel que los edita.
 */
export function useConfiguracion() {
  return useQuery({
    queryKey: CLAVE_CONFIGURACION,
    queryFn: () => cliente.get<Configuracion>('/configuracion').then((r) => r.data),
    staleTime: 5 * 60_000,
  })
}

/** Enlace para llamar desde el celular: deja solo los números y el signo +. */
export const enlaceTelefono = (telefono: string) => `tel:${telefono.replace(/[^\d+]/g, '')}`

export const enlaceWhatsapp = (numero: string) => `https://wa.me/${numero}`

/** "59170000000" -> "+591 70000000". Con otro código de país se muestra tal cual, con el signo +. */
export const formatoWhatsapp = (numero: string) => (numero.startsWith('591') ? `+591 ${numero.slice(3)}` : `+${numero}`)
