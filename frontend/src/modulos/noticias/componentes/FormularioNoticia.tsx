import { useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { noticiaSchema, type NoticiaFormData } from '../esquema/noticiaSchema'
import { useCrearNoticia, useActualizarNoticia } from '../hooks/useNoticias'
import type { Noticia } from '../tipos'

interface FormularioNoticiaProps {
  noticia?: Noticia
  alGuardar: () => void
  alCancelar: () => void
}

export function FormularioNoticia({ noticia, alGuardar, alCancelar }: FormularioNoticiaProps) {
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

  const crearMutation = useCrearNoticia()
  const actualizarMutation = useActualizarNoticia()

  const estaCargando = crearMutation.isPending || actualizarMutation.isPending

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoticiaFormData>({
    resolver: zodResolver(noticiaSchema),
    defaultValues: {
      titulo: noticia?.titulo ?? '',
      resumen: noticia?.resumen ?? '',
      contenido: noticia?.contenido ?? '',
      publicada: noticia?.publicada ?? false,
    },
  })

  const manejarCambioArchivo = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoImagen(e.target.files[0])
    }
  }

  const onSubmit = (datos: NoticiaFormData) => {
    setErrorEnvio(null)
    const formData = new FormData()
    formData.append('titulo', datos.titulo)
    formData.append('resumen', datos.resumen)
    formData.append('contenido', datos.contenido)
    formData.append('publicada', datos.publicada ? '1' : '0')

    if (archivoImagen) {
      formData.append('imagen', archivoImagen)
    }

    if (noticia) {
      actualizarMutation.mutate(
        { id: noticia.id, formData },
        {
          onSuccess: () => {
            alGuardar()
          },
          onError: (err: any) => {
            const mensaje =
              err?.response?.data?.message ||
              'Ocurrió un error al actualizar la noticia.'
            setErrorEnvio(mensaje)
          },
        }
      )
    } else {
      crearMutation.mutate(formData, {
        onSuccess: () => {
          alGuardar()
        },
        onError: (err: any) => {
          const mensaje =
            err?.response?.data?.message ||
            'Ocurrió un error al crear la noticia.'
          setErrorEnvio(mensaje)
        },
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-montserrat">
      {errorEnvio && (
        <div className="rounded-tema border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          {errorEnvio}
        </div>
      )}

      <div>
        <label htmlFor="titulo" className="mb-1 block text-sm font-semibold text-titulo">
          Título *
        </label>
        <input
          id="titulo"
          type="text"
          className="w-full rounded-tema border border-borde bg-fondo px-3.5 py-2 text-texto focus:border-acento focus:outline-none"
          placeholder="Ingrese el título de la noticia"
          {...register('titulo')}
        />
        {errors.titulo && (
          <p className="mt-1 text-xs text-red-500">{errors.titulo.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="resumen" className="mb-1 block text-sm font-semibold text-titulo">
          Resumen *
        </label>
        <textarea
          id="resumen"
          rows={3}
          className="w-full rounded-tema border border-borde bg-fondo px-3.5 py-2 text-texto focus:border-acento focus:outline-none"
          placeholder="Breve resumen de la noticia (máximo 500 caracteres)"
          {...register('resumen')}
        />
        {errors.resumen && (
          <p className="mt-1 text-xs text-red-500">{errors.resumen.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="contenido" className="mb-1 block text-sm font-semibold text-titulo">
          Contenido *
        </label>
        <textarea
          id="contenido"
          rows={6}
          className="w-full rounded-tema border border-borde bg-fondo px-3.5 py-2 text-texto focus:border-acento focus:outline-none"
          placeholder="Contenido completo de la noticia"
          {...register('contenido')}
        />
        {errors.contenido && (
          <p className="mt-1 text-xs text-red-500">{errors.contenido.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="imagen" className="mb-1 block text-sm font-semibold text-titulo">
          Imagen de portada {noticia?.imagen ? '(Opcional: cambiar imagen)' : '(Opcional)'}
        </label>
        <input
          id="imagen"
          type="file"
          accept="image/*"
          onChange={manejarCambioArchivo}
          className="w-full rounded-tema border border-borde bg-fondo px-3.5 py-2 text-sm text-texto file:mr-4 file:rounded-tema file:border-0 file:bg-primario file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-sobre-primario hover:file:bg-marino"
        />
        {noticia?.imagen && !archivoImagen && (
          <p className="mt-1 text-xs text-texto opacity-75">
            Imagen actual cargada. Seleccione un nuevo archivo para reemplazarla.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          id="publicada"
          type="checkbox"
          className="h-4 w-4 rounded border-borde text-primario focus:ring-acento"
          {...register('publicada')}
        />
        <label htmlFor="publicada" className="cursor-pointer text-sm font-medium text-titulo">
          Publicar inmediatamente (visible en el portal público)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={alCancelar}
          disabled={estaCargando}
          className="rounded-tema border border-borde px-4 py-2 text-sm font-semibold text-texto hover:bg-fondo/80 hover:text-acento disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={estaCargando}
          className="rounded-tema bg-primario px-5 py-2 text-sm font-semibold text-sobre-primario hover:bg-marino disabled:cursor-not-allowed disabled:opacity-50"
        >
          {estaCargando ? 'Guardando...' : 'Guardar Noticia'}
        </button>
      </div>
    </form>
  )
}
