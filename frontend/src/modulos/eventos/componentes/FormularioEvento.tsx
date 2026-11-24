import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Boton } from '@/compartido/ui/Boton'
import { eventoSchema, type EventoFormulario } from '../esquema/eventoSchema'
import type { Evento } from '../tipos'

interface FormularioEventoProps {
  evento?: Evento | null
  alGuardar: (datos: EventoFormulario) => void
  alCancelar: () => void
  estaCargando?: boolean
}

function convertirFechaAInput(fechaStr?: string, fechaIso?: string): string {
  if (fechaIso) return fechaIso
  if (!fechaStr) return ''
  if (fechaStr.includes('T')) return fechaStr.substring(0, 16)
  const partes = fechaStr.split(' ')
  if (partes.length === 2) {
    const fechaPartes = partes[0].split('/')
    if (fechaPartes.length === 3) {
      const [dia, mes, anio] = fechaPartes
      return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${partes[1]}`
    }
  }
  return fechaStr
}

export function FormularioEvento({ evento, alGuardar, alCancelar, estaCargando = false }: FormularioEventoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventoFormulario>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      titulo: evento?.titulo ?? '',
      descripcion: evento?.descripcion ?? '',
      fecha_inicio: convertirFechaAInput(evento?.fecha_inicio, evento?.fecha_inicio_iso),
      fecha_fin: convertirFechaAInput(evento?.fecha_fin, evento?.fecha_fin_iso),
      lugar: evento?.lugar ?? '',
      enlace: evento?.enlace ?? '',
      publicado: evento?.publicado ?? false,
    },
  })

  return (
    <form onSubmit={handleSubmit(alGuardar)} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-titulo mb-1">Título</label>
        <input
          type="text"
          {...register('titulo')}
          className="w-full rounded-tema border border-borde bg-fondo px-3 py-2 text-texto focus:border-acento focus:outline-none"
          placeholder="Nombre del evento"
        />
        {errors.titulo && <p className="mt-1 text-xs font-semibold text-acento">{errors.titulo.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-titulo mb-1">Descripción</label>
        <textarea
          rows={3}
          {...register('descripcion')}
          className="w-full rounded-tema border border-borde bg-fondo px-3 py-2 text-texto focus:border-acento focus:outline-none"
          placeholder="Detalles sobre el evento..."
        />
        {errors.descripcion && <p className="mt-1 text-xs font-semibold text-acento">{errors.descripcion.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-titulo mb-1">Fecha y hora de inicio</label>
          <input
            type="datetime-local"
            {...register('fecha_inicio')}
            className="w-full rounded-tema border border-borde bg-fondo px-3 py-2 text-texto focus:border-acento focus:outline-none"
          />
          {errors.fecha_inicio && <p className="mt-1 text-xs font-semibold text-acento">{errors.fecha_inicio.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-titulo mb-1">Fecha y hora de fin</label>
          <input
            type="datetime-local"
            {...register('fecha_fin')}
            className="w-full rounded-tema border border-borde bg-fondo px-3 py-2 text-texto focus:border-acento focus:outline-none"
          />
          {errors.fecha_fin && <p className="mt-1 text-xs font-semibold text-acento">{errors.fecha_fin.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-titulo mb-1">Lugar</label>
        <input
          type="text"
          {...register('lugar')}
          className="w-full rounded-tema border border-borde bg-fondo px-3 py-2 text-texto focus:border-acento focus:outline-none"
          placeholder="Ej. Auditorio Central / Virtual"
        />
        {errors.lugar && <p className="mt-1 text-xs font-semibold text-acento">{errors.lugar.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-titulo mb-1">Enlace informativo (opcional)</label>
        <input
          type="url"
          {...register('enlace')}
          className="w-full rounded-tema border border-borde bg-fondo px-3 py-2 text-texto focus:border-acento focus:outline-none"
          placeholder="https://ejemplo.com"
        />
        {errors.enlace && <p className="mt-1 text-xs font-semibold text-acento">{errors.enlace.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="publicado"
          {...register('publicado')}
          className="h-4 w-4 rounded border-borde text-primario focus:ring-acento"
        />
        <label htmlFor="publicado" className="text-sm font-semibold text-titulo cursor-pointer">
          Publicar evento inmediatamente
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-borde">
        <Boton type="button" variante="borde" onClick={alCancelar} disabled={estaCargando}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={estaCargando}>
          {estaCargando ? 'Guardando...' : 'Guardar'}
        </Boton>
      </div>
    </form>
  )
}
