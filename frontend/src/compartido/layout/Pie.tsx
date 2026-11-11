import type { ReactNode } from 'react'
import { EnlaceConfigurable } from '@/compartido/configuracion/EnlaceConfigurable'
import { NOMBRE_RED } from '@/compartido/configuracion/tipos'
import { enlaceTelefono, enlaceWhatsapp, formatoWhatsapp, useConfiguracion } from '@/compartido/configuracion/useConfiguracion'
import { LogoFcee } from '@/compartido/marca/LogoFcee'
import { useTema } from '@/compartido/tema/contexto'
import { IconoCorreo, IconoHorario, IconoMensaje, IconoSiguiente, IconoTelefono, IconoUbicacion, IconoVer } from '@/compartido/ui/Iconos'
import { useContadorVisitas } from '@/compartido/visitas/useContadorVisitas'

const ANIO = new Date().getFullYear()

const ENLACE = 'text-texto-suave underline-offset-4 transition-colors hover:text-acento hover:underline'
const TITULO = 'text-sm font-bold uppercase tracking-wider text-titulo'

function Dato({ icono, children }: { icono: ReactNode; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-acento" aria-hidden="true">
        {icono}
      </span>
      <div className="min-w-0">{children}</div>
    </li>
  )
}

/** Contador de visitas de la página actual (req. 7): va en el pie de todas las plantillas. */
export function ContadorVisitas() {
  const visitas = useContadorVisitas()

  return (
    <p aria-live="polite" className="inline-flex items-center gap-1.5">
      <IconoVer width={14} height={14} aria-hidden="true" />
      Visitas a esta página:{' '}
      <strong className="text-sm text-titulo">{visitas === null ? '—' : visitas.toLocaleString('es-BO')}</strong>
    </p>
  )
}

/**
 * Pie del portal con el logo, el contacto, los enlaces y el contador de visitas.
 * Usa el mismo fondo que la página (claro u oscuro según el modo), sin líneas divisorias.
 * Los datos de contacto, las redes y los enlaces se editan en el panel (CU-28).
 */
export function Pie() {
  const { modoActivo } = useTema()
  const { data: configuracion } = useConfiguracion()
  const contacto = configuracion?.contacto
  const redes = configuracion?.redes ?? []
  const enlaces = configuracion?.enlaces ?? []

  return (
    <footer className="mt-auto bg-fondo text-texto">
      <div className="contenedor grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <LogoFcee version={modoActivo === 'oscuro' ? 'negativo' : 'positivo'} className="h-14 sm:h-16" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-texto-suave">
            Carrera de Administración de Empresas. Formamos profesionales para gerenciar y liderar organizaciones.
            Acreditada ante el CEUB.
          </p>
          {redes.length > 0 && (
            <ul aria-label="Redes sociales" className="mt-6 flex flex-wrap gap-2">
              {redes.map(({ red, url }) => (
                <li key={red}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full border border-borde px-3 py-1 text-xs font-semibold text-titulo transition-colors hover:border-primario hover:text-acento"
                  >
                    {NOMBRE_RED[red]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {contacto && (
          <div>
            <h2 className={TITULO}>Contacto</h2>
            <address className="not-italic">
              <ul className="mt-5 space-y-3 text-sm text-texto-suave">
                <Dato icono={<IconoUbicacion width={18} height={18} />}>
                  <p>{contacto.direccion}</p>
                  <p>{[contacto.referencia, contacto.ciudad].filter(Boolean).join(' · ')}</p>
                </Dato>
                {contacto.telefono && (
                  <Dato icono={<IconoTelefono width={18} height={18} />}>
                    <a href={enlaceTelefono(contacto.telefono)} className={ENLACE}>
                      {contacto.telefono}
                    </a>
                  </Dato>
                )}
                {contacto.whatsapp && (
                  <Dato icono={<IconoMensaje width={18} height={18} />}>
                    <a href={enlaceWhatsapp(contacto.whatsapp)} target="_blank" rel="noopener noreferrer" className={ENLACE}>
                      WhatsApp {formatoWhatsapp(contacto.whatsapp)}
                    </a>
                  </Dato>
                )}
                {contacto.correo && (
                  <Dato icono={<IconoCorreo width={18} height={18} />}>
                    <a href={`mailto:${contacto.correo}`} className={`${ENLACE} break-all`}>
                      {contacto.correo}
                    </a>
                  </Dato>
                )}
                {contacto.horario && <Dato icono={<IconoHorario width={18} height={18} />}>{contacto.horario}</Dato>}
              </ul>
            </address>
          </div>
        )}

        {enlaces.length > 0 && (
          <div>
            <h2 className={TITULO}>Enlaces</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {enlaces.map((enlace) => (
                <li key={`${enlace.titulo}-${enlace.url}`} className="flex items-center gap-2">
                  <IconoSiguiente width={14} height={14} aria-hidden="true" className="shrink-0 text-acento" />
                  <EnlaceConfigurable url={enlace.url} className={ENLACE}>
                    {enlace.titulo}
                  </EnlaceConfigurable>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="contenedor flex flex-col gap-2 pb-8 text-xs text-texto-suave sm:flex-row sm:items-center sm:justify-between">
        <p>© {ANIO} Carrera de Administración de Empresas · FCEE · UAGRM</p>
        <ContadorVisitas />
      </div>
    </footer>
  )
}

/** Pie corto del panel y de la pantalla de ingreso: derechos y contador de visitas. */
export function PieSimple() {
  return (
    <footer className="mt-auto">
      <div className="flex flex-col gap-2 px-4 py-4 text-xs text-texto-suave sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>© {ANIO} Carrera de Administración de Empresas · FCEE · UAGRM</p>
        <ContadorVisitas />
      </div>
    </footer>
  )
}
