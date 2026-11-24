import { Link } from 'react-router'
import { useConfiguracion } from '@/compartido/configuracion/useConfiguracion'
import { Boton } from '@/compartido/ui/Boton'
import { CampoOcupacional } from '@/compartido/ui/CampoOcupacional'
import { TextoPlegable } from '@/compartido/ui/TextoPlegable'
import { VideoYoutube } from '@/compartido/ui/VideoYoutube'
import { idYoutube } from '@/compartido/ui/youtube'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import {
  type ComponenteIcono,
  IconoCalendario,
  IconoFlecha,
  IconoGraduacion,
  IconoHistorial,
  IconoObjetivo,
  IconoResolucion,
  IconoVerificado,
  IconoVision,
} from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { LineaTiempo } from '../componentes/LineaTiempo'
import { fechaLarga, parrafos } from '../formato'
import { useInstitucional } from '../useInstitucional'

const ANTETITULO = 'text-sm font-bold uppercase tracking-widest text-acento'
const BOTON = 'inline-flex items-center justify-center gap-2 rounded-tema px-5 py-3 font-semibold transition-colors'
const ANIO_ACTUAL = new Date().getFullYear()

function Parrafos({ texto, className = '' }: { texto: string; className?: string }) {
  return (
    <div className={`space-y-4 leading-relaxed text-texto ${className}`}>
      {parrafos(texto).map((parrafo, i) => (
        // Texto fijo que no se reordena: la posición sirve como clave
        <p key={i}>{parrafo}</p>
      ))}
    </div>
  )
}

/** Tarjeta con ícono para misión, visión, perfil y campo ocupacional. */
function TarjetaTexto({ titulo, texto, icono }: { titulo: string; texto: string; icono: ComponenteIcono }) {
  return (
    <article className="rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave md:p-8">
      <ChipIcono icono={icono} tamano="lg" />
      <h2 className="mt-5 text-2xl text-titulo">{titulo}</h2>
      <Parrafos texto={texto} className="mt-3" />
    </article>
  )
}

