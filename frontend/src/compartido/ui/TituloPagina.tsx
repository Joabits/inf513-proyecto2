import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { usePlantilla } from '@/compartido/layout/contextoPlantilla'
import { iconoDeRuta } from '@/compartido/menu/iconosRuta'
import { useMenu } from '@/compartido/menu/useMenu'
import { ChipIcono } from './ChipIcono'
import { IconoDinamico } from './IconoDinamico'
import { IconoSiguiente } from './Iconos'

interface Props {
  titulo: string
  subtitulo?: string
}

/**
 * Título visible de la página + título de la pestaña del navegador.
 * Cambia según la plantilla: franja azul en el portal, ícono y título en el panel.
 */
export function TituloPagina(props: Props) {
  const plantilla = usePlantilla()

  useEffect(() => {
    document.title = `${props.titulo} | Administración de Empresas - UAGRM`
  }, [props.titulo])

  if (plantilla === 'publica') return <EncabezadoPortal {...props} />
  if (plantilla === 'gestion') return <EncabezadoGestion {...props} />

  return (
    <header className="mb-8">
      <span className="mb-3 block h-1 w-12 rounded-full bg-primario" aria-hidden="true" />
      <h1 className="text-3xl text-titulo">{props.titulo}</h1>
      {props.subtitulo && <p className="mt-2 text-texto-suave">{props.subtitulo}</p>}
    </header>
  )
}

/**
 * Franja azul de lado a lado, pegada a la cabecera (debe ser lo primero de la página).
 * La ruta de navegación sale del menú de la BD: Inicio › sección › página.
 */
function EncabezadoPortal({ titulo, subtitulo }: Props) {
  const { pathname } = useLocation()
  const { data: menu } = useMenu()
  const seccion = menu?.publico.find((opcion) => opcion.hijos.some((hijo) => hijo.ruta === pathname))?.titulo
  const Icono = iconoDeRuta(pathname)

  return (
    <header className="banda banda-marino -mt-8 mb-10 overflow-y-clip py-10 md:-mt-12 md:mb-14 md:py-16">
      {/* Adorno con colores del manual: círculo azul oscuro con el ícono de la sección */}
      <div
        aria-hidden="true"
        className="adorno pointer-events-none absolute -right-24 -top-24 hidden h-[28rem] w-[28rem] place-items-center rounded-full bg-marino-oscuro md:grid"
      >
        {Icono && <IconoDinamico icono={Icono} width={128} height={128} strokeWidth={0.9} className="text-sobre-marino" />}
      </div>

      <div className="relative max-w-3xl md:pr-48 lg:pr-0">
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-sobre-marino-suave">
            <li>
              <Link to="/" className="underline-offset-4 hover:underline">
                Inicio
              </Link>
            </li>
            {seccion && seccion !== titulo && (
              <li className="flex items-center gap-1.5">
                <IconoSiguiente width={14} height={14} aria-hidden="true" />
                {seccion}
              </li>
            )}
            <li aria-current="page" className="flex items-center gap-1.5 font-semibold text-sobre-marino">
              <IconoSiguiente width={14} height={14} aria-hidden="true" />
              {titulo}
            </li>
          </ol>
        </nav>
        <h1 className="mt-4 text-4xl leading-tight md:text-5xl">{titulo}</h1>
        {subtitulo && <p className="mt-4 max-w-2xl text-sobre-marino-suave md:text-lg">{subtitulo}</p>}
        <span aria-hidden="true" className="mt-8 block h-1 w-14 rounded-full bg-primario" />
      </div>
    </header>
  )
}

function EncabezadoGestion({ titulo, subtitulo }: Props) {
  const { pathname } = useLocation()
  const Icono = iconoDeRuta(pathname)

  return (
    // Si la página pone botones a la derecha (fila flex-wrap), el título se encoge para dejarles lugar
    // y solo baja el botón a otra línea cuando no quedan 28rem para el título (celular)
    <header className="mb-8 flex min-w-0 max-w-2xl flex-1 basis-md items-center gap-4 md:mb-10">
      {Icono && <ChipIcono icono={Icono} tamano="lg" className="hidden sm:grid" />}
      <div className="min-w-0">
        <h1 className="text-2xl leading-tight text-titulo md:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 max-w-xl text-texto-suave">{subtitulo}</p>}
      </div>
    </header>
  )
}
