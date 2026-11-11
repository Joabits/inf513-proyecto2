import logoPositivo from './fcee-logo-horizontal.svg'
import logoNegativo from './fcee-logo-horizontal-negativo.svg'

/**
 * Logo oficial de la FCEE (Manual de uso de marca FCEE, gestión 2026). Hoy el sitio usa en todas
 * partes el logo de la Carrera (MarcaCarrera); este queda disponible por si se necesita.
 * El escudo de la FCEE no se modifica ni se combina con otros textos: el manual lo prohíbe para carreras.
 *   positivo -> sobre fondo blanco o gris claro
 *   negativo -> sobre fondo azul o rojo (letras blancas)
 * No deformar, recolorear ni poner sobre fondos que dificulten la lectura.
 */
export function LogoFcee({ version = 'positivo', className = '' }: { version?: 'positivo' | 'negativo'; className?: string }) {
  return (
    <img
      src={version === 'positivo' ? logoPositivo : logoNegativo}
      alt="Facultad de Ciencias Económicas y Empresariales - Universidad Autónoma Gabriel René Moreno"
      className={`w-auto max-w-full ${className}`}
      width={1600}
      height={422}
    />
  )
}
