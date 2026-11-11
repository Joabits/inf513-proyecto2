import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { MarcaCarrera } from '@/compartido/marca/LogoCarrera'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { IconoAlerta, IconoAnterior } from '@/compartido/ui/Iconos'

/** Pantalla de error de las rutas (se muestra sin cabecera ni pie). */
export function PaginaError() {
  const error = useRouteError()
  const noExiste = isRouteErrorResponse(error) && error.status === 404

  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <MarcaCarrera className="mb-10" />
        <ChipIcono icono={IconoAlerta} tamano="lg" />
        <h1 className="mt-5 text-3xl text-titulo">{noExiste ? 'Página no encontrada' : 'Ocurrió un error'}</h1>
        <p className="mt-2 text-texto-suave">
          {noExiste ? 'La dirección no existe o la página cambió de lugar.' : 'Algo salió mal al mostrar esta página. Intente de nuevo en unos minutos.'}
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-2 rounded-tema bg-primario px-5 py-2.5 font-semibold text-sobre-primario transition-colors hover:bg-marino"
        >
          <IconoAnterior width={18} height={18} aria-hidden="true" /> Volver al inicio
        </Link>
      </div>
    </main>
  )
}
