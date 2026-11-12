import { mensajeDeError } from '@/compartido/api/errores'
import { IconoEliminar, IconoImagen, IconoUsuario } from '@/compartido/ui/Iconos'
import { quitarFotoDirector, subirFotoDirector } from '../api'
import { useGuardarInicio } from '../useInicio'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'

/** La foto se guarda al elegirla: no depende del botón "Guardar cambios" del formulario. */
export function FotoDirector({ foto, nombre }: { foto: string | null; nombre: string }) {
  const subir = useGuardarInicio(subirFotoDirector)
  const quitar = useGuardarInicio(quitarFotoDirector)
  const error = subir.error ?? quitar.error

  return (
    <div className="flex flex-wrap items-center gap-5">
      {foto ? (
        <img src={foto} alt={`Fotografía de ${nombre}`} className="h-28 w-24 rounded-tema object-cover" />
      ) : (
        <div className="grid h-28 w-24 place-items-center rounded-tema border border-dashed border-borde text-texto-suave">
          <IconoUsuario width={28} height={28} />
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-semibold text-titulo">Fotografía</p>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-tema border border-borde px-4 py-2 text-sm font-semibold text-texto transition focus-within:border-titulo hover:border-acento hover:text-acento">
            <IconoImagen width={16} height={16} />
            {subir.isPending ? 'Subiendo...' : foto ? 'Cambiar fotografía' : 'Subir fotografía'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={subir.isPending}
              onChange={(e) => {
                const archivo = e.target.files?.[0]
                if (archivo) subir.mutate(archivo)
                e.target.value = ''
              }}
            />
          </label>
          {foto && (
            <BotonConfirmar pregunta="¿Quitar la fotografía?" confirmar="Sí, quitar" ocupado={quitar.isPending} alConfirmar={() => quitar.mutate(undefined)}>
              <IconoEliminar width={16} height={16} /> Quitar
            </BotonConfirmar>
          )}
        </div>
        <p className="text-sm text-texto-suave">JPG, PNG o WebP, hasta 2 MB. Se recomienda formato vertical.</p>
        {error && (
          <p role="alert" className="text-sm font-semibold text-acento">
            {mensajeDeError(error)}
          </p>
        )}
      </div>
    </div>
  )
}
