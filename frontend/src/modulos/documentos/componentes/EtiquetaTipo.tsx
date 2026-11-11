import type { TipoDocumento } from '../tipos'

const COLOR: Record<TipoDocumento, string> = {
  pdf: 'bg-primario text-sobre-primario',
  docx: 'bg-marino text-sobre-primario',
  xlsx: 'bg-marino-oscuro text-sobre-primario',
}

/** Cuadro con la extensión: se reconoce el tipo de archivo de un vistazo, como en un explorador. */
export function EtiquetaTipo({ tipo }: { tipo: TipoDocumento }) {
  return (
    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-tema text-[0.6875rem] font-bold tracking-wide ${COLOR[tipo]}`} aria-hidden="true">
      {tipo.toUpperCase()}
    </span>
  )
}
