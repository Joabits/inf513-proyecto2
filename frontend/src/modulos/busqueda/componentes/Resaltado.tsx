import { trozos } from '../resaltar'

/** El texto con los términos buscados destacados, sin distinguir mayúsculas ni tildes. */
export function Resaltado({ texto, terminos }: { texto: string; terminos: string[] }) {
  return (
    <>
      {trozos(texto, terminos).map((trozo, i) =>
        trozo.marcado ? (
          // Texto fijo que no se reordena: la posición sirve como clave
          <mark key={i} className="rounded-sm bg-superficie px-0.5 font-semibold text-titulo">
            {trozo.texto}
          </mark>
        ) : (
          <span key={i}>{trozo.texto}</span>
        ),
      )}
    </>
  )
}
