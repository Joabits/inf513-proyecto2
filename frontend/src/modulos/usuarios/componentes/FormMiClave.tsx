import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo } from '@/compartido/ui/Campo'
import { IconoListo } from '@/compartido/ui/Iconos'
import { Tarjeta } from '@/compartido/ui/Tarjeta'
import { useCambiarMiClave } from '../useUsuarios'
import { esquemaMiClave, MINIMO_CLAVE, type DatosMiClave } from '../usuarios.esquema'
import { EntradaClave } from './EntradaClave'

/** La persona cambia su propia contraseña. Se cierran sus otras sesiones abiertas; esta sigue. */
export function FormMiClave() {
  const cambiar = useCambiarMiClave()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<DatosMiClave>({
    resolver: zodResolver(esquemaMiClave),
    defaultValues: { clave_actual: '', password: '', password_confirmation: '' },
  })

  const enviar = (datos: DatosMiClave) =>
    cambiar.mutate(datos, { onSuccess: () => reset(), onError: (error) => aplicarErrores(error, setError) })

  return (
    <Tarjeta className="p-6 sm:p-8">
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5">
        <div>
          <h2 className="text-xl text-titulo">Contraseña</h2>
          <p className="mt-1 text-sm text-texto-suave">
            Escriba primero su contraseña actual. Al cambiarla se cierran sus otras sesiones abiertas, por ejemplo en otra computadora.
          </p>
        </div>

        <Campo id="mi-clave-actual" etiqueta="Contraseña actual" error={errors.clave_actual?.message}>
          <EntradaClave
            id="mi-clave-actual"
            autoComplete="current-password"
            aria-describedby="mi-clave-actual-info"
            aria-invalid={!!errors.clave_actual}
            {...register('clave_actual')}
          />
        </Campo>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            id="mi-clave-nueva"
            etiqueta="Contraseña nueva"
            ayuda={`Al menos ${MINIMO_CLAVE} caracteres, con letras y números.`}
            error={errors.password?.message}
          >
            <EntradaClave id="mi-clave-nueva" aria-describedby="mi-clave-nueva-info" aria-invalid={!!errors.password} {...register('password')} />
          </Campo>
          <Campo id="mi-clave-repetir" etiqueta="Repita la contraseña nueva" error={errors.password_confirmation?.message}>
            <EntradaClave
              id="mi-clave-repetir"
              aria-describedby="mi-clave-repetir-info"
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

        <div className="flex flex-wrap items-center justify-end gap-3">
          {cambiar.isSuccess && (
            <p role="status" className="mr-auto inline-flex items-center gap-2 text-sm font-semibold text-titulo">
              <IconoListo width={18} height={18} aria-hidden="true" /> Su contraseña fue cambiada.
            </p>
          )}
          <Boton type="submit" disabled={cambiar.isPending}>
            {cambiar.isPending ? 'Guardando...' : 'Cambiar contraseña'}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  )
}
