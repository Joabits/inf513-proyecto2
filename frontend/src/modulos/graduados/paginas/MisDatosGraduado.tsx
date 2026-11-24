import { useState } from 'react'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FormularioGraduado } from '../componentes/FormularioGraduado'
import { useGuardarMiGraduado, useMiGraduado } from '../hooks/useGraduados'

/**
 * CU-10 Registrar o actualizar datos de graduado: el propio graduado (rol Usuario) carga y mantiene al día sus datos.
 * Así la Carrera puede hacer seguimiento a sus titulados. En el directorio público solo se ven nombre, gestiones,
 * modalidad y tema; el CI, el correo y el teléfono los ve solo el personal autorizado.
 */
export function MisDatosGraduado() {
  const { data: graduado, isPending, isError, refetch } = useMiGraduado()
  const guardar = useGuardarMiGraduado()
  const [guardado, setGuardado] = useState(false)

  return (
    <div>
      <TituloPagina
        titulo="Mis datos de graduado"
        subtitulo="Registre y mantenga al día sus datos para que la Carrera pueda acompañar a sus titulados."
      />

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="space-y-4 py-8 text-center">
          <MensajeError texto="No se pudieron cargar sus datos. Revise su conexión e intente de nuevo." />
          <Boton type="button" variante="borde" onClick={() => refetch()} className="text-sm">
            Reintentar
          </Boton>
        </div>
      )}

      {!isPending && !isError && (
        <div className="rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave sm:p-6">
          <p className="mb-5 text-sm leading-relaxed text-texto-suave">
            {graduado
              ? 'Estos son los datos que tiene registrados. Corrija lo que haya cambiado y guarde.'
              : 'Todavía no registró sus datos. Complete el formulario para aparecer en el directorio de graduados.'}{' '}
            En el directorio público solo se muestran su nombre, sus gestiones, la modalidad y el tema de graduación.
          </p>

          {guardado && (
            <p role="status" className="mb-5 rounded-tema bg-chip px-4 py-3 text-sm font-semibold text-sobre-chip">
              Sus datos se guardaron.
            </p>
          )}

          <FormularioGraduado
            // Se vuelve a montar cuando llegan los datos guardados, para que el formulario los muestre
            key={graduado?.id ?? 'nuevo'}
            graduado={graduado}
            sinCancelar
            guardarPropio={async (valores) => {
              setGuardado(false)
              await guardar.mutateAsync(valores)
              setGuardado(true)
            }}
            alTerminar={() => undefined}
          />
        </div>
      )}
    </div>
  )
}
