import { cliente } from '@/compartido/api/cliente'
import type { Configuracion } from '@/compartido/configuracion/tipos'
import { soloNumeros, type DatosContactoForm, type DatosEnlaces, type DatosRedes } from './configuracion.esquema'

/** Cada guardado devuelve la configuración completa: el pie de página se actualiza sin otra petición. */
export const actualizarContacto = (datos: DatosContactoForm) =>
  cliente.put<Configuracion>('/configuracion/contacto', { ...datos, whatsapp: soloNumeros(datos.whatsapp) }).then((r) => r.data)

export const guardarRedes = (datos: DatosRedes) => cliente.put<Configuracion>('/configuracion/redes', datos).then((r) => r.data)

export const guardarEnlaces = (datos: DatosEnlaces) => cliente.put<Configuracion>('/configuracion/enlaces', datos).then((r) => r.data)
