import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import type { UsuarioSesion } from '@/compartido/sesion/tipos'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { IconoListo } from '@/compartido/ui/Iconos'
import { Tarjeta } from '@/compartido/ui/Tarjeta'
import { useActualizarPerfil } from '../useUsuarios'
import { esquemaPerfil, type DatosPerfil } from '../usuarios.esquema'
import { EntradaClave } from './EntradaClave'

/** Nombre y correo de la propia cuenta. El correo es con el que se ingresa: cambiarlo pide la contraseña actual. */
export function FormPerfil({ usuario }: { usuario: UsuarioSesion }) {
  const guardar = useActualizarPerfil()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosPerfil>({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: { nombre: usuario.nombre, email: usuario.email, clave_actual: '' },
  })
  const correo = useWatch({ control, name: 'email' })
  const cambiaCorreo = correo.trim().toLowerCase() !== usuario.email

  function enviar(datos: DatosPerfil) {
    if (cambiaCorreo && !datos.clave_actual) {
      setError('clave_actual', { message: 'Escriba su contraseña actual para cambiar el correo.' })
      return
    }

    guardar.mutate(datos, {
      onSuccess: (cuenta) => reset({ nombre: cuenta.nombre, email: cuenta.email, clave_actual: '' }),
      onError: (error) => aplicarErrores(error, setError),
    })
  }

  return (
    <Tarjeta className="p-6 sm:p-8">
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5">
        <div>
          <h2 className="text-xl text-titulo">Datos de la cuenta</h2>
          <p className="mt-1 text-sm text-texto-suave">Su nombre aparece en el panel y en la bitácora. Con el correo ingresa al panel.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo id="perfil-nombre" etiqueta="Nombre completo" error={errors.nombre?.message}>
            <input
              id="perfil-nombre"
              autoComplete="name"
              aria-describedby="perfil-nombre-info"
              aria-invalid={!!errors.nombre}
              className={CLASE_ENTRADA}
              {...register('nombre')}
            />
          </Campo>
          <Campo id="perfil-correo" etiqueta="Correo electrónico" error={errors.email?.message}>
            <input
              id="perfil-correo"
              type="email"
              autoComplete="email"
              aria-describedby="perfil-correo-info"
              aria-invalid={!!errors.email}
              className={CLASE_ENTRADA}
              {...register('email')}
            />
          </Campo>
        </div>

        {cambiaCorreo && (
          <Campo
            id="perfil-clave"
            etiqueta="Contraseña actual"
            ayuda="Para cambiar el correo con el que ingresa, confirme que es usted."
            error={errors.clave_actual?.message}
          >
            <EntradaClave
              id="perfil-clave"
              autoComplete="current-password"
              aria-describedby="perfil-clave-info"
              aria-invalid={!!errors.clave_actual}
              {...register('clave_actual')}
            />
          </Campo>
        )}

        {errors.root && (
          <p role="alert" className="text-sm font-semibold text-acento">
            {errors.root.message}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          {guardar.isSuccess && !isDirty && (
            <p role="status" className="mr-auto inline-flex items-center gap-2 text-sm font-semibold text-titulo">
              <IconoListo width={18} height={18} aria-hidden="true" /> Datos guardados.
            </p>
          )}
          <Boton type="submit" disabled={guardar.isPending || !isDirty}>
            {guardar.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  )
}
