import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { ErroresValidacion } from '@/compartido/api/cliente'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { Interruptor } from '@/compartido/ui/Interruptor'
import { actualizarEdicion, crearEdicion } from '../api'
import {
  esquemaEdicion,
  MAXIMO_PDF_MB,
  MAXIMO_PORTADA_MB,
  problemaDePdf,
  problemaDePortada,
  type DatosEdicion,
} from '../revista.esquema'
import type { Edicion } from '../tipos'
import { useGuardarRevista } from '../useRevista'
import { CampoArchivo } from './CampoArchivo'

/** Fuera del componente: la fecha no se puede leer mientras se dibuja. Una edición nueva propone el año en curso. */
const ANIO_ACTUAL = String(new Date().getFullYear())

/**
 * Crear o editar una edición. Una edición nueva queda como borrador: el personal la prepara
 * (portada, PDF, artículos) y la publica cuando esté lista.
 */
export function FormEdicion({ edicion, alTerminar }: { edicion?: Edicion; alTerminar: () => void }) {
  const prefijo = edicion ? `edicion-${edicion.id}` : 'edicion-nueva'
  const guardar = useGuardarRevista((datos: FormData) => (edicion ? actualizarEdicion(edicion.id, datos) : crearEdicion(datos)))
  const [pdf, setPdf] = useState<File | null>(null)
  const [quitarPdf, setQuitarPdf] = useState(false)
  const [errorPdf, setErrorPdf] = useState<string | null>(null)
  const [portada, setPortada] = useState<File | null>(null)
  const [vista, setVista] = useState<string | null>(null)
  const [quitarPortada, setQuitarPortada] = useState(false)
  const [errorPortada, setErrorPortada] = useState<string | null>(null)
  // La imagen se revisa en segundo plano: hasta que termine no se puede guardar, o la portada se perdería en silencio
  const [revisando, setRevisando] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<DatosEdicion>({
    resolver: zodResolver(esquemaEdicion),
    defaultValues: {
      volumen: edicion?.volumen ? String(edicion.volumen) : '',
      numero: edicion ? String(edicion.numero) : '',
      anio: edicion ? String(edicion.anio) : ANIO_ACTUAL,
      titulo: edicion?.titulo ?? '',
      descripcion: edicion?.descripcion ?? '',
      publicada: edicion?.publicada ?? false,
    },
  })
  const descripcion = useWatch({ control, name: 'descripcion' })

  // La vista previa es un recurso del navegador: se libera al cambiarla o al salir
  useEffect(() => () => {
    if (vista) URL.revokeObjectURL(vista)
  }, [vista])

  function elegirPdf(nuevo: File | undefined) {
    if (!nuevo) return
    const problema = problemaDePdf(nuevo)
    setErrorPdf(problema)
    if (problema) return
    setPdf(nuevo)
    setQuitarPdf(false)
  }

  async function elegirPortada(nueva: File | undefined) {
    if (!nueva) return
    const url = URL.createObjectURL(nueva)
    setRevisando(true)
    const problema = await problemaDePortada(nueva, url).catch(() => 'No se pudo leer la imagen.')
    setRevisando(false)
    setErrorPortada(problema)
    if (problema) {
      URL.revokeObjectURL(url)
      return
    }
    setPortada(nueva)
    setVista(url)
    setQuitarPortada(false)
  }

  function enviar(datos: DatosEdicion) {
    const formulario = new FormData()
    formulario.append('volumen', datos.volumen)
    formulario.append('numero', datos.numero)
    formulario.append('anio', datos.anio)
    formulario.append('titulo', datos.titulo)
    formulario.append('descripcion', datos.descripcion)
    formulario.append('publicada', datos.publicada ? '1' : '0')
    if (pdf) formulario.append('archivo', pdf)
    if (quitarPdf) formulario.append('quitar_archivo', '1')
    if (portada) formulario.append('portada', portada)
    if (quitarPortada) formulario.append('quitar_portada', '1')

    guardar.mutate(formulario, {
      onSuccess: alTerminar,
      onError: (e) => {
        const errores = isAxiosError<ErroresValidacion>(e) ? e.response?.data.errors : undefined
        if (errores?.archivo) setErrorPdf(errores.archivo[0])
        if (errores?.portada) setErrorPortada(errores.portada[0])
        aplicarErrores(e, setError)
      },
    })
  }

  const entrada = (campo: 'volumen' | 'numero' | 'anio' | 'titulo') => ({
    id: `${prefijo}-${campo}`,
    'aria-describedby': `${prefijo}-${campo}-info`,
    'aria-invalid': !!errors[campo],
    className: CLASE_ENTRADA,
    ...register(campo),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <Campo id={`${prefijo}-volumen`} etiqueta="Volumen" opcional error={errors.volumen?.message}>
          <input inputMode="numeric" placeholder="Ej. 1" {...entrada('volumen')} />
        </Campo>
        <Campo id={`${prefijo}-numero`} etiqueta="Número" error={errors.numero?.message}>
          <input inputMode="numeric" placeholder="Ej. 2" {...entrada('numero')} />
        </Campo>
        <Campo id={`${prefijo}-anio`} etiqueta="Año" error={errors.anio?.message}>
          <input inputMode="numeric" {...entrada('anio')} />
        </Campo>
      </div>

      <Campo id={`${prefijo}-titulo`} etiqueta="Título de la edición" opcional ayuda="Si el número tiene un tema, escríbalo aquí." error={errors.titulo?.message}>
        <input placeholder="Ej. Innovación y gestión empresarial" {...entrada('titulo')} />
      </Campo>

      <Campo id={`${prefijo}-descripcion`} etiqueta="Descripción" opcional error={errors.descripcion?.message} usados={descripcion.length} limite={1000}>
        <textarea
          id={`${prefijo}-descripcion`}
          rows={3}
          aria-describedby={`${prefijo}-descripcion-info`}
          aria-invalid={!!errors.descripcion}
          className={CLASE_ENTRADA}
          {...register('descripcion')}
        />
      </Campo>

      <div className="space-y-5">
        <CampoArchivo
          id={`${prefijo}-portada`}
          etiqueta="Portada"
          tipo="imagen"
          accept="image/jpeg,image/png,image/webp"
          ayuda={`JPG, PNG o WebP de al menos 300 × 300 px, hasta ${MAXIMO_PORTADA_MB} MB.`}
          vista={vista ?? edicion?.portada}
          actual={edicion?.portada ? { nombre: 'Portada actual' } : null}
          nuevo={portada}
          quitado={quitarPortada}
          error={errorPortada}
          alElegir={(archivo) => void elegirPortada(archivo)}
          alQuitar={() => {
            setPortada(null)
            setVista(null)
            setQuitarPortada(!!edicion?.portada)
          }}
        />
        <CampoArchivo
          id={`${prefijo}-pdf`}
          etiqueta="Edición completa en PDF"
          tipo="pdf"
          accept="application/pdf,.pdf"
          ayuda={`Un solo PDF, hasta ${MAXIMO_PDF_MB} MB.`}
          actual={edicion?.archivo}
          nuevo={pdf}
          quitado={quitarPdf}
          error={errorPdf}
          alElegir={elegirPdf}
          alQuitar={() => {
            setPdf(null)
            setQuitarPdf(!!edicion?.archivo)
          }}
        />
      </div>

      <div className="border-t border-borde pt-5">
        <Interruptor
          id={`${prefijo}-publicada`}
          etiqueta="Publicar en el portal"
          ayuda="Mientras sea un borrador, solo el personal del panel la ve. Se puede publicar u ocultar después desde la lista."
          {...register('publicada')}
        />
      </div>

      {errors.root && (
        <p role="alert" className="text-sm font-semibold text-acento">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t border-borde pt-5">
        <Boton type="button" variante="borde" onClick={alTerminar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardar.isPending || revisando}>
          {guardar.isPending ? 'Guardando...' : revisando ? 'Revisando la imagen...' : edicion ? 'Guardar cambios' : 'Crear edición'}
        </Boton>
      </div>
    </form>
  )
}
