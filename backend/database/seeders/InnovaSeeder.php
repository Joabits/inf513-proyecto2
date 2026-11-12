<?php

namespace Database\Seeders;

use App\Modulos\Innova\Innova;
use App\Modulos\Innova\ServicioInnova;
use Illuminate\Database\Seeder;

/**
 * Contenido de EJEMPLO de la Empresa Junior INNOVA (CU-22). La Carrera todavía no entregó
 * su información: el personal debe reemplazar estos textos y servicios desde el panel.
 * Solo se carga si está vacío, para no borrar lo que edite el personal.
 */
class InnovaSeeder extends Seeder
{
    public function run(): void
    {
        if (! Innova::exists()) {
            Innova::create([
                'presentacion' => 'INNOVA es la Empresa Junior de la Carrera de Administración de Empresas: un equipo de estudiantes que, con la guía de docentes de la Carrera, brinda asesoría a emprendedores, pequeñas empresas y organizaciones de Santa Cruz.',
                'mision' => 'Acompañar a emprendedores y organizaciones con soluciones de gestión empresarial, mientras los estudiantes ponen en práctica lo aprendido en la Carrera.',
                'recibe_solicitudes' => true,
            ]);
        }

        if (! ServicioInnova::exists()) {
            $servicios = [
                ['Plan de negocios', 'Elaboración o revisión del plan de negocios de un emprendimiento.'],
                ['Estudio de mercado', 'Análisis de clientes, competencia y precios para un producto o servicio.'],
                ['Diagnóstico organizacional', 'Revisión de procesos, estructura y gestión de una organización, con propuestas de mejora.'],
                ['Capacitación empresarial', 'Talleres sobre gestión, costos, marketing o atención al cliente.'],
            ];

            foreach ($servicios as $orden => [$nombre, $descripcion]) {
                ServicioInnova::create(compact('nombre', 'descripcion', 'orden'));
            }
        }
    }
}
