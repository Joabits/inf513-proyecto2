import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { Interruptor } from '@/compartido/ui/Interruptor'
import { actualizarProyecto, crearProyecto } from '../api'
import { ANIO_ACTUAL, esquemaProyecto, MAXIMO_RESUMEN, PRIMERA_GESTION, ULTIMA_GESTION, type DatosProyecto } from '../investigacion.esquema'
import { ESTADOS, TIPOS, type Linea, type Proyecto } from '../tipos'
import { useGuardarProyecto } from '../useInvestigacion'

const valoresDe = (proyecto?: Proyecto): DatosProyecto => ({
  titulo: proyecto?.titulo ?? '',
  tipo: proyecto?.tipo ?? 'investigacion',
  linea_id: proyecto?.linea ? String(proyecto.linea.id) : '',
  responsable: proyecto?.responsable ?? '',
  integrantes: proyecto?.integrantes ?? '',
  gestion: proyecto?.gestion ?? ANIO_ACTUAL,
  estado: proyecto?.estado ?? 'en_curso',
  resumen: proyecto?.resumen ?? '',
  publicado: proyecto?.publicado ?? true,
})

/** Registrar un proyecto nuevo o editar uno existente. */
export function FormProyecto({ proyecto, lineas, alTerminar }: { proyecto?: Proyecto; lineas: Linea[]; alTerminar: () => void }) {
  const prefijo = proyecto ? `proyecto-${proyecto.id}` : 'proyecto-nuevo'
  const guardar = useGuardarProyecto((datos) => (proyecto ? actualizarProyecto(proyecto.id, datos) : crearProyecto(datos)))
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<DatosProyecto>({ resolver: zodResolver(esquemaProyecto), defaultValues: valoresDe(proyecto) })
  const resumen = useWatch({ control, name: 'resumen' })

  const enviar = (datos: DatosProyecto) => guardar.mutate(datos, { onSuccess: alTerminar, onError: (e) => aplicarErrores(e, setError) })

  const entrada = (campo: Exclude<keyof DatosProyecto, 'publicado' | 'gestion'>) => ({
    id: `${prefijo}-${campo}`,
    'aria-describedby': `${prefijo}-${campo}-info`,
    'aria-invalid': !!errors[campo],
    className: CLASE_ENTRADA,
    ...register(campo),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5">
      <Campo id={`${prefijo}-titulo`} etiqueta="Título" error={errors.titulo?.message}>
        <input {...entrada('titulo')} />
      </Campo>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id={`${prefijo}-tipo`} etiqueta="Tipo" error={errors.tipo?.message}>
          <select {...entrada('tipo')}>
            {Object.entries(TIPOS).map(([valor, nombre]) => (
              <option key={valor} value={valor}>
                {nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id={`${prefijo}-linea_id`} etiqueta="Línea de investigación" error={errors.linea_id?.message}>
          <select {...entrada('linea_id')}>
            <option value="">Sin línea asignada</option>
            {lineas.map((linea) => (
              <option key={linea.id} value={linea.id}>
                {linea.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_9rem_10rem]">
        <Campo id={`${prefijo}-responsable`} etiqueta="Docente responsable" error={errors.responsable?.message}>
          <input placeholder="Ej. Dr. Deivit Castro Aguilera" {...entrada('responsable')} />
        </Campo>
        <Campo id={`${prefijo}-gestion`} etiqueta="Gestión" error={errors.gestion?.message}>
          <input
            id={`${prefijo}-gestion`}
            type="number"
            inputMode="numeric"
            min={PRIMERA_GESTION}
            max={ULTIMA_GESTION}
            aria-describedby={`${prefijo}-gestion-info`}
            aria-invalid={!!errors.gestion}
            className={CLASE_ENTRADA}
            {...register('gestion', { valueAsNumber: true })}
          />
        </Campo>
        <Campo id={`${prefijo}-estado`} etiqueta="Estado" error={errors.estado?.message}>
          <select {...entrada('estado')}>
            {Object.entries(ESTADOS).map(([valor, nombre]) => (
              <option key={valor} value={valor}>
                {nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo
        id={`${prefijo}-integrantes`}
        etiqueta="Integrantes"
        opcional
        ayuda="Docentes y estudiantes que participan, separados por comas."
        error={errors.integrantes?.message}
      >
        <input {...entrada('integrantes')} />
      </Campo>

      <Campo
        id={`${prefijo}-resumen`}
        etiqueta="Resumen"
        ayuda="Qué estudia el proyecto y qué resultados busca. Deje una línea en blanco para separar párrafos."
        error={errors.resumen?.message}
        usados={resumen.length}
        limite={MAXIMO_RESUMEN}
      >
        <textarea rows={5} {...entrada('resumen')} />
      </Campo>

      <div className="border-t border-borde pt-5">
        <Interruptor
          id={`${prefijo}-publicado`}
          etiqueta="Publicar en el portal"
          ayuda="Los visitantes lo verán en la sección Investigación. Si lo desactiva, solo lo ve el personal."
          {...register('publicado')}
        />
      </div>

      {errors.root && (
        <p role="alert" className="text-sm font-semibold text-acento">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t border-borde pt-5">
        <Boton type="button" variante="borde" onClick={alTerminar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardar.isPending}>
          {guardar.isPending ? 'Guardando...' : proyecto ? 'Guardar cambios' : 'Registrar proyecto'}
        </Boton>
      </div>
    </form>
  )
}
