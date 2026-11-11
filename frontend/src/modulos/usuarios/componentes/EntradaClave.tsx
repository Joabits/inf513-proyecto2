import { useState, type ComponentProps } from 'react'
import { CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { IconoOcultar, IconoVer } from '@/compartido/ui/Iconos'

/** Campo de contraseña con un botón para mostrar u ocultar lo escrito. Funciona con {...register('password')}. */
export function EntradaClave(props: ComponentProps<'input'> & { id: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} autoComplete="new-password" className={`${CLASE_ENTRADA} pr-12`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        aria-controls={props.id}
        className="absolute right-1 top-1/2 mt-0.5 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-tema text-texto-suave hover:text-titulo"
      >
        {visible ? <IconoOcultar width={18} height={18} /> : <IconoVer width={18} height={18} />}
      </button>
    </div>
  )
}
