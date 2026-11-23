import { useMemo, useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoAgregar, IconoBuscar, IconoDocumento, IconoEditar, IconoEliminar } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { exportarGraduados } from '../api/graduados'
import { FormularioGraduado } from '../componentes/FormularioGraduado'
import { useEliminarGraduado, useGraduados } from '../hooks/useGraduados'
import type { Graduado } from '../tipos'

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export function GestionGraduados() {
  const { data: graduados, isPending, isError, refetch } = useGraduados()
  const eliminar = useEliminarGraduado()
  const puedeCrear = usePermiso('graduados.crear')
  const puedeEditar = usePermiso('graduados.editar')
  const puedeEliminar = usePermiso('graduados.eliminar')

  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [graduadoSeleccionado, setGraduadoSeleccionado] = useState<Graduado | null>(null)

  const graduadosFiltrados = useMemo(() => {
    const buscado = normalizar(busqueda.trim())
    return (graduados ?? []).filter((g) => {
      if (!buscado) return true
      return (
        normalizar(g.nombre_completo).includes(buscado) ||
        normalizar(g.ci).includes(buscado) ||
        normalizar(g.modalidad).includes(buscado) ||
        (g.titulo_tema && normalizar(g.titulo_tema).includes(buscado))
      )
    })
  }, [graduados, busqueda])

  const abrirCrear = () => {
    setGraduadoSeleccionado(null)
    setModalAbierto(true)
  }

  const abrirEditar = (graduado: Graduado) => {
    setGraduadoSeleccionado(graduado)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setGraduadoSeleccionado(null)
    setModalAbierto(false)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina
          titulo="Gestión de Graduados"
          subtitulo="Registro y actualización de datos académicos de los graduados de la carrera."
        />
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <a
            href={exportarGraduados()}
            download
            className="inline-flex items-center gap-2 rounded-tema border border-borde-tarjeta bg-superficie px-4 py-2 text-sm font-semibold text-titulo hover:bg-superficie/80 transition-colors"
          >
            <IconoDocumento width={18} height={18} /> Exportar a Excel/CSV
          </a>
          {puedeCrear && (
            <Boton type="button" onClick={abrirCrear} className="inline-flex items-center gap-2">
              <IconoAgregar width={18} height={18} /> Registrar graduado
            </Boton>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[280px] flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-texto-suave">
            <IconoBuscar width={18} height={18} />
          </span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, CI o modalidad..."
            className={`${CLASE_ENTRADA} !mt-0 pl-10`}
          />
        </div>
      </div>

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="space-y-3">
          <MensajeError texto="No se pudo cargar la lista de graduados. Intente nuevamente." />
          <Boton type="button" variante="borde" onClick={() => refetch()} className="text-sm">
            Reintentar
          </Boton>
        </div>
      )}

      {graduados && (
        <div className="overflow-hidden rounded-tema border border-borde-tarjeta bg-tarjeta sombra-suave">
          {graduadosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-texto-suave">
              {busqueda ? 'No se encontraron graduados que coincidan con la búsqueda.' : 'No hay graduados registrados todavía.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-borde-tarjeta bg-superficie text-xs uppercase tracking-wider text-titulo">
                  <tr>
                    <th scope="col" className="px-5 py-3">Nombre completo</th>
                    <th scope="col" className="px-5 py-3">CI</th>
                    <th scope="col" className="px-5 py-3">Gestión</th>
                    <th scope="col" className="px-5 py-3">Modalidad</th>
                    <th scope="col" className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde-tarjeta">
                  {graduadosFiltrados.map((g) => (
                    <tr key={g.id} className="transition-colors hover:bg-superficie/60">
                      <td className="px-5 py-4 font-semibold text-titulo">
                        <div>{g.nombre_completo}</div>
                        {g.titulo_tema && (
                          <div className="mt-0.5 text-xs font-normal text-texto-suave line-clamp-1">
                            {g.titulo_tema}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-texto">{g.ci}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-texto">
                        {g.gestion_ingreso} — {g.gestion_egreso}
                      </td>
                      <td className="px-5 py-4 text-texto">
                        <span className="inline-flex rounded-full border border-borde px-2.5 py-0.5 text-xs font-semibold text-titulo">
                          {g.modalidad}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {puedeEditar && (
                            <button
                              type="button"
                              onClick={() => abrirEditar(g)}
                              title="Editar graduado"
                              className="inline-flex items-center gap-1.5 rounded-tema px-2.5 py-1.5 text-xs font-semibold text-titulo hover:bg-superficie"
                            >
                              <IconoEditar width={15} height={15} /> Editar
                            </button>
                          )}
                          {puedeEliminar && (
                            <BotonConfirmar
                              pregunta="¿Eliminar graduado?"
                              confirmar="Eliminar"
                              ocupado={eliminar.isPending}
                              alConfirmar={() => eliminar.mutate(g.id)}
                            >
                              <IconoEliminar width={15} height={15} /> Eliminar
                            </BotonConfirmar>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear o editar graduado */}
      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Fondo oscuro translúcido */}
          <div
            className="fixed inset-0 bg-negro/60 backdrop-blur-xs transition-opacity"
            onClick={cerrarModal}
            aria-hidden="true"
          />

          {/* Contenido del modal */}
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave">
            <h2 id="modal-titulo" className="mb-1 text-xl font-bold text-titulo">
              {graduadoSeleccionado ? 'Editar graduado' : 'Registrar nuevo graduado'}
            </h2>
            <p className="mb-6 text-sm text-texto-suave">
              {graduadoSeleccionado
                ? 'Actualice la información académica y de contacto del graduado.'
                : 'Complete los campos para registrar un nuevo graduado en el sistema.'}
            </p>

            <FormularioGraduado graduado={graduadoSeleccionado} alTerminar={cerrarModal} />
          </div>
        </div>
      )}
    </div>
  )
}
