import { Link } from 'react-router'
import { useMenu } from '@/compartido/menu/useMenu'
import { useSesion } from '@/compartido/sesion/useSesion'
import { Tarjeta } from '@/compartido/ui/Tarjeta'
import { TituloPagina } from '@/compartido/ui/TituloPagina'

/** Pantalla a la que llega el personal al ingresar: lo que su rol puede administrar. */
export function PanelGestion() {
  const { data: usuario } = useSesion()
  const { data: menu } = useMenu()
  const grupos = menu?.gestion ?? []

  return (
    <div className="mx-auto max-w-5xl">
      <TituloPagina titulo={`Hola, ${usuario?.nombre ?? ''}`} subtitulo={usuario?.rol?.nombre} />

      {grupos.length === 0 && <p className="text-texto-suave">Su rol todavía no tiene opciones de gestión.</p>}

      <div className="grid gap-5 md:grid-cols-2">
        {grupos.map((grupo) => (
          <Tarjeta key={grupo.id}>
            <h2 className="text-lg text-titulo">{grupo.titulo}</h2>
            <ul className="mt-3 space-y-1">
              {grupo.hijos.map((opcion) => (
                <li key={opcion.id}>
                  <Link to={opcion.ruta ?? '/gestion'} className="text-sm text-texto underline-offset-4 hover:text-acento hover:underline">
                    {opcion.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </Tarjeta>
        ))}
      </div>
    </div>
  )
}
