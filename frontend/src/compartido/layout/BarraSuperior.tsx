import { enlaceTelefono, useConfiguracion } from '@/compartido/configuracion/useConfiguracion'
import { useSesion } from '@/compartido/sesion/useSesion'
import { IconoCorreo, IconoTelefono } from '@/compartido/ui/Iconos'

const ENLACE = 'inline-flex items-center gap-1.5 underline-offset-4 hover:underline'

/**
 * Franja azul oscuro sobre la cabecera, solo en PC y para visitantes:
 * universidad, teléfono y correo (de CU-28). Con sesión iniciada se muestra AvisoPanel en su lugar.
 * A propósito NO enlaza a la pantalla de ingreso: el personal entra escribiendo /gestion en la barra de direcciones.
 */
export function BarraSuperior() {
  const { data: usuario, isPending } = useSesion()
  const { data: configuracion } = useConfiguracion()
  const contacto = configuracion?.contacto

  if (isPending || usuario) return null

  return (
    <div className="hidden bg-marino-oscuro text-sobre-marino lg:block">
      <div className="contenedor flex h-10 items-center justify-between gap-6 text-xs">
        <p className="truncate text-sobre-marino-suave">
          Universidad Autónoma Gabriel René Moreno · Facultad de Ciencias Económicas y Empresariales
        </p>
        <ul className="flex shrink-0 items-center gap-5">
          {contacto?.telefono && (
            <li>
              <a href={enlaceTelefono(contacto.telefono)} className={ENLACE}>
                <IconoTelefono width={14} height={14} aria-hidden="true" /> {contacto.telefono}
              </a>
            </li>
          )}
          {contacto?.correo && (
            <li>
              <a href={`mailto:${contacto.correo}`} className={ENLACE}>
                <IconoCorreo width={14} height={14} aria-hidden="true" /> {contacto.correo}
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
