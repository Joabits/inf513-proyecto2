import { useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoAgregar } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FilaPersona } from '../componentes/FilaPersona'
import { FormPersona } from '../componentes/FormPersona'
import { GRUPOS, type Grupo, type Persona } from '../tipos'
import { useDocentesGestion, useOrdenarPersonas } from '../useDocentes'

export function GestionDocentes() {
  const { data: personas, isPending, isError, refetch } = useDocentesGestion()
  const ordenar = useOrdenarPersonas()
  const puedeCrear = usePermiso('docentes.crear')
  const [agregando, setAgregando] = useState<Grupo | null>(null)

  /** Intercambia a la persona con su vecina y guarda el orden completo del grupo. */
  function mover(grupo: Grupo, lista: Persona[], indice: number, direccion: -1 | 1) {
    const ids = lista.map((p) => p.id)
    ;[ids[indice], ids[indice + direccion]] = [ids[indice + direccion], ids[indice]]
    ordenar.mutate({ grupo, ids })
  }

  return (
    <div className="mx-auto max-w-4xl">
      <TituloPagina titulo="Autoridades y docentes" subtitulo="Las personas que aparecen en la página Autoridades y docentes del portal." />

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="space-y-4 text-center">
          <MensajeError />
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        </div>
      )}

      {ordenar.isError && (
        <p role="alert" className="mb-6 text-sm font-semibold text-acento">
          No se pudo guardar el nuevo orden. Recargue la página e intente de nuevo.
        </p>
      )}

      {personas &&
        (Object.keys(GRUPOS) as Grupo[]).map((grupo) => {
          const lista = personas.filter((p) => p.grupo === grupo)

          return (
            <section key={grupo} aria-labelledby={`grupo-${grupo}`} className="mb-12">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 id={`grupo-${grupo}`} className="text-xl text-titulo">
                  {GRUPOS[grupo]} <span className="text-base font-normal text-texto-suave">({lista.length})</span>
                </h2>
                {puedeCrear && agregando !== grupo && (
                  <Boton type="button" variante="borde" onClick={() => setAgregando(grupo)} className="inline-flex items-center gap-2 text-sm">
                    <IconoAgregar width={16} height={16} /> Agregar
                  </Boton>
                )}
              </div>

              {agregando === grupo && (
                <div className="mb-4 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave md:p-6">
                  <h3 className="mb-5 text-lg text-titulo">Agregar a {GRUPOS[grupo].toLowerCase()}</h3>
                  <FormPersona grupoInicial={grupo} alTerminar={() => setAgregando(null)} />
                </div>
              )}

              {lista.length > 0 ? (
                <ul className="space-y-3">
                  {lista.map((persona, i) => (
                    <FilaPersona
                      key={persona.id}
                      persona={persona}
                      esPrimera={i === 0}
                      esUltima={i === lista.length - 1}
                      ordenando={ordenar.isPending}
                      alMover={(direccion) => mover(grupo, lista, i, direccion)}
                    />
                  ))}
                </ul>
              ) : (
                agregando !== grupo && (
                  <p className="rounded-tema border border-dashed border-borde px-5 py-6 text-center text-sm text-texto-suave">
                    {grupo === 'docente'
                      ? 'Aún no hay docentes. Mientras tanto, el portal muestra esta sección como «En construcción».'
                      : 'No hay personas en este grupo.'}
                  </p>
                )
              )}
            </section>
          )
        })}
    </div>
  )
}
