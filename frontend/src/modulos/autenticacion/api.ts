import { cliente, RUTA_BASE } from '@/compartido/api/cliente'
import type { Credenciales } from './autenticacion.esquema'

export async function iniciarSesion(credenciales: Credenciales) {
  await cliente.get('/sanctum/csrf-cookie', { baseURL: RUTA_BASE })
  await cliente.post('/login', credenciales)
}
