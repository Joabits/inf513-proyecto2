import { iniciales } from '../formato'

const TAMANOS = {
  sm: 'h-12 w-12 text-sm',
  lg: 'h-28 w-28 text-2xl',
}

/** La foto de la persona o, mientras no la haya, sus iniciales en un círculo. Es decorativa: el nombre va al lado. */
export function FotoPersona({ nombre, foto, tamano = 'sm' }: { nombre: string; foto: string | null; tamano?: keyof typeof TAMANOS }) {
  if (foto) {
    return <img src={foto} alt="" loading="lazy" className={`${TAMANOS[tamano]} shrink-0 rounded-full object-cover`} />
  }

  return (
    <span aria-hidden="true" className={`${TAMANOS[tamano]} grid shrink-0 place-items-center rounded-full bg-chip font-bold text-sobre-chip`}>
      {iniciales(nombre)}
    </span>
  )
}
