import { useId, useState } from 'react'
import { IconoDocentes, IconoInvestigacion, IconoUsuario } from '@/compartido/ui/Iconos'
import { ESTADOS, TIPOS, type Proyecto } from '../tipos'

const PASTILLA = 'rounded-full px-2.5 py-0.5 text-xs font-semibold'

/** A partir de este largo el resumen se recorta y se puede desplegar. */
const RESUMEN_LARGO = 240

/** Un proyecto publicado, tal como lo ve el visitante. */
export function TarjetaProyecto({ proyecto }: { proyecto: Proyecto }) {
  const [abierto, setAbierto] = useState(false)
  const idResumen = useId()
  const largo = proyecto.resumen.length > RESUMEN_LARGO

  return (
    <article className="rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${PASTILLA} bg-chip text-sobre-chip`}>{TIPOS[proyecto.tipo]}</span>
        <span className={`${PASTILLA} inline-flex items-center gap-1.5 border border-borde text-texto-suave`}>
          {proyecto.estado === 'en_curso' && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primario" />}
          {ESTADOS[proyecto.estado]}
        </span>
        <span className="ml-auto text-sm font-semibold text-texto-suave">Gestión {proyecto.gestion}</span>
      </div>

      <h3 className="mt-3 text-lg font-bold leading-snug text-titulo">{proyecto.titulo}</h3>

      <dl className="mt-3 space-y-1.5 text-sm">
        {proyecto.linea && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-texto-suave">
              <IconoInvestigacion width={16} height={16} className="mt-0.5" aria-hidden="true" />
              <span className="sr-only">Línea de investigación</span>
            </dt>
            <dd className="text-texto">{proyecto.linea.nombre}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="shrink-0 text-texto-suave">
            <IconoUsuario width={16} height={16} className="mt-0.5" aria-hidden="true" />
            <span className="sr-only">Responsable</span>
          </dt>
          <dd className="font-semibold text-texto">{proyecto.responsable}</dd>
        </div>
        {proyecto.integrantes && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-texto-suave">
              <IconoDocentes width={16} height={16} className="mt-0.5" aria-hidden="true" />
              <span className="sr-only">Integrantes</span>
            </dt>
            <dd className="text-texto">{proyecto.integrantes}</dd>
          </div>
        )}
      </dl>

      <p id={idResumen} className={`mt-4 leading-relaxed text-texto ${largo && !abierto ? 'line-clamp-3' : ''}`}>
        {proyecto.resumen}
      </p>
      {largo && (
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={idResumen}
          onClick={() => setAbierto(!abierto)}
          className="mt-2 text-sm font-semibold text-acento underline-offset-4 hover:underline"
        >
          {abierto ? 'Leer menos' : 'Leer el resumen completo'}
        </button>
      )}
    </article>
  )
}
