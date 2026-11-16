import { useId, useState } from 'react'
import { IconoAbajo } from '@/compartido/ui/Iconos'
import { describir, formatoFechaHora, nombreCampo, valorCambio } from '../formato'
import type { Registro } from '../tipos'

/** Código HTTP de un acceso: neutro si salió bien; con el color de alerta del tema si fue denegado o falló. */
function claseCodigo(codigo: number) {
  if (codigo < 300) return 'bg-chip text-sobre-chip'
  if (codigo === 401 || codigo === 403) return 'bg-primario text-sobre-primario'
  return 'border border-primario text-primario'
}

export function FilaRegistro({ registro }: { registro: Registro }) {
  const [abierta, setAbierta] = useState(false)
  const idDetalle = useId()
  const cambios = registro.cambios ? Object.entries(registro.cambios) : []
  const fallido = registro.tipo === 'ingreso_fallido'

  return (
    <li className="rounded-tema border border-borde-tarjeta bg-tarjeta sombra-suave">
      <button
        type="button"
        onClick={() => setAbierta((valor) => !valor)}
        aria-expanded={abierta}
        aria-controls={idDetalle}
        className="flex w-full items-start gap-4 px-4 py-3 text-left md:px-5"
      >
        <div className="min-w-0 flex-1">
          <p className={`font-semibold ${fallido ? 'text-primario' : 'text-titulo'}`}>
            {describir(registro)}
            {registro.codigo_http !== null && (
              <span className={`ml-2 rounded px-1.5 py-0.5 text-xs font-bold ${claseCodigo(registro.codigo_http)}`}>{registro.codigo_http}</span>
            )}
          </p>
          {registro.detalle && registro.tipo !== 'acceso' && <p className="mt-0.5 truncate text-sm text-texto">{registro.detalle}</p>}
          <p className="mt-1 text-sm text-texto-suave">
            <time dateTime={registro.fecha}>{formatoFechaHora(registro.fecha)}</time>
            {' · '}
            {registro.usuario ? (
              <span>
                {registro.nombre ?? registro.usuario}
                {registro.cuenta_eliminada && <span className="italic"> (cuenta eliminada)</span>}
              </span>
            ) : (
              <span className="italic">sin sesión</span>
            )}
            {cambios.length > 0 && ` · ${cambios.length} ${cambios.length === 1 ? 'campo modificado' : 'campos modificados'}`}
          </p>
        </div>
        <IconoAbajo width={18} height={18} className={`mt-1 shrink-0 text-texto-suave transition-transform ${abierta ? 'rotate-180' : ''}`} />
      </button>

      {abierta && (
        <div id={idDetalle} className="border-t border-borde-tarjeta px-4 py-4 text-sm md:px-5">
          {cambios.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full min-w-[28rem] border-collapse text-left">
                <caption className="mb-2 text-left font-semibold text-titulo">Qué cambió</caption>
                <thead>
                  <tr className="text-texto-suave">
                    <th scope="col" className="py-1 pr-4 font-semibold">Campo</th>
                    <th scope="col" className="py-1 pr-4 font-semibold">Antes</th>
                    <th scope="col" className="py-1 font-semibold">Después</th>
                  </tr>
                </thead>
                <tbody>
                  {cambios.map(([campo, { antes, despues }]) => (
                    <tr key={campo} className="border-t border-borde-tarjeta align-top">
                      <th scope="row" className="py-2 pr-4 font-semibold capitalize text-titulo">{nombreCampo(campo)}</th>
                      <td className="py-2 pr-4 text-texto-suave line-through decoration-primario/40">{valorCambio(antes)}</td>
                      <td className="py-2 text-texto">{valorCambio(despues)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
            {registro.usuario && (
              <>
                <dt className="font-semibold text-titulo">Cuenta</dt>
                <dd className="break-all text-texto">{registro.usuario}</dd>
              </>
            )}
            {registro.tipo === 'acceso' && registro.detalle && (
              <>
                <dt className="font-semibold text-titulo">Respuesta</dt>
                <dd className="text-texto">{registro.detalle}</dd>
              </>
            )}
            <dt className="font-semibold text-titulo">Dirección IP</dt>
            <dd className="text-texto">{registro.ip ?? '—'}</dd>
            <dt className="font-semibold text-titulo">Navegador</dt>
            <dd className="break-words text-texto-suave">{registro.navegador || '—'}</dd>
            <dt className="font-semibold text-titulo">Registro</dt>
            <dd className="text-texto-suave">N.º {registro.id}</dd>
          </dl>
        </div>
      )}
    </li>
  )
}
