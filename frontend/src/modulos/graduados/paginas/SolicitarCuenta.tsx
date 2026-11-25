import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { IconoEnviar, IconoListo } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { solicitudCuentaSchema, type SolicitudCuentaValores } from '../esquema/solicitudCuentaSchema'
import { useSolicitarCuenta } from '../hooks/useGraduados'

const VACIO: SolicitudCuentaValores = {
  nombre_completo: '', ci: '', correo: '', telefono: '', gestion_ingreso: '', gestion_egreso: '', modalidad: '', titulo_tema: '',
  password: '', password_confirmation: '', sitio_web: '',
}

const MODALIDADES = ['Tesis de Grado', 'Proyecto de Grado', 'Examen de Grado', 'Trabajo Dirigido', 'Graduación por Excelencia']

/**
 * CU-10: el graduado solicita su cuenta desde el portal. Escribe sus datos de graduado, su correo y una contraseña;
 * la cuenta queda inactiva hasta que la Carrera revise los datos y la apruebe. Después ingresa por /gestion y
 * mantiene sus datos al día en «Mis datos de graduado».
 */
export function SolicitarCuenta() {
  const solicitud = useSolicitarCuenta()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SolicitudCuentaValores>({ resolver: zodResolver(solicitudCuentaSchema), defaultValues: VACIO })

  const enviar = (datos: SolicitudCuentaValores) => solicitud.mutate(datos, { onError: (e) => aplicarErrores(e, setError) })

  const entrada = (campo: keyof SolicitudCuentaValores) => ({
    id: `solicitud-${campo}`,
    'aria-invalid': !!errors[campo],
    className: CLASE_ENTRADA,
    ...register(campo),
  })

  return (
    <div className="mx-auto max-w-3xl">
      <TituloPagina
        titulo="Cuenta de graduado"
        subtitulo="Si es graduado de la Carrera, solicite su cuenta para registrar y mantener al día sus datos."
      />

      {solicitud.isSuccess ? (
        <div role="status" className="rounded-tema border border-borde-tarjeta bg-tarjeta p-6 text-center sombra-suave sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primario text-sobre-primario" aria-hidden="true">
            <IconoListo width={28} height={28} />
          </span>
          <h2 className="mt-5 text-2xl text-titulo">Solicitud enviada</h2>
          <p className="mx-auto mt-2 max-w-md text-texto-suave">{solicitud.data.mensaje}</p>
          <Link to="/alumni" className="mt-6 inline-block font-semibold text-titulo underline-offset-4 hover:underline">
            Volver al directorio de graduados
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave sm:p-8">
          <ol className="grid gap-3 text-sm text-texto-suave sm:grid-cols-3">
            <li><strong className="text-titulo">1. Usted</strong> escribe sus datos y elige una contraseña.</li>
            <li><strong className="text-titulo">2. La Carrera</strong> revisa que sea graduado y aprueba su cuenta.</li>
            <li><strong className="text-titulo">3. Usted</strong> ingresa por /gestion y actualiza sus datos cuando cambien.</li>
          </ol>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo id="solicitud-nombre_completo" etiqueta="Nombre completo" error={errors.nombre_completo?.message}>
              <input autoComplete="name" placeholder="Ej. Juan Pérez Ramos" {...entrada('nombre_completo')} />
            </Campo>
            <Campo id="solicitud-ci" etiqueta="Cédula de identidad (CI)" error={errors.ci?.message}>
              <input autoComplete="off" placeholder="Ej. 8452147" {...entrada('ci')} />
            </Campo>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo id="solicitud-correo" etiqueta="Correo electrónico (con él ingresará)" error={errors.correo?.message}>
              <input type="email" autoComplete="email" placeholder="Ej. juan.perez@gmail.com" {...entrada('correo')} />
            </Campo>
            <Campo id="solicitud-telefono" etiqueta="Teléfono o celular" opcional error={errors.telefono?.message}>
              <input type="tel" autoComplete="tel" placeholder="Ej. 70012345" {...entrada('telefono')} />
            </Campo>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Campo id="solicitud-gestion_ingreso" etiqueta="Gestión de ingreso" error={errors.gestion_ingreso?.message}>
              <input autoComplete="off" placeholder="Ej. I-2019" {...entrada('gestion_ingreso')} />
            </Campo>
            <Campo id="solicitud-gestion_egreso" etiqueta="Gestión de egreso" error={errors.gestion_egreso?.message}>
              <input autoComplete="off" placeholder="Ej. II-2024" {...entrada('gestion_egreso')} />
            </Campo>
            <Campo id="solicitud-modalidad" etiqueta="Modalidad de graduación" error={errors.modalidad?.message}>
              <select {...entrada('modalidad')}>
                <option value="">Seleccione modalidad...</option>
                {MODALIDADES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <Campo id="solicitud-titulo_tema" etiqueta="Título o tema de graduación" opcional error={errors.titulo_tema?.message}>
            <textarea rows={2} placeholder="Ej. Plan estratégico de negocios para empresas del sector comercial" {...entrada('titulo_tema')} />
          </Campo>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo id="solicitud-password" etiqueta="Contraseña" error={errors.password?.message}>
              <input type="password" autoComplete="new-password" {...entrada('password')} />
            </Campo>
            <Campo id="solicitud-password_confirmation" etiqueta="Repita la contraseña" error={errors.password_confirmation?.message}>
              <input type="password" autoComplete="new-password" {...entrada('password_confirmation')} />
            </Campo>
          </div>
          <p className="-mt-2 text-xs text-texto-suave">Al menos 8 caracteres, con letras y números.</p>

          {/* Campo trampa: oculto para las personas y para los lectores de pantalla */}
          <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
            <label htmlFor="solicitud-sitio_web">No complete este campo</label>
            <input id="solicitud-sitio_web" type="text" tabIndex={-1} autoComplete="off" {...register('sitio_web')} />
          </div>

          {errors.root && (
            <p role="alert" className="text-sm font-semibold text-acento">
              {errors.root.message}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <Link to="/alumni" className="text-sm font-semibold text-titulo underline-offset-4 hover:underline">
              Volver al directorio
            </Link>
            <Boton type="submit" disabled={solicitud.isPending} className="inline-flex items-center gap-2">
              <IconoEnviar width={18} height={18} />
              {solicitud.isPending ? 'Enviando...' : 'Solicitar mi cuenta'}
            </Boton>
          </div>
        </form>
      )}
    </div>
  )
}
