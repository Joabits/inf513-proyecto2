import { Link } from 'react-router'
import { useSesion } from '@/compartido/sesion/useSesion'
import { IconoAnterior } from '@/compartido/ui/Iconos'

/** Franja para el personal que revisa el portal público: siempre puede regresar a su panel. */
export function AvisoPanel() {
  const { data: usuario } = useSesion()

  if (!usuario) return null

  return (
    <div className="bg-marino-oscuro text-sobre-primario">
      <div className="contenedor flex min-h-10 items-center justify-between gap-3 py-1.5 text-sm">
        <span className="truncate">Está viendo el portal público</span>
        <Link to="/gestion" className="inline-flex shrink-0 items-center gap-1.5 font-semibold underline-offset-4 hover:underline">
          <IconoAnterior width={16} height={16} /> Volver al panel
        </Link>
      </div>
    </div>
  )
}
