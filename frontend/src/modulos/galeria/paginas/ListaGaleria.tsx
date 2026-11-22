import { useEffect, useRef, useState } from 'react'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoCerrar } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { TarjetaGaleria } from '../componentes/TarjetaGaleria'
import { urlImagen } from '../urlImagen'
import { useGaleria } from '../hooks/useGaleria'
import type { Galeria } from '../tipos'

/**
 * Página pública «Galería multimedia» (CU-06).
 *
 * El visor usa <dialog> nativo con showModal(): el navegador ya cierra con Esc, mantiene el foco dentro mientras
 * está abierto, deja inerte el resto de la página y devuelve el foco a la foto que lo abrió al cerrar.
 * Un clic fuera de la imagen (en el fondo oscuro) también lo cierra.
 */
export function ListaGaleria() {
  const { data: fotos, isPending, isError, refetch } = useGaleria({ publicadas: true })
  const [abierta, setAbierta] = useState<Galeria | null>(null)
  const visor = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = visor.current
    if (!dialogo) return
    if (abierta && !dialogo.open) dialogo.showModal()
    if (!abierta && dialogo.open) dialogo.close()
  }, [abierta])

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="Galería multimedia" subtitulo="Fotografías de eventos, actividades académicas y vida universitaria de la Carrera." />

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
          <MensajeError texto="No se pudo cargar la galería." />
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        </div>
      )}

      {fotos && fotos.length === 0 && (
        <p className="rounded-tema bg-superficie p-10 text-center text-texto-suave">Todavía no hay fotografías en la galería.</p>
      )}

      {fotos && fotos.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {fotos.map((foto) => (
            <li key={foto.id}>
              <TarjetaGaleria item={foto} alAbrir={setAbierta} />
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={visor}
        aria-labelledby={abierta?.titulo ? 'visor-titulo' : undefined}
        aria-label={abierta?.titulo ? undefined : 'Fotografía ampliada'}
        onClose={() => setAbierta(null)}
        onClick={(e) => {
          // El clic en el fondo cae sobre el propio <dialog>; dentro del contenido cae en sus hijos
          if (e.target === e.currentTarget) visor.current?.close()
        }}
        className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-tema bg-tarjeta p-0 text-texto backdrop:bg-marino-oscuro/80 backdrop:backdrop-blur-sm"
      >
        {abierta && (
          <div className="relative p-4 sm:p-6">
            <button
              type="button"
              onClick={() => visor.current?.close()}
              aria-label="Cerrar el visor"
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-tarjeta text-titulo sombra-suave transition-colors hover:text-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
            >
              <IconoCerrar width={20} height={20} aria-hidden="true" />
            </button>

            <img src={urlImagen(abierta.imagen)} alt={abierta.titulo || 'Fotografía ampliada'} className="mx-auto max-h-[65vh] w-auto max-w-full rounded-tema object-contain" />

            <div className="mt-4 space-y-2 pr-12">
              {abierta.titulo && (
                <h2 id="visor-titulo" className="text-xl text-titulo">
                  {abierta.titulo}
                </h2>
              )}
              {abierta.descripcion && <p className="whitespace-pre-line text-sm text-texto">{abierta.descripcion}</p>}
              {abierta.creado_en && <p className="text-xs text-texto-suave">{abierta.creado_en}</p>}
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}
