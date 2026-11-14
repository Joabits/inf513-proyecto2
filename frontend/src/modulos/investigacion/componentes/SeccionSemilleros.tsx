import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { IconoCorrecto, IconoObjetivo, IconoUsuario, IconoVision } from '@/compartido/ui/Iconos'
import { parrafos, renglones } from '../formato'
import type { ContenidoInvestigacion, Semillero } from '../tipos'

const ANTETITULO = 'text-sm font-bold uppercase tracking-widest text-acento'

function Parrafos({ texto, className = '' }: { texto: string; className?: string }) {
  return (
    <div className={`space-y-4 leading-relaxed text-texto ${className}`}>
      {parrafos(texto).map((parrafo, i) => (
        // Texto fijo que no se reordena: la posición sirve como clave
        <p key={i}>{parrafo}</p>
      ))}
    </div>
  )
}

/** Semilleros de investigación: qué son, misión, visión, objetivos, coordinación y cuáles hay. */
export function SeccionSemilleros({ contenido, semilleros }: { contenido: ContenidoInvestigacion | null; semilleros: Semillero[] }) {
  const objetivos = contenido?.semilleros_objetivos ? renglones(contenido.semilleros_objetivos) : []

  return (
    <section id="semilleros" aria-labelledby="titulo-semilleros" className="scroll-mt-28">
      <p className={ANTETITULO}>Formación en investigación</p>
      <h2 id="titulo-semilleros" className="mt-2 text-3xl text-titulo">
        Semilleros de investigación
      </h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div>
          {contenido?.semilleros_presentacion && <Parrafos texto={contenido.semilleros_presentacion} className="text-lg" />}

          {(contenido?.semilleros_mision || contenido?.semilleros_vision) && (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {contenido.semilleros_mision && (
                <article className="rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave">
                  <ChipIcono icono={IconoObjetivo} />
                  <h3 className="mt-4 text-xl text-titulo">Misión</h3>
                  <Parrafos texto={contenido.semilleros_mision} className="mt-2" />
                </article>
              )}
              {contenido.semilleros_vision && (
                <article className="rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave">
                  <ChipIcono icono={IconoVision} />
                  <h3 className="mt-4 text-xl text-titulo">Visión</h3>
                  <Parrafos texto={contenido.semilleros_vision} className="mt-2" />
                </article>
              )}
            </div>
          )}
        </div>

        {(objetivos.length > 0 || contenido?.semilleros_coordinador) && (
          <aside className="self-start rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave md:p-8">
            {objetivos.length > 0 && (
              <>
                <h3 className="text-sm font-bold uppercase tracking-wider text-titulo">Objetivos</h3>
                <ul className="mt-4 space-y-3">
                  {objetivos.map((objetivo) => (
                    <li key={objetivo} className="flex gap-3 text-texto">
                      <IconoCorrecto width={18} height={18} aria-hidden="true" className="mt-0.5 shrink-0 text-acento" />
                      {objetivo}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {contenido?.semilleros_coordinador && (
              <p className={`flex items-center gap-3 ${objetivos.length > 0 ? 'mt-6 border-t border-borde pt-5' : ''}`}>
                <IconoUsuario width={18} height={18} aria-hidden="true" className="shrink-0 text-texto-suave" />
                <span>
                  <span className="block text-sm text-texto-suave">Coordinación</span>
                  <span className="font-semibold text-titulo">{contenido.semilleros_coordinador}</span>
                </span>
              </p>
            )}
          </aside>
        )}
      </div>

      {semilleros.length > 0 && (
        <>
          <h3 className="mt-12 text-xl text-titulo">Semilleros activos</h3>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {semilleros.map((semillero) => (
              <li key={semillero.nombre} className="rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave">
                <p className="font-bold text-titulo">{semillero.nombre}</p>
                {semillero.descripcion && <p className="mt-2 text-sm leading-relaxed text-texto">{semillero.descripcion}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
