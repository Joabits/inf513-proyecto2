import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type Ref } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { CLASE_CAJA } from './Campo'
import { IconoAnterior, IconoCalendario, IconoSiguiente } from './Iconos'
import { Selector } from './Selector'
import { useClicFuera } from './useClicFuera'

export interface PropsSelectorFecha {
  /** Fecha como AAAA-MM-DD, o vacío si no hay ninguna. */
  valor: string
  alCambiar: (valor: string) => void
  alSalir?: () => void
  /** Primer y último día que se pueden elegir (AAAA-MM-DD). */
  min?: string
  max?: string
  /** No deja elegir días posteriores a hoy (en lugar de `max`). */
  hastaHoy?: boolean
  textoVacio?: string
  /** Fecha opcional: el calendario ofrece «Borrar». */
  opcional?: boolean
  deshabilitado?: boolean
  id?: string
  className?: string
  ref?: Ref<HTMLButtonElement>
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

const LOCAL = 'es-BO'
const FORMATO_FECHA = new Intl.DateTimeFormat(LOCAL, { day: 'numeric', month: 'long', year: 'numeric' })
const FORMATO_DIA = new Intl.DateTimeFormat(LOCAL, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const conMayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)
const MESES = Array.from({ length: 12 }, (_, mes) => conMayuscula(new Intl.DateTimeFormat(LOCAL, { month: 'long' }).format(new Date(2024, mes, 1))))
// La semana empieza en lunes; el 1 de enero de 2024 fue lunes
const DIAS = Array.from({ length: 7 }, (_, dia) => new Intl.DateTimeFormat(LOCAL, { weekday: 'long' }).format(new Date(2024, 0, 1 + dia)))
const ANIOS_ATRAS = 100
const ANIOS_ADELANTE = 10

const dos = (numero: number) => String(numero).padStart(2, '0')
const aIso = (fecha: Date) => `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`

/** Fecha local a partir de AAAA-MM-DD; null si el texto no es una fecha real. */
function deIso(texto: string) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto)
  if (!partes) return null
  const [anio, mes, dia] = partes.slice(1).map(Number)
  const fecha = new Date(anio, mes - 1, dia)
  return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia ? fecha : null
}

const sumarDias = (fecha: Date, dias: number) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias)

/** El mismo día en otro mes; si ese mes es más corto, su último día. */
function sumarMeses(fecha: Date, meses: number) {
  const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + meses + 1, 0)
  return new Date(ultimoDia.getFullYear(), ultimoDia.getMonth(), Math.min(fecha.getDate(), ultimoDia.getDate()))
}

const diaDeSemana = (fecha: Date) => (fecha.getDay() + 6) % 7 // lunes = 0

/** Las seis semanas (de lunes a domingo) que cubren el mes de la fecha. */
function semanasDe(fecha: Date) {
  const primero = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
  const inicio = sumarDias(primero, -diaDeSemana(primero))
  return Array.from({ length: 6 }, (_, semana) =>
    Array.from({ length: 7 }, (_, dia) => {
      const delDia = sumarDias(inicio, semana * 7 + dia)
      return { fecha: delDia, iso: aIso(delDia), delMes: delDia.getMonth() === fecha.getMonth() }
    }),
  )
}

const BOTON_REDONDO =
  'grid h-9 w-9 shrink-0 place-items-center rounded-full text-titulo transition-colors hover:bg-superficie disabled:cursor-not-allowed disabled:opacity-40'
const BOTON_TEXTO =
  'rounded-full px-3 py-1.5 text-sm font-semibold text-titulo transition-colors hover:bg-superficie disabled:cursor-not-allowed disabled:opacity-40'

/**
 * Campo de fecha del portal, en lugar del <input type="date"> del navegador:
 *   <SelectorFecha id="fecha" valor={fecha} alCambiar={setFecha} opcional />
 * El valor es AAAA-MM-DD, igual que el del campo nativo. Con react-hook-form se usa <SelectorFechaCampo>.
 *
 * Teclado en el calendario: flechas para moverse por días y semanas, Inicio y Fin para ir al lunes o al domingo,
 * RePág y AvPág para cambiar de mes (con Mayús, de año), Enter para elegir y Escape para cerrar.
 */
