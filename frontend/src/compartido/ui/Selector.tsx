import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type Ref } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { CLASE_CAJA } from './Campo'
import { IconoAbajo, IconoListo } from './Iconos'
import { useClicFuera } from './useClicFuera'

export interface OpcionSelector {
  valor: string
  etiqueta: string
  deshabilitada?: boolean
}

export interface PropsSelector {
  opciones: OpcionSelector[]
  valor: string
  alCambiar: (valor: string) => void
  alSalir?: () => void
  /** Lo que se lee cuando el valor no es ninguna de las opciones (por ejemplo, vacío). */
  textoVacio?: string
  /** Más bajo y sin margen arriba: para barras de herramientas, como la cabecera del calendario. */
  compacto?: boolean
  deshabilitado?: boolean
  id?: string
  className?: string
  ref?: Ref<HTMLButtonElement>
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

const CAJA_COMPACTA =
  'w-full rounded-tema border border-borde bg-fondo px-2.5 py-1.5 text-sm text-texto focus:border-titulo focus:outline-none'
const RELLENO_LISTA = 6 // p-1.5
const PAUSA_BUSQUEDA = 700

const sinTildes = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/**
 * Lista desplegable del portal, en lugar del <select> del navegador:
 *   <Selector aria-label="Filtrar por rol" valor={rol} alCambiar={setRol} opciones={[{ valor: '', etiqueta: 'Todos los roles' }, ...]} />
 * Dentro de <Campo> recibe el mismo id que la etiqueta. Con react-hook-form se usa <SelectorCampo>.
 *
 * Teclado: flechas, Inicio y Fin para moverse, Enter o espacio para elegir, Escape para cerrar y letras para buscar.
 * El foco no sale del botón; la opción resaltada se anuncia con aria-activedescendant.
 */
export function Selector(props: PropsSelector) {
  const { opciones, valor, alCambiar, alSalir, textoVacio = 'Seleccione una opción', compacto = false, deshabilitado, id, className = '', ref, ...aria } = props
  const idLista = useId()
  const caja = useRef<HTMLDivElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  const busqueda = useRef({ texto: '', hora: 0 })
  const [abierto, setAbierto] = useState(false)
  const [activa, setActiva] = useState(-1)
  const [arriba, setArriba] = useState(false)

  const elegida = opciones.findIndex((opcion) => opcion.valor === valor)
  const cerrar = useCallback(() => setAbierto(false), [])
  useClicFuera(caja, abierto, cerrar)

  // La opción resaltada queda siempre a la vista dentro de la lista
  useEffect(() => {
    const cuadro = lista.current
    const opcion = cuadro?.children[activa] as HTMLElement | undefined
    if (!abierto || !cuadro || !opcion) return
    const arribaOpcion = opcion.offsetTop - RELLENO_LISTA
    const abajoOpcion = opcion.offsetTop + opcion.offsetHeight + RELLENO_LISTA
    if (arribaOpcion < cuadro.scrollTop) cuadro.scrollTop = arribaOpcion
    else if (abajoOpcion > cuadro.scrollTop + cuadro.clientHeight) cuadro.scrollTop = abajoOpcion - cuadro.clientHeight
  }, [abierto, activa])

  /** Primera opción habilitada desde `desde`, avanzando de `paso` en `paso`. */
  function habilitada(desde: number, paso: 1 | -1) {
    for (let i = desde; i >= 0 && i < opciones.length; i += paso) if (!opciones[i].deshabilitada) return i
    return -1
  }

  function abrir(indice = elegida) {
    const borde = caja.current?.getBoundingClientRect()
    if (borde) {
      // Se abre hacia arriba solo si abajo no entra y arriba hay más lugar
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const alto = Math.min(opciones.length * 2.4 * rem + 2 * RELLENO_LISTA, 18 * rem) + 12
      const abajo = window.innerHeight - borde.bottom
      setArriba(abajo < alto && borde.top > abajo)
    }
    setActiva(indice >= 0 && !opciones[indice]?.deshabilitada ? indice : habilitada(0, 1))
    setAbierto(true)
  }

  function elegir(indice: number) {
    const opcion = opciones[indice]
    if (!opcion || opcion.deshabilitada) return
    setAbierto(false)
    if (opcion.valor !== valor) alCambiar(opcion.valor)
  }

  /** Opción que empieza con lo tecleado. Una sola letra repetida pasa a la siguiente coincidencia. */
  function buscar(letra: string, desde: number) {
    const ahora = Date.now()
    const b = busqueda.current
    b.texto = ahora - b.hora > PAUSA_BUSQUEDA ? letra : b.texto + letra
    b.hora = ahora
    const texto = sinTildes(b.texto)
    const inicio = b.texto.length === 1 ? desde + 1 : Math.max(desde, 0)
    for (let paso = 0; paso < opciones.length; paso++) {
      const i = (inicio + paso) % opciones.length
      if (!opciones[i].deshabilitada && sinTildes(opciones[i].etiqueta).startsWith(texto)) return i
    }
    return -1
  }

  function alTeclear(e: KeyboardEvent<HTMLButtonElement>) {
    const { key } = e
    const esLetra = key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
    // Un espacio en medio de una búsqueda es parte del texto, no «elegir»
    const buscando = esLetra && (key !== ' ' || Date.now() - busqueda.current.hora < PAUSA_BUSQUEDA)

    if (!abierto) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        e.preventDefault()
        abrir()
      } else if (key === 'Home' || key === 'End') {
        e.preventDefault()
        abrir(key === 'Home' ? habilitada(0, 1) : habilitada(opciones.length - 1, -1))
      } else if (buscando) {
        const hallada = buscar(key, elegida)
        abrir(hallada >= 0 ? hallada : elegida)
      }
      return
    }

