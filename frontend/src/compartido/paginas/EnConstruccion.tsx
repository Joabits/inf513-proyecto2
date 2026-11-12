import { Link, useLocation } from 'react-router'
import { usePlantilla } from '@/compartido/layout/contextoPlantilla'
import { useMenu } from '@/compartido/menu/useMenu'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { IconoAnterior, IconoConstruccion } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'

/** Se muestra en las rutas del menú cuyo módulo todavía no está hecho (en el portal y en el panel). */
export function EnConstruccion() {
  const { pathname } = useLocation()
  const plantilla = usePlantilla()
  const { data: menu } = useMenu()
  const opciones = [...(menu?.publico ?? []), ...(menu?.gestion ?? [])].flatMap((opcion) => [opcion, ...opcion.hijos])
  const titulo = opciones.find((opcion) => opcion.ruta === pathname)?.titulo ?? 'Página en construcción'
  const enPanel = plantilla === 'gestion'

  return (
    <div className={enPanel ? 'mx-auto max-w-6xl' : ''}>
      <TituloPagina titulo={titulo} />
      <section className="mx-auto flex max-w-xl flex-col items-center py-6 text-center">
        <ChipIcono icono={IconoConstruccion} tamano="lg" />
        <h2 className="mt-5 text-2xl text-titulo">Sección en construcción</h2>
        <p className="mt-2 text-texto-suave">Estamos preparando esta sección. Vuelva a visitarla pronto.</p>
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
