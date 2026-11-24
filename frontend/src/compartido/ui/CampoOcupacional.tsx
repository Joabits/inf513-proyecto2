import { areasOcupacionales } from './areasOcupacionales'
import { ChipIcono } from './ChipIcono'
import { IconoEmpresa } from './Iconos'
import { MosaicoAreas } from './MosaicoAreas'
import { TextoPlegable } from './TextoPlegable'

/**
 * Campo ocupacional (La Carrera e Información académica): las áreas del primer párrafo como mosaico con íconos
 * y el resto del texto plegado. Si el texto no nombra las áreas con la forma esperada, se muestra como tarjeta.
 */
export function CampoOcupacional({ texto }: { texto: string }) {
  const areas = areasOcupacionales(texto)

  if (!areas) {
    return (
      <article className="rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave md:p-8">
        <ChipIcono icono={IconoEmpresa} tamano="lg" />
        <h2 className="mt-5 text-2xl text-titulo">Campo ocupacional</h2>
        <TextoPlegable texto={texto} className="mt-3" />
      </article>
    )
  }

  const resto = texto.split(/\n\s*\n/).slice(1).join('\n\n')
  return (
    <div>
      <h2 className="flex items-center gap-3 text-2xl text-titulo">
        <IconoEmpresa width={26} height={26} aria-hidden="true" className="text-acento" />
        Campo ocupacional
      </h2>
      <p className="mt-2 text-texto-suave">Puede desempeñarse en estas áreas de cualquier organización:</p>
      <div className="mt-5">
        <MosaicoAreas areas={areas} titulo="Áreas del campo ocupacional" />
      </div>
      {resto && <TextoPlegable texto={resto} className="mt-5" />}
    </div>
  )
}
