import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { IconoAbajo, IconoCorreo, IconoListo, IconoTelefono } from '@/compartido/ui/Iconos'
import { opcionesDe } from '@/compartido/ui/opciones'
import { SelectorCampo } from '@/compartido/ui/Selector'
import { formatoFecha } from '../formato'
import { esquemaAtencion, type DatosAtencion } from '../innova.esquema'
import { ESTADOS, type EstadoSolicitud, type SolicitudInnova } from '../tipos'
import { useAtenderSolicitud } from '../useInnova'

/** Solo colores del tema: el estado se distingue también por su nombre, no solo por el color. */
const ESTILO_ESTADO: Record<EstadoSolicitud, string> = {
  pendiente: 'border-primario text-acento',
  en_revision: 'border-titulo text-titulo',
  aceptada: 'border-marino bg-marino text-sobre-primario',
  rechazada: 'border-borde text-texto-suave',
  finalizada: 'border-borde bg-superficie text-texto-suave',
}

export function EtiquetaEstado({ estado }: { estado: EstadoSolicitud }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ESTILO_ESTADO[estado]}`}>{ESTADOS[estado]}</span>
}

function FormAtencion({ solicitud }: { solicitud: SolicitudInnova }) {
  const atender = useAtenderSolicitud(solicitud.id)
  const prefijo = `atencion-${solicitud.id}`
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosAtencion>({
    resolver: zodResolver(esquemaAtencion),
    defaultValues: { estado: solicitud.estado, respuesta: solicitud.respuesta ?? '' },
  })

  const enviar = (datos: DatosAtencion) =>
    atender.mutate(datos, {
      onSuccess: (cambiada) => reset({ estado: cambiada.estado, respuesta: cambiada.respuesta ?? '' }),
      onError: (e) => aplicarErrores(e, setError),
    })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4 pt-5">
      <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
        <Campo id={`${prefijo}-estado`} etiqueta="Estado" error={errors.estado?.message}>
          <SelectorCampo
            control={control}
            name="estado"
            id={`${prefijo}-estado`}
            aria-describedby={`${prefijo}-estado-info`}
            aria-invalid={!!errors.estado}
            opciones={opcionesDe(ESTADOS)}
          />
        </Campo>
        <Campo
          id={`${prefijo}-respuesta`}
          etiqueta="Nota de seguimiento"
          opcional
          ayuda="Qué se respondió o se acordó. Solo la ve el personal. Si rechaza la solicitud, escriba el motivo."
          error={errors.respuesta?.message}
        >
          <textarea
            id={`${prefijo}-respuesta`}
            rows={3}
            aria-describedby={`${prefijo}-respuesta-info`}
            aria-invalid={!!errors.respuesta}
            className={CLASE_ENTRADA}
            {...register('respuesta')}
          />
        </Campo>
      </div>

      {errors.root && (
        <p role="alert" className="text-sm font-semibold text-acento">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {atender.isSuccess && !isDirty && (
          <span role="status" className="inline-flex items-center gap-1.5 text-sm font-semibold text-titulo">
            <IconoListo width={16} height={16} /> Guardado
          </span>
        )}
        <Boton type="submit" disabled={!isDirty || atender.isPending}>
          {atender.isPending ? 'Guardando...' : 'Guardar seguimiento'}
        </Boton>
      </div>
    </form>
  )
}

/** Una solicitud: el resumen siempre a la vista y el detalle al desplegarla. */
export function FilaSolicitud({ solicitud }: { solicitud: SolicitudInnova }) {
  const [abierta, setAbierta] = useState(false)
  const puedeAtender = usePermiso('solicitudes_innova.editar')
  const idDetalle = `solicitud-${solicitud.id}`
  const asunto = encodeURIComponent(`Su solicitud a INNOVA${solicitud.servicio ? `: ${solicitud.servicio}` : ''}`)

  return (
    <li className="rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-cuerpo text-base font-bold text-titulo">{solicitud.nombre}</h3>
            <EtiquetaEstado estado={solicitud.estado} />
          </div>
          <p className="mt-1 text-sm text-texto">
            {solicitud.servicio ?? 'Otro / no está seguro'}
            {solicitud.organizacion && ` · ${solicitud.organizacion}`}
          </p>
          <p className="mt-1 text-sm text-texto-suave">Recibida el {formatoFecha(solicitud.recibida)}</p>
        </div>
        <button
          type="button"
          aria-expanded={abierta}
          aria-controls={idDetalle}
          onClick={() => setAbierta((a) => !a)}
          className="inline-flex items-center gap-1.5 rounded-tema px-3 py-2 text-sm font-semibold text-titulo transition-colors hover:bg-superficie aria-expanded:bg-superficie"
        >
          {abierta ? 'Ocultar' : puedeAtender ? 'Ver y atender' : 'Ver detalle'}
          <IconoAbajo width={16} height={16} className={`transition-transform ${abierta ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {abierta && (
        <div id={idDetalle} className="mt-5 space-y-5">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-titulo">Lo que necesita</h4>
            <p className="mt-2 whitespace-pre-line text-texto">{solicitud.descripcion}</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a
              href={`mailto:${solicitud.correo}?subject=${asunto}`}
              className="inline-flex items-center gap-1.5 break-all font-semibold text-titulo underline-offset-4 hover:text-acento hover:underline"
            >
              <IconoCorreo width={16} height={16} /> {solicitud.correo}
            </a>
            {solicitud.telefono && (
              <a href={`tel:${solicitud.telefono.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1.5 font-semibold text-titulo">
                <IconoTelefono width={16} height={16} /> {solicitud.telefono}
              </a>
            )}
          </div>

          {solicitud.atendida_por && solicitud.atendida_en && (
            <p className="text-sm text-texto-suave">
              Último seguimiento: {solicitud.atendida_por} · {formatoFecha(solicitud.atendida_en)}
            </p>
          )}

          {puedeAtender ? (
            <FormAtencion solicitud={solicitud} />
          ) : (
            solicitud.respuesta && <p className="whitespace-pre-line pt-4 text-sm">{solicitud.respuesta}</p>
          )}
        </div>
      )}
    </li>
  )
}
