import { useEffect } from 'react'

/** Título visible de la página + título de la pestaña del navegador. */
export function TituloPagina({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  useEffect(() => {
    document.title = `${titulo} | Administración de Empresas - UAGRM`
  }, [titulo])

  return (
    <header className="mb-8 border-b-4 border-primario pb-3">
      <h1 className="text-3xl font-bold text-titulo">{titulo}</h1>
      {subtitulo && <p className="mt-1 text-texto-suave">{subtitulo}</p>}
    </header>
  )
}
