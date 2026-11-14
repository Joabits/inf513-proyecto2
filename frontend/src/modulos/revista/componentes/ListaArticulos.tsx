import { useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { IconoAgregar } from '@/compartido/ui/Iconos'
import type { Edicion } from '../tipos'
import { useOrdenarArticulos } from '../useRevista'
import { FilaArticulo } from './FilaArticulo'
import { FormArticulo } from './FormArticulo'

/** Los artículos de una edición, en el orden en que se muestran en el portal. */
export function ListaArticulos({ edicion }: { edicion: Edicion }) {
  const ordenar = useOrdenarArticulos()
  const puedeCrear = usePermiso('revista.crear')
  const [agregando, setAgregando] = useState(false)
  const { articulos } = edicion

  /** Intercambia el artículo con su vecino y guarda el orden completo. */
  function mover(indice: number, direccion: -1 | 1) {
    const ids = articulos.map((a) => a.id)
    ;[ids[indice], ids[indice + direccion]] = [ids[indice + direccion], ids[indice]]
    ordenar.mutate({ edicion: edicion.id, ids })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-lg font-bold text-titulo">Artículos de esta edición</h4>
        {puedeCrear && !agregando && (
          <Boton type="button" variante="borde" onClick={() => setAgregando(true)} className="inline-flex items-center gap-2 text-sm">
            <IconoAgregar width={16} height={16} /> Agregar artículo
          </Boton>
        )}
      </div>

      {ordenar.isError && (
        <p role="alert" className="mt-3 text-sm font-semibold text-acento">
          No se pudo guardar el nuevo orden. Recargue la página e intente de nuevo.
        </p>
      )}

      {agregando && (
        <div className="mt-4 rounded-tema border border-borde p-5">
          <FormArticulo edicion={edicion.id} alTerminar={() => setAgregando(false)} />
        </div>
      )}

      {articulos.length > 0 ? (
        <ul className="mt-2 divide-y divide-borde">
          {articulos.map((articulo, i) => (
            <FilaArticulo
              key={articulo.id}
              articulo={articulo}
              edicion={edicion.id}
              esPrimero={i === 0}
              esUltimo={i === articulos.length - 1}
              ordenando={ordenar.isPending}
              alMover={(direccion) => mover(i, direccion)}
            />
          ))}
        </ul>
      ) : (
        !agregando && <p className="mt-3 text-sm text-texto-suave">Esta edición todavía no tiene artículos. Si su PDF ya está completo, puede dejarla así.</p>
      )}
    </div>
  )
}
