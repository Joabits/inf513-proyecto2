import { Link } from 'react-router'
import { IconoFlecha } from '@/compartido/ui/Iconos'

const BOTON = 'inline-flex items-center justify-center gap-2 rounded-tema px-5 py-3 font-semibold transition-colors'

/** Cierre de la portada: la invitación a estudiar, igual que al final de La Carrera. */
export function InvitacionInicio() {
  return (
    <section
      aria-labelledby="titulo-invitacion"
      className="mt-12 rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave md:mt-20 md:p-10"
    >
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="min-w-0">
          <h2 id="titulo-invitacion" className="text-2xl text-titulo md:text-3xl">
            ¿Quiere estudiar Administración de Empresas?
          </h2>
          <p className="mt-2 text-texto-suave">Revise el plan de estudios y escríbanos si tiene dudas.</p>
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
  )
}
