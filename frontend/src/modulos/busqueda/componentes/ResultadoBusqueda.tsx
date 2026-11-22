import { Link } from 'react-router'
import { RUTA_BASE } from '@/compartido/api/cliente'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import {
  type ComponenteIcono,
  IconoBuscar,
  IconoCalendario,
  IconoDocentes,
  IconoDocumento,
  IconoExterno,
  IconoGaleria,
  IconoFlecha,
  IconoGraduacion,
  IconoInstitucion,
  IconoInvestigacion,
  IconoLibro,
  IconoNoticias,
  IconoObjetivo,
  IconoRevista,
} from '@/compartido/ui/Iconos'
import type { ResultadoBusqueda as Resultado } from '../tipos'
import { Resaltado } from './Resaltado'

/** Ícono por tipo de resultado. Un tipo nuevo usa la lupa hasta que se le asigne uno. */
const ICONOS: Record<string, ComponenteIcono> = {
  documento: IconoDocumento,
  proyecto: IconoInvestigacion,
  linea: IconoObjetivo,
  semillero: IconoGraduacion,
  materia: IconoLibro,
  carrera: IconoInstitucion,
  noticia: IconoNoticias,
  evento: IconoCalendario,
  foto: IconoGaleria,
  persona: IconoDocentes,
  edicion: IconoRevista,
  articulo: IconoRevista,
}

const ACCION = 'mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-acento underline-offset-4 hover:underline'

export function ResultadoBusqueda(props: { resultado: Resultado; tipo: string; etiqueta: string; terminos: string[] }) {
  const { resultado, tipo, etiqueta, terminos } = props

  return (
    <li className="flex gap-4 py-5">
      <ChipIcono icono={ICONOS[tipo] ?? IconoBuscar} />
      <div className="min-w-0 flex-1">
        <h3 className="font-cuerpo text-base font-bold leading-snug text-titulo">
          <Resaltado texto={resultado.titulo} terminos={terminos} />
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-texto-suave">
          <span className="rounded-full border border-borde px-2 py-0.5 text-xs font-semibold">{etiqueta}</span>
          {resultado.meta && <span>{resultado.meta}</span>}
        </p>
        {resultado.resumen && (
          <p className="mt-2 text-sm leading-relaxed text-texto">
            <Resaltado texto={resultado.resumen} terminos={terminos} />
          </p>
        )}
        {resultado.externo ? (
          <a href={`${RUTA_BASE}${resultado.ruta}`} target="_blank" rel="noopener" className={ACCION}>
            Abrir documento <IconoExterno width={14} height={14} aria-hidden="true" />
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
        ) : (
          <Link to={resultado.ruta} className={ACCION}>
            Ver en el portal <IconoFlecha width={14} height={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </li>
  )
}
