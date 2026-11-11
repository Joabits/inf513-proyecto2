import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { BarraGuardar } from '@/compartido/ui/BarraGuardar'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { Interruptor } from '@/compartido/ui/Interruptor'
import { actualizarPresentacion } from '../api'
import { esquemaPresentacion, type DatosPresentacion } from '../innova.esquema'
import type { ContenidoInnova } from '../tipos'
import { useGuardarInnova } from '../useInnova'

const SECCION = 'space-y-5 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave sm:p-6 [&>legend+*]:clear-both'
const LEYENDA = 'float-left mb-1 w-full text-lg font-bold text-titulo'

const valoresDe = (contenido: ContenidoInnova | null): DatosPresentacion => ({
  presentacion: contenido?.presentacion ?? '',
  mision: contenido?.mision ?? '',
  vision: contenido?.vision ?? '',
  correo: contenido?.correo ?? '',
  recibe_solicitudes: contenido?.recibe_solicitudes ?? true,
})

export function FormPresentacionInnova({ contenido }: { contenido: ContenidoInnova | null }) {
  const guardar = useGuardarInnova(actualizarPresentacion)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosPresentacion>({ resolver: zodResolver(esquemaPresentacion), defaultValues: valoresDe(contenido) })
  const valores = useWatch({ control })

  const enviar = (datos: DatosPresentacion) =>
    guardar.mutate(datos, { onSuccess: (info) => reset(valoresDe(info.contenido)), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (campo: Exclude<keyof DatosPresentacion, 'recibe_solicitudes'>) => ({
    id: `innova-${campo}`,
    'aria-describedby': `innova-${campo}-info`,
    'aria-invalid': !!errors[campo],
    className: CLASE_ENTRADA,
    ...register(campo),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-6">
      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Recepción de solicitudes</legend>
        <Interruptor
          id="innova-recibe_solicitudes"
          etiqueta="Recibir solicitudes de servicio"
          ayuda="Si lo desactiva, la página de INNOVA avisa que por ahora no recibe solicitudes y oculta el formulario."
          {...register('recibe_solicitudes')}
        />
      </fieldset>

      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Presentación</legend>
        <Campo
          id="innova-presentacion"
          etiqueta="¿Qué es INNOVA?"
          ayuda="Deje una línea en blanco para separar párrafos."
          error={errors.presentacion?.message}
          usados={valores.presentacion?.length}
          limite={2000}
        >
          <textarea rows={6} {...entrada('presentacion')} />
        </Campo>
        <div className="grid gap-5 lg:grid-cols-2">
          <Campo id="innova-mision" etiqueta="Misión" opcional error={errors.mision?.message} usados={valores.mision?.length} limite={1000}>
            <textarea rows={4} {...entrada('mision')} />
          </Campo>
          <Campo id="innova-vision" etiqueta="Visión" opcional error={errors.vision?.message} usados={valores.vision?.length} limite={1000}>
            <textarea rows={4} {...entrada('vision')} />
          </Campo>
        </div>
        <Campo id="innova-correo" etiqueta="Correo de INNOVA" opcional ayuda="Se muestra junto al formulario de solicitud." error={errors.correo?.message}>
          <input type="email" placeholder="innova@uagrm.edu.bo" {...entrada('correo')} />
        </Campo>

        <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
      </fieldset>
    </form>
  )
}
