import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { aplicarErrores, mensajeDeError } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { Campo, CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { graduadoSchema, type GraduadoFormValores } from '../esquema/graduadoSchema'
import { useActualizarGraduado, useCrearGraduado } from '../hooks/useGraduados'
import type { Graduado } from '../tipos'

interface PropsFormularioGraduado {
  graduado?: Graduado | null
  alTerminar: () => void
}

export function FormularioGraduado({ graduado, alTerminar }: PropsFormularioGraduado) {
  const esEdicion = Boolean(graduado)
  const crear = useCrearGraduado()
  const actualizar = useActualizarGraduado()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GraduadoFormValores>({
    resolver: zodResolver(graduadoSchema),
    defaultValues: {
      nombre_completo: graduado?.nombre_completo ?? '',
      ci: graduado?.ci ?? '',
      correo: graduado?.correo ?? '',
      telefono: graduado?.telefono ?? '',
      gestion_ingreso: graduado?.gestion_ingreso ?? '',
      gestion_egreso: graduado?.gestion_egreso ?? '',
      modalidad: graduado?.modalidad ?? '',
      titulo_tema: graduado?.titulo_tema ?? '',
    },
  })

  const guardar = async (valores: GraduadoFormValores) => {
    try {
      if (esEdicion && graduado) {
        await actualizar.mutateAsync({ id: graduado.id, datos: valores })
      } else {
        await crear.mutateAsync(valores)
      }
      alTerminar()
    } catch (error) {
      aplicarErrores(error, setError)
    }
  }

  const errorGeneral = errors.root?.message ?? (crear.error ? mensajeDeError(crear.error) : actualizar.error ? mensajeDeError(actualizar.error) : null)

  return (
    <form onSubmit={handleSubmit(guardar)} className="space-y-5" noValidate>
      {errorGeneral && (
        <div className="rounded-tema border border-primario/30 bg-primario/10 p-3 text-sm font-semibold text-acento">
          {errorGeneral}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="nombre_completo" etiqueta="Nombre completo" error={errors.nombre_completo?.message}>
          <input
            id="nombre_completo"
            autoComplete="off"
            placeholder="Ej. Juan Pérez Ramos"
            aria-invalid={!!errors.nombre_completo}
            className={CLASE_ENTRADA}
            {...register('nombre_completo')}
          />
        </Campo>

        <Campo id="ci" etiqueta="Cédula de Identidad (CI)" error={errors.ci?.message}>
          <input
            id="ci"
            autoComplete="off"
            placeholder="Ej. 8452147"
            aria-invalid={!!errors.ci}
            className={CLASE_ENTRADA}
            {...register('ci')}
          />
        </Campo>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="correo" etiqueta="Correo electrónico" opcional error={errors.correo?.message}>
          <input
            id="correo"
            type="email"
            autoComplete="off"
            placeholder="Ej. juan.perez@ejemplo.com"
            aria-invalid={!!errors.correo}
            className={CLASE_ENTRADA}
            {...register('correo')}
          />
        </Campo>

        <Campo id="telefono" etiqueta="Teléfono / Celular" opcional error={errors.telefono?.message}>
          <input
            id="telefono"
            type="tel"
            autoComplete="off"
            placeholder="Ej. 70012345"
            aria-invalid={!!errors.telefono}
            className={CLASE_ENTRADA}
            {...register('telefono')}
          />
        </Campo>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Campo id="gestion_ingreso" etiqueta="Gestión de ingreso" error={errors.gestion_ingreso?.message}>
          <input
            id="gestion_ingreso"
            autoComplete="off"
            placeholder="Ej. I-2019"
            aria-invalid={!!errors.gestion_ingreso}
            className={CLASE_ENTRADA}
            {...register('gestion_ingreso')}
          />
        </Campo>

        <Campo id="gestion_egreso" etiqueta="Gestión de egreso" error={errors.gestion_egreso?.message}>
          <input
            id="gestion_egreso"
            autoComplete="off"
            placeholder="Ej. II-2024"
            aria-invalid={!!errors.gestion_egreso}
            className={CLASE_ENTRADA}
            {...register('gestion_egreso')}
          />
        </Campo>

        <Campo id="modalidad" etiqueta="Modalidad de graduación" error={errors.modalidad?.message}>
          <select
            id="modalidad"
            aria-invalid={!!errors.modalidad}
            className={CLASE_ENTRADA}
            {...register('modalidad')}
          >
            <option value="">Seleccione modalidad...</option>
            <option value="Tesis de Grado">Tesis de Grado</option>
            <option value="Proyecto de Grado">Proyecto de Grado</option>
            <option value="Examen de Grado">Examen de Grado</option>
            <option value="Trabajo Dirigido">Trabajo Dirigido</option>
            <option value="Graduación por Excelencia">Graduación por Excelencia</option>
          </select>
        </Campo>
      </div>

      <Campo id="titulo_tema" etiqueta="Título o tema de graduación" opcional error={errors.titulo_tema?.message}>
        <textarea
          id="titulo_tema"
          rows={3}
          placeholder="Ej. Plan estratégico de negocios para empresas del sector comercial"
          aria-invalid={!!errors.titulo_tema}
          className={CLASE_ENTRADA}
          {...register('titulo_tema')}
        />
      </Campo>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
        <Boton type="button" variante="borde" onClick={alTerminar} disabled={isSubmitting}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : esEdicion ? 'Actualizar graduado' : 'Registrar graduado'}
        </Boton>
      </div>
    </form>
  )
}
