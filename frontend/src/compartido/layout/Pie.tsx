import { EnlaceConfigurable } from '@/compartido/configuracion/EnlaceConfigurable'
import { NOMBRE_RED } from '@/compartido/configuracion/tipos'
import { enlaceTelefono, enlaceWhatsapp, useConfiguracion } from '@/compartido/configuracion/useConfiguracion'
import { LogoFcee } from '@/compartido/marca/LogoFcee'
import { useTema } from '@/compartido/tema/contexto'
import { useContadorVisitas } from '@/compartido/visitas/useContadorVisitas'

const ANIO = new Date().getFullYear()

const ENLACE = 'text-texto-suave underline-offset-4 hover:text-acento hover:underline'

/**
 * Pie de todas las páginas, con el contador de visitas (req. 7).
 * Usa los colores del tema: blanco de día y azul oscuro de noche.
 * Los datos de contacto, las redes y los enlaces se editan en el panel (CU-28).
 */
export function Pie() {
  const visitas = useContadorVisitas()
  const { modoActivo } = useTema()
  const { data: configuracion } = useConfiguracion()
  const contacto = configuracion?.contacto
  const redes = configuracion?.redes ?? []
  const enlaces = configuracion?.enlaces ?? []

  return (
    <footer className="mt-auto border-t border-borde bg-fondo text-texto">
      <div className="contenedor grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <LogoFcee version={modoActivo === 'oscuro' ? 'negativo' : 'positivo'} className="h-14 sm:h-16" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-texto-suave">
            Carrera de Administración de Empresas. Formamos profesionales para gerenciar y liderar organizaciones.
            Acreditada ante el CEUB.
          </p>
          {redes.length > 0 && (
            <ul aria-label="Redes sociales" className="mt-5 flex flex-wrap gap-2">
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
            <h2 className="text-sm font-bold uppercase tracking-wider text-titulo">Contacto</h2>
            <address className="mt-4 space-y-1 text-sm not-italic text-texto-suave">
              <p>{contacto.direccion}</p>
              <p>{[contacto.referencia, contacto.ciudad].filter(Boolean).join(' · ')}</p>
              {contacto.telefono && (
                <p>
                  Teléfono:{' '}
                  <a href={enlaceTelefono(contacto.telefono)} className={ENLACE}>
                    {contacto.telefono}
                  </a>
                </p>
              )}
              {contacto.whatsapp && (
                <p>
                  WhatsApp:{' '}
                  <a href={enlaceWhatsapp(contacto.whatsapp)} target="_blank" rel="noopener noreferrer" className={ENLACE}>
                    +{contacto.whatsapp}
                  </a>
                </p>
              )}
              {contacto.correo && (
                <p>
                  <a href={`mailto:${contacto.correo}`} className={`${ENLACE} break-all`}>
                    {contacto.correo}
                  </a>
                </p>
              )}
              {contacto.horario && <p>{contacto.horario}</p>}
            </address>
          </div>
        )}

        {enlaces.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-titulo">Enlaces</h2>
            <ul className="mt-4 space-y-1 text-sm">
              {enlaces.map((enlace) => (
                <li key={`${enlace.titulo}-${enlace.url}`}>
                  <EnlaceConfigurable url={enlace.url} className={ENLACE}>
                    {enlace.titulo}
                  </EnlaceConfigurable>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-borde">
        <div className="contenedor flex flex-col gap-2 py-4 text-xs text-texto-suave sm:flex-row sm:items-center sm:justify-between">
          <p>© {ANIO} Carrera de Administración de Empresas · FCEE · UAGRM</p>
          <p aria-live="polite">
            Visitas a esta página:{' '}
            <strong className="text-sm text-titulo">{visitas === null ? '—' : visitas.toLocaleString('es-BO')}</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}
