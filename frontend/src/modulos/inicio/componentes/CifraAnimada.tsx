import { useEffect, useRef, useState } from 'react'

const DURACION_MS = 1600

/** «1970» → 1970; «+500» → 500 con prefijo «+»; «1.200» → 1200 (y se muestra con punto de miles). Si no es número, null. */
function separar(valor: string) {
  const partes = valor.match(/^(\D*)(\d[\d.,]*)(\D*)$/)
  if (!partes) return null
  const [, antes, numero, despues] = partes
  return { antes, despues, fin: Number(numero.replace(/[.,]/g, '')), conMiles: /[.,]/.test(numero) }
}

const desaceleracion = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Cifra de la portada que cuenta desde 0 hasta su valor la primera vez que aparece en pantalla (al entrar a la web,
 * si ya está a la vista). Termina siempre en el texto exacto que cargó el personal.
 * Con «reducir movimiento» del sistema se muestra el valor final directamente.
 * El lector de pantalla lee solo el valor final, nunca los números intermedios.
 */
export function CifraAnimada({ valor }: { valor: string }) {
  const partes = separar(valor)
  const ref = useRef<HTMLSpanElement>(null)
  const [actual, setActual] = useState<number | null>(() => {
    if (!partes) return null
    const reducir = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return reducir ? null : 0
  })
  const animar = actual !== null

  useEffect(() => {
    const elemento = ref.current
    const datos = separar(valor)
    if (!animar || !datos || !elemento) return

    let cuadro = 0
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return
        observador.disconnect()
        const inicio = performance.now()
        const paso = (ahora: number) => {
          const avance = Math.min(1, (ahora - inicio) / DURACION_MS)
          setActual(Math.round(datos.fin * desaceleracion(avance)))
          if (avance < 1) cuadro = requestAnimationFrame(paso)
          else setActual(null) // al final, el texto original tal cual
        }
        cuadro = requestAnimationFrame(paso)
      },
      { threshold: 0.4 },
    )
    observador.observe(elemento)

    return () => {
      observador.disconnect()
      cancelAnimationFrame(cuadro)
    }
  }, [valor, animar])

  if (!partes || actual === null) return <span ref={ref}>{valor}</span>

  const visible = `${partes.antes}${partes.conMiles ? actual.toLocaleString('es-BO') : actual}${partes.despues}`
  return (
    <span ref={ref}>
      <span aria-hidden="true">{visible}</span>
      <span className="sr-only">{valor}</span>
    </span>
  )
}
