import { isAxiosError } from 'axios'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ErroresValidacion } from './cliente'

const MENSAJE_GENERAL = 'No se pudieron guardar los cambios. Intente de nuevo.'

/** Primer mensaje de error que devolvió la API, o uno general. */
export function mensajeDeError(error: unknown) {
  const errores = isAxiosError<ErroresValidacion>(error) ? error.response?.data.errors : undefined

  return (errores && Object.values(errores)[0]?.[0]) ?? MENSAJE_GENERAL
}

/** Muestra cada error 422 de Laravel junto a su campo; cualquier otro fallo va como error general. */
export function aplicarErrores<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  const errores = isAxiosError<ErroresValidacion>(error) ? error.response?.data.errors : undefined

  if (!errores) {
    setError('root', { message: MENSAJE_GENERAL })
    return
  }

  for (const [campo, mensajes] of Object.entries(errores)) {
    setError(campo as Path<T>, { message: mensajes[0] })
  }
}
