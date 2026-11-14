<?php

namespace Database\Seeders;

use App\Modulos\Revista\Revista;
use Illuminate\Database\Seeder;

/**
 * Presentación de la revista INNOVAR (CU-21). La Carrera todavía no entregó la información de la
 * revista (ISSN, periodicidad, ediciones, normas), así que solo se carga lo que dice el documento
 * del proyecto: que existe como Revista Académica Institucional. No se inventan ediciones ni datos.
 * El personal completa el resto desde el panel.
 *
 * Solo se carga si la tabla está vacía, para no borrar lo que edite el personal.
 */
class RevistaSeeder extends Seeder
{
    public function run(): void
    {
        if (Revista::exists()) {
            return;
        }

        Revista::create([
            'presentacion' => 'INNOVAR es la Revista Académica Institucional de la Carrera de Administración de Empresas de la Facultad de Ciencias Económicas y Empresariales de la UAGRM. En esta página se publican sus ediciones y los artículos de cada una.',
        ]);
    }
}
