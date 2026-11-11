import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { ErroresValidacion } from '@/compartido/api/cliente'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { IconoSubirArchivo } from '@/compartido/ui/Iconos'
import { actualizarDocumento, crearDocumento } from '../api'
import { esquemaDocumento, EXTENSIONES, MAXIMO_MB, problemaDeArchivo, type DatosDocumento } from '../documentos.esquema'
import { formatoTamano } from '../formato'
import type { Documento } from '../tipos'
import { useGuardarDocumento } from '../useDocumentos'

/**
 * Sirve para subir uno nuevo y para editar. Al editar, el archivo es opcional:
 * si se elige otro, el actual pasa al historial de versiones.
 */
export function FormDocumento(props: { documento?: Documento; categorias: string[]; alTerminar: () => void }) {
  const { documento, categorias, alTerminar } = props
  const prefijo = documento ? `doc-${documento.id}` : 'doc-nuevo'
  const guardar = useGuardarDocumento((datos: FormData) => (documento ? actualizarDocumento(documento.id, datos) : crearDocumento(datos)))
  const [archivo, setArchivo] = useState<File | null>(null)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<DatosDocumento>({
    resolver: zodResolver(esquemaDocumento),
    defaultValues: {
      titulo: documento?.titulo ?? '',
      categoria: documento?.categoria ?? '',
      descripcion: documento?.descripcion ?? '',
      publicado: documento?.publicado ?? true,
    },
  })
  const descripcion = useWatch({ control, name: 'descripcion' })

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
    formulario.append('categoria', datos.categoria)
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
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5">
      <label
        className={`flex cursor-pointer items-center gap-4 rounded-tema border border-dashed p-4 transition-colors focus-within:border-titulo hover:border-acento ${
          errorArchivo ? 'border-primario' : 'border-borde'
        }`}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-superficie text-titulo">
          <IconoSubirArchivo />
        </span>
        <span className="min-w-0 text-sm">
          {archivo ? (
            <>
              <span className="block truncate font-semibold text-titulo">{archivo.name}</span>
              <span className="text-texto-suave">{formatoTamano(archivo.size)} · Clic para cambiarlo</span>
            </>
          ) : (
            <>
              <span className="block font-semibold text-titulo">{documento ? 'Reemplazar el archivo' : 'Elegir archivo'}</span>
              <span className="text-texto-suave">
                {documento ? 'Opcional. El archivo actual se guardará en el historial. ' : ''}PDF o Excel (.xlsx), hasta {MAXIMO_MB} MB
              </span>
            </>
          )}
        </span>
        <input
          type="file"
          accept={EXTENSIONES.join(',')}
          className="sr-only"
          aria-describedby={`${prefijo}-archivo-info`}
          onChange={(e) => {
            elegir(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </label>
      <p id={`${prefijo}-archivo-info`} role="alert" className="-mt-3 text-sm font-semibold text-acento empty:hidden">
        {errorArchivo}
      </p>

      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        <Campo id={`${prefijo}-titulo`} etiqueta="Título" error={errors.titulo?.message}>
          <input
            id={`${prefijo}-titulo`}
            aria-describedby={`${prefijo}-titulo-info`}
            aria-invalid={!!errors.titulo}
            className={CLASE_ENTRADA}
            {...register('titulo')}
          />
        </Campo>
        <Campo id={`${prefijo}-categoria`} etiqueta="Categoría" ayuda="Agrupa los documentos en el portal." error={errors.categoria?.message}>
          <input
            id={`${prefijo}-categoria`}
            list={`${prefijo}-categorias`}
            aria-describedby={`${prefijo}-categoria-info`}
            aria-invalid={!!errors.categoria}
            className={CLASE_ENTRADA}
            {...register('categoria')}
          />
          <datalist id={`${prefijo}-categorias`}>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria} />
            ))}
          </datalist>
        </Campo>
      </div>

      <Campo
        id={`${prefijo}-descripcion`}
        etiqueta="Descripción"
        opcional
        ayuda="Una línea que ayude a saber qué contiene."
        error={errors.descripcion?.message}
        usados={descripcion.length}
        limite={300}
      >
        <textarea
          id={`${prefijo}-descripcion`}
          rows={2}
          aria-describedby={`${prefijo}-descripcion-info`}
          aria-invalid={!!errors.descripcion}
          className={CLASE_ENTRADA}
          {...register('descripcion')}
        />
      </Campo>

      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--c-titulo)]" {...register('publicado')} />
        <span>
          <span className="block text-sm font-semibold text-titulo">Visible en el portal</span>
          <span className="text-sm text-texto-suave">Si lo desmarca, solo el personal del panel puede verlo.</span>
        </span>
      </label>

      {errors.root && (
        <p role="alert" className="text-sm font-semibold text-acento">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Boton type="submit" disabled={guardar.isPending}>
          {guardar.isPending ? 'Guardando...' : documento ? 'Guardar cambios' : 'Subir documento'}
        </Boton>
        <Boton type="button" variante="borde" onClick={alTerminar}>
          Cancelar
        </Boton>
      </div>
    </form>
  )
}
