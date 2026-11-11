import { useState } from 'react'
import { mensajeDeError } from '@/compartido/api/errores'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { IconoActivar, IconoDesactivar, IconoEditar, IconoEliminar, IconoLlave } from '@/compartido/ui/Iconos'
import { formatoFechaHora, iniciales } from '../formato'
import type { Usuario } from '../tipos'
import { useCambiarEstado, useEliminarUsuario } from '../useUsuarios'
import { FormClave } from './FormClave'
import { FormEditarUsuario } from './FormUsuario'

const ACCION =
  'inline-flex items-center gap-2 rounded-tema px-3 py-2 text-sm font-semibold text-titulo transition-colors hover:bg-superficie aria-expanded:bg-superficie disabled:opacity-60'

const ETIQUETA = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold'

type Panel = 'editar' | 'clave' | null

/** Una cuenta con sus acciones. Editar y cambiar la contraseña se abren dentro de la misma fila. */
export function FilaUsuario({ usuario }: { usuario: Usuario }) {
  const [panel, setPanel] = useState<Panel>(null)
  const estado = useCambiarEstado()
  const eliminar = useEliminarUsuario()
  const puedeEditar = usePermiso('usuarios.editar')
  const puedeEliminar = usePermiso('usuarios.eliminar')
  const idPanel = `panel-usuario-${usuario.id}`
  const error = estado.error ?? eliminar.error

  const alternar = (nuevo: Panel) => setPanel((actual) => (actual === nuevo ? null : nuevo))

  return (
    <li className="py-5">
      <div className="flex gap-4">
        <span
          aria-hidden="true"
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold ${
            usuario.activo ? 'bg-marino text-sobre-primario' : 'border border-borde bg-superficie text-texto-suave'
          }`}
        >
          {iniciales(usuario.nombre)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-cuerpo text-base font-bold text-titulo">{usuario.nombre}</h3>
            {usuario.es_usted && <span className={`${ETIQUETA} border-titulo text-titulo`}>Usted</span>}
            <span className={`${ETIQUETA} ${usuario.activo ? 'border-borde text-texto-suave' : 'border-primario text-acento'}`}>
              {usuario.activo ? 'Activa' : 'Desactivada'}
            </span>
          </div>
          <p className="mt-1 break-all text-sm text-texto">{usuario.email}</p>
          <p className="mt-1 text-sm text-texto-suave">
            {usuario.rol?.nombre ?? 'Sin rol'} ·{' '}
            {usuario.ultimo_ingreso ? `Último ingreso: ${formatoFechaHora(usuario.ultimo_ingreso)}` : 'Todavía no ingresó al panel'}
          </p>

          {puedeEditar && (
            <div className="-ml-3 mt-2 flex flex-wrap items-center gap-1">
              <button type="button" className={ACCION} aria-expanded={panel === 'editar'} aria-controls={idPanel} onClick={() => alternar('editar')}>
                <IconoEditar width={16} height={16} /> Editar
              </button>
              <button type="button" className={ACCION} aria-expanded={panel === 'clave'} aria-controls={idPanel} onClick={() => alternar('clave')}>
                <IconoLlave width={16} height={16} /> Contraseña
              </button>
              {!usuario.es_usted && (
                <button
                  type="button"
                  className={ACCION}
                  disabled={estado.isPending}
                  onClick={() => estado.mutate({ id: usuario.id, activo: !usuario.activo })}
                >
                  {usuario.activo ? <IconoDesactivar width={16} height={16} /> : <IconoActivar width={16} height={16} />}
                  {usuario.activo ? 'Desactivar' : 'Activar'}
                </button>
              )}
              {puedeEliminar && !usuario.es_usted && (
                <span className="ml-auto">
                  <BotonConfirmar
                    pregunta="¿Eliminar esta cuenta? Si solo debe dejar de ingresar, desactívela."
                    confirmar="Sí, eliminar"
                    ocupado={eliminar.isPending}
                    alConfirmar={() => eliminar.mutate(usuario.id)}
                  >
                    <IconoEliminar width={16} height={16} /> Eliminar
                  </BotonConfirmar>
                </span>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="mt-2 text-sm font-semibold text-acento">
              {mensajeDeError(error)}
            </p>
          )}

          {panel && (
            <div id={idPanel} className="mt-4 rounded-tema border border-borde p-5">
              {panel === 'editar' ? (
                <FormEditarUsuario usuario={usuario} alTerminar={() => setPanel(null)} />
              ) : (
                <FormClave usuario={usuario} alTerminar={() => setPanel(null)} />
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
