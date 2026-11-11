import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { BarraGuardar } from '@/compartido/ui/BarraGuardar'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { actualizarContenido } from '../api'
import { esquemaContenido, LIMITES, type DatosContenido } from '../institucional.esquema'
import type { ContenidoInstitucional } from '../tipos'
import { useGuardarInstitucional } from '../useInstitucional'

// La leyenda flota para quedar dentro del recuadro y no cortar su borde superior
const SECCION = 'space-y-5 rounded-tema border border-borde bg-fondo p-5 sm:p-6 [&>legend+*]:clear-both'
const LEYENDA = 'float-left mb-1 w-full text-lg font-bold text-titulo'
const AYUDA_PARRAFOS = 'Deje una línea en blanco para separar párrafos.'

const valoresDe = (contenido: ContenidoInstitucional | null): DatosContenido => ({
  presentacion: contenido?.presentacion ?? '',
  resena_historica: contenido?.resena_historica ?? '',
  mision: contenido?.mision ?? '',
  vision: contenido?.vision ?? '',
  perfil_profesional: contenido?.perfil_profesional ?? '',
  campo_ocupacional: contenido?.campo_ocupacional ?? '',
  fecha_creacion: contenido?.fecha_creacion ?? '',
  resolucion: contenido?.resolucion ?? '',
  acreditacion: contenido?.acreditacion ?? '',
})

type CampoTexto = keyof typeof LIMITES

export function FormContenidoInstitucional({ contenido }: { contenido: ContenidoInstitucional | null }) {
  const guardar = useGuardarInstitucional(actualizarContenido)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosContenido>({ resolver: zodResolver(esquemaContenido), defaultValues: valoresDe(contenido) })
  const valores = useWatch({ control })

  // Tras guardar, el formulario toma el texto tal como quedó en la BD (sin espacios sobrantes)
  const enviar = (datos: DatosContenido) =>
    guardar.mutate(datos, { onSuccess: (info) => reset(valoresDe(info.contenido)), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (campo: keyof DatosContenido) => ({
    id: campo,
    'aria-describedby': `${campo}-info`,
    'aria-invalid': !!errors[campo],
    className: CLASE_ENTRADA,
    ...register(campo),
  })

  const texto = (campo: CampoTexto, etiqueta: string, filas: number, ayuda?: string) => (
    <Campo id={campo} etiqueta={etiqueta} ayuda={ayuda} error={errors[campo]?.message} usados={valores[campo]?.length} limite={LIMITES[campo]}>
      <textarea rows={filas} {...entrada(campo)} />
    </Campo>
  )

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-6">
      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Presentación y datos</legend>
        {texto('presentacion', 'Presentación', 4, 'Texto principal de «La Carrera». ' + AYUDA_PARRAFOS)}
        <div className="grid gap-5 sm:grid-cols-3">
          <Campo id="fecha_creacion" etiqueta="Fecha de creación" opcional error={errors.fecha_creacion?.message}>
            <input type="date" {...entrada('fecha_creacion')} />
          </Campo>
          <Campo id="resolucion" etiqueta="Resolución" opcional error={errors.resolucion?.message}>
            <input placeholder="Resolución I.C.U. N.º 051/2006" {...entrada('resolucion')} />
          </Campo>
          <Campo id="acreditacion" etiqueta="Acreditación" opcional error={errors.acreditacion?.message}>
            <input placeholder="Acreditada ante el CEUB" {...entrada('acreditacion')} />
          </Campo>
        </div>
      </fieldset>

      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Misión y visión</legend>
        <div className="grid gap-5 lg:grid-cols-2">
          {texto('mision', 'Misión', 5)}
          {texto('vision', 'Visión', 5)}
        </div>
      </fieldset>

      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Historia</legend>
        {texto('resena_historica', 'Reseña histórica', 10, AYUDA_PARRAFOS + ' Los hitos de la línea de tiempo se editan en la pestaña «Hitos».')}
      </fieldset>

      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Perfil y campo ocupacional</legend>
        {texto('perfil_profesional', 'Perfil profesional', 7, AYUDA_PARRAFOS)}
        {texto('campo_ocupacional', 'Campo ocupacional', 7, AYUDA_PARRAFOS)}

        <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
      </fieldset>
    </form>
  )
}