export function SelectorFecha(props: PropsSelectorFecha) {
  const { valor, alCambiar, alSalir, min, hastaHoy = false, textoVacio = 'Seleccione una fecha', opcional = false, deshabilitado, id, className = '', ref, ...aria } = props
  const caja = useRef<HTMLDivElement>(null)
  const enfocarDia = useRef(false)
  const [abierto, setAbierto] = useState(false)
  const [hoy, setHoy] = useState('')
  // Día que recibe el foco del teclado; el calendario muestra su mes
  const [foco, setFoco] = useState('')
  const [lugar, setLugar] = useState({ arriba: false, corrimiento: 0 })

  const elegida = deIso(valor)
  const fechaFoco = deIso(foco)
  const max = hastaHoy ? hoy || undefined : props.max

  const cerrar = useCallback(() => {
    setAbierto(false)
    caja.current?.querySelector<HTMLButtonElement>('[role="combobox"]')?.focus()
  }, [])
  useClicFuera(caja, abierto, cerrar)

  // Al abrir y al moverse con el teclado, el foco va al día correspondiente
  useEffect(() => {
    if (!abierto || !enfocarDia.current) return
    enfocarDia.current = false
    caja.current?.querySelector<HTMLButtonElement>(`[data-dia="${foco}"]`)?.focus()
  }, [abierto, foco])

  const limitar = (iso: string, tope = max) => (min && iso < min ? min : tope && iso > tope ? tope : iso)
  const fueraDeRango = (iso: string) => (!!min && iso < min) || (!!max && iso > max)

  function abrir() {
    const ahora = aIso(new Date())
    const borde = caja.current?.getBoundingClientRect()
    if (borde) {
      // Hacia arriba si abajo no entra; corrido a la izquierda si se saldría de la pantalla
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const ancho = Math.min(21 * rem, window.innerWidth - 2 * rem)
      const abajo = window.innerHeight - borde.bottom
      setLugar({ arriba: abajo < 25 * rem && borde.top > abajo, corrimiento: Math.min(0, window.innerWidth - rem - (borde.left + ancho)) })
    }
    setHoy(ahora)
    setFoco(limitar(elegida ? valor : ahora, hastaHoy ? ahora : props.max))
    enfocarDia.current = true
    setAbierto(true)
  }

  function elegir(iso: string) {
    if (iso !== valor) alCambiar(iso)
    cerrar()
  }

  /** Cambia de mes sin mover el foco: lo usan las flechas y los selectores de la cabecera. */
  function irAlMes(meses: number) {
    if (fechaFoco) setFoco(limitar(aIso(sumarMeses(fechaFoco, meses))))
  }

  function alTeclearDia(e: KeyboardEvent<HTMLTableSectionElement>) {
    if (!fechaFoco) return
    const dias: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    let destino: Date | null = null
    if (e.key in dias) destino = sumarDias(fechaFoco, dias[e.key])
    else if (e.key === 'Home') destino = sumarDias(fechaFoco, -diaDeSemana(fechaFoco))
    else if (e.key === 'End') destino = sumarDias(fechaFoco, 6 - diaDeSemana(fechaFoco))
    else if (e.key === 'PageUp') destino = sumarMeses(fechaFoco, e.shiftKey ? -12 : -1)
    else if (e.key === 'PageDown') destino = sumarMeses(fechaFoco, e.shiftKey ? 12 : 1)
    if (!destino) return
    e.preventDefault()
    enfocarDia.current = true
    setFoco(limitar(aIso(destino)))
  }

  const anio = fechaFoco?.getFullYear() ?? 0
  const mes = fechaFoco?.getMonth() ?? 0
  const anioHoy = Number(hoy.slice(0, 4))
  const primerAnio = Math.min(min ? Number(min.slice(0, 4)) : anioHoy - ANIOS_ATRAS, anio)
  const ultimoAnio = Math.max(max ? Number(max.slice(0, 4)) : anioHoy + ANIOS_ADELANTE, anio)
  const mesIso = foco.slice(0, 7)

  return (
    <div
      ref={caja}
      className={`relative mt-1 ${className}`}
      onBlur={(e) => {
        // El foco salió del campo y de su calendario (por ejemplo, con Tab)
        const destino = e.relatedTarget as Node | null
        if (caja.current?.contains(destino)) return
        if (destino) setAbierto(false)
        alSalir?.()
      }}
    >
      <button
        {...aria}
        ref={ref}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        disabled={deshabilitado}
        onClick={() => {
          if (abierto) setAbierto(false)
          else abrir()
        }}
        onKeyDown={(e) => {
          if (!abierto && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault()
            abrir()
          }
        }}
        className={`${CLASE_CAJA} flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className={`truncate ${elegida ? '' : 'text-texto-suave'}`}>{elegida ? FORMATO_FECHA.format(elegida) : textoVacio}</span>
        <IconoCalendario width={18} height={18} aria-hidden="true" className="shrink-0 text-texto-suave" />
      </button>

      {abierto && fechaFoco && (
        <div
          role="dialog"
          aria-label="Elegir fecha"
          // Enfocable para que un clic en un espacio vacío del calendario no lo cierre
          tabIndex={-1}
          style={{ left: lugar.corrimiento }}
          className={`absolute z-40 w-[min(21rem,calc(100vw-2rem))] rounded-tema border border-borde-tarjeta bg-tarjeta p-3 outline-none sombra-elevada ${
            lugar.arriba ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Mes anterior" disabled={!!min && `${mesIso}-01` <= min} onClick={() => irAlMes(-1)} className={BOTON_REDONDO}>
              <IconoAnterior width={18} height={18} aria-hidden="true" />
            </button>
            <Selector
              compacto
              aria-label="Mes"
              className="min-w-0 flex-1"
              valor={String(mes)}
              alCambiar={(elegido) => irAlMes(Number(elegido) - mes)}
              opciones={MESES.map((nombre, m) => ({
                valor: String(m),
                etiqueta: nombre,
                deshabilitada: (!!min && `${anio}-${dos(m + 1)}-31` < min) || (!!max && `${anio}-${dos(m + 1)}-01` > max),
              }))}
            />
            <Selector
              compacto
              aria-label="Año"
              className="w-[5.75rem] shrink-0"
              valor={String(anio)}
              alCambiar={(elegido) => irAlMes((Number(elegido) - anio) * 12)}
              opciones={Array.from({ length: ultimoAnio - primerAnio + 1 }, (_, i) => ({ valor: String(primerAnio + i), etiqueta: String(primerAnio + i) }))}
            />
            <button type="button" aria-label="Mes siguiente" disabled={!!max && `${mesIso}-31` >= max} onClick={() => irAlMes(1)} className={BOTON_REDONDO}>
              <IconoSiguiente width={18} height={18} aria-hidden="true" />
            </button>
          </div>

          <table role="grid" aria-label={`${MESES[mes]} de ${anio}`} className="mt-2 w-full table-fixed border-collapse text-center text-sm">
            <thead>
              <tr>
                {DIAS.map((dia) => (
                  <th key={dia} scope="col" abbr={dia} className="pb-1 pt-2 text-xs font-semibold text-texto-suave">
                    {dia.slice(0, 2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody onKeyDown={alTeclearDia}>
              {semanasDe(fechaFoco).map((semana) => (
                <tr key={semana[0].iso}>
                  {semana.map((dia) => {
                    const esElegido = dia.iso === valor
                    return (
                      <td key={dia.iso} role="gridcell" aria-selected={esElegido} className="p-0.5">
                        <button
                          type="button"
                          data-dia={dia.iso}
                          tabIndex={dia.iso === foco ? 0 : -1}
                          aria-label={FORMATO_DIA.format(dia.fecha)}
                          aria-current={dia.iso === hoy ? 'date' : undefined}
                          disabled={fueraDeRango(dia.iso)}
                          onClick={() => elegir(dia.iso)}
                          className={`mx-auto grid h-9 w-9 place-items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                            esElegido
                              ? 'bg-chip font-semibold text-sobre-chip'
                              : `hover:bg-superficie ${dia.iso === hoy ? 'font-bold text-acento' : dia.delMes ? 'text-texto' : 'text-texto opacity-45'}`
                          }`}
                        >
                          {dia.fecha.getDate()}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-2 flex items-center justify-between gap-2">
            <button type="button" disabled={fueraDeRango(hoy)} onClick={() => elegir(hoy)} className={BOTON_TEXTO}>
              Hoy
            </button>
            {opcional && valor !== '' && (
              <button type="button" onClick={() => elegir('')} className={BOTON_TEXTO}>
                Borrar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type PropsSelectorFechaCampo<T extends FieldValues> = Omit<PropsSelectorFecha, 'valor' | 'alCambiar' | 'alSalir' | 'ref'> & {
  control: Control<T>
  name: FieldPath<T>
}

/** El selector de fecha conectado a un campo de react-hook-form. */
export function SelectorFechaCampo<T extends FieldValues>({ control, name, ...props }: PropsSelectorFechaCampo<T>) {
  const {
    field: { ref, value, onChange, onBlur },
  } = useController({ control, name })
  return <SelectorFecha {...props} ref={ref} valor={value ?? ''} alCambiar={onChange} alSalir={onBlur} />
}
