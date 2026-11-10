import logoPositivo from './fcee-logo-horizontal.svg'
import logoNegativo from './fcee-logo-horizontal-negativo.svg'

/**
 * Logo oficial de la FCEE (Manual de uso de marca FCEE, gestión 2026).
 * La carrera no tiene logo propio: el manual prohíbe crear variantes del escudo para carreras.
 *   positivo -> sobre fondo blanco o gris claro
 *   negativo -> sobre fondo azul o rojo (letras blancas)
 * No deformar, recolorear ni poner sobre fondos que dificulten la lectura.
 */
export function LogoFcee({ version = 'positivo', className = '' }: { version?: 'positivo' | 'negativo'; className?: string }) {
  return (
    <img
      src={version === 'positivo' ? logoPositivo : logoNegativo}
      alt="Facultad de Ciencias Económicas y Empresariales - Universidad Autónoma Gabriel René Moreno"
      className={`h-auto w-auto ${className}`}
      width={1600}
      height={422}
    />
  )
}
