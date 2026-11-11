import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import type { DatosContacto } from '@/compartido/configuracion/tipos'
import { BarraGuardar } from '@/compartido/ui/BarraGuardar'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { actualizarContacto } from '../api'
import { esquemaContacto, type DatosContactoForm } from '../configuracion.esquema'
import { useGuardarConfiguracion } from '../useGuardarConfiguracion'

// La leyenda flota para quedar dentro del recuadro y no cortar su borde superior
const SECCION = 'space-y-5 rounded-tema border border-borde bg-fondo p-5 sm:p-6 [&>legend+*]:clear-both'
const LEYENDA = 'float-left mb-1 w-full text-lg font-bold text-titulo'

const valoresDe = (contacto: DatosContacto | null): DatosContactoForm => ({
  direccion: contacto?.direccion ?? '',
  referencia: contacto?.referencia ?? '',
  ciudad: contacto?.ciudad ?? '',
  telefono: contacto?.telefono ?? '',
  whatsapp: contacto?.whatsapp ?? '',
  correo: contacto?.correo ?? '',
  horario: contacto?.horario ?? '',
  mapa_url: contacto?.mapa_url ?? '',
})

export function FormContacto({ contacto, editable }: { contacto: DatosContacto | null; editable: boolean }) {
  const guardar = useGuardarConfiguracion(actualizarContacto)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<DatosContactoForm>({ resolver: zodResolver(esquemaContacto), defaultValues: valoresDe(contacto) })

  // Tras guardar, el formulario toma lo que quedó en la BD (por ejemplo, el WhatsApp solo con números)
  const enviar = (datos: DatosContactoForm) =>
    guardar.mutate(datos, { onSuccess: (nueva) => reset(valoresDe(nueva.contacto)), onError: (e) => aplicarErrores(e, setError) })

  const entrada = (campo: keyof DatosContactoForm) => ({
    id: campo,
    'aria-describedby': `${campo}-info`,
    'aria-invalid': !!errors[campo],
    className: CLASE_ENTRADA,
    ...register(campo),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate>
      <fieldset disabled={!editable} className="space-y-6">
        <fieldset className={SECCION}>
          <legend className={LEYENDA}>Ubicación</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo id="direccion" etiqueta="Dirección" error={errors.direccion?.message}>
              <input placeholder="Av. Busch, Ciudad Universitaria" {...entrada('direccion')} />
            </Campo>
            <Campo id="referencia" etiqueta="Referencia" opcional ayuda="Edificio, módulo o planta." error={errors.referencia?.message}>
              <input placeholder="Módulo 255" {...entrada('referencia')} />
            </Campo>
          </div>
          <Campo id="ciudad" etiqueta="Ciudad" error={errors.ciudad?.message}>
            <input placeholder="Santa Cruz de la Sierra, Bolivia" {...entrada('ciudad')} />
          </Campo>
          <Campo
            id="mapa_url"
            etiqueta="Enlace del mapa"
            opcional
            ayuda="En Google Maps use «Compartir» y copie el enlace. La página de contacto mostrará el botón «Cómo llegar»."
            error={errors.mapa_url?.message}
          >
            <input inputMode="url" placeholder="https://maps.app.goo.gl/..." {...entrada('mapa_url')} />
          </Campo>
        </fieldset>

        <fieldset className={SECCION}>
          <legend className={LEYENDA}>Atención</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo id="telefono" etiqueta="Teléfono" opcional error={errors.telefono?.message}>
              <input type="tel" placeholder="+591 3 355-0000" {...entrada('telefono')} />
            </Campo>
            <Campo id="whatsapp" etiqueta="WhatsApp" opcional ayuda="Con el código de país: 591 y el número." error={errors.whatsapp?.message}>
              <input type="tel" placeholder="591 70000000" {...entrada('whatsapp')} />
            </Campo>
          </div>
          <Campo id="correo" etiqueta="Correo electrónico" opcional error={errors.correo?.message}>
            <input type="email" placeholder="carrera@uagrm.edu.bo" {...entrada('correo')} />
          </Campo>
          <Campo id="horario" etiqueta="Horario de atención" opcional error={errors.horario?.message}>
            <input placeholder="Lunes a viernes de 8:00 a 12:00 y de 14:30 a 18:30" {...entrada('horario')} />
          </Campo>

          {editable && (
            <BarraGuardar sucio={isDirty} guardando={guardar.isPending} guardado={guardar.isSuccess && !isDirty} error={errors.root?.message} />
          )}
        </fieldset>
      </fieldset>
    </form>
  )
}
