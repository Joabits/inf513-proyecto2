import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { BarraGuardar } from '@/compartido/ui/BarraGuardar'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { FilaLista } from '@/compartido/ui/FilaLista'
import { IconoAgregar } from '@/compartido/ui/Iconos'
import { guardarServicios } from '../api'
import { esquemaServicios, MAXIMO_SERVICIOS, type DatosServicios } from '../innova.esquema'
import type { ServicioInnova } from '../tipos'
import { useGuardarInnova } from '../useInnova'

type CampoServicio = 'nombre' | 'descripcion'

const aFormulario = (servicios: ServicioInnova[]): DatosServicios => ({
  servicios: servicios.map(({ nombre, descripcion }) => ({ nombre, descripcion })),
})

export function FormServicios({ servicios }: { servicios: ServicioInnova[] }) {
  const guardar = useGuardarInnova(guardarServicios)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<DatosServicios>({ resolver: zodResolver(esquemaServicios), defaultValues: aFormulario(servicios) })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'servicios' })

  const enviar = (datos: DatosServicios) =>
    guardar.mutate(datos, { onSuccess: (info) => reset(aFormulario(info.servicios)), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (i: number, campo: CampoServicio) => ({
    id: `servicios.${i}.${campo}`,
    'aria-describedby': `servicios.${i}.${campo}-info`,
    'aria-invalid': !!errors.servicios?.[i]?.[campo],
    className: CLASE_ENTRADA,
    ...register(`servicios.${i}.${campo}`),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-titulo">Servicios</h2>
        <p className="text-sm text-texto-suave">
          Se muestran como tarjetas en la página de INNOVA y como opciones del formulario de solicitud. Las solicitudes ya recibidas
          conservan el nombre del servicio que pidieron.
        </p>
      </div>

      {fields.length === 0 && (
        <p className="p-6 text-center text-sm text-texto-suave">
          No hay servicios: el formulario solo ofrecerá «Otro / no estoy seguro».
        </p>
      )}

      <ol className="space-y-3">
        {fields.map((campo, i) => {
          const error = errors.servicios?.[i]
          return (
            <FilaLista
              key={campo.id}
              numero={i + 1}
              total={fields.length}
              nombre={`el servicio ${i + 1}`}
              alSubir={() => move(i, i - 1)}
              alBajar={() => move(i, i + 1)}
              alQuitar={() => remove(i)}
            >
              <div className="grid gap-3">
                <Campo id={`servicios.${i}.nombre`} etiqueta="Nombre" error={error?.nombre?.message}>
                  <input {...entrada(i, 'nombre')} />
                </Campo>
                <Campo id={`servicios.${i}.descripcion`} etiqueta="Descripción" error={error?.descripcion?.message}>
                  <textarea rows={2} {...entrada(i, 'descripcion')} />
                </Campo>
              </div>
            </FilaLista>
          )
        })}
      </ol>

      <Boton
        type="button"
        variante="borde"
        disabled={fields.length >= MAXIMO_SERVICIOS}
        onClick={() => append({ nombre: '', descripcion: '' })}
        className="flex items-center gap-2 text-sm"
      >
        <IconoAgregar width={16} height={16} />
        Agregar servicio
        <span className="font-normal text-texto-suave">
          ({fields.length} de {MAXIMO_SERVICIOS})
        </span>
      </Boton>

      <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
    </form>
  )
}
