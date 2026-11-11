import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo } from '@/compartido/ui/Campo'
import { IconoListo } from '@/compartido/ui/Iconos'
import type { Usuario } from '../tipos'
import { useCambiarClave } from '../useUsuarios'
import { esquemaClave, MINIMO_CLAVE, type DatosClave } from '../usuarios.esquema'
import { EntradaClave } from './EntradaClave'

/** El Director asigna una contraseña nueva. Si es otra persona, sus sesiones abiertas se cierran. */
export function FormClave({ usuario, alTerminar }: { usuario: Usuario; alTerminar: () => void }) {
  const prefijo = `clave-${usuario.id}`
  const cambiar = useCambiarClave(usuario.id)
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<DatosClave>({ resolver: zodResolver(esquemaClave), defaultValues: { password: '', password_confirmation: '' } })

  const enviar = (datos: DatosClave) =>
    cambiar.mutate(datos, { onSuccess: () => reset(), onError: (e) => aplicarErrores(e, setError) })

  if (cambiar.isSuccess) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="inline-flex items-center gap-2 font-semibold text-titulo">
          <IconoListo width={18} height={18} />
          {usuario.es_usted ? 'Su contraseña fue cambiada.' : `La contraseña de ${usuario.nombre} fue cambiada y sus sesiones abiertas se cerraron.`}
        </p>
        <Boton type="button" variante="borde" onClick={alTerminar}>
          Cerrar
        </Boton>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5">
      <p className="text-sm text-texto-suave">
        {usuario.es_usted
          ? 'Escriba su nueva contraseña.'
          : `Asigne una contraseña nueva a ${usuario.nombre} y comuníquesela personalmente. No se envía por correo.`}
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id={`${prefijo}-nueva`} etiqueta="Contraseña nueva" ayuda={`Al menos ${MINIMO_CLAVE} caracteres, con letras y números.`} error={errors.password?.message}>
          <EntradaClave id={`${prefijo}-nueva`} aria-describedby={`${prefijo}-nueva-info`} aria-invalid={!!errors.password} {...register('password')} />
        </Campo>
        <Campo id={`${prefijo}-repetir`} etiqueta="Repita la contraseña" error={errors.password_confirmation?.message}>
          <EntradaClave
            id={`${prefijo}-repetir`}
            aria-describedby={`${prefijo}-repetir-info`}
            aria-invalid={!!errors.password_confirmation}
            {...register('password_confirmation')}
          />
        </Campo>
      </div>

      {errors.root && (
        <p role="alert" className="text-sm font-semibold text-acento">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Boton type="button" variante="borde" onClick={alTerminar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={cambiar.isPending}>
          {cambiar.isPending ? 'Guardando...' : 'Cambiar contraseña'}
        </Boton>
      </div>
    </form>
  )
}
