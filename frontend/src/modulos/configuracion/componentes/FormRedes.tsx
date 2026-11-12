import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { NOMBRE_RED, type Configuracion } from '@/compartido/configuracion/tipos'
import { BarraGuardar } from '@/compartido/ui/BarraGuardar'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { FilaLista } from '@/compartido/ui/FilaLista'
import { IconoAgregar } from '@/compartido/ui/Iconos'
import { guardarRedes } from '../api'
import { esquemaRedes, REDES, type DatosRedes } from '../configuracion.esquema'
import { useGuardarConfiguracion } from '../useGuardarConfiguracion'

export function FormRedes({ redes, editable }: { redes: Configuracion['redes']; editable: boolean }) {
  const guardar = useGuardarConfiguracion(guardarRedes)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosRedes>({ resolver: zodResolver(esquemaRedes), defaultValues: { redes } })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'redes' })
  const elegidas = useWatch({ control, name: 'redes' }) ?? []
  const libre = REDES.find((red) => !elegidas.some((fila) => fila.red === red))

  const enviar = (datos: DatosRedes) =>
    guardar.mutate(datos, { onSuccess: () => reset(datos), onError: (e) => aplicarErrores(e, setError) })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate>
      <fieldset disabled={!editable} className="space-y-5 rounded-tema border border-borde bg-fondo p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-titulo">Redes sociales</h2>
          <p className="text-sm text-texto-suave">Cuentas oficiales de la Carrera. Aparecen en el pie de página y en la página de contacto.</p>
        </div>

        {fields.length === 0 && (
          <p className="rounded-tema border border-dashed border-borde p-6 text-center text-sm text-texto-suave">
            Todavía no hay redes sociales: el portal no muestra ninguna.
          </p>
        )}

        <ol className="space-y-3">
          {fields.map((campo, i) => {
            const error = errors.redes?.[i]
            return (
              <FilaLista
                key={campo.id}
                numero={i + 1}
                total={fields.length}
                nombre={`la red ${i + 1}`}
                alSubir={() => move(i, i - 1)}
                alBajar={() => move(i, i + 1)}
                alQuitar={() => remove(i)}
              >
                <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
                  <Campo id={`redes.${i}.red`} etiqueta="Red" error={error?.red?.message}>
                    <select
                      id={`redes.${i}.red`}
                      aria-describedby={`redes.${i}.red-info`}
                      aria-invalid={!!error?.red}
                      className={CLASE_ENTRADA}
                      {...register(`redes.${i}.red`)}
                    >
                      {REDES.map((red) => (
                        <option key={red} value={red} disabled={red !== elegidas[i]?.red && elegidas.some((fila) => fila.red === red)}>
                          {NOMBRE_RED[red]}
                        </option>
                      ))}
                    </select>
                  </Campo>
                  <Campo id={`redes.${i}.url`} etiqueta="Enlace de la página" error={error?.url?.message}>
                    <input
                      id={`redes.${i}.url`}
                      inputMode="url"
                      placeholder="https://..."
                      aria-describedby={`redes.${i}.url-info`}
                      aria-invalid={!!error?.url}
                      className={CLASE_ENTRADA}
                      {...register(`redes.${i}.url`)}
                    />
                  </Campo>
                </div>
              </FilaLista>
            )
          })}
        </ol>

        {editable && (
          <>
            <Boton
              type="button"
              variante="borde"
              disabled={!libre}
              onClick={() => libre && append({ red: libre, url: '' })}
              className="flex items-center gap-2 text-sm"
            >
              <IconoAgregar width={16} height={16} />
              Agregar red
              <span className="font-normal text-texto-suave">
                ({fields.length} de {REDES.length})
              </span>
            </Boton>
            <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
          </>
        )}
      </fieldset>
    </form>
  )
}
