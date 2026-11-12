import { ESTILO_RELACION, type Relacion } from '../relacion'
import type { MateriaMalla } from '../tipos'

const DESCRIPCION: Partial<Record<Relacion, string>> = {
  elegida: 'materia elegida',
  requisito: 'requisito de la materia elegida',
  habilita: 'habilitada por la materia elegida',
}

const ETIQUETA: Partial<Record<Relacion, string>> = { requisito: 'Requisito', habilita: 'Habilita' }

export function TarjetaMateria(props: { materia: MateriaMalla; relacion: Relacion; alElegir: () => void }) {
  const { materia, relacion, alElegir } = props
  const oscura = relacion === 'elegida' || relacion === 'habilita'
  const horas = `${materia.horas_teoricas ?? 0} HT · ${materia.horas_practicas ?? 0} HP`

  return (
    <button
      type="button"
      onClick={alElegir}
      aria-pressed={relacion === 'elegida'}
      aria-label={`${materia.sigla} ${materia.nombre}, ${materia.creditos} créditos${DESCRIPCION[relacion] ? `, ${DESCRIPCION[relacion]}` : ''}`}
      className={`flex w-full flex-col rounded-tema border p-3 text-left transition ${ESTILO_RELACION[relacion]}`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className={`text-xs font-bold tracking-wide ${oscura ? '' : 'text-acento'}`}>{materia.sigla}</span>
        {ETIQUETA[relacion] && (
          <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${oscura ? '' : 'text-acento'}`}>{ETIQUETA[relacion]}</span>
        )}
      </span>
      <span className={`mt-1 text-sm font-semibold leading-snug ${oscura ? '' : 'text-titulo'}`}>{materia.nombre}</span>
      <span className={`mt-2 text-xs ${oscura ? '' : 'text-texto-suave'}`}>
        {horas} · {materia.creditos} cr.
      </span>
    </button>
  )
}
