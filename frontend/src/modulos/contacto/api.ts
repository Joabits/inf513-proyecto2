import { cliente } from '@/compartido/api/cliente'
import type { DatosMensaje } from './contacto.esquema'

export const enviarMensaje = (datos: DatosMensaje) => cliente.post<{ mensaje: string }>('/contacto', datos).then((r) => r.data)
