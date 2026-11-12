import { Boton } from '@/compartido/ui/Boton'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoConstruccion } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FotoPersona } from '../componentes/FotoPersona'
import { GRUPOS, type Grupo } from '../tipos'
import { useDocentesPublico } from '../useDocentes'

/** Página pública «Autoridades y docentes» (CU-24). Los grupos sin personas no se muestran, salvo docentes. */
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

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="Autoridades y docentes" subtitulo="Autoridades universitarias, personal administrativo y plantel docente de la Carrera." />

      {(Object.keys(GRUPOS) as Grupo[]).map((grupo) => {
        const lista = personas.filter((p) => p.grupo === grupo)
        if (lista.length === 0 && grupo !== 'docente') return null

        return (
          <section key={grupo} aria-labelledby={`titulo-${grupo}`} className="mb-14 md:mb-20">
            <h2 id={`titulo-${grupo}`} className="text-3xl text-titulo">
              {GRUPOS[grupo]}
            </h2>

            {lista.length > 0 ? (
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {lista.map((persona) => (
                  <li key={persona.id} className="flex items-center gap-4 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave">
                    <FotoPersona nombre={persona.nombre} foto={persona.foto} tamano="lg" />
                    <div className="min-w-0">
                      <p className="font-bold leading-snug text-titulo">{persona.nombre}</p>
                      <p className="mt-1 text-sm text-texto-suave">{persona.cargo}</p>
                    </div>
                  </li>
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
