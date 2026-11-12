import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router'
import type { ErroresValidacion } from '@/compartido/api/cliente'
import { useSesion } from '@/compartido/sesion/useSesion'
import { Boton } from '@/compartido/ui/Boton'
import { IconoClave, IconoCorreo, IconoIngresar } from '@/compartido/ui/Iconos'
import { Tarjeta } from '@/compartido/ui/Tarjeta'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { esquemaCredenciales, type Credenciales } from '../autenticacion.esquema'
import { useIniciarSesion } from '../useAutenticacion'

const CAMPO = 'w-full rounded-tema border border-borde bg-fondo py-2 pl-10 pr-3 text-texto focus:border-titulo focus:outline-none'
const ICONO_CAMPO = 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-texto-suave'

function mensajeDeError(error: unknown) {
  const errores = isAxiosError<ErroresValidacion>(error) ? error.response?.data.errors : undefined

  return (errores && Object.values(errores)[0]?.[0]) ?? 'No se pudo iniciar sesión. Intente de nuevo.'
}

export function Ingresar() {
  const { data: usuario } = useSesion()
  const ingreso = useIniciarSesion()
  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors },
  } = useForm<Credenciales>({ resolver: zodResolver(esquemaCredenciales) })

  // Al iniciar sesión, useSesion trae al usuario y esta misma condición lo lleva al panel
  if (usuario) return <Navigate to="/gestion" replace />

  const enviar = (datos: Credenciales) =>
    ingreso.mutate(datos, {
      onError: (error) => {
        resetField('password')
        setError('root', { message: mensajeDeError(error) })
      },
    })

  return (
    <div className="mx-auto max-w-md">
      <TituloPagina titulo="Ingresar" subtitulo="Acceso para el personal que administra el portal." />

      <Tarjeta>
        <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
          {errors.root && (
            <p role="alert" className="text-sm font-semibold text-acento">
              {errors.root.message}
            </p>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-semibold text-titulo">
              Correo electrónico
            </label>
            <div className="relative mt-1">
              <IconoCorreo width={18} height={18} className={ICONO_CAMPO} />
              <input
                id="email"
                type="email"
                autoComplete="username"
                aria-invalid={!!errors.email}
                className={CAMPO}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-acento">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold text-titulo">
              Contraseña
            </label>
            <div className="relative mt-1">
              <IconoClave width={18} height={18} className={ICONO_CAMPO} />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className={CAMPO}
                {...register('password')}
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-acento">{errors.password.message}</p>}
          </div>

          <Boton type="submit" disabled={ingreso.isPending} className="flex w-full items-center justify-center gap-2">
            <IconoIngresar width={18} height={18} />
            {ingreso.isPending ? 'Ingresando...' : 'Ingresar'}
          </Boton>
        </form>
      </Tarjeta>
    </div>
  )
}