    if (buscando) {
      e.preventDefault()
      const hallada = buscar(key, activa)
      if (hallada >= 0) setActiva(hallada)
      return
    }

    let destino = -2
    if (key === 'ArrowDown') destino = habilitada(activa + 1, 1)
    else if (key === 'ArrowUp' && !e.altKey) destino = habilitada(activa - 1, -1)
    else if (key === 'Home') destino = habilitada(0, 1)
    else if (key === 'End') destino = habilitada(opciones.length - 1, -1)
    else if (key === 'PageDown') destino = habilitada(Math.min(activa + 8, opciones.length - 1), -1)
    else if (key === 'PageUp') destino = habilitada(Math.max(activa - 8, 0), 1)

    if (destino !== -2) {
      e.preventDefault()
      if (destino >= 0) setActiva(destino)
    } else if (key === 'Enter' || key === ' ' || (key === 'ArrowUp' && e.altKey)) {
      e.preventDefault()
      elegir(activa)
    } else if (key === 'Escape') {
      // Solo cierra la lista: si está dentro de otro panel (el calendario), ese panel sigue abierto
      e.preventDefault()
      e.stopPropagation()
      setAbierto(false)
    } else if (key === 'Tab') {
      setAbierto(false)
    }
  }

  return (
    <div ref={caja} className={`relative ${compacto ? '' : 'mt-1'} ${className}`}>
      <button
        {...aria}
        ref={ref}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={abierto ? idLista : undefined}
        aria-activedescendant={abierto && activa >= 0 ? `${idLista}-${activa}` : undefined}
        disabled={deshabilitado}
        onClick={(e) => {
          // Safari no enfoca los botones al hacer clic, y el teclado se maneja desde el botón
          e.currentTarget.focus()
          if (abierto) setAbierto(false)
          else abrir()
        }}
        onKeyDown={alTeclear}
        onKeyUp={(e) => {
          // El espacio ya se atendió al presionar: sin esto el botón haría además un clic
          if (e.key === ' ') e.preventDefault()
        }}
        onBlur={() => {
          setAbierto(false)
          alSalir?.()
        }}
        className={`${compacto ? CAJA_COMPACTA : CLASE_CAJA} flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className={`truncate ${elegida < 0 ? 'text-texto-suave' : ''}`}>{elegida >= 0 ? opciones[elegida].etiqueta : textoVacio}</span>
        <IconoAbajo
          width={compacto ? 16 : 18}
          height={compacto ? 16 : 18}
          aria-hidden="true"
          className={`shrink-0 text-texto-suave transition-transform ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {abierto && (
        <ul
          ref={lista}
          id={idLista}
          role="listbox"
          aria-label={aria['aria-label']}
          aria-labelledby={aria['aria-label'] ? undefined : id}
          // El foco se queda en el botón aunque se haga clic en la lista o en su barra
          onMouseDown={(e) => e.preventDefault()}
          className={`absolute left-0 z-40 max-h-72 w-full overflow-y-auto rounded-tema border border-borde-tarjeta bg-tarjeta p-1.5 text-sm sombra-elevada ${
            arriba ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {opciones.map((opcion, i) => (
            <li
              key={opcion.valor}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={i === elegida}
              aria-disabled={opcion.deshabilitada || undefined}
              onMouseMove={() => {
                if (!opcion.deshabilitada && i !== activa) setActiva(i)
              }}
              onClick={() => elegir(i)}
              // El borde solo se ve en alto contraste, donde el fondo resaltado no se distingue
              className={`flex items-center justify-between gap-3 rounded-tema border ${compacto ? 'px-2.5 py-1.5' : 'px-3 py-2'} ${
                i === activa ? 'border-borde-tarjeta bg-superficie' : 'border-transparent'
              } ${
                opcion.deshabilitada
                  ? 'cursor-not-allowed text-texto-suave opacity-50'
                  : `cursor-pointer ${i === elegida ? 'font-semibold text-acento' : 'text-texto'}`
              }`}
            >
              <span className="min-w-0 break-words">{opcion.etiqueta}</span>
              {i === elegida && !compacto && <IconoListo width={16} height={16} aria-hidden="true" className="shrink-0 text-primario" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type PropsSelectorCampo<T extends FieldValues> = Omit<PropsSelector, 'valor' | 'alCambiar' | 'alSalir' | 'ref'> & {
  control: Control<T>
  name: FieldPath<T>
}

/** El selector conectado a un campo de react-hook-form: `<SelectorCampo control={control} name="rol_id" ... />`. */
export function SelectorCampo<T extends FieldValues>({ control, name, ...props }: PropsSelectorCampo<T>) {
  const {
    field: { ref, value, onChange, onBlur },
  } = useController({ control, name })
  return <Selector {...props} ref={ref} valor={value == null ? '' : String(value)} alCambiar={onChange} alSalir={onBlur} />
}
