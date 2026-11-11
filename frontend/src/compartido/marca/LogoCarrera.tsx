import logo from './carrera-logo.webp'

/**
 * Logo de la Carrera de Administración de Empresas: el círculo completo, con el fondo transparente.
 * Es un disco blanco con sus propios colores, así que sirve igual de día, de noche y en alto contraste.
 * Va en la cabecera del portal; el pie, el panel y el ingreso usan el de la FCEE (LogoFcee).
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