/** Página pública «La Carrera» (información institucional, CU-27). */
export function LaCarrera() {
  const { data, isPending, isError, refetch } = useInstitucional()
  const { data: configuracion } = useConfiguracion()

  // El video institucional sale de los enlaces de interés (CU-28): el primero que sea de YouTube
  const enlaceVideo = configuracion?.enlaces.find((enlace) => idYoutube(enlace.url))
  const video = enlaceVideo ? { id: idYoutube(enlaceVideo.url) as string, titulo: enlaceVideo.titulo } : null

  if (isPending) return <EstadoCarga />

  if (isError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <MensajeError texto="No se pudo cargar la información de la Carrera." />
        <Boton variante="borde" onClick={() => refetch()}>
          Reintentar
        </Boton>
      </div>
    )
  }

  const { contenido, hitos } = data

  if (!contenido) {
    return (
      <div className="mx-auto max-w-6xl">
        <TituloPagina titulo="La Carrera" />
        <p className="text-texto-suave">La información de la Carrera se publicará pronto.</p>
      </div>
    )
  }

  const datos = [
    contenido.fecha_creacion && { etiqueta: 'Fundada el', valor: fechaLarga(contenido.fecha_creacion), icono: IconoCalendario },
    contenido.resolucion && { etiqueta: 'Reconocida mediante', valor: contenido.resolucion, icono: IconoResolucion },
    contenido.acreditacion && { etiqueta: 'Calidad', valor: contenido.acreditacion, icono: IconoVerificado },
  ].filter((dato) => !!dato)

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="La Carrera" subtitulo="Administración de Empresas · Facultad de Ciencias Económicas y Empresariales · UAGRM" />

      <section aria-labelledby="titulo-presentacion" className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div>
          <h2 id="titulo-presentacion" className={ANTETITULO}>
            Presentación
          </h2>
          <Parrafos texto={contenido.presentacion} className="mt-4 text-lg md:text-xl" />
        </div>
        {datos.length > 0 && (
          <dl className="space-y-3 self-start">
            {datos.map(({ etiqueta, valor, icono }) => (
              <div key={etiqueta} className="flex items-center gap-4 rounded-tema border border-borde-tarjeta bg-tarjeta p-4 sombra-suave">
                <ChipIcono icono={icono} />
                <div className="min-w-0">
                  <dt className="text-sm text-texto-suave">{etiqueta}</dt>
                  <dd className="font-bold text-titulo">{valor}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-label="Misión y visión" className="mt-12 grid gap-6 md:mt-20 md:grid-cols-2">
        <TarjetaTexto titulo="Misión" texto={contenido.mision} icono={IconoObjetivo} />
        <TarjetaTexto titulo="Visión" texto={contenido.vision} icono={IconoVision} />
      </section>

      {/* Historia: la línea de tiempo es lo que se ve; la reseña completa queda a un clic. Va sobre una franja gris
          de borde a borde para cortar el blanco entre misión y visión y el perfil */}
      <section aria-labelledby="titulo-historia" className="franja-gris mt-12 py-14 md:mt-20 md:py-20">
        <p className={ANTETITULO}>Nuestra historia</p>
        <h2 id="titulo-historia" className="mt-2 flex items-center gap-3 text-3xl text-titulo">
          <IconoHistorial width={28} height={28} aria-hidden="true" className="text-acento" />
          {contenido.fecha_creacion
            ? `${ANIO_ACTUAL - Number(contenido.fecha_creacion.slice(0, 4))} años formando administradores`
            : 'Reseña histórica'}
        </h2>
        {hitos.length > 0 && (
          <div className="mt-10">
            <LineaTiempo hitos={hitos} horizontal />
          </div>
        )}
        <TextoPlegable texto={contenido.resena_historica} masTexto="Leer la reseña histórica completa" className="mt-10 max-w-3xl" />
      </section>

      {/* Primero el perfil, a todo el ancho; debajo el campo ocupacional con su mosaico de áreas */}
      <section aria-labelledby="titulo-perfil" className="mt-12 space-y-12 md:mt-20 md:space-y-16">
        <article className="rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave md:p-8">
          <ChipIcono icono={IconoGraduacion} tamano="lg" />
          <h2 id="titulo-perfil" className="mt-5 text-2xl text-titulo">
            Perfil profesional
          </h2>
          <TextoPlegable texto={contenido.perfil_profesional} className="mt-3 max-w-4xl" />
        </article>

        <CampoOcupacional texto={contenido.campo_ocupacional} />
      </section>

      {video && (
        <section aria-labelledby="titulo-video" className="mt-12 grid items-center gap-8 md:mt-20 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <div>
            <p className={ANTETITULO}>En video</p>
            <h2 id="titulo-video" className="mt-2 text-3xl text-titulo">
              Conozca la Carrera
            </h2>
            <p className="mt-3 text-texto-suave">{video.titulo}, publicado por la Carrera en su canal oficial.</p>
          </div>
          <VideoYoutube id={video.id} titulo={video.titulo} />
        </section>
      )}

      {/* Invitación final: tarjeta sobre el fondo del modo */}
      <section className="relative mt-12 overflow-hidden rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave md:mt-20 md:p-10">
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="min-w-0">
            <h2 className="text-2xl text-titulo md:text-3xl">¿Quiere estudiar Administración de Empresas?</h2>
            <p className="mt-2 text-texto-suave">Revise el plan de estudios 101-4 y escríbanos si tiene dudas.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:shrink-0 md:flex-nowrap">
            <Link to="/malla-curricular" className={`${BOTON} bg-primario text-sobre-primario hover:bg-marino`}>
              Ver malla curricular <IconoFlecha width={18} height={18} aria-hidden="true" />
            </Link>
            <Link to="/contacto" className={`${BOTON} border border-borde bg-tarjeta text-titulo hover:border-primario hover:text-acento`}>
              Contacto
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
