import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { IconoEnviar, IconoListo } from '@/compartido/ui/Iconos'
import { enviarMensaje } from '../api'
import { esquemaMensaje, MAXIMO_MENSAJE, type DatosMensaje } from '../contacto.esquema'

const VACIO: DatosMensaje = { nombre: '', correo: '', telefono: '', asunto: '', mensaje: '', sitio_web: '' }

export function FormMensaje() {
  const envio = useMutation({ mutationFn: enviarMensaje })
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<DatosMensaje>({ resolver: zodResolver(esquemaMensaje), defaultValues: VACIO })
  const mensaje = useWatch({ control, name: 'mensaje' })

  const enviar = (datos: DatosMensaje) =>
    envio.mutate(datos, { onSuccess: () => reset(VACIO), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (campo: keyof DatosMensaje) => ({
    id: `contacto-${campo}`,
    'aria-describedby': `contacto-${campo}-info`,
    'aria-invalid': !!errors[campo],
    className: CLASE_ENTRADA,
    ...register(campo),
  })

  if (envio.isSuccess) {
    return (
      <div role="status" className="self-start rounded-tema border border-borde bg-tarjeta p-6 text-center sombra-suave sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primario text-sobre-primario" aria-hidden="true">
          <IconoListo width={28} height={28} />
        </span>
        <h2 className="mt-5 text-2xl text-titulo">Mensaje enviado</h2>
        <p className="mx-auto mt-2 max-w-md text-texto-suave">{envio.data.mensaje}</p>
        <Boton type="button" variante="borde" onClick={() => envio.reset()} className="mt-6">
          Enviar otro mensaje
        </Boton>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5 rounded-tema border border-borde bg-tarjeta p-5 sombra-suave sm:p-8">
      <div>
        <h2 className="text-2xl text-titulo">Escríbanos</h2>
        <p className="mt-1 text-sm text-texto-suave">Responderemos a su correo electrónico. Los campos sin la marca «Opcional» son obligatorios.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="contacto-nombre" etiqueta="Nombre completo" error={errors.nombre?.message}>
          <input autoComplete="name" {...entrada('nombre')} />
        </Campo>
        <Campo id="contacto-correo" etiqueta="Correo electrónico" error={errors.correo?.message}>
          <input type="email" autoComplete="email" {...entrada('correo')} />
        </Campo>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="contacto-telefono" etiqueta="Teléfono o celular" opcional error={errors.telefono?.message}>
          <input type="tel" autoComplete="tel" {...entrada('telefono')} />
        </Campo>
        <Campo id="contacto-asunto" etiqueta="Asunto" error={errors.asunto?.message}>
          <input placeholder="Ej. Requisitos de titulación" {...entrada('asunto')} />
        </Campo>
      </div>

      <Campo id="contacto-mensaje" etiqueta="Mensaje" error={errors.mensaje?.message} usados={mensaje.length} limite={MAXIMO_MENSAJE}>
        <textarea rows={6} {...entrada('mensaje')} />
      </Campo>

      {/* Campo trampa: oculto para las personas y para los lectores de pantalla */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="contacto-sitio_web">No complete este campo</label>
        <input id="contacto-sitio_web" type="text" tabIndex={-1} autoComplete="off" {...register('sitio_web')} />
      </div>

      {errors.root && (
        <p role="alert" className="text-sm font-semibold text-acento">
          {errors.root.message}
        </p>
      )}

      <div className="flex justify-end border-t border-borde pt-5">
        <Boton type="submit" disabled={envio.isPending} className="inline-flex items-center gap-2">
          <IconoEnviar width={18} height={18} />
          {envio.isPending ? 'Enviando...' : 'Enviar mensaje'}
        </Boton>
      </div>
    </form>
  )
}
