import { Link } from 'react-router'
import { Boton } from '@/compartido/ui/Boton'
import { CampoOcupacional } from '@/compartido/ui/CampoOcupacional'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { type ComponenteIcono, IconoGraduacion, IconoMedalla, IconoObjetivo, IconoVision } from '@/compartido/ui/Iconos'
import { TextoPlegable } from '@/compartido/ui/TextoPlegable'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import equipoFcee from '../fotos/equipo-fcee.webp'
import { useInformacion, usePlanEstudios } from '../hooks/useInformacion'

const TARJETA = 'rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave md:p-8'

function TarjetaCorta({ titulo, texto, icono }: { titulo: string; texto: string; icono: ComponenteIcono }) {
  return (
    <article className={TARJETA}>
      <ChipIcono icono={icono} tamano="lg" />
      <h2 className="mt-5 text-2xl text-titulo">{titulo}</h2>
      <TextoPlegable texto={texto} className="mt-3" />
    </article>
  )
}

/** Misión o visión junto a la foto: texto grande, con su ícono sin fondo. */
function Declaracion({ id, titulo, texto, icono }: { id: string; titulo: string; texto: string; icono: ComponenteIcono }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <ChipIcono icono={icono} tamano="lg" />
        <h2 id={id} className="text-2xl text-titulo md:text-3xl">
          {titulo}
        </h2>
      </div>
      <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-texto md:text-xl md:leading-relaxed">{texto}</p>
    </div>
  )
}

/** Plan vigente en cifras: sale de la malla curricular (la fuente oficial del plan), no se escribe a mano. */
function PlanEnCifras() {
  const { data: plan } = usePlanEstudios()
  if (!plan) return null

  const cifras = [
    { valor: plan.semestres, etiqueta: 'Semestres' },
    { valor: plan.total_materias, etiqueta: 'Materias' },
    { valor: plan.total_creditos, etiqueta: 'Créditos' },
  ]
  const titulaciones = (plan.titulaciones ?? '').split('\n').map((t) => t.trim()).filter(Boolean)

  return (
    <section aria-labelledby="titulo-plan" className="mb-14 md:mb-20">
      <h2 id="titulo-plan" className="text-2xl text-titulo">
        Plan de estudios {plan.codigo}
      </h2>
      <p className="mt-1 text-texto-suave">
        {plan.nivel}, régimen {plan.sistema.toLowerCase()}.{' '}
        <Link to="/malla-curricular" className="font-semibold text-acento underline-offset-4 hover:underline">
          Ver la malla curricular
        </Link>
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* Tres columnas también en el celular: menos relleno y etiqueta más chica para que «Semestres» quepa en 320 px */}
        <dl className="grid grid-cols-3 gap-2 sm:gap-4">
          {cifras.map(({ valor, etiqueta }) => (
            <div key={etiqueta} className="flex min-w-0 flex-col-reverse rounded-tema border border-borde-tarjeta bg-tarjeta p-3 sombra-suave sm:p-5">
              <dt className="mt-1 text-xs text-texto-suave sm:text-sm">{etiqueta}</dt>
              <dd className="font-titulos text-3xl font-extrabold tabular-nums text-titulo">{valor}</dd>
            </div>
          ))}
        </dl>
        {titulaciones.length > 0 && (
          <ul aria-label="Titulaciones intermedias" className="grid gap-3">
            {titulaciones.map((titulacion) => (
              <li key={titulacion} className="flex items-center gap-3 rounded-tema border border-borde-tarjeta bg-tarjeta p-4 sombra-suave">
                <ChipIcono icono={IconoMedalla} tamano="sm" />
                <span className="text-sm font-semibold text-titulo">{titulacion}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

/** Página pública de información académica (CU-16). */
export function PaginaInformacion() {
  const { data: informacion, isPending, isError, refetch } = useInformacion()

  if (isPending) return <EstadoCarga />

  if (isError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <MensajeError texto="No se pudo cargar la información académica." />
        <Boton variante="borde" onClick={() => refetch()}>
          Reintentar
        </Boton>
      </div>
    )
  }

  const vacio =
    !informacion ||
    (!informacion.mision && !informacion.vision && !informacion.perfil_profesional && !informacion.objetivos)

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina
        titulo="Información Académica"
        subtitulo="El plan de estudios, la misión, la visión, el perfil profesional y el campo ocupacional de la Carrera."
      />

      <PlanEnCifras />

      {vacio ? (
        <div className="rounded-tema border border-borde bg-fondo p-10 text-center">
          <p className="text-lg font-semibold text-titulo">Aún no se ha registrado la información académica de la carrera.</p>
          <p className="mt-2 text-sm text-texto-suave">
            La información estará disponible una vez que la dirección de carrera complete su publicación.
          </p>
        </div>
      ) : (
        <div className="space-y-14 md:space-y-20">
          {/* Misión y visión sobre el fondo de la página, junto a una foto del equipo de la FCEE */}
          {(informacion.mision || informacion.vision) && (
            <section aria-label="Misión y visión">
              <div className="grid items-center gap-10 lg:grid-cols-[5fr_6fr] lg:gap-16">
                <img
                  src={equipoFcee}
                  alt="Docentes y personal de la Facultad de Ciencias Económicas y Empresariales frente al bus de la Facultad"
                  loading="lazy"
                  className="aspect-[16/10] w-full rounded-tema object-cover object-[50%_60%] lg:aspect-square"
                />
                <div className="space-y-12">
                  {informacion.mision && <Declaracion id="titulo-mision" titulo="Misión" texto={informacion.mision} icono={IconoObjetivo} />}
                  {informacion.vision && (
                    <div className={informacion.mision ? 'border-t border-borde pt-12' : ''}>
                      <Declaracion id="titulo-vision" titulo="Visión" texto={informacion.vision} icono={IconoVision} />
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <section aria-label="Perfil y campo ocupacional" className="grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:gap-10">
            {informacion.perfil_profesional && (
              <div className="self-start">
                <TarjetaCorta titulo="Perfil profesional" texto={informacion.perfil_profesional} icono={IconoGraduacion} />
              </div>
            )}
            {/* En este módulo la columna «objetivos» guarda el campo ocupacional (así lo rotula el panel) */}
            {informacion.objetivos && <CampoOcupacional texto={informacion.objetivos} />}
          </section>

          {informacion.actualizado_en && <p className="text-xs text-texto-suave">Última actualización: {informacion.actualizado_en}</p>}
        </div>
      )}
    </div>
  )
}
