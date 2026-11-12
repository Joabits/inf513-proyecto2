import { Boton } from '@/compartido/ui/Boton'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoConstruccion } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FotoPersona } from '../componentes/FotoPersona'
import { GRUPOS, type Grupo, type Persona } from '../tipos'
import { useDocentesPublico } from '../useDocentes'

const ANTETITULO = 'text-sm font-bold uppercase tracking-widest text-acento'

/** Quien encabeza la Carrera: foto grande y nombre grande, antes que el resto. */
function PersonaDestacada({ persona }: { persona: Persona }) {
  return (
    <article className="flex flex-col items-center gap-6 rounded-tema border border-borde-tarjeta bg-tarjeta p-8 text-center sombra-suave sm:flex-row sm:gap-10 sm:p-10 sm:text-left">
      <FotoPersona nombre={persona.nombre} foto={persona.foto} tamano="xl" />
      <div className="min-w-0">
        <p className={ANTETITULO}>{persona.cargo}</p>
        <h2 className="mt-2 text-3xl leading-tight text-titulo md:text-4xl">{persona.nombre}</h2>
        <span aria-hidden="true" className="mx-auto mt-5 block h-1 w-14 rounded-full bg-primario sm:mx-0" />
      </div>
    </article>
  )
}

/** Tarjeta de directorio: foto centrada, nombre y cargo debajo. */
function TarjetaPersona({ persona }: { persona: Persona }) {
  return (
    // Ancho fijo por columna y fila centrada: con 5 personas la última fila no queda sola a la izquierda
    <li className="flex w-full flex-col items-center rounded-tema border border-borde-tarjeta bg-tarjeta px-5 py-7 text-center sombra-suave min-[480px]:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.84rem)] xl:w-[calc(25%-0.94rem)]">
      <FotoPersona nombre={persona.nombre} foto={persona.foto} tamano="lg" />
      <p className="mt-4 font-bold leading-snug text-titulo">{persona.nombre}</p>
      <p className="mt-1 text-sm leading-snug text-texto-suave">{persona.cargo}</p>
    </li>
  )
}

/**
 * Página pública «Autoridades y docentes» (CU-24). La persona destacada va primero y sola;
 * los grupos sin personas no se muestran, salvo docentes, que avisa que está en construcción.
 */
export function Docentes() {
  const { data: personas, isPending, isError, refetch } = useDocentesPublico()

  if (isPending) return <EstadoCarga />

  if (isError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <MensajeError texto="No se pudo cargar la información de autoridades y docentes." />
        <Boton variante="borde" onClick={() => refetch()}>
          Reintentar
        </Boton>
      </div>
    )
  }

  const destacadas = personas.filter((p) => p.destacado)

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="Autoridades y docentes" subtitulo="Quienes dirigen la Carrera, el personal administrativo y el plantel docente." />

      {destacadas.length > 0 && (
        <section aria-label="Dirección de la Carrera" className="mb-14 space-y-5 md:mb-20">
          {destacadas.map((persona) => (
            <PersonaDestacada key={persona.id} persona={persona} />
          ))}
        </section>
      )}

      {(Object.keys(GRUPOS) as Grupo[]).map((grupo) => {
        const lista = personas.filter((p) => p.grupo === grupo && !p.destacado)
        if (lista.length === 0 && grupo !== 'docente') return null

        return (
          <section key={grupo} aria-labelledby={`titulo-${grupo}`} className="mb-14 md:mb-20">
            <h2 id={`titulo-${grupo}`} className="text-3xl text-titulo">
              {GRUPOS[grupo]}
            </h2>

            {lista.length > 0 ? (
              <ul className="mt-8 flex flex-wrap justify-center gap-5">
                {lista.map((persona) => (
                  <TarjetaPersona key={persona.id} persona={persona} />
                ))}
              </ul>
            ) : (
              <div className="mt-8 flex items-center gap-4 rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave">
                <ChipIcono icono={IconoConstruccion} />
                <p className="text-texto">
                  <span className="block font-semibold text-titulo">En construcción</span>
                  La nómina del personal docente se publicará próximamente.
                </p>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
