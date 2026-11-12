import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { ErroresValidacion } from '@/compartido/api/cliente'
import { aplicarErrores } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { IconoImagen } from '@/compartido/ui/Iconos'
import { Interruptor } from '@/compartido/ui/Interruptor'
import { opcionesDe } from '@/compartido/ui/opciones'
import { SelectorCampo } from '@/compartido/ui/Selector'
import { actualizarPersona, crearPersona } from '../api'
import { esquemaPersona, MAXIMO_MB, problemaDeFoto, type DatosPersona } from '../docentes.esquema'
import { GRUPOS, type Grupo, type Persona } from '../tipos'
import { useGuardarPersona } from '../useDocentes'
import { FotoPersona } from './FotoPersona'

/**
 * Agregar o editar una persona. La foto es opcional: la Carrera todavía no las entregó,
 * y mientras no haya se muestran las iniciales.
 */
export function FormPersona(props: { persona?: Persona; grupoInicial?: Grupo; alTerminar: () => void }) {
  const { persona, grupoInicial = 'docente', alTerminar } = props
  const prefijo = persona ? `persona-${persona.id}` : 'persona-nueva'
  const guardar = useGuardarPersona((datos: FormData) => (persona ? actualizarPersona(persona.id, datos) : crearPersona(datos)))
  const [foto, setFoto] = useState<File | null>(null)
  const [vista, setVista] = useState<string | null>(null)
  const [quitarFoto, setQuitarFoto] = useState(false)
  const [errorFoto, setErrorFoto] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<DatosPersona>({
    resolver: zodResolver(esquemaPersona),
    defaultValues: {
      nombre: persona?.nombre ?? '',
      cargo: persona?.cargo ?? '',
      grupo: persona?.grupo ?? grupoInicial,
      visible: persona?.visible ?? true,
    },
  })

  const nombre = useWatch({ control, name: 'nombre' })

  // La vista previa es un recurso del navegador: se libera al cambiarla o al salir
  useEffect(() => () => {
    if (vista) URL.revokeObjectURL(vista)
  }, [vista])

  async function elegir(nueva: File | undefined) {
    if (!nueva) return
    const url = URL.createObjectURL(nueva)
    const problema = await problemaDeFoto(nueva, url).catch(() => 'No se pudo leer la imagen.')
    setErrorFoto(problema)
    if (problema) {
      URL.revokeObjectURL(url)
      return
    }
    setFoto(nueva)
    setVista(url)
    setQuitarFoto(false)
  }

  function enviar(datos: DatosPersona) {
    const formulario = new FormData()
    formulario.append('nombre', datos.nombre)
    formulario.append('cargo', datos.cargo)
    formulario.append('grupo', datos.grupo)
    formulario.append('visible', datos.visible ? '1' : '0')
    if (foto) formulario.append('foto', foto)
    if (quitarFoto) formulario.append('quitar_foto', '1')

    guardar.mutate(formulario, {
      onSuccess: alTerminar,
      onError: (e) => {
        const error = isAxiosError<ErroresValidacion>(e) ? e.response?.data.errors?.foto?.[0] : undefined
        if (error) setErrorFoto(error)
        aplicarErrores(e, setError)
      },
    })
  }

  const fotoActual = quitarFoto ? null : (vista ?? persona?.foto ?? null)

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5">
      <div className="flex flex-wrap items-center gap-5">
        <FotoPersona nombre={nombre || '?'} foto={fotoActual} tamano="lg" />
        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-tema border border-borde px-4 py-2 text-sm font-semibold text-titulo transition-colors focus-within:border-titulo hover:border-acento hover:text-acento">
            <IconoImagen width={18} height={18} aria-hidden="true" />
            {fotoActual ? 'Cambiar fotografía' : 'Agregar fotografía'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-describedby={`${prefijo}-foto-info`}
              onChange={(e) => {
                void elegir(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </label>
          {fotoActual && (
            <button
              type="button"
              className="block text-sm font-semibold text-acento underline-offset-4 hover:underline"
              onClick={() => {
                setFoto(null)
                setVista(null)
                setQuitarFoto(!!persona?.foto)
              }}
            >
              Quitar fotografía
            </button>
          )}
          <p id={`${prefijo}-foto-info`} className="text-sm">
            {errorFoto ? (
              <span role="alert" className="font-semibold text-acento">
                {errorFoto}
              </span>
            ) : (
              <span className="text-texto-suave">Opcional. JPG, PNG o WebP de al menos 300 × 300 px, hasta {MAXIMO_MB} MB.</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Campo id={`${prefijo}-nombre`} etiqueta="Nombre" ayuda="Con su título, como figura oficialmente." error={errors.nombre?.message}>
          <input
            id={`${prefijo}-nombre`}
            placeholder="Ej. Lic. Freddy Fuentes Soliz"
            aria-describedby={`${prefijo}-nombre-info`}
            aria-invalid={!!errors.nombre}
            className={CLASE_ENTRADA}
            {...register('nombre')}
          />
        </Campo>
        <Campo id={`${prefijo}-cargo`} etiqueta="Cargo" error={errors.cargo?.message}>
          <input
            id={`${prefijo}-cargo`}
            placeholder="Ej. Director de Carrera"
            aria-describedby={`${prefijo}-cargo-info`}
            aria-invalid={!!errors.cargo}
            className={CLASE_ENTRADA}
            {...register('cargo')}
          />
        </Campo>
      </div>

      <Campo id={`${prefijo}-grupo`} etiqueta="Grupo" error={errors.grupo?.message}>
        <SelectorCampo
          control={control}
          name="grupo"
          id={`${prefijo}-grupo`}
          aria-describedby={`${prefijo}-grupo-info`}
          aria-invalid={!!errors.grupo}
          opciones={opcionesDe(GRUPOS)}
        />
      </Campo>

      <div className="border-t border-borde pt-5">
        <Interruptor
          id={`${prefijo}-visible`}
          etiqueta="Mostrar en el portal"
          ayuda="Si lo desactiva, la persona queda guardada pero los visitantes no la ven."
          {...register('visible')}
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
        <Boton type="submit" disabled={guardar.isPending}>
          {guardar.isPending ? 'Guardando...' : persona ? 'Guardar cambios' : 'Agregar persona'}
        </Boton>
      </div>
    </form>
  )
}
