import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { BarraGuardar } from '@/compartido/ui/BarraGuardar'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { FilaLista } from '@/compartido/ui/FilaLista'
import { IconoAgregar } from '@/compartido/ui/Iconos'
import { esquemaLineas, MAXIMO_LINEAS, type DatosLineas } from '../investigacion.esquema'
import type { Linea } from '../tipos'
import { useGuardarLineas } from '../useInvestigacion'

const aFormulario = (lineas: Linea[]): DatosLineas => ({
  lineas: lineas.map(({ id, nombre, descripcion }) => ({ clave: id, nombre, descripcion })),
})

export function FormLineas({ lineas }: { lineas: Linea[] }) {
  const guardar = useGuardarLineas()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosLineas>({ resolver: zodResolver(esquemaLineas), defaultValues: aFormulario(lineas) })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'lineas' })
  const actuales = useWatch({ control, name: 'lineas' }) ?? []
  const proyectosDe = (clave: number | null) => lineas.find((linea) => linea.id === clave)?.proyectos ?? 0

  const enviar = (datos: DatosLineas) =>
    guardar.mutate(datos, { onSuccess: (guardadas) => reset(aFormulario(guardadas)), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (i: number, campo: 'nombre' | 'descripcion') => ({
    id: `lineas.${i}.${campo}`,
    'aria-describedby': `lineas.${i}.${campo}-info`,
    'aria-invalid': !!errors.lineas?.[i]?.[campo],
    className: CLASE_ENTRADA,
    ...register(`lineas.${i}.${campo}`),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5 rounded-tema border border-borde bg-fondo p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-titulo">Líneas de investigación</h2>
        <p className="text-sm text-texto-suave">
          Orientan los proyectos, los trabajos de grado y la producción científica. Una línea con proyectos no se puede quitar: primero cambie
          esos proyectos de línea.
        </p>
      </div>

      {fields.length === 0 && (
        <p className="rounded-tema border border-dashed border-borde p-6 text-center text-sm text-texto-suave">No hay líneas de investigación.</p>
      )}

      <ol className="space-y-3">
        {fields.map((campo, i) => {
          const error = errors.lineas?.[i]
          const proyectos = proyectosDe(actuales[i]?.clave ?? null)
          return (
            <FilaLista
              key={campo.id}
              numero={i + 1}
              total={fields.length}
              nombre={`la línea ${i + 1}`}
              alSubir={() => move(i, i - 1)}
              alBajar={() => move(i, i + 1)}
              alQuitar={() => remove(i)}
              noQuitar={proyectos > 0}
            >
              <div className="grid gap-3">
                <Campo id={`lineas.${i}.nombre`} etiqueta="Nombre" error={error?.nombre?.message}>
                  <input {...entrada(i, 'nombre')} />
                </Campo>
                <Campo id={`lineas.${i}.descripcion`} etiqueta="Descripción" error={error?.descripcion?.message}>
                  <textarea rows={3} {...entrada(i, 'descripcion')} />
                </Campo>
                {proyectos > 0 && (
                  <p className="text-sm text-texto-suave">
                    {proyectos === 1 ? 'Tiene 1 proyecto' : `Tiene ${proyectos} proyectos`}: no se puede quitar.
                  </p>
                )}
              </div>
            </FilaLista>
          )
        })}
      </ol>

      {errors.lineas?.root?.message || errors.lineas?.message ? (
        <p role="alert" className="text-sm font-semibold text-acento">
          {errors.lineas?.root?.message ?? errors.lineas?.message}
        </p>
      ) : null}

      <Boton
        type="button"
        variante="borde"
        disabled={fields.length >= MAXIMO_LINEAS}
        onClick={() => append({ clave: null, nombre: '', descripcion: '' })}
        className="flex items-center gap-2 text-sm"
      >
        <IconoAgregar width={16} height={16} />
        Agregar línea
        <span className="font-normal text-texto-suave">
          ({fields.length} de {MAXIMO_LINEAS})
        </span>
      </Boton>

      <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
    </form>
  )
}
