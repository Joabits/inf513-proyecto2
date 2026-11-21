import { useState } from 'react'
import { RUTA_BASE } from '@/compartido/api/cliente'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { TarjetaGaleria } from '../componentes/TarjetaGaleria'
import { useGaleria } from '../hooks/useGaleria'
import type { Galeria } from '../tipos'

export function ListaGaleria() {
  const { data: galerias, isPending, isError } = useGaleria({ publicadas: true })
  const [seleccionada, setSeleccionada] = useState<Galeria | null>(null)

  const urlModal = seleccionada
    ? seleccionada.imagen.startsWith('http://') ||
      seleccionada.imagen.startsWith('https://') ||
      !RUTA_BASE
      ? seleccionada.imagen
      : `${RUTA_BASE}${seleccionada.imagen}`
    : ''

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TituloPagina
        titulo="Galería Multimedia"
        subtitulo="Fotografías de eventos, actividades académicas y vida universitaria de la Carrera de Administración de Empresas."
      />

      {isPending && <EstadoCarga />}

      {isError && (
        <MensajeError texto="No se pudo cargar la galería multimedia. Intente nuevamente." />
      )}

      {!isPending && !isError && galerias && galerias.length === 0 && (
        <div className="rounded-tema border border-borde bg-fondo p-12 text-center">
          <p className="text-texto">No hay fotografías disponibles en la galería en este momento.</p>
        </div>
      )}

      {!isPending && !isError && galerias && galerias.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {galerias.map((item) => (
            <TarjetaGaleria
              key={item.id}
              item={item}
              aspecto="square"
              alHacerClic={(seleccionado) => setSeleccionada(seleccionado)}
            />
          ))}
        </div>
      )}

      {/* Modal con imagen en grande y descripción */}
      {seleccionada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-marino-oscuro/80 p-4 backdrop-blur-sm"
          onClick={() => setSeleccionada(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-tema border border-borde bg-fondo p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={() => setSeleccionada(null)}
              className="absolute top-4 right-4 z-10 grid h-8 w-8 place-items-center rounded-tema border border-borde bg-fondo text-texto hover:border-acento hover:text-acento"
              aria-label="Cerrar visor"
            >
              ✕
            </button>

            {/* Imagen grande */}
            <div className="flex max-h-[65vh] w-full items-center justify-center overflow-hidden rounded-tema bg-marino-oscuro/5">
              <img
                src={urlModal}
                alt={seleccionada.titulo || 'Fotografía ampliada'}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Información al pie */}
            <div className="mt-4 space-y-2">
              {seleccionada.titulo && (
                <h2 id="modal-titulo" className="text-xl font-bold text-titulo">
                  {seleccionada.titulo}
                </h2>
              )}
              {seleccionada.descripcion && (
                <p className="whitespace-pre-line text-sm text-texto">
                  {seleccionada.descripcion}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-texto">
                {seleccionada.creado_en && <span>Fecha: {seleccionada.creado_en}</span>}
                {seleccionada.autor && <span>Publicado por: {seleccionada.autor}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
