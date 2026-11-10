import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export function PaginaError() {
  const error = useRouteError()
  const titulo = isRouteErrorResponse(error) && error.status === 404 ? 'Página no encontrada' : 'Ocurrió un error'
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">{titulo}</h1>
      <Link to="/" className="mt-6 inline-block text-acento underline">
        Volver al inicio
      </Link>
    </main>
  )
}
