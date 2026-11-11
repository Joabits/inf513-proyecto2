import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import type { Enlace } from '@/compartido/configuracion/tipos'
import { BarraGuardar } from '@/compartido/ui/BarraGuardar'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { FilaLista } from '@/compartido/ui/FilaLista'
import { IconoAgregar } from '@/compartido/ui/Iconos'
import { guardarEnlaces } from '../api'
import { esquemaEnlaces, MAXIMO_ENLACES, type DatosEnlaces } from '../configuracion.esquema'
import { useGuardarConfiguracion } from '../useGuardarConfiguracion'

type CampoEnlace = 'titulo' | 'url'

export function FormEnlaces({ enlaces, editable }: { enlaces: Enlace[]; editable: boolean }) {
  const guardar = useGuardarConfiguracion(guardarEnlaces)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosEnlaces>({ resolver: zodResolver(esquemaEnlaces), defaultValues: { enlaces } })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'enlaces' })

  const enviar = (datos: DatosEnlaces) =>
    guardar.mutate(datos, { onSuccess: () => reset(datos), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (i: number, campo: CampoEnlace) => ({
    id: `enlaces.${i}.${campo}`,
    'aria-describedby': `enlaces.${i}.${campo}-info`,
    'aria-invalid': !!errors.enlaces?.[i]?.[campo],
    className: CLASE_ENTRADA,
    ...register(`enlaces.${i}.${campo}`),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate>
      <fieldset disabled={!editable} className="space-y-5 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-titulo">Enlaces de interés</h2>
          <p className="text-sm text-texto-suave">Columna «Enlaces» del pie de página: sitios de la Universidad o páginas del portal.</p>
        </div>

        {fields.length === 0 && (
          <p className="p-6 text-center text-sm text-texto-suave">
            No hay enlaces: la columna no se mostrará.
          </p>
        )}

        <ol className="space-y-3">
          {fields.map((campo, i) => {
            const error = errors.enlaces?.[i]
            return (
              <FilaLista
                key={campo.id}
                numero={i + 1}
                total={fields.length}
                nombre={`el enlace ${i + 1}`}
                alSubir={() => move(i, i - 1)}
                alBajar={() => move(i, i + 1)}
                alQuitar={() => remove(i)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo id={`enlaces.${i}.titulo`} etiqueta="Título" error={error?.titulo?.message}>
                    <input {...entrada(i, 'titulo')} />
                  </Campo>
                  <Campo
                    id={`enlaces.${i}.url`}
                    etiqueta="Enlace"
                    ayuda="Página del portal (/documentos) o sitio externo (https://...)."
                    error={error?.url?.message}
                  >
                    <input inputMode="url" {...entrada(i, 'url')} />
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
              disabled={fields.length >= MAXIMO_ENLACES}
              onClick={() => append({ titulo: '', url: 'https://' })}
              className="flex items-center gap-2 text-sm"
            >
              <IconoAgregar width={16} height={16} />
              Agregar enlace
              <span className="font-normal text-texto-suave">
                ({fields.length} de {MAXIMO_ENLACES})
              </span>
            </Boton>
            <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
          </>
        )}
      </fieldset>
    </form>
  )
}
