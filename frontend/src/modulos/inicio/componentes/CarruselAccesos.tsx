import { useEffect, useRef, useState } from 'react'
import { FOTOS_ENCABEZADO } from '@/compartido/encabezados/fotosEncabezado'
import { iconoDeRuta } from '@/compartido/menu/iconosRuta'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { IconoAnterior, IconoExterno, IconoFlecha, IconoPausa, IconoReproducir, IconoSiguiente } from '@/compartido/ui/Iconos'
import type { Acceso } from '../tipos'
import { EnlaceInicio } from './EnlaceInicio'

/**
 * Ancho de cada tarjeta: en el celular se ve una y se asoma la siguiente (así se nota que se desliza),
 * en tablet dos y en pantallas grandes cuatro. El 0.75rem descuenta la separación entre tarjetas.
 */
const ANCHO = 'basis-[80%] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)]'

/** Cada posición se queda 3 segundos: son accesos para recorrer de un vistazo, no fotos para mirar con calma. */
const INTERVALO_MS = 3000

/** Flechas y pausa: solo el trazo del ícono, sin círculo de fondo ni sombra. */
const CONTROL =
  'grid h-8 w-8 place-items-center rounded-full text-texto-suave transition-colors hover:text-acento ' +
  'focus-visible:outline-2 focus-visible:outline-titulo'

const reducirMovimiento = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Distancia entre el inicio de una tarjeta y la siguiente, y hasta dónde se puede desplazar la pista. */
function medidas(pista: HTMLElement) {
  const [a, b] = pista.children as unknown as HTMLElement[]
  const paso = a && b ? b.offsetLeft - a.offsetLeft : pista.clientWidth
  return { paso: Math.max(1, paso), tope: pista.scrollWidth - pista.clientWidth }
}

function desplazarA(pista: HTMLElement, posicion: number) {
  const { paso, tope } = medidas(pista)
  pista.scrollTo({ left: Math.min(posicion * paso, tope), behavior: reducirMovimiento() ? 'auto' : 'smooth' })
}

