import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { cliente } from '@/compartido/api/cliente'
import { Tarjeta } from '@/compartido/ui/Tarjeta'
import { useTema } from '@/compartido/tema/contexto'

/**
 * Página de inicio PROVISIONAL de la base común.
 * El módulo de página de inicio (CU-12) la reemplaza con banners y destacados de la BD.
 */
export function Inicio() {
  const tema = useTema()
  const ping = useQuery({
    queryKey: ['ping'],
    queryFn: () => cliente.get<{ mensaje: string; hora_servidor: string }>('/ping').then((r) => r.data),
  })

  const accesos = [
    ['Malla curricular', '/malla-curricular', 'Plan 101-4: 10 semestres, 47 materias.'],
    ['Investigación', '/investigacion', '11 líneas de investigación, PIA y semilleros.'],
    ['Revista INNOVAR', '/revista-innovar', 'Revista académica de la Carrera.'],
    ['Noticias y eventos', '/noticias', 'Actividades y comunicados.'],
  ]

  return (
    <>
      <section className="mb-10 rounded-tema bg-marino px-6 py-16 text-white md:px-12">
        <div className="max-w-4xl">
          <p className="mb-3 inline-block rounded-tema bg-primario px-3 py-1 text-sm font-semibold">Carrera acreditada ante el CEUB</p>
          <h1 className="text-4xl font-bold md:text-5xl">Carrera de Administración de Empresas</h1>
          <p className="mt-4 max-w-3xl text-lg opacity-90">
            Formamos profesionales capacitados para gerenciar y liderar organizaciones de todo tipo, con visión
            estratégica, innovación y compromiso con el desarrollo empresarial.
          </p>
        </div>
      </section>

      <section aria-labelledby="accesos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <h2 id="accesos" className="sr-only">
          Accesos rápidos
        </h2>
        {accesos.map(([titulo, ruta, texto]) => (
          <Link key={ruta} to={ruta} className="group">
            <Tarjeta className="h-full border-t-4 border-t-primario transition group-hover:shadow-lg">
              <h3 className="text-lg font-bold text-titulo group-hover:text-acento">{titulo}</h3>
              <p className="mt-1 text-sm text-texto-suave">{texto}</p>
            </Tarjeta>
          </Link>
        ))}
      </section>

      <Tarjeta className="mt-10 text-sm">
        <p className="font-semibold">Estado de la base del proyecto</p>
        <p className="mt-1 text-texto-suave">
          API:{' '}
          {ping.isLoading ? 'consultando...' : ping.isError ? 'sin conexión con Laravel' : `${ping.data?.mensaje} (${ping.data?.hora_servidor})`}
        </p>
        <p className="text-texto-suave">
          Tema: {tema.tema} · Modo: {tema.modoActivo} ({tema.modo === 'auto' ? 'automático por hora' : 'elegido'}) · Contraste:{' '}
          {tema.contraste}
        </p>
      </Tarjeta>
    </>
  )
}
