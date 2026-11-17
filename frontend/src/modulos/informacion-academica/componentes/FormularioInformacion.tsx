import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Boton } from '@/compartido/ui/Boton'
import { informacionSchema, type FormularioInformacionDatos } from '../esquema/informacionSchema'
import type { InformacionAcademica } from '../tipos'
import { useActualizarInformacion } from '../hooks/useInformacion'

interface FormularioInformacionProps {
  informacion: InformacionAcademica | null
  onGuardadoExitoso?: () => void
}

export function FormularioInformacion({ informacion, onGuardadoExitoso }: FormularioInformacionProps) {
  const [mensajeExito, setMensajeExito] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const mutacion = useActualizarInformacion()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormularioInformacionDatos>({
    resolver: zodResolver(informacionSchema),
    defaultValues: {
      mision: informacion?.mision ?? '',
      vision: informacion?.vision ?? '',
      perfil_profesional: informacion?.perfil_profesional ?? '',
      objetivos: informacion?.objetivos ?? '',
    },
  })

  useEffect(() => {
    if (informacion) {
      reset({
        mision: informacion.mision,
        vision: informacion.vision,
        perfil_profesional: informacion.perfil_profesional,
        objetivos: informacion.objetivos,
      })
    }
  }, [informacion, reset])

  const onSubmit = (datos: FormularioInformacionDatos) => {
    setMensajeExito(false)
    setErrorServidor(null)
    mutacion.mutate(datos, {
      onSuccess: (resultado) => {
        setMensajeExito(true)
        reset({
          mision: resultado.mision,
          vision: resultado.vision,
          perfil_profesional: resultado.perfil_profesional,
          objetivos: resultado.objetivos,
        })
        onGuardadoExitoso?.()
      },
      onError: (err: any) => {
        const mensaje = err?.response?.data?.message || 'Ocurrió un error al guardar la información académica.'
        setErrorServidor(mensaje)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {mensajeExito && (
        <div className="rounded-tema border border-borde bg-fondo p-4 text-texto">
          <p className="font-semibold text-titulo">¡Información académica guardada exitosamente!</p>
        </div>
      )}

      {errorServidor && (
        <div className="rounded-tema border border-borde bg-fondo p-4 text-acento">
          <p className="font-semibold">{errorServidor}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="mision" className="block text-sm font-semibold text-titulo">
          Misión
        </label>
        <textarea
          id="mision"
          rows={5}
          placeholder="Escriba aquí la misión de la carrera..."
          className="w-full rounded-tema border border-borde bg-fondo p-3 text-texto focus:border-titulo focus:outline-none"
          {...register('mision')}
        />
        {errors.mision && <p className="text-sm font-semibold text-acento">{errors.mision.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="vision" className="block text-sm font-semibold text-titulo">
          Visión
        </label>
        <textarea
          id="vision"
          rows={5}
          placeholder="Escriba aquí la visión de la carrera..."
          className="w-full rounded-tema border border-borde bg-fondo p-3 text-texto focus:border-titulo focus:outline-none"
          {...register('vision')}
        />
        {errors.vision && <p className="text-sm font-semibold text-acento">{errors.vision.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="perfil_profesional" className="block text-sm font-semibold text-titulo">
          Perfil Profesional
        </label>
        <textarea
          id="perfil_profesional"
          rows={6}
          placeholder="Escriba aquí el perfil profesional del graduado..."
          className="w-full rounded-tema border border-borde bg-fondo p-3 text-texto focus:border-titulo focus:outline-none"
          {...register('perfil_profesional')}
        />
        {errors.perfil_profesional && (
          <p className="text-sm font-semibold text-acento">{errors.perfil_profesional.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="Campo Ocupacional" className="block text-sm font-semibold text-titulo">
          Campo Ocupacional
        </label>
        <textarea
          id="Campo Ocupacional"
          rows={6}
          placeholder="Escriba aquí el campo ocupacional de la carrera..."
          className="w-full rounded-tema border border-borde bg-fondo p-3 text-texto focus:border-titulo focus:outline-none"
          {...register('objetivos')}
        />
        {errors.objetivos && <p className="text-sm font-semibold text-acento">{errors.objetivos.message}</p>}
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-borde">
        <Boton type="submit" disabled={mutacion.isPending || !isDirty} variante="primario">
          {mutacion.isPending ? 'Guardando...' : 'Guardar información académica'}
        </Boton>
      </div>
    </form>
  )
}
