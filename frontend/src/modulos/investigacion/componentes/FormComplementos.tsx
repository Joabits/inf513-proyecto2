import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { BarraGuardar } from '@/compartido/ui/BarraGuardar'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { FilaLista } from '@/compartido/ui/FilaLista'
import { IconoAgregar } from '@/compartido/ui/Iconos'
import { esquemaComplementos, MAXIMO_SEMILLEROS, type DatosComplementos } from '../investigacion.esquema'
import type { Complementos } from '../tipos'
import { useGuardarComplementos } from '../useInvestigacion'

const SECCION = 'space-y-5 rounded-tema border border-borde bg-fondo p-5 sm:p-6 [&>legend+*]:clear-both'
const LEYENDA = 'float-left mb-1 w-full text-lg font-bold text-titulo'

type CampoTexto = Exclude<keyof DatosComplementos, 'semilleros'>

const aFormulario = ({ contenido, semilleros }: Complementos): DatosComplementos => ({
  semilleros_presentacion: contenido?.semilleros_presentacion ?? '',
  semilleros_mision: contenido?.semilleros_mision ?? '',
  semilleros_vision: contenido?.semilleros_vision ?? '',
  semilleros_objetivos: contenido?.semilleros_objetivos ?? '',
  semilleros_coordinador: contenido?.semilleros_coordinador ?? '',
  pia_presentacion: contenido?.pia_presentacion ?? '',
  instituto: contenido?.instituto ?? '',
  semilleros: semilleros.map(({ nombre, descripcion }) => ({ nombre, descripcion: descripcion ?? '' })),
})

/** Semilleros de investigación, Proyectos de Investigación en Aula (PIA) e instituto vinculado. */
export function FormComplementos({ complementos }: { complementos: Complementos }) {
  const guardar = useGuardarComplementos()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosComplementos>({ resolver: zodResolver(esquemaComplementos), defaultValues: aFormulario(complementos) })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'semilleros' })

  const enviar = (datos: DatosComplementos) =>
    guardar.mutate(datos, { onSuccess: (nuevos) => reset(aFormulario(nuevos)), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (campo: CampoTexto) => ({
    id: campo,
    'aria-describedby': `${campo}-info`,
    'aria-invalid': !!errors[campo],
    className: CLASE_ENTRADA,
    ...register(campo),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-6">
      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Semilleros de investigación</legend>
        <Campo id="semilleros_presentacion" etiqueta="Presentación" opcional error={errors.semilleros_presentacion?.message}>
          <textarea rows={5} {...entrada('semilleros_presentacion')} />
        </Campo>
        <div className="grid gap-5 lg:grid-cols-2">
          <Campo id="semilleros_mision" etiqueta="Misión" opcional error={errors.semilleros_mision?.message}>
            <textarea rows={4} {...entrada('semilleros_mision')} />
          </Campo>
          <Campo id="semilleros_vision" etiqueta="Visión" opcional error={errors.semilleros_vision?.message}>
            <textarea rows={4} {...entrada('semilleros_vision')} />
          </Campo>
        </div>
        <Campo id="semilleros_objetivos" etiqueta="Objetivos" opcional ayuda="Escriba un objetivo por línea." error={errors.semilleros_objetivos?.message}>
          <textarea rows={5} {...entrada('semilleros_objetivos')} />
        </Campo>
        <Campo id="semilleros_coordinador" etiqueta="Coordinador de semilleros" opcional error={errors.semilleros_coordinador?.message}>
          <input {...entrada('semilleros_coordinador')} />
        </Campo>

        <div>
          <p className="text-sm font-semibold text-titulo">Áreas de los semilleros</p>
          <ol className="mt-2 space-y-3">
            {fields.map((campo, i) => {
              const error = errors.semilleros?.[i]
              return (
                <FilaLista
                  key={campo.id}
                  numero={i + 1}
                  total={fields.length}
                  nombre={`el semillero ${i + 1}`}
                  alSubir={() => move(i, i - 1)}
                  alBajar={() => move(i, i + 1)}
                  alQuitar={() => remove(i)}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Campo id={`semilleros.${i}.nombre`} etiqueta="Nombre" error={error?.nombre?.message}>
                      <input
                        id={`semilleros.${i}.nombre`}
                        aria-describedby={`semilleros.${i}.nombre-info`}
                        aria-invalid={!!error?.nombre}
                        className={CLASE_ENTRADA}
                        {...register(`semilleros.${i}.nombre`)}
                      />
                    </Campo>
                    <Campo id={`semilleros.${i}.descripcion`} etiqueta="Descripción" opcional error={error?.descripcion?.message}>
                      <input
                        id={`semilleros.${i}.descripcion`}
                        aria-describedby={`semilleros.${i}.descripcion-info`}
                        aria-invalid={!!error?.descripcion}
                        className={CLASE_ENTRADA}
                        {...register(`semilleros.${i}.descripcion`)}
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
            disabled={fields.length >= MAXIMO_SEMILLEROS}
            onClick={() => append({ nombre: '', descripcion: '' })}
            className="mt-3 flex items-center gap-2 text-sm"
          >
            <IconoAgregar width={16} height={16} />
            Agregar semillero
            <span className="font-normal text-texto-suave">
              ({fields.length} de {MAXIMO_SEMILLEROS})
            </span>
          </Boton>
        </div>
      </fieldset>

      <fieldset className={SECCION}>
        <legend className={LEYENDA}>Proyectos de Investigación en Aula (PIA) e instituto</legend>
        <Campo id="pia_presentacion" etiqueta="¿Qué son los PIA?" opcional error={errors.pia_presentacion?.message}>
          <textarea rows={5} {...entrada('pia_presentacion')} />
        </Campo>
        <Campo id="instituto" etiqueta="Instituto vinculado" opcional error={errors.instituto?.message}>
          <textarea rows={2} {...entrada('instituto')} />
        </Campo>

        <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
      </fieldset>
    </form>
  )
}
