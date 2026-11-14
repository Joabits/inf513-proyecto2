import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { BarraGuardar } from '@/compartido/ui/BarraGuardar'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { actualizarContenido } from '../api'
import { esquemaContenido, type DatosContenido } from '../revista.esquema'
import type { ContenidoRevista } from '../tipos'
import { useGuardarRevista } from '../useRevista'

const SECCION = 'space-y-5 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave sm:p-6 [&>legend+*]:clear-both'
const LEYENDA = 'float-left mb-1 w-full text-lg font-bold text-titulo'

const valoresDe = (contenido: ContenidoRevista | null): DatosContenido => ({
  presentacion: contenido?.presentacion ?? '',
  colaboradores: contenido?.colaboradores ?? '',
})

/** Presentación de la revista e información para quienes quieran colaborar con ella. */
export function FormContenidoRevista({ contenido }: { contenido: ContenidoRevista | null }) {
  const guardar = useGuardarRevista(actualizarContenido)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosContenido>({ resolver: zodResolver(esquemaContenido), defaultValues: valoresDe(contenido) })
  const valores = useWatch({ control })

  const enviar = (datos: DatosContenido) =>
    guardar.mutate(datos, { onSuccess: (revista) => reset(valoresDe(revista.revista)), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (campo: keyof DatosContenido) => ({
    id: `revista-${campo}`,
    'aria-describedby': `revista-${campo}-info`,
    'aria-invalid': !!errors[campo],
    className: CLASE_ENTRADA,
    ...register(campo),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-6">
      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Presentación</legend>
        <Campo
          id="revista-presentacion"
          etiqueta="¿Qué es INNOVAR?"
          ayuda="Deje una línea en blanco para separar párrafos."
          error={errors.presentacion?.message}
          usados={valores.presentacion?.length}
          limite={2000}
        >
          <textarea rows={6} {...entrada('presentacion')} />
        </Campo>
      </fieldset>

      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Información para colaboradores</legend>
        <Campo
          id="revista-colaboradores"
          etiqueta="Normas y envío de artículos"
          opcional
          ayuda="Cómo enviar un artículo, plazos y a quién escribir. Si lo deja vacío, el portal no muestra esta sección."
          error={errors.colaboradores?.message}
          usados={valores.colaboradores?.length}
          limite={4000}
        >
          <textarea rows={8} {...entrada('colaboradores')} />
        </Campo>

        <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
      </fieldset>
    </form>
  )
}
