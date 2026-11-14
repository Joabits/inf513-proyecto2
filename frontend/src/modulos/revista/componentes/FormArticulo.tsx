import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { ErroresValidacion } from '@/compartido/api/cliente'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { actualizarArticulo, crearArticulo } from '../api'
import { esquemaArticulo, MAXIMO_PDF_MB, problemaDePdf, type DatosArticulo } from '../revista.esquema'
import type { Articulo } from '../tipos'
import { useGuardarRevista } from '../useRevista'
import { CampoArchivo } from './CampoArchivo'

/** Crear o editar un artículo de una edición. El PDF es opcional. */
export function FormArticulo(props: { edicion: number; articulo?: Articulo; alTerminar: () => void }) {
  const { edicion, articulo, alTerminar } = props
  const prefijo = articulo ? `articulo-${articulo.id}` : `articulo-nuevo-${edicion}`
  const guardar = useGuardarRevista((datos: FormData) => (articulo ? actualizarArticulo(articulo.id, datos) : crearArticulo(edicion, datos)))
  const [pdf, setPdf] = useState<File | null>(null)
  const [quitarPdf, setQuitarPdf] = useState(false)
  const [errorPdf, setErrorPdf] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<DatosArticulo>({
    resolver: zodResolver(esquemaArticulo),
    defaultValues: { titulo: articulo?.titulo ?? '', autores: articulo?.autores ?? '', resumen: articulo?.resumen ?? '' },
  })
  const resumen = useWatch({ control, name: 'resumen' })

  function elegir(nuevo: File | undefined) {
    if (!nuevo) return
    const problema = problemaDePdf(nuevo)
    setErrorPdf(problema)
    if (problema) return
    setPdf(nuevo)
    setQuitarPdf(false)
  }

  function enviar(datos: DatosArticulo) {
    const formulario = new FormData()
    formulario.append('titulo', datos.titulo)
    formulario.append('autores', datos.autores)
    formulario.append('resumen', datos.resumen)
    if (pdf) formulario.append('archivo', pdf)
    if (quitarPdf) formulario.append('quitar_archivo', '1')

    guardar.mutate(formulario, {
      onSuccess: alTerminar,
      onError: (e) => {
        const error = isAxiosError<ErroresValidacion>(e) ? e.response?.data.errors?.archivo?.[0] : undefined
        if (error) setErrorPdf(error)
        aplicarErrores(e, setError)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5">
      <Campo id={`${prefijo}-titulo`} etiqueta="Título del artículo" error={errors.titulo?.message}>
        <input
          id={`${prefijo}-titulo`}
          aria-describedby={`${prefijo}-titulo-info`}
          aria-invalid={!!errors.titulo}
          className={CLASE_ENTRADA}
          {...register('titulo')}
        />
      </Campo>
      <Campo id={`${prefijo}-autores`} etiqueta="Autores" ayuda="Separe los nombres con punto y coma." error={errors.autores?.message}>
        <input
          id={`${prefijo}-autores`}
          placeholder="Ej. Ana Rojas; Luis Pardo"
          aria-describedby={`${prefijo}-autores-info`}
          aria-invalid={!!errors.autores}
          className={CLASE_ENTRADA}
          {...register('autores')}
        />
      </Campo>
      <Campo id={`${prefijo}-resumen`} etiqueta="Resumen" opcional error={errors.resumen?.message} usados={resumen.length} limite={3000}>
        <textarea
          id={`${prefijo}-resumen`}
          rows={5}
          aria-describedby={`${prefijo}-resumen-info`}
          aria-invalid={!!errors.resumen}
          className={CLASE_ENTRADA}
          {...register('resumen')}
        />
      </Campo>
      <CampoArchivo
        id={`${prefijo}-pdf`}
        etiqueta="Artículo en PDF"
        tipo="pdf"
        accept="application/pdf,.pdf"
        ayuda={`Si no sube el PDF, el artículo se lee dentro de la edición completa. Hasta ${MAXIMO_PDF_MB} MB.`}
        actual={articulo?.archivo}
        nuevo={pdf}
        quitado={quitarPdf}
        error={errorPdf}
        alElegir={elegir}
        alQuitar={() => {
          setPdf(null)
          setQuitarPdf(!!articulo?.archivo)
        }}
      />

      {errors.root && (
        <p role="alert" className="text-sm font-semibold text-acento">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t border-borde pt-5">
        <Boton type="button" variante="borde" onClick={alTerminar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardar.isPending}>
          {guardar.isPending ? 'Guardando...' : articulo ? 'Guardar cambios' : 'Agregar artículo'}
        </Boton>
      </div>
    </form>
  )
}
