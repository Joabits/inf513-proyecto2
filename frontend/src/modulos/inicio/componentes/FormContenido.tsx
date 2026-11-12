import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { actualizarPortada } from '../api'
import { esquemaContenido, type DatosContenido } from '../inicio.esquema'
import type { Portada } from '../tipos'
import { useGuardarInicio } from '../useInicio'
import { BarraGuardar } from './BarraGuardar'
import { FotoDirector } from './FotoDirector'

// La leyenda flota para quedar dentro del recuadro y no cortar su borde superior
const SECCION = 'space-y-5 rounded-tema border border-borde bg-fondo p-5 sm:p-6 [&>legend+*]:clear-both'
const LEYENDA = 'float-left mb-1 w-full text-lg font-bold text-titulo'

const valoresDe = (portada: Portada | null): DatosContenido => ({
  distintivo: portada?.distintivo ?? '',
  titulo: portada?.titulo ?? '',
  presentacion: portada?.presentacion ?? '',
  director_nombre: portada?.director_nombre ?? '',
  director_cargo: portada?.director_cargo ?? '',
  director_mensaje: portada?.director_mensaje ?? '',
})

export function FormContenido({ portada }: { portada: Portada | null }) {
  const guardar = useGuardarInicio(actualizarPortada)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosContenido>({ resolver: zodResolver(esquemaContenido), defaultValues: valoresDe(portada) })
  const valores = useWatch({ control })

  const enviar = (datos: DatosContenido) =>
    guardar.mutate(datos, { onSuccess: () => reset(datos), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (campo: keyof DatosContenido) => ({
    id: campo,
    'aria-describedby': `${campo}-info`,
    'aria-invalid': !!errors[campo],
    className: CLASE_ENTRADA,
    ...register(campo),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-6">
      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Presentación</legend>
        <Campo id="distintivo" etiqueta="Distintivo" opcional ayuda="Texto corto sobre el título, por ejemplo la acreditación." error={errors.distintivo?.message}>
          <input {...entrada('distintivo')} />
        </Campo>
        <Campo id="titulo" etiqueta="Título" error={errors.titulo?.message}>
          <input {...entrada('titulo')} />
        </Campo>
        <Campo id="presentacion" etiqueta="Texto de bienvenida" error={errors.presentacion?.message} usados={valores.presentacion?.length} limite={600}>
          <textarea rows={5} {...entrada('presentacion')} />
        </Campo>
      </fieldset>

      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Mensaje del Director</legend>
        {portada && <FotoDirector foto={portada.director_foto} nombre={portada.director_nombre} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo id="director_nombre" etiqueta="Nombre" error={errors.director_nombre?.message}>
            <input {...entrada('director_nombre')} />
          </Campo>
          <Campo id="director_cargo" etiqueta="Cargo" error={errors.director_cargo?.message}>
            <input {...entrada('director_cargo')} />
          </Campo>
        </div>
        <Campo id="director_mensaje" etiqueta="Mensaje" error={errors.director_mensaje?.message} usados={valores.director_mensaje?.length} limite={1200}>
          <textarea rows={7} {...entrada('director_mensaje')} />
        </Campo>

        <BarraGuardar
          sucio={isDirty}
          guardando={guardar.isPending}
          guardado={guardar.isSuccess && !isDirty}
          error={errors.root?.message}
        />
      </fieldset>
    </form>
  )
}
