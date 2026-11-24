import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { Buscador } from '@/compartido/layout/Buscador'
import { usePlantilla } from '@/compartido/layout/contextoPlantilla'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { IconoAnterior, IconoBuscar } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'

/**
 * Dirección que no existe, dentro del portal o del panel (con su cabecera y su menú, para seguir navegando).
 * En el portal ofrece el buscador. El servidor responde 200 a toda ruta de la SPA, así que se pide a los
 * buscadores que no la indexen.
 */
export function PaginaNoEncontrada() {
  const { pathname } = useLocation()
  const enPanel = usePlantilla() === 'gestion'

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <div className={enPanel ? 'mx-auto max-w-6xl' : ''}>
      <TituloPagina titulo="Página no encontrada" />
      <section className="mx-auto flex max-w-xl flex-col items-center py-6 text-center">
        <ChipIcono icono={IconoBuscar} tamano="lg" />
        <h2 className="mt-5 text-2xl text-titulo">Esta dirección no existe</h2>
        <p className="mt-2 text-texto-suave">
          No hay ninguna página en <span className="break-all font-semibold text-texto">{pathname}</span>. Puede que el
          enlace esté mal escrito o que la página haya cambiado de lugar.
        </p>

        {!enPanel && (
          <div className="mt-7 w-full max-w-sm text-left">
            <p className="mb-2 text-sm font-semibold text-titulo">Busque lo que necesita</p>
            <Buscador id="buscar-no-encontrada" />
          </div>
        )}

        <Link
          to={enPanel ? '/gestion' : '/'}
          className="mt-7 inline-flex items-center gap-2 rounded-tema bg-primario px-5 py-2.5 font-semibold text-sobre-primario transition-colors hover:bg-marino"
        >
          <IconoAnterior width={18} height={18} aria-hidden="true" /> {enPanel ? 'Volver al panel' : 'Volver al inicio'}
        </Link>
      </section>
    </div>
  )
}
