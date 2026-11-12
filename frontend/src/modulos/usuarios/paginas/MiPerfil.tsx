import { useSesion } from '@/compartido/sesion/useSesion'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FormMiClave } from '../componentes/FormMiClave'
import { FormPerfil } from '../componentes/FormPerfil'

/** «Mi perfil»: cualquier cuenta cambia su nombre, su correo y su contraseña. El rol lo asigna el Director (Usuarios). */
export function MiPerfil() {
  const { data: usuario } = useSesion()

  // La plantilla del panel ya exige haber ingresado
  if (!usuario) return null

  return (
    <div className="mx-auto max-w-3xl">
      <TituloPagina titulo="Mi perfil" subtitulo={`Sus datos para ingresar al panel. Rol: ${usuario.rol?.nombre ?? 'sin rol'}.`} />
      <div className="space-y-6">
        <FormPerfil usuario={usuario} />
        <FormMiClave />
      </div>
    </div>
  )
}
