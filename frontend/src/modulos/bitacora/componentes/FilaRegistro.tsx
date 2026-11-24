import { useId, useState } from 'react'
import { IconoAbajo } from '@/compartido/ui/Iconos'
import { formatoFechaHora, frase, mayuscula, navegadorLegible, nombreCampo, tiempoRelativo, valorCambio } from '../formato'
import type { Registro } from '../tipos'

/**
 * Un registro es una fila: cuándo, quién y qué. En pantallas angostas la persona pasa a la columna de actividad
 * para no perder espacio. Al abrirla muestra qué cambió y, plegados, los detalles técnicos.
 */
export function FilaRegistro({ registro, mostrarIp = false }: { registro: Registro; mostrarIp?: boolean }) {
  const [abierta, setAbierta] = useState(false)
  const idDetalle = useId()
  const { actor, texto } = frase(registro)
  const cambios = registro.cambios ? Object.entries(registro.cambios) : []
  const navegador = navegadorLegible(registro.navegador)
  const sinCuenta = !registro.usuario

  return (
    <>
      <tr className={`border-t border-borde-tarjeta align-top ${abierta ? 'bg-fondo' : 'hover:bg-fondo'}`}>
        {/* La barra de acento (azul marino: el rojo queda para alertas) une la fila con su detalle y marca lo abierto */}
        <td className={`hidden whitespace-nowrap border-l-4 py-2.5 pl-4 pr-3 text-sm text-texto-suave md:table-cell ${abierta ? 'border-marino' : 'border-transparent'}`}>
          <time dateTime={registro.fecha} title={formatoFechaHora(registro.fecha)}>
            {tiempoRelativo(registro.fecha)}
          </time>
        </td>

        <td className={`hidden max-w-56 py-2.5 pr-4 text-sm md:table-cell ${sinCuenta ? 'italic text-texto-suave' : 'font-semibold text-titulo'}`}>
          <span className="block truncate" title={registro.usuario ?? undefined}>
            {actor}
          </span>
          {registro.cuenta_eliminada && <span className="block text-xs font-normal italic text-texto-suave">cuenta eliminada</span>}
        </td>

        {mostrarIp && <td className="hidden whitespace-nowrap py-2.5 pr-4 text-sm tabular-nums text-texto-suave md:table-cell">{registro.ip ?? '—'}</td>}

        {/* En el celular esta celda lleva la barra de acento y el «cuándo» (la primera columna se oculta) */}
        <td
          className={`w-full border-l-4 py-2.5 pl-3 pr-2 text-sm md:border-l-0 md:pl-0 ${abierta ? 'border-marino' : 'border-transparent'}`}
        >
          <button
            type="button"
            onClick={() => setAbierta((valor) => !valor)}
            aria-expanded={abierta}
            aria-controls={idDetalle}
            className="flex w-full items-start gap-2 text-left text-texto"
          >
            <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
              <span className="md:hidden">
                <time dateTime={registro.fecha} className="mb-0.5 block text-xs text-texto-suave">
                  {tiempoRelativo(registro.fecha)}
                </time>
                <strong className="font-semibold text-titulo">{actor}</strong> {texto}
              </span>
              <span className="hidden md:inline">{mayuscula(texto)}</span>
              {cambios.length > 0 && (
                <span className="ml-2 whitespace-nowrap text-xs text-texto-suave">
                  {cambios.length} {cambios.length === 1 ? 'campo' : 'campos'}
                </span>
              )}
            </span>
            <IconoAbajo width={16} height={16} className={`mt-0.5 shrink-0 text-texto-suave transition-transform ${abierta ? 'rotate-180' : ''}`} />
          </button>
        </td>
        <td className="w-3 md:w-4" aria-hidden />
      </tr>

      {abierta && (
        <tr id={idDetalle} className="bg-fondo">
          <td colSpan={mostrarIp ? 5 : 4} className="border-l-4 border-marino px-3 pb-4 pt-1 text-sm md:px-4">
            <p className="mb-3 text-texto-suave">
              {formatoFechaHora(registro.fecha)}
              {registro.cuenta_eliminada && ' · la cuenta de esta persona ya no existe'}
            </p>

            {cambios.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 font-semibold text-titulo">Qué cambió</p>
                <ul className="space-y-2">
                  {cambios.map(([campo, { antes, despues }]) => (
                    <li key={campo} className="text-texto">
                      <span className="font-semibold capitalize text-titulo">{nombreCampo(campo)}: </span>
                      <span className="text-texto-suave line-through decoration-primario/40">{valorCambio(antes)}</span>
                      <span aria-label="cambió a"> → </span>
                      <span>{valorCambio(despues)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <details>
              <summary className="cursor-pointer font-semibold text-titulo">Detalles técnicos</summary>
              <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
                {registro.usuario && (
                  <>
                    <dt className="font-semibold text-titulo">Cuenta</dt>
                    <dd className="break-all text-texto">{registro.usuario}</dd>
                  </>
                )}
                <dt className="font-semibold text-titulo">Desde</dt>
                <dd className="text-texto">
                  {navegador ?? '—'}
                  {registro.ip && <span className="text-texto-suave"> · dirección {registro.ip}</span>}
                </dd>
                {registro.tipo === 'acceso' && registro.codigo_http !== null && (
                  <>
                    <dt className="font-semibold text-titulo">Respuesta del sistema</dt>
                    <dd className="text-texto">
                      {registro.codigo_http === 401 ? 'No había sesión iniciada' : 'La cuenta no tiene ese permiso'} ({registro.accion} {registro.recurso}, código {registro.codigo_http})
                    </dd>
                  </>
                )}
              </dl>
            </details>
          </td>
        </tr>
      )}
    </>
  )
}
