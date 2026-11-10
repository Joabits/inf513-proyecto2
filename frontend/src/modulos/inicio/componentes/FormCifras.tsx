import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { IconoAgregar } from '@/compartido/ui/Iconos'
import { guardarCifras } from '../api'
import { esquemaCifras, MAXIMO_FILAS, type DatosCifras } from '../inicio.esquema'
import type { Cifra } from '../tipos'
import { useGuardarInicio } from '../useInicio'
import { BarraGuardar } from './BarraGuardar'
import { FilaLista } from './FilaLista'

export function FormCifras({ cifras }: { cifras: Cifra[] }) {
  const guardar = useGuardarInicio(guardarCifras)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosCifras>({ resolver: zodResolver(esquemaCifras), defaultValues: { cifras } })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'cifras' })

  const enviar = (datos: DatosCifras) =>
    guardar.mutate(datos, { onSuccess: () => reset(datos), onError: (e) => aplicarErrores(e, setError) })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5 rounded-tema border border-borde bg-fondo p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-titulo">Cifras de la Carrera</h2>
        <p className="text-sm text-texto-suave">Se muestran junto a la presentación. Publique solo datos confirmados por la Carrera.</p>
      </div>

      {fields.length === 0 && (
        <p className="rounded-tema border border-dashed border-borde p-6 text-center text-sm text-texto-suave">
          No hay cifras: la presentación ocupará todo el ancho.
        </p>
      )}

      <ol className="space-y-3">
        {fields.map((campo, i) => {
          const error = errors.cifras?.[i]
          return (
            <FilaLista
              key={campo.id}
              numero={i + 1}
              total={fields.length}
              nombre={`la cifra ${i + 1}`}
              alSubir={() => move(i, i - 1)}
              alBajar={() => move(i, i + 1)}
              alQuitar={() => remove(i)}
            >
              <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                <Campo id={`cifras.${i}.valor`} etiqueta="Valor" error={error?.valor?.message}>
                  <input
                    id={`cifras.${i}.valor`}
                    aria-describedby={`cifras.${i}.valor-info`}
                    aria-invalid={!!error?.valor}
                    className={CLASE_ENTRADA}
                    {...register(`cifras.${i}.valor`)}
                  />
                </Campo>
                <Campo id={`cifras.${i}.etiqueta`} etiqueta="Descripción" error={error?.etiqueta?.message}>
                  <input
                    id={`cifras.${i}.etiqueta`}
                    aria-describedby={`cifras.${i}.etiqueta-info`}
                    aria-invalid={!!error?.etiqueta}
                    className={CLASE_ENTRADA}
                    {...register(`cifras.${i}.etiqueta`)}
                  />
                </Campo>
              </div>
            </FilaLista>
          )
        })}
      </ol>

      <Boton
        type="button"
        variante="borde"
        disabled={fields.length >= MAXIMO_FILAS}
        onClick={() => append({ valor: '', etiqueta: '' })}
        className="flex items-center gap-2 text-sm"
      >
        <IconoAgregar width={16} height={16} />
        Agregar cifra
        <span className="font-normal text-texto-suave">
          ({fields.length} de {MAXIMO_FILAS})
        </span>
      </Boton>

      <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
    </form>
  )
}
