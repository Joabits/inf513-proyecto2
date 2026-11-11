import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { IconoEnviar, IconoListo } from '@/compartido/ui/Iconos'
import { enviarSolicitud } from '../api'
import { esquemaSolicitud, MAXIMO_DESCRIPCION, OTRO_SERVICIO, type DatosSolicitud } from '../innova.esquema'
import type { ServicioInnova } from '../tipos'

const VACIO: DatosSolicitud = { nombre: '', organizacion: '', correo: '', telefono: '', servicio_id: '', descripcion: '', sitio_web: '' }

/**
 * CU-09 Enviar solicitud a INNOVA.
 * `servicioElegido` llega cuando el visitante pulsa «Solicitar» en la tarjeta de un servicio.
 */
export function FormSolicitud({ servicios, servicioElegido }: { servicios: ServicioInnova[]; servicioElegido: number | null }) {
  const envio = useMutation({ mutationFn: enviarSolicitud })
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<DatosSolicitud>({ resolver: zodResolver(esquemaSolicitud), defaultValues: VACIO })
  const descripcion = useWatch({ control, name: 'descripcion' })

  useEffect(() => {
    if (servicioElegido) setValue('servicio_id', String(servicioElegido), { shouldDirty: true })
  }, [servicioElegido, setValue])

  const enviar = (datos: DatosSolicitud) =>
    envio.mutate(datos, { onSuccess: () => reset(VACIO), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (campo: keyof DatosSolicitud) => ({
    id: `solicitud-${campo}`,
    'aria-describedby': `solicitud-${campo}-info`,
    'aria-invalid': !!errors[campo],
    className: CLASE_ENTRADA,
    ...register(campo),
  })

  if (envio.isSuccess) {
    return (
      <div role="status" className="rounded-tema border border-borde bg-tarjeta p-6 text-center sombra-suave sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primario text-sobre-primario" aria-hidden="true">
          <IconoListo width={28} height={28} />
        </span>
        <h3 className="mt-5 text-2xl text-titulo">Solicitud enviada</h3>
        <p className="mx-auto mt-2 max-w-md text-texto-suave">{envio.data.mensaje}</p>
        <Boton type="button" variante="borde" onClick={() => envio.reset()} className="mt-6">
          Enviar otra solicitud
        </Boton>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5 rounded-tema border border-borde bg-tarjeta p-5 sombra-suave sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="solicitud-nombre" etiqueta="Nombre completo" error={errors.nombre?.message}>
          <input autoComplete="name" {...entrada('nombre')} />
        </Campo>
        <Campo id="solicitud-organizacion" etiqueta="Empresa u organización" opcional error={errors.organizacion?.message}>
          <input autoComplete="organization" placeholder="Si es un emprendimiento, su nombre" {...entrada('organizacion')} />
        </Campo>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="solicitud-correo" etiqueta="Correo electrónico" error={errors.correo?.message}>
          <input type="email" autoComplete="email" {...entrada('correo')} />
        </Campo>
        <Campo id="solicitud-telefono" etiqueta="Teléfono o celular" opcional error={errors.telefono?.message}>
          <input type="tel" autoComplete="tel" {...entrada('telefono')} />
        </Campo>
      </div>

      <Campo id="solicitud-servicio_id" etiqueta="Servicio que necesita" error={errors.servicio_id?.message}>
        <select {...entrada('servicio_id')}>
          <option value="">Seleccione un servicio</option>
          {servicios.map((servicio) => (
            <option key={servicio.id} value={servicio.id}>
              {servicio.nombre}
            </option>
          ))}
          <option value={OTRO_SERVICIO}>Otro / no estoy seguro</option>
        </select>
      </Campo>

      <Campo
        id="solicitud-descripcion"
        etiqueta="¿Qué necesita?"
        ayuda="Cuéntenos sobre su emprendimiento u organización y qué espera del servicio."
        error={errors.descripcion?.message}
        usados={descripcion.length}
        limite={MAXIMO_DESCRIPCION}
      >
        <textarea rows={6} {...entrada('descripcion')} />
      </Campo>

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

      <div className="flex justify-end border-t border-borde pt-5">
        <Boton type="submit" disabled={envio.isPending} className="inline-flex items-center gap-2">
          <IconoEnviar width={18} height={18} />
          {envio.isPending ? 'Enviando...' : 'Enviar solicitud'}
        </Boton>
      </div>
    </form>
  )
}
