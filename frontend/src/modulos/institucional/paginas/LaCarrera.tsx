import { Link } from 'react-router'
import { Boton } from '@/compartido/ui/Boton'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import {
  type ComponenteIcono,
  IconoCalendario,
  IconoEmpresa,
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
    <article className="rounded-tema border border-borde bg-tarjeta p-6 sombra-suave md:p-8">
      <ChipIcono icono={icono} tamano="lg" />
      <h2 className="mt-5 text-2xl text-titulo">{titulo}</h2>
      <Parrafos texto={texto} className="mt-3" />
    </article>
  )
}

/** Página pública «La Carrera» (información institucional, CU-27). */
export function LaCarrera() {
  const { data, isPending, isError, refetch } = useInstitucional()

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
              <div key={etiqueta} className="flex items-center gap-4 rounded-tema border border-borde bg-tarjeta p-4 sombra-suave">
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

      <section aria-label="Misión y visión" className="banda banda-seccion mt-14 grid gap-6 py-14 md:mt-20 md:grid-cols-2 md:py-16">
        <TarjetaTexto titulo="Misión" texto={contenido.mision} icono={IconoObjetivo} />
        <TarjetaTexto titulo="Visión" texto={contenido.vision} icono={IconoVision} />
      </section>

      <section aria-labelledby="titulo-historia" className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div>
          <p className={ANTETITULO}>Nuestra historia</p>
          <h2 id="titulo-historia" className="mt-2 text-3xl text-titulo">
            Reseña histórica
          </h2>
          <Parrafos texto={contenido.resena_historica} className="mt-5" />
        </div>
        {hitos.length > 0 && (
          <div className="self-start rounded-tema border border-borde bg-tarjeta p-6 sombra-suave md:p-8">
            <h2 className="mb-7 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-titulo">
              <IconoHistorial width={18} height={18} aria-hidden="true" className="text-acento" /> Hitos
            </h2>
            <LineaTiempo hitos={hitos} />
          </div>
        )}
      </section>

      <section aria-label="Perfil y campo ocupacional" className="mt-14 grid gap-6 md:mt-20 md:grid-cols-2">
        <TarjetaTexto titulo="Perfil profesional" texto={contenido.perfil_profesional} icono={IconoGraduacion} />
        <TarjetaTexto titulo="Campo ocupacional" texto={contenido.campo_ocupacional} icono={IconoEmpresa} />
      </section>

      {/* Invitación final: tarjeta sobre el fondo del modo */}
      <section className="relative mt-16 overflow-hidden rounded-tema border border-borde bg-tarjeta p-6 sombra-suave md:mt-20 md:p-10">
        <span aria-hidden="true" className="adorno pointer-events-none absolute -right-24 -top-20 hidden h-80 w-80 rounded-full bg-seccion md:block" />
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