function Tarjeta({ acceso }: { acceso: Acceso }) {
  const externo = !acceso.ruta.startsWith('/')
  const foto = externo ? undefined : FOTOS_ENCABEZADO[acceso.ruta.split(/[?#]/)[0]]

  // Con foto (la misma de la sección a la que lleva): el título va encima, sobre un velo azul parejo
  // (el manual de marca no permite degradados); al pasar el cursor el velo se aclara y la foto se acerca
  if (foto) {
    return (
      <EnlaceInicio
        destino={acceso.ruta}
        className="group relative block aspect-[4/3] overflow-hidden rounded-tema sombra-suave transition-shadow hover:sombra-elevada focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
      >
        <img
          src={foto.srcAcceso ?? foto.src}
          alt=""
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-marino-oscuro/45 transition-colors group-hover:bg-marino-oscuro/25" />
        <span className="absolute inset-x-0 bottom-0 block p-4 sm:p-5">
          <span aria-hidden="true" className="mb-2 block h-1 w-8 rounded-full bg-primario" />
          <span className="block font-titulos text-lg font-bold leading-tight text-white [text-shadow:0_1px_3px_rgb(10_10_10/0.6)] sm:text-xl">
            {acceso.titulo}
          </span>
        </span>
        <span className="sr-only">: {acceso.descripcion}</span>
      </EnlaceInicio>
    )
  }

  // Sin foto (enlace externo o sección sin foto): tarjeta con ícono del mismo tamaño
  const Icono = (externo ? IconoExterno : iconoDeRuta(acceso.ruta)) ?? IconoFlecha
  return (
    <EnlaceInicio
      destino={acceso.ruta}
      className="group flex aspect-[4/3] flex-col justify-end rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave transition hover:border-primario hover:sombra-elevada"
    >
      <ChipIcono icono={Icono} tamano="lg" />
      <span className="mt-4 block font-titulos text-lg font-bold leading-tight text-titulo group-hover:text-acento sm:text-xl">{acceso.titulo}</span>
      <span className="mt-1 block text-sm text-texto-suave line-clamp-2">{acceso.descripcion}</span>
    </EnlaceInicio>
  )
}

/**
 * Accesos rápidos de la portada (CU-12) en carrusel. Avanza solo, de a una tarjeta, y al llegar al final vuelve
 * al principio; también se desliza con el dedo, con las flechas o con los puntos.
 *
 * - Se detiene con el cursor encima o al navegar con el teclado, y no corre mientras no está a la vista.
 * - Tiene botón de pausa: lo que se mueve solo más de 5 s debe poder detenerse (WCAG 2.2.2).
 * - Con «reducir movimiento» del sistema no avanza solo.
 *
 * Hay un punto por posición alcanzable: con 8 accesos y 4 a la vista son 5 (de la 1.ª a la 5.ª tarjeta al frente).
 */
export function CarruselAccesos({ accesos }: { accesos: Acceso[] }) {
  const carrusel = useRef<HTMLDivElement>(null)
  const pista = useRef<HTMLUListElement>(null)
  const [primero, setPrimero] = useState(0)
  const [posiciones, setPosiciones] = useState(accesos.length)
  const [pausado, setPausado] = useState(reducirMovimiento)
  const [encima, setEncima] = useState(false)
  const [enfocado, setEnfocado] = useState(false)
  // Sin IntersectionObserver (navegadores muy viejos) se da por visible
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  const avanza = posiciones > 1 && !pausado && !encima && !enfocado && visible

  // Cuántas posiciones hay y en cuál está la pista
  const actualizar = () => {
    const p = pista.current
    if (!p) return
    const { paso, tope } = medidas(p)
    const total = Math.max(1, Math.ceil(tope / paso - 0.05) + 1)
    setPosiciones(total)
    setPrimero(p.scrollLeft >= tope - 4 ? total - 1 : Math.min(total - 1, Math.round(p.scrollLeft / paso)))
  }

  useEffect(() => {
    actualizar()
    window.addEventListener('resize', actualizar)
    return () => window.removeEventListener('resize', actualizar)
  }, [accesos.length])

  useEffect(() => {
    const el = carrusel.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(([entrada]) => setVisible(entrada.isIntersecting), { threshold: 0.5 })
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  const ir = (posicion: number) => {
    if (pista.current) desplazarA(pista.current, (posicion + posiciones) % posiciones)
  }

  // Un temporizador por posición: al moverlo a mano (dedo, flecha o punto) la cuenta vuelve a empezar
  useEffect(() => {
    if (!avanza) return
    const temporizador = window.setTimeout(() => {
      if (pista.current) desplazarA(pista.current, primero + 1 >= posiciones ? 0 : primero + 1)
    }, INTERVALO_MS)
    return () => window.clearTimeout(temporizador)
  }, [avanza, primero, posiciones])

  return (
    <div
      ref={carrusel}
      aria-roledescription="carrusel"
      aria-label="Accesos rápidos"
      className="mt-8"
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setEncima(true)
      }}
      onPointerLeave={() => setEncima(false)}
      // Solo el foco del teclado lo detiene: un clic en una flecha también enfoca el botón, y no debe pausarlo
      onFocus={(e) => {
        if (e.target.matches(':focus-visible')) setEnfocado(true)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEnfocado(false)
      }}
    >
      <ul
        ref={pista}
        onScroll={actualizar}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-0 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {accesos.map((acceso) => (
          <li key={`${acceso.titulo}-${acceso.ruta}`} className={`shrink-0 snap-start ${ANCHO}`}>
            <Tarjeta acceso={acceso} />
          </li>
        ))}
      </ul>

      {posiciones > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1">
          <button type="button" aria-label="Accesos anteriores" onClick={() => ir(primero - 1)} className={CONTROL}>
            <IconoAnterior strokeWidth={1.75} aria-hidden="true" />
          </button>

          {Array.from({ length: posiciones }, (_, i) => (
            // Zona táctil de 24 px; el punto visible es más chico
            <button
              key={i}
              type="button"
              aria-label={`Ir a ${accesos[i]?.titulo ?? `la posición ${i + 1}`}`}
              aria-current={i === primero}
              onClick={() => ir(i)}
              className="grid h-6 place-items-center px-1 focus-visible:outline-2 focus-visible:outline-titulo"
            >
              {i === primero ? (
                // El punto elegido se alarga y se llena mientras dura la posición, igual que en el banner
                <span className="block h-2.5 w-7 overflow-hidden rounded-full bg-primario/25">
                  <span
                    key={`${primero}-${avanza}`}
                    className="block h-full origin-left rounded-full bg-primario"
                    style={avanza ? { animation: `progreso-banner ${INTERVALO_MS}ms linear forwards` } : { transform: 'scaleX(1)' }}
                  />
                </span>
              ) : (
                <span className="block h-2.5 w-2.5 rounded-full bg-borde transition-colors hover:bg-titulo" />
              )}
            </button>
          ))}

          <button type="button" aria-label="Accesos siguientes" onClick={() => ir(primero + 1)} className={CONTROL}>
            <IconoSiguiente strokeWidth={1.75} aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label={pausado ? 'Reanudar los accesos' : 'Pausar los accesos'}
            aria-pressed={pausado}
            onClick={() => setPausado((p) => !p)}
            className={`${CONTROL} ml-1 h-6 w-6`}
          >
            {pausado ? (
              <IconoReproducir width={13} height={13} fill="currentColor" aria-hidden="true" />
            ) : (
              <IconoPausa width={13} height={13} fill="currentColor" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
