import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { RUTA_BASE, type ErroresValidacion } from '@/compartido/api/cliente'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import {
  galeriaSchema,
  validarArchivoImagen,
  type GaleriaFormulario,
} from '../esquema/galeriaSchema'
import { useActualizarGaleria, useCrearGaleria } from '../hooks/useGaleria'
import type { Galeria } from '../tipos'

export interface FormularioGaleriaProps {
  galeria?: Galeria | null
  alGuardar?: () => void
  alCancelar?: () => void
}

export function FormularioGaleria({
  galeria,
  alGuardar,
  alCancelar,
}: FormularioGaleriaProps) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(
    galeria?.imagen
      ? galeria.imagen.startsWith('http://') ||
        galeria.imagen.startsWith('https://') ||
        !RUTA_BASE
        ? galeria.imagen
        : `${RUTA_BASE}${galeria.imagen}`
      : null,
  )

  const crear = useCrearGaleria()
  const actualizar = useActualizarGaleria()
  const guardando = crear.isPending || actualizar.isPending

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<GaleriaFormulario>({
    resolver: zodResolver(galeriaSchema),
    defaultValues: {
      titulo: galeria?.titulo ?? '',
      descripcion: galeria?.descripcion ?? '',
      publicado: galeria?.publicado ?? true,
    },
  })

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seleccionado = e.target.files?.[0] ?? null
    setErrorArchivo(null)

    if (seleccionado) {
      const error = validarArchivoImagen(seleccionado, !galeria)
      if (error) {
        setErrorArchivo(error)
        return
      }
      setArchivo(seleccionado)
      setVistaPrevia(URL.createObjectURL(seleccionado))
    }
  }

  const enviar = async (valores: GaleriaFormulario) => {
    setErrorServidor(null)

    // Validar archivo si es creación
    if (!galeria && !archivo) {
      setErrorArchivo('La imagen es obligatoria.')
      return
    }

    const formData = new FormData()
    if (valores.titulo) {
      formData.append('titulo', valores.titulo)
    }
    if (valores.descripcion) {
      formData.append('descripcion', valores.descripcion)
    }
    formData.append('publicado', valores.publicado ? '1' : '0')

    if (archivo) {
      formData.append('imagen', archivo)
    }

    try {
      if (galeria) {
        await actualizar.mutateAsync({ id: galeria.id, datos: formData })
      } else {
        await crear.mutateAsync(formData)
      }
      alGuardar?.()
    } catch (err: unknown) {
      if (isAxiosError<ErroresValidacion>(err) && err.response?.data?.errors) {
        const errores = err.response.data.errors
        for (const [campo, mensajes] of Object.entries(errores)) {
          if (campo === 'imagen') {
            setErrorArchivo(mensajes[0])
          } else if (campo === 'titulo' || campo === 'descripcion') {
            setError(campo, { message: mensajes[0] })
          } else {
            setErrorServidor(mensajes[0])
          }
        }
      } else {
        setErrorServidor('Ocurrió un error al guardar la imagen. Inténtelo nuevamente.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="space-y-4">
      {errorServidor && (
        <div
          role="alert"
          className="rounded-tema border border-borde bg-fondo p-3 text-sm font-semibold text-acento"
        >
          {errorServidor}
        </div>
      )}

      {/* Selector de Imagen y Vista Previa */}
      <div>
        <label className="text-sm font-semibold text-titulo">
          Fotografía / Imagen {!galeria && <span className="text-acento">*</span>}
        </label>
        <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
          {vistaPrevia ? (
            <div className="relative h-32 w-48 overflow-hidden rounded-tema border border-borde bg-fondo">
              <img
                src={vistaPrevia}
                alt="Vista previa"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-32 w-48 items-center justify-center rounded-tema border border-dashed border-borde bg-fondo text-xs text-texto">
              Sin imagen
            </div>
          )}

          <div className="flex-1 space-y-1">
            <input
              type="file"
              id="input-imagen"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={manejarCambioArchivo}
              className="block w-full text-sm text-texto file:mr-4 file:rounded-tema file:border-0 file:bg-marino file:px-4 file:py-2 file:text-sm file:font-semibold file:text-fondo hover:file:bg-marino-oscuro cursor-pointer"
            />
            <p className="text-xs text-texto">Formatos: JPG, PNG, WEBP o GIF. Máximo 2 MB.</p>
            {errorArchivo && (
              <p className="text-sm font-semibold text-acento">{errorArchivo}</p>
            )}
          </div>
        </div>
      </div>

      {/* Campo Título */}
      <Campo
        id="titulo"
        etiqueta="Título"
        opcional
        error={errors.titulo?.message}
      >
        <input
          id="titulo"
          type="text"
          placeholder="Ej: Acto de Aniversario de la Carrera"
          className={CLASE_ENTRADA}
          {...register('titulo')}
        />
      </Campo>

      {/* Campo Descripción */}
      <Campo
        id="descripcion"
        etiqueta="Descripción"
        opcional
        error={errors.descripcion?.message}
      >
        <textarea
          id="descripcion"
          rows={3}
          placeholder="Breve descripción o contexto de la fotografía..."
          className={CLASE_ENTRADA}
          {...register('descripcion')}
        />
      </Campo>

      {/* Checkbox Publicado */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="publicado"
          className="h-4 w-4 rounded-tema border-borde text-primario focus:ring-primario"
          {...register('publicado')}
        />
        <label htmlFor="publicado" className="cursor-pointer text-sm font-semibold text-titulo">
          Publicar de inmediato (visible en la galería del portal)
        </label>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {alCancelar && (
          <Boton
            type="button"
            variante="borde"
            onClick={alCancelar}
            disabled={guardando}
          >
            Cancelar
          </Boton>
        )}
        <Boton type="submit" variante="primario" disabled={guardando}>
          {guardando ? 'Guardando...' : galeria ? 'Actualizar' : 'Guardar imagen'}
        </Boton>
      </div>
    </form>
  )
}
