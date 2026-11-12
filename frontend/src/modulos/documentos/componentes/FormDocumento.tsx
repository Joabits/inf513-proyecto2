import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useController, useForm, useWatch } from 'react-hook-form'
import type { ErroresValidacion } from '@/compartido/api/cliente'
import { aplicarErrores } from '@/compartido/api/errores'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { Interruptor } from '@/compartido/ui/Interruptor'
import { Selector } from '@/compartido/ui/Selector'
import { actualizarDocumento, crearDocumento } from '../api'
import { esquemaDocumento, problemaDeArchivo, type DatosDocumento } from '../documentos.esquema'
import type { Documento } from '../tipos'
import { useCategorias, useGuardarDocumento } from '../useDocumentos'
import { NuevaCategoria } from './NuevaCategoria'
import { ZonaArchivo } from './ZonaArchivo'

const OPCION_NUEVA = 'nueva'

/**
 * Sirve para subir uno nuevo y para editar. Al editar, el archivo es opcional:
 * si se elige otro, el actual pasa al historial de versiones.
 */
export function FormDocumento({ documento, alTerminar }: { documento?: Documento; alTerminar: () => void }) {
  const prefijo = documento ? `doc-${documento.id}` : 'doc-nuevo'
  const guardar = useGuardarDocumento((datos: FormData) => (documento ? actualizarDocumento(documento.id, datos) : crearDocumento(datos)))
  const { data: categorias = [] } = useCategorias()
  const puedeCrearCategoria = usePermiso('documentos.crear')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<DatosDocumento>({
    resolver: zodResolver(esquemaDocumento),
    defaultValues: {
      titulo: documento?.titulo ?? '',
      categoria_id: documento ? String(documento.categoria.id) : '',
      descripcion: documento?.descripcion ?? '',
      publicado: documento?.publicado ?? true,
    },
  })
  const descripcion = useWatch({ control, name: 'descripcion' })
  // Controlado: así una categoría recién creada queda elegida apenas aparece en la lista
  const {
    field: { ref: refCategoria, value: categoriaElegida, onChange: cambiarCategoria, onBlur: salirCategoria },
  } = useController({ control, name: 'categoria_id' })

  function elegir(nuevo: File | undefined) {
    if (!nuevo) return
    const problema = problemaDeArchivo(nuevo)
    setErrorArchivo(problema)
    setArchivo(problema ? null : nuevo)
  }

  function enviar(datos: DatosDocumento) {
    if (!documento && !archivo) {
      setErrorArchivo('Elija el archivo del documento.')
      return
    }
    const formulario = new FormData()
    formulario.append('titulo', datos.titulo)
    formulario.append('categoria_id', datos.categoria_id)
    formulario.append('descripcion', datos.descripcion)
    formulario.append('publicado', datos.publicado ? '1' : '0')
    if (archivo) formulario.append('archivo', archivo)

    guardar.mutate(formulario, {
      onSuccess: alTerminar,
      onError: (e) => {
        const error = isAxiosError<ErroresValidacion>(e) ? e.response?.data.errors?.archivo?.[0] : undefined
        if (error) setErrorArchivo(error)
        aplicarErrores(e, setError)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-titulo">Archivo</p>
        <ZonaArchivo
          id={`${prefijo}-archivo`}
          archivo={archivo}
          error={errorArchivo}
          reemplazando={documento?.nombre_original}
          alElegir={elegir}
          alQuitar={() => setArchivo(null)}
        />
      </div>

      <Campo id={`${prefijo}-titulo`} etiqueta="Título" error={errors.titulo?.message}>
        <input
          id={`${prefijo}-titulo`}
          placeholder="Ej. Reglamento de titulación 2026"
          aria-describedby={`${prefijo}-titulo-info`}
          aria-invalid={!!errors.titulo}
          className={CLASE_ENTRADA}
          {...register('titulo')}
        />
      </Campo>

      <Campo id={`${prefijo}-categoria`} etiqueta="Categoría" error={errors.categoria_id?.message}>
        <Selector
          id={`${prefijo}-categoria`}
          aria-describedby={`${prefijo}-categoria-info`}
          aria-invalid={!!errors.categoria_id}
          ref={refCategoria}
          valor={categoriaElegida}
          alSalir={salirCategoria}
          textoVacio="Seleccione una categoría"
          opciones={[
            ...categorias.map((categoria) => ({ valor: String(categoria.id), etiqueta: categoria.nombre })),
            ...(puedeCrearCategoria ? [{ valor: OPCION_NUEVA, etiqueta: '+ Nueva categoría…' }] : []),
          ]}
          alCambiar={(valor) => {
            if (valor === OPCION_NUEVA) {
              setCreandoCategoria(true)
              setValue('categoria_id', '')
              return
            }
            cambiarCategoria(valor)
          }}
        />
        {creandoCategoria && (
          <NuevaCategoria
            id={`${prefijo}-categoria-nueva`}
            alCrear={(nueva) => {
              setCreandoCategoria(false)
              setValue('categoria_id', String(nueva.id), { shouldValidate: true })
            }}
            alCancelar={() => setCreandoCategoria(false)}
          />
        )}
      </Campo>

      <Campo
        id={`${prefijo}-descripcion`}
        etiqueta="Descripción"
        opcional
        error={errors.descripcion?.message}
        usados={descripcion.length}
        limite={300}
      >
        <textarea
          id={`${prefijo}-descripcion`}
          rows={3}
          placeholder="Describa brevemente el contenido del documento"
          aria-describedby={`${prefijo}-descripcion-info`}
          aria-invalid={!!errors.descripcion}
          className={CLASE_ENTRADA}
          {...register('descripcion')}
        />
      </Campo>

      <div className="pt-5">
        <Interruptor
          id={`${prefijo}-publicado`}
          etiqueta="Publicar en el portal"
          ayuda="Los visitantes podrán ver y descargar el documento. Si lo desactiva, solo lo ve el personal del panel."
          {...register('publicado')}
        />
      </div>

      {errors.root && (
        <p role="alert" className="text-sm font-semibold text-acento">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 pt-5">
        <Boton type="button" variante="borde" onClick={alTerminar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardar.isPending}>
          {guardar.isPending ? 'Guardando...' : documento ? 'Guardar cambios' : 'Subir documento'}
        </Boton>
      </div>
    </form>
  )
}
