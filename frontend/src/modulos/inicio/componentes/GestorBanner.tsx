import { mensajeDeError } from '@/compartido/api/errores'
import { IconoBajar, IconoEliminar, IconoSubir } from '@/compartido/ui/Iconos'
import { eliminarBanner, ordenarBanners } from '../api'
import type { Banner } from '../tipos'
import { useGuardarInicio } from '../useInicio'
import { BotonConfirmar } from './BotonConfirmar'
import { SubirBanner } from './SubirBanner'

const MAXIMO_BANNERS = 5
const ACCION = 'grid h-9 w-9 place-items-center rounded-tema border border-borde text-texto-suave transition-colors hover:text-titulo disabled:pointer-events-none disabled:opacity-30'

/** Cada cambio del banner se guarda al momento: subir, ordenar y eliminar. */
export function GestorBanner({ banners }: { banners: Banner[] }) {
  const ordenar = useGuardarInicio(ordenarBanners)
  const eliminar = useGuardarInicio(eliminarBanner)
  const error = ordenar.error ?? eliminar.error

  function mover(desde: number, hasta: number) {
    const ids = banners.map((b) => b.id)
    ids.splice(hasta, 0, ...ids.splice(desde, 1))
    ordenar.mutate(ids)
  }

  return (
    <div className="space-y-5 rounded-tema border border-borde bg-fondo p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-titulo">Banner</h2>
          <p className="text-sm text-texto-suave">Imágenes en la parte superior de la portada, en este orden. Sin imágenes, el banner no se muestra.</p>
        </div>
        <span className="text-sm font-semibold text-texto-suave">
          {banners.length} de {MAXIMO_BANNERS}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-acento">
          {mensajeDeError(error)}
        </p>
      )}

      <ol className="space-y-3">
        {banners.map((banner, i) => (
          <li key={banner.id} className="flex flex-col gap-4 rounded-tema border border-borde p-3 sm:flex-row sm:items-center">
            <img src={banner.imagen} alt="" className="aspect-[21/8] w-full rounded-tema object-cover sm:w-56" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-titulo">{banner.texto_alternativo}</p>
              <p className="truncate text-texto-suave">{banner.enlace ?? 'Sin enlace'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={ACCION} disabled={i === 0 || ordenar.isPending} onClick={() => mover(i, i - 1)} aria-label={`Subir la imagen ${i + 1}`}>
                <IconoSubir width={18} height={18} />
              </button>
              <button
                type="button"
                className={ACCION}
                disabled={i === banners.length - 1 || ordenar.isPending}
                onClick={() => mover(i, i + 1)}
                aria-label={`Bajar la imagen ${i + 1}`}
              >
                <IconoBajar width={18} height={18} />
              </button>
              <BotonConfirmar pregunta="¿Eliminar esta imagen?" confirmar="Sí, eliminar" ocupado={eliminar.isPending} alConfirmar={() => eliminar.mutate(banner.id)}>
                <IconoEliminar width={16} height={16} /> Eliminar
              </BotonConfirmar>
            </div>
          </li>
        ))}
      </ol>

      <SubirBanner deshabilitado={banners.length >= MAXIMO_BANNERS} />
    </div>
  )
}
