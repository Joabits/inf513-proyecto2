import type { ReactNode } from 'react'
import { NOMBRE_RED } from '@/compartido/configuracion/tipos'
import { enlaceTelefono, enlaceWhatsapp, formatoWhatsapp, useConfiguracion } from '@/compartido/configuracion/useConfiguracion'
import { IconoCorreo, IconoExterno, IconoHorario, IconoMensaje, IconoTelefono, IconoUbicacion } from '@/compartido/ui/Iconos'

const ENLACE = 'font-semibold text-titulo underline-offset-4 hover:text-acento hover:underline'

function Dato({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-superficie text-titulo" aria-hidden="true">
        {icono}
      </span>
      <div className="min-w-0">
        <dt className="text-sm font-bold uppercase tracking-wider text-titulo">{titulo}</dt>
        <dd className="mt-1 break-words text-texto">{children}</dd>
      </div>
    </div>
  )
}

/** Datos que configura el personal en «Datos de contacto y enlaces» (CU-28). */
export function DatosDeContacto() {
  const { data } = useConfiguracion()
  const contacto = data?.contacto
  const redes = data?.redes ?? []

  if (!contacto) return null

  return (
    <div className="space-y-8">
      <dl className="space-y-6">
        <Dato icono={<IconoUbicacion />} titulo="Dirección">
          <p>{contacto.direccion}</p>
          <p className="text-texto-suave">{[contacto.referencia, contacto.ciudad].filter(Boolean).join(' · ')}</p>
          {contacto.mapa_url && (
            <a href={contacto.mapa_url} target="_blank" rel="noopener noreferrer" className={`mt-2 inline-flex items-center gap-1.5 ${ENLACE}`}>
              Cómo llegar <IconoExterno width={16} height={16} />
            </a>
          )}
        </Dato>
        {contacto.telefono && (
          <Dato icono={<IconoTelefono />} titulo="Teléfono">
            <a href={enlaceTelefono(contacto.telefono)} className={ENLACE}>
              {contacto.telefono}
            </a>
          </Dato>
        )}
        {contacto.whatsapp && (
          <Dato icono={<IconoMensaje />} titulo="WhatsApp">
            <a href={enlaceWhatsapp(contacto.whatsapp)} target="_blank" rel="noopener noreferrer" className={ENLACE}>
              {formatoWhatsapp(contacto.whatsapp)}
            </a>
          </Dato>
        )}
        {contacto.correo && (
          <Dato icono={<IconoCorreo />} titulo="Correo electrónico">
            <a href={`mailto:${contacto.correo}`} className={`${ENLACE} break-all`}>
              {contacto.correo}
            </a>
          </Dato>
        )}
        {contacto.horario && (
          <Dato icono={<IconoHorario />} titulo="Horario de atención">
            {contacto.horario}
          </Dato>
        )}
      </dl>

      {redes.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-titulo">Síganos</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {redes.map(({ red, url }) => (
              <li key={red}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-borde px-4 py-1.5 text-sm font-semibold text-titulo transition-colors hover:border-primario hover:text-acento"
                >
                  {NOMBRE_RED[red]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
