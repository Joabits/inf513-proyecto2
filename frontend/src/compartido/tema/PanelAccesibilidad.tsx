import { useEffect, useRef, useState } from 'react'
import { IconoVisualizacion } from '@/compartido/ui/Iconos'
import { useTema } from './contexto'
import { TAMANOS, type Contraste, type PreferenciaModo, type Tema } from './tipos'

const TEMAS: { valor: Tema; texto: string }[] = [
  { valor: 'ninos', texto: 'Niños' },
  { valor: 'jovenes', texto: 'Jóvenes' },
  { valor: 'adultos', texto: 'Adultos' },
]
const MODOS: { valor: PreferenciaModo; texto: string }[] = [
  { valor: 'auto', texto: 'Automático' },
  { valor: 'claro', texto: 'Día' },
  { valor: 'oscuro', texto: 'Noche' },
]
const CONTRASTES: { valor: Contraste; texto: string }[] = [
  { valor: 'normal', texto: 'Normal' },
  { valor: 'alto', texto: 'Alto' },
]

function Grupo<T extends string | number>(props: {
  titulo: string
  opciones: { valor: T; texto: string }[]
  actual: T
  alElegir: (v: T) => void
}) {
  return (
    <fieldset className="mb-3">
      <legend className="mb-1 text-sm font-semibold">{props.titulo}</legend>
      <div className="flex flex-wrap gap-1">
        {props.opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            aria-pressed={props.actual === o.valor}
            onClick={() => props.alElegir(o.valor)}
            className={`rounded-tema border px-3 py-1 text-sm ${
              props.actual === o.valor
                ? 'border-primario bg-primario text-sobre-primario'
                : 'border-borde bg-fondo text-texto hover:border-acento'
            }`}
          >
            {o.texto}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

/** Botón del header que abre las opciones de tema, modo y accesibilidad (requisito 5). */
export function PanelAccesibilidad() {
  const t = useTema()
  const [abierto, setAbierto] = useState(false)
  const caja = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const cerrar = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !caja.current?.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', cerrar)
    document.addEventListener('keydown', cerrar)
    return () => {
      document.removeEventListener('mousedown', cerrar)
      document.removeEventListener('keydown', cerrar)
    }
  }, [abierto])

  return (
    <div className="relative" ref={caja}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-label="Visualización y accesibilidad: tema, modo día/noche, tamaño de letra y contraste"
        title="Visualización y accesibilidad"
        className="grid h-10 w-10 place-items-center rounded-full text-titulo transition-colors hover:bg-superficie"
      >
        <IconoVisualizacion />
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label="Opciones de visualización"
          className="fixed inset-x-4 top-20 z-50 rounded-tema border border-borde bg-fondo p-4 text-texto shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80"
        >
          <p className="mb-3 font-titulos font-bold text-titulo">Visualización</p>
          <Grupo titulo="Tema" opciones={TEMAS} actual={t.tema} alElegir={(tema) => t.cambiar({ tema })} />
          <Grupo titulo="Modo día / noche" opciones={MODOS} actual={t.modo} alElegir={(modo) => t.cambiar({ modo })} />
          <Grupo
            titulo="Tamaño de letra"
            opciones={TAMANOS.map((v, i) => ({ valor: v as number, texto: ['A−', 'A', 'A+', 'A++'][i] }))}
            actual={t.tamano}
            alElegir={(tamano) => t.cambiar({ tamano })}
          />
          <Grupo titulo="Contraste" opciones={CONTRASTES} actual={t.contraste} alElegir={(contraste) => t.cambiar({ contraste })} />
          {t.modo === 'auto' && (
            <p className="text-xs text-texto-suave">Automático: modo noche de 19:00 a 07:00 según la hora de su equipo.</p>
          )}
        </div>
      )}
    </div>
  )
}
