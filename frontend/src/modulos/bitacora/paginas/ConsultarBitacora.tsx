import { useEffect, useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoBuscar, IconoSubirArchivo } from '@/compartido/ui/Iconos'
import { Pestanas } from '@/compartido/ui/Pestanas'
import { Selector } from '@/compartido/ui/Selector'
import { SelectorFecha } from '@/compartido/ui/SelectorFecha'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FilaRegistro } from '../componentes/FilaRegistro'
import { Paginacion } from '../componentes/Paginacion'
import { verboAccion } from '../formato'
import { FILTROS_VACIOS, type FiltrosBitacora, type Grupo } from '../tipos'
import { useBitacora, useExportarBitacora, useOpcionesBitacora } from '../useBitacora'

const PESTANAS: { id: Grupo; titulo: string }[] = [
  { id: 'auditoria', titulo: 'Cambios en el contenido' },
  { id: 'sesiones', titulo: 'Ingresos y salidas' },
  { id: 'accesos', titulo: 'Accesos a la API' },
]

const AYUDA: Record<Grupo, string> = {
  auditoria: 'Quién creó, editó, publicó, ocultó o eliminó cada cosa, y qué valores cambió.',
  sesiones: 'Inicios de sesión, intentos fallidos y cierres de sesión.',
  accesos: 'Cada consulta a la API con su resultado. Sirve para ver intentos sin permiso.',
}

/** CU-29: consulta de la bitácora de actividad, solo lectura. */
export function ConsultarBitacora() {
  const [filtros, setFiltros] = useState<FiltrosBitacora>(FILTROS_VACIOS)
  const [texto, setTexto] = useState('')
  const [pagina, setPagina] = useState(1)

  const { data, isPending, isError, isFetching, refetch } = useBitacora(filtros, pagina)
  const { data: opciones } = useOpcionesBitacora()
  const puedeExportar = usePermiso('bitacora.exportar')
  const exportar = useExportarBitacora()

  // El texto se aplica cuando se deja de escribir, para no consultar en cada tecla
  useEffect(() => {
    const espera = setTimeout(() => cambiar({ texto: texto.trim() }), 400)
    return () => clearTimeout(espera)
  }, [texto])

  function cambiar(cambios: Partial<FiltrosBitacora>) {
    setFiltros((actuales) => {
      const nuevos = { ...actuales, ...cambios }
      return JSON.stringify(nuevos) === JSON.stringify(actuales) ? actuales : nuevos
    })
    setPagina(1)
  }

  function limpiar() {
    setTexto('')
    setFiltros({ ...FILTROS_VACIOS, grupo: filtros.grupo })
    setPagina(1)
  }

  const hayFiltros = Boolean(filtros.usuario || filtros.accion || filtros.texto || filtros.desde || filtros.hasta || filtros.resultado)
  const meta = data?.meta

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina titulo="Bitácora" subtitulo="Registro de la actividad en el portal. Nadie puede modificarlo ni borrarlo." />
        {puedeExportar && (
          <Boton
            type="button"
            variante="borde"
            disabled={exportar.isPending || !meta?.total}
            onClick={() => exportar.mutate(filtros)}
            className="mb-6 inline-flex items-center gap-2"
          >
            <IconoSubirArchivo width={18} height={18} /> {exportar.isPending ? 'Preparando...' : 'Exportar CSV'}
          </Boton>
        )}
      </div>
      {exportar.isError && <MensajeError texto="No se pudo exportar la bitácora. Intente nuevamente." />}

      <Pestanas
        etiqueta="Tipo de actividad"
        opciones={PESTANAS}
        activa={filtros.grupo}
        alCambiar={(id) => cambiar({ grupo: id as Grupo, accion: '', resultado: '' })}
      />

      <section id={`panel-${filtros.grupo}`} role="tabpanel" aria-labelledby={`pestana-${filtros.grupo}`} className="pt-5">
        <p className="mb-4 text-sm text-texto-suave">{AYUDA[filtros.grupo]}</p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative sm:col-span-2">
            <span className="sr-only">Buscar en la bitácora</span>
            <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-texto-suave" width={18} height={18} />
            <input
              type="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={100}
              placeholder={filtros.grupo === 'accesos' ? 'Buscar por ruta o cuenta' : 'Buscar por recurso, detalle o cuenta'}
              className={`${CLASE_ENTRADA} pl-10`}
            />
          </label>
          <Selector
            aria-label="Filtrar por cuenta"
            valor={filtros.usuario}
            alCambiar={(usuario) => cambiar({ usuario })}
            opciones={[{ valor: '', etiqueta: 'Todas las cuentas' }, ...(opciones?.usuarios ?? []).map((u) => ({ valor: u, etiqueta: u }))]}
          />
          {filtros.grupo === 'auditoria' && (
            <Selector
              aria-label="Filtrar por acción"
              valor={filtros.accion}
              alCambiar={(accion) => cambiar({ accion })}
              opciones={[{ valor: '', etiqueta: 'Todas las acciones' }, ...(opciones?.acciones ?? []).map((a) => ({ valor: a, etiqueta: verboAccion(a) }))]}
            />
          )}
          {filtros.grupo === 'accesos' && (
            <Selector
              aria-label="Filtrar por resultado"
              valor={filtros.resultado}
              alCambiar={(resultado) => cambiar({ resultado })}
              opciones={[{ valor: '', etiqueta: 'Todos los resultados' }, ...(opciones?.resultados ?? [])]}
            />
          )}
          <SelectorFecha aria-label="Desde" valor={filtros.desde} alCambiar={(desde) => cambiar({ desde })} max={filtros.hasta || undefined} hastaHoy textoVacio="Desde" opcional />
          <SelectorFecha aria-label="Hasta" valor={filtros.hasta} alCambiar={(hasta) => cambiar({ hasta })} min={filtros.desde || undefined} hastaHoy textoVacio="Hasta" opcional />
        </div>

        <div className="mt-5 flex min-h-8 flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-texto-suave" aria-live="polite">
            {meta && (meta.total === 0 ? 'Sin registros' : `${meta.from}–${meta.to} de ${meta.total.toLocaleString('es-BO')} registros`)}
            {isFetching && !isPending && ' · actualizando...'}
          </p>
          {hayFiltros && (
            <button type="button" onClick={limpiar} className="text-sm font-semibold text-primario hover:underline">
              Quitar filtros
            </button>
          )}
        </div>

        {isPending && <EstadoCarga />}

        {isError && (
          <div className="space-y-4 py-6 text-center">
            <MensajeError />
            <Boton variante="borde" onClick={() => refetch()}>
              Reintentar
            </Boton>
          </div>
        )}

        {data &&
          (data.data.length > 0 ? (
            <ul className={`mt-3 space-y-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
              {data.data.map((registro) => (
                <FilaRegistro key={registro.id} registro={registro} />
              ))}
            </ul>
          ) : (
            <p className="py-12 text-center text-texto-suave">
              {hayFiltros ? 'Ningún registro coincide con los filtros.' : 'Todavía no hay actividad registrada.'}
            </p>
          ))}

        {meta && <Paginacion pagina={meta.current_page} ultima={meta.last_page} cargando={isFetching} alCambiar={setPagina} />}
      </section>
    </div>
  )
}
