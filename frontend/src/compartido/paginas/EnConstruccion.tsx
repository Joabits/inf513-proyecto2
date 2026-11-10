import { useLocation } from 'react-router'
import { TituloPagina } from '@/compartido/ui/TituloPagina'

/** Se muestra en las rutas del menú cuyo módulo todavía no está hecho. */
export function EnConstruccion() {
  const { pathname } = useLocation()
  return (
    <section className="mx-auto max-w-3xl">
      <TituloPagina titulo="Página en construcción" />
      <p className="text-texto-suave">
        El módulo de <code className="rounded bg-superficie px-1">{pathname}</code> todavía no está implementado.
      </p>
    </section>
  )
}
