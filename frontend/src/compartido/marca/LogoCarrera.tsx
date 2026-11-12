import logo from './carrera-logo.webp'

/**
 * Logo de la Carrera de Administración de Empresas: el círculo completo, con el fondo transparente.
 * Es un disco blanco con sus propios colores, así que sirve igual de día, de noche y en alto contraste.
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
 * Logo + nombre de la Carrera: cabecera y pie del portal, panel de gestión, ingreso y página de error.
 * El nombre va en dos líneas para que ocupe poco ancho y el menú siga entrando en la fila.
 */
export function MarcaCarrera({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 lg:gap-3 ${className}`}>
      <LogoCarrera className="h-12 lg:h-14" />
      <span className="font-titulos text-[0.9375rem] font-extrabold leading-[1.15] text-titulo lg:text-base">
        Administración
        <br />
        de Empresas
      </span>
    </span>
  )
}
