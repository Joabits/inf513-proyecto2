import { Boton } from '@/compartido/ui/Boton'
import { IconoAnterior, IconoSiguiente } from '@/compartido/ui/Iconos'

export function Paginacion(props: { pagina: number; ultima: number; cargando: boolean; alCambiar: (pagina: number) => void }) {
  const { pagina, ultima, cargando, alCambiar } = props
  if (ultima <= 1) return null

  return (
    <nav aria-label="Páginas de la bitácora" className="mt-6 flex items-center justify-between gap-4">
      <Boton variante="borde" disabled={pagina <= 1 || cargando} onClick={() => alCambiar(pagina - 1)} className="inline-flex items-center gap-1">
        <IconoAnterior width={16} height={16} /> Anterior
      </Boton>
      <p className="text-sm text-texto-suave" aria-live="polite">
        Página {pagina} de {ultima}
      </p>
      <Boton variante="borde" disabled={pagina >= ultima || cargando} onClick={() => alCambiar(pagina + 1)} className="inline-flex items-center gap-1">
        Siguiente <IconoSiguiente width={16} height={16} />
      </Boton>
    </nav>
  )
}
