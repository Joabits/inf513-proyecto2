import { useEffect } from 'react'

/** Título visible de la página + título de la pestaña del navegador. */
export function TituloPagina({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  useEffect(() => {
    document.title = `${titulo} | Administración de Empresas - UAGRM`
  }, [titulo])

  return (
    <header className="mb-8 md:mb-10">
      <span className="mb-3 block h-1 w-12 rounded-full bg-primario" aria-hidden="true" />
      <h1 className="text-3xl text-titulo md:text-4xl">{titulo}</h1>
      {subtitulo && <p className="mt-2 max-w-2xl text-texto-suave md:text-lg">{subtitulo}</p>}
    </header>
  )
}
