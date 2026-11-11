import { Boton } from '@/compartido/ui/Boton'
import { IconoCerrar } from '@/compartido/ui/Iconos'
import type { MateriaMalla } from '../tipos'
import { nombreSemestre } from '../formato'

function Siglas({ titulo, siglas, vacio, materias, alElegir }: {
  titulo: string
  siglas: string[]
  vacio: string
  materias: Map<string, MateriaMalla>
  alElegir: (sigla: string) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-titulo">{titulo}</h3>
      {siglas.length === 0 ? (
        <p className="mt-1 text-sm text-texto-suave">{vacio}</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {siglas.map((sigla) => (
            <li key={sigla}>
              <button
                type="button"
                onClick={() => alElegir(sigla)}
                className="rounded-full border border-borde px-3 py-1 text-sm text-texto transition-colors hover:border-primario hover:text-acento"
              >
                <strong className="font-bold">{sigla}</strong> {materias.get(sigla)?.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Datos de la materia elegida, con sus requisitos y lo que habilita (se puede navegar entre ellas). */
export function DetalleMateria(props: {
  materia: MateriaMalla
  semestre: number
  materias: Map<string, MateriaMalla>
  alElegir: (sigla: string) => void
  alCerrar: () => void
}) {
  const { materia, semestre, materias, alElegir, alCerrar } = props

  return (
    <div className="rounded-tema border-l-4 border-primario bg-superficie p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-acento">
            {materia.optativa ? 'Opción de graduación' : materia.sigla} · {nombreSemestre(semestre)}
          </p>
          <h2 className="mt-1 text-2xl text-titulo">{materia.optativa ? 'Materia optativa de graduación' : materia.nombre}</h2>
          {!materia.optativa && (
            <p className="mt-1 text-sm text-texto-suave">
              {materia.horas_teoricas} horas teóricas · {materia.horas_practicas} horas prácticas · {materia.creditos} créditos
            </p>
          )}
        </div>
        <Boton type="button" variante="borde" onClick={alCerrar} aria-label="Cerrar el detalle de la materia" className="shrink-0 px-2.5">
          <IconoCerrar width={18} height={18} />
        </Boton>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Siglas titulo="Requisitos" siglas={materia.prerrequisitos} vacio="Ninguno: se cursa al ser admitido en la Carrera." materias={materias} alElegir={alElegir} />
        <Siglas titulo="Habilita" siglas={materia.habilita} vacio="No es requisito de otra materia." materias={materias} alElegir={alElegir} />
      </div>
    </div>
  )
}
