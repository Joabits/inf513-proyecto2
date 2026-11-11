import logo from './carrera-logo.webp'

/**
 * Logo de la Carrera de Administración de Empresas: el círculo completo, con el fondo transparente.
 * Es un disco blanco con sus propios colores, así que sirve igual de día, de noche y en alto contraste.
 * El pie, el panel y el ingreso usan el de la FCEE (LogoFcee).
 */
export function LogoCarrera({ className = '' }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Carrera de Administración de Empresas - Universidad Autónoma Gabriel René Moreno"
      className={`aspect-square w-auto ${className}`}
      width={512}
      height={512}
    />
  )
}

/**
 * Logo + nombre de la Carrera, para la cabecera del portal.
 * El nombre va en dos líneas para que ocupe poco ancho y el menú siga entrando en la fila.
 */
export function MarcaCarrera() {
  return (
    <span className="flex items-center gap-2.5 lg:gap-3">
      <LogoCarrera className="h-12 lg:h-14" />
      <span className="font-titulos text-[0.9375rem] font-extrabold leading-[1.15] text-titulo lg:text-base">
        Administración
        <br />
        de Empresas
      </span>
    </span>
  )
}
