import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch, type UseFormRegister } from 'react-hook-form'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { Interruptor } from '@/compartido/ui/Interruptor'
import type { Rol, Usuario } from '../tipos'
import { useActualizarUsuario, useCrearUsuario, useRoles } from '../useUsuarios'
import {
  esquemaNuevoUsuario,
  esquemaUsuario,
  MINIMO_CLAVE,
  type DatosNuevoUsuario,
  type DatosUsuario,
} from '../usuarios.esquema'
import { EntradaClave } from './EntradaClave'

/** Nombre, correo y rol: comunes al crear y al editar. */
function DatosCuenta(props: {
  prefijo: string
  register: UseFormRegister<DatosUsuario>
  errores: Partial<Record<keyof DatosUsuario, { message?: string }>>
  roles: Rol[]
  rolElegido: string
  rolFijo?: string
}) {
  const { prefijo, register, errores, roles, rolElegido, rolFijo } = props
  const descripcion = roles.find((rol) => String(rol.id) === rolElegido)?.descripcion ?? undefined

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id={`${prefijo}-nombre`} etiqueta="Nombre completo" error={errores.nombre?.message}>
          <input
            id={`${prefijo}-nombre`}
            autoComplete="off"
            placeholder="Ej. Adriana Quiroga Mendoza"
            aria-describedby={`${prefijo}-nombre-info`}
            aria-invalid={!!errores.nombre}
            className={CLASE_ENTRADA}
            {...register('nombre')}
          />
        </Campo>
        <Campo id={`${prefijo}-email`} etiqueta="Correo electrónico" ayuda="Es el que usará para ingresar al panel." error={errores.email?.message}>
          <input
            id={`${prefijo}-email`}
            type="email"
            autoComplete="off"
            placeholder="nombre@uagrm.edu.bo"
            aria-describedby={`${prefijo}-email-info`}
            aria-invalid={!!errores.email}
            className={CLASE_ENTRADA}
            {...register('email')}
          />
        </Campo>
      </div>

      {rolFijo ? (
        <div>
          <p className="text-sm font-semibold text-titulo">Rol</p>
          <p className="mt-1 rounded-tema border border-borde bg-superficie px-3 py-2">{rolFijo}</p>
          <p className="mt-1 text-sm text-texto-suave">No puede cambiar su propio rol: pídaselo a otro Director de Carrera.</p>
        </div>
      ) : (
        <Campo id={`${prefijo}-rol`} etiqueta="Rol" ayuda={descripcion} error={errores.rol_id?.message}>
          <select
            id={`${prefijo}-rol`}
            aria-describedby={`${prefijo}-rol-info`}
            aria-invalid={!!errores.rol_id}
            className={CLASE_ENTRADA}
            {...register('rol_id')}
          >
            <option value="">Seleccione un rol</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </Campo>
      )}
    </>
  )
}

function Acciones({ ocupado, texto, alCancelar, error }: { ocupado: boolean; texto: string; alCancelar: () => void; error?: string }) {
  return (
    <>
      {error && (
        <p role="alert" className="text-sm font-semibold text-acento">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3 pt-5">
        <Boton type="button" variante="borde" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={ocupado}>
          {ocupado ? 'Guardando...' : texto}
        </Boton>
      </div>
    </>
  )
}

export function FormNuevoUsuario({ alTerminar }: { alTerminar: () => void }) {
  const crear = useCrearUsuario()
  const { data: roles = [] } = useRoles()
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<DatosNuevoUsuario>({
    resolver: zodResolver(esquemaNuevoUsuario),
    defaultValues: { nombre: '', email: '', rol_id: '', password: '', password_confirmation: '', activo: true },
  })
  const rolElegido = useWatch({ control, name: 'rol_id' })

  const enviar = (datos: DatosNuevoUsuario) =>
    crear.mutate(datos, { onSuccess: alTerminar, onError: (e) => aplicarErrores(e, setError) })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-6">
      <DatosCuenta
        prefijo="usuario-nuevo"
        register={register}
        errores={errors}
        roles={roles}
        rolElegido={rolElegido}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="usuario-nuevo-clave" etiqueta="Contraseña" ayuda={`Al menos ${MINIMO_CLAVE} caracteres, con letras y números.`} error={errors.password?.message}>
          <EntradaClave id="usuario-nuevo-clave" aria-describedby="usuario-nuevo-clave-info" aria-invalid={!!errors.password} {...register('password')} />
        </Campo>
        <Campo id="usuario-nuevo-repetir" etiqueta="Repita la contraseña" error={errors.password_confirmation?.message}>
          <EntradaClave
            id="usuario-nuevo-repetir"
            aria-describedby="usuario-nuevo-repetir-info"
            aria-invalid={!!errors.password_confirmation}
            {...register('password_confirmation')}
          />
        </Campo>
      </div>

      <div className="pt-5">
        <Interruptor
          id="usuario-nuevo-activo"
          etiqueta="Cuenta activa"
          ayuda="Si la desactiva, la cuenta se crea pero no podrá ingresar al panel hasta que la active."
          {...register('activo')}
        />
      </div>

      <Acciones ocupado={crear.isPending} texto="Crear cuenta" alCancelar={alTerminar} error={errors.root?.message} />
    </form>
  )
}

export function FormEditarUsuario({ usuario, alTerminar }: { usuario: Usuario; alTerminar: () => void }) {
  const actualizar = useActualizarUsuario(usuario.id)
  const { data: roles = [] } = useRoles()
  const prefijo = `usuario-${usuario.id}`
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<DatosUsuario>({
    resolver: zodResolver(esquemaUsuario),
    defaultValues: { nombre: usuario.nombre, email: usuario.email, rol_id: usuario.rol ? String(usuario.rol.id) : '' },
  })
  const rolElegido = useWatch({ control, name: 'rol_id' })

  const enviar = (datos: DatosUsuario) =>
    actualizar.mutate(datos, { onSuccess: alTerminar, onError: (e) => aplicarErrores(e, setError) })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-6">
      <DatosCuenta
        prefijo={prefijo}
        register={register}
        errores={errors}
        roles={roles}
        rolElegido={rolElegido}
        rolFijo={usuario.es_usted ? (usuario.rol?.nombre ?? 'Sin rol') : undefined}
      />
      <Acciones ocupado={actualizar.isPending} texto="Guardar cambios" alCancelar={alTerminar} error={errors.root?.message} />
    </form>
  )
}
