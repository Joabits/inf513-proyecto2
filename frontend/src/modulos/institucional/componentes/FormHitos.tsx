import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { BarraGuardar } from '@/compartido/ui/BarraGuardar'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { FilaLista } from '@/compartido/ui/FilaLista'
import { IconoAgregar } from '@/compartido/ui/Iconos'
import { guardarHitos } from '../api'
import { ANIO_ACTUAL, esquemaHitos, MAXIMO_HITOS, PRIMER_ANIO, type DatosHitos } from '../institucional.esquema'
import type { Hito } from '../tipos'
import { useGuardarInstitucional } from '../useInstitucional'

const aFormulario = (hitos: Hito[]): DatosHitos => ({
  hitos: hitos.map((hito) => ({ anio: hito.anio, titulo: hito.titulo, descripcion: hito.descripcion ?? '' })),
})

export function FormHitos({ hitos }: { hitos: Hito[] }) {
  const guardar = useGuardarInstitucional(guardarHitos)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosHitos>({ resolver: zodResolver(esquemaHitos), defaultValues: aFormulario(hitos) })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'hitos' })

  // La API los devuelve en orden cronológico: el formulario muestra ese mismo orden
  const enviar = (datos: DatosHitos) =>
    guardar.mutate(datos, { onSuccess: (info) => reset(aFormulario(info.hitos)), onError: (e) => aplicarErrores(e, setError) })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-titulo">Hitos de la historia</h2>
        <p className="text-sm text-texto-suave">
          Línea de tiempo de «La Carrera». Al guardar se ordenan por año; los del mismo año quedan en el orden de esta lista.
        </p>
      </div>

      {fields.length === 0 && (
        <p className="p-6 text-center text-sm text-texto-suave">
          No hay hitos: la línea de tiempo no se mostrará.
        </p>
      )}

      <ol className="space-y-3">
        {fields.map((campo, i) => {
          const error = errors.hitos?.[i]
          return (
            <FilaLista
              key={campo.id}
              numero={i + 1}
              total={fields.length}
              nombre={`el hito ${i + 1}`}
              alSubir={() => move(i, i - 1)}
              alBajar={() => move(i, i + 1)}
              alQuitar={() => remove(i)}
            >
              <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
                <Campo id={`hitos.${i}.anio`} etiqueta="Año" error={error?.anio?.message}>
                  <input
                    id={`hitos.${i}.anio`}
                    type="number"
                    inputMode="numeric"
                    min={PRIMER_ANIO}
                    max={ANIO_ACTUAL}
                    aria-describedby={`hitos.${i}.anio-info`}
                    aria-invalid={!!error?.anio}
                    className={CLASE_ENTRADA}
                    {...register(`hitos.${i}.anio`, { valueAsNumber: true })}
                  />
                </Campo>
                <Campo id={`hitos.${i}.titulo`} etiqueta="Título" error={error?.titulo?.message}>
                  <input
                    id={`hitos.${i}.titulo`}
                    aria-describedby={`hitos.${i}.titulo-info`}
                    aria-invalid={!!error?.titulo}
                    className={CLASE_ENTRADA}
                    {...register(`hitos.${i}.titulo`)}
                  />
                </Campo>
                <div className="sm:col-span-2">
                  <Campo id={`hitos.${i}.descripcion`} etiqueta="Descripción" opcional error={error?.descripcion?.message}>
                    <input
                      id={`hitos.${i}.descripcion`}
                      aria-describedby={`hitos.${i}.descripcion-info`}
                      aria-invalid={!!error?.descripcion}
                      className={CLASE_ENTRADA}
                      {...register(`hitos.${i}.descripcion`)}
                    />
                  </Campo>
                </div>
              </div>
            </FilaLista>
          )
        })}
      </ol>

      <Boton
        type="button"
        variante="borde"
        disabled={fields.length >= MAXIMO_HITOS}
        onClick={() => append({ anio: ANIO_ACTUAL, titulo: '', descripcion: '' })}
        className="flex items-center gap-2 text-sm"
      >
        <IconoAgregar width={16} height={16} />
        Agregar hito
        <span className="font-normal text-texto-suave">
          ({fields.length} de {MAXIMO_HITOS})
        </span>
      </Boton>

      <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
    </form>
  )
}
