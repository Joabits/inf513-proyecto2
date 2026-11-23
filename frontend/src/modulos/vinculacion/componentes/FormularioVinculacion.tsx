import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vinculacionSchema, type DatosVinculacionForm } from '../esquema/vinculacionSchema'
import type { Vinculacion } from '../tipos'

interface Props {
  vinculacion?: Vinculacion | null
  alGuardar: (datos: FormData) => Promise<void> | void
  alCancelar: () => void
  cargando?: boolean
}

export function FormularioVinculacion({
  vinculacion,
  alGuardar,
  alCancelar,
  cargando = false,
}: Props) {
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosVinculacionForm>({
    resolver: zodResolver(vinculacionSchema),
    defaultValues: {
      titulo: vinculacion?.titulo ?? '',
      descripcion: vinculacion?.descripcion ?? '',
      enlace: vinculacion?.enlace ?? '',
      publicado: vinculacion?.publicado ?? false,
    },
  })

  const onSubmit = (valores: DatosVinculacionForm) => {
    const formData = new FormData()
    formData.append('titulo', valores.titulo)
    formData.append('descripcion', valores.descripcion)
    if (valores.enlace) {
      formData.append('enlace', valores.enlace)
    }
    formData.append('publicado', valores.publicado ? '1' : '0')

    if (archivoImagen) {
      formData.append('imagen', archivoImagen)
    }

    alGuardar(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-texto mb-1" htmlFor="titulo">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="titulo"
          type="text"
          className="w-full px-3 py-2 bg-fondo border border-borde rounded-tema text-texto focus:outline-none focus:ring-2 focus:ring-primario"
          placeholder="Ej. Convenio Marco con Universidad..."
          {...register('titulo')}
        />
        {errors.titulo && (
          <p className="mt-1 text-xs text-red-500">{errors.titulo.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-texto mb-1" htmlFor="descripcion">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="descripcion"
          rows={4}
          className="w-full px-3 py-2 bg-fondo border border-borde rounded-tema text-texto focus:outline-none focus:ring-2 focus:ring-primario"
          placeholder="Detalles sobre el convenio o vinculación..."
          {...register('descripcion')}
        />
        {errors.descripcion && (
          <p className="mt-1 text-xs text-red-500">{errors.descripcion.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-texto mb-1" htmlFor="enlace">
          Enlace (opcional)
        </label>
        <input
          id="enlace"
          type="url"
          className="w-full px-3 py-2 bg-fondo border border-borde rounded-tema text-texto focus:outline-none focus:ring-2 focus:ring-primario"
          placeholder="https://ejemplo.com"
          {...register('enlace')}
        />
        {errors.enlace && (
          <p className="mt-1 text-xs text-red-500">{errors.enlace.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-texto mb-1" htmlFor="imagen">
          Imagen (opcional)
        </label>
        {vinculacion?.imagen && !archivoImagen && (
          <div className="mb-2">
            <span className="text-xs text-acento block mb-1">Imagen actual:</span>
            <img
              src={vinculacion.imagen}
              alt="Imagen actual"
              className="h-20 w-32 object-cover rounded-tema border border-borde"
            />
          </div>
        )}
        <input
          id="imagen"
          type="file"
          accept="image/*"
          className="w-full px-3 py-2 bg-fondo border border-borde rounded-tema text-texto text-sm file:mr-4 file:py-1 file:px-3 file:rounded-tema file:border-0 file:text-xs file:bg-marino file:text-white hover:file:opacity-90"
          onChange={(e) => {
            const files = e.target.files
            if (files && files.length > 0) {
              setArchivoImagen(files[0])
            }
          }}
        />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input
          id="publicado"
          type="checkbox"
          className="h-4 w-4 rounded-tema border-borde text-primario focus:ring-primario"
          {...register('publicado')}
        />
        <label htmlFor="publicado" className="text-sm font-medium text-texto select-none">
          Publicar inmediatamente en el portal
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-borde">
        <button
          type="button"
          onClick={alCancelar}
          disabled={cargando}
          className="px-4 py-2 bg-fondo border border-borde text-texto rounded-tema hover:bg-marino-oscuro hover:text-white transition-colors text-sm font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={cargando}
          className="px-4 py-2 bg-primario text-white rounded-tema hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50"
        >
          {cargando ? 'Guardando...' : vinculacion ? 'Actualizar vinculación' : 'Crear vinculación'}
        </button>
      </div>
    </form>
  )
}
