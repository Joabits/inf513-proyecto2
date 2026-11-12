import { useMemo, useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoAgregar, IconoBuscar } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FilaUsuario } from '../componentes/FilaUsuario'
import { FormNuevoUsuario } from '../componentes/FormUsuario'
import { normalizar } from '../formato'
import { useRoles, useUsuarios } from '../useUsuarios'

type Estado = '' | 'activas' | 'desactivadas'

export function GestionUsuarios() {
  const { data: usuarios, isPending, isError, refetch } = useUsuarios()
  const { data: roles = [] } = useRoles()
  const puedeCrear = usePermiso('usuarios.crear')
  const [creando, setCreando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [rol, setRol] = useState('')
  const [estado, setEstado] = useState<Estado>('')

  const visibles = useMemo(() => {
    const buscado = normalizar(busqueda.trim())
    return (usuarios ?? []).filter(
      (u) =>
        (!rol || String(u.rol?.id) === rol) &&
        (!estado || u.activo === (estado === 'activas')) &&
        (!buscado || normalizar(`${u.nombre} ${u.email}`).includes(buscado)),
    )
  }, [usuarios, busqueda, rol, estado])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina titulo="Usuarios" subtitulo="Cuentas que ingresan al panel de gestión. El rol define lo que puede hacer cada una." />
        {puedeCrear && !creando && (
          <Boton type="button" onClick={() => setCreando(true)} className="mb-6 inline-flex items-center gap-2">
            <IconoAgregar width={18} height={18} /> Nueva cuenta
          </Boton>
        )}
      </div>

      {creando && (
        <section aria-labelledby="titulo-nueva-cuenta" className="mb-10 rounded-tema border border-borde bg-fondo p-5 md:p-6">
          <h2 id="titulo-nueva-cuenta" className="text-xl text-titulo">
            Nueva cuenta
          </h2>
          <p className="mb-6 mt-1 text-sm text-texto-suave">Comunique la contraseña a la persona en forma personal: el portal no la envía por correo.</p>
          <FormNuevoUsuario alTerminar={() => setCreando(false)} />
        </section>
      )}

      {roles.length > 0 && (
        <details className="mb-8 rounded-tema border border-borde bg-superficie px-5 py-4">
          <summary className="cursor-pointer font-semibold text-titulo">¿Qué puede hacer cada rol?</summary>
          <dl className="mt-4 space-y-3 text-sm">
            {roles.map((r) => (
              <div key={r.id}>
                <dt className="font-semibold text-titulo">{r.nombre}</dt>
                <dd className="text-texto-suave">{r.descripcion}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="space-y-4 text-center">
          <MensajeError />
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        </div>
      )}

      {usuarios && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Buscar cuentas</span>
              <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-texto-suave" width={18} height={18} />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o correo"
                className={`${CLASE_ENTRADA} pl-10`}
              />
            </label>
            <label className="sm:w-56">
              <span className="sr-only">Filtrar por rol</span>
              <select value={rol} onChange={(e) => setRol(e.target.value)} className={CLASE_ENTRADA}>
                <option value="">Todos los roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:w-44">
              <span className="sr-only">Filtrar por estado</span>
              <select value={estado} onChange={(e) => setEstado(e.target.value as Estado)} className={CLASE_ENTRADA}>
                <option value="">Todas</option>
                <option value="activas">Activas</option>
                <option value="desactivadas">Desactivadas</option>
              </select>
            </label>
          </div>

          <p className="mt-6 text-sm text-texto-suave" aria-live="polite">
            {visibles.length === usuarios.length
              ? `${usuarios.length} ${usuarios.length === 1 ? 'cuenta' : 'cuentas'}`
              : `${visibles.length} de ${usuarios.length} cuentas`}
          </p>

          {visibles.length > 0 ? (
            <ul className="divide-y divide-borde border-y border-borde">
              {visibles.map((usuario) => (
                <FilaUsuario key={usuario.id} usuario={usuario} />
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-texto-suave">Ninguna cuenta coincide con la búsqueda.</p>
          )}
        </>
      )}
    </div>
  )
}
