import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { IconoAgregar } from '@/compartido/ui/Iconos'
import { guardarAccesos } from '../api'
import { esquemaAccesos, MAXIMO_FILAS, type DatosAccesos } from '../inicio.esquema'
import type { Acceso } from '../tipos'
import { useGuardarInicio } from '../useInicio'
import { BarraGuardar } from './BarraGuardar'
import { FilaLista } from './FilaLista'

type CampoAcceso = 'titulo' | 'descripcion' | 'ruta'

export function FormAccesos({ accesos }: { accesos: Acceso[] }) {
  const guardar = useGuardarInicio(guardarAccesos)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosAccesos>({ resolver: zodResolver(esquemaAccesos), defaultValues: { accesos } })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'accesos' })

  const enviar = (datos: DatosAccesos) =>
    guardar.mutate(datos, { onSuccess: () => reset(datos), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (i: number, campo: CampoAcceso) => ({
    id: `accesos.${i}.${campo}`,
    'aria-describedby': `accesos.${i}.${campo}-info`,
    'aria-invalid': !!errors.accesos?.[i]?.[campo],
    className: CLASE_ENTRADA,
    ...register(`accesos.${i}.${campo}`),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5 rounded-tema border border-borde bg-fondo p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-titulo">Accesos rápidos</h2>
        <p className="text-sm text-texto-suave">Tarjetas de «Explora la Carrera». Se recomiendan cuatro, una por columna.</p>
      </div>

      {fields.length === 0 && (
        <p className="rounded-tema border border-dashed border-borde p-6 text-center text-sm text-texto-suave">
          No hay accesos rápidos: la sección no se mostrará.
        </p>
      )}

      <ol className="space-y-3">
        {fields.map((campo, i) => {
          const error = errors.accesos?.[i]
          return (
            <FilaLista
              key={campo.id}
              numero={i + 1}
              total={fields.length}
              nombre={`el acceso ${i + 1}`}
              alSubir={() => move(i, i - 1)}
              alBajar={() => move(i, i + 1)}
              alQuitar={() => remove(i)}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo id={`accesos.${i}.titulo`} etiqueta="Título" error={error?.titulo?.message}>
                  <input {...entrada(i, 'titulo')} />
                </Campo>
                <Campo
                  id={`accesos.${i}.ruta`}
                  etiqueta="Enlace"
                  ayuda="Página del portal (/investigacion) o sitio externo (https://...)."
                  error={error?.ruta?.message}
                >
                  <input inputMode="url" {...entrada(i, 'ruta')} />
                </Campo>
                <div className="sm:col-span-2">
                  <Campo id={`accesos.${i}.descripcion`} etiqueta="Descripción" error={error?.descripcion?.message}>
                    <input {...entrada(i, 'descripcion')} />
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
        disabled={fields.length >= MAXIMO_FILAS}
        onClick={() => append({ titulo: '', descripcion: '', ruta: '/' })}
        className="flex items-center gap-2 text-sm"
      >
        <IconoAgregar width={16} height={16} />
        Agregar acceso
        <span className="font-normal text-texto-suave">
          ({fields.length} de {MAXIMO_FILAS})
        </span>
      </Boton>

      <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
    </form>
  )
}
