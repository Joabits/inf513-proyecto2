import { Boton } from '@/compartido/ui/Boton'
import { IconoAnterior, IconoSiguiente } from '@/compartido/ui/Iconos'

/** En el celular los botones muestran solo la flecha (el lector de pantalla sigue leyendo «Anterior» y «Siguiente»). */
export function Paginacion(props: { pagina: number; ultima: number; cargando: boolean; alCambiar: (pagina: number) => void }) {
  const { pagina, ultima, cargando, alCambiar } = props
  if (ultima <= 1) return null

  return (
    <nav aria-label="Páginas de la bitácora" className="mt-6 flex items-center justify-between gap-2 sm:gap-4">
      <Boton variante="borde" disabled={pagina <= 1 || cargando} onClick={() => alCambiar(pagina - 1)} className="inline-flex shrink-0 items-center gap-1">
        <IconoAnterior width={16} height={16} aria-hidden="true" /> <span className="max-sm:sr-only">Anterior</span>
      </Boton>
      <p className="text-center text-sm text-texto-suave" aria-live="polite">
        Página {pagina} de {ultima}
      </p>
      <Boton variante="borde" disabled={pagina >= ultima || cargando} onClick={() => alCambiar(pagina + 1)} className="inline-flex shrink-0 items-center gap-1">
        <span className="max-sm:sr-only">Siguiente</span> <IconoSiguiente width={16} height={16} aria-hidden="true" />
      </Boton>
    </nav>
  )
}
