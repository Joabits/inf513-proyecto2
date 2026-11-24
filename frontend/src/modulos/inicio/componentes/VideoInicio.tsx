import { Link } from 'react-router'
import { useConfiguracion } from '@/compartido/configuracion/useConfiguracion'
import { IconoFlecha } from '@/compartido/ui/Iconos'
import { VideoYoutube } from '@/compartido/ui/VideoYoutube'
import { idYoutube } from '@/compartido/ui/youtube'

/**
 * «Conozca la Carrera» en la portada: el mismo video que muestra La Carrera, que sale de los enlaces de interés
 * (CU-28): el primero que sea de YouTube. Si no hay ninguno, la sección no aparece. Va sobre la franja gris para
 * cortar el blanco de la portada.
 */
export function VideoInicio() {
  const { data } = useConfiguracion()
  const enlace = data?.enlaces.find((e) => idYoutube(e.url))
  const id = enlace ? idYoutube(enlace.url) : null
  if (!enlace || !id) return null

  return (
    <section aria-labelledby="titulo-video-inicio" className="franja-gris mt-12 py-14 md:mt-20 md:py-20">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-acento">En video</p>
          <h2 id="titulo-video-inicio" className="mt-2 text-3xl text-titulo md:text-4xl">
            Conozca la Carrera
          </h2>
          <p className="mt-3 text-texto-suave md:text-lg">{enlace.titulo}, publicado por la Carrera en su canal oficial.</p>
          <Link to="/carrera" className="mt-6 inline-flex items-center gap-2 font-semibold text-acento underline-offset-4 hover:underline">
            Más sobre la Carrera <IconoFlecha width={18} height={18} aria-hidden="true" />
          </Link>
        </div>
        <VideoYoutube id={id} titulo={enlace.titulo} />
      </div>
    </section>
  )
}
