import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ErroresValidacion } from '@/compartido/api/cliente'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { IconoImagen } from '@/compartido/ui/Iconos'
import { agregarBanner } from '../api'
import { esquemaBanner, type DatosBanner } from '../inicio.esquema'
import { useGuardarInicio } from '../useInicio'

const TIPOS = ['image/jpeg', 'image/png', 'image/webp']
const MAXIMO_MB = 4

/** Revisa la imagen al elegirla, para no esperar a la respuesta del servidor. */
async function problemaDeImagen(archivo: File, url: string) {
  if (!TIPOS.includes(archivo.type)) return 'Use una imagen JPG, PNG o WebP.'
  if (archivo.size > MAXIMO_MB * 1024 * 1024) return `La imagen no debe pesar más de ${MAXIMO_MB} MB.`

  const imagen = new Image()
  imagen.src = url
  await imagen.decode()
  if (imagen.naturalWidth < 1200 || imagen.naturalHeight < 400) {
    return `La imagen mide ${imagen.naturalWidth} × ${imagen.naturalHeight} px; debe medir al menos 1200 × 400.`
  }
  return null
}

export function SubirBanner({ deshabilitado }: { deshabilitado: boolean }) {
  const subir = useGuardarInicio(agregarBanner)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [vista, setVista] = useState<string | null>(null)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DatosBanner>({ resolver: zodResolver(esquemaBanner), defaultValues: { texto_alternativo: '', enlace: '' } })

  // La vista previa es un recurso del navegador: se libera al cambiarla o al salir
  useEffect(() => () => {
    if (vista) URL.revokeObjectURL(vista)
  }, [vista])

  async function elegir(nuevo: File | undefined) {
    if (!nuevo) return
    const url = URL.createObjectURL(nuevo)
    const problema = await problemaDeImagen(nuevo, url).catch(() => 'No se pudo leer la imagen.')
    setErrorArchivo(problema)
    setArchivo(problema ? null : nuevo)
    setVista(problema ? null : url)
    if (problema) URL.revokeObjectURL(url)
  }

  function enviar(datos: DatosBanner) {
    if (!archivo) {
      setErrorArchivo('Elija una imagen.')
      return
    }
    const formulario = new FormData()
    formulario.append('imagen', archivo)
    formulario.append('texto_alternativo', datos.texto_alternativo)
    formulario.append('enlace', datos.enlace)

    subir.mutate(formulario, {
      onSuccess: () => {
        reset()
        setArchivo(null)
        setVista(null)
      },
      onError: (e) => {
        // El error de la imagen (por ejemplo, el límite de 5) va junto al selector de archivo
        const errorImagen = isAxiosError<ErroresValidacion>(e) ? e.response?.data.errors?.imagen?.[0] : undefined
        if (errorImagen) setErrorArchivo(errorImagen)
        else aplicarErrores(e, setError)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave">
      <h3 className="font-bold text-titulo">Agregar imagen</h3>

      <label
        className={`relative grid aspect-[21/8] cursor-pointer place-items-center overflow-hidden rounded-tema border border-borde bg-superficie text-center transition-colors focus-within:border-titulo hover:border-acento ${
          deshabilitado ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        {vista ? (
          <img src={vista} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 p-4 text-sm text-texto-suave">
            <IconoImagen width={28} height={28} />
            <span className="font-semibold text-titulo">Elegir imagen</span>
            JPG, PNG o WebP · mínimo 1200 × 400 px · hasta {MAXIMO_MB} MB
          </span>
        )}
        <input
          type="file"
          accept={TIPOS.join(',')}
          className="sr-only"
          disabled={deshabilitado}
          aria-describedby="imagen-info"
          onChange={(e) => {
            void elegir(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </label>
      <p id="imagen-info" role="alert" className="text-sm font-semibold text-acento">
        {errorArchivo}
      </p>

      <Campo
        id="texto_alternativo"
        etiqueta="¿Qué muestra la imagen?"
        ayuda="La leen las personas que usan lectores de pantalla. Ejemplo: Estudiantes en el aula del Módulo 255."
        error={errors.texto_alternativo?.message}
      >
        <input
          id="texto_alternativo"
          aria-describedby="texto_alternativo-info"
          aria-invalid={!!errors.texto_alternativo}
          className={CLASE_ENTRADA}
          {...register('texto_alternativo')}
        />
      </Campo>
      <Campo id="enlace" etiqueta="Enlace" opcional ayuda="Página que se abre al hacer clic en la imagen." error={errors.enlace?.message}>
        <input id="enlace" inputMode="url" aria-describedby="enlace-info" aria-invalid={!!errors.enlace} className={CLASE_ENTRADA} {...register('enlace')} />
      </Campo>

      {errors.root && (
        <p role="alert" className="text-sm font-semibold text-acento">
          {errors.root.message}
        </p>
      )}
      <Boton type="submit" disabled={deshabilitado || subir.isPending}>
        {subir.isPending ? 'Subiendo...' : 'Agregar al banner'}
      </Boton>
    </form>
  )
}
