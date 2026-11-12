import { Link } from 'react-router'
import { iconoDeGrupo, iconoDeRuta } from '@/compartido/menu/iconosRuta'
import { useMenu } from '@/compartido/menu/useMenu'
import { useSesion } from '@/compartido/sesion/useSesion'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { IconoPanel, IconoSiguiente } from '@/compartido/ui/Iconos'
import { Tarjeta } from '@/compartido/ui/Tarjeta'
import { TituloPagina } from '@/compartido/ui/TituloPagina'

/** Pantalla a la que llega el personal al ingresar: lo que su rol puede administrar. */
export function PanelGestion() {
  const { data: usuario } = useSesion()
  const { data: menu } = useMenu()
  const grupos = menu?.gestion ?? []

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo={`Hola, ${usuario?.nombre ?? ''}`} subtitulo={usuario?.rol?.nombre} />

      {grupos.length === 0 && <p className="text-texto-suave">Su rol todavía no tiene opciones de gestión.</p>}

      <div className="grid gap-6 md:grid-cols-2">
        {grupos.map((grupo) => (
          <Tarjeta key={grupo.id} className="p-0">
            <div className="flex items-center gap-4 border-b border-borde px-5 py-4">
              <ChipIcono icono={iconoDeGrupo(grupo.titulo) ?? IconoPanel} />
              <div>
                <h2 className="text-lg text-titulo">{grupo.titulo}</h2>
                <p className="text-sm text-texto-suave">
                  {grupo.hijos.length} {grupo.hijos.length === 1 ? 'sección' : 'secciones'}
                </p>
              </div>
            </div>
            <ul className="p-2">
              {grupo.hijos.map((opcion) => {
                const Icono = iconoDeRuta(opcion.ruta)
                return (
                  <li key={opcion.id}>
                    <Link
                      to={opcion.ruta ?? '/gestion'}
                      className="group flex items-center gap-3 rounded-tema px-3 py-2.5 text-texto transition-colors hover:bg-superficie hover:text-acento"
                    >
                      {Icono && <Icono width={18} height={18} aria-hidden="true" className="shrink-0 text-titulo group-hover:text-acento" />}
                      <span className="flex-1 font-medium">{opcion.titulo}</span>
                      <IconoSiguiente width={16} height={16} aria-hidden="true" className="text-texto-suave transition-transform group-hover:translate-x-0.5 group-hover:text-acento" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Tarjeta>
        ))}
      </div>
    </div>
  )
}
