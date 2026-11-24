import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import type { Banner } from '../tipos'
import { EnlaceInicio } from './EnlaceInicio'

/** Cada imagen se queda 6 segundos. */
const INTERVALO_MS = 6000

const reducirMovimiento = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Carrusel de la portada: avanza solo y se maneja con puntos (sin flechas ni contador).
 *
 * - Se detiene mientras el cursor está encima o se navega con el teclado, para que nadie pierda lo que lee.
 * - Tiene un botón de pausa: todo lo que se mueve solo más de 5 s debe poder detenerse (WCAG 2.2.2).
 * - Con «reducir movimiento» del sistema no avanza solo.
 * - En el celular se desliza con el dedo; con el teclado, las flechas izquierda y derecha.
 *
 * Va dentro de la columna de la página, con la proporción de las imágenes (8:3, 1920 × 720 px): se adapta a
 * cualquier pantalla sin estirarse ni recortar la foto. Antes iba de borde a borde con una altura fija y, en pantallas
 * anchas, cortaba arriba y abajo. Los puntos van debajo de la imagen, para no tapar textos de la foto.
 */
export function BannerInicio({ banners }: { banners: Banner[] }) {
  const total = banners.length
  const [elegido, setElegido] = useState(0)
  const [pausado, setPausado] = useState(reducirMovimiento)
  const [encima, setEncima] = useState(false)
  const inicioToque = useRef<number | null>(null)

  const actual = Math.min(elegido, total - 1)
  const avanza = total > 1 && !pausado && !encima
  const ir = (i: number) => setElegido((i + total) % total)

  // Un temporizador por imagen: al elegir una a mano, la cuenta vuelve a empezar
  useEffect(() => {
    if (!avanza) return
    const temporizador = window.setTimeout(() => setElegido((i) => (i + 1) % total), INTERVALO_MS)
    return () => window.clearTimeout(temporizador)
  }, [avanza, actual, total])

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Imágenes de la Carrera"
      className="mb-10 md:mb-14"
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={() => setEncima(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEncima(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') ir(actual - 1)
        if (e.key === 'ArrowRight') ir(actual + 1)
      }}
      onTouchStart={(e) => {
        inicioToque.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (inicioToque.current === null) return
        const distancia = e.changedTouches[0].clientX - inicioToque.current
        if (Math.abs(distancia) > 40) ir(actual + (distancia < 0 ? 1 : -1))
        inicioToque.current = null
      }}
    >
      {/* Mientras avanza solo no se anuncia cada cambio; detenido, el lector de pantalla sí lee la imagen elegida */}
      <div aria-live={avanza ? 'off' : 'polite'} className="relative aspect-[8/3] overflow-hidden rounded-tema bg-superficie sombra-suave">
        {banners.map((banner, i) => {
          const imagen = (
            <img
              src={banner.imagen}
              alt={banner.texto_alternativo}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover"
            />
          )

          return (
            <div
              key={banner.id}
              inert={i !== actual}
              aria-hidden={i !== actual}
              className={`absolute inset-0 motion-safe:transition-opacity motion-safe:duration-700 ${i === actual ? 'opacity-100' : 'opacity-0'}`}
            >
              {banner.enlace ? <EnlaceInicio destino={banner.enlace}>{imagen}</EnlaceInicio> : imagen}
            </div>
          )
        })}
      </div>

      {total > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1">
          {banners.map((banner, i) => (
            // Zona táctil de 24 px; el punto visible es más chico
            <button
              key={banner.id}
              type="button"
              aria-label={`Imagen ${i + 1} de ${total}: ${banner.texto_alternativo}`}
              aria-current={i === actual}
              onClick={() => ir(i)}
              className="grid h-6 place-items-center px-1 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-titulo"
            >
              {i === actual ? (
                // El punto elegido se alarga y se llena mientras dura la imagen
                <span className="block h-2.5 w-9 overflow-hidden rounded-full bg-primario/25">
                  <span
                    key={`${actual}-${avanza}`}
                    className="block h-full origin-left rounded-full bg-primario"
                    style={
                      avanza
                        ? { animation: `progreso-banner ${INTERVALO_MS}ms linear forwards` }
                        : { transform: 'scaleX(1)' }
                    }
                  />
                </span>
              ) : (
                <span className="block h-2.5 w-2.5 rounded-full bg-borde transition-colors hover:bg-titulo" />
              )}
            </button>
          ))}

          <button
            type="button"
            aria-label={pausado ? 'Reanudar el carrusel' : 'Pausar el carrusel'}
            aria-pressed={pausado}
            onClick={() => setPausado((p) => !p)}
            className="ml-1 grid h-6 w-6 place-items-center rounded-full text-texto-suave transition-colors hover:text-acento focus-visible:outline-2 focus-visible:outline-titulo"
          >
            {pausado ? <Play width={13} height={13} fill="currentColor" aria-hidden="true" /> : <Pause width={13} height={13} fill="currentColor" aria-hidden="true" />}
          </button>
        </div>
      )}
    </section>
  )
}
